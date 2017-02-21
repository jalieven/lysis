'use strict';

import map from 'lodash/map';
import keys from 'lodash/keys';
import first from 'lodash/first';
import agent from 'supertest';
import moment from 'moment';
import { isBoolean, isInt, toBoolean, isURL, isEmpty, escape, trim } from 'validator';

import Chain from '../src/chain';
import { and, or, not } from '../src/util';

describe('Lysis - Chained validation', () => {

	it('check chaining with errorMapper and array of selectors', () => {
		const toValidate = {
			one: 'ftp://somewhere.com',
			two: 'webdav://www.google.com',
		};
		const errorMapper = match => ({ message: `${match.key} with value of "${match.value}" is not a valid HTTP url!` });
		const validationErrors = new Chain(toValidate, errorMapper)
			.validate(['one', 'two'], isURL, 'Please provide a valid url.', { protocols: ['http', 'https'] })
			.errors();
		expect(validationErrors).to.eql([
			{
				message: `one with value of "${toValidate.one}" is not a valid HTTP url!`,
			},
			{
				message: `two with value of "${toValidate.two}" is not a valid HTTP url!`,
			},
		]);
	});

	it('check chaining independent selectors', () => {
		const toValidate = {
			one: 'ftp://somewhere.com',
			two: '3',
			three: {
				four: '4',
				five: [
					{ six: 'not empty' },
					{ six: '' },
				],
			},
		};
		const validationErrors = new Chain(toValidate)
			.validate('one', isURL, 'Please provide a valid url.', { protocols: ['http', 'https'] })
			.validate('two', isBoolean, 'Two must be a boolean.')
			.validate('three.four', isBoolean, 'Four must be a boolean.')
			.validate('three.five.*.six', not(isEmpty), 'Six must not be empty.')
			.errors();
		expect(validationErrors).to.eql([
			{
				path: ['one'],
				tip: 'Please provide a valid url.',
			},
			{
				path: ['two'],
				tip: 'Two must be a boolean.',
			},
			{
				path: ['three', 'four'],
				tip: 'Four must be a boolean.',
			},
			{
				path: ['three', 'five', '1', 'six'],
				tip: 'Six must not be empty.',
			},
		]);
	});

	it('check chaining validateCombined', () => {
		const toValidate = {
			one: 'ftp://somewhere.com',
			two: false,
			three: {
				four: true,
			},
		};
		const allTrue = matches => first(matches.two) && first(matches['three.four']);
		const validationErrors = new Chain(toValidate)
			.validate('one', isURL, 'Please provide a valid url.', { protocols: ['http', 'https'] })
			.validateCombined(['two', 'three.four'], allTrue, 'Two and four must both be true.')
			.errors();
		expect(validationErrors).to.eql([
			{
				path: ['one'],
				tip: 'Please provide a valid url.',
			},
			{
				selectors: [
					'two',
					'three.four',
				],
				tip: 'Two and four must both be true.',
			},
		]);
	});

	it('check chaining sanitize', () => {
		const toSanitize = {
			one: '<script></script>',
			two: '    what  ',
		};
		const validateEscaped = one => one === '&lt;script&gt;&lt;&#x2F;script&gt;';
		const validateTrimmed = two => two === 'what';
		const validationErrors = new Chain(toSanitize)
			.sanitize('one', escape)
			.sanitize('two', trim)
			.validate('one', validateEscaped, 'One must be escaped!')
			.validate('two', validateTrimmed, 'Two must be trimmed!')
			.errors();
		expect(validationErrors).to.eql(undefined);
	});

});
