"use strict";
const FaBeautifyConsole = require("./console");
const FCH = require("../console/console-helper");

class FaBeautifyConsoleType extends FaBeautifyConsole {
	wrapDataKey(key, type, length, level) {
		let tab = this.getTab(level);
		let dimension = "";
		if (length) {
			dimension = `${type.capitalize()}(${length})`
		} else {
			dimension = type.capitalize();
		}
		switch (type) {
			// case "array":
			// 	return `${tab}${FCH.effect.bold}${key}${FCH.effect.reset} ${FCH.effect.dim}${FCH.color.green}${dimension}${FCH.effect.reset}: `;
			// case "object":
			// 	return `${tab}${FCH.effect.bold}${key}${FCH.effect.reset} ${FCH.effect.dim}${FCH.color.cyan}${dimension}${FCH.effect.reset}: `;
			case "json":
				return `${tab}${FCH.effect.bold}${key}${FCH.effect.reset} ${FCH.bg.green}${FCH.color.white}${dimension}${FCH.effect.reset}: `;
			case "xml":
				return `${tab}${FCH.effect.bold}${key}${FCH.effect.reset} ${FCH.bg.yellow}${FCH.color.black}${dimension}${FCH.effect.reset}: `;
			default:
				return `${tab}${FCH.effect.bold}${key}${FCH.effect.reset} ${FCH.effect.dim}${dimension}${FCH.effect.reset}: `;
		}
	}

	wrapDataValue(data, type, length, level) {
		let tab = this.getTab(level);
		let nl = "\n";
		switch (type) {
			// case "array":
			// 	return `${FCH.effect.dim}${FCH.color.green}[${FCH.effect.reset}${nl}${data}${tab}${FCH.effect.reset}${FCH.effect.dim}${FCH.color.green}]${FCH.effect.reset}`;
			// case "object":
			// 	return `${FCH.effect.dim}${FCH.color.cyan}{${FCH.effect.reset}${nl}${data}${tab}${FCH.effect.reset}${FCH.effect.dim}${FCH.color.cyan}}${FCH.effect.reset}`;
			case "json":
				return `${FCH.effect.dim}{${FCH.effect.reset}${nl}${data}${tab}${FCH.effect.reset}${FCH.effect.dim}}${FCH.effect.reset}`;
			case "xml":
				return `${FCH.effect.dim}{${FCH.effect.reset}${nl}${data}${tab}${FCH.effect.reset}${FCH.effect.dim}}${FCH.effect.reset}`;
			default:
				return super.wrapDataValue(data, type, length, level);
		}
	}
}

/**
 *
 * @type {FaBeautifyConsoleType}
 */
module.exports = FaBeautifyConsoleType;
