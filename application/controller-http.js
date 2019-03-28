"use strict";
/*fa-nodejs*/
const FaBaseError = require("fa-nodejs/base/error");
const FaBaseTrace = require("fa-nodejs/base/trace");
const FaApplicationTemplate = require("fa-nodejs/application/template");
const FaApplicationController = require("fa-nodejs/application/controller");

class FaApplicationControllerHttp extends FaApplicationController {
	/**
	 *
	 * @param FaServerHttp {FaServerHttp}
	 * @param views_path {string|null}
	 */
	constructor(FaServerHttp, views_path = null) {
		super(views_path);
		this._FaServerHttp = FaServerHttp;
		this._FaTemplateClass = new FaApplicationTemplate(views_path === null ? this._getTemplatePath : views_path);
	}

	get _getTemplatePath() {
		// console.info(FaBaseTrace.trace(3));
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
	 *
	 * @return {FaServerHttp}
	 */
	get http() {
		return this._FaServerHttp;
	}


	/**
	 *
	 * @param content
	 * @param type
	 * @param status
	 * @return {FaServerHttpResponse}
	 */
	respond(content, type, status) {
		return this._FaServerHttp.response(content, type, status);
	}

	/**
	 *
	 * @param content
	 * @param type
	 * @param status
	 * @return {FaServerHttpResponse}
	 */
	createResponse(content, type, status) {
		return this._FaServerHttp.response(content, type, status);
	}

	/**
	 *
	 * @param template
	 * @return {FaApplicationTemplate}
	 */
	template(template) {
		try {
			return this._FaTemplateClass.load(template);
		} catch (e) {
			throw new FaBaseError(e).pickTrace(1);
		}
	}

	/**
	 *
	 * @param data {object}
	 * @return {*}
	 */
	actionIndex(data) {
		return this._FaServerHttp.response({
			xml: data
		}, this._FaServerHttp.type.xml);
	}
}

/**
 *
 * @type {FaApplicationControllerHttp}
 */
module.exports = FaApplicationControllerHttp;
