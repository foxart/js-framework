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
					Request.write(Querystring.stringify(data));
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
				console.info(Response.headers);
				console.info(Response.statusCode);
				Response.setEncoding(self.options.encoding);
				let body = "";
				Response.on("data", function (chunk) {
					body += chunk;
				});
				Response.on("end", function () {
					resolve(body);
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
