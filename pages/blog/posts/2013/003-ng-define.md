---

title: "ngDefine: A minimal AngularJS in RequireJS/AMD boilerplate"
slug: 2013/ng-define-angular-support-for-requirejs-amd
layout: post

tags: [ javascript, angularjs, requirejs, ng-define ]

author: Nikku<http://lefedt.de/about>

published: 2013-07-26

---


Developing web applications using [AngularJS](http://angularjs.org) is fun.
Modularizing your application using [RequireJS/AMD modules](http://requirejs.org) is nice, too unless you enjoy it to shuffle around `<script />` tags everytime you include another javascript file into the application.

This post introduces [ngDefine](https://nikku.github.io/requirejs-angular-define), a tiny library I have created that makes both technologies get to know each other.

<!-- continue -->

## Integration in a Nutshell

[ngDefine](http://nikku.github.io/requirejs-angular-define) integrates AngularJS and RequireJS by wrapping [define](http://requirejs.org/docs/api.html#define) and adding a little bit of AngularJS flavour to it.

Defining a module using ngDefine may look as follows:

```javascript
ngDefine('app', [
  'jquery',
  'module:app.controllers:',
  'module:app.services:',
  'module:app.directives',
  './local'
], function(module, $) {

  // module = { name: 'app', .. }

  module.config(function($routeProvider) {
    $routeProvider.when( ... );
  });
});
```

It calls the function `ngDefine` with the name of the AngularJS module, a list of dependencies and a factory function.
Dependencies may contain references to AngularJS modules, denoted by `module:{moduleName}`.
Those get translated to actual file resources before the whole list of dependencies is resolved via RequireJS.
ngDefine wires together the Angular module and passes it into the factory function along with all resolved AMD dependencies.


## Features

The ngDefine integration offers a number of benefits over plain AngularJS applications:

- __Improved modularization:__ AngularJS modules may be packaged into reusable AMD modules.
- __Integration of external libraries:__ Non-AngularJS dependencies may easily be declared via AMD dependencies.
- __Minimal RequireJS boilerplate:__ The amount of RequireJS boilerplate in the application code is kept at a minimum (only the `ngDefine` wrapper is needed).
- __Minification:__ The integration [can be minified](http://nikku.github.io/requirejs-angular-define/#minification). After minification module definitions are stripped down to plain AngularJS/RequireJS code after minification.

In addition it helps to avoid common pitfalls in AngularJS applications such as unintended module re-definition.


## Additional Resources

If you would like to learn more, check out the [project website](http://nikku.github.io/requirejs-angular-define/) or its [home on GitHub](http://nikku.github.io/requirejs-angular-define/).

Feel free to give feedback on the project and report bugs on the
[issue tracker](https://github.com/Nikku/requirejs-angular-define/issues).