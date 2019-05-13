"use strict";
/*fa*/
const FaConverter = require("fa-nodejs/base/converter");

class FaServerHttpContentType {
	// https://mediatemple.net/community/products/dv/204403964/mime-types
	constructor() {
		this.bin = "application/octet-stream";
		this.cpp = "text/x-c++src";
		this.css = "text/css";
		this.javascript = "application/javascript";
		this.json = "application/json";
		this.html = "text/html";
		this.multipart = "multipart/form-data";
		this.text = "text/plain";
		this.urlencoded = "application/x-www-form-urlencoded";
		this.xml = "application/xml";
		this._FaConverter = new FaConverter();
	}

	// todo remove
	/**
	 *
	 * @param contentType
	 * @return {*}
	 */
	getType(contentType) {
		let result = contentType;
		Object.entries(this).map(function ([key, value]) {
			if (contentType === value) {
				result = key;
			}
		});
		return result;
	}

	checkJson(contentType) {
		if (contentType) {
			return contentType.indexOf(this.json) === 0;
		} else {
			return false;
		}
	}

	checkMultipart(contentType) {
		if (contentType) {
			return contentType.indexOf(this.multipart) === 0;
		} else {
			return false;
		}
	}

	checkUrlencoded(contentType) {
		if (contentType) {
			return contentType.indexOf(this.urlencoded) === 0;
		} else {
			return false;
		}
	}

	checkXml(contentType) {
		if (contentType) {
			return contentType.indexOf(this.xml) === 0;
		} else {
			return false;
		}
	}

	/**
	 *
	 * @param data
	 * @param type
	 */
	convertToType(data, type) {
		let result;
		switch (type) {
			case this.json:
				result = this._FaConverter.toJson(data);
				break;
			case this.html:
				result = this._FaConverter.toHtml(data);
				break;
			case this.urlencoded:
				result = this._FaConverter.toUrlencoded(data);
				// console.error(data, result);
				break;
			case this.xml:
				result = this._FaConverter.toXml(data);
				break;
			default:
				result = data;
		}
		// console.error([data, type, result]);
		return result;
	}
}

/**
 *
 * @type {FaServerHttpContentType}
 */
module.exports = FaServerHttpContentType;
