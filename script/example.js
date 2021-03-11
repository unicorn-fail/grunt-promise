/**
 * Example using the "grunt-promise" NPM module.
 *
 * The MIT License (MIT)
 * Copyright (c) 2016 Mark Halliwell
 */
(function () {
  'use strict';

  var grunt = require('grunt');

  // For the sake of this demo, the bluebird NPM package must explicitly use
  // "require" here so Tonic will parse and load the module. In your own code,
  // you can reduce this to one line and have the plugin automatically require
  // an NPM Promise module for you:
  //
  // var Promise = require('grunt-promise').using('bluebird');

  var bluebird = require('bluebird');
  var Promise = require('grunt-promise').using(bluebird);

  // Register a promised task (working example).
  grunt.registerPromise('timeout', function () {
    return new Promise(function (resolve) {
      setTimeout(function () {
        resolve('Hello World!');
      }, 1000); // 1 second
    }).then(console.log);
  });

  // Manually run grunt task.
  // DO NOT USE: This is only to get this example in tonic working.
  grunt.task.run('timeout');
  grunt.task.start();

})();
