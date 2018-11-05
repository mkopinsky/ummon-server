const { test } = require('tap');

const ummon = require('..')({ pause: true, autoSave: false, tasksPath: null });
const worker = require('../lib/worker.js');
const run = require('../lib/run.js');


//                Add a task to the list!
// - - - - - - - - - - - - - - - - - - - - - - - - -
//
const sampleTask = run({
  command: 'echo $TERM Finished',
  env: { TERM: 'dumb' },
});

test('Test successfully running code with a worker', function (t) {
  t.plan(2);

  const sleep = worker(sampleTask, ummon);

  t.type(sleep.pid, 'number', 'There is a pid that is a number');

  ummon.once('worker.complete', function (task) {
    t.equal(task.exitCode, 0, 'The task runs and returns it\'s exit code of 0');
    t.end();
  });
});


// The test doesn't exit because of something the worker is doing.
test('teardown', function (t) {
  setImmediate(function () {
    process.exit();
  });
  t.end();
});
