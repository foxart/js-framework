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
		this._reset();
	}

	/** @private */
	_reset() {
		this._query = [];
		// this._query = [];
		// this._query = [];
		// this._query = [];
		// this._query = null;
		// this._query = null;
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
	 * @param list
	 * @return {Array}
	 * @private
	 */
	_lastList(list) {
		let self = this;
		let last = list[list.length - 1];
		if (Array.isArray(last)) {
			return self._lastList(last);
		} else {
			return list;
		}
	}

	/**
	 * @param list {Array}
	 * @param prev {Array}
	 * @return {*}
	 * @private
	 */
	_penultimateList(list, prev) {
		let self = this;
		let last = list[list.length - 1];
		if (Array.isArray(last)) {
			return self._penultimateList(last, list);
		} else {
			return prev;
		}
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
	get _select() {
		return `SELECT ${this._query.filter(item => item).map(item => `${item}`).join(", ")} `;
	}

	/** @return {FaDaoModelQuery} */
	select() {
		let select = [];
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
				select[key] = result;
			});
		} else {
			select = this.attributes;
		}
		this._query.push(`SELECT ${select.filter(item => item).map(item => `${item}`).join(", ")} `);
		return this;
	};

	/**
	 * @return {string}
	 * @private
	 */
	get _from() {
		if (this._query.length) {
			return `FROM ${this._query.map(item => item).join(", ")} `;
		} else {
			return `FROM ${this.table} `;
		}
	}

	/** @return {FaDaoModelQuery} */
	from() {
		let from = [];
		if (this._query.length) {
			Object.entries(arguments).forEach(function ([key, value]) {
				from[key] = value;
			});
		} else {
			from = [this.table];
		}
		this._query.push(`FROM ${from.map(item => item).join(", ")} `);
		return this;
	}

	/**
	 * @return {string|null}
	 * @private
	 */
	get _where() {
		let result = [];
		this._query.forEach(function (item) {
			result.push(item);
		});
		if (result.length) {
			return `WHERE ${result.join("")} `;
		} else {
			return null;
		}
	}

	/**
	 * a=1 `{a: 1}`; b>2 `{b: {">": 2}}`
	 * @param expression {Object}
	 * @return {FaDaoModelQuery}
	 */
	where(expression) {
		// this._query(expression);
		let self = this;
		Object.entries(expression).forEach(function ([compare, object]) {
			if (typeof object === "object") {
				Object.entries(object).forEach(function ([condition, value]) {
					self._query.push(`${compare} ${condition} ${self._processValue(value)}`);
				});
			} else {
				self._query.push(`${compare} = ${self._processValue(object)}`);
			}
		});
		return this;
	}

	/**
	 * a=1 `{a: 1}`; b>2 `{b: {">": 2}}`
	 * @param expression {Object}
	 * @return {FaDaoModelQuery}
	 */
	andWhere(expression) {
		this._query.push(" AND ");
		this.where(expression);
		return this;
	}

	/**
	 * a=1 `{a: 1}`; b>2 `{b: {">": 2}}`
	 * @param expression {Object}
	 * @return {FaDaoModelQuery}
	 */
	orWhere(expression) {
		this._query.push(" OR ");
		this.where(expression);
		return this;
	}

	/** @return {FaDaoModelQuery} */
	whereBegin() {
		this._query.push("(");
		return this;
	}

	/** @return {FaDaoModelQuery} */
	whereEnd() {
		return this;
	}

	/** @return {FaDaoModelQuery} */
	andWhereBegin() {
		this._query.push(" AND ");
		this._query.push("(");
		return this;
	}

	/** @return {FaDaoModelQuery} */
	andWhereEnd() {
		this._query.push(")");
		return this;
	}

	/** @return {FaDaoModelQuery} */
	orWhereBegin() {
		this._query.push(" OR ");
		this._query.push("(");
		return this;
	}

	/** @return {FaDaoModelQuery} */
	orWhereEnd() {
		this._query.push(")");
		return this;
	}

	/**
	 * a BETWEEN 1 AND 2 `{a: [1, 2]}``
	 * @param expression {Object}
	 * @return {FaDaoModelQuery}
	 */
	between(expression) {
		let self = this;
		Object.entries(expression).forEach(function ([key, value]) {
			let result = value.map(function (item) {
				return self._processValue(item);
			});
			self._query.push(`${key} BETWEEN ${result[0]} AND ${result[1]}`);
		});
		return this;
	}

	/**
	 * a BETWEEN 1 AND 2 `{a: [1, 2]}``
	 * @param expression {Object}
	 * @return {FaDaoModelQuery}
	 */
	andBetween(expression) {
		this._query.push(" AND ");
		this.between(expression);
		return this;
	}

	/**
	 * a BETWEEN 1 AND 2 `{a: [1, 2]}``
	 * @param expression {Object}
	 * @return {FaDaoModelQuery}
	 */
	orBetween(expression) {
		this._query.push(" OR ");
		this.between(expression);
		return this;
	}

	/**
	 * a IN (1, 2) `{a: [1, 2]}`
	 * @param expression {Object}
	 * @return {FaDaoModelQuery}
	 */
	in(expression) {
		let self = this;
		Object.entries(expression).forEach(function ([key, value]) {
			let result = value.map(function (item) {
				return self._processValue(item);
			}).join(", ");
			self._query.push(`${key} IN (${result})`);
		});
		return this;
	}

	/**
	 * a IN (1, 2) `{a: [1, 2]}`
	 * @param expression {Object}
	 * @return {FaDaoModelQuery}
	 */
	andIn(expression) {
		this._query.push(" AND ");
		this.in(expression);
		return this;
	}

	/**
	 * a IN (1, 2) `{a: [1, 2]}`
	 * @param expression {Object}
	 * @return {FaDaoModelQuery}
	 */
	orIn(expression) {
		this._query.push(" OR ");
		this.in(expression);
		return this;
	}

	// noinspection JSMethodCanBeStatic
	/**
	 * @return {string|null}
	 * @protected
	 */
	get _limit() {
		throw new FaError("limit not implemented");
	}

	/**
	 * @param limit {number}
	 * @return {FaDaoModelQuery}
	 */
	limit(limit) {
		this._query = limit;
		return this;
	}

	// noinspection JSMethodCanBeStatic
	/**
	 * @return {string|null}
	 * @protected
	 */
	get _offset() {
		throw new FaError("offset not implemented");
	}

	/**
	 * @param offset {Number}
	 * @return {FaDaoModelQuery}
	 */
	offset(offset) {
		this._query.push(offset);
		return this;
	}

	/**
	 * @return {string|null}
	 * @private
	 */
	get _order() {
		let self = this;
		let result = [];
		if (this._prop_order) {
			Object.entries(self._prop_order).map(function ([key, value]) {
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
	 * @param order {Number}
	 * @return {FaDaoModelQuery}
	 */
	order(order) {
		this._prop_order = order;
		return this;
	}

	/**
	 * @return {string}
	 * @protected
	 */
	get _sql() {
		let sql = this.sql;
		this._reset();
		return sql;
	}

	/** @return {string} */
	get sql() {
		return this._query.filter(item => item).join("").trim();
	}
}

/** @class {FaDaoModelQuery} */
module.exports = FaDaoModelQuery;
