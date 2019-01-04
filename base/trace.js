"use strict";
/**
 *
 * @param stack
 * @param level {number|null}
 * @return {*}
 */
exports.get = function (stack, level = null) {
	let text = stack.split("\n");
	let ExpressionMethod = new RegExp("^(.+) \\((.+)\\)$");
	let ExpressionString = new RegExp("^(.+):(\\d+):(\\d+)$");
	let result = [];
	text.splice(0, 1);
	text.forEach(function (item) {
		let trace = {
			method: null,
			path: null,
			line: null,
			column: null,
		};
		let string = '';
		let line = item.slice(item.indexOf("at ") + 3, item.length);
		let MatchMethod = ExpressionMethod.exec(line);
		if (MatchMethod) {
			// trace.method = `${MatchMethod[1].replace("\<anonymous\>", "()")}`;
			trace.method = MatchMethod[1];
			string = MatchMethod[2];
		} else {
			string = line;
		}
		let MatchString = ExpressionString.exec(string);
		if (MatchString) {
			trace.path = MatchString[1];
			trace.line = MatchString[2];
			trace.column = MatchString[3];
		} else {
			trace.method = string;
		}
		result.push(trace);
	});
	if (level !== null) {
		return result[level];
	} else {
		return result;
	}
};

