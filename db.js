// Though this is called db.js, right now the db is json files


/*!
 * Module dependancies
 */
const fs = require('fs');
const path = require('path');
const _ = require('underscore');
const glob = require('glob');
const async = require('async');
const mkdirp = require('mkdirp');


module.exports = function (ummon) {
  const db = {};

  /**
   * Load tasks out of a config file. This is a mess. Sorry
   */
  db.loadTasks = function (callback) {
    const self = this;
    glob(`${ummon.config.tasksPath}*.json`, function (err, files) {
      if (err || !files) {
        return callback(err);
      }

      ummon.log.info('Load tasks from %s', ummon.config.tasksPath);
      async.each(files, self.loadCollectionFromFile.bind(self), function (err) {
        callback(err);
      });
    });
  };


  db.loadCollectionFromFile = function (file, callback) {
    const self = this;
    let config;

    try {
      config = require(path.resolve(file));
    } catch (e) {
      return callback(e);
    }

    const keys = Object.keys(config);

    // Is there no 'collection' and 'name' keys? No 'tasks'? Then something is up.
    if (keys.indexOf('collection') === -1 || keys.indexOf('tasks') === -1) {
      return callback(new Error('Malformed tasks config file'));
    }

    ummon.createCollectionAndTasks(config, function (err) {
      callback(err);
    });
  };


  db.saveTasks = function (callback) {
    if (ummon.config.tasksPath) {
      const collections = ummon.getCollections();

      if (!fs.existsSync(ummon.config.tasksPath)) {
        mkdirp.sync(ummon.config.tasksPath);
      }

      // Keep track of the last save time
      ummon.lastSave = new Date().getTime();
      ummon.log.info(`Saving ${collections.length} collection(s) to file`, collections);
      async.each(collections, db.saveCollection, callback);
    }
  };


  /**
   * Remove data from tasks object that is not neccesary for the saved json file
   *
   * @param  {[type]} collection [description]
   * @return {[type]}            [description]
   */
  db.cleanCollectionMetaData = function (collection) {
    // This is gross but deep clone code feels gross too
    // TODO: Steam the json to the file and modify the stream
    collection = JSON.stringify(collection);
    collection = JSON.parse(collection);
    for (var index = 0; index < collection.length; index++) {
      for (var task in collection[index].tasks) {
        // Clean up duplicate data we don't need for this
        ['id', 'name', 'collection', 'recentExitCodes'].forEach(function (key) {
          delete collection[index].tasks[task][key];
        });
      }
    }

    return collection;
  };

  db.saveCollection = function (collection, callback) {
    ummon.getTasks(collection, function (err, result) {
      if (err) {
        return callback(err);
      }

      result = db.cleanCollectionMetaData(result);

      const resultStringified = JSON.stringify(result[0], null, '\t');

      fs.writeFile(`${ummon.config.tasksPath}/${collection}.tasks.json`, resultStringified, function (err) {
        callback(err);
      });
    });
  };

  return db;
};
