var mocha = require('mocha')
  , expect = require('chai').expect
  , q = require('q')
  , fs = require('fs')
  , fs_extra = require('fs-extra')
  , docset = {
    utils: require('../lib/docset-utils')
  };

describe('docset.utils', function() {

  describe('.exists', function() {
    it('should return a promise', function() {
      expect(docset.utils.exists('/home')).to.be.a('object');
    });

    it('should check for file existence', function() {
      return docset.utils.exists('/home').then(function(exists) {
        expect(exists).to.eq(fs.existsSync('/home'));
      });
    });
  });

  describe('.validate', function() {
    it('should return a promise', function() {
      expect(docset.utils.validate('/home')).to.be.a('object');
    });

    it('should not validate invalid path as docset', function() {
      return docset.utils.validate('/home').then(function(valid) {
        expect(valid).to.be.false;
      });
    });

    it('should validate a valid path as docset', function() {
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

      return docset.utils.validate('.tmp/Test.docset').then(function(valid) {
        expect(valid).to.be.true;
      }).then(function() { fs_extra.removeSync('.tmp'); }, function() { fs_extra.removeSync('.tmp'); });
    });
  });
});
