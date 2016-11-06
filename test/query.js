'use strict';

import agent from 'supertest';
import { isBoolean, isInt, toBoolean } from 'validator';

import createApp from './util';
import { and, or } from '../src';

describe('Lysis - query validation', () => {

	it('check query invalid', (done) => {
		const app = createApp();
		app.router.get('/query', function* () {
			this.validateQuery('one')
				.validate(and([isInt, (v) => v % 2 === 0 ]), '"one" must be an even integer.')
				.sanitize(toBoolean);
			if (this.errors) {
				this.status = 400;
				this.body = { validation: this.errors };
			} else {
				this.status = 200;
				this.body = this.request.query;
			}
		});
		agent(app.listen())
			.get('/lysis/query')
			.query({
				one: 5,
			})
			.expect(400)
			.expect((res) => {
				console.log(res.body)
				expect(res.body).to.eql({
					validation: [
						{
							path: [
								'one',
							],
							tip: '"one" must be an even integer.',
						}
					],
				});
				return false;
			})
			.end(done);
	});

	it('check query sanitized', (done) => {
		const app = createApp();
		app.router.get('/query', function* () {
			this.validateQuery('one')
				.validate(or([isBoolean, isInt]), '"one" must be a boolean or an integer.')
				.sanitize(toBoolean);
			this.validateQuery('two')
				.validate(or([isBoolean, isInt]), '"two" must be a boolean or an integer.')
				.sanitize(toBoolean);
			this.validateQuery('three')
				.validate(or([isBoolean, isInt]), '"three" must be a boolean or an integer.')
				.sanitize(toBoolean);
			this.validateQuery('four.*')
				.validate(or([isBoolean, isInt]), '"four" must be an array of booleans or integers.')
				.sanitize(toBoolean);
			if (this.errors) {
				this.status = 400;
				this.body = { validation: this.errors };
			} else {
				this.status = 200;
				this.body = this.request.query;
			}
		});
		agent(app.listen())
			.get('/lysis/query')
			.query({
				one: true,
				two: 3,
				three: '0',
				four: [
					true,
					false,
					-1,
					'1',
				],
			})
			.expect(200)
			.expect((res) => {
				expect(res.body).to.eql({ one: true, two: true, three: false, four: [ true, false, true, true ] });
				return false;
			})
			.end(done);
	});

});
