'use strict';

import chai from 'chai';

global.chai = chai;
global.expect = global.chai.expect;
global.assert = global.chai.assert;

import './param';
import './header';
import './query';
import './body';
