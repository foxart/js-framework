/*https://www.compart.com/en/unicode/html*/
"use strict";

function messageHeader(align) {
	return `\u250c\u2500${Array(align + 1).join("\u2500")}\u2500\u2510`;
}

function messageFooter(align) {
	return `\u2514\u2500${Array(align + 1).join("\u2500")}\u2500\u2518`;
}

function messageSpacer(align) {
	return `\u251c\u2500${Array(align + 1).join("\u2500")}\u2500\u2524`;
}

function messageBody(data, align) {
	let wrapper = "\u2502";
	let spacer = " ";
	if (data === undefined) {
		data = "undefined"
	}
	let length = align - data.length + 1;
	if (length < 0) {
		return `${wrapper}${spacer}${data.toString().substring(0, align)}${spacer}${wrapper}`;
	} else {
		return `${wrapper}${spacer}${data.toString() + Array(length).join(spacer)}${spacer}${wrapper}`;
	}
}

function getAlign(list) {
	let result = 0;
	// let length = [];
	// let list = message.toString().split('\n');
	for (let keys = Object.keys(list), i = 0, end = keys.length - 1; i <= end; i++) {
		// length.push(list[keys[i]].length);
		if (result < list[keys[i]].length) {
			result = list[keys[i]].length;
		}
	}
	return result;
}

function getHeader(error, type) {
	let result = [];
	result.push(type.toUpperCase());
	result.push(error["name"]);
	result.push(error["message"]);
	return result.join(" \u2502 ")
}

function getTrace(error) {
	let result = [];
	if (error["trace"]) {
		error["trace"].map(function (item, key) {
			result[key] = `${item["method"]}    ${item["path"]}:${item["line"]}:${item["column"]}`;
		});
	} else {
		let stack = error["stack"].split("\n");
		stack.splice(0, 1);
		result = stack;
	}
	// console.warn(result);
	return result;
}

function getFooter(error, type) {
	let result = [];
	result.push(new Date().toLocaleDateString());
	result.push(new Date().toLocaleTimeString());
	// result.push(type.toUpperCase());
	return result.join(" \u2502 ")
}

function formatError(error, type) {
	let result = [];
	// log(error.stack);
	// let trace = error["trace"] === undefined ? [] : error["trace"];
	let header = getHeader(error, type);
	let trace = getTrace(error);
	let footer = getFooter(error, type);
	let align = Math.max(getAlign([header]), getAlign(trace), getAlign([footer]));
	/**/
	result.push(messageHeader(align));
	result.push(`${messageBody(header, align)}`);
	result.push(messageSpacer(align));
	for (let keys = Object.keys(trace), i = 0, end = keys.length - 1; i <= end; i++) {
		result.push(`${messageBody(trace[keys[i]], align)}`);
	}
	result.push(messageSpacer(align));
	result.push(`${messageBody(footer, align)}`);
	result.push(messageFooter(align));
	// console.error(result);
	return result.join('\n');
}

const log = console.log;
process.on('unhandledRejection', function (rejection) {
	log(formatError(rejection, "rejection"));
});
process.on('uncaughtException', function (exception) {
	log(formatError(exception, "exception"));
});
