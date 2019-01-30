"use strict";
const FaBeautifyWrap = require("./wrap");
const FCH = require("../console/console-helper");

class FaBeautifyConsole extends FaBeautifyWrap {
	wrapDataKey(key, type, length, level) {
		return `${this.getTab(level)}${FCH.effect.bold}${FCH.color.white}${key}${FCH.effect.reset}: `;
	}

	wrapDataValue(value, type, length, level) {
		let tab = this.getTab(level);
		let nl = "\n";
		switch (type) {
			case "array":
				return `${FCH.effect.dim}${FCH.color.white}[${FCH.effect.reset}${nl}${value}${tab}${FCH.effect.dim}${FCH.color.white}]${FCH.effect.reset}`;
			case "bool":
				return `${FCH.effect.bold}${value === true ? FCH.color.green : FCH.color.red}${value}${FCH.effect.reset}`;
			case "buffer":
				return `${FCH.effect.dim}<${FCH.effect.reset}${FCH.effect.bold}${FCH.color.blue}${type}${FCH.effect.reset}${FCH.effect.dim}>${FCH.effect.reset}`;
			case "circular":
				return `${FCH.effect.dim}<${FCH.effect.reset}${FCH.effect.bold}${FCH.color.cyan}${type}${FCH.effect.reset}${FCH.effect.dim}>${FCH.effect.reset}`;
			case "date":
				return `${FCH.color.yellow}${value}${FCH.effect.reset}`;
			case "file":
				return `${FCH.effect.dim}<${FCH.effect.reset}${FCH.effect.bold}${FCH.color.blue}${value}${FCH.effect.reset}${FCH.effect.dim}>${FCH.effect.reset}`;
			case "float":
				return `${FCH.color.red}${value}${FCH.effect.reset}`;
			case "function":
				return `${FCH.color.cyan}${value}${FCH.effect.reset}`;
			case "json":
				return `${FCH.bg.green}{${FCH.effect.reset}${nl}${value}${tab}${FCH.bg.green}}${FCH.effect.reset}`;
			case "int":
				return `${FCH.color.green}${value}${FCH.effect.reset}`;
			case "mongoId":
				return `${FCH.color.white}<${FCH.effect.reset}${FCH.effect.bold}${FCH.color.white}${value}${FCH.effect.reset}${FCH.color.white}>${FCH.effect.reset}`;
			case "null":
				return `${FCH.effect.bold}${FCH.color.cyan}${value}${FCH.effect.reset}`;
			case "object":
				return `${FCH.effect.dim}${FCH.color.white}{${FCH.effect.reset}${nl}${value}${tab}${FCH.effect.dim}${FCH.color.white}}${FCH.effect.reset}`;
			case "regExp":
				return `${FCH.effect.bold}${FCH.color.yellow}${value}${FCH.effect.reset}`;
			case "string":
				return `${FCH.effect.dim}${FCH.color.white}"${FCH.effect.reset}${FCH.color.white}${value}${FCH.effect.reset}${FCH.effect.dim}${FCH.color.white}"${FCH.effect.reset}`;
			case "undefined":
				return `${FCH.effect.bold}${FCH.color.magenta}${value}${FCH.effect.reset}`;
			case "xml":
				return `${FCH.bg.red}{${FCH.effect.reset}${nl}${value}${tab}${FCH.bg.red}}${FCH.effect.reset}`;
			default:
				return `${FCH.bg.magenta}/*${type}*/${FCH.effect.reset}`;
		}
	}

	wrapError(data, type) {
		switch (type) {
			case "name":
				return `${FCH.effect.underscore}${FCH.color.white}${data}${FCH.effect.reset}: `;
				// return "";
			case "message":
				return `${FCH.effect.bold}${FCH.effect.underscore}${FCH.color.red}${data}${FCH.effect.reset}`;
			case "method":
				return `${FCH.color.white}${data}${FCH.effect.reset}`;
			case "path":
				return `${FCH.effect.dim}${data}${FCH.effect.reset}`;
			case "line":
				return `${FCH.color.cyan}${data}${FCH.effect.reset}`;
			case "column":
				return `${FCH.color.white}${data}${FCH.effect.reset}`;
			default:
				return `${FCH.bg.magenta}/*${data}*/${FCH.effect.reset}`;
		}
	}
}

/**
 *
 * @type {FaBeautifyConsole}
 */
module.exports = FaBeautifyConsole;
