/**
 * Utility methods for the "grunt-promise" NPM module.
 *
 * The MIT License (MIT)
 * Copyright (c) 2016 Mark Carver
 *
 * @extends util
 */
(function (exports, native) {
  'use strict';

  var eol = require('os').EOL;
  var grunt = require('grunt');
  var path = require('path');
  var util = require('util');

  // Extend our utility module from node's utility module.
  util._extend(exports, util);

  /**
   * Identifies the "library" name of the native Promise object.
   *
   * @see exports.getPromise
   *
   * @type {String}
   */
  if (native) {
    native.gruntPromiseLibraryName = 'native';
  }

  /**
   * The currently loaded Promise object.
   *
   * @type {Object<Promise>|Function<Promise>}
   */
  exports.current = null;

  /**
   * Cache of loaded Promise objects.
   *
   * @type {Object}
   */
  exports.loaded = {
    native: native
  };

  /**
   * Contains a list of supported Promise API libraries/node modules.
   *
   * @return {Array}
   */
  exports.supportedModules = ['bluebird', 'q', 'promise', 'es6-promise'];

  /**
   * Indicate that grunt-promise was unable to load a Promise object.
   *
   * @param {*} name
   *   The name or object of the Promise library that was attempting to load.
   */
  exports.fail = function (name) {
    var lines = [];
    if (typeof name === 'function') {
      lines.push('grunt-promise was unable to load a valid Promise object.');
      lines.push(name);
    }
    else if (name) {
      lines.push('grunt-promise was unable to load the ' + JSON.stringify(name) + ' Promise object.');
    }
    else {
      lines.push('grunt-promise was not able to load a Promise object.');
    }
    lines.push('');
    lines.push('grunt-promise officially supports the following NPM packages:');
    lines.push(this.suggest());
    grunt.fail.fatal(new Error(lines.join(eol)));
  };

  exports.getModuleName = function (obj) {
    var loopChildren = function (obj, children) {
      var child;
      var i;
      var ret;
      for (i in children) {
        if (!children.hasOwnProperty(i)) {
          continue;
        }
        child = children[i];
        if (obj === child.exports) {
          return child.id;
        }
        else if (child.children.length) {
          ret = loopChildren(obj, child.children);
          if (ret) {
            return ret;
          }
        }
      }
      return ret;
    };
    var filepath = loopChildren(obj, require.cache);
    if (filepath) {
      var parts = filepath.split(path.sep + 'node_modules' + path.sep);
      var file = parts.pop();
      var name = file.split(path.sep).shift();
      var dir = path.join(parts.join(path.sep + 'node_modules' + path.sep), 'node_modules', name);
      try {
        return require(path.join(dir, 'package')).name;
      }
      catch (e) {
        // Intentionally left empty.
      }
    }
  };

  /**
   * Retrieves a Promise object from a node module.
   *
   * @param {String|Function|Object} [library]
   *   The name of the node module to load, or an existing loaded node module.
   *
   * @return {Object<Promise>|Boolean}
   *   A Promise object or FALSE if no Promise object could be loaded.
   */
  exports.getPromise = function (library) {
    var module;
    var Promise = null;

    // Immediately return if requesting the native promise.
    if (library === 'native' || library === this.loaded.native) {
      Promise = this.loaded.native;
      library = 'native';
    }
    // Module export function.
    else if (typeof library === 'function' && this.isThenable(library, true)) {
      Promise = library;
      library = this.getModuleName(library) || 'custom';
    }
    // Callback function.
    else if (typeof library === 'function') {
      var ret = library.call(this);
      // Ensure returned Promise object is "thenable".
      if (this.isThenable(ret, true)) {
        Promise = ret;
        library = this.getModuleName(ret) || 'custom';
      }
      else {
        library = Promise;
        Promise = false;
      }
    }

    // Module export object.
    if (!Promise && typeof library === 'object') {
      module = library;
      library = this.getModuleName(library) || 'custom';
    }

    // By this point, the library should have resolved to a string.
    if (typeof library !== 'string') {
      this.fail(library);
    }

    // Return if the Promise object is already loaded.
    if (this.loaded[library]) {
      return this.loaded[library];
    }

    // Otherwise, attempt to load the node module.
    grunt.verbose.write(('Loading "' + library + '" Promise object...').magenta);
    try {
      if (!module) {
        module = require(library);
      }
      // Find a "thenable" Promise object from the module.
      [module, module.Promise].forEach(function (obj) {
        Promise = Promise || (obj && this.isThenable(obj, true) && obj);
      }.bind(this));
      grunt.verbose[Promise ? 'ok' : 'error']();
    }
    catch (e) {
      grunt.verbose.error(e);
    }

    // If the code has made it this far, it means that this is a valid Promise
    // object. Include the name of the loaded module so consumers can know
    // which Promise object is associated with which node module. Note: this
    // is mostly only ever needed if loading a Promise object when no specific
    // module was specified (e.g. automatic).
    if (Promise) {
      Promise.gruntPromiseLibraryName = library;
    }

    // Cache the loaded promise.
    this.loaded[library] = Promise;

    return Promise;
  };

  /**
   * Determines if an object is "thenable" (aka. Promise object).
   *
   * An object must have a "then" function or method for it to be considered
   * "thenable".
   *
   * @param {Promise|Object|Function} Obj
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
    if (typeof Obj !== 'function' && typeof Obj !== 'object') {
      return false;
    }
    var then = Obj.then || create && typeof Obj === 'function' && new Obj(function () {}).then;
    return typeof then === 'function';
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
   * @return {Array}
   *   An array containing: name, info and a promised fn task.
   */
  exports.parseArgs = function (name, info, fn) {
    // If optional "info" string is omitted, shuffle arguments a bit.
    if (!fn) {
      fn = info;
      info = null;
    }
    if (typeof fn !== 'function') {
      grunt.fail.fatal(new Error('The "fn" argument for grunt.registerPromise or grunt.registerMultiPromise must be a function.'));
    }
    return [name, info, this.promiseTask(fn)];
  };

  /**
   * Wraps a task and then resolves a promised version of it upon execution.
   *
   * @param {function} fn
   *   A task function.
   *
   * @return {function(this:grunt.task.current)}
   *   The new promise wrapped task function.
   */
  exports.promiseTask = function (fn) {
    var self = this;
    return function () {
      var task = this;
      var done = task.async();
      var promise = fn.apply(task, task.args);
      if (!self.isThenable(promise)) {
        grunt.fail.warn('The task "' + task.nameArgs + '" must return a Promise.', grunt.fail.code.TASK_FAILURE);
      }
      var Promise = require('../').using();
      Promise.resolve(promise)
        .catch(function (err) {
          grunt.fail.warn(err, grunt.fail.code.TASK_FAILURE);
        })
        .then(done);
    };
  };

  /**
   * Provides a list of suggested NPM packages to install.
   *
   * @param {number} [limit=3]
   *   Whether or not to limit the list to a certain number of packages.
   *
   * @return {string}
   *   A list of suggested NPM packages to install.
   */
  exports.suggest = function (limit) {
    var suggestions = [].concat(this.supportedModules);
    if (limit) {
      suggestions = suggestions.slice(0, limit);
    }
    suggestions[0] += ' (recommended)';
    return '  - https://www.npmjs.com/package/' + suggestions.join(eol + '  - https://www.npmjs.com/package/');
  };

})(module.exports, Promise && Promise.toString() === 'function Promise() { [native code] }' && Promise);
