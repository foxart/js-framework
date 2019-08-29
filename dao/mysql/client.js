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
	 * @param connection {string}
	 */
	// constructor(connection) {
	// 	super();
	// 	this._connection = connection;
	// }




	/**
	 *
	 * @return {Promise<void>}
	 * @private
	 */
	async _connect() {
		let con = await Mysql.createConnection({
			host: this.connection.host,
			user: this.connection.user,
			port: this.connection.port,
			password: this.connection.password,
			database: this.connection.database,
		});
		// con.connect();
		console.log(con);
		return con;
		// console.warn(con);
		// return await Mysql.createConnection({
		// 	// connectString: this.connection.url,
		// 	host: this.connection.host,
		// 	user: this.connection.user,
		// 	password: this.connection.password,
		// 	database: this.connection.database,
		// });
	}

	_extractMysqlError(error) {
		// let e = new Error("test");
		// console.log(e instanceof Error, e instanceof FaError);
		if (error instanceof Error) {
			return new FaError(error).setTrace(this._trace);
		} else {
			// let e = ["code", "errno", "sqlMessage", "sqlState", "fatal"];
			return new FaError({
				name: error["code"],
				message: error["sqlMessage"]
			}).setTrace(this._trace);
		}
	}

	/**
	 *
	 * @return {Promise<Object>}
	 */
	async open() {
		try {
			let result;
			// if (this.connection.persistent) {
			// 	if (FaDaoClient.existClient(this._FaDaoMysqlModel.connection)) {
			// 		result = FaDaoClient.findClient(this._FaDaoMysqlModel.connection);
			// 	} else {
			// 		result = await this._connect();
			// 		FaDaoClient.attachClient(this._FaDaoMysqlModel.connection, result);
			// 	}
			// } else {
			// 	console.info("OPEN", this.connection.timeout);
			// 	result = await this._connect();
			// }
			result = await this._connect();
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
			console.log(FaDaoConnection.listConnection);
			console.log(FaDaoClient.listClient);
			if (!this.connection.persistent && connection) {
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

