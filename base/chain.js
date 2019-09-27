"use strict";
// const FaError = require("fa-nodejs/base/error");
// const FaFile = require("fa-nodejs/base/file");
class FaChain {
	/**
	 * @constructor
	 */
	constructor() {
		// this._FaFile = new FaFile(pathname);
		this._chain = [];
	}

	add(chain) {
		console.warn(chain);
		this._chain.push(chain);
	}

	execute() {
		this._chain.forEach(function (item) {
			console.info(item);
		})
	}
}

/** @class {FaChain} */
module.exports = FaChain;
