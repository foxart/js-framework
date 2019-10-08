"use strict";
/** @type {*} */
const Cookie = require("cookie");
const Url = require("url");
/*fa*/
const FaConverter = require("fa-nodejs/base/converter");
/*vars*/
const BODY_SEPARATOR = "\r\n"; // RFC2046
const SECTION_SEPARATOR = "\r\n\r\n"; // RFC2046
const HEADER_SEPARATOR = ":"; // RFC2046
const PARAMETER_SEPARATOR = "="; // RFC2046
class FaHttpRequest {
	/**
	 *
	 * @param conf
	 * @param method
	 * @param headers
	 * @param url
	 * @param body
	 * @return {{path: string, headers: *, request: {}, input: *, method: string, post, get}}
	 */
	constructor(conf, method, headers, url, body) {
		this._Cookie = Cookie;
		// this._FaBaseConverter = new FaBaseConverter(conf);
	}

	/**
	 *
	 * @return {FaConverter}
	 * @private
	 */
	// get _converter() {
	// 	return this._FaBaseConverter;
	// }
	parseCookie(cookies) {
		let result = this._Cookie.parse(cookies);
		if (Object.entries(result).length !== 0) {
			return result;
		} else {
			return null;
		}
	}

	// noinspection JSMethodCanBeStatic
	parseClient(req) {
		let ip = (req.headers['x-forwarded-for'] || '').split(',').pop()
			|| req.connection.remoteAddress
			|| req.socket.remoteAddress
			|| req.connection.socket.remoteAddress;
		if (ip.substr(0, 7) === "::ffff:") {
			ip = ip.substr(7)
		}
		return {
			ip: ip
		}
	}

	parseMultipart(body) {
		let post = [];
		let files = [];
		let bodyLines = body.split(BODY_SEPARATOR);
		let boundary = bodyLines.shift();
		let bodyContent = bodyLines.join(BODY_SEPARATOR).slice(0, -`${BODY_SEPARATOR}${boundary}--${BODY_SEPARATOR}`.length);
		let sections = bodyContent.split(`${BODY_SEPARATOR}${boundary}${BODY_SEPARATOR}`);
		let sectionsLength = sections.length;
		for (let i = 0; i < sectionsLength; i++) {
			let sectionLines = sections[i].split(SECTION_SEPARATOR);
			let header = sectionLines.shift().split(BODY_SEPARATOR).filter(item => !!item);
			let value = sectionLines.join(SECTION_SEPARATOR);
			let file = this.parseMultipartHeader(header);
			if (typeof file === "object" && Object.entries(file).length !== 0) {
				files.push({
					content: Buffer.from(value, 'binary'),
					filename: file["filename"],
					length: value.length,
					name: file["name"],
					type: file["type"],
				});
			} else {
				post.push({[file]: value});
			}
		}
		post = post.map(function (item) {
			return `${Object.keys(item)}=${Object.values(item)}`;
		});
		return {
			files: files.length === 0 ? null : files,
			post: post.length === 0 ? null : FaConverter.fromUrlEncoded(post.join("&")),
		};
	}

	parseMultipartHeader(header) {
		let result = {};
		let headerLength = header.length;
		for (let i = 0; i < headerLength; i++) {
			let item = header[i];
			let keyValue = item.split(HEADER_SEPARATOR);
			let key = keyValue[0].trim().toLowerCase();
			let value = keyValue[1].trim();
			if (key === "content-disposition") {
				let parameters = value.split(';').filter(function (filter) {
					return filter.indexOf(PARAMETER_SEPARATOR) !== -1;
				}).map(function (item) {
					// console.info(item)
					let result = item.trim().split(PARAMETER_SEPARATOR);
					result[1] = result[1].replace(/^[\s'"]+|[\s'"]+$/g, "");
					return result;
				});
				if (parameters.length > 1) {
					parameters.map(function (item) {
						result[item[0]] = item[1];
					});
				} else {
					result = parameters[0][1];
				}
			} else if (key === "content-type") {
				result["type"] = value;
			} else {
				throw new Error(`unknown multipart section type: ${key}`);
				// result[key] = value;
			}
		}
		return result;
	}

	// noinspection JSMethodCanBeStatic
	parseUrl(url) {
		return Url.parse(url);
	}
}

/**
 *
 * @type {FaHttpRequest}
 */
module.exports = FaHttpRequest;
