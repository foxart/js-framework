"use strict";
/*fa*/
const FaError = require("fa-nodejs/base/error");
// const FaTrace = require("fa-nodejs/base/trace");
const FaDaoAdapterClass = require("fa-nodejs/dao/adapter");
const FaDaoAttributeClass = require("fa-nodejs/dao/attribute");
const FaDaoStructureClass = require("fa-nodejs/dao/structure");

class FaDaoModel {
	/**
	 * @constructor
	 */
	constructor() {
		// this._trace = FaTrace.trace(1);
		this._adapter_list = {};
		this._intializeAdapters;
	}

	/**
	 *
	 * @private
	 */
	get _intializeAdapters() {
		let context = this;
		Object.entries(this.adapters).map(function ([key, value]) {
			if (!context._existAdapter(key)) {
				context._attachAdapter(key, value);
			}
		});
	}

	/**
	 *
	 * @param key {string}
	 * @param value {Object}
	 * @private
	 */
	_attachAdapter(key, value) {
		let adapter = new FaDaoAdapterClass();
		adapter.adapter = value;
		this._adapter_list[key] = adapter;
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

	/**
	 *
	 * @return {{}}
	 */
	get adapters() {
		return {};
	}

	/**
	 *
	 * @param adapter {string}
	 * @return {FaDaoAdapter}
	 */
	Adapters(adapter) {
		// console.error([adapter])
		if (this._existAdapter(adapter)) {
			return this._findAdapter(adapter);
		} else {
			throw new FaError(`adapter not found: ${adapter}`).pickTrace(1);
		}
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
	 * @return {FaDaoAttribute}
	 * @constructor
	 */
	get Attributes() {
		if (!this._FaDaoAttribute) {
			this._FaDaoAttribute = new FaDaoAttributeClass();
			this._FaDaoAttribute.setAttributes(this.structure);
		}
		return this._FaDaoAttribute;
	}

	/**
	 *
	 * @return {{}}
	 */
	get structure() {
		return {};
	};

	/**
	 *
	 * @return {FaDaoStructure}
	 * @constructor
	 */
	get Structure() {
		if (!this._FaDaoStructure) {
			this._FaDaoStructure = new FaDaoStructureClass();
			this._FaDaoStructure.setStructure(this.structure);
		}
		return this._FaDaoStructure;
	}

	load(data) {
		return this._FaDaoAttribute.fill(data);
	}
}

/**
 *
 * @type {FaDaoModel}
 */
module.exports = FaDaoModel;
