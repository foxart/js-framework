"use strict";
/*fa-nodejs*/
const FaHttpContentType = require("fa-nodejs/server/http-content-type");
/* @member {Class|FaHttpResponse} */
const FaHttpResponse = require("fa-nodejs/server/http-response");
const FaHttpStatusCode = require("fa-nodejs/server/http-status-code");
const FaBaseError = require("fa-nodejs/base/error");
/** @member {Class|FaTrace} */
const FaTrace = require("fa-nodejs/base/trace");
const FaApplicationTemplate = require("fa-nodejs/application/template");

// const FaApplicationController = require("fa-nodejs/application/controller");
class FaApplicationController {
	/**
	 *
	 * @param FaServerHttp {FaServerHttp}
	 * @param pathname {string|null}
	 */
	constructor(FaServerHttp, pathname = null) {
		this._FaServer = FaServerHttp;
		this._FaHttpContentType = new FaHttpContentType();
		this._FaHttpResponse = new FaHttpResponse();
		this._response = FaHttpResponse;
		this._FaHttpStatusCode = new FaHttpStatusCode();
		this._FaTemplate = new FaApplicationTemplate(pathname ? pathname : FaApplicationController._getTemplatePathname);
		// console.warn(this._getTemplatePathname, this["actionIndex"]);
	}

	/**
	 *
	 * @return {string|null}
	 * @private
	 */
	static get _getTemplatePathname() {
		// console.info(FaBaseTrace.trace(3));
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
	 * @deprecated
	 * @return {FaServerHttp}
	 */
	get http() {
		return this._FaServer;
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
	 * @return {FaHttpStatusCode}
	 */
	get statusCode() {
		return this._FaHttpStatusCode;
	}

	/**
	 *
	 * @param location {string|null}
	 * @return {*}
	 */
	redirect(location = null) {
		return this._response.create(null, this.statusCode.found, {
			"Location": location ? location : "/",
		});
	}

	/**
	 *
	 * @param location {String|null}
	 * @param headers {Object}
	 * @return {*}
	 */
	redirectCustom(location = null, headers = null) {
		return this._response.create(null, this.statusCode.found, Object.assign(headers, {
			"Location": location ? location : "/",
		}));
	}

	/**
	 *
	 * @param body {*}
	 * @param status {FaHttpStatusCode}
	 * @return {*}
	 */
	render(body = null, status = null) {
		return this._response.create(body, status, this.contentType.html, "layout");
	}

	/**
	 *
	 * @param body {*}
	 * @param status {FaHttpStatusCode}
	 * @param headers {object}
	 * @return {*}
	 */
	renderCustom(body = null, status = null, headers = null) {
		return this._response.create(body, status, headers);
	}

	/**
	 *
	 * @param body {Object}
	 * @param status {FaHttpStatusCode}
	 * @return {*}
	 */
	renderJson(body, status = null) {
		return this._response.create(body, status, this.contentType.json);
	}

	/**
	 * @deprecated
	 * @param body {Object}
	 * @param status {FaHttpStatusCode}
	 * @return {*}
	 */
	renderHtml(body, status = null) {
		return this._response.create(body, status, this.contentType.html);
	}

	/**
	 *
	 * @param body {Object}
	 * @param status {FaHttpStatusCode}
	 * @return {*}
	 */
	renderXml(body, status = null) {
		return this._response.create(body, status, this.contentType.xml);
	}

	/**
	 *
	 * @param template
	 * @return {FaApplicationTemplate}
	 */
	template(template) {
		try {
			return this._FaTemplate.load(template);
		} catch (e) {
			throw new FaBaseError(e).pickTrace(1);
		}
	}
}

/**
 *
 * @type {FaApplicationController}
 */
module.exports = FaApplicationController;
