"use strict";
/*fa*/
const FaError = require("fa-nodejs/base/error");
// const FaTrace = require("fa-nodejs/base/trace");
const FaDaoAdapter = require("fa-nodejs/dao/adapter");

class FaDaoModel {
	/**
	 * @constructor
	 */
	constructor() {
		// this._trace = FaTrace.trace(1);
		this._adapter_list = this._adapters;
	}

	/**
	 *
	 * @return {{}}
	 */
	get attributes() {
		return {};
	};

	/**
	 *
	 * @return {{}}
	 */
	get adapters() {
		return {};
	}

	/**
	 *
	 * @return {{AdapterClass}}
	 * @private
	 */
	get _adapters() {
		let result = {};
		Object.entries(this.adapters).map(function ([key, adapter]) {
			result[key] = new FaDaoAdapter(adapter);
		});
		return result;
	}

	/**
	 *
	 * @param adapter {string}
	 * @return {FaDaoAdapter}
	 */
	adapter(adapter) {
		if (this._existAdapter(adapter)) {
			return this._findAdapter(adapter);
		} else {
			throw new FaError(`adapter not found: ${adapter}`).pickTrace(1);
		}
	}

	/**
	 *
	 * @param adapter {string}
	 * @return {boolean}
	 * @private
	 */
	_existAdapter(adapter) {
		return !!this._adapter_list[adapter];
	}

	/**
	 *
	 * @param adapter
	 * @return {FaDaoAdapter}
	 * @private
	 */
	_findAdapter(adapter) {
		return this._adapter_list[adapter];
	}
}

/**
 *
 * @type {FaDaoModel}
 */
module.exports = FaDaoModel;
