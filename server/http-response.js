"use strict";
/**
 *
 * @type {module.FaHttpResponseClass}
 */
module.exports = class FaHttpResponseClass {
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
};

