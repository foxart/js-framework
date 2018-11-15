'use strict';
/*node*/
const
	FastXmlParser = require('fast-xml-parser'),
	FileType = require('file-type');
/*fa*/
const
	FaWrap = require('./wrap');

/**
 *
 * @param count
 * @returns {string}
 */
function getTab(count) {
	return Array(count).join("    ");
}

/**
 *
 * @param json
 * @returns {boolean}
 */
function checkJson(json) {
	try {
		return typeof JSON.parse(json) === 'object';
	} catch (error) {
		return false;
	}
}

/**
 *
 * @param xml
 * @returns {boolean}
 */
function checkXml(xml) {
	try {
		return FastXmlParser.validate(xml) === true;
	} catch (error) {
		return false;
	}
}

/**
 *
 * @param array
 * @param level
 * @param callback
 * @param color
 * @param type
 * @returns {string}
 */
function stringifyArray(array, level, callback, color, type) {
	let nl = '\r\n';
	let tab = getTab(level + 1);
	let result = `[${nl}${tab}`;
	level++;
	for (let i = 0, end = array.length - 1; i <= end; i++) {
		let key = i;
		result += `${key}: ${callback.call(this, array[key], level, false, color, type)}`;
		if (i !== end) {
			result = `${result},${nl}${tab}`;
		}
	}
	result = `${result}${nl}${getTab(level - 1)}]`;
	return result;
}

/**
 *
 * @param object
 * @param level
 * @param callback
 * @param color
 * @param type
 * @returns {string}
 */
function stringifyObject(object, level, callback, color, type) {
	let checkMemory = [];

	function checkCircular(object) {
		if (object && typeof object === 'object') {
			if (checkMemory.indexOf(object) !== -1) {
				return true;
			}
			checkMemory.push(object);
			for (let key in object) {
				try {
					if (object.hasOwnProperty(key) && checkCircular(object[key])) {
						return true;
					}
				} catch (e) {
					return false
				}
			}
		}
		return false;
	}

	let nl = '\r\n';
	let tab = getTab(level + 1);
	let result = `{${nl}${tab}`;
	level++;
	for (let keys = Object.keys(object), i = 0, end = keys.length - 1; i <= end; i++) {
		if (checkCircular(object[keys[i]]) === true) {
			result += `${keys[i]}: ${callback.call(this, object[keys[i]], level, true, color, type)}`;
		} else {
			result += `${keys[i]}: ${callback.call(this, object[keys[i]], level, false, color, type)}`;
		}
		if (i !== end) {
			result = `${result},${nl}${tab}`;
		}
	}
	result = `${result}${nl}${getTab(level - 1)}}`;
	return result;
}

/**
 *
 * @param data
 * @param level
 * @param circular
 * @param color
 * @param type
 * @returns {string}
 */
function index(data, level, circular, color, type) {
	level = level === undefined ? 0 : level;
	if (circular === true) {
		return FaWrap.wrapCircular(data, Object.keys(data).length, color, type);
	} else if (data === null) {
		// null
		return FaWrap.wrapNull(data, color, type);
	} else if (Array.isArray(data)) {
		return FaWrap.wrapArray(stringifyArray.call(this, data, level, index, color, type), data.length, color, type);
	} else if (typeof data === 'boolean') {
		// bool
		return FaWrap.wrapBool(data, color, type);
	} else if (typeof data === 'number' && data % 1 === 0) {
		// int
		return FaWrap.wrapInt(data, color, type);
	} else if (typeof data === 'number' && data % 1 !== 0) {
		// float
		return FaWrap.wrapFloat(data, color, type);
	} else if (data instanceof Date) {
		// date
		return FaWrap.wrapDate(data, color, type);
	} else if (typeof data === 'function') {
		// function
		return FaWrap.wrapFunction(data, getTab(level + 1), color, type);
		// } else if (data instanceof Error || data instanceof FaError) {
	} else if (data instanceof Error) {
		// error
		let message = index.call(this, data['message'], level, false, color, type);
		let stack = data['stack'];
		// let trace = index.call(this, data['trace'] ? data['trace'] : '', level, false, color, type);
		// return FaWrap.wrapError(data['name'], message, trace, stack, getTab(level + 1), color, type);
		return FaWrap.wrapError(data['name'], message, data['trace'], stack, getTab(level + 1), color, type);
	} else if (typeof data === 'object') {
		try {
			if (new RegExp("^[0-9a-fA-F]{24}$").test(data.toString())) {
				// MONGO
				return FaWrap.wrapMongoId(data, color, type);
			} else if (data instanceof RegExp) {
				// REGEXP
				return FaWrap.wrapRegExp(data.toString(), color, type);
			} else if (data.byteLength) {
				// IMAGE
				return FaWrap.wrapImage(FileType(data).mime, data.length, color, type);
			} else {
				// OBJECT
				return FaWrap.wrapObject(stringifyObject.call(this, data, level, index, color, type), Object.keys(data).length, color, type);
			}
		} catch (e) {
			// OBJECT
			return FaWrap.wrapObject(stringifyObject.call(this, data, level, index, color, type), Object.keys(data).length, color, type);
		}
		// } else if (data.byteLength) {
		//IMAGE
		// return FaWrap.wrapImage(data, FileType(data).mime, color, type);
		// } else if (FileType(Buffer.from(data, 'base64'))) {
		//IMAGE
		// return FaWrap.wrapImage(data, FileType(Buffer.from(data, 'base64')).mime, color, type);
		// console.log(FileType(Buffer.from(data, 'base64')).mime)
	} else if (typeof data === 'string') {
		if (checkJson(data)) {
			// JSON
			return FaWrap.wrapJson(index.call(this, JSON.parse(data), level, false, color, type), data.length, color, type);
		} else if (checkXml(data)) {
			// xml
			return FaWrap.wrapXml(index.call(this, FastXmlParser.parse(data, {}), level, false, color, type), data.length, color, type);
		} else if (FileType(Buffer.from(data, 'base64'))) {
			// IMAGE
			return FaWrap.wrapImage(FileType(Buffer.from(data, 'base64')).mime, data.length, color, type);
		} else {
			// string
			return FaWrap.wrapString(data, data.length, getTab(level + 1), color, type);
		}
	} else {
		// undefined
		return FaWrap.wrapUndefined(data, color, type);
	}
}

/**
 * @param data
 * @returns {string}
 */
exports.extended = function (data) {
	return index(data, 1, false, false, true);
};
/**
 * @param data
 * @returns {string}
 */
exports.extendedColor = function (data) {
	return index(data, 1, false, true, true);
};
/**
 * @param data
 * @returns {string}
 */
exports.plain = function (data) {
	return index(data, 1, false, false, false);
};
/**
 * @param data
 * @returns {string}
 */
exports.plainColor = function (data) {
	return index(data, 1, false, true, false);
};
