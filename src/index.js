'use strict';

import set from 'lodash/set';
import some from 'lodash/some';
import every from 'lodash/every';
import isFunction from 'lodash/isFunction';
import isArray from 'lodash/isArray';
import isEmpty from 'lodash/isEmpty';
import objectMatch from 'object-match';

class Validation {

	constructor(context, value, paths, mapErrorFn) {
		this.context = context;
		this.value = value;
		this.paths = paths;
		this.mapErrorFn = mapErrorFn;
		this.isOptional = false;
	}

	optional() {
		this.isOptional = true;
		return this;
	}

	mandatory(mapMandatoryFn) {
		this.isOptional = false;
		this.mapMandatoryFn = mapMandatoryFn;
		return this;
	}

	validate(fn, tip, args) {
		const argz = args || [];
		if (isArray(this.paths)) {
			// TODO implement mandatory/optional for multiple paths + test + DRY plz
			this.paths.forEach((path) => {
				objectMatch(path, this.value)
					.forEach((match) => {
						const valid = fn(match.value, ...argz);
						if (!valid) {
							if (!this.context.errors) {
								this.context.errors = [];
							}
							if (this.mapErrorFn && isFunction(this.mapErrorFn)) {
								const err = this.mapErrorFn(match, tip);
								this.context.errors.push(err);
							} else {
								this.context.errors.push({ path: match.path, tip });
							}
						}
					});
			});
		} else {
			const matches = objectMatch(this.paths, this.value);
			if (isEmpty(matches) && !this.isOptional) {
				if (!this.context.errors) {
					this.context.errors = [];
				}
				if (this.mapMandatoryFn && isFunction(this.mapMandatoryFn)) {
					const mandatoryErr = this.mapMandatoryFn(this.paths);
					this.context.errors.push(mandatoryErr);
				} else {
					this.context.errors.push({ path: this.paths, tip: `${this.paths} is mandatory.` });
				}
			} else {
				matches.forEach((match) => {
					const valid = fn(match.value, ...argz);
					if (!valid) {
						if (!this.context.errors) {
							this.context.errors = [];
						}
						if (this.mapErrorFn && isFunction(this.mapErrorFn)) {
							const err = this.mapErrorFn(match, tip);
							this.context.errors.push(err);
						} else {
							this.context.errors.push({ path: match.path, tip });
						}
					}
				});
			}
		}
		return this;
	}

	sanitize(fn, args) {
		const argz = args || [];
		if (isArray(this.paths)) {
			this.paths.forEach((path) => {
				objectMatch(path, this.value)
					.forEach((match) => {
						set(this.value, match.path, fn(match.value, ...argz));
					});
			});
		} else {
			objectMatch(this.paths, this.value)
				.forEach((match) => {
					set(this.value, match.path, fn(match.value, ...argz));
				});
		}
		return this;
	}

}

const validate = (app) => {
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

export const and = predicates => value => every(predicates, predicate => predicate(value));

export const or = predicates => value => some(predicates, predicate => predicate(value));

export default validate;
