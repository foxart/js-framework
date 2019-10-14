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
		}).catch(function (e) {
			console.error(e);
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
				self.getConnection().end(function (error) {
					// console.warn(arguments);
					if (error) {
						reject(self.error(error));
					} else {
						self.detachConnection();
						resolve(true);
					}
				});
			}
		}).catch(function (e) {
			console.error(e);
		});
	}

	/**
	 * @param query {string}
	 * @return {Promise<any>}
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

