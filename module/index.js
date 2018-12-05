"use strict";
const FaFileClass = require('../server/file');

/**
 *
 * @type {ModuleClass}
 */
class ModuleClass {
	constructor(path) {
		// FaConsole.consoleError(path);
		this.name = 'ModuleClass';
		this._path = path;
		this._FileClass = new FaFileClass(path);
		this._init();
	}

	/**
	 *
	 * @return {module.FaFileClass}
	 * @private
	 */
	get _file() {
		return this._FileClass;
	}

	_init() {
		const Configuration = JSON.parse(this._file.asStringSync("index.json"));
		const HttpRoutes = Configuration["http"];
		for (const [key, value] of Object.entries(HttpRoutes)) {
			if (this._file.exist(`/controllers/${value["controller"]}.js`)) {
				let ControllerClass = require(`${this._path}/controllers/${value["controller"]}`);
				// FaConsole.consoleError(value["namespace"]);
				// FaConsole.consoleError(__dirname);

				// let Controller = new ControllerClass(`${value["namespace"]}`);
				let Controller = new ControllerClass(this._path);
				if (Controller[value["action"]]) {
					FaServerGlobal.http.router.attach(key, function (req) {
						// a=b;
						return Controller[value["action"]](req, this);
					});
				} else {
					FaServerGlobal.http.router.attach(key, function () {
						let Error = new FaError(`${Controller["name"]} action not implemented: ${value["action"]}`);
						FaConsole.consoleError(Error);
						throw Error;
					})
				}
			} else {
				// FaServerGlobal.http.router.attach(key, function () {
					let Error = new FaError(`Controller not found: ${this._path}/controllers/${value["controller"]}.js`);
					FaConsole.consoleError(Error);
				// 	FaConsole.consoleError(Error);
				// })
				// 	throw Error;
			}
		}
	}
}

// const Module = new ModuleClass(path);
/**
 *
 * @type {ModuleClass}
 */
module.exports = function (path) {
	return new ModuleClass(path);
	// console.log(arguments);
};
