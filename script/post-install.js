#!/usr/bin/env node
'use strict';
var p = require('../lib/promise')();

// Retrieve the list of promise library support.
var libraries = p.info();

// Determine if there is native promise support.
var native = !!libraries.native();

// Remove the native "library" from the list.
delete libraries.native;

// Check if an existing NPM promise library is installed.
var installed = false;
var modules = Object.keys(libraries);
modules.forEach(function (name) {
  if (installed) return;
  try { installed = require(name); }
  catch (e) {}
});

// No NPM modules are installed, inform the user.
if (!installed) {
  var color = process.argv.indexOf('--no-color') === -1;
  var reset = color ? '\x1b[0m' : '';
  if (native) {
    var yellow = color ? '\x1b[33m' : '';
    console.warn(yellow + 'NOTE: grunt-promise is using the native Promise API in Node.js. This may cause performance issues and lack certain features.');
    console.warn('It is highly recommended that you install, in addition to, one of the following NPM promise libraries to replace it:'+ reset);
  }
  else {
    var red = color ? '\x1b[31m' : '';
    console.error(red + 'WARNING: Node.js does not have a native Promise API; grunt-promise WILL NOT WORK');
    console.error('You will continue receiving errors until one of the following NPM promise libraries is installed:' + reset);
  }
  console.log(p.suggestion());
}
