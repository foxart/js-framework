"use strict";

class FaBeautifyWrap {
	getTab(level) {
		return Array(level + 1).join("    ");
	};

	wrapType(type, length) {
		// length = !length ? '' : `(${length})`;
		// return `${type.capitalize()}${length} `;
		return "";
	}

	wrapData(type, data) {
		let result = "";
		switch (type) {
			case "array":
				result = `<[ ${data} ]>`;
				break;
			case "circular":
				return `(circular)`;
			case "file":
				result = `(${data})`;
				break;
			case "object":
				result = `<{ ${data} }>`;
				break;
			default:
				result = `${data}`;
		}
		return result;
	}

	wrapError(type, data) {
		let result = "";
		switch (type) {
			case "name":
				return "";
			case "message":
				return `<${data}>`;
			default:
				result = `${data}`;
		}
		return result;
	}

	wrapText(data, level) {
		return data.toString().replaceAll(["\t", "\n"], [this.getTab(1), `\n${this.getTab(level)}`]);
	};

	array(data) {
		return `${this.wrapType("array")}${this.wrapData("array", data)}`;
	};

	bool(data) {
		return `${this.wrapType("bool")}${this.wrapData("bool", data)}`;
	};

	circular(data, length) {
		return `${this.wrapType("circular", length)}${this.wrapData("circular", data)}`;
	};

	date(data) {
		return `${this.wrapType("date")}${this.wrapData("date", data)}`;
	};

	error(data, trace, level) {
		let context = this;

		function wrapTrace(data, level) {
			let result = [];
			for (let keys = Object.keys(trace), i = 0, end = keys.length - 1; i <= end; i++) {
				result.push(`\n${context.getTab(level)}| ${context.wrapError("method", trace[keys[i]]["method"])} ${context.wrapError("path", trace[keys[i]]["path"])}:${context.wrapError("line", trace[keys[i]]["line"])}:${context.wrapError("column", trace[keys[i]]["column"])}`);
			}
			return result.join();
		}

		return `${this.wrapType("error", data["name"])}${this.wrapData("error", data["message"])}${wrapTrace(trace, level)}`;
	};

	file(data) {
		return `${this.wrapType("file")}${this.wrapData("file", data)}`;
	};

	float(data) {
		return `${this.wrapType("float")}${this.wrapData("float", data)}`;
	};

	function(data, length, level) {
		return `${this.wrapType("function", length)}${this.wrapData("function", this.wrapText(data, level))}`;
	};

	json(data, length) {
		return `${this.wrapType("json", length)}${this.wrapData("json", data)}`;
	};

	int(data) {
		return `${this.wrapType("int")}${this.wrapData("int", data)}`;
	};

	mongoId(data) {
		return `${this.wrapType("mongoId")}${this.wrapData("mongoId", data)}`;
	};

	null(data) {
		return `${this.wrapType("null")}${this.wrapData("null", data)}`;
	};

	object(data, length) {
		return `${this.wrapType("object", length)}${this.wrapData("object", data)}`;
	};

	regular(data) {
		return `${this.wrapType("regular")}${this.wrapData("regular", data)}`;
	};

	string(data, length, level) {
		return `${this.wrapType("string", length)}${this.wrapData("string", this.wrapText(data, level))}`;
	};

	undefined(data) {
		return `${this.wrapType("undefined")}${this.wrapData("undefined", data)}`;
	};

	xml(data, length) {
		return `${this.wrapType("xml", length)}${this.wrapData("xml", data)}`;
	};
}

/**
 *
 * @type {FaBeautifyWrap}
 */
module.exports = FaBeautifyWrap;
