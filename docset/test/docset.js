var mocha = require('mocha')
  , expect = require('chai').expect
  , q = require('q')
  , utils = require('./utils')
  , docset = require('../lib/docset');

describe('docset', function() {
  describe('self', function() {
    it('should be a function', function() {
      expect(docset).to.be.a('function');
    });
  });

  describe('.utils', function() {
    it('should exist', function() {
      expect(docset.utils).to.exist;
    });
  });

  describe('.paths', function() {
    it('should exist', function() {
      expect(docset.paths).to.exist;
    });
  });

  describe('#search()', function() {
    it('should throw an exception', function() {
      expect(docset.prototype.search).to.throw;
    });
  });

  describe('#symbols()', function() {
    it('should throw an exception', function() {
      expect(docset.prototype.symbols).to.throw;
    });
  });
});
