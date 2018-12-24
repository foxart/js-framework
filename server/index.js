'use strict';
/*vendor*/
const
	FaServerConfigurationClass = require('./http-configuration'),
	// FaServerFileClass = require('./File'),
	FaServerConverterClass = require('../base/converter'),
	FaServerSocketClass = require('./socket'),
	FaServerHttpClass = require('./http'),
	FaServerHttpResponseClass = require('./http-response'),
	FaTemplate = require('../application/template'),
	FaConsoleColor = require('../console/console-color');
/**
 *
 * @type {module.FaServerClass}
 */
module.exports = class FaServerClass {
	/**
	 *
	 * @param configuration
	 */
	constructor(configuration) {
		let context = this;
		/**
		 *
		 * @type {module.FaServerConfigurationClass}
		 * @private
		 */
		FaConsole.consoleLog(configuration)
		this._ConfigurationClass = new FaServerConfigurationClass(configuration);
		FaConsole.consoleInfo(this._ConfigurationClass)
		this._ConverterClass = new FaServerConverterClass(this.configuration.converter);
		this._HttpClass = new FaServerHttpClass(context, this.configuration.Http);
		this._SocketClass = new FaServerSocketClass(context, this.configuration.socket);
	}

	/**
	 *
	 * @return {module.FaServerConfigurationClass}
	 */
	get configuration() {
		// return this._ConfigurationClass.get;
		return this._ConfigurationClass;
	};

	/**
	 *
	 * @returns {module.FaFileClass}
	 */
	// get File() {
	// 	return this._FaFileClass;
	// }
	/**
	 *
	 * @return {module.FaServerConverterClass}
	 */
	get converter() {
		return this._ConverterClass;
	}

	/**
	 *
	 * @return {FaHttpClass}
	 */
	get http() {
		return this._HttpClass;
	}

	/**
	 *
	 * @return {module.FaServerSocketClass}
	 */
	get socket() {
		return this._SocketClass;
	}

	/**
	 *
	 * @param data
	 * @param headers {object|string|null}
	 * @param status {number|null}
	 * @return {module.FaServerHttpResponseClass}
	 */
	// httpResponse(data, headers = null, status = null) {
	// 	return new FaServerHttpResponseClass(data, headers, status);
	// }
	/**
	 *
	 * https://www.compart.com/en/unicode/category/So
	 * @param name
	 * @param protocol
	 * @param host
	 * @param port
	 * @param path
	 */
	log(name, protocol, host, port, path) {
		let message = `${name} ${FaConsoleColor.effect.bold}${FaConsoleColor.color.green}\u2714${FaConsoleColor.effect.reset} ${protocol}://${host}:${port} <${path}>`;
		let template = `${FaConsoleColor.bg.black}${FaConsoleColor.color.cyan} {time} ${FaConsoleColor.color.white}{path}:${FaConsoleColor.color.cyan}{line}${FaConsoleColor.color.white}:{column} ${FaConsoleColor.effect.reset} {data}`;
		FaConsole.consoleWrite(message, template, 'plain');
	}
};
