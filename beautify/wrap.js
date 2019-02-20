"use strict";
/*nodejs*/
const Buffer = require("buffer").Buffer;
const FileType = require("file-type");
/*fa-nodejs*/
const FaErrorStack = require("fa-nodejs/base/error-stack");

class FaBeautifyWrap {
	getTab(level) {
		let tab = `    `;
		let result = "";
		let count = level ? level : 0;
		for (let i = 0; i <= count - 1; i++) {
			result += tab;
		}
		return result;
	};

	wrapDataKey(key, type, length, level) {
		let tab = this.getTab(level);
		return `${tab}${key}: `;
	}

	wrapDataValue(value, type, length, level) {
		let tab = this.getTab(level);
		let nl = "\n";
		switch (type) {
			case "array":
				return `[${nl}${value}${tab}]`;
			case "bool":
				return value;
			case "buffer":
				return `<${type}>`;
			case "circular":
				return `<${type}>`;
			case "date":
				return value;
			case "file":
				return `<${value}>`;
			case "float":
				return value;
			case "function":
				return value;
			case "json":
				return `{${nl}${value}${tab}}`;
			case "int":
				return value;
			case "mongoId":
				return `<${value}>`;
			case "null":
				return value;
			case "object":
				return `{${nl}${value}${tab}}`;
			case "regExp":
				return value;
			case "string":
				return `"${value}"`;
			case "undefined":
				return value;
			case "xml":
				return `{${nl}${value}${tab}}`;
			default:
				return `/*${value}*/`;
		}
	}

	wrapError(data, type) {
		let result = "";
		switch (type) {
			case "name":
				result = `${data}: `;
				break;
			case "message":
				result = `${data}`;
				break;
			case "method":
				result = `${data}`;
				break;
			case "path":
				result = `${data}`;
				break;
			case "line":
				result = `${data}`;
				break;
			case "column":
				result = `${data}`;
				break;
			default:
				result = `${data}`;
		}
		return result;
	}

	wrapErrorTrace(trace, level) {
		let result = [];
		for (let keys = Object.keys(trace), i = 0, end = keys.length - 1; i <= end; i++) {
			result.push(`\n${this.getTab(level)}| ${this.wrapError(trace[keys[i]]["method"], "method")} ${this.wrapError(trace[keys[i]]["path"], "path")}:${this.wrapError(trace[keys[i]]["line"], "line")}:${this.wrapError(trace[keys[i]]["column"], "column")}`);
		}
		return result.join();
	}

	wrapText(data, level) {
		return data.replaceAll(["\t", "\n"], [this.getTab(1), `\n${this.getTab(level)}`]);
		// return data.replace(/\t/g, this.getTab(1)).replace(/\n/g, `\n${this.getTab(level)}`);
	};

	/**/
	array(data, level) {
		return this.wrapDataValue(data, "array", data.length, level);
	};

	bool(data, level) {
		return this.wrapDataValue(data, "bool", null, level);
	};

	buffer(data, level) {
		return this.wrapDataValue(data, "buffer", data.byteLength, level);
	};

	circular(data, level) {
		return this.wrapDataValue(data, "circular", data.length, level);
	};

	date(data, level) {
		return this.wrapDataValue(data, "date", null, level);
	};

	error(data, level) {
		let trace = data["trace"] ? data["trace"] : FaErrorStack.trace(data["stack"]);
		return `${this.wrapError(data["name"], "name")}${this.wrapError(data["message"], "message")}${this.wrapErrorTrace(trace, level)}`;
	};

	file(data, level) {
		let fileMime;
		let fileLength;
		if (data.byteLength) {
			fileMime = FileType(data).mime;
			fileLength = data.byteLength;
		} else {
			fileMime = FileType(Buffer(data, "base64")).mime;
			fileLength = data.length;
		}
		return this.wrapDataValue(fileMime, "file", fileLength, level);
	};

	float(data, level) {
		return this.wrapDataValue(data, "float", null, level);
	};

	function(data, level) {
		return this.wrapDataValue(this.wrapText(data.toString(), level), "function", data.toString().length, level);
	};

	json(data, level) {
		return this.wrapDataValue(data, "json", data.length, level);
	};

	int(data, level) {
		return this.wrapDataValue(data, "int", null, level);
	};

	mongoId(data, level) {
		return this.wrapDataValue(data, "mongoId", null, level);
	};

	null(data, level) {
		return this.wrapDataValue(data, "null", null, level);
	};

	object(data, level) {
		return this.wrapDataValue(data, "object", data.length, level);
	};

	regExp(data, level) {
		return this.wrapDataValue(data, "regExp", null, level);
	};

	string(data, level) {
		let string = this.wrapText(data, level).replaceAll('"', '\\"');
		return this.wrapDataValue(string, "string", data.length, level);
	};

	undefined(data, level) {
		return this.wrapDataValue(data, "undefined", null, level);
	};

	xml(data, level) {
		return this.wrapDataValue(data, "xml", data.length, level);
	};

	default(data, level) {
		return this.wrapDataValue(data, "default", data.length, level);
	};
}

/**
 *
 * @type {FaBeautifyWrap}
 */
module.exports = FaBeautifyWrap;
