'use strict';
/*vendor*/
const FaError = require('../error');
const FaServerFileClass = require('../server/file');
const FaTraceClass = require('../trace');
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
		// FaConsole.consoleInfo(path);
		this._FileClass = new FaServerFileClass(path, 3);
		this._TraceClass = new FaTraceClass();
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

	error(e) {
		if (e instanceof FaError === false) {
			e = new FaError(e, false);
			// e.name = this.class;
			// FaConsole.consoleWarn(this)
		}
		e.appendTrace(this._TraceClass.parse(e).string(3));
		return e;
	}

	/**
	 *
	 * @param filename {string}
	 * @return {module.FaTemplateClass}
	 */
	load(filename) {
		try {
			this.set = this._file.asString(`/${filename}.tpl`);
		} catch (e) {
			throw this.error(`template not found: ${filename}`);
		}
		return this;
	}
};
