"use strict";
/*fa*/
const FaError = require("fa-nodejs/base/error");

class FaDaoModel {
	/** @constructor */
	constructor() {
		this._error = null;
		this._data = {};
		this._count = 0;
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
	 * @return {FaError}
	 */
	get error() {
		return this._error;
	}

	/**
	 * @param error
	 * @return {FaDaoModel}
	 */
	setError(error) {
		this._error = new FaError(error);
		return this;
	}

	/**
	 * @return {string}
	 */
	get errorMessage() {
		return this._error['message'];
	}

	get data() {
		return this._data;
	}

	/**
	 * @param data
	 * @return {FaDaoModel}
	 */
	setData(data) {
		this._data = data;
		return this;
	}

	get count() {
		return this._count;
	}

	/**
	 * @param count
	 * @return {FaDaoModel}
	 */
	setCount(count) {
		this._count = count;
		return this;
	}

	get id() {
		return this._id;
	}

	/**
	 * @param id
	 * @return {FaDaoModel}
	 */

	setId(id) {
		this._id = id;
		return this;
	}

	/**
	 * @param data
	 * @return {Object|Array<Object>}
	 */
	load(data) {
		let self = this;
		this.attributes.forEach(function (value) {
			if (data[value]) {
				self._data[value] = data[value];
			} else {
				self._data[value] = null;
			}
		});
	}
}

/** @class {FaDaoModel} */
module.exports = FaDaoModel;
