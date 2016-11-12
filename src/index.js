'use strict';

import set from 'lodash/set';
import some from 'lodash/some';
import every from 'lodash/every';
import isFunction from 'lodash/isFunction';
import isArray from 'lodash/isArray';
import isEmpty from 'lodash/isEmpty';

import { matcher } from './util';

class Lysis {

	constructor(value, selectors, mapErrorFn, context) {
		this.value = value;
		this.selectors = selectors;
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
		if (isArray(this.selectors)) {
			// TODO load-test lysis
			// TODO implement mandatory/optional for multiple paths + test + DRY plz
			// TODO fix the matches structure in the validateCombined (should be an object with selectors as key and match.value (or array) as value)
			this.selectors.forEach((selector) => {
				matcher(selector, this.value)
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
				// TODO mandatory doesn't work for this case: check that for each selector there is a match!
			});
		} else {
			const matches = matcher(this.selectors, this.value);
			if (isEmpty(matches) && !this.isOptional) {
				if (!this.context.errors) {
					this.context.errors = [];
				}
				if (this.mapMandatoryFn && isFunction(this.mapMandatoryFn)) {
					const mandatoryErr = this.mapMandatoryFn(this.selectors);
					this.context.errors.push(mandatoryErr);
				} else {
					this.context.errors.push({ selector: this.selectors, tip: `${this.selectors} is mandatory.` });
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
		// TODO what about mandatory in this case?
		if (isArray(this.selectors)) {
			const matches = this.selectors.map(selector => ({ selector, matches: matcher(selector, this.value) }));
			const valid = fn(matches, ...args);
			if (!valid) {
				if (!this.context.errors) {
					this.context.errors = [];
				}
				if (this.mapErrorFn && isFunction(this.mapErrorFn)) {
					const err = this.mapErrorFn(matches, tip);
					this.context.errors.push(err);
				} else {
					this.context.errors.push({ selectors: matches.map(p => p.selector), tip });
				}
			}
		} else {
			this.validate(fn, tip, args);
		}
		return this;
	}

	sanitize(fn, ...args) {
		if (isArray(this.selectors)) {
			this.selectors.forEach((selector) => {
				matcher(selector, this.value)
					.forEach((match) => {
						set(this.value, match.path, fn(match.value, ...args));
					});
			});
		} else {
			matcher(this.selectors, this.value)
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

export const and = (...predicates) => (value, ...args) => every(predicates, predicate => predicate(value, ...args));

export const or = (...predicates) => (value, ...args) => some(predicates, predicate => predicate(value, ...args));

export const not = predicate => (value, ...args) => !predicate(value, ...args);

export default Lysis;
