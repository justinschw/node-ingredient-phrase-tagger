"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _slicedToArray = function () { function sliceIterator(arr, i) { var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i["return"]) _i["return"](); } finally { if (_d) throw _e; } } return _arr; } return function (arr, i) { if (Array.isArray(arr)) { return arr; } else if (Symbol.iterator in Object(arr)) { return sliceIterator(arr, i); } else { throw new TypeError("Invalid attempt to destructure non-iterable instance"); } }; }();

var _fs = require("fs");

var _fs2 = _interopRequireDefault(_fs);

var _csv = require("csv");

var _csv2 = _interopRequireDefault(_csv);

var _utils = require("./utils");

var utils = _interopRequireWildcard(_utils);

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _toConsumableArray(arr) { if (Array.isArray(arr)) { for (var i = 0, arr2 = Array(arr.length); i < arr.length; i++) { arr2[i] = arr[i]; } return arr2; } else { return Array.from(arr); } }

var generateDataStream = function generateDataStream(data_path, count, offset) {
  var parser = _csv2.default.parse({
    auto_parse: true,
    columns: true,
    from: offset,
    to: offset + count
  });

  var transformer = _csv2.default.transform(function (row) {
    // extract the display name
    var display_input = utils.cleanUnicodeFractions(row.input);
    var tokens = utils.tokenize(display_input);
    delete row.input;

    var rowData = addPrefixes(tokens.map(function (t) {
      return [t, matchUp(t, row)];
    }));

    var xseq = rowData.map(function (_ref, i) {
      var _ref2 = _slicedToArray(_ref, 2),
          token = _ref2[0],
          tags = _ref2[1];

      var features = utils.getFeatures(token, i + 1, tokens);
      return [token].concat(_toConsumableArray(features));
    });
    var yseq = rowData.map(function (_ref3) {
      var _ref4 = _slicedToArray(_ref3, 2),
          token = _ref4[0],
          tags = _ref4[1];

      return bestTag(tags);
    });
    return [xseq, yseq];
  });

  return _fs2.default.createReadStream(data_path).pipe(parser).pipe(transformer);
};

var parseNumbers = function parseNumbers(s) {
  /*
  Parses a string that represents a number into a decimal data type so that
  we can match the quantity field in the db with the quantity that appears
  in the display name. Rounds the result to 2 places.
  */
  var ss = utils.unclump(s);

  var m3 = ss.match(/^\d+$/);
  if (m3) {
    return Number(Math.round(parseFloat(ss) + "e2") + "e-2");
  }

  var m1 = ss.match(/(\d+)\s(\d)\/(\d)/);
  if (m1) {
    var num = parseInt(m1[1], 10) + parseFloat(m1[2]) / parseFloat(m1[3]);
    return Number(Math.round(num + "e2") + "e-2");
  }

  var m2 = ss.match(/^(\d)\/(\d)$/);
  if (m2) {
    var _num = parseFloat(m2[1]) / parseFloat(m2[2]);
    return Number(Math.round(_num + "e2") + "e-2");
  }

  return null;
};

var matchUp = function matchUp(token, ingredientRow) {
  /*
  Returns our best guess of the match between the tags and the
  words from the display text.
   This problem is difficult for the following reasons:
      * not all the words in the display name have associated tags
      * the quantity field is stored as a number, but it appears
        as a string in the display name
      * the comment is often a compilation of different comments in
        the display name
  */
  var ret = [];

  token = utils.normalizeToken(token);
  var decimalToken = parseNumbers(token);

  var _iteratorNormalCompletion = true;
  var _didIteratorError = false;
  var _iteratorError = undefined;

  try {
    for (var _iterator = Object.entries(ingredientRow)[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
      var _ref5 = _step.value;

      var _ref6 = _slicedToArray(_ref5, 2);

      var key = _ref6[0];
      var val = _ref6[1];

      if (typeof val === "string" || val instanceof String) {
        var _iteratorNormalCompletion2 = true;
        var _didIteratorError2 = false;
        var _iteratorError2 = undefined;

        try {
          for (var _iterator2 = utils.tokenize(val)[Symbol.iterator](), _step2; !(_iteratorNormalCompletion2 = (_step2 = _iterator2.next()).done); _iteratorNormalCompletion2 = true) {
            var vt = _step2.value;

            if (utils.normalizeToken(vt) === token) {
              ret.push(key.toUpperCase());
            }
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
      } else if (decimalToken !== null) {
        if (val === decimalToken) {
          ret.push(key.toUpperCase());
        }
      }
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

  return ret;
};

var addPrefixes = function addPrefixes(data) {
  /*
  We use BIO tagging/chunking to differentiate between tags
  at the start of a tag sequence and those in the middle. This
  is a common technique in entity recognition.
   Reference: http://www.kdd.cis.ksu.edu/Courses/Spring-2013/CIS798/Handouts/04-ramshaw95text.pdf
  */
  var prevTags = null;
  var newData = [];

  var _iteratorNormalCompletion3 = true;
  var _didIteratorError3 = false;
  var _iteratorError3 = undefined;

  try {
    for (var _iterator3 = data[Symbol.iterator](), _step3; !(_iteratorNormalCompletion3 = (_step3 = _iterator3.next()).done); _iteratorNormalCompletion3 = true) {
      var _ref7 = _step3.value;

      var _ref8 = _slicedToArray(_ref7, 2);

      var token = _ref8[0];
      var tags = _ref8[1];

      var newTags = [];

      var _iteratorNormalCompletion4 = true;
      var _didIteratorError4 = false;
      var _iteratorError4 = undefined;

      try {
        for (var _iterator4 = tags[Symbol.iterator](), _step4; !(_iteratorNormalCompletion4 = (_step4 = _iterator4.next()).done); _iteratorNormalCompletion4 = true) {
          var t = _step4.value;

          var p = prevTags === null || !prevTags.includes(t) ? "B" : "I";
          newTags.push(p + "-" + t);
        }
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

      newData.push([token, newTags]);
      prevTags = tags;
    }
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

  return newData;
};

var bestTag = function bestTag(tags) {
  if (tags.length === 1) {
    return tags[0];
  } else {
    // if there are multiple tags, pick the first which isn't COMMENT
    var _iteratorNormalCompletion5 = true;
    var _didIteratorError5 = false;
    var _iteratorError5 = undefined;

    try {
      for (var _iterator5 = tags[Symbol.iterator](), _step5; !(_iteratorNormalCompletion5 = (_step5 = _iterator5.next()).done); _iteratorNormalCompletion5 = true) {
        var t = _step5.value;

        if (t !== "B-COMMENT" && t !== "I-COMMENT") {
          return t;
        }
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
  }

  // we have no idea what to guess
  return "OTHER";
};

exports.default = generateDataStream;