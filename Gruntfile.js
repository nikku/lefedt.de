'use strict';

module.exports = function (grunt) {

  require('time-grunt')(grunt);
  require('load-grunt-tasks')(grunt);

  grunt.initConfig({

    pkg: grunt.file.readJSON('package.json'),

    config: {
      site: 'site',
      dist: 'dist',
      assets: 'assets',
      libs: {
        bootstrap: 'bower_components/bootstrap'
      }
    },

    less: {
      site: {
        options: {
          compress: true,
          paths: [ '<%= config.assets %>/less', '<%= config.libs.bootstrap %>/less' ]
        },
        files: {
          '<%= config.dist %>/assets/css/lefedt.css': '<%= config.assets %>/less/lefedt.less'
        }
      }
    },

    copy: {
      resources: {
        files: [
          {
            cwd: '<%= config.site %>',
            src: [ 'index.html' ],
            dest: '<%= config.dist %>',
            expand: true
          },
          {
            cwd: '<%= config.assets %>',
            src: [ 'css/**/*.*', 'js/**/*.*', 'img/**/*.*', 'attachments/**/*', 'font/lefedt.*' ],
            dest: '<%= config.dist %>/assets',
            expand: true
          }
        ]
      }
    },

    watch: {
      assemble: {
        files: [ '<%= config.site %>/**/*.{md,hbs,yml}' ],
        tasks: [ 'assemble' ]
      },
      less: {
        files: [ '<%= config.assets %>/less/*.less' ],
        tasks: [ 'less' ]
      },
      copy: {
        files: [
          '<%= config.assets %>/img/**/*',
          '<%= config.assets %>/js/**/*',
          '<%= config.assets %>/css/**/*',
          '<%= config.assets %>/attachments/**/*',
          '<%= config.assets %>/font/lefedt.*',
          '<%= config.site %>/index.html'
        ],
        tasks: [ 'copy:resources' ]
      },
      livereload: {
        options: {
          livereload: '<%= connect.options.livereload %>'
        },
        files: [
          '<%= config.dist %>/**/*.*'
        ]
      }
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
            '<%= config.dist %>'
          ]
        }
      }
    },

    assemble: {
      options: {
        app: '<%= config %>',
        flatten: true,
        marked: {
          process: true
        },
        assets: '<%= config.dist %>/assets',
        layoutdir: '<%= config.site %>/layouts',
        layout: 'default.hbs',
        data: '<%= config.site %>/data/*.{json,yml}',
        partials: '<%= config.site %>/partials/*.hbs',
        plugins: [
          'assemble-contrib-permalinks'
        ],
        helpers: [
          'handlebars-helper-compose',
          '<%= config.site %>/helpers/**/*.js'
        ]
      },
      main: {
        files: {
          '<%= config.dist %>/': [ '<%= config.site %>/pages/*.hbs' ],
          '<%= config.dist %>/projects/': [ '<%= config.site %>/pages/projects/*.hbs' ],
          '<%= config.dist %>/about/': [ '<%= config.site %>/pages/about/*.hbs' ],
          '<%= config.dist %>/legal/': [ '<%= config.site %>/pages/legal/*.hbs' ]
        }
      },
      blog: {
        options: {
          marked: {
            process: true,
            langPrefix: 'hljs language-',
            highlight: function(code, lang) {
              var hjs = require('highlight.js');

              var result;
              if (lang) {
                result = hjs.highlight(lang, code);
              } else {
                result = hjs.highlightAuto(code);
              }

              return result.value;
            }
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
          '<%= config.dist %>/blog/': [ '<%= config.site %>/pages/blog/*.hbs' ],
          '<%= config.dist %>/blog/posts/': [ '<%= config.site %>/pages/blog/*/*.{md,hbs}' ]
        }
      }
    },

    clean: [ '<%= config.dist %>/**/*' ]
  });

  // assemble incompatible with load-grunt-tasks
  grunt.loadNpmTasks('assemble');

  grunt.registerTask('serve', [
    'build',
    'connect:livereload',
    'watch'
  ]);

  grunt.registerTask('build', [
    'clean',
    'less',
    'copy',
    'assemble'
  ]);

  grunt.registerTask('default', [ 'build' ]);
};
