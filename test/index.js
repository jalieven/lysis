'use strict';

import chai from 'chai';

import './koa';
import './express';
import './util';
import './standalone';
import './chain';

global.chai = chai;
global.expect = global.chai.expect;
global.assert = global.chai.assert;

