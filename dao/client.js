"use strict";
// const FaDaoConnection = require("fa-nodejs/dao/connection");
const FaDaoClientInterface = require("fa-nodejs/dao/client-interface");
/*variables*/
let _client_list = {};

class FaDaoClient extends FaDaoClientInterface {
	/**
	 *
	 * @return {Array<string>}
	 */
	static get listClient() {
		return Object.keys(_client_list);
	}

	/**
	 *
	 * @param client {string}
	 * @return {Object}
	 */
	static findClient(client) {
		return _client_list[client];
	}

	/**
	 *
	 * @param index {string}
	 * @return {boolean}
	 */
	static existClient(index) {
		return !!_client_list[index];
	}

	/**
	 *
	 * @param index {string}
	 * @param client {Object}
	 */
	static attachClient(index, client) {
		_client_list[index] = client;
	}

	/**
	 *
	 * @param index {string}
	 */
	static detachClient(index) {
		delete _client_list[index];
	}
}

/**
 *
 * @type {FaDaoClient}
 */
module.exports = FaDaoClient;
