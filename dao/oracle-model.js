"use strict";
/*node*/
/** @type {oracledbCLib.Oracledb} */
// const OracleClient = require("oracledb");
/*fa*/
const ClientClass = require("fa-nodejs/dao/client");
const ModelClass = require("fa-nodejs/dao/model");
const QueryClass = require("fa-nodejs/dao/query");
const FaTrace = require("fa-nodejs/base/trace");
/*variables*/
const FaError = require("fa-nodejs/base/error");

class OracleModelClass extends ModelClass {
	/**
	 * @constructor
	 */
	constructor() {
		super();
		this._trace = FaTrace.trace(1);
	};

	/**
	 *
	 * @return {QueryClass}
	 */
	get query() {
		if (!this._Query) {
			this._Query = new QueryClass(this, this.oracle.database, this.table);
		}
		return this._Query;
	}

	/**
	 *
	 * @return {OracleClientClass}
	 * @private
	 */
	get oracle() {
		return ClientClass.find(this.client, this._trace);
	}

	/**
	 *
	 * @param query
	 * @private
	 * @return {Promise<*>}
	 */
	async _execute(query) {
		console.info(process.env);
		let trace = FaTrace.trace(3);
		try {
			let connection = await this.oracle.open();
			let result = await connection.execute(query);
			await this.oracle.close();
			return result;
		} catch (e) {
			// Object.entries(e).forEach(function ([key, value]) {
			// 	console.error(key, value);
			// });
			// console.error(e);
			throw new FaError(e).setTrace(trace);
		}
	};

	async findOne(query) {
		let result = await this._execute(query);
		// console.info(result);
		if (result["rows"][0]) {
			return result["rows"][0];
		} else {
			return {};
		}
	}

	async findMany(query) {
		let result = await this._execute(query);
		// console.info(result);
		if (result["rows"]) {
			return result["rows"];
		} else {
			return [];
		}
	}
}

/**
 *
 * @type {OracleModelClass}
 */
module.exports = OracleModelClass;
// function filterArguments(data) {
// 	let parameter_list = [];
// 	let function_list = [];
// 	Object.values(data).filter(function (value) {
// 		if (typeof value === "function") {
// 			function_list.push(value);
// 		} else {
// 			parameter_list.push(value);
// 		}
// 	});
// 	return [
// 		parameter_list[0] === undefined ? "SELECT * FROM V$VERSION" : parameter_list[0],
// 		parameter_list[1] === undefined ? [] : parameter_list[1],
// 		parameter_list[2] === undefined ? [] : parameter_list[2],
// 		function_list[0] === undefined ? function (data) {
// 			// logOracleResponse(data);
// 		} : function_list[0],
// 		function_list[1] === undefined ? function (e) {
// 			console.error(e);
// 		} : function_list[1]
// 	];
// }
