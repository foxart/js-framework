"use strict";
/*fa*/
// const FaError = require("fa-nodejs/base/error");
const FaFile = require("fa-nodejs/base/file");
const FaTrace = require("fa-nodejs/base/trace");
const FaTwig = require("fa-nodejs/base/twig");
const FaTemplate = require("fa-nodejs/application/template");

class FaLayout {
	/**
	 * @constructor
	 * @param pathname {string|null}
	 */
	constructor(pathname = null) {
		this._pathname = pathname ? pathname : this._viewsPathname;
		this._FaTemplate = new FaTemplate();
		this._FaFile = new FaFile(this._pathname);
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
	 * @return {FaTwig}
	 */
	get twig() {
		if (!this._FaTwig) {
			this._FaTwig = new FaTwig(this._pathname);
		}
		return this._FaTwig;
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
