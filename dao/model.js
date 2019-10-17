"use strict";
/*fa*/
const FaError = require("fa-nodejs/base/error");

class FaDaoModel {
	/** @constructor */
	constructor() {
		this._error = null;
		this._result = null;
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
	 * @return {string}
	 */
	get errorMessage() {
		return this._error['message'];
	}

	/**
	 * @param error
	 * @return {FaDaoModel}
	 */
	setError(error) {
		if (error === null) {
			this._error = null;
		} else {
			this._error = new FaError(error);
		}
		return this;
	}

	get result() {
		return this._result;
	}

	/**
	 * @param result
	 * @return {FaDaoModel}
	 */
	setResult(result) {
		this._result = result;
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
	 *
	 * @param data
	 * @return {FaDaoModel}
	 */
	load(data) {
		let self = this;
		Object.entries(data).forEach(function (item) {
			if (self.attributes.has(item[0])){
				self._data[item[0]] = item[1];
			}
		});
		// this.attributes.forEach(function (item) {
		// 	if (data[item]) {
		// 		self._data[item] = data[item];
		// 	} else {
		// 		self._data[item] = null;
		// 	}
		// });
		// console.error(this.data);
		return this;
	}

	get data() {
		return this._data;
	}
}

/** @class {FaDaoModel} */
module.exports = FaDaoModel;
