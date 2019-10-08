"use strict";
/*fa*/
const FaError = require("fa-nodejs/base/error");

class FaDaoModel {
	/** @constructor */
	constructor() {
		this._error = null;
		// this._result = null;
		this._data = null;
		this._count = 0;
	}

	/**
	 * @return {boolean}
	 */
	get hasError() {
		return this._error !== null;
	}

	/**
	 *
	 * @param error
	 * @return {FaDaoModel}
	 */
	setError(error) {
		this._error = new FaError(error);
		return this;
	}

	/**
	 * @return {FaError}
	 */
	get error() {
		return this._error;
	}

	/**
	 * @return {string}
	 */
	get errorMessage() {
		return this._error['message'];
	}

	// noinspection JSMethodCanBeStatic
	/**
	 * @return {Array}
	 * @protected
	 */
	get attributes() {
		throw new FaError("attributes not specified");
	};

	get data() {
		return this._data;
	}

	setData(data) {
		this._data = data;
		return this;
	}

	get count() {
		return this._count;
	}

	setCount(count) {
		this._count = count;
	}

	/**
	 * @param data
	 * @return {Object|Array<Object>}
	 */
	load(data) {
		let self = this;
		this.attributes.forEach(function (map) {
			if (data[map]) {
				self._data[map] = data[map];
			} else {
				// self._data[map] = null;
			}
		});
	}
}

/** @class {FaDaoModel} */
module.exports = FaDaoModel;
