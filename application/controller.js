"use strict";
const FaTemplateClass = require('./template');
const FaError = require('../base/error');
/**
 *
 * @type {module.FaController}
 */
module.exports = class FaController {
	/**
	 *
	 * @param FaHttp {FaHttpClass}
	 * @param namespace {string}
	 */
	constructor(FaHttp, namespace) {
		this.Http = FaHttp;
		/**
		 *
		 * @type {module.FaTemplateClass}
		 * @private
		 */
		this._FaTemplateClass = new FaTemplateClass(`${namespace}/views`);
	}

	/**
	 * @param template {string}
	 * @return {module.FaTemplateClass}
	 */
	template(template) {
		try {
			return this._FaTemplateClass.load(template);
		} catch (e) {
			throw FaError.pickTrace(e.message, 2);
		}
	}

	/**
	 *
	 * @param data {object}
	 * @return {*}
	 */
	actionIndex(data) {
		return this.Http.response({
			xml: data
		}, this.Http.type.xml);
	}
};
