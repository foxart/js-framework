"use strict";
const FileType = require("file-type");

class FaBeautifyWrap {
	getTab(level) {
		let result = "";
		let tab = `    `;
		for (let i = 0; i <= level - 1; i++) {
			result += tab;
		}
		return result;
	};

	wrapData(type, data, length) {
		// return `${this.wrapDataType(type, length)}${this.wrapDataValue(type, data)}`;
		// return `${this.wrapDataKey(data)}${this.wrapDataValue(type, data)}`;
		return `${this.wrapDataValue(type, data)}`;
	}

	wrapDataKey(data) {
		return `${data}: `;
	}

	wrapDataType(type, length) {
		return "";
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

	wrapText(data, level) {
		return data.toString().replaceAll(["\t", "\n"], [this.getTab(1), `\n${this.getTab(level)}`]);
	};

	array(data, length) {
		return this.wrapData("array", data, length);
	};

	bool(data) {
		return this.wrapData("bool", data);
	};

	buffer(data, length) {
		return this.wrapData("buffer", data, length);
	};

	circular(data, length) {
		return this.wrapData("circular", data, length);
	};

	date(data) {
		return this.wrapData("date", data);
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
		// return `${this.wrapError("name", data["name"])}${this.wrapData("error", data["message"])}${wrapTrace(trace, level)}`;
		return `${this.wrapError("name", data["name"])}${this.wrapError("message", data["message"])}${wrapTrace(trace, level)}`;
	};

	file(data) {
		let fileMime;
		let fileLength;
		if (data.byteLength) {
			fileMime = FileType(data).mime;
			fileLength = data.byteLength;
		} else {
			fileMime = FileType(Buffer.from(data, "base64")).mime;
			fileLength = data.length;
		}
		return this.wrapData("file", fileMime, fileLength);
	};

	float(data) {
		return this.wrapData("float", data);
	};

	function(data, length, level) {
		return this.wrapData("function", this.wrapText(data, level), length);
	};

	json(data, length) {
		return this.wrapData("json", data, length);
	};

	int(data) {
		return this.wrapData("int", data);
	};

	mongoId(data) {
		return this.wrapData("mongoId", data);
	};

	null(data) {
		return this.wrapData("null", data);
	};

	object(data, length) {
		return this.wrapData("object", data, length);
	};

	regExp(data) {
		return this.wrapData("regExp", data);
	};

	string(data, length, level) {
		return this.wrapData("string", this.wrapText(data, level), length);
	};

	undefined(data) {
		return this.wrapData("undefined", data);
	};

	xml(data, length) {
		return this.wrapData("xml", data, length);
	};

	default(data) {
		return this.wrapData("default", data);
		// return `/* ${data} */`;
	};
}

/**
 *
 * @type {FaBeautifyWrap}
 */
module.exports = FaBeautifyWrap;
