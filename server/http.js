'use strict';
/*node*/
const
	Http = require('http'),
	MimeTypes = require('mime-types'),
	Url = require('url');
/*vendor*/
const FaError = require('../error/index');
const FaFileClass = require('./file');
const FaServerHttpResponseClass = require('./http-response');
const FaServerHttpRoutesClass = require('./http-routes');
const FaRouterClass = require('./router');
const FaTraceClass = require('../trace');
/**
 *
 * @type {module.FaServerHttpClass}
 */
module.exports = class FaServerHttpClass {
	/**
	 *
	 * @param parent {module.FaServerClass}
	 * @param configuration
	 */
	constructor(parent, configuration) {
		this._parent = parent;
		this._configuration = configuration;
		this._File = new FaFileClass(this.configuration.path, 3);
		this._Router = new FaRouterClass(parent);
		this._Trace = new FaTraceClass();
		new FaServerHttpRoutesClass(this);
		this._Http = this._createHttp();
	}

	/**
	 *
	 * @return {http|*}
	 * @constructor
	 */
	get Http() {
		return this._Http;
	}

	/**
	 *
	 * @return {{protocol: string, host: string, port: number, path: string}}
	 */
	get configuration() {
		return this._configuration;
	};

	/**
	 *
	 * @returns {module.FaFileClass}
	 */
	get file() {
		return this._File;
	}

	/**
	 *
	 * @return {module.FaHttpRouterClass}
	 */
	get router() {
		return this._Router;
	}

	/**
	 *
	 * @return {FaTraceClass}
	 */
	get trace() {
		return this._Trace;
	}

	/**
	 *
	 * @return {{javascript: string, json: string, html: string, text: string, urlencoded: string, xml: string}}
	 */
	get contentType() {
		return {
			javascript: 'application/javascript',
			json: 'application/json',
			html: 'text/html',
			text: 'text/plain',
			urlencoded: 'application/x-www-form-urlencoded',
			xml: 'application/xml',
		}
	}

	/**
	 *
	 * @return {{badRequest: number, internalServerError: number, notFound: number, notImplemented: number, ok: number, apiGet: number, apiDelete: number, apiPatch: number, apiPost: number, apiPut: number}}
	 */
	get statusCode() {
		return {
			//http
			badRequest: 400,
			internalServerError: 500,
			notFound: 404,
			notImplemented: 501,
			ok: 200,
			//api
			apiGet: 200,
			apiDelete: 204,
			apiPatch: 202,
			apiPost: 201,
			apiPut: 200,
		}
	}

	/**
	 * @return {http}
	 * @private
	 */
	_createHttp() {
		let context = this;
		let _Http;
		_Http = Http.createServer(function (req, res) {
			context._listenHttp(req, res);
		});
		_Http.listen(this.configuration.port, function () {
			context._parent.log('FaServerHttp', context.configuration.protocol, context.configuration.host, context.configuration.port, context.configuration.path);
		});
		return _Http;
	}

	/**
	 *
	 * @param req
	 * @param res
	 * @private
	 */
	_listenHttp(req, res) {
		let context = this;
		let path = Url.parse(req.url).pathname;
		let handler = this.router.handler(path);
		let type = MimeTypes.lookup(path);
		// FaConsole.consoleInfo(path);
		this._readData(req).then(function (data) {
			if (handler) {
				return context._handleRouter(req, res, path, handler, data);
			} else if (type) {
				return context._handleFile(req, res, path, type);
			} else {
				return context._parent.httpResponse(new FaError(`route not found: ${path}`, false), null, context.statusCode.notFound);
			}
		}).then(function (result) {
			context._respondHttp(req, res, result);
		}).catch(function (e) {
			FaConsole.consoleError(e);
			context._respondHttp(req, res, e);
			// context._respondHttp(req, res, context._parent.httpResponse(new FaError(e), type, context.statusCode.notFound));
			// context._respondHttp(req, res, context._parent.httpResponse(null, type, context.statusCode.ok));
			// context._respondHttp(req, res, context._parent.httpResponse(null, {
			// 	'Cache-Control': 'no-store, no-cache, must-revalidate'
			// }, context.statusCode.notFound));
		});
	};

	/**
	 *
	 * @param req
	 * @return {Promise}
	 * @private
	 */
	_readData(req) {
		let context = this;
		return new Promise(function (resolve, reject) {
			let result = '';
			let data = '';
			req.on('data', function (chunk) {
				data += chunk;
			});
			req.on('error', function (error) {
				reject(error);
			});
			req.on('end', function () {
				let get = {};
				let post = {};
				let url = Url.parse(req.url);
				// FaConsole.consoleError(url.pathname);
				if (url.query) {
					get = context._parent.converter.fromUrlEncoded(url.query);
				}
				if (["PATCH", "POST", "PUT"].hasElement(req.method)) {
					switch (req.headers['content-type']) {
						case context.contentType.json:
							post = context._parent.converter.fromJson(data);
							break;
						case context.contentType.xml:
							post = context._parent.converter.fromXml(data);
							break;
						default:
							post = context._parent.converter.fromUrlEncoded(data);
					}
				}
				result = {
					path: url.pathname,
					method: req.method.toLowerCase(),
					headers: req.headers,
					get: get,
					post: post,
					data: (typeof get === 'object' && typeof post === 'object') ? Object.assign({}, get, post) : {},
					input: data,
				};
				resolve(result);
			});
		});
	}

	/**
	 *
	 * @param req
	 * @param res
	 * @param responseClass {module.FaServerHttpResponseClass}
	 * @private
	 */
	_respondHttp(req, res, responseClass) {
		let statusCode;
		let content;
		if (!responseClass.get.status) {
			statusCode = this.statusCode.ok;
		} else {
			statusCode = responseClass.get.status;
		}
		if (!responseClass.get.headers['Content-Type']) {
			responseClass.get.headers['Content-Type'] = req.headers['content-type'] ? req.headers['content-type'] : this.contentType.html;
		}
		if (!responseClass.get.content) {
			content = '';
		} else if (responseClass.get.content.byteLength) {
			content = responseClass.get.content;
		} else {
			switch (responseClass.get.headers['Content-Type']) {
				case this.contentType.json:
					content = this._parent.converter.toJson(responseClass.get.content);
					break;
				case this.contentType.urlencoded:
					content = this._parent.converter.toUrlencoded(responseClass.get.content);
					break;
				case this.contentType.xml:
					content = this._parent.converter.toXml(responseClass.get.content);
					break;
				default:
					content = this._parent.converter.toHtml(responseClass.get.content);
			}
		}
		for (let property in responseClass.get.headers) {
			if (responseClass.get.headers.hasOwnProperty(property)) {
				if (property === 'Content-Type' && responseClass.get.headers[property].indexOf('; charset=') === -1) {
					res.setHeader(property, responseClass.get.headers[property] + '; charset=utf-8');
				} else {
					res.setHeader(property, responseClass.get.headers[property]);
				}
			}
		}
		if (!content.byteLength) {
			content = Buffer.from(content);
		}
		if (content.byteLength) {
			// res.setHeader('Accept-Ranges', 'bytes');
			res.setHeader('Content-Length', content.byteLength);
		}
		if (statusCode === 404) {
			// FaConsole.consoleWarn(statusCode);
			res.statusCode = 404;
			// res.writeHead(404, {});
		} else {
			res.statusCode = statusCode;
		}
		res.write(content);
		res.end();
	}

	/**
	 *
	 * @param e {Error|module.FaError}
	 * @return {module.FaError}
	 */
	error(e) {
		if (e instanceof FaError === false) {
			e = new FaError(e);
		}
		// e.appendTrace(this._TraceClass.parse(e).string());
		return e;
	}

	/**
	 *
	 * @param req
	 * @param res
	 * @param path {string}
	 * @param handler {function}
	 * @param data {*}
	 * @private
	 */
	_handleRouter(req, res, path, handler, data) {
		try {
			let Response;
			let result = handler.call(this, data);
			if (result instanceof FaServerHttpResponseClass === false) {
				Response = this._parent.httpResponse(result, null, this.statusCode.ok);
			} else {
				Response = result;
			}
			// this._respondHttp(req, res, Response);
			return Response;
		} catch (e) {
			let error = this.error(e);
			// FaConsole.consoleInfo(error);
			// let error = this.error(e);
			// FaConsole.consoleInfo(error);
			// let error = new FaError(e);
			// let error = e;
			// let Error = new FaError(e);
			// FaConsole.consoleWarn(error);
			// let trace = this.trace.parse(e);
			// let level = 0;
			// FaConsole.consoleError(trace.get(level));
			// FaConsole.consoleError(trace.string(level));
			// FaConsole.consoleWarn(this.trace.get(1));
			// Error.appendTrace(this.router.trace(path));
			// FaConsole.consoleLog(this.router.trace(path));
			// this._respondHttp(req, res, this._parent.httpResponse(Error, null, this.statusCode.internalServerError));
			return this._parent.httpResponse(error, null, this.statusCode.internalServerError);
		}
	}

	/**
	 *
	 * @param req
	 * @param res
	 * @param filename {string}
	 * @param type {string}
	 * @private
	 */
	_handleFile(req, res, filename, type) {
		let context = this;
		// FaConsole.consoleWarn(filename);
		let data;
		// data = this.file.asByte(filename);
		// return context._parent.httpResponse(data, type, context.statusCode.ok);
		try {
			data = this.file.asByte(filename);
			// 	// FaConsole.consoleWarn(filename, 'OK');
			return context._parent.httpResponse(data, type, context.statusCode.ok);
		} catch (e) {
			// data = '';
			FaConsole.consoleWarn(filename, e);
			return context._parent.httpResponse(e, type, context.statusCode.notFound);
		}
		// this.file.asByte(filename, true).then(function (data) {
		// 	context._respondHttp(req, res, context._parent.httpResponse(data, type, context.statusCode.ok));
		// }).catch(function (e) {
		// 	FaConsole.consoleInfo(e);
		// 	// FaConsole.consoleInfo(filename);
		// 	// context._respondHttp(req, res, context._parent.httpResponse(e, type, context.statusCode.notFound));
		// 	context._respondHttp(req, res, context._parent.httpResponse(e, {
		// 		// 'Transfer-Encoding': 'chunked',
		// 		// 'Server': 'nginx/1.14.1',
		// 		// 'Date': 'Thu, 22 Nov 2018 10:27:58 GMT',
		// 		// 'Vary': 'Accept-Encoding',
		// 		// 'Content-Encoding': 'gzip',
		// 		// 'Pragma': 'no-cache',
		// 		'Content-Type': context.contentType.html,
		// 	}, context.statusCode.internalServerError));
		// });
	}
};

