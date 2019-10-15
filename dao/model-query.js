'use strict';
/*fa*/
const FaDaoModel = require('fa-nodejs/dao/model');
// const FaTrace = require('fa-nodejs/base/trace');
const FaError = require('fa-nodejs/base/error');
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
	}

	// noinspection JSMethodCanBeStatic
	/** @return {string} */
	get client() {
		throw new FaError('client not specified');
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
		// let self = this;
		let result = {};
		if (typeof value === 'string') {
			result = `'${value}'`;
		} else if (typeof value === 'function') {
			result = value();
			// } else if (Array.isArray(value)) {
			// 	result = value.map(function (item) {
			// 		return self._processValue(item);
			// 	});
		} else {
			// console.warn(value, typeof value);
			result = value;
		}
		return result;
	}


	// noinspection JSMethodCanBeStatic
	get table() {
		throw new FaError('table not specified');
	}

	/** @return {FaDaoModelQuery} */
	select() {
		let select = [];
		if (arguments.length) {
			Object.entries(arguments).forEach(function ([key, value]) {
				let result;
				if (typeof value === 'string') {
					result = `${value}`;
				} else if (typeof value === 'function') {
					result = value();
				} else {
					result = value;
				}
				select[key] = result;
			});
		} else {
			select = this.attributes;
		}
		this._query.push(`SELECT ${select.filter(item => item).map(item => `${item}`).join(', ')}`);
		return this;
	};

	/**
	 * @param insert
	 * @return {FaDaoModelQuery}
	 */
	insert(insert) {
		// console.log(insert, Object.keys(insert));
		let self = this;
		let keys = [];
		let values = [];
		Object.entries(insert).forEach(function ([key, value]) {
			// console.warn(`${value}`);
			keys.push(key);
			values.push(self._processValue(value));
		});
		// console.info(keys, keys.join(', '), values, values.join(', '));
		this._query.push(`INSERT ${this.table}(${keys.join(', ')}) VALUES (${values.join(', ')})`);
		return this;
	}

	delete(table = null) {
		let from = [];
		if (Array.isArray(table)) {
			from = table;
		} else {
			from = [this.table];
		}
		this._query.push(`DELETE FROM ${from.map(item => item).join(', ')}`);
		return this;
	}

	/**
	 * @deprecated
	 * @return {FaDaoModelQuery}
	 */
	from(table = null) {
		let from = [];
		if (Array.isArray(table)) {
			from = table;
		} else {
			from = [this.table];
		}
		this._query.push(`FROM ${from.map(item => item).join(', ')}`);
		return this;
	}

	/**
	 * a=1 `{a: 1}`; b>2 `{b: {'>': 2}}`
	 * @param expression {Object}
	 */
	_where(expression) {
		let self = this;
		Object.entries(expression).forEach(function ([compare, object]) {
			if (typeof object === 'object') {
				Object.entries(object).forEach(function ([condition, value]) {
					self._query.push(`${compare} ${condition} ${self._processValue(value)}`);
				});
			} else {
				self._query.push(`${compare} = ${self._processValue(object)}`);
			}
		});
	}

	/**
	 * a=1 `{a: 1}`; b>2 `{b: {'>': 2}}`
	 * @param where {Object}
	 * @return {FaDaoModelQuery}
	 */
	where(where) {
		if (where) {
			this._query.push('WHERE');
			this._where(where);
		}
		return this;
	}

	/**
	 * a=1 `{a: 1}`; b>2 `{b: {'>': 2}}`
	 * @param where {Object}
	 * @return {FaDaoModelQuery}
	 */
	subWhere(where) {
		if (where) {
			this._where(where);
		}
		return this;
	}

	/**
	 * a=1 `{a: 1}`; b>2 `{b: {'>': 2}}`
	 * @param where {Object}
	 * @return {FaDaoModelQuery}
	 */
	andWhere(where) {
		if (where) {
			this._query.push('AND');
			this._where(where);
		}
		return this;
	}

	/**
	 * a=1 `{a: 1}`; b>2 `{b: {'>': 2}}`
	 * @param where {Object}
	 * @return {FaDaoModelQuery}
	 */
	orWhere(where) {
		if (where) {
			this._query.push('OR');
			this._where(where);
		}
		return this;
	}

	/** @return {FaDaoModelQuery} */
	whereBegin() {
		this._query.push('(');
		return this;
	}

	/** @return {FaDaoModelQuery} */
	whereEnd() {
		return this;
	}

	/** @return {FaDaoModelQuery} */
	andWhereBegin() {
		this._query.push('AND');
		this._query.push('(');
		return this;
	}

	/** @return {FaDaoModelQuery} */
	andWhereEnd() {
		this._query.push(')');
		return this;
	}

	/** @return {FaDaoModelQuery} */
	orWhereBegin() {
		this._query.push('OR');
		this._query.push('(');
		return this;
	}

	/** @return {FaDaoModelQuery} */
	orWhereEnd() {
		this._query.push(')');
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
		this._query.push('AND');
		this.between(expression);
		return this;
	}

	/**
	 * a BETWEEN 1 AND 2 `{a: [1, 2]}``
	 * @param expression {Object}
	 * @return {FaDaoModelQuery}
	 */
	orBetween(expression) {
		this._query.push('OR');
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
			}).join(', ');
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
		this._query.push('AND');
		this.in(expression);
		return this;
	}

	/**
	 * a IN (1, 2) `{a: [1, 2]}`
	 * @param expression {Object}
	 * @return {FaDaoModelQuery}
	 */
	orIn(expression) {
		this._query.push('OR');
		this.in(expression);
		return this;
	}

	// noinspection JSMethodCanBeStatic
	/**
	 * @param limit {Number}
	 * @return {FaDaoModelQuery}
	 */
	limit(limit) {
		throw new FaError('limit not implemented');
	}

	// noinspection JSMethodCanBeStatic
	/**
	 * @param offset {Number}
	 * @return {FaDaoModelQuery}
	 */
	offset(offset) {
		throw new FaError('offset not implemented');
	}

	/**
	 * a=1 `{a: 1}`; b>2 `{b: {'>': 2}}`
	 * @param arguments {Object}
	 * @return {FaDaoModelQuery}
	 */
	order() {
		let result = [];
		Object.values(arguments).forEach(function (item) {
			Object.entries(item).forEach(function ([key, value]) {
				if (value === 1) {
					result.push(`${key} ASC`);
				} else if (value === -1) {
					result.push(`${key} DESC`);
				} else {
					result.push(`${key} ${value}`);
					// throw new FaError(`wrong order: ${value}`);
				}
			});
		});
		this._query.push(`ORDER BY ${result.join(', ')}`);
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
		// return this._query.filter(item => item).join(' ').trim();
		return this._query.filter(item => item).join(' ');
	}
}

/** @class {FaDaoModelQuery} */
module.exports = FaDaoModelQuery;
