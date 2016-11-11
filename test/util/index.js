'use strict';

import { matcher } from '../../src/util';

describe('Lysis - Util', () => {

	it('checks object matcher', () => {
		const object = {
			a: 1,
			b: 2,
			c: {
				d: 3,
				e: 4,
			},
		};
		const match = matcher('c.d')(object)[0];
		expect(match).to.eql({
			path: ['c', 'd'],
			key: 'd',
			value: 3,
			parent: object.c,
		});

	});

	it('check if it returns a function if not all arguments are given', () => {
		const parser = matcher('foo.bar');
		expect(parser).to.be.a('function');
	});

	it('check selectors in an object', () => {
		const object = {
			platypus: {
				ostrich: {
					enemies: false,
				},
				tiger: {
					enemies: true,
				},
			},
		};
		const match = matcher('platypus.ostrich', object);
		expect(match).to.eql([
			{
				path: ['platypus', 'ostrich'],
				value: { enemies: false },
				parent: object.platypus,
				key: 'ostrich',
			},
		]);
	});

	it('check matching returns an array of matches (curried)', () => {
		const object = {
			platypus: {
				ostrich: {
					enemies: false,
				},
				tiger: {
					enemies: true,
				},
			},
		};
		const match = matcher('platypus.ostrich')(object);
		expect(match).to.eql([
			{
				path: ['platypus', 'ostrich'],
				value: { enemies: false },
				parent: object.platypus,
				key: 'ostrich',
			},
		]);
	});

	it('check the support of wildcards for objects', () => {
		const match = matcher('animals.*.size')({
			animals: {
				ostrich: { size: 4 },
				'kangaroo rat': { size: 3 },
				owl: { size: 2 },
				'blue whale': { size: 80 },
				megalodon: { size: 100 },
			},
		});
		expect(match).to.eql([
			{ path: ['animals', 'ostrich', 'size'], value: 4, parent: { size: 4 }, key: 'size' },
			{ path: ['animals', 'kangaroo rat', 'size'], value: 3, parent: { size: 3 }, key: 'size' },
			{ path: ['animals', 'owl', 'size'], value: 2, parent: { size: 2 }, key: 'size' },
			{ path: ['animals', 'blue whale', 'size'], value: 80, parent: { size: 80 }, key: 'size' },
			{ path: ['animals', 'megalodon', 'size'], value: 100, parent: { size: 100 }, key: 'size' },
		]);
	});

	it('check selectors on arrays', () => {
		const match = matcher('a.*.c')({
			a: [{ c: 1 }, { c: 2 }, { c: 3 }],
		});
		expect(match).to.eql([
			{ path: ['a', '2', 'c'], value: 3, parent: { c: 3 }, key: 'c' },
			{ path: ['a', '1', 'c'], value: 2, parent: { c: 2 }, key: 'c' },
			{ path: ['a', '0', 'c'], value: 1, parent: { c: 1 }, key: 'c' },
		].reverse());
	});

	it('check if it works with multiple wildcards', () => {
		const match = matcher('a.*.c.*')({
			a: {
				b: {
					c: ['d', 'dee'],
				},
				B: {
					c: ['D', 'DEE'],
				},
				β: {
					c: ['gamma', 'GAMMA'],
				},
			},
		});
		expect(match.length).to.equal(6);
	});

});
