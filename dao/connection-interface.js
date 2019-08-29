"use strict";

class FaDaoConnectionInterface {
	// noinspection JSMethodCanBeStatic
	get get() {
		throw new Error("get not implemented");
	};

	// noinspection JSMethodCanBeStatic
	/**
	 * @return {string}
	 */
	get host() {
		throw new Error("host not specified");
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
	 * @return {Object}
	 */
	get options() {
		throw new Error("options not specified");
	}
}

/**
 *
 * @type {FaDaoConnectionInterface|Class}
 */
module.exports = FaDaoConnectionInterface;
