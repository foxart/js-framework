"use strict";
/*node*/
const SocketIo = require("socket.io");
/*fa*/
const FaError = require("../base/error");
const FaConsoleColor = require("../console/console-helper");

class FaServerSocket {
	/**
	 *
	 * @param FaHttp {FaServerHttp}
	 */
	constructor(FaHttp) {
		this.name = "FaSocket";
		this.folder = "sockets";
		this._FaSocketConfigurationClass = FaHttp.Configuration;
		this._FaRouterClass = require("fa-nodejs/base/router")(this);
		this.SocketIo = this._createSocket(FaHttp);
	}

	/**
	 *
	 * @return {{path: string, serveClient: boolean, cookie: boolean, pingInterval: number, pingTimeout: number}}
	 */
	get Configuration() {
		return this._FaSocketConfigurationClass;
	};

	/**
	 *
	 * @return {FaRouterClass}
	 * @constructor
	 */
	get Router() {
		return this._FaRouterClass;
	}

	_logConfiguration() {
		console.log(`FaServerSocket ${FaConsoleColor.effect.bold}${FaConsoleColor.color.green}\u2714${FaConsoleColor.effect.reset} ws://${this.Configuration.host}:${this.Configuration.port} <${this.Configuration.path}>`);
	}

	_logMessage(socket, message) {
		if (socket.id) {
			console.log(`socket ${message}: ${FaConsoleColor.effect.bold}${socket.id}${FaConsoleColor.effect.reset}`);
		} else {
			console.log(`socket ${message}`);
		}
	}

	/**
	 *
	 * @param FaHttp
	 * @return {Server}
	 * @private
	 */
	_createSocket(FaHttp) {
		let context = this;
		let _SocketIo;
		_SocketIo = SocketIo(FaHttp.HttpServer, FaHttp.Configuration);
		_SocketIo.on("connect", function (socket) {
			context._extendSocket(socket);
		});
		_SocketIo.on("connection", function (socket) {
			context._onSocketConnect(socket);
			socket.on("error", function (error) {
				context._onSocketError(socket, error)
			});
			socket.on("disconnect", function () {
				context._onSocketDisconnect(socket);
			});
			// socket.emit("SERVER", "HEY");
			// context.message(socket, {a: 1, b: 2})
		});
		this._logConfiguration();
		return _SocketIo;
	}

	/**
	 * before socket connect
	 * @param socket
	 * @private
	 */
	_extendSocket(socket) {
		let context = this;
		let onevent = socket.onevent;
		socket.onevent = function (packet) {
			let args = packet.data || [];
			packet.data = ["*"].concat(args);
			onevent.call(this, packet);
		};
		socket.on("*", function (event, data, callback) {
			let handler = context.Router.find(event);
			if (handler) {
				context._handleRouter(socket, event, handler, data, callback);
			} else {
				context._onSocketError(socket, FaError.pickTrace(`undefined handler for event: ${event}`, 1));
			}
		});
	}

	/**
	 *
	 * @param socket
	 * @param event
	 * @param handler
	 * @param data
	 * @param callback
	 * @private
	 */
	_handleRouter(socket, event, handler, data, callback) {
		// console.info(`socket event: ${event}`);
		try {
			let result = handler.apply(this, [data, socket]);
			if (callback) {
				callback(result);
			} else if (result) {
				socket.emit(event, result);
			}
		} catch (e) {
			this._onSocketError(socket, FaError.pickTrace(e, 0));
		}
	}

	/**
	 *
	 * @param socket {object}
	 * @private
	 */
	_onSocketConnect(socket) {
		this._logMessage(socket, "connect");
	}

	/**
	 *
	 * @param socket {object}
	 * @private
	 */
	_onSocketDisconnect(socket) {
		this._logMessage(socket, "disconnect");
	}

	/**
	 *
	 * @param socket {object}
	 * @param error
	 * @private
	 */
	_onSocketError(socket, error) {
		console.error(error);
		socket.send(error);
	}

	/**
	 *
	 * @param socket {object}
	 * @param event {string}
	 * @param data {*}
	 */
	emit(socket, event, data) {
		socket.emit(event, data);
	}

	/**
	 *
	 * @param socket {object}
	 * @param data {*}
	 */
	message(socket, data) {
		socket.send(data);
	}
}
// let os = require("os");
// let ifaces = os.networkInterfaces();
// server1.console.info(ifaces);
// Object.keys(ifaces).forEach(function (ifname) {
// 	let alias = 0;
// 	ifaces[ifname].forEach(function (iface) {
// 		if ("IPv4" !== iface.family || iface.internal !== false) {
// 			// skip over internal (i.e. 127.0.0.1) and non-ipv4 addresses
// 			return;
// 		}
// 		if (alias >= 1) {
// 			// this single interface has multiple ipv4 addresses
// 			consoleLog(ifname + ":" + alias, iface.address);
// 		} else {
// 			// this interface has only one ipv4 adress
// 			consoleLog(ifname, iface.address);
// 		}
// 		++alias;
// 	});
// });
// module.exports = function (FaHttpServer, configuration = null) {
// 	if (arguments) {
// 		return new FaSocketClass(FaHttpServer, configuration);
// 	} else {
// 		return FaSocketClass;
// 	}
// };
/**
 *
 * @type {FaServerSocket}
 */
module.exports = FaServerSocket;
