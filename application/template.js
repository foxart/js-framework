"use strict";
const FaError = require("fa-nodejs/base/error");
const FaFile = require("fa-nodejs/base/file");
const FaTrace = require("fa-nodejs/base/trace");

class FaTemplate {
	get get() {
		return this._content;
	}

	/**
	 *
	 * @param content {string}
	 */
	set set(content) {
		this._content = content;
	}

	_find(result, list) {
		// console.info(list);
		let pointer = result;
		list.map(function (key) {
			if (pointer[key]) {
			} else {
				pointer[key] = {};
				pointer = pointer[key];
			}
		});
		console.info(pointer);
	}

	block(block, variables = {}) {
		let self = this;
		// let block = this._template[block];
		let structure = Object.assign([], this._template[block]["structure"]);
		let variable = this._template[block]["variable"];
		let child = this._template[block]["child"];
		Object.entries(variables).map(function ([key, value]) {
			let index = variable[key];
			if (structure[index]) {
				structure[index] = structure[index].replace(`{{ ${key} }}`, value);
			} else {
				console.error(`variable not found: ${key}`);
			}
		});
		Object.entries(child).map(function ([key, value]) {
			structure[value] = self._template[key]["data"].join("\n")
		});
		this._template[block]["data"].push(structure.join("\n"));
	}

	build(variables = {}) {
		this.block("/", variables);
	}

	get _pattern() {
		return {
			structure: [],
			variable: {},
			parent: {},
			child: {},
			data: [],
		}
	}

	_parseComment(item, list, result) {
		// let regularComment = /{#(.+)#}/;
		// let comment = item.match(regularComment);
		// result[list[list.length - 1]]["structure"].push(`<!--${comment[1]}-->`);
		let regularComment = new RegExp("{#(.+)#}", "g");
		let comment = regularComment.exec(item);
		while (comment !== null) {
			result[list[list.length - 1]]["structure"].push(`<!--${comment[1]}-->`);
			comment = regularComment.exec(item);
		}
	}

	_parseVariable(item, list, result) {
		let regularVariable = new RegExp("{{ ([^{}]+) }}", "g");
		let variable = regularVariable.exec(item);
		while (variable !== null) {
			result[list[list.length - 1]]["variable"][variable[1]] = result[list[list.length - 1]]["structure"].length - 1;
			variable = regularVariable.exec(item);
		}
	}

	_parseBlock(item, list, result) {
		let regularBlockStart = /{% block ([^{}]+) %}/;
		let blockStart = item.match(regularBlockStart);
		list.push(blockStart[1]);
		if (!result[list[list.length - 1]]) {
			result[list[list.length - 1]] = this._pattern;
		}
		result[list[list.length - 1]]["parent"][list[list.length - 2]] = result[list[list.length - 2]]["structure"].length;
		result[list[list.length - 2]]["child"][list[list.length - 1]] = result[list[list.length - 2]]["structure"].length;
		result[list[list.length - 2]]["structure"].push(`{% ${list[list.length - 1]} %}`);
	}

	_parse(data) {
		let self = this;
		let regularBlockInline = /{% block ([^{}]+) %}(.+){% endblock %}/;
		let regularBlockStart = /{% block ([^{}]+) %}/;
		let regularBlockEnd = /{% endblock %}/;
		let regularComment = /{#(.+)#}/;
		let regularVariable = /{{ ([^{}]+) }}/;
		let list = ["/"];
		let result = {"/": this._pattern};
		data.map(function (item) {
			let blockEnd = item.match(regularBlockEnd);
			if (regularComment.test(item)) {
				// self._parseComment(item, list, result);
			} else if (regularBlockStart.test(item)) {
				if (regularBlockInline.test(item)) {
					// self._parseBlock(item, list, result);
					// list.pop();
				} else {
					self._parseBlock(item, list, result);
				}
			} else if (blockEnd) {
				list.pop();
			} else if (regularVariable.test(item)) {
				result[list[list.length - 1]]["structure"].push(item);
				self._parseVariable(item, list, result);
			} else {
				result[list[list.length - 1]]["structure"].push(item);
			}
		});
		return result;
	}
}

/**
 *
 * @type {FaTemplate}
 */
module.exports = FaTemplate;
