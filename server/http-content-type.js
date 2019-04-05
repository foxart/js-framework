"use strict";
const a = 1;

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
	}

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
		return contentType.indexOf(this.json) === 0;
	}

	checkMultipart(contentType) {
		return contentType.indexOf(this.multipart) === 0;
	}

	checkUrlencoded(contentType) {
		return contentType.indexOf(this.urlencoded) === 0;
	}

	checkXml(contentType) {
		return contentType.indexOf(this.xml) === 0;
	}
}

/**
 *
 * @type {FaServerHttpContentType}
 */
module.exports = FaServerHttpContentType;
