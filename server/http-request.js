"use strict";
const Cookie = require("cookie");
const Url = require("url");
/*fa*/
const FaServerHttpContentTypeClass = require("fa-nodejs/server/http-content-type");

class FaHttpRequestClass {
	/**
	 *
	 * @param conf
	 * @param method
	 * @param headers
	 * @param url
	 * @param body
	 * @return {{path: string, headers: *, request: {}, input: *, method: string, post, get}}
	 */
	constructor(conf, method, headers, url, body) {
		this._FaConverterClass = require("fa-nodejs/base/converter")(conf);
		this._FaServerHttpContentType = new FaServerHttpContentTypeClass();
	}

	/**
	 *
	 * @return {FaConverterClass}
	 * @private
	 */
	get _converter() {
		return this._FaConverterClass;
	}

	/**
	 *
	 * @return {FaServerHttpContentType}
	 * @private
	 */
	get _contentType() {
		return this._FaServerHttpContentType;
	}

	/**
	 *
	 * @param req
	 * @param body
	 * @return {{path: string, headers: *, input: *, method: string, post, cookie, get}}
	 */
	formatRequest(req, body) {
		// req.method, req.headers, Url.parse(req.url)
		let ip = (req.headers['x-forwarded-for'] || '').split(',').pop() ||
			req.connection.remoteAddress ||
			req.socket.remoteAddress ||
			req.connection.socket.remoteAddress;
		let url = Url.parse(req.url);
		let get = {};
		let post = {};
		let cookie = {};
		let client = {
			ip: (req.headers['x-forwarded-for'] || '').split(',').pop() ||
				req.connection.remoteAddress ||
				req.socket.remoteAddress ||
				req.connection.socket.remoteAddress
		};
		if (url.query) {
			get = this._converter.fromUrlEncoded(url.query);
		}
		if (["PATCH", "POST", "PUT"].has(req.method)) {
			switch (req.headers["content-type"]) {
				case this._contentType.json:
					post = this._converter.fromJson(body);
					break;
				case this._contentType.xml:
					post = this._converter.fromXml(body);
					break;
				case this._contentType.urlencoded:
					post = this._converter.fromUrlEncoded(body);
					break;
				default:
					post = body;
			}
		}
		if (req.headers["cookie"]) {
			cookie = Cookie.parse(req.headers["cookie"]);
		}
		return {
			client: client,
			headers: req.headers,
			method: req.method.toLowerCase(),
			path: url.pathname,
			get: get,
			post: post,
			cookie: cookie,
			// request: (typeof get === "object" && typeof post === "object") ? Object.assign({}, get, post) : {},
			input: body,
		};
	}
}

/**
 *
 * @type {FaHttpRequestClass}
 */
module.exports = FaHttpRequestClass;
