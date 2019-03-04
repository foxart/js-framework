"use strict";
/*nodejs*/
const MongoClient = require("mongodb").MongoClient;
/*fa*/
const FaTrace = require("fa-nodejs/base/trace");

class MongoClientClass {
	/**
	 * @constructor
	 */
	constructor() {
		this._MongoClient = null;
		this._trace = FaTrace.trace(1);
	};

	/**
	 *
	 * @return {string}
	 * @private
	 */
	get _url() {
		return `mongodb://${this.host}:${this.port}`;
	};

	/**
	 *
	 * @return {string}
	 */
	get host() {
		return "localhost";
	};

	/**
	 *
	 * @return {number}
	 */
	get port() {
		return 27017;
	};

	/**
	 *
	 * @return {string}
	 */
	get database() {
		throw new FaError("database not specified").setTrace(this._trace);
	};

	/**
	 *
	 * @return {boolean}
	 */
	get persistent() {
		return true;
	};

	/**
	 *
	 * @return {Object}
	 */
	get connectOptions() {
		return {
			useNewUrlParser: true
		};
	};

	/**
	 *
	 * @return {Object}
	 */
	get closeOptions() {
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
				this._MongoClient = await MongoClient.connect(this._url, this.connectOptions);
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
	async pick(collection) {
		try {
			let client = await this.open();
			return client.db(this.database).collection(collection);
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
				this._MongoClient = await this._MongoClient.close(this.closeOptions);
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
