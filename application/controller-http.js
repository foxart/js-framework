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
		this._FaServer = FaServerHttp;
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
		return this._FaServer;
	}

	/**
	 *
	 * @param data {*}
	 * @return {*}
	 */
	render(data = null) {
		return this.http._createResponse(data);
	}

	/**
	 *
	 * @param data {*}
	 * @param type {FaHttpContentType}
	 * @param status {FaHttpStatusCode}
	 * @param headers {object}
	 * @return {*}
	 */
	renderCustom(data = null, type = null, status = null, headers = null) {
		return this.http._createResponse(data, type, status, headers);
	}

	/**
	 *
	 * @param data {Object}
	 * @param status {FaHttpStatusCode}
	 * @return {*}
	 */
	renderJson(data, status = null) {
		return this.http._createResponse(data, this._FaServer.type.json, status);
	}

	/**
	 *
	 * @param data {Object}
	 * @param status {FaHttpStatusCode}
	 * @return {*}
	 */
	renderHtml(data, status = null) {
		return this.http._createResponse(data, this._FaServer.type.html, status);
	}

	/**
	 *
	 * @param data {Object}
	 * @param status {FaHttpStatusCode}
	 * @return {*}
	 */
	renderXml(data, status = null) {
		return this.http._createResponse(data, this._FaServer.type.xml, status);
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
		return this.renderXml(data);
	}
}

/**
 *
 * @type {FaApplicationControllerHttp}
 */
module.exports = FaApplicationControllerHttp;
