---

title: Glassfish 4.0 / JEE 6 Encoding Recipies
slug: 2013/glassfish-jee6-request-encoding-recipies
layout: post

tags: [ glassfish, encoding, java, jee ]

author: Nikku<http://lefedt.de/about>

published: 2013-10-21

---


Working on an internationalized web application I realized that [Glassfish 4.0](https://glassfish.java.net/) is still using [ISO 8859-1](https://en.wikipedia.org/wiki/ISO/IEC_8859-1) encoding to serve web resources. Too bad, as UTF-8 is the de facto standard for encoding on the web.

This short post shows my recipe to make glassfish ready for non latin1 languages.

<!-- continue -->

## TLDR;

Add a [filter](http://docs.oracle.com/javaee/6/api/javax/servlet/Filter.html) with the following lines of code

```java
request.setCharacterEncoding("UTF-8");
response.setCharacterEncoding("UTF-8");
```

as the first filter in your web application filter chain.

Add `-Dfile.encoding=UTF8` to JVM properties in case you load resources from disk.


## Fix Request Encoding

Explicitly set the encoding to UTF-8 before request body and or parameters are accessed:

```java
request.setCharacterEncoding("UTF-8");
```

Alternatively, add the following line to the `WEB-INF/glassfish-web.xml` of a web application:

```xml
<glassfish-web-app>
  <parameter-encoding default-charset="UTF-8" />
</glassfish-web-app>
```


## Fix response encoding

Response encoding cannot be externally configured. Instead it is always derived from current locale programmatically configured character encoding.

Explicitly set encoding before response writer is accessed:

```java
response.setCharacterEncoding("UTF-8");
```

Otherwise, Glassfish will try to determine encoding from current locale which will always result in inappropriate ASCII derivates.


## Fix loading of web resources

In case you are loading files from disk (i.e. from exploded web application archives), make sure to force Glassfish to load these files as UTF-8 by specifying the JVM property

```
-Dfile.encoding=UTF8
```


## Read more

* [Glassfish 4.0 Application Development Guide](https://glassfish.java.net/docs/4.0/application-development-guide.pdf)