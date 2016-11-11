'use strict';

import chai from 'chai';

import './koa';
import './standalone';

global.chai = chai;
global.expect = global.chai.expect;
global.assert = global.chai.assert;

