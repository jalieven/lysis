'use strict';

import Validation from '.';

export const validate = (app) => {
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
