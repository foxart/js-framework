"use strict";
// /*fa*/
// const FaConverter = require("fa-nodejs/base/converter");
class FaHttpContentType {
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
		// this._converter = new FaConverter();
	}

	// todo remove
	/**
	 *
	 * @param type
	 * @return {*}
	 */
	getType(type) {
		let result = type;
		Object.entries(this).map(function ([key, value]) {
			if (type === value) {
				result = key;
			}
		});
		return result;
	}

	checkJson(type) {
		if (type) {
			return type.indexOf(this.json) === 0;
		} else {
			return false;
		}
	}

	checkMultipart(type) {
		if (type) {
			return type.indexOf(this.multipart) === 0;
		} else {
			return false;
		}
	}

	checkUrlencoded(type) {
		if (type) {
			return type.indexOf(this.urlencoded) === 0;
		} else {
			return false;
		}
	}

	checkXml(type) {
		if (type) {
			return type.indexOf(this.xml) === 0;
		} else {
			return false;
		}
	}
}

/**
 *
 * @type {FaHttpContentType}
 */
module.exports = FaHttpContentType;
