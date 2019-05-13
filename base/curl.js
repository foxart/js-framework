"use strict";
/*node*/
const Dns = require('dns');
const Http = require('http');
const Https = require('https');
const Querystring = require('querystring');
// const UtilsExtend = require('utils-extend');
/*fa*/
const FaBaseAdapter = require("fa-nodejs/base/adapter");
const FaError = require("fa-nodejs/base/error");
const FaTrace = require("fa-nodejs/base/trace");
const FaHttpResponse = require("fa-nodejs/server/http-response");
const FaHttpContentType = require("fa-nodejs/server/http-content-type");
const FaConverter = require("fa-nodejs/base/converter");

/**
 *
 * @param options
 * @returns {Promise}
 */
function checkHost(options) {
	return new Promise(function (resolve, reject) {
		// Dns.lookup('test', function (error) {
		Dns.lookup(options['request']['hostname'], function (error) {
			if (error === null) {
				resolve(true);
			} else {
				reject(error);
			}
		});
	});
}

/**
 *
 * @type {{path: string, headers: {}, protocol: string, hostname: string, method: string, port: number, encoding: string, timeout: number}}
 */
/**
 *
 */
class FaBaseCurl {
	/**
	 *
	 * @param options {{path: string, headers: {}, protocol: string, hostname: string, method: string, port: number, encoding: string, timeout: number}}
	 */
	constructor(options = {}) {
		this._trace = FaTrace.trace(1);
		this._FaHttpResponse = new FaHttpResponse();
		this._ContentType = new FaHttpContentType();
		this._Converter = new FaConverter();
		this.options = options;
	}

	/**
	 *
	 * @return {FaBaseAdapter}
	 * @private
	 */
	get _adapter() {
		if (!this._FaBaseAdapter) {
			this._FaBaseAdapter = new FaBaseAdapter({
				protocol: function () {
					if (this["protocol"]) {
						return this["protocol"].toLowerCase() === "https" ? "https" : "http";
					} else {
						return "http";
					}
				},
				hostname: function () {
					return this["hostname"] ? this["hostname"] : "localhost"
				},
				port: function () {
					if (this["port"]) {
						return this["port"];
					} else {
						return this["protocol"] === "https" ? 443 : 80;
					}
				},
				path: `["path"]`,
				method: function () {
					if (this["method"]) {
						return this["method"].toLowerCase();
					} else {
						return "get";
					}
				},
				headers: function () {
					return this["headers"] ? this["headers"] : {}
				},
				encoding: function () {
					return this["encoding"] ? this["encoding"] : "utf8" //utf8, binary
				},
				timeout: function () {
					return this["timeout"] ? this["timeout"] : 5000
				},
			});
		}
		return this._FaBaseAdapter;
	}

	get options() {
		// console.error("GET");
		return this._options;
	};

	set options(options) {
		// console.error("SET");
		this._options = this._adapter.apply(options);
	}

	dataFromType(body, type) {
		let result;
		if (type) {
			if (this._ContentType.checkJson(type)) {
				result = this._Converter.fromJson(body);
			} else if (this._ContentType.checkXml(type)) {
				result = this._Converter.fromXml(body);
			} else if (this._ContentType.checkUrlencoded(type)) {
				console.error(body, type);
				result = this._Converter.fromUrlEncoded(body);
			} else {
				result = body;
			}
		} else {
			if (this._Converter.isJson(body)) {
				result = this._Converter.fromJson(body);
			} else if (this._Converter.isXml(body)) {
				result = this._Converter.fromXml(body);
			} else if (this._Converter.checkUrlEncoded(type)) {
				console.error(type, body, "XXX");
				result = this._Converter.fromUrlEncoded(body);
			} else {
				result = body;
			}
		}
		return result;
	}

	async execute(data) {
		let self = this;
		let request = {
			hostname: this.options.hostname,
			port: this.options.port,
			method: this.options.method,
			path: this.options.path,
			headers: this.options.headers,
			encoding: this.options.encoding,
		};
		// checkHost(model).then(function () {
		return new Promise(function (resolve, reject) {
			let Request = self.options.protocol === "https" ? Https.request(request) : Http.request(request);
			if (data && ["patch", "post", "put"].has(self.options.method)) {
				if (typeof data === "string") {
					Request.write(data);
				} else {
					// console.warn([data]);
					// Request.write(Querystring.stringify(data));
					Request.write(self._Converter.toUrlencoded(data));
				}
			}
			Request.on("socket", function (Socket) {
				// self.options.timeout = 1;
				Socket.setTimeout(self.options.timeout);
				Socket.on("timeout", function () {
					Request.abort();
					reject(new FaError(`curl request timeout: ${self.options.timeout}`).setTrace(self._trace));
				});
			});
			Request.on("response", function (Response) {
				Response.setEncoding(self.options.encoding);
				let body = "";
				Response.on("data", function (chunk) {
					body += chunk;
				});
				Response.on("end", function () {
					let data = self.dataFromType(body, Response.headers["content-type"]);
					// console.info(body, Response.headers["content-type"], data);
					// console.warn(self.dataFromType("body", Response.headers["content-type"]));
					// console.warn(Response.headers["content-type"], body, self.dataFromType(body, Response.headers["content-type"]));
					// console.info(Response.statusCode);
					let result = self._FaHttpResponse.create(data, Response.headers["content-type"], Response.statusCode, Response.headers);
					resolve(result);
				});
			});
			Request.on("error", function (e) {
				reject(new FaError(e));
			});
			Request.end();
		});
	}
}

/**
 *
 * @type {FaBaseCurl}
 */
module.exports = FaBaseCurl;
