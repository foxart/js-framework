"use strict";
const FaError = require("fa-nodejs/base/error");
const FaFile = require("fa-nodejs/base/file");

class FaTemplate {
	constructor(props) {
		this._blockList = ["/"];
	}

	/**
	 *
	 * @returns {string}
	 */
	get get() {
		return this._template;
	}

	/**
	 *
	 * @param template {string}
	 */
	set set(template) {
		this._template = template;
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

	parse() {
		// let pattern = "{% block (.+) %}";
		// let regular = new RegExp(pattern, "g");
		// let match = this.get.match(regular);
		// console.info(match);
		let data = this.get.split("\n");
		// this.get.split("\n").map(function (item) {
		// 	let blockIndex = blockList[blockList.length - 1];
		// 	let blockStart = blockRegExpStart.exec(item);
		// 	let blockEnd = blockRegExpEnd.exec(item);
		// 	if (blockStart) {
		// 		while (blockStart !== null) {
		// 			blockList.push(blockStart[1]);
		// 			blockStart = blockRegExpStart.exec(item);
		// 		}
		// 		/**/
		// 		content[line] = `{% ${blockList[blockList.length - 1]} %}`;
		// 	} else if (blockEnd) {
		// 		while (blockEnd !== null) {
		// 			blockList.pop();
		// 			blockEnd = blockRegExpEnd.exec(item);
		// 		}
		// 	} else {
		// 		// let pointer = structure;
		// 		// blockList.map(function (key) {
		// 		// 	if (!pointer[key]) {
		// 		// 		pointer[key] = {};
		// 		// 	}
		// 		// 	pointer = pointer[key];
		// 		// });
		// 		content[line] = item;
		// 	}
		// 	line++;
		// });
		let res = this._parse(data);
		console.log(res);
	}

	get _pattern() {
		return {
			template: [],
			variable: {},
			parent: {},
			child: {},
			content: [],
		}
	}

	_parse(data) {
		let self = this;
		// let regularBlockStart = /{% block (.+) %}/;
		let regularBlockStart = /{% block ([^{}]+) %}/;
		let regularBlockEnd = /{% endblock %}/;
		let regularComment = /{#(.+)#}/;
		let regularVariable = /{{ ([^{}]+) }}/g;
		let list = ["/"];
		let result = {"/": this._pattern};
		data.forEach(function (item) {
			let blockStart = item.match(regularBlockStart);
			let blockEnd = item.match(regularBlockEnd);
			let variable = regularVariable.exec(item);
			let comment = item.match(regularComment);
			if (comment) {
				// result[list[list.length - 1]]["template"].push(`<!--${comment[1]}-->`);
			} else {

				if (blockStart) {
					list.push(blockStart[1]);
					if (!result[list[list.length - 1]]) {
						result[list[list.length - 1]] = self._pattern;
					}
					result[list[list.length - 1]]["parent"][list[list.length - 2]] = result[list[list.length - 2]]["template"].length;
					result[list[list.length - 2]]["child"][list[list.length - 1]] = result[list[list.length - 2]]["template"].length;
					// result[list[list.length - 2]]["template"].push(`{% ${list[list.length - 1]} %}`);
					item = item.replace(blockStart[0], "");
					// console.error(blockStart[0]);
				}
				if (blockEnd) {
					item = item.replace(blockEnd[0], "");
					list.pop();
				}
				if (variable) {
					result[list[list.length - 1]]["template"].push(item);
					while (variable !== null) {
						result[list[list.length - 1]]["variable"][variable[1]] = result[list[list.length - 1]]["template"].length - 1;
						variable = regularVariable.exec(item);
					}
				} else {
					result[list[list.length - 1]]["template"].push(item);
				}
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
