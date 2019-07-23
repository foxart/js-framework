/*https://mediatemple.net/community/products/dv/204403964/mime-types*/
"use strict";

class FaHttpContentType {
	// constructor() {
	// this.bin = "application/octet-stream";
	// this.cpp = "text/x-c++src";
	// this.css = "text/css";
	// this.javascript = "application/javascript";
	// this.json = "application/json";
	// this.html = "text/html";
	// this.multipart = "multipart/form-data";
	// this.text = "text/plain";
	// this.urlencoded = "application/x-www-form-urlencoded";
	// this.xml = "application/xml";
	// this._converter = new FaConverter();
	// }
	get bin() {
		return "application/octet-stream";
	}

	get cpp() {
		return "text/x-c++src";
	}

	get css() {
		return "text/css";
	}

	get javascript() {
		return "application/javascript";
	}

	get json() {
		return "application/json";
	}

	get html() {
		return "text/html";
	}

	get multipart() {
		return "multipart/form-data";
	}

	get text() {
		return "text/plain";
	}

	get urlencoded() {
		return "application/x-www-form-urlencoded";
	}

	get xml() {
		return "application/xml";
	}

	// todo remove
	/**
	 * @deprecated
	 * @param type
	 * @return {*}
	 */
	getType(type) {
		throw new Error("DEPRECATED");
		let result = type;
		Object.entries(this).map(function ([key, value]) {
			if (type === value) {
				result = key;
			}
		});
		return result;
	}

	/** @deprecated */
	checkJson(type) {
		if (type) {
			return type.indexOf(this.json) === 0;
		} else {
			return false;
		}
	}

	/** @deprecated */
	checkMultipart(type) {
		if (type) {
			return type.indexOf(this.multipart) === 0;
		} else {
			return false;
		}
	}

	/** @deprecated */
	checkUrlencoded(type) {
		if (type) {
			return type.indexOf(this.urlencoded) === 0;
		} else {
			return false;
		}
	}

	/** @deprecated */
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
