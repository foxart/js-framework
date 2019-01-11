"use strict";
/*node*/
const SocketIo = require("socket.io");
/*fa*/
const FaError = require("../base/error");
const FaConsoleColor = require("../console/console-helper");

/**
 *
 */
class FaSocketClass {
	/**
	 *
	 * @param FaHttp {FaHttpClass}
	 */
	constructor(FaHttp) {
		this._configuration = FaHttp.Configuration;
		this._FaRouterClass = require("../base/router")(this);
		this.SocketIo = this._createSocket(FaHttp);
	}

	/**
	 *
	 * @return {{path: string, serveClient: boolean, cookie: boolean, pingInterval: number, pingTimeout: number}}
	 */
	get Configuration() {
		return this._configuration;
	};

	/**
	 *
	 * @return {FaRouterClass}
	 * @constructor
	 */
	get Router() {
		return this._FaRouterClass;
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
			context._onSocket(socket);
		});
		_SocketIo.on("connection", function (socket) {
			context._onSocketConnect(socket);
			// socket.emit("SERVER", "HEY");
			// context.message(socket, {a: 1, b: 2})
		});
		console.log(`FaServerSocket ${FaConsoleColor.effect.bold}${FaConsoleColor.color.green}\u2714${FaConsoleColor.effect.reset} ws://{host}:{port} <{path}>`.replaceAll(Object.keys(FaHttp.Configuration).map(function (key) {
			return `{${key}}`;
		}), Object.values(FaHttp.Configuration)));
		return _SocketIo;
	}

	/**
	 * before socket connect
	 * @param socket
	 * @private
	 */
	_onSocket(socket) {
		let onevent = socket.onevent;
		socket.onevent = function (packet) {
			let args = packet.data || [];
			// original call
			// onevent.call(this, packet);
			packet.data = ["*"].concat(args);
			// additional call to catch-all
			onevent.call(this, packet);
		};
	}

	/**
	 *
	 * @param socket {object}
	 * @private
	 */
	_onSocketConnect(socket) {
		let context = this;
		// let cookie = require("cookie");
		// let cookies = cookie.parse(socket.handshake.headers.cookie);
		console.info(`socket connect: ${socket.id}`);
		socket.on("*", function (event, data, callback) {
			let handler = context.Router.find(event);
			if (handler) {
				context._handleRouter(socket, event, handler, data, callback);
			} else {
				socket.emit("error", FaError.pickTrace(`undefined handler for route: ${event}`, 1));
			}
		});
		socket.on("error", function (error) {
			console.error(error);
			socket.send(error);
		});
		socket.on("disconnect", function () {
			context._onSocketDisconnect(socket);
		});
	}

	/**
	 * @param socket {object}
	 * @private
	 */
	_onSocketDisconnect(socket) {
		console.info(`socket disconnect: ${socket.id}`);
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
		try {
			console.info(`socket event: ${event}`);
			let result = handler.apply(this, [data, socket]);
			if (callback) {
				callback(result);
			} else if (result) {
				socket.emit(event, result);
			}
		} catch (e) {
			socket.emit("error", FaError.pickTrace(e, 0));
		}
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
module.exports = function (FaHttpServer, configuration = null) {
	if (arguments) {
		return new FaSocketClass(FaHttpServer, configuration);
	} else {
		return FaSocketClass;
	}
};
