# grunt-promise [![Build Status](https://travis-ci.org/unicorn-fail/grunt-promise.svg)](https://travis-ci.org/unicorn-fail/grunt-promise)

[![Join the chat at https://gitter.im/unicorn-fail/grunt-promise](https://badges.gitter.im/unicorn-fail/grunt-promise.svg)](https://gitter.im/unicorn-fail/grunt-promise?utm_source=badge&utm_medium=badge&utm_campaign=pr-badge&utm_content=badge)

> Create asynchronous Grunt tasks using Promises.

## Getting Started

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
detected, it defaults to using V8's native Promise object.

**Note: This plugin does NOT depend on any Promise based NPM modules.**

You, of course, are not limited in using any of these modules, they are simply
supported "out-of-the-box". For customization and other Promise solutions, see
below.

* [bluebird](https://www.npmjs.com/package/bluebird) (recommended)
* [q](https://www.npmjs.com/package/q)
* [promise](https://www.npmjs.com/package/promise)
* [es6-promise](https://www.npmjs.com/package/es6-promise)
* [node-promise](https://www.npmjs.com/package/node-promise) (likely to be removed)
* _native_ - V8 Promise API (node >= 0.12)

## Usage

Require the plugin's NPM module at the top and pass the `grunt` instance. It will
return the first available Promise object from the node environment. You can use
this Promise object to create new Promises, as you will see below.

```js
// Gruntfile.js
module.exports = function (grunt) {
  var Promise = require('grunt-promise')(grunt);

  // Continue your grunt initialization as normal.
  grunt.initConfig({...});
}
```

## Optional - Choose Promise library/object

There are several ways to override which Promise library/object will be returned
from the plugin:

1. Pass an additional `library` parameter when requiring the plugin. This can
   parameter can be be `string|function`:

   `string`: You can pass any NPM module name here and it will automatically
   require the module for you. If it's one of the supported modules, the plugin
   will automatically return the correct object/method that's needed to create
   promises.
   ```js
   var Promise = require('grunt-promise')(grunt, 'my-custom-npm-module');
   //                                            ^ Here ----------------
   ```
   `function`: In more advanced use cases, you can instead, pass a function that
   returns a Promise object. This is sometimes necessary in cases where a method
   on the object needs to be returned instead of the object itself.
   ```js
   var Promise = require('grunt-promise')(grunt, function () {
     return require('my-custom-promise').Promise;
   });
   ```
2. Grunt Option - The following option is available where some use cases may
   require a little bit of CLI love. In which case, you can use:
   ```shell
   grunt --grunt-promise-library=<module>
   ```
   Where `<module>` is an NPM Promise based module. You may also specify
   `native` here.

## Available Grunt Methods

This plugin provides two new methods on the main `grunt` object that help save
a little bit of time and whitespace. It's worth noting that you do not have to
call `this.async()` inside these tasks (which is the whole point for this plugin).
Just make sure that you return a Promise object.

* `grunt.registerPromise(name, info, fn)` - Normal task
* `grunt.registerMultiPromise(name, info, fn)` - Multi task

Arguments:

* `{string} name` - The name of the Grunt task to register.
* `{string|function} info` - _(Optional)_ Descriptive text explaining what the
  task does. Shows up on `--help`. You may omit this argument and replace it with
  `fn` instead.
* `{function} fn` - _(Required)_ The task function. Remember not to pass in your
  Promise function directly. Promise resolvers are immediately invoked when
  they are created. You should wrap the Promise with an anonymous task function
  instead.

**Examples:**
```js
module.exports = function (grunt) {
  var Promise = require('grunt-promise')(grunt);

  // Registers a task for a Promise.
  grunt.registerPromise('my-promise', function () {
    return myPromise()
      .then(someAyncFunction)
      .then(anotherAyncFunction)
      .then(function (value) {
        grunt.log.writeln('Value:', value);
      })
      .catch(function (e) {
         // Do something with your errors.
         // It's not entirely necessary to implement this. This plugin
         // already appends the necessary catch/then handlers to properly
         // fail or end the async task.
      })
    ;
  });

  // Register a task for a new Promise (working example).
  grunt.registerPromise('timeout', function () {
    return new Promise(function (resolve) {
      setTimeout(function () {
        resolve('Hello World!');
      }, 1000); // 1 second
    }).then(grunt.log.write);
  });
}
```

## Creator

**Mark Carver**

* <https://twitter.com/mark_carver>
* <https://github.com/markcarver>

## Copyright and license

Code and documentation Copyright 2016 Mark Carver. Released under [the MIT license](https://github.com/unicorn-fail/grunt-promise/blob/master/LICENSE-MIT).
