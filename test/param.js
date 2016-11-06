'use strict';

import agent from 'supertest';
import { isInt, toInt } from 'validator';

import createApp from './util';

describe('Lysis - param validation', () => {

	it('check param invalid (with custom error mapping)', (done) => {
		const app = createApp();
		app.router.get('/param/:id', function* () {
			const errMapping = (match, tip) =>
				({ name: 'id', message: `${match.key} with value of "${match.value}" is not an integer!`, tip });
			this.validateParam('id', errMapping)
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
							name: 'id',
							message: 'id with value of "one" is not an integer!',
							tip: '"id" must be an integer.',
						},
					],
				});
				return false;
			})
			.end(done);
	});

	it('check param sanitized', (done) => {
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
			.get('/lysis/param/45')
			.query()
			.expect(200)
			.expect((res) => {
				expect(res.body).to.eql({ id: 45 });
				return false;
			})
			.end(done);
	});

});
