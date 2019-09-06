"use strict";
/*fa*/
const FaError = require("fa-nodejs/base/error");
const FaTrace = require("fa-nodejs/base/trace");
const FaDaoModelQuery = require("fa-nodejs/dao/model-query");

class FaDaoMysqlModel extends FaDaoModelQuery {
	/**
	 * @return {string|null}
	 * @private
	 */
	get _limit() {
		if (this._prop_limit) {
			return `LIMIT ${this._prop_limit} `;
		} else {
			return null;
		}
	}

	/**
	 * @return {string|null}
	 * @private
	 */
	get _offset() {
		if (this._prop_offset) {
			return `OFFSET ${this._prop_offset} `;
		} else {
			return null;
		}
	}

	/** @return {Object} */
	async findOne() {
		let trace = FaTrace.trace(1);
		try {
			await this.daoClient.open();
			if (!this._getLimit) {
				this.limit(1);
			}
			let result = await this.daoClient.execute(this._sql);
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

	/** @return {Array} */
	async findMany() {
		let trace = FaTrace.trace(1);
		try {
			await this.daoClient.open();
			let result = await this.daoClient.execute(this._sql);
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
