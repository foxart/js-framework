"use strict";
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
 * @param array {Array}
 */
Array.prototype.difference = function (array) {
	return this.filter(function (item) {
		return array.indexOf(item) === -1;
	});
};
/**
 * @param array {Array}
 */
Array.prototype.intersect = function (array) {
	return this.filter(function (item) {
		return array.indexOf(item) !== -1;
	});
};
