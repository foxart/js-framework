"use strict";
/*node*/
/** @type {Object} */
const Mysql = require("mysql");
/*fa*/
const FaError = require("fa-nodejs/base/error");
const FaDaoClient = require("fa-nodejs/dao/client");

class FaDaoMysqlClient extends FaDaoClient {
	constructor(connection) {
		super(connection);
		this._open = false;
	}

	/**
	 * @param error {Error}
	 * @return {FaError}
	 */
	error(error) {
		// noinspection JSUnusedLocalSymbols
		let {code, errno, sqlMessage, sqlState, index, sql, fatal} = error;
		if (code && sqlMessage) {
			return new FaError({
				name: code,
				message: sqlMessage,
			});
		} else {
			return new FaError(error);
		}
	}

	get exist() {
		return this._open === true;
	}

	/**
	 * @return {Promise<*>}
	 */
	async open() {
		let self = this;
		return new Promise(function (resolve, reject) {
			if (self.checkConnection()) {
				resolve(true);
			} else {
				/** @type {Object} */
				let connection = Mysql.createConnection({
					host: self.hostname,
					port: self.port,
					user: self.user,
					password: self.password,
					database: self.database,
				});
				connection.connect(function (error) {
					if (error) {
						self._open = false;
						reject(self.error(error));
					} else {
						self._open = true;
						self.attachConnection(connection);
						resolve(connection.threadId);
					}
				});
			}
		});
	}

	/**
	 * @return {Promise<*>}
	 */
	async close() {
		let self = this;
		return new Promise(async function (resolve, reject) {
			if (self.persistent) {
				resolve(false);
			} else {
				self.getConnection().end(function (error) {
					if (error) {
						self._open = true;
						reject(self.error(error));
					} else {
						self._open = false;
						self.detachConnection();
						resolve(true);
					}
				});
			}
		});
	}

	/**
	 * @param query {string}
	 * @return {Promise<*>}
	 */
	execute(query) {
		let self = this;
		return new Promise(function (resolve, reject) {
			// noinspection JSUnusedLocalSymbols
			self.getConnection().query(query, function (error, results, fields) {
				if (error) {
					reject(self.error(error));
				} else {
					resolve(results);
				}
			});
		});
	}
}

/**
 *
 * @class {FaDaoMysqlClient}
 */
module.exports = FaDaoMysqlClient;

