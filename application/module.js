"use strict";
const FaError = require("../base/error");
const FaFile = require("../base/file")();

/**
 *
 * @type {FaModule}
 */
class FaModule {
	/**
	 *
	 * @param parent {FaHttpClass | FaSocketClass}
	 * @param configuration
	 */
	constructor(parent, configuration) {
		this._controller_list = {};
		for (const [key, value] of Object.entries(configuration["routes"])) {
			let namespace = value['namespace'] ? `${process.cwd()}/${value["namespace"]}` : `${process.cwd()}/${configuration["namespace"]}`;
			let path = `${namespace}/${parent.folder}/${value["controller"]}.js`;
			if (FaFile.existFilename(path)) {
				let Controller = this._load(parent, path, namespace);
				if (Controller[value["action"]]) {
					parent.Router.attach(key, function () {
						return Controller[value["action"]].apply(Controller, arguments);
					});
				} else {
					console.error(FaError.pickTrace(`not implemented controller action: <${path}->${value["action"]}()>`, 3));
				}
			} else {
				console.error(FaError.pickTrace(`not found controller: <${path}>`, 3));
			}
		}
	}

	get list() {
		return Object.keys(this._controller_list);
	}

	/**
	 *
	 * @param index
	 * @return {*}
	 * @private
	 */
	_get(index) {
		return this._controller_list[index];
	}

	/**
	 *
	 * @param index {string}
	 * @param controller {FaControllerClass}
	 * @private
	 */
	_set(index, controller) {
		this._controller_list[index] = controller;
	}

	/**
	 *
	 * @param index {string}
	 * @return {boolean}
	 * @private
	 */
	_find(index) {
		return !!this._controller_list[index];
	}

	_load(parent, path, namespace) {
		if (this._find(path) === false) {
			let ControllerClass = require(path);
			let Controller = new ControllerClass(parent, namespace);
			this._set(path, Controller);
			return Controller;
		} else {
			return this._get(path);
		}
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
