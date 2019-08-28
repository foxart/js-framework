"use strict";

class FaDaoConnectionInterface {

	get get() {
		throw new Error("get not implemented");
	};

	/**
	 * @return {string}
	 */
	get url() {
		throw new Error("dcs not implemented");
	}

	/**
	 * @return {string}
	 */
	get host() {
		throw new Error("host not specified");
	}

	/**
	 * @return {number}
	 */
	get port() {
		throw new Error("port not specified");
	}

	/**
	 * @return {string}
	 */
	get database() {
		throw new Error("database not specified");
	}

	/**
	 * @return {string}
	 */
	get user() {
		throw new Error("user not specified");
	}

	/**
	 * @return {string}
	 */
	get password() {
		throw new Error("password not specified");
	}

	/**
	 * @return {boolean}
	 */
	get persistent() {
		throw new Error("persistent not specified");
	}


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
