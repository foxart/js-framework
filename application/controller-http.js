"use strict";
const FaError = require('../base/error');
const FaTemplateClass = require('./template');
/**
 *
 * @type {module.FaControllerHttp}
 */
module.exports = class FaControllerHttp {
	/**
	 *
	 * @param FaHttp {FaHttpClass}
	 * @param views {string}
	 */
	constructor(FaHttp, views) {
		this.name = "FaControllerHttp";
		this.Http = FaHttp;
		this._FaTemplateClass = new FaTemplateClass(views);
	}

	/**
	 * @param template {string}
	 * @return {FaTemplateClass}
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
