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
		this._regularControllerFilename = new RegExp(`^([A-Z][A-Za-z0-9]+)Controller.js$`);
		this._regularControllerName = new RegExp("[A-Z][^A-Z]*", "g");
		this._FaHttp = http;
		this._FaSocket = socket;
		/**/
		this._server = "server";
		this._server_type = "controller";
		// this._server = server;
		// if (server instanceof FaHttpClass) {
		// 	this._server_type = "controller";
		// } else if (this._server instanceof FaSocketClass) {
		// 	this._server_type = "socket";
		// } else {
		// 	throw new FaError(`wrong server type`);
		// }
		this._FaFile = new FaBaseFile();
		this._path = path;
		this._route_list = {};
		this._controller_list = {};
		// this._loadFromConfiguration();
		// this._loadFromDirectory();
		// this._serveRoutes();
		this.readDefaultRoutes();
	}

	readDefaultRoutes() {
		let self = this;
		Object.entries(this.configuration.modules).forEach(function ([key, value]) {
			// console.warn(key, value);
			let module = value["name"];
			let path = value["path"];
			// console.error(path);
			let controllers = self._readModuleControllers(value);
			// console.error(controllers);
		})
	}

	_getControllerName(controller) {
		let match = controller.match(this._regularControllerFilename);
		if (match) {
			return match[1].match(this._regularControllerName).join("-").toLowerCase();
		} else {
			return null;
		}
	}

	_readModuleControllers(module) {
		let self = this;
		let modulePath = module["path"];
		let moduleName = module["name"];
		let controllersPath = `${modulePath}/controllers`;
		// console.info(module);
		if (self._FaFile.isDirectory(modulePath)) {
			return this._FaFile.readDirectorySync(controllersPath).map(function (controller) {
				// console.error(controller)
				return self._getControllerName(controller);
			}).filter(item => item).map(function (controller) {
				console.error(`${modulePath}/controllers/${controller}`);
				self._loadModuleController(moduleName, controller);
			});
		}
		// if (controllerFilename) {
		// 		self._loadModuleController(`${path}/${controller}`);
		// 	if (self._FaFile.isFile(`${path}/${controller}`)) {
		// 		let ControllerClass = require(`${path}/${controller}`);
		// 		self._controller_list[`${path}/${controller}`] = new ControllerClass(self._FaHttp, path);
		// 		// let methods = self._readMethods(self._loadModuleController(module, controller));
		// 		// let methods = (self._loadModuleController(module, controller));
		//
		//
		//
		// 	}
		// }
		// return {[controller]: self._getControllerName(controller)};
	}

	_getControllerFilename(controller) {
		let match = controller.match(this._regularControllerFilename);
		if (match) {
			return match[1].match(this._regularControllerName).join("-").toLowerCase();
		} else {
			return null;
		}
	}

	_loadModuleController(module, controller) {
		// console.warn(module, controller);
		let path = `${this._path}/modules/${module}/controllers/${this.controllerNameToFilename(controller)}`;
		if (!!this._controller_list[path]) {
			return this._controller_list[path];
		} else if (this._FaFile.isFile(path)) {
			let ControllerClass = require(path);
			// this._controller_list[path] = new ControllerClass(this._FaHttp, `${this._path}/modules/${module}/views/${controller}`);
			this._controller_list[path] = new ControllerClass(this._FaHttp);
			return this._controller_list[path];
		} else {
			throw new FaError(`controller not found: ${path}`);
		}
	}

	/*
	*
	*
	*
	*
	*
	*
	*
	*
	* */
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

	controllerFilenameToName(controller) {
		let regular_filename = new RegExp(`^([A-Z][^-]+)${this._server_type.capitalize()}\.js$`);
		let regular_name = new RegExp("[A-Z][^A-Z]*", "g");
		let match_filename = controller.match(regular_filename);
		if (match_filename) {
			return match_filename[1].match(regular_name).join("-").toLowerCase();
		} else {
			return null;
		}
	}

	controllerNameToFilename(controller) {
		let pattern = new RegExp("[^-]+", "g");
		let match = controller.match(pattern);
		if (match) {
			return `${match.map(item => item.capitalize()).join("")}${this._server_type.capitalize()}.js`;
		} else {
			return null;
		}
	}

	controllerMethodToAction(method) {
		let regular_method = new RegExp("^action([A-Z][^-]+)$");
		let regular_action = new RegExp("[A-Z][^A-Z]*", "g");
		let match_method = method.match(regular_method);
		if (match_method) {
			return match_method[1].match(regular_action).join("-").toLowerCase();
		} else {
			return null
		}
	}

	controllerActionToMethod(action) {
		let regular = new RegExp("[^-]+", "g");
		let match = action.match(regular);
		if (match) {
			return `action${match.map(item => item.capitalize()).join("")}`;
		} else {
			return null;
		}
	}

	/**
	 *
	 * @param path
	 * @return {*}
	 * @private
	 */
	_readModules(path) {
		let self = this;
		if (this._FaFile.isDirectory(path)) {
			return this._FaFile.readDirectorySync(path).reduce(function (result, item) {
				if (self._FaFile.isDirectory(`${path}/${item}`)) {
					result.push(item);
				}
				return result;
			}, []);
		} else {
			return [];
		}
	}

	/**
	 *
	 * @param path
	 * @return {*}
	 * @private
	 */
	_readControllers(path) {
		let self = this;
		if (this._FaFile.isDirectory(path)) {
			return this._FaFile.readDirectorySync(path).reduce(function (result, item) {
				let controller = self.controllerFilenameToName(item);
				if (self._FaFile.isFile(`${path}/${item}`) && controller) {
					result.push(controller);
				}
				return result;
			}, []);
		} else {
			return [];
		}
	}

	/**
	 *
	 * @param controller
	 * @return {Array}
	 * @private
	 */
	_readMethods(controller) {
		let context = this;
		return Reflect.ownKeys(Reflect.getPrototypeOf(controller)).reduce(function (result, item) {
			let method = context.controllerMethodToAction(item);
			if (method) {
				result.push(method);
			}
			return result;
		}, []);
	}

	/**
	 *
	 * @param module
	 * @param controller
	 * @return {*}
	 * @private
	 */
	_loadController(module, controller) {
		let path = `${this._path}/modules/${module}/${this._server_type}s/${this.controllerNameToFilename(controller)}`;
		if (!!this._controller_list[path]) {
			return this._controller_list[path];
		} else if (this._FaFile.isFile(path)) {
			let ControllerClass = require(path);
			this._controller_list[path] = new ControllerClass(this._server, `${this._path}/modules/${module}/views/${controller}`);
			// this._controller_list[path] = new ControllerClass(this._server);
			return this._controller_list[path];
		} else {
			throw new FaError(`controller not found: ${path}`);
		}
	}

	/**
	 *
	 * @private
	 */
	_loadFromDirectory() {
		let self = this;
		let result = {};
		this._readModules(`${self._path}/modules`).forEach(function (module) {
			self._readControllers(`${self._path}/modules/${module}/${self._server_type}s`).forEach(function (controller) {
				let methods = self._readMethods(self._loadController(module, controller));
				methods.forEach(function (action) {
					let before = [module, controller, action];
					let after = [];
					while (before.length > 0) {
						let item = before.pop();
						after.push(item);
						if (item === "index" && after.every(item => (item === "index"))) {
							self._route_list[`${module}/${controller}/${action}`] = {
								module: module,
								path: `/${before.join("/")}`,
								controller: controller,
								action: action,
							};
						}
					}
					if (Object.keys(self._route_list).omit(`${module}/${controller}/${action}`)) {
						self._route_list[`${module}/${controller}/${action}`] = {
							module: module,
							path: `/${module}/${controller}/${action}`,
							controller: controller,
							action: action,
						};
					}
				});
			});
		});
		return result;
	}

	/**
	 *
	 * @private
	 */
	_loadFromConfiguration() {
		let configurationPath = `${this._path}/config/${this._server_type}s.js`;
		if (this._FaFile.isFile(configurationPath)) {
			let configuration = require(configurationPath);
			for (let modules = Object.keys(configuration), i = 0, end = modules.length - 1; i <= end; i++) {
				let module = modules[i];
				for (let routes = Object.keys(configuration[module]), j = 0, end = routes.length - 1; j <= end; j++) {
					let path = routes[j];
					let controller = configuration[module][path]["controller"];
					let action = configuration[module][path]["action"];
					if (Object.keys(this._route_list).omit(`${module}/${controller}/${action}`)) {
						this._route_list[`${module}/${controller}/${action}`] = {
							module: module,
							path: path,
							controller: controller,
							action: action,
						};
					}
				}
			}
		}
	}

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
