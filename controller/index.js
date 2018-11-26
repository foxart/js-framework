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
