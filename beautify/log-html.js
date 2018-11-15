'use strict';
/*node*/
/** @type Object */
const FastXmlParser = require('fast-xml-parser');
const StringifyObject = require('stringify-object');

function checkJson(json) {
	try {
		let result = JSON.parse(json);
		if (typeof result === 'object') {
			return result
		} else {
			return false;
		}
	} catch (error) {
		return false;
	}
}

function checkXml(xml) {
	if (FastXmlParser.validate(xml) === true) {//optional
		return FastXmlParser.parse(xml, {});
	} else {
		return false;
	}
}

/**
 *
 * @param json
 * @returns {string}
 */
function beautifyJson(json) {
	return '<span class="beautify-json;">JSON</span>' +
		'<span>' + beautifyObject(json) + '</span>' +
		'<span class="beautify-json;">JSON</span>';
}

function beautifyXml(xml) {
	return '<span class="beautify-xml;">XML</span>' +
		'<span>' + beautifyObject(xml) + '</span>' +
		'<span class="beautify-xml;">XML</span>';
}

function beautifyObject(message) {
	return StringifyObject(message, {
		indent: '&nbsp;&nbsp;&nbsp;',
		singleQuotes: true,
		inlineCharacterLimit: 12,
		// filter (object, property) {
		// 	return true
		// },
		transform(object, property, original) {
			if (typeof object[property] === 'boolean') {
				return '<span class="beautify-boolean;">' + original + '</span>';
			} else if (typeof object[property] === 'function') {
				return '<span class="beautify-function;">' + 'function' + '</span>';
			} else if (object[property] === null) {
				return '<span class="beautify-null;">' + original + '</span>';
			} else if (typeof object[property] === 'number') {
				return '<span class="beautify-number;">' + original + '</span>';
			} else if (typeof object[property] === 'object') {
				return original;
			} else if (typeof object[property] === 'string') {
				let xml = checkXml(object[property]);
				let json = checkJson(object[property]);
				if (xml !== false) {
					return beautifyXml(xml);
				} else if (json !== false) {
					return beautifyJson(json);
				} else {
					/*
					 * string
					 */
					// return '\x1b[2m' + object[property] + '\x1b[0m';
					return '<span class="beautify-item;">' + original + '</span>';
				}
			} else {
				return '<span class="beautify-undefined;">' + typeof object[property] + '</span>';
			}
		}
	});
}

exports.beautify = function () {
	let messages = [];
	let message;
	let item = [].shift.call(arguments);
	if (typeof item === 'boolean') {
		message = '<span class="beautify-boolean;">' + item + '</span>';
	} else if (typeof item === 'function') {
		message = '<span class="beautify-function;">' + 'function' + '</span>';
	} else if (item === null) {
		message = '<span class="beautify-null;">' + item + '</span>';
	} else if (typeof item === 'number') {
		message = '<span class="beautify-number;">' + item + '</span>';
	} else if (typeof item === 'object') {
		message = beautifyObject(item).replace(/\n/g, '<br/>');
	} else if (typeof item === 'string') {
		let xml = checkXml(item);
		let json = checkJson(item);
		if (json !== false) {
			message = beautifyJson(json).replace(/\n/g, '<br/>').replace(/\n/g, '<br/>');
		} else if (xml !== false) {
			message = beautifyXml(xml).replace(/\n/g, '<br/>').replace(/\n/g, '<br/>');
		} else {
			message = '<span class="beautify-item;">' + item + '</span>';
		}
	} else {
		message = '<span class="beautify-undefined;">' + typeof item + '</span>';
	}
	messages.push('<div>' + message + '</div>');
	return messages.join();
};

