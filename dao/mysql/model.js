"use strict";
/*fa*/
// const FaDaoModel = require("fa-nodejs/dao/model");
const FaDaoMysqlClient = require("fa-nodejs/dao/mysql/client");
const FaDaoModelQuery = require("fa-nodejs/dao/model-query");
const FaError = require("fa-nodejs/base/error");
const FaTrace = require("fa-nodejs/base/trace");

class FaDaoMysqlModel extends FaDaoModelQuery {
	/**
	 * @constructor
	 */
	constructor() {
		super();
		this._trace = FaTrace.trace(1);
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
	 * @return {string}
	 */
	get connection() {
		throw new FaError("connection not specified").setTrace(this._trace);
	}

	/**
	 *
	 * @return {FaDaoMysqlClient}
	 */
	get client() {
		if (!this._client) {
			this._client = new FaDaoMysqlClient(this.connection, this._trace);
		}
		return this._client;
	}

	/**
	 *
	 * @param query
	 * @return {Promise<Object>}
	 */
	async findOne(query) {
		// console.info(query);
		// let trace = FaTrace.trace(1);
		let connection = await this.client.open();
		try {
			let result = await this.client.execute(connection, query);
			await this.client.close(connection);
			// console.error(query, result["rows"]);
			if (result && result["rows"] && result["rows"][0]) {
				return result["rows"][0];
			} else {
				return null;
			}
		} catch (e) {
			await this.client.close(connection);
			// console.error(query);
			// throw new FaError(e).setTrace(trace);
		}
	}

	/**
	 *
	 * @param query
	 * @return {Promise<Array>}
	 */
	async findMany(query) {
		let connection = await this.client.open();
		try {
			let result = await this.client.execute(connection, this.query, this._trace);
			await this.client.close(connection);
			// let result = await connection.execute(query);
			return result;
			// if (result && result["rows"]) {
			// 	return result["rows"]
			// } else {
			// 	return [];
			// }
		} catch (e) {
			await this.client.close(connection);
			throw new FaError(e).setTrace(this._trace);
		}
	}
}

/**
 *
 * @class {FaDaoMysqlModel}
 */
module.exports = FaDaoMysqlModel;
