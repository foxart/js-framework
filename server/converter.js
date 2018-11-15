'use strict';
/*node*/
const
	FastXmlParser = require('fast-xml-parser'),
	Querystrings = require('querystrings');
/*vendor*/
const
	FaBeautify = require('../beautify/index');
/**
 *
 * @type {module.FaServerConverterClass}
 */
module.exports = class FaServerConverterClass {
	/**
	 *
	 * @param FaServerConverterConfiguration {{fromXml: *, toXml: *}}
	 */
	constructor(FaServerConverterConfiguration) {
		this._fromXml = FaServerConverterConfiguration.fromXml;
		this._toXml = FaServerConverterConfiguration.toXml;
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
	 * @param data {object|string}
	 * @return {object|string}
	 */
	toJson(data) {
		return this.isString(data) ? data : JSON.stringify(data);
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
	 * @param data {object|string}
	 * @return {string}
	 */
	toString(data) {
		return this.isString(data) ? data : FaBeautify.extended(data);
	}

	/**
	 *
	 * @param data {string}
	 * @return {object|string}
	 */
	fromUrlEncoded(data) {
		return Querystrings.parse(decodeURIComponent(data));
	}

	/**
	 *
	 * @param data {object|string}
	 */
	toUrlencoded(data) {
		return (encodeURIComponent(Querystrings.stringify(data)));
	}

	/**
	 *
	 * @param data {object|string}
	 * @return {string}
	 */
	toDefault(data) {
		return this.isString(data) ? data : FaBeautify.extended(data);
	}
};
