"use strict";
const FaBeautifyWrap = require("./wrap");
const FCH = require("../console/console-helper");

class FaBeautifyConsole extends FaBeautifyWrap {
	wrapDataKey(data, type, length, level) {
		let tab = this.getTab(level);
		// let tab = "";
		return `${tab}${FCH.effect.bold}${FCH.color.white}${data}${FCH.effect.reset}: `;
	}

	wrapDataValue(type, data, level) {
		// console.write(level, this.getTab(level));
		let tab = this.getTab(level);
		// let tab = "";
		let nl = "\n";
		switch (type) {
			case "array":
				return `${FCH.color.white}[${nl}${tab}${FCH.effect.reset}${data}${FCH.color.white}${nl}${tab}]${FCH.effect.reset}`;
			case "bool":
				return `${FCH.effect.bold}${data === true ? FCH.color.green : FCH.color.red}${data}${FCH.effect.reset}`;
			case "buffer":
				return `${FCH.effect.bold}${FCH.color.white}<${FCH.color.blue}${type}${FCH.color.white}>${FCH.effect.reset}`;
			case "circular":
				return `${FCH.effect.bold}${FCH.color.white}<${FCH.color.cyan}${type}${FCH.color.white}>${FCH.effect.reset}`;
			case "date":
				return `${FCH.color.yellow}${data}${FCH.effect.reset}`;
			case "file":
				return `${FCH.effect.bold}${FCH.color.white}<${FCH.color.blue}${data}${FCH.color.white}>${FCH.effect.reset}`;
			case "float":
				return `${FCH.color.red}${data}${FCH.effect.reset}`;
			case "function":
				return `${FCH.color.cyan}${data}${FCH.effect.reset}`;
			case "json":
				return `${FCH.effect.bold}{${FCH.effect.reset}${data}${FCH.effect.bold}}${FCH.effect.reset}`;
			case "int":
				return `${FCH.color.green}${data}${FCH.effect.reset}`;
			case "mongoId":
				return `${FCH.bg.cyan} ${data} ${FCH.effect.reset}`;
			case "null":
				return `${FCH.effect.bold}${FCH.color.cyan}${data}${FCH.effect.reset}`;
			case "object":
				return `${FCH.color.white}{${nl}${FCH.effect.reset}${data}${FCH.color.white}${tab}}${FCH.effect.reset}`;
			case "regExp":
				return `${FCH.effect.bold}${FCH.color.yellow}${data}${FCH.effect.reset}`;
			case "string":
				return `${FCH.color.white}${data}${FCH.effect.reset}`;
			case "undefined":
				return `${FCH.effect.bold}${FCH.color.magenta}${data}${FCH.effect.reset}`;
			case "xml":
				return `${FCH.effect.bold}{${FCH.effect.reset}${data}${FCH.effect.bold}}${FCH.effect.reset}`;
			default:
				return `${FCH.effect.bold}${FCH.bg.magenta}${data}${FCH.effect.reset}`;
		}
	}

	wrapError(type, data) {
		let result = "";
		switch (type) {
			case "name":
				result = `${FCH.bg.red} ${data}: ${FCH.effect.reset}`;
				break;
			case "message":
				result = `${FCH.bg.red}${data} ${FCH.effect.reset}`;
				break;
			case "method":
				result = `${FCH.color.white}${data}${FCH.effect.reset}`;
				break;
			case "path":
				result = `${FCH.effect.dim}${data}${FCH.effect.reset}`;
				break;
			case "line":
				result = `${FCH.color.cyan}${data}${FCH.effect.reset}`;
				break;
			case "column":
				result = `${FCH.color.white}${data}${FCH.effect.reset}`;
				break;
			default:
				result = `${FCH.bg.magenta} ${data} ${FCH.effect.reset}`;
				break;
		}
		return result;
	}
}

/**
 *
 * @type {FaBeautifyConsole}
 */
module.exports = FaBeautifyConsole;
