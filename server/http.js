'use strict';
/*node*/
const Buffer = require('buffer').Buffer;
const Http = require('http');
const MimeTypes = require('mime-types');
const Url = require('url');
/*fa*/
const FaError = require('../base/error');
const FaConsoleColor = require('../console/console-color');
const FaConverterClass = require('../base/converter');
const FaHttpRequestClass = require('./http-request');
const FaHttpResponseClass = require('./http-response');
const FaHttpContentType = require("./http-content-type");
const FaHttpStatusCode = require("./http-status-code");

/**
 *
 * @type {FaHttpClass}
 */
class FaHttpClass {
	constructor(configuration) {
		this._FaHttpConfigurationClass = require("./http-configuration")(configuration);
		this._FaConverterClass = new FaConverterClass(this.Configuration.converter);
		this._FaFileClass = require('../base/file')(this.Configuration.path);
		this._FaRouterClass = require('../base/router')(this);
		this._FaRequest = new FaHttpRequestClass(this.Configuration.converter);
		this._FaHttpContentType = new FaHttpContentType();
		this._FaHttpStatusCode = new FaHttpStatusCode();
		this.HttpServer = this._createHttp(this.Configuration);
		// new FaServerHttpRoutesClass(this._Http);
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
		let Server = Http.createServer(function (req, res) {
			context._listenHttp(req, res);
		});
		Server.listen(configuration.port, function () {
			let message = `FaHttp ${FaConsoleColor.effect.bold}${FaConsoleColor.color.green}\u2714${FaConsoleColor.effect.reset} {protocol}://{host}:{port} <{path}>`.replaceAll(Object.keys(configuration).map(function (key) {
				return `{${key}}`;
			}), Object.values(configuration));
			let template = `${FaConsoleColor.bg.black}${FaConsoleColor.color.cyan} {time} ${FaConsoleColor.color.white}{path}:${FaConsoleColor.color.cyan}{line}${FaConsoleColor.color.white}:{column} ${FaConsoleColor.effect.reset} {data}`;
			console.log(message, template, 'plain');
		});
		return Server;
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
			// reject(error);
		});
		req.on('end', function () {
			context._handleRequest(context._FaRequest.format(req.method, req.headers, Url.parse(req.url), body)).then(function (result) {
				context._respondHttp(req, res, result);
			}).catch(function (e) {
				context._respondHttp(req, res, e);
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
				if (req.headers.accept.indexOf(this._FaHttpContentType.json) !== -1) {
					FaHttpResponse.headers['Content-Type'] = this._FaHttpContentType.json;
				} else if (req.headers.accept.indexOf(this._FaHttpContentType.html) !== -1) {
					FaHttpResponse.headers['Content-Type'] = this._FaHttpContentType.html;
				} else if (req.headers.accept.indexOf(this._FaHttpContentType.urlencoded) !== -1) {
					FaHttpResponse.headers['Content-Type'] = this._FaHttpContentType.urlencoded;
				} else if (req.headers.accept.indexOf(this._FaHttpContentType.xml) !== -1) {
					FaHttpResponse.headers['Content-Type'] = this._FaHttpContentType.xml;
				} else {
					FaHttpResponse.headers['Content-Type'] = this._FaHttpContentType.html;
				}
			} else {
				FaHttpResponse.headers['Content-Type'] = this._FaHttpContentType.html;
			}
		}
		// let accepts = require('accepts');
		// let accept = accepts(req);
		// FaConsole.consoleLog(accept.type('json'));
		switch (!FaHttpResponse.content.byteLength && FaHttpResponse.headers['Content-Type']) {
			case this._FaHttpContentType.json:
				FaHttpResponse.content = this.Converter.toJson(FaHttpResponse.content);
				break;
			case this._FaHttpContentType.html:
				FaHttpResponse.content = this.Converter.toHtml(FaHttpResponse.content);
				break;
			case this._FaHttpContentType.urlencoded:
				FaHttpResponse.content = this.Converter.toUrlencoded(FaHttpResponse.content);
				break;
			case this._FaHttpContentType.xml:
				FaHttpResponse.content = this.Converter.toXml(FaHttpResponse.content);
				break;
			// default:
			// FaHttpResponse.content = this.Converter.toHtml(FaHttpResponse.content);
		}
		if (!FaHttpResponse.status) {
			FaHttpResponse.status = this._FaHttpStatusCode.ok;
		}
		if (!FaHttpResponse.content.byteLength) {
			FaHttpResponse.content = Buffer.from(FaHttpResponse.content);
		}
		// FaConsole.consoleError(FaHttpResponse.content);
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
		let router = this.Router.find(data.path);
		return new Promise(function (resolve, reject) {
			if (router) {
				try {
					let callback = router.call(this, data);
					if (callback instanceof Promise) {
						callback.then(function (result) {
							resolve(context._handleRoute(data.path, result));
						}).catch(function (e) {
							reject(context.response(FaError.pickTrace(e, 0), null, context._FaHttpStatusCode.internalServerError));
						});
					} else {
						resolve(context._handleRoute(data.path, callback));
					}
				} catch (e) {
					reject(context.response(FaError.pickTrace(e, 0), null, context._FaHttpStatusCode.internalServerError));
				}
			} else if (mime) {
				resolve(context._handleFile(data.path, mime));
			} else {
				resolve(context.response(FaError.pickTrace(`route not found: ${data.path}`, 1), null, context._FaHttpStatusCode.notFound));
			}
		});
	}

	/**
	 *
	 * @param route {string}
	 * @param data
	 * @private
	 */
	_handleRoute(route, data) {
		if (data instanceof FaHttpResponseClass) {
			return data;
		} else {
			return this.response(data, null, this._FaHttpStatusCode.ok);
		}
	}

	/**
	 *
	 * @param filename {string}
	 * @param type {string}
	 * @return {module.FaHttpResponseClass}
	 * @private
	 */
	_handleFile(filename, type) {
		// FaConsole.consoleError(filename, type);
		try {
			return this.response(this.File.readByteSync(filename.replace(/^\/?/, "")), type, this._FaHttpStatusCode.ok);
		} catch (e) {
			return this.response(e.message, null, this._FaHttpStatusCode.notFound);
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
		return new FaHttpResponseClass(content, type, status);
	}
}

/**
 *
 * @param configuration {Object}
 * @return {FaHttpClass}
 */
module.exports = function (configuration = null) {
	if (configuration) {
		return new FaHttpClass(configuration);
	} else {
		return FaHttpClass;
	}
};
