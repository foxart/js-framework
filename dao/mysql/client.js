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
	 * @return {Promise<Object>}
	 * @private
	 */
	async _connect() {
		// let options = this._connection.options;
		// Object.entries(options).forEach(function ([key, value]) {
		// 	Mysql[key] = value;
		// });
		// Mysql.queueTimeout = this._connection.timeout;
		// console.log(this._connection.timeout);
		let con = await Mysql.createConnection({
			// connectString: this._connection.url,
			host: this._connection.host,
			user: this._connection.user,
			password: this._connection.password,
			database: this._connection.database,
		});
		con.connect();
		// console.warn(con);
		// return await Mysql.createConnection({
		// 	// connectString: this._connection.url,
		// 	host: this._connection.host,
		// 	user: this._connection.user,
		// 	password: this._connection.password,
		// 	database: this._connection.database,
		// });
	}

	/**
	 *
	 * @param error {Error}
	 * @return {FaError}
	 * @private
	 */
	_error(error) {
		let MatchPattern = "^(.+): (.+)$";
		let MatchExpression = new RegExp(MatchPattern);
		let result = error.message.match(MatchExpression);
		if (result) {
			return new FaError({name: result[1], message: result[2]});
		} else {
			return new FaError(error);
		}
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
			throw this._error(e);
		}
	}

	/**
	 * @param connection {Object}
	 * @param query {string}
	 * @return {Promise<*>}
	 */
	async execute(connection, query) {
		try {
			return await connection.execute(query);
		} catch (e) {
			await this.close(connection);
			throw this._error(e);
		}
	}

	/**
	 * @param connection {Object}
	 * @return {Promise<boolean>}
	 */
	async close(connection) {
		try {
			if (!this._connection.persistent && connection) {
				// if (!this._connection.persistent) {
				// 	await connection.release();
				await connection.close();
				// console.warn("CLOSE", this._connection.timeout);
				FaDaoConnection.detachConnection(this._FaDaoMysqlModel.connection);
				FaDaoClient.detachClient(this._FaDaoMysqlModel.connection);
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
 * @type {FaDaoMysqlClient}
 */
module.exports = FaDaoMysqlClient;

