"use strict";
/*nodejs*/
// /** @type {Object} */
// const OracleDb = require("mysql");
/*fa*/
const FaDaoConnection = require("fa-nodejs/dao/connection");

class FaDaoMysqlConnection extends FaDaoConnection {
	/**
	 *
	 * @return {{database: string, password: string, port: number, host: string, options: {fetchAsBuffer: Array<number>, outFormat: number}, persistent: boolean, user: string, sid: *}}
	 */
	get get() {
		return {
			host: this.host,
			port: this.port,
			database: this.database,
			persistent: this.persistent,
			options: this.options,
			user: this.user,
			password: this.password,
		};
	}

	/**
	 * @return {string}
	 */
	// get url() {
	// 	return `${this.host}:${this.port}/${this.sid}`;
	// };
	/**
	 *
	 * @return {string}
	 */
	get host() {
		return "127.0.0.1";
	};

	/**
	 *
	 * @return {number}
	 */
	get port() {
		return 3306;
	};

	/**
	 *
	 * @return {string}
	 */
	get database() {
		return "system";
	}

	/**
	 *
	 * @return {boolean}
	 */
	get persistent() {
		return false;
	}

	/**
	 * @return {{fetchAsBuffer: Array<number>, outFormat: number}}
	 */
	get options() {
		// return {
		// 	fetchAsBuffer: [OracleDb["BLOB"]], //2007
		// 	// fetchAsString: [OracleClient["DATE"]], //2003
		// 	outFormat: OracleDb["OBJECT"], //4002
		// };
	}

	/**
	 *
	 * @return {string}
	 */
	get user() {
		return "root";
	}

	/**
	 *
	 * @return {string}
	 */
	get password() {
		return "";
	}

	// noinspection JSMethodCanBeStatic
	/**
	 *
	 * @return {number}
	 */
	get timeout() {
		return 5000;
	}
}

/**
 *
 * @class FaDaoMysqlConnection
 */
module.exports = FaDaoMysqlConnection;
