// https://unicode-table.com/en/#miscellaneous-symbols
'use strict';
/*node*/
/**
 *
 * @type {{}}
 */
const DateAndTime = require('date-and-time');
const Fs = require('fs');
/*modules*/
const
	FaBeautify = require('../beautify/index'),
	FaConsole = require('../console'),
	FaTrace = require('../trace/index');
/**
 * @returns {{consoleFile: consoleFile, consoleWrite: consoleWrite, consoleLog: consoleLog, consoleInfo: consoleInfo, consoleWarn: consoleWarn, consoleError: consoleError}}
 */
module.exports = function () {
	let path = '../runtime/';

	/**
	 * @param content
	 * @param filename
	 * @param template
	 * @param trace
	 * @private
	 */
	function _consoleFile(content, filename, template, trace) {
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
		let logStream = Fs.createWriteStream(`${path}${filename}-${date}.log`, {
			'flags': 'a'
		});
		logStream.write(`${string}\n`);
		logStream.end();
	}


	/**
	 * @param data
	 * @param beautify {string}
	 * @return {string}
	 * @private
	 */
	function _consoleBeautify(data, beautify) {
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
	 * @private
	 */
	function _consoleWrite(content, template, trace) {
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

	return {
		/**
		 * @param data
		 * @param filename
		 * @param template
		 */
		consoleFile: function (data, filename, template) {
			let trace = FaTrace.getData(2);
			let content = data.length === 1 ? FaBeautify.plain(data[0]) : FaBeautify.plain(data);
			_consoleFile(content, filename, template, trace);
		},
		/**
		 *
		 * @param data
		 * @param template
		 * @param beautify
		 */
		consoleWrite: function (data, template, beautify) {
			let trace = FaTrace.getData(2);
			let content = _consoleBeautify(data, beautify);
			_consoleWrite(content, template, trace);
		},
		/**
		 *
		 */
		consoleLog: function () {
			let template = `${FaConsole.bg.black}${FaConsole.color.cyan} {time} ${FaConsole.color.white}{path}:${FaConsole.color.cyan}{line}${FaConsole.color.white}:{column} ${FaConsole.effect.reset} {content}`;
			let trace = FaTrace.getData(2);
			let content = arguments.length === 1 ? _consoleBeautify(arguments[0], 'extended-color') : _consoleBeautify(arguments, 'extended-color');
			_consoleWrite(content, template, trace);
		},
		/**
		 *
		 */
		consoleInfo: function () {
			let template = `${FaConsole.bg.blue}${FaConsole.color.black} {time} ${FaConsole.color.white}{path}:${FaConsole.color.black}{line}${FaConsole.color.white}:{column} ${FaConsole.effect.reset} {content}`;
			let trace = FaTrace.getData(2);
			let content = arguments.length === 1 ? _consoleBeautify(arguments[0], 'extended-color') : _consoleBeautify(arguments, 'extended-color');
			_consoleWrite(content, template, trace);
		},
		/**
		 *
		 */
		consoleWarn: function () {
			let template = `${FaConsole.bg.yellow}${FaConsole.color.red} {time} ${FaConsole.color.black}{path}:${FaConsole.color.red}{line}${FaConsole.color.black}:{column} ${FaConsole.effect.reset} {content}`;
			let trace = FaTrace.getData(2);
			let content = arguments.length === 1 ? _consoleBeautify(arguments[0], 'extended-color') : _consoleBeautify(arguments, 'extended-color');
			_consoleWrite(content, template, trace);
		},
		/**
		 *
		 */
		consoleError: function () {
			let template = `${FaConsole.bg.red}${FaConsole.color.yellow} {time} ${FaConsole.color.white}{path}:${FaConsole.color.yellow}{line}${FaConsole.color.white}:{column} ${FaConsole.effect.reset} {content}`;
			let trace = FaTrace.getData(2);
			let console_content = arguments.length === 1 ? _consoleBeautify(arguments[0], 'extended-color') : _consoleBeautify(arguments, 'extended-color');
			_consoleWrite(console_content, template, trace);
			let file_content = arguments.length === 1 ? _consoleBeautify(arguments[0], 'extended') : _consoleBeautify(arguments, 'extended');
			_consoleFile(file_content, `console-error`, null, trace);
		}
	};
};
