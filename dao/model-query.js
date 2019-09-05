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
			// "whereGroup": [],
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

	/**
	 * @param value
	 * @private
	 */
	_processValue(value) {
		let self = this;
		let result = {};
		if (typeof value === "string") {
			result = `'${value}'`;
		} else if (typeof value === "function") {
			result = value();
		} else if (Array.isArray(value)) {
			result = value.map(function (item) {
				return self._processValue(item);
			});
		} else {
			result = value;
		}
		return result;
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
				let result;
				if (typeof value === "string") {
					result = `${value}`;
				} else if (typeof value === "function") {
					result = value();
				} else {
					result = value;
				}
				self._query["select"][key] = result;
				// self._query["select"][key] = value;
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

	_lastList(list) {
		let self = this;
		let last = list[list.length - 1];
		if (Array.isArray(last)) {
			return self._lastList(last);
		} else {
			return list;
		}
	}

	_penultimateList(list, prev) {
		let self = this;
		let last = list[list.length - 1];
		if (Array.isArray(last)) {
			return self._penultimateList(last, list);
		} else {
			return prev;
		}
	}

	// noinspection JSMethodCanBeStatic
	_setWhere(data) {
		this._query["where"].push(data);
	}

	/**
	 * @return {string|null}
	 * @private
	 */
	get _getWhere() {
		// let self = this;
		let result = [];
		this._query["where"].forEach(function (item) {
			result.push(item);
			// if (condition === "IN") {
			// 	result.push(`${compare} IN (${value.join(", ")})`);
			// } else if (condition === "BETWEEN") {
			// 	result.push(`${compare} BETWEEN ${value[0]} AND ${value[1]}`);
			// } else {
			// 	result.push(`${compare} ${condition} ${value}`);
			// }
		});
		if (result.length) {
			// return result.length === 1 ? `WHERE ${result} ` : `WHERE (${result.join("")}) `;
			return `WHERE ${result.join("")} `;
		} else {
			return null;
		}
	}

	_where(expression) {
		let self = this;
		Object.entries(expression).forEach(function ([compare, object]) {
			if (typeof object === "object") {
				Object.entries(object).forEach(function ([condition, value]) {
					self._setWhere(`${compare} ${condition} ${self._processValue(value)}`);
				});
			} else {
				self._setWhere(`${compare} = ${self._processValue(object)}`);
			}
		});
	}

	/**
	 *
	 * a=1 `{a: 1}}`; b>2 `{b: {">": 2}}}`
	 * @param expression {Object}
	 * @return {FaDaoModelQuery}
	 */
	where(expression) {
		this._where(expression);
		return this;
	}

	/** @return {FaDaoModelQuery} */
	andWhere(expression) {
		this._setWhere(" AND ");
		this._where(expression);
		return this;
	}

	/** @return {FaDaoModelQuery} */
	orWhere(expression) {
		this._setWhere(" OR ");
		this._where(expression);
		return this;
	}

	/** @return {FaDaoModelQuery} */
	andWhereBegin() {
		if (this._query["where"].length) {
			this._setWhere(" AND ");
		}
		this._setWhere("(");
		return this;
	}

	/** @return {FaDaoModelQuery} */
	andWhereEnd() {
		this._query["where"].push(")");
		return this;
	}

	/** @return {FaDaoModelQuery} */
	orWhereBegin() {
		if (this._query["where"].length) {
			this._setWhere(" OR ");
		}
		this._setWhere("(");
		return this;
	}

	/** @return {FaDaoModelQuery} */
	orWhereEnd() {
		this._query["where"].push(")");
		return this;
	}

	/**
	 *
	 * @param expression
	 * @return {FaDaoModelQuery}
	 */
	between(expression) {
		let self = this;
		Object.entries(expression).forEach(function ([key, value]) {
			let result = value.map(function (item) {
				return self._processValue(item);
			});
			self._query["where"].push(`${key} BETWEEN ${result[0]} AND ${result[1]}`);
		});
		return this;
	}

	/**
	 *
	 * @param expression
	 * @return {FaDaoModelQuery}
	 */
	in(expression) {
		let self = this;
		Object.entries(expression).forEach(function ([key, value]) {
			let result = value.map(function (item) {
				return self._processValue(item);
			}).join(", ");
			self._query["where"].push(`${key} IN (${result})`);
		});
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
