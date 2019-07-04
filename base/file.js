/*
* /var/www/index.html
* url:			http://localhost/index.html
* uri:			/index.html
* path:		 	/var/www/index.html
* pathname:		/var/www
* directory:	www
* filename:		index.html
* basename:		index
* extension:	html
*/
"use strict";
/*node*/
const Fs = require("fs");
/*fa*/
const FaError = require("fa-nodejs/base/error");
const FaBaseTrace = require("fa-nodejs/base/trace");
/*variables*/
const ErrorExpression = new RegExp("^(.+): (.+)$");

class FaBaseFile {
	/**
	 *
	 * @param path {string|null}
	 */
	constructor(path = null) {
		// console.info(path);
		this._path = path;
	};

	/**
	 *
	 * @param error {Error}
	 * @return {FaError}
	 * @private
	 */
	static _Error(error) {
		let result = error.message.match(ErrorExpression);
		if (result) {
			return new FaError({name: result[1], message: result[2]});
		} else {
			return new FaError(error);
		}
	}


	get pathname(){
		return this._path;
	}

	/**
	 *
	 * @param name {string}
	 * @returns {string}
	 */
	getPath(name) {
		// return `${this._path}/${filename.replace(/^\/+/, "").replace(/\/+$/, "")}`;
		// return `${this._path}/${filename.replace(/^\/+/, "")}`;
		return this._path ? `${this._path}/${name}` : name;
	};

	/**
	 *
	 * @param directory {string}
	 * @return {boolean}
	 */
	isDirectory(directory) {
		return !!(Fs.existsSync(this.getPath(directory)) && Fs.lstatSync(this.getPath(directory)).isDirectory());
	};

	/**
	 *
	 * @param filename {string}
	 * @returns {boolean}
	 */
	isFile(filename) {
		return !!(Fs.existsSync(this.getPath(filename)) && Fs.lstatSync(this.getPath(filename)).isFile());
	};

	createDirectoryAsync(directory, options) {
	}

	/**
	 *
	 * @param directory {string}
	 * @param options {Object}
	 */
	createDirectorySync(directory, options) {
		let trace = FaBaseTrace.trace(1);
		try {
			Fs.mkdirSync(this.getPath(directory), options);
		} catch (e) {
			throw FaBaseFile._Error(e).setTrace(trace);
		}
	}

	/**
	 *
	 * @param directory
	 * @return {Promise<[string]|FaError>}
	 */
	readDirectoryAsync(directory = "") {
		let trace = FaBaseTrace.trace(1);
		let self = this;
		return new Promise(function (resolve, reject) {
			Fs.readdir(self.path(directory), {}, function (e, files) {
				if (e) {
					reject(FaBaseFile._Error(e).setTrace(trace));
				} else {
					resolve(files);
				}
			})
		});
	};

	/**
	 *
	 * @param directory
	 * @return {string[] | Buffer[]}
	 */
	readDirectorySync(directory = "") {
		let trace = FaBaseTrace.trace(1);
		try {
			return Fs.readdirSync(this.getPath(directory), {});
		} catch (e) {
			throw FaBaseFile._Error(e).setTrace(trace);
		}
	};

	/**
	 *
	 * @param filename {string}
	 * @return {Promise<Buffer|FaError>}
	 */
	readFileAsync(filename) {
		let trace = FaBaseTrace.trace(1);
		let self = this;
		return new Promise(function (resolve, reject) {
			Fs.readFile(self.getPath(filename), {}, function (e, buffer) {
				if (e) {
					reject(FaBaseFile._Error(e).setTrace(trace));
				} else {
					resolve(buffer);
				}
			});
		});
	};

	/**
	 *
	 * @param filename {string}
	 * @return {Buffer}
	 */
	readFileSync(filename) {
		let trace = FaBaseTrace.trace(1);
		try {
			// console.error(this.getPath(filename));
			return Fs.readFileSync(this.getPath(filename), {});
		} catch (e) {
			throw FaBaseFile._Error(e).setTrace(trace);
		}
	};

	/**
	 *
	 * @param filename {string}
	 * @param data {string}
	 * @return {Promise<boolean|FaError>}
	 */
	writeFileAsync(filename, data) {
		let trace = FaBaseTrace.trace(1);
		let self = this;
		return new Promise(function (resolve, reject) {
			Fs.writeFile(self.getPath(filename), data, {}, function (e) {
				if (e) {
					reject(FaBaseFile._Error(e).setTrace(trace));
				} else {
					resolve(true);
				}
			});
		});
	};

	/**
	 *
	 * @param filename {string}
	 * @param data {string}
	 */
	writeFileSync(filename, data) {
		// let fileStream = Fs.createWriteStream(`${this.path(filename)}`, {
		// 	flags: 'w',
		// });
		// fileStream.write(data);
		// fileStream.end();
		let trace = FaBaseTrace.trace(1);
		try {
			Fs.writeFileSync(`${this.getPath(filename)}`, data, {
				flag: 'w',
				// mode: 0o755,
			});
		} catch (e) {
			throw FaBaseFile._Error(e).setTrace(trace);
		}
	};

	/**
	 *
	 * @param filename {string}
	 */
	deleteFileSync(filename) {
		let trace = FaBaseTrace.trace(1);
		try {
			Fs.unlinkSync(`${this.getPath(filename)}`);
		} catch (e) {
			throw FaBaseFile._Error(e).setTrace(trace);
		}
	}
}

/**
 *
 * @type {FaBaseFile}
 */
module.exports = FaBaseFile;
