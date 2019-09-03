"use strict";
/*fa*/
const FaError = require("fa-nodejs/base/error");
// const FaTrace = require("fa-nodejs/base/trace");
// const FaDaoAdapterClass = require("fa-nodejs/dao/adapter");
const FaDaoAttribute = require("fa-nodejs/dao/attribute");

class FaDaoModel {
	// /**
	//  * @constructor
	//  */
	// constructor() {
	// this.trace = FaTrace.trace(1);
	// }
	// noinspection JSMethodCanBeStatic
	/**
	 * @return {Array}
	 */
	get attributes() {
		throw new FaError("attributes not specified");
	};

	/**
	 *
	 * @return {FaDaoAttribute}
	 */
	get attribute() {
		if (!this._FaDaoAttribute) {
			this._FaDaoAttribute = new FaDaoAttribute(this.attributes);
		}
		return this._FaDaoAttribute;
	}

	load(data) {
		return this._FaDaoAttribute.fill(data);
	}
}

/**
 *
 * @class {FaDaoModel}
 */
module.exports = FaDaoModel;
