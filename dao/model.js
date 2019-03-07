"use strict";
/*fa*/
const FaError = require("fa-nodejs/base/error");
const FaTrace = require("fa-nodejs/base/trace");
const AdapterClass = require("fa-nodejs/dao/adapter");

class ModelClass {
	/**
	 * @constructor
	 */
	constructor() {
		this._trace = FaTrace.trace(1);
		this._adapter_list = this._adapters;
	}

	get client() {
		throw new FaError("client not specified").setTrace(this._trace);
	}

	get table() {
		throw new FaError("table not specified").setTrace(this._trace);
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
			result[key] = new AdapterClass(adapter);
		});
		return result;
	}

	/**
	 *
	 * @param adapter {string}
	 * @return {AdapterClass}
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
	 * @return {AdapterClass}
	 * @private
	 */
	_findAdapter(adapter) {
		return this._adapter_list[adapter];
	}
}

/**
 *
 * @type {ModelClass}
 */
module.exports = ModelClass;
