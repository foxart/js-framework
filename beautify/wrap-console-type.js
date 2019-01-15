"use strict";
const FCH = require('../console/console-helper');
const FaBeautifyWrapConsole = require('./wrap-console');

class FaBeautifyWrapConsoleType extends FaBeautifyWrapConsole {
	getType(type, length) {
		length = !length ? '' : `(${length})`;
		let result;
		switch (type) {
			case 'json':
				result = `${FCH.effect.bold}${FCH.bg.green} ${type.capitalize()}${length} ${FCH.effect.reset} `;
				break;
			case 'xml':
				result = `${FCH.effect.bold}${FCH.bg.yellow} ${type.capitalize()}${length} ${FCH.effect.reset} `;
				break;
			default:
				result = `${FCH.effect.dim}${FCH.color.white}${type.capitalize()}${length}${FCH.effect.reset} `;
		}
		return result;
	}

	array(data, length) {
		return `${this.getType('array', length)}${super.array(data)}`;
	};

	bool(data) {
		return `${this.getType("bool")}${super.bool(data)}`;
	};

	circular(data, length) {
		return `${this.getType("circular", length)}${super.circular(data)}`;
	};

	date(data) {
		return `${this.getType('date')}${super.date(data)}`;
	};

	error(data, level) {
		return `${this.getType(data["name"])}${super.error(data, level)}`;
	};

	file(data, length) {
		return `${this.getType('file', length)}${super.file(data)}`;
	};

	float(data) {
		return `${this.getType("float")}${super.float(data)}`;
	};

	function(data, length, level) {
		return `${this.getType("function", length)}${super.function(data, length, level)}`;
	};

	json(data, length) {
		return `${this.getType('json', length)}${super.json(data)}`;
	};

	int(data) {
		return `${this.getType("int")}${super.int(data)}`;
	};

	mongo(data) {
		return `${this.getType("mongo")}${super.mongo(data)}`;
	};

	null(data) {
		return `${this.getType("null")}${super.null(data)}`;
	};

	object(data, length) {
		return `${this.getType('object', length)}${super.object(data)}`;
	};

	regular(data) {
		return `${this.getType("expression")}${super.regular(data)}`;
	};

	string(data, length, level) {
		return `${this.getType("string", length)}${super.string(data, length, level)}`;
	};

	undefined(data) {
		return `${this.getType("undefined")}${super.undefined(data)}`;
	};

	xml(data, length) {
		return `${this.getType('xml', length)}${super.xml(data)}`;
	};
}

module.exports = FaBeautifyWrapConsoleType;
