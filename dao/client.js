"use strict";
/*fa*/
const FaDaoClientInterface = require("fa-nodejs/dao/client-interface");
/*vars*/
let _connection_list = {};

class FaDaoClient extends FaDaoClientInterface {
	/**
	 * @constructor
	 * @param client_path {string}
	 */
	constructor(client_path) {
		super();
		this._client_path = client_path;
	}

	/** @return {boolean} */
	checkConnection() {
		return !!_connection_list[this._client_path];
	}

	/** @return {*} */
	getConnection() {
		return _connection_list[this._client_path];
	}

	/** @param connection {Object} */
	attachConnection(connection) {
		_connection_list[this._client_path] = connection;
	}

	detachConnection() {
		delete _connection_list[this._client_path];
	}
}

/** @class {FaDaoClient} */
module.exports = FaDaoClient;
