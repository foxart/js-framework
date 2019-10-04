/*https://nodejs.org/api/http.html#http_class_http_clientrequest*/
"use strict";
/*node*/
/** @type {module:http} */
const Http = require('http');
/** @type {module:https} */
const Https = require('https');
/*fa*/
const FaBaseAdapter = require("fa-nodejs/base/adapter");
const FaError = require("fa-nodejs/base/error");
const FaTrace = require("fa-nodejs/base/trace");
const FaHttpHeaders = require("fa-nodejs/server/http-headers");
const FaHttpContentType = require("fa-nodejs/server/http-content-type");
const FaHttpResponse = require("fa-nodejs/server/http-response");
const FaHttpStatusCode = require("fa-nodejs/server/http-status-code");
const FaConverter = require("fa-nodejs/base/converter");
// const Dns = require('dns');
// function checkHost(options) {
// 	return new Promise(function (resolve, reject) {
// 		// Dns.lookup('test', function (error) {
// 		Dns.lookup(options['request']['hostname'], function (error) {
// 			if (error === null) {
// 				resolve(true);
// 			} else {
// 				reject(error);
// 			}
// 		});
// 	});
// }
class FaCurl {
	/**
	 *
	 * @param options {Object|null}
	 */
	constructor(options = {}) {
		this._StatusCode = new FaHttpStatusCode();
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
				path: function () {
					return this["path"] ? this["path"] : "/";
				},
				auth: function () {
					return this["auth"] ? this["auth"] : null;
				},
				method: function () {
					return this["method"] ? this["method"].toLowerCase() : "get";
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

	get options() {
		return this._options;
	}

	set options(options) {
		// console.error("SET");
		this._options = this._adapter.apply(options);
	}

	set hostname(hostname) {
		this._options.hostname = hostname ? hostname : "localhost";
	}

	set port(port) {
		this._options.port = port ? port : this["protocol"] === "https" ? 443 : 80;
	}

	set path(path) {
		this._options.path = path ? path : "/";
	}

	set method(method) {
		this._options.method = method ? method.toLowerCase() : "get";
	}

	set headers(headers) {
		this._options.headers = headers ? headers : {};
	}

	static _dataToType(data, type) {
		let result;
		if (data instanceof Buffer) {
			result = data;
		} else if (data instanceof String) {
			result = data;
		} else {
			type = type ? type : "";
			// if (type.indexOf(FaHttpContentType.multipart) === 0) {
			// ({files, post: result} = this.parseMultipart(data));
			// } else
			if (type.includes(FaHttpContentType.json)) {
				result = FaConverter.toJson(data);
			} else if (type.includes(FaHttpContentType.xml)) {
				result = FaConverter.toXml(data);
			} else if (type.includes(FaHttpContentType.textXml)) {
				result = FaConverter.toTextXml(data);
			} else if (type.includes(FaHttpContentType.urlencoded)) {
				result = FaConverter.toUrlEncoded(data);
			} else {
				result = data.toString();
			}
		}
		return result ? result : null;
	}

	static _dataFromType(data, type) {
		let result;
		if (data instanceof Buffer) {
			result = data;
		} else if (data instanceof String) {
			result = data;
		} else {
			type = type ? type : "";
			// if (type.indexOf(FaHttpContentType.multipart) === 0) {
			// ({files, post: result} = this.parseMultipart(data));
			// } else
			if (type.includes(FaHttpContentType.json)) {
				result = FaConverter.fromJson(data);
			} else if (type.includes(FaHttpContentType.xml)) {
				result = FaConverter.fromXml(data);
			} else if (type.includes(FaHttpContentType.textXml)) {
				result = FaConverter.fromXml(data);
			} else if (type.includes(FaHttpContentType.urlencoded)) {
				result = FaConverter.fromUrlEncoded(data);
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

	async execute(data = null, options = null) {
		let self = this;
		let trace = FaTrace.trace(1);
		let opts = {
			hostname: this.options.hostname,
			port: this.options.port,
			method: this.options.method,
			auth: this.options.auth,
			path: this.options.path,
			headers: this.options.headers,
			encoding: this.options.encoding,
		};
		return new Promise(function (resolve, reject) {
			// let opts = Object.assign(self.options, options);
			// console.info("curl", opts);
			let body;
			if (["patch", "post", "put"].has(self.options.method)) {
				body = FaCurl._dataToType(data, FaHttpHeaders.getValue("Content-Type", [opts.headers, {"content-type": opts.headers["accept"]}]));
				// console.log(FaHttpHeaders.getValue("Content-Type", [opts.headers, {"content-type": opts.headers["accept"]}]));
				// console.log(data, body);
			} else {
				opts.path = `${opts.path}?${FaConverter.toUrlEncoded(data)}`;
			}
			// let enc = FaConverter.toUrlEncoded({a: "раз", b: [1, "два"]});
			// let dec = FaConverter.fromUrlEncoded(enc);
			// console.info(enc, dec);
			/**
			 *
			 */

			let req = self.options.protocol === "https" ? Https.request(opts) : Http.request(opts);
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
					// console.error("body", body);
					// log(body);
					let data = FaCurl._dataFromType(body, FaHttpHeaders.getValue("content-type", [res.headers, {"content-type": opts.headers["accept"]}]));
					// console.log(3, FaHttpHeaders.getValue("content-type", [res.headers, {"content-type": curl.headers["accept"]}]));
					resolve(FaHttpResponse.create(data, res.statusCode, res.headers));
				});
			});
			req.on("error", function (e) {
				console.error(e);
				reject(e);
			});
			req.end();
		}).catch(function (e) {
			// console.error(e);
			throw new FaError(e).setTrace(trace);
		});
	}
}

/** @class {FaCurl} */
module.exports = FaCurl;
