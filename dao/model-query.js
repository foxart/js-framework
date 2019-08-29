"use strict";
/*fa*/
const FaDaoModel = require("fa-nodejs/dao/model");
// const FaDaoConnection = require("fa-nodejs/dao/connection");
const FaError = require("fa-nodejs/base/error");

// const FaTrace = require("fa-nodejs/base/trace");
class FaDaoModelQuery extends FaDaoModel {
	get table() {
		throw new FaError("table not specified").setTrace(this.trace);
	}

	/**
	 *
	 * @return {string}
	 * @private
	 */
	get _getSelect() {
		if (this._select) {
			return `SELECT ${this._select.map(item => `${item}`).join(", ")} `;
		} else {
			return `SELECT * `;
		}
	}

	/**
	 *
	 * @return {string}
	 * @private
	 */
	get _getFrom() {
		if (this._from) {
			return `FROM ${this._from.map(item => {
				// return `${database}${item}`;
				return `${item}`;
			}).join(", ")} `;
		} else {
			return `FROM ${this.table} `;
		}
	}

	/**
	 * @param where
	 * @return {Array}
	 * @private
	 */
	_extractWhere(where = []) {
		function _extraceWhereCondition(field, condition, comparsion) {
			let result = "";
			if (Array.isArray(comparsion)) {
				result = `(${comparsion.map(function (item) {
					if (typeof item === "string") {
						return `'${item}'`;
					} else if (typeof item === "function") {
						return item();
					} else {
						return item;
					}
				}).join(", ")})`;
			} else if (typeof comparsion === "function") {
				result = comparsion();
			} else if (typeof comparsion === "string") {
				result = `'${comparsion}'`;
			} else {
				result = comparsion;
			}
			return `${field} ${condition} ${result}`;
		}

		let result = [];
		where.map(function (item) {
			Object.entries(item).map(function ([key, value]) {
				Object.entries(value).map(function ([condition, comparsion]) {
					result.push(_extraceWhereCondition(key, condition, comparsion));
				});
			});
		});
		return result;
	}

	/**
	 *
	 * @return {string|null}
	 * @private
	 */
	get _getWhere() {
		let result = this._extractWhere(this._where);
		if (result.length) {
			return result.length === 1 ? `WHERE ${result} ` : `WHERE (${result.join(" AND ")}) `;
		} else {
			return null;
		}
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

	/**
	 *
	 * @return {string|null}
	 */
	get _getLimit() {
		throw new FaError("limit not implemented").setTrace(this.trace);
	}

	/**
	 *
	 * @return {string|null}
	 * @private
	 */
	get _getOffset() {
		throw new FaError("offset not implemented").setTrace(this.trace);
	}

	/**
	 *
	 * @private
	 */
	_reset() {
		this._select = null;
		this._from = null;
		this._where = null;
		this._andWhere = null;
		this._orWhere = null;
		this._limit = null;
		this._offset = null;
	}

	/**
	 *
	 * @param select {string|Array<string>}
	 * @return {FaDaoModelQuery}
	 */
	select(select = null) {
		if (select) {
			this._select = Array.isArray(select) ? select : [select];
		} else {
			// this._select = null;
			this._select = this.attributes;
		}
		return this;
	};

	/**
	 *
	 * @param from {string|Array<string>}
	 * @return {FaDaoModelQuery}
	 */
	from(from) {
		if (from) {
			this._from = Array.isArray(from) ? from : [from];
		} else {
			this._from = null;
		}
		return this;
	}

	/**
	 * a=1 `{a: {"=": 1}}`; b>2, c=3 `[{b: {">": 2}}, {c: {"=": 3}}]`
	 *
	 * @param where {Object|Array<Object>}
	 * @return {FaDaoModelQuery}
	 */
	where(where) {
		if (where) {
			this._where = Array.isArray(where) ? where : [where];
		} else {
			this._where = [];
		}
		return this;
	}

	/**
	 *
	 * @param where {Object|Array<Object>}
	 * @return {FaDaoModelQuery}
	 */
	andWhere(where) {
		if (where) {
			this._andWhere = Array.isArray(where) ? where : [where];
		} else {
			this._andWhere = [];
		}
		return this;
	}

	/**
	 *
	 * @param where {Object|Array<Object>}
	 * @return {FaDaoModelQuery}
	 */
	orWhere(where) {
		if (where) {
			this._orWhere = Array.isArray(where) ? where : [where];
		} else {
			this._orWhere = [];
		}
		return this;
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
				if (value > 0) {
					result.push(`${key} ASC`);
				} else {
					result.push(`${key} DESC`);
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

	toDatetimeOracle(datetime, format) {
		return function () {
			return `TO_DATE('${datetime.toISOString().slice(0, 19).replace('T', ' ')}', '${format}')`;
		}
	}

	get query() {
		return [
			this._getSelect,
			this._getFrom,
			this._getWhere,
			this._getAndWhere,
			this._getOrWhere,
			this._getOrder,
			this._getLimit,
			this._getOffset,
		].filter(item => item).join("").trim();
	}

	/**
	 * @return {Object}
	 */
	async one() {
		// this.limit(1);
		let query = [
			this._getSelect,
			this._getFrom,
			this._getWhere,
			this._getAndWhere,
			this._getOrWhere,
			this._getOrder,
			this._getOffset,
			this._getLimit,
		].filter(item => item).join("").trim();
		// console.log([query]);
		return await this._FaDaoModel.findOne(query);
	}

	/**
	 * @return {Array<Object>}
	 */
	async many() {
		let query = [
			this._getSelect,
			this._getFrom,
			this._getWhere,
			this._getAndWhere,
			this._getOrWhere,
			this._getOrder,
			this._getOffset,
			this._getLimit,
		].filter(item => item).join("").trim();
		// console.info([query]);
		return await this._FaDaoModel.findMany(query);
	}
}

/**
 *
 * @class {FaDaoModelQuery}
 */
module.exports = FaDaoModelQuery;
