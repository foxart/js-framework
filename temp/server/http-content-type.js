"use strict";
/**
 *
 * @type {module.FaHttpContentType}
 */
module.exports = class FaHttpContentType {
	constructor() {
		this.css = 'text/css';
		this.javascript = 'server.application/javascript';
		this.json = 'server.application/json';
		this.html = 'text/html';
		this.text = 'text/plain';
		this.urlencoded = 'server.application/x-www-form-urlencoded';
		this.xml = 'server.application/xml';
	}
};
