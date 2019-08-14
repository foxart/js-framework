"use strict";
const FaError = require("fa-nodejs/base/error");
const FaFile = require("fa-nodejs/base/file");

class FaTwig {
	constructor(pathname) {
		this._FaFile = new FaFile(pathname);
	}

	/**
	 *
	 * @param filename
	 * @return {FaTwig}
	 */
	load(filename) {
		this._filename = `${filename}.twig`;
		if (this._FaFile.isFile(this._filename)) {
			this._content = this._FaFile.readFileSync(this._filename).toString().split("\n");
			this._parse();
			return this;
		} else {
			throw new FaError(`twig template not found: ${this._FaFile.getPathname(this._filename)}`).pickTrace(1);
		}
	}

	// noinspection JSMethodCanBeStatic
	get _getResult() {
		return {
			main: [],
			block: {},
			for: {},
		}
	}

	get _getTemplate() {
		return {
			main: this._getStructure,
			block: {},
			for: {},
		}
	}

	// noinspection JSMethodCanBeStatic
	get _getStructure() {
		return {
			source: [],
			block: {},
			for: {},
			variable: {},
			comment: [],
		}
	}

	get result() {
		if (this._result["main"][0]) {
			return this._result["main"][0];
		} else {
			return this._content;
		}
	}

	reset() {
		this._result = this._getResult;
	}

	/**
	 *
	 * @param name
	 * @param variables
	 * @return {FaTwig}
	 */
	block(name, variables = {}) {
		this._fill("block", name, variables);
		return this;
	}

	/**
	 *
	 * @param name
	 * @param prefix
	 * @param variables
	 * @return {FaTwig}
	 */
	for(name, prefix, variables) {
		let self = this;
		variables = Array.isArray(variables) ? variables : [variables];
		variables.map(function (item) {
			self._fill("for", name, item, `${prefix}.`);
		});
		return this;
	}

	/**
	 *
	 * @param variables
	 * @return {FaTwig}
	 */
	build(variables = {}) {
		this._fill("main", "/", variables);
		return this;
	}

	_fill(type, name, variables, prefix = "") {
		let self = this;
		let pointer;
		let result;
		if (type === "main") {
			pointer = this._template[type];
			result = this._result[type];
		} else {
			pointer = this._template[type][name];
			if (!this._result[type][name]) {
				this._result[type][name] = [];
			}
			result = this._result[type][name];
		}
		if (pointer) {
			let source = Object.assign([], pointer["source"]);
			Object.entries(variables).forEach(function ([key, value]) {
				let variable = `${prefix}${key}`;
				let list = pointer["variable"][variable];
				if (list) {
					list.forEach(function (index) {
						source[index] = source[index].replace(`{{ ${variable} }}`, value);
					});
				} else {
					console.error(`${self._FaFile.getPathname(self._filename)}: variable {{ ${variable} }} not found in {% ${type} ${name} %}`);
				}
			});
			Object.entries(pointer["block"]).forEach(function ([key, value]) {
				if (self._result["block"][key]) {
					source[value] = self._result["block"][key].join("\n");
					self._result["block"][key] = pointer["source"][key];
				}
			});
			Object.entries(pointer["for"]).forEach(function ([key, value]) {
				if (self._result["for"][key]) {
					source[value] = self._result["for"][key].join("\n");
					self._result["for"][key] = pointer["source"][key];
				}

			});
			result.push(source.join("\n"));
		} else {
			console.error(`${this._FaFile.getPathname(this._filename)}: ${type.toUpperCase()} {% ${name} %} not found`);
		}
	}

	_parse() {
		// let regularBlockInline = /{% block ([^{}]+) %}(.+){% endblock %}/;
		let self = this;
		let regularBlockStart = /{% block ([^{}]+) %}/;
		let regularBlockEnd = /{% endblock %}/;
		let regularComment = /{#(.+)#}/;
		let regularVariable = /{{ ([^{}]+) }}/;
		let regularForStart = /{% for ([^{}]+) in ([^{}]+) %}/;
		let regularForEnd = /{% endfor %}/;
		let type = ["main"];
		this._result = this._getResult;
		this._template = this._getTemplate;
		this._block_list = ["main"];
		this._for_list = ["main"];
		this._content.forEach(function (item) {
			if (regularComment.test(item)) {
				self._parseComment(item, type[type.length - 1]);
			} else if (regularBlockStart.test(item)) {
				self._parseBlockStart(item, type[type.length - 1]);
				type.push("block");
			} else if (regularBlockEnd.test(item)) {
				type.pop();
				self._parseBlockEnd();
			} else if (regularForStart.test(item)) {
				self._parseForStart(item, type[type.length - 1]);
				type.push("for");
			} else if (regularForEnd.test(item)) {
				type.pop();
				self._parseForEnd();
			} else if (regularVariable.test(item)) {
				self._parseVariable(item, type[type.length - 1]);
			} else {
				self._parseText(item, type[type.length - 1]);
			}
		});
	}

	_parseBlockStart(item, type) {
		let pointer;
		let regularBlockStart = /{% block ([^{}]+) %}/;
		let matchBlock = item.match(regularBlockStart);
		let block_prev = this._block_list[this._block_list.length - 1];
		let for_prev = this._for_list[this._for_list.length - 1];
		let block_curr = this._block_list[this._block_list.push(matchBlock[1]) - 1];
		this._template["block"][block_curr] = this._getStructure;
		// let pointer = block_prev && block_prev !== "main" ? this._template["block"][block_prev] : this._template["main"];
		// let pointer = block_prev === "main" ? this._template["main"] : this._template["block"][block_prev];
		if (type === "block") {
			pointer = this._template["block"][block_prev];
		} else if (type === "for") {
			pointer = this._template["for"][for_prev];
		} else {
			pointer = this._template["main"];
		}
		// pointer["source"].push(item);
		pointer["source"].push("");
		pointer["block"][block_curr] = pointer["source"].length - 1;
	}

	_parseBlockEnd() {
		this._block_list.pop();
	}

	_parseForStart(item, type) {
		let pointer;
		let regularForStart = /{% for ([^{}]+) in ([^{}]+) %}/;
		let matchFor = item.match(regularForStart);
		let block_prev = this._block_list[this._block_list.length - 1];
		let for_prev = this._for_list[this._for_list.length - 1];
		let for_curr = this._for_list[this._for_list.push(matchFor[2]) - 1];
		this._template["for"][for_curr] = this._getStructure;
		if (type === "block") {
			pointer = this._template["block"][block_prev];
		} else if (type === "for") {
			pointer = this._template["for"][for_prev];
		} else {
			pointer = this._template["main"];
		}
		// pointer["source"].push(item);
		pointer["source"].push("");
		pointer["for"][for_curr] = pointer["source"].length - 1
	}

	_parseForEnd() {
		this._for_list.pop();
	}

	_parseVariable(item, type) {
		let pointer;
		let regularVariable = new RegExp("{{ ([^{}]+) }}", "g");
		let exec = regularVariable.exec(item);
		let block_curr = this._block_list[this._block_list.length - 1];
		let for_curr = this._for_list[this._for_list.length - 1];
		if (type === "block") {
			pointer = this._template["block"][block_curr];
		} else if (type === "for") {
			pointer = this._template["for"][for_curr];
		} else {
			pointer = this._template["main"];
		}
		pointer["source"].push(item);
		while (exec !== null) {
			if (pointer["variable"][exec[1]] === undefined) {
				pointer["variable"][exec[1]] = [pointer["source"].length - 1];
			} else {
				pointer["variable"][exec[1]].push(pointer["source"].length - 1);
			}
			exec = regularVariable.exec(item);
		}
	}


	_parseText(item, type) {
		let pointer;
		let block_curr = this._block_list[this._block_list.length - 1];
		let for_curr = this._for_list[this._for_list.length - 1];
		if (type === "block") {
			pointer = this._template["block"][block_curr];
		} else if (type === "for") {
			pointer = this._template["for"][for_curr];
		} else {
			pointer = this._template["main"];
		}
		pointer["source"].push(item);
	}

	_parseComment(item, type) {
		let pointer;
		let regularComment = /{#(.+)#}/;
		if (type === "block") {
			let list = this._block_list;
			let block_curr = list[list.length - 1];
			pointer = block_curr === "main" ? this._template["main"] : this._template["block"][block_curr];
		} else if (type === "for") {
			let list = this._for_list;
			let for_curr = list[list.length - 1];
			pointer = for_curr === "main" ? this._template["main"] : this._template["for"][for_curr];
		} else {
			pointer = this._template["main"];
		}
		let match = item.match(regularComment);
		pointer["source"].push(`<!--${match[1]}-->`);
		pointer["comment"].push(pointer["source"].length - 1);
	}
}

/**
 *
 * @type {FaTwig}
 */
module.exports = FaTwig;


