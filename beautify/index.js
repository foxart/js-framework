'use strict';
/*node*/
const FastXmlParser = require('fast-xml-parser');
const FileType = require('file-type');
// const Buffer = require("buffer").Buffer;
/*fa*/
const wrapper = require('./wrap');

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
 * @param data {*}
 * @param level
 * @param circular
 * @param color
 * @param type
 * @returns {string}
 */
function beautify(data, level, circular, color, type) {
	level = level === undefined ? 0 : level;
	if (circular === true) {
		return wrapper.wrapCircular(data, Object.keys(data).length, color, type);
	} else if (data === null) {
		// null
		return wrapper.wrapNull(data, color, type);
	} else if (Array.isArray(data)) {
		return wrapper.wrapArray(stringifyArray.call(this, data, level, beautify, color, type), data.length, color, type);
	} else if (typeof data === 'boolean') {
		// bool
		return wrapper.wrapBool(data, color, type);
	} else if (typeof data === 'number' && data % 1 === 0) {
		// int
		return wrapper.wrapInt(data, color, type);
	} else if (typeof data === 'number' && data % 1 !== 0) {
		// float
		return wrapper.wrapFloat(data, color, type);
		// } else if (data instanceof Date) {
	} else if (data instanceof Date) {
		/*date*/
		return wrapper.wrapDate(data, color, type);
		// } else if (!isNaN(Date.parse(data))) {
		// 	/*date*/
		// 	return wrapper.wrapDate(new Date(data), server1.color, type);
	} else if (typeof data === 'function') {
		// function
		return wrapper.wrapFunction(data, getTab(level), color, type);
		// } else if (data instanceof FaError) {
		// 	/*FaError*/
		// 	return wrapper.wrapFaError(data['name'], data['message'], data['stack'], getTab(level + 1), server1.color);
	} else if (data instanceof Error) {
		/*Error*/
		return wrapper.wrapError(data['name'], data['message'], data['stack'], data['trace'], getTab(level + 1), color);
	} else if (typeof data === 'object') {
		try {
			if (new RegExp("^[0-9a-fA-F]{24}$").test(data.toString())) {
				/*MONGO*/
				return wrapper.wrapMongoId(data, color, type);
			} else if (data instanceof RegExp) {
				/*REGEXP*/
				return wrapper.wrapRegExp(data.toString(), color, type);
			} else if (data.byteLength) {
				//todo rewrite to true type detection
				/*IMAGE*/
				return wrapper.wrapImage(FileType(data).mime, data.length, color, type);
			} else {
				/*OBJECT*/
				return wrapper.wrapObject(stringifyObject.call(this, data, level, beautify, color, type), Object.keys(data).length, color, type);
			}
		} catch (e) {
			/*OBJECT*/
			return wrapper.wrapObject(stringifyObject.call(this, data, level, beautify, color, type), Object.keys(data).length, color, type);
		}
		// } else if (data.byteLength) {
		//IMAGE
		// return wrapper.wrapImage(data, FileType(data).mime, server1.color, type);
		// } else if (FileType(Buffer.from(data, 'base64'))) {
		//IMAGE
		// return wrapper.wrapImage(data, FileType(Buffer.from(data, 'base64')).mime, server1.color, type);
		// server1.console.log(FileType(Buffer.from(data, 'base64')).mime)
	} else if (typeof data === 'string') {
		if (checkJson(data)) {
			// JSON
			return wrapper.wrapJson(beautify.call(this, JSON.parse(data), level, false, color, type), data.length, color, type);
		} else if (checkXml(data)) {
			// xml
			return wrapper.wrapXml(beautify.call(this, FastXmlParser.parse(data, {}), level, false, color, type), data.length, color, type);
		} else if (FileType(Buffer.from(data, 'base64'))) {
			/*IMAGE*/
			return wrapper.wrapImage(FileType(Buffer.from(data, 'base64')).mime, data.length, color, type);
		} else {
			// string
			return wrapper.wrapString(data, data.length, getTab(level), color, type);
		}
	} else {
		// undefined
		return wrapper.wrapUndefined(data, color, type);
	}
}

/**
 * @param data {*}
 * @returns {string}
 */
exports.extended = function (data) {
	return beautify(data, 1, false, false, true);
};
/**
 * @param data {*}
 * @returns {string}
 */
exports.extendedColor = function (data) {
	return beautify(data, 1, false, true, true);
};
/**
 * @param data {*}
 * @returns {string}
 */
exports.plain = function (data) {
	return beautify(data, 1, false, false, false);
};
/**
 * @param data {*}
 * @returns {string}
 */
exports.plainColor = function (data) {
	return beautify(data, 1, false, true, false);
};

function newStringify(object, level, wrapper) {
	let memory = [];

// console.log(callback);
	function circular(object) {
		if (object && typeof object === 'object') {
			if (memory.indexOf(object) !== -1) {
				return true;
			}
			memory.push(object);
			for (let key in object) {
				try {
					if (object.hasOwnProperty(key) && circular(object[key])) {
						return true;
					}
				} catch (e) {
					return false
				}
			}
		}
		return false;
	}

	let bl = Array.isArray(object) ? "[" : "{";
	let br = Array.isArray(object) ? "]" : "}";
	let nl = '\r\n';
	let tab = getTab(level + 1);
	let result = `${bl}${nl}${tab}`;
	level++;
	for (let keys = Object.keys(object), i = 0, end = keys.length - 1; i <= end; i++) {
		if (circular(object[keys[i]]) === true) {
			result += `${keys[i]}: ${newBeautify(object[keys[i]], level, true, wrapper)}`;
		} else {
			result += `${keys[i]}: ${newBeautify(object[keys[i]], level, false, wrapper)}`;
		}
		if (i !== end) {
			// result = `${result},${nl}${tab}`;
			result += `,${nl}${tab}`;
		}
	}
	// result = `${result}${nl}${getTab(level - 1)}${br}`;
	result += `${nl}${getTab(level - 1)}${br}`;
	return result;
}

function newBeautify(data, level, circular, wrapper) {
	level = level === undefined ? 0 : level;
	if (circular === true) {
		return wrapper.wrapCircular(data, Object.keys(data).length);
	} else if (data === null) {
		/*null*/
		return wrapper.wrapNull(data);
	} else if (Array.isArray(data)) {
		return wrapper.wrapArray(newStringify(data, level, wrapper), data.length);
	} else if (typeof data === 'boolean') {
		/*bool*/
		return wrapper.wrapBool(data);
	} else if (typeof data === 'number' && data % 1 === 0) {
		/*int*/
		return wrapper.wrapInt(data);
	} else if (typeof data === 'number' && data % 1 !== 0) {
		/*float*/
		return wrapper.wrapFloat(data);
	} else if (data instanceof Date) {
		/*date*/
		return wrapper.wrapDate(data);
		// } else if (!isNaN(Date.parse(data))) {
		// 	/*date*/
		// 	return wrapper.wrapDate(new Date(data), server1.color);
	} else if (typeof data === 'function') {
		/*function*/
		return wrapper.wrapFunction(data, level);
	} else if (data instanceof Error) {
		/*error*/
		return wrapper.wrapError( data, level + 1);
	} else if (typeof data === 'object') {
		try {
			if (new RegExp("^[0-9a-fA-F]{24}$").test(data.toString())) {
				/*mongo*/
				return wrapper.wrapMongoId(data);
			} else if (data instanceof RegExp) {
				/*regexp*/
				return wrapper.wrapRegExp(data.toString());
			} else if (data.byteLength) {
				//todo rewrite to true type detection
				/*image*/
				return wrapper.wrapImage(FileType(data).mime, data.byteLength);
			} else {
				/*object*/
				return wrapper.wrapObject(newStringify(data, level, wrapper), Object.keys(data).length);
			}
		} catch (e) {
			/*object*/
			return wrapper.wrapObject(newStringify(data, level, wrapper), Object.keys(data).length);
		}
	} else if (typeof data === 'string') {
		if (checkJson(data)) {
			/*json*/
			return wrapper.wrapJson(newBeautify(JSON.parse(data), level, false, wrapper), data.length);
		} else if (checkXml(data)) {
			/*xml*/
			return wrapper.wrapXml(newBeautify(FastXmlParser.parse(data, {}), level, false, wrapper), data.length);
		} else if (FileType(Buffer.from(data, 'base64'))) {
			/*image*/
			return wrapper.wrapFile(FileType(Buffer.from(data, 'base64')).mime, data.length);
		} else {
			/*string*/
			return wrapper.wrapString(data, level);
		}
	} else {
		/*undefined*/
		return wrapper.wrapUndefined(data);
	}
}

const PlainConsole = require("./plain-console");
const TypeConsole = require("./type-console");
/*new*/
exports.plainConsole = function (data) {
	return newBeautify(data, 1, false, TypeConsole);
};
//plain
//plainConsole
//plainHtml
//type
//typeConsole
//typeHtml

