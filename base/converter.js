// attributeNamePrefix: "@_",
// attrNodeName: "attr", //default is 'false'
// textNodeName: "#text", //default is '#text'
// ignoreAttributes: false, //default is 'true'
// ignoreNameSpace: false, //default is 'false'
// allowBooleanAttributes: true, //default is 'false'
// parseNodeValue: true, //default is 'true'
// parseAttributeValue: false, //default is 'false'
// trimValues: true, //default is 'true'
// cdataTagName: "__cdata", //default is 'false'
// cdataPositionChar: "\\c", //default is '\\c'
// localeRange: "", //To support non english character in tag/attribute values.
// parseTrueNumberOnly: false,
// // attrValueProcessor: a => he.decode(a, {isAttributeValue: true}),//default is a=>a
// // tagValueProcessor : a => he.decode(a) //default is a=>a
"use strict";
/*node*/
/** @type {*} */
const FastXmlParser = require("fast-xml-parser");
/** @type {*} */
const QueryString = require("qs");
/*fa*/
const FaBeautify = require("fa-nodejs/beautify");

class FaConverter {
	/**
	 *
	 * @param configuration {{fromXml: *, toXml: *}}
	 */
	constructor(configuration = {}) {
		// this._trace = FaBaseTrace.trace();
		this._fromXml = configuration.fromXml;
		this._toXml = configuration.toXml;
		// this._type = new FaHttpContentType();
	}

	/**
	 *
	 * @param data {string}
	 * @returns {boolean}
	 */
	static isJson(data) {
		try {
			JSON.parse(data);
			return true;
		} catch (e) {
			return false;
		}
	}

	static isObject(data) {
		return typeof data === "object";
	}

	/**
	 *
	 * @param data
	 * @return {boolean}
	 */
	static isString(data) {
		return typeof data === 'string';
	}

	/**
	 *
	 * @param data {string}
	 * @return {boolean}
	 */
	static isUrlEncoded(data) {
		return typeof FaConverter.fromUrlEncoded(data) === "object";
	}

	/**
	 *
	 * @param data {string}
	 * @returns {boolean}
	 */
	static isXml(data) {
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
	static fromJson(data) {
		return FaConverter.isJson(data) ? JSON.parse(data) : {};
	}

	/**
	 *
	 * @param data {Buffer|object|string}
	 * @return {object|string}
	 */
	static toJson(data) {
		return FaConverter.isString(data) ? data : JSON.stringify(data, null, 128);
		// return FaConverter.isString(data) ? data : JSON.stringify(data);
	}

	/**
	 *
	 * @param data
	 * @private
	 */
	static _filterXml(data) {
		let result = {};
		if (data === undefined) {
			// 	result = "undefined";
		} else if (data === null) {
			result = "null";
		} else if (Array.isArray(data)) {
			let res = [];
			data.forEach(function (value, key) {
				res[key] = FaConverter._filterXml(value);
			});
			result = res;
		} else if (typeof data === "object") {
			Object.entries(data).forEach(function ([key, value]) {
				result[key] = FaConverter._filterXml(value);
			});
		} else {
			result = data;
		}
		return result;
	}

	/**
	 *
	 * @param data {string}
	 * @param options {object}
	 * @return {object|string}
	 */
	static fromXml(data, options = {}) {
		let result;
		try {
			result = FastXmlParser.parse(data, options)
		} catch (e) {
			console.error(e);
			result = data
			// result = {}
		}
		return result["xml"] !== undefined ? result["xml"] : result;
	}


	static fromTextXml(data, options = {}) {
		let result;
		try {
			result = FastXmlParser.parse(data, options)
		} catch (e) {
			console.error(e);
			result = data
			// result = {}
		}
		return result["xml"] !== undefined ? result["xml"] : result;
	}


	/**
	 *
	 * @param data {object|string}
	 * @param options {object}
	 * @return {string}
	 */
	static toXml(data, options = {}) {
		// options = {
		// 	attributeNamePrefix: "@_",
		// 	ignoreAttributes: false,
		// };
		// data = {xml: {"@_xml1": "1", a: {"@_a2": "2"}, b: 3}};
		let result;
		let xml = {};
		data = data === null ? {} : data;
		if (typeof data === "object") {
			if (data.hasOwnProperty("xml")) {
				xml = FaConverter._filterXml(data);
			} else {
				xml = FaConverter._filterXml({xml: data});
			}
		} else {
			xml = {xml: data};
		}
		result = new FastXmlParser.j2xParser(options).parse(xml);
		// console.log(data, xml, result);
		// log(result);
		return result;
	}

	static toTextXml(data, options = {}) {
		let result;
		let xml = {};
		data = data === null ? {} : data;
		if (typeof data === "object") {
			if (data.hasOwnProperty("xml")) {
				xml = FaConverter._filterXml(data["xml"]);
			} else {
				xml = FaConverter._filterXml(data);
			}
		} else {
			xml = data;
		}
		result = new FastXmlParser.j2xParser(options).parse(xml);
		// console.log(data, xml, result);
		// log(result);
		return result;
	}

	/**
	 *
	 * @param data {string}
	 * @return {object|string}
	 */
	static fromUrlEncoded(data) {
		return QueryString.parse(data);
		// return QueryString.parse(decodeURIComponent(data));
	}

	/**
	 *
	 * @param data {object|string}
	 */
	static toUrlEncoded(data) {
		return QueryString.stringify(data);
		// return encodeURIComponent(QueryString.stringify(data));
	}

	/**
	 *
	 * @param data {object|string}
	 * @return {string}
	 */
	static toText(data) {
		return FaConverter.isString(data) ? data : FaBeautify.plain(data);
	}

	/**
	 *
	 * @param data {object|string}
	 * @return {string}
	 */
	static toHtml(data) {
		return FaConverter.isString(data) ? data : FaBeautify.html(data);
	}
}

/**
 *
 * @type {FaConverter|Class}
 */
module.exports = FaConverter;
