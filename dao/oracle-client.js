"use strict";
/*nodejs*/
/* @type {oracledbCLib.Oracledb} */
/**
 *
 * @type {*}
 */
const OracleClient = require("oracledb");
/*fa*/
const ClientClass = require("fa-nodejs/dao/client");
const FaTrace = require("fa-nodejs/base/trace");

class OracleClientClass extends ClientClass {
	/**
	 * @constructor
	 */
	constructor() {
		super();
		this._OracleClient = null;
		this._trace = FaTrace.trace(1);
	};

	/**
	 *
	 * @return {string}
	 * @private
	 */
	get dcs() {
		return `${this.host}:${this.port}/${this.sid}`;
	};

	/**
	 * @return {string}
	 */
	get sid() {
		throw new FaError("sid not specified").setTrace(this._trace);
	};

	get options() {
		return {
			outFormat: OracleClient["OBJECT"],
			fetchAsBuffer: [OracleClient["BLOB"]],
			// fetchAsString: [OracleClient["DATE"]],
		}
	}

	/**
	 *
	 * @return {Promise<OracleClient>}
	 */
	async open() {
		try {
			if (!this._OracleClient) {
				Object.entries(this.options).forEach(function ([key, value]) {
					OracleClient[key] = value;
				});
				this._OracleClient = await OracleClient.getConnection({
					connectString: this.dcs,
					user: this.user,
					password: this.password,
				});
			}
			return this._OracleClient;
		} catch (e) {
			throw new FaError(e).setTrace(this._trace);
		}
	};

	/**
	 *
	 * @return {Promise<boolean>}
	 */
	async close() {
		try {
			if (!this.persistent && this._OracleClient) {
				this._OracleClient = this._OracleClient.close(function (e) {
					if (e) {
						console.error(e);
					}
				});
				return true;
			} else {
				return false;
			}
		} catch (e) {
			throw new FaError(e).setTrace(this._trace);
		}
	};
}

/**
 *
 * @type {OracleClientClass}
 */
module.exports = OracleClientClass;

