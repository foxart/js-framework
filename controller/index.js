/*node*/
const Path = require('path');
/*fa*/
const FaTemplateClass = require('../template');
const FaTraceClass = require('../trace.js');
/**
 *
 * @type {module.IndexController}
 */
module.exports = class IndexController {
	constructor() {
		this._template = new FaTemplateClass(Path.dirname(new FaTraceClass().path(3)));
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
	 * @param http {module.FaServerClass}
	 * @return {*}
	 */
	actionIndex(data, http) {
		return http.httpResponse(data);
	}
};
