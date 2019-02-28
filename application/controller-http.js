"use strict";
/*fa-nodejs*/
const FaError = require("fa-nodejs/base/error");
const FaTrace = require("fa-nodejs/base/trace");
const FaTemplateClass = require("fa-nodejs/application/template");
/**
 *
 * @type {module.FaControllerHttp}
 */
module.exports = class FaControllerHttp {
	/**
	 *
	 * @param FaHttp {module.FaHttpClass}
	 * @param views_path {string|null}
	 */
	constructor(FaHttp, views_path = null) {
		this._FaHttp = FaHttp;
		/**
		 *
		 * @type {module.FaTemplateClass}
		 * @private
		 */
		this._FaTemplateClass = new FaTemplateClass(views_path === null ? this._getTemplatePath : views_path);
	}

	get _getTemplatePath() {
		let controller_path = FaTrace.trace(2)["path"];
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
	 *
	 * @return {module.FaHttpClass}
	 */
	get http() {
		return this._FaHttp;
	}

	/**
	 * @param template {string}
	 * @return {module.FaTemplateClass}
	 */
	template(template) {
		try {
			return this._FaTemplateClass.load(template);
		} catch (e) {
			throw new FaError(e).pickTrace(1);
		}
	}

	/**
	 *
	 * @param data {object}
	 * @return {*}
	 */
	actionIndex(data) {
		return this.http.response({
			xml: data
		}, this.http.type.xml);
	}
};
