"use strict";
const FaBeautifyWrap = require("./wrap");
const FaError = require("../base/error");
const FCH = require('../console/console-helper');

class FaBeautifyWrapConsole extends FaBeautifyWrap {
	array(data) {
		return super.array(data);
	};

	bool(data) {
		return `${FCH.effect.bold}${data === true ? FCH.color.green : FCH.color.red}${super.bool(data)}${FCH.effect.reset}`;
	};

	circular(data) {
		return `${FCH.effect.bold}${FCH.color.cyan}${super.circular(data)}${FCH.effect.reset}`;
	};

	date(data) {
		return `${FCH.color.yellow}${super.date(data)}${FCH.effect.reset}`;
	};

	error(data, level) {
		let context = this;
		let trace_list = [];
		let trace = data["trace"] ? data["trace"] : FaError.traceStack(data["stack"]);
		for (let keys = Object.keys(trace), i = 0, end = keys.length - 1; i <= end; i++) {
			trace_list.push(`\n${context.getTab(level)}| ${FCH.color.white}${trace[keys[i]]['method']} ${FCH.effect.reset}${FCH.effect.dim}${trace[keys[i]]['path']}${FCH.effect.reset}:${FCH.color.cyan}${trace[keys[i]]['line']}${FCH.effect.reset}:${FCH.color.white}${trace[keys[i]]['column']}${FCH.effect.reset}`);
		}
		trace = trace_list.join('');
		return `${FCH.bg.red} ${data["message"]} ${FCH.effect.reset}${trace}`;
	};

	file(data) {
		return `${FCH.bg.cyan} ${super.file(data)} ${FCH.effect.reset}`;
	};

	float(data) {
		return `${FCH.color.red}${super.float(data)}${FCH.effect.reset}`;
	};

	function(data, length, level) {
		let content = super.function(data, length, level);
		return `${FCH.color.cyan}${content}${FCH.effect.reset}`;
	};

	json(data) {
		return super.json(data);
	};

	int(data) {
		return `${FCH.color.green}${super.int(data)}${FCH.effect.reset}`;
	};

	mongo(data) {
		return `${FCH.bg.blue} ${super.mongo(data)} ${FCH.effect.reset}`;
	};

	null(data) {
		return `${FCH.effect.bold}${FCH.color.white}${super.null(data)}${FCH.effect.reset}`;
	};

	object(data) {
		return super.object(data);
	};

	regular(data) {
		return `${FCH.effect.bold}${FCH.color.yellow}${super.regular(data)}${FCH.effect.reset}`;
	};

	string(data, length, level) {
		return `${FCH.effect.reset}${FCH.color.white}${super.string(data, length, level)}${FCH.effect.reset}`;
	};

	undefined(data) {
		return `${FCH.effect.bold}${FCH.color.magenta}${super.undefined(data)}${FCH.effect.reset}`;
	};

	xml(data) {
		return super.xml(data);
	};
}

module.exports = FaBeautifyWrapConsole;
