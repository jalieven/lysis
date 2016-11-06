'use strict';

import set from 'lodash/set';
import some from 'lodash/some';
import every from 'lodash/every';
import objectMatch from 'object-match';

const validate = (app) => {
	app.context.validateQuery = function(path, key) {
		return new Validation(this, this.request.query, path, key);
	};
	app.context.validateParam = function(path, key) {
		return new Validation(this, this.params, path, key);
	};
	app.context.validateHeader = function(path, key) {
		return new Validation(this, this.headers, path, key);
	};
	app.context.validateBody = function(path, key) {
		return new Validation(this, this.request.body, path, key);
	};
};

export const and = (predicates) => (value) => every(predicates, (predicate) => predicate(value));

export const or = (predicates) => (value) => some(predicates, (predicate) => predicate(value));

class Validation {

	constructor(context, value, path, key) {
		this.context = context;
		this.value = value;
		this.path = path;
		this.key = key;
	}

	optional() {
		this.optional = true;
		return this;
	}

	validate(fn, tip, args) {
		const argz = args || [];
		objectMatch(this.path, this.value)
			.forEach((match) => {

				const valid = fn(match.value, ...argz);
				if (!valid) {
					if (!this.context.errors) {
						this.context.errors = [];
					}
					this.context.errors.push({ path: match.path, tip });
				}
			});
		return this;
	}

	sanitize(fn, args) {
		const argz = args || [];
		objectMatch(this.path, this.value)
			.forEach((match) => {
				set(this.value, match.path, fn(match.value, ...argz));
			});
		return this;
	}

}

export default validate;
