"use strict";
/*fa*/
const FaError = require("fa-nodejs/base/error");
const FaTrace = require("fa-nodejs/base/trace");
const FaDaoModel = require("fa-nodejs/dao/model");
/*vars*/
let _client_list = {};

class FaDaoMysqlModel extends FaDaoModel {
	/**
	 *
	 * @return {*}
	 * @private
	 */
	get _client() {
		if (!_client_list[this.client]) {
			let Client = require(this.client);
			_client_list[this.client] = new Client(this.client);
		}
		return _client_list[this.client];
	}

	/** @return {Object} */
	async findOne() {
		let trace = FaTrace.trace(1);
		try {
			await this._client.open();
			/**/
			// console.warn(this.sql);
			let result = await this._client.execute(this._sql);
			await this._client.close();
			if (result && result[0]) {
				return result[0];
			} else {
				return null;
			}
		} catch (e) {
			await this._client.close();
			return new FaError(e).prependTrace(trace);
		}
	}

	/** @return {Array} */
	/**
	 * @param query
	 * @return {Promise<FaDaoModel|Array>}
	 */
	async findMany(query) {
		let trace = FaTrace.trace(1);
		try {
			await this._client.open();
			let result = await this._client.execute(query);
			await this._client.close();
			if (result && result.length) {
				this.setData(result).setCount(result.length);
			} else {
				this.setData([]).setCount(0);
			}
			return this;
		} catch (e) {
			await this._client.close();
			return this.setError(new FaError(e).setTrace(trace));
		}
	}

	/**
	 *
	 * @return {Promise<FaDaoModel>}
	 */
	async addOne() {
		let trace = FaTrace.trace(1);
		try {
			await this._client.open();
			let cursor = await this._client.execute(this._sql + ';' + this._sql);
			console.info(cursor);
			await this._client.close();
			this.load({id: cursor["insertId"]});
			this.setCount(cursor["affectedRows"]);
			return this;
		} catch (e) {
			await this._client.close();
			return this.setError(new FaError(e).setTrace(trace));
		}
	}

	/**
	 *
	 * @return {Promise<FaDaoModel>}
	 */
	async delete() {
		let trace = FaTrace.trace(1);
		try {
			await this._client.open();
			let cursor = await this._client.execute(this._sql + ';' + this._sql);
			console.info(cursor);
			await this._client.close();
			this.load({id: cursor["insertId"]});
			this.setCount(cursor["affectedRows"]);
			return this;
		} catch (e) {
			await this._client.close();
			return this.setError(new FaError(e).setTrace(trace));
		}
	}
}

/**
 *
 * @class {FaDaoMysqlModel}
 */
module.exports = FaDaoMysqlModel;
