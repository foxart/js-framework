"use strict";
/**
 *
 * @type {module.FaControllerSocket}
 */
module.exports = class FaControllerSocket {
	/**
	 *
	 * @param SocketIo {FaSocketClass}
	 */
	constructor(SocketIo) {
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
