"use strict";
/*fa*/
// const FaError = require("fa-nodejs/base/error");
// const FaFile = require("fa-nodejs/base/file");
/** @member {FaTrace|Class} */
const FaTrace = require("fa-nodejs/base/trace");
const FaFileClass = require("fa-nodejs/base/file");
let FaFile = new FaFileClass();
/** @type {FaHttpResponse|Class} */
const FaHttpResponse = require("fa-nodejs/server/http-response");
const FaHttpContentType = require("fa-nodejs/server/http-content-type");

class FaAsset {
	get cssPath() {
		return process.cwd();
	}

	get cssUrl() {
		return "/";
	}

	get css() {
		return {}
	}

	getCssUrl(css) {
		return `${this.cssUrl}${css}`;
	}

	getCssPath(css) {
		return `${this.cssPath}${css}`;
	}

	read(file) {
		// return FaHttpResponse.create(FaFile.readFileSync(this.getCssPath(file)), null, {"Content-Type": FaHttpContentType.css});
		return FaHttpResponse.create(FaFile.readFileSync(this.getCssPath(file)), null);
	}
}

/**
 *
 * @type {FaAsset}
 */
module.exports = FaAsset;
