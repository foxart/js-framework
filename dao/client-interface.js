"use strict";

class FaDaoClientInterface {
	get open() {
		throw new Error("open not implemented");
	}

	get close() {
		throw new Error("close not implemented");
	}
}

/**
 *
 * @type {FaDaoClientInterface}
 */
module.exports = FaDaoClientInterface;
