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
	static get bin() {
		return "application/octet-stream";
	}

	static get cpp() {
		return "text/x-c++src";
	}

	static get css() {
		return "text/css";
	}

	static get javascript() {
		return "application/javascript";
	}

	static get json() {
		return "application/json";
	}

	static get html() {
		return "text/html";
	}

	static get multipart() {
		return "multipart/form-data";
	}

	static get text() {
		return "text/plain";
	}

	static get textHtml() {
		return "text/html";
	}

	static get textXml() {
		return "text/xml";
	}

	static get urlencoded() {
		return "application/x-www-form-urlencoded";
	}

	static get xml() {
		return "application/xml";
	}
}

/**
 *
 * @type {FaHttpContentType|Class}
 */
module.exports = FaHttpContentType;
