'use strict';

import koa from 'koa';
import bodyParser from 'koa-bodyparser';
import Router from 'koa-router';

import { validateKoa } from '../../src';

const createApp = () => {
	const app = koa();
	app.on('error', (err) => {
		console.error(err, 'Server error');
	});
	validateKoa(app);
	app.use(bodyParser());
	const lysisRouter = new Router({ prefix: '/lysis' });
	app.use(lysisRouter.routes()).use(lysisRouter.allowedMethods());
	app.use(function* (next) {
		try {
			yield next;
		} catch (err) {
			this.app.emit('error', err, this);
		}
	});
	app.router = lysisRouter;
	return app;
};

export default createApp;
