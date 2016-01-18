#!/usr/bin/env node

/**
 * The post-install script for the "grunt-promise" NPM module.
 *
 * The MIT License (MIT)
 * Copyright (c) 2016 Mark Carver
 */
(function () {
  'use strict';
  var libraries = require('../lib/libraries');

  // Determine if there is native promise support.
  var native = !!libraries.promises.native;

  // Check if an existing NPM promise library is installed.
  var installed = false;
  libraries.supportedModules.forEach(function (name) {
    installed = installed || !!libraries.load(name);
  });

  // No NPM modules are installed, inform the user.
  if (!installed) {
    var color = process.argv.indexOf('--no-color') === -1;
    var reset = color ? '\x1b[0m' : '';
    if (native) {
      var yellow = color ? '\x1b[33m' : '';
      console.warn(yellow + 'NOTE: grunt-promise is using the native Promise API in Node.js. This may cause performance issues and lack certain features.');
      console.warn('It is highly recommended that you install, in addition to, one of the following NPM packages to replace it:' + reset);
    }
    else {
      var red = color ? '\x1b[31m' : '';
      console.error(red + 'WARNING: Node.js does not have a native Promise API; grunt-promise WILL NOT WORK');
      console.error('You will continue receiving errors until one of the following NPM packages is installed:' + reset);
    }
    console.log(libraries.suggest());
  }
})();
