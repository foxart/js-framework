"use strict";
/*fa*/
const FaError = require("fa-nodejs/base/error");
const FaTrace = require("fa-nodejs/base/trace");
const FaDaoModelQuery = require("fa-nodejs/dao/model-query");

class FaDaoMysqlModel extends FaDaoModelQuery {
	/**
	 * @param limit {Number}
	 * @return {FaDaoMysqlModel}
	 */
	limit(limit) {
		if (limit) {
			this._query.push(`LIMIT ${limit}`);
		}
		return this;
	}

	/**
	 * @param offset {Number}
	 * @return {FaDaoMysqlModel}
	 */
	offset(offset) {
		if (offset) {
			this._query.push(`OFFSET ${offset}`);
		}
		return this;
	}

	/** @return {Object} */
	async findOne() {
		let trace = FaTrace.trace(1);
		try {
			await this.daoClient.open();
			let result = await this.daoClient.execute(this._sql);
			await this.daoClient.close();
			if (result && result[0]) {
				return result[0];
			} else {
				return null;
			}
		} catch (e) {
			await this.daoClient.close();
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
			await this.daoClient.close();
			throw new FaError(e).prependTrace(trace);
		}
	}
}

/**
 *
 * @class {FaDaoMysqlModel}
 */
module.exports = FaDaoMysqlModel;
