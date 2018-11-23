'use strict';
/*node*/
const
	FastXmlParser = require('fast-xml-parser');
/**
 *
 * @param format
 */
module.exports = function (format) {
	/*this*/
	let module = {};
	module.formats = {
		'json': 'application/json',
		'xml': 'application/xml',
		'text': 'text/plain',
	};

	/**
	 *
	 * @param response
	 * @param callback
	 */
	function writeResponse(response, callback) {
		let data;
		if (callback !== undefined) {
			data = callback.call(this);
		}
		if (response._header === null) {
			response.writeHead(200);
		}
		if (data !== undefined) {
			response.write(data);
		}
		response.end();
	}

	function testFormat(data, method) {
		const Curl = require('./curl');
		let path;
		if (method === 'get') {
			path = '/test.php?' + data;
		} else {
			path = '/test.php';
		}
		let headers = {
			'content-type': 'application/x-www-form-urlencoded'
		};
		Curl.http({
			host: 'nginx',
			method: method,
			path: path,
			headers: headers
		}, data, {
			onSuccess: function (response_data) {
				console.info(response_data);
			},
			onError: function (error) {
				console.info(error);
			}
		});
	}

	//todo rewrite to recursive
	function formatDataText(data, status) {
		let array = [];
		let index = 'data';
		data.map(function (object, object_key) {
			Object.keys(object).forEach(function (key) {
				array.push(index + '[' + object_key + ']' + '[' + key + ']=' + object[key]);
			});
		});
		let result;
		if (array.length > 0) {
			result = 'status=' + status + '&' + array.join('&');
		} else {
			result = 'status=' + status + '&' + index + '=';
		}
		return result;
	}

	function formatDataXml(data, status) {
		let options = {
			attributeNamePrefix: "@_",
			attrNodeName: "@", //default is false
			textNodeName: "#text",
			ignoreAttributes: false,
			// cdataTagName: "__cdata", //default is false
			// cdataPositionChar: "\\c",
			format: true,
			indentBy: "    ",
			supressEmptyNode: false,
			// tagValueProcessor: a => he.encode(a, {useNamedReferences: true}),// default is a=>a
			// attrValueProcessor: a => he.encode(a, {isAttributeValue: isAttribute, useNamedReferences: true})// default is a=>a
		};
		let result = new FastXmlParser.j2xParser(options).parse({status: status, data: data});
		return '<?xml version="1.0"?><document>' + result + '</document>';
	}

	function formatData(format, status, data) {
		let result;
		switch (format) {
			case 'json':
				result = JSON.stringify({
					status: status,
					data: data,
				});
				break;
			case 'xml':
				result = formatDataXml(data, status);
				break;
			default:
				//todo rewrite to recursive
				if (Array.isArray(data)) {
					result = formatDataText(data, status);
				} else {
					result = formatDataText([data], status);
				}
		}
		return result;
	}

	module.getContentTypeByFormat = function (type) {
		return {"Content-Type": this.formats[type] !== undefined ? this.formats[type] : 'text/plain'};
	};
	module.getFormatByContentType = function (content_type) {
		let format;
		if (Object.values(this.formats).indexOf(content_type) > -1) {
			format = Object.keys(this.formats).find(function name(key) {
				return module.formats[key] === content_type;
			})
		} else {
			format = this.format
		}
		return format;
	};
	//todo exist if this funtion is in need
	module.checkHeader = function (headers, key, value) {
		let result = false;
		for (let property in headers) {
			if (headers.hasOwnProperty(property)) {
				if (property.toLowerCase() === key.toLowerCase() && headers[property].toLowerCase() === value) {
					result = true;
					break;
				}
			}
		}
		return result;
	};
	module.getHeader = function (key, headers) {
		let result = undefined;
		for (let property in headers) {
			if (headers.hasOwnProperty(property)) {
				if (property.toLowerCase() === key.toLowerCase()) {
					result = headers[property].toLowerCase();
					break;
				}
			}
		}
		return result;
	};
	/**
	 *
	 * @param response
	 * @param request
	 * @param data
	 */
	module.responseGet = function (response, request, data) {
		let format = module.getFormatByContentType(module.getHeader('content-type', request.headers));
		let content_type = module.getContentTypeByFormat(format);
		writeResponse(response, function () {
			response.writeHead(200, content_type);
			return formatData(format, 200, data);
		})
	};
	/**
	 *
	 * @param response
	 * @param request
	 * @param data
	 */
	module.responseDelete = function (response, request, data) {
		let format = module.getFormatByContentType(module.getHeader('content-type', request.headers));
		let content_type = module.getContentTypeByFormat(format);
		writeResponse(response, function () {
			response.writeHead(204, content_type);
			return formatData(format, 204, data);
		})
	};
	/**
	 *
	 * @param response
	 * @param request
	 * @param data
	 */
	module.responsePatch = function (response, request, data) {
		let format = module.getFormatByContentType(module.getHeader('content-type', request.headers));
		let content_type = module.getContentTypeByFormat(format);
		writeResponse(response, function () {
			response.writeHead(202, content_type);
			return formatData(format, 202, data);
		})
	};
	/**
	 *
	 * @param response
	 * @param request
	 * @param data
	 */
	module.responsePost = function (response, request, data) {
		let format = module.getFormatByContentType(module.getHeader('content-type', request.headers));
		let content_type = module.getContentTypeByFormat(format);
		writeResponse(response, function () {
			response.writeHead(201, content_type);
			return formatData(format, 201, data);
		})
	};
	/**
	 *
	 * @param response
	 * @param request
	 * @param data
	 */
	module.responsePut = function (response, request, data) {
		let format = module.getFormatByContentType(module.getHeader('content-type', request.headers));
		let content_type = module.getContentTypeByFormat(format);
		writeResponse(response, function () {
			response.writeHead(200, content_type);
			return formatData(format, 200, data);
		})
	};
	/**
	 * trace error
	 */
	const
		ModuleTrace = require('./trace/deprecated-index');
	module.getError = function (error) {
		if (Array.isArray(error.trace)) {
			error.trace.push(ModuleTrace.extractString(ModuleTrace.getData(5)));
		} else {
			error.trace = [ModuleTrace.extractString(ModuleTrace.getData(5))];
		}
		return ({
			name: error.name,
			message: error.message,
			trace: error.trace.reverse(),
		});
	};
	/**
	 *
	 * @param response
	 * @param request
	 * @param error
	 */

	module.responseNotFound = function (response, request, error) {
		let format = module.getFormatByContentType(module.getHeader('content-type', request.headers));
		let content_type = module.getContentTypeByFormat(format);
		writeResponse(response, function () {
			response.writeHead(404, content_type);
			return formatData(format, 404, module.getError(error));
		})
	};
	/**
	 *
	 * @param response
	 * @param request
	 * @param error
	 */
	module.responseBadRequest = function (response, request, error) {
		let format = module.getFormatByContentType(module.getHeader('content-type', request.headers));
		let content_type = module.getContentTypeByFormat(format);
		writeResponse(response, function () {
			response.writeHead(400, content_type);
			return formatData(format, 400, module.getError(error));
		})
	};
	/**
	 *
	 * @param response
	 * @param request
	 * @param error
	 */
	module.responseServerError = function (response, request, error) {
		let format = module.getFormatByContentType(module.getHeader('content-type', request.headers));
		let content_type = module.getContentTypeByFormat(format);
		writeResponse(response, function () {
			response.writeHead(500, content_type);
			return formatData(format, 500, module.getError(error));
		})
	};
	/**
	 *
	 * @param response
	 * @param request
	 */
	module.responseNotImplemented = function (response, request) {
		let format = module.getFormatByContentType(module.getHeader('content-type', request.headers));
		let content_type = module.getContentTypeByFormat(format);
		writeResponse(response, function () {
			response.writeHead(501, content_type);
			return formatData(format, 501, module.getError(({
				name: 'error',
				message: 'not implemented'
			})));
		})
	};
	/*constructor*/
	let createHttpApi = function (format) {
		module.format = format !== undefined ? format : 'text';
	};
	/*initialization*/
	new createHttpApi(format);
	/*finally*/
	return module;
};
