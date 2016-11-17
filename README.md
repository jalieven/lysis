# lysis
Lysis guards your code from integrity compromising payloads.

Integrates with Koa, Express or any other frameworks or environment.

Features:
- functional composition (lysis is not a wrapper for another framework)
- deep json validation through selectors
- customizable error/mandatory messages
- check different parts of your payload in a combined predicate function
- get the exact path to the invalid field
- easily compose predicate functions
- only depends on lodash

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
[
	{
		"path": [ "today" ],
		"tip": "Today must be weekend!"
	}
]
```

### Optional/mandatory validation

Fields are mandatory by default:

```Javascript
const toValidate = {};
const validationErrors = new Lysis(toValidate, 'id')
	.validate(isInteger, 'id must be an integer.')
	.errors();
console.log(validationErrors);
```

Prints out:

```Json
[
	{
		"path": "id",
		"tip": "id is mandatory."
	}
]
```

Make it optional by calling the 'optional' method before the 'validate' method:

```Javascript
const validationErrors = new Lysis(toValidate, 'id')
	.optional()
	.validate(isInteger, 'id must be an integer.')
	.errors();
```

Customize the mandatory validation message:

```Javascript
const toValidate = {};
const mandatoryMapper = path => ({ message: `${path} is mandatory, man!!!` });
const validationErrors = new Lysis(toValidate, 'one.two.three')
	.mandatory(mandatoryMapper)
	.validate(isInteger, 'id must be an integer.')
	.errors();
console.log(validationErrors);
```

Prints out:

```Json
[
	{
		"message": "one.two.three is mandatory, man!!!"
	}
]
```

### Custom error messages

Customize the validation messages:

```Javascript
const toValidate = {
	one: 'ftp://somewhere.com',
	two: 'https://www.google.com',
};
const errorMapper = (match, tip) =>
	({ message: `'${match.key}' with value of '${match.value}' is not a valid HTTP url!`, tip });
const validationErrors = new Lysis(toValidate, ['one', 'two'], errorMapper)
	.validate(isURL, 'Please provide a valid url (only protocols http or https are allowed).', { protocols: ['http', 'https'] })
	.errors();
console.log(validationErrors);
```

Prints out:

```Json
[
	{
		"message": "'one' with value of 'ftp://somewhere.com' is not a valid HTTP url!",
		"tip": "Please provide a valid url (only protocols http or https are allowed)."
	}
]
```

### Combined validation

When you want to validate different parts of your object in one predicate function, use the 'validateCombined' method:

```Javascript
const toValidate = {
	one: true,
	two: false
};
const allTruthy = (matches) => {
	const { one, two } = matches;
	return one && two;
};
const validationErrors = new Lysis(toValidate, ['one', 'two'])
	.validateCombined(allTruthy, 'The combination of one and two is wrong.')
	.errors();
```

### Sanitization

You can use lysis for sanitizing your objects:

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
	"one": [
		{ "two": "&lt;span&gt;&lt;p&gt;Blablabla&lt;p&gt;&lt;&#x2F;span&gt;" },
		{ "two": "&lt;script&gt;alert(&quot;bla&quot;)&lt;&#x2F;script&gt;" }
	]
}
```

Be aware that the sanitize method will alter your object, it does not return a new sanitized object!

You can provide additional arguments to the sanitize function:

```Javascript
import { toInt } from 'validator';
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
	"one": false,
	"two": true,
	"three": true
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
	.validate(and(not(isBoolean), not(isInt)), 'I cannot handle booleans nor integers!')
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
		"tip": "I cannot handle booleans nor integers!"
	},
	{
		"path": [
			"three"
		],
		"tip": "I cannot handle booleans nor integers!"
	}
]
```

### Koa

Configure your koa app with the 'validate' function:

```Javascript
const validate = require('lysis/koa');
const bodyParser = require('koa-bodyparser');

const app = koa();
app.use(bodyParser());
validate(app);
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

Configure your express app with the 'validate' function:

```Javascript
const validate = require('lysis/express');
const bodyParser = require('body-parser');

const app = koa();
app.use(bodyParser.json());
app.use(validate);
```

Then use the convenience methods (checkHeader, checkParam, checkQuery and checkBody) in your routes:

```Javascript
app.post('/lysis/body', (req, res) => {
	req.checkBody('one.*.three')
		.mandatory()
		.validate(isInt, '"three" must be an integer.')
		.sanitize(toInt, 10);
	if (req.errors) {
		res.status(400).json({ validation: req.errors });
	} else {
		res.status(200).json(req.body);
	}
})
```

## API

### Constructor `Lysis(value, selectors, mapErrorFunction, context)`

- `value` - the object/array that must be validated/sanitized
- `selectors` - string or array with strings containing selectors pattern that point to parts of the 'value'. eg. if the value is the following object:

```Json
const value = {
	"one": {
		"two": [
			{
				"three": "right here",
			},
		],
		"four": "here",
	},
};
```

Then the selectors: ['one.two.*.three', 'one.four'] yield ['right here'] and ['here'] as matchValues respectively.

- `mapErrorFunction` - function that maps the error when a validation error has been encountered. The signature of this function is: mapErrorFunction(match, tip) where 'match' has the following structure (in case of selector 'one.two.*.three'):

```Json
{
	"path": ["one", "two", "0", "three"],
	"parent": { "three":"right here" },
	"value": "right here",
	"key": "three"
}
```
and tip is the string provided in the 'validate' or 'validateCombined' methods.

- `context` - optional object where the validation/mandatory errors will be added.

### Method `mandatory(mapMandatoryFunction)`

Indicates it there are no matches found for the provided selector Lysis will add a mandatory error onto the context errors array.

- `mapMandatoryFunction` - function that maps the mandatory-error when no match was found. The signature of this function is: mapMandatoryFunction(selector).

### Method `optional()`

Indication that if no matches are found for the selector the validation will be ignored.

### Method `validate(func, tip, ...args)`

- `func` - function with signature func(matchValue, ...args) that returns true (if matchValue is valid) or false (if invalid and an error must be added to the context object).
- `tip` - string containing info about the invalid value and how to correct it.
- `args` - extra arguments to be used in the validation function 'func'.

### Method `validateCombined(func, tip, ...args)`

When different parts of the object/array under validation must be validated in combination. Calling this method only makes sense when you provide an array with selectors (or a selector into an array) in the Lysis constructor! The signature of the func method is slightly different than the validate to accomodate for the multiple matches: TODO fill in signature.

### Method `sanitize(func, ...args)`

This method will run the provided sanitization function on all the matches found by the provided selectors in the Lysis constructor and set the result on the 'value' object/array. It will therefore alter the 'value' object/array provided in the Lysis constructor.

- `func` - function with signature func(matchValue, ...args)
- `args` - extra arguments to be used in the sanitization function 'func'.

### Method `errors`

Returns an array with the validation/mandatory errors or returns undefined when everthing is valid.
