"use strict";
const FaError = require('../base/error');
const FaTemplateClass = require('./template');

class FaControllerHttp {
	/**
	 *
	 * @param FaHttp {FaHttpClass}
	 * @param namespace {string}
	 */
	constructor(FaHttp, namespace) {
		this.name = "FaControllerHttp";
		this.Http = FaHttp;
		this._FaTemplateClass = new FaTemplateClass(`${namespace}/views`);
	}

	/**
	 * @param template {string}
	 * @return {FaTemplateClass}
	 */
	template(template) {
		// console.log(FaError.pickTrace('e',1));
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
 * @type {FaControllerHttp}
 */
module.exports = FaControllerHttp;
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
