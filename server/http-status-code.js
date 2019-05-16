"use strict";

class FaHttpStatusCode {
	constructor() {
		//http
		this.badRequest = 400;
		this.forbidden = 403;
		this.found = 302;
		this.internalServerError = 500;
		this.movedPermanently = 301;
		this.notFound = 404;
		this.notImplemented = 501;
		this.ok = 200;
		this.unauthorized = 401;
		//api
		this.apiGet = 200;
		this.apiDelete = 204;
		this.apiPatch = 202;
		this.apiPost = 201;
		this.apiPut = 200;
	}
}

/**
 *
 * @type {FaHttpStatusCode}
 */
module.exports = FaHttpStatusCode;
