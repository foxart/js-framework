'use strict';
const
	Hue = require('../console');

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
				result = `${Hue.effect.bold}${Hue.color.magenta}<${type}${length}>${Hue.effect.reset} `;
				break;
			case 'Date':
				result = `${Hue.effect.underscore}${Hue.color.yellow}${type}${length}${Hue.effect.reset} `;
				break;
			case 'Error':
				result = `${Hue.effect.underscore}${Hue.color.red}${type}${Hue.effect.reset} `;
				break;
			case 'Json':
				result = `${Hue.effect.bold}${Hue.color.green}<${type}${length}>${Hue.effect.reset} `;
				break;
			case 'Image':
				result = `${Hue.effect.bold}${Hue.color.blue}<${type}${length}>${Hue.effect.reset} `;
				break;
			case 'MongoId':
				result = `${Hue.effect.bold}${Hue.color.cyan}<${type}${length}>${Hue.effect.reset} `;
				break;
			case 'RegExp':
				result = `${Hue.effect.bold}${Hue.color.yellow}<${type}${length}>${Hue.effect.reset} `;
				break;
			case 'Undefined':
				result = `${Hue.effect.underscore}${Hue.color.magenta}${type}${length}${Hue.effect.reset} `;
				break;
			case 'Xml':
				result = `${Hue.effect.bold}${Hue.color.red}<${type}${length}>${Hue.effect.reset} `;
				break;
			default:
				result = `${Hue.effect.dim}${Hue.color.white}${type}${length}${Hue.effect.reset} `;
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
	let color = data === true ? `${Hue.color.green}` : `${Hue.color.red}`;
	if (show_color) {
		return `${type}${color}${Hue.effect.bold}${data}${Hue.effect.reset}`;
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
		return `${type}${Hue.color.white}${data}${Hue.effect.reset}`;
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
		return `${type}${Hue.color.white}${new Date(data.toISOString())}${Hue.effect.reset}`;
	} else {
		return `${type}${data}`;
	}
};
/**
 *
 * @param name
 * @param message
 * @param trace
 * @param stack
 * @param tab
 * @param show_color
 * @param show_type
 * @returns {string}
 */
exports.wrapError = function (name, message, trace, stack, tab, show_color, show_type) {
	// consoleError(message)
	let type = show_type ? getType('Error', null, show_color) : '';
	let backtrace;
	let backtrace_list;
	let backtrace_message_list = [];
	if (trace) {
		backtrace_list = trace;
	} else {
		backtrace_list = stack.split('\n');
	}
	backtrace_list.forEach(function (item) {
		let string = item.trim();
		if (show_color) {
			backtrace_message_list.push(`\n${tab}${Hue.effect.dim}${string}${Hue.effect.reset}`);
		} else {
			backtrace_message_list.push(`\n${tab}${string}`);
		}
	});
	backtrace = backtrace_message_list.join('');
	if (show_color) {
		return `${type}${name} ${message} ${Hue.effect.dim}${backtrace}${Hue.effect.reset}`;
	} else {
		return `${type}${name} ${message} ${backtrace}`;
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
		return `${type}${Hue.color.red}${data}${Hue.effect.reset}`;
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
		content = data.toString().replace(/\n/g, `\n${Hue.color.cyan}${tab}`);
		return `${type}${Hue.color.cyan}${content}${Hue.effect.reset}`;
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
		return `${type}${Hue.color.green}${data}${Hue.effect.reset}`;
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
		return `${type}${Hue.color.white}${data}${Hue.effect.reset}`;
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
		return `${type}${Hue.effect.bold}${Hue.color.cyan}${data}${Hue.effect.reset}`;
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
	content = content.replace(/"/g, "\\\"");
	if (show_color) {
		return `${type}${Hue.effect.reset}"${content}"${Hue.effect.reset}`;
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
		return `${type}${Hue.color.white}${data}${Hue.effect.reset}`;
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
	// 	return `${type}${Hue.background.red}${Hue.color.white}${type}${Hue.effect.reset} ${data}`;
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
