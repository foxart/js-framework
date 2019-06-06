"use strict";
/*fa-nodejs*/
const FaHttpContentType = require("fa-nodejs/server/http-content-type");
const FaHttpResponse = require("fa-nodejs/server/http-response");
const FaHttpStatusCode = require("fa-nodejs/server/http-status-code");
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
		this._FaHttpContentType = new FaHttpContentType();
		this._FaHttpResponse = new FaHttpResponse();
		this._response = FaHttpResponse;
		this._FaHttpStatusCode = new FaHttpStatusCode();
		this._FaTemplateClass = new FaApplicationTemplate(!views_path ? this._getTemplatePath : views_path);
		// console.warn(this._getTemplatePathname, this["actionIndex"]);
	}

	/**
	 *
	 * @return {string|null}
	 * @private
	 */
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
	 * @return {FaHttpContentType}
	 */
	get contentType() {
		return this._FaHttpContentType;
	}

	/**
	 *
	 * @return {FaHttpResponse}
	 */
	get response() {
		return this._FaHttpResponse;
	}

	/**
	 *
	 * @return {FaHttpStatusCode}
	 */
	get statusCode() {
		return this._FaHttpStatusCode;
	}

	/**
	 * @deprecated
	 * @return {FaServerHttp}
	 */
	get http() {
		return this._FaServer;
	}

	/**
	 *
	 * @param location {string|null}
	 * @param status {FaHttpStatusCode}
	 * @return {*}
	 */
	redirect(location = null, status = null) {
		return this.renderCustom(null, null, status ? status : this.statusCode.found, {
			"Location": location ? location : "/",
		});
	}

	/**
	 *
	 * @param body {*}
	 * @param status {FaHttpStatusCode}
	 * @return {*}
	 */
	render(body = null, status = null) {
		return this.response.create(body, this.contentType.html, status);
	}

	/**
	 *
	 * @param body {*}
	 * @param type {FaHttpContentType}
	 * @param status {FaHttpStatusCode}
	 * @param headers {object}
	 * @return {*}
	 */
	renderCustom(body = null, type = null, status = null, headers = null) {
		return this.response.create(body, type, status, headers);
	}

	renderCustomNew(body = null, status = null, headers = null) {
		return this._response.createNew(body, status, headers);
	}

	/**
	 *
	 * @param body {Object}
	 * @param status {FaHttpStatusCode}
	 * @return {*}
	 */
	renderJson(body, status = null) {
		return this.response.create(body, this.contentType.json, status);
	}

	/**
	 * @deprecated
	 * @param body {Object}
	 * @param status {FaHttpStatusCode}
	 * @return {*}
	 */
	renderHtml(body, status = null) {
		return this.response.create(body, this.contentType.html, status);
	}

	/**
	 *
	 * @param body {Object}
	 * @param status {FaHttpStatusCode}
	 * @return {*}
	 */
	renderXml(body, status = null) {
		return this.response.create(body, this.contentType.xml, status);
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
	// actionIndex(data) {
	// 	return this.renderXml(data);
	// }
}

/**
 *
 * @type {FaApplicationControllerHttp}
 */
module.exports = FaApplicationControllerHttp;
