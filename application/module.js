"use strict";
/*fa-nodejs*/
const FaError = require("fa-nodejs/base/error");
const FaFile = require("fa-nodejs/base/file");
/** @member {Class|FaHttpResponse} */
const FaHttpResponse = require("fa-nodejs/server/http-response");

// const FaBaseTrace = require("fa-nodejs/base/trace");
class FaApplicationModule {
	/**
	 *
	 * @param path {string}
	 * @param http {FaServerHttp}
	 * @param socket {FaServerSocket}
	 */
	constructor(path, http, socket) {
		this._regularControllerFilename = new RegExp(`^([A-Z][A-Za-z0-9]+)Controller.js$`);
		this._regularControllerName = new RegExp("^[a-z][a-z0-9-]+$");
		this._regularControllerMethod = new RegExp("^[a-z][a-z0-9-]+[a-z0-9]$");
		this._regularControllerAction = new RegExp("^action([A-Z][A-Za-z0-9]+)$");
		this._FaFile = new FaFile();
		this._FaHttp = http;
		this._FaSocket = socket;
		this._path = path;
		this._module_list = {};
		this._presentation_list = {};
		this._route_list = {};
		this._controller_list = {};
		this._loadModules(require(`${path}/config/application.js`));
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
		console.info("controllersName", controllersName);
		/**/
		let controllersFilename = controllersName.map(function (controller) {
			return self._getControllerFilename(controller);
		}).filter(item => item);
		console.info("controllersFilename", controllersFilename);
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
		console.info("actionsName", actionsName);
		let methodsName = actionsName.map(function (action) {
			return self._getControllerAction(action);
		}).filter(item => item);
		console.info("methodsName", methodsName);
	}

	get modules() {
		return Object.keys(this._module_list);
	}

	get presentations() {
		return Object.keys(this._presentation_list);
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

	_loadModules(configuration) {
		let self = this;
		let modules = configuration["modules"];
		let routes = configuration["routes"];
		Object.entries(modules).forEach(function ([moduleKey, moduleValue]) {
			let module = moduleKey;
			let pathname = `${self._path}/modules/${module}`;
			let presentation = moduleValue["presentation"];
			if (self._FaFile.isDirectory(`${self._path}/modules/${module}`)) {
				self._module_list[module] = {
					// pathname: pathname,
					// name: name,
					presentation: presentation,
				};
				if (moduleValue["presentation"]) {
					// console.info(moduleValue);
					// let path = `${self._path}/presentations/${module}/${self._getControllerFilename(module)}`;
					// let PresentationClass = require(path);
					// self._presentation_list[module] = new PresentationClass();
					self._loadLayout(module, moduleValue["presentation"]["controller"]);
					// console.warn(Controller);
				} else {
					throw new FaError(`presentation not set for module: ${module}`);
				}
				self._loadRoutes(module, presentation, routes[module]);
			}
		});
	}

	_loadRoutes(module, presentation, routes) {
		let self = this;
		let route;
		let pathname = `${self._path}/modules/${module}`;
		if (routes) {
			Object.entries(routes).forEach(function ([routeKey, routeValue]) {
				route = {
					uri: routeKey,
					pathname: pathname,
					presentation: routeValue["presentation"] ? routeValue["presentation"] : presentation,
					module: module,
					controller: routeValue["controller"],
					action: routeValue["action"],
				};
				self._storeRoute(route);
			});
		}
		self._FaFile.readDirectorySync(`${pathname}/controllers`).map(function (controllerFilename) {
			return self._getControllerName(controllerFilename);
		}).filter(item => item).map(function (controller) {
			// console.warn(module, controller)
			let Controller = self._loadController(module, controller);
			self._readControllerMethods(Controller).forEach(function (action) {
				let route_list = [];
				let check = true;
				let check_list = [module, controller, action];
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
				route = {
					uri: `/${route_list.reverse().join("/")}`,
					pathname: pathname,
					presentation: presentation,
					module: module,
					controller: controller,
					action: action,
				};
				if (Object.keys(self._route_list).omit(self._getRouteIndex(route))) {
					self._storeRoute(route);
				} else if (route.uri === "/" && self._FaHttp.Router.exist(route.uri) === false) {
					self._storeRoute(route);
				}
			});
		});
	}

	_getLayoutFilename(module) {
		let match = module.match(this._regularControllerName);
		if (match) {
			return `${module.split("-").map(item => item.capitalize()).join("")}Presentation.js`;
		} else {
			return null;
		}
	}

	_loadLayout(module, controller) {
		let index = `${module}/${controller}`;
		let path = `${this._path}/presentations/${module}/controllers/${this._getLayoutFilename(controller)}`;
		if (!!this._presentation_list[index]) {
			return this._presentation_list[index];
		} else if (this._FaFile.isFile(path)) {
			let Presentation = require(path);
			this._presentation_list[index] = new Presentation();
			return this._presentation_list[index];
		} else {
			throw new FaError(`presentation not found: ${path}`);
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
			// console.info(index, `${this._path}/modules/${module}/views/${controller}`);
			let ControllerClass = require(path);
			this._controller_list[index] = new ControllerClass(this._FaHttp);
			return this._controller_list[index];
		} else {
			throw new FaError(`controller not found: ${path}`);
		}
	}

	// noinspection JSMethodCanBeStatic
	_getRouteIndex(data) {
		let {module, controller, action} = data;
		// return `${uri}@${module}/${controller}/${action}`;
		return `${module}/${controller}/${action}`;
	}

	_storeRoute(route) {
		let self = this;
		let {uri, pathname, presentation, module, controller, action} = route;
		this._route_list[this._getRouteIndex(route)] = route;
		let Controller = this._loadController(module, controller);
		let controllerAction = this._getControllerMethod(action);
		if (Controller[controllerAction]) {
			this._FaHttp.Router.attach(uri, function () {
				let data = Controller[controllerAction].apply(Controller, arguments);
					// console.info(data);
				if (FaHttpResponse.check(data) === false) {
					console.info(false);
					return data;
				} else {
					console.info(true);
					let Presentation = self._loadLayout(presentation["controller"], presentation["action"]);
					return Presentation["renderIndex"].call(Presentation, data);
				}
				// console.warn(presentation);
				// return res;
			});
		} else {
			throw new FaError(`action not implemented in ${pathname}/controllers/${this._getControllerFilename(controller)}: ${controllerAction}()`);
		}
		// if (Object.keys(this._route_list).omit(index)) {
		// } else if (uri === "/") {
		// console.error(uri, presentation);
		// console.error(uri, index);
		// }
	}
}

/**
 *
 * @type {FaApplicationModule}
 */
module.exports = FaApplicationModule;
