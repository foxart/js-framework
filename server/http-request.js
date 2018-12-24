"use strict";
const HttpHeadersContentTypeModule = require("./http-content-type");
/**
 *
 * @type {module.FaHttpRequestClass}
 */
module.exports = class FaHttpRequestClass {
	/**
	 *
	 * @param configuration
	 * @param method
	 * @param headers
	 * @param url
	 * @param body
	 * @return {{path: string, headers: *, request: {}, input: *, method: string, post, get}}
	 */
	constructor(configuration, method, headers, url, body) {
		this._FaConverterClass = require('../base/converter')(configuration);
		this._FaHeadersContentType = new HttpHeadersContentTypeModule();
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
	 * @return {module.FaHttpContentType}
	 * @private
	 */
	get _contentType() {
		return this._FaHeadersContentType;
	}

	/**
	 *
	 * @param method
	 * @param headers
	 * @param url
	 * @param body
	 * @return {{path: string, headers: *, request: {}, input: *, method: string, post, get}}
	 */
	format(method, headers, url, body) {
		let get = {};
		let post = {};
		if (url.query) {
			get = this._converter.fromUrlEncoded(url.query);
		}
		if (["PATCH", "POST", "PUT"].hasElement(method)) {
			switch (headers['content-type']) {
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
		return {
			path: url.pathname,
			method: method.toLowerCase(),
			headers: headers,
			get: get,
			post: post,
			// request: (typeof get === 'object' && typeof post === 'object') ? Object.assign({}, get, post) : {},
			request: (typeof get === 'object' || typeof post === 'object') ? Object.assign({}, get, post) : {},
			input: body,
		};
	}
};

