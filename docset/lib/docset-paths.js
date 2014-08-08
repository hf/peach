// Contains functions to obtain proper path names within a docset.

var docset = {
  paths: {}
};

// `*.docset/Contents` path.

docset.paths.contents = function(path) {
  return path + '/Contents';
};


// `*.docset/Contents/Info.plist` path.

docset.paths.plist = function(path) {
  return docset.paths.contents(path) + '/Info.plist';
};


// `*.docset/Contents/Resources` path.

docset.paths.resources = function(path) {
  return docset.paths.contents(path) + '/Resources';
};


// `*.docset/Contents/Resources/docSet.dsidx` path.

docset.paths.index = function(path) {
  return docset.paths.resources(path) + '/docSet.dsidx';
};


// `*.docset/Contents/Resources/Documents` path.

docset.paths.documents = function(path) {
  return docset.paths.resources(path) + '/Documents';
};


// Exports

module.exports = docset.paths;
