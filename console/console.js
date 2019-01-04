'use strict';
/*modules*/
const FaBeautify = require('../beautify');
const FaConsoleColor = require('./console-color');
const FaTrace = require('../base/trace');
/*variables*/
let cc = FaConsoleColor;
let clear = console.clear;
let log = console.log;
let info = console.info;
let error = console.error;
let warn = console.warn;
/**
 *
 * @type {{warn: string, log: string, error: string, info: string}}
 */
let template = {
	plainColor: `${cc.bg.black}${cc.color.white} {time} ${cc.effect.reset}${cc.bg.white}${cc.color.black} {path} ${cc.effect.reset}${cc.bg.black} ${cc.color.red}{line}${cc.color.white}:${cc.effect.dim}{column} ${cc.effect.reset} {data}`,
	log: `${cc.bg.black}${cc.color.white} {time} ${cc.effect.reset}${cc.bg.white}${cc.color.black} {path} ${cc.effect.reset}${cc.bg.black} ${cc.color.red}{line}${cc.color.white}:${cc.effect.dim}{column} ${cc.effect.reset} {data}`,
	info: `${cc.bg.black}${cc.color.white} {time} ${cc.effect.reset}${cc.bg.blue}${cc.color.white} {path} ${cc.effect.reset}${cc.bg.black} ${cc.color.red}{line}${cc.color.white}:${cc.effect.dim}{column} ${cc.effect.reset} {data}`,
	warn: `${cc.bg.black}${cc.color.white} {time} ${cc.effect.reset}${cc.bg.yellow}${cc.color.black} {path} ${cc.effect.reset}${cc.bg.black} ${cc.color.red}{line}${cc.color.white}:${cc.effect.dim}{column} ${cc.effect.reset} {data}`,
	error: `${cc.bg.black}${cc.color.white} {time} ${cc.effect.reset}${cc.bg.red}${cc.color.white} {path} ${cc.effect.reset}${cc.bg.black} ${cc.color.red}{line}${cc.color.white}:${cc.effect.dim}{column} ${cc.effect.reset} {data}`,
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
console.clear();
