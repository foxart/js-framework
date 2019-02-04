"use strict";
/*node*/
const Fs = require("fs");
/*fa*/
const FaError = require("./error");

class FaFileClass {
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
	existDirectory(directory) {
		return !!(Fs.existsSync(this.path(directory)) && this.isDirectory(directory));
	};

	isDirectory(directory) {
		return Fs.lstatSync(this.path(directory)).isDirectory();
	}

	/**
	 *
	 * @param filename {string}
	 * @returns {boolean}
	 */
	existFilename(filename) {
		return !!(Fs.existsSync(this.path(filename)) && this.isFilename(filename));
	};

	isFilename(filename) {
		return Fs.lstatSync(this.path(filename)).isFile();
	}

	/**
	 *
	 * @param directory {string}
	 * @param options {Object}
	 */
	createDirectorySync(directory, options) {
		try {
			Fs.mkdirSync(this.path(directory), options);
		} catch (e) {
			throw FaError.pickTrace(e, 2);
		}
	}

	readDirectoryAsync(directory = "") {
		let context = this;
		let error = FaError.pickTrace("error", 2);
		return new Promise(function (resolve, reject) {
			Fs.readdir(context.path(directory), function (e, files) {
				if (e) {
					error.name = e.message;
					reject(error);
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
			throw FaError.pickTrace(e, 2);
		}
	};

	/**
	 *
	 * @param filename {string}
	 * @return {Promise<Buffer>}
	 */
	readFileAsync(filename) {
		let context = this;
		let error = new FaError('');
		return new Promise(function (resolve, reject) {
			Fs.readFile(context.path(filename), function (e, buffer) {
				if (e) {
					error.message = e.message;
					reject(FaError.pickTrace(error, 1));
				} else {
					resolve(buffer);
				}
			});
		});
	};

	writeFileAsync(filename, data) {
	};

	/**
	 *
	 * @param filename {string}
	 * @return {Buffer}
	 */
	readFileSync(filename) {
		try {
			return Fs.readFileSync(this.path(filename));
		} catch (e) {
			throw FaError.pickTrace(e, 2);
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
