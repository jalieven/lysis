'use strict';

import agent from 'supertest';
import { isInt, toInt, isFloat, toFloat } from 'validator';

import createApp from './util';

describe('Lysis - body validation', () => {

	it('check body invalid (part 1)', (done) => {
		const app = createApp();
		app.router.post('/body', function* () {
			this.validateBody('one.*.three')
				.validate(isInt, '"three" must be an integer.')
				.sanitize(toInt, 10);
			if (this.errors) {
				this.status = 400;
				this.body = { validation: this.errors };
			} else {
				this.status = 200;
				this.body = this.request.body;
			}
		});
		agent(app.listen())
			.post('/lysis/body')
			.send({
				one: {
					two: {
						three: "fourtythree",
					},
				},
			})
			.expect(400)
			.expect((res) => {
				console.log('body', res.body);
				return false;
			})
			.end(done);
	});

	it('check body invalid (part 2)', (done) => {
		const app = createApp();
		app.router.post('/body', function* () {
			this.validateBody('one.*.three')
				.validate(isInt, '"three" must be an integer.')
				.validate((three) => three < 0, '"three" must be negative.')
				.sanitize(toInt, 10);
			if (this.errors) {
				this.status = 400;
				this.body = { validation: this.errors };
			} else {
				this.status = 200;
				this.body = this.request.body;
			}
		});
		agent(app.listen())
			.post('/lysis/body')
			.send({
				one: {
					two: {
						three: "42",
					},
				},
			})
			.expect(400)
			.expect((res) => {
				console.log('body', res.body);
				return false;
			})
			.end(done);
	});

	it('check body invalid (part 3)', (done) => {
		const app = createApp();
		app.router.post('/body', function* () {
			this.validateBody('one.*.three')
				.validate(isInt, '"three" must be an integer.')
				.validate((three) => three < 0, '"three" must be negative.')
				.sanitize(toInt, 10);
			this.validateBody('one.four.*.five.six')
				.validate(isFloat, '"six" must be a float.')
				.sanitize((v) => toFloat(v));
			if (this.errors) {
				this.status = 400;
				this.body = { validation: this.errors };
			} else {
				this.status = 200;
				this.body = this.request.body;
			}
		});
		agent(app.listen())
			.post('/lysis/body')
			.send({
				one: {
					two: {
						three: "42",
					},
					four: [
						{
							five: {
								six: 'one',
							},
						},
						{
							five: {
								six: 'six',
							},
						},
					],
				},
			})
			.expect(400)
			.expect((res) => {
				console.log('body', res.body);
				return false;
			})
			.end(done);
	});

	it('check body sanitized (part 1)', (done) => {
		const app = createApp();
		app.router.post('/body', function* () {
			this.validateBody('one.*.three')
				.validate(isInt, '"three" must be an integer.')
				.validate((three) => three < 0, '"three" must be negative.')
				.sanitize(toInt, 10);
			if (this.errors) {
				this.status = 400;
				this.body = { validation: this.errors };
			} else {
				this.status = 200;
				this.body = this.request.body;
			}
		});
		agent(app.listen())
			.post('/lysis/body')
			.send({
				one: {
					two: {
						three: "-42",
					},
				},
			})
			.expect(200)
			.expect((res) => {
				expect(res.body).to.eql({
					one: {
						two: {
							three: -42,
						},
					},
				});
				return false;
			})
			.end(done);
	});

	it('check body sanitized (part 2)', (done) => {
		const app = createApp();
		app.router.post('/body', function* () {
			this.validateBody('one.*.three')
				.sanitize(toInt, 10);
			if (this.errors) {
				this.status = 400;
				this.body = { validation: this.errors };
			} else {
				this.status = 200;
				this.body = this.request.body;
			}
		});
		agent(app.listen())
			.post('/lysis/body')
			.send({
				one: {
					two: {
						three: "544",
					},
				},
			})
			.expect(200)
			.expect((res) => {
				console.log(res.body)
				return false;
			})
			.end(done);
	});

	it('check body sanitized (part 3)', (done) => {
		const app = createApp();
		app.router.post('/body', function* () {
			this.validateBody('*.one.two.three')
				.sanitize(toInt, 10)
				.sanitize((v) => v / 5);
			if (this.errors) {
				this.status = 400;
				this.body = { validation: this.errors };
			} else {
				this.status = 200;
				this.body = this.request.body;
			}
		});
		agent(app.listen())
			.post('/lysis/body')
			.send([
				{
					one: {
						two: {
							three: "25",
						},
					},
				}
			])
			.expect(200)
			.expect((res) => {
				expect(res.body).to.eql([
					{
						one: {
							two: {
								three: 5,
							},
						},
					},
				]);
				return false;
			})
			.end(done);
	});

});
