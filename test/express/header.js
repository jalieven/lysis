'use strict';

import agent from 'supertest';
import { isInt, toInt } from 'validator';

import createApp from './util';

describe('Lysis - Express header validation', () => {

	it('check headers invalid', (done) => {
		const app = createApp();
		app.get('/lysis/headers', (req, res) => {
			req.checkHeader('int')
				.validate(isInt, '"int" header must be an integer.')
				.sanitize(toInt, 10);
			if (req.errors) {
				res.status(400).json({ validation: req.errors });
			} else {
				res.status(200).json(req.headers);
			}
		});
		agent(app.listen())
			.get('/lysis/headers')
			.set('int', 'one')
			.query()
			.expect(400)
			.expect((res) => {
				expect(res.body).to.eql({
					validation: [
						{
							path: ['int'],
							tip: '"int" header must be an integer.',
						},
					],
				});
				return false;
			})
			.end(done);
	});

	it('check headers sanitized', (done) => {
		const app = createApp();
		app.get('/lysis/headers', (req, res) => {
			req.checkHeader('int')
				.validate(isInt, '"int" header must be an integer.')
				.sanitize(toInt, 10);
			if (req.errors) {
				res.status(400).json({ validation: req.errors });
			} else {
				res.status(200).json(req.headers);
			}
		});
		agent(app.listen())
			.get('/lysis/headers')
			.set('int', '54')
			.query()
			.expect(200)
			.expect((res) => {
				expect(res.body.int).to.equal(54);
				return false;
			})
			.end(done);
	});

});
