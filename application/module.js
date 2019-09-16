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
	 * @param pathname {string}
	 * @param FaHttp {FaServerHttp}
	 * @param FaSocket {FaServerSocket}
	 */
	constructor(pathname, FaHttp, FaSocket) {
		this._regularAssetFilename = new RegExp(`^([A-Z][A-Za-z0-9_]+)Asset.js$`);
		this._regularAssetName = new RegExp("^[a-z][a-z0-9-_]+$");
		this._regularControllerFilename = new RegExp(`^([A-Z][A-Za-z0-9_]+)Controller.js$`);
		this._regularControllerName = new RegExp("^[a-z][a-z0-9-_]+$");
		this._regularControllerMethod = new RegExp("^[a-z][a-z0-9-_]+[a-z0-9]$");
		this._regularControllerAction = new RegExp("^action([A-Z][A-Za-z0-9_]+)$");
		this._regularLayoutMethod = new RegExp("^[a-z][a-z0-9-]+[a-z0-9]$");
		this._FaFile = new FaFile();
		this._FaHttp = FaHttp;
		this._FaSocket = FaSocket;
		this._pathname = pathname;
		this._module_list = {};
		this._layout_list = {};
		this._route_list = {};
		this._controller_list = {};
		this._loadModules(require(`${pathname}/configuration/application.js`));
		this._loadAssets();
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
		let actions = [
			"index",
			"index1-test",
			"a-_index",
			"a-index-test",
			"a0-aa-ad-index",
			"ss-as-_1",
		];
		/**/
		let controllersName = controllers.map(function (controller) {
			return self._controllerFilenameToName(controller);
		}).filter(item => item);
		let controllersFilename = controllersName.map(function (controller) {
			return self._controllerFilename("index", controller);
		}).filter(item => item);
		console.info("controllersName", controllersName);
		console.info("controllersFilename", controllersFilename);
		/**/
		let actionsName = actions.map(function (action) {
			return self._controllerMethodToAction(action);
		}).filter(item => item);
		let methodsName = actionsName.map(function (action) {
			return self._controllerActionToMethod(action);
		}).filter(item => item);
		console.info("methods", methodsName);
		console.info("actions", actionsName);
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
		// return Object.keys(this._route_list);
		return this._route_list;
	}

	_loadAssets() {
		let self = this;
		this._FaFile.readDirectorySync(`${this._pathname}/assets`).map(function (asset_filename) {
			// console.warn([asset_filename]);
			return self._assetFilenameToName(asset_filename);
		}).filter(item => item).map(function (asset) {
			let path = self._assetNameToFilename(asset);
			if (self._FaFile.isFile(path)) {
				let AssetClass = require(path);
				/** @member {FaAsset} */
				let Asset = new AssetClass();
				// console.info(Asset.css);
				Asset.css.map(function (item) {
					self._FaHttp.asset.attach(Asset.getCssUrl(item), async function () {
						// console.warn([Asset.getCssUrl(item), Asset.getCssPath(item)]);
						return Asset.readCss(item);
					});
				});
				Asset.js.map(function (item) {
					self._FaHttp.asset.attach(Asset.getJsUrl(item), async function () {
						// console.warn([Asset.getJsUrl(item), Asset.getJsPath(item)]);
						return Asset.readJs(item);
					});
				});
				// console.info(Asset.path, Asset.url, Asset.css);
			}
			// console.info(index, `${this._path}/modules/${module}/views/${controller}`);
			// let controllerAction = this._controllerMethodToAction(action);
		});
	}

	_assetFilenameToName(asset) {
		let match = asset.match(this._regularAssetFilename);
		if (match) {
			return match[1].split(/(?=[A-Z])/).join("-").toLowerCase();
		} else {
			return null;
		}
	}

	_assetNameToFilename(asset) {
		let match = asset.match(this._regularAssetName);
		if (match) {
			return `${this._pathname}/assets/${asset.split("-").map(item => item.capitalize()).join("")}Asset.js`;
		} else {
			return null;
		}
	}

	_loadModules(configuration) {
		let self = this;
		let modules = configuration["modules"];
		let routes = configuration["routes"];
		Object.entries(modules).forEach(function ([moduleKey, moduleValue]) {
			if (self._FaFile.isDirectory(`${self._pathname}/modules/${moduleKey}`)) {
				self._module_list[moduleKey] = moduleValue;
				// console.warn(moduleKey, moduleValue);
				//todo rewrite to default not set value
				// self._loadLayout(moduleValue["layout"]);
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
		let pathname = `${self._pathname}/modules/${moduleKey}`;
		if (routes) {
			Object.entries(routes).forEach(function ([routeKey, routeValue]) {
				route = {
					uri: routeKey,
					module: moduleKey,
					// layout: routeValue["layout"] ? routeValue["layout"] : moduleValue["layout"],
					layout: routeValue["layout"] || moduleValue["layout"] || "index",
					// render: routeValue["render"] ? routeValue["render"] : moduleValue["render"],
					render: routeValue["render"] || moduleValue["render"] || "index",
					controller: routeValue["controller"] || "index",
					action: routeValue["action"] || "index",
				};
				self._storeRoute(route);
			});
		}
		self._FaFile.readDirectorySync(`${pathname}/controllers`).map(function (controller_filename) {
			return self._controllerFilenameToName(controller_filename);
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
					layout: moduleValue["layout"] || "index",
					render: moduleValue["render"] || "index",
					controller: controller || "index",
					action: action || "index",
				};
				if (Object.keys(self._route_list).omit(self._getRouteIndex(route))) {
					self._storeRoute(route);
				} else if (route.uri === "/" && self._FaHttp.router.exist(route.uri) === false) {
					self._storeRoute(route);
				}
			});
		});
	}

	_layoutFilename(module) {
		if (module.layout) {
			console.error(FaTrace.trace());
		}
		let match = module.match(this._regularControllerName);
		if (match) {
			return `${this._pathname}/layouts/${module.split("-").map(item => item.capitalize()).join("")}Layout.js`;
		} else {
			return null;
		}
	}

	_layoutMethodToRender(render) {
		// console.log(render, this._regularLayoutMethod);
		let match = render.match(this._regularLayoutMethod);
		if (match) {
			return `render${match[0].split("-").map(item => item.capitalize()).join("")}`;
		} else {
			throw new Error(`wrong layout render: ${render}`);
		}
	}

	_loadLayout(layout) {
		let path = this._layoutFilename(layout);
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

	_controllerFilename(module, controller) {
		let match = controller.match(this._regularControllerName);
		if (match) {
			return `${this._pathname}/modules/${module}/controllers/${controller.split("-").map(item => item.capitalize()).join("")}Controller.js`;
		} else {
			return null;
		}
	}

	_controllerFilenameToName(controller) {
		let match = controller.match(this._regularControllerFilename);
		if (match) {
			return match[1].split(/(?=[A-Z])/).join("-").toLowerCase();
		} else {
			return null;
		}
	}

	_controllerMethodToAction(action) {
		let match = action.match(this._regularControllerMethod);
		if (match) {
			return `action${match[0].split("-").map(item => item.capitalize()).join("")}`;
		} else {
			// throw new Error(`wrong controller action: ${action}`);
			return null;
		}
	}

	_controllerActionToMethod(method) {
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
			return self._controllerActionToMethod(method);
		}).filter(item => item);
	}

	_loadController(module, controller) {
		let index = `${module}/${controller}`;
		let path = this._controllerFilename(module, controller);
		if (!!this._controller_list[index]) {
			return this._controller_list[index];
		} else if (this._FaFile.isFile(path)) {
			// console.info(index, `${this._path}/modules/${module}/views/${controller}`);
			let ControllerClass = require(path);
			// this._controller_list[index] = new ControllerClass(this._FaHttp);
			this._controller_list[index] = new ControllerClass();
			return this._controller_list[index];
		} else {
			throw new FaError(`controller not found: ${path}`);
		}
	}

	_getRouteIndex(data) {
		let {module, controller, action} = data;
		// return `${uri}@${module}/${controller}/${action}`;
		return `${module}/${controller}/${action}`;
	}

	_storeRoute(route) {
		let self = this;
		let {uri, module, layout, render, controller, action} = route;
		if (!this._route_list[this._getRouteIndex(route)]) {
			this._route_list[this._getRouteIndex(route)] = uri;
			// this._uri_list.push(route);
		}
		// this._route_list[this._getRouteIndex(route)] = route;
		let Controller = this._loadController(module, controller);
		let controllerAction = this._controllerMethodToAction(action);
		if (Controller[controllerAction]) {
			this._FaHttp.router.attach(uri, async function (req) {
				// console.info(this);
				let data = await Controller[controllerAction].apply(Controller, arguments);
				// let data = await Controller[controllerAction].call(Controller, req);
				if (data && data["type"] === "layout") {
					let Layout = self._loadLayout(layout);
					let layoutRender = self._layoutMethodToRender(render);
					if (Layout[layoutRender]) {
						return Layout[layoutRender].call(Layout, data);
					} else {
						throw new FaError(`${layoutRender} not implemented in ${self._layoutFilename(module)}`);
					}
				} else {
					return data;
				}
			});
		} else {
			throw new FaError(`${controllerAction} not implemented in ${this._controllerFilename(module, controller)}`);
		}
		// }
	}
}

/**
 *
 * @type {FaApplicationModule}
 */
module.exports = FaApplicationModule;
