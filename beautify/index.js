"use strict";
/*node*/
const Buffer = require("buffer").Buffer;
const FastXmlParser = require("fast-xml-parser");
const FileType = require("file-type");

/**
 *
 * @param json
 * @returns {boolean}
 */
function isJson(json) {
	try {
		return typeof JSON.parse(json) === "object";
	} catch (error) {
		return false;
	}
}

/**
 *
 * @param xml
 * @returns {boolean}
 */
function isXml(xml) {
	try {
		return FastXmlParser.validate(xml) === true;
	} catch (error) {
		return false;
	}
}

function isCircular(object, circular) {
	if (object && typeof object === "object") {
		if (circular.indexOf(object) !== -1) {
			return true;
		}
		circular.push(object);
		for (let key in object) {
			// try {
			if (object.hasOwnProperty(key) && isCircular(object[key], circular)) {
				return true;
			}
			// } catch (e) {
			// 	return false;
			// }
		}
	}
	return false;
}

function getType(data) {
	if (data === null) {
		return "null";
	} else if (Array.isArray(data)) {
		return "array";
	} else if (typeof data === "boolean") {
		return "bool";
	} else if (typeof data === 'number' && data % 1 === 0) {
		return "int";
	} else if (typeof data === "number" && data % 1 !== 0) {
		return "float";
	} else if (data instanceof Date) {
		return "date";
	} else if (typeof data === "function") {//!isNaN(Date.parse(data))
		return "function";
	} else if (data instanceof Error) {
		return "error";
	} else if (typeof data === "object") {
		if (new RegExp("^[0-9a-fA-F]{24}$").test(data.toString())) {
			return "mongoId";
		} else if (data instanceof RegExp) {
			return "regExp";
		} else if (data.byteLength) {
			if (FileType(data)) {
				return "file";
			} else {
				return "buffer";
			}
		} else {
			return "object";
		}
	} else if (typeof data === "string") {
		if (isJson(data)) {
			return "json";
		} else if (isXml(data)) {
			return "xml";
		} else if (FileType(Buffer(data, "base64"))) {
			return "file";
		} else {
			return "string";
		}
	} else {
		return "undefined";
	}
}

function getLength(data, type) {
	if (type === "array") {
		return data.length;
	} else if (type === "buffer") {
		return data.byteLength;
	} else if (type === "file") {
		return data.byteLength ? data.byteLength : Buffer(data, "base64").byteLength;
	} else if (type === "function") {
		return data.toString().length;
	} else if (type === "json") {
		return data.length;
	} else if (type === "object") {
		return Object.keys(data).length;
	} else if (type === "string") {
		return data.length;
	} else if (type === "xml") {
		return data.length;
	} else {
		return null;
	}
}

function parseObject(data, type) {
	if (type === "json") {
		return JSON.parse(data);
	} else if (type === "xml") {
		return FastXmlParser.parse(data, {});
	} else {
		return data;
	}
}

function beautifyObject(data, type, wrapper, level) {
	let circular = [];
	let nl = '\n';
	let list = parseObject(data, type);
	let result = "";
	// let tab = wrapper.getTab(level);
	let tab = "";
	// console.write("xxx");
	// result += `${lineBreak}${wrapper.getTab(level)}`;
	for (let keys = Object.keys(list), i = 0, end = keys.length - 1; i <= end; i++) {
		let object = list[keys[i]];
		let objectType = getType(object);
		let objectLength = getLength(object, objectType);
		/**/
		let key = wrapper.wrapDataKey(keys[i], objectType, objectLength, level);
		// let value = isCircular(object, circular) ? wrapper.circular(object, object.length) : wrapper.wrapDataValue(objectType, beautify(object, wrapper, level), level);
		let value = isCircular(object, circular) ? wrapper.circular(object, object.length) : beautify(object, wrapper, level);
		/**/
		if (i === 0) {
			result += `${tab}${key}${value},${nl}`;
		} else if (i === end) {
			result += `${tab}${key}${value}${nl}`;
		} else {
			// console.write(123);
			result += `${tab}${key}${value},${nl}`;
		}
	}

	return result;
}

function _beautifyObject(data, type, wrapper, level) {
	let circular = [];
	let nl = '\r\n';
	let object = parseObject(data, type);
	let result = `${nl}${wrapper.getTab(level)}`;
	for (let keys = Object.keys(object), i = 0, end = keys.length - 1; i <= end; i++) {
		let objectType = getType(object[keys[i]]);
		let objectLength = getLength(object[keys[i]], objectType);
		if (isCircular(object[keys[i]], circular)) {
			result += `${wrapper.wrapDataKey(keys[i], objectType, objectLength)}${wrapper.circular(object[keys[i]], Object.keys(object[keys[i]]).length)}`;
		} else {
			result += `${wrapper.wrapDataKey(keys[i], objectType, objectLength)}${beautify(object[keys[i]], wrapper, level)}`;
		}
		if (i === end) {
			result += `${nl}${wrapper.getTab(level - 1)}`;
		} else {
			result += `,${nl}${wrapper.getTab(level)}`;
		}
	}
	return result;
}

function beautify(data, wrapper, level = 0) {
	let type = getType(data);
	// console.write(level)
	switch (type) {
		case "array":
			return wrapper.array(beautifyObject(data, type, wrapper, level + 1), level);
		case "bool":
			return wrapper.bool(data, level);
		case "buffer":
			return wrapper.buffer(data, level);
		case "date":
			return wrapper.date(data, level);
		case "error":
			return wrapper.error(data, level + 1);
		case "file":
			return wrapper.file(data, level);
		case "float":
			return wrapper.float(data, level);
		case "function":
			return wrapper.function(data, level + 1);
		// case "json":
		// 	return wrapper.json(beautifyObject(data, type, wrapper, level + 1), data.length);
		case "int":
			return wrapper.int(data, level);
		case "mongoId":
			return wrapper.mongoId(data, level);
		case "null":
			return wrapper.null(data, level);
		case "object":
			return wrapper.object(beautifyObject(data, type, wrapper, level + 1), level);
		case "regExp":
			return wrapper.regExp(data.toString(), level);
		case "string":
			return wrapper.string(data, level + 1);
		case "undefined":
			return wrapper.undefined(data, level);
		// case "xml":
		// 	return wrapper.xml(beautifyObject(data, type, wrapper, level + 1), data.length);
		default:
			return wrapper.default(data);
	}
}

const FaBeautifyPlain = require("./plain");
const FaBeautifyConsole = require("./console");
const FaBeautifyConsoleType = require("./console-type");
const FaBeautifyHtml = require("./html");
/*new*/
exports.plain = function (data) {
	return beautify(data, new FaBeautifyPlain());
};
exports.console = function (data) {
	return beautify(data, new FaBeautifyConsole());
};
exports.consoleType = function (data) {
	return beautify(data, new FaBeautifyConsoleType());
};
exports.html = function (data) {
	return beautify(data, new FaBeautifyHtml());
};

