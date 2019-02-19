"use strict";
/*node*/
const MongoClient = require('mongodb').MongoClient;
const ObjectID = require('mongodb').ObjectID;
const assert = require('assert');
/*fa-nodejs*/
const Model = require("fa-nodejs/base/model");
/**
 *
 * @type {module.MongoModel}
 */
module.exports = class MongoModel extends Model {

	createConnection (configuration) {
		module.configuration = configuration;
		module.link = `mongodb://${configuration.host}:${configuration.port}`;
		console.log(`MongoModel ${configuration.database}://${configuration.host}:${configuration.port}`);
	};
	/*create*/
	// new createConnection(configuration);
	/**
	 *
	 * @return {Promise<any>}
	 */
	openConnection () {
		return new Promise(function (resolve, reject) {
			MongoClient.connect(module.link, {
				useNewUrlParser: true
			}, function (error, client) {
				if (error === null) {
					// Mongo = client;
					resolve(client);
				} else {
					reject(error);
				}
			});
		});
	};
	/**
	 *
	 */
	closeConnection () {
		// Mongo.close();
	};
	/**
	 * @deprecated
	 * @param collection
	 * @param options
	 * @param callback
	 * @returns {Promise<void>}
	 */
	aggregateDocument (collection, options, callback) {
		if (typeof options === 'function') {
			callback = options;
		}
		if (Mongo === undefined || Mongo.isConnected() === false) {
			Mongo = await this.openConnection().catch(function (error) {
				console.error(error)
			});


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
	 *
	 * @param collection
	 * @param filter
	 * @param options
	 * @return {Promise<any>}
	 */
	module.findOne = function (collection, filter, options) {
		return new Promise(async function (resolve, reject) {
			if (Mongo === undefined || Mongo.isConnected() === false) {
				Mongo = await module.openConnection();
			}
			module.sanitize(filter);
			Mongo.db(module.configuration.database).collection(collection).findOne(filter, options).then(function (result) {
				resolve(result);
			}).catch(function (e) {
				reject(e);
			});
		});
	};
	/**
	 *
	 * @param collection
	 * @param filter
	 * @param options
	 * @return {Promise<any>}
	 */
	module.findMany = function (collection, filter, options) {
		return new Promise(async function (resolve, reject) {
			if (Mongo === undefined || Mongo.isConnected() === false) {
				Mongo = await module.openConnection();
			}
			module.sanitize(filter);
			Mongo.db(module.configuration.database).collection(collection).find(filter, options).toArray(function (e, result) {
				if (e) {
					reject(new FaError(e));
				} else {
					resolve(result);
				}
			});
		});
	};
	/**
	 *
	 * @param collection
	 * @param data
	 * @return {Promise<any>}
	 */
	module.insertOne = function (collection, data) {
		return new Promise(async function (resolve, reject) {
			if (Mongo === undefined || Mongo.isConnected() === false) {
				Mongo = await module.openConnection();
			}
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
	module.insertMany = async function (collection, data, callback) {
		if (Mongo === undefined || Mongo.isConnected() === false) {
			Mongo = await this.openConnection().catch(function (error) {
				console.error(error)
			});
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
	module.updateOne = function (collection, filter, data, options) {
		return new Promise(async function (resolve, reject) {
			if (Mongo === undefined || Mongo.isConnected() === false) {
				Mongo = await module.openConnection();
			}
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
	module.newId = function () {
		return new ObjectID();
	};
	return module;
};
