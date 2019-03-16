"use strict";
/*fa*/
const FaDaoConnection = require("fa-nodejs/dao/connection");

class FaDaoQuery {
	/**
	 * @constructor
	 * @param FaDaoModel {FaDaoModel}
	 */
	constructor(FaDaoModel) {
		this._FaDaoModel = FaDaoModel;
	};

	/**
	 *
	 * @return {FaDaoConnection}
	 * @private
	 */
	get _connection() {
		return FaDaoConnection.findConnection(this._FaDaoModel.connection);
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
			return `FROM ${this._from.map(item => `${this._connection.database}.${item}`).join(", ")} `
		} else {
			return `FROM ${this._connection.database}.${this._FaDaoModel.table} `;
		}
	}

	/**
	 *
	 * @param field
	 * @param condition
	 * @param comparsion
	 * @return {string}
	 * @private
	 */
	_extraceWhereCondition(field, condition, comparsion) {
		let result = "";
		if (Array.isArray(comparsion)) {
			result = `(${comparsion.map(function (item) {
				if (typeof item === "string") {
					return `'${item}'`;
				} else {
					return item;
				}
			}).join(", ")})`;
		} else if (typeof comparsion === "string") {
			result = `'${comparsion}'`;
		} else {
			result = comparsion;
		}
		return `${field} ${condition} ${result}`;
	}

	/**
	 *
	 * @param where
	 * @return {Array}
	 * @private
	 */
	_extractWhere(where = []) {
		let self = this;
		let result = [];
		(Array.isArray(where) ? where : [where]).map(function (where) {
			Object.entries(where).map(function ([key, value]) {
				switch (typeof value) {
					case "object":
						Object.entries(value).map(function ([condition, comparsion]) {
							result.push(self._extraceWhereCondition(key, condition, comparsion));
						});
						break;
					default:
						result.push(self._extraceWhereCondition(key, "=", value));
				}
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
	 * @private
	 */
	get _getLimit() {
		if (this._limit) {
			return `FETCH NEXT ${this._limit} ROWS ONLY `;
		} else {
			return null;
		}
	}

	/**
	 *
	 * @return {string|null}
	 * @private
	 */
	get _getOffset() {
		if (this._offset) {
			return `OFFSET ${this._offset} ROWS `;
		} else {
			return null;
		}
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
	 * @return {FaDaoQuery}
	 */
	select(select) {
		if (select) {
			this._select = Array.isArray(select) ? select : [select];
		} else {
			this._select = null;
		}
		return this;
	};

	/**
	 *
	 * @param from {string|Array<string>}
	 * @return {FaDaoQuery}
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
	 *
	 * @param where {Object|Array<Object>}
	 * @return {FaDaoQuery}
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
	 * @return {FaDaoQuery}
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
	 * @return {FaDaoQuery}
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
	 * @return {FaDaoQuery}
	 */
	limit(limit) {
		this._limit = limit;
		return this;
	}

	/**
	 *
	 * @param offset {number}
	 * @return {FaDaoQuery}
	 */
	offset(offset) {
		this._offset = offset;
		return this;
	}

	/**
	 * @return {Object}
	 */
	async one() {
		this.limit(1);
		let query = [
			this._getSelect,
			this._getFrom,
			this._getWhere,
			this._getAndWhere,
			this._getOrWhere,
			this._getOffset,
			this._getLimit,
		].filter(item => item).join("").trim();
		// console.info([query]);
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
			this._getOffset,
			this._getLimit,
		].filter(item => item).join("").trim();
		// console.info([query]);
		return await this._FaDaoModel.findMany(query);
	}
}

/**
 *
 * @type {FaDaoQuery}
 */
module.exports = FaDaoQuery;
