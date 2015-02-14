var forEach = require('lodash/collection/forEach');

var byPublished = function(a, b) {
  return a.published < b.published ? 1 : (a.published === b.published ? 0 : -1);
};

module.exports = function(druck) {

  druck.init({
    locals: {
      site: {
        title: 'lefedt.de',
        author: 'Nico Rehwaldt'
      }
    }
  });

  // install custom helpers

  var nunjucks = druck.config.nunjucks;

  nunjucks.addFilter('date', require('nunjucks-date'));
  nunjucks.addFilter('author', require('./helpers/author'));
  nunjucks.addFilter('excerpt', require('./helpers/excerpt'));


  var published = druck.files('blog/posts/*/*.md').sort(byPublished);
  var unpublished = druck.files('blog/posts/*/_drafts/*.md').sort(byPublished);

  // extract tags

  var tagged = {};

  published.forEach(function(p) {
    (p.tags || []).forEach(function(tag) {
      var t = tagged[tag] = (tagged[tag] || { tag: tag, items: [] });
      t.items.push(p);
    });
  });

  druck.config.locals.tagged = tagged;

  // simple pages

  druck.generate({
    source: '{legal/,}*.md',
    dest: ':name/index.html'
  });


  // index page

  druck.generate({
    source: 'index.html',
    dest: 'index.html'
  });


  // published posts

  druck.generate({
    source: published,
    dest: 'blog/posts/:slug/index.html'
  });

  // unpublished posts

  druck.generate({
    source: unpublished,
    dest: 'blog/posts/:slug/index.html'
  });

  // published list

  druck.generate({
    source: 'blog/index.html',
    dest: 'blog/:page/index.html',
    locals: { items: published },
    paginate: 5
  });

  // tag list

  forEach(tagged, function(t) {
    druck.generate({
      source: 'blog/_tagged.html',
      dest: 'blog/_tagged/:tag/:page/index.html',
      locals: t,
      paginate: 5
    });
  });


  var projects = druck.files('projects/*/*').sort(function(a, b) {
    return a.created < b.created ? 1 : (a.created === b.created ? 0 : -1);
  });

  druck.generate({
    source: 'projects/index.html',
    dest: ':name.html',
    locals: { items: projects }
  });

};