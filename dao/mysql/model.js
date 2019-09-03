"use strict";
/*fa*/
const FaError = require("fa-nodejs/base/error");
const FaTrace = require("fa-nodejs/base/trace");
const FaDaoModelQuery = require("fa-nodejs/dao/model-query");

class FaDaoMysqlModel extends FaDaoModelQuery {
	/**
	 * @constructor
	 */
	constructor() {
		super();
		// this._trace = FaTrace.trace(1);
	}

	/**
	 *
	 * @return {string|null}
	 * @private
	 */
	get _getLimit() {
		if (this._limit) {
			return `LIMIT ${this._limit} `;
		} else {
			return null;
		}
	}

	/**
	 *
	 * @return {string|null}
	 * @private
	 */
	get _getOffset() {
		if (this._offset) {
			return `OFFSET ${this._offset} `;
		} else {
			return null;
		}
	}

	/**
	 *
	 * @return {Object}
	 */
	async findOne() {
		let trace = FaTrace.trace(1);
		try {
			await this.daoClient.open();
			if (!this._getLimit) {
				this.limit(1);
			}
			let result = await this.daoClient.execute(this.query);
			await this.daoClient.close();
			if (result && result[0]) {
				return result[0];
			} else {
				return null;
			}
		} catch (e) {
			throw new FaError(e).prependTrace(trace);
		}
	}

	/**
	 *
	 * @return {Array}
	 */
	async findMany() {
		let trace = FaTrace.trace(1);
		try {
			await this.daoClient.open();
			let result = await this.daoClient.execute(this.query);
			await this.daoClient.close();
			if (result && result.length) {
				return result;
			} else {
				return [];
			}
		} catch (e) {
			throw new FaError(e).prependTrace(trace);
		}
	}
}

/**
 *
 * @class {FaDaoMysqlModel}
 */
module.exports = FaDaoMysqlModel;
