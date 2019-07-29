"use strict";

class FaTrace {
	/**
	 *
	 * @param stack {Array}
	 * @return {Array}
	 * @private
	 */
	static _extractFromStack(stack) {
		let result = [];
		let Expression1 = new RegExp("^\\s+at\\s(.+)\\s\\((.+):(\\d+):(\\d+)\\)$");
		let Expression2 = new RegExp("^\\s+at\\s(.+):(\\d+):(\\d+)$");
		let Expression3 = new RegExp("^\\s+at\\s(.+)$");
		stack.forEach(function (item) {
			let Match1 = Expression1.exec(item);
			let Match2 = Expression2.exec(item);
			let Match3 = Expression3.exec(item);
			if (Match1) {
				result.push({
					method: Match1[1],
					path: Match1[2],
					line: Match1[3],
					column: Match1[4],
				});
			} else if (Match2) {
				result.push({
					method: null,
					path: Match2[1],
					line: Match2[2],
					column: Match2[3],
				});
			} else if (Match3) {
				result.push({
					method: Match3[1],
					path: null,
					line: null,
					column: null,
				});
			} else {
				console.error(`can't parse stack string: ${stack}`);
				// throw new Error(`can't parse stack string: ${item}`);
			}
		});
		return result;
	}

	/**
	 *
	 * @param level {number|null}
	 * @return {Array|Object}
	 */
	static trace(level = null) {
		let stack = new Error()["stack"];
		let data = stack.split("\n").filter(function (item) {
			if (item) {
				return item;
			}
		});
		data.splice(0, 2);
		let result = FaTrace._extractFromStack(data);
		if (level !== null) {
			return result[level];
		} else {
			return result;
		}
	}

	/**
	 *
	 * @param stack
	 * @param level {number|null}
	 * @return {Array|Object}
	 */
	static stack(stack, level = null) {
		let data = stack.split("\n").filter(function (item) {
			if (item) {
				return item;
			}
		});
		data.splice(0, 1);
		let result = FaTrace._extractFromStack(data);
		if (level !== null) {
			return result[level];
		} else {
			return result;
		}
	}

	/**
	 * @deprecated
	 * @param stack
	 * @return {Array}
	 */
	// old(stack) {
	// 	let text = stack.split("\n");
	// 	let ExpressionMethod = new RegExp("^(.+) \\((.+)\\)$");
	// 	let ExpressionString = new RegExp("^(.+):(\\d+):(\\d+)$");
	// 	let result = [];
	// 	text.splice(0, 1);
	// 	text.forEach(function (item) {
	// 		let trace = {
	// 			method: null,
	// 			path: null,
	// 			line: null,
	// 			column: null,
	// 		};
	// 		let string = "";
	// 		let line = item.slice(item.indexOf("at ") + 3, item.length);
	// 		let MatchMethod = ExpressionMethod.exec(line);
	// 		if (MatchMethod) {
	// 			trace.method = MatchMethod[1];
	// 			string = MatchMethod[2];
	// 		} else {
	// 			string = line;
	// 		}
	// 		let MatchString = ExpressionString.exec(string);
	// 		if (MatchString) {
	// 			trace.path = MatchString[1];
	// 			trace.line = MatchString[2];
	// 			trace.column = MatchString[3];
	// 		} else {
	// 			trace.method = string;
	// 		}
	// 		result.push(trace);
	// 	});
	// 	return result;
	// }
}

/**
 *
 * @type {FaTrace|Class}
 */
module.exports = FaTrace;
