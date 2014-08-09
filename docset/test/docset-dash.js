var mocha = require('mocha')
  , expect = require('chai').expect
  , q = require('q')
  , utils = require('./utils')
  , fs = require('fs')
  , plist = require('plist')
  , docset = require('../lib/docset')
  , sqlite3 = require('sqlite3').verbose();

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
    utils.create.valid.dashDocset('.Test.docset', true).then(function() {
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

  describe('#openSearchIndex()', function() {
    it('should open the index database', function(done) {
      var idx = d.openSearchIndex();
      expect(d.idx).to.be.an.instanceof(sqlite3.Database);

      idx.then(function() { done(); }, done);
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

  describe('#search()', function() {

  });
});
