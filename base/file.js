"use strict";
/*node*/
const Fs = require("fs");
/*fa*/
const FaError = require("./error");

/**
 *
 * @type {module.FaFileClass}
 */
class FaFileClass {
	/**
	 *
	 * @param path {string|null}
	 */
	constructor(path = null) {
		// this._path = path;
		this._path = path ? path : process.cwd();
	}

	/**
	 *
	 * @param filename {string}
	 * @returns {string}
	 */
	fullname(filename) {
		// return `${this._path}/${filename.replace(/^\/+/, "").replace(/\/+$/, "")}`;
		// return `${this._path}/${filename.replace(/^\/+/, "")}`;
		return this._path ? `${this._path}/${filename}` : filename;
	}

	/**
	 *
	 * @param filename {string}
	 * @returns {boolean}
	 */
	exist(filename) {
		let fullname = this.fullname(filename);
		return !!(Fs.existsSync(fullname) && Fs.lstatSync(fullname).isFile());
	};

	/**
	 *
	 * @param filename {string}
	 * @return {Promise<Buffer>}
	 */
	readByteAsync(filename) {
		let context = this;
		let error = new FaError('');
		return new Promise(function (resolve, reject) {
			Fs.readFile(context.fullname(filename), function (e, buffer) {
				if (e) {
					error.message = e.message;
					reject(FaError.pickTrace(error, 1));
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
	readByteSync(filename) {
		try {
			return Fs.readFileSync(this.fullname(filename));
		} catch (e) {
			throw FaError.pickTrace(e, 3);
		}
	};

	/**
	 *
	 * @param filename
	 * @return {Promise<string>}
	 */
	readStringAsync(filename) {
		let context = this;
		let error = new FaError('');
		return new Promise(function (resolve, reject) {
			Fs.readFile(context.fullname(filename), function (e, buffer) {
				if (e) {
					error.message = e.message;
					reject(FaError.pickTrace(error, 1));
				} else {
					resolve(buffer.toString());
				}
			});
		});
	};

	/**
	 *
	 * @param filename {string}
	 * @return {string}
	 */
	readStringSync(filename) {
		try {
			return Fs.readFileSync(this.fullname(filename)).toString();
		} catch (e) {
			throw FaError.pickTrace(e, 3);
		}
	};
}

/**
 *
 * @param path {string|null}
 * @return {FaFileClass}
 */
module.exports = function (path = null) {
	if (arguments) {
		return new FaFileClass(path);
	} else {
		return FaFileClass;
	}
};