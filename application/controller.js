"use strict";
const FaTemplateClass = require('./template');
const FaError = require('../base/error');

class FaController {
	/**
	 *
	 * @param FaHttp {FaHttpClass}
	 * @param namespace {string}
	 */
	constructor(FaHttp, namespace) {
		this.Http = FaHttp;
		this._FaTemplateClass = new FaTemplateClass(`${namespace}/views`);
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
}

/**
 *
 * @type {FaController}
 */
module.exports = FaController;
/**
 *
 * @param FaHttp {FaHttpClass}
 * @param namespace {string}
 */
// module.exports = function (FaHttp, namespace) {
// 	if (arguments) {
// 		return new FaController(FaHttp, namespace);
// 	} else {
// 		return FaController;
// 	}
// };
