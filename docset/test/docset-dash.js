var mocha = require('mocha')
  , expect = require('chai').expect
  , q = require('q')
  , utils = require('./utils')
  , fs = require('fs')
  , plist = require('plist')
  , docset = require('../lib/docset')
  , sqlite3 = require('sqlite3').verbose();

var SQL  = [ "CREATE TABLE searchIndex(id INTEGER PRIMARY KEY, name TEXT, type TEXT, path TEXT); " ]
  , DATA = [ { name: 'fs', type: 'Module', path: 'fs.html' } ];

DATA.forEach(function(data) {
  SQL.push("INSERT INTO searchIndex(name, type, path) VALUES ('" + data.name + "', '" + data.type + "', '" + data.path + "'); ");
});

docset.dash  = require('../lib/docset-dash');

describe('docset.dash', function() {
  describe('constructor', function() {
    it('should construct a new instance flawlessly', function() {
      var d = new docset.dash('.Test.docset', docset.utils.understandPlist(plist.parse(utils.data.dashDocset.Info.plist)));

      expect(d).to.be.an.instanceof(docset);
    });
  });

  var d = null;

  beforeEach(function(done) {
    utils.create.valid.dashDocset('.Test.docset', true).then(function(db) {
      d = new docset.dash('.Test.docset', docset.utils.understandPlist(plist.parse(utils.data.dashDocset.Info.plist)));

      done();
    });
  });

  afterEach(function() {
    utils.remove('.Test.docset');
  });

  describe('#search()', function() {
    it('should override docset#search()', function() {
      expect(d.search).to.be.a('function');
      expect(d.search).to.not.eq(docset.prototype.search);
    });
  });

  describe('#symbols()', function() {
    it('should override docset#symbols()', function() {
      expect(d.symbols).to.be.a('function');
      expect(d.symbols).to.not.eq(docset.prototype.symbols);
    });
  });

  describe('#openSearchIndex()', function() {
    it('should open the index database', function() {
      var idx = d.openSearchIndex();

      expect(d.idx).to.be.an.instanceof(sqlite3.Database);

      return idx;
    });
  });

  describe('#searchIndex()', function() {
    it('should give a promise for the index database', function(done) {
      var idx = d.searchIndex();
      expect(d.idx).to.be.an.instanceof(sqlite3.Database);

      idx.then(function() { done(); }, done);
    });

    it('should open a new non-error database', function(done) {
      expect(d.idx).to.not.exist;

      var idx = d.searchIndex();

      idx.then(function(db) {
        expect(d.idx).to.eq(db);
        expect(db).to.be.an.instanceof(sqlite3.Database);

        done();
      }, done);
    });

    it('should not open a new error database (appears untestable)');
  });
});
