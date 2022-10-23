"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _crfsuite = require("crfsuite");

var _crfsuite2 = _interopRequireDefault(_crfsuite);

var _utils = require("./utils");

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var Tagger = function () {
  function Tagger() {
    _classCallCheck(this, Tagger);

    this.tagger = new _crfsuite2.default.Tagger();
  }

  _createClass(Tagger, [{
    key: "open",
    value: function open(model_filename) {
      return this.tagger.open(model_filename);
    }
  }, {
    key: "close",
    value: function close() {
      return this.tagger.close();
    }
  }, {
    key: "tag",
    value: function tag(input) {
      var _this = this;

      var data = (0, _utils.export_data)(input);

      var instances = data.map(function (xseq) {
        var yseq = _this.tagger.tag(xseq);
        return [xseq, yseq];
      });

      return (0, _utils.import_data)(instances);
    }
  }]);

  return Tagger;
}();

exports.default = Tagger;