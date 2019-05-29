"use strict";
/*nodejs*/
const MongoClient = require("mongodb").MongoClient;
/*fa*/
const FaError = require("fa-nodejs/base/error");
const FaDaoClient = require("fa-nodejs/dao/client");
const FaDaoConnection = require("fa-nodejs/dao/connection");

class FaDaoMongoClient extends FaDaoClient {
	/**
	 * @constructor
	 * @param FaDaoMongoModel {FaDaoMongoModel}
	 */
	constructor(FaDaoMongoModel) {
		super();
		this._FaDaoMongoModel = FaDaoMongoModel;
	};

	/**
	 *
	 * @return {FaDaoMongoConnection}
	 * @private
	 */
	get _connection() {
		return FaDaoConnection.findConnection(this._FaDaoMongoModel.connection);
	}

	/**
	 *
	 * @return {Promise<MongoClient>}
	 * @private
	 */
	async _connect() {
		return await MongoClient.connect(this._connection.url, this._connection.options.connect);
	}

	/**
	 *
	 * @param error {Error}
	 * @return {FaError}
	 */
	_error(error) {
		return new FaError(error);
	}

	/**
	 *
	 * @return {Promise<MongoClient>}
	 */
	async open() {
		try {
			let result;
			if (this._connection.persistent) {
				if (FaDaoClient.existClient(this._FaDaoMongoModel.connection)) {
					result = FaDaoClient.findClient(this._FaDaoMongoModel.connection);
				} else {
					result = await this._connect();
					FaDaoClient.attachClient(this._FaDaoMongoModel.connection, result);
				}
			} else {
				result = await this._connect();
			}
			return result;
		} catch (e) {
			throw this._error(e);
		}
	}

	/**
	 *
	 * @param connection {MongoClient}
	 * @param collection {string|void}
	 * @return {Promise<Collection>}
	 */
	async collection(connection, collection) {
		try {
			return await connection.db(this._connection.database).collection(collection);
		} catch (e) {
			throw this._error(e);
		}
	}

	/**
	 * @param connection {MongoClient}
	 * @return {Promise<boolean>}
	 */
	async close(connection) {
		try {
			if (!this._connection.persistent && connection) {
				await connection.close(this._connection.options.close);
				FaDaoConnection.detachConnection(this._FaDaoMongoModel.connection);
				FaDaoClient.detachClient(this._FaDaoMongoModel.connection);
				return true;
			} else {
				return false;
			}
		} catch (e) {
			throw this._error(e);
		}
	}
}

/**
 *
 * @type {FaDaoMongoClient}
 */
module.exports = FaDaoMongoClient;
