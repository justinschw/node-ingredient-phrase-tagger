"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _slicedToArray = function () { function sliceIterator(arr, i) { var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i["return"]) _i["return"](); } finally { if (_d) throw _e; } } return _arr; } return function (arr, i) { if (Array.isArray(arr)) { return arr; } else if (Symbol.iterator in Object(arr)) { return sliceIterator(arr, i); } else { throw new TypeError("Invalid attempt to destructure non-iterable instance"); } }; }();

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _crfsuite = require("crfsuite");

var _crfsuite2 = _interopRequireDefault(_crfsuite);

var _training = require("./training");

var _training2 = _interopRequireDefault(_training);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var Trainer = function () {
  function Trainer() {
    _classCallCheck(this, Trainer);

    this.trainer = new _crfsuite2.default.Trainer();
  }

  _createClass(Trainer, [{
    key: "append",
    value: function append(data_path, count, offset) {
      var _this = this;

      return new Promise(function (resolve, reject) {
        // generate training data...
        var dataStream = (0, _training2.default)(data_path, count, offset);

        // submit training data to the trainer
        dataStream.on("data", function (_ref) {
          var _ref2 = _slicedToArray(_ref, 2),
              xseq = _ref2[0],
              yseq = _ref2[1];

          _this.trainer.append(xseq, yseq);
        });

        dataStream.on("end", resolve);
        dataStream.on("error", reject);
      });
    }
  }, {
    key: "train",
    value: function train(model_filename) {
      this.trainer.train(model_filename);
    }
  }]);

  return Trainer;
}();

exports.default = Trainer;