'use strict';
/*modules*/
const FaBeautify = require('../beautify/index');
const FaConsoleColor = require('./console-color');
const FaTrace = require('../base/~trace');
/**
 *
 * @type {module.FaLogClass}
 */
module.exports = class FaLogClass {
	/**
	 *
	 */
	constructor() {
		this.log = console.log;
		this.info = console.info;
		this.error = console.error;
		this.warn = console.warn;
	}

	/**
	 * @param data
	 * @param type {string}
	 * @return {string}
	 * @private
	 */
	_beautify(data, type) {
		switch (type) {
			case 'plain':
				return FaBeautify.plain(data);
			case 'plain-color':
				return FaBeautify.plainColor(data);
			case 'extended':
				return FaBeautify.extended(data);
			case 'extended-color':
				return FaBeautify.extendedColor(data);
			default:
				return FaBeautify.extendedColor(data);
		}
	}

	/**
	 * @param content
	 * @param template
	 * @param trace
	 * @private
	 */
	_consoleWrite(content, template, trace) {
		template = template ? template : `{time} | {path}:{line} | {data}`;
		let time = new Date().toLocaleTimeString();
		let path = trace['filePath'] ? trace['filePath'].replace(process.cwd(), '') : trace['filePath'];
		let line = trace['lineNumber'];
		let column = trace['columnNumber'];
		let string = template.replaceAll([
				'{time}', '{path}', '{line}', '{column}', '{data}',
			], [
				time, path, line, column, content,
			]
		);
		this.log(string);
	}

	/**
	 *
	 * @param data
	 */
	getArguments(data) {
		return data.length === 1 ? data[0] : data;
	}

	/**
	 *
	 * @param data
	 * @param template
	 * @param beautify
	 */
	consoleWrite(data, template, beautify) {
		let trace = FaTrace.getData(2);
		let content = this._beautify(data, beautify);
		this._consoleWrite(content, template, trace);
	}

	/**
	 *
	 */
	consoleLog() {
		let template = `${FaConsoleColor.bg.black}${FaConsoleColor.color.cyan} {time} ${FaConsoleColor.color.white}{path}:${FaConsoleColor.color.cyan}{line}${FaConsoleColor.color.white}:{column} ${FaConsoleColor.effect.reset} {data}`;
		let trace = FaTrace.getData(3);
		let content = this.getArguments(arguments);
		this._consoleWrite(this._beautify(content, 'extended-color'), template, trace);
	}

	consoleInfo() {
		let template = `${FaConsoleColor.bg.blue}${FaConsoleColor.color.black} {time} ${FaConsoleColor.color.white}{path}:${FaConsoleColor.color.black}{line}${FaConsoleColor.color.white}:{column} ${FaConsoleColor.effect.reset} {data}`;
		let trace = FaTrace.getData(2);
		let content = this.getArguments(arguments);
		this._consoleWrite(this._beautify(content, 'extended-color'), template, trace);
	}

	consoleWarn() {
		let template = `${FaConsoleColor.bg.yellow}${FaConsoleColor.color.red} {time} ${FaConsoleColor.color.black}{path}:${FaConsoleColor.color.red}{line}${FaConsoleColor.color.black}:{column} ${FaConsoleColor.effect.reset} {data}`;
		let trace = FaTrace.getData(2);
		let content = this.getArguments(arguments);
		this._consoleWrite(this._beautify(content, 'extended-color'), template, trace);
	}

	consoleError() {
		let template = `${FaConsoleColor.bg.red}${FaConsoleColor.color.yellow} {time} ${FaConsoleColor.color.white}{path}:${FaConsoleColor.color.yellow}{line}${FaConsoleColor.color.white}:{column} ${FaConsoleColor.effect.reset} {data}`;
		let trace = FaTrace.getData(2);
		let content = this.getArguments(arguments);
		// console.log(content);
		// return;
		this._consoleWrite(this._beautify(content, 'extended-color'), template, trace);
		// this._FaConsole.consoleFile(this._beautify(content, 'extended'), `console-error`, null, trace);
	}
};
