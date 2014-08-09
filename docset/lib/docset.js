var plist = require('plist')
  , emitter = require('events').EventEmitter
  , q     = require('q');

// **docset.constructor()**
//
// Docset is used to open and search a Dash docset. You give it a path, example:
// `new docset('./NodeJS.docset')` and it opens the path. It is an event emitter
// so you should listen to the events `valid`, `invalid`, `error`, `done` and
// `search`.
//
// All methods return Q promises.

var docset = function docset(path, info) {
  emitter.call(this);

  this.path = path;
  this.info = info;
};

// Import docset [paths](docset-paths.html).
docset.paths = require('./docset-paths');

// Import docset [utils](docset-utils.html).
docset.utils = require('./docset-utils');

// Import docset [symbols](docset-symbols.html).
docset.symbols = require('./docset-symbols');


// **open(path:string): q(docset)**
//
// Tries to open a docset at `path`.
//
// Promise will be fulfilled if the docset can be opened.

docset.open = function(path) {
  return docset.utils.validate(path)
    .then(function(valid) {
      if (!valid) throw "Docset path '" + path + "' is not valid.";
    })
    .then(function() {
      return docset.utils.readInfo.plist(path);
    })
    .then(function(plist) {
      return docset.utils.understandPlist(plist);
    })
    .then(function(info) {
      return docset.utils.createDocset(path, info);
    });
};

// `docset` is an `EventEmitter`.

docset.prototype = Object.create(emitter.prototype, { constructor: emitter });


// **#search(name:string, [options:object]): q([result])**
//
// *Implementations must override this method.*
//
// Searches the docset for the specified `name` with optional `options`.
// Returns a promise with an array of results in the form of
//
//     { name: string, type: string, path: string }
//
// Also emits these events:
// * `search` -- before a search occurs
// * `search:error` -- when an error occurs when searching
// * `search:result` -- search returned results

docset.prototype.search = function(name, options) {
  throw new Error("docset#search() is not implemented!");
};


// **#symbols(): q([object])**
//
// *Implementations must override this method.*
//
// Returns a listing of all symbols in this docset combined with stats about
// them.

docset.prototype.symbols = function() {
  throw new Error("docset#symbols() is not implemented!");
};


// Exports.

module.exports = docset;
