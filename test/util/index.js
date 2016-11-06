'use strict';

import koa from 'koa';
import bodyParser from 'koa-bodyparser';
import Router from 'koa-router';

import validate from '../../src';

const createApp = () => {
	const app = koa();
	app.on('error', (err) => {
		console.error(err, 'Server error');
	});
	validate(app);
	app.use(bodyParser());
	const voaRouter = new Router({ prefix: '/lysis' });
	app.use(voaRouter.routes()).use(voaRouter.allowedMethods());
	app.use(function* (next) {
		try {
			yield next;
		} catch (err) {
			console.log(err.stack)
			this.app.emit('error', err, this);
		}
	});
	app.router = voaRouter;
	return app;
};

export default createApp;
