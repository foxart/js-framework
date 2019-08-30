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
	get connector() {
		throw new FaError("connector not specified").setTrace(this._trace);
	}

	/**
	 *
	 * @return {FaDaoMysqlClient}
	 */
	get client() {
		if (!this._client) {
			let Client = require(this.connector);
			this._client = new Client(this.connector);
		}
		return this._client;
	}

	/**
	 *
	 * @param query
	 * @return {Object}
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
	 * @return {Array}
	 */
	async findMany() {
		let trace = FaTrace.trace(1);
		try {
			await this.client.open();
			let result = await this.client.execute(this.query);
			await this.client.close();
			return result;
		} catch (e) {
			throw new FaError(e).setTrace(trace);
		}
	}
}

/**
 *
 * @class {FaDaoMysqlModel}
 */
module.exports = FaDaoMysqlModel;
