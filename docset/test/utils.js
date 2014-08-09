var fs = require('fs')
  , fs_extra = require('fs-extra')
  , docset = { paths: require('../lib/docset-paths') }
  , sqlite3 = require('sqlite3').verbose()
  , q = require('q')
  , utils = {};

//
utils.create = { valid: {} };
utils.create.valid.dashDocset = function(path, realDB, sql) {
  utils.remove(path);

  [ path,
    docset.paths.contents(path),
    docset.paths.resources(path),
    docset.paths.documents(path)
  ].forEach(function(path) {
    fs.mkdirSync(path);
  });

  fs.writeFileSync(docset.paths.Info.plist(path), utils.data.dashDocset.Info.plist);

  if (realDB) {
    var d = q.defer();

    var db = new sqlite3.Database(docset.paths.index(path), sqlite3.OPEN_CREATE | sqlite3.OPEN_READWRITE, function(error) {
      if (error) { d.reject(error); }
      else { d.resolve(db); }
    });

    return d.promise.then(function(db) {
      if (sql) {
        return q.ninvoke(db, 'run', sql[0]).then(function() {
          var all = sql.slice(1).map(function(cmd) {
            return q.ninvoke(db, 'run', cmd);
          });

          return q.all(all).then(function() { db.close(); });
        });
      } else {
        db.close();
      }
    });
  } else {
    fs.writeFileSync(docset.paths.index(path), '');
  }
};

// Removes file at `path`, i.e. `rm -rf path`.

utils.remove = function(path) {
  fs_extra.removeSync(path);
};

utils.data = { dashDocset: { Info: { plist: {} } } };
utils.data.dashDocset.Info.plist = "<?xml version=\"1.0\" encoding=\"UTF-8\"?>\n<!DOCTYPE plist PUBLIC \"-//Apple//DTD PLIST 1.0//EN\" \"http://www.apple.com/DTDs/PropertyList-1.0.dtd\">\n<plist version=\"1.0\">\n<dict>\n<key>CFBundleIdentifier</key>\n<string>test</string>\n<key>CFBundleName</key>\n<string>Test</string>\n<key>DocSetPlatformFamily</key>\n<string>test</string>\n<key>isDashDocset</key>\n<true/>\n</dict>\n</plist>";

module.exports = utils;
