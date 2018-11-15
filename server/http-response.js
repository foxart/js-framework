'use strict';
/**
 *
 * @type {module.FaServerHttpResponseClass}
 */
module.exports = class FaServerHttpResponseClass {
	/**
	 *
	 * @param data
	 * @param headers {object|string|null}
	 * @param status {number|null}
	 */
	constructor(data, headers = null, status = null) {
		this._content = data;
		this._headers = {};
		if (headers === null || typeof headers === 'string') {
			this._headers['Content-Type'] = headers;
		} else if (typeof headers === 'object') {
			this._headers = headers;
		}
		if (status) {
			this._status = status;
		}
	}

	/**
	 *
	 * @return {{content: *, headers: (*|Object|string), status: number}}
	 */
	get get() {
		return {
			content: this._content,
			headers: this._headers,
			status: this._status,
		};
	}
};
