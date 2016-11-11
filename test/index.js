'use strict';

import chai from 'chai';

import './koa';
import './util';
import './standalone';

global.chai = chai;
chai.should();
global.expect = global.chai.expect;
global.assert = global.chai.assert;

