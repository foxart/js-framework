"use strict";
/*fa*/
const FaBaseFile = require("fa-nodejs/base/file");

class FaApplicationConfiguration {
	/**
	 *
	 * @param path {string}
	 */
	constructor(path) {
		let configuration = require(`${path}/config/application.js`);
		this._path = path;
		this._regularModulePath = new RegExp("^[a-z][a-z0-9-]+[a-z0-9]$", "g");
		// this._regularControllerFilename = new RegExp(`^([A-Z][A-Za-z0-9]+)Controller.js$`);
		// this._regularControllerName = new RegExp("[A-Z][^A-Z]*", "g");
		this._regularControllerPath = new RegExp("^[a-z][a-z0-9-]+[a-z0-9]$", "g");
		this._regularControllerMethod = new RegExp("^[a-z][a-z0-9-]+[a-z0-9]$", "g");
		this._FaFile = new FaBaseFile();
		this.modules = this.extractModules(configuration.modules);
		this.routes = this.extractRoutes(configuration.routes);
	}

	extractModules(modules) {
		let self = this;
		let result = {};
		Object.entries(modules).forEach(function ([module, value]) {
			let path = self._getModulePath(module, value["name"]);
			result[path] = {
				name: value["name"],
				appearance: value["appearance"],
				path: `${self._path}/modules/${module}`,
			}
		});
		return result;
	}

	// _readModule(module) {
	// 	let self = this;
	// 	let path = `${this._path}/modules/${module}/controllers`;
	// 	if (this._FaFile.isDirectory(path)) {
	// 		// let controllers = this._FaFile.readDirectorySync(path);
	// 		let res = this._FaFile.readDirectorySync(path).map(function (controller) {
	// 			let controllerFilename = self._getControllerName(controller);
	// 			if (controllerFilename) {
	// 				if (self._FaFile.isFile(`${path}/${controller}`)) {
	// 					console.warn(`${path}/${controller}`);
	// 					let ControllerClass = require(`${path}/${controller}`);
	// 				}
	// 			}
	// 			return {[controller]: self._getControllerName(controller)};
	// 		}).filter(item => item);
	// 		/**/
	// 		return res;
	// 		// return this._FaFile.readDirectorySync(path).reduce(function (result, item) {
	// 		// console.warn(result,item);
	// 		// let controller = self.controllerFilenameToName(item);
	// 		// if (self._FaFile.isFile(`${module}/${item}`) && controller) {
	// 		// 	result.push(controller);
	// 		// }
	// 		// return result;
	// 		// }, []);
	// 	} else {
	// 		return [];
	// 	}
	// }

	// _getControllerName(controller) {
	// 	let match = controller.match(this._regularControllerFilename);
	// 	if (match) {
	// 		return match[1].match(this._regularControllerName).join("-").toLowerCase();
	// 	} else {
	// 		return null;
	// 	}
	// }

	_getModulePath(module, name) {
		let match = name.match(this._regularModulePath);
		if (match) {
			return `${this._path}/modules/${module}/${match[0].split("-").map(item => item.capitalize()).join("")}Module.js`;
		} else {
			throw new Error(`wrong module: ${name}`);
		}
	}

	extractRoutes(routes) {
		let self = this;
		let result = {};
		Object.entries(routes).forEach(function ([module, route_list]) {
			Object.entries(route_list).forEach(function ([route, value]) {
				// console.info(route)
				let controller = value["controller"];
				let action = value["action"];
				let appearance = value["appearance"];
				let method = self._getControllerMethod(module, action);
				let path = self._getControllerPath(module, controller);
				if (!result[path]) {
					result[path] = {};
				}
				result[path][route] = {
					controller: controller,
					action: action,
					method: method,
					path: `${self._path}/modules/${module}`,
					appearance: appearance,
				}
			})
		});
		return result;
	}

	_getControllerPath(module, name) {
		let match = name.match(this._regularControllerPath);
		if (match) {
			return `${this._path}/modules/${module}/controllers/${match[0].split("-").map(item => item.capitalize()).join("")}Controller.js`;
		} else {
			throw new Error(`wrong controller: ${name}`);
		}
	}

	_getControllerMethod(module, action) {
		let match = action.match(this._regularControllerMethod);
		if (match) {
			return `action${match[0].split("-").map(item => item.capitalize()).join("")}`;
		} else {
			throw new Error(`wrong action: ${action}`);
		}
	}
}

/**
 *
 * @type {FaApplicationConfiguration}
 */
module.exports = FaApplicationConfiguration;
