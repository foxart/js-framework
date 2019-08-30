"use strict";
/*fa*/
// const FaTrace = require("fa-nodejs/base/trace");
const FaDaoClientInterface = require("fa-nodejs/dao/client-interface");
/*vars*/
let _connection_list = {};

class FaDaoClient extends FaDaoClientInterface {
// class FaDaoClient {
	/**
	 * @constructor
	 * @param connection {string}
	 */
	constructor(connection) {
		super();
		this._connector = connection;
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

	/**
	 *
	 * @return {boolean}
	 */
	checkConnection() {
		return !!_connection_list[this._connector];
	}

	/**
	 *
	 * @return {*}
	 */
	getConnection() {
		return _connection_list[this._connector];
	}

	/**
	 *
	 * @param connection {Object}
	 */
	attachConnection(connection) {
		_connection_list[this._connector] = connection;
	}

	detachConnection() {
		delete _connection_list[this._connector];
	}
}

/**
 *
 * @class {FaDaoClient}
 */
module.exports = FaDaoClient;
