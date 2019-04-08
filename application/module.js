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
	 * @param server {FaServerHttp|module.FaSocketClass}
	 * @param path {string}
	 */
	constructor(server, path) {
		this._server = server;
		if (server instanceof FaHttpClass) {
			this._server_type = "controller";
		} else if (this._server instanceof FaSocketClass) {
			this._server_type = "socket";
		} else {
			throw new FaError(`wrong server type`);
		}
		this._FaBaseFile = new FaBaseFile();
		this._path = path;
		this._controller_list = {};
		this._routes_list = {};
		this._loadFromConfiguration();
		this._loadFromDirectory();
		this._serve();
	}

	/**
	 *
	 * @return {string[]}
	 */
	get list() {
		return Object.keys(this._controller_list);
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
		if (this._FaBaseFile.isDirectory(path)) {
			return this._FaBaseFile.readDirectorySync(path).reduce(function (result, item) {
				if (self._FaBaseFile.isDirectory(`${path}/${item}`)) {
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
		if (this._FaBaseFile.isDirectory(path)) {
			return this._FaBaseFile.readDirectorySync(path).reduce(function (result, item) {
				let controller = self.controllerFilenameToName(item);
				if (self._FaBaseFile.isFile(`${path}/${item}`) && controller) {
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
		if (this._exist(path)) {
			return this._find(path);
		} else if (this._FaBaseFile.isFile(path)) {
			let ControllerClass = require(path);
			// this._controller_list[path] = new ControllerClass(this._server, `${this._path}/modules/${module}/views/${controller}`);
			this._controller_list[path] = new ControllerClass(this._server);
			return this._find(path);
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
			console.log(module);
			if (!self._routes_list[module]) {
				self._routes_list[module] = {};
			}
			// let module = self._routes_list[folder];
			self._readControllers(`${self._path}/modules/${module}/${self._server_type}s`).forEach(function (controller) {
				let methods = self._readMethods(self._loadController(module, controller));
				methods.forEach(function (action) {
					let before = [module, controller, action];
					let after = [];
					while (before.length > 0) {
						let item = before.pop();
						after.push(item);
						if (item === "index" && after.every(item => (item === "index"))) {
							// console.error(`${module}`,`/${before.join("/")}`);
							self._routes_list[module][`/${before.join("/")}`] = {
								controller: controller,
								action: action,
							};
						}
					}
					self._routes_list[module][`/${module}/${controller}/${action}`] = {
						controller: controller,
						action: action,
					};
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
		let path = `${this._path}/config/${this._server_type}s.js`;
		if (this._FaBaseFile.isFile(path)) {
			let configuration = require(path);
			for (let modules = Object.keys(configuration), i = 0, end = modules.length - 1; i <= end; i++) {
				let module = modules[i];
				if (!this._routes_list[module]) {
					this._routes_list[module] = {};
				}
				for (let routes = Object.keys(configuration[modules[i]]), j = 0, end = routes.length - 1; j <= end; j++) {
					let route = routes[j];
					if (!this._routes_list[module][route]) {
						this._routes_list[module][route] = {
							controller: configuration[module][route]["controller"],
							action: configuration[module][route]["action"],
						};
					}
				}
			}
		}
	}

	/**
	 *
	 * @param path
	 * @return {*}
	 * @private
	 */
	_find(path) {
		return this._controller_list[path];
	}

	/**
	 *
	 * @param path {string}
	 * @return {boolean}
	 * @private
	 */
	_exist(path) {
		return !!this._controller_list[path];
	}

	/**
	 *
	 * @private
	 */
	_serve() {
		let self = this;
		for (let modules = Object.keys(this._routes_list), i = 0, end = modules.length - 1; i <= end; i++) {
			let module = modules[i];
			for (let routes = Object.keys(this._routes_list[modules[i]]), j = 0, end = routes.length - 1; j <= end; j++) {
				let route = routes[j];
				let controller = this._routes_list[module][route]["controller"];
				// console.info(this._routes_list[module][route]);
				let action = this.controllerActionToMethod(this._routes_list[module][route]["action"]);
				// console.info({route, module, controller, [action]: this._routes_list[module][route]["action"]});
				let Controller = this._loadController(module, controller);
				if (Controller[action]) {
					this._server.Router.attach(route, function () {
						let res = Controller[action].apply(Controller, arguments);
						console.log(route, module, controller, action, self._routes_list[module][route]);
						return res;
					});
				} else {
					throw new FaError(`action not implemented: ${this._path}/${module}/controllers/${this.controllerNameToFilename(controller)}->${action}()`);
				}
			}
		}
	}
}

/**
 *
 * @type {FaApplicationModule}
 */
module.exports = FaApplicationModule;
