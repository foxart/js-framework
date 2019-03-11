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
	for (let keys = Object.keys(list), i = 0, end = keys.length - 1; i <= end; i++) {
		if (result < list[keys[i]].length) {
			result = list[keys[i]].length;
		}
	}
	return result;
}

function getHeader(error, type) {
	let result = [];
	let time = new Date().toLocaleTimeString();
	result.push(time.substr(0, time.length - 3));
	result.push(error["name"]);
	result.push(error["message"]);
	return result.join(" \u2502 ")
}

function getTrace(error) {
	if (error["trace"]) {
		let trace = [];
		error["trace"].map(function (item, key) {
			trace[key] = `${item["method"]}    ${item["path"]}:${item["line"]}:${item["column"]}`;
		});
		return trace
	} else if (error["stack"]) {
		let stack = error["stack"].split("\n");
		stack.splice(0, 1);
		return stack;
	} else {
		return ["getTrace"];
	}
}

function getFooter(error, type) {
	let result = [];
	result.push(type.toUpperCase());
	result.push(new Date().toLocaleDateString());
	return result.join(" \u2502 ")
}

function formatError(error, type) {
	let result = [];
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
	return result.join('\n');
}

const log = console.log;
process.on('unhandledRejection', function (rejection) {
	log(formatError(rejection, "rejection"));
});
process.on('uncaughtException', function (exception) {
	log(formatError(exception, "exception"));
});
