/**
 * Tests for the "grunt-promise" NPM module.
 *
 * The MIT License (MIT)
 * Copyright (c) 2016 Mark Carver
 */
(function () {
  'use strict';

  var eol = require('os').EOL;
  var grunt = require('grunt');

  // This test's Promise library (bluebird).
  var gruntPromise = require('../');
  var bluebird = require('bluebird');
  var Promise = gruntPromise.using(bluebird);


  // Project's internal utilities (for testing).
  var util = require('../lib/util');

  // Custom asserts.
  var assert = require('nodeunit').assert;
  assert.printed = function (result, expected, message) {
    return assert.ok(result.stdout.indexOf(expected) !== -1, message);
  };

  var header = function (str) {
    str = '[' + str + ']';
    return String(str + '               ').slice(0, 15) + ' ';
  };

  // Returns a promise for spawning a grunt task.
  var runTask = function (args) {
    var spawn = Promise.promisify(grunt.util.spawn);
    return spawn({
      grunt: true,
      args: args,
      fallback: ''
    });
  };

  // The tests.
  var tests = {};

  tests[header('automatic') + 'First available Promise object is "bluebird"'] = function (test) {
    test.expect(1);

    // Reset.
    var current = util.current;
    util.current = null;

    var _promise = gruntPromise.using();
    test.ok(new _promise(function () {}) instanceof bluebird);

    // Restore.
    util.current = current;

    test.done();
  };

  tests[header('automatic') + 'Fallback Promise object is "native" (no modules)'] = function (test) {
    test.expect(1);

    // Reset.
    var current = util.current;
    util.current = null;
    var supported = util.supportedModules;
    util.supportedModules = [];

    var _promise = gruntPromise.using();
    test.ok(new _promise(function () {}) instanceof util.loaded.native);

    // Restore.
    util.current = current;
    util.supportedModules = supported;

    test.done();
  };

  // Test each supported Promise node module (plus "native").
  var modules = [].concat(util.supportedModules, 'native');
  modules.forEach(function (library) {
    var chainOutput = [
      'addition:value 1',
      'addition:value 2',
      'addition:value 3',
      'addition:value 4',
      'addition:value 5',
      'multiplication:value 50',
      'multiplication:value 500',
      'multiplication:value 5000',
      'multiplication:value 50000',
      'Result (' + library + '): 50000'
    ];
    tests[header(library) + 'Promise chain doesn\'t break'] = function (test) {
      test.expect(1);
      return runTask(['test-chaining', '--no-color', '--grunt-promise-library=' + library])
        .then(function (result) {
          test.printed(result, chainOutput.join(eol), 'Promise Chain');
          test.done();
        })
        .catch(grunt.fail.fatal);
    };
    tests[header(library) + 'Promised Grunt task executes in correct order'] = function (test) {
      test.expect(1);
      runTask(['test-before', 'test-chaining', 'test-after', '--no-color', '--grunt-promise-library=' + library]).then(function (result) {
        var before = ['Running "test-before" task', 'before finished', '', 'Running "test-chaining" task'];
        var after = ['', 'Running "test-after" task', 'after finished'];
        test.printed(result, [].concat(before, chainOutput, after).join(eol), 'Task Execution Order');
        test.done();
      });
    };

    tests[header(library) + 'Use an existing Promise object'] = function (test) {
      test.expect(1);
      var passed = library === 'native' ? util.loaded.native : require(library);
      var expected = util.getPromise(library);
      var Promise = gruntPromise.using(passed);
      var ret = new Promise(function () {
      });
      // Unfortunately, the q module obfuscates it's object instances and must
      // be tested using the module itself.
      // @todo get feedback from module maintainer to expand on this.
      if (library === 'q') {
        test.ok(passed.isPromise(ret));
      }
      else {
        test.ok(ret instanceof expected);
      }
      test.done();
    };
  });

  exports['grunt-promise'] = require('nodeunit').testCase(tests);

})();
