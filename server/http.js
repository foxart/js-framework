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
const FaFile = require("fa-nodejs/base/file");
const FaConsoleColor = require("fa-nodejs/console/console-helper");
const FaConverter = require("fa-nodejs/base/converter");
const FaHttpContentType = require("./http-content-type");
const FaHttpHeaders = require("./http-headers");
const FaHttpResponse = require("fa-nodejs/server/http-response");
const FaHttpRequestClass = require("fa-nodejs/server/http-request");
const FaHttpStatusCode = require("./http-status-code");
const FaRouter = require("fa-nodejs/base/router");
const FaHttpConfiguration = require("fa-nodejs/server/http-configuration");

class FaServerHttp {
	constructor(configuration) {
		this.name = "HTTP";
		this._FaHttpConfiguration = require("./http-configuration")(configuration);
		this.Configuration = configuration;
		this._FaFile = new FaFile(this.Configuration.path);
		this._FaFilePrivate = new FaFile(this.Configuration.private);
		this._FaRouter = new FaRouter(this);
		this._FaAssets = new FaRouter(this);
		this._FaHttpRequest = new FaHttpRequestClass(this.Configuration.converter);
		this._FaHttpResponse = FaHttpResponse;
		this._FaHttpStatusCode = new FaHttpStatusCode();
		this.HttpServer = this._createHttp(this.Configuration);
		this._trace = FaTrace.trace(1);
	}

	/**
	 *
	 * @return {{protocol: string, host: string, port: number, path: string, converter: {}}}
	 * @constructor
	 * @deprecated
	 */
	get Configuration() {
		return this._FaHttpConfiguration;
	}

	/**
	 *
	 * @param configuration
	 * @constructor
	 * @deprecated
	 */
	set Configuration(configuration) {
		this._FaHttpConfiguration = new FaHttpConfiguration(configuration);
	}

	/**
	 *
	 * @return {FaConverter}
	 * @private
	 */
	static get _converter() {
		return FaConverter;
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
	 * @return {FaFile}
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
	get router() {
		return this._FaRouter;
	}

	/**
	 *
	 * @return {FaRouterClass}
	 */
	get asset() {
		return this._FaAssets;
	}

	// noinspection JSMethodCanBeStatic
	get type() {
		// return this._FaHttpContentType;
		return FaHttpContentType;
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
			let url = self._parser.parseUrl(req.url);
			// console.info(req.headers, req.url, url, body);
			let post = null;
			let files = null;
			let type = req.headers["content-type"] || req.headers["accept"] || "";
			if (["patch", "post", "put"].has(req.method.toLowerCase())) {
				if (type.includes(self.type.multipart)) {
					({files, post} = self._parser.parseMultipart(body));
				} else if (type.includes(self.type.json)) {
					post = FaConverter.fromJson(body);
				} else if (type.includes(self.type.xml)) {
					post = FaConverter.fromXml(body);
				} else if (type.includes(self.type.urlencoded)) {
					post = FaConverter.fromUrlEncoded(body);
				} else {
					post = body;
				}
			}
			let request = {
				client: self._parser.parseClient(req),
				headers: req.headers,
				method: req.method.toLowerCase(),
				path: url.pathname,
				get: url.query ? FaConverter.fromUrlEncoded(url.query) : null,
				post: post,
				files: files,
				cookies: req.headers["cookie"] ? self._parser.parseCookie(req.headers["cookie"]) : null,
				// request: (typeof get === "object" && typeof post === "object") ? Object.assign({}, get, post) : {},
				// input: body,
			};
			self._handleRequest(request).then(function (result) {
				/*todo make proper content-type and|or charset extractor*/
				let contentType = FaHttpHeaders.getValue("Content-Type", [
					result["headers"],
					{
						"content-type": req.headers["accept"] ? req.headers["accept"].split(";")[0].split(",").filter(item => item.trim())[0] : null
					},
					req.headers
				]);
				// let charset = FaHttpHeaders.getCharset(contentType);
				if (result["body"] instanceof Buffer === false) {
					if (contentType) {
						if (contentType.includes(self.type.json)) {
							result["body"] = FaConverter.toJson(result["body"]);
						} else if (contentType.includes(self.type.html)) {
							result["body"] = FaConverter.toHtml(result["body"]);
						} else if (contentType.includes(self.type.urlencoded)) {
							result["body"] = FaConverter.toUrlEncoded(result["body"]);
						} else if (contentType.includes(self.type.xml)) {
							result["body"] = FaConverter.toXml(result["body"]);
						} else if (contentType.includes(self.type.text)) {
							result["body"] = FaConverter.toText(result["body"]);
						} else {
							/*default converter*/
							result["body"] = result["body"].toString();
						}
					} else {
						/*default converter*/
						result["body"] = result["body"].toString();
					}
				}
				Object.entries(result["headers"]).map(function ([key, value]) {
					if (["Content-Type", "content-type"].omit(key)) {
						res.setHeader(key, value);
					}
				});
				if (contentType) {
					res.setHeader("Content-Type", contentType);
				}
				if (result["body"] instanceof Buffer) {
					res.setHeader("Content-Length", result["body"].byteLength);
				} else {
					res.setHeader("Content-Length", Buffer.from(result["body"]).byteLength);
				}
				res.statusCode = result["status"];
				res.write(result["body"]);
				res.end();
			});
		});
	};

	/**
	 *
	 * @param data
	 * @return {Promise<FaHttpResponse>}
	 * @private
	 */
	_handleRequest(data) {
		let self = this;
		let mime = MimeTypes.lookup(data.path);
		let route = this.router.find(data.path);
		let asset = this.asset.find(data.path);
		return new Promise(function (resolve) {
			if (route) {
				resolve(self._handleRoute(route, data));
			} else if (asset) {
				// console.log(asset);
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
			// resolve(callback.call(self, data));
			resolve(callback(data));
		}).then(function (result) {
			if (FaHttpResponse.check(result)) {
				return result;
			} else {
				// console.error(result, false);
				return FaHttpResponse.create(result);
			}
		}).catch(function (e) {
			// let error = new FaError(e).pickTrace(0);
			let error = new FaError(e);
			console.error(error);
			return FaHttpResponse.create(error, self.status.internalServerError);
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
			return FaHttpResponse.create(this.File.readFileSync(filename.replace(/^\/?/, "")), null, {"Content-Type": type});
		} catch (e) {
			let body = `${e.message} at ${this._trace["path"]}:${this._trace["line"]}:${this._trace["column"]}`;
			return FaHttpResponse.create(body, this.status.notFound);
		}
	}

	/**
	 *
	 * @param route
	 * @return {*}
	 * @private
	 */
	_handleNotFound(route) {
		let body = `route not found: ${route} at ${this._trace["path"]}:${this._trace["line"]}:${this._trace["column"]}`;
		return FaHttpResponse.create(body, this.status.notFound);
	}
}

/**
 *
 * @type {FaServerHttp}
 */
module.exports = FaServerHttp;
