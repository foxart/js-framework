"use strict";
/*nodejs*/
const MongoClient = require("mongodb").MongoClient;
/**
 *
 * @type {module.MongoConnectorClass}
 */
module.exports = class MongoConnectorClass {
	get _host() {
	};

	get _port() {
	};

	get _database() {
	};

	get _persistent() {
		return true;
	};

	get _configuration() {
		return {
			forceClose: false,
		};
	}

	/**
	 *
	 * @return {string}
	 * @private
	 */
	get _url() {
		return `mongodb://${this._host}:${this._port}`;
	}

	get _options() {
		return {useNewUrlParser: true};
	}

	get open() {
		let context = this;
		return new Promise(function (resolve, reject) {
			return MongoClient.connect(context._url, context._options, function (e, client) {
				if (e === null) {
					context._MongoClient = client;
					resolve(true);
				} else {
					reject(e);
				}
			});
		});
	};

	get close() {
		let context = this;
		return new Promise(function (resolve, reject) {
			return context._MongoClient.close(context._configuration.forceClose, function (e) {
				if (e === null) {
					context._MongoClient = null;
					resolve(true);
				} else {
					reject(e);
				}
			});
		});
	};

	/**
	 *
	 * @return {Promise<MongoClient>}
	 */
	get connection() {
		let context = this;
		return new Promise(function (resolve, reject) {
			if (context._MongoClient) {
				resolve(context._MongoClient);
			} else {
				context.open.then(function () {
					resolve(context._MongoClient);
				}).catch(function (e) {
					reject(e);
				});
			}
		});
	};

	database(name) {
		let context = this;
		return context.connection.then(function (client) {
			return client.db(name);
		});
	};

	collection(name) {
		let context = this;
		return context.connection.then(function (client) {
			// console.error(client.db(context._database).collection(name));
			return client.db(context._database).collection(name);
		});
	};
};
