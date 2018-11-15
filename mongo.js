'use strict';
/*node*/
const
	/**
	 * @type {Object}
	 */
	MongoClient = require('mongodb').MongoClient,
	ObjectID = require('mongodb').ObjectID,
	assert = require('assert');
/*services*/
const
	LogService = require('../idol/modules/audit/services/LogService');
/*modules*/
const
	Helper = require('./helper');
/**
 *
 * @param configuration
 */
module.exports = function (configuration) {
	let module = {};
	let Mongo;
	// let this.configuration = configuration;
	let createConnection = function (configuration) {
		module.configuration = configuration;
		module.link = `mongodb://${configuration.host}:${configuration.port}`;
		LogService.check(`mongo | ${configuration.host}:${configuration.port}/${configuration.database}`);
	};
	/*create*/
	new createConnection(configuration);
	/**
	 *
	 * @returns {module.FaPromise}
	 */
	module.openConnection = function () {
		return new FaPromise(function (resolve, reject) {
			MongoClient.connect(module.link, {
				useNewUrlParser: true
			}, function (error, client) {
				if (error === null) {
					Mongo = client;
					resolve(client);
				} else {
					reject(error);
				}
			});
			// MongoClient.connect(configuration.link).then(function (database) {
			// 	resolve(database.db(configuration.database));
			// }, function (error) {
			// 	console.log('Mongo connect error');
			// 	console.log(error);
			// 	reject(error);
			// });
		})
	};
	module.closeConnection = function () {
		Mongo.close();
	};
	/**
	 * @deprecated
	 * @param collection
	 * @param filter
	 * @param options
	 * @param callback
	 * @returns {Promise<void>}
	 */
	module.findOne = async function (collection, filter, options, callback) {
		if (typeof options === 'function') {
			callback = options;
			options = null;
		}
		if (Mongo === undefined || Mongo.isConnected() === false) {
			Mongo = await this.openConnection();
		}
		this.sanitize(filter);
		Mongo.db(this.configuration.database).collection(collection).findOne(filter, options, function (error, result) {
			assert.equal(error, null);
			if (callback !== undefined) {
				callback(result);
			}
		});
		// Mongo.db(this.configuration.database).collection(collection).findOne(filter, options).then(function (result) {
		// 	console.log(result);
		// 	return result;
		// }).catch(function (error) {
		// 	console.log(error);
		// });
	};
	/**
	 *
	 * @param collection
	 * @param filter
	 * @param options
	 * @return {module.FaPromise}
	 */
	module.findOnePromise = function (collection, filter, options) {
		return new FaPromise(async function (resolve, reject) {
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
	 * @deprecated
	 * @param collection
	 * @param filter
	 * @param options
	 * @param callback
	 * @returns {Promise<void>}
	 */
	module.findMany = async function (collection, filter, options, callback) {
		if (typeof options === 'function') {
			callback = options;
			options = undefined;
		}
		if (Mongo === undefined || Mongo.isConnected() === false) {
			Mongo = await this.openConnection().catch(function (error) {
				consoleError(error)
			});
		}
		this.sanitize(filter);
		if (Mongo !== undefined) {
			Mongo.db(this.configuration.database).collection(collection).find(filter, options).toArray(function (error, result) {
				assert.equal(error, null);
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
	 * @param options
	 * @return {Promise<any>}
	 */
	module.findManyPromise = function (collection, filter, options) {
		return new FaPromise(async function (resolve, reject) {
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
	 * @deprecated
	 * @param collection
	 * @param data
	 * @param callback
	 * @returns {Promise<void>}
	 */
	module.insertOne = async function (collection, data, callback) {
		if (Mongo === undefined || Mongo.isConnected() === false) {
			Mongo = await this.openConnection().catch(function (error) {
				consoleError(error)
			});
		}
		if (Mongo !== undefined) {
			Mongo.db(this.configuration.database).collection(collection).insertOne(data, function (error, result) {
				if (error !== null) {
					// throw error;
					consoleInfo(error);
				} else {
					assert.equal(error, null);
					assert.equal(1, result.result.n);
					assert.equal(1, result.ops.length);
					if (callback !== undefined) {
						callback(result);
					}
				}
			});
		}
	};
	/**
	 *
	 * @param collection
	 * @param data
	 * @returns {module.FaPromise}
	 */
	module.insertOnePromise = function (collection, data) {
		return new FaPromise(async function (resolve, reject) {
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
	 *
	 * @param collection
	 * @param data
	 * @param callback
	 * @returns {Promise<void>}
	 */
	module.insertMany = async function (collection, data, callback) {
		if (Mongo === undefined || Mongo.isConnected() === false) {
			Mongo = await this.openConnection().catch(function (error) {
				consoleError(error)
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
	 * @param options
	 * @param callback
	 * @returns {Promise<void>}
	 */
	module.aggregateDocument = async function (collection, options, callback) {
		if (typeof options === 'function') {
			callback = options;
		}
		if (Mongo === undefined || Mongo.isConnected() === false) {
			Mongo = await this.openConnection().catch(function (error) {
				consoleError(error)
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
	 * @deprecated
	 * @param collection
	 * @param filter
	 * @param data
	 * @param options
	 * @param callback
	 * @returns {Promise<void>}
	 */
	module.updateDocument = async function (collection, filter, data, options, callback) {
		if (typeof options === 'function') {
			callback = options;
			options = undefined;
		}
		// consoleLog(options);
		if (Mongo === undefined || Mongo.isConnected() === false) {
			Mongo = await this.openConnection().catch(function (error) {
				consoleError(error)
			});
		}
		this.sanitize(filter);
		// console.log('UPDATE');
		// console.log(JSON.stringify(filter));
		if (Mongo !== undefined) {
			Mongo.db(this.configuration.database).collection(collection).updateOne(filter, data, options, function (error, result) {
				assert.equal(error, null);
				assert.equal(1, result.result.n);
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
		return new FaPromise(async function (resolve, reject) {
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
	 * @param expression
	 * @returns {*}
	 */
	module.regExp = function (expression) {
		return expression;
	};
	/**
	 *
	 * @returns {*}
	 */
	module.newId = function () {
		return new ObjectID();
	};
	/**
	 *
	 * @param id
	 * @returns {*}
	 */
	module.valideId = function (id) {
		return ObjectID.isValid(id);
	};
	/**
	 *
	 * @returns {*}
	 * @param options
	 */
	module.sanitize = function (options) {
		function checkId(id) {
			if (ObjectID.isValid(id)) {
				return new ObjectID(id);
			} else {
				return id;
			}
		}

		Helper.objectCallback(options, function (item, index) {
			if (index === '_id') {
				item[index] = checkId(item[index]);
				// consoleLog(item[index]);
			}
		});
	};
	return module;
};
