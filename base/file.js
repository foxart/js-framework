"use strict";
/*node*/
const Fs = require("fs");
/*fa*/
const FaError = require("fa-nodejs/base/error");
/**
 *
 * @type {module.FaFileClass}
 */
module.exports = class FaFileClass {
	/**
	 *
	 * @param path {string|null}
	 */
	constructor(path = null) {
		this._path = path;
	};

	/**
	 *
	 * @param filename {string}
	 * @returns {string}
	 */
	path(filename) {
		// return `${this._path}/${filename.replace(/^\/+/, "").replace(/\/+$/, "")}`;
		// return `${this._path}/${filename.replace(/^\/+/, "")}`;
		return this._path ? `${this._path}/${filename}` : filename;
	};

	/**
	 *
	 * @param directory {string}
	 * @return {boolean}
	 */
	isDirectory(directory) {
		return !!(Fs.existsSync(this.path(directory)) && Fs.lstatSync(this.path(directory)).isDirectory());
	};

	/**
	 *
	 * @param filename {string}
	 * @returns {boolean}
	 */
	isFile(filename) {
		return !!(Fs.existsSync(this.path(filename)) && Fs.lstatSync(this.path(filename)).isFile());
	};

	/**
	 *
	 * @param directory {string}
	 * @param options {Object}
	 */
	createDirectorySync(directory, options) {
		try {
			Fs.mkdirSync(this.path(directory), options);
		} catch (e) {
			throw new FaError(e).pickTrace(3);
		}
	}

	readDirectoryAsync(directory = "") {
		let context = this;
		let error = new FaError();
		return new Promise(function (resolve, reject) {
			Fs.readdir(context.path(directory), function (e, files) {
				if (e) {
					reject(error.setName(e.message).pickTrace(2));
				} else {
					resolve(files);
				}
			})
		});
	};

	/**
	 *
	 * @param directory
	 * @return {string[]}
	 */
	readDirectorySync(directory = "") {
		try {
			return Fs.readdirSync(this.path(directory));
		} catch (e) {
			throw new FaError(e).pickTrace(3);
		}
	};

	/**
	 *
	 * @param filename {string}
	 * @return {Promise<Buffer>}
	 */
	readFileAsync(filename) {
		let context = this;
		let error = new FaError();
		return new Promise(function (resolve, reject) {
			Fs.readFile(context.path(filename), function (e, buffer) {
				if (e) {
					reject(error.setMessage(e.message).pickTrace(2));
				} else {
					resolve(buffer);
				}
			});
		});
	};

	writeFileAsync(filename, data) {
	};


	readFileSync(filename) {
		try {
			return Fs.readFileSync(this.path(filename));
		} catch (e) {
			throw new FaError(e).pickTrace(3);
		}
	};

	/**
	 *
	 * @param filename {string}
	 * @param data
	 */
	writeFileSync(filename, data) {
		let fileStream = Fs.createWriteStream(`${this.path(filename)}`, {
			flags: 'w'
		});
		fileStream.write(data);
		fileStream.end();
	};
};
