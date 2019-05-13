"use strict";
/*node*/
const Buffer = require("buffer").Buffer;
const Http = require("http");
const Https = require("https");
/** @type {*} */
const MimeTypes = require("mime-types");
/*fa-nodejs*/
const FaError = require("fa-nodejs/base/error");
const FaTrace = require("fa-nodejs/base/trace");
const FaBaseFile = require("fa-nodejs/base/file");
const FaConsoleColor = require("fa-nodejs/console/console-helper");
const FaConverterClass = require("fa-nodejs/base/converter");
const FaServerHttpRequestClass = require("fa-nodejs/server/http-request");
const FaHttpResponse = require("fa-nodejs/server/http-response");
const FaServerHttpContentType = require("./http-content-type");
const FaServerHttpStatusCode = require("./http-status-code");
const FaBaseRouter = require("fa-nodejs/base/router");
const FaHttpConfiguration = require("fa-nodejs/server/http-configuration");

class FaServerHttp {
	constructor(configuration) {
		// this._FaHttpConfiguration = require("./http-configuration")(configuration);
		this.Configuration = configuration;
		this._FaConverterClass = new FaConverterClass(this.Configuration.converter);
		// console.info(configuration);
		this._FaFile = new FaBaseFile(this.Configuration.path);
		this._FaFilePrivate = new FaBaseFile(this.Configuration.private);
		this._FaRouter = new FaBaseRouter(this);
		this._FaAssetRouter = new FaBaseRouter(this);
		this._FaHttpResponse = FaHttpResponse;
		this._NewFaHttpResponse = new FaHttpResponse();
		this._FaHttpRequest = new FaServerHttpRequestClass(this.Configuration.converter);
		this._FaHttpContentType = new FaServerHttpContentType();
		this._FaHttpStatusCode = new FaServerHttpStatusCode();
		// this.HttpServer = this._createHttp(this.Configuration);
		this._createHttp(this.Configuration);
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
	get Converter() {
		return this._FaConverterClass;
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
	 * @return {FaServerHttpContentType}
	 */
	get type() {
		return this._FaHttpContentType;
	}

	/**
	 *
	 * @return {FaServerHttpStatusCode}
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
			self._respondHttp(req, res, error);
		});
		req.on("end", function () {
			self._handleRequest(self._FaHttpRequest.formatRequest(req, body)).then(function (data) {
				// console.info(result);
				// let data = self._respondHttp(req, res, result);
				if (data["type"] === null) {
					if (req.headers.accept) {
						data["type"] = self._extractContentType(req.headers.accept);
					} else {
						data["type"] = self.type.urlencoded;
					}
				}
				data["chunk"] = self.type.convertToType(data["chunk"], data["type"]);
				for (let property in data["headers"]) {
					if (data["headers"].hasOwnProperty(property)) {
						res.setHeader(property, data["headers"][property]);
					}
				}
				res.statusCode = data["status"];
				res.setHeader("Content-Type", data["type"]);
				if (data["chunk"] instanceof Buffer) {
					res.setHeader("Content-Length", data["chunk"].byteLength);
				} else if (data["chunk"] instanceof String) {
					res.setHeader("Content-Length", data["chunk"].length);
				} else {
					// console.info(data)
				}
				res.write(data["chunk"]);
				res.end();
			});
		});
	};

	/**
	 *
	 * @param data
	 * @return {Promise<FaServerHttpResponse>}
	 * @private
	 */
	_handleRequest(data) {
		let self = this;
		let mime = MimeTypes.lookup(data.path);
		let route = this.Router.find(data.path);
		let asset = this.Assets.find(data.path);
		return new Promise(function (resolve, reject) {
			if (route) {
				resolve(self._handleRoute(route, data));
			} else if (asset) {
				resolve(self._handleRoute(asset, data));
			} else if (mime) {
				resolve(self._handleFile(data.path, mime));
			} else {
				// reject(self.response(new FaError(`route not found: ${data.path}`).setTrace(self._trace), null, self.status.notFound));
				reject(self._handleNotFound(data.path));
			}
		}).then(function (result) {
			return result;
		}).catch(function (e) {
			console.error(e);
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
	 * @param req
	 * @param res
	 * @param data {*}
	 * @private
	 */
	_respondHttp(req, res, data) {
		// try {
		// 	console.error(typeof data.chunk)
		if (data.type === null) {
			if (req.headers.accept) {
				data.type = this._extractContentType(req.headers.accept);
			} else {
				data.type = this.type.urlencoded;
			}
		}
		data.chunk = this.type.convertToType(data.chunk, data.type);
		// if (data.chunk instanceof Buffer) {
		// 	data.length = data.chunk.byteLength;
		// } else if (data.chunk instanceof String) {
		// 	data.length = data.chunk.length;
		// }
		return data;
		for (let property in data.headers) {
			if (data.headers.hasOwnProperty(property)) {
				res.setHeader(property, data.headers[property]);
			}
		}
		if (data.type) {
			// res.setHeader("Content-Type", `${data.type}; charset=utf-8`);
			res.setHeader("Content-Type", data.type);
		}
		if (data.chunk instanceof Buffer) {
			res.setHeader("Content-Length", data.chunk.byteLength);
		} else if (data.chunk instanceof String) {
			res.setHeader("Content-Length", data.chunk.length);
		} else {
			data.chunk = this.Converter.toHtml(data.chunk);
		}
		// console.error(data.status);
		// res.write(FaHttpResponse.chunk, "utf8", function () {
		// 	FaHttpResponse = null;
		// });
		// console.warn(data);
		// res.writeHead(200, { 'Content-Type': 'text/plain' });
		res.statusCode = data.status;
		res.write(data.chunk);
		res.end();
		data = null;
		// } catch (e) {
		// 	console.error(e);
		// 	res.write(e.message);
		// 	res.end();
		// }
	}

	/**
	 *
	 * @param route {function}
	 * @param data {*}
	 * @return {Promise<FaServerHttpResponse>}
	 * @private
	 */
	_handleRoute(route, data) {
		let self = this;
		return new Promise(function (resolve) {
			resolve(route.call(self, data));
		}).then(function (result) {
			if (self._NewFaHttpResponse.check(result)) {
				return result;
			} else {
				return self._NewFaHttpResponse.create(result);
			}
		}).catch(function (e) {
			return self._NewFaHttpResponse.create(new FaError(e).pickTrace(0), null, self.status.internalServerError);
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
		// console.error(filename, type);
		try {
			// return this.response(this.File.readFileSync(filename.replace(/^\/?/, "")), type, this.status.ok);
			return this._NewFaHttpResponse.create(this.File.readFileSync(filename.replace(/^\/?/, "")), type);
		} catch (e) {
			// return this.response(e.message, null, this.status.notFound);
			return this._NewFaHttpResponse.create(e.message, null, this.status.notFound);
		}
	}

	_handleNotFound(route) {
		// let chunk = new FaError(`route not found: ${route}`).setTrace(this._trace);
		// let chunk = `<html lang="en"><head><title></title><link href="/fa/beautify.css" rel="stylesheet"/><link href="/css/main.css" rel="stylesheet"/></head><body><main>route not found: ${route}</main></body></html>`;
		let chunk = `route not found: ${route}`;
		return this._NewFaHttpResponse.create(chunk, null, this.status.internalServerError);
	}

	/**
	 *
	 * @param content
	 * @param type
	 * @param status
	 * @return {FaServerHttpResponse}
	 */
	response(content, type = null, status = null) {
		return new this._FaHttpResponse(content, type, status);
	}
}

/**
 *
 * @type {FaServerHttp}
 */
module.exports = FaServerHttp;
