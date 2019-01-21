"use strict";
/*node*/
// const Buffer = require("buffer").Buffer;
const FastXmlParser = require("fast-xml-parser");
const FileType = require("file-type");
/*fa*/
const FaError = require("fa-nodejs/base/error");

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
function checkXml(xml) {
	try {
		return FastXmlParser.validate(xml) === true;
	} catch (error) {
		return false;
	}
}

function stringify(object, level, wrapper) {
	let memory = [];

	function circular(object) {
		if (object && typeof object === "object") {
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
	let tab = wrapper.getTab(level);
	let result = `${bl}${nl}${tab}`;
	level++;
	for (let keys = Object.keys(object), i = 0, end = keys.length - 1; i <= end; i++) {
		if (circular(object[keys[i]]) === true) {
			result += `${keys[i]}: ${beautify(object[keys[i]], level, true, wrapper)}`;
		} else {
			result += `${keys[i]}: ${beautify(object[keys[i]], level, false, wrapper)}`;
		}
		if (i !== end) {
			result += `,${nl}${tab}`;
		}
	}
	result += `${nl}${getTab(level - 1)}${br}`;
	return result;
}

function beautify(data, level, circular, wrapper) {
	level = level === undefined ? 0 : level;
	if (circular === true) {
		return wrapper.circular(data, Object.keys(data).length);
	} else if (data === null) {
		/*null*/
		return wrapper.null(data);
	} else if (Array.isArray(data)) {
		return wrapper.array(stringify(data, level, wrapper), data.length);
	} else if (typeof data === "boolean") {
		/*bool*/
		return wrapper.bool(data);
	} else if (typeof data === 'number' && data % 1 === 0) {
		/*int*/
		return wrapper.int(data);
	} else if (typeof data === "number" && data % 1 !== 0) {
		/*float*/
		return wrapper.float(data);
	} else if (data instanceof Date) {
		/*date*/
		return wrapper.date(data);
		// } else if (!isNaN(Date.parse(data))) {
		// 	/*date*/
		// 	return wrapper.date(new Date(data), server1.color);
	} else if (typeof data === "function") {
		/*function*/
		return wrapper.function(data, data.toString().length, level);
	} else if (data instanceof Error) {
		/*error*/
		return wrapper.error(data, data["trace"] = data["trace"] ? data["trace"] : FaError.traceStack(data["stack"]), level);
	} else if (typeof data === "object") {
		try {
			if (new RegExp("^[0-9a-fA-F]{24}$").test(data.toString())) {
				/*mongo*/
				return wrapper.mongoId(data);
			} else if (data instanceof RegExp) {
				/*regexp*/
				return wrapper.regular(data.toString());
			} else if (data.byteLength) {
				//todo rewrite to true type detection
				/*image*/
				return wrapper.file(FileType(data).mime, data.byteLength);
			} else {
				/*object*/
				return wrapper.object(stringify(data, level, wrapper), Object.keys(data).length);
			}
		} catch (e) {
			/*object*/
			return wrapper.object(stringify(data, level, wrapper), Object.keys(data).length);
		}
	} else if (typeof data === "string") {
		if (checkJson(data)) {
			/*json*/
			return wrapper.json(beautify(JSON.parse(data), level, false, wrapper), data.length);
		} else if (checkXml(data)) {
			/*xml*/
			return wrapper.xml(beautify(FastXmlParser.parse(data, {}), level, false, wrapper), data.length);
			// } else if (FileType(Buffer.from(data, "base64"))) {
		} else if (FileType(new Buffer(data, "base64"))) {
			/*file*/
			// let file = Buffer.from(data, "base64");
			let file = new Buffer(data, "base64");
			return wrapper.file(FileType(file).mime, file.byteLength);
		} else {
			/*string*/
			return wrapper.string(data, data.length, level);
		}
	} else {
		/*undefined*/
		return wrapper.undefined(data);
	}
}

const FaBeautifyPlain = require("./plain");
const FaBeautifyConsole = require("./console");
const FaBeautifyConsoleType = require("./console-type");
const FaBeautifyHtml = require("./html");
/*new*/
exports.plain = function (data) {
	return beautify(data, 1, false, new FaBeautifyPlain());
};
exports.console = function (data) {
	return beautify(data, 1, false, new FaBeautifyConsole());
};
exports.consoleType = function (data) {
	return beautify(data, 1, false, new FaBeautifyConsoleType());
};
exports.html = function (data) {
	return beautify(data, 1, false, new FaBeautifyHtml());
};
