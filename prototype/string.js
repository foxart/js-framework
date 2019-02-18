"use strict";
const ObjectId = require('mongodb').ObjectID;
/**
 *
 * @return {string}
 */
String.prototype.capitalize = function () {
	return this.charAt(0).toUpperCase() + this.slice(1)
};
/**
 *
 * @return {string}
 */
String.prototype.decapitalize = function () {
	return this.charAt(0).toLowerCase() + this.slice(1)
};
/**
 *
 * @return {string}
 */
String.prototype.escapeHtml = function () {
	let map = {
		'&': '&amp;',
		'<': '&lt;',
		'>': '&gt;',
		'"': '&quot;',
		"'": '&#039;'
	};
	return this.replace(/[&<>"']/g, function (m) {
		return map[m];
	});
};
/**
 *
 * @return {Object}
 */
String.prototype.toMongoId = function () {
	return new ObjectId(this);
};
/**
 *
 * @return {string}
 */
String.prototype.toUnicode = function () {
	let result = '';
	for (let i = 0; i < this.length; i++) {
		let unicode = this.charCodeAt(i).toString(16).toUpperCase();
		while (unicode.length < 4) {
			unicode = '0' + unicode;
		}
		unicode = '\\u' + unicode;
		result += unicode;
	}
	return result;
};
/**
 *
 * @param search
 * @param replace
 * @param count
 * @returns {String}
 */
String.prototype.replaceAll = function (search, replace, count) {
	let i = 0;
	let j = 0;
	let temp = '';
	let repl = '';
	let sl;
	let fl = 0;
	let f = [].concat(search);
	let r = [].concat(replace);
	let s = this;
	let ra = Object.prototype.toString.call(r) === '[object Array]';
	let sa = Object.prototype.toString.call(s) === '[object Array]';
	s = [].concat(s);
	// let $global = (typeof window !== 'undefined' ? window : global);
	// $global.$locutus = $global.$locutus || {};
	// let $locutus = $global.$locutus;
	// $locutus.php = $locutus.php || {};
	if (typeof (search) === 'object' && typeof (replace) === 'string') {
		temp = replace;
		replace = [];
		for (i = 0; i < search.length; i += 1) {
			replace[i] = temp
		}
		temp = '';
		r = [].concat(replace);
		ra = Object.prototype.toString.call(r) === '[object Array]'
	}
	if (typeof count !== 'undefined') {
		count.value = 0
	}
	for (i = 0, sl = s.length; i < sl; i++) {
		if (s[i] === '') {
			continue
		}
		for (j = 0, fl = f.length; j < fl; j++) {
			temp = s[i] + '';
			repl = ra ? (r[j] !== undefined ? r[j] : '') : r[0];
			s[i] = (temp).split(f[j]).join(repl);
			if (typeof count !== 'undefined') {
				count.value += (temp.split(f[j])).length - 1
			}
		}
	}
	// return sa ? s : s[0]
	return sa ? s.toString() : s[0].toString();
};
/**
 *
 */
String.prototype.replaceAllTest = function () {
	console.log('Kevin van Zonneveld');
	console.log(this.stringReplace(' ', '.', 'Kevin van Zonneveld'));
	console.log('EXPECTED: Kevin.van.Zonneveld');
	console.log('{name}, lars');
	console.log(this.stringReplace(['{name}', 'l'], ['hello', 'm'], '{name}, lars'));
	console.log('EXPECTED: hemmo, mars');
	console.log('ASDFASDF');
	console.log(this.stringReplace(Array('S', 'F'), 'x', 'ASDFASDF'));
	console.log('EXPECTED: AxDxAxDx');
	let count = {};
	this.stringReplace(['A', 'D'], ['x', 'y'], 'ASDFASDF', count);
	let result = count.value;
	console.log(result);
	console.log('EXPECTED: 4');
};

