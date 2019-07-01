"use strict";
/*fa*/
/** @member {Class|FaTrace} */
const FaTrace = require("fa-nodejs/base/trace");
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
		this._regularLayoutMethod = new RegExp("^[a-z][a-z0-9-]+[a-z0-9]$");
		this._FaFile = new FaFile();
		this._FaHttp = http;
		this._FaSocket = socket;
		this._path = path;
		this._module_list = {};
		this._layout_list = {};
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

	get layouts() {
		return Object.keys(this._layout_list);
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
			if (self._FaFile.isDirectory(`${self._path}/modules/${moduleKey}`)) {
				self._module_list[moduleKey] = moduleValue;
				if (moduleValue["layout"]) {
					self._loadLayout(moduleValue["layout"]);
				} else {
					throw new FaError(`layout not set for module: ${moduleKey}`);
				}
				self._loadRoutes(moduleKey, moduleValue, routes[moduleKey]);
			}
		});
	}

	_loadRoutes(moduleKey, moduleValue, routes) {
		let self = this;
		let route;
		let pathname = `${self._path}/modules/${moduleKey}`;
		if (routes) {
			Object.entries(routes).forEach(function ([routeKey, routeValue]) {
				route = {
					uri: routeKey,
					module: moduleKey,
					layout: routeValue["layout"] ? routeValue["layout"] : moduleValue["layout"],
					render: routeValue["render"] ? routeValue["render"] : moduleValue["render"],
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
				route = {
					uri: `/${route_list.reverse().join("/")}`,
					module: moduleKey,
					layout: moduleValue["layout"],
					render: moduleValue["render"],
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
		if (module.layout) {
			console.error(FaTrace.trace());
		}
		let match = module.match(this._regularControllerName);
		if (match) {
			return `${this._path}/layouts/${module.split("-").map(item => item.capitalize()).join("")}Layout.js`;
		} else {
			return null;
		}
	}

	_getLayoutMethod(action) {
		let match = action.match(this._regularLayoutMethod);
		if (match) {
			return `render${match[0].split("-").map(item => item.capitalize()).join("")}`;
		} else {
			throw new Error(`wrong layout action: ${action}`);
		}
	}

	_loadLayout(layout) {
		let path = this._getLayoutFilename(layout);
		if (!!this._layout_list[layout]) {
			return this._layout_list[layout];
		} else if (this._FaFile.isFile(path)) {
			let Layout = require(path);
			this._layout_list[layout] = new Layout();
			return this._layout_list[layout];
		} else {
			throw new FaError(`layout not found: ${path}`);
		}
	}

	_getControllerFilename(module, controller) {
		let match = controller.match(this._regularControllerName);
		if (match) {
			return `${this._path}/modules/${module}/controllers/${controller.split("-").map(item => item.capitalize()).join("")}Controller.js`;
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
			throw new Error(`wrong controller action: ${action}`);
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
		let path = this._getControllerFilename(module, controller);
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
		let {uri, module, layout, render, controller, action} = route;
		if (!this._route_list[this._getRouteIndex(route)]) {
			this._route_list[this._getRouteIndex(route)] = route;
		}
		// this._route_list[this._getRouteIndex(route)] = route;
		let Controller = this._loadController(module, controller);
		let controllerAction = this._getControllerMethod(action);
		if (Controller[controllerAction]) {
			this._FaHttp.Router.attach(uri, async function () {
				let data = await Controller[controllerAction].apply(Controller, arguments);
				if (data && data["type"] === "layout") {
					let Layout = self._loadLayout(layout);
					let layoutRender = self._getLayoutMethod(render);
					if (Layout[layoutRender]) {
						return Layout[layoutRender].call(Layout, data);
					} else {
						throw new FaError(`${layoutRender} not implemented in ${self._getLayoutFilename(module)}`);
					}
				} else {
					return data;
				}
			});
		} else {
			throw new FaError(`${controllerAction} not implemented in ${this._getControllerFilename(module, controller)}`);
		}
		// }
	}
}

/**
 *
 * @type {FaApplicationModule}
 */
module.exports = FaApplicationModule;
