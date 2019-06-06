"use strict";
/*modules*/
const Buffer = require("buffer").Buffer;
const Http = require("http");
const Https = require("https");
/** @member {Class} */
const MimeTypes = require("mime-types");
/*fa*/
const FaError = require("fa-nodejs/base/error");
/** @member {Class|FaTrace} */
const FaTrace = require("fa-nodejs/base/trace");
const FaBaseFile = require("fa-nodejs/base/file");
const FaConsoleColor = require("fa-nodejs/console/console-helper");
const FaBaseConverter = require("fa-nodejs/base/converter");
const FaHttpRequestClass = require("fa-nodejs/server/http-request");
/** @member {Class|FaHttpResponse}*/
const FaHttpResponse = require("fa-nodejs/server/http-response");
const FaHttpContentType = require("./http-content-type");
const FaHttpStatusCode = require("./http-status-code");
const FaBaseRouter = require("fa-nodejs/base/router");
const FaHttpConfiguration = require("fa-nodejs/server/http-configuration");

class FaServerHttp {
	constructor(configuration) {
		// this._FaHttpConfiguration = require("./http-configuration")(configuration);
		this.Configuration = configuration;
		this._FaConverter = new FaBaseConverter(this.Configuration.converter);
		// console.info(configuration);
		this._FaFile = new FaBaseFile(this.Configuration.path);
		this._FaFilePrivate = new FaBaseFile(this.Configuration.private);
		this._FaRouter = new FaBaseRouter(this);
		this._FaAssetRouter = new FaBaseRouter(this);
		this._FaHttpRequest = new FaHttpRequestClass(this.Configuration.converter);
		this._FaHttpResponse = FaHttpResponse;
		this._FaHttpContentType = new FaHttpContentType();
		this._FaHttpStatusCode = new FaHttpStatusCode();
		// this.HttpServer = this._createHttp(this.Configuration);
		this.HttpServer = this._createHttp(this.Configuration);
		this._trace = FaTrace.trace(1);
	}

	/**
	 *
	 * @return {{protocol: string, host: string, port: number, path: string, converter: {}}}
	 * @constructor
	 */
	get Configuration() {
		return this._FaHttpConfiguration;
	}

	/**
	 *
	 * @param configuration
	 * @constructor
	 */
	set Configuration(configuration) {
		this._FaHttpConfiguration = new FaHttpConfiguration(configuration);
	}

	/**
	 *
	 * @return {FaBaseConverter}
	 * @constructor
	 */
	get _converter() {
		return this._FaConverter;
	}

	/**
	 *
	 * @return {FaHttpRequestClass}
	 * @private
	 */
	get _parser() {
		return this._FaHttpRequest;
	}

	/**
	 *
	 * @return {FaBaseFile}
	 * @constructor
	 */
	get File() {
		return this._FaFile;
	}

	get FilePrivate() {
		return this._FaFilePrivate;
	}

	/**
	 *
	 * @return {FaRouterClass}
	 */
	get Router() {
		return this._FaRouter;
	}

	/**
	 *
	 * @return {FaRouterClass}
	 */
	get Assets() {
		return this._FaAssetRouter;
	}

	/**
	 *
	 * @return {FaHttpContentType}
	 */
	get type() {
		return this._FaHttpContentType;
	}

	/**
	 *
	 * @return {FaHttpStatusCode}
	 */
	get status() {
		return this._FaHttpStatusCode;
	}

	/**
	 *
	 * @param configuration
	 * @return {Server}
	 * @private
	 */
	_createHttp(configuration) {
		let self = this;
		if (this.Configuration.protocol === "https") {
			const options = {
				key: this.FilePrivate.readFileSync("ssl/server.key"),
				cert: this.FilePrivate.readFileSync("ssl/server.cert")
			};
			Https.createServer(options, function (req, res) {
				self._listenHttp(req, res);
			}).listen(configuration.port, function () {
				console.log(`FaHttp ${FaConsoleColor.effect.bold}${FaConsoleColor.color.green}\u2714${FaConsoleColor.effect.reset} {protocol}://{host}:{port} <{path}>`.replaceAll(Object.keys(configuration).map(function (key) {
					return `{${key}}`;
				}), Object.values(configuration)));
			});
		} else {
			Http.createServer(function (req, res) {
				self._listenHttp(req, res);
			}).listen(configuration.port, function () {
				console.log(`FaHttp ${FaConsoleColor.effect.bold}${FaConsoleColor.color.green}\u2714${FaConsoleColor.effect.reset} {protocol}://{host}:{port} <{path}>`.replaceAll(Object.keys(configuration).map(function (key) {
					return `{${key}}`;
				}), Object.values(configuration)));
			});
		}
		// return _HttpsServer;
	}

	/**
	 *
	 * @param req
	 * @param res
	 * @private
	 */
	_listenHttp(req, res) {
		let self = this;
		let body = "";
		req.on("data", function (chunk) {
			body += chunk;
		});
		req.on("error", function (error) {
			console.error(error);
		});
		req.on("end", function () {
			// console.log(req.headers, req.url, body);
			let url = self._parser.parseUrl(req.url);
			let post = null;
			let files = null;
			let type = req.headers["content-type"] || req.headers["accept"] || "";
			if (["patch", "post", "put"].has(req.method.toLowerCase())) {
				if (type.includes(self.type.multipart)) {
					({files, post} = self._parser.parseMultipart(body));
				} else if (type.includes(self.type.json)) {
					post = self._converter.fromJson(body);
				} else if (type.includes(self.type.xml)) {
					post = self._converter.fromXml(body);
				} else if (type.includes(self.type.urlencoded)) {
					post = self._converter.fromUrlEncoded(body);
				} else {
					post = body;
				}
			}
			let request = {
				client: self._parser.parseClient(req),
				headers: req.headers,
				method: req.method.toLowerCase(),
				path: url.pathname,
				get: url.query ? self._converter.fromUrlEncoded(url.query) : null,
				post: post,
				files: files,
				cookies: req.headers["cookie"] ? self._parser.parseCookie(req.headers["cookie"]) : null,
				// request: (typeof get === "object" && typeof post === "object") ? Object.assign({}, get, post) : {},
				// input: body,
			};
			self._handleRequest(request).then(function (response) {
				// console.warn(response);
				// if (response["body"] === null) {
				// 	response["body"] = "";
				// }
				/*todo make proper content-type and|or charset extractor*/
				// let contentType = response["headers"]["Content-Type"] || req.headers["accept"] || req.headers["content-type"] || "undefined";
				let contentType = self._getResponseContentType(response["headers"]["Content-Type"] || req.headers["accept"] || req.headers["content-type"]);
				// console.error(response);
				// console.warn(response["headers"]["Content-Type"], req.headers["accept"], req.headers["content-type"]);
				// console.error([contentType]);
				// let a = Buffer.from([1, 2]);
				// let b = {};
				// console.error(!(a instanceof Buffer));
				// console.error(!(b instanceof Buffer));
				if (contentType && !(response["body"] instanceof Buffer)) {
					console.message(contentType);
					if (contentType.includes(self.type.json)) {
						response["body"] = self._converter.toJson(response["body"]);
					} else if (contentType.includes(self.type.html)) {
						response["body"] = self._converter.toHtml(response["body"]);
					} else if (contentType.includes(self.type.urlencoded)) {
						response["body"] = self._converter.toUrlEncoded(response["body"]);
					} else if (contentType.includes(self.type.xml)) {
						response["body"] = self._converter.toXml(response["body"]);
					} else if (contentType.includes(self.type.text)) {
						response["body"] = self._converter.toText(response["body"]);
					} else if (response["body"] instanceof Buffer === false) {
						/*default converter*/
						response["body"] = response["body"].toString();
					}
				}
				log(response["body"]);
				Object.entries(response["headers"]).map(function ([key, value]) {
					if (key === "Content-Type") {
						// console.error(`${key}: ${value}`, contentType);
						// 	// res.setHeader("content-type", `${data["type"]}; charset=utf8`);
						res.setHeader("content-type", contentType);
					} else {
						res.setHeader(key, value);
					}
				});
				// console.message("---");
				if (response["status"]) {
					res.statusCode = response["status"];
				}
				if (response["body"] instanceof Buffer) {
					res.setHeader("content-length", response["body"].byteLength);
				} else {
					res.setHeader("content-length", Buffer.from(response["body"]).byteLength);
				}
				res.write(response["body"]);
				res.end();
			});
		});
	};

	_getResponseContentType(contentType, reqAcceptType, reqContentType) {
		// contentType = "text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,image/apng,*/*;q=0.8";
		// contentType = "text/html";
		// contentType = "text/html; charset=utf-8";
		let type = contentType || reqAcceptType || reqContentType;
		let result;
		if (type) {
			result = type.split(";").map(item => item.trim())[0].split(",")[0];
		} else {
			result = null;
		}
		return result;
	}

	/**
	 *
	 * @param data
	 * @return {Promise<FaHttpResponse>}
	 * @private
	 */
	_handleRequest(data) {
		let self = this;
		let mime = MimeTypes.lookup(data.path);
		let route = this.Router.find(data.path);
		let asset = this.Assets.find(data.path);
		return new Promise(function (resolve) {
			if (route) {
				resolve(self._handleRoute(route, data));
			} else if (asset) {
				resolve(self._handleRoute(asset, data));
			} else if (mime) {
				resolve(self._handleFile(data.path, mime));
			} else {
				resolve(self._handleNotFound(data.path));
			}
		});
	}

	_extractContentType(type) {
		let result;
		if (type.indexOf(this.type.json) !== -1) {
			result = this.type.json;
		} else if (type.indexOf(this.type.html) !== -1) {
			result = this.type.html;
		} else if (type.indexOf(this.type.urlencoded) !== -1) {
			result = this.type.urlencoded;
		} else if (type.indexOf(this.type.xml) !== -1) {
			result = this.type.xml;
		} else {
			result = null;
		}
		return result;
	}

	/**
	 *
	 * @param callback {function}
	 * @param data {*}
	 * @return {Promise<FaHttpResponse>}
	 * @private
	 */
	_handleRoute(callback, data) {
		let self = this;
		return new Promise(function (resolve) {
			resolve(callback.call(self, data));
		}).then(function (result) {
			// console.warn(callback, self.Router.list);
			if (self._checkResponse(result)) {
				return result;
			} else {
				// return self._createResponse(result);
				return FaHttpResponse.createNew(result);
			}
		}).catch(function (e) {
			let error = new FaError(e).pickTrace(0);
			return self._createResponse(error, null, self.status.internalServerError);
		});
	}

	/**
	 *
	 * @param filename {string}
	 * @param type {string}
	 * @return {*}
	 * @private
	 */
	_handleFile(filename, type) {
		try {
			// console.error(filename, type);
			return FaHttpResponse.createNew(this.File.readFileSync(filename.replace(/^\/?/, "")), null, {"Content-Type": type});
		} catch (e) {
			let body = `${e.message} at ${this._trace["path"]}:${this._trace["line"]}:${this._trace["column"]}`;
			return this._createResponse(body, null, this.status.notFound);
		}
	}

	_handleNotFound(route) {
		let body = `route not found: ${route} at ${this._trace["path"]}:${this._trace["line"]}:${this._trace["column"]}`;
		return this._createResponse(body, null, this.status.notFound);
	}

	// _createResponse(body = null, type = null, status = null, headers = null) {
	// 	let result = {body, type, status, headers};
	// 	if (result.headers && result.headers["content-type"]) {
	// 		result.type = headers["content-type"];
	// 	}
	// 	if (!result.status) {
	// 		result.status = this.status.ok;
	// 	}
	// 	if (!result.headers) {
	// 		result.headers = {};
	// 	}
	// 	return result;
	// }
	// noinspection JSMethodCanBeStatic
	_checkResponse(response) {
		return !!(
			response
			&& response.hasOwnProperty("body")
			&& response.hasOwnProperty("type")
			&& response.hasOwnProperty("status")
			&& response.hasOwnProperty("headers")
		);
	}
}

/**
 *
 * @type {FaServerHttp}
 */
module.exports = FaServerHttp;
