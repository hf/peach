var docset = {
  types: require('./docset-types')
};

// Holds an inverse mapping of type symbols to types.

docset.inverseTypes = (function() {
  var inverse = {};

  for (var type in docset.types) {
    var sym = docset.types[type];

    if (sym instanceof Array) {
      sym.forEach(function(symbol) {
        inverse[symbol] = type;
      });
    } else {
      inverse[sym] = type;
    }
  };

  return inverse;
})();

module.exports = docset.inverseTypes;
