"use strict";
const FaBeautifyWrap = require("./wrap");
const FCH = require("../console/console-helper");

class FaBeautifyConsole extends FaBeautifyWrap {
	wrapData(type, data) {
		let result = "";
		switch (type) {
			case "array":
				result= `<[ ${data} ]>`;
				break;
			case "bool":
				result=`${FCH.effect.bold}${data === true ? FCH.color.green : FCH.color.red}${data}${FCH.effect.reset}`;
				break;
			case "circular":
				result=`${FCH.effect.bold}${FCH.color.cyan}(circular)${FCH.effect.reset}`;
				break;
			case "date":
				result=`${FCH.color.yellow}${data}${FCH.effect.reset}`;
				break;
			case "error":
				result = `${FCH.bg.red}<${data}>${FCH.effect.reset}`;
				break;
			case "file":
				result=`${FCH.effect.bold}${FCH.color.cyan}(${data})${FCH.effect.reset}`;
				break;
			case "float":
				result=`${FCH.color.red}${data}${FCH.effect.reset}`;
				break;
			case "function":
				result=`${FCH.color.cyan}${data}${FCH.effect.reset}`;
				break;
			case "json":
				result=`${data}`;
				break;
			case "int":
				result=`${FCH.color.green}${data}${FCH.effect.reset}`;
				break;
			case "mongoId":
				result=`${FCH.effect.bold}${FCH.color.blue}${data}${FCH.effect.reset}`;
				break;
			case "null":
				result=`${FCH.effect.bold}${FCH.color.white}${data}${FCH.effect.reset}`;
				break;
			case "object":
				result=`<{ ${data} }>`;
				break;
			case "regular":
				result=`${FCH.effect.bold}${FCH.color.yellow}${data}${FCH.effect.reset}`;
				break;
			case "string":
				result=`${FCH.color.white}${data}${FCH.effect.reset}`;
				break;
			case "undefined":
				result=`${FCH.effect.bold}${FCH.color.magenta}${data}${FCH.effect.reset}`;
				break;
			case "xml":
				result=`${data}`;
				break;
			default:
				return `${FCH.bg.magenta} ${data} ${FCH.effect.reset}`;
		}
		return result;
	}

	wrapError(type, data) {
		let result = "";
		switch (type) {
			case "name":
				result = "";
				break;
			case "message":
				result = `${FCH.bg.red}<${data}>${FCH.effect.reset}`;
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
		}
		return result;
	}
}

/**
 *
 * @type {FaBeautifyConsole}
 */
module.exports = FaBeautifyConsole;
