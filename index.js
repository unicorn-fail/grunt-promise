/**
 * The "grunt-promise" NPM module.
 *
 * The MIT License (MIT)
 * Copyright (c) 2016 Mark Carver
 *
 * @module module:grunt-promise
 */
(function (exports, native) {
  'use strict';

  var grunt = require('grunt');
  var util = require('./lib/util');

  /**
   * Determines if an object is "thenable" (aka. Promise object).
   *
   * An object must have a "then" function or method for it to be considered
   * "thenable".
   *
   * @param {Object|Function} Obj
   *   An object or function.
   * @param {Boolean} [create]
   *   Flag indicating whether this method should attempt to create a new
   *   Promise and check for a "then" method.
   *
   * @return {Boolean}
   *   TRUE or FALSE
   *
   * @see https://promisesaplus.com/#point-7
   */
  exports.isThenable = function (Obj, create) {
    return util.isThenable.apply(util, [Obj, create]);
  };

  /**
   * Loads a Promise library/object.
   *
   * @deprecated since v1.1.0.
   *
   * @return {object<Promise>|function<Promise>|Boolean}
   *   A Promise object or FALSE if unable to load.
   *
   * @see exports.using
   */
  exports.load = util.deprecate(function () {
    return exports.using.apply(this, arguments);
  }, 'The grunt-promise "load" method is deprecated and has been renamed to "using".');

  /**
   * Loads a Promise library/object.
   *
   * @param {String|Function|Object} [library]
   *   The name of the Promise API library/node module to load. It can
   *   also be a callback to execute. If left empty, it will attempt to find
   *   the first available NPM package node module installed.
   *
   * @return {object<Promise>|function<Promise>|Boolean}
   *   A Promise object or FALSE if unable to load.
   */
  exports.using = function (library) {
    var Promise;

    // Allow a library to be specified as an option on the CLI.
    if (!library) {
      library = grunt.option('grunt-promise-library');
    }

    // Immediately return if there is already a Promise object loaded and no
    // specific library was specified by the user.
    if (!library && util.current) {
      return util.current;
    }

    // Allow an explicit Promise library/module to be used.
    if (library) {
      Promise = util.getPromise(library);
      if (!Promise) {
        util.fail(library);
      }
      return Promise;
    }

    // Attempt to dynamically load first available supported promise object.
    util.supportedModules.forEach(function (name) {
      Promise = Promise || util.getPromise(name);
    });

    if (!Promise) {
      if (library) {
        util.fail(library);
      }
      else {
        if (!util.loaded.native) {
          util.fail();
        }
        Promise = util.loaded.native;
      }
    }

    // Cache the currently loaded Promise object.
    util.current = Promise;

    return Promise;
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
   * @return {object}
   *   The task object.
   */
  grunt.registerPromise = function (name, info, fn) {
    return grunt.registerTask.apply(grunt.task, util.parseArgs(name, info, fn));
  };

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
   * @return {object}
   *   The task object.
   */
  grunt.registerMultiPromise = function (name, info, fn) {
    return grunt.registerMultiTask.apply(grunt.task, util.parseArgs(name, info, fn));
  };

})(module.exports, Promise && Promise.toString() === 'function Promise() { [native code] }' && Promise);
