'use strict';

var test = require("tap").test;

var ummon = require('..').create();
var worker = require('../lib/worker.js');
var run = require('../lib/run.js');


//                Add a task to the list!
// - - - - - - - - - - - - - - - - - - - - - - - - - 
// 
var sampleTask = run({
  "command": "sleep .1 && echo Finished"
});
 
test('Test successfully running code with a worker', function(t){
  t.plan(2);

  var sleep = worker(sampleTask, ummon);

  t.type(sleep.pid, "number", 'There is a pid that is a number');

  ummon.dispatcher.once('worker.complete', function(run){
    t.equal(run.exitCode, 0, 'The task runs and returns it\'s exit code of 0');
    t.end();
  });
});


// The test doesn't exit because of something the worker is doing. 
test('teardown', function(t){
  setImmediate(function() {
    process.exit();
  });
  t.end();
});