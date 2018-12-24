"use strict";
const FaError = require("../base/error");

/**
 *
 * @type {FaModule}
 */
class FaModule {
	constructor() {
		this._controller_list = {};
	}

	get controllerList() {
		return Object.keys(this._controller_list);
	}

	/**
	 *
	 * @param index
	 * @return {*}
	 * @private
	 */
	_controllerGet(index) {
		return this._controller_list[index];
	}

	/**
	 *
	 * @param index {string}
	 * @param controller {FaControllerClass}
	 * @private
	 */
	_controllerSet(index, controller) {
		this._controller_list[index] = controller;
	}

	/**
	 *
	 * @param index {string}
	 * @return {boolean}
	 * @private
	 */
	_constrollerExist(index) {
		return !!this._controller_list[index];
	}

	/**
	 *
	 * @param FaHttpClass {FaHttpClass}
	 * @param configuration {Object}
	 */
	handleHttpRoutes(FaHttpClass, configuration) {
		for (const [key, value] of Object.entries(configuration["routes"])) {
			let namespace = value['namespace'] ? `${process.cwd()}/${value["namespace"]}` : `${process.cwd()}/${configuration["namespace"]}`;
			let index = `${namespace}/controllers/${value["controller"]}.js`;
			let Controller;
			if (this._constrollerExist(index) === false) {
				let ControllerHttp = require(`${namespace}/controllers/${value["controller"]}.js`);
				Controller = new ControllerHttp(FaHttpClass, namespace);
				this._controllerSet(index, Controller);
			}
			Controller = this._controllerGet(index);
			if (Controller[value["action"]]) {
				FaHttpClass.Router.attach(key, function (req) {
					FaConsole.consoleError(value["action"]);
					return Controller[value["action"]](req);
				});
			} else {
				let error = FaError.pickTrace(`${Controller["name"]} action not implemented: ${value["action"]}`, 2);
				FaConsole.consoleError(error);
				FaHttpClass.Router.attach(key, function () {
					throw error;
				});
			}
		}
	}


	handleHttpWeb(FaHttpClass, configuration) {
		FaConsole.consoleError(arguments);
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
