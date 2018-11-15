'use strict';
/*node*/
const
	SocketIo = require('socket.io');
/*vendor*/
const FaRouterClass = require('./router');
const FaError = require('../error');
const FaTrace = require('../trace');
/**
 *
 * @type {module.FaServerSocketClass}
 */
module.exports = class FaServerSocketClass {
	/**
	 *
	 * @param parent {module.FaServerClass}
	 * @param configuration {{path: string, serveClient: boolean, cookie: boolean, pingInterval: number, pingTimeout: number}}
	 */
	constructor(parent, configuration) {
		this._parent = parent;
		this._configuration = configuration;
		this._RouterClass = new FaRouterClass(parent);
		this._Io = this._createSocket(parent, configuration);
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
	get configuration() {
		return this._configuration;
	};

	/**
	 *
	 * @return {module.FaHttpRouterClass}
	 */
	get router() {
		return this._RouterClass;
	}

	/**
	 *
	 * @param parent {module.FaServerClass}
	 * @param configuration
	 * @return {socket.io}
	 * @private
	 */
	_createSocket(parent, configuration) {
		let context = this;
		let _Io;
		_Io = SocketIo(parent.http.Http, configuration);
		_Io.on('connect', function (socket) {
			// context._extendSocketListener(socket);
			consoleInfo(`trying: ${socket.id}`);
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
				consoleError(error);
				consoleFile(error, 'socket/error');
				socket.send(error);
			});
			socket.on('disconnect', function () {
				context._onSocketDisconnect(socket);
			});
			// socket.emit('SERVER', 'HEY');
		});
		this._parent.log(
			'FaServerSocket',
			'ws',
			this._parent.http.configuration.host,
			this._parent.http.configuration.port,
			this.configuration.path
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
		consoleInfo(`listening: ${socket.id}`);
		// let cookie = require('cookie');
		// let cookies = cookie.parse(socket.handshake.headers.cookie);
		socket.on('*', function (event, data, callback) {
			let handler = context.router.handler(event);
			if (handler) {
				context._handleRouter(socket, event, handler, data, callback);
			} else {
				let Error = new FaError(`route not found: ${event}`, false);
				socket.emit('error', Error)
			}
		});
	}

	/**
	 * @param socket {object}
	 * @private
	 */
	_onSocketDisconnect(socket) {
		consoleInfo(`disconnect: ${socket.id}`);
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
			let Error = new FaError(e, false);
			Error.appendTrace(this.router.trace(event));
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
};
