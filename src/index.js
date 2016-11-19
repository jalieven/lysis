'use strict';

import map from 'lodash/map';
import forEach from 'lodash/forEach';
import assign from 'lodash/assign';
import set from 'lodash/set';
import some from 'lodash/some';
import every from 'lodash/every';
import isFunction from 'lodash/isFunction';
import isArray from 'lodash/isArray';
import isEmpty from 'lodash/isEmpty';
import isString from 'lodash/isString';

import { matcher } from './util';

class Lysis {

	constructor(value, selectors, mapErrorFn, context) {
		this.value = value;
		if (isString(selectors)) {
			this.selectors = [selectors];
		} else if (isArray(selectors)) {
			this.selectors = selectors;
		}
		this.mapErrorFn = mapErrorFn;
		this.context = context || {};
		this.matches = {};
		forEach(this.selectors, (selector) => {
			this.matches[selector] = matcher(selector, this.value);
		});
	}

	mandatory(mapMandatoryFn) {
		forEach(this.selectors, (selector) => {
			if (isEmpty(this.matches[selector])) {
				if (!this.context.errors) {
					this.context.errors = [];
				}
				if (mapMandatoryFn && isFunction(mapMandatoryFn)) {
					const mandatoryErr = mapMandatoryFn(this.selectors);
					this.context.errors.push(mandatoryErr);
				} else {
					this.context.errors.push({ selector, tip: `${selector} is mandatory.` });
				}
			}
		});
		return this;
	}

	validate(fn, tip, ...args) {
		forEach(this.matches, (selectorMatches, selector) => {
			forEach(selectorMatches, (match) => {
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
		return this;
	}

	validateCombined(fn, tip, ...args) {
		if (isArray(this.selectors)) {
			const functionMatches = {};
			const combinedMatches = map(this.selectors, (selector) => {
				const matches = matcher(selector, this.value);
				if (isEmpty(matches) && !this.isOptional) {
					if (!this.context.errors) {
						this.context.errors = [];
					}
					if (this.mapMandatoryFn && isFunction(this.mapMandatoryFn)) {
						const mandatoryErr = this.mapMandatoryFn(selector);
						this.context.errors.push(mandatoryErr);
					} else {
						this.context.errors.push({ selector, tip: `${selector} is mandatory.` });
					}
				}
				const values = map(matches, 'value');
				const result = {};
				result[selector] = values;
				assign(functionMatches, result);
				return { selector, matches };
			});
			const valid = fn(functionMatches, ...args);
			if (!valid) {
				if (!this.context.errors) {
					this.context.errors = [];
				}
				if (this.mapErrorFn && isFunction(this.mapErrorFn)) {
					const err = this.mapErrorFn(combinedMatches, tip);
					this.context.errors.push(err);
				} else {
					this.context.errors.push({ selectors: map(combinedMatches, p => p.selector), tip });
				}
			}
		} else {
			this.validate(fn, tip, args);
		}
		return this;
	}

	sanitize(fn, ...args) {
		forEach(this.matches, (matches) => {
			forEach(matches, (match) => {
				set(this.value, match.path, fn(match.value, ...args));
			});
		});
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
