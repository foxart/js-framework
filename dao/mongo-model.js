"use strict";
/*node*/
const ObjectID = require("mongodb").ObjectID;
/*fa*/
const FaError = require("fa-nodejs/base/error");
const FaTrace = require("fa-nodejs/base/trace");
const FaDaoModel = require("fa-nodejs/dao/model");
const FaDaoMongoClient = require("fa-nodejs/dao/mongo-client");

class FaDaoMongoModel extends FaDaoModel {
	/**
	 * @constructor
	 */
	constructor() {
		super();
		this._trace = FaTrace.trace(1);
	}

	get connection() {
		throw new FaError("connection not specified").setTrace(this._trace);
	}

	get table() {
		throw new FaError("table not specified").setTrace(this._trace);
	}

	/**
	 *
	 * @return {FaDaoMongoClient}
	 * @private
	 */
	get _client() {
		if (!this._Client) {
			this._Client = new FaDaoMongoClient(this);
		}
		return this._Client;
	}

	/**
	 *
	 * @returns {ObjectID}
	 */
	get newId() {
		return new ObjectID();
	};

	/**
	 *
	 * @param id
	 * @return {ObjectID}
	 */
	toId(id) {
		return new ObjectID(id);
	};

	/**
	 * @param pipeline {Array|Object}
	 * @param options {Collection~aggregationCallback|null}
	 * @returns {Promise<Array|null>}
	 */
	async aggregate(pipeline, options = null) {
		let trace = FaTrace.trace(1);
		try {
			let connection = await this._client.open();
			let collection = await this._client.collection(connection, this.table);
			let result = await collection.aggregate(pipeline, options).get();
			await this._client.close(connection);
			return result;
		} catch (e) {
			throw new FaError(e).setTrace(trace);
		}
	};

	/**
	 * @param filter {Object|null}
	 * @param options {Object|null}
	 * @return {Promise<Object|null>}
	 */
	async findOne(filter = null, options = null) {
		let trace = FaTrace.trace(1);
		try {
			let connection = await this._client.open();
			let collection = await this._client.collection(connection, this.table);
			let result = collection.findOne(filter, options);
			await this._client.close(connection);
			if (result) {
				return result;
			} else {
				return null;
			}
		} catch (e) {
			throw new FaError(e).setTrace(trace);
		}
	}

	/**
	 *
	 * @param filter {Object|null}
	 * @param options {Object|null}
	 * @return {Promise<Array>}
	 */
	async findMany(filter = null, options = null) {
		let trace = FaTrace.trace(1);
		try {
			let connection = await this._client.open();
			let collection = await this._client.collection(connection, this.table);
			let cursor = await collection.find(filter, options);
			let result = await cursor.toArray();
			await this._client.close(connection);
			if (result.length > 0) {
				return result;
			} else {
				return [];
			}
		} catch (e) {
			throw new FaError(e).setTrace(trace);
		}
	}

	/**
	 *
	 * @param document {Object}
	 * @param options {Object|null}
	 * @return {Promise<{inserted: number, data: Object, id: ObjectID}>}
	 */
	async insertOne(document, options = null) {
		let trace = FaTrace.trace(1);
		try {
			let connection = await this._client.open();
			let collection = await this._client.collection(connection, this.table);
			let cursor = await collection.insertOne(document, options);
			let result = {
				_id: cursor["insertedId"],
				inserted: cursor["insertedCount"],
				data: cursor["ops"][0],
			};
			await this._client.close(connection);
			return result;
		} catch (e) {
			throw new FaError(e).setTrace(trace);
		}
	}

	/**
	 *
	 * @param document {Object[]}
	 * @param options {Object|null}
	 * @return {Promise<{inserted: number, data: Object, id: ObjectID[]}>}
	 */
	async insertMany(document, options = null) {
		let trace = FaTrace.trace(1);
		try {
			let connection = await this._client.open();
			let collection = await this._client.collection(connection, this.table);
			let cursor = await collection.insertMany(document, options);
			let result = {
				_id: cursor["insertedIds"],
				inserted: cursor["insertedCount"],
				data: cursor["ops"],
			};
			await this._client.close(connection);
			return result;
		} catch (e) {
			throw new FaError(e).setTrace(trace);
		}
	}

	/**
	 *
	 * @param filter {Object}
	 * @param update {Object}
	 * @param options {Object|null}
	 * @return {Promise<{filtered: *, modified: *, _id: null, upserted: *}>}
	 */
	async updateOne(filter, update, options = null) {
		let trace = FaTrace.trace(1);
		try {
			let connection = await this._client.open();
			let collection = await this._client.collection(connection, this.table);
			let cursor = await collection.updateOne(filter, update, options);
			let result = {
				_id: cursor["upsertedId"] === null ? null : cursor["upsertedId"]["_id"],
				filtered: cursor["matchedCount"],
				modified: cursor["modifiedCount"],
				upserted: cursor["upsertedCount"],
			};
			await this._client.close(connection);
			// console.warn(result);
			return result;
		} catch (e) {
			throw new FaError(e).setTrace(trace);
		}
	}

	/**
	 *
	 * @param filter {Object}
	 * @param update {Object}
	 * @param options {Object}
	 * @return {Promise<{filtered: *, modified: *, id: null, upserted: *}>}
	 */
	async updateMany(filter, update, options) {
		let trace = FaTrace.trace(1);
		try {
			let connection = await this._client.open();
			let collection = await this._client.collection(connection, this.table);
			let cursor = await collection.updateMany(filter, update, options);
			let result = {
				_id: cursor["upsertedId"] === null ? null : cursor["upsertedId"]["_id"],
				filtered: cursor["matchedCount"],
				modified: cursor["modifiedCount"],
				upserted: cursor["upsertedCount"],
			};
			await this._client.close(connection);
			return result;
		} catch (e) {
			throw new FaError(e).setTrace(trace);
		}
	}
}

/**
 *
 * @type {FaDaoMongoModel}
 */
module.exports = FaDaoMongoModel;
