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

function formatError(title, error) {
	let message = `${title}\n${error.stack.split("\n").join("\n")}`;
	let result = [];
	let length = [];
	let align = 0;
	let list = message.toString().split('\n');
	for (let keys = Object.keys(list), i = 0, end = keys.length - 1; i <= end; i++) {
		length.push(list[keys[i]].length);
		if (align < list[keys[i]].length) {
			align = list[keys[i]].length;
		}
	}
	result.push(messageHeader(align));
	result.push(`${messageBody(list[0], align)}`);
	result.push(messageSpacer(align));
	for (let keys = Object.keys(list), i = 1, end = keys.length - 1; i <= end; i++) {
		result.push(`${messageBody(list[keys[i]], align, "\u2502")}`);
	}
	result.push(messageFooter(align));
	return result.join('\n');
}

const log = console.log;
process.on('unhandledRejection', function (rejection) {
	log(formatError(`${new Date()}.toLocaleTimeString()} \u2502 Uncaught Rejection`, rejection));
});
process.on('uncaughtException', function (exception) {
	log(formatError(`${new Date().toLocaleTimeString()} \u2502 Uncaught Exception`, exception));
});
