"use strict";
const FCH = require('../console/console-helper');
const FaError = require("../base/error");

function getTab(level) {
	return Array(level + 1).join("    ");
	// return Array(level + 1).join("****");
}

/**
 *
 * @param type
 * @param length
 * @param show_color
 * @returns {string}
 */
function getType(type, length, show_color) {
	length = length === null ? '' : `(${length})`;
	if (show_color === true) {
		let result;
		switch (type) {
			case 'Circular':
				result = `${FCH.effect.bold}${FCH.color.magenta}<${length}>${FCH.effect.reset} `;
				break;
			case 'Date':
				result = `${FCH.effect.underscore}${FCH.color.yellow}${length}${FCH.effect.reset} `;
				break;
			// case 'Error':
			// 	result = `${Hue.effect.underscore}${Hue.server1.color.red}${Hue.effect.reset} `;
			// 	break;
			// case 'FaError':
			// 	result = `${Hue.effect.underscore}${Hue.server1.color.red}${Hue.effect.reset} `;
			// 	break;
			case 'Json':
				result = `${FCH.effect.bold}${FCH.color.green}<${length}>${FCH.effect.reset} `;
				break;
			case 'Image':
				result = `${FCH.effect.bold}${FCH.color.blue}<${length}>${FCH.effect.reset} `;
				break;
			case 'MongoId':
				result = `${FCH.effect.bold}${FCH.color.cyan}<${length}>${FCH.effect.reset} `;
				break;
			case 'RegExp':
				result = `${FCH.effect.bold}${FCH.color.yellow}<${length}>${FCH.effect.reset} `;
				break;
			case 'Undefined':
				result = `${FCH.effect.underscore}${FCH.color.magenta}${length}${FCH.effect.reset} `;
				break;
			case 'Xml':
				result = `${FCH.effect.bold}${FCH.color.red}<${length}>${FCH.effect.reset} `;
				break;
			default:
				result = `${FCH.effect.dim}${FCH.color.white}${length}${FCH.effect.reset} `;
		}
		return result;
	} else {
		return `${length} `;
	}
}

exports.wrapArray = function (data, length) {
	return `${data}`;
};

exports.wrapBool = function (data) {
	let color = data === true ? `${FCH.color.green}` : `${FCH.color.red}`;
	return `${FCH.effect.bold}${color}${data}${FCH.effect.reset}`;
};
exports.wrapCircular = function (data, length) {
	return `${FCH.effect.bold}${FCH.color.cyan}${data}${FCH.effect.reset}`;
};
exports.wrapDate = function (data) {
	return `${FCH.color.yellow}${new Date(data.toISOString())}${FCH.effect.reset}`;
};
exports.wrapError = function (data, level) {
	let trace_list = [];
	let trace = data["trace"] ? data["trace"] : FaError.traceStack(data["stack"]);
	trace.forEach(function (item) {
		trace_list.push(`\n${getTab(level)}| ${FCH.color.white}${item['method']} ${FCH.effect.reset}${FCH.effect.dim}${item['path']}${FCH.effect.reset}:${FCH.color.cyan}${item['line']}${FCH.effect.reset}:${FCH.color.white}${item['column']}${FCH.effect.reset}`);
	});
	trace = trace_list.join('');
	return `${FCH.effect.bold}${FCH.bg.red}<${data["message"]}>${FCH.effect.reset}${trace}`;
};
exports.wrapFloat = function (data) {
	return `${FCH.color.red}${data}${FCH.effect.reset}`;
};

exports.wrapFunction = function (data, level) {
	let content = data.toString().replaceAll(["\t", "\n"], [getTab(1), `\n${getTab(level)}`]);
	return `${FCH.color.cyan}${content}${FCH.effect.reset}`;
};
exports.wrapInt = function (data) {
	return `${FCH.color.green}${data}${FCH.effect.reset}`;
};

exports.wrapJson = function (data, length) {
	// let type = show_type ? getType('Json', length, show_color) : '';
	return `${data}`;
};
exports.wrapMongoId = function (data) {
	return `${FCH.effect.bold}${FCH.bg.blue}<${data}>${FCH.effect.reset}`;
};
exports.wrapNull = function (data) {
	return `${FCH.effect.bold}${FCH.color.white}${data}${FCH.effect.reset}`;
};

exports.wrapObject = function (data, length) {
	// let type = show_type ? getType('Object', length, show_color) : '';
	return `${data}`;
};
exports.wrapRegExp = function (data) {
	return `${FCH.effect.bold}${FCH.color.yellow}${data}${FCH.effect.reset}`;
};
exports.wrapString = function (data, level) {
	let content = data.toString().replaceAll(["\t", "\n"], [getTab(1), `\n${getTab(level)}`]);
	return `${FCH.effect.reset}${FCH.color.white}${content}${FCH.effect.reset}`;
};
exports.wrapUndefined = function (data) {
	return `${FCH.effect.bold}${FCH.color.magenta}${data}${FCH.effect.reset}`;
};

exports.wrapXml = function (data, length, show_color, show_type) {
	// let type = show_type ? getType('Xml', null, show_color) : '';
	// return `${data}`;
	// let type = show_type ? getType('Xml', length, show_color) : '';
	// if (show_color) {
	// 	return `${Hue.background.red}${Hue.server1.color.white}${Hue.effect.reset} ${data}`;
	// } else {
	// }
	return `${data}`;
};
exports.wrapFile = function (data, length) {
	return `${FCH.effect.bold}${FCH.bg.magenta}${data}${FCH.effect.reset}`;
};

