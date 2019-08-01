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
/** @member {FaTrace|Class} */
const FaTrace = require("fa-nodejs/base/trace");
/*variables*/
const ErrorExpression = new RegExp("^(.+): (.+)$");

class FaFile {
	/**
	 *
	 * @param pathname {string|null}
	 */
	constructor(pathname = null) {
		// console.info(path);
		this._pathname = pathname;
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

	/**
	 *
	 * @param name {string}
	 * @returns {string}
	 */
	getPathname(name) {
		return this._pathname ? `${this._pathname}/${name}` : name;
		// return `${this._path}/${filename.replace(/^\/+/, "")}`;
		// return `${this._path}/${filename.replace(/^\/+/, "").replace(/\/+$/, "")}`;
	};

	/**
	 *
	 * @param directory {string}
	 * @return {boolean}
	 */
	isDirectory(directory) {
		return !!(Fs.existsSync(this.getPathname(directory)) && Fs.lstatSync(this.getPathname(directory)).isDirectory());
	};

	/**
	 *
	 * @param filename {string}
	 * @returns {boolean}
	 */
	isFile(filename) {
		return !!(Fs.existsSync(this.getPathname(filename)) && Fs.lstatSync(this.getPathname(filename)).isFile());
	};

	createDirectoryAsync(directory, options) {
	}

	/**
	 *
	 * @param directory {string}
	 * @param options {Object}
	 */
	createDirectorySync(directory, options) {
		let trace = FaTrace.trace(1);
		try {
			Fs.mkdirSync(this.getPathname(directory), options);
		} catch (e) {
			throw FaFile._Error(e).setTrace(trace);
		}
	}

	/**
	 *
	 * @param directory
	 * @return {Promise<[string]|FaError>}
	 */
	readDirectoryAsync(directory = "") {
		let trace = FaTrace.trace(1);
		let self = this;
		return new Promise(function (resolve, reject) {
			Fs.readdir(self.path(directory), {}, function (e, files) {
				if (e) {
					reject(FaFile._Error(e).setTrace(trace));
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
		let trace = FaTrace.trace(1);
		try {
			return Fs.readdirSync(this.getPathname(directory), {});
		} catch (e) {
			throw FaFile._Error(e).setTrace(trace);
		}
	};

	/**
	 *
	 * @param filename {string}
	 * @return {Promise<Buffer|FaError>}
	 */
	readFileAsync(filename) {
		let trace = FaTrace.trace(1);
		let self = this;
		return new Promise(function (resolve, reject) {
			Fs.readFile(self.getPathname(filename), {}, function (e, buffer) {
				if (e) {
					reject(FaFile._Error(e).setTrace(trace));
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
		let trace = FaTrace.trace(1);
		// console.info(trace);
		try {
			// console.error(this.getPathname(filename));
			return Fs.readFileSync(this.getPathname(filename), {});
		} catch (e) {
			throw FaFile._Error(e).setTrace(trace);
		}
	};

	/**
	 *
	 * @param filename {string}
	 * @param data {string}
	 * @return {Promise<boolean|FaError>}
	 */
	writeFileAsync(filename, data) {
		let trace = FaTrace.trace(1);
		let self = this;
		return new Promise(function (resolve, reject) {
			Fs.writeFile(self.getPathname(filename), data, {}, function (e) {
				if (e) {
					reject(FaFile._Error(e).setTrace(trace));
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
		let trace = FaTrace.trace(1);
		try {
			Fs.writeFileSync(`${this.getPathname(filename)}`, data, {
				flag: 'w',
				// mode: 0o755,
			});
		} catch (e) {
			throw FaFile._Error(e).setTrace(trace);
		}
	};

	/**
	 *
	 * @param filename {string}
	 */
	deleteFileSync(filename) {
		let trace = FaTrace.trace(1);
		try {
			Fs.unlinkSync(`${this.getPathname(filename)}`);
		} catch (e) {
			throw FaFile._Error(e).setTrace(trace);
		}
	}
}

/**
 *
 * @type {FaFile}
 */
module.exports = FaFile;
