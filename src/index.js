'use strict';

import set from 'lodash/set';
import some from 'lodash/some';
import every from 'lodash/every';
import isFunction from 'lodash/isFunction';
import isArray from 'lodash/isArray';
import isEmpty from 'lodash/isEmpty';
import objectMatch from 'object-match';

class Validation {

	constructor(value, paths, mapErrorFn, context) {
		this.value = value;
		this.paths = paths;
		this.mapErrorFn = mapErrorFn;
		this.context = context || {};
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

	validate(fn, tip, ...args) {
		if (isArray(this.paths)) {
			// TODO rename paths to selectors and the resulting multiples are paths
			// TODO implement mandatory/optional for multiple paths + test + DRY plz
			this.paths.forEach((path) => {
				objectMatch(path, this.value)
					.forEach((match) => {
						const valid = fn(match.value, ...args);
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
					const valid = fn(match.value, ...args);
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

	validateCombined(fn, tip, ...args) {
		if (isArray(this.paths)) {
			const matches = this.paths.map(path => ({ selector: path, matches: objectMatch(path, this.value) }));
			const valid = fn(matches, ...args);
			if (!valid) {
				if (!this.context.errors) {
					this.context.errors = [];
				}
				if (this.mapErrorFn && isFunction(this.mapErrorFn)) {
					const err = this.mapErrorFn(matches, tip);
					this.context.errors.push(err);
				} else {
					this.context.errors.push({ paths: matches.map(p => p.selector), tip });
				}
			}
		} else {
			this.validate(fn, tip, args);
		}
		return this;
	}

	sanitize(fn, ...args) {
		if (isArray(this.paths)) {
			this.paths.forEach((path) => {
				objectMatch(path, this.value)
					.forEach((match) => {
						set(this.value, match.path, fn(match.value, ...args));
					});
			});
		} else {
			objectMatch(this.paths, this.value)
				.forEach((match) => {
					set(this.value, match.path, fn(match.value, ...args));
				});
		}
		return this;
	}

	errors() {
		return this.context.errors;
	}

}

export const and = predicates => value => every(predicates, predicate => predicate(value));

export const or = predicates => value => some(predicates, predicate => predicate(value));

export default Validation;
