'use strict';

import agent from 'supertest';
import { isInt, toInt, isFloat, toFloat } from 'validator';

import createApp from './util';

describe('Lysis - Express body validation', () => {

	it('check body valid', (done) => {
		const app = createApp();
		app.post('/lysis/body', (req, res) => {
			req.checkBody('one.*.three')
				.mandatory()
				.validate(isInt, '"three" must be an integer.')
				.sanitize(toInt, 10);
			if (req.errors) {
				res.status(400).json({ validation: req.errors });
			} else {
				res.status(200).json(req.body);
			}
		});
		agent(app.listen())
			.post('/lysis/body')
			.send({
				one: {
					two: {
						three: '33',
					},
				},
			})
			.expect(200)
			.expect((res) => {
				expect(res.body).to.eql({
					one: {
						two: {
							three: 33,
						},
					},
				});
				return false;
			})
			.end(done);
	});

	it('check body invalid', (done) => {
		const app = createApp();
		app.post('/lysis/body', (req, res) => {
			req.checkBody('one.*.three')
				.mandatory()
				.validate(isInt, '"three" must be an integer.')
				.sanitize(toInt, 10);
			if (req.errors) {
				res.status(400).json({ validation: req.errors });
			} else {
				res.status(200).json(req.body);
			}
		});
		agent(app.listen())
			.post('/lysis/body')
			.send({
				one: {
					two: {
						three: 'fourtythree',
					},
				},
			})
			.expect(400)
			.expect((res) => {
				expect(res.body).to.eql({
					validation: [
						{
							path: [
								'one',
								'two',
								'three',
							],
							tip: '"three" must be an integer.',
						},
					],
				});
				return false;
			})
			.end(done);
	});

});
