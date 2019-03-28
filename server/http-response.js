"use strict";

class FaServerHttpResponse {
	/**
	 *
	 * @param content {*}
	 * @param headers {object|string|null}
	 * @param status {number|null}
	 */
	constructor(content, headers = null, status = null) {
		this.content = content ? content : "";
		this.headers = {
			"Content-Type": null
		};
		if (typeof headers === "string") {
			this.headers["Content-Type"] = headers;
		} else if (typeof headers === "object") {
			this.headers = Object.assign({}, this.headers, headers);
		}
		this.status = status;
	}
}

/**
 *
 * @type {FaServerHttpResponse}
 */
module.exports = FaServerHttpResponse;

