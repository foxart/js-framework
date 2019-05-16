"use strict";
/*node*/
const Dns = require('dns');
const Http = require('http');
const Https = require('https');
// const Querystring = require('querystring');
// const UtilsExtend = require('utils-extend');
/*fa*/
const FaBaseAdapter = require("fa-nodejs/base/adapter");
const FaError = require("fa-nodejs/base/error");
const FaTrace = require("fa-nodejs/base/trace");
// const FaHttpResponse = require("fa-nodejs/server/http-response");
const FaHttpContentType = require("fa-nodejs/server/http-content-type");
const FaHttpStatusCode = require("fa-nodejs/server/http-status-code");
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
		this._ContentType = new FaHttpContentType();
		this._StatusCode = new FaHttpStatusCode();
		this._FaConverter = new FaConverter();
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
					return this["encoding"] ? this["encoding"] : null //utf8, binary, null (buffer)
				},
				timeout: function () {
					return this["timeout"] ? this["timeout"] : 5000
				},
			});
		}
		return this._FaBaseAdapter;
	}

	/**
	 *
	 * @return {FaBaseConverter}
	 * @private
	 */
	get _converter() {
		return this._FaConverter
	}

	get options() {
		// console.error("GET");
		return this._options;
	};

	set options(options) {
		// console.error("SET");
		this._options = this._adapter.apply(options);
	}

	_dataToType(data, type) {
		let result;
		if (data instanceof Buffer) {
			result = data;
		} else if (data instanceof String) {
			result = data;
		} else {
			type = type ? type : "";
			// if (type.indexOf(this._ContentType.multipart) === 0) {
			// ({files, post: result} = this.parseMultipart(data));
			// } else
			if (type.includes(this._ContentType.json)) {
				result = this._converter.toJson(data);
			} else if (type.includes(this._ContentType.xml)) {
				result = this._converter.toXml(data);
			} else if (type.includes(this._ContentType.urlencoded)) {
				result = this._converter.toUrlEncoded(data);
			} else {
				result = data.toString();
			}
		}
		return result ? result : null;
	}

	_dataFromType(data, type) {
		let result;
		if (data instanceof Buffer) {
			result = data;
		} else if (data instanceof String) {
			result = data;
		} else {
			type = type ? type : "";
			// if (type.indexOf(this._ContentType.multipart) === 0) {
			// ({files, post: result} = this.parseMultipart(data));
			// } else
			if (type.includes(this._ContentType.json)) {
				result = this._converter.fromJson(data);
			} else if (type.includes(this._ContentType.xml)) {
				result = this._converter.fromXml(data);
			} else if (type.includes(this._ContentType.urlencoded)) {
				result = this._converter.fromUrlEncoded(data);
			} else {
				result = data;
			}
		}
		return result ? result : null;
	}

	_createResponse(body, type = null, status = null, headers = null) {
		let result = {body, type, status, headers};
		if (result.headers && result.headers["content-type"]) {
			result.type = headers["content-type"];
		}
		if (!result.status) {
			result.status = this._StatusCode.ok;
		}
		if (!result.headers) {
			result.headers = {};
		}
		return result;
	}

	async execute(data) {
		let self = this;
		let trace = FaTrace.trace(1);
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
			let body;
			if (["patch", "post", "put"].has(self.options.method)) {
				body = self._dataToType(data, request.headers["content-type"] || request.headers["accept"]);
				// console.warn(request.headers, data, body);
			} else {
				request.path = `${request.path}?${self._converter.toUrlEncoded(data)}`;
			}
			let req = self.options.protocol === "https" ? Https.request(request) : Http.request(request);
			if (body) {
				req.write(body);
			}
			req.on("socket", function (Socket) {
				// self.options.timeout = 1;
				Socket.setTimeout(self.options.timeout);
				Socket.on("timeout", function () {
					req.abort();
					reject(`curl request timeout: ${self.options.timeout}`);
				});
			});
			req.on("response", function (res) {
				let body = "";
				res.setEncoding(self.options.encoding);
				res.on("data", function (chunk) {
					body += chunk;
				});
				res.on("end", function () {
					let data = self._dataFromType(body, request.headers["accept"] || res.headers["content-type"]);
					// console.warn(res.headers, data, body);
					resolve(self._createResponse(data, res.headers["content-type"], res.statusCode, res.headers));
				});
			});
			req.on("error", function (e) {
				console.error(self.options);
				reject(e);
			});
			req.end();
		}).catch(function (e) {
			// console.error(e);
			throw new FaError(e).setTrace(trace);
		});
	}
}

/**
 *
 * @type {FaBaseCurl}
 */
module.exports = FaBaseCurl;
