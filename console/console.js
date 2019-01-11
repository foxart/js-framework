'use strict';
/*modules*/
const FaBeautify = require('../beautify');
const FCH = require('./console-helper');
const FaTrace = require('../base/trace');
/*variables*/
let clear = console.clear;
let log = console.log;
let info = console.info;
let error = console.error;
let warn = console.warn;
/**
 *
 * @type {{warn: string, log: string, error: string, info: string}}
 */
let templateTime = {
	log: `[${FCH.effect.dim}{time}${FCH.effect.reset}]`,
	info: `[${FCH.effect.dim}{time}${FCH.effect.reset}]`,
	warn: `[${FCH.effect.dim}{time}${FCH.effect.reset}]`,
	error: `[${FCH.effect.dim}{time}${FCH.effect.reset}]`,
};
/**
 *
 * @type {{warn: string, log: string, error: string, info: string}}
 */
// let templateSign = {
// 	log: `${FCH.bg.green}${FCH.color.white} ${FCH.sign.check} ${FCH.effect.reset}`,
// 	info: `${FCH.bg.cyan}${FCH.color.white} ${FCH.sign.excl} ${FCH.effect.reset}`,
// 	warn: `${FCH.bg.yellow}${FCH.color.white} ${FCH.sign.quest} ${FCH.effect.reset}`,
// 	error: `${FCH.bg.red}${FCH.color.white} ${FCH.sign.cross} ${FCH.effect.reset}`,
// };
let templateSign = {
	log: `[${FCH.effect.bold}${FCH.color.black}LOG${FCH.effect.reset}]`,
	info: `[${FCH.effect.bold}${FCH.color.cyan}INF${FCH.effect.reset}]`,
	warn: `[${FCH.effect.bold}${FCH.color.yellow}WRN${FCH.effect.reset}]`,
	error: `[${FCH.effect.bold}${FCH.color.red}ERR${FCH.effect.reset}]`,
};
/**
 *
 * @type {{warn: string, log: string, error: string, info: string}}
 */
let templatePath = {
	// log: `${FCH.color.white}{path}${FCH.effect.reset}`,
	log: `${FCH.effect.dim}{path}${FCH.effect.reset}`,
	info: `${FCH.effect.dim}{path}${FCH.effect.reset}`,
	warn: `${FCH.effect.dim}{path}${FCH.effect.reset}`,
	error: `${FCH.effect.dim}{path}${FCH.effect.reset}`,
};
/**
 *
 * @type {{warn: string, log: string, error: string, info: string}}
 */
let templateLine = {
	log: `${FCH.effect.reset}:${FCH.color.cyan}{line}${FCH.effect.reset}:${FCH.color.white}{column}${FCH.effect.reset}`,
	info: `${FCH.effect.reset}:${FCH.color.cyan}{line}${FCH.effect.reset}:${FCH.color.white}{column}${FCH.effect.reset}`,
	warn: `${FCH.effect.reset}:${FCH.color.cyan}{line}${FCH.effect.reset}:${FCH.color.white}{column}${FCH.effect.reset}`,
	error: `${FCH.effect.reset}:${FCH.color.cyan}{line}${FCH.effect.reset}:${FCH.color.white}{column}${FCH.effect.reset}`,
};
/**
 *
 * @type {{warn: string, log: string, error: string, info: string}}
 */
let template = {
	log: `${templateTime.log} ${templateSign.log} ${templatePath.log}${templateLine.log} {data}`,
	info: `${templateTime.info} ${templateSign.info} ${templatePath.info}${templateLine.info} {data}`,
	warn: `${templateTime.warn} ${templateSign.warn} ${templatePath.warn}${templateLine.warn} {data}`,
	error: `${templateTime.error} ${templateSign.error} ${templatePath.error}${templateLine.error} {data}`,
};

/**
 *
 * @param data
 * @return {*}
 * @private
 */
function _arguments(data) {
	return data.length === 1 ? data[0] : data
}

/**
 *
 * @param data {*}
 * @param template {string}
 * @private
 */
function _console(data, template) {
	let trace = FaTrace.get(new Error().stack, 2);
	let time = new Date().toLocaleTimeString();
	let path = trace['path'] ? trace['path'].replace(process.cwd(), '') : trace['path'];
	let line = trace["line"];
	let column = trace["column"];
	let string = template.replaceAll([
			'{time}', '{path}', '{line}', '{column}', '{data}',
		], [
			time, path, line, column, data,
		]
	);
	log(string);
}

console.clear = function () {
	process.stdout.write('\x1Bc');
};
console.log = function () {
	_console(FaBeautify.extendedColor(_arguments(arguments)), template.log);
};
console.info = function () {
	_console(FaBeautify.extendedColor(_arguments(arguments)), template.info);
};
console.warn = function () {
	_console(FaBeautify.extendedColor(_arguments(arguments)), template.warn);
};
console.error = function () {
	_console(FaBeautify.extendedColor(_arguments(arguments)), template.error);
};
console.write = function () {
	log(FaBeautify.plainColor(_arguments(arguments)));
};
