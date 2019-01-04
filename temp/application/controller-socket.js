"use strict";

// const FaError = require('../server.base/error');
class FaControllerSocket {
	/**
	 *
	 * @param SocketIo {FaSocketClass}
	 * @param namespace {string}
	 */
	constructor(SocketIo, namespace) {
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
}

/**
 *
 * @type {FaControllerSocket}
 */
module.exports = FaControllerSocket;
