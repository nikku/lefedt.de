---

title: Accessing Proxy Targets in Spring
slug: 2013/accessing-proxy-targets-in-spring
layout: post

tags: [ spring, java ]

author: Nikku<http://lefedt.de/about>

published: 2013-10-30

---

In a recent dive into [spring framework](http://projects.spring.io/spring-framework/) proxies I was searching for a way to access real objects behind a proxy. That was required to [fix field injection](https://java.net/jira/browse/JERSEY-2171) in jerseys [jersey-spring3 extension](https://github.com/jersey/jersey/pull/35).

It turns out that this is easily possible through the [`Advised`](http://docs.spring.io/spring/docs/2.5.x/api/org/springframework/aop/framework/Advised.html) interface that gets added to spring bean proxies as a management interface.

The interface provides the method [`getTargetSource()`](http://docs.spring.io/spring/docs/2.5.x/api/org/springframework/aop/framework/Advised.html#getTargetSource(\)) that allows you to access the current proxy target source.

```java
if (bean instanceof Advised) {
  Object realTarget = ((Advised) bean).getTargetSource().getTarget();

  inject(realTarget);
}
```

The above code does work for static proxy targets, only. It breaks if hot swapping or pooling is used because the target obtained may be different on each access.

Your application code should not use those internal interfaces, anyway. Your libraries may.