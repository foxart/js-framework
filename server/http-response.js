"use strict";

class FaHttpResponse {
	/**
	 *
	 * @param body {Buffer|Object|String|null}
	 * @param status {FaHttpStatusCode|number|null}
	 * @param headers {Object|String|null}
	 * @param type {String|null} layout
	 * @returns {{headers: {}, body: (string|*), type: *, status: number}}
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
		if (headers) {
			if (typeof headers === "string") {
				result.headers["Content-Type"] = headers;
			} else if (typeof headers === "object") {
				result.headers = headers;
			}
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

	/**
	 * @param location {string|null}
	 * @return {*}
	 */
	redirect(location = null) {
		console.info(location);
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
		return FaHttpResponse.create(null, status, Object.assign(headers, {
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

/** @class {FaHttpResponse} */
module.exports = FaHttpResponse;

