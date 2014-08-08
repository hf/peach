var mocha = require('mocha')
  , expect = require('chai').expect
  , q = require('q')
  , docset = require('../lib/docset');

describe('docset', function() {

  describe('docset.exists', function() {
    it('should return a promise', function() {
      expect(docset.exists('/home')).to.be.a('object');
    });

    it('should check for file existence', function(done) {
      var fs = require('fs');

      fs.exists('/home', function(exists) {
        docset.exists('/home').then(function(promiseExists) {
          expect(exists).to.eq(promiseExists);
        }).then(done, done);
      });
    });
  });

  describe('docset.validate', function() {
    it('should return a promise', function() {
      expect(docset.validate('/home')).to.be.a('object');
    });

    it('should not validate invalid path as docset', function(done) {
      docset.validate('/home').then(function(valid) {
        expect(valid).to.be.false;
      }).then(done, done);
    });

    it('should validate a valid path as docset', function(done) {
      var fs = require('fs')
        , fs_extra = require('fs-extra');

      fs_extra.removeSync('.tmp');

      [ '.tmp', '.tmp/Test.docset',
        '.tmp/Test.docset/Contents',
        '.tmp/Test.docset/Contents/Resources',
        '.tmp/Test.docset/Contents/Resources/Documents'
      ].forEach(function(path) {
        fs.mkdirSync(path);
      });

      fs.writeFileSync('.tmp/Test.docset/Contents/Info.plist');
      fs.writeFileSync('.tmp/Test.docset/Contents/Resources/docSet.dsidx');

      docset.validate('.tmp/Test.docset').then(function(valid) {
        expect(valid).to.be.true;
      }).then(done, done);

      fs_extra.removeSync('.tmp');
    });
  });
});
