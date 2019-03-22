"use strict";
const FaBaseError = require("fa-nodejs/base/error");
const FaBaseTrace = require("fa-nodejs/base/trace");
const FaApplicationTemplate = require("fa-nodejs/application/template");

/**
 *
 * @type {module.FaController}
 */
class FaController {
	/**
	 *
	 * @param views_path {string}
	 */
	constructor(views_path) {
		// console.info(views_path)
		this._FaTemplateClass = new FaApplicationTemplate(views_path === null ? this._getTemplatePath : views_path);
	}

	get _getTemplatePath() {
		let controller_path = FaBaseTrace.trace(2)["path"];
		let regular_path = new RegExp(`^(.+)/controllers/([A-Z][^-]+)Controller.js$`);
		let regular_name = new RegExp("[A-Z][^A-Z]*", "g");
		let match_path = controller_path.match(regular_path);
		if (match_path) {
			return `${match_path[1]}/views/${match_path[2].match(regular_name).join("-").toLowerCase()}`;
		} else {
			return null;
		}
	}

	/**
	 * @param template {string}
	 * @return {module.FaTemplateClass}
	 */
	template(template) {
		try {
			return this._FaTemplateClass.load(template);
		} catch (e) {
			throw FaBaseError.pickTrace(e.message, 2);
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
