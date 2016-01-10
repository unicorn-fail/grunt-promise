'use strict';

var eol = require('os').EOL;
var grunt = require('grunt');

// Project's internal promise object (for testing).
var p = require('../lib/promise')(grunt);
var info = p.info();
var libraries = Object.keys(info);

// Actual Promise library (bluebird).
var Promise = require('../')(grunt, 'bluebird');

// Custom asserts.
var assert = require('nodeunit').assert;
assert.printed = function (result, expected, message) {
  return assert.ok(result.stdout.indexOf(expected) !== -1, message);
};

// Returns a promise for spawning a grunt task.
var runTask = function (args) {
  return new Promise(function (resolve, reject) {
    grunt.util.spawn({
      grunt: true,
      args: args,
      fallback: ''
    }, function (e, result) {
      if (result.code !== 0) return reject(result.stderr);
      resolve(result);
    });
  });
};

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
  'Result: 50000'
];

// The tests.
var tests = {};

// Test each supported promise library.
libraries.forEach(function (library) {
  tests['Promise Chain (' + library + ')'] = function (test) {
    test.expect(1);
    return runTask(['test-chaining', '--no-color', '--grunt-promise-library=' + library])
      .then(function (result) {
        test.printed(result, chainOutput.join(eol), 'Promise Chain');
        test.done();
      })
      .catch(grunt.fail.fatal);
  };
});

tests['Task Execution Order'] = function (test) {
  test.expect(1);
  runTask(['test-before', 'test-chaining', 'test-after', '--no-color']).then(function (result) {
    var before = ['Running "test-before" task', 'before finished', '', 'Running "test-chaining" task'];
    var after = ['', 'Running "test-after" task', 'after finished'];
    test.printed(result, [].concat(before, chainOutput, after).join(eol), 'Task Execution Order');
    test.done();
  });
};

exports["grunt-promise"] = require('nodeunit').testCase(tests);
