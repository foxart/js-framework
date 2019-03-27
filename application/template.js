"use strict";
const FaBaseError = require("fa-nodejs/base/error");
const FaBaseFile = require("fa-nodejs/base/file");

class FaApplicationTemplate {
	/**
	 *
	 * @param path {string|null}
	 */
	constructor(path = null) {
		this._FaFile = new FaBaseFile(path);
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
	 * @return {FaApplicationTemplate}
	 */
	load(filename) {
		// console.error(filename, this._FaFile.path(filename));
		try {
			this.set = this._FaFile.readFileSync(`${filename}.tpl`).toString();
		} catch (e) {
			throw new Error(`template not found: ${this._FaFile.path(`${filename}.tpl`)}`);
		}
		return this;
	}
}

/**
 *
 * @type {FaApplicationTemplate}
 */
module.exports = FaApplicationTemplate;
