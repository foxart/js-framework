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
		this._path = path;
		// this._FileClass = new FaServerFileClass(path, 3);
		this._FileClass = new FaServerFileClass();
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

	/**
	 *
	 * @param filename {string}
	 * @returns {string}
	 * @private
	 */
	_filename(filename) {
		// return `${this._path}/${filename.replace(/^\/+/, "").replace(/\/+$/, "")}`;
		// return `${this._path}/${filename.replace(/^\/+/, "")}`;
		return `${this._path}/${filename}.tpl`;
	}

	error(e) {
		if (e instanceof FaError === false) {
			FaConsole.consoleWarn(e)
			e = new FaError(e, false);
			// e.name = this.class;
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
		// FaConsole.consoleInfo(this._file.exist(this._filename(filename)));
		if (this._file.exist(this._filename(filename))) {
			this.set = this._file.asString(this._filename(filename));
		} else {
			throw this.error(`template not found: ${this._filename(filename)}`);
		}
		return this;
	}
};
