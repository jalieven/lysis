'use strict';

import agent from 'supertest';
import { isBoolean, isInt, toBoolean } from 'validator';

import createApp from './util';
import { and, or, not } from '../../src';

describe('Lysis - Express query validation', () => {

	it('check query invalid', (done) => {
		const app = createApp();
		app.get('/lysis/query', (req, res) => {
			const isEven = v => v % 2 === 0;
			req.checkQuery('one')
				.validate(and(isInt, isEven), '"one" must be an even integer.')
				.sanitize(toBoolean);
			req.checkQuery('two')
				.validate(and(isInt, isEven), '"two" must be an even integer.')
				.sanitize(toBoolean);
			if (req.errors) {
				res.status(400).json({ validation: req.errors });
			} else {
				res.status(200).json(req.query);
			}
		});
		agent(app.listen())
			.get('/lysis/query')
			.query({
				one: 5,
				two: 2,
			})
			.expect(400)
			.expect((res) => {
				expect(res.body).to.eql({
					validation: [
						{
							path: [
								'one',
							],
							tip: '"one" must be an even integer.',
						},
					],
				});
				return false;
			})
			.end(done);
	});

	it('check query invalid (composition)', (done) => {
		const app = createApp();
		app.get('/lysis/query', (req, res) => {
			req.checkQuery('one')
				.validate(and(not(isInt), not(isBoolean)), '"one" cannot be an integer nor can it be a boolean.')
				.sanitize(toBoolean);
			req.checkQuery('two')
				.validate(and(not(isInt), not(isBoolean)), '"two" cannot be an integer nor can it be a boolean.')
				.sanitize(toBoolean);
			if (req.errors) {
				res.status(400).json({ validation: req.errors });
			} else {
				res.status(200).json(req.query);
			}
		});
		agent(app.listen())
			.get('/lysis/query')
			.query({
				one: 5,
				two: 'truethy',
			})
			.expect(400)
			.expect((res) => {
				expect(res.body).to.eql({
					validation: [
						{
							path: [
								'one',
							],
							tip: '"one" cannot be an integer nor can it be a boolean.',
						},
					],
				});
				return false;
			})
			.end(done);
	});

	it('check query invalid (multiple paths and error mapping)', (done) => {
		const app = createApp();
		app.get('/lysis/query', (req, res) => {
			const errMapping = (match, tip) =>
				({ path: match.path, name: match.key, message: `${match.path.join('/')} with value of "${match.value}" must be a boolean or an integer!` });
			req.checkQuery(['one', 'two', 'three', 'four.*'], errMapping)
				.mandatory()
				.validate(or(isBoolean, isInt), '"one" must be a boolean or an integer.')
				.sanitize(toBoolean);
			if (req.errors) {
				res.status(400).json({ validation: req.errors });
			} else {
				res.status(200).json(req.query);
			}
		});
		agent(app.listen())
			.get('/lysis/query')
			.query({
				one: 'one',
				three: 'zero',
				four: [
					'truethy',
					'-10.8',
				],
			})
			.expect(400)
			.expect((res) => {
				expect(res.body).to.eql({
					validation: [
						{
							selector: 'two',
							tip: 'two is mandatory.',
						},
						{
							path: [
								'one',
							],
							name: 'one',
							message: 'one with value of "one" must be a boolean or an integer!',
						},
						{
							path: [
								'three',
							],
							name: 'three',
							message: 'three with value of "zero" must be a boolean or an integer!',
						},
						{
							path: [
								'four',
								'0',
							],
							name: '0',
							message: 'four/0 with value of "truethy" must be a boolean or an integer!',
						},
						{
							path: [
								'four',
								'1',
							],
							name: '1',
							message: 'four/1 with value of "-10.8" must be a boolean or an integer!',
						},
					],
				});
				return false;
			})
			.end(done);
	});

	it('check query sanitized', (done) => {
		const app = createApp();
		app.get('/lysis/query', (req, res) => {
			const errMapping = (match, tip) =>
				({ name: match.key, message: `${match.key} with value of "${match.value}" must be a boolean or an integer!` });
			req.checkQuery(['one', 'two', 'three', 'four.*'], errMapping)
				.validate(or(isBoolean, isInt), '"one" must be a boolean or an integer.')
				.sanitize(toBoolean);
			if (req.errors) {
				res.status(400).json({ validation: req.errors });
			} else {
				res.status(200).json(req.query);
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
				expect(res.body).to.eql({
					one: true,
					two: true,
					three: false,
					four: [
						true,
						false,
						true,
						true,
					],
				});
				return false;
			})
			.end(done);
	});

});
