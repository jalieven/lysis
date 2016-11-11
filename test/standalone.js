'use strict';

import agent from 'supertest';
import { isBoolean, isInt, toBoolean, isURL, escape } from 'validator';

import Validation, { and, or } from '../src';

describe('Lysis - Standalone validation', () => {

	it('check validate', () => {
		const toValidate = {
			one: 'ftp://somewhere.com',
			two: 'https://www.google.com',
		};
		const errorMapper = match => ({ message: `${match.key} with value of "${match.value}" is not a valid HTTP url!` });
		const validationErrors = new Validation(toValidate, ['one', 'two'], errorMapper)
			.validate(isURL, 'Please provide a valid url.', { protocols: ['http', 'https'] })
			.errors();
		expect(validationErrors).to.eql([
			{
				message: `one with value of "${toValidate.one}" is not a valid HTTP url!`,
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
		new Validation(toSanitize, 'one.*.two').sanitize(escape);
		expect(toSanitize).to.eql({
			one: [
				{ two: '&lt;span&gt;&lt;p&gt;Blablabla&lt;p&gt;&lt;&#x2F;span&gt;' },
				{ two: '&lt;script&gt;alert(&quot;bla&quot;)&lt;&#x2F;script&gt;' },
			],
		});
	});

	it('check validateCombined', () => {
		const toValidate = {
			one: 'one',
			two: {
				three: [
					{ four: 1 },
					{ four: 0 },
				],
			},
		};
		const validation = new Validation(toValidate, ['one', 'two.three.*.four']);
		const validationFn = (matches, fortyFive, sixyNine) => {
			expect(matches).to.eql([
				{
					selector: 'one',
					matches: [
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
				},
				{
					selector: 'two.three.*.four',
					matches: [
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
				},
			]);
			expect(fortyFive).to.equal('45');
			expect(sixyNine).to.equal(69);
			return false;
		};
		const validationErrors = validation
			.validateCombined(validationFn, 'The combination of one and fours is wrong.', '45', 69)
			.errors();
		expect(validationErrors).to.eql([
			{
				paths: ['one', 'two.three.*.four'],
				tip: 'The combination of one and fours is wrong.',
			},
		]);
	});

});
