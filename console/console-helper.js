"use strict";
/**
 *
 * @type {{reset: string, bold: string, dim: string, underscore: string, blink: string, reverse: string, hidden: string}}
 */
exports.effect = {
	reset: "\x1b[0m",
	bold: "\x1b[1m",
	dim: "\x1b[2m",
	underscore: "\x1b[4m",
	blink: "\x1b[5m",
	reverse: "\x1b[7m",
	hidden: "\x1b[8m",
};
/**
 *
 * @type {{black: string, red: string, green: string, yellow: string, blue: string, magenta: string, cyan: string, white: string}}
 */
exports.color = {
	black: "\x1b[30m",
	red: "\x1b[31m",
	green: "\x1b[32m",
	yellow: "\x1b[33m",
	blue: "\x1b[34m",
	magenta: "\x1b[35m",
	cyan: "\x1b[36m",
	white: "\x1b[37m",
};
/**
 *
 * @type {{black: string, red: string, green: string, yellow: string, blue: string, magenta: string, cyan: string, white: string}}
 */
exports.bg = {
	black: "\x1b[40m",
	red: "\x1b[41m",
	green: "\x1b[42m",
	yellow: "\x1b[43m",
	blue: "\x1b[44m",
	magenta: "\x1b[45m",
	cyan: "\x1b[46m",
	white: "\x1b[47m",
};
/**
 *
 * @type {{commat: string, ast: string, amp: string, num: string, lt: string, cross: string, curvearrowleft: string, check: string, gt: string, quest: string, plus: string, percnt: string, circlearrowright: string, excl: string, circlearrowleft: string, equals: string, copy: string, curvearrowright: string}}
 */
exports.sign = {
	excl: "\u0021",
	num: "\u0023",
	percnt: "\u0025",
	amp: "\u0026",
	ast: "\u002a",
	plus: "\u002b",
	lt: "\u003c",
	equals: "\u003d",
	gt: "\u003e",
	quest: "\u003f",
	commat: "\u0040",
	copy: "\u00a9",
	curvearrowleft: "\u21b6",
	curvearrowright: "\u21b7",
	circlearrowleft: "\u21ba",
	circlearrowright: "\u21bb",
	check: "\u2713",
	cross: "\u2717",
};
