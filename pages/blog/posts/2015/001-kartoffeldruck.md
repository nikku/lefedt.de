---

title: 'Kartoffeldruck: A hackable static site generator'
slug: 2015/kartoffeldruck-a-hackable-static-site-generator
layout: post

tags: [ javascript, nodejs, npm, static site generator, kartoffeldruck, github, open source ]

author: Nikku<http://lefedt.de/about>

published: 2015-02-14

---


<p class="intro">
  There is probably around one thousand three hundred thirty seven static site generators out there.
  So why build [a new one](https://github.com/nikku/kartoffeldruck)? Because it could be a 300 lines of code only, all-in-one, swiss army knife, hackable one. Kind of.
</p>

<!-- continue -->


Static site generators are awesome. They take your plain text files, combine them with a layout skeleton and compile the whole stuff to HTML. Upload everything on [GitHub pages](https://pages.github.com/) or your favorite web server and you are good.


## Must have Generator Features

There is only a few things a good static site generators needs to be capable of doing:

* [Markdown](http://daringfireball.net/projects/markdown/) parsing
* Meta data extraction, i.e. [front matter](http://jekyllrb.com/docs/frontmatter/) support
* Layouting / templating
* Content grouping / tagging / categorization
* Pagination

Checking the [Node.js](http://nodejs.org)/[npm](https://npmjs.org) ecosystem there probably exist a few tools that provide the mentioned feature set already. Good candidates are [hexo](http://hexo.io) or [metalsmith](http://www.metalsmith.io). Why not use these? The reason is hackability.

As a programmer I would like to be able to control the way my pages are generated beyond JSON configurations and front matter annotations. In fact, I would like to have access to pages and meta data, too. Based on that I can easily implement grouping, categorization, table of content generation and the like.


## A hackable Site Generator

Say hello to [kartoffeldruck](https://github.com/nikku/kartoffeldruck), a static site generator you program  rather than configure. The library exposes only a single command line:

```
$ kartoffeldruck --help
generate a static site using the ancient kartoffeldruck principle
```

It will pick up a `kartoffeldruck.js` file in the current working directory. The file must expose a single function that receives the generator instance as an argument.

```javascript
module.exports = function(druck) {

  // optionally initialize source, dest and template directory
  druck.init({ });

  // ... generate site
};
```

`druck` is an instance of kartoffeldruck and provides the crucial APIs to implement the actual site generation.


## The Configuration

In its simples form a `kartoffeldruck.js` it will initialize the generator instance and generate posts from one folder into another.

The `Kartoffeldruck#generate` method accepts a [globbing expression](https://www.npmjs.com/package/glob#glob-primer), allowing you to generate a number of pages on the fly. Specify `:varName` parameters in the `dest` option to generate destination file names based on source file meta data.

```javascript
druck.generate({
  source: 'posts/*.md',
  dest: ':name/index.html'
});
```

### Meta Data Extraction and Filtering

You may also filter available pages yourself. This gives you access to each pages meta data.

```javascript
var posts = druck.files('posts/*.md');
```

One option would be to filter posts based on certain criteria, such as a `published` field.

```javascript
var unpublished = posts.filter(function(p) { return !p.published; });

// ... do stuff with unpublished posts
```

### Aggregation / Pagination

Posts may be aggregated by passing them as a local variable to an aggregation template:

```javascript
druck.generate({
  source: '_drafts.html',
  dest: '_drafts/:page/index.html',
  locals: { items: unpublished },
  paginate: 5
});
```

The `paginate` variable decides on the number of posts to put on each page. `:page/` will replace to an empty string on the first page, giving you nice overview urls.

The local variable `items` will be paginated based on the specified number of max items.


### Tag Clouds

Tag clouds can easily be generated from the available posts meta data:

```javascript
var tagged = {};

posts.forEach(function(p) {
  (p.tags || []).forEach(function(tag) {
    var t = tagged[tag] = (tagged[tag] || { tag: tag, items: [] });
    t.items.push(p);
  });
});
```

The variable can be made available to all templates, i.e. to render a tag cloud in the side bar:

```javascript
druck.config.locals.tagged = tagged;
```

It could also be used to generate overview pages, grouping posts by tag:

```javascript
var forEach = require('lodash/object/forEach');

forEach(tagged, function(t) {
  druck.generate({
    source: '_tagged.html',
    dest: '_tagged/:tag/:page/index.html',
    locals: t,
    paginate: 5
  });
});
```

Note how you are able to include you favorite utility library to perform matching, data extraction or object iteration, too.


## Templating Capabilities

Kartoffeldruck supports Markdown files out of the box. For more complex page content and/or templating purposes it uses [Nunjucks](https://mozilla.github.io/nunjucks/). Nunjucks is a templating language with a clean syntax, great expressiveness, impressive generation speed and extensibility. It should be sufficient for all the generation use cases out there. No need to include ejs, handlebars or _insert any other obscure templating dialect here_.


### Local Variables

Templates provide access to all local variables, including default locals exposed through the configuration. The following configuration will evaluate to `<h1>FOO</h1>` in the generated HTML file:

```markdown
---
title: FOO
---

# \{\{ title }}
```


### Helpers

Inside templates and Markdown files the `relative` helper is available. It inserts a link relative to the specified destination site, based on the location the current file is generated to.

```markdown
Check the [about page](\{\{ relative('about') }})
```

It will always generate correct reference to the `about` page, independent of whether the page is currently aggregated or generated as a single page.


The `render` helper on the other hand allows you to include another page within the pages output. This is useful for aggregations.

```nunjucks
\{\% for item in items %}
  <div class="item">
    <h1><a href="\{\{ relative(item.name) }}">\{\{ item.title }}</a></h1>

    \{\{ render(item) \}\}
  </div>
\{\% endfor %}
```

### Default Variables

The `assets` variable always points to a `assets/` directory that is supposed to contain all non-HTML files.

```markdown
![a picture](\{\{ assets }}/blog/some-picture.jpg)
```

You have to take care about copying the images yourself. kartoffeldruck only knows about HTML assets.


### Pagination

During pagination kartoffeldruck makes the `page` object available in templates.

It contains the links to the next as well as previous page.

```
\{\% if page.previousRef != null %}
  <a href="\{\{ relative(page.previousRef) }}">previous</a>
\{\% endif %}

\{\% if page.nextRef != null %}
  <a href="\{\{ relative(page.nextRef) }}">next</a>
\{\% endif %}
```


### Template Inheritance

Nunjucks supports a sophisticated template inheritance scheme. Let us say a base template, i.e. `base.html` implements the general skeleton.

```nunjucks
<html>
  <head>
    \{\% block header %}\{\% endblock %}
  </head>
  <body>
    \{\% block body %}default body text\{\% endblock %}
  </body>
</html>
```

Child templates can choose to extend from it, filling one or more placeholder blocks, i.e. to include custom scripts, meta data or page content:

```
\{\% extends "base.html" %}

\{\% block body %}
  Specialized body content
\{\% endblock %}
```


### Implicit Layouts

When using front matter definitions, the layout variable defines the parent template to inherit from.
This makes the above code equivalent to

```
---
layout: base
---

\{\% block body %}
  Specialized body content
\{\% endblock %}
```

Markdown pages will be automatically rendered into a `item_body` block.


## There is More

This gave a quick overview about the basic concepts of kartoffeldruck. The project is available on [GitHub](https://github.com/nikku/kartoffeldruck) and features an [example project](https://github.com/nikku/kartoffeldruck/tree/master/example) that generates a simple blog. To inspect a more elaborated example, [browse the sources](https://github.com/nikku/lefedt.de) of this site.