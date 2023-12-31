"use strict";
/*node*/
const
	SocketIo = require('socket.io');
/*services*/
// const
// 	LogService = require('../idol/modules/audit/services/LogService');
/*modules*/
// const Beautify = require('./server1.beautify');
/**
 *
 * @param configuration
 * @returns {{}}
 */
module.exports = function (configuration) {
	/* this */
	let module = {};
	/* variables */
	// module.SocketServer = {};
	let handler_list = {};

	/**
	 *
	 * @param event
	 * @constructor
	 */
	function SocketRouterHandler(event) {
		/**
		 *
		 * @param data
		 */
		this.process = function (data) {
			return event.apply(this, [data]);
		}
	}

	let createSocketServer = function (configuration) {
		/**
		 * @type Object
		 */
		module.SocketServer = SocketIo(configuration.port, configuration.options);
		module.SocketServer.on('connect', function (socket) {
			module.serve(socket);
			/*events*/
			onConnectHandler(socket);
			socket.on('disconnect', function () {
				onDisconnectHandler(socket);
			});
		});
		// return SocketServer;
	};
	/**
	 *
	 * @type Object
	 */
	new createSocketServer(configuration);

	function onConnectHandler(socket) {
		/*debug*/
		// server1.console.info('socket In: ' + socket['id']);
		NotifySocketClient(socket);
		NotifySocketClienList();
	}

	function onDisconnectHandler(socket) {
		// server1.console.info('socket Out: ' + socket['id']);
		// server1.console.log('socket Disconnect' + socket['handshake']['address']);
		NotifySocketClienList();
	}

	function NotifySocketClient(socket) {
		module.tellClient(socket, 'socket-client', socket['id']);
	}

	function NotifySocketClienList() {
		let client_list = {};
		let socket_client_list = module.SocketServer['engine']['clients'];
		for (let id in socket_client_list) {
			if (socket_client_list.hasOwnProperty(id)) {
				client_list[id] = socket_client_list[id]['request']['connection']['remoteAddress'];
			}
		}
		module.tellAll('socket-client-list', client_list);
	}

	/**
	 *
	 * @param event
	 * @param callback
	 */
	module.attachHandler = function (event, callback) {
		handler_list[event] = new SocketRouterHandler(callback);
	};
	/**
	 *
	 * @param event
	 */
	module.detachHandler = function (event) {
		delete handler_list[event];
	};
	/**
	 *
	 * @param event
	 */
	module.getHandler = function (event) {
		if (event !== undefined) {
			return handler_list[event];
		} else {
			return handler_list;
		}
	};
	/**
	 *
	 * @param socket
	 */
	module.serve = function (socket) {
		for (const property in handler_list) {
			if (handler_list.hasOwnProperty(property)) {
				socket.on(property, handler_list[property].process);
			}
		}
	};
	/**
	 *
	 * @param socket
	 * @param event
	 * @param data
	 */
	module.tellClient = function (socket, event, data) {
		this.SocketServer.to(socket.id).emit(event, data);
	};
	/**
	 *
	 * @param event
	 * @param data
	 */
	module.tellAll = function (event, data) {
		// this.SocketServer.emit('idol-log', {message:Beautify.simple(data)});
		this.SocketServer.emit(event, data);
	};
	return module;
};
