'use strict';
/*node*/
const SocketIo = require('socket.io');
/*fa*/
const FaRouterClass = require('../base/router');
const FaError = require('../base/error');
const FaConsoleClass = require('../console');
const FaConsole = new FaConsoleClass();

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
		this._Router = new FaRouterClass(this);
		this._Io = this._createSocket(FaHttp);
	}

	/**
	 *
	 * @return {socket.io|*}
	 * @constructor
	 */
	get Io() {
		return this._Io;
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
	 * @param FaHttp {FaHttpClass}
	 * @return {socket.io}
	 * @private
	 */
	_createSocket(FaHttp) {
		let context = this;
		let _Io;
		_Io = SocketIo(FaHttp.HttpServer, FaHttp.Configuration);
		_Io.on('connect', function (socket) {
			// context._extendSocketListener(socket);
			FaConsole.consoleInfo(`trying: ${socket.id}`);
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
		_Io.on('connection', function (socket) {
			context._onSocketConnect(socket);
			socket.on('error', function (error) {
				FaConsole.consoleError(error);
				socket.send(error);
			});
			socket.on('disconnect', function () {
				context._onSocketDisconnect(socket);
			});
			// socket.emit('SERVER', 'HEY');
		});
		console.log(
			'FaServerSocket',
			'ws',
			this.Configuration.host,
			this.Configuration.port,
			this.Configuration.path
		);
		return _Io;
	}

	/**
	 *
	 * @param socket {object}
	 * @private
	 */
	_onSocketConnect(socket) {
		let context = this;
		FaConsole.consoleInfo(`listening: ${socket.id}`);
		// let cookie = require('cookie');
		// let cookies = cookie.parse(socket.handshake.headers.cookie);
		socket.on('*', function (event, data, callback) {
			let handler = context.Router.find(event);
			if (handler) {
				context._handleRouter(socket, event, handler, data, callback);
			} else {
				let Error = new FaError(`route not found: ${event}`);
				socket.emit('error', Error)
			}
		});
	}

	/**
	 * @param socket {object}
	 * @private
	 */
	_onSocketDisconnect(socket) {
		FaConsole.consoleInfo(`disconnect: ${socket.id}`);
	}

	_handleRouter(socket, event, handler, data, callback) {
		try {
			let result = handler.call(this, data, socket);
			if (callback) {
				callback(result);
			} else if (result) {
				socket.emit(event, result);
			}
		} catch (e) {
			let Error = new FaError(e);
			// Error.appendTrace(this.Router.trace(event));
			socket.emit('error', Error)
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
// FaConsole.consoleInfo(ifaces);
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
