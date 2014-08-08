var plist = require('plist')
  , emitter = require('events').EventEmitter
  , util  = require('util')
  , fs    = require('fs')
  , q     = require('q')
  , sqlite3 = require('sqlite3');

var docset = function docset(path) {
  emitter.call(this);

  this.path = path;

  docset.validate(path)
    .then(this._validate.bind(this))
    .then(this._open.bind(this))
    .then(function() {
      this.emit('done', this);
    }.bind(this));
};

docset.paths = {};

docset.paths.contents = function(path) {
  return path + '/Contents';
};

docset.paths.plist = function(path) {
  return docset.paths.contents(path) + '/Info.plist';
};

docset.paths.resources = function(path) {
  return docset.paths.contents(path) + '/Resources';
};

docset.paths.index = function(path) {
  return docset.paths.resources(path) + '/docSet.dsidx';
};

docset.paths.documents = function(path) {
  return docset.paths.resources(path) + '/Documents';
};

docset.exists = function(path) {
  var d = q.defer();
  fs.exists(path, function(e) { d.resolve(e); });
  return d.promise;
};

docset.validate = function(path, callback) {
  return q.all([
    docset.exists(docset.paths.contents(path)),
    docset.exists(docset.paths.plist(path)),
    docset.exists(docset.paths.resources(path)),
    docset.exists(docset.paths.index(path)),
    docset.exists(docset.paths.documents(path))
  ]).then(function(validated) {
    var ok = true;

    validated.forEach(function(valid) {
      ok = ok && valid;
    });

    return ok;
  });
};

docset.prototype = Object.create(emitter.prototype);

docset.prototype._searchIndex = function() {
  var db = this._searchIndexDB;

  if (db) {
    if (!db.open) {
      var d = q.defer();

      db.once('open', function() {
        d.resolve(db);
      });

      db.once('error', function(error) {
        d.reject(error);
      });

      db.once('close', function() {
        d.reject('closed');
      });

      return d.promise;
    }

    return q(db);
  }

  this._searchIndexDB = new sqlite3.Database(docset.paths.index(this.path), sqlite3.OPEN_READONLY);
  this._searchIndexDB.on('error', function(error) {
    this.emit('error', error);
  }.bind(this));

  return this._searchIndex();
};

docset.prototype._validate = function(valid) {
  this.valid = valid;

  if (valid) {
    this.emit('valid');
  } else {
    this.emit('invalid');

    throw "Docset at path '" + this.path + "' is not valid.";
  }
};

docset.prototype._open = function() {
  return q.nfcall(fs.readFile, docset.paths.plist(this.path), 'UTF-8')
    .then(function(data) { return plist.parse(data); }, function(error) {
      this.valid = false;
      this.emit('error', error);
    })
    .then(this._understandPlist.bind(this));
};

docset.prototype._understandPlist = function(plist) {
  this.bundleIdentifier = plist['CFBundleIdentifier'];
  this.bundleName = plist['CFBundleName'];
  this.platformFamily = plist['DocSetPlatformFamily'];
  this.isDashDocset = plist['isDashDocset'];
  this.dashIndex = plist['dashIndexFilePath'];
  this.isJavaScriptEnabled = plist['isJavaScriptEnabled'];
};

docset.prototype.search = function(name) {
  var dbp = this._searchIndex();

  return dbp.then(function(db) {
    var rd = q.defer();

    db.all("SELECT * FROM searchIndex WHERE name LIKE ?", '%' + name + '%', function(error, results) {
      if (error) {
        this.emit('error', error);
        rd.reject(error);
      } else {
        rd.resolve(results);
      }
    });

    return rd.promise;
  });
};

module.exports = docset;
