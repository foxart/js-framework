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
	 * @param FaHttp {module.FaHttpClass}
	 * @param views_path {string | null}
	 */
	constructor(FaHttp, views_path = null) {
		this._FaHttp = FaHttp;
		let path_template = views_path === null ? this._getTemplatePath(FaError.pickTrace(new Error(), 1)["trace"][0]["path"]) : views_path;
		/**
		 *
		 * @type {module.FaTemplateClass}
		 * @private
		 */
		this._FaTemplateClass = new FaTemplateClass(path_template);
	}

	_getTemplatePath(controller) {
		let regular_filename = new RegExp(`^(.+/)controllers/([A-Z][^-]+)Controller.js$`);
		let regular_name = new RegExp("[A-Z][^A-Z]*", "g");
		let match_filename = controller.match(regular_filename);
		if (match_filename) {
			return `${match_filename[1]}views/${match_filename[2].match(regular_name).join("-").toLowerCase()}`;
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
			throw FaError.pickTrace(e.message, 2);
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
