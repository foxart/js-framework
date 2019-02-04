"use strict";
/**
 *
 * @type {module.FaControllerSocket}
 */
module.exports = class FaControllerSocket {
	/**
	 *
	 * @param SocketIo {FaSocketClass}
	 * @param namespace {string}
	 */
	constructor(SocketIo, namespace) {
		this.name = "FaControllerSocket";
		/**
		 *
		 * @type {FaSocketClass}
		 */
		this.Socket = SocketIo;
	}

	/**
	 *
	 * @param data {object}
	 * @return {*}
	 */
	actionIndex(data) {
		console.log(this);
		console.log(data);
	}
};
