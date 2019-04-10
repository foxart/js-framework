/*https://socket.io/docs/server-api/*/
"use strict";
const MergeDeep = require("merge-deep");
/**
 *
 * @type {module.FaServerConfigurationClass}
 */
module.exports = class FaServerConfigurationClass {
	constructor(configuration) {
		return MergeDeep(this._http, configuration['http']);
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
	 * @return {{Http: *, socket: *, converter: {fromXml: *, toXml: *}}}
	 */
	get get() {
		return this._configuration;
	}

	/**
	 *
	 * @return {{protocol: string, host: string, port: number, path: string}}
	 * @private
	 */
	get _http() {
		return {
			protocol: 'http',
			host: 'localhost',
			port: 80,
			path: '/web',
			converter: {
				fromXml: this._converterFromXml,
				toXml: this._converterToXml,
			},
		}
	};

	/**
	 *
	 * @return {{path: string, serveClient: boolean, cookie: boolean, pingTimeout: number, pingInterval: number}}
	 * @private
	 */
	get _socket() {
		return {
			path: '/socket.io',
			/*If value is true the attached server1.server1 (see Server#attach) will serve the client files. Defaults to true. This method has no effect after attach is called. If no arguments are supplied this method returns the current value.*/
			serveClient: false,
			/*name of the HTTP cookie that contains the client sid to send as part of handshake response headers. Set to false to not send one.*/
			cookie: false,
			/*The pingTimeout and pingInterval parameters will impact the delay before a client knows the server1.server1 is not available anymore. For example, if the underlying TCP connection is not closed properly due to a network issue, a client may have to wait up to pingTimeout + pingInterval ms before getting a disconnect event.*/
			/*how many ms without a pong packet to consider the connection closed*/
			pingTimeout: 2500, //default 5000
			/*how many ms before sending a new ping packet*/
			pingInterval: 2500, //default 10000
		};
	}

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
};
