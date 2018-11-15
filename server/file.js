'use strict';
/*node*/
const
	Fs = require('fs');
/*vendor*/
const
	FaError = require('../error'),
	FaTrace = require('../trace');
/**
 *
 * @type {module.FaFileClass}
 */
module.exports = class FaFileClass {
	/**
	 *
	 * @param path {string|null}
	 * @param traceLevel {number|null}
	 */
	constructor(path = null, traceLevel = 1) {
		if (path) {
			this._path = path;
		} else {
			this._path = process.cwd();
		}
		this._traceLevel = traceLevel;
	}

	/**
	 *
	 * @param filename {string}
	 * @returns {string}
	 * @private
	 */
	_filename(filename) {
		// return `${this._path}/${filename.replace(/^\/+/, "").replace(/\/+$/, "")}`;
		return `${this._path}/${filename}`;
	}

	/**
	 *
	 * @param name
	 * @return {Promise<any>}
	 * @private
	 */
	_readAsync(name) {
		let context = this;
		return new Promise(function (resolve, reject) {
			if (context.exist(name)) {
				Fs.readFile(`${context._filename(name)}`, function (e, data) {
					if (e) {
						reject(e);
					} else {
						resolve(data);
					}
				});
			} else {
				reject(new FaError(`file not found: ${context._filename(name)}`, false));
			}
		});
	}

	/**
	 *
	 * @param filename {string}
	 * @return {array}
	 * @throws {module.FaError}
	 * @private
	 */
	_readSync(filename) {
		if (this.exist(filename)) {
			return Fs.readFileSync(this._filename(filename));
		} else {
			throw new FaError(`file not found: ${this._filename(filename)}`, false);
		}
	}

	/**
	 *
	 * @param filename {string}
	 * @returns {boolean}
	 */
	exist(filename) {
		return !!(Fs.existsSync(this._filename(filename)) && Fs.lstatSync(this._filename(filename)).isFile());
	};

	/**
	 *
	 * @param filename {string}
	 * @param async {boolean}
	 * @return {*}
	 * @throws {error}
	 * @throws {module.FaError}
	 */
	asByte(filename, async = false) {
		if (async) {
			return this._readAsync(filename).then(function (data) {
				return data;
			}).catch(function (e) {
				throw new FaError(e);
			});
		} else {
			try {
				return this._readSync(filename);
			} catch (e) {
				let Error = new FaError(e, false);
				Error.appendTrace(FaTrace.getString(this._traceLevel));
				throw Error;
			}
		}
	};

	/**
	 *
	 * @param filename {string}
	 * @param async {boolean}
	 * @return {*}
	 * @throws {error}
	 * @throws {module.FaError}
	 */
	asString(filename, async = false) {
		if (async) {
			return this._readAsync(filename).then(function (data) {
				return data;
			}).catch(function (e) {
				throw new FaError(e);
			});
		} else {
			try {
				return this._readSync(filename).toString();
			} catch (e) {
				let Error = new FaError(e, false);
				Error.appendTrace(FaTrace.getString(this._traceLevel));
				throw Error;
			}
		}
	};
};
