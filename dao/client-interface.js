"use strict";

class FaDaoClientInterface {
	// noinspection JSMethodCanBeStatic
	/**
	 * @return {string}
	 */
	get hostname() {
		throw new Error("hostname not specified");
	}

	// noinspection JSMethodCanBeStatic
	/**
	 * @return {number}
	 */
	get port() {
		throw new Error("port not specified");
	}

	// noinspection JSMethodCanBeStatic
	/**
	 * @return {string}
	 */
	get database() {
		throw new Error("database not specified");
	}

	// noinspection JSMethodCanBeStatic
	/**
	 * @return {string}
	 */
	get user() {
		throw new Error("user not specified");
	}

	// noinspection JSMethodCanBeStatic
	/**
	 * @return {string}
	 */
	get password() {
		throw new Error("password not specified");
	}

	// noinspection JSMethodCanBeStatic
	/**
	 * @return {boolean}
	 */
	get persistent() {
		throw new Error("persistent not specified");
	}

	// noinspection JSMethodCanBeStatic
	/**
	 * @return {number}
	 */
	get timeout() {
		throw new Error("timeout not specified");
	}

	// noinspection JSMethodCanBeStatic
	get error() {
		throw new Error("error not implemented");
	}


}

/**
 *
 * @class {FaDaoClientInterface}
 */
module.exports = FaDaoClientInterface;
