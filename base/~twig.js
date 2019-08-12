"use strict";
const FaError = require("fa-nodejs/base/error");
const FaFile = require("fa-nodejs/base/file");

// const FaTrace = require("fa-nodejs/base/trace");
class FaTwig {
	constructor(pathname) {
		this._FaFile = new FaFile(pathname);
	}

	load(filename) {
		this._filename = `${filename}.twig`;
		if (this._FaFile.isFile(this._filename)) {
			// this._main = this._template;
			this._block = {"/": this._template};
			this._for = {};
			this._result = [];
			this._block_list = [];
			this._content = this._FaFile.readFileSync(this._filename).toString().split("\n");
			this._parse();
			return this;
		} else {
			throw new FaError(`twig template not found: ${this._FaFile.getPathname(this._filename)}`).pickTrace(1);
		}
	}

	reset() {
		this._main["result"] = [];
		// noinspection JSUnusedLocalSymbols
		Object.entries(this._block).forEach(function ([key, value]) {
			value["result"] = [];
		});
	}

	get get() {
		return this._result;
	}

	fillBlock(block, variables = {}) {
		this._fill(this._block[block], variables, block);
		return this;
	}

	build(variables = {}) {
		this._fill(this._main, variables, "/");
		this._result = this._main["result"];
		this.reset();
	}

	_fill(pointer, variables, block) {
		// if (pointer["source"]) {
		// 	let self = this;
		// 	let source = Object.assign([], pointer["source"]);
		// 	Object.entries(variables).forEach(function ([key, value]) {
		// 		let list = pointer["variable"][key];
		// 		if (list) {
		// 			list.forEach(function (index) {
		// 				source[index] = source[index].replace(`{{ ${key} }}`, value);
		// 			});
		// 		} else {
		// 			if (block) {
		// 			}
		// 			console.error(`${self._FaFile.getPathname(self._filename)}: variable {{ ${key} }} not found in block {% ${block} %}`);
		// 		}
		// 	});
		// 	Object.entries(pointer["block"]).forEach(function ([key, value]) {
		// 		source[value] = source[value].replace(`{% block ${key} %}`, self._block[key]["result"].join("\n"));
		// 	});
		// 	pointer["result"].push(source.join("\n"));
		// }
	}

	// noinspection JSMethodCanBeStatic
	get _template() {
		return {
			source: [],
			result: [],
			block: {},
			variable: {},
			comment: [],
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
		let line = 0;
		this._content.forEach(function (item) {
			if (regularComment.test(item)) {
				// self._parseComment(item);
			} else if (regularBlockStart.test(item)) {
				self._parseBlockStart(item, line);
			} else if (regularBlockEnd.test(item)) {
				self._parseBlockEnd(item);
			} else if (regularForStart.test(item)) {
				// console.info(item);
			} else if (regularForEnd.test(item)) {
				// console.info(item);
			} else if (regularVariable.test(item)) {
				self._parseVariable(item, line);
			} else {
				// self._parseText(item);
			}
			line++;
		});
	}

	_parseComment(item) {
		let list = this._block_list;
		let regularComment = /{#(.+)#}/;
		let match = item.match(regularComment);
		let block_curr = list[list.length - 1];
		let pointer = block_curr ? this._block[block_curr] : this._main;
		pointer["source"].push(`<!-- ${match[1]} -->`);
		pointer["comment"].push(pointer["source"].length - 1);
		// let regularComment = new RegExp("{#(.+)#}", "g");
		// let exec = regularComment.exec(item);
		// let block_curr = list[list.length - 1];
		// let pointer = block_curr ? this._block[block_curr] : this._main;
		// while (exec !== null) {
		// 	pointer["source"].push(`<!--${exec[1]}-->`);
		// 	exec = regularComment.exec(item);
		// }
	}

	_parseBlockStart(item, line) {
		let list = this._block_list;
		let regularBlockStart = /{% block ([^{}]+) %}/;
		let matchBlock = item.match(regularBlockStart);
		let block_prev = list[list.length - 1];
		list.push(matchBlock[1]);
		let block_curr = list[list.length - 1];
		if (!this._block[line]) {
			// this._block[line] = {};
			this._block[line] = this._template;
		}
		// this._block[line][block_curr] = this._template;
		// let pointer = block_prev ? this._block[line][block_prev] : this._main;
		// let pointer = block_prev ? this._block[line] : this._block[line];
		// this._block[line]["source"].push(item);
		if (block_prev) {
		} else {
			this._block[line]["source"].push(item);
			this._block[line]["block"][block_curr] = this._block[line]["source"].length - 1;
		}
	}

	_parseBlockEnd() {
		let list = this._block_list;
		list.pop();
	}

	_parseVariable(item, line) {
		let list = this._block_list;
		let regularVariable = new RegExp("{{ ([^{}]+) }}", "g");
		let exec = regularVariable.exec(item);
		let block_curr = list[list.length - 1];
		if (!this._block[line]) {
			// this._block[line] = {};
			this._block[line] = this._template;
		}
		this._block[line]["source"].push(item);
		while (exec !== null) {
			if (this._block[line]["variable"][exec[1]] === undefined) {
				this._block[line]["variable"][exec[1]] = [this._block[line]["source"].length - 1];
			} else {
				this._block[line]["variable"][exec[1]].push(this._block[line]["source"].length - 1);
			}
			exec = regularVariable.exec(item);
		}
	}

	_parseText(item) {
		let list = this._block_list;
		let block_curr = list[list.length - 1];
		let pointer = block_curr ? this._block[block_curr] : this._main;
		pointer["source"].push(item);
	}
}

/**
 *
 * @type {FaTwig}
 */
module.exports = FaTwig;


