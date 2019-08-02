"use strict";
const FaError = require("fa-nodejs/base/error");
const FaFile = require("fa-nodejs/base/file");

class FaTemplate {
	// constructor(props) {
	// }
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
		let self = this;
		let result = {};
		let blockList = ["/"];
		let blockRegExpStart = /{% block (.+) %}/g;
		let blockRegExpEnd = /{% endblock %}/g;
		let line = 1;
		this.get.split("\n").map(function (item) {
			let blockIndex = blockList[blockList.length - 1];
			let blockStart = blockRegExpStart.exec(item);
			let blockEnd = blockRegExpEnd.exec(item);
			// console.info(blockIndex);
			// result[blockIndex] = {};
			if (blockStart) {
				while (blockStart !== null) {
					blockList.push(blockStart[1]);
					blockStart = blockRegExpStart.exec(item);
				}
			} else if (blockEnd) {
				while (blockEnd !== null) {
					blockList.pop();
					blockEnd = blockRegExpEnd.exec(item);
				}
			} else {
				if (blockIndex) {
					if (!result[blockIndex]) {
						// result[blockIndex] = {};
					}
					let pointer = result;
					blockList.map(function (key) {
						if (!pointer[key]) {
							pointer[key] = {};
						}
						pointer = pointer[key];
					});
					// pointer[`${line}`] = item;
					// result[blockIndex][line] = item;
				} else {
					// result[blockIndex][line] = item;
				}
			}
			line++;
		});
		console.log(result);
		console.info(blockList);
		// while (match != null) {
		// 	// matched text: match[0]
		// 	// match start: match.index
		// 	// capturing group n: match[n]
		// 	console.error(match[0], match[1]);
		// 	match = regular.exec(this.get);
		// }
	}
}

/**
 *
 * @type {FaTemplate}
 */
module.exports = FaTemplate;
