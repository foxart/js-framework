/* jshint strict: false */
const StackTrace = require('stack-trace');

/**
 *
 * @param func
 * @returns {Function}
 */
function getCaller(func) {
	return func.caller;
}

/**
 *
 * @param object {object}
 */
function extractData(object) {
	if (object) {
		return {
			typeName: object['getTypeName'](),
			functionName: object['getFunctionName'](),
			methodName: object['getMethodName'](),
			filePath: object['getFileName'](),
			lineNumber: object['getLineNumber'](),
			columnNumber: object['getColumnNumber'](),
			topLevelFlag: object['isToplevel'](),
			nativeFlag: object['isNative'](),
			evalFlag: object['isEval'](),
			evalOrigin: object['getEvalOrigin'](),
		}
	} else {
		return {
			typeName: 'undefined',
			functionName: 'undefined',
			methodName: 'undefined',
			filePath: 'undefined',
			lineNumber: 'undefined',
			columnNumber: 'undefined',
			topLevelFlag: 'undefined',
			nativeFlag: 'undefined',
			evalFlag: 'undefined',
			evalOrigin: 'undefined',
		}
	}
}

/**
 *
 * @param level
 * @returns {*}
 */
exports.getData = function (level) {
	let trace = StackTrace.get(getCaller(this.getData));
	if (level === undefined) {
		let result = [];
		for (let i = 0; i <= trace.length - 1; i++) {
			result.push(extractData(trace[i]));
		}
		return result
	} else {
		// server.console.log(StackTrace.extractFunction(trace[level]));
		return extractData(trace[level]);
	}
};

/**
 *
 * @param data
 * @returns {string|undefined}
 */
function extractString(data) {
	if (data.evalFlag) {
		return data.evalOrigin;
	} else {
		try {
			return `${data.filePath.replace(process.cwd(), '')}:${data.lineNumber}:${data.columnNumber}`;
		} catch (e) {
			// return `${data.filePath}:${data.lineNumber}:${data.columnNumber}`;
			return undefined;
		}
	}
}

/**
 * @param level {number}
 */
exports.getString = function (level) {
	return extractString(this.getData(level));
};

/**
 * @param data
 * @returns {string}
 */
function extractFunction(data) {
	if (data.evalFlag) {
		return '(eval)' + data.functionName;
	} else {
		return data.functionName;
	}
}

/**
 * @param level {number}
 */
exports.getFunction = function (level) {
	return extractFunction(this.getData(level));
};
