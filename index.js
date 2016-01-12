/**
 * The "grunt-promise" NPM module.
 *
 * The MIT License (MIT)
 * Copyright (c) 2016 Mark Carver
 */
(function (module) {
  "use strict";

  var grunt = require('grunt');

  /**
   * @module module:grunt-promise
   */
  var libraries = module.exports = require('./lib/libraries');

  /**
   * Wraps a task and then resolves a promised version of it upon execution.
   *
   * @param {function} fn
   *   A task function.
   *
   * @returns {function}
   *   The new promise wrapped task function.
   */
  var promiseTask = function (fn) {
    return function () {
      var done = this.async();
      var promise = fn.apply(this, this.args);
      if (!libraries.isThenable(promise)) {
        grunt.fail.warn('The task "' + this.nameArgs + '" must return a Promise.', grunt.fail.code.TASK_FAILURE);
      }
      libraries.load().resolve(promise)
        .catch(function (err) {
          grunt.fail.warn(err, grunt.fail.code.TASK_FAILURE);
        })
        .then(done);
    };
  };

  /**
   * Parses arguments to ensure they can be used for promised based tasks.
   *
   * @param {string} name
   *   The name of the Grunt task to register.
   * @param {string|function} [info]
   *   (Optional) Descriptive text explaining what the task does. Shows up on
   *   `--help`. You may omit this argument and replace it with `fn` instead.
   * @param {function} [fn]
   *   (Required) The task function. Remember not to pass in your Promise
   *   function directly. Promise resolvers are immediately invoked when they
   *   are created. You should wrap the Promise with an anonymous task function
   *   instead.
   *
   * @returns {Array}
   *   An array containing: name, info and a promised fn task.
   */
  var parseArgs = function (name, info, fn) {
    // If optional "info" string is omitted, shuffle arguments a bit.
    if (!fn) {
      fn = info;
      info = null;
    }
    if (typeof fn !== 'function') {
      grunt.fail.fatal(new Error('The "fn" argument for grunt.registerPromise or grunt.registerMultiPromise must be a function.'));
    }
    return [name, info, promiseTask(fn)];
  };

  /**
   * Registers a new promise based Grunt task.
   *
   * @param {string} name
   *   The name of the Grunt task to register.
   * @param {string|function} [info]
   *   (Optional) Descriptive text explaining what the task does. Shows up on
   *   `--help`. You may omit this argument and replace it with `fn` instead.
   * @param {function} [fn]
   *   (Required) The task function. Remember not to pass in your Promise
   *   function directly. Promise resolvers are immediately invoked when they
   *   are created. You should wrap the Promise with an anonymous task function
   *   instead.
   *
   * @memberOf grunt
   *
   * @returns {object}
   *   The task object.
   */
  grunt.registerPromise = function (name, info, fn) {
    return grunt.task.registerTask.apply(grunt.task, parseArgs(name, info, fn));
  };

  /**
   * @memberOf grunt.task
   */
  grunt.task.registerPromise = grunt.registerPromise.bind(grunt.task);

  /**
   * Registers a new promise based Grunt multi-task.
   *
   * @param {string} name
   *   The name of the Grunt task to register.
   * @param {string|function} [info]
   *   (Optional) Descriptive text explaining what the task does. Shows up on
   *   `--help`. You may omit this argument and replace it with `fn` instead.
   * @param {function} [fn]
   *   (Required) The task function. Remember not to pass in your Promise
   *   function directly. Promise resolvers are immediately invoked when they
   *   are created. You should wrap the Promise with an anonymous task function
   *   instead.
   *
   * @memberOf grunt
   *
   * @returns {object}
   *   The task object.
   */
  grunt.registerMultiPromise = function (name, info, fn) {
    return grunt.task.registerMultiTask.apply(grunt.task, parseArgs(name, info, fn));
  };

  /**
   * @memberOf grunt.task
   */
  grunt.task.registerMultiPromise = grunt.registerMultiPromise.bind(grunt.task);

})(module);
