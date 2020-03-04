---

title: "Debugging Spring exception handling in nested @Transactional + JPA contexts"
slug: 2011/spring-unexpected-rollback-nested-transactional-contexts
layout: post

tags: [ java, web, spring, jpa, jersey, transactions ]

author: Nikku<http://lefedt.de/about>

published: 2011-07-05

---


In my [Jersey](http://jersey.java.net/) + [Spring](http://www.springsource.org/) + JPA stack I recently came across an interesting issue: Throwing an exception inside a `@Transactional` annotated Spring bean method would cause a `org.springframework.transaction.UnexpectedRollbackException` in the outer container.

<!-- continue -->

The result was that the request ended screwed up and the following stack trace appearing in the server logs:

```plain
org.springframework.transaction.UnexpectedRollbackException: JPA transaction unexpectedly rolled back (maybe marked rollback-only after a failed operation); nested exception is javax.persistence.RollbackException: Error while commiting the transaction
Caused by:
  javax.persistence.RollbackException: Error while commiting the transaction
  ...
```

After doing some research, it got apparent that, while there were many varieties, [many people had this issue](http://www.google.se/search?aq=0&oq=spring+unex&sourceid=chrome&ie=UTF-8&q=spring+unexpectedrollbackexception). Some said this was due to [limitation in JPA's exception hierarchy](https://jira.springsource.org/browse/SPR-3849), others just claimed it is a Spring or Hibernate or whatever bug.

Wondering, why everyone pointed on the issue, no solved it I created a small test case to investigate what is actually happening.


## Test Setup

At first, I got the `NewsManager` which does some database action when asked to `#aggregateNews`. If it finds an error, it will throw an exception which itself makes the changes rolled back (pretty clear so far).

```java
@Component
public NewsManager {

  @Transactional
  public News aggregateNews(Date date) {
    // Does some random action here
    // e.g. updating stuff in the database

    // May throw a (unchecked) operation failed
    // exception on error, rolling back the transaction
    if (error) {
      throw new OperationFailedException(
                    "Could not aggregate due to error");
    }
  }
}
```

The root controller of my Jersey application (a Spring bean, too) will ask the `NewsManager` to aggregate news and will catch the expected exception in case one is thrown. The reason for choosing this two-layer approach is that roll-backs can cleanly be done without propagating an exception to the presentational layer.

```java
@Path("/")
@Component
public RootController {

  @Inject
  private NewsManager newsManager; // Spring bean

  @GET
  @Transactional
  public Object news() {
    try {
      // Call Spring bean
      return newsManager.aggregateNews(new Date());
    } catch (OperationFailedException e) {
      return null;
    }
  }
}
```

What happens when a `OperationFailedException` is thrown is that this exception will be wrapped nicely with a `javax.persistence.RollbackException` and then with a `org.springframework.transaction.UnexpectedRollbackException` and so forth. Your application is not be able to handle it and you read the above mentioned stack trace in your server logs.


## Problem deduction

The actual cause of the problem is not the badness of the exception thrown, but the fact that the previous example used nested `@Transactional` contexts to handle the business logic.
Both, the controller and the news bean had `@Transactional` annotations specified on their business methods. Thus they were instrumented by Spring to use [transactional logic](http://static.springsource.org/spring/docs/3.0.x/spring-framework-reference/html/transaction.html).

```java
@Path("/")
@Component
public RootController {

  @GET
  public Object news() {
    try {
      // Call Spring bean
      return newsManager.aggregateNews(new Date());
    } catch (OperationFailedException e) {
      return null;
    }
  }
}
```

If you simply remove the outer `@Transactional` annotation (which might be unnecessary anyway) everything works fine.


## Conclusion

I am not convinced, that the above fix may help everyone posting about `UnexpectedRollbackException` and Spring + JPA. Neither am I hundred percent sure why this happens. What I got is that deliberately throwing exceptions inside nested transactional contexts may not be good for your Spring + JPA applications. Too many miracles happen there, eventually screwing things up and stealing one day of your time to figure out what and why.
