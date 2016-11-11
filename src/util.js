'use strict';

import map from 'lodash/map';
import flatMap from 'lodash/flatMap';

const exactMatch = (path) => {
	return (selector) => {
		return path.length === selector.length && path.every((segment, i) => {
			return selector[i] === '*' || selector[i] === segment
		})
	}
}

const partialMatch = (path) => {
	const i = path.length - 1
	return (selector) => {
		return selector[i] === '*' || selector[i] === path[i];
	}
}

const findMatches = (obj, selectors, path, parent) => {
	if (path === void 0) { path = [] }

	// full selector match
	if (selectors.some(exactMatch(path))) {
		return {
			path: path,
			value: obj,
			parent: parent,
			key: path[path.length - 1]
		}
	}

	// first node or partial match
	if(!parent || selectors.some(partialMatch(path))) {
		return flatMap(obj, (val, key) => {
			return findMatches(val, selectors, path.concat(key), obj)
		})
	}
	return [];
}

export const matcher = (selectors, obj) => {
	const splitSelectors = map(selectors, (selector) => selector.split('.'));
	return obj ? findMatches(obj, splitSelectors) : (obj) => findMatches(obj, splitSelectors);
};
