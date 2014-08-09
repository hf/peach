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

describe('docset.dash [database]', function() {
  var d = null;

  beforeEach(function(done) {
    utils.create.valid.dashDocset('.Test.docset', true, SQL).then(function(db) {
      d = new docset.dash('.Test.docset', docset.utils.understandPlist(plist.parse(utils.data.dashDocset.Info.plist)));

      done();
    });
  });

  afterEach(function() {
    utils.remove('.Test.docset');
  });

  describe('#search()', function() {
    it('should return data', function() {
      return d.search('fs').then(function(search) {
        expect(search).to.be.ok;
        expect(search).to.be.an('object');
        expect(search.name).to.eq('fs');

        expect(search.options).to.be.an('object');
        expect(search.options.offset).to.eq(docset.dash.DEFAULT_OPTIONS.offset);
        expect(search.options.results).to.eq(docset.dash.DEFAULT_OPTIONS.results);

        expect(search.result).to.be.ok;
        expect(search.result.length).to.eq(DATA.length);

        expect(search.result[0].id).to.be.ok;
        expect(search.result[0].name).to.be.ok;
        expect(search.result[0].type).to.be.ok;
        expect(search.result[0].path).to.be.ok;
      });
    });
  });

  describe('#symbols()', function() {
    it('should return data', function() {
      return d.symbols().then(function(symbols) {
        expect(symbols).to.be.ok;
        expect(symbols.length).to.eq(1);
        expect(symbols[0].type).to.eq('Module');
        expect(symbols[0].entries).to.eq(1);
      });
    });
  });
});
