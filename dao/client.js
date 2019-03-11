"use strict";
/*fa*/
const FaError = require("fa-nodejs/base/error");
/*variables*/
let _client_list = {};

class ClientClass {
	/**
	 *
	 * @param name {string}
	 * @param trace {Object}
	 * @return {*}
	 */
	static find(name, trace) {
		let result = _client_list[name];
		if (!result) {
			try {
				let model_path = trace["path"];
				let regular_path = new RegExp(`^(.+)/modules/.+models/([A-Z][^-]+)Model.js$`);
				let match_path = model_path.match(regular_path);
				let client_path = `${match_path[1]}/config/clients/${name.split("-").map(item => item.capitalize()).join("")}Client.js`;
				let ClientClass = require(client_path);
				_client_list[name] = new ClientClass;
				result = _client_list[name];
			} catch (e) {
				throw new FaError(e).setTrace(trace);
			}
		}
		return result;
	};

	/**
	 *
	 * @return {string}
	 */
	get host() {
		throw new FaError("host not specified");
	};

	/**
	 *
	 * @return {number}
	 */
	get port() {
		throw new FaError("port not specified");
	};

	/**
	 *
	 * @return {string}
	 */
	get database() {
		throw new FaError("database not specified");
	};

	/**
	 * @return {string}
	 */
	get user() {
		throw new FaError("user not specified");
	};

	/**
	 * @return {string}
	 */
	get password() {
		throw new FaError("password not specified");
	};

	/**
	 * @return {string}
	 */
	get dcs() {
		throw new FaError("dcs not implemented");
	}

	/**
	 *
	 * @return {boolean}
	 */
	get persistent() {
		throw new FaError("persistent not specified");
	};

	get open() {
		throw new FaError("dcs not implemented");
	}

	get close() {
		throw new FaError("dcs not implemented");
	}
}

/**
 *
 * @type {ClientClass}
 */
module.exports = ClientClass;
