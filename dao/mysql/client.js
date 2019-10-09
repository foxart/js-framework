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
	}

	// noinspection JSMethodCanBeStatic
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

	/**
	 * @return {Promise<any>}
	 */
	async open() {
		let self = this;
		return new Promise(function (resolve, reject) {
			if (self.checkConnection()) {
				resolve(true);
			} else {
				let connection = Mysql.createConnection({
					host: self.hostname,
					port: self.port,
					user: self.user,
					password: self.password,
					database: self.database,
				});
				connection.connect(function (error) {
					if (error) {
						reject(self.error(error));
					} else {
						self.attachConnection(connection);
						resolve(connection.threadId);
					}
				});
			}
		});
	}

	/**
	 * @param query {string}
	 * @return {Promise<any>}
	 */
	execute(query) {
		let self = this;
		return new Promise(function (resolve, reject) {
			self.getConnection().query(query, function (error, results) { // error, results, fields
				if (error) {
					reject(self.error(error));
				} else {
					resolve(results);
				}
			});
		});
	}

	/**
	 * @return {Promise<any>}
	 */
	async close() {
		let self = this;
		return new Promise(async function (resolve, reject) {
			if (self.persistent) {
				resolve(false);
			} else {
				console.warn(self.getConnection());
				self.getConnection().end(function (error) {
					if (error) {
						reject(self.error(error));
					} else {
						self.detachConnection();
						resolve(true);
					}
				});
			}
		});
	}
}

/**
 *
 * @class {FaDaoMysqlClient}
 */
module.exports = FaDaoMysqlClient;

