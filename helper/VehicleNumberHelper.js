"use strict";

class VehicleNumberHelper {
	constructor() {
		this.en = ['A', 'B', 'C', 'E', 'H', 'I', 'K', 'M', 'O', 'P', 'T', 'X',];
		this.ru = ['А', 'В', 'С', 'Е', 'Н', 'І', 'К', 'М', 'О', 'Р', 'Т', 'Х',];
	}

	/**
	 *
	 * @param number {string}
	 * @param from {Array}
	 * @param to {Array}
	 * @return {string}
	 * @private
	 */
	_mapFromTo(number, from, to) {
		return Array.from(number).map(function (character) {
			let index = from.indexOf(character);
			if (index === -1) {
				return character;
			} else {
				return to[index];
			}
		}).join("");
	}

	/**
	 *
	 * @param number {string}
	 * @return {string}
	 */
	mapRuToEn(number) {
		return this._mapFromTo(number, this.ru, this.en);
	}

	/**
	 *
	 * @param number {string}
	 * @return {string}
	 */
	mapEnToRu(number) {
		return this._mapFromTo(number, this.en, this.ru);
	}

	/**
	 *
	 * @param number {string}
	 * @return {Array}
	 */
	test(number) {
		let result = [];
		Array.from(number).forEach(function (value) {
			result.push(`${value}:${value.charCodeAt(0)}`);
		});
		return result;
	}
}

/**
 *
 * @type {VehicleNumberHelper}
 */
module.exports = VehicleNumberHelper;
