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

class FaController {
	get name() {
		return this.constructor.name;
	}

	/**
	 * @constructor
	 * @param pathname {string|null}
	 */
	constructor(pathname = null) {
		// this.name = "CONTROLLER";
		// this._FaServer = FaServerHttp;
		this._FaHttpContentType = FaHttpContentType;
		this._FaHttpStatusCode = new FaHttpStatusCode();
		this._FaTemplate = new FaTemplate();
		// this._FaTwig = new FaTwig(pathname ? pathname : this._viewsPathname);
		this._pathname = pathname ? pathname : this._viewsPathname;
		// console.info(this._pathname);
		this._FaFile = new FaFile(pathname ? pathname : this._viewsPathname);
	}

	// noinspection JSMethodCanBeStatic
	/**
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

	// noinspection JSMethodCanBeStatic
	/**
	 * @return {{}}
	 */
	mixins() {
		return {
			'rbac': {
				'class': `Authentication`,
				'authentication': {
					'rules': [],
				},
				'authorization': {
					'rules': [],
				},
			},
		};
	}

	// noinspection JSMethodCanBeStatic
	get contentType() {
		return FaHttpContentType;
	}

	/**
	 * @return {FaHttpStatusCode}
	 */
	get statusCode() {
		return this._FaHttpStatusCode;
	}

	/**
	 * @return {FaTwig}
	 */
	get twig() {
		if (!this._FaTwig) {
			this._FaTwig = new FaTwig(this._pathname);
		}
		return this._FaTwig;
	}

	/**
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
	 * @param location {string|null}
	 * @return {*}
	 */
	redirect(location = null) {
		// console.info(location);
		return FaHttpResponse.create(null, this.statusCode.found, {
			"Location": location ? location : "/"
		});
	}

	/**
	 * @param location {string|null}
	 * @param status {FaHttpStatusCode}
	 * @param headers {Object}
	 * @return {*}
	 */
	redirectCustom(location = null, status = null, headers = {}) {
		console.warn(location);
		return FaHttpResponse.create(null, status ? status : this.statusCode.found, Object.assign(headers, {
			"Location": location ? location : "/"
		}));
	}

	/**
	 * @param body {*}
	 * @param status {FaHttpStatusCode}
	 * @return {*}
	 */
	render(body = null, status = null) {
		return FaHttpResponse.create(body, status, this.contentType.html, "layout");
	}

	// noinspection JSMethodCanBeStatic
	/**
	 * @param body {*}
	 * @param status {FaHttpStatusCode}
	 * @param headers {object}
	 * @return {*}
	 */
	renderCustom(body = null, status = null, headers = null) {
		return FaHttpResponse.create(body, status, headers);
	}

	/**
	 * @param body {Object}
	 * @param status {FaHttpStatusCode}
	 * @return {*}
	 */
	renderJson(body, status = null) {
		return FaHttpResponse.create(body, status, this.contentType.json);
	}

	/**
	 * @param body {Object}
	 * @param status {FaHttpStatusCode}
	 * @return {*}
	 */
	renderHtml(body, status = null) {
		return FaHttpResponse.create(body, status, this.contentType.html);
	}

	/**
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
 * @type {FaController}
 */
module.exports = FaController;
