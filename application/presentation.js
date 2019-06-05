"use strict";
/*fa*/
const FaError = require("fa-nodejs/base/error");
/** @member {Class|FaTrace} */
const FaTrace = require("fa-nodejs/base/trace");
const FaApplicationTemplate = require("fa-nodejs/application/template");

class FaPresentation {
	/**
	 * @constructor
	 * @param pathname {string|null}
	 */
	constructor(pathname = null) {
		this._FaTemplateClass = new FaApplicationTemplate(pathname == null ? this._getTemplatePathname : pathname);
	}

	// noinspection JSMethodCanBeStatic
	/**
	 *
	 * @return {string|null}
	 * @private
	 */
	get _getTemplatePathname() {
		let regular_path = new RegExp(`^(.+)/controllers/([A-Z][^-]+)Presentation.js$`);
		let regular_name = new RegExp("[A-Z][^A-Z]*", "g");
		let match_path = FaTrace.trace(2)["path"].match(regular_path);
		if (match_path) {
			return `${match_path[1]}/views/${match_path[2].match(regular_name).join("-").toLowerCase()}`;
		} else {
			return null;
		}
	}

	/**
	 *
	 * @param template {string}
	 * @return {FaApplicationTemplate}
	 */
	template(template) {
		try {
			return this._FaTemplateClass.load(template);
		} catch (e) {
			throw new FaError(e).pickTrace(1);
		}
	}

	// noinspection JSMethodCanBeStatic
	/**
	 *
	 * @param data {*}
	 * @return {*}
	 */
	renderIndex(data = null) {
		return data;
	}
}

/**
 *
 * @type {FaPresentation}
 */
module.exports = FaPresentation;
