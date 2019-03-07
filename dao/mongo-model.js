"use strict";
/*node*/
const ObjectID = require("mongodb").ObjectID;
/*fa*/
const FaError = require("fa-nodejs/base/error");
const FaTrace = require("fa-nodejs/base/trace");
const ClientClass = require("fa-nodejs/dao/client");
const ModelClass = require("fa-nodejs/dao/model");

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
	get mongo() {
		return ClientClass.find(this.client, this._trace);
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
		await this.mongo.open();
		let collection = await this.mongo.pick(this.table);
		let result = await collection.aggregate(pipeline, options).get();
		await this.mongo.close();
		return result;
	};

	/**
	 * @param filter {Object|null}
	 * @param options {Object|null}
	 * @return {Promise<Object|null>}
	 */
	async findOne(filter = null, options = null) {
		await this.mongo.open();
		let collection = await this.mongo.pick(this.table);
		let result = collection.findOne(filter, options);
		await this.mongo.close();
		return result;
	};

	/**
	 *
	 * @param filter {Object|null}
	 * @param options {Object|null}
	 * @return {Promise<Array|null>}
	 */
	async findMany(filter = null, options = null) {
		await this.mongo.open();
		let collection = await this.mongo.pick(this.table);
		let cursor = await collection.find(filter, options);
		let result = await cursor.toArray();
		await this.mongo.close();
		return result;
	};

	/**
	 *
	 * @param document {Object}
	 * @param options {Object|null}
	 * @return {Promise<{inserted: number, data: Object, id: ObjectID}>}
	 */
	async insertOne(document, options = null) {
		await this.mongo.open();
		let collection = await this.mongo.pick(this.table);
		let cursor = await collection.insertOne(document, options);
		let result = {
			id: cursor["insertedId"],
			inserted: cursor["insertedCount"],
			data: cursor["ops"][0],
		};
		await this.mongo.close();
		return result;
	};

	/**
	 *
	 * @param document {Object[]}
	 * @param options {Object|null}
	 * @return {Promise<{inserted: number, data: Object, id: ObjectID[]}>}
	 */
	async insertMany(document, options = null) {
		await this.mongo.open();
		let collection = await this.mongo.pick(this.table);
		let cursor = await collection.insertMany(document, options);
		let result = {
			id: cursor["insertedIds"],
			inserted: cursor["insertedCount"],
			data: cursor["ops"],
		};
		await this.mongo.close();
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
		await this.mongo.open();
		let collection = await this.mongo.pick(this.table);
		let cursor = await collection.updateOne(filter, update, options);
		let result = {
			id: cursor["upsertedId"] === null ? null : cursor["upsertedId"]["_id"],
			filtered: cursor["matchedCount"],
			modified: cursor["modifiedCount"],
			upserted: cursor["upsertedCount"],
		};
		await this.mongo.close();
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
		await this.mongo.open();
		let collection = await this.mongo.pick(this.table);
		let cursor = await collection.updateMany(filter, update, options);
		let result = {
			id: cursor["upsertedId"] === null ? null : cursor["upsertedId"]["_id"],
			filtered: cursor["matchedCount"],
			modified: cursor["modifiedCount"],
			upserted: cursor["upsertedCount"],
		};
		await this.mongo.close();
		return result;
	};
}

/**
 *
 * @type {MongoModelClass}
 */
module.exports = MongoModelClass;
