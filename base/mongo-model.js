"use strict";
/*node*/
const ObjectID = require("mongodb").ObjectID;
/*fa-nodejs*/
const ModelClass = require("fa-nodejs/base/model");
const FaFileClass = require("fa-nodejs/base/file");
const FaError = require("fa-nodejs/base/error");
const FaTrace = require("fa-nodejs/base/trace");
/*variables*/
let FaFile = new FaFileClass();
let _connector_list = {};

class MongoModelClass extends ModelClass {
	constructor() {
		super();
		this._connectorName = this._getConnectorName;
		this._connectorPath = this._getConnectorPath;
		this._client = null;
		// this._FaMongoConnector = this._attachConnector;
	};

	/**
	 *
	 * @return {string}
	 * @private
	 */
	get _getConnectorName() {
		return `${this.connectorName.split("-").map(item => item.capitalize()).join("")}Connector`;
	};

	/**
	 *
	 * @return {*}
	 * @private
	 */
	get _getConnectorPath() {
		let result = null;
		let model_path = FaTrace.trace(2)["path"];
		let regular_path = new RegExp(`^(.+)/modules/.+models/([A-Z][^-]+)Model.js$`);
		let match_path = model_path.match(regular_path);
		if (match_path) {
			result = `${match_path[1]}/config/connectors/${this._connectorName}.js`;
		}
		return result;
	};

	/**
	 *
	 * @return {MongoConnectorClass}
	 * @private
	 */
	get _connector() {
		let result = _connector_list[this._connectorName];
		if (!result) {
			console.info([`{NEW} ${this._connectorName}`]);
			if (FaFile.isFile(this._connectorPath)) {
				let FaConnectorClass = require(this._connectorPath);
				_connector_list[this._connectorName] = new FaConnectorClass;
				result = _connector_list[this._connectorName];
			} else {
				throw new FaError(`connector <${this.connector}> not found at: ${this._connectorPath}`).pickTrace(2);
			}
		}
		return result;
	}

	/**
	 *
	 * @return {string}
	 */
	get connectorName() {
		return "default";
	};

	/**
	 *
	 * @return {string|null}
	 */
	get collectionName() {
		return null;
	};

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
	 * @param options
	 * @returns {Promise<Array|null>}
	 */
	aggregate(pipeline, options) {
		let context = this;
		let trace = FaTrace.trace(1);
		return new Promise(function (resolve, reject) {
			context.connectorOld.collection(context._collection).then(function (collection) {
				collection.aggregate(pipeline, options).get((e, result) => e ? reject(new FaError(e).setTrace(trace)) : resolve(result));
			});
		});
	};

	/**
	 * @param filter {Object|null}
	 * @param options {Object|null}
	 * @return {Promise<Object|null>}
	 */
	async findOne(filter = null, options = null) {
		let collection = await this._connector.collection(this.collectionName);
		let result = collection.findOne(filter, options);
		await this._connector.close();
		return result;
	};

	/**
	 *
	 * @param filter {Object|null}
	 * @param options {Object|null}
	 * @return {Promise<Array|null>}
	 */
	async findMany(filter = null, options = null) {
		let collection = await this._connector.collection(this.collectionName);
		let cursor = await collection.find(filter, options);
		let result = await cursor.toArray();
		await this._connector.close();
		return result;
	};

	/**
	 *
	 * @param document {Object}
	 * @param options {Object|null}
	 * @return {Promise<{inserted: number, data: Object, id: ObjectID}>}
	 */
	async insertOne(document, options = null) {
		let collection = await this._connector.collection(this.collectionName);
		let cursor = await collection.insertOne(document, options);
		let result = {
			id: cursor["insertedId"],
			inserted: cursor["insertedCount"],
			data: cursor["ops"][0],
		};
		await this._connector.close();
		return result;
	};

	/**
	 *
	 * @param document {Object[]}
	 * @param options {Object|null}
	 * @return {Promise<{inserted: number, data: Object, id: ObjectID[]}>}
	 */
	async insertMany(document, options = null) {
		let collection = await this._connector.collection(this.collectionName);
		let cursor = await collection.insertMany(document, options);
		let result = {
			id: cursor["insertedIds"],
			inserted: cursor["insertedCount"],
			data: cursor["ops"],
		};
		await this._connector.close();
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
		let collection = await this._connector.collection(this.collectionName);
		let cursor = await collection.updateOne(filter, update, options);
		let result = {
			id: cursor["upsertedId"] === null ? null : cursor["upsertedId"]["_id"],
			filtered: cursor["matchedCount"],
			modified: cursor["modifiedCount"],
			upserted: cursor["upsertedCount"],
		};
		await this._connector.close();
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
		let collection = await this._connector.collection(this.collectionName);
		let cursor = await collection.updateMany(filter, update, options);
		let result = {
			id: cursor["upsertedId"] === null ? null : cursor["upsertedId"]["_id"],
			filtered: cursor["matchedCount"],
			modified: cursor["modifiedCount"],
			upserted: cursor["upsertedCount"],
		};
		await this._connector.close();
		return result;
	};
}

/**
 *
 * @type {MongoModelClass}
 */
module.exports = MongoModelClass;
