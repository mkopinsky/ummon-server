const test = require('tap').test;

const stream = require('stream');

const ummon = require('../lib/ummon')({ pause: true, autoSave: false });
const api = require('../api')(ummon);


const collection = {
  collection: 'barankay',
  defaults: {
    cwd: '/Users/matt/tmp/',
  },
  tasks: {
    'send-text-messages': {
      command: 'sh test.sh',
      cwd: '/Users/matt/tmp',
      trigger: {
        time: '* * * * *',
      },
    },
  },
};


test('Create new collection', function (t) {
  t.plan(4);

  const req = { params: { collection: collection.collection }, body: collection };
  const res = {};
  const next = function () {};

  res.json = function (status, json) {
    t.equal(status, 200, 'The status should be 200');
    t.equal(json.collections.length, 1, 'showTasks returns 1 collection');
    t.equal(json.collections[0].collection, 'barankay', 'There is an ummon collection');
    t.ok(json.collections[0].tasks, 'There tasks in the ummon collection');
  };

  api.setTasks(req, res, next);
});


test('Set a collections default settings', function (t) {
  t.plan(3);

  const req = { params: { collection: 'ummon' }, body: { cwd: '/home/matt' } };
  const res = {};
  const next = function () {};

  res.json = function (status, json) {
    t.equal(status, 200, 'The status should be 200');
    t.equal(json.collection, 'ummon', 'The collection returned should be ummon');
    t.equal(json.defaults.cwd, '/home/matt', 'The task command should be echo');
  };

  api.setCollectionDefaults(req, res, next);
});


test('Show a collections default settings', function (t) {
  t.plan(3);

  const req = { params: { collection: 'ummon' } };
  const res = {};
  const next = function () {};

  res.json = function (status, json) {
    t.equal(status, 200, 'The status should be 200');
    t.equal(json.collection, 'ummon', 'The collection returned should be ummon');
    t.equal(json.defaults.cwd, '/home/matt', 'The task command should be echo');
  };

  api.getCollectionDefaults(req, res, next);
});


test('Disable a collection', function (t) {
  t.plan(2);

  const req = { params: { collection: 'barankay' } };
  const res = {};
  const next = function () {};

  res.json = function (status, json) {
    t.equal(status, 200, 'The status should be 200');
    t.similar(json.tasksDisabled, ['barankay.send-text-messages'], 'Specific tasks should of been disabled');
  };

  api.disableCollection(req, res, next);
});


test('Enable a collection', function (t) {
  t.plan(2);

  const req = { params: { collection: 'barankay' } };
  const res = {};
  const next = function () {};

  res.json = function (status, json) {
    t.equal(status, 200, 'The status should be 200');
    t.similar(json.tasksEnabled, ['barankay.send-text-messages'], 'Specific tasks should of been enabled');
  };

  api.enableCollection(req, res, next);
});


test('teardown', function (t) {
  setImmediate(function () {
    process.exit();
  });
  t.end();
});
