# lysis
Lysis guards your code from integrity compromising payloads.

Lysis works with Koa, Express or integrates easily with any other frameworks.

Features:
- functional composition (lysis is not a wrapper for another framework)
- deep json validation through selectors
- customizable error/mandatory messages
- check different parts of your payload in a combined predicate function
- get the exact path to the invalid field

## Installation

```
npm install lysis
```

## Usage

### Object validation

With [validator.js](https://github.com/chriso/validator.js) functions:

```Javascript
import { isURL } from 'validator';
import Lysis from 'lysis';

const toValidate = {
	links: [
		{
			url: 'http://valid.com'
		},
		{
			url: 'ftp://invalid.com'
		}
	]
};
const validationErrors = new Lysis(toValidate, 'links.*.url')
	.validate(isURL, 'Please provide a valid url.', { protocols: ['http', 'https'] })
	.errors();
console.log(validationErrors);
```

Prints out:

```Json
[
	{
		"path": [
			"links",
			"1",
			"url"
		],
		"tip": "Please provide a valid url."
	}
]
```

With a custom predicate function:

```Javascript
import moment from 'moment';
import Lysis from 'lysis';

const toValidate = {
	today: '2016-08-11T19:36:01.323Z'
};
const isWeekend = (value) => {
	const day = moment(value).day();
	return (day == 6) || (day == 0);
};
const validationErrors = new Lysis(toValidate, 'today')
	.validate(isWeekend, 'Today must be weekend!')
	.errors();
console.log(validationErrors);
```

Prints out:

```Json
[ { path: [ 'today' ], tip: 'Today must be weekend!' } ]
```

### Optional/mandatory validation

By default fields are mandatory:

```Javascript
const toValidate = {};
const validationErrors = new Lysis(toValidate, 'id')
	.validate(isInteger, 'id must be an integer.')
	.errors();
console.log(validationErrors);
```

Prints out:

```Json
[ { path: 'id', tip: 'id is mandatory.' } ]
```

Making it optional by calling the optional method before the validate method:

```Javascript
const validationErrors = new Lysis(toValidate, 'id')
	.optional()
	.validate(isInteger, 'id must be an integer.')
	.errors();
```

### Custom error messages

TODO

### Combined validation

When you want to validate different parts of your object, use the 'validateCombined' method:

```Javascript
const toValidate = {
	one: true,
	two: false
};
const validationFn = (matches) => {
	const { one, two } = matches;
	return one && two;
};
const validationErrors = new Lysis(toValidate, ['one', 'two'])
	.validateCombined(validationFn, 'The combination of one and two is wrong.')
	.errors();
```

### Sanitization

You can use lysis only for sanitizing your object:

```Javascript
import { escape } from 'validator';
const toSanitize = {
	one: [
		{ two: '<span><p>Blablabla<p></span>' },
		{ two: '<script>alert("bla")</script>' },
	],
};
new Lysis(toSanitize, 'one.*.two').sanitize(escape);
console.log(toSanitize);
```

Prints out:

```Json
{
	one: [
		{ two: '&lt;span&gt;&lt;p&gt;Blablabla&lt;p&gt;&lt;&#x2F;span&gt;' },
		{ two: '&lt;script&gt;alert(&quot;bla&quot;)&lt;&#x2F;script&gt;' }
	]
}
```

Be aware that the sanitize method will alter your object, it does not return a new sanitized object!

You can provide additional arguments to the sanitize function:

```Javascript
new Lysis(toSanitize, 'one.*.two').sanitize(toInt, 10);
```

### Utility functions for functional composition

The 'and/or' function combines multiple predicate-functions:

```Javascript
import { isBoolean, isInt, toBoolean } from 'validator';
import { or } from 'lysis';
const toValidate = {
	one: '0',
	two: '1',
	three: 'true'
};
const validationErrors = new Lysis(toValidate, ['one', 'two', 'three'])
	.validate(or(isBoolean, isInt), '"one" must be a boolean or an integer.')
	.sanitize(toBoolean);
console.log(toValidate);
```

Prints out:

```Json
{
	one: false,
	two: true,
	three: true
}
```

The 'not' function can only take one predicate-function as an argument!

```Javascript
import { isBoolean, isInt, toBoolean } from 'validator';
import { and, not } from 'lysis';
const toValidate = {
	one: 'no_boolean_here',
	two: '1',
	three: 'true'
};
const validationErrors = new Lysis(toValidate, ['one', 'two', 'three'])
	.validate(and(not(isBoolean), not(isInt)), 'I cannot handle booleans or integers!')
	.errors();
console.log(validationErrors);
```

Prints out:

```Json
[
	{
		"path": [
			"two"
		],
		"tip": "I cannot handle booleans or integers!"
	},
	{
		"path": [
			"three"
		],
		"tip": "I cannot handle booleans or integers!"
	}
]
```

### Koa

Configure your koa app with the 'validate' function:

```Javascript
const validate = require('lysis/koa');
const bodyParser = require('koa-bodyparser');

const app = koa();
validate(app);
app.use(bodyParser());
```

Then use the convenience methods (checkHeader, checkParam, checkQuery and checkBody) in your generators:

```Javascript
app.router.get('/headers', function* () {
	this.checkHeader('int')
		.validate(isInt, '"int" header must be an integer.')
		.sanitize(toInt, 10);
	if (this.errors) {
		this.status = 400;
		this.body = { validation: this.errors };
	} else {
		this.status = 200;
		this.body = this.headers;
	}
});
```

### Express

TODO

## API

TODO
