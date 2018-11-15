'use strict';

class FaSocketClass {
	/**
	 *
	 * @param configuration
	 */
	constructor(configuration) {
		this._configuration = configuration;
		this._handler = function (callback) {
			return function () {
				return callback.apply(this, arguments);
			};
		};
		this._handler_list = {};
		this._trace_list = {};
		this._socket = null;
		this._createSocket();
	}

	/**
	 *
	 * @return {{host: string, port: number, options: {}}}
	 */
	get configuration() {
		return this._configuration;
	};

	/**
	 *
	 * @param event {string}
	 * @private
	 */
	_log(event) {
		console.log(`${event} \u2714 ws://${this.configuration.host}:${this.configuration.port} <${this.configuration.options.path}>`);
	}

	/**
	 *
	 * @param error
	 * @private
	 */
	_error(error) {
		let trace;
		if (error.trace.length > 0) {
			trace = '\n\t' + error.trace.join('\n\t')
		} else {
			trace = '';
		}
		console.log(`<${error.name}> \u2715 ${error.message}${trace}`);
	}

	/**
	 *
	 * @private
	 */
	_createSocket() {
		let context = this;
		this._socket = io(`${this.configuration.host}:${this.configuration.port}`, this.configuration.options);
		let onevent = this._socket.onevent;
		this._socket.onevent = function (packet) {
			let args = packet.data || [];
			packet.data = ["*"].concat(args);
			onevent.call(this, packet);
		};
		this._onSocketCreate();
		this._socket.on('connect', function () {
			context._log('connect')
		});
		this._socket.on('reconnect', function () {
			context._log('reconnect')
		});
		this._socket.on('disconnect', function () {
			context._log('disconnect')
		});
		this._socket.on('error', function (error) {
			context._error(error);
		});
	}

	/**
	 *
	 * @private
	 */
	_onSocketCreate() {
		let context = this;
		this._socket.on('*', function (event, data) {
			let handler = context._handler_list[event];
			if (event === 'message') {
				context._socket.emit('error', data);
			} else if (handler) {
				context._handleRouter(event, handler, data);
			} else {
				let Error = new FaErrorClass(`route not found: ${event}`, false);
				context._socket.emit('error', Error);
			}
		});
	}

	/**
	 *
	 * @param event
	 * @param handler
	 * @param data
	 * @private
	 */
	_handleRouter(event, handler, data) {
		try {
			handler.call(this, data);
		} catch (e) {
			let Error = new FaErrorClass(e, false);
			Error.appendTrace(this._trace_list[event]);
			this._socket.emit('error', Error);
		}
	}

	/**
	 *
	 * @param route {string}
	 * @return {boolean}
	 */
	exist(route) {
		return !!this._handler_list[route];
	}

	/**
	 *
	 * @param event {string}
	 * @param callback {function}
	 */
	on(event, callback) {
		if (this.exist(event) === false) {
			this._handler_list[event] = new this._handler(callback);
			this._trace_list[event] = FaTrace.string(1);
		} else {
			let Error = new FaErrorClass(`route exist: ${event}`, false);
			Error.appendTrace(FaTrace.string(1));
			this._socket.emit('error', Error);
		}
	}

	/**
	 *
	 * @param event {string}
	 */
	off(event) {
		if (this.exist(event) === true) {
			delete this._handler_list[event];
			delete this._trace_list[event];
		} else {
			let Error = new FaErrorClass(`route not found: ${event}`, false);
			Error.appendTrace(FaTrace.string(1));
			this._socket.emit('error', Error);
		}
	};

	/**
	 *
	 * @param event {string}
	 * @param data {*}
	 */
	emit(event, data) {
		this._socket.emit(event, data);
	}

	/**
	 *
	 * @param event {string}
	 * @param data {*}
	 * @param callback {function}
	 */
	acknowledge(event, data, callback) {
		this._socket.emit(event, data, callback);
	}
}

/**
 *
 * @type {FaSocketClass}
 */
let FaSocket = new FaSocketClass(FaSocketConfiguration);
