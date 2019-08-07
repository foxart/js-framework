"use strict";
/*fa*/
const FaError = require("fa-nodejs/base/error");
const FaFile = require("fa-nodejs/base/file");
const FaTrace = require("fa-nodejs/base/trace");
const FaTemplate = require("fa-nodejs/application/template");
const FaTwig = require("fa-nodejs/base/twig");
const FaHttpContentType = require("fa-nodejs/server/http-content-type");
const FaHttpResponse = require("fa-nodejs/server/http-response");
const FaHttpStatusCode = require("fa-nodejs/server/http-status-code");

// const FaApplicationController = require("fa-nodejs/application/controller");
class FaApplicationController {
	/**
	 *
	 * @param FaServerHttp {FaServerHttp}
	 * @param pathname {string|null}
	 */
	constructor(FaServerHttp, pathname = null) {
		this.name = "CONTROLLER";
		this._FaServer = FaServerHttp;
		this._FaHttpContentType = FaHttpContentType;
		this._FaHttpStatusCode = new FaHttpStatusCode();
		this._FaTemplate = new FaTemplate();
		this._FaTwig = new FaTwig(pathname ? pathname : this._viewsPathname);
		this._FaFile = new FaFile(pathname ? pathname : this._viewsPathname);
	}

	// noinspection JSMethodCanBeStatic
	/**
	 *
	 * @return {string|null}
	 * @private
	 */
	get _viewsPathname() {
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

	// noinspection JSMethodCanBeStatic
	get contentType() {
		return FaHttpContentType;
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
	 * @param name
	 * @return {FaTwig}
	 */
	twig(name) {
		let filename = `${name}.twig`;
		if (this._FaFile.isFile(filename)) {
			if (!this._FaTwig._content) {
				this._FaTwig.load(filename);
			}
			return this._FaTwig;
		} else {
			throw new FaError(`view not found: ${this._FaFile.getPathname(filename)}`).pickTrace(1);
		}
	}

	/**
	 *
	 * @param name
	 * @return {FaTemplate}
	 * @deprecated
	 */
	template(name) {
		let filename = `${name}.tpl`;
		try {
			if (!this._FaTemplate.get) {
				this._FaTemplate.set = this._FaFile.readFileSync(filename).toString();
			}
			return this._FaTemplate;
		} catch (e) {
			throw new FaError(`view not found: ${this._FaFile.getPathname(filename)}`);
		}
	}

	/**
	 *
	 * @param location {string|null}
	 * @return {*}
	 */
	redirect(location = null) {
		return FaHttpResponse.create(null, this.statusCode.found, {
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
		return FaHttpResponse.create(null, this.statusCode.found, Object.assign(headers, {
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
		// return this._response.create(body, status, this.contentType.html, "layout");
		return FaHttpResponse.create(body, status, this.contentType.html, "layout");
	}

	/**
	 *
	 * @param body {*}
	 * @param status {FaHttpStatusCode}
	 * @param headers {object}
	 * @return {*}
	 */
	renderCustom(body = null, status = null, headers = null) {
		return FaHttpResponse.create(body, status, headers);
	}

	/**
	 *
	 * @param body {Object}
	 * @param status {FaHttpStatusCode}
	 * @return {*}
	 */
	renderJson(body, status = null) {
		return FaHttpResponse.create(body, status, this.contentType.json);
	}

	/**
	 * @deprecated
	 * @param body {Object}
	 * @param status {FaHttpStatusCode}
	 * @return {*}
	 */
	renderHtml(body, status = null) {
		return FaHttpResponse.create(body, status, this.contentType.html);
	}

	/**
	 *
	 * @param body {Object}
	 * @param status {FaHttpStatusCode}
	 * @return {*}
	 */
	renderXml(body, status = null) {
		return FaHttpResponse.create(body, status, this.contentType.xml);
	}
}

/**
 *
 * @type {FaApplicationController}
 */
module.exports = FaApplicationController;
