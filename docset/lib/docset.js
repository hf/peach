var plist = require('plist')
  , emitter = require('events').EventEmitter
  , util  = require('util')
  , fs    = require('fs')
  , q     = require('q')
  , sqlite3 = require('sqlite3');


// **docset.constructor()**
//
// Docset is used to open and search a Dash docset. You give it a path, example:
// `new docset('./NodeJS.docset')` and it opens the path. It is an event emitter
// so you should listen to the events `valid`, `invalid`, `error`, `done` and
// `search`.
//
// All methods return Q promises.

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

// Import docset [paths](docset-paths.html).
docset.paths = require('./docset-paths');

// **docset.exists(path:string): Q.Promise(bool)**
//
// Checks whether the path exists on the filesystem.

docset.exists = function(path) {
  var d = q.defer();
  fs.exists(path, function(e) { d.resolve(e); });
  return d.promise;
};

// **docset.validate(path:string): Q.Promise(bool)**
//
// Checks whether a path is a valid docset.

docset.validate = function(path) {
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


// Docset is an `EventEmitter`.

docset.prototype = Object.create(emitter.prototype);

// **docset#search(name:string): Q.Promise([results])**
//
// Call this to search the docset for the given name. Will return a promise
// and eventually some results.

docset.prototype.search = function(name) {
  if (!this.valid) {
    return q.fcall(function() {
      throw "Docset is not valid, cannot search.";
    });
  }

  var dbp = this._searchIndex();

  return dbp.then(function(db) {
    var rd = q.defer();

    db.all("SELECT// FROM searchIndex WHERE name LIKE ?", '%' + name + '%', function(error, results) {
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

// **docset#_searchIndex(): Q.Promise(sqlite3.Database)**
//
// Opens the search index inside the docset. Returns a promise to the sqlite3
// database.

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


// *docset#_validate(valid:bool)*
//
// Call this upon a validation result.

docset.prototype._validate = function(valid) {
  this.valid = valid;

  if (valid) {
    this.emit('valid');
  } else {
    this.emit('invalid');

    throw "Docset at path '" + this.path + "' is not valid.";
  }
};

// *docset#_open()*
//
// Call this after a valid docset path.

docset.prototype._open = function() {
  return q.nfcall(fs.readFile, docset.paths.plist(this.path), 'UTF-8')
    .then(function(data) { return plist.parse(data); }, function(error) {
      this.valid = false;
      this.emit('error', error);
    })
    .then(this._understandPlist.bind(this));
};

// *docset#_understandPlist(plist:plist)*
//
// Call this to understand the contents of the `Info.plist` file.

docset.prototype._understandPlist = function(plist) {
  this.bundleIdentifier = plist['CFBundleIdentifier'];
  this.bundleName = plist['CFBundleName'];
  this.platformFamily = plist['DocSetPlatformFamily'];
  this.isDashDocset = plist['isDashDocset'];
  this.dashIndex = plist['dashIndexFilePath'];
  this.isJavaScriptEnabled = plist['isJavaScriptEnabled'];
};

// Exports.

module.exports = docset;
