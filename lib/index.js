"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.Trainer = exports.Tagger = undefined;

var _tagger = require("./tagger");

var _tagger2 = _interopRequireDefault(_tagger);

var _trainer = require("./trainer");

var _trainer2 = _interopRequireDefault(_trainer);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

exports.Tagger = _tagger2.default;
exports.Trainer = _trainer2.default;