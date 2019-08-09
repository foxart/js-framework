"use strict";
const FaError = require("fa-nodejs/base/error");
const FaFile = require("fa-nodejs/base/file");
const FaTrace = require("fa-nodejs/base/trace");

class FaTwig {
	constructor(props) {
		this._FaFile = new FaFile(props);
		this._template = {};
		this._block = {};
		this._blockList = [];
		this._for = {};
	}

	load(filename) {
		this._filename = filename;
		this._content = this._FaFile.readFileSync(filename).toString().split("\n");
		this._load();
	}

	get getContent() {
		return this._content;
	}

	get getBlock() {
		return this._block;
	}

	get getTemplate() {
		return this._template;
	}

	block(block, variables = {}) {
		// if (this._template[block]) {
		// 	let self = this;
		// 	let structure = Object.assign([], this._template[block]["structure"]);
		// 	let variable = this._template[block]["variable"];
		// 	let child = this._template[block]["child"];
		// 	Object.entries(variables).map(function ([key, value]) {
		// 		let index = variable[key];
		// 		if (structure[index]) {
		// 			structure[index] = structure[index].replace(`{{ ${key} }}`, value);
		// 		} else {
		// 			console.error(`${self._FaFile.getPathname(self._filename)}: variable {{ ${key} }} not found in block {% ${block} %}`);
		// 		}
		// 	});
		// 	Object.entries(child).map(function ([key, value]) {
		// 		structure[value] = self._template[key]["data"].join("\n")
		// 	});
		// 	this._template[block]["data"].push(structure.join("\n"));
		// } else{
		// 	console.error(`${this._FaFile.getPathname(this._filename)}: block {% ${block} %} not found`);
		// }
	}

	build(variables = {}) {
		this.block("/", variables);
	}

	get data() {
		return this._template["/"]["data"].join("/");
	}

	_cursor(name) {
		return {
			name: name,
			structure: [],
			block: {},
			variable: {},
			data: [],
		}
	}

	_load() {
		let self = this;
		let block_list = [];
		this._template = this._cursor("/");
		let line = 0;
		this._content.forEach(function (item) {
			self._parse(item);
			line++;
		});
	}

	_parse(item, type) {
		let regularBlockInline = /{% block ([^{}]+) %}(.+){% endblock %}/;
		let regularBlockStart = /{% block ([^{}]+) %}/;
		let regularBlockEnd = /{% endblock %}/;
		let regularComment = /{#(.+)#}/;
		let regularVariable = /{{ ([^{}]+) }}/;
		let regularForStart = /{% for ([^{}]+) in ([^{}]+) %}/;
		let regularForEnd = /{% endfor %}/;
		// let pointer;
		let matchBlock = item.match(regularBlockStart);
		let matchInline = item.match(regularBlockInline);
		// let block_curr = list[list.length - 1];
		// let block_prev = list[list.length - 2];
		// this._block[block_curr] = this._cursor;
		// let pointer = block_prev ? this._block[block_prev] : this._template;
		// console.info(pointer);
		// cursor = this._template;
		if (matchInline) {
			let block_curr = matchInline[1];
			// let block_next = list[list.length - 1];
			// if (!this._block[block_curr]) {
			// 	this._block[block_curr] = this._cursor;
			// }
			// 	console.info(block_prev, this._block[block_prev],item)
			// if (this._block[block_prev]) {
			// this._block[block_prev]["structure"].push(item);
			// this._block[block_prev]["block"][block_curr] = this._block[block_prev]["structure"].length - 1;
			// } else {
			// this._template["structure"].push(item);
			// this._template["block"][block_curr] = this._template["structure"].length - 1;
			// }
			this._blockList.push(block_curr);
			this._block[block_curr] = this._cursor(block_curr);
			this._parse(matchInline[2], "block");
			this._blockList.pop();
			type = "block";
			item = item.replace(matchInline[0], `[% block ${matchBlock[1]} %]`);
		}
		if (type === "block") {
			let block_prev = this._blockList[this._blockList.length - 1];
			if (block_prev) {
				let key = this._blockList[this._blockList.length - 1];
				this._block[key]["structure"].push(item);
				this._block[block_prev]["block"] = {[key]: this._blockList.length - 1};
			} else {
				this._template["structure"].push(item);
			}
		} else {
			this._template["structure"].push(item);
		}
		// console.info(cursor["name"], item,this._blockList[this._blockList.length - 1]);
		// return this._block[this._blockList[this._blockList.length - 1]];
		// return item;
		// this._parseBlock(item, block_list);
		// this._parseVariable(item, block_list);
		// if (regularComment.test(item)) {
		// 	// this._parseComment(item, block_list);
		// } else if (regularBlockStart.test(item)) {
		// 	// if (regularBlockInline.test(item)) {
		// 	// 	this._parseBlockInline(item, block_list);
		// 	// 	block_list.pop();
		// 	// } else {
		// 	// 	this._parseBlock(item, block_list);
		// 	// }
		// 	this._parseBlock(item, block_list);
		// } else if (regularBlockEnd.test(item)) {
		// 	block_list.pop();
		// } else if (regularForStart.test(item)) {
		// 	// console.info(item);
		// } else if (regularForEnd.test(item)) {
		// 	// console.info(item);
		// } else if (regularVariable.test(item)) {
		// 	this._parseVariable(item, block_list);
		// } else {
		// 	// result[block_list[block_list.length - 1]]["structure"].push(item);
		// 	this._parseText(item, block_list);
		// }
	}

	_parseComment(item, list) {
		// let regularComment = /{#(.+)#}/;
		// let comment = item.match(regularComment);
		// result[list[list.length - 1]]["structure"].push(`<!--${comment[1]}-->`);
		let regularComment = new RegExp("{#(.+)#}", "g");
		let exec = regularComment.exec(item);
		let block_curr = list[list.length - 1];
		let pointer = block_curr ? this._block[block_curr] : this._template;
		while (exec !== null) {
			pointer["structure"].push(`<!--${exec[1]}-->`);
			exec = regularComment.exec(item);
		}
	}

	_parseBlock(item, list) {
		let regularBlockStart = /{% block ([^{}]+) %}/;
		let regularBlockInline = /{% block ([^{}]+) %}(.+){% endblock %}/;
		let matchBlock = item.match(regularBlockStart);
		let matchInline = item.match(regularBlockInline);
		// console.info(matchBlock, matchInline);
		if (matchBlock) {
			list.push(matchBlock[1]);
			let block_curr = list[list.length - 1];
			let block_prev = list[list.length - 2];
			this._block[block_curr] = this._cursor;
			let pointer = block_prev ? this._block[block_prev] : this._template;
			if (matchInline) {
				item = item.replace(matchInline[0], `[% block ${matchBlock[1]} %]`);
				// pointer["structure"].push(item);
				pointer["block"][block_curr] = pointer["structure"].length - 1;
				console.error(item, matchInline[2]);
				this._parse(matchInline[2], list);
				list.pop();
			}
		}
	}

	_parseBlockInline(item, list) {
		let regularBlockStart = /{% block ([^{}]+) %}(.+){% endblock %}/;
		let match = item.match(regularBlockStart);
		list.push(match[1]);
		let block_curr = list[list.length - 1];
		let block_prev = list[list.length - 2];
		this._block[block_curr] = this._cursor;
		let pointer = block_prev ? this._block[block_prev] : this._template;
		pointer["structure"].push(`<!--block [${match[1]}]-->`);
		pointer["block"][block_curr] = pointer["structure"].length - 1;
		// console.error(match);
		// this._block[match[1]]["structure"] = match[2];
		this._parse(match[2], list);
	}

	_parseVariable(item, list) {
		let regularVariable = new RegExp("{{ ([^{}]+) }}", "g");
		let exec = regularVariable.exec(item);
		let block_curr = list[list.length - 1];
		let pointer = block_curr ? this._block[block_curr] : this._template;
		// pointer["structure"].push(item);
		console.info(item)
		while (exec !== null) {
			if (pointer["variable"][exec[1]] === undefined) {
				// console.info(block_curr,exec[1]);
				pointer["variable"][exec[1]] = pointer["structure"].length - 1;
			} else {
				if (!Array.isArray(pointer["variable"][exec[1]])) {
					pointer["variable"][exec[1]] = [pointer["variable"][exec[1]]]
				}
				pointer["variable"][exec[1]].push(pointer["structure"].length - 1);
			}
			exec = regularVariable.exec(item);
		}
	}

	_parseText(item, list) {
		let block_curr = list[list.length - 1];
		let pointer = block_curr ? this._block[block_curr] : this._template;
		pointer["structure"].push(item);
	}
}

/**
 *
 * @type {FaTwig}
 */
module.exports = FaTwig;


