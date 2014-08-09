// **docset.utils**
//
// Contains various helper methods pertaining to opening, validation and other
// functions over docsets and their content.

var fs = require('fs')
  , q  = require('q')
  , plist = require('plist');

var docset = {
  paths: require('./docset-paths'),
  utils: {}
};

// **docset.utils.exists(path:string): Q.Promise(bool)**
//
// Checks whether the path exists on the filesystem.

docset.utils.exists = function(path) {
  var d = q.defer();
  fs.exists(path, function(e) { d.resolve(e); });
  return d.promise;
};


// **docset.utils.validate(path:string): Q.Promise(bool)**
//
// Checks whether a path is a valid docset.

docset.utils.validate = function(path) {
  return q.all([
    docset.utils.exists(docset.paths.contents(path)),
    docset.utils.exists(docset.paths.Info.plist(path)),
    docset.utils.exists(docset.paths.resources(path)),
    docset.utils.exists(docset.paths.index(path)),
    docset.utils.exists(docset.paths.documents(path))
  ]).then(function(validated) {
    var ok = true;

    validated.forEach(function(valid) {
      ok = ok && valid;
    });

    return ok;
  });
};


// **readInfo.plist(path:string): q(plist)**
//
// Opens the `Info.plist` file in the docset at `path`. Promise holds the parsed
// plist data.

docset.utils.readInfo = {};
docset.utils.readInfo.plist = function(path) {
  return q.nfcall(fs.readFile, docset.paths.Info.plist(path), 'UTF-8')
    .then(function(data) {
      return plist.parse(data);
    });
};


// **createDocset(path:string, info:object): q(docset)**
//
// Creates a new docset object according to the specifications in `path` and
// `info`. If by some chance that docset cannot be opened (another format),
// this function will throw an exception.

docset.utils.createDocset = function(path, info) {
  if (info.isDashDocset) {
    docset.dash = require('./docset-dash');

    return q(new docset.dash(path, info));
  }

  throw new Error("Non-Dash docsets are not yet supported.");
};


// **understandPlist(plist:object): object**
//
// Translates a `.docset` property list object into a usable info object for
// this library.

docset.utils.understandPlist = function(plist) {
  return {
    'identifier': plist['CFBundleIdentifier'],
    'name': plist['CFBundleName'],
    'platformFamily': plist['DocSetPlatformFamily'],
    'isDashDocset': !!plist['isDashDocset']
  };
};

// Exports.

module.exports = docset.utils;
