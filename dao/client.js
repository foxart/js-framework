"use strict";
/*fa*/
// const FaTrace = require("fa-nodejs/base/trace");
const FaDaoClientInterface = require("fa-nodejs/dao/client-interface");
/*vars*/
let _client_list = {};
let _connection_list = {};

class FaDaoClient extends FaDaoClientInterface {
	/**
	 * @constructor
	 * @param connection {string}
	 * @param trace
	 */
	constructor(connection, trace) {
		super();
		this._connection = connection;
		this._trace = trace;
	}

	get connection() {
		// console.log(Object.keys(_connection_list));
		if (Object.keys(_connection_list).omit(this._connection)) {
			let ConnectionClass = require(this._connection);
			_connection_list[this._connection] = new ConnectionClass();
		}
		return _connection_list[this._connection];
	}
}

/**
 *
 * @type {FaDaoClient|Class}
 */
module.exports = FaDaoClient;
