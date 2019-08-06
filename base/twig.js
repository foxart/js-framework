"use strict";
const FaError = require("fa-nodejs/base/error");
const FaFile = require("fa-nodejs/base/file");
const FaTrace = require("fa-nodejs/base/trace");

class FaTwig {
	constructor(props) {
		this._FaFile = new FaFile(props);
	}

	load(filename) {
		this._filename = filename;
		this._content = this._FaFile.readFileSync(filename).toString();
		try {
			this._template = this._parse(this._content.split("\n"));
		} catch (e) {
			throw new FaError(e);
		}
	}

	get getTemplate() {
		return this._template;
	}

	get getContent() {
		return this._content;
	}

	block(block, variables = {}) {
		if (this._template[block]) {
			let self = this;
			let structure = Object.assign([], this._template[block]["structure"]);
			let variable = this._template[block]["variable"];
			let child = this._template[block]["child"];
			Object.entries(variables).map(function ([key, value]) {
				let index = variable[key];
				if (structure[index]) {
					structure[index] = structure[index].replace(`{{ ${key} }}`, value);
				} else {
					console.error(`${self._FaFile.getPathname(self._filename)}: variable {{ ${key} }} not found in block {% ${block} %}`);
				}
			});
			Object.entries(child).map(function ([key, value]) {
				structure[value] = self._template[key]["data"].join("\n")
			});
			this._template[block]["data"].push(structure.join("\n"));
		} else{
			console.error(`${this._FaFile.getPathname(this._filename)}: block {% ${block} %} not found`);
		}
	}

	build(variables = {}) {
		this.block("/", variables);
	}

	get data() {
		return this._template["/"]["data"].join("/");
	}

	_parse(data) {
		let self = this;
		let regularBlockInline = /{% block ([^{}]+) %}(.+){% endblock %}/;
		let regularBlockStart = /{% block ([^{}]+) %}/;
		let regularBlockEnd = /{% endblock %}/;
		let regularComment = /{#(.+)#}/;
		let regularVariable = /{{ ([^{}]+) }}/;
		let regularForStart = /{% for ([^{}]+) in ([^{}]+) %}/;
		let regularForEnd = /{% endfor %}/;
		let type_list = [];
		let block_list = ["/"];
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
					self._parseBlock(item, block_list, result);
				}
			} else if (blockEnd) {
				block_list.pop();
			} else if (regularForStart.test(item)) {
				console.info(item);
			} else if (regularForEnd.test(item)) {
				console.info(item);

			} else if (regularVariable.test(item)) {
				self._parseVariable(item, block_list, result);
			} else {
				result[block_list[block_list.length - 1]]["structure"].push(item);
			}
		});
		return result;
	}

	get _pattern() {
		return {
			structure: [],
			variable: {},
			// parent: {},
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
		result[list[list.length - 1]]["structure"].push(item);
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
		// result[list[list.length - 1]]["parent"][list[list.length - 2]] = result[list[list.length - 2]]["structure"].length;
		result[list[list.length - 2]]["child"][list[list.length - 1]] = result[list[list.length - 2]]["structure"].length;
		result[list[list.length - 2]]["structure"].push(`{% ${list[list.length - 1]} %}`);
	}
}

/**
 *
 * @type {FaTwig}
 */
module.exports = FaTwig;


