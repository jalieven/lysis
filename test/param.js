'use strict';

import agent from 'supertest';
import { isInt, toInt, isFloat, toFloat } from 'validator';

import createApp from './util';

describe('Lysis - param validation', () => {

	it('check param invalid', (done) => {
		const app = createApp();
		app.router.get('/param/:id', function* () {
			this.validateParam('id')
				.validate(isInt, '"id" must be an integer.')
				.sanitize(toInt, 10);
			if (this.errors) {
				this.status = 400;
				this.body = { validation: this.errors };
			} else {
				this.status = 200;
				this.body = this.params;
			}
		});
		agent(app.listen())
			.get('/lysis/param/one')
			.query()
			.expect(400)
			.expect((res) => {
				expect(res.body).to.eql({
					validation: [
						{
							path: ['id'],
							tip: '"id" must be an integer.',
						},
					],
				});
				return false;
			})
			.end(done);
	});

});
