"use strict";
/*nodejs*/
/**
 * @type {Object}
 */
const DateAndTime = require("date-and-time");
/*modules*/
const FaBeautify = require("../beautify");
const FCH = require("./console-helper");
const FaError = require("../base/error");
/**
 *
 * @type {{warn: string, log: string, error: string, info: string}}
 */
let templateTime = {
	log: `${FCH.color.white}[${FCH.effect.dim}{time}${FCH.effect.reset}${FCH.color.white}]${FCH.effect.reset}`,
	info: `${FCH.color.white}[${FCH.effect.dim}{time}${FCH.effect.reset}${FCH.color.white}]${FCH.effect.reset}`,
	warn: `${FCH.color.white}[${FCH.effect.dim}{time}${FCH.effect.reset}${FCH.color.white}]${FCH.effect.reset}`,
	error: `${FCH.color.white}[${FCH.effect.dim}{time}${FCH.effect.reset}${FCH.color.white}]${FCH.effect.reset}`,
};
/**
 *
 * @type {{warn: string, log: string, error: string, info: string}}
 */
let templateType = {
	log: `${FCH.color.white}[${FCH.effect.reset}${FCH.bg.white}${FCH.color.black}LOG${FCH.effect.reset}${FCH.color.white}]${FCH.effect.reset}`,
	info: `${FCH.color.white}[${FCH.effect.reset}${FCH.bg.cyan}${FCH.color.white}INF${FCH.effect.reset}${FCH.color.white}]${FCH.effect.reset}`,
	warn: `${FCH.color.white}[${FCH.effect.reset}${FCH.bg.yellow}${FCH.color.black}WRN${FCH.effect.reset}${FCH.color.white}]${FCH.effect.reset}`,
	error: `${FCH.color.white}[${FCH.effect.reset}${FCH.bg.red}${FCH.color.white}ERR${FCH.effect.reset}${FCH.color.white}]${FCH.effect.reset}`,
};
/**
 *
 * @type {{warn: string, log: string, error: string, info: string}}
 */
let templatePath = {
	log: `${FCH.color.white}{path}${FCH.effect.reset}`,
	info: `${FCH.color.white}{path}${FCH.effect.reset}`,
	warn: `${FCH.color.white}{path}${FCH.effect.reset}`,
	error: `${FCH.color.white}{path}${FCH.effect.reset}`,
};
/**
 *
 * @type {{warn: string, log: string, error: string, info: string}}
 */
let templateLine = {
	log: `:${FCH.color.cyan}{line}${FCH.effect.reset}:${FCH.color.white}{column}${FCH.effect.reset}`,
	info: `:${FCH.color.cyan}{line}${FCH.effect.reset}:${FCH.color.white}{column}${FCH.effect.reset}`,
	warn: `:${FCH.color.cyan}{line}${FCH.effect.reset}:${FCH.color.white}{column}${FCH.effect.reset}`,
	error: `:${FCH.color.cyan}{line}${FCH.effect.reset}:${FCH.color.white}{column}${FCH.effect.reset}`,
};
/**
 *
 * @type {{warn: string, log: string, error: string, info: string}}
 */
let template = {
	log: `${templateTime.log} ${templateType.log} ${templatePath.log}${templateLine.log} {data}`,
	info: `${templateTime.info} ${templateType.info} ${templatePath.info}${templateLine.info} {data}`,
	warn: `${templateTime.warn} ${templateType.warn} ${templatePath.warn}${templateLine.warn} {data}`,
	error: `${templateTime.error} ${templateType.error} ${templatePath.error}${templateLine.error} {data}`,
};
const Console = {
	log: console.log,
	info: console.info,
	warn: console.warn,
	error: console.error,
};
console.clear = function () {
	process.stdout.write("\x1Bc");
};
console.write = console.log;

class FaConsoleClass {
	/**
	 *
	 * @param type {string|null}
	 */
	constructor(type = null) {
		this._wrapper = this._getWrapper(type);
		let context = this;
		console.log = function () {
			context._log(context._wrapper.call(this, context._extractArguments(arguments)), template.log);
		};
		console.info = function () {
			context._log(context._wrapper.call(this, context._extractArguments(arguments)), template.info);
		};
		console.warn = function () {
			context._log(context._wrapper.call(this, context._extractArguments(arguments)), template.warn);
		};
		console.error = function () {
			context._log(context._wrapper.call(this, context._extractArguments(arguments)), template.error);
		};
	}

	/**
	 *
	 * @param data
	 * @return {*}
	 * @private
	 */
	_extractArguments(data) {
		return data.length === 1 ? data[0] : data
	}

	/**
	 *
	 * @param type
	 * @return {function}
	 * @private
	 */
	_getWrapper(type) {
		switch (type) {
			case "plain":
				return FaBeautify.plain;
			case "console":
				return FaBeautify.console;
			case "console-type":
				return FaBeautify.consoleType;
			case "html":
				return FaBeautify.html;
			case "html-type":
				return FaBeautify.htmlType;
			default:
				return FaBeautify.plain;
		}
	}

	/**
	 *
	 * @param data
	 * @param template
	 * @private
	 */
	_log(data, template) {
		let time = DateAndTime.format(new Date(new Date().setUTCHours(new Date().getUTCHours() + 2)), "H:mm:ss");
		let trace = FaError.pickTrace("console", 3).trace[0];
		let path = trace["path"] ? trace["path"].replace(process.cwd(), "") : trace["path"];
		let line = trace["line"];
		let column = trace["column"];
		let string = template.replaceAll([
				"{time}", "{path}", "{line}", "{column}", "{data}",
			], [
				time, path, line, column, data,
			]
		);
		Console.log(string);
	}
}

/**
 *
 * @param type {string|null}
 * @return {FaConsoleClass}
 */
module.exports = function (type = null) {
	if (type) {
		return new FaConsoleClass(type);
	} else {
		return FaConsoleClass;
	}
};
