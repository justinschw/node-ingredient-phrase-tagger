"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.export_data = exports.import_data = exports.insideParenthesis = exports.lengthGroup = exports.isCapitalized = exports.getFeatures = exports.normalizeToken = exports.unclump = exports.cleanUnicodeFractions = exports.clumpFractions = exports.tokenize = undefined;

var _slicedToArray = function () { function sliceIterator(arr, i) { var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i["return"]) _i["return"](); } finally { if (_d) throw _e; } } return _arr; } return function (arr, i) { if (Array.isArray(arr)) { return arr; } else if (Symbol.iterator in Object(arr)) { return sliceIterator(arr, i); } else { throw new TypeError("Invalid attempt to destructure non-iterable instance"); } }; }();

var _inflection = require("inflection");

var _inflection2 = _interopRequireDefault(_inflection);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _toConsumableArray(arr) { if (Array.isArray(arr)) { for (var i = 0, arr2 = Array(arr.length); i < arr.length; i++) { arr2[i] = arr[i]; } return arr2; } else { return Array.from(arr); } }

function _toArray(arr) { return Array.isArray(arr) ? arr : Array.from(arr); }

var tokenize = exports.tokenize = function tokenize(s) {
  /*
  Tokenize on parenthesis, punctuation, spaces and American units followed by a slash.
  We sometimes give American units and metric units for baking recipes. For example:
    * 2 tablespoons/30 mililiters milk or cream
    * 2 1/2 cups/300 grams all-purpose flour
  The recipe database only allows for one unit, and we want to use the American one.
  But we must split the text on "cups/" etc. in order to pick it up.
  */

  var american_units = ["cup", "tablespoon", "teaspoon", "pound", "ounce", "quart", "pint"];
  var _iteratorNormalCompletion = true;
  var _didIteratorError = false;
  var _iteratorError = undefined;

  try {
    for (var _iterator = american_units[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
      var unit = _step.value;

      s = s.replace(unit + "/", unit + " ");
      s = s.replace(unit + "s/", unit + "s ");
    }
  } catch (err) {
    _didIteratorError = true;
    _iteratorError = err;
  } finally {
    try {
      if (!_iteratorNormalCompletion && _iterator.return) {
        _iterator.return();
      }
    } finally {
      if (_didIteratorError) {
        throw _iteratorError;
      }
    }
  }

  return clumpFractions(s).split(/(?=[,()])|\s+/);
};

var clumpFractions = exports.clumpFractions = function clumpFractions(s) {
  /*
  Replaces the whitespace between the integer and fractional part of a quantity
  with a dollar sign, so it's interpreted as a single token. The rest of the
  string is left alone.
    clumpFractions("aaa 1 2/3 bbb")
    # => "aaa 1$2/3 bbb"
  */
  return s.replace(/(\d+)\s+(\d)\/(\d)/, "$1$$$2/$3");
};

var cleanUnicodeFractions = exports.cleanUnicodeFractions = function cleanUnicodeFractions(s) {
  var fractions = {
    "\u215B": "1/8",
    "\u215C": "3/8",
    "\u215D": "5/8",
    "\u215E": "7/8",
    "\u2159": "1/6",
    "\u215A": "5/6",
    "\u2155": "1/5",
    "\u2156": "2/5",
    "\u2157": "3/5",
    "\u2158": "4/5",
    "\xBC": "1/4",
    "\xBE": "3/4",
    "\u2153": "1/3",
    "\u2154": "2/3",
    "\xBD": "1/2"
  };

  var _iteratorNormalCompletion2 = true;
  var _didIteratorError2 = false;
  var _iteratorError2 = undefined;

  try {
    for (var _iterator2 = Object.entries(fractions)[Symbol.iterator](), _step2; !(_iteratorNormalCompletion2 = (_step2 = _iterator2.next()).done); _iteratorNormalCompletion2 = true) {
      var _ref = _step2.value;

      var _ref2 = _slicedToArray(_ref, 2);

      var f_unicode = _ref2[0];
      var f_ascii = _ref2[1];

      s = s.replace(f_unicode, f_ascii);
    }
  } catch (err) {
    _didIteratorError2 = true;
    _iteratorError2 = err;
  } finally {
    try {
      if (!_iteratorNormalCompletion2 && _iterator2.return) {
        _iterator2.return();
      }
    } finally {
      if (_didIteratorError2) {
        throw _iteratorError2;
      }
    }
  }

  return s;
};

var unclump = exports.unclump = function unclump(s) {
  return s.replace("$", " ");
};

var normalizeToken = exports.normalizeToken = function normalizeToken(s) {
  return _inflection2.default.singularize(s);
};

var getFeatures = exports.getFeatures = function getFeatures(token, index, tokens) {
  var length = tokens.length;

  return ["I" + index, "L" + lengthGroup(length), (isCapitalized(token) ? "Yes" : "No") + "CAP", (insideParenthesis(token, tokens) ? "Yes" : "No") + "PAREN"];
};

var isCapitalized = exports.isCapitalized = function isCapitalized(token) {
  /*
  Returns true if a given token starts with a capital letter.
  */
  return (/^[A-Z]/.test(token)
  );
};

var lengthGroup = exports.lengthGroup = function lengthGroup(actualLength) {
  /*
  Buckets the length of the ingredient into 6 buckets.
  */
  var _arr = [4, 8, 12, 16, 20];
  for (var _i = 0; _i < _arr.length; _i++) {
    var n = _arr[_i];
    if (actualLength < n) {
      return n.toString();
    }
  }

  return "X";
};

var escapeRegExp = function escapeRegExp(string) {
  return string.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"); // $& means the whole matched string
};

var insideParenthesis = exports.insideParenthesis = function insideParenthesis(token, tokens) {
  if (["(", ")"].includes(token)) {
    return true;
  } else {
    var line = tokens.join(" ");
    return new RegExp(".*\\(.*" + escapeRegExp(token) + ".*\\).*").test(line);
  }
};

var displayIngredient = function displayIngredient(ingredient) {
  /*
  Format a list of (tag, [tokens]) tuples as an HTML string for display.
       displayIngredient([("qty", ["1"]), ("name", ["cat", "pie"])])
      # => <span class='qty'>1</span> <span class='name'>cat pie</span>
  */

  return ingredient.map(function (_ref3) {
    var _ref4 = _slicedToArray(_ref3, 2),
        tag = _ref4[0],
        tokens = _ref4[1];

    return "<span class='" + tag + "'>" + tokens.join(" ") + "</span>";
  }).join("");
};

// HACK: fix this
var smartJoin = function smartJoin(words) {
  /*
  Joins list of words with spaces, but is smart about not adding spaces
  before commas.
  */

  var input = words.join(" ");

  // replace " , " with ", "
  input = input.replace(" , ", ", ");

  // replace " ( " with " ("
  input = input.replace("( ", "(");

  // replace " ) " with ") "
  input = input.replace(" )", ")");

  return input;
};

var import_data = exports.import_data = function import_data(instances) {
  var data = [];
  var display = [];

  var _loop = function _loop(xseq, yseq) {
    var ingredientData = {};
    var ingredientDisplay = [];
    var prevTag = null;

    xseq.forEach(function (_ref7, i) {
      var _ref8 = _toArray(_ref7),
          token = _ref8[0],
          features = _ref8.slice(1);

      // unclump fractions
      token = unclump(token);

      // turn B-NAME/123 back into "name"
      var tag = yseq[i];
      tag = tag.replace(/^[BI]-/, "").toLowerCase();

      // ---- DISPLAY ----
      // build a structure which groups each token by its tag, so we can
      // rebuild the original display name later.

      if (prevTag !== tag) {
        ingredientDisplay.push([tag, [token]]);
        prevTag = tag;
      } else {
        ingredientDisplay[ingredientDisplay.length - 1][1].push(token);
      }

      // ---- DATA ----
      // build a dict grouping tokens by their tag

      // initialize this attribute if this is the first token of its kind
      ingredientData[tag] = ingredientData[tag] || [];

      // HACK: If this token is a unit, singularize it so Scoop accepts it.
      if (tag === "unit") {
        token = _inflection2.default.singularize(token);
      }

      ingredientData[tag].push(token);
    });

    data.push(ingredientData);
    display.push(ingredientDisplay);
  };

  var _iteratorNormalCompletion3 = true;
  var _didIteratorError3 = false;
  var _iteratorError3 = undefined;

  try {
    for (var _iterator3 = instances[Symbol.iterator](), _step3; !(_iteratorNormalCompletion3 = (_step3 = _iterator3.next()).done); _iteratorNormalCompletion3 = true) {
      var _ref5 = _step3.value;

      var _ref6 = _slicedToArray(_ref5, 2);

      var xseq = _ref6[0];
      var yseq = _ref6[1];

      _loop(xseq, yseq);
    }

    // reassemble the output into a list of dicts.
  } catch (err) {
    _didIteratorError3 = true;
    _iteratorError3 = err;
  } finally {
    try {
      if (!_iteratorNormalCompletion3 && _iterator3.return) {
        _iterator3.return();
      }
    } finally {
      if (_didIteratorError3) {
        throw _iteratorError3;
      }
    }
  }

  var output = data.map(function (ingredient) {
    return Object.keys(ingredient).reduce(function (accumulator, tag) {
      accumulator[tag] = smartJoin(ingredient[tag]);
      return accumulator;
    }, {});
  });

  // Add the marked-up display data
  var _iteratorNormalCompletion4 = true;
  var _didIteratorError4 = false;
  var _iteratorError4 = undefined;

  try {
    for (var _iterator4 = output.keys()[Symbol.iterator](), _step4; !(_iteratorNormalCompletion4 = (_step4 = _iterator4.next()).done); _iteratorNormalCompletion4 = true) {
      var i = _step4.value;

      output[i]["display"] = displayIngredient(display[i]);
    }

    // Add the raw ingredient phrase
  } catch (err) {
    _didIteratorError4 = true;
    _iteratorError4 = err;
  } finally {
    try {
      if (!_iteratorNormalCompletion4 && _iterator4.return) {
        _iterator4.return();
      }
    } finally {
      if (_didIteratorError4) {
        throw _iteratorError4;
      }
    }
  }

  var _iteratorNormalCompletion5 = true;
  var _didIteratorError5 = false;
  var _iteratorError5 = undefined;

  try {
    for (var _iterator5 = output.keys()[Symbol.iterator](), _step5; !(_iteratorNormalCompletion5 = (_step5 = _iterator5.next()).done); _iteratorNormalCompletion5 = true) {
      var _i2 = _step5.value;

      output[_i2]["input"] = smartJoin(display[_i2].map(function (_ref9) {
        var _ref10 = _slicedToArray(_ref9, 2),
            tag = _ref10[0],
            tokens = _ref10[1];

        return tokens.join(" ");
      }));
    }
  } catch (err) {
    _didIteratorError5 = true;
    _iteratorError5 = err;
  } finally {
    try {
      if (!_iteratorNormalCompletion5 && _iterator5.return) {
        _iterator5.return();
      }
    } finally {
      if (_didIteratorError5) {
        throw _iteratorError5;
      }
    }
  }

  return output;
};

var export_data = exports.export_data = function export_data(lines) {
  /*
  Parse "raw" ingredient lines into CRF-ready output
  */
  return lines.map(function (line) {
    var line_clean = line.replace(/<[^<]+?>/, "");
    var tokens = tokenize(line_clean);

    return tokens.map(function (token, i) {
      var features = getFeatures(token, i + 1, tokens);
      return [token].concat(_toConsumableArray(features));
    });
  });
};