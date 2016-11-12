'use strict';

import express from 'express';
import bodyParser from 'body-parser';

import { validate } from '../../../src/express';

const createApp = () => {
	const app = express();
	app.use(bodyParser.json());
	app.use(validate);
	return app;
};

export default createApp;
