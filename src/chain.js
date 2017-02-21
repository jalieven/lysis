'use strict';

import Lysis from './index';

class Chain {

	constructor(value, mapErrorFn, context) {
		this.value = value;
		this.mapErrorFn = mapErrorFn;
		this.context = context;
	}

	mandatory(selectors, mapMandatoryFn) {
		const errs = new Lysis(this.value, selectors, this.mapErrorFn, this.context).mandatory(mapMandatoryFn).errors();
		if (errs) {
			this.chainedErrors = this._getErrors().concat(errs);
		}
		return this;
	}

	validate(selectors, fn, tip, ...args) {
		const errs = new Lysis(this.value, selectors, this.mapErrorFn, this.context).validate(fn, tip, ...args).errors();
		if (errs) {
			this.chainedErrors = this._getErrors().concat(errs);
		}
		return this;
	}

	validateCombined(selectors, fn, tip, ...args) {
		const errs = new Lysis(this.value, selectors, this.mapErrorFn, this.context).validateCombined(fn, tip, ...args).errors();
		if (errs) {
			this.chainedErrors = this._getErrors().concat(errs);
		}
		return this;
	}

	sanitize(selectors, fn, ...args) {
		new Lysis(this.value, selectors, this.mapErrorFn, this.context).sanitize(fn, ...args);
		return this;
	}

	_getErrors() {
		return this.chainedErrors || [];
	}

	errors() {
		return this.chainedErrors;
	}

}

export default Chain;
