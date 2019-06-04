"use strict";
const FaBaseError = require("fa-nodejs/base/error");
const FaBaseTrace = require("fa-nodejs/base/trace");
const FaApplicationTemplate = require("fa-nodejs/application/template");

class FaApplicationController {
	/**
	 *
	 * @param views_path {string}
	 */
	constructor(views_path) {
		// console.info(views_path)
		/**
		 *
		 * @type {FaApplicationTemplate}
		 * @private
		 */
		this._FaApplicationTemplate = new FaApplicationTemplate(views_path === null ? this._getTemplatePath : views_path);
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
	 * @return {FaApplicationTemplate}
	 */
	template(template) {
		try {
			return this._FaApplicationTemplate.load(template);
		} catch (e) {
			throw new FaBaseError(e).pickTrace(2);
		}
	}
}

/**
 *
 * @type {FaApplicationController}
 */
module.exports = FaApplicationController;
