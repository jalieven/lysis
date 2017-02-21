'use strict';

import map from 'lodash/map';
import mapValues from 'lodash/mapValues';
import keys from 'lodash/keys';
import forEach from 'lodash/forEach';
import assign from 'lodash/assign';
import set from 'lodash/set';
import isFunction from 'lodash/isFunction';
import isArray from 'lodash/isArray';
import isEmpty from 'lodash/isEmpty';
import isString from 'lodash/isString';

import { matcher } from './util';

class Lysis {

	constructor(value, selectors = [], mapErrorFn, context) {
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
		const functionMatches = mapValues(this.matches, matches => map(matches, 'value'));
		const valid = fn(functionMatches, ...args);
		if (!valid) {
			if (!this.context.errors) {
				this.context.errors = [];
			}
			if (this.mapErrorFn && isFunction(this.mapErrorFn)) {
				const err = this.mapErrorFn(this.matches, tip);
				this.context.errors.push(err);
			} else {
				this.context.errors.push({ selectors: keys(this.matches), tip });
			}
		}
		return this;
	}

	sanitize(fn, ...args) {
		forEach(this.matches, (matches) => {
			forEach(matches, (match) => {
				const sanitizedValue = fn(match.value, ...args);
				/* eslint-disable no-param-reassign */
				match.value = sanitizedValue;
				/* eslint-enable no-param-reassign */
				set(this.value, match.path, sanitizedValue);
			});
		});
		return this;
	}

	errors() {
		return this.context.errors;
	}

}

export default Lysis;
