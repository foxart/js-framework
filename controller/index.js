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
		this._template = new FaTemplateClass(path);
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
	 * @param data {object}
	 * @param server {module.FaServerClass}
	 * @return {*}
	 */
	actionIndex(data, server) {
		return server.httpResponse({xml:data}, server.http.contentType.xml);
	}
};
