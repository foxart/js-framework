'use strict';
/**
 *
 * @param item
 * @returns {boolean}
 */
Array.prototype.hasElement = function (item) {
	return this.indexOf(item) !== -1;
};
/**
 *
 * @param item
 * @return {boolean}
 */
Array.prototype.has = function (item) {
	return this.indexOf(item) !== -1;
};
/**
 *
 * @param item
 * @return {boolean}
 */
Array.prototype.omit = function (item) {
	return this.indexOf(item) === -1;
};
/**
 *
 * @param item
 */
Array.prototype.pushUnique = function (item) {
	if (this.indexOf(item) === -1) {
		this.push(item);
	}
};
/**
 *
 * @param array {array}
 */
Array.prototype.differsFrom = function (array) {
	return this.filter(function (item) {
		return array.indexOf(item) < 0;
	});
};
/**
 *
 * @returns {any[]}
 */
// Array.prototype.values = function () {
// 	let context = this;
// 	return Object.keys(context).map(function (key) {
// 		return context[key];
// 	})
// };
