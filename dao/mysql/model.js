"use strict";
/*fa*/
const FaError = require("fa-nodejs/base/error");
const FaTrace = require("fa-nodejs/base/trace");
const FaDaoModel = require("fa-nodejs/dao/model");
/*vars*/
let _client_list = {};

class FaDaoMysqlModel extends FaDaoModel {
	// noinspection JSMethodCanBeStatic
	get client() {
		throw new FaError('client not specified');
	}

	// noinspection JSMethodCanBeStatic
	get table() {
		throw new FaError('table not specified');
	}

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
	async findOne(query) {
		let trace = FaTrace.trace(1);
		try {
			await this._client.open();
			let cursor = await this._client.execute(query);
			// console.info(cursor);
			await this._client.close();
			if (cursor && cursor[0]) {
				this.setData(cursor[0]).setCount(cursor.length);
			} else {
				this.setData(null).setCount(0);
			}
			return true;
		} catch (e) {
			await this._client.close();
			this.setError(new FaError(e).setTrace(trace));
			return false;
		}
	}

	/**
	 *
	 * @param query
	 * @return {Promise<boolean>}
	 */
	async findMany(query) {
		let trace = FaTrace.trace(1);
		try {
			await this._client.open();
			let cursor = await this._client.execute(query);
			// console.info(cursor);
			await this._client.close();
			if (cursor && cursor.length) {
				this.setData(cursor).setCount(cursor.length);
			} else {
				this.setData([]).setCount(0);
			}
			return true;
		} catch (e) {
			await this._client.close();
			this.setError(new FaError(e).setTrace(trace));
			return false;
		}
	}

	/**
	 *
	 * @param query
	 * @return {Promise<boolean>}
	 */
	async insert(query) {
		let trace = FaTrace.trace(1);
		try {
			await this._client.open();
			let cursor = await this._client.execute(query);
			await this._client.close();
			this.setId({id: cursor["insertId"]}).setCount(cursor["affectedRows"]);
			return true;
		} catch (e) {
			await this._client.close();
			this.setError(new FaError(e).setTrace(trace));
			return false;
		}
	}

	/**
	 * @param query
	 * @return {Promise<boolean>}
	 */
	async delete(query) {
		let trace = FaTrace.trace(1);
		try {
			await this._client.open();
			let cursor = await this._client.execute(query);
			await this._client.close();
			this.setCount(cursor["affectedRows"]);
			return true;
		} catch (e) {
			await this._client.close();
			this.setError(new FaError(e).setTrace(trace));
			return false;
		}
	}
}

/**
 *
 * @class {FaDaoMysqlModel}
 */
module.exports = FaDaoMysqlModel;
