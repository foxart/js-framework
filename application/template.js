"use strict";
const FaError = require("../base/error");
const FaFileClass = require("../base/file");
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
		this._FaFile = new FaFileClass(path);
		this._template = "";
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
		// console.error(this._FaFile.path(filename));
		try {
			this.set = this._FaFile.readFileSync(`${filename}.tpl`).toString();
		} catch (e) {
			throw FaError.pickTrace(`template not found: ${this._FaFile.path(`${filename}.tpl`)}`, 2);
		}
		return this;
	}
};
