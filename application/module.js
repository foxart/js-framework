"use strict";
const FaError = require("../base/error");
const FaFile = require("../base/file")();
const FaHttpClass = require("../server/http");
const FaSocketClass = require("../server/socket");
/**
 *
 * @type {module.FaModule}
 */
module.exports = class FaModule {
	/**
	 *
	 * @param server {module.FaHttpClass | module.FaSocketClass}
	 * @param path {string}
	 */
	constructor(server, path) {
		this.name = "FaModule";
		this._server = server;
		this._controller_list = {};
	}

	/**
	 *
	 * @param path {string}
	 */
	serve(path) {
		let modules;
		let type;
		if (this._server instanceof FaHttpClass) {
			modules = require(`${process.cwd()}/${path}/config/FaHttp.js`);
			type = "controller";
		} else if (this._server instanceof FaSocketClass) {
			modules = require(`${process.cwd()}/${path}/config/FaSocket.js`);
			type = "socket";
		} else {
			throw new Error(`wrong server type: ${this._server}`);
		}
		for (let module_keys = Object.keys(modules), i = 0, end = module_keys.length - 1; i <= end; i++) {
			let routes = modules[module_keys[i]];
			if (Object.keys(routes).length) {
				// console.warn(module_keys[i]);
				for (let routes_keys = Object.keys(routes), j = 0, end = routes_keys.length - 1; j <= end; j++) {
					this.attach(`${process.cwd()}/${path}/modules/${module_keys[i]}`, type, routes_keys[j], routes[routes_keys[j]]["controller"], routes[routes_keys[j]]["action"])
				}
			} else {
				console.warn(module_keys[i], `${process.cwd()}/${path}/modules/${module_keys[i]}`);
				this.auto(`${process.cwd()}/${path}/modules/${module_keys[i]}`)
			}
		}
	}


	auto(namespace) {
		let context = this;
		FaFile.readDirectoryAsync(namespace).then(function (items) {
			items.forEach(function (item) {
				console.info(`${namespace}/${item}`);
				if (context.File.isDirectory(`${namespace}/${item}`)) {
					// if (context.File.existFilename(`${item}/${server.folder}`)) {
					let configuration = require(`${context._path}/${item}/${server.folder}.json`);
					for (const [key, value] of Object.entries(configuration["routes"])) {
						let namespace = value['namespace'] ? `${process.cwd()}/${value["namespace"]}` : `${process.cwd()}/${configuration["namespace"]}`;
						let path = `${namespace}/${server.folder}/${value["controller"]}.js`;
						if (FaFile.existFilename(path)) {
							let Controller = context._load(path, namespace);
							if (Controller[value["action"]]) {
								server.Router.attach(key, function () {
									return Controller[value["action"]].apply(Controller, arguments);
								});
							} else {
								console.error(FaError.pickTrace(`not implemented controller action: <${path}->${value["action"]}()>`, 3));
							}
						} else {
							console.error(FaError.pickTrace(`not found controller: <${path}>`, 3));
						}
					}
					// }
				}
			})
		}).catch(function (e) {
			console.error(e);
		});
	}

	/**
	 *
	 * @param namespace
	 * @param type
	 * @param route
	 * @param controller
	 * @param action
	 */
	attach(namespace, type, route, controller, action) {
		let path = `${namespace}/${type}s/${controller}.js`;
		let Controller = this._load(namespace, type, controller);
		if (Controller[action]) {
			this._server.Router.attach(route, function () {
				return Controller[action].apply(Controller, arguments);
			});
		} else {
			throw new FaError(`controller action not implemented: ${path}->${action}()`);
		}
	}

	/**
	 *
	 * @param namespace
	 * @param type
	 * @param controller
	 * @return {*}
	 * @private
	 */
	_load(namespace, type, controller) {
		let path = `${namespace}/${type}s/${controller}.js`;
		let Controller;
		let ControllerClass;
		if (this._exist(path)) {
			Controller = this._find(path);
		} else {
			if (FaFile.existFilename(path)) {
				ControllerClass = require(path);
			} else {
				throw new FaError(`controller not found: ${path}`);
			}
			Controller = new ControllerClass(this._server, `${namespace}/views/${controller.toLowerCase().replace(type, "")}`);
			this._set(path, Controller);
		}
		return Controller;
	}

	/**
	 *
	 * @return {string[]}
	 */
	get list() {
		return Object.keys(this._controller_list);
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
	 * @param controller {FaControllerClass}
	 * @private
	 */
	_set(path, controller) {
		this._controller_list[path] = controller;
	}
};
