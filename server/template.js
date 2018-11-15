'use strict';
/*vendor*/
const FaServerFileClass = require('./file');
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
		this._FileClass = new FaServerFileClass(path, 2);
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
	 * @param filename {string}
	 * @returns {string}
	 */
	get(filename) {
		return this._file.asString(filename);
	}
};
