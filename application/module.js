"use strict";
/*fa-nodejs*/
const FaError = require("fa-nodejs/base/error");
const FaBaseFile = require("fa-nodejs/base/file");
// const FaBaseTrace = require("fa-nodejs/base/trace");
const FaHttpClass = require("fa-nodejs/server/http");
const FaSocketClass = require("fa-nodejs/server/socket");
const FaApplicationConfiguration = require("fa-nodejs/application/application-configuration");

class FaApplicationModule {
	/**
	 *
	 * @param path {string}
	 * @param http {FaServerHttp}
	 * @param socket {FaServerSocket}
	 */
	constructor(path, http, socket) {
		// console.info(path);
		this._configuration = new FaApplicationConfiguration(path);
		// this._regularControllerFilename = new RegExp(`^([A-Z][A-Za-z0-9]+)Controller.js$`);
		// this._regularPascalCase = new RegExp("[A-Z][^A-Z]*", "g");
		this._regularControllerFilename = new RegExp(`^([A-Z][A-Za-z0-9]+)Controller.js$`);
		this._regularControllerName = new RegExp("^[a-z][a-z0-9-]+$");
		this._regularControllerMethod = new RegExp("^[a-z][a-z0-9-]+[a-z0-9]$");
		this._regularControllerAction = new RegExp("^action([A-Z][A-Za-z0-9]+)$");
		this._FaFile = new FaBaseFile();
		this._FaHttp = http;
		this._FaSocket = socket;
		// this._server = server;
		// if (server instanceof FaHttpClass) {
		// 	this._server_type = "controller";
		// } else if (this._server instanceof FaSocketClass) {
		// 	this._server_type = "socket";
		// } else {
		// 	throw new FaError(`wrong server type`);
		// }
		this._path = path;
		this._controller_list = {};
		this._route_list = this.configuration.routes;
		// this._loadFromConfiguration();
		// this._loadFromDirectory();
		// this._serveRoutes();
		this.readDefaultRoutes();
	}

	test() {
		let self = this;
		let controllers = [
			"Index-sController.js",
			"Index1T1TestController.js",
			"IndexTestController.js",
			"Index01K_1K__2Controller.js",
			"I0ndexController.js",
			"Index_TestController.js",
		];
		let controllersName = controllers.map(function (controller) {
			return self._getControllerName(controller);
		}).filter(item => item);
		// console.info(controllersName);
		/**/
		let controllersFilename = controllersName.map(function (controller) {
			return self._getControllerFilename(controller);
		}).filter(item => item);
		// console.info(controllersFilename);
		/**/
		let actions = [
			"index",
			"index1-test",
			"a-_index",
			"a-index-test",
			"a0-aa-ad-index",
			"ss-as-_1",
		];
		/**/
		let actionsName = actions.map(function (action) {
			return self._getControllerMethod(action);
		}).filter(item => item);
		console.info(actionsName);
		let methodsName = actionsName.map(function (action) {
			return self._getControllerAction(action);
		}).filter(item => item);
		console.info(methodsName);
	}

	/**
	 *
	 * @return {FaApplicationConfiguration}
	 */
	get configuration() {
		return this._configuration;
	}

	/**
	 *
	 * @return {string[]}
	 */
	get controllers() {
		return Object.keys(this._controller_list);
	}

	/**
	 *
	 * @return {string[]}
	 */
	get routes() {
		return Object.keys(this._route_list);
	}

	readDefaultRoutes() {
		let self = this;
		Object.entries(this.configuration.modules).forEach(function ([key, value]) {
			let module = key;
			let modulePath = value["path"];
			let moduleName = value["name"];
			let moduleAppearance = value["appearance"];
			let controllersPath = `${modulePath}/controllers`;
			if (self._FaFile.isDirectory(modulePath)) {
				return self._FaFile.readDirectorySync(controllersPath).map(function (controllerFilename) {
					return controllerFilename.match(self._regularControllerFilename) ? controllerFilename : null;
				}).filter(item => item).map(function (controllerFilename) {
					// console.info(controllerFilename);
					let controller = self._getControllerName(controllerFilename);
					let controllerPath = `${modulePath}/controllers/${controllerFilename}`;
					let controllerClass = self._loadModuleController(controllerPath);
					let controllerMethods = self._getControllerMethods(controllerClass);
					// console.error(controllerFilename, controller, methods);
					controllerMethods.forEach(function (action) {
						let result = [];
						let check = true;
						let check_list = [module, controller, action];
						while (check_list.length > 0) {
							let index_item = check_list.pop();
							if (check === true) {
								if (index_item !== "index") {
									check = false;
									result.push(index_item);
								}
							} else {
								result.push(index_item);
							}
						}
						let route = `/${result.reverse().join("/")}`;
						self._storeRoute(`${module}/${controller}/${action}`, {
							route: route,
							module: moduleName,
							controller: controller,
							action: action,
							appearance: moduleAppearance,
						});
					});
				});
			}
		})
	}

	_storeRoute(index, route) {
		if (Object.keys(this._route_list).omit(index)) {
			this._route_list[index] = route;
		}
	}

	_getControllerFilename(controller) {
		let match = controller.match(this._regularControllerName);
		if (match) {
			return `${controller.split("-").map(item => item.capitalize()).join("")}Controller.js`;
		} else {
			return null;
		}
	}

	_getControllerName(controller) {
		let match = controller.match(this._regularControllerFilename);
		if (match) {
			return match[1].split(/(?=[A-Z])/).join("-").toLowerCase();
		} else {
			return null;
		}
	}

	_getControllerMethod(action) {
		let match = action.match(this._regularControllerMethod);
		if (match) {
			return `action${match[0].split("-").map(item => item.capitalize()).join("")}`;
		} else {
			// throw new Error(`wrong action: ${action}`);
			// return `wrong action: ${action}`;
			return null;
		}
	}

	_getControllerAction(method) {
		this._regularControllerAction = new RegExp("^action([A-Z][A-Za-z0-9_]+)$");
		let match = method.match(this._regularControllerAction);
		if (match) {
			return match[1].split(/(?=[A-Z])/).join("-").toLowerCase();
		} else {
			return null
		}
	}

	_loadModuleController(index) {
		if (!!this._controller_list[index]) {
			return this._controller_list[index];
		} else if (this._FaFile.isFile(index)) {
			let ControllerClass = require(index);
			// 	// this._controller_list[path] = new ControllerClass(this._FaHttp, `${this._path}/modules/${module}/views/${controller}`);
			this._controller_list[index] = new ControllerClass(this._FaHttp);
			return this._controller_list[index];
		} else {
			throw new FaError(`controller not found: ${index}`);
		}
	}

	/**
	 *
	 * @param controller
	 * @return {Array}
	 * @private
	 */
	_getControllerMethods(controller) {
		let self = this;
		return Reflect.ownKeys(Reflect.getPrototypeOf(controller)).reduce(function (result, item) {
			let method = self._getControllerAction(item);
			console.error(method)
			if (method) {
				result.push(method);
			}
			return result;
		}, []);
	}

	// controllerActionToMethod(action) {
	// 	let regular = new RegExp("[^-]+", "g");
	// 	let match = action.match(regular);
	// 	if (match) {
	// 		return `action${match.map(item => item.capitalize()).join("")}`;
	// 	} else {
	// 		return null;
	// 	}
	// }
	/**
	 *
	 * @private
	 */
	_serveRoutes() {
		for (let list = Object.keys(this._route_list), i = 0, end = list.length - 1; i <= end; i++) {
			let index = list[i];
			let path = this._route_list[index]["path"];
			let module = this._route_list[index]["module"];
			let controller = this._route_list[index]["controller"];
			let action = this.controllerActionToMethod(this._route_list[index]["action"]);
			let Controller = this._loadController(module, controller);
			if (Controller[action]) {
				this._server.Router.attach(path, function () {
					let res = Controller[action].apply(Controller, arguments);
					// console.log(path, module, controller, action, self._route_list[index]);
					return res;
				});
			} else {
				throw new FaError(`action not implemented: ${this._path}/${module}/controllers/${this.controllerNameToFilename(controller)}->${action}()`);
			}
		}
	}
}

/**
 *
 * @type {FaApplicationModule}
 */
module.exports = FaApplicationModule;
