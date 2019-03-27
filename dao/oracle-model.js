"use strict";
/*fa*/
const FaDaoModel = require("fa-nodejs/dao/model");
const FaDaoOracleClient = require("fa-nodejs/dao/oracle-client");
const FaDaoQuery = require("fa-nodejs/dao/query");
const FaTrace = require("fa-nodejs/base/trace");
const FaError = require("fa-nodejs/base/error");

class FaDaoOracleModel extends FaDaoModel {
	/**
	 * @constructor
	 */
	constructor() {
		super();
		this._trace = FaTrace.trace(1);
	};

	get connection() {
		throw new FaError("connection not specified").setTrace(this._trace);
	}

	get table() {
		throw new FaError("table not specified").setTrace(this._trace);
	}

	/**
	 *
	 * @return {FaDaoOracleClient}
	 */
	get client() {
		if (!this._Client) {
			this._Client = new FaDaoOracleClient(this);
		}
		return this._Client;
	}

	/**
	 *
	 * @return {FaDaoQuery}
	 */
	get query() {
		if (!this._Query) {
			this._Query = new FaDaoQuery(this);
		}
		return this._Query;
	}

	/**
	 *
	 * @param query
	 * @return {Promise<Object>}
	 */
	async findOne(query) {
		// console.info(query);
		let trace = FaTrace.trace(1);
		let connection = await this.client.open();
		try {
			let result = await this.client.execute(connection, query);
			await this.client.close(connection);
			// let result = await connection.execute(query);
			if (result && result["rows"] && result["rows"][0]) {
				return result["rows"][0];
			} else {
				return null;
			}
		} catch (e) {
			await this.client.close(connection);
			console.error(query);
			throw new FaError(e).setTrace(trace);
		}
	}

	/**
	 *
	 * @param query
	 * @return {Promise<Array>}
	 */
	async findMany(query) {
		// console.info(query);
		let trace = FaTrace.trace(1);
		let connection = await this.client.open();
		try {
			let result = await this.client.execute(connection, query);
			// let result = await connection.execute(query);
			await this.client.close(connection);
			if (result && result["rows"]) {
				return result["rows"]
			} else {
				return [];
			}
		} catch (e) {
			await this.client.close(connection);
			console.error(query);
			throw new FaError(e).setTrace(trace);
		}
	}
}

/**
 *
 * @type {FaDaoOracleModel}
 */
module.exports = FaDaoOracleModel;
