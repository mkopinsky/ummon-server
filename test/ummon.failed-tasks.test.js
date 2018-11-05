const { test } = require('tap');
const async = require('async');

const ummon = require('..')({ autoSave: false });

let taskRunId;

test('Trigger proper tasks on failure', function (t) {
  t.plan(14);

  ummon.on('queue.new', function (run) {
    t.ok(true, 'The queue.new emitter was emited');

    if (run.task.name === 'goodbye') {
      t.ok(run.task, 'goodbye is added to the queue');
      taskRunId = run.id;
    }

    if (run.task.name === 'runMeOnErrors') {
      t.ok(run.task, 'runMeOnErrors is added to the queue');
      t.equal(run.task.command, `echo ${taskRunId} failed`, 'The tasks command is dynamically updated');
    }
  });

  ummon.on('worker.complete', function (run) {
    t.ok(run, 'The worker.complete event was emitted'); // Emitted twice for both tasks
    t.ok((run.task.name === 'goodbye' || run.task.name === 'runMeOnErrors'), 'The completed tasks are goodbye and runMeOnErrors');
  });

  async.series([
    function (callback) { ummon.createTask({ name: 'goodbye', command: 'echo goodbye && exit 1' }, callback); },
    function (callback) { ummon.createTask({ name: 'runMeOnErrors', command: 'echo <%= run.triggeredBy.id %> failed', trigger: { afterFailed: '*' } }, callback); },
    function (callback) { ummon.createTask({ name: 'adios', command: 'echo adios && exit 1' }, callback); },
  ],
  function (err) {
    t.ok(ummon.tasks['ummon.goodbye'], 'There is a goodbye task');
    t.ok(ummon.tasks['ummon.runMeOnErrors'], 'There is a runMeOnErrors task');
    // console.log(ummon.getTaskReferences('ummon.goodbye', 'error'));
    t.equal(ummon.getTaskReferences('ummon.goodbye', 'error')[0], 'ummon.runMeOnErrors', 'ummon.runMeOnErrors will be triggered by a failing goodbye');
    t.equal(ummon.getTaskReferences('ummon.adios', 'error')[0], 'ummon.runMeOnErrors', 'ummon.runMeOnErrors will be triggered by a failing adios, even though it was created after runMeOnErrors');
    t.deepEqual(ummon.getTaskReferences('ummon.runMeOnErrors', 'error'), [], 'ummon.runMeOnErrors should not trigger anything');

    ummon.runTask('goodbye', function (q) {});
  });
});

test('teardown', function (t) {
  setImmediate(function () {
    process.exit();
  });
  t.end();
});
