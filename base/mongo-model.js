"use strict";
/*node*/
const MongoClient = require("mongodb").MongoClient;
const ObjectID = require("mongodb").ObjectID;
const assert = require("assert");
/*fa-nodejs*/
const ModelClass = require("fa-nodejs/base/model");
const FaFileClass = require("fa-nodejs/base/file");
const FaErrorStack = require("fa-nodejs/base/error-stack");
/*variables*/
let FaFile = new FaFileClass();
/**
 *
 * @type {module.MongoModelClass}
 */
module.exports = class MongoModelClass extends ModelClass {
	constructor() {
		super();
		this._MongoClient = null;
		this._connectorName = `${this._connector.split("-").map(item => item.capitalize()).join("")}Connector`;
		this._connectorPath = this._getConnectorPath;
	};

	get _collection() {
		return null;
	}

	get _getConnectorPath() {
		console.error(FaErrorStack.pick(new Error().stack, 2));
		let model_path = FaErrorStack.pick(new Error().stack, 2)[0]["path"];
		let regular_path = new RegExp(`^(.+)/modules/.+models/([A-Z][^-]+)Model.js$`);
		let match_path = model_path.match(regular_path);
		if (match_path) {
			return `${match_path[1]}/config/connectors/${this._connectorName}.js`;
		} else {
			return null;
		}
	}

	/**
	 *
	 * @return {module.MongoConnectorClass}
	 */
	get connector() {
		if (global[this._connectorName]) {
			console.log(["FOUND"]);
			return global[this._connectorName];
		} else {
			console.log(["NOT"]);
			if (FaFile.isFile(this._connectorPath)) {
				let ConnectorClass = require(this._connectorPath);
				global[this._connectorName] = new ConnectorClass();
			} else {
				throw new FaErrorStack(`connector not found: ${this._connectorPath}`);
			}
			return global[this._connectorName];
		}
	}

	/**
	 * @deprecated
	 * @param collection
	 * @param options
	 * @param callback
	 * @returns {Promise<void>}
	 */
	aggregateDocument(collection, options, callback) {
		if (typeof options === "function") {
			callback = options;
		}
		if (Mongo === undefined || Mongo.isConnected() === false) {
			// Mongo = await this.openConnection().catch(function (error) {
			// 	console.error(error)
			// });
		}
		if (Mongo !== undefined) {
			Mongo.db(this.configuration.database).collection(collection).aggregate(options, function (error, result) {
				assert.equal(error, null);
				result.toArray(function (error, documents) {
					if (callback !== undefined) {
						callback(documents);
					}
				});
			});
		}
	};

	/**
	 * @param filter
	 * @param options
	 * @return {Promise<any>}
	 */

	findOne(filter, options) {
		let context = this;
		return new Promise(async function (resolve, reject) {
			/**/
			context.connector.collection(context._collection).then(function (collection) {
				resolve(collection.findOne(filter, options));
			}).catch(function (e) {
				reject(e);
			});
			/**/
			// context.connector.database("ula-central").then(function (database) {
			// 	resolve(database.collection("ula_clients").findOne(filter, options));
			// }).catch(function (e) {
			// 	reject(e);
			// });
		});
	};

	/**
	 *
	 * @param filter
	 * @param options
	 * @return {Promise<any>}
	 */
	findMany(filter, options) {
		let context = this;
		let stack = FaErrorStack.pick(new Error().stack, 1);
		// console.error(stack);
		// console.error(new FaError("e").setTrace(stack));
		return new Promise(async function (resolve, reject) {
			// if (Mongo === undefined || Mongo.isConnected() === false) {
			// 	Mongo = await module.openConnection();
			// }
			context.connector.collection(context._collection).then(function (collection) {
				collection.find(filter, options).toArray(function (e, result) {
					// console.error(arguments)
					if (e) {
console.error(new FaError(e).setTrace(stack))
						reject(new FaError(e).setTrace(stack));
					} else {
						resolve(result);
					}
				});
			});
		});
	};

	/**
	 *
	 * @param collection
	 * @param data
	 * @return {Promise<any>}
	 */

	insertOne(collection, data) {
		return new Promise(async function (resolve, reject) {
			// if (Mongo === undefined || Mongo.isConnected() === false) {
			// 	Mongo = await module.openConnection();
			// }
			Mongo.db(module.configuration.database).collection(collection).insertOne(data).then(function (result) {
				if (result.result.n === 1 && result.ops.length === 1) {
					resolve(result.ops[0]);
				} else {
					reject(result);
				}
			}).catch(function (e) {
				reject(e);
			});
		});
	};

	/**
	 * @deprecated
	 * @param collection
	 * @param data
	 * @param callback
	 * @returns {Promise<void>}
	 */

	insertMany(collection, data, callback) {
		if (Mongo === undefined || Mongo.isConnected() === false) {
			// Mongo = await this.openConnection().catch(function (error) {
			// 	console.error(error)
			// });
		}
		if (Mongo !== undefined) {
			Mongo.db(this.configuration.database).collection(collection).insertMany(data, function (error, result) {
				assert.equal(error, null);
				assert.equal(data.length, result.result.n);
				assert.equal(data.length, result.ops.length);
				if (callback !== undefined) {
					callback(result);
				}
			});
		}
	};

	/**
	 *
	 * @param collection
	 * @param filter
	 * @param data
	 * @param options
	 * @returns {Promise<module.FaPromise>}
	 */

	updateOne(collection, filter, data, options) {
		return new Promise(async function (resolve, reject) {
			// if (Mongo === undefined || Mongo.isConnected() === false) {
			// 	Mongo = await module.openConnection();
			// }
			module.sanitize(filter);
			Mongo.db(module.configuration.database).collection(collection).updateOne(filter, data, options).then(function (result) {
				if (result.result.n === 1) {
					resolve(result.result);
				} else {
					reject(result);
				}
			}).catch(function (e) {
				reject(e);
			});
		});
	};

	/**
	 *
	 * @returns {*}
	 */

	newId() {
		return new ObjectID();
	};
};
