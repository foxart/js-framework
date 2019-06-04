"use strict";

class FaServerHttpResponse {
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

	// noinspection JSMethodCanBeStatic
	check(response) {
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
 * @type {FaServerHttpResponse}
 */
module.exports = FaServerHttpResponse;

