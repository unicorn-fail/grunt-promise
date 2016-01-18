(function () {
  'use strict';

  var grunt = require('grunt');
  var Promise = require('grunt-promise').load();

  // Register a promised task (working example).
  grunt.registerPromise('timeout', function () {
    return new Promise(function (resolve) {
      setTimeout(function () {
        resolve('Hello World!');
      }, 1000); // 1 second
    }).then(console.log);
  });

  // Manually run grunt task.
  // DO NOT USE: This is only to get this example in tonic working.
  grunt.task.run('timeout');
  grunt.task.start({asyncDone: true});

})();
