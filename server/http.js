'use strict';
/*node*/
const Buffer = require('buffer').Buffer;
const Http = require('http');
// const Https = require('https');
const MimeTypes = require('mime-types');
const Url = require('url');
/*fa*/
const FaError = require('../base/error');
const FaConsoleColor = require('../console/console-helper');
const FaConverterClass = require('../base/converter');
const FaHttpRequestClass = require('./http-request');
const FaHttpResponseClass = require('./http-response');
/**
 *
 * @type {module.FaHttpContentType}
 */
const FaHttpContentType = require("./http-content-type");
/**
 *
 * @type {module.FaHttpStatusCode}
 */
const FaHttpStatusCode = require("./http-status-code");
/**
 *
 * @type {module.FaHttpClass}
 */
module.exports = class FaHttpClass {
	constructor(configuration) {
		this._FaHttpConfigurationClass = require("./http-configuration")(configuration);
		this._FaConverterClass = new FaConverterClass(this.Configuration.converter);
		this._FaFileClass = require('../base/file')(this.Configuration.path);
		this._FaAssetsRouterClass = require('../base/router')(this);
		this._FaHttpResponseClass = FaHttpResponseClass;
		this._FaRouterClass = require('../base/router')(this);
		/**
		 *
		 * @type {module.FaHttpRequestClass}
		 * @private
		 */
		this._FaRequest = new FaHttpRequestClass(this.Configuration.converter);
		this._FaHttpContentType = new FaHttpContentType();
		/**
		 *
		 * @type {module.FaHttpStatusCode}
		 * @private
		 */
		this._FaHttpStatusCode = new FaHttpStatusCode();
		this.HttpServer = this._createHttp(this.Configuration);
	}

	/**
	 *
	 * @return {{protocol: string, host: string, port: number, path: string, converter: {}}}
	 * @constructor
	 */
	get Configuration() {
		return this._FaHttpConfigurationClass;
	}

	/**
	 *
	 * @return {FaConverterClass}
	 * @constructor
	 */
	get Converter() {
		return this._FaConverterClass;
	}

	/**
	 *
	 * @returns {FaFileClass}
	 */
	get File() {
		return this._FaFileClass;
	}

	/**
	 *
	 * @return {FaRouterClass}
	 */
	get Router() {
		return this._FaRouterClass;
	}

	/**
	 *
	 * @return {FaRouterClass}
	 */
	get Assets() {
		return this._FaAssetsRouterClass;
	}

	/**
	 *
	 * @return {module.FaHttpContentType}
	 */
	get type() {
		return this._FaHttpContentType;
	}

	/**
	 *
	 * @return {module.FaHttpStatusCode}
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
		let context = this;
		return Http.createServer(function (req, res) {
			context._listenHttp(req, res);
		}).listen(configuration.port, function () {
			console.log(`FaHttp ${FaConsoleColor.effect.bold}${FaConsoleColor.color.green}\u2714${FaConsoleColor.effect.reset} {protocol}://{host}:{port} <{path}>`.replaceAll(Object.keys(configuration).map(function (key) {
				return `{${key}}`;
			}), Object.values(configuration)));
		});
		// let File = require('../base/file')();
		// const options = {
		// 	key: File.readFileSync("/usr/src/ssl/server.key"),
		// 	cert: File.readFileSync("/usr/src/ssl/server.cert")
		// };
		// let _HttpsServer = Https.createServer(options, function (req, res) {
		// 	console.error("XXX");
		// 	context._listenHttp(req, res);
		// }).listen(443, function () {
		// 	console.log(`FaHttp ${FaConsoleColor.effect.bold}${FaConsoleColor.color.green}\u2714${FaConsoleColor.effect.reset} {protocol}://{host}:{port} <{path}>`.replaceAll(Object.keys(configuration).map(function (key) {
		// 		return `{${key}}`;
		// 	}), Object.values(configuration)));
		// });
		// return _HttpServer;
	}

	/**
	 *
	 * @param req
	 * @param res
	 * @private
	 */
	_listenHttp(req, res) {
		let context = this;
		let body = '';
		req.on('data', function (chunk) {
			body += chunk;
		});
		req.on('error', function (error) {
			context._respondHttp(req, res, error);
		});
		req.on('end', function () {
			context._handleRequest(context._FaRequest.format(req.method, req.headers, Url.parse(req.url), body)).then(function (result) {
				// console.warn(result.headers, result.status);
				context._respondHttp(req, res, result);
			});
		});
	};

	/**
	 *
	 * @param req
	 * @param res
	 * @param FaHttpResponse {module.FaHttpResponseClass}
	 * @private
	 */
	_respondHttp(req, res, FaHttpResponse) {
		if (FaHttpResponse.headers['Content-Type'] === null) {
			if (req.headers.accept) {
				if (req.headers.accept.indexOf(this.type.json) !== -1) {
					FaHttpResponse.headers['Content-Type'] = this.type.json;
				} else if (req.headers.accept.indexOf(this.type.html) !== -1) {
					FaHttpResponse.headers['Content-Type'] = this.type.html;
				} else if (req.headers.accept.indexOf(this.type.urlencoded) !== -1) {
					FaHttpResponse.headers['Content-Type'] = this.type.urlencoded;
				} else if (req.headers.accept.indexOf(this.type.xml) !== -1) {
					FaHttpResponse.headers['Content-Type'] = this.type.xml;
				} else {
					FaHttpResponse.headers['Content-Type'] = this.type.html;
				}
			} else {
				FaHttpResponse.headers['Content-Type'] = this.type.html;
			}
		}
		// let accepts = require('accepts');
		// let accept = accepts(req);
		switch (!FaHttpResponse.content.byteLength && FaHttpResponse.headers['Content-Type']) {
			case this.type.json:
				FaHttpResponse.content = this.Converter.toJson(FaHttpResponse.content);
				break;
			case this.type.html:
				FaHttpResponse.content = this.Converter.toHtml(FaHttpResponse.content);
				break;
			case this.type.urlencoded:
				FaHttpResponse.content = this.Converter.toUrlencoded(FaHttpResponse.content);
				break;
			case this.type.xml:
				FaHttpResponse.content = this.Converter.toXml(FaHttpResponse.content);
				break;
			// default:
			// FaHttpResponse.content = this.Converter.toHtml(FaHttpResponse.content);
		}
		if (!FaHttpResponse.status) {
			FaHttpResponse.status = this.status.ok;
		}
		if (!FaHttpResponse.content.byteLength) {
			FaHttpResponse.content = Buffer.from(FaHttpResponse.content);
		}
		// server1.console.error(FaHttpResponse.content);
		for (let property in FaHttpResponse.headers) {
			if (FaHttpResponse.headers.hasOwnProperty(property)) {
				if (property === 'Content-Type' && FaHttpResponse.headers[property].indexOf('; charset=') === -1) {
					res.setHeader(property, FaHttpResponse.headers[property] + '; charset=utf-8');
				} else {
					res.setHeader(property, FaHttpResponse.headers[property]);
				}
			}
		}
		res.setHeader('Content-Length', FaHttpResponse.content.byteLength);
		res.statusCode = FaHttpResponse.status;
		res.write(FaHttpResponse.content);
		res.end();
		FaHttpResponse = null;
	}

	/**
	 *
	 * @param data
	 * @return {Promise<module.FaHttpResponseClass>}
	 * @private
	 */
	_handleRequest(data) {
		let context = this;
		let mime = MimeTypes.lookup(data.path);
		let route = this.Router.find(data.path);
		let asset = this.Assets.find(data.path);
		return new Promise(function (resolve) {
			if (route) {
				resolve(context._handeRoute(route, data));
			} else if (asset) {
				resolve(context._handeRoute(asset, data));
			} else if (mime) {
				resolve(context._handleFile(data.path, mime));
			} else {
				resolve(context.response(FaError.pickTrace(`route not found: ${data.path}`, 1), null, context.status.notImplemented));
			}
		});
	}

	 /*@return {Promise<any | never | module.FaHttpResponseClass>}*/
	/**
	 *
	 * @param route {function | string}
	 * @param data {*}
	 * @return {Promise<any>}
	 * @private
	 */
	_handeRoute(route, data) {
		let context = this;
		return new Promise(function (resolve) {
			resolve(route.call(context, data));
		}).then(function (result) {
			if (result instanceof FaHttpResponseClass) {
				return result;
			} else {
				return context.response(result, null, context.status.ok);
			}
		}).catch(function (e) {
			console.error(e);
			return context.response(FaError.pickTrace(e, 0), null, context.status.internalServerError);
		});
	}

	/**
	 *
	 * @param filename {string}
	 * @param type {string}
	 * @return {module.FaHttpResponseClass}
	 * @private
	 */
	_handleFile(filename, type) {
		// server1.console.error(filename, type);
		try {
			return this.response(this.File.readFileSync(filename.replace(/^\/?/, "")), type, this.status.ok);
		} catch (e) {
			return this.response(e.message, null, this.status.notFound);
		}
	}

	/**
	 *
	 * @param content
	 * @param type
	 * @param status
	 * @return {module.FaHttpResponseClass}
	 */
	response(content, type = null, status = null) {
		return new this._FaHttpResponseClass(content, type, status);
	}
};
