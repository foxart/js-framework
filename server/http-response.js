"use strict";

class FaHttpResponse {
	/**
	 *
	 * @param body {Buffer|Object|String|null}
	 * @param status {FaHttpStatusCode|number|null}
	 * @param headers {Object|String|null}
	 * @param type {String|null}
	 */
	static create(body = null, status = null, headers = null, type = null) {
		let result = {
			// body: body === null || body === undefined ? "" : body,
			body: body === null ? "" : body,
			status: 200,
			headers: {},
			type: type,
		};
		if (status) {
			result.status = status;
		}
		if (headers && typeof headers === "string") {
			result.headers["Content-Type"] = headers;
		} else if (headers && typeof headers === "object") {
			result.headers = headers;
		}
		// console.info(result);
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
 * @type {FaHttpResponse|Class}
 */
module.exports = FaHttpResponse;

