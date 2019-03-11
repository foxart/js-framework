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
		/**
		 *
		 * @type {OracleClient}
		 * @private
		 */
		this._OracleClient = null;
		this._options = {
			outFormat: OracleClient["OBJECT"],
			fetchAsBuffer: [OracleClient["BLOB"]],
			// fetchAsString: [OracleClient["DATE"]],
		};
		Object.entries(this.options).forEach(function ([key, value]) {
			OracleClient[key] = value;
		});
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

	/**
	 *
	 * @return {{fetchAsBuffer: Array, outFormat: Array<number>}}
	 */
	get options() {
		return this._options
	}

	/**
	 *
	 * @return {Promise<OracleClient>}
	 */
	async open() {
		try {
			if (!this._OracleClient) {
				this._OracleClient = await OracleClient.getConnection({
					connectString: this.dcs,
					user: this.user,
					password: this.password,
				});
			}
			// console.error("OPEN");
			return this._OracleClient;
		} catch (e) {
			throw new FaError(e);
		}
	};

	/**
	 *
	 * @return {Promise<boolean>}
	 */
	async close() {
		try {
			if (!this.persistent && this._OracleClient) {
				// await this._OracleClient.close();
				this._OracleClient = null;
				// console.error("CLOSE");
				return true;
			} else {
				// console.error("CLOSED");
				return false;
			}
		} catch (e) {
			throw new FaError(e);
		}
	};

	async execute(query) {
		// let trace = FaTrace.trace(3);
		try {
			if (this._OracleClient) {
				return await this._OracleClient.execute(query);
			} else {
				return null;
			}
		} catch (e) {
			// Object.entries(e).forEach(function ([key, value]) {
			// 	console.error(key, value);
			// });
			// console.error(trace);
			throw new FaError(e);
		}
	};
}

/**
 *
 * @type {OracleClientClass}
 */
module.exports = OracleClientClass;

