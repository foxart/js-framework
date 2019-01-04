'use strict';
/*node*/
const SocketIo = require('socket.io');
/*fa*/
const FaError = require('../base/error');
const FaConsoleColor = require('../console/console-color');

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
		this._Router = require('../base/router')(this);
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
		return this._Router;
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
		_SocketIo.on('connect', function (socket) {
			// context._extendSocketListener(socket);
			console.info(`trying: ${socket.id}`);
			let onevent = socket.onevent;
			socket.onevent = function (packet) {
				let args = packet.data || [];
				// original call
				// onevent.call(this, packet);
				packet.data = ["*"].concat(args);
				// additional call to catch-all
				onevent.call(this, packet);
			};
		});
		_SocketIo.on('connection', function (socket) {
			context._onSocketConnect(socket);
			socket.on('error', function (error) {
				console.error(error);
				socket.send(error);
			});
			socket.on('disconnect', function () {
				context._onSocketDisconnect(socket);
			});
			// socket.emit('SERVER', 'HEY');
		});
		// server1.console.log(
		// 	'FaServerSocket',
		// 	'ws',
		// 	this.Configuration.host,
		// 	this.Configuration.port,
		// 	this.Configuration.path
		// );
		console.log(`FaServerSocket ${FaConsoleColor.effect.bold}${FaConsoleColor.color.green}\u2714${FaConsoleColor.effect.reset} ws://{host}:{port} <{path}>`.replaceAll(Object.keys(FaHttp.Configuration).map(function (key) {
			return `{${key}}`;
		}), Object.values(FaHttp.Configuration)));
		return _SocketIo;
	}

	/**
	 *
	 * @param socket {object}
	 * @private
	 */
	_onSocketConnect(socket) {
		let context = this;
		console.info(`listening: ${socket.id}`);
		// let cookie = require('cookie');
		// let cookies = cookie.parse(socket.handshake.headers.cookie);
		socket.on('*', function (event, data, callback) {
			let handler = context.Router.find(event);
			if (handler) {
				context._handleRouter(socket, event, handler, data, callback);
			} else {
				// let error = new FaError(`route not found: ${event}`);
				// socket.emit('error', error);
				socket.emit('error', FaError.pickTrace(`route not found: ${event}`, 1));
			}
		});
	}

	/**
	 * @param socket {object}
	 * @private
	 */
	_onSocketDisconnect(socket) {
		console.info(`disconnect: ${socket.id}`);
	}

	_handleRouter(socket, event, handler, data, callback) {
		// server1.console.log(event);
		try {
			let result = handler.call(this, {data: data, socket: socket});
			if (callback) {
				callback(result);
			} else if (result) {
				socket.emit(event, result);
			}
		} catch (e) {
			socket.emit('error', FaError.pickTrace(e, 0));
		}
	}

	/**
	 *
	 * @param socket {object}
	 * @param data {*}
	 */
	message(socket, data) {
		socket.send(data);
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
}

// let os = require('os');
// let ifaces = os.networkInterfaces();
// server1.console.info(ifaces);
// Object.keys(ifaces).forEach(function (ifname) {
// 	let alias = 0;
// 	ifaces[ifname].forEach(function (iface) {
// 		if ('IPv4' !== iface.family || iface.internal !== false) {
// 			// skip over internal (i.e. 127.0.0.1) and non-ipv4 addresses
// 			return;
// 		}
// 		if (alias >= 1) {
// 			// this single interface has multiple ipv4 addresses
// 			consoleLog(ifname + ':' + alias, iface.address);
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
