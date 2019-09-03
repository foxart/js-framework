"use strict";
/*fa*/
const FaDaoModel = require("fa-nodejs/dao/model");
// const FaDaoConnection = require("fa-nodejs/dao/connection");
// const FaTrace = require("fa-nodejs/base/trace");
const FaError = require("fa-nodejs/base/error");
/*vars*/
let _client_list = {};

class FaDaoModelQuery extends FaDaoModel {
	/** @constructor */
	constructor() {
		super();
		this._query = {
			"select": [],
			"from": [],
			"where": [],
			// "andWhere": [],
		};
	}

	// noinspection JSMethodCanBeStatic
	/** @return {string} */
	get client() {
		throw new FaError("client not specified");
	}

	/** @return {FaDaoClient} */
	get daoClient() {
		if (!_client_list[this.client]) {
			let Client = require(this.client);
			_client_list[this.client] = new Client(this.client);
		}
		return _client_list[this.client];
	}

	// noinspection JSMethodCanBeStatic
	get table() {
		throw new FaError("table not specified");
	}

	/**
	 * @return {string}
	 * @private
	 */
	get _getSelect() {
		return `SELECT ${this._query["select"].filter(item => item).map(item => `${item}`).join(", ")} `;
	}

	/** @return {FaDaoModelQuery} */
	select() {
		let self = this;
		this._query["select"] = [];
		if (arguments.length) {
			Object.entries(arguments).forEach(function ([key, value]) {
				self._query["select"][key] = value;
			});
		} else {
			this._query["select"] = this.attributes;
		}
		return this;
	};

	/**
	 * @return {string}
	 * @private
	 */
	get _getFrom() {
		if (this._query["from"].length) {
			return `FROM ${this._query["from"].map(item => item).join(", ")} `;
		} else {
			return `FROM ${this.table} `;
		}
	}

	/** @return {FaDaoModelQuery} */
	from() {
		let self = this;
		this._query["from"] = [];
		Object.entries(arguments).forEach(function ([key, value]) {
			self._query["from"][key] = value;
		});
		return this;
	}

	// noinspection JSMethodCanBeStatic
	in() {
		return {"IN": Object.values(arguments)};
	}

	// noinspection JSMethodCanBeStatic
	between(value1, value2) {
		return {"BETWEEN": Object.values(arguments)};
	}

	// noinspection JSMethodCanBeStatic
	andGroup() {
		// return arguments;
		console.warn(arguments);
		// let res = {key: key, condition: "=", comparsion: self._parseValue(value), glue: glue};
		// console.error(res);
		return {};
	}

	// noinspection JSMethodCanBeStatic
	_parseValue(value) {
		let self = this;
		let result = {};
		if (typeof value === "string") {
			result = `'${value}'`;
		} else if (typeof value === "function") {
			result = value();
		} else if (Array.isArray(value)) {
			result = value.map(function (item) {
				return self._parseValue(item);
			});
		} else {
			result = value;
		}
		return result;
	}

	/**
	 * @return {string|null}
	 * @private
	 */
	get _getWhere() {
		let result = [];
		this._query["where"].forEach(function (item) {
			let {key, condition, comparsion, glue} = item;
			if (result.length) {
				glue = ` ${glue} `
			} else {
				glue = "";
			}
			if (condition === "IN") {
				result.push(`${glue}${key} IN (${comparsion.join(", ")})`);
			} else if (condition === "BETWEEN") {
				result.push(`${glue}${key} BETWEEN ${comparsion[0]} AND ${comparsion[1]}`);
			} else {
				result.push(`${glue}${key} ${condition} ${comparsion}`);
			}
		});
		if (result.length) {
			// return result.length === 1 ? `WHERE ${result} ` : `WHERE (${result.join("")}) `;
			return `WHERE ${result.join("")} `;
		} else {
			return null;
		}
	}

	_where(where, glue) {
		let self = this;
		Object.values(where).forEach(function (object) {
			if (Array.isArray(object)) {
				object.forEach(function (item) {
					Object.entries(item).forEach(function ([key, value]) {
						if (typeof value === "object") {
							let res = [];
							res = Object.entries(value).map(function ([condition, comparsion]) {
								// self._query["where"].push({key: key, condition: condition, comparsion: self._parseValue(comparsion), glue: "AND"});
								return {key: key, condition: condition, comparsion: self._parseValue(comparsion), glue: "AND"};
							});
							console.error(res);
						} else {
							self._query["where"].push({key: key, condition: "=", comparsion: self._parseValue(value), glue: "AND"});
						}
					});
				});
			} else {
				Object.entries(object).forEach(function ([key, value]) {
					if (typeof value === "object") {
						Object.entries(value).forEach(function ([condition, comparsion]) {
							self._query["where"].push({key: key, condition: condition, comparsion: self._parseValue(comparsion), glue: "OR"});
						});
					} else {
						self._query["where"].push({key: key, condition: "=", comparsion: self._parseValue(value), glue: "OR"});
					}
				});
			}
		});
	}

	/**
	 * a=1 `{a: 1}}`; b>2, c=3 `{b: {">": 2}}, {c: 3}}`
	 * @return {FaDaoModelQuery}
	 */
	where() {
		this._query["where"] = [];
		this._where(arguments, "AND");
		return this;
	}

	/**
	 *
	 * @return {string|null}
	 * @private
	 */
	get _getAndWhere() {
		let result = this._extractWhere(this._andWhere);
		if (result.length) {
			return result.length === 1 ? `AND ${result} ` : `AND (${result.join(" AND ")}) `;
		} else {
			return null;
		}
	}

	/** @return {FaDaoModelQuery} */
	andWhere() {
		// this._query["andWhere"] = [];
		this._where(arguments, "AND");
		return this;
	}

	/**
	 *
	 * @return {string|null}
	 * @private
	 */
	get _getOrWhere() {
		let result = this._extractWhere(this._orWhere);
		if (result.length) {
			return result.length === 1 ? `OR ${result} ` : `OR (${result.join(" AND ")}) `;
		} else {
			return null;
		}
	}

	/** @return {FaDaoModelQuery} */
	orWhere() {
		this._where(arguments, "OR");
		return this;
	}

	// noinspection JSMethodCanBeStatic
	/**
	 *
	 * @return {string|null}
	 */
	get _getLimit() {
		throw new FaError("limit not implemented");
	}

	/**
	 *
	 * @param limit {number}
	 * @return {FaDaoModelQuery}
	 */
	limit(limit) {
		this._limit = limit;
		return this;
	}

	// noinspection JSMethodCanBeStatic
	/**
	 *
	 * @return {string|null}
	 * @private
	 */
	get _getOffset() {
		throw new FaError("offset not implemented");
	}

	/**
	 *
	 * @param offset {number}
	 * @return {FaDaoModelQuery}
	 */
	offset(offset) {
		this._offset = offset;
		return this;
	}

	get _getOrder() {
		let self = this;
		let result = [];
		if (this._order) {
			Object.entries(self._order).map(function ([key, value]) {
				if (value === 1) {
					result.push(`${key} ASC`);
				} else if (value === -1) {
					result.push(`${key} DESC`);
				} else {
					result.push(`${key} ${value}`);
				}
			});
			return `ORDER BY ${result.join(", ")} `;
		} else {
			return null;
		}
	}

	/**
	 *
	 */
	order(order) {
		this._order = order;
		return this;
	}

	/**
	 *
	 * @return {string}
	 */
	get query() {
		// console.error(this._getWhere);
		// throw new Error();
		return [
			this._getSelect,
			this._getFrom,
			this._getWhere,
			// 	this._getAndWhere,
			// 	this._getOrWhere,
			// 	this._getOrder,
			// 	this._getLimit,
			// 	this._getOffset,
		].filter(item => item).join("").trim();
	}
}

/**
 *
 * @class {FaDaoModelQuery}
 */
module.exports = FaDaoModelQuery;
