"use strict";
// function checkJson(json) {
// 	try {
// 		JSON.parse(json);
// 		return true;
// 	} catch (error) {
// 		return false;
// 	}
// }
//
// exports.tryParseJson = function (data) {
// 	if (checkJson(data)) {
// 		return JSON.parse(data);
// 	} else {
// 		return data;
// 	}
// };
/*node*/
const
	Dns = require('dns'),
	Http = require('http'),
	Https = require('https'),
	Querystring = require('querystring'),
	UtilsExtend = require('utils-extend');
/*fa*/
// const
// 	FaPromise = require('./promise/index');
/*models*/
const
	Model = require('./model');

/**
 *
 * @param options
 * @returns {*}
 */
function requestOptions(options) {
	/* https://nodejs.org/api/http.html#http_http_request_options_callback */
	return Object.assign({}, {
		host: "localhost",
		port: 80,
		method: "get",
		// path: "/",
		// headers: {},
		timeout: 100,
		encoding: null,
	}, options);
}

/**
 *
 * @param callback
 */
// todo remove when it will be promise
function extractCallback(callback) {
	return UtilsExtend.extend({}, {
		onSuccess: function (body, response) {
			console.log({
				message: "Curl success",
				data: {
					body: body,
					response: response,
				}
			});
		},
		onError: function (error) {
			console.log({
				message: "Curl error",
				data: error,
			});
		}
	}, callback);
}

/**
 *
 * @param options
 * @param data
 * @param callback Object
 * @param protocol
 */
function requestCallback(options, data, callback, protocol) {
	let HttpRequest;
	let RequestOptions = requestOptions(options);
	let RequestCallback = extractCallback(callback);
	RequestOptions.method = RequestOptions.method.toUpperCase();
	if (protocol === "https") {
		HttpRequest = Https.request(RequestOptions);
	} else {
		HttpRequest = Http.request(RequestOptions);
	}
	if (data && ["PATCH", "POST", "PUT"].indexOf(RequestOptions.method) !== -1) {
		if (typeof data === "string") {
			HttpRequest.write(data);
		} else {
			HttpRequest.write(Querystring.stringify(data));
		}
	}
	HttpRequest.on("error", function (error) {
		RequestCallback["onError"].call(HttpRequest, error)
	});
	HttpRequest.on("response", function (response) {
		response.setEncoding(RequestOptions.encoding);
		let body = "";
		response.on("data", function (chunk) {
			body += chunk;
		});
		response.on("end", function () {
			RequestCallback["onSuccess"].call(HttpRequest, body, response);
		});
	});
	HttpRequest.end();
}

/**
 * @deprecated
 * @param options
 * @param data
 * @param callback
 */
exports.http = function (options, data, callback) {
	requestCallback(options, data, callback, "http")
};
/**
 * @deprecated
 * @param options
 * @param data
 * @param callback
 */
exports.https = function (options, data, callback) {
	requestCallback(options, data, callback, "https")
};

/**
 * @deprecated
 * @param protocol
 * @param options
 * @param data
 * @returns {Promise<any>}
 */
function requestPromise(protocol, options, data) {
	// console.info(arguments);
	return new Promise(function (resolve, reject) {
		let HttpRequest;
		let RequestOptions = requestOptions(options);
		RequestOptions.method = RequestOptions.method.toUpperCase();
		HttpRequest = protocol === 'https' ? Https.request(RequestOptions) : Http.request(RequestOptions);
		if (data && ['PATCH', 'POST', 'PUT'].indexOf(RequestOptions.method) !== -1) {
			if (typeof data === "string") {
				HttpRequest.write(data);
			} else {
				HttpRequest.write(Querystring.stringify(data));
			}
		}
		HttpRequest.on('error', function (e) {
			reject(e);
		});
		HttpRequest.on('response', function (response) {
			response.setEncoding(RequestOptions.encoding);
			let body = '';
			response.on('data', function (chunk) {
				body += chunk;
			});
			response.on('end', function () {
				resolve(body);
			});
		});
		HttpRequest.end();
	});
}

/**
 * @deprecated
 * @param options
 * @param data
 * @returns {*}
 */
exports.httpPromise = function (options, data) {
	// console.error(options);
	return requestPromise("http", options, data)
};
/**
 * @deprecated
 * @param options
 * @param data
 * @returns {*}
 */
exports.httpsPromise = function (options, data) {
	// console.error(options);
	return requestPromise("https", options, data)
};
/**
 *
 * @type {Model}
 */
const CurlModel = new Model();
CurlModel.setAdapter = function () {
	/* https://nodejs.org/api/http.html#http_http_request_options_callback */
	return {
		protocol: function (record) {
			return record['protocol'].toUpperCase() === 'HTTPS' ? 'HTTPS' : 'HTTP'
		},
		timeout: function (record) {
			return record['timeout'] ? record['timeout'] : 5000
		},
		request: {
			// hostname: function (record) {
			// 	return record['hostname'] ? record['hostname'] : 'localhost'
			// },
			hostname: 'hostname',
			port: function (record) {
				return record['port'] ? record['port'] : 80
			},
			method: function (record) {
				return record['method'] ? record['method'].toUpperCase() : 'GET'
			},
			path: function (record) {
				return record['path'] ? record['path'] : null
			},
			headers: function (record) {
				return record['headers'] ? record['headers'] : {}
			},
			encoding: function (record) {
				return record['encoding'] ? record['encoding'] : null //utf8, binary
			},
		},
	}
};

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
 * @param options
 * @param data
 * @returns {Promise}
 */
exports.request = function (options, data) {
	return new Promise(function (resolve, reject) {
		CurlModel.loadData(options);
		CurlModel.applyAdapter();
		let model = CurlModel.getData;
		checkHost(model).then(function () {
			let Request = model.protocol === 'HTTPS' ? Https.request(model.request) : Http.request(model.request);
			if (data && ['PATCH', 'POST', 'PUT'].indexOf(model.request.method) !== -1) {
				if (typeof data === 'string') {
					Request.write(data);
				} else {
					Request.write(Querystring.stringify(data));
				}
			}
			Request.on('socket', function (Socket) {
				// console.warn(model.timeout);
				// model.timeout = 10;
				Socket.setTimeout(model.timeout);
				Socket.on('timeout', function () {
					Request.abort();
				});
			});
			Request.on('response', function (Response) {
				Response.setEncoding(model.request.encoding);
				let body = '';
				Response.on('data', function (chunk) {
					body += chunk;
				});
				Response.on('end', function () {
					resolve(body);
				});
			});
			Request.on('error', function (e) {
				// console.warn(options, data)
				reject(e);
			});
			Request.end();
		}).catch(function (e) {
			reject(e);
		});
	});
};

