"use strict";
/*fa*/
const FaError = require("fa-nodejs/base/error");
const FaFile = require("fa-nodejs/base/file");
const FaTrace = require("fa-nodejs/base/trace");
const FaTemplate = require("fa-nodejs/application/template");

class FaLayout {
	/**
	 * @constructor
	 * @param pathname {string|null}
	 */
	constructor(pathname = null) {
		this._FaTemplate = new FaTemplate();
		this._FaFile = new FaFile(pathname ? pathname : this._viewsPathname);
	}

	// noinspection JSMethodCanBeStatic
	/**
	 *
	 * @return {string|null}
	 * @private
	 */
	get _viewsPathname() {
		let regular_path = new RegExp(`^(.+)/layouts/([A-Z][^-]+)Layout.js$`);
		let regular_name = new RegExp("[A-Z][^A-Z]*", "g");
		let match_path = FaTrace.trace(2)["path"].match(regular_path);
		if (match_path) {
			return `${match_path[1]}/layouts/${match_path[2].match(regular_name).join("-").toLowerCase()}`;
		} else {
			return null;
		}
	}

	/**
	 *
	 * @param name {string}
	 * @return {FaTemplate}
	 */
	template(name) {
		try {
			this._FaTemplate.set = this._FaFile.readFileSync(`${name}.tpl`).toString();
		} catch (e) {
			throw new FaError(`view not found: ${this._FaFile.getPathname(`${name}.tpl`)}`);
		}
		return this._FaTemplate;
	}

	// noinspection JSMethodCanBeStatic
	/**
	 *
	 * @param data {*}
	 * @return {*}
	 */
	renderIndex(data = null) {
		return data;
	}
}

/**
 *
 * @type {FaLayout}
 */
module.exports = FaLayout;
