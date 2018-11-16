'use strict';

class Model {
	constructor(name) {
		this.class_name = name;
		this.adapter = {};
		this.data = {};
	}

	get name() {
		return this.class_name;
	}

	set setAdapter(adapter) {
		if (typeof adapter === "function") {
			this.adapter = adapter.call(this);
		} else {
			this.adapter = adapter;
		}
	}

	get getAdapter() {
		return this.adapter;
	}

	get getData() {
		return this.data;
	}

	set setData(converter) {
	}

	loadData(data) {
		this.data = data;
	}

	adapterFunction(data, adapter, options) {
		let context = this;
		return data.map(function (item) {
			let result = {};
			Object.entries(adapter).forEach(function ([index, element]) {
				if (typeof element === "object") {
					result[index] = context.adapterFunction([item], element, options)[0];
				} else if (typeof element === "function") {
					// FaConsole.consoleError(element);
					let result_function;
					try {
						result_function = element.call(this, item, options);
					} catch (exception) {
						result_function = undefined;
						// let Trace = require('./trace');
						// consoleLog(Trace.getData());
						// FaConsole.consoleError(exception);
					}
					result[index] = result_function !== undefined ? result_function : null;
				} else if (item) {
					result[index] = item[element] !== undefined ? item[element] : null;
				} else {
					result[index] = null;
				}
			});
			return result;
		});
	}

	applyAdapter(options) {
		if (Array.isArray(this.data) === true) {
			// this.data = this[_applyAdapter](this.data, this.getAdapter);
			this.data = this.adapterFunction(this.data, this.getAdapter, options);
		} else {
			// this.data = this[_applyAdapter]([this.data], this.getAdapter)[0];
			this.data = this.adapterFunction([this.data], this.getAdapter, options)[0]
		}
	}

	// [_applyConverter](data, converter) {
	// 	return data.map(function (item) {
	// 		let result = {};
	// 		Object.entries(item).forEach(function ([key, value]) {
	// 			if (converter[key] !== undefined) {
	// 				result[key] = converter[key].call(this, value);
	// 			} else {
	// 				result[key] = value;
	// 			}
	// 		});
	// 		return result;
	// 	});
	// }
	// applyConverter() {
	// 	if (Array.isArray(this.data) === true) {
	// 		this.data = this[_applyConverter](this.data, this.getConverter)
	// 		// this.data = this.converterFunction(this.data, this.getConverter)
	// 	} else {
	// 		this.data = this[_applyConverter]([this.data], this.getConverter)[0]
	// 		// this.data = this.converterFunction([this.data], this.getConverter)[0]
	// 	}
	// }
}

/**
 *
 * @type {Model}
 */
module.exports = Model;
