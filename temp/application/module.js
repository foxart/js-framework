"use strict";
const FaError = require("../base/error");
const FaFile = require("../base/file")();
const FaSocketClass = require("../server/socket");
const FaHttpClass = require("../server/http");

/**
 *
 * @type {FaModule}
 */
class FaModule {
	constructor(parent, configuration) {
		// server.console.log(parent);
		// server.console.log(parent instanceof FaSocketClass, parent instanceof FaHttpClass);
		// server.console.warn(parent.HttpServer !== undefined, parent.SocketIo !== undefined);
		let folder;
		folder = parent.HttpServer !== undefined ? "controllers" : "sockets";
		console.warn(folder);
		this._controller_list = {};
		for (const [key, value] of Object.entries(configuration["routes"])) {
			let namespace = value['namespace'] ? `${process.cwd()}/${value["namespace"]}` : `${process.cwd()}/${configuration["namespace"]}`;
			let path = `${namespace}/controllers/${value["controller"]}.js`;
			if (FaFile.existFilename(path)) {
				let Controller = this._controllerLoad(parent, path, namespace);
				if (Controller[value["action"]]) {
					parent.Router.attach(key, function (req) {
						console.info(value["action"]);
						console.warn(req);
						return Controller[value["action"]](req);
					});
				} else {
					console.error(FaError.pickTrace(`${value["controller"]} action not implemented: ${value["action"]}`, 2));
				}
			} else {
				console.error(FaError.pickTrace(`${value["controller"]} controller not found: ${path}`, 2));
			}
		}
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
	_controllerFind(index) {
		return !!this._controller_list[index];
	}

	_controllerLoad(parent, path, namespace) {
		if (this._controllerFind(path) === false) {
			// let ControllerHttp = FaFile.readStringSync(`${namespace}/controllers/${value["controller"]}.js`);
			// server.console.log(File);
			let ControllerClass = require(path);
			let Controller = new ControllerClass(parent, namespace);
			this._controllerSet(path, Controller);
			return Controller;
		} else {
			return this._controllerGet(path);
		}
	}

	/**
	 *
	 * @param FaHttpClass {FaHttpClass}
	 * @param configuration {Object}
	 */
	// handleHttpRoutes(FaHttpClass, configuration) {
	// 	for (const [key, value] of Object.entries(configuration["routes"])) {
	// 		let namespace = value['namespace'] ? `${process.cwd()}/${value["namespace"]}` : `${process.cwd()}/${configuration["namespace"]}`;
	// 		let path = `${namespace}/controllers/${value["controller"]}.js`;
	// 		if (FaFile.existFilename(path)) {
	// 			let Controller = this._controllerLoad(FaHttpClass, path, namespace);
	// 			if (Controller[value["action"]]) {
	// 				FaHttpClass.Router.attach(key, function (req) {
	// 					server.console.error(value["action"]);
	// 					return Controller[value["action"]](req);
	// 				});
	// 			} else {
	// 				server.console.error(FaError.pickTrace(`${value["controller"]} action not implemented: ${value["action"]}`, 2));
	// 			}
	// 		} else {
	// 			server.console.error(FaError.pickTrace(`${value["controller"]} controller not found: ${path}`, 2));
	// 		}
	// 	}
	// }
	handleSocketRoutes(FaHttpClass, configuration) {
		console.error(arguments);
	}
}

/**
 *
 * @return {FaModule}
 * @param parent
 * @param configuration
 */
module.exports = function (parent, configuration) {
	if (parent && configuration) {
		return new FaModule(parent, configuration);
	} else {
		return FaModule;
	}
};
