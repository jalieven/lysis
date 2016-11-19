'use strict';

import map from 'lodash/map';
import keys from 'lodash/keys';
import agent from 'supertest';
import moment from 'moment';
import { isBoolean, isInt, toBoolean, isURL, isEmpty, escape, trim } from 'validator';

import Lysis, { and, or, not } from '../src';

describe('Lysis - Standalone validation', () => {

	it('check validate', () => {
		const toValidate = {
			one: 'ftp://somewhere.com',
			two: 'https://www.google.com',
		};
		const errorMapper = match => ({ message: `${match.key} with value of "${match.value}" is not a valid HTTP url!` });
		const validationErrors = new Lysis(toValidate, ['one', 'two'], errorMapper)
			.validate(isURL, 'Please provide a valid url.', { protocols: ['http', 'https'] })
			.errors();
		expect(validationErrors).to.eql([
			{
				message: `one with value of "${toValidate.one}" is not a valid HTTP url!`,
			},
		]);
	});

	it('check multi validate and mandatory', () => {
		const toValidate = {
			one: '',
		};
		const validationErrors = new Lysis(toValidate, ['one', 'two'])
			.mandatory()
			.sanitize(trim)
			.validate(not(isEmpty), 'Url cannot be empty.')
			.validate(isURL, 'Please provide a valid url.', { protocols: ['http', 'https'] })
			.errors();
		expect(validationErrors).to.eql([
			{
				selector: 'two',
				tip: 'two is mandatory.',
			},
			{
				path: ['one'],
				tip: 'Url cannot be empty.',
			},
			{
				path: ['one'],
				tip: 'Please provide a valid url.',
			},
		]);
	});

	it('check sanitize', () => {
		const toSanitize = {
			one: [
				{ two: '<span><p>Blablabla<p></span>' },
				{ two: '<script>alert("bla")</script>' },
			],
		};
		new Lysis(toSanitize, 'one.*.two').sanitize(escape);
		expect(toSanitize).to.eql({
			one: [
				{ two: '&lt;span&gt;&lt;p&gt;Blablabla&lt;p&gt;&lt;&#x2F;span&gt;' },
				{ two: '&lt;script&gt;alert(&quot;bla&quot;)&lt;&#x2F;script&gt;' },
			],
		});
	});

	it('check validateCombined with mapErrorFunction', () => {
		const toValidate = {
			one: 'one',
			two: {
				three: [
					{ four: 1 },
					{ four: 0 },
				],
			},
		};
		const mapErrorFn = (matches, tip) => {
			expect(matches).to.eql({
				one: [
					{
						path: [
							'one',
						],
						value: 'one',
						parent: {
							one: 'one',
							two: {
								three: [
									{
										four: 1,
									},
									{
										four: 0,
									},
								],
							},
						},
						key: 'one',
					},
				],
				'two.three.*.four': [
					{
						path: [
							'two',
							'three',
							'0',
							'four',
						],
						value: 1,
						parent: {
							four: 1,
						},
						key: 'four',
					},
					{
						path: [
							'two',
							'three',
							'1',
							'four',
						],
						value: 0,
						parent: {
							four: 0,
						},
						key: 'four',
					},
				],
			});
			return { selectors: keys(matches), tip };
		};
		const lysis = new Lysis(toValidate, ['one', 'two.three.*.four'], mapErrorFn);
		const validationFn = (matches, fortyFive, sixyNine) => {
			expect(matches).to.eql({
				one: ['one'],
				'two.three.*.four': [1, 0],
			});
			expect(fortyFive).to.equal('45');
			expect(sixyNine).to.equal(69);
			return false;
		};
		const validationErrors = lysis
			.validateCombined(validationFn, 'The combination of one and fours is wrong.', '45', 69)
			.errors();
		expect(validationErrors).to.eql([
			{
				selectors: ['one', 'two.three.*.four'],
				tip: 'The combination of one and fours is wrong.',
			},
		]);
	});

	it('check validateCombined that is mandatory', () => {
		const toValidate = {};
		const lysis = new Lysis(toValidate, ['one', 'two.three.*.four']);
		const validationFn = (matches) => {
			expect(matches).to.eql({
				one: [],
				'two.three.*.four': [],
			});
			return false;
		};
		const validationErrors = lysis
			.mandatory()
			.validateCombined(validationFn, 'The combination of one and fours is wrong.')
			.errors();
		expect(validationErrors).to.eql([
			{
				selector: 'one',
				tip: 'one is mandatory.',
			},
			{
				selector: 'two.three.*.four',
				tip: 'two.three.*.four is mandatory.',
			},
			{
				selectors: ['one', 'two.three.*.four'],
				tip: 'The combination of one and fours is wrong.',
			},
		]);
	});

	it('checks functional combinations', () => {
		const toValidate = {
			one: 'no_boolean_here',
			two: '1',
			three: 'true',
		};
		const validationErrors = new Lysis(toValidate, ['one', 'two', 'three'])
			.validate(and(not(isBoolean), not(isInt)), 'I cannot handle booleans or integers!')
			.errors();
		expect(validationErrors).to.eql([
			{
				path: [
					'two',
				],
				tip: 'I cannot handle booleans or integers!',
			},
			{
				path: [
					'three',
				],
				tip: 'I cannot handle booleans or integers!',
			},
		]);
	});

	it('checks custom predicate function', () => {
		const toValidate = {
			today: '2016-08-11T19:36:01.323Z',
		};
		const isWeekend = (value) => {
			const day = moment(value).day();
			return (day === 6) || (day === 0);
		};
		const validationErrors = new Lysis(toValidate, 'today')
			.validate(isWeekend, 'Today must be weekend!')
			.errors();
		expect(validationErrors).to.eql([
			{ path: ['today'], tip: 'Today must be weekend!' },
		]);
	});

	it('checks multiple selectors and mandatory', () => {
		const toValidate = {
			today: '2016-08-11T19:36:01.323Z',
		};
		const isWeekend = (value) => {
			const day = moment(value).day();
			return (day === 6) || (day === 0);
		};
		const validationErrors = new Lysis(toValidate, ['today', 'tomorrow'])
			.mandatory()
			.validate(isWeekend, 'Today must be weekend!')
			.errors();
		expect(validationErrors).to.eql([
			{ selector: 'tomorrow', tip: 'tomorrow is mandatory.' },
			{ path: ['today'], tip: 'Today must be weekend!' },
		]);
	});

});
