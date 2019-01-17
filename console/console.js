'use strict';
/*modules*/
const FaBeautify = require('../beautify');
const FCH = require('./console-helper');
const FaError = require('../base/error');
/**
 *
 * @type {{warn: string, log: string, error: string, info: string}}
 */
let templateTime = {
	log: `${FCH.color.white}[${FCH.effect.dim}{time}${FCH.effect.reset}${FCH.color.white}]`,
	info: `${FCH.color.white}[${FCH.effect.dim}{time}${FCH.effect.reset}${FCH.color.white}]`,
	warn: `${FCH.color.white}[${FCH.effect.dim}{time}${FCH.effect.reset}${FCH.color.white}]`,
	error: `${FCH.color.white}[${FCH.effect.dim}{time}${FCH.effect.reset}${FCH.color.white}]`,
};
/**
 *
 * @type {{warn: string, log: string, error: string, info: string}}
 */
// let templateType = {
// 	log: `${FCH.bg.green}${FCH.color.white} ${FCH.sign.check} ${FCH.effect.reset}`,
// 	info: `${FCH.bg.cyan}${FCH.color.white} ${FCH.sign.excl} ${FCH.effect.reset}`,
// 	warn: `${FCH.bg.yellow}${FCH.color.white} ${FCH.sign.quest} ${FCH.effect.reset}`,
// 	error: `${FCH.bg.red}${FCH.color.white} ${FCH.sign.cross} ${FCH.effect.reset}`,
// };
let templateType = {
	log: `${FCH.color.white}[${FCH.effect.bold}${FCH.color.white}LOG${FCH.effect.reset}${FCH.color.white}]`,
	info: `${FCH.color.white}[${FCH.effect.bold}${FCH.color.cyan}INF${FCH.effect.reset}${FCH.color.white}]`,
	warn: `${FCH.color.white}[${FCH.effect.bold}${FCH.color.yellow}WRN${FCH.effect.reset}${FCH.color.white}]`,
	error: `${FCH.color.white}[${FCH.effect.bold}${FCH.color.red}ERR${FCH.effect.reset}${FCH.color.white}]`,
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
	log: `${FCH.effect.reset}:${FCH.color.cyan}{line}${FCH.effect.reset}:${FCH.color.white}{column}${FCH.effect.reset}`,
	info: `${FCH.effect.reset}:${FCH.color.cyan}{line}${FCH.effect.reset}:${FCH.color.white}{column}${FCH.effect.reset}`,
	warn: `${FCH.effect.reset}:${FCH.color.cyan}{line}${FCH.effect.reset}:${FCH.color.white}{column}${FCH.effect.reset}`,
	error: `${FCH.effect.reset}:${FCH.color.cyan}{line}${FCH.effect.reset}:${FCH.color.white}{column}${FCH.effect.reset}`,
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
	process.stdout.write('\x1Bc');
};

console.write = console.log;

class FaConsoleClass {
	/**
	 *
	 * @param type {string|null}
	 */
	constructor(type = null) {
		this._wrapConsole(this._getWrapper(type))
	}

	/**
	 *
	 * @param wrapper {function}
	 * @private
	 */
	_wrapConsole(wrapper) {
		let context = this;
		console.log = function () {
			context._log(wrapper.call(this, context._extractArguments(arguments)), template.log);
		};
		console.info = function () {
			context._log(wrapper.call(this, context._extractArguments(arguments)), template.info);
		};
		console.warn = function () {
			context._log(wrapper.call(this, context._extractArguments(arguments)), template.warn);
		};
		console.error = function () {
			context._log(wrapper.call(this, context._extractArguments(arguments)), template.error);
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
			case "wrap":
				return FaBeautify.wrap;
			case "wrap-console":
				return FaBeautify.wrapConsole;
			case "wrap-console-type":
				return FaBeautify.wrapConsoleType;
			case "wrap-html":
				return FaBeautify.wrapHtml;
			case "wrap-html-type":
				return FaBeautify.wrapHtmlType;
			default:
				return FaBeautify.wrap;
		}
	}

	/**
	 *
	 * @param data
	 * @param template
	 * @private
	 */
	_log(data, template) {
		let trace = FaError.pickTrace("console", 3).trace[0];
		let time = new Date().toLocaleTimeString();
		let path = trace['path'] ? trace['path'].replace(process.cwd(), '') : trace['path'];
		let line = trace["line"];
		let column = trace["column"];
		let string = template.replaceAll([
				'{time}', '{path}', '{line}', '{column}', '{data}',
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
