/**
 * Development Gruntfile for the "grunt-promise" NPM module.
 *
 * The MIT License (MIT)
 * Copyright (c) 2016 Mark Carver
 */

module.exports = function (grunt) {
  'use strict';

  // Load this module (grunt-promise) and retrieve the current promise object.
  // -----------------------------------------------------------------------
  var Promise = require('./index.js').load();

  // Grunt initialization.
  // -----------------------------------------------------------------------
  grunt.initConfig({
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
  grunt.loadNpmTasks('grunt-eslint');
  grunt.loadNpmTasks('grunt-contrib-nodeunit');

  // Testing tasks.
  // -----------------------------------------------------------------------
  var initialValue = grunt.option('initial-value') || 0;
  var timeout = grunt.option('timeout') || 1;

  // Create a promise for increasing the value.
  var increase = function (value) {
    return new Promise(function (resolve) {
      setTimeout(function () {
        value++;
        grunt.log.writeln('addition:value', value);
        resolve(value);
      }, timeout);
    });
  };

  // Create a promise for multiplying the value.
  var multiply = function (value) {
    return new Promise(function (resolve) {
      setTimeout(function () {
        value *= 10;
        grunt.log.writeln('multiplication:value', value);
        resolve(value);
      }, timeout);
    });
  };

  // An "add" promise.
  var add = function () {
    return increase(initialValue)             // Expected value: 1
      .then(increase)                         // Expected value: 2
      .then(increase)                         // Expected value: 3
      .then(increase)                         // Expected value: 4
      .then(increase)                         // Expected value: 5
    ;
  };

  // Register a promised task for the "Promise Chaining" tests.
  grunt.registerPromise('test-chaining', function () {
    return add()
      .then(multiply)                         // Expected value: 50
      .then(multiply)                         // Expected value: 500
      .then(multiply)                         // Expected value: 5000
      .then(multiply)                         // Expected value: 50000
      .then(function (value) {
        grunt.log.writeln('Result (' + Promise.gruntPromiseLibraryName + '):', value);  // Result: 50000
      })
    ;
  });

  // Register simple tasks for the "Task Execution Order" test.
  grunt.registerTask('test-before', grunt.log.writeln.bind(grunt.log, 'before finished'));
  grunt.registerTask('test-after', grunt.log.writeln.bind(grunt.log, 'after finished'));

  // Register "default" and "test" tasks.
  grunt.registerTask('test', ['eslint', 'nodeunit']);
  grunt.registerTask('default', ['test']);

};
