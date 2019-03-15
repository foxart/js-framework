"use strict";
/*node*/
const
	Fs = require('fs'),
	FastXmlParser = require('fast-xml-parser'),
	// Http = require('nodejs/vendor/fa/Http'),
	Http = require('http'),
	MimeTypes = require('mime-types'),
	Querystring = require('querystring'),
	Url = require('url');
/*services*/
const FaBeautify = require('../beautify');
/**
 *
 * @param configuration
 * @returns {{}}
 */
module.exports = function (configuration) {
	/*this*/
	let module = {};
	/*variables*/
	let handler_list = {};
	/**
	 *
	 * @param configuration
	 */
	let createHttpServer = function (configuration) {
		module.configuration = configuration;
		const Server = Http.createServer(function (request, response) {
			serveHttpServer(request, response);
		});
		Server.listen(configuration.port, function () {
			// console.log(`http | ${configuration.host}:${configuration.port}/${configuration.path}`);
		});
		return Server;
	};
	/*create*/
	new createHttpServer(configuration);

	/**
	 *
	 * @param xml
	 * @returns {boolean}
	 */
	function checkXml(xml) {
		return FastXmlParser.validate(xml) === true;
	}

	/**
	 *
	 * @param json
	 * @returns {boolean}
	 */
	function checkJson(json) {
		try {
			JSON.parse(json);
			return true;
		} catch (error) {
			return false;
		}
	}

	/**
	 *
	 * @param method
	 * @constructor
	 */
	function HttpRouterHandler(method) {
		/**
		 *
		 * @param module
		 * @param request
		 * @param response
		 */
		this.process = function (module, request, response) {
			return method.call(this, module, request, response);
		}
	}

	/**
	 *
	 * @param request
	 * @param response
	 */
	function serveHttpServer(request, response) {
		let url = Url.parse(request.url, true);
		let http_handler = registerHandler(url.pathname);
		let body = '';
		request.on('data', function (chunk) {
			body += chunk;
		});
		request.on('end', function () {
			// consoleLog(url.query);
			// consoleLog(body);
			let data = {
				path: url.pathname,
				method: request.method.toLowerCase(),
				headers: request.headers,
				get: {},
				post: {},
			};
			// server1.console.log(url);
			// server1.console.warn(body);
			// if (Check.empty(url.query) === false) {
			if (url.query) {
				data['get'] = parseParameters(url.query);
			}
			// if (Check.against(request.method, ["PATCH", "POST", "PUT"]) === true) {
			if (["PATCH", "POST", "PUT"].indexOf(request.method) !== -1) {
				// data['post'] = parseData(body);
				if (checkXml(body) === true) {
					data['post'] = body;
				} else if (checkJson(body) === true) {
					data['post'] = JSON.parse(body);
				} else {
					// result = Querystring.parse(data);
					data['post'] = parseParameters(Querystring.parse(body, null, null, {
						decodeURIComponent: Querystring.unescape(),
						maxKeys: 0
					}));
				}
			}
			if (http_handler !== undefined) {
				http_handler.process.call(module, response, data);
			} else {
				module.serveHtml404(response, request.url);
			}
		});
	}

	/**
	 *
	 * @param parameters
	 */
	function parseParameters(parameters) {
		let result = {};
		let keys = Object.keys(parameters);
		keys.forEach(function (key) {
			if (key.match(/([^\[]+)\[([^\]]+)]/g)) {
				key.replace(/([^\[]+)\[([^\]]+)]/g, function ($0, $1, $2) {
					if (Array.isArray(result[$1]) === false) {
						result[$1] = [];
					}
					result[$1][$2] = parameters[key];
				});
			} else {
				result[key] = parameters[key];
			}
		});
		return result;
	}

	/**
	 *
	 * @param pathname
	 * @returns {*}
	 */
	function registerHandler(pathname) {
		let result;
		let pattern = /\.[0-9a-z]+$/i;
		let match = pathname.match(pattern);
		if (match !== null) {
			// switch (match[0]) {
			// 	case '.css':
			// 		result = handler_list['File'];
			// 		break;
			// 	case '.js':
			// 		result = handler_list['File'];
			// 		break;
			// }
			result = handler_list['file'];
		} else {
			result = handler_list[pathname];
		}
		return result;
	}

	// function matchHandler(pathname) {
	// 	let search = '/train/vehicle/{a}/database/{id}';
	// 	let regular = /({.+}).+/i;
	// 	let found = search.match(regular);
	// 	server1.console.log('FOUND');
	// 	server1.console.log(found);
	// }
	handler_list['file'] = new HttpRouterHandler(function (response, data) {
		let filename = data.path;
		if (Fs.existsSync(this.configuration.path + filename)) {
			let body = Fs.readFileSync(this.configuration.path + filename);
			if (response._header === null) {
				response.writeHead(200, {
					"Content-Type": MimeTypes.lookup(filename)
				});
			}
			response.write(body);
			response.end();
		} else {
			response.writeHead(404);
			response.end();
		}
	});
	/**
	 *
	 * @param url
	 * @param callback
	 */
	module.attachHandler = function (url, callback) {
		handler_list[url] = new HttpRouterHandler(callback);
	};
	/**
	 *
	 * @param url
	 */
	module.detachHandler = function (url) {
		delete handler_list[url];
	};
	/**
	 *
	 * @param url
	 */
	module.getHandler = function (url) {
		return url !== undefined ? handler_list[url] : handler_list;
	};
	module.getConfiguration = function () {
	};
	/**
	 *
	 * @param response
	 * @param message
	 */
	module.serveHtml404 = function (response, message) {
		let html = "<h1>404</h1>" +
			"<div>Route not found: <code>{message}</code></div>"
			+ "<div>Configuration: <code>" + JSON.stringify(this.configuration) + "</code></div>";
		response.writeHead(404, {
			"Content-Type": "text/html",//request.headers.accepts || "text/html";
		});
		response.write(html.replace("{message}", message));
		response.end();
	};
	/**
	 *
	 * @param response
	 * @param message
	 */
	module.serveHtml500 = function (response, message) {
		let html = "<h1>500</h1>" +
			"<div>" +
			"File not found: <code>{message}</code>" +
			"</div>";
		response.writeHead(500, {
			"Content-Type": "text/html",//request.headers.accepts || "text/html";
		});
		response.write(html.replace("{message}", message));
		response.end();
	};
	/**
	 *
	 * @param response
	 * @param status
	 * @param headers
	 */
	module.serveHeader = function (response, status, headers) {
		response.writeHead(status, headers);
	};
	// module.createUrl = function (url) {
	// 	return "<a href='" + protocol + '://' + host + ':' + port + path + url.href + "'>" + url.text + '</a>';
	// };
	/**
	 *
	 * @param filename
	 * @returns {string}
	 */
	module.requireFile = function (filename) {
		// let File = Fs.readFileSync(HttpServerApi.configuration.path + '/train/Volkswagen.jpg');
		// let base64Image = new Buffer(File, 'binary').toString('base64');
		let filepath = this.configuration.path + filename;
		// server1.console.log(filepath)
		if (Fs.existsSync(filepath)) {
			return Fs.readFileSync(filepath).toString();
		} else {
			return "<div>File not found: <code>" + filepath + "</code></div>";
		}
	};
	/**
	 *
	 * @param response
	 * @param callback
	 */
	module.respondeWithData = function (response, callback) {
		let data;
		if (callback !== undefined) {
			data = callback.call(this);
		}
		if (response._header === null) {
			response.writeHead(200);
		}
		if (data !== undefined) {
			if (typeof data === 'string') {
				response.write(data);
			} else {
				response.write(FaBeautify.extended(data));
			}
		}
		response.end();
	};
	/**
	 *
	 * @param response
	 * @param filename
	 * @param callback
	 */
	module.respondeWithFile = function (response, filename, callback) {
		let data;
		let filepath = this.configuration.path + filename;
		if (Fs.existsSync(filepath)) {
			let file = Fs.readFileSync(filepath);
			if (callback !== undefined) {
				data = callback.call(this, file.toString());
			} else {
				data = file;
			}
			let body = data === undefined ? '' : data;
			if (response._header === null) {
				response.writeHead(200, {
					"Content-Type": MimeTypes.lookup(filename)
				});
			}
			response.write(body);
			response.end();
		} else {
			module.serveHtml500(response, filepath);
		}
	};
	/**
	 *
	 */
	return module;
};

