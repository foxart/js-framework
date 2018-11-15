'use strict';
/*node*/
const
	Http = require('http'),
	MimeTypes = require('mime-types'),
	Url = require('url');
/*vendor*/
const
	FaError = require('../error/index'),
	FaFileClass = require('./file'),
	FaServerHttpResponseClass = require('./http-response'),
	FaServerHttpRoutesClass = require('./http-routes'),
	FaRouterClass = require('./router');
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
		this._FileClass = new FaFileClass(this.configuration.path);
		this._RouterClass = new FaRouterClass(parent);
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
		return this._FileClass;
	}

	/**
	 *
	 * @return {module.FaHttpRouterClass}
	 */
	get router() {
		return this._RouterClass;
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
		this._readData(req).then(function (data) {
			if (handler) {
				context._handleRouter(req, res, path, handler, data);
			} else if (type) {
				context._handleFile(req, res, path, type);
			} else {
				context._respondHttp(req, res, context._parent.httpResponse(new FaError(`route not found: ${path}`), null, context.statusCode.notFound));
			}
		}).catch(function (e) {
			context._respondHttp(req, res, context._parent.httpResponse(new FaError(e), null, context.statusCode.internalServerError));
		});
	};

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
					content = Buffer.from(this._parent.converter.toJson(responseClass.get.content));
					break;
				case this.contentType.urlencoded:
					content = Buffer.from(this._parent.converter.toUrlencoded(responseClass.get.content));
					break;
				case this.contentType.xml:
					content = Buffer.from(this._parent.converter.toXml(responseClass.get.content));
					break;
				default:
					content = this._parent.converter.toDefault(responseClass.get.content);
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
		if (content.byteLength) {
			res.setHeader('Accept-Ranges', 'bytes');
			res.setHeader('Content-Length', content.byteLength);
		} else if (content.length) {
			res.setHeader('Content-Length', content.length);
		}
		// consoleLog(Url.parse(req.url).pathname, typeof content, content.length, content.byteLength);
		res.statusCode = statusCode;
		res.write(content);
		res.end();
	}

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
			this._respondHttp(req, res, Response);
		} catch (e) {
			let Error = new FaError(e, false);
			Error.appendTrace(this.router.trace(path));
			this._respondHttp(req, res, this._parent.httpResponse(Error, null, this.statusCode.internalServerError));
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
		this.file.asByte(filename, true).then(function (data) {
			context._respondHttp(req, res, context._parent.httpResponse(data, type, context.statusCode.ok));
		}).catch(function (e) {
			context._respondHttp(req, res, context._parent.httpResponse(e, type, context.statusCode.internalServerError));
		});
	}
};
