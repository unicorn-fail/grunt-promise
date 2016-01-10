/**
 * The "grunt-promise" module.
 *
 * @param grunt
 *   The current grunt instance.
 * @param library
 *   A specific NPM module that implements a promise library. You can also
 *   specify "native" to use the native V8 Promise API in Node.js.
 *
 * @returns {Promise}
 */
module.exports = function (grunt, library) {
  'use strict';

  // Load a proper promise object.
  var Promise = require('./lib/promise')(grunt).load(library || grunt.option('grunt-promise-library'));

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
      Promise.resolve(fn.apply(this, this.args))
        .catch(function (err) {
          grunt.fail.warn(err, grunt.fail.code.TASK_FAILURE);
          done(false);
        })
        .then(done)
      ;
    };
  };

  /**
   * Parses arguments to ensure they can be used for promised based tasks.
   *
   * @param {string} name
   *   The name of the grunt task to register.
   * @param {string|Array|function} [info]
   *   (optional) Descriptive text explaining what the task does. Shows up on
   *   --help. Or if no info is passes, the fn argument takes this position.
   * @param {function|Array} [fn]
   *   (optional) A task function or an array of task names to be ran when
   *   executed.
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
    if (!fn) {
      fn = function () {};
    }
    if (typeof fn !== 'function') {
      grunt.fail.fatal(new Error('The callback provided must be a function.'));
    }
    return [name, info, promiseTask(fn)];
  };

  /**
   * Registers a new promise based Grunt task.
   *
   * @param {string} name
   *   The name of the grunt task to register.
   * @param {string|Array|function} [info]
   *   (optional) Descriptive text explaining what the task does. Shows up on
   *   --help. Or if no info is passes, the fn argument takes this position.
   * @param {function|Array} [fn]
   *   (optional) A task function or an array of task names to be ran when
   *   executed.
   *
   * @returns {object}
   *   The task object.
   */
  grunt.registerPromise = function (name, info, fn) {
    return grunt.registerTask.apply(grunt, parseArgs(name, info, fn));
  };

  /**
   * Registers a new promise based Grunt multi-task.
   *
   * @param {string} name
   *   The name of the grunt task to register.
   * @param {string|Array|function} [info]
   *   (optional) Descriptive text explaining what the task does. Shows up on
   *   --help. Or if no info is passes, the fn argument takes this position.
   * @param {function|Array} [fn]
   *   (optional) A task function or an array of task names to be ran when
   *   executed.
   *
   * @returns {object}
   *   The task object.
   */
  grunt.registerMultiPromise = function (name, info, fn) {
    return grunt.registerMultiTask.apply(grunt, parseArgs(name, info, fn));
  };

  return Promise;
};
