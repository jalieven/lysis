'use strict';

import agent from 'supertest';
import { isInt, toInt, isFloat, toFloat } from 'validator';

import createApp from './util';

describe('Lysis - Koa body validation', () => {

	it('check body invalid (part 1)', (done) => {
		const app = createApp();
		app.router.post('/body', function* () {
			this.checkBody('one.*.three')
				.mandatory()
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

	it('check body invalid (part 2)', (done) => {
		const app = createApp();
		app.router.post('/body', function* () {
			this.checkBody('one.*.three')
				.validate(isInt, '"three" must be an integer.')
				.validate(three => three < 0, '"three" must be negative.')
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
						three: '42',
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
							tip: '"three" must be negative.',
						},
					],
				});
				return false;
			})
			.end(done);
	});

	it('check body invalid (part 3)', (done) => {
		const app = createApp();
		app.router.post('/body', function* () {
			this.checkBody('one.*.three')
				.validate(isInt, '"three" must be an integer.')
				.validate(three => three < 0, '"three" must be negative.')
				.sanitize(toInt, 10);
			this.checkBody('one.four.*.five.six')
				.validate(isFloat, '"six" must be a float.')
				.sanitize(v => toFloat(v));
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
						three: '42',
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
				expect(res.body).to.eql({
					validation: [
						{
							path: [
								'one',
								'two',
								'three',
							],
							tip: '"three" must be negative.',
						},
						{
							path: [
								'one',
								'four',
								'0',
								'five',
								'six',
							],
							tip: '"six" must be a float.',
						},
						{
							path: [
								'one',
								'four',
								'1',
								'five',
								'six',
							],
							tip: '"six" must be a float.',
						},
					],
				});
				return false;
			})
			.end(done);
	});

	it('check body invalid (part 4)', (done) => {
		const app = createApp();
		app.router.post('/body', function* () {
			this.checkBody('one.*.three')
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
			.send({})
			.expect(400)
			.expect((res) => {
				expect(res.body).to.eql({
					validation: [
						{
							path: 'one.*.three',
							tip: 'one.*.three is mandatory.',
						},
					],
				});
				return false;
			})
			.end(done);
	});

	it('check body invalid (part 5)', (done) => {
		const app = createApp();
		app.router.post('/body', function* () {
			this.checkBody('one.*.three')
				.optional()
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
			.send({})
			.expect(200)
			.expect((res) => {
				expect(res.body).to.eql({});
				return false;
			})
			.end(done);
	});

	it('check body invalid (part 6)', (done) => {
		const app = createApp();
		app.router.post('/body', function* () {
			const mandatoryMapping = path => ({ message: `${path} is mandatory!!!` });
			this.checkBody('one.*.three')
				.mandatory(mandatoryMapping)
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
			.send({})
			.expect(400)
			.expect((res) => {
				expect(res.body).to.eql({
					validation: [
						{
							message: 'one.*.three is mandatory!!!',
						},
					],
				});
				return false;
			})
			.end(done);
	});

	it('check body sanitized (part 1)', (done) => {
		const app = createApp();
		app.router.post('/body', function* () {
			this.checkBody('one.*.three')
				.validate(isInt, '"three" must be an integer.')
				.validate(three => three < 0, '"three" must be negative.')
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
						three: '-42',
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
			this.checkBody('one.*.three')
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
						three: '544',
					},
				},
			})
			.expect(200)
			.expect((res) => {
				expect(res.body).to.eql({
					one: {
						two: {
							three: 544,
						},
					},
				});
				return false;
			})
			.end(done);
	});

	it('check body sanitized (part 3)', (done) => {
		const app = createApp();
		app.router.post('/body', function* () {
			this.checkBody('one.*.three')
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
				one: {},
			})
			.expect(200)
			.expect((res) => {
				expect(res.body).to.eql({
					one: {},
				});
				return false;
			})
			.end(done);
	});

	it('check body sanitized (part 4)', (done) => {
		const app = createApp();
		app.router.post('/body', function* () {
			this.checkBody('*.one.two.three')
				.sanitize(toInt, 10)
				.sanitize(v => v / 5);
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
							three: '25',
						},
					},
				},
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
