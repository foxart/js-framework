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
		// FaConsole.consoleWarn(namespace);
		this.name = "FaControllerHttp";
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
			// FaConsole.consoleError(e);
			// throw e;
			throw FaError.pickTrace(e.message,2);
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

// module.exports = function (path) {
// 	if (arguments) {
// 		return new FaControllerClass(path);
// 	} else {
// 		return FaControllerClass;
// 	}
// };
/**
 *
 * @type {FaController}
 */
module.exports = FaController;
