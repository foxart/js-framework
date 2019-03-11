"use strict";
/*nodejs*/
const MongoClient = require("mongodb").MongoClient;
/*fa*/
const ClientClass = require("fa-nodejs/dao/client");
const FaTrace = require("fa-nodejs/base/trace");

class MongoClientClass extends ClientClass {
	/**
	 * @constructor
	 */
	constructor() {
		super();
		this._MongoClient = null;
		this._trace = FaTrace.trace(1);
	};

	/**
	 *
	 * @return {string}
	 * @private
	 */
	get dcs() {
		return `mongodb://${this.host}:${this.port}`;
	};

	/**
	 *
	 * @return {Object}
	 */
	get optionsConnect() {
		return {
			useNewUrlParser: true
		};
	};

	/**
	 *
	 * @return {Object}
	 */
	get optionsClose() {
		return {
			forceClose: false,
		};
	};

	/**
	 *
	 * @return {Promise<MongoClient>}
	 */
	async open() {
		try {
			if (!this._MongoClient) {
				this._MongoClient = await MongoClient.connect(this.dcs, this.optionsConnect);
			}
			return this._MongoClient;
		} catch (e) {
			throw new FaError(e).setTrace(this._trace);
		}
	};

	/**
	 *
	 * @param collection {string}
	 * @return {Promise<Collection>}
	 */
	async client(collection) {
		try {
			let client = await this.open();
			return await client.db(this.database).collection(collection);
		} catch (e) {
			throw new FaError(e).setTrace(this._trace);
		}
	};

	/**
	 *
	 * @return {Promise<boolean>}
	 */
	async close() {
		try {
			if (!this.persistent && this._MongoClient) {
				this._MongoClient = await this._MongoClient.close(this.optionsClose);
				return true;
			} else {
				return false;
			}
		} catch (e) {
			throw new FaError(e).setTrace(this._trace);
		}
	};
}

/**
 *
 * @type {MongoClientClass}
 */
module.exports = MongoClientClass;
