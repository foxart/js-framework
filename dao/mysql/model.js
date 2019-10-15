"use strict";
/*fa*/
const FaError = require("fa-nodejs/base/error");
const FaTrace = require("fa-nodejs/base/trace");
const FaDaoModel = require("fa-nodejs/dao/model");
/*vars*/
let _client_list = {};

class FaDaoMysqlModel extends FaDaoModel {
	// noinspection JSMethodCanBeStatic
	/**
	 * @param cursor
	 * @param query
	 * @param trace
	 * @private
	 */
	__log(cursor, query, trace) {
		if (process.env.NODEJS_ENV === 'local') {
			// console.log(cursor, query, trace);
		}
	}

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

	/**
	 * @param query
	 * @return {Promise<boolean>}
	 * @protected
	 */
	async findMany(query) {
		let trace = FaTrace.trace(1);
		try {
			await this._client.open();
			let cursor = await this._client.execute(query);
			await this._client.close();
			this.__log(cursor, query, trace);
			if (cursor && cursor.length) {
				this.setResult(cursor).setCount(cursor.length);
				return true;
			} else {
				this.setResult([]).setCount(0);
				return null;
			}
		} catch (e) {
			await this._client.close();
			this.setError(new FaError(e).setTrace(trace));
			return false;
		}
	}

	/**
	 * @param query
	 * @return {Promise<boolean>}
	 * @protected
	 */
	async findOne(query) {
		let trace = FaTrace.trace(1);
		try {
			await this._client.open();
			let cursor = await this._client.execute(query);
			await this._client.close();
			this.__log(cursor, query, trace);
			if (cursor && cursor[0] && Object.values(cursor[0]).filter(item => item).length) {
				this.setResult(cursor[0]).setCount(1);
				return true;
			} else {
				this.setResult(null).setCount(0);
				return null;
			}
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
	 * @protected
	 */
	async insert(query) {
		let trace = FaTrace.trace(1);
		try {
			await this._client.open();
			let cursor = await this._client.execute(query);
			await this._client.close();
			this.__log(cursor, query, trace);
			this.setId(cursor["insertId"]).setCount(cursor["affectedRows"]);
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
	 * @protected
	 */
	async update(query) {
		let trace = FaTrace.trace(1);
		try {
			await this._client.open();
			let cursor = await this._client.execute(query);
			await this._client.close();
			this.__log(cursor, query, trace);
			this.setCount(cursor["affectedRows"]);
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
	 * @protected
	 */
	async delete(query) {
		let trace = FaTrace.trace(1);
		try {
			await this._client.open();
			let cursor = await this._client.execute(query);
			await this._client.close();
			this.__log(cursor, query, trace);
			// console.error(cursor, query, trace);
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
