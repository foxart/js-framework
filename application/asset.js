"use strict";
/*fa*/
// const FaError = require("fa-nodejs/base/error");
// const FaFile = require("fa-nodejs/base/file");
// const FaTrace = require("fa-nodejs/base/trace");
const FaFileClass = require("fa-nodejs/base/file");
const FaHttpResponse = require("fa-nodejs/server/http-response");
const FaHttpContentType = require("fa-nodejs/server/http-content-type");
/*vars*/
let FaFile = new FaFileClass();

class FaAsset {
	get css() {
		return []
	}

	get js() {
		return []
	}

	get cssPath() {
		return process.cwd();
	}

	get cssUrl() {
		return "/";
	}

	get jsPath() {
		return process.cwd();
	}

	get jsUrl() {
		return "/";
	}

	getCssPath(css) {
		return `${this.cssPath}${css}`;
	}

	getCssUrl(css) {
		return `${this.cssUrl}${css}`;
	}

	getJsPath(css) {
		return `${this.jsPath}${css}`;
	}

	getJsUrl(item) {
		return `${this.jsUrl}${item}`;
	}

	readCss(file) {
		return FaHttpResponse.create(FaFile.readFileSync(this.getCssPath(file)), null, {"Content-Type": FaHttpContentType.css});
	}

	readJs(file) {
		return FaHttpResponse.create(FaFile.readFileSync(this.getJsPath(file)), null, {"Content-Type": FaHttpContentType.javascript});
	}
}

/**
 *
 * @type {FaAsset}
 */
module.exports = FaAsset;
