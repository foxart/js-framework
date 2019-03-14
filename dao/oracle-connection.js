"use strict";
/*nodejs*/
/** @type {Object} */
const OracleDb = require("oracledb");
/*fa*/
const FaDaoConnection = require("fa-nodejs/dao/connection");

class FaDaoOracleConnection extends FaDaoConnection {
	/**
	 *
	 * @return {{database: string, password: string, port: number, host: string, options: {fetchAsBuffer: Array<number>, outFormat: number}, persistent: boolean, user: string, sid: string}}
	 */
	get get() {
		return {
			host: this.host,
			port: this.port,
			sid: this.sid,
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
	get url() {
		return `${this.host}:${this.port}/${this.sid}`;
	};

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
		return 1521;
	};

	/**
	 * @return {string}
	 */
	get sid() {
		return "xe";
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
		return {
			fetchAsBuffer: [OracleDb["BLOB"]], //2007
			// fetchAsString: [OracleClient["DATE"]], //2003
			outFormat: OracleDb["OBJECT"], //4002
		};
	}

	/**
	 *
	 * @return {string}
	 */
	get user() {
		return "oracle";
	}

	/**
	 *
	 * @return {string}
	 */
	get password() {
		return "system";
	}
}

/**
 *
 * @type {FaDaoOracleConnection}
 */
module.exports = FaDaoOracleConnection;
