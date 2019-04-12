"use strict";
/*fa-nodejs*/
const FaError = require("fa-nodejs/base/error");
const FaBaseFile = require("fa-nodejs/base/file");
// const FaBaseTrace = require("fa-nodejs/base/trace");
const FaHttpClass = require("fa-nodejs/server/http");
const FaSocketClass = require("fa-nodejs/server/socket");

class FaApplicationModule {
	/**
	 *
	 * @param path {string}
	 * @param http {FaServerHttp}
	 * @param socket {FaServerSocket}
	 */
	constructor(path, http, socket) {
		// console.info(path);
		// this._configuration = require(`${path}/config/application.js`);
		// this._configuration = new FaApplicationConfiguration(path);
		// this._regularControllerFilename = new RegExp(`^([A-Z][A-Za-z0-9]+)Controller.js$`);
		// this._regularPascalCase = new RegExp("[A-Z][^A-Z]*", "g");
		this._regularControllerFilename = new RegExp(`^([A-Z][A-Za-z0-9]+)Controller.js$`);
		this._regularControllerName = new RegExp("^[a-z][a-z0-9-]+$");
		this._regularControllerMethod = new RegExp("^[a-z][a-z0-9-]+[a-z0-9]$");
		this._regularControllerAction = new RegExp("^action([A-Z][A-Za-z0-9]+)$");
		this._FaFile = new FaBaseFile();
		this._FaHttp = http;
		this._FaSocket = socket;
		this._path = path;
		this._module_list = {};
		this._route_list = {};
		this._controller_list = {};
		// this._route_list = this.configuration.routes;
		// this._loadFromConfiguration();
		// this._loadFromDirectory();
		// this._serveRoutes();
		// this.readConfigurationRoutes();
		this._loadConfiguration(require(`${path}/config/application.js`));
		// this.readModuleRoutes();
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

	get modules() {
		return Object.keys(this._module_list);
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

	_loadConfiguration(configuration) {
		let self = this;
		let modules = configuration["modules"];
		let routes = configuration["routes"];
		Object.entries(modules).forEach(function ([moduleKey, moduleValue]) {
			let path = `${self._path}/modules/${moduleKey}`;
			// let module = moduleKey;
			let name = moduleValue["name"];
			let appearance = moduleValue["appearance"];
			let controllersPath = `${path}/controllers`;
			self._module_list[moduleKey] = {
				path: path,
				name: name,
				appearance: appearance,
			};
			if (routes[moduleKey]) {
				Object.entries(routes[moduleKey]).forEach(function ([routeKey, routeValue]) {
					// let controller = routeValue["controller"];
					// let action = routeValue["action"];
					// let appearance = routeValue["appearance"] ? routeValue["appearance"] : appearance;
					self._storeRoute({
						route: routeKey,
						path: path,
						appearance: routeValue["appearance"] ? routeValue["appearance"] : appearance,
						module: moduleKey,
						controller: routeValue["controller"],
						action: routeValue["action"],
					});
				});
			}
			if (self._FaFile.isDirectory(path)) {
				return self._FaFile.readDirectorySync(controllersPath).map(function (controllerFilename) {
					return self._getControllerName(controllerFilename);
				}).filter(item => item).map(function (controller) {
					// console.warn(module, controller)
					let Controller = self._loadController(moduleKey, controller);
					self._readControllerMethods(Controller).forEach(function (action) {
						let route_list = [];
						let check = true;
						let check_list = [moduleKey, controller, action];
						while (check_list.length > 0) {
							let index_item = check_list.pop();
							if (check === true) {
								if (index_item !== "index") {
									check = false;
									route_list.push(index_item);
								}
							} else {
								route_list.push(index_item);
							}
						}
						let route = `/${route_list.reverse().join("/")}`;
						self._storeRoute({
							route: route,
							path: path,
							appearance: appearance,
							module: moduleKey,
							controller: controller,
							action: action,
						});
					});
				});
			}
		})
	}

	_getModuleFilename(module) {
		let match = module.match(this._regularControllerName);
		if (match) {
			return `${module.split("-").map(item => item.capitalize()).join("")}Module.js`;
		} else {
			return null;
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
			return null;
		}
	}

	_getControllerAction(method) {
		let match = method.match(this._regularControllerAction);
		if (match) {
			return match[1].split(/(?=[A-Z])/).join("-").toLowerCase();
		} else {
			return null
		}
	}

	/**
	 *
	 * @param controller
	 * @return {Array}
	 * @private
	 */
	_readControllerMethods(controller) {
		let self = this;
		return Reflect.ownKeys(Reflect.getPrototypeOf(controller)).map(function (method) {
			return self._getControllerAction(method);
		}).filter(item => item);
	}

	_loadController(module, controller) {
		let index = `${module}/${controller}`;
		let path = `${this._path}/modules/${module}/controllers/${this._getControllerFilename(controller)}`;
		if (!!this._controller_list[index]) {
			return this._controller_list[index];
		} else if (this._FaFile.isFile(path)) {
			let ControllerClass = require(path);
			// 	// this._controller_list[path] = new ControllerClass(this._FaHttp, `${this._path}/modules/${module}/views/${controller}`);
			this._controller_list[index] = new ControllerClass(this._FaHttp);
			return this._controller_list[index];
		} else {
			throw new FaError(`controller not found: ${path}`);
		}
	}

	_storeRoute(value) {
		let {route, path, appearance, module, controller, action} = value;
		let index = `${module}/${controller}/${action}`;
		if (Object.keys(this._route_list).omit(index)) {
			this._route_list[index] = value;
			let Controller = this._loadController(module, controller);
			let controllerAction = this._getControllerMethod(action);
			if (Controller[controllerAction]) {
				this._FaHttp.Router.attach(route, function () {
					let res = Controller[controllerAction].apply(Controller, arguments);
					// console.log(res);
					return res;
				});
			} else {
				throw new FaError(`action not implemented in ${path}/controllers/${this._getControllerFilename(controller)}: ${controllerAction}()`);
			}
		}
	}
}

/**
 *
 * @type {FaApplicationModule}
 */
module.exports = FaApplicationModule;
