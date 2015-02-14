---

title: Annotation based security for Ruby on Rails Applications
slug: 2010/annotation-based-security-ruby-on-rails
layout: post

tags: [ annotation_security, ruby on rails, ruby, security ]

author: Nikku<http://lefedt.de/about>

published: 2010-03-12

---

[AnnotationSecurity](http://rubygems.org/gems/annotation_security) is a ruby gem which provides a security layer for rails applications. It defines the security model as actions which can be performed on resources.
In separate files you define user-resource-relations and rights.

Controllers are tagged with a description what action is carried out by them. Using this description the layer evaluates security rules automatically for a rails app, keeping your controllers and views free from any security logic.

The projects [GitHub repository](https://github.com/nikku/annotation_security) contains a detailed explaination on [how to secure your Rails applications with it](https://github.com/nikku/annotation_security/blob/master/HOW-TO.md).

The current version of the gem can always be installed using

```
gem install annotation_security
```

To wire it together with a rails app, write

```
annotation_security —rails RAILS_HOME
```