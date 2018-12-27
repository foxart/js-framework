"use strict";
/**
 *
 * @type {module.FaHttpContentType}
 */
module.exports = class FaHttpContentType {
	constructor() {
		this.css = 'text/css';
		this.javascript = 'application/javascript';
		this.json = 'application/json';
		this.html = 'text/html';
		this.text = 'text/plain';
		this.urlencoded = 'application/x-www-form-urlencoded';
		this.xml = 'application/xml';
	}
};