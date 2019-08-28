"use strict";
/*fa*/
const FaDaoConnectionInterface = require("fa-nodejs/dao/connection-interface");
/*variables*/
let _connection_list = {};

class FaDaoConnection extends FaDaoConnectionInterface {
	static get listConnection() {
		return Object.keys(_connection_list);
	}

	/**
	 *
	 * @param index {string}
	 * @return {FaDaoConnection}
	 */
	static findConnection(index) {
		if (!FaDaoConnection.existConnection(index)) {
			let ConnectionClass = require(index);
			let Connection = new ConnectionClass();
			FaDaoConnection.attachConnection(index, Connection);
		}
		return _connection_list[index];
	}

	/**
	 *
	 * @param index {string}
	 * @return {boolean}
	 */
	static existConnection(index) {
		return !!_connection_list[index];
	}

	/**
	 *
	 * @param index {string}
	 * @param connection {Object}
	 */
	static attachConnection(index, connection) {
		_connection_list[index] = connection;
	}

	/**
	 *
	 * @param index {string}
	 */
	static detachConnection(index) {
		delete _connection_list[index];
	}
}

/**
 *
 * @class FaDaoConnection
 */
module.exports = FaDaoConnection;
