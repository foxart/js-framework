"use strict";
const FileType = require("file-type");

class FaBeautifyWrap {
	getTab(level) {
		let tab = `    `;
		// let tab = `___`;
		let result = "";
		let count = level ? level : 0;
		for (let i = 0; i <= count - 1; i++) {
			result += tab;
		}
		return result;
	};

	// wrapDataValue(type, data, length) {
	// 	// return `${this.wrapDataValueType(type, length)}${this.wrapDataValueValue(type, data)}`;
	// 	// return `${this.wrapDataValueKey(data)}${this.wrapDataValueValue(type, data)}`;
	// 	return `${this.wrapDataValueValue(type, data)}`;
	// }
	wrapDataKey(data) {
		return `${data}: `;
	}

	wrapDataValue(type, data) {
		switch (type) {
			case "array":
				return `[${data}]`;
			case "circular":
				return `<${type}>`;
			case "buffer":
				return `<${type}>`;
			case "file":
				return `<${data}>`;
			case "json":
				return `{${data}}`;
			case "object":
				return `{${data}}`;
			case "xml":
				return `{${data}}`;
			default:
				return `${data}`;
		}
	}

	wrapError(type, data) {
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

	wrapObject(data, level) {
		return data;
	}

	wrapText(data, level) {
		return data.toString().replaceAll(["\t", "\n"], [this.getTab(1), `\n${this.getTab(level)}`]);
	};

	/**/
	array(data, level) {
		return this.wrapDataValue("array", data, level);
	};

	bool(data, level) {
		return this.wrapDataValue("bool", data, level);
	};

	buffer(data, level) {
		return this.wrapDataValue("buffer", data, level);
	};

	circular(data, level) {
		return this.wrapDataValue("circular", data, level);
	};

	date(data) {
		return this.wrapDataValue("date", data);
	};

	error(data, level) {
		function wrapTrace(trace, level) {
			let result = [];
			for (let keys = Object.keys(trace), i = 0, end = keys.length - 1; i <= end; i++) {
				result.push(`\n${context.getTab(level)}| ${context.wrapError("method", trace[keys[i]]["method"])} ${context.wrapError("path", trace[keys[i]]["path"])}:${context.wrapError("line", trace[keys[i]]["line"])}:${context.wrapError("column", trace[keys[i]]["column"])}`);
			}
			return result.join();
		}

		let context = this;
		let trace = data["trace"] ? data["trace"] : FaError.traceStack(data["stack"]);
		// return `${this.wrapError("name", data["name"])}${this.wrapDataValue("error", data["message"])}${wrapTrace(trace, level)}`;
		return `${this.wrapError("name", data["name"])}${this.wrapError("message", data["message"])}${wrapTrace(trace, level)}`;
	};

	file(data, level) {
		let fileMime;
		let fileLength;
		if (data.byteLength) {
			fileMime = FileType(data).mime;
			fileLength = data.byteLength;
		} else {
			fileMime = FileType(Buffer.from(data, "base64")).mime;
			fileLength = data.length;
		}
		return this.wrapDataValue("file", fileMime, level);
	};

	float(data, level) {
		return this.wrapDataValue("float", data, level);
	};

	function(data, level) {
		return this.wrapDataValue("function", this.wrapText(data, level), level);
	};

	json(data, level) {
		return this.wrapDataValue("json", data, level);
	};

	int(data, level) {
		return this.wrapDataValue("int", data, level);
	};

	mongoId(data, level) {
		return this.wrapDataValue("mongoId", data, level);
	};

	null(data, level) {
		return this.wrapDataValue("null", data, level);
	};

	object(data, level) {
		return this.wrapDataValue("object", data, level);
	};

	regExp(data) {
		return this.wrapDataValue("regExp", data);
	};

	string(data, level) {
		return this.wrapDataValue("string", this.wrapText(data, level), level);
	};

	undefined(data, level) {
		return this.wrapDataValue("undefined", data, level);
	};

	xml(data, level) {
		return this.wrapDataValue("xml", data, level);
	};

	default(data, level) {
		return this.wrapDataValue("default", data, level);
		// return `/* ${data} */`;
	};
}

/**
 *
 * @type {FaBeautifyWrap}
 */
module.exports = FaBeautifyWrap;
