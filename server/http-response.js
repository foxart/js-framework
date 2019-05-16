"use strict";
const FaHttpContentType = require("fa-nodejs/server/http-content-type");
const FaHttpStatusCode = require("fa-nodejs/server/http-status-code");

class FaServerHttpResponse {
	/**
	 *
	 * @param chunk {*}
	 * @param headers {object|string|null}
	 * @param status {number|null}
	 */
	constructor(chunk, headers = null, status = null) {
		this._FaHttpStatusCode = new FaHttpStatusCode();
		this._FaHttpContentType = new FaHttpContentType();
		// this.chunk = chunk ? chunk : "";
		// this.headers = {
		// 	"Content-Type": null
		// };
		// if (typeof headers === "string") {
		// 	this.headers["Content-Type"] = headers;
		// } else if (typeof headers === "object") {
		// 	this.headers = Object.assign({}, this.headers, headers);
		// }
		// this.status = status;
	}

	// * @param chunk {string|Buffer}
	/**
	 *
	 * @param chunk {Object|string|Buffer}
	 * @param type {FaHttpContentType}
	 * @param status {FaHttpStatusCode}
	 * @param headers {string|object|null}
	 */
	create(chunk, type = null, status = null, headers = {}) {
		let result = {chunk, type, status, headers};
		if (headers["content-type"]) {
			result.type = headers["content-type"];
		}
		if (!result.status) {
			result.status = this._FaHttpStatusCode.ok;
		}
		if (!result.headers) {
			result.headers = {};
		}
		return result;
	}

	check(response) {
		return !!(response && response.hasOwnProperty("chunk") && response.hasOwnProperty("type") && response.hasOwnProperty("status") && response.hasOwnProperty("headers"));
	}
}

/**
 *
 * @type {FaServerHttpResponse}
 */
module.exports = FaServerHttpResponse;

