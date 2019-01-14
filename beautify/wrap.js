"use strict";
const FCH = require('../console/console-helper');
const FaError = require("../base/error");

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
				result = `${FCH.effect.bold}${FCH.color.magenta}<${type}${length}>${FCH.effect.reset} `;
				break;
			case 'Date':
				result = `${FCH.effect.underscore}${FCH.color.yellow}${type}${length}${FCH.effect.reset} `;
				break;
			// case 'Error':
			// 	result = `${Hue.effect.underscore}${Hue.server1.color.red}${type}${Hue.effect.reset} `;
			// 	break;
			// case 'FaError':
			// 	result = `${Hue.effect.underscore}${Hue.server1.color.red}${type}${Hue.effect.reset} `;
			// 	break;
			case 'Json':
				result = `${FCH.effect.bold}${FCH.color.green}<${type}${length}>${FCH.effect.reset} `;
				break;
			case 'Image':
				result = `${FCH.effect.bold}${FCH.color.blue}<${type}${length}>${FCH.effect.reset} `;
				break;
			case 'MongoId':
				result = `${FCH.effect.bold}${FCH.color.cyan}<${type}${length}>${FCH.effect.reset} `;
				break;
			case 'RegExp':
				result = `${FCH.effect.bold}${FCH.color.yellow}<${type}${length}>${FCH.effect.reset} `;
				break;
			case 'Undefined':
				result = `${FCH.effect.underscore}${FCH.color.magenta}${type}${length}${FCH.effect.reset} `;
				break;
			case 'Xml':
				result = `${FCH.effect.bold}${FCH.color.red}<${type}${length}>${FCH.effect.reset} `;
				break;
			default:
				result = `${FCH.effect.dim}${FCH.color.white}${type}${length}${FCH.effect.reset} `;
		}
		return result;
	} else {
		return `${type}${length} `;
	}
}

/**
 *
 * @param data
 * @param length
 * @param show_color
 * @param show_type
 * @returns {string}
 */
exports.wrapArray = function (data, length, show_color, show_type) {
	let type = show_type ? getType('Array', length, show_color) : '';
	return `${type}${data}`;
};
/**
 *
 * @param data
 * @param show_color
 * @param show_type
 * @returns {string}
 */
exports.wrapBool = function (data, show_color, show_type) {
	let type = show_type ? getType('Bool', null, show_color) : '';
	let color = data === true ? `${FCH.color.green}` : `${FCH.color.red}`;
	if (show_color) {
		return `${type}${color}${FCH.effect.bold}${data}${FCH.effect.reset}`;
	} else {
		return `${type}${data}`;
	}
};
/**
 *
 * @param data
 * @param length
 * @param show_color
 * @param show_type
 * @returns {string}
 */
exports.wrapCircular = function (data, length, show_color, show_type) {
	let type = show_type ? getType('Circular', length, show_color) : '';
	if (show_color) {
		return `${type}${FCH.color.white}${data}${FCH.effect.reset}`;
	} else {
		return `${type}${data}`;
	}
};
/**
 *
 * @param data
 * @param show_color
 * @param show_type
 * @returns {string}
 */
exports.wrapDate = function (data, show_color, show_type) {
	let type = show_type ? getType('Date', null, show_color) : '';
	if (show_color) {
		return `${type}${FCH.color.white}${new Date(data.toISOString())}${FCH.effect.reset}`;
	} else {
		return `${type}${data}`;
	}
};
/**
 *
 * @param name
 * @param message
 * @param stack
 * @param trace
 * @param tab
 * @param show_color
 * @return {string}
 */
exports.wrapError = function (name, message, stack, trace, tab, show_color) {
	let type;
	let trace_list = [];
	let stack_list = [];
	if (trace) {
		type = `${FCH.effect.underscore}${FCH.color.red}${name}${FCH.effect.reset}`;
	} else {
		trace = FaError.traceStack(stack);
		type = `${FCH.effect.underscore}${FCH.color.red}${name}${FCH.effect.reset}`;
	}
	trace.forEach(function (item) {
		if (show_color) {
			trace_list.push(`\n${tab}| ${FCH.color.magenta}${item['method']} ${FCH.effect.reset}${FCH.effect.dim}${item['path']}${FCH.effect.reset}:${FCH.color.cyan}${item['line']}${FCH.effect.reset}:${FCH.color.white}${item['column']}${FCH.effect.reset}`);
		} else {
			trace_list.push(`\n| ${tab}${item['method']} ${item['path']}:${item['line']}:${item['column']}`);
		}
	});
	trace = trace_list.join('');
	// stack.split('\n').forEach(function (item) {
	// 	if (show_color) {
	// 		stack_list.push(`\n${tab}| ${FCH.effect.dim}${item.trim()}${FCH.effect.reset}`);
	// 	} else {
	// 		stack_list.push(`\n${tab}| ${item.trim()}`);
	// 	}
	// });
	// stack = stack_list.join('');
	stack = "";
	if (show_color) {
		return `${type} ${message}${trace}${stack}`;
	} else {
		return `${name} ${message}${trace}${stack}`;
	}
};
/**
 *
 * @param data
 * @param show_color
 * @param show_type
 * @returns {string}
 */
exports.wrapFloat = function (data, show_color, show_type) {
	let type = show_type ? getType('Float', null, show_color) : '';
	if (show_color) {
		return `${type}${FCH.color.red}${data}${FCH.effect.reset}`;
	} else {
		return `${type}${data}`;
	}
};
/**
 *
 * @param data
 * @param tab
 * @param show_color
 * @param show_type
 * @returns {string}
 */
exports.wrapFunction = function (data, tab, show_color, show_type) {
	let type = show_type ? getType('Function', null, show_color) : '';
	let content;
	if (show_color) {
		// data = data.toString().replace(/\t/g, `${tab}`);
		content = data.toString().replace(/\n/g, `\n${FCH.color.cyan}${tab}`);
		return `${type}${FCH.color.cyan}${content}${FCH.effect.reset}`;
	} else {
		content = data.toString().replace(/\n/g, `\n${tab}`);
		return `${type}${content}`;
	}
};
/**
 *
 * @param data
 * @param show_color
 * @param show_type
 * @returns {string}
 */
exports.wrapInt = function (data, show_color, show_type) {
	let type = show_type ? getType('Int', null, show_color) : '';
	if (show_color) {
		return `${type}${FCH.color.green}${data}${FCH.effect.reset}`;
	} else {
		return `${type}${data}`;
	}
};
/**
 *
 * @param data
 * @param length
 * @param show_color
 * @param show_type
 * @returns {string}
 */
exports.wrapJson = function (data, length, show_color, show_type) {
	let type = show_type ? getType('Json', length, show_color) : '';
	return `${type}${data}`;
};
/**
 *
 * @param data
 * @param show_color
 * @param show_type
 * @returns {string}
 */
exports.wrapMongoId = function (data, show_color, show_type) {
	let type = show_type ? getType('MongoId', null, show_color) : '';
	if (show_color) {
		return `${type}${FCH.color.white}${data}${FCH.effect.reset}`;
	} else {
		return `${type}${data}`;
	}
};
/**
 *
 * @param data
 * @param show_color
 * @param show_type
 * @returns {string}
 */
exports.wrapNull = function (data, show_color, show_type) {
	let type = show_type ? getType('Null', null, show_color) : '';
	if (show_color) {
		return `${type}${FCH.effect.bold}${FCH.color.cyan}${data}${FCH.effect.reset}`;
	} else {
		return `${type}${data}`;
	}
};
/**
 *
 * @param data
 * @param length
 * @param show_color
 * @param show_type
 * @returns {string}
 */
exports.wrapObject = function (data, length, show_color, show_type) {
	let type = show_type ? getType('Object', length, show_color) : '';
	return `${type}${data}`;
};
/**
 *
 * @param data
 * @param show_color
 * @param show_type
 * @return {string}
 */
exports.wrapRegExp = function (data, show_color, show_type) {
	let type = show_type ? getType('RegExp', null, show_color) : '';
	return `${type}${data}`;
};
/**
 *
 * @param data
 * @param length
 * @param tab
 * @param show_color
 * @param show_type
 * @returns {string}
 */
exports.wrapString = function (data, length, tab, show_color, show_type) {
	// let type;
	// if (length > limit) {
	// 	type = show_type ? getType('String', `${limit}/${length}`, show_color) : '';
	// } else {
	// 	type = show_type ? getType('String', length, show_color) : '';
	// }
	let type = show_type ? getType('String', length, show_color) : '';
	// let content = length > limit ? data.slice(0, limit + 1) : data;
	let content = data;
	content = content.replace(/\n/g, `\n${tab}`);
	// content = content.replace(/"/g, "\\\"");
	if (show_color) {
		return `${type}${FCH.effect.reset}${content}${FCH.effect.reset}`;
	} else {
		return `${type}${content}`;
	}
};
/**
 *
 * @param data
 * @param show_color
 * @param show_type
 * @returns {string}
 */
exports.wrapUndefined = function (data, show_color, show_type) {
	let type = show_type ? getType('Undefined', null, show_color) : '';
	if (show_color) {
		return `${type}${FCH.color.white}${data}${FCH.effect.reset}`;
	} else {
		return `${type}${data}`;
	}
};
/**
 *
 * @param data
 * @param length
 * @param show_color
 * @param show_type
 * @returns {string}
 */
exports.wrapXml = function (data, length, show_color, show_type) {
	// let type = show_type ? getType('Xml', null, show_color) : '';
	// return `${type}${data}`;
	let type = show_type ? getType('Xml', length, show_color) : '';
	// if (show_color) {
	// 	return `${type}${Hue.background.red}${Hue.server1.color.white}${type}${Hue.effect.reset} ${data}`;
	// } else {
	// }
	return `${type}${data}`;
};
/**
 *
 * @param data
 * @param length
 * @param show_color
 * @param show_type
 * @return {string}
 */
exports.wrapImage = function (data, length, show_color, show_type) {
	let type = show_type ? getType('Image', length, show_color) : '';
	return `${type}${data}`;
};
