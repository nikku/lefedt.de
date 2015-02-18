module.exports = function (grunt) {

  require('load-grunt-tasks')(grunt);

  grunt.initConfig({

    pkg: grunt.file.readJSON('package.json'),

    config: {
      dist: 'dist',
      pages: 'pages',
      templates: 'templates',
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
          '<%= config.dist %>/assets/css/blog.css': '<%= config.assets %>/less/blog.less'
        }
      }
    },

    copy: {
      resources: {
        files: [
          {
            cwd: '<%= config.assets %>',
            src: [ 'vendor/**/*', 'img/**/*', 'attachments/**/*' ],
            dest: '<%= config.dist %>/assets',
            expand: true
          }
        ]
      }
    },

    watch: {
      kartoffeldruck: {
        files: [ '<%= config.pages %>/**/*', '<%= config.templates %>/**/*' ],
        tasks: [ 'kartoffeldruck' ]
      },
      less: {
        files: [ '<%= config.assets %>/less/*.less' ],
        tasks: [ 'less' ]
      },
      copy: {
        files: [
          '<%= config.assets %>/img/**/*',
          '<%= config.assets %>/vendor/**/*',
          '<%= config.assets %>/attachments/**/*'
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

    clean: [ '<%= config.dist %>/**/*' ]
  });

  grunt.registerTask('serve', [
    'build',
    'connect:livereload',
    'watch'
  ]);

  grunt.registerTask('build', [
    'clean',
    'less',
    'copy',
    'kartoffeldruck'
  ]);

  grunt.registerTask('kartoffeldruck', function() {
    var kartoffeldruck = require('kartoffeldruck');
    kartoffeldruck.run({
      logger: {
        log: grunt.log.ok
      }
    });
  });

  grunt.registerTask('default', [ 'build' ]);
};
