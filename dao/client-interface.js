"use strict";

class FaDaoClientInterface {
	// noinspection JSMethodCanBeStatic
	get connect() {
		throw new Error("connect not implemented");
	}

	// noinspection JSMethodCanBeStatic
	get open() {
		throw new Error("open not implemented");
	}

	// noinspection JSMethodCanBeStatic
	get execute() {
		throw new Error("execute not implemented");
	}
	// noinspection JSMethodCanBeStatic
	get close() {
		throw new Error("close not implemented");
	}
}

/**
 *
 * @class {FaDaoClientInterface}
 */
module.exports = FaDaoClientInterface;
