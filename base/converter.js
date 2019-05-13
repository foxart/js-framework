'use strict';
/*node*/
/** @type {*} */
const FastXmlParser = require("fast-xml-parser");
/** @type {*} */
const QueryString = require("qs");
/*fa*/
const FaBeautify = require("fa-nodejs/beautify");

// const FaHttpContentType = require("fa-nodejs/server/http-content-type");
class FaBaseConverter {
	/**
	 *
	 * @param configuration {{fromXml: *, toXml: *}}
	 */
	constructor(configuration = {}) {
		// this._trace = FaBaseTrace.trace();
		this._fromXml = configuration.fromXml;
		this._toXml = configuration.toXml;
		// this._contentType = new FaHttpContentType();
	}

	/**
	 *
	 * @param data {string}
	 * @returns {boolean}
	 */
	isJson(data) {
		try {
			JSON.parse(data);
			return true;
		} catch (e) {
			return false;
		}
	}

	isObject(data) {
		return typeof data === "object";
	}

	/**
	 *
	 * @param data
	 * @return {boolean}
	 */
	isString(data) {
		return typeof data === 'string';
	}

	/**
	 *
	 * @param data {string}
	 * @returns {boolean}
	 */
	isXml(data) {
		if (data) {
			return FastXmlParser.validate(data) === true;
		} else {
			return false;
		}
	}

	/**
	 *
	 * @param data {string}
	 * @return {object|string}
	 */
	fromJson(data) {
		return this.isJson(data) ? JSON.parse(data) : {};
	}

	/**
	 *
	 * @param data {Buffer|object|string}
	 * @return {object|string}
	 */
	toJson(data) {
		// data = data.byteLength ? data.toString() : data;
		return this.isString(data) ? data : JSON.stringify(data, null, 128);
	}

	/**
	 *
	 * @param data {string}
	 * @param options {object}
	 * @return {object|string}
	 */
	fromXml(data, options = {}) {
		return this.isXml(data) ? FastXmlParser.parse(data, Object.assign({}, this._fromXml, options)) : {};
	}

	/**
	 *
	 * @param data {object|string}
	 * @param options {object}
	 * @return {string}
	 */
	toXml(data, options = {}) {
		function filter(data) {
			// return data;
			let result = {};
			if (data === null) {
				result = "null";
			} else if (data === undefined) {
				result = "undefined";
			} else if (typeof data === "object") {
				// result = filter(obj);
				for (let key in data) {
					if (data.hasOwnProperty(key)) {
						console.log(key);
						result[key] = filter(data[key]);
					}
				}
			} else {
				console.info(data,typeof data);
				result = data;
			}
			// if (typeof obj === "object") {
			// 	for (let key in obj) {
			// 		if (obj.hasOwnProperty(key)) {
			// 			if (obj[key] === null) {
			// 				result[key] = "null";
			// 			} else if (obj[key] === undefined) {
			// 				result[key] = "undefined";
			// 			} else if (typeof obj[key] === "object") {
			// 				console.log(filter(key, obj[key]));
			// 				result[key] = filter(obj[key]);
			// 			} else {
			// 				result[key] = obj[key];
			// 			}
			// 		}
			// 	}
			// } else {
			// 	if (obj === null) {
			// 		result = "null";
			// 	} else if (obj === undefined) {
			// 		result = "undefined";
			// 	} else {
			// 		result = obj;
			// 	}
			// }
			// console.info(result);
			return result;
		}

		let xml = {};
		if (data["xml"]) {
			xml = filter(data);
		} else {
			xml["xml"] = filter(data);
		}
		console.error(xml.xml.name, xml.xml.message, xml.xml.trace);
		// log("toXml", xml);
		return new FastXmlParser.j2xParser(Object.assign({}, this._toXml, options)).parse(xml);
	}

	checkUrlEncoded(data) {
		console.error(data, typeof this.fromUrlEncoded(data));
		return typeof this.fromUrlEncoded(data) === "object";
		// if (data) {
		// } else {
		// 	return false;
		// }
	}

	/**
	 *
	 * @param data {string}
	 * @return {object|string}
	 */
	fromUrlEncoded(data) {
		return QueryString.parse(decodeURIComponent(data));
		// return QueryString.parse(data);
	}

	/**
	 *
	 * @param data {object|string}
	 */
	toUrlencoded(data) {
		return encodeURIComponent(QueryString.stringify(data));
		// return QueryString.stringify(data);
	}

	/**
	 *
	 * @param data {object|string}
	 * @return {string}
	 */
	toHtml(data) {
		return this.isString(data) ? data : FaBeautify.html(data);
	}
}

/**
 *
 * @type {FaBaseConverter}
 */
module.exports = FaBaseConverter;
