"use strict";
/*node*/
/** @type {Object} */
const DateAndTime = require("date-and-time");
/*fa*/
const FaBeautify = require("fa-nodejs/beautify");
const FCH = require("fa-nodejs/console/console-helper");
/** @member {FaTrace|Class} */
const FaTrace = require("fa-nodejs/base/trace");
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

class FaConsoleClass {
	/**
	 *
	 * @param type {string|null}
	 */
	constructor(type = null) {
		this._wrapper = this._getWrapper(type);
		let self = this;
		console.log = function () {
			self._log(self._wrapper.call(this, self._extractArguments(arguments)), template.log);
		};
		console.info = function () {
			self._log(self._wrapper.call(this, self._extractArguments(arguments)), template.info);
		};
		console.warn = function () {
			self._log(self._wrapper.call(this, self._extractArguments(arguments)), template.warn);
		};
		console.error = function () {
			self._log(self._wrapper.call(this, self._extractArguments(arguments)), template.error);
		};
		console.message = function () {
			let result = [];
			let text = FaBeautify.plain(self._extractArguments(arguments));
			let message = typeof text === "string" ? text.split("\n") : text.toString();
			let align = self._getAlign(message);
			result.push(self._messageHeader(align));
			for (let keys = Object.keys(message), i = 0, end = keys.length - 1; i <= end; i++) {
				result.push(`${self._messageBody(message[keys[i]], align)}`);
			}
			result.push(`${self._messageFooter(align)}`);
			self._log("\n" + result.join("\n"), template.log);
		}
	}

	_getAlign(list) {
		let result = 0;
		for (let keys = Object.keys(list), i = 0, end = keys.length - 1; i <= end; i++) {
			if (result < list[keys[i]].length) {
				result = list[keys[i]].length;
			}
		}
		return result;
	}

	_messageHeader(align) {
		return `\u250c\u2500${Array(align + 1).join("\u2500")}\u2500\u2510`;
	}

	_messageFooter(align) {
		return `\u2514\u2500${Array(align + 1).join("\u2500")}\u2500\u2518`;
	}

	_messageSpacer(align) {
		return `\u251c\u2500${Array(align + 1).join("\u2500")}\u2500\u2524`;
	}

	_messageBody(data, align) {
		let wrapper = "\u2502";
		let spacer = " ";
		if (data === undefined) {
			data = "undefined"
		}
		let length = align - data.length + 1;
		if (length < 0) {
			return `${wrapper}${spacer}${data.toString().substring(0, align)}${spacer}${wrapper}`;
		} else {
			return `${wrapper}${spacer}${data.toString() + Array(length).join(spacer)}${spacer}${wrapper}`;
		}
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
		let trace = FaTrace.trace(2);
		// let path = trace["path"] ? trace["path"].replace(process.cwd(), "") : trace["path"];
		let path = trace["path"] ;
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
