'use strict';

import map from 'lodash/map';
import flatMap from 'lodash/flatMap';

const exactMatch = path => selector =>
	path.length === selector.length && path.every((segment, i) =>
		selector[i] === '*' || selector[i] === segment
	);

const partialMatch = (path) => {
	const i = path.length - 1;
	return selector => selector[i] === '*' || selector[i] === path[i];
};

const findMatches = (obj, selectors, path, parent) => {
	const safePath = path || [];
	if (selectors.some(exactMatch(safePath))) {
		return {
			path: safePath,
			parent,
			value: obj,
			key: safePath[safePath.length - 1],
		};
	}
	if (!parent || selectors.some(partialMatch(safePath))) {
		return flatMap(obj, (val, key) => findMatches(val, selectors, safePath.concat(`${key}`), obj));
	}
	return [];
};

export const matcher = (selectors, object) => {
	const splitSelectors = map([selectors], selector => selector.split('.'));
	return object ? findMatches(object, splitSelectors) : obj => findMatches(obj, splitSelectors);
};
