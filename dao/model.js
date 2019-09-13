"use strict";
/*fa*/
const FaError = require("fa-nodejs/base/error");
// const FaTrace = require("fa-nodejs/base/trace");
// const FaDaoAdapterClass = require("fa-nodejs/dao/adapter");
const FaDaoAttribute = require("fa-nodejs/dao/attribute");

class FaDaoModel {
	/** @constructor */
	constructor() {
		this._error = null;
		this._result = null;
	}

	/**
	 * @return {boolean}
	 */
	hasError() {
		return this._error !== null;
	}

	/**
	 * @param error {string|FaError}
	 */
	setError(error) {
		this._error = new FaError(error);
	}

	/**
	 * @return {FaError}
	 */
	getError() {
		return this._error;
	}

	/**
	 * @param result {Array<Object>|Object|null}
	 */
	setResult(result) {
		this._result = result;
	}

	/**
	 * @return {Array<Object>|Object|null}
	 */
	getResult() {
		return this._result;
	}

	// noinspection JSMethodCanBeStatic
	/**
	 * @return {Array}
	 * @protected
	 */
	get attributes() {
		throw new FaError("attributes not specified");
	};

	/**
	 * @return {FaDaoAttribute}
	 */
	get attribute() {
		if (!this._FaDaoAttribute) {
			this._FaDaoAttribute = new FaDaoAttribute(this.attributes);
		}
		return this._FaDaoAttribute;
	}

	/**
	 * @param data
	 * @return {Object|Array<Object>}
	 */
	load(data) {
		return this._FaDaoAttribute.fill(data);
	}
}

/** @class {FaDaoModel} */
module.exports = FaDaoModel;
