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

	// noinspection JSMethodCanBeStatic
	/**
	 *
	 * @param error
	 * @return {boolean}
	 */
	isError(error) {
		return error instanceof FaError;
	}

	// noinspection JSMethodCanBeStatic
	/**
	 *
	 * @param error
	 * @return {FaError}
	 */
	setError(error) {
		return new FaError(error);
	}

	// noinspection JSMethodCanBeStatic
	/**
	 *
	 * @param error
	 * @return {string}
	 */
	getErrorMessage(error) {
		return error.message;
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
