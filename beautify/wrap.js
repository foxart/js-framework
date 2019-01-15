"use strict";
const FaError = require("../base/error");

class FaBeautifyWrapConsole {
	getTab(level) {
		return Array(level + 1).join("    ");
	};

	array(data) {
		return data;
	};

	bool(data) {
		return data;
	};

	circular(data) {
		return data;
	};

	date(data) {
		return data;
	};

	error(data, level) {
		let context = this;
		let trace_list = [];
		let trace = data["trace"] ? data["trace"] : FaError.traceStack(data["stack"]);
		for (let keys = Object.keys(trace), i = 0, end = keys.length - 1; i <= end; i++) {
			trace_list.push(`\n${context.getTab(level)}| ${trace[keys[i]]['method']} ${trace[keys[i]]['path']}:${trace[keys[i]]['line']}:${trace[keys[i]]['column']}`);
		}
		trace = trace_list.join('');
		return `${data["name"]} ${data["message"]} ${trace}`;
	};

	file(data) {
		return data;
	};

	float(data) {
		return data;
	};

	function(data, length, level) {
		return data.toString().replaceAll(["\t", "\n"], [this.getTab(1), `\n${this.getTab(level)}`]);
	};

	json(data) {
		return data;
	};

	int(data) {
		return data;
	};

	mongo(data) {
		return data;
	};

	null(data) {
		return data;
	};

	object(data) {
		return data;
	};

	regular(data) {
		return data;
	};

	string(data, length, level) {
		return data.toString().replaceAll(["\t", "\n"], [this.getTab(1), `\n${this.getTab(level)}`]);
	};

	undefined(data) {
		return data;
	};

	xml(data) {
		return data;
	};
}

module.exports = FaBeautifyWrapConsole;
