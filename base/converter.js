'use strict';
/*modules*/
/** @type {*} */
const FastXmlParser = require("fast-xml-parser");
/** @type {*} */
const QueryString = require("qs");
/*fa*/
const FaError = require("fa-nodejs/base/error");
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
		// this._type = new FaHttpContentType();
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
	 * @return {boolean}
	 */
	isUrlEncoded(data) {
		return typeof this.fromUrlEncoded(data) === "object";
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
		// if (data instanceof Error) {
		// 	data = new FaError(data);
		// }
		return this.isString(data) ? data : JSON.stringify(data, null, 128);
	}

	/**
	 *
	 * @param data {object}
	 * @private
	 */
	_filterXml(data) {
		let self = this;
		let result = {};
		if (data === undefined) {
			// 	result = "undefined";
		} else if (data === null) {
			result = "null";
		} else if (Array.isArray(data)) {
			let res = [];
			data.forEach(function (value, key) {
				res[key] = self._filterXml(value);
			});
			result = res;
		} else if (typeof data === "object") {
			Object.entries(data).forEach(function ([key, value]) {
				result[key] = self._filterXml(value);
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
	fromXml(data, options = {}) {
		let result;
		try {
			result = FastXmlParser.parse(data, Object.assign({}, this._fromXml, options))
		} catch (e) {
			console.error(e);
			// result = {}
			result = data
		}
		// let result = this.isXml(data) ? FastXmlParser.parse(data, Object.assign({}, this._fromXml, options)) : {};
		return result["xml"] !== undefined ? result["xml"] : result;
	}

	/**
	 *
	 * @param data {object|string}
	 * @param options {object}
	 * @return {string}
	 */
	toXml(data, options = {}) {
		// data = undefined;
		// data = 0;
		// data = 1;
		// data = false;
		// data = true;
		// data = {a: undefined};
		// data = {a: null};
		// data = {a: true};
		// data = {xml: false};
		// data = {xml: undefined};
		// data = null;
		let xml = {};
		data = data === null ? {} : data;
		if (typeof data === "object" && data.hasOwnProperty("xml") === false) {
			xml["xml"] = this._filterXml(data);
		} else if (typeof data !== "object") {
			xml["xml"] = this._filterXml(data);
		} else {
			xml = this._filterXml(data);
		}
		// console.warn(1, xml);
		// console.warn(2, FastXmlParser.j2xParser(Object.assign({}, this._toXml, options)).parse(xml));
		return new FastXmlParser.j2xParser(Object.assign({}, this._toXml, options)).parse(xml);
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
	toUrlEncoded(data) {
		return encodeURIComponent(QueryString.stringify(data));
		// return QueryString.stringify(data);
	}

	/**
	 *
	 * @param data {object|string}
	 * @return {string}
	 */
	toText(data) {
		return this.isString(data) ? data : FaBeautify.plain(data);
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
