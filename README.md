# grunt-promise [![Build Status](https://travis-ci.org/unicorn-fail/grunt-promise.svg)](https://travis-ci.org/unicorn-fail/grunt-promise)

[![Join the chat at https://gitter.im/unicorn-fail/grunt-promise](https://badges.gitter.im/unicorn-fail/grunt-promise.svg)](https://gitter.im/unicorn-fail/grunt-promise?utm_source=badge&utm_medium=badge&utm_campaign=pr-badge&utm_content=badge)

> Create asynchronous Grunt tasks using Promises.

## Getting Started

This package requires Node.js `^0.12`.
This package requires Grunt `^0.4.5`.

If you haven't used [Grunt](http://gruntjs.com/) before, be sure to check out the [Getting Started](http://gruntjs.com/getting-started) guide, as it explains how to create a [Gruntfile](http://gruntjs.com/sample-gruntfile) as well as install and use Grunt plugins. Once you're familiar with that process, you may install this plugin with this command:

## Install

```shell
npm install grunt-promise --save-dev
```

## Supported NPM Promise Packages

Below are a list of supported NPM modules that implement Promise APIs. The goal
of this plugin is to abstract the Grunt integration so it does not limit or
assume how one creates or consumes the Promises in a Grunt task; it merely
facilitates communication.

By default, this plugin will attempt to automatically detect if one of the NPM
modules below is already installed (order of appearance). If no NPM module is
detected, it defaults to using the native Promise object.

**Note: This plugin does NOT depend on any Promise based NPM modules.**

You, of course, are not limited in using any of these modules, they are simply
supported "out-of-the-box". For customization and other Promise solutions, see
below.

* [bluebird](https://www.npmjs.com/package/bluebird) (recommended)
* [q](https://www.npmjs.com/package/q)
* [promise](https://www.npmjs.com/package/promise)
* [es6-promise](https://www.npmjs.com/package/es6-promise)
* _native_ - Native Promise object

## Basic Usage

Require the plugin's NPM module at the top and call the `using` method with the
name of the Promise module you wish to use. If no module is specified, it will
attempt to load the first available Promise object in environment. You can use
this Promise object to create new Promises, see example below.

```js
// Gruntfile.js
var Promise = require('grunt-promise').using('bluebird');

module.exports = function (grunt) {
  // Continue your grunt initialization as normal.
  grunt.initConfig({...});
}
```

## Highly Recommended - Always specify an NPM module

It is highly recommended that you are always explicit when loading a Promise
object via this plugin to avoid confusion and any randomness if/when other NPM
modules may depend on a Promise library different from what you are expecting.

There are several ways to specify which Promise object will be returned from
this plugin:

1. Pass a NPM package name when loading the Promise object. This can
   either be a `string` or a `function` that returns a `string`. It will
   automatically require the module if not already loaded:

   ```js
   var Promise = require('grunt-promise').using('an-npm-promise-module');
   ```

   Or:

   ```js
   var Promise = require('grunt-promise').using(function () {
     return 'an-npm-promise-module';
   });
   ```

2. Pass an existing module (or create a new one). This must be a function that
   either creates a "thenable" Promise object or a plain object that has
   exported this constructor to a "Promise" method (e.g. `module.exports.Promise`):

   ```js
   var promiseModule = require('an-npm-promise-module');
   var Promise = require('grunt-promise').using(promiseModule);
   ```

   Or:

   ```js
   var Promise = require('grunt-promise').using(function () {
     return require('an-npm-promise-module');
   });
   ```

3. Grunt Option - The following option is available where some use cases may
   require a little bit of CLI love. In which case, you can use:

   ```shell
   grunt --grunt-promise-library=<module>
   ```

   Where `<module>` is an NPM package module. You may also specify `native` here.

## Available Grunt Methods

This plugin provides two new methods on the main `grunt` object that help save
a little bit of time and whitespace. It's worth noting that you do not have to
call `this.async()` inside these tasks (which is the whole point for this
plugin).

* `grunt.registerPromise(name, info, fn)` - Normal task
* `grunt.registerMultiPromise(name, info, fn)` - Multi task

Arguments:

* `{string} name` - The name of the Grunt task to register.
* `{string|function} info` - _(Optional)_ Descriptive text explaining what the
  task does. Shows up on `--help`. You may omit this argument and replace it with
  `fn` instead.
* `{function} fn` - _(Required)_ The task function. Remember not to pass in your
  Promise function directly. Promise resolvers are immediately invoked when
  they are created. You must wrap the Promise with an anonymous task function
  instead. The task function must return a Promise or it will fail.

**Examples:**
```js
var grunt = require('grunt');
var Promise = require('grunt-promise').using('bluebird');

// Register a promised task (working example).
// @see https://tonicdev.com/npm/grunt-promise
grunt.registerPromise('timeout', function () {
  return new Promise(function (resolve) {
    setTimeout(function () {
      resolve('Hello World!');
    }, 1000); // 1 second.
  }).then(grunt.log.write);
});

// Register a promised task (workflow example).
grunt.registerPromise('my-promise', function () {
  return promiseReturningFunction()
    .then(anotherPromise)
    .then(yetAnotherPromise)
    .then(function (value) {
      grunt.log.writeln('Value:', value);
    })
    .catch(function (e) {
       // Do something with your errors.
       // It's not entirely necessary to implement this. This plugin
       // already appends the necessary catch/then handlers to properly
       // fail or end the async task.
       grunt.fail.fatal(e);
    });
});
```

## Creator

**Mark Halliwell**

* <https://twitter.com/markehalliwell>
* <https://github.com/markhalliwell>

## Copyright and license

Code and documentation Copyright 2016 Mark Halliwell. Released under [the MIT license](LICENSE).
