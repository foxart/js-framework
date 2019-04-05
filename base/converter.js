'use strict';
/*node*/
/** @type {*} */
const FastXmlParser = require("fast-xml-parser");
/** @type {*} */
const QueryString = require("qs");
/*fa*/
const FaBeautify = require("fa-nodejs/beautify");

class FaBaseConverter {
	/**
	 *
	 * @param configuration {{fromXml: *, toXml: *}}
	 */
	constructor(configuration) {
		this._fromXml = configuration.fromXml;
		this._toXml = configuration.toXml;
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
		return FastXmlParser.validate(data) === true;
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
		return this.isString(data) ? data : JSON.stringify(data);
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
		return this.isString(data) ? data : new FastXmlParser.j2xParser(Object.assign({}, this._toXml, options)).parse(data);
	}

	// /**
	//  *
	//  * @param data {object|string}
	//  * @return {string}
	//  */
	// toString(data) {
	// 	return this.isString(data) ? data : FaBeautify.extended(data);
	// }
	/**
	 *
	 * @param data {string}
	 * @return {object|string}
	 */
	fromUrlEncoded(data) {
		return QueryString.parse(data);
	}

	/**
	 *
	 * @param data {object|string}
	 */
	toUrlencoded(data) {
		return (encodeURIComponent(QueryString.stringify(data)));
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

