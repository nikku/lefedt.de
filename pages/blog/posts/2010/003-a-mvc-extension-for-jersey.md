---

title: A MVC extension for Jersey
slug: 2010/a-mvc-extension-for-jersey
layout: post

tags: [ jersey, mvc, jax-rs, java ]

author: Nikku<http://lefedt.de/about>

published: 2010-11-20

---


Nearly every modern web framework features MVC, the separation of program parts into model, view and controller. This article discusses how [Jersey](http://jersey.java.net), the reference implementation of JSR 311 (JAX-RS) can be extended to do MVC as supported by Ruby on Rails, Spring MVC and many other web frameworks, too.

This post showcases how a simple MVC extension can be built for Jersey, too.

<!-- continue -->


## MVC, what is it?

When talking about MVC in the context of web development the *controller* is typically the object which is responsible for processing the request in one of its methods (sometimes referred to *action* invoked on controller).

The controller will return one or more objects containing the result of this process, the so called *model*. The model is not tied to any graphical representation &mdash; it merely acts as a container for the computational results returned by the controller.

A *view* however gives a model its graphical form. Typically it is written in some kind of markup language to produce HTML (or any other kind of output) from the model.

## And in Jersey?

[Jersey](http://jersey.java.net) is the reference implementation for [JAX-RS](http://www.infoq.com/news/2008/10/jaxrs-comparison) áka JSR 311. As such, it (simply|beauti)fies the development of REST-ful web applications with Java.

It provides MVC to ease application development, however its [approach](http://blogs.sun.com/sandoz/entry/mvcj) differs slightly from what is considered *standard* in web development.

Given that a controller `c` processes a request in one of its methods `m` most web frameworks will choose a view based on the controller name and the invoked method. The resulting view the framework will use to display the model is based on both, controller and executed method inside the controller (action). In most cases, a web framework might search for the view found as `[c]/[m]` in a given directory.

In contrast, JAX-RS connects the view to the model without considering the executing controller at all: The graphical representation (XML/JSON/HTML) of a model depends only on the model itself and the [mime type requested by the client](http://wikis.sun.com/display/Jersey/Overview+of+JAX-RS+1.0+Features#OverviewofJAX-RS1.0Features-@Produces).
Consequently [Jerseys way of doing MVC](http://blogs.sun.com/sandoz/entry/mvcj) does not consider the controller when selecting a view, too.
Considering the JAX-RS philosophy this makes perfectly sense.

However when trying to develop classical web applications this approach seems a bit inappropriate: When a request is processed by `UserController#info`, which returns an instance of `com.sample.User` Jersey will try to allocate a view `com/sample/User/index.jsp`. The same happens if a user gets logged in (done by `UserController#info`) or if he wants to change his profile (called by `UserController#editProfile`).
All requests will yield the same view, no different functionality can be provided to the user.

Fortunately we can adapt this behaviour by implementing our own MVC component which we will then plug in into Jersey.


## Implementing a MVC MessageBodyWriter

To extend Jersey to support selecting views based on controller and executed action we can plug into Jerseys view provider mechanism. This is as easy as defining a class annotated with `@Provider` which implements [`MessageBodyWriter`](http://jersey.java.net/nonav/apidocs/latest/jersey/javax/ws/rs/ext/MessageBodyWriter.html). A stub for the class can look somewhat like this:

```java
@Provider
@Produces("text/html")
public class MVCViewMessageBodyWriter implements
  MessageBodyWriter<Object> {

  @Override
  public boolean isWriteable(
    Class<?> type, Type genericType,
    Annotation[] annotations, MediaType mediaType) {

    // TODO: Check if view like [controller]/[action].jsp
    // exists under /WEB-INF/views
  }

  @Override
  public void writeTo(
    Object o, Class<?> type, Type genericType,
    Annotation[] annotations, MediaType mediaType,
    MultivaluedMap<String, Object> httpHeaders,
    OutputStream out) throws IOException {

    // Redirect to view placed in
    // /WEB-INF/views/[controller]/[action].jsp
  }

  @Override
  public long getSize(
    Object o, Class<?> type, Type genericType,
    Annotation[] annotations, MediaType mediaType) {

    // Return -1 to indicate that no explicit
    // content lenght can be assigned
    // (frankly, we do not know about the length)
    return -1;
  }
}
```

Implementing the interface `MessageBodyWriter<Object>` tells Jersey that, whenever an instance of `Object` should be rendered to the client, `MessageBodyWriter#isWritable` should be called by Jersey to check if the writer can write the specified object.
If that is the case, `MessageBodyWriter#writeTo` will be invoked by the framework and the writer should write the body to the passed output stream. Optionally the writer may specify the size of the output data in `MessageBodyWriter#getSize`.


## Nasty details

Our MVC implementation will check in `MVCViewMessageBodyWriter#isWritable`, if there exists a view to display for the current controller / action. Inside the writer it could do so by invoking

```java

private String getViewPath(HttpContext context) {
  AbstractResourceMethod m =
    context.getUriInfo().getMatchedMethod();

  String controller =
    m.getMethod().getDeclaringClass().getSimpleName();
  String action = m.getMethod().getName();

  if (controller.endsWith("Controller")) {
    controller = controller.substring(0,
      controller.length() - "Controller".length());
  }

  controller = controller.toLowerCase();

  String path = "/WEB-INF/views" +
                controller + "/" + action + ".jsp";
  return path;
}
```

in conjunction with

```java
public boolean templateExists(String path) {
  try {
    return servletContext.getResource(path) != null;
  } catch (MalformedURLException e) {
    // TODO: log
    return false;
  }
}
```

The required writer attributes `context` and `servletContext` can be automatically injected into the writer using Jerseys `@Context` injection mechanism:

```java
// Injecting both HttpContext and current ServletContext into
// the writer...
@Context
private HttpContext context;

@Context
private ServletContext servletContext;
```

In the `MVCViewMessageBodyWriter#writeTo` method the servlet contexts dispatch mechanisms are used to forward the request to our view:

```java
// way to obtain request via @Context injection
@Context
private ThreadLocal<HttpServletRequest> requestInvoker;

// way to obtain response via @Context injection
@Context
private ThreadLocal<HttpServletResponse> responseInvoker;

private void dispatch(Object model) throws IOException {
  String viewPath = getViewPath(context);

  RequestDispatcher d =
    servletContext.getRequestDispatcher(viewPath);

  if (d == null) { /* could not be obtained */ }

  HttpServletRequest request = requestInvoker.get();

  // Set model to be accessible as it variable in view
  request.setAttribute("it", model);
  try {
    d.forward(request, responseInvoker.get());
  } catch (ServletException e) {
    throw new RuntimeException("Dispatch to view failed", e);
  }
}
```

## The final Solution

That's it! Putting all the pieces together, our *do-MVC-as-other-frameworks-do-it*-`MessageBodyWriter` looks like this:

```java
@Provider
@Produces("text/html")
public class MVCViewMessageBodyWriter implements
        MessageBodyWriter<Object> {

    // Injecting both HttpContext and current ServletContext into
    // the writer...
    @Context
    private HttpContext context;
    @Context
    private ServletContext servletContext;

    // way to obtain request via @Context injection
    @Context
    private ThreadLocal<HttpServletRequest> requestInvoker;

    // way to obtain response via @Context injection
    @Context
    private ThreadLocal<HttpServletResponse> responseInvoker;

    private void dispatch(Object model) throws IOException {
        String viewPath = getViewPath(context);

        RequestDispatcher d =
                servletContext.getRequestDispatcher(viewPath);

        if (d == null) { /* could not be obtained */ }

        HttpServletRequest request = requestInvoker.get();

        // Set model to be accessible as it variable in view
        request.setAttribute("it", model);
        try {
            d.forward(request, responseInvoker.get());
        } catch (ServletException e) {
            throw new RuntimeException("Dispatch to view failed", e);
        }
    }

    @Override
    public boolean isWriteable(
            Class<?> type, Type genericType,
            Annotation[] annotations, MediaType mediaType) {

        // Check if view like [controller]/[action].jsp
        // exists under /WEB-INF/views

        return templateExists(getViewPath(context));
    }

    @Override
    public void writeTo(
            Object o, Class<?> type, Type genericType,
            Annotation[] annotations, MediaType mediaType,
            MultivaluedMap<String, Object> httpHeaders,
            OutputStream out) throws IOException {

        // Redirect to view placed in
        // /WEB-INF/views/[controller]/[action].jsp

        dispatch(getViewPath(context));
    }

    @Override
    public long getSize(
            Object o, Class<?> type, Type genericType,
            Annotation[] annotations, MediaType mediaType) {

        // Return -1 to indicate that no explicit
        // content lenght can be assigned
        // (frankly, we do not know about the length)
        return -1;
    }

    private String getViewPath(HttpContext context) {
        AbstractResourceMethod m =
                context.getUriInfo().getMatchedMethod();

        String controller =
                  m.getMethod().getDeclaringClass().getSimpleName();
        String action = m.getMethod().getName();

        if (controller.endsWith("Controller")) {
            controller = controller.substring(0,
                    controller.length() - "Controller".length());
        }

        controller = controller.toLowerCase();

        String path = "/WEB-INF/views"
                + controller + "/" + action + ".jsp";
        return path;
    }

    public boolean templateExists(String path) {
        try {
            return servletContext.getResource(path) != null;
        } catch (MalformedURLException e) {
            // TODO: log
            return false;
        }
    }
}
```

Voilà!

Don't forget to put this provider class somewhere where Jersey can find it (specify package scanning accordingly).


## More Resources

* An advanced implementation of the `MVCViewMessageBodyWriter` can be found [here](http://repository.nixis.de/maven2/de/nixis/commons/jersey-mvc/1.0.2/) including sources and documentation.
* [MVC in Jersey](http://blogs.sun.com/sandoz/entry/mvcj), original article written by Paul Sandoz
* [View resolving in Spring](http://static.springsource.org/spring/docs/2.0.x/reference/mvc.html#mvc-viewresolver), of course *100% configurable*
* [Views in Ruby on Rails](http://guides.rubyonrails.org/layouts_and_rendering.html)
* [Good article about SpringMVC and JAX-RS](http://www.infoq.com/articles/springmvc_jsx-rs), unfortunately does not cover how Spring handles views