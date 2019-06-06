"use strict";

class FaHttpResponse {
	// constructor() {
	// }
	// noinspection JSMethodCanBeStatic
	/**
	 *
	 * @param body {Object|string|Buffer}
	 * @param type {FaHttpContentType}
	 * @param status {FaHttpStatusCode}
	 * @param headers {string|object|null}
	 */
	create(body, type = null, status = null, headers = {}) {
		let result = {body, type, status, headers};
		console.warn(result);
		if (result.headers && result.headers["content-type"]) {
			result.type = headers["content-type"];
		}
		if (!result.status) {
			result.status = 200;
		}
		if (!result.headers) {
			result.headers = {};
		}
		return result;
	}

	/**
	 *
	 * @param body {Buffer|Object|String|null}
	 * @param status {FaHttpStatusCode}
	 * @param headers {Object|String|null}
	 * @param type {String|null}
	 */
	static createNew(body = null, status = null, headers = null, type = null) {
		let result = {body, status, headers, type};
		// console.warn(result);
		// if (result.headers && result.headers["content-type"]) {
		// 	result.type = headers["content-type"];
		// }
		if (!result.status) {
			result.status = 200;
		}
		if (!result.headers) {
			result.headers = {};
		}
		if (!result.headers["Content-Type"]) {
			result.headers["Content-Type"] = null;
		}
		return result;
	}

	static check(response) {
		return !!(
			response
			&& response.hasOwnProperty("body")
			&& response.hasOwnProperty("type")
			&& response.hasOwnProperty("status")
			&& response.hasOwnProperty("headers")
		);
	}
}

/**
 *
 * @type {FaHttpResponse}
 */
module.exports = FaHttpResponse;

