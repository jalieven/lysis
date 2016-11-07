'use strict';

import agent from 'supertest';
import { isBoolean, isInt, toBoolean } from 'validator';

import createApp from './util';
import Validation, { and, or } from '../src';

describe('Lysis - Standalone validation', () => {

	it('check validateCombined', (done) => {
		const toValidate = {
			one: "one",
			two: {
				three: [
					{ four: 1 },
					{ four: 0 },
				],
			},
		};
		const validation = new Validation({}, toValidate, ['one', 'two.three.*.four']);
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
		}
		const validationErrors = validation
			.validateCombined(validationFn, 'The combination of one and fours is wrong.', '45', 69)
			.errors();
		expect(validationErrors).to.eql([
			{
				paths: ['one', 'two.three.*.four'],
				tip: 'The combination of one and fours is wrong.',
			},
		]);
		done();
	});

});
