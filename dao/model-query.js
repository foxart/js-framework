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

	/**
	 * @return {string|null}
	 * @private
	 */
	get _getWhere() {
		let self = this;
		let result = [];
		this._query["where"].forEach(function (item) {
			let {compare, condition, value, glue} = item;
			value = self._processValue(value);
			if (result.length) {
				glue = ` ${glue} `
			} else {
				glue = "";
			}
			if (condition === "IN") {
				result.push(`${glue}${compare} IN (${value.join(", ")})`);
			} else if (condition === "BETWEEN") {
				result.push(`${glue}${compare} BETWEEN ${value[0]} AND ${value[1]}`);
			} else {
				result.push(`${glue}${compare} ${condition} ${value}`);
			}
		});
		if (result.length) {
			// return result.length === 1 ? `WHERE ${result} ` : `WHERE (${result.join("")}) `;
			return `WHERE ${result.join("")} `;
		} else {
			return null;
		}
	}

	// noinspection JSMethodCanBeStatic
	_storeWhere(compare, condition, value, glue, group) {
		let last = this._query["where"][this._query["where"].length - 1];
		let data = {
			glue: glue,
			compare: compare,
			condition: condition,
			value: value,
		};
		if (group === false) {
			console.error(value);
			this._query["where"].push(data);
		} else if (group === true || Array.isArray(last)) {
			// if (Array.isArray(last)) {
			// } else {
			// 	// console.warn(a, Array.isArray(a));
			// 	this._query["where"].push([data]);
			// }
			this._query["where"][this._query["where"].length - 1].push(data);
		} else {
			this._query["where"].push(data);
		}
	}

	_where(expression, glue, group) {
		let self = this;
		Object.entries(expression).forEach(function ([compare, object]) {
			// console.warn(key, value);
			if (typeof object === "object") {
				Object.entries(object).forEach(function ([condition, value]) {
					self._storeWhere(compare, condition, value, glue, group);
				});
			} else {
				self._storeWhere(compare, "=", object, glue, group);
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
		this._query["where"] = [];
		this._where(expression, "AND");
		return this;
	}

	/** @return {FaDaoModelQuery} */
	andWhere() {
		this._where(arguments, "AND");
		return this;
	}

	/** @return {FaDaoModelQuery} */
	orWhere(expression) {
		this._where(expression, "OR");
		return this;
	}

	andWhereBegin(expression) {
		// let pointer = this._query["where"][this._query["where"].length - 1];
		this._query["where"][this._query["where"].length - 1] = [];
		this._where(expression, "AND", true);
		return this;
	}

	andWhereEnd(expression) {
		this._where(expression, "AND", false);
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
