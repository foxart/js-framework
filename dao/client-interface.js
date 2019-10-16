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
	error() {
		throw new Error("error not implemented");
	}

	// noinspection JSMethodCanBeStatic
	open() {
		throw new Error("open not implemented");
	}

	// noinspection JSMethodCanBeStatic
	execute() {
		throw new Error("execute not implemented");
	}

	// noinspection JSMethodCanBeStatic
	close() {
		throw new Error("close not implemented");
	}
}

/**
 *
 * @class {FaDaoClientInterface}
 */
module.exports = FaDaoClientInterface;
