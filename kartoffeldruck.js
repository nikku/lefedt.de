var forEach = require('lodash/forEach');

var byPublished = function(a, b) {
  return a.published < b.published ? 1 : (a.published === b.published ? 0 : -1);
};

/**
 * @param { import('kartoffeldruck').Kartoffeldruck } druck
 */
module.exports = async function(druck) {

  druck.init({
    locals: {
      site: {
        title: 'lefedt.de',
        author: 'Nico Rehwaldt',
        description: 'The website of Nico Rehwaldt. Learn about me and what I\'m doing'
      }
    }
  });

  // install custom helpers

  var nunjucks = druck.getNunjucks();

  nunjucks.addFilter('date', require('nunjucks-date'));
  nunjucks.addFilter('author', require('./helpers/author'));
  nunjucks.addFilter('excerpt', require('./helpers/excerpt'));


  var published = (await druck.files('blog/posts/*/*.md')).sort(byPublished);
  var unpublished = (await druck.files('blog/posts/*/_drafts/*.md')).sort(byPublished);

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

  await druck.generate({
    source: '*.md',
    dest: ':name/index.html'
  });

  await druck.generate({
    source: 'legal/*.md',
    dest: ':name/index.html'
  });


  // index page

  await druck.generate({
    source: 'index.html',
    dest: 'index.html'
  });


  // published posts

  await druck.generate({
    source: published,
    dest: 'blog/posts/:slug/index.html'
  });

  // unpublished posts

  await druck.generate({
    source: unpublished,
    dest: 'blog/posts/:slug/index.html'
  });

  // published list

  await druck.generate({
    source: 'blog/index.html',
    dest: 'blog/:page/index.html',
    locals: { items: published },
    paginate: 5
  });

  // tag list

  for (const [ _, t ] of Object.entries(tagged)) {
    druck.generate({
      source: 'blog/_tagged.html',
      dest: 'blog/_tagged/:tag/:page/index.html',
      locals: t,
      paginate: 5
    });
  }


  var projects = (await druck.files('projects/*/*')).sort(function(a, b) {
    return a.created < b.created ? 1 : (a.created === b.created ? 0 : -1);
  });

  await druck.generate({
    source: 'projects/index.html',
    dest: ':name.html',
    locals: { items: projects }
  });

};
