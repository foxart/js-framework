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
	}

	/**
	 *
	 * @return {string}
	 */
	get path() {
		return this._path;
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
	existFilename(filename) {
		let fullname = this.fullname(filename);
		return !!(Fs.existsSync(fullname) && Fs.lstatSync(fullname).isFile());
	};

	/**
	 *
	 * @param path {string}
	 * @return {boolean}
	 */
	existPath(path) {
		return !!(Fs.existsSync(path) && Fs.lstatSync(path).isDirectory());
	};

	createPathSync(path) {
		try {
			Fs.mkdirSync(path);
		} catch (e) {
			// if (e.code !== 'EEXIST') {
			// }
			throw FaError.pickTrace(e, 2);
		}
	}

	/**
	 *
	 * @param filename {string}
	 * @param data
	 */
	writeByteSync(filename, data) {
		let fileStream = Fs.createWriteStream(`${this.fullname(filename)}`, {
			flags: 'w'
		});
		fileStream.write(data);
		fileStream.end();
	}

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
