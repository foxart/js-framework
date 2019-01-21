"use strict";
const FaBeautifyConsole = require("./console");
const FCH = require("../console/console-helper");

class FaBeautifyConsoleType extends FaBeautifyConsole {
	wrapData(type, data) {
		let result = "";
		switch (type) {
			case "array1":
				result = `<[ ${data} ]>`;
				break;
			case "object1":
				result = `<{ ${data} }>`;
				break;
			default:
				result = `${FCH.effect.dim}${data}${FCH.effect.reset}`;
		}
		return ` ${result}`;
	}

	wrapType(type, length) {
		let result = "";
		length = !length ? "" : `(${length})`;
		let data = type.capitalize();
		switch (type) {
			case "array":
				result = `${data}`;
				break;
			case "bool":
				// result = `${FCH.effect.bold}${data === true ? FCH.color.green : FCH.color.red}${data}${FCH.effect.reset}`;
				break;
			case "circular":
				result = `${FCH.effect.bold}${FCH.color.cyan}${data}${length}${FCH.effect.reset}`;
				break;
			case "date":
				result = `${FCH.color.yellow}${data}${FCH.effect.reset}`;
				break;
			case "error":
				result = `${FCH.bg.red}<${data}>${FCH.effect.reset}`;
				break;
			case "file":
				result = `${FCH.effect.bold}${FCH.color.cyan}${data}${FCH.effect.reset}`;
				break;
			case "float":
				result = `${FCH.color.red}${data}${FCH.effect.reset}`;
				break;
			case "function":
				result = `${FCH.color.cyan}${data}${FCH.effect.reset}`;
				break;
			case "json":
				result = `${FCH.bg.green}${FCH.color.black}<${type.capitalize()}${length}>${FCH.effect.reset}`;
				break;
			case "int":
				result = `${FCH.color.green}${data}${FCH.effect.reset}`;
				break;
			case "mongoId":
				result = `${FCH.effect.bold}${FCH.color.blue}${data}${FCH.effect.reset}`;
				break;
			case "null":
				result = `${FCH.effect.bold}${FCH.color.white}${data}${FCH.effect.reset}`;
				break;
			case "object":
				result = `${data}`;
				break;
			case "regular":
				result = `${FCH.effect.bold}${FCH.color.yellow}${data}${FCH.effect.reset}`;
				break;
			case "string":
				result = `${FCH.color.white}${data}${FCH.effect.reset}`;
				break;
			case "undefined":
				result = `${FCH.effect.bold}${FCH.color.magenta}${data}${FCH.effect.reset}`;
				break;
			case "xml":
				result = `${FCH.bg.yellow}${FCH.color.black}<${type.capitalize()}${length}>${FCH.effect.reset}`;
				break;
			default:
				result = `${FCH.bg.magenta} ${data} ${FCH.effect.reset}`;
		}
		return `${result}`;
	}
}

/**
 *
 * @type {FaBeautifyConsoleType}
 */
module.exports = FaBeautifyConsoleType;
