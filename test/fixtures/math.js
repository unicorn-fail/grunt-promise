/**
 * Test fixture for the "grunt-promise" NPM module.
 *
 * The MIT License (MIT)
 * Copyright (c) 2016 Mark Halliwell
 */
(function (exports) {
  'use strict';

  var grunt = require('grunt');

  var initialValue = grunt.option('initial-value') || 0;
  var timeout = grunt.option('timeout') || 1;

  // Create a promise for increasing the value.
  exports.increase = function (value) {
    return new Promise(function (resolve) {
      setTimeout(function () {
        value++;
        grunt.log.writeln('addition:value', value);
        resolve(value);
      }, timeout);
    });
  };

  // Create a promise for multiplying the value.
  exports.multiply = function (value) {
    return new Promise(function (resolve) {
      setTimeout(function () {
        value *= 10;
        grunt.log.writeln('multiplication:value', value);
        resolve(value);
      }, timeout);
    });
  };

  // An "add" promise.
  exports.add = function () {
    return this.increase(initialValue)  // Expected value: 1
      .then(exports.increase)           // Expected value: 2
      .then(exports.increase)           // Expected value: 3
      .then(exports.increase)           // Expected value: 4
      .then(exports.increase)           // Expected value: 5
    ;
  };

})(module.exports);
