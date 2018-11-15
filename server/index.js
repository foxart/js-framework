'use strict';
/*vendor*/
const
	FaServerConfigurationClass = require('./configuration'),
	// FaServerFileClass = require('./file'),
	FaServerConverterClass = require('./converter'),
	FaServerSocketClass = require('./socket'),
	FaServerHttpClass = require('./http'),
	FaServerHttpResponseClass = require('./http-response'),
	FaTemplate = require('./template'),
	FaConsole = require('../console');
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
		this._ConfigurationClass = new FaServerConfigurationClass(configuration);
		this._ConverterClass = new FaServerConverterClass(this.configuration.converter);
		this._HttpClass = new FaServerHttpClass(context, this.configuration.http);
		this._SocketClass = new FaServerSocketClass(context, this.configuration.socket);
		this._TemplateClass = new FaTemplate();
	}

	/**
	 *
	 * @return {{http: *, socket: *, converter: *}}
	 */
	get configuration() {
		return this._ConfigurationClass.get;
	};

	/**
	 *
	 * @returns {module.FaFileClass}
	 */
	// get file() {
	// 	return this._FileClass;
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
	 * @return {module.FaServerHttpClass}
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
	 * @return {module.FaTemplateClass}
	 */
	get template() {
		return this._TemplateClass;
	}

	/**
	 *
	 * @param data
	 * @param headers {object|string|null}
	 * @param status {number|null}
	 * @return {module.FaServerHttpResponseClass}
	 */
	httpResponse(data, headers = null, status = null) {
		return new FaServerHttpResponseClass(data, headers, status);
	}

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
		let message = `${name} ${FaConsole.effect.bold}${FaConsole.color.green}\u2714${FaConsole.effect.reset} ${protocol}://${host}:${port} <${path}>`;
		let template = `${FaConsole.bg.black}${FaConsole.color.cyan} {time} ${FaConsole.color.white}{path}:${FaConsole.color.cyan}{line}${FaConsole.color.white}:{column} ${FaConsole.effect.reset} {content}`;
		consoleWrite(message, template, 'plain');
	}
};
