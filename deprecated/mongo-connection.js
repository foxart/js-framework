"use strict";
/*nodejs*/
const FaDaoConnection = require("fa-nodejs/dao/connection");

class FaDaoMongoConnection extends FaDaoConnection {
	/**
	 *
	 * @return {{password: string, database: string, port: number, host: string, persistent: boolean, user: string}}
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
	 *
	 * @return {string}
	 */
	get url() {
		return `mongodb://${this.host}:${this.port}`;
	}

	/**
	 *
	 * @return {string}
	 */
	get host() {
		return "127.0.0.1";
	}

	/**
	 *
	 * @return {number}
	 */
	get port() {
		return 27017;
	}

	/**
	 *
	 * @return {string}
	 */
	get database() {
		return "mongo"
	}

	/**
	 *
	 * @return {boolean}
	 */
	get persistent() {
		return true;
	}

	/**
	 *
	 * @return {{close: {}, connect: {}}}
	 */
	get options() {
		return {
			connect: {
				useNewUrlParser: true
			},
			close: {
				forceClose: false,
			},
		};
	}

	/**
	 *
	 * @return {string}
	 */
	get user() {
		return "user";
	}

	/**
	 *
	 * @return {string}
	 */
	get password() {
		return "password";
	}
}

/**
 *
 * @type {FaDaoMongoConnection}
 */
module.exports = FaDaoMongoConnection;
