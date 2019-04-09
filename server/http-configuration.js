"use strict";
const MergeDeep = require("merge-deep");

/**
 *
 * @type {FaHttpConfiguration}
 */
class FaHttpConfiguration {
	constructor(configuration) {
		return MergeDeep(this._http, configuration);
	}

	// _extendConfiguration(what, wherewith) {
	// 	if (typeof wherewith !== 'object') {
	// 		wherewith = {};
	// 	}
	// 	return Object.assign({}, what, Object.keys(wherewith).filter(function (key) {
	// 		return Object.keys(what).includes(key)
	// 	}).reduce(function (obj, key) {
	// 		obj[key] = wherewith[key];
	// 		return obj;
	// 	}, {}));
	// }
	/**
	 *
	 * @return {{protocol: string, host: string, port: number, path: string, converter: {}}}
	 * @private
	 */
	get _http() {
		return {
			protocol: 'http',
			host: 'localhost',
			port: 80,
			path: '/web',
			converter: {
				// fromXml: this._converterFromXml,
				// toXml: this._converterToXml,
			},
		}
	};

	/**
	 *
	 * @return {{attributeNamePrefix: string, attrNodeName: string, textNodeName: string, ignoreAttributes: boolean, ignoreNameSpace: boolean, allowBooleanAttributes: boolean, parseNodeValue: boolean, parseAttributeValue: boolean, trimValues: boolean, cdataTagName: string, cdataPositionChar: string, localeRange: string, parseTrueNumberOnly: boolean}}
	 * @private
	 */
	get _converterFromXml() {
		return {
			attributeNamePrefix: "@_",
			attrNodeName: "attr", //default is 'false'
			textNodeName: "#text", //default is '#text'
			ignoreAttributes: true, //default is 'true'
			ignoreNameSpace: false, //default is 'false'
			allowBooleanAttributes: false, //default is 'false'
			parseNodeValue: true, //default is 'true'
			parseAttributeValue: false, //default is 'false'
			trimValues: true, //default is 'true'
			cdataTagName: "__cdata", //default is 'false'
			cdataPositionChar: "\\c", //default is '\\c'
			localeRange: "", //To support non english character in tag/attribute values.
			parseTrueNumberOnly: false,
			// attrValueProcessor: a => he.decode(a, {isAttributeValue: true}),//default is a=>a
			// tagValueProcessor : a => he.decode(a) //default is a=>a
		};
	}

	/**
	 *
	 * @return {{attributeNamePrefix: string, attrNodeName: string, textNodeName: string, ignoreAttributes: boolean, cdataTagName: string, cdataPositionChar: string, format: boolean, indentBy: string, supressEmptyNode: boolean}}
	 * @private
	 */
	get _converterToXml() {
		return {
			attributeNamePrefix: "@_", //default is '@_'
			attrNodeName: "@", //default is false
			textNodeName: "#text", //default is 'text'
			ignoreAttributes: false, //default is 'true'
			cdataTagName: "__cdata", //default is 'false'
			cdataPositionChar: "\\c", //default is '\\c'
			format: false, //default is 'false'
			indentBy: "  ", //default is '  '
			supressEmptyNode: false, //default is 'false'
			// tagValueProcessor: a=> he.encode(a, { useNamedReferences: true}),// default is a=>a
			// attrValueProcessor: a=> he.encode(a, {isAttributeValue: isAttribute, useNamedReferences: true})// default is a=>a
		};
	}
}

/**
 *
 * @param configuration {Object}
 * @return {FaHttpConfiguration}
 */
module.exports = function (configuration = null) {
	if (configuration) {
		return new FaHttpConfiguration(configuration);
	} else {
		return FaHttpConfiguration;
	}
};
