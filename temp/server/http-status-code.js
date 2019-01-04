"use strict";
/**
 *
 * @type {module.FaHttpStatusCode}
 */
module.exports = class FaHttpStatusCode {
	constructor() {
		//Http
		this.badRequest = 400;
		this.internalServerError = 500;
		this.notFound = 404;
		this.notImplemented = 501;
		this.ok = 200;
		//api
		this.apiGet = 200;
		this.apiDelete = 204;
		this.apiPatch = 202;
		this.apiPost = 201;
		this.apiPut = 200;
	}
};