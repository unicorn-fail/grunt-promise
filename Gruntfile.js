/**
 * Development Gruntfile for the "grunt-promise" NPM module.
 *
 * The MIT License (MIT)
 * Copyright (c) 2016 Mark Carver
 */
(function () {
  'use strict';

  var grunt = require('grunt');
  var Promise = require('./index.js').using();

  // Grunt config initialization.
  // -----------------------------------------------------------------------
  grunt.initConfig({
    bump: {
      options: {
        pushTo: 'origin'
      }
    },
    nodeunit: {
      all: ['test/*-test.js']
    },
    eslint: {
      options: {
        configFile: '.eslintrc'
      },
      js: [
        'index.js',
        'Gruntfile.js',
        'lib/**/*.js',
        'script/**/*.js',
        'test/**/*.js'
      ]
    }
  });

  // Load NPM grunt module tasks.
  // -----------------------------------------------------------------------
  grunt.loadNpmTasks('grunt-bump');
  grunt.loadNpmTasks('grunt-eslint');
  grunt.loadNpmTasks('grunt-contrib-nodeunit');

  // Register regular Grunt tasks.
  // -----------------------------------------------------------------------
  grunt.registerTask('default', ['test']);
  grunt.registerTask('test', ['eslint', 'nodeunit']);
  grunt.registerTask('test-before', grunt.log.writeln.bind(grunt.log, 'before finished'));
  grunt.registerTask('test-after', grunt.log.writeln.bind(grunt.log, 'after finished'));

  // Register Promised based Grunt task.
  grunt.registerPromise('test-chaining', function () {
    var math = require('./test/fixtures/math');
    return math.add()
      .then(math.multiply)           // Expected value: 50
      .then(math.multiply)           // Expected value: 500
      .then(math.multiply)           // Expected value: 5000
      .then(math.multiply)           // Expected value: 50000
      .then(function (value) {
        var result = 'Result (' + Promise.gruntPromiseLibraryName + '): ' + value;
        grunt.log.writeln(result);   // Result: 50000
      });
  });

})();
