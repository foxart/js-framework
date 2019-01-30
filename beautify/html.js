"use strict";
const FaBeautifyWrap = require("./wrap");

class FaBeautifyWrapHtml extends FaBeautifyWrap {
	wrapDataKey(key, type, length, level) {
		return `${this.getTab(level)}<span class="fa-beautify-key">${key}</span>: `;
	}

	wrapDataValue(data, type, length, level) {
		let tab = this.getTab(level);
		let nl = "\n";
		switch (type) {
			case "array":
				return `[<span class="fa-beautify-array">${nl}${data}${tab}]</span>`;
			case "bool":
				// return `${FCH.effect.bold}${data === true ? FCH.color.green : FCH.color.red}${nl}${data}${tab}</span>`;
				return `<span class="fa-beautify-${type}-${data === true ? "true" : "false"}">${data}</span>`;
			case "buffer":
				// return `${FCH.effect.bold}${FCH.color.cyan}${nl}${data}${tab}</span>`;
				return `<<span class="fa-beautify-${type}">${type}</span>>`;
			case "circular":
				// return `${FCH.effect.bold}${FCH.color.cyan}${nl}${data}${tab}</span>`;
				return `<<span class="fa-beautify-${type}">${type}</span>>`;
			case "date":
				// return `${FCH.color.yellow}${nl}${data}${tab}</span>`;
				return `<span class="fa-beautify-${type}">${data}</span>`;
			case "file":
				// return `${FCH.bg.cyan} ${nl}${data}${tab} </span>`;
				return `<<span class="fa-beautify-file">${data}</span>>`;
			case "float":
				// return `${FCH.color.red}${nl}${data}${tab}</span>`;
				return `<span class="fa-beautify-${type}">${data}</span>`;
			case "function":
				// return `${FCH.color.cyan}${nl}${data}${tab}</span>`;
				return `<span class="fa-beautify-${type}">${data}</span>`;
			case "json":
				return `<span class="fa-beautify-${type}">{${nl}${data}${tab}}</span>`;
			case "int":
				// return `${FCH.color.green}${nl}${data}${tab}</span>`;
				return `<span class="fa-beautify-int">${data}</span>`;
			case "mongoId":
				// return `${FCH.bg.blue} ${nl}${data}${tab} </span>`;
				return `<<span class="fa-beautify-${type}">${data}</span>>`;
			case "null":
				// return `${FCH.effect.bold}${FCH.color.white}${nl}${data}${tab}</span>`;
				return `<span class="fa-beautify-${type}">${data}</span>`;
			case "object":
				return `{<span class="fa-beautify-${type}">${nl}${data}${tab}</span>}`;
			case "regExp":
				// return `${FCH.effect.bold}${FCH.color.yellow}${nl}${data}${tab}</span>`;
				return `<span class="fa-beautify-${type}">${data}</span>`;
			case "string":
				// return `${FCH.color.white}${nl}${data}${tab}</span>-->`;
				return `"<span class="fa-beautify-${type}">${data}</span>"`;
			case "undefined":
				// return `${FCH.effect.bold}${FCH.color.magenta}${nl}${data}${tab}</span>`;
				return `<span class="fa-beautify-${type}">${data}</span>`;
			case "xml":
				return `<span class="fa-beautify-${type}">{${nl}${data}${tab}}</span>`;
			default:
				// return `${FCH.bg.magenta} ${nl}${data}${tab} </span>`;
				return `<span class="fa-beautify-default">/*${data}*/</span>`;
		}
	}
}

module.exports = FaBeautifyWrapHtml;
