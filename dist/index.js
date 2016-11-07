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

var _isFunction = require('lodash/isFunction');

var _isFunction2 = _interopRequireDefault(_isFunction);

var _isArray = require('lodash/isArray');

var _isArray2 = _interopRequireDefault(_isArray);

var _isEmpty = require('lodash/isEmpty');

var _isEmpty2 = _interopRequireDefault(_isEmpty);

var _objectMatch = require('object-match');

var _objectMatch2 = _interopRequireDefault(_objectMatch);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _toConsumableArray(arr) { if (Array.isArray(arr)) { for (var i = 0, arr2 = Array(arr.length); i < arr.length; i++) { arr2[i] = arr[i]; } return arr2; } else { return Array.from(arr); } }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var Validation = function () {
	function Validation(context, value, paths, mapErrorFn) {
		_classCallCheck(this, Validation);

		this.context = context;
		this.value = value;
		this.paths = paths;
		this.mapErrorFn = mapErrorFn;
		this.isOptional = false;
	}

	_createClass(Validation, [{
		key: 'optional',
		value: function optional() {
			this.isOptional = true;
			return this;
		}
	}, {
		key: 'mandatory',
		value: function mandatory(mapMandatoryFn) {
			this.isOptional = false;
			this.mapMandatoryFn = mapMandatoryFn;
			return this;
		}
	}, {
		key: 'validate',
		value: function validate(fn, tip, args) {
			var _this = this;

			var argz = args || [];
			if ((0, _isArray2.default)(this.paths)) {
				// TODO implement mandatory/optional for multiple paths + test + DRY plz
				this.paths.forEach(function (path) {
					(0, _objectMatch2.default)(path, _this.value).forEach(function (match) {
						var valid = fn.apply(undefined, [match.value].concat(_toConsumableArray(argz)));
						if (!valid) {
							if (!_this.context.errors) {
								_this.context.errors = [];
							}
							if (_this.mapErrorFn && (0, _isFunction2.default)(_this.mapErrorFn)) {
								var err = _this.mapErrorFn(match, tip);
								_this.context.errors.push(err);
							} else {
								_this.context.errors.push({ path: match.path, tip: tip });
							}
						}
					});
				});
			} else {
				var matches = (0, _objectMatch2.default)(this.paths, this.value);
				if ((0, _isEmpty2.default)(matches) && !this.isOptional) {
					if (!this.context.errors) {
						this.context.errors = [];
					}
					if (this.mapMandatoryFn && (0, _isFunction2.default)(this.mapMandatoryFn)) {
						var mandatoryErr = this.mapMandatoryFn(this.paths);
						this.context.errors.push(mandatoryErr);
					} else {
						this.context.errors.push({ path: this.paths, tip: this.paths + ' is mandatory.' });
					}
				} else {
					matches.forEach(function (match) {
						var valid = fn.apply(undefined, [match.value].concat(_toConsumableArray(argz)));
						if (!valid) {
							if (!_this.context.errors) {
								_this.context.errors = [];
							}
							if (_this.mapErrorFn && (0, _isFunction2.default)(_this.mapErrorFn)) {
								var err = _this.mapErrorFn(match, tip);
								_this.context.errors.push(err);
							} else {
								_this.context.errors.push({ path: match.path, tip: tip });
							}
						}
					});
				}
			}
			return this;
		}
	}, {
		key: 'sanitize',
		value: function sanitize(fn, args) {
			var _this2 = this;

			var argz = args || [];
			if ((0, _isArray2.default)(this.paths)) {
				this.paths.forEach(function (path) {
					(0, _objectMatch2.default)(path, _this2.value).forEach(function (match) {
						(0, _set2.default)(_this2.value, match.path, fn.apply(undefined, [match.value].concat(_toConsumableArray(argz))));
					});
				});
			} else {
				(0, _objectMatch2.default)(this.paths, this.value).forEach(function (match) {
					(0, _set2.default)(_this2.value, match.path, fn.apply(undefined, [match.value].concat(_toConsumableArray(argz))));
				});
			}
			return this;
		}
	}]);

	return Validation;
}();

var validate = function validate(app) {
	/* eslint-disable no-param-reassign */
	app.context.validateQuery = function (paths, mapErrorFn) {
		return new Validation(this, this.request.query, paths, mapErrorFn);
	};
	app.context.validateParam = function (paths, mapErrorFn) {
		return new Validation(this, this.params, paths, mapErrorFn);
	};
	app.context.validateHeader = function (paths, mapErrorFn) {
		return new Validation(this, this.headers, paths, mapErrorFn);
	};
	app.context.validateBody = function (paths, mapErrorFn) {
		return new Validation(this, this.request.body, paths, mapErrorFn);
	};
	/* eslint-enable no-param-reassign */
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

exports.default = validate;