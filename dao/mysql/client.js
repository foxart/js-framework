"use strict";
/*nodejs*/
/** @type {Object} */
const Mysql = require("mysql");
/*fa*/
const FaError = require("fa-nodejs/base/error");
const FaDaoClient = require("fa-nodejs/dao/client");
const FaDaoConnection = require("fa-nodejs/dao/connection");
/**
 *
 * @member {FaDaoMysqlConnection|Class}
 */
const FaDaoMysqlConnection = require("fa-nodejs/dao/mysql/connection");

/*variables*/
class FaDaoMysqlClient extends FaDaoClient {
	/**
	 * @constructor
	 * @param FaDaoMysqlModel {FaDaoMysqlModel}
	 */
	constructor(FaDaoMysqlModel) {
		super();
		this._FaDaoMysqlModel = FaDaoMysqlModel;
	}

	/**
	 *
	 * @return {FaDaoConnection}
	 * @private
	 */
	get _connection() {
		return FaDaoConnection.findConnection(this._FaDaoMysqlModel.connection);
	}

	/**
	 *
	 * @return {Promise<void>}
	 * @private
	 */
	async _connect() {
		let con = await Mysql.createConnection({
			// connectString: this._connection.url,
			host: this._connection.host,
			user: this._connection.user,
			port: this._connection.port,
			password: this._connection.password,
			database: this._connection.database,
		});
		// con.connect();
		return con;
		// console.warn(con);
		// return await Mysql.createConnection({
		// 	// connectString: this._connection.url,
		// 	host: this._connection.host,
		// 	user: this._connection.user,
		// 	password: this._connection.password,
		// 	database: this._connection.database,
		// });
	}

	_extractMysqlError(error) {
		// let e = ["code", "errno", "sqlMessage", "sqlState", "fatal"];
		return new FaError({name: error["code"], message: error["sqlMessage"]}).setTrace(this._FaDaoMysqlModel.trace);
	}

	/**
	 *
	 * @return {Promise<Object>}
	 */
	async open() {
		try {
			let result;
			if (this._connection.persistent) {
				if (FaDaoClient.existClient(this._FaDaoMysqlModel.connection)) {
					result = FaDaoClient.findClient(this._FaDaoMysqlModel.connection);
				} else {
					result = await this._connect();
					FaDaoClient.attachClient(this._FaDaoMysqlModel.connection, result);
				}
			} else {
				// console.info("OPEN", this._connection.timeout);
				result = await this._connect();
			}
			return result;
		} catch (e) {
			throw this._extractMysqlError(e);
		}
	}

	/**
	 * @param connection {Object}
	 * @param query {string}
	 * @param trace
	 * @return {Promise<*>}
	 */
	async execute(connection, query, trace) {
		let self = this;
		return await new Promise(function (resolve, reject) {
			connection.query(query, function (error, results, fields) {
				if (error) {
					reject(self._extractMysqlError(error).setTrace(trace));
				} else {
					resolve(results);
				}
			});
		});
	}

	/**
	 * @param connection {Object}
	 * @return {Promise<boolean>}
	 */
	async close(connection) {
		try {
				console.log(this._connection.get);
				console.log(FaDaoConnection.listConnection);

			if (!this._connection.persistent && connection) {
				connection.end();
				FaDaoConnection.detachConnection(this._FaDaoMysqlModel.connection);
				FaDaoClient.detachClient(this._FaDaoMysqlModel.connection);
				return true;
			} else {
				return false;
			}
		} catch (e) {
			throw this._extractMysqlError(e);
		}
	}
}

/**
 *
 * @type {FaDaoMysqlClient}
 */
module.exports = FaDaoMysqlClient;

