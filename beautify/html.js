"use strict";
const FaBeautifyWrap = require("./wrap");
const FaError = require("../base/error");
const FCH = require('../console/console-helper');

class FaBeautifyWrapHtml extends FaBeautifyWrap {

	getWrap(type, data) {
		switch (type) {
			case "array":
				return `[<span class="fa-beautify-array">${data}]</span>`;
			case "bool":
				// return `${FCH.effect.bold}${data === true ? FCH.color.green : FCH.color.red}${data}</span>`;
				return `<span class="fa-beautify-${data === true ? "true" : "false"}">${data}</span>`;
			case "circular":
				// return `${FCH.effect.bold}${FCH.color.cyan}${data}</span>`;
				return `<span class="fa-beautify-circular">${data}</span>`;
			case "date":
				// return `${FCH.color.yellow}${data}</span>`;
				return `<span class="fa-beautify-date">${data}</span>`;
			case "file":
				// return `${FCH.bg.cyan} ${data} </span>`;
				return `<span class="fa-beautify-file"> ${data} </span>`;
			case "float":
				// return `${FCH.color.red}${data}</span>`;
				return `<span class="fa-beautify-float">${data}</span>`;
			case "function":
				// return `${FCH.color.cyan}${data}</span>`;
				return `<span class="fa-beautify-function">${data}</span>`;
			case "json":
				return `<span class="fa-beautify-json">${data}</span>`;
			case "int":
				// return `${FCH.color.green}${data}</span>`;
				return `<span class="fa-beautify-int">${data}</span>`;
			case "mongoId":
				// return `${FCH.bg.blue} ${data} </span>`;
				return `<span class="fa-beautify-mongo-id"> ${data} </span>`;
			case "null":
				// return `${FCH.effect.bold}${FCH.color.white}${data}</span>`;
				return `<span class="fa-beautify-null">${data}</span>`;
			case "object":
				return `{<span class="fa-beautify-object">${data}</span>}`;
			case "regular":
				// return `${FCH.effect.bold}${FCH.color.yellow}${data}</span>`;
				return `<span class="fa-beautify-regular">${data}</span>`;
			case "string":
				// return `${FCH.color.white}${data}</span>-->`;
				return `<span class="fa-beautify-string">${data}</span>`;
			case "undefined":
				// return `${FCH.effect.bold}${FCH.color.magenta}${data}</span>`;
				return `<span class="fa-beautify-undefined">${data}</span>`;
			case "xml":
				return `<span class="fa-beautify-xml">${data}</span>`;
			case "errorName":
				return `${data}`;
			case "errorMessage":
				return `${FCH.bg.red}<${data}>${FCH.effect.reset}`;
			case "errorTraceMethod":
				return `${FCH.color.white}${data}${FCH.effect.reset}`;
			case "errorTracePath":
				return `${FCH.effect.dim}${data}${FCH.effect.reset}`;
			case "errorTraceLine":
				return `${FCH.color.cyan}${data}${FCH.effect.reset}`;
			case "errorTraceColumn":
				return `${FCH.color.white}${data}${FCH.effect.reset}`;
			default:
				// return `${FCH.bg.magenta} ${data} </span>`;
				return `<span class="fa-beautify-default"> ${data} </span>`;
		}
	}

	array(data) {
		return this.wrapData("array", data);
	};

	bool(data) {
		return this.wrapData("bool", data);
	};

	circular(data) {
		return this.wrapData("circular", data);
	};

	date(data) {
		return this.wrapData("date", data);
	};

	error(data, trace, level) {
		// let context = this;
		// let trace_list = [];
		// let trace = data["trace"] ? data["trace"] : FaError.traceStack(data["stack"]);
		// for (let keys = Object.keys(trace), i = 0, end = keys.length - 1; i <= end; i++) {
		// 	// trace_list.push(`\n${context.getTab(level)}| ${FCH.color.white}${trace[keys[i]]['method']} </span>${FCH.effect.dim}${trace[keys[i]]['path']}</span>:${FCH.color.cyan}${trace[keys[i]]['line']}</span>:${FCH.color.white}${trace[keys[i]]['column']}</span>`);
		// }
		// trace = trace_list.join('');
		// return `<span> ${data["message"]} </span>${trace}`;
		return `${super.errorMessage(data["message"])}${super.errorTrace(trace, level)}`;
	};

	file(data) {
		return this.wrapData("file", data);
	};

	float(data) {
		return this.wrapData("float", data);
	};

	function(data, length, level) {
		return this.wrapData("function", this.wrapText(data, level));
	};

	json(data) {
		return this.wrapData("json", data);
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

	object(data) {
		return this.wrapData("object", data);
	};

	regular(data) {
		return this.wrapData("regular", data);
	};

	string(data, length, level) {
		return this.wrapData("string", this.wrapText(data, level));
	};

	undefined(data) {
		return this.wrapData("undefined", data);
	};

	xml(data) {
		return this.wrapData("xml", data);
	};
}

module.exports = FaBeautifyWrapHtml;
