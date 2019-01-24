"use strict";
const FaError = require("../base/error");
const FaFileClass = require("../base/file");

/**
 *
 * @type {FaTemplateClass}
 */
class FaTemplateClass {
	/**
	 *
	 * @param path {string|null}
	 */
	constructor(path = null) {
		this._FaFileClass = new FaFileClass(path);
		this._template = '';
	}

	/**
	 *
	 * @return {FaFileClass}
	 * @private
	 */
	get _File() {
		return this._FaFileClass;
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
	 * @return {FaTemplateClass}
	 */
	load(filename) {
		// console.error(this._File.path(filename));
		try {
			this.set = this._File.readStringSync(`${filename}.tpl`);
		} catch (e) {
			// server1.console.error(e);
			throw FaError.pickTrace(`template not found: ${this._File.path(`${filename}.tpl`)}`, 2);
		}
		return this;
	}
}

/**
 *
 * @param path {string|null}
 * @return {FaTemplateClass}
 */
module.exports = function (path = null) {
	if (arguments) {
		return new FaTemplateClass(path);
	} else {
		return FaTemplateClass;
	}
};
