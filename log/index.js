'use strict';
/*node*/
/** @type {object} */
const DateAndTime = require('date-and-time');
const Fs = require('fs');
/*modules*/
const FaBeautify = require('../beautify/index');
const FaConsole = require('../console');
const FaTrace = require('../trace/index');

/**
 *
 * @type {module.FaLogClass}
 */
module.exports = class FaLogClass {
	constructor(executor) {
		this._path = executor ? executor : '../runtime';
	}

	/**
	 * @param content
	 * @param filename {string}
	 * @param template {string|null}
	 * @param trace {array}
	 */
	_consoleFile(content, filename, template = null, trace) {
		filename = filename === undefined ? 'console-file' : filename;
		template = template ? template : `{time} | {caller}:{line}:{column} | {data}`;
		let time = new Date().toLocaleTimeString();
		// let date = new Date().toLocaleDateString();
		let date = DateAndTime.format(new Date(), "YYYY-MM-DD");
		let caller = trace['filePath'] ? trace['filePath'].replace(process.cwd(), '') : trace['filePath'];
		let line = trace['lineNumber'];
		let column = trace['columnNumber'];
		let string = template.replaceAll([
				'{time}', '{caller}', '{line}', '{column}', '{data}',
			], [
				time, caller, line, column, content,
			]
		);
		let logStream = Fs.createWriteStream(`${this._path}${filename}-${date}.log`, {
			'flags': 'a'
		});
		logStream.write(`${string}\n`);
		logStream.end();
	}

	/**
	 * @param data
	 * @param beautify {string}
	 * @return {string}
	 */
	_beautify(data, beautify) {
		switch (beautify) {
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
	 */
	_consoleWrite(content, template, trace) {
		template = template ? template : `{time} | {path}:{line} | {data}`;
		let time = new Date().toLocaleTimeString();
		let path = trace['filePath'] ? trace['filePath'].replace(process.cwd(), '') : trace['filePath'];
		let line = trace['lineNumber'];
		let column = trace['columnNumber'];
		let string = template.replaceAll([
				'{time}', '{path}', '{line}', '{column}', '{content}',
			], [
				time, path, line, column, content,
			]
		);
		console.log(string);
	}

	/**
	 *
	 * @param data
	 */
	getArguments(data) {
		return data.length === 1 ? data[0] : data;
	}

	/**
	 * @param data
	 * @param filename
	 * @param template
	 */
	consoleFile(data, filename, template) {
		let trace = FaTrace.getData(2);
		let content = data.length === 1 ? FaBeautify.plain(data[0]) : FaBeautify.plain(data);
		this._consoleFile(content, filename, template, trace);
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
		let template = `${FaConsole.bg.black}${FaConsole.color.cyan} {time} ${FaConsole.color.white}{path}:${FaConsole.color.cyan}{line}${FaConsole.color.white}:{column} ${FaConsole.effect.reset} {content}`;
		let trace = FaTrace.getData(2);
		let content = this.getArguments(arguments);
		this._consoleWrite(this._beautify(content, 'extended-color'), template, trace);
	}

	consoleInfo() {
		let template = `${FaConsole.bg.blue}${FaConsole.color.black} {time} ${FaConsole.color.white}{path}:${FaConsole.color.black}{line}${FaConsole.color.white}:{column} ${FaConsole.effect.reset} {content}`;
		let trace = FaTrace.getData(2);
		let content = this.getArguments(arguments);
		this._consoleWrite(this._beautify(content, 'extended-color'), template, trace);
	}

	consoleWarn() {
		let template = `${FaConsole.bg.yellow}${FaConsole.color.red} {time} ${FaConsole.color.black}{path}:${FaConsole.color.red}{line}${FaConsole.color.black}:{column} ${FaConsole.effect.reset} {content}`;
		let trace = FaTrace.getData(2);
		let content = this.getArguments(arguments);
		this._consoleWrite(this._beautify(content, 'extended-color'), template, trace);
	}

	consoleError() {
		let template = `${FaConsole.bg.red}${FaConsole.color.yellow} {time} ${FaConsole.color.white}{path}:${FaConsole.color.yellow}{line}${FaConsole.color.white}:{column} ${FaConsole.effect.reset} {content}`;
		let trace = FaTrace.getData(2);
		console.log('xxx');
		let content = this.getArguments(arguments);
		console.log(content);
		return;
		// this._consoleWrite(this._beautify(content, 'extended-color'), template, trace);
		// this._consoleFile(this._beautify(content, 'extended'), `console-error`, null, trace);
	}
};

// module.exports = function () {
// 	let path = '../runtime/';
//
// 	/**
// 	 * @param content
// 	 * @param filename
// 	 * @param template
// 	 * @param trace
// 	 * @private
// 	 */
// 	function _consoleFile(content, filename, template, trace) {
// 		filename = filename === undefined ? 'console-file' : filename;
// 		template = template ? template : `{time} | {caller}:{line}:{column} | {data}`;
// 		let time = new Date().toLocaleTimeString();
// 		// let date = new Date().toLocaleDateString();
// 		let date = DateAndTime.format(new Date(), "YYYY-MM-DD");
// 		let caller = trace['filePath'] ? trace['filePath'].replace(process.cwd(), '') : trace['filePath'];
// 		let line = trace['lineNumber'];
// 		let column = trace['columnNumber'];
// 		let string = template.replaceAll([
// 				'{time}', '{caller}', '{line}', '{column}', '{data}',
// 			], [
// 				time, caller, line, column, content,
// 			]
// 		);
// 		let logStream = Fs.createWriteStream(`${path}${filename}-${date}.log`, {
// 			'flags': 'a'
// 		});
// 		logStream.write(`${string}\n`);
// 		logStream.end();
// 	}
//
// 	/**
// 	 * @param data
// 	 * @param beautify {string}
// 	 * @return {string}
// 	 * @private
// 	 */
// 	function _beautify(data, beautify) {
// 		switch (beautify) {
// 			case 'plain':
// 				return FaBeautify.plain(data);
// 			case 'plain-color':
// 				return FaBeautify.plainColor(data);
// 			case 'extended':
// 				return FaBeautify.extended(data);
// 			case 'extended-color':
// 				return FaBeautify.extendedColor(data);
// 			default:
// 				return FaBeautify.extendedColor(data);
// 		}
// 	}
//
// 	/**
// 	 * @param content
// 	 * @param template
// 	 * @param trace
// 	 * @private
// 	 */
// 	function _consoleWrite(content, template, trace) {
// 		template = template ? template : `{time} | {path}:{line} | {data}`;
// 		let time = new Date().toLocaleTimeString();
// 		let path = trace['filePath'] ? trace['filePath'].replace(process.cwd(), '') : trace['filePath'];
// 		let line = trace['lineNumber'];
// 		let column = trace['columnNumber'];
// 		let string = template.replaceAll([
// 				'{time}', '{path}', '{line}', '{column}', '{content}',
// 			], [
// 				time, path, line, column, content,
// 			]
// 		);
// 		console.log(string);
// 	}
//
// 	return {
// 		/**
// 		 * @param data
// 		 * @param filename
// 		 * @param template
// 		 */
// 		consoleFile: function (data, filename, template) {
// 			let trace = FaTrace.getData(2);
// 			let content = data.length === 1 ? FaBeautify.plain(data[0]) : FaBeautify.plain(data);
// 			_consoleFile(content, filename, template, trace);
// 		},
// 		/**
// 		 *
// 		 * @param data
// 		 * @param template
// 		 * @param beautify
// 		 */
// 		consoleWrite: function (data, template, beautify) {
// 			let trace = FaTrace.getData(2);
// 			let content = _beautify(data, beautify);
// 			_consoleWrite(content, template, trace);
// 		},
// 		/**
// 		 *
// 		 */
// 		consoleLog: function () {
// 			let template = `${FaConsole.bg.black}${FaConsole.color.cyan} {time} ${FaConsole.color.white}{path}:${FaConsole.color.cyan}{line}${FaConsole.color.white}:{column} ${FaConsole.effect.reset} {content}`;
// 			let trace = FaTrace.getData(2);
// 			let content = arguments.length === 1 ? _beautify(arguments[0], 'extended-color') : _beautify(arguments, 'extended-color');
// 			_consoleWrite(content, template, trace);
// 		},
// 		/**
// 		 *
// 		 */
// 		consoleInfo: function () {
// 			let template = `${FaConsole.bg.blue}${FaConsole.color.black} {time} ${FaConsole.color.white}{path}:${FaConsole.color.black}{line}${FaConsole.color.white}:{column} ${FaConsole.effect.reset} {content}`;
// 			let trace = FaTrace.getData(2);
// 			let content = arguments.length === 1 ? _beautify(arguments[0], 'extended-color') : _beautify(arguments, 'extended-color');
// 			_consoleWrite(content, template, trace);
// 		},
// 		/**
// 		 *
// 		 */
// 		consoleWarn: function () {
// 			let template = `${FaConsole.bg.yellow}${FaConsole.color.red} {time} ${FaConsole.color.black}{path}:${FaConsole.color.red}{line}${FaConsole.color.black}:{column} ${FaConsole.effect.reset} {content}`;
// 			let trace = FaTrace.getData(2);
// 			let content = arguments.length === 1 ? _beautify(arguments[0], 'extended-color') : _beautify(arguments, 'extended-color');
// 			_consoleWrite(content, template, trace);
// 		},
// 		/**
// 		 *
// 		 */
// 		consoleError: function () {
// 			let template = `${FaConsole.bg.red}${FaConsole.color.yellow} {time} ${FaConsole.color.white}{path}:${FaConsole.color.yellow}{line}${FaConsole.color.white}:{column} ${FaConsole.effect.reset} {content}`;
// 			let trace = FaTrace.getData(2);
// 			let console_content = arguments.length === 1 ? _beautify(arguments[0], 'extended-color') : _beautify(arguments, 'extended-color');
// 			_consoleWrite(console_content, template, trace);
// 			let file_content = arguments.length === 1 ? _beautify(arguments[0], 'extended') : _beautify(arguments, 'extended');
// 			_consoleFile(file_content, `console-error`, null, trace);
// 		}
// 	};
// };
