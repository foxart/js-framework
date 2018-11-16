'use strict';
/*vendor*/
const FaServerFileClass = require('../server/file');
const FaTraceClass = require('../trace.js');
/**
 *
 * @type {module.FaTemplateClass}
 */
module.exports = class FaTemplateClass {
	/**
	 *
	 * @param path {string|null}
	 */
	constructor(path = null) {
		FaConsole.consoleInfo(path);
		this._FileClass = new FaServerFileClass(path, 2);
		this._template = '';
	}

	/**
	 *
	 * @returns {module.FaFileClass}
	 * @private
	 */
	get _file() {
		return this._FileClass;
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

	/**
	 *
	 * @param filename {string}
	 * @return {module.FaTemplateClass}
	 */
	load(filename) {
		this.set = this._file.asString(`views/${filename}.tpl`);
		return this;
	}
};
