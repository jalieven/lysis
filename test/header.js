'use strict';

import agent from 'supertest';
import { isInt, toInt } from 'validator';

import createApp from './util';

describe('Lysis - Koa header validation', () => {

	it('check headers invalid', (done) => {
		const app = createApp();
		app.router.get('/headers', function* () {
			this.validateHeader('int')
				.validate(isInt, '"int" header must be an integer.')
				.sanitize(toInt, 10);
			if (this.errors) {
				this.status = 400;
				this.body = { validation: this.errors };
			} else {
				this.status = 200;
				this.body = this.headers;
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
		app.router.get('/headers', function* () {
			this.validateHeader('int')
				.validate(isInt, '"int" header must be an integer.')
				.sanitize(toInt, 10);
			if (this.errors) {
				this.status = 400;
				this.body = { validation: this.errors };
			} else {
				this.status = 200;
				this.body = this.headers;
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
