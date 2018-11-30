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
	 * @param path {string|null}
	 */
	constructor(path) {
		this.name = 'FaController';
		this._template = new FaTemplateClass(path, 3);
	}

	/**
	 * @param filename {string}
	 * @return {module.FaTemplateClass}
	 */
	template(filename) {
		return this._template.load(filename);
	}

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
