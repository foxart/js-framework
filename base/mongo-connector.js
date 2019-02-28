"use strict";
/*nodejs*/
const MongoClient = require("mongodb").MongoClient;

class MongoConnectorClass {
	constructor() {
		this._client = null;
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
	get databaseName() {
		return "mongo";
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
		if (this._client) {
			return this._client;
		} else {
			this._client = await MongoClient.connect(this._url, this.connectOptions);
			return this._client;
		}
	};

	/**
	 *
	 * @param database
	 * @return {Promise<Db>}
	 */
	async database(database) {
		let client = await this.open();
		return client.db(database);
	};

	/**
	 *
	 * @param collection
	 * @return {Promise<Collection>}
	 */
	async collection(collection) {
		let client = await this.open();
		let db = client.db(this.databaseName);
		return db.collection(collection);
	};

	/**
	 *
	 * @return {Promise<void>}
	 */
	async close() {
		let self = this;
		if (!this.persistent) {
			let client = await this.open();
			await client.close(this.closeOptions);
			self._client = null;
		}
	};
}

/**
 *
 * @type {MongoConnectorClass}
 */
module.exports = MongoConnectorClass;
