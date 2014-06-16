---

title: A developer friendly blog setup with Assemble + GitHub pages
layout: blogpost.hbs

slug: 2014-building-a-github-pages-blog-with-assemble
author: Nico Rehwaldt<https://github.com/Nikku>

published: 2014-06-16 20:00

---

<p class="intro">
  This post shows you how to create a simple, 100% developer friendy blogging setup.
  It allows you to write your posts with markdown, build the blog with [Assemble](http://assemble.io) and publish it to [GitHub pages](https://pages.github.com/).
  Get rid of WYSIWYG editors and reclaim your blog!
</p>

<!-- continue -->

_TLDR; Checkout [the sources of this webpage](https://github.com/Nikku/lefedt.de) for the finished solution._

I am a programmer and blogger but I have not been blogging for a while.
This is not because there is nothing to write, in fact I am working on many exciting topics that deserve it to be mentioned.
I just hate my old blogging solution.


## Workflow issues

My old solution is a web application I wrote in Ruby on Rails and dates back to 2009.
It allows me to write blog posts online and supports live preview, markdown markup and the ability to pretty print code.
It sucks not because of the way it is built but rather because it forces me to write blog posts in a browser-centric [blogger](http://blogger.com)-like way:

*   It _does not integrate_ with my development setup.
    Because of that I cannot use my favourite text editor to write posts, something that is especially important when you blog code snippets.
    Additionally I cannot easily get a live preview of the new post.

*   It is an _online_ solution that forces me to write a post in the browser and auto save them rather than dumping them to disk.
    How many times did I loose a post by accidently refreshing or closing the browser window?
    Attaching arbitrary files is a pain, too.

*   It is a _web application_ I need to keep up and running.
    The mere fact that I need a login to write blog posts poses a security thread for me.


## Make it better

Let's improve the blogging experience and with a simpler, developer friendly setup.
Its main ingredients are:

*   _Write_ blog posts in markdown, HTML or any other markup and attach arbitrary files.

*   _Build_ the blog with [Assemble](http://assemble.io), a static site generator.

*   _Publish_ the blog to [GitHub pages](https://pages.github.com/)


## Basic blog structure

The following directory tree shows our basic blog structure.
The important folders are `pages` and `layouts`.
`pages` hold the actual content of our blog, including all blog entries (structured in arbitrary order) and a blog overview page `index.hbs`.
The files in the `layouts` directory define the overall structur of our blog.

```bash
blog
├──data
├──dist
├──helpers
│  └──blog
├──layouts
│  ├──base.hbs
│  └──blogpost.hbs
├──pages
│  ├──about
│  ├──blog
│  │  ├──2013
│  │  │  ├──001-first-blog-post.md
│  │  │  └──002-another-blog-post.md
│  │  ├──2014
│  │  │  └──001-new-year-yai.md
│  │  └──index.hbs
│  └──...
└──partials
```

The `dist` folder is the location or blog will later be compiled to.


## A single post

All files in subdirectories of `pages/blog` represent blog entries. Each blog entry contains meta data enclosed in
`---` as well as the actual blog contents.

```markdown
---
title: First Blog Post
slug: 2013-first-blog-post

author: Nico<link-to-me>
published: 2014-05-01 12:07

layout: blogpost.hbs
---

<p class="intro">
  This is a catchy intro for my blog post. Isn't it?
</p>

<!-- continue -->

This will be hidden in the blog overview but shown
for the complete blog post.
```

Edit that file happily using your favourite text editor.


### Post meta data

A post defines some meta data that is important for our blogging setup.
Let us have a closer look on the relevant fields:

*   `title` (self explanatory), will be inserted for the post.
    There is no need for an additional main heading in the post content.

*   `published` decides on the order of blog posts

*   `slug` is the permanent location of the blog post and should thus be unique across all posts.
    Each entry will later be available via `http://myblog/blog/posts/:slug.html`.

*   `layout` defines the structure of the post

*   `author` will be used to link to the writer of the post as `:name<:link>`.
    The link can be an arbitray location but should reflect the author.


### Intro and continue reading

Our infrastructure will support highlighting for post introductions.
Wrap it into a `<p class="intro"></p>` block for an additional styling in the full post view.

Insert a `<!-- continue -->` marker to denote the end of the post parts that are rendered in the blog post overview.
Everything below that fold will only be shown in the full post view and signalized through a _continue reading..._ link.

Let us now have a look on the actual blog infrastructure.


## Infrastructure

We will use [Assemble](http://assemble.io), a static site generator, to build our blog from the posts we wrote.
Assemble is a plug-in for [grunt](http://gruntjs.com) and thus integrates well in a web developers tool chain.
Grunt is a popular build tool for client-side applications and runs on top of [NodeJS](http://nodejs.org).


### Environment setup

Install [NodeJS](http://nodejs.org).
Follow up by installing the command line tool for Grunt via [npm](http://npmjs.org), the NodeJS package manager:

```bash
npm install -g grunt-cli
```

### The project descriptor

Create a `package.json` in the root folder of the blog.
It defines all the neccessary dependencies of our blogging infrastructure.

```json
{
  "name": "myblog",
  "version": "0.0.0",
  "private": true,
  "devDependencies": {
    "assemble": "^0.4.39",
    "assemble-contrib-anchors": "^0.1.1",
    "assemble-contrib-permalinks": "^0.3.4",
    "grunt": "^0.4.5",
    "grunt-contrib-clean": "~0.5.0",
    "grunt-contrib-connect": "~0.6.0",
    "grunt-contrib-copy": "~0.5.0",
    "grunt-contrib-less": "~0.9.0",
    "grunt-contrib-watch": "~0.5.3",
    "handlebars-helper-compose": "^0.2.12",
    "handlebars-helper-moment": "^0.1.3",
    "load-grunt-tasks": "~0.2.1"
  },
  "dependencies": {
    "highlight.js": "^8.0.0"
  }
}
```

To install the dependencies, execute

```bash
npm install
```

in the blog directory. It downloads all dependencies to the `node_modules` folder.


### The build file

Go ahead and create build script called `Gruntfile.js` in the project root.
It should have the following contents:

```javascript
module.exports = function (grunt) {

  require('load-grunt-tasks')(grunt);

  grunt.initConfig({

    assemble: {
      options: {
        flatten: true,
        marked: {
          process: true
        },
        assets: 'dist/assets',
        layoutdir: 'site/layouts',
        layout: 'default.hbs',
        data: 'site/data/*.{json,yml}',
        partials: 'site/partials/*.hbs',
        plugins: [
          'assemble-contrib-permalinks'
        ],
        helpers: [
          'site/helpers/**/*.js'
        ]
      },
      blog: {
        options: {
          marked: {
            process: true
          },
          helpers: [
            'handlebars-helper-compose',
            'handlebars-helper-moment'
          ],
          permalinks: {
            structure: ':slug.html'
          }
        },
        files: {
          'dist/blog/posts/': [
            'site/pages/blog/*/*.{md,hbs}'
          ]
        }
      }
    },

    clean: [ 'dist/**/*' ]
  });

  // assemble incompatible with load-grunt-tasks
  grunt.loadNpmTasks('assemble');

  grunt.registerTask('build', [
    'clean',
    'assemble'
  ]);

  grunt.registerTask('default', [ 'build' ]);
};
```

In the build file, we configure assemble and define it as our main build task.


### Blog layout

Before we can actually assemble the blog, we need to define the layouts used by our blog posts.

Put a file with the following contents as `blogpost.hbs` into our `layouts` directory.

```handlebars
---
layout: blog.hbs
---

<div class="blogpost single">

  <div class="published">
    \{{ moment published format="dddd, MMMM DD, YYYY" }}
  </div>

  <h1 class="page-header"><a href="./\{{slug}}.html">\{{ title }}</a></h1>

  <div class="content">
    \{{#markdown }}
      \{{> body}}
    \{{/markdown}}
  </div>

  <div class="meta">
    Posted by \{{ author author }} on <a href="\{{slug}}.html">\{{ moment published format="YYYY-MM-DD HH:mm ZZ" }}</a>.
  </div>
</div>
```

The file scaffolds each post with the published date (formated via the [moment helper for handlebars](https://github.com/helpers/handlebars-helper-moment)), post title as well as additional meta data.


You should wrap the template in additional `blog.hbs` skeletons that defines the general structure of the blog.

```handlebars
<html>
<head>
</head>
<body>
\{{>body}}
</body>
</html>
```

You may add styles as well as additional markup for header, footer and navigation to this bare template.
I prefer [Bootstrap](http://getbootstrap.com) for the general page scaffholding but really, the choice is yours.

Just ensure you keep the `\{{>body}}` placeholder to include child layouts or page data.


### The author blog helper

To be able to compile the `blogpost.hbs` template, we need the `author` blog helper.

Add it as `helper-author.js` to the `helpers` directory.
It will split our `:name<:link>` author meta data field and render a proper link for it in the markup.


```javascript
module.exports.register = function(Handlebars, options, params)  {

  var PATTERN = /^(.+)\s*<(.+)>$/;

  Handlebars.registerHelper('author', function(author, options) {
    var result;

    var match = PATTERN.exec(author);
    if (match) {
      result = '<a class="author" href="' + match[2] + '">' + match[1] + '</a>';
    } else {
      result = '<span class="author">' + author + '</a>';
    }

    return new Handlebars.SafeString(result);
  });
};
```


### Generate all things

With layouts and the necessary helpers in place we can now generate our blog by executing

```bash
grunt
```

on the command line. It will output the generated pages to the `dist` directory.


### A blog overview page

To add a blog overview page, create a file `blog/index.hbs` with the following contents:

```handlebars
---
title: Blog
layout: 'blog.hbs'
---


\{{#compose src='*/*.md' cwd='site/pages/blog' sortBy="published" sortOrder="desc"}}

<div class="blogpost-preview">

  <div class="published">
    \{{ moment @published format="dddd, MMMM DD, YYYY" }}
  </div>

  <h2 class="page-header"><a href="posts/\{{@slug}}.html">{{ @title }}</a></h2>

  <div class="content">
    \{{#excerpt @slug}}
      \{{{@content}}}
    \{{/excerpt}}
  </div>

  <div class="meta">
    Posted by \{{ author @author }} on <a href="posts/\{{@slug}}.html">\{{ moment @published format="DD MMMM YYYY HH:mm ZZ" }}</a>.
  </div>
</div>
\{{/compose}}
```

It uses the [compose helper](https://github.com/helpers/handlebars-helper-compose) for handlebars to grep through all
blog posts, order them and generate a post preview.

Define the `excerpt` helper in a file `helpers/helper-excerpt.js`.
It scans a post for the `<!-- continue -->` fold and extracts the preview accordingly.

```javascript
module.exports.register = function(Handlebars, options, params)  {

  var CONTINUE = '<!-- continue -->';

  Handlebars.registerHelper('excerpt', function(url, options) {
    var result = options.fn(this);

    var splitIdx = result.indexOf(CONTINUE);
    if (splitIdx !== -1) {
      result = result.substring(0, splitIdx);

      result += '<p><a href="posts/' + url + '.html">Continue reading ...</a></p>';
    }

    return new Handlebars.SafeString(result);
  });
};
```

Now modify the Assemble configuration in our `Gruntfile.js` to include the blog index page.

```javascript
module.exports = function (grunt) {
    ...

    assemble: {
      ...
      blog: {
        ...

        files: {
          'dist/blog/posts/': [
            'site/pages/blog/*/*.{md,hbs}'
          ],
          'dist/blog/': [
            'site/pages/blog/*.hbs'
          ]
        }
      }
    },

    ...
};
```

With these changes in place we have our blog setup ready. But wait, isn't there more?


## Additional topics

This section discusses a few additional things that are still missing in our setup.
These are preview and live reload as well as how to add attachments.


### Preview and live reload

A much needed feature is live preview. Let us add it through standard Grunt features by configuring the [watch](https://github.com/gruntjs/grunt-contrib-watch) and [connect](https://github.com/gruntjs/grunt-contrib-connect) tasks in our build file.

```javascript
module.exports = function (grunt) {
  ...

  grunt.initConfig({

    watch: {
      assemble: {
        files: [ 'site/**/*.{md,hbs,yml}' ],
        tasks: [ 'assemble' ]
      },
      livereload: {
        options: {
          livereload: '<%= connect.options.livereload %>'
        },
        files: [
          'dist/**/*.*'
        ]
      }
    },

    assemble: {
      ...
    },

    connect: {
      options: {
        port: 9005,
        livereload: 19005,
        hostname: 'localhost'
      },
      livereload: {
        options: {
          open: true,
          base: [
            'dist'
          ]
        }
      }
    },

    ...
  });

  ...

  grunt.registerTask('serve', [
    'build',
    'connect:livereload',
    'watch'
  ]);

  ...
};
```

Connect will startup an embedded web server for us in the `dist` directory and opens up a browser window.
Watch on the other hand makes sure that Assemble rebuilds the blog whenever a file changes.
Additionally it triggers the live reload of the browser window, whenever the generation completes.

We defined a new Grunt task called `serve` that pulls the complete blogging setup together.

Execute it from the command line via

```bash
grunt serve
```


### Adding attachments

Attachments are a one of the biggest pain points for browser based blogging solutions.
In our setup, however, they are a pretty straight forward thing to implement.

For simplicity, we will use the assets feature that is built in into Assemble by putting all blog post attachments into a special asset directory. Let us call it `assets/attachments`.

We use the [copy](https://github.com/gruntjs/grunt-contrib-copy) task for grunt and configure it in the grunt file to pull all attachments into the `dist` folder:

```javascript
module.exports = function (grunt) {
  ...

  grunt.initConfig({
    ...

    watch: {
      ...

      copy: {
        files: [
          'assets/attachments/**/*'
        ],
        tasks: [ 'copy:attachments' ]
      },
      ...
    },

    copy: {
      attachments: {
        files: [
          {
            cwd: 'assets',
            src: [ 'attachments/**/*' ],
            dest: 'dist',
            expand: true
          }
        ]
      }
    },

    ...
  });

  ...

  // updated build task

  grunt.registerTask('build', [
    'clean',
    'less',
    'copy',
    'assemble'
  ]);
};
```


To reference attachments in your blog posts, simply use the `\{{ assets }} /attachments/path/to/attachment` markup in a post. Assemble will replace the `\{{ assets }}` placeholder with the relative location to the `assets` folder.


## Versioning and publishing

Versioning is best done by version control systems, such as [git](http://www.git-scm.com/).

Using [GitHub](https://github.com), you can version your blog sources.
Thanks to [GitHub pages](https://pages.github.com) you can publish the generated blog online in no time, too.


### Setup a repository

Make sure you have [git](http://www.git-scm.com/) installed on your machine and a [GitHub repository created for the blog](https://help.github.com/articles/creating-a-new-repository).

Create a local git repository in the blog directory via

```bash
git init
git remote add origin <url-to-remote-git-repo>
```

To setup the `gh-pages` branch for the generated blog, clean the `dist` directory first.
Then from within the directory execute

```bash
git clone <url-to-remote-git-repo> .
git checkout -b gh-pages
```

This sets up the `gh-pages` branch in the dist directory.


### Add a .gitignore file

Make sure you do not accidently push the generated blog into your main repository by adding a `.gitignore` file with the following contents to the root of your blog project:

```bash
node_modules/
dist/
```


### Check-in

If your blog looks fine through `grunt serve`, it will probably look fine on the web, too.
Commit all project changes from the root of your blog project via

```bash
git add -A
git commit -m "update changes"
git push origin master
```


### Publish

To publish the changes to GitHub pages commit and push them from within the `dist` directory

```bash
git add -A
git commit -m "blog update"
git push origin gh-pages
```


Browse `https://<your-name>.github.io/<blog-project-name>`.
Your blog should be up and running.


## Summary

This blog post went through the creation of a developer friendly blogging setup with [Assemble](http://assemble.io).
Assemble integrates well into a web developers tool belt.
As a result things such as live reload, attachment handling, css style compilation and minification are just a few configuration steps away.

By publishing the blog to [GitHub pages](https://pages.github.com) it is hosted 100% hazzle free and still under your full control. No credentials needed, because it is just a `git push` to get changes up and running.

If you want to checkout a full running version of the described setup, inspect the [sources of this website](https://github.com/Nikku/lefedt.de).

Blog reclaimed, achivement unlocked.