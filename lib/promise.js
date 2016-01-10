var native = Promise && Promise.toString() === 'function Promise() { [native code] }' && Promise;

module.exports = function (grunt) {
  'use strict';
  var eol = require('os').EOL;

  var info = function (native) {
    var libraries = {
      'bluebird': function (name) {
        var promise = require(name);
        // Fail on any unhandled rejections.
        process.on('unhandledRejection', function(e) {
          grunt.fail.warn(e, grunt.fail.code.TASK_FAILURE);
        });
        return promise;
      },
      'q': function (name) {
        return require(name).Promise;
      },
      'promise': function (name) {
        return require(name);
      },
      'es6-promise': function (name) {
        return require(name).Promise;
      },
      'node-promise': function (name) {
        return require(name).deferred;
      },
      native: function () {
        if (!native) throw new Error('Native Promise API does not exist.');
        return native;
      }
    };
    if (native === false) delete libraries.native;
    return libraries;
  };

  var load = function (name) {
    var libraries = info();

    /** @type {Promise} */
    var Promise;

    // Allow an explicitly specified module to be used.
    if (name) {
      if (typeof name === 'function') {
        libraries.custom = name;
        name = 'custom (function)';
      }
      else if (!libraries[name]) {
        libraries[name] = function () {
          return require(name);
        };
      }
      else {
        var library = libraries[name];
        libraries = {};
        libraries[name] = library;
      }
    }

    // Attempt to dynamically load first available promise object.
    var names = name && [name] || Object.keys(libraries);
    names.forEach(function (name) {
      // If promise object is already loaded, skip.
      if (Promise) return;

      try {
        grunt.verbose.write(('Attempting to use "' + name + '" promises...').magenta);
        Promise = libraries[name](name);
        grunt.verbose.writeln('success!'.magenta);
      }
      catch (e) {
        grunt.verbose.writeln('not available.'.magenta);
      }
    });

    if (!Promise) {
      delete libraries.native;
      if (!native) {
        grunt.log.error('Please install one of the following NPM modules:' + eol + suggestion(true));
        grunt.fail.fatal(new Error('grunt-promise was unable to load any promise libraries.'));
      }
      Promise = native;
    }

    return Promise;
  };

  var suggestion = function (all) {
    var suggestions = Object.keys(info(false));
    if (!all) suggestions = suggestions.slice(0, 3);
    suggestions[0] += ' (recommended)';
    return '  - ' + suggestions.join(eol + '  - ');
  };

  return {
    info: info,
    load: load,
    suggestion: suggestion
  };
};

