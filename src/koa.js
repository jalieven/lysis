'use strict';

import Lysis from '.';

export const validate = (app) => {
	/* eslint-disable no-param-reassign */
	app.context.checkQuery = function (paths, mapErrorFn) {
		return new Lysis(this.request.query, paths, mapErrorFn, this);
	};
	app.context.checkParam = function (paths, mapErrorFn) {
		return new Lysis(this.params, paths, mapErrorFn, this);
	};
	app.context.checkHeader = function (paths, mapErrorFn) {
		return new Lysis(this.headers, paths, mapErrorFn, this);
	};
	app.context.checkBody = function (paths, mapErrorFn) {
		return new Lysis(this.request.body, paths, mapErrorFn, this);
	};
	/* eslint-enable no-param-reassign */
};
