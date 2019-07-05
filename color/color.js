"use strict";
let chroma = require('chroma-js');
let lists = {
	basic: require('./color-basic'),
	html: require('./color-html'),
	ntc: require('./color-ntc'),
	pantone: require('./color-pantone'),
	roygbiv: require('./color-roygbiv'),
	x11: require('./color-x11')
};
exports.nameFromScheme = function (hex, scheme) {
	return scheme.map(function (item) {
		// noinspection JSUnresolvedFunction
		item.distance = chroma.deltaE(hex, item.hex);
		return item;
	}).sort(function (a, b) {
		return a.distance - b.distance;
	})
};
exports.hexFromScheme = function (color, scheme) {
	return scheme.filter(function (item) {
		if (color === item.name) {
			// noinspection JSUnresolvedFunction
			item.distance = chroma.deltaE(color, item.hex);
			return item;
		}
	}).sort(function (a, b) {
		return a.distance - b.distance;
	})
};
exports.rgbToHex = function (rgb) {
	return "#" +
		("0" + parseInt(rgb['r'], 10).toString(16)).slice(-2) +
		("0" + parseInt(rgb['g'], 10).toString(16)).slice(-2) +
		("0" + parseInt(rgb['b'], 10).toString(16)).slice(-2);
};
exports.hexToRgb = function (hex) {
	let result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
	return result ? {
		r: parseInt(result[1], 16),
		g: parseInt(result[2], 16),
		b: parseInt(result[3], 16)
	} : null;
};
/**
 * @deprecated
 * @param color
 * @returns {*}
 */
exports.nameFromHexUla = function (color) {
	return ColorUlaConfiguration.map(function (name) {
		// noinspection JSUnresolvedFunction
		name.distance = chroma.deltaE(color, name.hex);
		return name
	}).sort(function (a, b) {
		return a.distance - b.distance
	})
};
/**
 * @deprecated
 * @param color
 * @param options
 */
exports.nameFromHex = function (color, options) {
	options = options || {};
	let results = {};
	for (let key in lists) {
		if (lists.hasOwnProperty(key)) {
			if (options['pick'] && options['pick'].indexOf(key) === -1) {
				continue
			}
			if (options['omit'] && options['omit'].indexOf(key) !== -1) {
				continue
			}
			results[key] = lists[key].map(function (name) {
				// noinspection JSUnresolvedFunction
				name.distance = chroma.deltaE(color, name.hex);
				return name
			}).sort(function (a, b) {
				return a.distance - b.distance
			})
		}
	}
	return results
};
/**
 * @deprecated
 * @param color
 * @return {string}
 */
exports.parseRgbToHex = function (color) {
	let rgb = color.match(/^rgba?[\s+]?\([\s+]?(\d+)[\s+]?,[\s+]?(\d+)[\s+]?,[\s+]?(\d+)[\s+]?/i);
	console.log(rgb);
	return (rgb && rgb.length === 4) ? "#" +
		("0" + parseInt(rgb[1], 10).toString(16)).slice(-2) +
		("0" + parseInt(rgb[2], 10).toString(16)).slice(-2) +
		("0" + parseInt(rgb[3], 10).toString(16)).slice(-2) : '';
};
