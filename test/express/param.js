'use strict';

import agent from 'supertest';
import { isInt, toInt } from 'validator';

import createApp from './util';

describe('Lysis - Express param validation', () => {

	it('check param invalid (with custom error mapping)', (done) => {
		const app = createApp();
		app.get('/lysis/param/:id', (req, res) => {
			const errMapping = (match, tip) =>
				({ name: 'id', message: `${match.key} with value of "${match.value}" is not an integer!`, tip });
			req.checkParam('id', errMapping)
				.validate(isInt, '"id" must be an integer.')
				.sanitize(toInt, 10);
			if (req.errors) {
				res.status(400).json({ validation: req.errors });
			} else {
				res.status(200).json(req.params);
			}
		});
		agent(app.listen())
			.get('/lysis/param/one')
			.query()
			.expect(400)
			.expect((res) => {
				expect(res.body).to.eql({
					validation: [
						{
							name: 'id',
							message: 'id with value of "one" is not an integer!',
							tip: '"id" must be an integer.',
						},
					],
				});
				return false;
			})
			.end(done);
	});

	it('check param sanitized', (done) => {
		const app = createApp();
		app.get('/lysis/param/:id', (req, res) => {
			req.checkParam('id')
				.validate(isInt, '"id" must be an integer.')
				.sanitize(toInt, 10);
			if (req.errors) {
				res.status(400).json({ validation: req.errors });
			} else {
				res.status(200).json(req.params);
			}
		});
		agent(app.listen())
			.get('/lysis/param/45')
			.query()
			.expect(200)
			.expect((res) => {
				expect(res.body).to.eql({ id: 45 });
				return false;
			})
			.end(done);
	});

});
