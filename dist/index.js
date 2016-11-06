'use strict';

Object.defineProperty(exports, "__esModule", {
	value: true
});
exports.or = exports.and = undefined;

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _set = require('lodash/set');

var _set2 = _interopRequireDefault(_set);

var _some = require('lodash/some');

var _some2 = _interopRequireDefault(_some);

var _every = require('lodash/every');

var _every2 = _interopRequireDefault(_every);

var _objectMatch = require('object-match');

var _objectMatch2 = _interopRequireDefault(_objectMatch);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _toConsumableArray(arr) { if (Array.isArray(arr)) { for (var i = 0, arr2 = Array(arr.length); i < arr.length; i++) { arr2[i] = arr[i]; } return arr2; } else { return Array.from(arr); } }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var validate = function validate(app) {
	app.context.validateQuery = function (path, key) {
		return new Validation(this, this.request.query, path, key);
	};
	app.context.validateParam = function (path, key) {
		return new Validation(this, this.params, path, key);
	};
	app.context.validateHeader = function (path, key) {
		return new Validation(this, this.headers, path, key);
	};
	app.context.validateBody = function (path, key) {
		return new Validation(this, this.request.body, path, key);
	};
};

var and = exports.and = function and(predicates) {
	return function (value) {
		return (0, _every2.default)(predicates, function (predicate) {
			return predicate(value);
		});
	};
};

var or = exports.or = function or(predicates) {
	return function (value) {
		return (0, _some2.default)(predicates, function (predicate) {
			return predicate(value);
		});
	};
};

var Validation = function () {
	function Validation(context, value, path, key) {
		_classCallCheck(this, Validation);

		this.context = context;
		this.value = value;
		this.path = path;
		this.key = key;
	}

	_createClass(Validation, [{
		key: 'optional',
		value: function optional() {
			this.optional = true;
			return this;
		}
	}, {
		key: 'validate',
		value: function validate(fn, tip, args) {
			var _this = this;

			var argz = args || [];
			(0, _objectMatch2.default)(this.path, this.value).forEach(function (match) {

				var valid = fn.apply(undefined, [match.value].concat(_toConsumableArray(argz)));
				if (!valid) {
					if (!_this.context.errors) {
						_this.context.errors = [];
					}
					_this.context.errors.push({ path: match.path, tip: tip });
				}
			});
			return this;
		}
	}, {
		key: 'sanitize',
		value: function sanitize(fn, args) {
			var _this2 = this;

			var argz = args || [];
			(0, _objectMatch2.default)(this.path, this.value).forEach(function (match) {
				(0, _set2.default)(_this2.value, match.path, fn.apply(undefined, [match.value].concat(_toConsumableArray(argz))));
			});
			return this;
		}
	}]);

	return Validation;
}();

exports.default = validate;