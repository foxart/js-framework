"use strict";
const FaBeautifyConsole = require("./console");
const FCH = require("../console/console-helper");

class FaBeautifyConsoleType extends FaBeautifyConsole {
	wrapData1(type, data) {
		let result = "";
		switch (type) {
			case "array":
				result = `${FCH.effect.bold}[${FCH.effect.reset}${data}${FCH.effect.reset}${FCH.effect.bold}]${FCH.effect.reset}`;
				break;
			case "buffer":
				result = `${FCH.effect.bold}${FCH.bg.cyan}(circular)${FCH.effect.reset}`;
				break;
			case "json":
				result = `${FCH.effect.bold}{${FCH.effect.reset}${data}${FCH.effect.reset}${FCH.effect.bold}}${FCH.effect.reset}`;
				break;
			case "object":
				result = `${FCH.effect.bold}{${FCH.effect.reset}${data}${FCH.effect.reset}${FCH.effect.bold}}${FCH.effect.reset}`;
				break;
			case "xml":
				result = `${FCH.effect.bold}{${FCH.effect.reset}${data}${FCH.effect.reset}${FCH.effect.bold}}${FCH.effect.reset}`;
				break;
			default:
				// result = `${FCH.effect.dim}${data}${FCH.effect.reset}${FCH.color.white}`;
				result = `${FCH.color.white}${data}${FCH.effect.reset}`;
		}
		return `${result}`;
	}

	wrapDataKey(key, type, length) {
		// return `${FCH.effect.bold}${FCH.color.white}${key}${FCH.effect.reset} ${FCH.effect.dim}${type}${FCH.effect.reset}: `;
		let result = "";
		// length = !length ? "" : `(${length})`;
		let dimension = "";
		if (length) {
			dimension = `${type.capitalize()}(${length})`
		} else {
			dimension = type.capitalize();
		}
		switch (type) {
			// case "circular":
			// 	result = `${FCH.effect.bold}${FCH.color.cyan}${data}${FCH.effect.reset}`;
			// 	break;
			// case "date":
			// 	result = `${FCH.color.yellow}${data}${FCH.effect.reset}`;
			// 	break;
			// case "bool":
			// 	result = `${FCH.effect.bold}${data === true ? FCH.color.green : FCH.color.red}${data}${FCH.effect.reset}`;
			// 	break;
			// case "string":
			// 	result = `${FCH.bg.white}${FCH.color.black}${data}${FCH.effect.reset}`;
			// 	break;
			default:
				return `${FCH.effect.bold}${FCH.color.white}${key}${FCH.effect.reset} ${FCH.effect.dim}${dimension}${FCH.effect.reset}: `;
			// result = `${Type}`;
		}
	}

	wrapDataType(type, length) {
		let result = "";
		// length = !length ? "" : `(${length})`;
		let data = "";
		if (length) {
			data = `${type.capitalize()}(${length})`
		} else {
			data = type.capitalize();
		}
		switch (type) {
			// case "circular":
			// 	result = `${FCH.effect.bold}${FCH.color.cyan}${data}${FCH.effect.reset}`;
			// 	break;
			// case "date":
			// 	result = `${FCH.color.yellow}${data}${FCH.effect.reset}`;
			// 	break;
			// case "bool":
			// 	result = `${FCH.effect.bold}${data === true ? FCH.color.green : FCH.color.red}${data}${FCH.effect.reset}`;
			// 	break;
			// case "string":
			// 	result = `${FCH.bg.white}${FCH.color.black}${data}${FCH.effect.reset}`;
			// 	break;
			default:
				result = `${FCH.effect.dim}${data}${FCH.effect.reset}`;
			// result = `${Type}`;
		}
		return `${result} `;
	}

	wrapDataValue1(type, data) {
		switch (type) {
			case "array":
				return `${FCH.effect.bold}[${FCH.effect.reset}${data}${FCH.effect.reset}${FCH.effect.bold}]${FCH.effect.reset}`;
			case "json":
				return `${FCH.effect.bold}{${FCH.effect.reset}${data}${FCH.effect.reset}${FCH.effect.bold}}${FCH.effect.reset}`;
			case "object":
				return `${FCH.effect.bold}{${FCH.effect.reset}${data}${FCH.effect.reset}${FCH.effect.bold}}${FCH.effect.reset}`;
			case "xml":
				return `${FCH.effect.bold}XML {${FCH.effect.reset}${data}${FCH.effect.reset}${FCH.effect.bold}}${FCH.effect.reset}`;
			default:
				return super.wrapDataValue(type, data);
		}
	}
}

/**
 *
 * @type {FaBeautifyConsoleType}
 */
module.exports = FaBeautifyConsoleType;
