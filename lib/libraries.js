/**
 * The Promise library resolver for the "grunt-promise" NPM module.
 *
 * The MIT License (MIT)
 * Copyright (c) 2016 Mark Carver
 */

/**
 * @module module:grunt-promise/libraries
 */
(function (exports, native) {
  'use strict';

  var eol = require('os').EOL;
  var grunt = require('grunt');

  /**
   * Identifies the "library" name of the native Promise object.
   *
   * @see exports.getPromise
   *
   * @type {String}
   */
  native.gruntPromiseLibraryName = 'native';

  /**
   * Contains a list of supported Promise API libraries/node modules.
   *
   * @return {Array}
   */
  exports.supportedModules = ['bluebird', 'q', 'promise', 'es6-promise'];

  /**
   * The currently loaded Promise object.
   *
   * @type {Object<Promise>|Function<Promise>}
   */
  exports.Promise = null;

  /**
   * Cache of loaded Promise objects.
   *
   * @type {Object}
   */
  exports.promises = {
    native: native
  };

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

  /**
   * Retrieves a Promise object from a node module.
   *
   * @param {String} name
   *   The name of the node module to load.
   *
   * @return {Object<Promise>|Boolean}
   *   A Promise object or FALSE if no Promise object could be loaded.
   */
  exports.getPromise = function (name) {
    var module;
    var Promise = null;

    // Immediately fail if "name" is not a string.
    if (typeof name !== 'string') {
      this.fail(name);
    }

    // Immediately return if Promise object is already loaded.
    if (this.promises[name]) {
      return this.promises[name];
    }

    // Attempt to load the node module.
    grunt.verbose.write(('Loading "' + name + '" Promise object...').magenta);
    try {
      module = require(name);
      // Find a "thenable" Promise object from the module.
      [module.Promise, module.defer, module.Deferred, module].forEach(function (obj) {
        Promise = Promise || (obj && this.isThenable(obj, true) && obj);
      }.bind(this));
      grunt.verbose[Promise ? 'ok' : 'error']();
    }
    catch (e) {
      grunt.verbose.error();
    }

    if (!Promise) {
      return false;
    }

    // If the code has made it this far, it means that this is a valid Promise
    // object. Include the name of the loaded module so consumers can know
    // which Promise object is associated with which node module. Note: this
    // is mostly only ever needed if loading a Promise object when no specific
    // module was specified (e.g. dynamic). The "native" Promise object will
    // not have this property.
    Promise.gruntPromiseLibraryName = name;

    // Cache the loaded promise.
    this.promises[name] = Promise;

    return Promise;
  };

  /**
   * Determines if an object is "thenable" (aka. Promise object).
   *
   * An object must have a "then" function or method for it to be considered
   * "thenable".
   *
   * @param {Object|Function} Obj
   *   An object or function.
   * @param {Boolean} create
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
    var then = Obj.then || create && new Obj(function () {}).then;
    return typeof then === 'function';
  };

  /**
   * Loads a Promise library/object.
   *
   * @param {String|Function} [library]
   *   The name of the Promise API library/node module to load. It can
   *   also be a callback to execute. If left empty, it will attempt to find
   *   the first available NPM package node module installed.
   *
   * @return {object<Promise>|function<Promise>}
   *   A Promise object
   */
  exports.load = function (library) {
    // Allow a library to be specified as an option on the CLI.
    if (!library) {
      library = grunt.option('grunt-promise-library');
    }

    // Immediately return if there is already a Promise object loaded and no
    // specific library was specified by the user.
    if (!library && this.Promise) {
      return this.Promise;
    }

    var Promise;

    // Don't load the list of supported modules to iterate over if a specific
    // module/library was specified by the user.
    var modules = library ? [] : [].concat(this.supportedModules);

    // Allow an explicit Promise library/module to be used.
    if (library) {
      // If a library was specified other than "native", then don't allow
      // it to fallback to the native Promise object.
      if (library !== 'native') {
        this.promises.native = false;
      }

      // Callback.
      if (typeof library === 'function') {
        Promise = library.apply(this);
        // Add a returned string to the modules list.
        if (typeof Promise === 'string') {
          library = Promise;
          Promise = false;
        }
        // Ensure returned Promise object is "thenable".
        else if (!this.isThenable(Promise, true)) {
          this.fail(Promise);
        }
      }

      // Add the library to the modules array.
      if (!Promise) {
        modules.push(library);
      }
    }

    // Attempt to dynamically load first available promise object.
    modules.forEach(function (name) {
      Promise = Promise || this.getPromise(name);
    }.bind(this));

    if (!Promise) {
      if (library) {
        this.fail(library);
      }
      else {
        if (!this.promises.native) {
          this.fail();
        }
        Promise = this.promises.native;
      }
    }

    // Cache the currently loaded Promise object.
    this.Promise = Promise;

    return Promise;
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
