'use strict';
/*vendor*/
const
	FaServerFileClass = require('../base/file');
/**
 *
 * @type {module.FaServerHttpRoutesClass}
 */
module.exports = class FaServerHttpRoutesClass {
	constructor(executor) {
		this._FileClass = new FaServerFileClass('/usr/src');
		this.httpRoutes(executor);
		this.socketRoutes(executor);
	}

	/**
	 *
	 * @returns {module.FaFileClass}
	 * @private
	 */
	get _file() {
		return this._FileClass;
	}

	/**
	 *
	 * @param faServerClass {module.FaServerHttpClass}
	 */
	httpRoutes(faServerClass) {
		// const FileType = require('File-type');
		// 'Content-Type': FileType(favicon).mime,
		faServerClass.router.attach('/favicon.ico', function () {
			/** @type {module.FaServerClass} */
			let self = this;
			return self.http.response(self.http.file.readByteSync('/favicon.ico'), {
				'Accept-Ranges': 'bytes',
				'Content-Type': 'image/x-icon',
				'Cache-Control': 'public, max-age=2592000',//30 days
				'Expires': new Date(Date.now() + 2592000000).toUTCString(),
				// 'Pragma': 'no-cache'
				// 'Last-Modified': new Date(Date.now()),
				'Date': new Date(Date.now()),
			}, self.http._FaHttpStatusCode.ok);
		});
	}

	/**
	 *
	 * @param faServerClass {module.FaServerHttpClass}
	 */
	socketRoutes(faServerClass) {
		/** @type {module.FaServerHttpRoutesClass} */
		let context = this;
		/**
		 *
		 */
		faServerClass.router.attach('/socket.io.js', function () {
			/** @type {module.FaServerClass} */
			let self = this;
			let content = context._file.readByteSync('/node_modules/socket.io-client/dist/socket.io.slim.js');
			return self.http.response(content, self.http._FaHttpContentType.javascript);
		});
		/**
		 *
		 */
		faServerClass.router.attach('/socket.io.slim.js.map', function () {
			/** @type {module.FaServerClass} */
			let self = this;
			let content = context._file.readByteSync('/node_modules/socket.io-client/dist/socket.io.slim.js.map');
			// consoleLog(content);
			return self.http.response(content, {
				/*https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Content-Security-Policy/default-src*/
				// 'Content-Security-Policy': `default-src 'none';`,
				'Content-Type': self.http._FaHttpContentType.json,
			});
		});
		/**
		 *
		 */
		faServerClass.router.attach('/fa.js', function (req) {
			/** @type {module.FaServerClass} */
			let self = this;
			let content = [];
			if (req.get['libraries']) {
				req.get['libraries'].split(',').each(function (item) {
					// content.push(Buffer.from(`/*${item.toString().toUpperCase()}*/\n`));
					switch (item) {
						case 'socket':
							content.push(Buffer.from(
								`let FaSocketConfiguration = ${JSON.stringify({
									host: self.http.configuration.host,
									port: self.http.configuration.port,
									options: self.socket.configuration
								})};`
							));
							content.push(context._file.readByteSync('/ula-client/package-fa-nodejs/client/socket-client.js'));
							// content.push(context._file.asByteSync('vendor/fa-modules/socket.min.js'));
							break;
						default:
							content.push(context._file.readByteSync(`/ula-client/package-fa-nodejs/client/${item}.js`));
						// content.push(context._file.asByteSync(`vendor/fa-modules/${item}.min.js`));
					}
					content.push(Buffer.from(`;\n`));
				})
			} else {
				content.push(Buffer.from(`'use strict';\n`));
			}
			// return self.httpResponse(content.join(';'), self.Http._FaHttpContentType.javascript, self.Http._FaHttpStatusCode.ok);
			return self.http.response(Buffer.concat(content), self.http._FaHttpContentType.javascript, self.http._FaHttpStatusCode.ok);
		});
	}
};
