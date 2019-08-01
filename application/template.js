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

	parse() {
		// let pattern = "{% block (.+) %}";
		// let regular = new RegExp(pattern, "g");
		// let match = this.get.match(regular);
		// console.info(match);
		let result = [];
		let blocks = [];
		let regBlockStart = /{% block (.+) %}/g;
		let regBlockEnd = /{% endblock %}/g;
		this.get.split("\n").map(function (item) {
			let blockStart = regBlockStart.exec(item);
			let blockEnd = regBlockEnd.exec(item);
			if (blockStart) {
				while (blockStart !== null) {
					blocks.push(blockStart[1]);
					blockStart = regBlockStart.exec(item);
				}
			} else if (blockEnd) {
				while (blockEnd !== null) {
					blocks.pop();

					blockEnd = regBlockEnd.exec(item);
				}
			} else {
				console.error(blocks[blocks.length - 1]);
				let blockIndex = blocks[blocks.length - 1];
				if (blockIndex) {
					result.push({
						[blockIndex]: `|${item}`
					});
				} else {
					result.push(`|${item}`);
				}
			}
		});
		console.log(result, blocks);
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
