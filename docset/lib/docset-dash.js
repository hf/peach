// **docset.dash**
//
// This is a [docset](docset.html) implementation for [Dash](kapeli.com/dash)
// style docsets.
//
// Besides the docset events, emits these:
// * `dash:index` -- when the index is open for the first time

var docset = require('./docset')
  , q = require('q')
  , sqlite3 = require('sqlite3');


// **constructor(path:string, info:object)**
//
// Constructs a new `docset.dash` object. Requires a valid path and a valid
// info object (such as from `docset.utils.understandPlist()`).

var dash = function(path, info) {
  docset.call(this, path, info);
};


// **DEFAULT_OPTIONS**
//
// Default search options. Contains `offset` which offsets the search results
// returned by `docset.dash#search()`, and `results` which limits the amount of
// results to be returned.

dash.DEFAULT_OPTIONS = {
  offset: 0,
  results: 300
};


// `docset.dash` is a `docset`.

dash.prototype = Object.create(docset.prototype, { constructor: docset });


// **#search(name:string, [options:object]): q([result])**
//
// Options hold:
// * `results` -- the number of results to return
// * `offset`  -- how many results to skip

dash.prototype.search = function(name, options) {
  options = options || {};

  options.offset = options.offset || dash.DEFAULT_OPTIONS.offset;
  options.results = options.results || dash.DEFAULT_OPTIONS.results;

  this.emit('search', { name: name, options: options });

  return this.searchIndex().then(function(db) {
    return q.ninvoke(db, 'all', 'SELECT * FROM searchIndex WHERE name LIKE ? LIMIT ? OFFSET ?', '%' + name + '%', options.results, options.offset)
    .then(function(result) {
      this.emit('search:result', { name: name, options: options, result: result });
      return { name: name, options: options, result: result };
    }.bind(this), function(error) {
        this.emit('error', error);
        this.emit('search:error', error, { name: name, options: options });
    }.bind(this));
  }.bind(this));
};


// **#symbols(): q([object])**
//
// Returns a summary of all symbols in this docset.

dash.prototype.symbols = function() {
  return this.searchIndex().then(function(db) {
    return q.ninvoke(db, 'all', 'SELECT type AS type, COUNT(*) AS entries FROM searchIndex GROUP BY type')
    .then(function(result) {
      this.emit('symbols', result);
      return result;
    }.bind(this), function(error) {
      this.emit('error', error);
      this.emit('symbols:error', error);
    }.bind(this));
  }.bind(this));
};


// **#searchIndex(): q(sqlite3.Database)**
//
// Returns a promise to the index database. Promise will be fulfilled when the
// database is open.

dash.prototype.searchIndex = function() {
  if (!this.idx) {
    return this.openSearchIndex();
  }

  if (this.idx.open) {
    return q(this.idx);
  }

  var d = q.defer()
    , error = (function(e) { done(); d.reject(e);         }).bind(this)
    , open  = (function()  { done(); d.resolve(this.idx); }).bind(this)
    , done  = (function()  {
      this.idx.removeListener('open', open);
      this.idx.removeListener('error', error);
    }).bind(this);

  this.idx.once('open', open);
  this.idx.once('error', error);

  d.promise._deferred = true;

  return d.promise;
};


// **#openSearchIndex(): q(sqlite3.Database)**
//
// Opens the SQLite 3 index database in this docset. Used internally.

dash.prototype.openSearchIndex = function() {
  if (!this.idx) {
    this.idx = new sqlite3.Database(docset.paths.index(this.path), sqlite3.OPEN_READONLY);
    this.idx.on('open', function() {
      this.emit('dash:index', this.idx);
    }.bind(this));
    this.idx.on('error', function(error) {
      this.emit('error', error);
    }.bind(this));
  }

  return this.searchIndex();
};


// Exports.

module.exports = dash;
