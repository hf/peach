var mocha = require('mocha')
  , expect = require('chai').expect
  , q = require('q')
  , utils = require('./utils')
  , fs = require('fs')
  , plist = require('plist')
  , docset = require('../lib/docset')
  , sqlite3 = require('sqlite3').verbose();

var SQL  = [ "CREATE TABLE searchIndex(id INTEGER PRIMARY KEY, name TEXT, type TEXT, path TEXT); " ]
  , DATA = [
    { name: 'fs', type: docset.types.MODULE, path: 'fs.html' },
    { name: 'util.inherit', type: docset.types.FUNCTION[parseInt(Math.random() * 100) % docset.types.FUNCTION.length], path: 'util.html#inherit' },
    { name: 'os', type: 'xxxxxxx', path: 'os.html' }
  ];

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
        expect(search.result.length).to.eq(1);

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
        expect(Object.keys(symbols).length).to.eq(3);

        for (var sym in symbols) {
          expect(symbols[sym]).to.not.eq(0);
          expect(docset.types[sym]).to.be.ok;
        }
      });
    });
  });

  describe('#list()', function() {
    it('should return data in strict mode', function() {
      return d.list('FUNCTION').then(function(results) {
        expect(results).to.be.ok;

        expect(results[0]).to.be.ok;
        expect(results[0].name).to.be.a('string');
        expect(docset.inverseTypes[results[0].type]).to.eq('FUNCTION');
        expect(results[0].path).to.be.a('string');
      });
    });

    it('should return data in lenient mode', function() {
      return d.list('mod', { lenient: true }).then(function(results) {
        expect(results).to.be.ok;

        expect(results.length).to.eq(1);
        expect(results[0]).to.be.ok;
        expect(results[0].name).to.eq('fs');
        expect(docset.inverseTypes[results[0].type]).to.eq('MODULE');
        expect(results[0].path).to.be.a('string');
      });
    });
  });
});
