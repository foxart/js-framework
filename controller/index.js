'use strict';
/*fa*/
const FaTemplateClass = require('../template');
/**
 *
 * @type {module.FaControllerClass}
 */
module.exports = class FaControllerClass {
	/**
	 *
	 * @param path
	 */
	constructor(path = null) {
		let context = this;
		this._name = 'FaController';
		this._template = new FaTemplateClass(path);
		this.action = {};
		this.handler = {
			get(target, name) {
				FaConsole.consoleWarn(target, name);
				// FaConsole.consoleWarn(context.actionIndex);
				return 123;

			},
		};
		this._proxy = new Proxy(this.action, this.handler);
	}

	/**
	 *
	 * @return {object}
	 */
	get proxy(){
		return this._proxy;
	}

	/**
	 *
	 * @return {module.FaTemplateClass}
	 */
	get template() {
		return this._template;
	}

	/**
	 *
	 * @type {*}
	 */
	// api.posts; // => 'posts'
	// api.comments; // => 'comments'
	/**
	 *
	 * @param data {object}
	 * @param server {module.FaServerClass}
	 * @return {*}
	 */
	actionIndex(data, server) {
		return server.httpResponse({xml: data}, server.http.contentType.xml);
	}
};
