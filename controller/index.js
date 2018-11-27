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
		this.name = 'FaController';
		this._template = new FaTemplateClass(path);
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
