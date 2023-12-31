'use strict';
/*ARRAY*/
/**
 *
 * @param data
 * @param separator
 * @returns {*|Socket|string}
 */
exports.arrayJoin = function (data, separator) {
	return Array.isArray(data) ? data.join(separator) : data
};

/*OBJECT*/
/**
 *
 * @param object
 * @param callback
 */
exports.objectCallback = function (object, callback) {
	for (let property in object) {
		if (object.hasOwnProperty(property)) {
			if (typeof object[property] === 'object') {
				this.objectCallback(object[property], callback);
			} else {
				callback(object, property);
			}
		}
	}
};

/*STRING*/
/**
 *
 * @param string
 * @returns {string}
 */
exports.stringCapitalize = function (string) {
	return typeof string === 'string' ? string.charAt(0).toUpperCase() + string.substr(1).toLowerCase() : '';
};
/**
 *
 * @param search
 * @param replace
 * @param subject
 * @param count
 * @returns {string}
 */
exports.stringReplace = function (search, replace, subject, count) {
	let i = 0;
	let j = 0;
	let temp = '';
	let repl = '';
	let sl;
	let fl = 0;
	let f = [].concat(search);
	let r = [].concat(replace);
	let s = subject;
	let ra = Object.prototype.toString.call(r) === '[object Array]';
	let sa = Object.prototype.toString.call(s) === '[object Array]';
	s = [].concat(s);
	let $global = (typeof window !== 'undefined' ? window : global);
	$global.$locutus = $global.$locutus || {};
	let $locutus = $global.$locutus;
	$locutus.php = $locutus.php || {};
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

exports.stringReplaceTest = function () {
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
