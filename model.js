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
					let result_function;
					result_function = element.call(this, item, options);
					if (result_function instanceof Error) {
						throw new Error(result_function);
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
}

/**
 *
 * @type {Model}
 */
module.exports = Model;
