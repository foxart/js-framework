"use strict";
const FaError = require('../base/~error');

/**
 *
 * @type {FaModule}
 */
class FaModule {
	constructor() {
		this.name = 'FaModule';
		this._controller_list = {};
	}

	get controllerList() {
		return Object.keys(this._controller_list);
	}

	_controllerGet(index) {
		return this._controller_list[index];
	}

	/**
	 *
	 * @param index {string}
	 * @param controller {FaControllerClass}
	 */
	_controllerSet(index, controller) {
		this._controller_list[index] = controller;
	}

	/**
	 *
	 * @param index {string}
	 * @return {boolean}
	 */
	_constrollerExist(index) {
		return !!this._controller_list[index];
	}

	/**
	 *
	 * @param error {Error|string}
	 * @return {module.FaError}
	 * @private
	 */
	_error(error) {
		let e = error instanceof FaError === false ? new FaError(error, false) : error;
		e.name = this.name;
		// e.appendStack(this._trace.parse(e).string(this._traceLevel));
		return e;
	}

	/**
	 *
	 * @param FaHttpClass {FaHttpClass}
	 * @param configuration {Object}
	 */
	handleHttpRoutes(FaHttpClass, configuration) {
		for (const [key, value] of Object.entries(configuration['routes'])) {
			// try {
			let namespace = value['namespace'] ? `${process.cwd()}/${value['namespace']}` : `${process.cwd()}/${configuration["namespace"]}`;
			let index = `${namespace}/controllers/${value["controller"]}.js`;
			let Controller;
			if (this._constrollerExist(index) === false) {
				let ControllerHttp = require(`${namespace}/controllers/${value["controller"]}.js`);
				Controller = new ControllerHttp(FaHttpClass, namespace);
				this._controllerSet(index, Controller);
			}
			Controller = this._controllerGet(index);
			if (Controller[value["action"]]) {

				// FaConsole.consoleWarn(Controller[value["action"]]);
				// FaConsole.consoleWarn(Controller[value["action"]] instanceof Promise);
				// FaConsole.consoleWarn(typeof Controller[value["action"]]);

				FaHttpClass.Router.attach(key, function (req) {
					FaConsole.consoleError(value["action"]);
					// return Controller[value["action"]](req, this);
					// FaConsole.consoleWarn(key)
					return Controller[value["action"]](req);
				});
			} else {
				let Error = this._error(`${Controller["name"]} action not implemented: ${value["action"]}`);
				FaConsole.consoleError(Error);
				FaHttpClass.Router.attach(key, function () {
					throw Error;
				});
			}
			// } catch (e) {
			// 	console.log(e);
			// 	// let error = this.error(`Controller not found: ${path}/controllers/${value["controller"]}.js`);
			// 	let error = this._error(e);
			// 	// FaConsole.consoleError(e);
			// 	FaHttpClass.Router.attach(key, function () {
			// 		throw error;
			// 	});
			// }
		}
	}
}

/**
 *
 * @param path {string}
 * @return {FaModule}
 */
module.exports = function (path) {
	if (arguments) {
		return new FaModule(path);
	} else {
		return FaModule;
	}
};
