'use strict';
/**
 *
 * @type {{}}
 */
let handler_list = {};

/**
 *
 * @param callback
 * @constructor
 */
function Handler(callback) {
	this.process = function (data) {
		return callback.call(this, data);
	}
}

/**
 *
 * @param token
 * @param callback
 */
exports.attachHandler = function (token, callback) {
	handler_list[token] = new Handler(callback);
};
/**
 *
 * @param token
 */
exports.detachHandler = function (token) {
	delete handler_list[token];
};
/**
 *
 * @param token
 */
exports.getHandler = function (token) {
	if (token !== undefined) {
		return handler_list[token];
	} else {
		return handler_list;
	}
};
/**
 *
 * @param context
 * @param token
 * @param data
 */
exports.serve = function (context, token, data) {
	// console.warn(token);
	if (handler_list[token] !== undefined) {
		handler_list[token].process.call(context, data);
	} else {
		console.log('unregistered idol handler: ' + token);
	}
};
// function messageBody(element, align) {
// 	if (element === undefined) {
// 		element = 'undefined';
// 	}
// 	let length = align - element.toString().length + 1;
// 	// server1.console.log(length);
// 	if (length < 0) {
// 		return element.toString().substring(0, align);
// 	} else {
// 		return element.toString() + Array(length).join(' ');
// 	}
// }
// const LogHue = require('./log-hue');
// consoleLog(!message ? '' : messageBody(message, alignCommon), {
// 		server1.beautify: 'plain',
// 		template: `${LogHue.background.black}${LogHue.server1.color.white} {timestamp} ${LogHue.effect.reset} {data} ${LogHue.effect.bold}${LogHue.server1.color.green}${sign.exist} ${LogHue.effect.reset} ${LogHue.server1.color.cyan}{filePath}${LogHue.server1.color.white}:${LogHue.server1.color.red}{lineNumber}${LogHue.effect.reset}`,
// 	}
// );
/**
 *
 * @param callback
 * @returns {*}
 */
function getCallback(callback) {
	return Object.assign({}, {
		onStart: function (request) {
			console.info(`onStart | ${request['token']}`);
			console.info(request);
		},
		onFinish: function (request) {
			console.info(`onFinish | ${request['token']}`);
			console.info(request);
		},
		onError: function (request) {
			console.error(`onError | ${request['token']}`);
			console.error(request);
		},
		onUndefined: function (request) {
			console.warn(`onUndefined | ${request['token']}`);
			console.warn(request);
		}
	}, callback);
}

/**
 *
 * @param request
 * @param options
 */
exports.callback = function (request, options) {
	let callback = getCallback(options);
	switch (request['status']) {
		case 'Processing':
			callback.onStart.call(this, request);
			break;
		case 'Error':
			callback.onError.call(this, request);
			break;
		case 'Finished':
			callback.onFinish.call(this, request);
			break;
		default:
			callback.onUndefined.call(this, request);
	}
};
