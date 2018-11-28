'use strict';
/*node*/
const
	Fs = require('fs');
/*vendor*/
const FaError = require('../error');
const FaTraceClass = require('../trace');
/**
 *
 * @type {module.FaFileClass}
 */
module.exports = class FaFileClass {
	/**
	 *
	 * @param path {string|null}
	 * @param traceLevel {number}
	 */
	constructor(path = null, traceLevel = 3) {
		this._path = path ? path : process.cwd();
		this._traceLevel = traceLevel;
		this._TraceClass = new FaTraceClass();
	}

	/**
	 *
	 * @param filename {string}
	 * @returns {string}
	 * @private
	 */
	_filename(filename) {
		// return `${this._path}/${filename.replace(/^\/+/, "").replace(/\/+$/, "")}`;
		// return `${this._path}/${filename.replace(/^\/+/, "")}`;
		return `${this._path}/${filename}`;
	}

	/**
	 *
	 * @param name
	 * @return {Promise<void>}
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
			throw this.error(`file not found: ${this._filename(filename)}`);
			// throw new FaError(`file not found: ${this._filename(filename)}`, false);
			// throw new FaError(`file not found: ${this._filename(filename)}`);
		}
	}

	/**
	 *
	 * @param e {module.FaError|*}
	 * @return {module.FaError}
	 */
	error(e) {
		if (e instanceof FaError === false) {
			e = new FaError(e, false);
		}
		e.appendTrace(this._TraceClass.parse(e).string(this._traceLevel));
		return e;
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
			return this._readAsync(filename)
			// return this._readAsync(filename).then(function (data) {
			// 	return data;
			// }).catch(function (e) {
			// 	throw new FaError(e);
			// });
		} else {
			try {
				return this._readSync(filename);
			} catch (e) {
				// let Error = new FaError(e, false);
				// Error.appendTrace(FaTrace.getString(this._traceLevel));
				throw e;
			}
		}
	};

	/**
	 *
	 * @param filename {string}
	 * @param async {boolean}
	 * @return {*}
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
			// return this._readSync(filename).toString();
			try {
				return this._readSync(filename).toString();
			} catch (e) {
				// FaConsole.consoleWarn(this.error(e));
				// e.appendTrace(FaTrace.getString(this._traceLevel));
				// throw new FaError(e);
				throw e;
			}
		}
	};
};
