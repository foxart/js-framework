'use strict';
/*node*/
/**
 *
 * @type {oracledbCLib.Oracledb}
 */
const OracleClient = require('oracledb');
/*services*/
/**
 *
 * @param configuration
 */
module.exports = function (configuration) {
	let module = {};
	let Oracle;
	let createConnection = function (configuration) {
		module.configuration = configuration;
		console.log(`oracle | ${configuration.host}:${configuration.port}/${configuration.SID}`);
		// server1.console.log(`oracle | ${configuration.host}:${configuration.port}/${configuration.SID}`);
	};

	function logOracleError(data) {
		console.error(data);
	}

	function logOracleResponse(data) {
		console.error(data);
	}

	/*create*/
	new createConnection(configuration);
	/**
	 *
	 * @return {Promise<any>}
	 */
	module.openConnection = function () {
		return new Promise(function (resolve, reject) {
			OracleClient.getConnection({
				connectString: `${module.configuration.host}:${module.configuration.port}/${module.configuration.SID}`,
				user: module.configuration.user,
				password: module.configuration.password,
			}, function (e, connection) {
				if (e) {
					// server1.console.log(e);
					reject(e);
				} else {
					OracleClient.outFormat = OracleClient['OBJECT'];
					// OracleClient.fetchAsString = [OracleClient['DATE']];
					OracleClient.fetchAsBuffer = [OracleClient['BLOB']];
					resolve(connection);
				}
			});
		})
	};
	/**
	 *
	 * @param callback {Function}
	 * @param result
	 */
	module.executeCallback = function (callback, result) {
		if (this.configuration.persistent) {
			callback.call(this, result);
		} else {
			Oracle.close(function (e) {
				if (e) {
					/*connection close error*/
					logOracleError(new FaError(e));
				}
				callback.call(this, result);
			});
		}
	};
	module.isConnected = function () {
		return !!(Oracle && Oracle['oracleServerVersionString']);
	};
	module.execute = function (query, parameters, options, onSuccess, onError) {
		Oracle.execute(query, parameters, options, function (error, result) {
			if (error) {
				/*query execute error*/
				module.executeCallback(onError, error);
			} else {
				module.executeCallback(onSuccess, result);
			}
		});
	};

	function filterArguments(data) {
		let parameter_list = [];
		let function_list = [];
		Object.values(data).filter(function (value) {
			if (typeof value === "function") {
				function_list.push(value);
			} else {
				parameter_list.push(value);
			}
		});
		return [
			parameter_list[0] === undefined ? "SELECT * FROM V$VERSION" : parameter_list[0],
			parameter_list[1] === undefined ? [] : parameter_list[1],
			parameter_list[2] === undefined ? [] : parameter_list[2],
			function_list[0] === undefined ? function (data) {
				logOracleResponse(data);
			} : function_list[0],
			function_list[1] === undefined ? function (e) {
				logOracleError(new FaError(e));
			} : function_list[1]
		];
	}

	module.outputFormat = function (format) {
		// OracleClient.outFormat = OracleClient.OBJECT;
		OracleClient.outFormat = OracleClient[format];
	};
	/**
	 *
	 */
	module.query = function () {
		let query, parameters, options, onSuccess, onError;
		let filter = filterArguments(arguments);
		[query, parameters, options, onSuccess, onError] = [filter[0], filter[1], filter[2], filter[3], filter[4]];
		if (this.isConnected()) {
			// module.execute("alter session set time_zone='America/New_York'", query, parameters, options, onSuccess, onError);
			module.execute(query, parameters, options, onSuccess, onError);
		} else {
			this.openConnection().then(function (connection) {
				Oracle = connection;
				// server1.console.log(connection)
				module.execute(query, parameters, options, onSuccess, onError);
			}, function (error) {
				/*connection open error*/
				onError.call(this, error);
			})
		}
	};
	module.queryPromise = function () {
		let context = this;
		let query, parameters, options;
		let filter = filterArguments(arguments);
		let error = new FaError('');
		[query, parameters, options] = [filter[0], filter[1], filter[2]];
		return new Promise(function (resolve, reject) {
			context.openConnection().then(function (connection) {
				// server1.console.log(connection)
				connection.execute(query, parameters, options, function (e, result) {
					if (e) {
						console.log(e);
						let oracleError = e.message.split(': ');
						// server1.console.warn(e.message);
						// server1.console.warn(e.errorNum);
						error.name = oracleError[0];
						error.message = oracleError[1];
						// server1.console.log(e.message);
						// server1.console.warn(FaError.pickTrace(error,1));
						reject(FaError.pickTrace(error, 1));
					} else {
						resolve(result);
					}
				});
			}, function (e) {
				reject(e);
			});
		});
	};
	return module;
};
