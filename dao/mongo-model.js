"use strict";
/*node*/
const ObjectID = require("mongodb").ObjectID;
/*fa*/
const FaError = require("fa-nodejs/base/error");
const FaTrace = require("fa-nodejs/base/trace");
const ModelClass = require("fa-nodejs/dao/model");
const MongoClientClass = require("fa-nodejs/dao/mongo-client");
/*variables*/
let _client_list = {};

class MongoModelClass extends ModelClass {
	/**
	 * @constructor
	 */
	constructor() {
		super();
		this._trace = FaTrace.trace(1);
	}

	/**
	 *
	 * @return {MongoClientClass}
	 * @private
	 */
	get _MongoClient() {
		let result = _client_list[this.client];
		if (!result) {
			try {
				let model_path = this._trace["path"];
				let regular_path = new RegExp(`^(.+)/modules/.+models/([A-Z][^-]+)Model.js$`);
				let match_path = model_path.match(regular_path);
				let path = `${match_path[1]}/config/clients/${this.client.split("-").map(item => item.capitalize()).join("")}Client.js`;
				let FaConnectorClass = require(path);
				_client_list[this.client] = new FaConnectorClass;
				result = _client_list[this.client];
			} catch (e) {
				throw new FaError(`connector not found: ${this.client}`).pickTrace(2);
				// throw new FaError(e).pickTrace(2);
			}
		}
		return result;
	}

	get client() {
		throw new FaError("client not specified").setTrace(this._trace);
	}

	get collection() {
		throw new FaError("collection not specified").setTrace(this._trace);
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
		await this._MongoClient.open();
		let collection = await this._MongoClient.pick(this.collection);
		let result = await collection.aggregate(pipeline, options).get();
		await this._MongoClient.close();
		return result;
	};

	/**
	 * @param filter {Object|null}
	 * @param options {Object|null}
	 * @return {Promise<Object|null>}
	 */
	async findOne(filter = null, options = null) {
		await this._MongoClient.open();
		let collection = await this._MongoClient.pick(this.collection);
		let result = collection.findOne(filter, options);
		await this._MongoClient.close();
		return result;
	};

	/**
	 *
	 * @param filter {Object|null}
	 * @param options {Object|null}
	 * @return {Promise<Array|null>}
	 */
	async findMany(filter = null, options = null) {
		await this._MongoClient.open();
		let collection = await this._MongoClient.pick(this.collection);
		let cursor = await collection.find(filter, options);
		let result = await cursor.toArray();
		await this._MongoClient.close();
		return result;
	};

	/**
	 *
	 * @param document {Object}
	 * @param options {Object|null}
	 * @return {Promise<{inserted: number, data: Object, id: ObjectID}>}
	 */
	async insertOne(document, options = null) {
		await this._MongoClient.open();
		let collection = await this._MongoClient.pick(this.collection);
		let cursor = await collection.insertOne(document, options);
		let result = {
			id: cursor["insertedId"],
			inserted: cursor["insertedCount"],
			data: cursor["ops"][0],
		};
		await this._MongoClient.close();
		return result;
	};

	/**
	 *
	 * @param document {Object[]}
	 * @param options {Object|null}
	 * @return {Promise<{inserted: number, data: Object, id: ObjectID[]}>}
	 */
	async insertMany(document, options = null) {
		await this._MongoClient.open();
		let collection = await this._MongoClient.pick(this.collection);
		let cursor = await collection.insertMany(document, options);
		let result = {
			id: cursor["insertedIds"],
			inserted: cursor["insertedCount"],
			data: cursor["ops"],
		};
		await this._MongoClient.close();
		return result;
	};

	/**
	 *
	 * @param filter {Object}
	 * @param update {Object}
	 * @param options {Object}
	 * @return {Promise<{filtered: *, modified: *, id: null, upserted: *}>}
	 */
	async updateOne(filter, update, options) {
		await this._MongoClient.open();
		let collection = await this._MongoClient.pick(this.collection);
		let cursor = await collection.updateOne(filter, update, options);
		let result = {
			id: cursor["upsertedId"] === null ? null : cursor["upsertedId"]["_id"],
			filtered: cursor["matchedCount"],
			modified: cursor["modifiedCount"],
			upserted: cursor["upsertedCount"],
		};
		await this._MongoClient.close();
		return result;
	};

	/**
	 *
	 * @param filter {Object}
	 * @param update {Object}
	 * @param options {Object}
	 * @return {Promise<{filtered: *, modified: *, id: null, upserted: *}>}
	 */
	async updateMany(filter, update, options) {
		await this._MongoClient.open();
		let collection = await this._MongoClient.pick(this.collection);
		let cursor = await collection.updateMany(filter, update, options);
		let result = {
			id: cursor["upsertedId"] === null ? null : cursor["upsertedId"]["_id"],
			filtered: cursor["matchedCount"],
			modified: cursor["modifiedCount"],
			upserted: cursor["upsertedCount"],
		};
		await this._MongoClient.close();
		return result;
	};
}

/**
 *
 * @type {MongoModelClass}
 */
module.exports = MongoModelClass;
