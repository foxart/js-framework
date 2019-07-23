(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);throw new Error("Cannot find module '"+o+"'")}var f=n[o]={exports:{}};t[o][0].call(f.exports,function(e){var n=t[o][1][e];return s(n?n:e)},f,f.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
var lookup = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/';

;(function (exports) {
	'use strict';

  var Arr = (typeof Uint8Array !== 'undefined')
    ? Uint8Array
    : Array

	var PLUS   = '+'.charCodeAt(0)
	var SLASH  = '/'.charCodeAt(0)
	var NUMBER = '0'.charCodeAt(0)
	var LOWER  = 'a'.charCodeAt(0)
	var UPPER  = 'A'.charCodeAt(0)
	var PLUS_URL_SAFE = '-'.charCodeAt(0)
	var SLASH_URL_SAFE = '_'.charCodeAt(0)

	function decode (elt) {
		var code = elt.charCodeAt(0)
		if (code === PLUS ||
		    code === PLUS_URL_SAFE)
			return 62 // '+'
		if (code === SLASH ||
		    code === SLASH_URL_SAFE)
			return 63 // '/'
		if (code < NUMBER)
			return -1 //no match
		if (code < NUMBER + 10)
			return code - NUMBER + 26 + 26
		if (code < UPPER + 26)
			return code - UPPER
		if (code < LOWER + 26)
			return code - LOWER + 26
	}

	function b64ToByteArray (b64) {
		var i, j, l, tmp, placeHolders, arr

		if (b64.length % 4 > 0) {
			throw new Error('Invalid string. Length must be a multiple of 4')
		}

		// the number of equal signs (place holders)
		// if there are two placeholders, than the two characters before it
		// represent one byte
		// if there is only one, then the three characters before it represent 2 bytes
		// this is just a cheap hack to not do indexOf twice
		var len = b64.length
		placeHolders = '=' === b64.charAt(len - 2) ? 2 : '=' === b64.charAt(len - 1) ? 1 : 0

		// base64 is 4/3 + up to two characters of the original data
		arr = new Arr(b64.length * 3 / 4 - placeHolders)

		// if there are placeholders, only get up to the last complete 4 chars
		l = placeHolders > 0 ? b64.length - 4 : b64.length

		var L = 0

		function push (v) {
			arr[L++] = v
		}

		for (i = 0, j = 0; i < l; i += 4, j += 3) {
			tmp = (decode(b64.charAt(i)) << 18) | (decode(b64.charAt(i + 1)) << 12) | (decode(b64.charAt(i + 2)) << 6) | decode(b64.charAt(i + 3))
			push((tmp & 0xFF0000) >> 16)
			push((tmp & 0xFF00) >> 8)
			push(tmp & 0xFF)
		}

		if (placeHolders === 2) {
			tmp = (decode(b64.charAt(i)) << 2) | (decode(b64.charAt(i + 1)) >> 4)
			push(tmp & 0xFF)
		} else if (placeHolders === 1) {
			tmp = (decode(b64.charAt(i)) << 10) | (decode(b64.charAt(i + 1)) << 4) | (decode(b64.charAt(i + 2)) >> 2)
			push((tmp >> 8) & 0xFF)
			push(tmp & 0xFF)
		}

		return arr
	}

	function uint8ToBase64 (uint8) {
		var i,
			extraBytes = uint8.length % 3, // if we have 1 byte left, pad 2 bytes
			output = "",
			temp, length

		function encode (num) {
			return lookup.charAt(num)
		}

		function tripletToBase64 (num) {
			return encode(num >> 18 & 0x3F) + encode(num >> 12 & 0x3F) + encode(num >> 6 & 0x3F) + encode(num & 0x3F)
		}

		// go through the array every three bytes, we'll deal with trailing stuff later
		for (i = 0, length = uint8.length - extraBytes; i < length; i += 3) {
			temp = (uint8[i] << 16) + (uint8[i + 1] << 8) + (uint8[i + 2])
			output += tripletToBase64(temp)
		}

		// pad the end with zeros, but make sure to not forget the extra bytes
		switch (extraBytes) {
			case 1:
				temp = uint8[uint8.length - 1]
				output += encode(temp >> 2)
				output += encode((temp << 4) & 0x3F)
				output += '=='
				break
			case 2:
				temp = (uint8[uint8.length - 2] << 8) + (uint8[uint8.length - 1])
				output += encode(temp >> 10)
				output += encode((temp >> 4) & 0x3F)
				output += encode((temp << 2) & 0x3F)
				output += '='
				break
		}

		return output
	}

	exports.toByteArray = b64ToByteArray
	exports.fromByteArray = uint8ToBase64
}(typeof exports === 'undefined' ? (this.base64js = {}) : exports))

},{}],2:[function(require,module,exports){
/*!
 * The buffer module from node.js, for the browser.
 *
 * @author   Feross Aboukhadijeh <feross@feross.org> <http://feross.org>
 * @license  MIT
 */

var base64 = require('base64-js')
var ieee754 = require('ieee754')

exports.Buffer = Buffer
exports.SlowBuffer = Buffer
exports.INSPECT_MAX_BYTES = 50
Buffer.poolSize = 8192

/**
 * If `Buffer._useTypedArrays`:
 *   === true    Use Uint8Array implementation (fastest)
 *   === false   Use Object implementation (compatible down to IE6)
 */
Buffer._useTypedArrays = (function () {
  // Detect if browser supports Typed Arrays. Supported browsers are IE 10+, Firefox 4+,
  // Chrome 7+, Safari 5.1+, Opera 11.6+, iOS 4.2+. If the browser does not support adding
  // properties to `Uint8Array` instances, then that's the same as no `Uint8Array` support
  // because we need to be able to add all the node Buffer API methods. This is an issue
  // in Firefox 4-29. Now fixed: https://bugzilla.mozilla.org/show_bug.cgi?id=695438
  try {
    var buf = new ArrayBuffer(0)
    var arr = new Uint8Array(buf)
    arr.foo = function () { return 42 }
    return 42 === arr.foo() &&
        typeof arr.subarray === 'function' // Chrome 9-10 lack `subarray`
  } catch (e) {
    return false
  }
})()

/**
 * Class: Buffer
 * =============
 *
 * The Buffer constructor returns instances of `Uint8Array` that are augmented
 * with function properties for all the node `Buffer` API functions. We use
 * `Uint8Array` so that square bracket notation works as expected -- it returns
 * a single octet.
 *
 * By augmenting the instances, we can avoid modifying the `Uint8Array`
 * prototype.
 */
function Buffer (subject, encoding, noZero) {
  if (!(this instanceof Buffer))
    return new Buffer(subject, encoding, noZero)

  var type = typeof subject

  // Workaround: node's base64 implementation allows for non-padded strings
  // while base64-js does not.
  if (encoding === 'base64' && type === 'string') {
    subject = stringtrim(subject)
    while (subject.length % 4 !== 0) {
      subject = subject + '='
    }
  }

  // Find the length
  var length
  if (type === 'number')
    length = coerce(subject)
  else if (type === 'string')
    length = Buffer.byteLength(subject, encoding)
  else if (type === 'object')
    length = coerce(subject.length) // assume that object is array-like
  else
    throw new Error('First argument needs to be a number, array or string.')

  var buf
  if (Buffer._useTypedArrays) {
    // Preferred: Return an augmented `Uint8Array` instance for best performance
    buf = Buffer._augment(new Uint8Array(length))
  } else {
    // Fallback: Return THIS instance of Buffer (created by `new`)
    buf = this
    buf.length = length
    buf._isBuffer = true
  }

  var i
  if (Buffer._useTypedArrays && typeof subject.byteLength === 'number') {
    // Speed optimization -- use set if we're copying from a typed array
    buf._set(subject)
  } else if (isArrayish(subject)) {
    // Treat array-ish objects as a byte array
    for (i = 0; i < length; i++) {
      if (Buffer.isBuffer(subject))
        buf[i] = subject.readUInt8(i)
      else
        buf[i] = subject[i]
    }
  } else if (type === 'string') {
    buf.write(subject, 0, encoding)
  } else if (type === 'number' && !Buffer._useTypedArrays && !noZero) {
    for (i = 0; i < length; i++) {
      buf[i] = 0
    }
  }

  return buf
}

// STATIC METHODS
// ==============

Buffer.isEncoding = function (encoding) {
  switch (String(encoding).toLowerCase()) {
    case 'hex':
    case 'utf8':
    case 'utf-8':
    case 'ascii':
    case 'binary':
    case 'base64':
    case 'raw':
    case 'ucs2':
    case 'ucs-2':
    case 'utf16le':
    case 'utf-16le':
      return true
    default:
      return false
  }
}

Buffer.isBuffer = function (b) {
  return !!(b !== null && b !== undefined && b._isBuffer)
}

Buffer.byteLength = function (str, encoding) {
  var ret
  str = str + ''
  switch (encoding || 'utf8') {
    case 'hex':
      ret = str.length / 2
      break
    case 'utf8':
    case 'utf-8':
      ret = utf8ToBytes(str).length
      break
    case 'ascii':
    case 'binary':
    case 'raw':
      ret = str.length
      break
    case 'base64':
      ret = base64ToBytes(str).length
      break
    case 'ucs2':
    case 'ucs-2':
    case 'utf16le':
    case 'utf-16le':
      ret = str.length * 2
      break
    default:
      throw new Error('Unknown encoding')
  }
  return ret
}

Buffer.concat = function (list, totalLength) {
  assert(isArray(list), 'Usage: Buffer.concat(list, [totalLength])\n' +
      'list should be an Array.')

  if (list.length === 0) {
    return new Buffer(0)
  } else if (list.length === 1) {
    return list[0]
  }

  var i
  if (typeof totalLength !== 'number') {
    totalLength = 0
    for (i = 0; i < list.length; i++) {
      totalLength += list[i].length
    }
  }

  var buf = new Buffer(totalLength)
  var pos = 0
  for (i = 0; i < list.length; i++) {
    var item = list[i]
    item.copy(buf, pos)
    pos += item.length
  }
  return buf
}

// BUFFER INSTANCE METHODS
// =======================

function _hexWrite (buf, string, offset, length) {
  offset = Number(offset) || 0
  var remaining = buf.length - offset
  if (!length) {
    length = remaining
  } else {
    length = Number(length)
    if (length > remaining) {
      length = remaining
    }
  }

  // must be an even number of digits
  var strLen = string.length
  assert(strLen % 2 === 0, 'Invalid hex string')

  if (length > strLen / 2) {
    length = strLen / 2
  }
  for (var i = 0; i < length; i++) {
    var byte = parseInt(string.substr(i * 2, 2), 16)
    assert(!isNaN(byte), 'Invalid hex string')
    buf[offset + i] = byte
  }
  Buffer._charsWritten = i * 2
  return i
}

function _utf8Write (buf, string, offset, length) {
  var charsWritten = Buffer._charsWritten =
    blitBuffer(utf8ToBytes(string), buf, offset, length)
  return charsWritten
}

function _asciiWrite (buf, string, offset, length) {
  var charsWritten = Buffer._charsWritten =
    blitBuffer(asciiToBytes(string), buf, offset, length)
  return charsWritten
}

function _binaryWrite (buf, string, offset, length) {
  return _asciiWrite(buf, string, offset, length)
}

function _base64Write (buf, string, offset, length) {
  var charsWritten = Buffer._charsWritten =
    blitBuffer(base64ToBytes(string), buf, offset, length)
  return charsWritten
}

function _utf16leWrite (buf, string, offset, length) {
  var charsWritten = Buffer._charsWritten =
    blitBuffer(utf16leToBytes(string), buf, offset, length)
  return charsWritten
}

Buffer.prototype.write = function (string, offset, length, encoding) {
  // Support both (string, offset, length, encoding)
  // and the legacy (string, encoding, offset, length)
  if (isFinite(offset)) {
    if (!isFinite(length)) {
      encoding = length
      length = undefined
    }
  } else {  // legacy
    var swap = encoding
    encoding = offset
    offset = length
    length = swap
  }

  offset = Number(offset) || 0
  var remaining = this.length - offset
  if (!length) {
    length = remaining
  } else {
    length = Number(length)
    if (length > remaining) {
      length = remaining
    }
  }
  encoding = String(encoding || 'utf8').toLowerCase()

  var ret
  switch (encoding) {
    case 'hex':
      ret = _hexWrite(this, string, offset, length)
      break
    case 'utf8':
    case 'utf-8':
      ret = _utf8Write(this, string, offset, length)
      break
    case 'ascii':
      ret = _asciiWrite(this, string, offset, length)
      break
    case 'binary':
      ret = _binaryWrite(this, string, offset, length)
      break
    case 'base64':
      ret = _base64Write(this, string, offset, length)
      break
    case 'ucs2':
    case 'ucs-2':
    case 'utf16le':
    case 'utf-16le':
      ret = _utf16leWrite(this, string, offset, length)
      break
    default:
      throw new Error('Unknown encoding')
  }
  return ret
}

Buffer.prototype.toString = function (encoding, start, end) {
  var self = this

  encoding = String(encoding || 'utf8').toLowerCase()
  start = Number(start) || 0
  end = (end !== undefined)
    ? Number(end)
    : end = self.length

  // Fastpath empty strings
  if (end === start)
    return ''

  var ret
  switch (encoding) {
    case 'hex':
      ret = _hexSlice(self, start, end)
      break
    case 'utf8':
    case 'utf-8':
      ret = _utf8Slice(self, start, end)
      break
    case 'ascii':
      ret = _asciiSlice(self, start, end)
      break
    case 'binary':
      ret = _binarySlice(self, start, end)
      break
    case 'base64':
      ret = _base64Slice(self, start, end)
      break
    case 'ucs2':
    case 'ucs-2':
    case 'utf16le':
    case 'utf-16le':
      ret = _utf16leSlice(self, start, end)
      break
    default:
      throw new Error('Unknown encoding')
  }
  return ret
}

Buffer.prototype.toJSON = function () {
  return {
    type: 'Buffer',
    data: Array.prototype.slice.call(this._arr || this, 0)
  }
}

// copy(targetBuffer, targetStart=0, sourceStart=0, sourceEnd=buffer.length)
Buffer.prototype.copy = function (target, target_start, start, end) {
  var source = this

  if (!start) start = 0
  if (!end && end !== 0) end = this.length
  if (!target_start) target_start = 0

  // Copy 0 bytes; we're done
  if (end === start) return
  if (target.length === 0 || source.length === 0) return

  // Fatal error conditions
  assert(end >= start, 'sourceEnd < sourceStart')
  assert(target_start >= 0 && target_start < target.length,
      'targetStart out of bounds')
  assert(start >= 0 && start < source.length, 'sourceStart out of bounds')
  assert(end >= 0 && end <= source.length, 'sourceEnd out of bounds')

  // Are we oob?
  if (end > this.length)
    end = this.length
  if (target.length - target_start < end - start)
    end = target.length - target_start + start

  var len = end - start

  if (len < 100 || !Buffer._useTypedArrays) {
    for (var i = 0; i < len; i++)
      target[i + target_start] = this[i + start]
  } else {
    target._set(this.subarray(start, start + len), target_start)
  }
}

function _base64Slice (buf, start, end) {
  if (start === 0 && end === buf.length) {
    return base64.fromByteArray(buf)
  } else {
    return base64.fromByteArray(buf.slice(start, end))
  }
}

function _utf8Slice (buf, start, end) {
  var res = ''
  var tmp = ''
  end = Math.min(buf.length, end)

  for (var i = start; i < end; i++) {
    if (buf[i] <= 0x7F) {
      res += decodeUtf8Char(tmp) + String.fromCharCode(buf[i])
      tmp = ''
    } else {
      tmp += '%' + buf[i].toString(16)
    }
  }

  return res + decodeUtf8Char(tmp)
}

function _asciiSlice (buf, start, end) {
  var ret = ''
  end = Math.min(buf.length, end)

  for (var i = start; i < end; i++)
    ret += String.fromCharCode(buf[i])
  return ret
}

function _binarySlice (buf, start, end) {
  return _asciiSlice(buf, start, end)
}

function _hexSlice (buf, start, end) {
  var len = buf.length

  if (!start || start < 0) start = 0
  if (!end || end < 0 || end > len) end = len

  var out = ''
  for (var i = start; i < end; i++) {
    out += toHex(buf[i])
  }
  return out
}

function _utf16leSlice (buf, start, end) {
  var bytes = buf.slice(start, end)
  var res = ''
  for (var i = 0; i < bytes.length; i += 2) {
    res += String.fromCharCode(bytes[i] + bytes[i+1] * 256)
  }
  return res
}

Buffer.prototype.slice = function (start, end) {
  var len = this.length
  start = clamp(start, len, 0)
  end = clamp(end, len, len)

  if (Buffer._useTypedArrays) {
    return Buffer._augment(this.subarray(start, end))
  } else {
    var sliceLen = end - start
    var newBuf = new Buffer(sliceLen, undefined, true)
    for (var i = 0; i < sliceLen; i++) {
      newBuf[i] = this[i + start]
    }
    return newBuf
  }
}

// `get` will be removed in Node 0.13+
Buffer.prototype.get = function (offset) {
  console.log('.get() is deprecated. Access using array indexes instead.')
  return this.readUInt8(offset)
}

// `set` will be removed in Node 0.13+
Buffer.prototype.set = function (v, offset) {
  console.log('.set() is deprecated. Access using array indexes instead.')
  return this.writeUInt8(v, offset)
}

Buffer.prototype.readUInt8 = function (offset, noAssert) {
  if (!noAssert) {
    assert(offset !== undefined && offset !== null, 'missing offset')
    assert(offset < this.length, 'Trying to read beyond buffer length')
  }

  if (offset >= this.length)
    return

  return this[offset]
}

function _readUInt16 (buf, offset, littleEndian, noAssert) {
  if (!noAssert) {
    assert(typeof littleEndian === 'boolean', 'missing or invalid endian')
    assert(offset !== undefined && offset !== null, 'missing offset')
    assert(offset + 1 < buf.length, 'Trying to read beyond buffer length')
  }

  var len = buf.length
  if (offset >= len)
    return

  var val
  if (littleEndian) {
    val = buf[offset]
    if (offset + 1 < len)
      val |= buf[offset + 1] << 8
  } else {
    val = buf[offset] << 8
    if (offset + 1 < len)
      val |= buf[offset + 1]
  }
  return val
}

Buffer.prototype.readUInt16LE = function (offset, noAssert) {
  return _readUInt16(this, offset, true, noAssert)
}

Buffer.prototype.readUInt16BE = function (offset, noAssert) {
  return _readUInt16(this, offset, false, noAssert)
}

function _readUInt32 (buf, offset, littleEndian, noAssert) {
  if (!noAssert) {
    assert(typeof littleEndian === 'boolean', 'missing or invalid endian')
    assert(offset !== undefined && offset !== null, 'missing offset')
    assert(offset + 3 < buf.length, 'Trying to read beyond buffer length')
  }

  var len = buf.length
  if (offset >= len)
    return

  var val
  if (littleEndian) {
    if (offset + 2 < len)
      val = buf[offset + 2] << 16
    if (offset + 1 < len)
      val |= buf[offset + 1] << 8
    val |= buf[offset]
    if (offset + 3 < len)
      val = val + (buf[offset + 3] << 24 >>> 0)
  } else {
    if (offset + 1 < len)
      val = buf[offset + 1] << 16
    if (offset + 2 < len)
      val |= buf[offset + 2] << 8
    if (offset + 3 < len)
      val |= buf[offset + 3]
    val = val + (buf[offset] << 24 >>> 0)
  }
  return val
}

Buffer.prototype.readUInt32LE = function (offset, noAssert) {
  return _readUInt32(this, offset, true, noAssert)
}

Buffer.prototype.readUInt32BE = function (offset, noAssert) {
  return _readUInt32(this, offset, false, noAssert)
}

Buffer.prototype.readInt8 = function (offset, noAssert) {
  if (!noAssert) {
    assert(offset !== undefined && offset !== null,
        'missing offset')
    assert(offset < this.length, 'Trying to read beyond buffer length')
  }

  if (offset >= this.length)
    return

  var neg = this[offset] & 0x80
  if (neg)
    return (0xff - this[offset] + 1) * -1
  else
    return this[offset]
}

function _readInt16 (buf, offset, littleEndian, noAssert) {
  if (!noAssert) {
    assert(typeof littleEndian === 'boolean', 'missing or invalid endian')
    assert(offset !== undefined && offset !== null, 'missing offset')
    assert(offset + 1 < buf.length, 'Trying to read beyond buffer length')
  }

  var len = buf.length
  if (offset >= len)
    return

  var val = _readUInt16(buf, offset, littleEndian, true)
  var neg = val & 0x8000
  if (neg)
    return (0xffff - val + 1) * -1
  else
    return val
}

Buffer.prototype.readInt16LE = function (offset, noAssert) {
  return _readInt16(this, offset, true, noAssert)
}

Buffer.prototype.readInt16BE = function (offset, noAssert) {
  return _readInt16(this, offset, false, noAssert)
}

function _readInt32 (buf, offset, littleEndian, noAssert) {
  if (!noAssert) {
    assert(typeof littleEndian === 'boolean', 'missing or invalid endian')
    assert(offset !== undefined && offset !== null, 'missing offset')
    assert(offset + 3 < buf.length, 'Trying to read beyond buffer length')
  }

  var len = buf.length
  if (offset >= len)
    return

  var val = _readUInt32(buf, offset, littleEndian, true)
  var neg = val & 0x80000000
  if (neg)
    return (0xffffffff - val + 1) * -1
  else
    return val
}

Buffer.prototype.readInt32LE = function (offset, noAssert) {
  return _readInt32(this, offset, true, noAssert)
}

Buffer.prototype.readInt32BE = function (offset, noAssert) {
  return _readInt32(this, offset, false, noAssert)
}

function _readFloat (buf, offset, littleEndian, noAssert) {
  if (!noAssert) {
    assert(typeof littleEndian === 'boolean', 'missing or invalid endian')
    assert(offset + 3 < buf.length, 'Trying to read beyond buffer length')
  }

  return ieee754.read(buf, offset, littleEndian, 23, 4)
}

Buffer.prototype.readFloatLE = function (offset, noAssert) {
  return _readFloat(this, offset, true, noAssert)
}

Buffer.prototype.readFloatBE = function (offset, noAssert) {
  return _readFloat(this, offset, false, noAssert)
}

function _readDouble (buf, offset, littleEndian, noAssert) {
  if (!noAssert) {
    assert(typeof littleEndian === 'boolean', 'missing or invalid endian')
    assert(offset + 7 < buf.length, 'Trying to read beyond buffer length')
  }

  return ieee754.read(buf, offset, littleEndian, 52, 8)
}

Buffer.prototype.readDoubleLE = function (offset, noAssert) {
  return _readDouble(this, offset, true, noAssert)
}

Buffer.prototype.readDoubleBE = function (offset, noAssert) {
  return _readDouble(this, offset, false, noAssert)
}

Buffer.prototype.writeUInt8 = function (value, offset, noAssert) {
  if (!noAssert) {
    assert(value !== undefined && value !== null, 'missing value')
    assert(offset !== undefined && offset !== null, 'missing offset')
    assert(offset < this.length, 'trying to write beyond buffer length')
    verifuint(value, 0xff)
  }

  if (offset >= this.length) return

  this[offset] = value
}

function _writeUInt16 (buf, value, offset, littleEndian, noAssert) {
  if (!noAssert) {
    assert(value !== undefined && value !== null, 'missing value')
    assert(typeof littleEndian === 'boolean', 'missing or invalid endian')
    assert(offset !== undefined && offset !== null, 'missing offset')
    assert(offset + 1 < buf.length, 'trying to write beyond buffer length')
    verifuint(value, 0xffff)
  }

  var len = buf.length
  if (offset >= len)
    return

  for (var i = 0, j = Math.min(len - offset, 2); i < j; i++) {
    buf[offset + i] =
        (value & (0xff << (8 * (littleEndian ? i : 1 - i)))) >>>
            (littleEndian ? i : 1 - i) * 8
  }
}

Buffer.prototype.writeUInt16LE = function (value, offset, noAssert) {
  _writeUInt16(this, value, offset, true, noAssert)
}

Buffer.prototype.writeUInt16BE = function (value, offset, noAssert) {
  _writeUInt16(this, value, offset, false, noAssert)
}

function _writeUInt32 (buf, value, offset, littleEndian, noAssert) {
  if (!noAssert) {
    assert(value !== undefined && value !== null, 'missing value')
    assert(typeof littleEndian === 'boolean', 'missing or invalid endian')
    assert(offset !== undefined && offset !== null, 'missing offset')
    assert(offset + 3 < buf.length, 'trying to write beyond buffer length')
    verifuint(value, 0xffffffff)
  }

  var len = buf.length
  if (offset >= len)
    return

  for (var i = 0, j = Math.min(len - offset, 4); i < j; i++) {
    buf[offset + i] =
        (value >>> (littleEndian ? i : 3 - i) * 8) & 0xff
  }
}

Buffer.prototype.writeUInt32LE = function (value, offset, noAssert) {
  _writeUInt32(this, value, offset, true, noAssert)
}

Buffer.prototype.writeUInt32BE = function (value, offset, noAssert) {
  _writeUInt32(this, value, offset, false, noAssert)
}

Buffer.prototype.writeInt8 = function (value, offset, noAssert) {
  if (!noAssert) {
    assert(value !== undefined && value !== null, 'missing value')
    assert(offset !== undefined && offset !== null, 'missing offset')
    assert(offset < this.length, 'Trying to write beyond buffer length')
    verifsint(value, 0x7f, -0x80)
  }

  if (offset >= this.length)
    return

  if (value >= 0)
    this.writeUInt8(value, offset, noAssert)
  else
    this.writeUInt8(0xff + value + 1, offset, noAssert)
}

function _writeInt16 (buf, value, offset, littleEndian, noAssert) {
  if (!noAssert) {
    assert(value !== undefined && value !== null, 'missing value')
    assert(typeof littleEndian === 'boolean', 'missing or invalid endian')
    assert(offset !== undefined && offset !== null, 'missing offset')
    assert(offset + 1 < buf.length, 'Trying to write beyond buffer length')
    verifsint(value, 0x7fff, -0x8000)
  }

  var len = buf.length
  if (offset >= len)
    return

  if (value >= 0)
    _writeUInt16(buf, value, offset, littleEndian, noAssert)
  else
    _writeUInt16(buf, 0xffff + value + 1, offset, littleEndian, noAssert)
}

Buffer.prototype.writeInt16LE = function (value, offset, noAssert) {
  _writeInt16(this, value, offset, true, noAssert)
}

Buffer.prototype.writeInt16BE = function (value, offset, noAssert) {
  _writeInt16(this, value, offset, false, noAssert)
}

function _writeInt32 (buf, value, offset, littleEndian, noAssert) {
  if (!noAssert) {
    assert(value !== undefined && value !== null, 'missing value')
    assert(typeof littleEndian === 'boolean', 'missing or invalid endian')
    assert(offset !== undefined && offset !== null, 'missing offset')
    assert(offset + 3 < buf.length, 'Trying to write beyond buffer length')
    verifsint(value, 0x7fffffff, -0x80000000)
  }

  var len = buf.length
  if (offset >= len)
    return

  if (value >= 0)
    _writeUInt32(buf, value, offset, littleEndian, noAssert)
  else
    _writeUInt32(buf, 0xffffffff + value + 1, offset, littleEndian, noAssert)
}

Buffer.prototype.writeInt32LE = function (value, offset, noAssert) {
  _writeInt32(this, value, offset, true, noAssert)
}

Buffer.prototype.writeInt32BE = function (value, offset, noAssert) {
  _writeInt32(this, value, offset, false, noAssert)
}

function _writeFloat (buf, value, offset, littleEndian, noAssert) {
  if (!noAssert) {
    assert(value !== undefined && value !== null, 'missing value')
    assert(typeof littleEndian === 'boolean', 'missing or invalid endian')
    assert(offset !== undefined && offset !== null, 'missing offset')
    assert(offset + 3 < buf.length, 'Trying to write beyond buffer length')
    verifIEEE754(value, 3.4028234663852886e+38, -3.4028234663852886e+38)
  }

  var len = buf.length
  if (offset >= len)
    return

  ieee754.write(buf, value, offset, littleEndian, 23, 4)
}

Buffer.prototype.writeFloatLE = function (value, offset, noAssert) {
  _writeFloat(this, value, offset, true, noAssert)
}

Buffer.prototype.writeFloatBE = function (value, offset, noAssert) {
  _writeFloat(this, value, offset, false, noAssert)
}

function _writeDouble (buf, value, offset, littleEndian, noAssert) {
  if (!noAssert) {
    assert(value !== undefined && value !== null, 'missing value')
    assert(typeof littleEndian === 'boolean', 'missing or invalid endian')
    assert(offset !== undefined && offset !== null, 'missing offset')
    assert(offset + 7 < buf.length,
        'Trying to write beyond buffer length')
    verifIEEE754(value, 1.7976931348623157E+308, -1.7976931348623157E+308)
  }

  var len = buf.length
  if (offset >= len)
    return

  ieee754.write(buf, value, offset, littleEndian, 52, 8)
}

Buffer.prototype.writeDoubleLE = function (value, offset, noAssert) {
  _writeDouble(this, value, offset, true, noAssert)
}

Buffer.prototype.writeDoubleBE = function (value, offset, noAssert) {
  _writeDouble(this, value, offset, false, noAssert)
}

// fill(value, start=0, end=buffer.length)
Buffer.prototype.fill = function (value, start, end) {
  if (!value) value = 0
  if (!start) start = 0
  if (!end) end = this.length

  if (typeof value === 'string') {
    value = value.charCodeAt(0)
  }

  assert(typeof value === 'number' && !isNaN(value), 'value is not a number')
  assert(end >= start, 'end < start')

  // Fill 0 bytes; we're done
  if (end === start) return
  if (this.length === 0) return

  assert(start >= 0 && start < this.length, 'start out of bounds')
  assert(end >= 0 && end <= this.length, 'end out of bounds')

  for (var i = start; i < end; i++) {
    this[i] = value
  }
}

Buffer.prototype.inspect = function () {
  var out = []
  var len = this.length
  for (var i = 0; i < len; i++) {
    out[i] = toHex(this[i])
    if (i === exports.INSPECT_MAX_BYTES) {
      out[i + 1] = '...'
      break
    }
  }
  return '<Buffer ' + out.join(' ') + '>'
}

/**
 * Creates a new `ArrayBuffer` with the *copied* memory of the buffer instance.
 * Added in Node 0.12. Only available in browsers that support ArrayBuffer.
 */
Buffer.prototype.toArrayBuffer = function () {
  if (typeof Uint8Array !== 'undefined') {
    if (Buffer._useTypedArrays) {
      return (new Buffer(this)).buffer
    } else {
      var buf = new Uint8Array(this.length)
      for (var i = 0, len = buf.length; i < len; i += 1)
        buf[i] = this[i]
      return buf.buffer
    }
  } else {
    throw new Error('Buffer.toArrayBuffer not supported in this browser')
  }
}

// HELPER FUNCTIONS
// ================

function stringtrim (str) {
  if (str.trim) return str.trim()
  return str.replace(/^\s+|\s+$/g, '')
}

var BP = Buffer.prototype

/**
 * Augment a Uint8Array *instance* (not the Uint8Array class!) with Buffer methods
 */
Buffer._augment = function (arr) {
  arr._isBuffer = true

  // save reference to original Uint8Array get/set methods before overwriting
  arr._get = arr.get
  arr._set = arr.set

  // deprecated, will be removed in node 0.13+
  arr.get = BP.get
  arr.set = BP.set

  arr.write = BP.write
  arr.toString = BP.toString
  arr.toLocaleString = BP.toString
  arr.toJSON = BP.toJSON
  arr.copy = BP.copy
  arr.slice = BP.slice
  arr.readUInt8 = BP.readUInt8
  arr.readUInt16LE = BP.readUInt16LE
  arr.readUInt16BE = BP.readUInt16BE
  arr.readUInt32LE = BP.readUInt32LE
  arr.readUInt32BE = BP.readUInt32BE
  arr.readInt8 = BP.readInt8
  arr.readInt16LE = BP.readInt16LE
  arr.readInt16BE = BP.readInt16BE
  arr.readInt32LE = BP.readInt32LE
  arr.readInt32BE = BP.readInt32BE
  arr.readFloatLE = BP.readFloatLE
  arr.readFloatBE = BP.readFloatBE
  arr.readDoubleLE = BP.readDoubleLE
  arr.readDoubleBE = BP.readDoubleBE
  arr.writeUInt8 = BP.writeUInt8
  arr.writeUInt16LE = BP.writeUInt16LE
  arr.writeUInt16BE = BP.writeUInt16BE
  arr.writeUInt32LE = BP.writeUInt32LE
  arr.writeUInt32BE = BP.writeUInt32BE
  arr.writeInt8 = BP.writeInt8
  arr.writeInt16LE = BP.writeInt16LE
  arr.writeInt16BE = BP.writeInt16BE
  arr.writeInt32LE = BP.writeInt32LE
  arr.writeInt32BE = BP.writeInt32BE
  arr.writeFloatLE = BP.writeFloatLE
  arr.writeFloatBE = BP.writeFloatBE
  arr.writeDoubleLE = BP.writeDoubleLE
  arr.writeDoubleBE = BP.writeDoubleBE
  arr.fill = BP.fill
  arr.inspect = BP.inspect
  arr.toArrayBuffer = BP.toArrayBuffer

  return arr
}

// slice(start, end)
function clamp (index, len, defaultValue) {
  if (typeof index !== 'number') return defaultValue
  index = ~~index;  // Coerce to integer.
  if (index >= len) return len
  if (index >= 0) return index
  index += len
  if (index >= 0) return index
  return 0
}

function coerce (length) {
  // Coerce length to a number (possibly NaN), round up
  // in case it's fractional (e.g. 123.456) then do a
  // double negate to coerce a NaN to 0. Easy, right?
  length = ~~Math.ceil(+length)
  return length < 0 ? 0 : length
}

function isArray (subject) {
  return (Array.isArray || function (subject) {
    return Object.prototype.toString.call(subject) === '[object Array]'
  })(subject)
}

function isArrayish (subject) {
  return isArray(subject) || Buffer.isBuffer(subject) ||
      subject && typeof subject === 'object' &&
      typeof subject.length === 'number'
}

function toHex (n) {
  if (n < 16) return '0' + n.toString(16)
  return n.toString(16)
}

function utf8ToBytes (str) {
  var byteArray = []
  for (var i = 0; i < str.length; i++) {
    var b = str.charCodeAt(i)
    if (b <= 0x7F)
      byteArray.push(str.charCodeAt(i))
    else {
      var start = i
      if (b >= 0xD800 && b <= 0xDFFF) i++
      var h = encodeURIComponent(str.slice(start, i+1)).substr(1).split('%')
      for (var j = 0; j < h.length; j++)
        byteArray.push(parseInt(h[j], 16))
    }
  }
  return byteArray
}

function asciiToBytes (str) {
  var byteArray = []
  for (var i = 0; i < str.length; i++) {
    // Node's code seems to be doing this and not & 0x7F..
    byteArray.push(str.charCodeAt(i) & 0xFF)
  }
  return byteArray
}

function utf16leToBytes (str) {
  var c, hi, lo
  var byteArray = []
  for (var i = 0; i < str.length; i++) {
    c = str.charCodeAt(i)
    hi = c >> 8
    lo = c % 256
    byteArray.push(lo)
    byteArray.push(hi)
  }

  return byteArray
}

function base64ToBytes (str) {
  return base64.toByteArray(str)
}

function blitBuffer (src, dst, offset, length) {
  var pos
  for (var i = 0; i < length; i++) {
    if ((i + offset >= dst.length) || (i >= src.length))
      break
    dst[i + offset] = src[i]
  }
  return i
}

function decodeUtf8Char (str) {
  try {
    return decodeURIComponent(str)
  } catch (err) {
    return String.fromCharCode(0xFFFD) // UTF 8 invalid char
  }
}

/*
 * We have to make sure that the value is a valid integer. This means that it
 * is non-negative. It has no fractional component and that it does not
 * exceed the maximum allowed value.
 */
function verifuint (value, max) {
  assert(typeof value === 'number', 'cannot write a non-number as a number')
  assert(value >= 0, 'specified a negative value for writing an unsigned value')
  assert(value <= max, 'value is larger than maximum value for type')
  assert(Math.floor(value) === value, 'value has a fractional component')
}

function verifsint (value, max, min) {
  assert(typeof value === 'number', 'cannot write a non-number as a number')
  assert(value <= max, 'value larger than maximum allowed value')
  assert(value >= min, 'value smaller than minimum allowed value')
  assert(Math.floor(value) === value, 'value has a fractional component')
}

function verifIEEE754 (value, max, min) {
  assert(typeof value === 'number', 'cannot write a non-number as a number')
  assert(value <= max, 'value larger than maximum allowed value')
  assert(value >= min, 'value smaller than minimum allowed value')
}

function assert (test, message) {
  if (!test) throw new Error(message || 'Failed assertion')
}

},{"base64-js":1,"ieee754":18}],3:[function(require,module,exports){
"use strict";
class FaTrace {
	/**
	 *
	 * @param stack {Array}
	 * @return {Array}
	 * @private
	 */
	static _extractFromStack(stack) {
		let result = [];
		let Expression1 = new RegExp("^\\s+at\\s(.+)\\s\\((.+):(\\d+):(\\d+)\\)$");
		let Expression2 = new RegExp("^\\s+at\\s(.+):(\\d+):(\\d+)$");
		let Expression3 = new RegExp("^\\s+at\\s(.+)$");
		stack.forEach(function (item) {
			let Match1 = Expression1.exec(item);
			let Match2 = Expression2.exec(item);
			let Match3 = Expression3.exec(item);
			if (Match1) {
				result.push({
					method: Match1[1],
					path: Match1[2],
					line: Match1[3],
					column: Match1[4],
				});
			} else if (Match2) {
				result.push({
					method: null,
					path: Match2[1],
					line: Match2[2],
					column: Match2[3],
				});
			} else if (Match3) {
				result.push({
					method: Match3[1],
					path: null,
					line: null,
					column: null,
				});
			} else {
				console.error(`can't parse stack string: ${stack}`);
				// throw new Error(`can't parse stack string: ${item}`);
			}
		});
		return result;
	}

	/**
	 *
	 * @param level {number|null}
	 * @return {Array|Object}
	 */
	static trace(level = null) {
		let stack = new Error()["stack"];
		let data = stack.split("\n");
		data.splice(0, 2);
		let result = FaTrace._extractFromStack(data);
		if (level !== null) {
			return result[level];
		} else {
			return result;
		}
	}

	/**
	 *
	 * @param stack
	 * @param level {number|null}
	 * @return {Array|Object}
	 */
	static stack(stack, level = null) {
		let data = stack.split("\n");
		data.splice(0, 1);
		let result = FaTrace._extractFromStack(data);
		if (level !== null) {
			return result[level];
		} else {
			return result;
		}
	}

	/**
	 * @deprecated
	 * @param stack
	 * @return {Array}
	 */
	// old(stack) {
	// 	let text = stack.split("\n");
	// 	let ExpressionMethod = new RegExp("^(.+) \\((.+)\\)$");
	// 	let ExpressionString = new RegExp("^(.+):(\\d+):(\\d+)$");
	// 	let result = [];
	// 	text.splice(0, 1);
	// 	text.forEach(function (item) {
	// 		let trace = {
	// 			method: null,
	// 			path: null,
	// 			line: null,
	// 			column: null,
	// 		};
	// 		let string = "";
	// 		let line = item.slice(item.indexOf("at ") + 3, item.length);
	// 		let MatchMethod = ExpressionMethod.exec(line);
	// 		if (MatchMethod) {
	// 			trace.method = MatchMethod[1];
	// 			string = MatchMethod[2];
	// 		} else {
	// 			string = line;
	// 		}
	// 		let MatchString = ExpressionString.exec(string);
	// 		if (MatchString) {
	// 			trace.path = MatchString[1];
	// 			trace.line = MatchString[2];
	// 			trace.column = MatchString[3];
	// 		} else {
	// 			trace.method = string;
	// 		}
	// 		result.push(trace);
	// 	});
	// 	return result;
	// }
}
/**
 *
 * @type {FaTrace}
 */
module.exports = FaTrace;

},{}],4:[function(require,module,exports){
"use strict";
const FaBeautifyConsole = require("./console");
const FCH = require("../console/console-helper");

class FaBeautifyConsoleType extends FaBeautifyConsole {
	wrapDataKey(key, type, length, level) {
		let tab = this.getTab(level);
		let dimension = "";
		if (length) {
			dimension = `${type.capitalize()}(${length})`
		} else {
			dimension = type.capitalize();
		}
		switch (type) {
			// case "array":
			// 	return `${tab}${FCH.effect.bold}${key}${FCH.effect.reset} ${FCH.effect.dim}${FCH.color.green}${dimension}${FCH.effect.reset}: `;
			// case "object":
			// 	return `${tab}${FCH.effect.bold}${key}${FCH.effect.reset} ${FCH.effect.dim}${FCH.color.cyan}${dimension}${FCH.effect.reset}: `;
			case "json":
				return `${tab}${FCH.effect.bold}${key}${FCH.effect.reset} ${FCH.bg.green}${FCH.color.white}${dimension}${FCH.effect.reset}: `;
			case "xml":
				return `${tab}${FCH.effect.bold}${key}${FCH.effect.reset} ${FCH.bg.red}${FCH.color.white}${dimension}${FCH.effect.reset}: `;
			default:
				return `${tab}${FCH.effect.bold}${key}${FCH.effect.reset} ${FCH.effect.dim}${dimension}${FCH.effect.reset}: `;
		}
	}

	wrapDataValue(data, type, length, level) {
		let tab = this.getTab(level);
		let nl = "\n";
		switch (type) {
			// case "array":
			// 	return `${FCH.effect.dim}${FCH.color.green}[${FCH.effect.reset}${nl}${data}${tab}${FCH.effect.reset}${FCH.effect.dim}${FCH.color.green}]${FCH.effect.reset}`;
			// case "object":
			// 	return `${FCH.effect.dim}${FCH.color.cyan}{${FCH.effect.reset}${nl}${data}${tab}${FCH.effect.reset}${FCH.effect.dim}${FCH.color.cyan}}${FCH.effect.reset}`;
			case "json":
				return `${FCH.effect.dim}{${FCH.effect.reset}${nl}${data}${tab}${FCH.effect.reset}${FCH.effect.dim}}${FCH.effect.reset}`;
			case "xml":
				return `${FCH.effect.dim}{${FCH.effect.reset}${nl}${data}${tab}${FCH.effect.reset}${FCH.effect.dim}}${FCH.effect.reset}`;
			default:
				return super.wrapDataValue(data, type, length, level);
		}
	}
}

/**
 *
 * @type {FaBeautifyConsoleType}
 */
module.exports = FaBeautifyConsoleType;

},{"../console/console-helper":10,"./console":5}],5:[function(require,module,exports){
"use strict";
const FaBeautifyWrap = require("./wrap");
const FCH = require("../console/console-helper");

class FaBeautifyConsole extends FaBeautifyWrap {
	wrapDataKey(key, type, length, level) {
		return `${this.getTab(level)}${FCH.effect.bold}${FCH.color.white}${key}${FCH.effect.reset}: `;
	}

	wrapDataValue(value, type, length, level) {
		let tab = this.getTab(level);
		let nl = "\n";
		switch (type) {
			case "array":
				return `${FCH.effect.dim}${FCH.color.white}[${FCH.effect.reset}${nl}${value}${tab}${FCH.effect.dim}${FCH.color.white}]${FCH.effect.reset}`;
			case "bool":
				return `${FCH.effect.bold}${value === true ? FCH.color.green : FCH.color.red}${value}${FCH.effect.reset}`;
			case "buffer":
				return `${FCH.effect.dim}<${FCH.effect.reset}${FCH.effect.bold}${FCH.color.blue}${type}${FCH.effect.reset}${FCH.effect.dim}>${FCH.effect.reset}`;
			case "circular":
				return `${FCH.effect.dim}<${FCH.effect.reset}${FCH.effect.bold}${FCH.color.cyan}${type}${FCH.effect.reset}${FCH.effect.dim}>${FCH.effect.reset}`;
			case "date":
				return `${FCH.color.yellow}${value}${FCH.effect.reset}`;
			case "file":
				return `${FCH.effect.dim}<${FCH.effect.reset}${FCH.effect.bold}${FCH.color.blue}${value}${FCH.effect.reset}${FCH.effect.dim}>${FCH.effect.reset}`;
			case "float":
				return `${FCH.color.red}${value}${FCH.effect.reset}`;
			case "function":
				return `${FCH.color.cyan}${value}${FCH.effect.reset}`;
			case "json":
				return `${FCH.bg.green}{${FCH.effect.reset}${nl}${value}${tab}${FCH.bg.green}}${FCH.effect.reset}`;
			case "int":
				return `${FCH.color.green}${value}${FCH.effect.reset}`;
			case "mongoId":
				return `${FCH.color.white}<${FCH.effect.reset}${FCH.effect.bold}${FCH.color.white}${value}${FCH.effect.reset}${FCH.color.white}>${FCH.effect.reset}`;
			case "null":
				return `${FCH.effect.bold}${FCH.color.cyan}${value}${FCH.effect.reset}`;
			case "object":
				return `${FCH.effect.dim}${FCH.color.white}{${FCH.effect.reset}${nl}${value}${tab}${FCH.effect.dim}${FCH.color.white}}${FCH.effect.reset}`;
			case "regExp":
				return `${FCH.effect.bold}${FCH.color.yellow}${value}${FCH.effect.reset}`;
			case "string":
				return `${FCH.effect.dim}${FCH.color.white}"${FCH.effect.reset}${FCH.color.white}${value}${FCH.effect.reset}${FCH.effect.dim}${FCH.color.white}"${FCH.effect.reset}`;
			case "undefined":
				return `${FCH.effect.bold}${FCH.color.magenta}${value}${FCH.effect.reset}`;
			case "xml":
				return `${FCH.bg.red}{${FCH.effect.reset}${nl}${value}${tab}${FCH.bg.red}}${FCH.effect.reset}`;
			default:
				return `${FCH.bg.magenta}/*${type}*/${FCH.effect.reset}`;
		}
	}

	wrapError(data, type) {
		switch (type) {
			case "name":
				return `${FCH.effect.underscore}${FCH.color.white}${data}${FCH.effect.reset}: `;
				// return "";
			case "message":
				return `${FCH.effect.bold}${FCH.effect.underscore}${FCH.color.red}${data}${FCH.effect.reset}`;
			case "method":
				return `${FCH.color.white}${data}${FCH.effect.reset}`;
			case "path":
				return `${FCH.effect.dim}${data}${FCH.effect.reset}`;
			case "line":
				return `${FCH.color.cyan}${data}${FCH.effect.reset}`;
			case "column":
				return `${FCH.color.white}${data}${FCH.effect.reset}`;
			default:
				return `${FCH.bg.magenta}/*${data}*/${FCH.effect.reset}`;
		}
	}
}

/**
 *
 * @type {FaBeautifyConsole}
 */
module.exports = FaBeautifyConsole;

},{"../console/console-helper":10,"./wrap":9}],6:[function(require,module,exports){
"use strict";
const FaBeautifyWrap = require("./wrap");

class FaBeautifyWrapHtml extends FaBeautifyWrap {
	wrapDataKey(key, type, length, level) {
		return `${this.getTab(level)}<span class="fa-beautify-key">${key}</span>: `;
	}

	wrapDataValue(data, type, length, level) {
		let tab = this.getTab(level);
		let nl = "\n";
		switch (type) {
			case "array":
				return `[<span class="fa-beautify-array">${nl}${data}${tab}]</span>`;
			case "bool":
				// return `${FCH.effect.bold}${data === true ? FCH.color.green : FCH.color.red}${nl}${data}${tab}</span>`;
				return `<span class="fa-beautify-${type}-${data === true ? "true" : "false"}">${data}</span>`;
			case "buffer":
				// return `${FCH.effect.bold}${FCH.color.cyan}${nl}${data}${tab}</span>`;
				return `<<span class="fa-beautify-${type}">${type}</span>>`;
			case "circular":
				// return `${FCH.effect.bold}${FCH.color.cyan}${nl}${data}${tab}</span>`;
				return `<<span class="fa-beautify-${type}">${type}</span>>`;
			case "date":
				// return `${FCH.color.yellow}${nl}${data}${tab}</span>`;
				return `<span class="fa-beautify-${type}">${data}</span>`;
			case "file":
				// return `${FCH.bg.cyan} ${nl}${data}${tab} </span>`;
				return `<<span class="fa-beautify-file">${data}</span>>`;
			case "float":
				// return `${FCH.color.red}${nl}${data}${tab}</span>`;
				return `<span class="fa-beautify-${type}">${data}</span>`;
			case "function":
				// return `${FCH.color.cyan}${nl}${data}${tab}</span>`;
				return `<span class="fa-beautify-${type}">${data}</span>`;
			case "json":
				return `<span class="fa-beautify-${type}">{${nl}${data}${tab}}</span>`;
			case "int":
				// return `${FCH.color.green}${nl}${data}${tab}</span>`;
				return `<span class="fa-beautify-int">${data}</span>`;
			case "mongoId":
				// return `${FCH.bg.blue} ${nl}${data}${tab} </span>`;
				return `<<span class="fa-beautify-${type}">${data}</span>>`;
			case "null":
				// return `${FCH.effect.bold}${FCH.color.white}${nl}${data}${tab}</span>`;
				return `<span class="fa-beautify-${type}">${data}</span>`;
			case "object":
				return `{<span class="fa-beautify-${type}">${nl}${data}${tab}</span>}`;
			case "regExp":
				// return `${FCH.effect.bold}${FCH.color.yellow}${nl}${data}${tab}</span>`;
				return `<span class="fa-beautify-${type}">${data}</span>`;
			case "string":
				// return `${FCH.color.white}${nl}${data}${tab}</span>-->`;
				return `"<span class="fa-beautify-${type}">${data}</span>"`;
			case "undefined":
				// return `${FCH.effect.bold}${FCH.color.magenta}${nl}${data}${tab}</span>`;
				return `<span class="fa-beautify-${type}">${data}</span>`;
			case "xml":
				return `<span class="fa-beautify-${type}">{${nl}${data}${tab}}</span>`;
			default:
				// return `${FCH.bg.magenta} ${nl}${data}${tab} </span>`;
				return `<span class="fa-beautify-default">/*${data}*/</span>`;
		}
	}
}

module.exports = FaBeautifyWrapHtml;

},{"./wrap":9}],7:[function(require,module,exports){
"use strict";
/*node*/
const Buffer = require("buffer").Buffer;
const FastXmlParser = require("fast-xml-parser");
const FileType = require("file-type");

/**
 *
 * @param data
 * @returns {boolean}
 */
function isJson(data) {
	try {
		let json = JSON.parse(data);
		return typeof json === "object" && json !== null;
	} catch (e) {
		return false;
	}
	// if (/^[\],:{}\s]*$/.test(json.replace(/\\["\\\/bfnrtu]/g, '@').replace(/"[^"\\\n\r]*"|true|false|null|-?\d+(?:\.\d*)?(?:[eE][+\-]?\d+)?/g, ']').replace(/(?:^|:|,)(?:\s*\[)+/g, ''))) {
	// 	return false;
	// } else {
	// 	return false;
	// }
}

/**
 *
 * @param mongoId
 * @returns {boolean}
 */
function isMongoId(mongoId) {
	try {
		return new RegExp("^[0-9a-fA-F]{24}$").test(mongoId.toString());
	} catch (e) {
		return false;
	}
}

/**
 *
 * @param xml
 * @returns {boolean}
 */
function isXml(xml) {
	try {
		return FastXmlParser.validate(xml) === true;
	} catch (e) {
		return false;
	}
}

function isCircular(object, circular) {
	if (object && typeof object === "object") {
		if (circular.indexOf(object) !== -1) {
			return true;
		}
		circular.push(object);
		for (let key in object) {
			// if (object.hasOwnProperty(key) && isCircular(object[key], circular)) {
			if (object[key] && isCircular(object[key], circular)) {
				return true;
			}
		}
	}
	return false;
}

function getType(data) {
	if (data === null) {
		return "null";
	} else if (Array.isArray(data)) {
		return "array";
	} else if (typeof data === "boolean") {
		return "bool";
	} else if (typeof data === 'number' && data % 1 === 0) {
		return "int";
	} else if (typeof data === "number" && data % 1 !== 0) {
		return "float";
	} else if (data instanceof Date) {
		return "date";
	} else if (typeof data === "function") {//!isNaN(Date.parse(data))
		return "function";
	} else if (data instanceof Error) {
		return "error";
	} else if (typeof data === "object") {
		if (isMongoId(data)) {
			return "mongoId";
		} else if (data instanceof RegExp) {
			return "regExp";
		} else if (data.byteLength) {
			if (FileType(data)) {
				return "file";
			} else {
				return "buffer";
			}
		} else {
			return "object";
		}
	} else if (typeof data === "string") {
		if (isJson(data)) {
			return "json";
		} else if (isXml(data)) {
			return "xml";
		} else if (FileType(Buffer(data, "base64"))) {
			return "file";
		} else {
			return "string";
		}
	} else {
		return "undefined";
	}
}

function getLength(data, type) {
	if (type === "array") {
		return data.length;
	} else if (type === "buffer") {
		return data.byteLength;
	} else if (type === "file") {
		return data.byteLength ? data.byteLength : Buffer(data, "base64").byteLength;
	} else if (type === "function") {
		return data.toString().length;
	} else if (type === "json") {
		return data.length;
	} else if (type === "object") {
		return Object.keys(data).length;
	} else if (type === "string") {
		return data.length;
	} else if (type === "xml") {
		return data.length;
	} else {
		return null;
	}
}

function parseObject(data, type) {
	// console.write("PARSE", type);
	if (type === "json") {
		return JSON.parse(data);
	} else if (type === "xml") {
		return FastXmlParser.parse(data, {});
	} else {
		return data;
	}
}

function beautifyObject(data, wrapper, level) {
	let circular = [];
	let nl = '\n';
	let object = parseObject(data, getType(data));
	let result = "";
	for (let keys = Object.keys(object), i = 0, end = keys.length - 1; i <= end; i++) {
		let item = object[keys[i]];
		let itemType = getType(item);
		let itemLength = getLength(item, itemType);
		let key = wrapper.wrapDataKey(keys[i], itemType, itemLength, level);
		let value = isCircular(item, circular) ? wrapper.circular(item, level) : beautify(item, wrapper, level);
		if (i === 0) {
			result += `${key}${value},${nl}`;
		} else if (i === end) {
			result += `${key}${value}${nl}`;
		} else {
			result += `${key}${value},${nl}`;
		}
	}
	return result;
}

function beautify(data, wrapper, level = 0) {
	switch (getType(data)) {
		case "array":
			return wrapper.array(beautifyObject(data, wrapper, level + 1), level);
		case "bool":
			return wrapper.bool(data, level);
		case "buffer":
			return wrapper.buffer(data, level);
		case "date":
			return wrapper.date(data, level);
		case "error":
			return wrapper.error(data, level + 1);
		case "file":
			return wrapper.file(data, level);
		case "float":
			return wrapper.float(data, level);
		case "function":
			return wrapper.function(data, level + 1);
		case "json":
			return wrapper.json(beautifyObject(data, wrapper, level + 1), level);
		case "int":
			return wrapper.int(data, level);
		case "mongoId":
			return wrapper.mongoId(data, level);
		case "null":
			return wrapper.null(data, level);
		case "object":
			return wrapper.object(beautifyObject(data, wrapper, level + 1), level);
		case "regExp":
			return wrapper.regExp(data.toString(), level);
		case "string":
			return wrapper.string(data, level + 1);
		case "undefined":
			return wrapper.undefined(data, level);
		case "xml":
			return wrapper.xml(beautifyObject(data, wrapper, level + 1), level);
		default:
			return wrapper.default(data);
	}
}

const FaBeautifyPlain = require("./plain");
const FaBeautifyConsole = require("./console");
const FaBeautifyConsoleType = require("./console-type");
const FaBeautifyHtml = require("./html");
const FaBeautifyHtmlType = require("./html");
/*new*/
exports.plain = function (data) {
	return beautify(data, new FaBeautifyPlain());
};
exports.console = function (data, level = 0) {
	return beautify(data, new FaBeautifyConsole(), level);
};
exports.consoleType = function (data) {
	return beautify(data, new FaBeautifyConsoleType());
};
exports.html = function (data) {
	return `<div class="fa-beautify">${beautify(data, new FaBeautifyHtml())}</div>`;
};
exports.htmlType = function (data) {
	return beautify(data, new FaBeautifyHtmlType());
};

},{"./console":5,"./console-type":4,"./html":6,"./plain":8,"buffer":2,"fast-xml-parser":12,"file-type":16}],8:[function(require,module,exports){
"use strict";
const FaBeautifyWrap = require("./wrap");

class FaBeautifyWrapConsole extends FaBeautifyWrap {
}

module.exports = FaBeautifyWrapConsole;

},{"./wrap":9}],9:[function(require,module,exports){
"use strict";
/*nodejs*/
const Buffer = require("buffer").Buffer;
const FileType = require("file-type");
/*fa*/
const FaTrace = require("fa-nodejs/base/trace");
// const Beautify = require("fa-nodejs/beautify/index");
// const BeautifyPlain = require("fa-nodejs/beautify/plain");
class FaBeautifyWrap {
	getTab(level) {
		let tab = `    `;
		let result = "";
		let count = level ? level : 0;
		for (let i = 0; i <= count - 1; i++) {
			result += tab;
		}
		return result;
	};

	wrapDataKey(key, type, length, level) {
		let tab = this.getTab(level);
		return `${tab}${key}: `;
	}

	wrapDataValue(value, type, length, level) {
		let tab = this.getTab(level);
		let nl = "\n";
		switch (type) {
			case "array":
				return `[${nl}${value}${tab}]`;
			case "bool":
				return value;
			case "buffer":
				return `<${type}>`;
			case "circular":
				return `<${type}>`;
			case "date":
				return value;
			case "file":
				return `<${value}>`;
			case "float":
				return value;
			case "function":
				return value;
			case "json":
				return `{${nl}${value}${tab}}`;
			case "int":
				return value;
			case "mongoId":
				return `<${value}>`;
			case "null":
				return value;
			case "object":
				return `{${nl}${value}${tab}}`;
			case "regExp":
				return value;
			case "string":
				return `"${value}"`;
			case "undefined":
				return value;
			case "xml":
				return `{${nl}${value}${tab}}`;
			default:
				return `/*${value}*/`;
		}
	}

	wrapError(data, type) {
		let result = "";
		switch (type) {
			case "name":
				result = `${data}: `;
				break;
			case "message":
				result = `${data}`;
				break;
			case "method":
				result = `${data}`;
				break;
			case "path":
				result = `${data}`;
				break;
			case "line":
				result = `${data}`;
				break;
			case "column":
				result = `${data}`;
				break;
			default:
				result = `${data}`;
		}
		return result;
	}

	wrapErrorTrace(trace, level) {
		let result = [];
		// console.warn(trace)
		// log(trace);
		for (let keys = Object.keys(trace), i = 0, end = keys.length - 1; i <= end; i++) {
			let {method, path, line, column} = trace[keys[i]];
			result.push(`\n${this.getTab(level)}| ${this.wrapError(method, "method")} ${this.wrapError(path, "path")}:${this.wrapError(line, "line")}:${this.wrapError(column, "column")}`);
		}
		return result.join();
	}

	wrapErrorContext(context, level) {
		let result = "";
		if (context) {
			// 	result += `\n${this.getTab(level)}`;
			// 	result += Beautify.plain(context, level);
		}
		return result;
	}

	wrapText(data, level) {
		return data.replaceAll(["\t", "\n"], [this.getTab(1), `\n${this.getTab(level)}`]);
		// return data.replace(/\t/g, this.getTab(1)).replace(/\n/g, `\n${this.getTab(level)}`);
	};

	/**/
	array(data, level) {
		return this.wrapDataValue(data, "array", data.length, level);
	};

	bool(data, level) {
		return this.wrapDataValue(data, "bool", null, level);
	};

	buffer(data, level) {
		return this.wrapDataValue(data, "buffer", data.byteLength, level);
	};

	circular(data, level) {
		return this.wrapDataValue(data, "circular", data.length, level);
	};

	date(data, level) {
		return this.wrapDataValue(data, "date", null, level);
	};

	error(data, level) {
		let trace = data["trace"] ? data["trace"] : FaTrace.stack(data["stack"]);
		return `${this.wrapError(data["name"], "name")}${this.wrapError(data["message"], "message")}${this.wrapErrorTrace(trace, level)}${this.wrapErrorContext(data["context"], level)}`;
	};

	file(data, level) {
		let fileMime;
		let fileLength;
		if (data.byteLength) {
			fileMime = FileType(data).mime;
			fileLength = data.byteLength;
		} else {
			fileMime = FileType(Buffer(data, "base64")).mime;
			fileLength = data.length;
		}
		return this.wrapDataValue(fileMime, "file", fileLength, level);
	};

	float(data, level) {
		return this.wrapDataValue(data, "float", null, level);
	};

	function(data, level) {
		return this.wrapDataValue(this.wrapText(data.toString(), level), "function", data.toString().length, level);
	};

	json(data, level) {
		return this.wrapDataValue(data, "json", data.length, level);
	};

	int(data, level) {
		return this.wrapDataValue(data, "int", null, level);
	};

	mongoId(data, level) {
		return this.wrapDataValue(data, "mongoId", null, level);
	};

	null(data, level) {
		return this.wrapDataValue(data, "null", null, level);
	};

	object(data, level) {
		return this.wrapDataValue(data, "object", data.length, level);
	};

	regExp(data, level) {
		return this.wrapDataValue(data, "regExp", null, level);
	};

	string(data, level) {
		let string = this.wrapText(data, level).replaceAll('"', '\\"');
		return this.wrapDataValue(string, "string", data.length, level);
	};

	undefined(data, level) {
		return this.wrapDataValue(data, "undefined", null, level);
	};

	xml(data, level) {
		return this.wrapDataValue(data, "xml", data.length, level);
	};

	default(data, level) {
		return this.wrapDataValue(data, "default", data.length, level);
	};
}

/**
 *
 * @type {FaBeautifyWrap}
 */
module.exports = FaBeautifyWrap;

},{"buffer":2,"fa-nodejs/base/trace":3,"file-type":16}],10:[function(require,module,exports){
/*https://www.compart.com/en/unicode/category/So*/
"use strict";
/**
 *
 * @type {{reset: string, bold: string, dim: string, underscore: string, blink: string, reverse: string, hidden: string}}
 */
exports.effect = {
	reset: "\x1b[0m",
	bold: "\x1b[1m",
	dim: "\x1b[2m",
	underscore: "\x1b[4m",
	blink: "\x1b[5m",
	reverse: "\x1b[7m",
	hidden: "\x1b[8m",
};
/**
 *
 * @type {{black: string, red: string, green: string, yellow: string, blue: string, magenta: string, cyan: string, white: string}}
 */
exports.color = {
	black: "\x1b[30m",
	red: "\x1b[31m",
	green: "\x1b[32m",
	yellow: "\x1b[33m",
	blue: "\x1b[34m",
	magenta: "\x1b[35m",
	cyan: "\x1b[36m",
	white: "\x1b[37m",
};
/**
 *
 * @type {{black: string, red: string, green: string, yellow: string, blue: string, magenta: string, cyan: string, white: string}}
 */
exports.bg = {
	black: "\x1b[40m",
	red: "\x1b[41m",
	green: "\x1b[42m",
	yellow: "\x1b[43m",
	blue: "\x1b[44m",
	magenta: "\x1b[45m",
	cyan: "\x1b[46m",
	white: "\x1b[47m",
};
/**
 *
 * @type {{commat: string, ast: string, amp: string, num: string, lt: string, cross: string, curvearrowleft: string, check: string, gt: string, quest: string, plus: string, percnt: string, circlearrowright: string, excl: string, circlearrowleft: string, equals: string, copy: string, curvearrowright: string}}
 */
exports.sign = {
	excl: "\u0021",
	num: "\u0023",
	percnt: "\u0025",
	amp: "\u0026",
	ast: "\u002a",
	plus: "\u002b",
	lt: "\u003c",
	equals: "\u003d",
	gt: "\u003e",
	quest: "\u003f",
	commat: "\u0040",
	copy: "\u00a9",
	curvearrowleft: "\u21b6",
	curvearrowright: "\u21b7",
	circlearrowleft: "\u21ba",
	circlearrowright: "\u21bb",
	check: "\u2713",
	cross: "\u2717",
};

},{}],11:[function(require,module,exports){
//parse Empty Node as self closing node
var he = require("he");

var defaultOptions = {
    attributeNamePrefix : "@_",
    attrNodeName: false,
    textNodeName : "#text",
    ignoreAttributes : true,
    encodeHTMLchar: false,
    cdataTagName: false,
    cdataPositionChar: "\\c",
    format: false,
    indentBy: "  ",
    supressEmptyNode: false
};

function Parser(options){
    this.options = Object.assign({},defaultOptions,options);
    if(this.options.ignoreAttributes) {
        this.isAttribute = a => false;
    }else{
        this.attrPrefixLen = this.options.attributeNamePrefix.length;
        this.isAttribute = isAttribute;
    }
    if(this.options.cdataTagName){
        this.isCDATA = isCDATA;
    }else{
        this.isCDATA = a => false;
    }
    this.replaceCDATAstr = replaceCDATAstr;
    this.replaceCDATAarr = replaceCDATAarr;
    if(this.options.encodeHTMLchar){
        this.encodeHTMLchar = encodeHTMLchar;
    }else{
        this.encodeHTMLchar = a => a;
    }

    if(this.options.format){
        this.indentate = indentate; 
        this.tagEndChar = ">\n";
        this.newLine = "\n";
    }else{
        this.indentate = () => "";
        this.tagEndChar = ">";
        this.newLine = "";
    }

    if(this.options.supressEmptyNode){
        this.buildTextNode = buildEmptyTextNode;
        this.buildObjNode = buildEmptyObjNode;
    }else{
        this.buildTextNode = buildTextValNode;
        this.buildObjNode = buildObjectNode;
    }

    this.buildTextValNode = buildTextValNode;
    this.buildObjectNode = buildObjectNode;

}


Parser.prototype.parse = function(jObj){
    return this.j2x(jObj,0).val;
}

Parser.prototype.j2x = function(jObj,level){
    var xmlStr = "", attrStr = "" , val = "";
    var keys = Object.keys(jObj);
    var len = keys.length;
    for(var i=0;i<len;i++){
        var key = keys[i];
        if(typeof jObj[key] !== "object"){//premitive type
            var attr = this.isAttribute(key);
            if(attr){
                attrStr += " " +attr+"=\""+ this.encodeHTMLchar(jObj[key], true) +"\"";
            }else if(this.isCDATA(key)){
                if(jObj[this.options.textNodeName]){
                    val += this.replaceCDATAstr(jObj[this.options.textNodeName], jObj[key]);
                }else{
                    val += this.replaceCDATAstr("", jObj[key]);
                }
            }else{//tag value
                if(key === this.options.textNodeName){
                    if(jObj[this.options.cdataTagName]){
                        //value will added while processing cdata
                    }else{
                        val += this.encodeHTMLchar(jObj[key]);    
                    }
                }else{
                    val += this.buildTextNode(jObj[key],key,"",level);
                }
            }
        }else if(Array.isArray(jObj[key])){//repeated nodes
            if(this.isCDATA(key)){
                if(jObj[this.options.textNodeName]){
                    val += this.replaceCDATAarr(jObj[this.options.textNodeName], jObj[key]);
                }else{
                    val += this.replaceCDATAarr("", jObj[key]);
                }
            }else{//nested nodes
                var arrLen = jObj[key].length;
                for(var j=0;j<arrLen;j++){
                    var item = jObj[key][j];
                    if(typeof item === "object"){
                        var result = this.j2x(item,level+1);
                        val  += this.buildObjNode(result.val,key,result.attrStr,level);
                    }else{
                        val += this.buildTextNode(item,key,"",level);
                    }
                }
            }
        }else{
            
            if(this.options.attrNodeName && key === this.options.attrNodeName){
                var Ks = Object.keys(jObj[key]);
                var L = Ks.length;
                for(var j=0;j<L;j++){
                    attrStr += " "+Ks[j]+"=\"" + this.encodeHTMLchar(jObj[key][Ks[j]]) + "\"";
                }
            }else{
                var result = this.j2x(jObj[key],level+1);
                val  += this.buildObjNode(result.val,key,result.attrStr,level);
            }
        }
    }
    return {attrStr : attrStr , val : val};
}

function replaceCDATAstr(str,cdata){
    str = this.encodeHTMLchar(str);
    if(this.options.cdataPositionChar === "" || str === ""){
        return str + "<![CDATA[" +cdata+"]]>";
    }else{
        return str.replace(this.options.cdataPositionChar,"<![CDATA[" +cdata+"]]>")
    }
}

function replaceCDATAarr(str,cdata){
    str = this.encodeHTMLchar(str);
    if(this.options.cdataPositionChar === "" || str === ""){
        return str + "<![CDATA[" + cdata.join("]]><![CDATA[")+"]]>";
    }else{
        for(var v in cdata){
            str = str.replace(this.options.cdataPositionChar, "<![CDATA[" +cdata[v]+"]]>");
        }
        return str;
    }
}

function buildObjectNode(val,key,attrStr,level){
    return this.indentate(level) 
                + "<" + key + attrStr 
                + this.tagEndChar 
                + val 
                //+ this.newLine
                + this.indentate(level)
                + "</"+key+this.tagEndChar;
}

function buildEmptyObjNode(val,key,attrStr,level){
    if(val !== "" ){
        return this.buildObjectNode(val,key,attrStr,level);
    }else{
        return this.indentate(level) 
                + "<" + key + attrStr 
                + "/"
                + this.tagEndChar 
                //+ this.newLine
    }
}

function buildTextValNode(val,key,attrStr,level){
    return this.indentate(level) + "<" + key + attrStr +  ">" +this.encodeHTMLchar(val)+"</"+key+ this.tagEndChar;
}

function buildEmptyTextNode(val,key,attrStr,level){
    if(val !== ""){
        return this.buildTextValNode(val,key,attrStr,level);
    }else{
        return this.indentate(level) + "<" + key + attrStr + "/" + this.tagEndChar;
    }
}

function indentate(level){
    return this.options.indentBy.repeat(level);
}
function encodeHTMLchar(val, isAttribute){
    return he.encode("" + val, {isAttributeValue : isAttribute, useNamedReferences: true});
}

function isAttribute(name,options){
    if(name.startsWith(this.options.attributeNamePrefix)){
        return name.substr(this.attrPrefixLen);
    }else{
        return false;
    }
}

function isCDATA(name){
    if(name === this.options.cdataTagName){
        return true;
    }else{
        return false;
    }
}
//formatting
//indentation
//\n after each closing or self closing tag


module.exports = Parser;
},{"he":17}],12:[function(require,module,exports){
var util = require("./util");
var xmlNode = require("./xmlNode");
var he = require("he");
var TagType = {"OPENING":1, "CLOSING":2, "SELF":3, "CDATA": 4};

//var tagsRegx = new RegExp("<(\\/?[\\w:\\-\._]+)([^>]*)>(\\s*"+cdataRegx+")*([^<]+)?","g");
//var tagsRegx = new RegExp("<(\\/?)((\\w*:)?([\\w:\\-\._]+))([^>]*)>([^<]*)("+cdataRegx+"([^<]*))*([^<]+)?","g");

//treat cdata as a tag


var defaultOptions = {
    attributeNamePrefix : "@_",
    attrNodeName: false,
    textNodeName : "#text",
    ignoreAttributes : true,
    ignoreNameSpace : false,
    allowBooleanAttributes : false,         //a tag can have attributes without any value
    //ignoreRootElement : false,
    parseNodeValue : true,
    parseAttributeValue : false,
    arrayMode : false,
    trimValues: true,                                //Trim string values of tag and attributes 
    decodeHTMLchar: false,
    cdataTagName: false,
    cdataPositionChar: "\\c"
    //decodeStrict: false,
};

var buildOptions = function (options){
    if(!options) options = {};
    var props = ["attributeNamePrefix",
                        "attrNodeName",
                        "ignoreAttributes",
                        "ignoreNameSpace",
                        "textNodeName",
                        "parseNodeValue",
                        "parseAttributeValue",
                        "arrayMode",
                        "trimValues",
                        "cdataPositionChar",
                ];
    var len = props.length;
    for (var i = 0; i < len; i++) {
        if(typeof options[props[i]] === "undefined"){
            options[props[i]] = defaultOptions[props[i]];
        }
    }
    return options;
};

var getTraversalObj =function (xmlData,options){
    options = buildOptions(options);
    //xmlData = xmlData.replace(/\r?\n/g, " ");//make it single line
    xmlData = xmlData.replace(/<!--[\s\S]*?-->/g, "");//Remove  comments
    
    var xmlObj = new xmlNode('!xml');
    var currentNode = xmlObj;

    var tagsRegx = new RegExp("<((!\\[CDATA\\[([\\s\\S]*?)(\\]\\]>))|((\\w*:)?([\\w:\\-\\._]+))([^>]*)>|((\\/)((\\w*:)?([\\w:\\-\\._]+))>))([^<]*)","g");
    var tag = tagsRegx.exec(xmlData);
    var nextTag = tagsRegx.exec(xmlData);
    var previousMatch,nextMatch;
    while (tag) {
        var tagType = checkForTagType(tag);

        if(tagType === TagType.CLOSING){
            //add parsed data to parent node
            if(currentNode.parent && tag[14]){
                currentNode.parent.val = util.getValue(currentNode.parent.val) + "" + processTagValue(tag[14],options);
            }

            currentNode = currentNode.parent;
        }else if(tagType === TagType.CDATA){
            if(options.cdataTagName){
                //add cdata node
                var childNode = new xmlNode( options.cdataTagName,currentNode,tag[3]);
                childNode.attrsMap = buildAttributesMap(tag[8],options);
                currentNode.addChild(childNode);
                //for backtracking
                currentNode.val = util.getValue(currentNode.val) + options.cdataPositionChar;
                //add rest value to parent node
                if(tag[14]){
                    currentNode.val += processTagValue(tag[14],options);
                }
            }else{
                currentNode.val = (currentNode.val || "") + (tag[3] || "") + processTagValue(tag[14],options);
            }
        }else if(tagType === TagType.SELF){
            var childNode = new xmlNode( options.ignoreNameSpace ? tag[7] : tag[5],currentNode, "");
            if(tag[8] && tag[8].length > 1){
                tag[8] = tag[8].substr(0,tag[8].length -1);
            }
            childNode.attrsMap = buildAttributesMap(tag[8],options);
            currentNode.addChild(childNode);
        }else{//TagType.OPENING
            var childNode = new xmlNode( options.ignoreNameSpace ? tag[7] : tag[5],currentNode,processTagValue(tag[14],options));
            childNode.attrsMap = buildAttributesMap(tag[8],options);
            currentNode.addChild(childNode);
            currentNode = childNode;
        }

        tag = nextTag;
        nextTag = tagsRegx.exec(xmlData);
    }

    return xmlObj;
};

function processTagValue(val,options){
    if(val){
        if(options.trimValues){
            val = val.trim();
        }
        if(options.decodeHTMLchar){
            val = he.decode(val);
        }
        val = parseValue(val,options.parseNodeValue);
    }

    return val;
}

function checkForTagType(match){
    if(match[4] === "]]>"){
        return TagType.CDATA;
    }else if(match[10] === "/"){
        return TagType.CLOSING;
    }else if(typeof match[8] !== "undefined" && match[8].substr(match[8].length-1) === "/"){
        return TagType.SELF;
    }else{
        return TagType.OPENING;
    }
}

var xml2json = function (xmlData,options){
    options = buildOptions(options);
    return convertToJson(getTraversalObj(xmlData,options), options);
};

function resolveNameSpace(tagname,options){
    if(options.ignoreNameSpace ){
        var tags = tagname.split(":");
        var prefix = tagname.charAt(0) === "/" ? "/" : "";
        if(tags.length === 2) {
            if(tags[0] === "xmlns") {
                return "";
            }
            tagname = prefix + tags[1];
        }
    }
    return tagname;
}

function parseValue(val,shouldParse){
    if(shouldParse && typeof val === "string"){
        if(val.trim() === "" || isNaN(val)){
            val = val === "true" ? true : val === "false" ? false : val;
        }else{
            if(val.indexOf(".") !== -1){
                val = Number.parseFloat(val);
            }else{
                val = Number.parseInt(val,10);
            }
        }
        return val;
    }else{
        if(util.isExist(val)) return val;
        else return  "";
    }
}

//TODO: change regex to capture NS
//var attrsRegx = new RegExp("([\\w\\-\\.\\:]+)\\s*=\\s*(['\"])((.|\n)*?)\\2","gm");
var attrsRegx = new RegExp("([^\\s=]+)\\s*(=\\s*(['\"])(.*?)\\3)?","g");
function buildAttributesMap(attrStr,options){
    if( !options.ignoreAttributes && typeof attrStr === "string" ){
        attrStr = attrStr.replace(/\r?\n/g, " ");
        //attrStr = attrStr || attrStr.trim();
        
        var matches = util.getAllMatches(attrStr,attrsRegx);
        var len = matches.length; //don't make it inline
        var attrs = {};
        for (var i = 0; i < len ; i++) {
            var attrName = resolveNameSpace(matches[i][1],options);
            if(attrName.length && attrName !== "xmlns") {
                if(matches[i][4]){
                    if(options.trimValues){
                        matches[i][4] = matches[i][4].trim();
                    }
                    if(options.decodeHTMLchar){
                        matches[i][4] = he.decode(matches[i][4], {isAttributeValue : true});
                    }
                    attrs[options.attributeNamePrefix + attrName] = parseValue(matches[i][4],options.parseAttributeValue);
                }else if(options.allowBooleanAttributes){
                    attrs[options.attributeNamePrefix + attrName] = true;
                }
                
            }
        }
        if(!Object.keys(attrs).length){
            return;
        }
        if(options.attrNodeName){
            var attrCollection = {};
            attrCollection[options.attrNodeName] = attrs;
            return attrCollection;
        }
        return attrs;
    }
}

var convertToJson = function (node, options){
    var jObj = {};

    //traver through all the children
    for (var index = 0; index < node.child.length; index++) {
        var prop = node.child[index].tagname;
        var obj = convertToJson(node.child[index],options);
        if(typeof jObj[prop] !== "undefined"){
            if(!Array.isArray(jObj[prop])){
                var swap = jObj[prop];
                jObj[prop] = [];
                jObj[prop].push(swap);
            }
            jObj[prop].push(obj);
        }else{
            jObj[prop] = options.arrayMode ? [obj] : obj;
        }
    }
    util.merge(jObj,node.attrsMap);
    //add attrsMap as new children
    if(util.isEmptyObject(jObj)){
        return util.isExist(node.val)? node.val :  "";
    }else{
        if(util.isExist(node.val)){
            if(!(typeof node.val === "string" && (node.val === "" || node.val === options.cdataPositionChar))){
                jObj[options.textNodeName] = node.val;
            }
        }
    }
    //add value
    return jObj;
};

exports.parse = xml2json;
exports.getTraversalObj = getTraversalObj;
exports.convertToJson = convertToJson;
exports.validate = require("./validator").validate;
exports.j2xParser = require("./j2x");

},{"./j2x":11,"./util":13,"./validator":14,"./xmlNode":15,"he":17}],13:[function(require,module,exports){
var getAllMatches = function(string, regex) {
  var matches = [];
  var match = regex.exec(string);
  while (match) {
    var allmatches = [];
    var len = match.length;
    for (var index = 0; index < len; index++) {
  		allmatches.push(match[index]);
  	}
    matches.push(allmatches);
    match = regex.exec(string);
  }
  return matches;
};


var doesMatch = function(string,regex){
  var match = regex.exec(string);
  if(match === null || typeof match === "undefined") return false;
  else return true;
}

var doesNotMatch = function(string,regex){
  return !doesMatch(string,regex);
}


exports.isExist= function(v){
  return typeof v !== "undefined";
}

exports.isEmptyObject= function(obj) {
  return Object.keys(obj).length === 0
}

/**
 * Copy all the properties of a into b.
 * @param {*} target
 * @param {*} a 
 */
exports.merge =function (target,a){
  if(a){
    var keys = Object.keys(a) // will return an array of own properties
    var len = keys.length; //don't make it inline
    for(var i = 0; i < len; i++){
      target[keys[i]] = a[keys[i]] ;
    }
  }
}
/* exports.merge =function (b,a){
  return Object.assign(b,a);
} */

exports.getValue = function (v){
  if(exports.isExist(v)){
      return v;
  }else{
      return "";
  }
}

var fakeCall =  function(a) {return a;}
var fakeCallNoReturn =  function() {}

exports.doesMatch = doesMatch
exports.doesNotMatch = doesNotMatch
exports.getAllMatches = getAllMatches;
},{}],14:[function(require,module,exports){
var util = require("./util");


var defaultOptions = {
    allowBooleanAttributes : false,         //A tag can have attributes without any value
};

var buildOptions = function (options){
    if(!options) options = {};
    var props = ["allowBooleanAttributes"];
    for (var i = 0; i < props.length; i++) {
        if(options[props[i]] === undefined){
            options[props[i]] = defaultOptions[props[i]];
        }
    }
    return options;
};


//var tagsPattern = new RegExp("<\\/?([\\w:\\-_\.]+)\\s*\/?>","g");
exports.validate = function(xmlData, options){
    options = buildOptions(options);   

    //xmlData = xmlData.replace(/(\r\n|\n|\r)/gm,"");//make it single line
    //xmlData = xmlData.replace(/(^\s*<\?xml.*?\?>)/g,"");//Remove XML starting tag
    //xmlData = xmlData.replace(/(<!DOCTYPE[\s\w\"\.\/\-\:]+(\[.*\])*\s*>)/g,"");//Remove DOCTYPE

    var tags = [];
    var tagFound = false;
    for (var i = 0; i < xmlData.length; i++) {

        if(xmlData[i] === "<"){//starting of tag
            //read until you reach to '>' avoiding any '>' in attribute value

            i++;
            if(xmlData[i] === "?"){
                if(i !== 1){
                    return {err : { code : "InvalidXml", msg : "XML declaration allowed only at the start of the document."}};
                }else{
                    //read until ?> is found
                    for(;i<xmlData.length;i++){
                        if(xmlData[i] == "?" && xmlData[i+1] == ">"){
                            i++;
                            break;
                        }
                    }
                }
            }else if(xmlData[i] === "!"){
                i = readCommentAndCDATA(xmlData,i);
                continue;
            }else{
                var closingTag = false;
                if(xmlData[i] === "/"){//closing tag
                    closingTag = true;
                    i++;
                }
                //read tagname
                var tagName = "";
                for(;i < xmlData.length
                    && xmlData[i] !== ">"
                    && xmlData[i] !== " "
                    && xmlData[i] !== "\t" ; i++) {

                    tagName +=xmlData[i];
                }
                tagName = tagName.trim();
                //console.log(tagName);

                if(tagName[tagName.length-1] === "/"){//self closing tag without attributes
                    tagName = tagName.substring(0,tagName.length-1);
                    continue;
                }
                if(!validateTagName(tagName)) 
                return { err: { code:"InvalidTag",msg:"Tag " + tagName + " is an invalid name."}};


                var result = readAttributeStr(xmlData,i);
                if(result === false) {
                    return { err: { code:"InvalidAttr",msg:"Attributes for " + tagName + " have open quote"}};
                }
                var attrStr = result.value;
                i = result.index;

                if(attrStr[attrStr.length-1] === "/" ){//self closing tag
                    attrStr = attrStr.substring(0,attrStr.length-1);
                    var isValid = validateAttributeString(attrStr, options);
                    if(isValid === true){
                        tagFound = true;
                        continue;
                    }else{
                        return isValid;
                    }
                }else if(closingTag){
                    if(attrStr.trim().length > 0){
                        return { err: { code:"InvalidTag",msg:"closing tag " + tagName + " can't have attributes or invalid starting."}};
                    }else{
                        var otg = tags.pop();
                        if(tagName !== otg){
                            return { err: { code:"InvalidTag",msg:"closing tag " + otg + " is expected inplace of "+tagName+"."}};
                        }
                    }
                }else{
                    var isValid = validateAttributeString(attrStr, options);
                    if(isValid !== true ){
                        return isValid;
                    }
                    tags.push(tagName); tagFound = true;
                }

                //skip tag text value
                //It may include comments and CDATA value
                for(i++;i < xmlData.length ; i++){
                    if(xmlData[i] === "<"){
                        if(xmlData[i+1] === "!"){//comment or CADATA
                            i++;
                            i = readCommentAndCDATA(xmlData,i);
                            continue;
                        }else{
                            break;
                        }
                    }
                }//end of reading tag text value
                if(xmlData[i] === "<") i--;
            }
        }else{

            if(xmlData[i] === " " || xmlData[i] === "\t" || xmlData[i] === "\n" || xmlData[i] === "\r") continue;
            return { err: { code:"InvalidChar",msg:"char " + xmlData[i] +" is not expected ."}};
        }
    }


    if(!tagFound){
        return {err : { code : "InvalidXml", msg : "Start tag expected."}};
    }else if(tags.length > 0){
        return { err: { code:"InvalidXml",msg:"Invalid " + JSON.stringify(tags,null,4).replace(/\r?\n/g,"") +" found."}};
    }

    return true;
}

function readCommentAndCDATA(xmlData,i){
    if(xmlData.length > i+5 && xmlData[i+1] === "-" && xmlData[i+2] === "-"){//comment
        for(i+=3;i<xmlData.length;i++){
            if(xmlData[i] === "-" && xmlData[i+1] === "-" && xmlData[i+2] === ">"){
                i+=2;
                break;
            }
        }
    }else if( xmlData.length > i+8
        && xmlData[i+1] === "D"
        && xmlData[i+2] === "O"
        && xmlData[i+3] === "C"
        && xmlData[i+4] === "T"
        && xmlData[i+5] === "Y"
        && xmlData[i+6] === "P"
        && xmlData[i+7] === "E"){
            var angleBracketsCount = 1;
            for(i+=8;i<xmlData.length;i++){
                if(xmlData[i] == "<") {angleBracketsCount++;}
                else if(xmlData[i] == ">") {
                    angleBracketsCount--;
                    if(angleBracketsCount === 0) break;
                }
            }
    }else if( xmlData.length > i+9
        && xmlData[i+1] === "["
        && xmlData[i+2] === "C"
        && xmlData[i+3] === "D"
        && xmlData[i+4] === "A"
        && xmlData[i+5] === "T"
        && xmlData[i+6] === "A"
        && xmlData[i+7] === "["){

        for(i+=8;i<xmlData.length;i++){
            if(xmlData[i] === "]" && xmlData[i+1] === "]" && xmlData[i+2] === ">" ){
                i+=2;
                break;
            }
        }
    }

    return i;
}

/**
 * Keep reading xmlData until '<' is found outside the attribute value.
 * @param {string} xmlData 
 * @param {number} i 
 */
function readAttributeStr(xmlData,i){
    var attrStr = "";
    var startChar = "";
    for(;i < xmlData.length ;i++){
        if(xmlData[i] === '"' || xmlData[i] === "'"){
            if(startChar === ""){
                startChar = xmlData[i];
            }else{
                startChar = "";
            }
        }else if(xmlData[i] === ">"){
            if(startChar === ""){
                break;
            }
        }
        attrStr += xmlData[i];
    }
    if(startChar !== "") return false;

    return { value: attrStr, index: i};
}

/**
 * Select all the attributes whether valid or invalid.
 */
var validAttrStrRegxp = new RegExp("(\\s*)([^\\s=]+)(\\s*=)?(\\s*(['\"])(([\\s\\S])*?)\\5)?", "g");

//attr, ="sd", a="amit's", a="sd"b="saf", ab  cd=""

function validateAttributeString(attrStr,options){
    //console.log("start:"+attrStr+":end");

    //if(attrStr.trim().length === 0) return true; //empty string

    var matches = util.getAllMatches(attrStr,validAttrStrRegxp);
    var attrNames = [];
    var attrObj = {};


    for(var i=0;i<matches.length;i++){
        //console.log(matches[i]);
        
        if(matches[i][1].length === 0){//nospace before attribute name: a="sd"b="saf"
            return { err: { code:"InvalidAttr",msg:"attribute " + matches[i][2] + " has no space in starting."}};
        }else if(matches[i][3] === undefined && !options.allowBooleanAttributes){//independent attribute: ab 
            return { err: { code:"InvalidAttr",msg:"boolean attribute " + matches[i][2] + " is not allowed."}};
        }/* else if(matches[i][6] === undefined){//attribute without value: ab=
            return { err: { code:"InvalidAttr",msg:"attribute " + matches[i][2] + " has no value assigned."}};
        } */
        var attrName=matches[i][2];
        if(!validateAttrName(attrName)){
            return { err: { code:"InvalidAttr",msg:"attribute " + attrName + " is an invalid name."}};
        }
        if(!attrNames.hasOwnProperty(attrName)){//check for duplicate attribute.
            attrNames[attrName]=1;
        }else{
            return { err: { code:"InvalidAttr",msg:"attribute " + attrName + " is repeated."}};
        }
    }

    return true;
    
}

var validAttrRegxp = new RegExp("^[_a-zA-Z][\\w\\-\\.\\:]*$");


function validateAttrName(attrName){
    return util.doesMatch(attrName,validAttrRegxp);
}
//var startsWithXML = new RegExp("^[Xx][Mm][Ll]");
var startsWith = new RegExp("^([a-zA-Z]|_)[\\w\.\\-_:]*");

function validateTagName(tagname){
    /*if(util.doesMatch(tagname,startsWithXML)) return false;
    else*/ if(util.doesNotMatch(tagname,startsWith)) return false;
    else return true;
}



},{"./util":13}],15:[function(require,module,exports){
module.exports = function(tagname,parent,val){
    this.tagname = tagname;
    this.parent = parent;
    this.child = [];//child tags
    this.attrsMap;//attributes map
    this.val = val;//text only
    this.addChild = function (child){
        this.child.push(child);
    };
};
},{}],16:[function(require,module,exports){
(function (Buffer){
'use strict';
const toBytes = s => [...s].map(c => c.charCodeAt(0));
const xpiZipFilename = toBytes('META-INF/mozilla.rsa');
const oxmlContentTypes = toBytes('[Content_Types].xml');
const oxmlRels = toBytes('_rels/.rels');

function readUInt64LE(buf, offset = 0) {
	let n = buf[offset];
	let mul = 1;
	let i = 0;
	while (++i < 8) {
		mul *= 0x100;
		n += buf[offset + i] * mul;
	}

	return n;
}

const fileType = input => {
	if (!(input instanceof Uint8Array || Buffer.isBuffer(input))) {
		throw new TypeError(`Expected the \`input\` argument to be of type \`Uint8Array\` or \`Buffer\`, got \`${typeof input}\``);
	}

	const buf = input instanceof Uint8Array ? input : new Uint8Array(input);

	if (!(buf && buf.length > 1)) {
		return null;
	}

	const check = (header, options) => {
		options = Object.assign({
			offset: 0
		}, options);

		for (let i = 0; i < header.length; i++) {
			// If a bitmask is set
			if (options.mask) {
				// If header doesn't equal `buf` with bits masked off
				if (header[i] !== (options.mask[i] & buf[i + options.offset])) {
					return false;
				}
			} else if (header[i] !== buf[i + options.offset]) {
				return false;
			}
		}

		return true;
	};

	const checkString = (header, options) => check(toBytes(header), options);

	if (check([0xFF, 0xD8, 0xFF])) {
		return {
			ext: 'jpg',
			mime: 'image/jpeg'
		};
	}

	if (check([0x89, 0x50, 0x4E, 0x47, 0x0D, 0x0A, 0x1A, 0x0A])) {
		return {
			ext: 'png',
			mime: 'image/png'
		};
	}

	if (check([0x47, 0x49, 0x46])) {
		return {
			ext: 'gif',
			mime: 'image/gif'
		};
	}

	if (check([0x57, 0x45, 0x42, 0x50], {offset: 8})) {
		return {
			ext: 'webp',
			mime: 'image/webp'
		};
	}

	if (check([0x46, 0x4C, 0x49, 0x46])) {
		return {
			ext: 'flif',
			mime: 'image/flif'
		};
	}

	// Needs to be before `tif` check
	if (
		(check([0x49, 0x49, 0x2A, 0x0]) || check([0x4D, 0x4D, 0x0, 0x2A])) &&
		check([0x43, 0x52], {offset: 8})
	) {
		return {
			ext: 'cr2',
			mime: 'image/x-canon-cr2'
		};
	}

	if (
		check([0x49, 0x49, 0x2A, 0x0]) ||
		check([0x4D, 0x4D, 0x0, 0x2A])
	) {
		return {
			ext: 'tif',
			mime: 'image/tiff'
		};
	}

	if (check([0x42, 0x4D])) {
		return {
			ext: 'bmp',
			mime: 'image/bmp'
		};
	}

	if (check([0x49, 0x49, 0xBC])) {
		return {
			ext: 'jxr',
			mime: 'image/vnd.ms-photo'
		};
	}

	if (check([0x38, 0x42, 0x50, 0x53])) {
		return {
			ext: 'psd',
			mime: 'image/vnd.adobe.photoshop'
		};
	}

	// Zip-based file formats
	// Need to be before the `zip` check
	if (check([0x50, 0x4B, 0x3, 0x4])) {
		if (
			check([0x6D, 0x69, 0x6D, 0x65, 0x74, 0x79, 0x70, 0x65, 0x61, 0x70, 0x70, 0x6C, 0x69, 0x63, 0x61, 0x74, 0x69, 0x6F, 0x6E, 0x2F, 0x65, 0x70, 0x75, 0x62, 0x2B, 0x7A, 0x69, 0x70], {offset: 30})
		) {
			return {
				ext: 'epub',
				mime: 'application/epub+zip'
			};
		}

		// Assumes signed `.xpi` from addons.mozilla.org
		if (check(xpiZipFilename, {offset: 30})) {
			return {
				ext: 'xpi',
				mime: 'application/x-xpinstall'
			};
		}

		if (checkString('mimetypeapplication/vnd.oasis.opendocument.text', {offset: 30})) {
			return {
				ext: 'odt',
				mime: 'application/vnd.oasis.opendocument.text'
			};
		}

		if (checkString('mimetypeapplication/vnd.oasis.opendocument.spreadsheet', {offset: 30})) {
			return {
				ext: 'ods',
				mime: 'application/vnd.oasis.opendocument.spreadsheet'
			};
		}

		if (checkString('mimetypeapplication/vnd.oasis.opendocument.layout', {offset: 30})) {
			return {
				ext: 'odp',
				mime: 'application/vnd.oasis.opendocument.layout'
			};
		}

		// The docx, xlsx and pptx file types extend the Office Open XML file format:
		// https://en.wikipedia.org/wiki/Office_Open_XML_file_formats
		// We look for:
		// - one entry named '[Content_Types].xml' or '_rels/.rels',
		// - one entry indicating specific type of file.
		// MS Office, OpenOffice and LibreOffice may put the parts in different order, so the check should not rely on it.
		const findNextZipHeaderIndex = (arr, startAt = 0) => arr.findIndex((el, i, arr) => i >= startAt && arr[i] === 0x50 && arr[i + 1] === 0x4B && arr[i + 2] === 0x3 && arr[i + 3] === 0x4);

		let zipHeaderIndex = 0; // The first zip header was already found at index 0
		let oxmlFound = false;
		let type = null;

		do {
			const offset = zipHeaderIndex + 30;

			if (!oxmlFound) {
				oxmlFound = (check(oxmlContentTypes, {offset}) || check(oxmlRels, {offset}));
			}

			if (!type) {
				if (checkString('word/', {offset})) {
					type = {
						ext: 'docx',
						mime: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
					};
				} else if (checkString('ppt/', {offset})) {
					type = {
						ext: 'pptx',
						mime: 'application/vnd.openxmlformats-officedocument.presentationml.layout'
					};
				} else if (checkString('xl/', {offset})) {
					type = {
						ext: 'xlsx',
						mime: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
					};
				}
			}

			if (oxmlFound && type) {
				return type;
			}

			zipHeaderIndex = findNextZipHeaderIndex(buf, offset);
		} while (zipHeaderIndex >= 0);

		// No more zip parts available in the buffer, but maybe we are almost certain about the type?
		if (type) {
			return type;
		}
	}

	if (
		check([0x50, 0x4B]) &&
		(buf[2] === 0x3 || buf[2] === 0x5 || buf[2] === 0x7) &&
		(buf[3] === 0x4 || buf[3] === 0x6 || buf[3] === 0x8)
	) {
		return {
			ext: 'zip',
			mime: 'application/zip'
		};
	}

	if (check([0x75, 0x73, 0x74, 0x61, 0x72], {offset: 257})) {
		return {
			ext: 'tar',
			mime: 'application/x-tar'
		};
	}

	if (
		check([0x52, 0x61, 0x72, 0x21, 0x1A, 0x7]) &&
		(buf[6] === 0x0 || buf[6] === 0x1)
	) {
		return {
			ext: 'rar',
			mime: 'application/x-rar-compressed'
		};
	}

	if (check([0x1F, 0x8B, 0x8])) {
		return {
			ext: 'gz',
			mime: 'application/gzip'
		};
	}

	if (check([0x42, 0x5A, 0x68])) {
		return {
			ext: 'bz2',
			mime: 'application/x-bzip2'
		};
	}

	if (check([0x37, 0x7A, 0xBC, 0xAF, 0x27, 0x1C])) {
		return {
			ext: '7z',
			mime: 'application/x-7z-compressed'
		};
	}

	if (check([0x78, 0x01])) {
		return {
			ext: 'dmg',
			mime: 'application/x-apple-diskimage'
		};
	}

	if (check([0x33, 0x67, 0x70, 0x35]) || // 3gp5
		(
			check([0x0, 0x0, 0x0]) && check([0x66, 0x74, 0x79, 0x70], {offset: 4}) &&
				(
					check([0x6D, 0x70, 0x34, 0x31], {offset: 8}) || // MP41
					check([0x6D, 0x70, 0x34, 0x32], {offset: 8}) || // MP42
					check([0x69, 0x73, 0x6F, 0x6D], {offset: 8}) || // ISOM
					check([0x69, 0x73, 0x6F, 0x32], {offset: 8}) || // ISO2
					check([0x6D, 0x6D, 0x70, 0x34], {offset: 8}) || // MMP4
					check([0x4D, 0x34, 0x56], {offset: 8}) || // M4V
					check([0x64, 0x61, 0x73, 0x68], {offset: 8}) // DASH
				)
		)) {
		return {
			ext: 'mp4',
			mime: 'video/mp4'
		};
	}

	if (check([0x4D, 0x54, 0x68, 0x64])) {
		return {
			ext: 'mid',
			mime: 'audio/midi'
		};
	}

	// https://github.com/threatstack/libmagic/blob/master/magic/Magdir/matroska
	if (check([0x1A, 0x45, 0xDF, 0xA3])) {
		const sliced = buf.subarray(4, 4 + 4096);
		const idPos = sliced.findIndex((el, i, arr) => arr[i] === 0x42 && arr[i + 1] === 0x82);

		if (idPos !== -1) {
			const docTypePos = idPos + 3;
			const findDocType = type => [...type].every((c, i) => sliced[docTypePos + i] === c.charCodeAt(0));

			if (findDocType('matroska')) {
				return {
					ext: 'mkv',
					mime: 'video/x-matroska'
				};
			}

			if (findDocType('webm')) {
				return {
					ext: 'webm',
					mime: 'video/webm'
				};
			}
		}
	}

	if (check([0x0, 0x0, 0x0, 0x14, 0x66, 0x74, 0x79, 0x70, 0x71, 0x74, 0x20, 0x20]) ||
		check([0x66, 0x72, 0x65, 0x65], {offset: 4}) || // Type: `free`
		check([0x66, 0x74, 0x79, 0x70, 0x71, 0x74, 0x20, 0x20], {offset: 4}) ||
		check([0x6D, 0x64, 0x61, 0x74], {offset: 4}) || // MJPEG
		check([0x6D, 0x6F, 0x6F, 0x76], {offset: 4}) || // Type: `moov`
		check([0x77, 0x69, 0x64, 0x65], {offset: 4})) {
		return {
			ext: 'mov',
			mime: 'video/quicktime'
		};
	}

	// RIFF file format which might be AVI, WAV, QCP, etc
	if (check([0x52, 0x49, 0x46, 0x46])) {
		if (check([0x41, 0x56, 0x49], {offset: 8})) {
			return {
				ext: 'avi',
				mime: 'video/vnd.avi'
			};
		}

		if (check([0x57, 0x41, 0x56, 0x45], {offset: 8})) {
			return {
				ext: 'wav',
				mime: 'audio/vnd.wave'
			};
		}

		// QLCM, QCP file
		if (check([0x51, 0x4C, 0x43, 0x4D], {offset: 8})) {
			return {
				ext: 'qcp',
				mime: 'audio/qcelp'
			};
		}
	}

	// ASF_Header_Object first 80 bytes
	if (check([0x30, 0x26, 0xB2, 0x75, 0x8E, 0x66, 0xCF, 0x11, 0xA6, 0xD9])) {
		// Search for header should be in first 1KB of file.

		let offset = 30;
		do {
			const objectSize = readUInt64LE(buf, offset + 16);
			if (check([0x91, 0x07, 0xDC, 0xB7, 0xB7, 0xA9, 0xCF, 0x11, 0x8E, 0xE6, 0x00, 0xC0, 0x0C, 0x20, 0x53, 0x65], {offset})) {
				// Sync on Stream-Properties-Object (B7DC0791-A9B7-11CF-8EE6-00C00C205365)
				if (check([0x40, 0x9E, 0x69, 0xF8, 0x4D, 0x5B, 0xCF, 0x11, 0xA8, 0xFD, 0x00, 0x80, 0x5F, 0x5C, 0x44, 0x2B], {offset: offset + 24})) {
					// Found audio:
					return {
						ext: 'wma',
						mime: 'audio/x-ms-wma'
					};
				}

				if (check([0xC0, 0xEF, 0x19, 0xBC, 0x4D, 0x5B, 0xCF, 0x11, 0xA8, 0xFD, 0x00, 0x80, 0x5F, 0x5C, 0x44, 0x2B], {offset: offset + 24})) {
					// Found video:
					return {
						ext: 'wmv',
						mime: 'video/x-ms-asf'
					};
				}

				break;
			}

			offset += objectSize;
		} while (offset + 24 <= buf.length);

		// Default to ASF generic extension
		return {
			ext: 'asf',
			mime: 'application/vnd.ms-asf'
		};
	}

	if (
		check([0x0, 0x0, 0x1, 0xBA]) ||
		check([0x0, 0x0, 0x1, 0xB3])
	) {
		return {
			ext: 'mpg',
			mime: 'video/mpeg'
		};
	}

	if (check([0x66, 0x74, 0x79, 0x70, 0x33, 0x67], {offset: 4})) {
		return {
			ext: '3gp',
			mime: 'video/3gpp'
		};
	}

	// Check for MPEG header at different starting offsets
	for (let start = 0; start < 2 && start < (buf.length - 16); start++) {
		if (
			check([0x49, 0x44, 0x33], {offset: start}) || // ID3 header
			check([0xFF, 0xE2], {offset: start, mask: [0xFF, 0xE2]}) // MPEG 1 or 2 Layer 3 header
		) {
			return {
				ext: 'mp3',
				mime: 'audio/mpeg'
			};
		}

		if (
			check([0xFF, 0xE4], {offset: start, mask: [0xFF, 0xE4]}) // MPEG 1 or 2 Layer 2 header
		) {
			return {
				ext: 'mp2',
				mime: 'audio/mpeg'
			};
		}

		if (
			check([0xFF, 0xF8], {offset: start, mask: [0xFF, 0xFC]}) // MPEG 2 layer 0 using ADTS
		) {
			return {
				ext: 'mp2',
				mime: 'audio/mpeg'
			};
		}

		if (
			check([0xFF, 0xF0], {offset: start, mask: [0xFF, 0xFC]}) // MPEG 4 layer 0 using ADTS
		) {
			return {
				ext: 'mp4',
				mime: 'audio/mpeg'
			};
		}
	}

	if (
		check([0x66, 0x74, 0x79, 0x70, 0x4D, 0x34, 0x41], {offset: 4})
	) {
		return { // MPEG-4 layer 3 (audio)
			ext: 'm4a',
			mime: 'audio/mp4' // RFC 4337
		};
	}

	// Needs to be before `ogg` check
	if (check([0x4F, 0x70, 0x75, 0x73, 0x48, 0x65, 0x61, 0x64], {offset: 28})) {
		return {
			ext: 'opus',
			mime: 'audio/opus'
		};
	}

	// If 'OggS' in first  bytes, then OGG container
	if (check([0x4F, 0x67, 0x67, 0x53])) {
		// This is a OGG container

		// If ' theora' in header.
		if (check([0x80, 0x74, 0x68, 0x65, 0x6F, 0x72, 0x61], {offset: 28})) {
			return {
				ext: 'ogv',
				mime: 'video/ogg'
			};
		}

		// If '\x01video' in header.
		if (check([0x01, 0x76, 0x69, 0x64, 0x65, 0x6F, 0x00], {offset: 28})) {
			return {
				ext: 'ogm',
				mime: 'video/ogg'
			};
		}

		// If ' FLAC' in header  https://xiph.org/flac/faq.html
		if (check([0x7F, 0x46, 0x4C, 0x41, 0x43], {offset: 28})) {
			return {
				ext: 'oga',
				mime: 'audio/ogg'
			};
		}

		// 'Speex  ' in header https://en.wikipedia.org/wiki/Speex
		if (check([0x53, 0x70, 0x65, 0x65, 0x78, 0x20, 0x20], {offset: 28})) {
			return {
				ext: 'spx',
				mime: 'audio/ogg'
			};
		}

		// If '\x01vorbis' in header
		if (check([0x01, 0x76, 0x6F, 0x72, 0x62, 0x69, 0x73], {offset: 28})) {
			return {
				ext: 'ogg',
				mime: 'audio/ogg'
			};
		}

		// Default OGG container https://www.iana.org/assignments/media-types/application/ogg
		return {
			ext: 'ogx',
			mime: 'application/ogg'
		};
	}

	if (check([0x66, 0x4C, 0x61, 0x43])) {
		return {
			ext: 'flac',
			mime: 'audio/x-flac'
		};
	}

	if (check([0x4D, 0x41, 0x43, 0x20])) { // 'MAC '
		return {
			ext: 'ape',
			mime: 'audio/ape'
		};
	}

	if (check([0x77, 0x76, 0x70, 0x6B])) { // 'wvpk'
		return {
			ext: 'wv',
			mime: 'audio/wavpack'
		};
	}

	if (check([0x23, 0x21, 0x41, 0x4D, 0x52, 0x0A])) {
		return {
			ext: 'amr',
			mime: 'audio/amr'
		};
	}

	if (check([0x25, 0x50, 0x44, 0x46])) {
		return {
			ext: 'pdf',
			mime: 'application/pdf'
		};
	}

	if (check([0x4D, 0x5A])) {
		return {
			ext: 'exe',
			mime: 'application/x-msdownload'
		};
	}

	if (
		(buf[0] === 0x43 || buf[0] === 0x46) &&
		check([0x57, 0x53], {offset: 1})
	) {
		return {
			ext: 'swf',
			mime: 'application/x-shockwave-flash'
		};
	}

	if (check([0x7B, 0x5C, 0x72, 0x74, 0x66])) {
		return {
			ext: 'rtf',
			mime: 'application/rtf'
		};
	}

	if (check([0x00, 0x61, 0x73, 0x6D])) {
		return {
			ext: 'wasm',
			mime: 'application/wasm'
		};
	}

	if (
		check([0x77, 0x4F, 0x46, 0x46]) &&
		(
			check([0x00, 0x01, 0x00, 0x00], {offset: 4}) ||
			check([0x4F, 0x54, 0x54, 0x4F], {offset: 4})
		)
	) {
		return {
			ext: 'woff',
			mime: 'font/woff'
		};
	}

	if (
		check([0x77, 0x4F, 0x46, 0x32]) &&
		(
			check([0x00, 0x01, 0x00, 0x00], {offset: 4}) ||
			check([0x4F, 0x54, 0x54, 0x4F], {offset: 4})
		)
	) {
		return {
			ext: 'woff2',
			mime: 'font/woff2'
		};
	}

	if (
		check([0x4C, 0x50], {offset: 34}) &&
		(
			check([0x00, 0x00, 0x01], {offset: 8}) ||
			check([0x01, 0x00, 0x02], {offset: 8}) ||
			check([0x02, 0x00, 0x02], {offset: 8})
		)
	) {
		return {
			ext: 'eot',
			mime: 'application/vnd.ms-fontobject'
		};
	}

	if (check([0x00, 0x01, 0x00, 0x00, 0x00])) {
		return {
			ext: 'ttf',
			mime: 'font/ttf'
		};
	}

	if (check([0x4F, 0x54, 0x54, 0x4F, 0x00])) {
		return {
			ext: 'otf',
			mime: 'font/otf'
		};
	}

	if (check([0x00, 0x00, 0x01, 0x00])) {
		return {
			ext: 'ico',
			mime: 'image/x-icon'
		};
	}

	if (check([0x00, 0x00, 0x02, 0x00])) {
		return {
			ext: 'cur',
			mime: 'image/x-icon'
		};
	}

	if (check([0x46, 0x4C, 0x56, 0x01])) {
		return {
			ext: 'flv',
			mime: 'video/x-flv'
		};
	}

	if (check([0x25, 0x21])) {
		return {
			ext: 'ps',
			mime: 'application/postscript'
		};
	}

	if (check([0xFD, 0x37, 0x7A, 0x58, 0x5A, 0x00])) {
		return {
			ext: 'xz',
			mime: 'application/x-xz'
		};
	}

	if (check([0x53, 0x51, 0x4C, 0x69])) {
		return {
			ext: 'sqlite',
			mime: 'application/x-sqlite3'
		};
	}

	if (check([0x4E, 0x45, 0x53, 0x1A])) {
		return {
			ext: 'nes',
			mime: 'application/x-nintendo-nes-rom'
		};
	}

	if (check([0x43, 0x72, 0x32, 0x34])) {
		return {
			ext: 'crx',
			mime: 'application/x-google-chrome-extension'
		};
	}

	if (
		check([0x4D, 0x53, 0x43, 0x46]) ||
		check([0x49, 0x53, 0x63, 0x28])
	) {
		return {
			ext: 'cab',
			mime: 'application/vnd.ms-cab-compressed'
		};
	}

	// Needs to be before `ar` check
	if (check([0x21, 0x3C, 0x61, 0x72, 0x63, 0x68, 0x3E, 0x0A, 0x64, 0x65, 0x62, 0x69, 0x61, 0x6E, 0x2D, 0x62, 0x69, 0x6E, 0x61, 0x72, 0x79])) {
		return {
			ext: 'deb',
			mime: 'application/x-deb'
		};
	}

	if (check([0x21, 0x3C, 0x61, 0x72, 0x63, 0x68, 0x3E])) {
		return {
			ext: 'ar',
			mime: 'application/x-unix-archive'
		};
	}

	if (check([0xED, 0xAB, 0xEE, 0xDB])) {
		return {
			ext: 'rpm',
			mime: 'application/x-rpm'
		};
	}

	if (
		check([0x1F, 0xA0]) ||
		check([0x1F, 0x9D])
	) {
		return {
			ext: 'Z',
			mime: 'application/x-compress'
		};
	}

	if (check([0x4C, 0x5A, 0x49, 0x50])) {
		return {
			ext: 'lz',
			mime: 'application/x-lzip'
		};
	}

	if (check([0xD0, 0xCF, 0x11, 0xE0, 0xA1, 0xB1, 0x1A, 0xE1])) {
		return {
			ext: 'msi',
			mime: 'application/x-msi'
		};
	}

	if (check([0x06, 0x0E, 0x2B, 0x34, 0x02, 0x05, 0x01, 0x01, 0x0D, 0x01, 0x02, 0x01, 0x01, 0x02])) {
		return {
			ext: 'mxf',
			mime: 'application/mxf'
		};
	}

	if (check([0x47], {offset: 4}) && (check([0x47], {offset: 192}) || check([0x47], {offset: 196}))) {
		return {
			ext: 'mts',
			mime: 'video/mp2t'
		};
	}

	if (check([0x42, 0x4C, 0x45, 0x4E, 0x44, 0x45, 0x52])) {
		return {
			ext: 'blend',
			mime: 'application/x-blender'
		};
	}

	if (check([0x42, 0x50, 0x47, 0xFB])) {
		return {
			ext: 'bpg',
			mime: 'image/bpg'
		};
	}

	if (check([0x00, 0x00, 0x00, 0x0C, 0x6A, 0x50, 0x20, 0x20, 0x0D, 0x0A, 0x87, 0x0A])) {
		// JPEG-2000 family

		if (check([0x6A, 0x70, 0x32, 0x20], {offset: 20})) {
			return {
				ext: 'jp2',
				mime: 'image/jp2'
			};
		}

		if (check([0x6A, 0x70, 0x78, 0x20], {offset: 20})) {
			return {
				ext: 'jpx',
				mime: 'image/jpx'
			};
		}

		if (check([0x6A, 0x70, 0x6D, 0x20], {offset: 20})) {
			return {
				ext: 'jpm',
				mime: 'image/jpm'
			};
		}

		if (check([0x6D, 0x6A, 0x70, 0x32], {offset: 20})) {
			return {
				ext: 'mj2',
				mime: 'image/mj2'
			};
		}
	}

	if (check([0x46, 0x4F, 0x52, 0x4D])) {
		return {
			ext: 'aif',
			mime: 'audio/aiff'
		};
	}

	if (checkString('<?xml ')) {
		return {
			ext: 'xml',
			mime: 'application/xml'
		};
	}

	if (check([0x42, 0x4F, 0x4F, 0x4B, 0x4D, 0x4F, 0x42, 0x49], {offset: 60})) {
		return {
			ext: 'mobi',
			mime: 'application/x-mobipocket-ebook'
		};
	}

	// File Type Box (https://en.wikipedia.org/wiki/ISO_base_media_file_format)
	if (check([0x66, 0x74, 0x79, 0x70], {offset: 4})) {
		if (check([0x6D, 0x69, 0x66, 0x31], {offset: 8})) {
			return {
				ext: 'heic',
				mime: 'image/heif'
			};
		}

		if (check([0x6D, 0x73, 0x66, 0x31], {offset: 8})) {
			return {
				ext: 'heic',
				mime: 'image/heif-sequence'
			};
		}

		if (check([0x68, 0x65, 0x69, 0x63], {offset: 8}) || check([0x68, 0x65, 0x69, 0x78], {offset: 8})) {
			return {
				ext: 'heic',
				mime: 'image/heic'
			};
		}

		if (check([0x68, 0x65, 0x76, 0x63], {offset: 8}) || check([0x68, 0x65, 0x76, 0x78], {offset: 8})) {
			return {
				ext: 'heic',
				mime: 'image/heic-sequence'
			};
		}
	}

	if (check([0xAB, 0x4B, 0x54, 0x58, 0x20, 0x31, 0x31, 0xBB, 0x0D, 0x0A, 0x1A, 0x0A])) {
		return {
			ext: 'ktx',
			mime: 'image/ktx'
		};
	}

	if (check([0x44, 0x49, 0x43, 0x4D], {offset: 128})) {
		return {
			ext: 'dcm',
			mime: 'application/dicom'
		};
	}

	// Musepack, SV7
	if (check([0x4D, 0x50, 0x2B])) {
		return {
			ext: 'mpc',
			mime: 'audio/x-musepack'
		};
	}

	// Musepack, SV8
	if (check([0x4D, 0x50, 0x43, 0x4B])) {
		return {
			ext: 'mpc',
			mime: 'audio/x-musepack'
		};
	}

	if (check([0x42, 0x45, 0x47, 0x49, 0x4E, 0x3A])) {
		return {
			ext: 'ics',
			mime: 'text/calendar'
		};
	}

	if (check([0x67, 0x6C, 0x54, 0x46, 0x02, 0x00, 0x00, 0x00])) {
		return {
			ext: 'glb',
			mime: 'model/gltf-binary'
		};
	}

	if (check([0xD4, 0xC3, 0xB2, 0xA1]) || check([0xA1, 0xB2, 0xC3, 0xD4])) {
		return {
			ext: 'pcap',
			mime: 'application/vnd.tcpdump.pcap'
		};
	}

	return null;
};

module.exports = fileType;
// TODO: Remove this for the next major release
module.exports.default = fileType;

Object.defineProperty(fileType, 'minimumBytes', {value: 4100});

module.exports.stream = readableStream => new Promise(resolve => {
	// Using `eval` to work around issues when bundling with Webpack
	const stream = eval('require')('stream'); // eslint-disable-line no-eval

	readableStream.once('readable', () => {
		const pass = new stream.PassThrough();
		const chunk = readableStream.read(module.exports.minimumBytes) || readableStream.read();
		pass.fileType = fileType(chunk);
		readableStream.unshift(chunk);

		if (stream.pipeline) {
			resolve(stream.pipeline(readableStream, pass));
		} else {
			resolve(readableStream.pipe(pass));
		}
	});
});

}).call(this,require("buffer").Buffer)
},{"buffer":2}],17:[function(require,module,exports){
(function (global){
/*! https://mths.be/he v1.1.1 by @mathias | MIT license */
;(function(root) {

	// Detect free variables `exports`.
	var freeExports = typeof exports == 'object' && exports;

	// Detect free variable `module`.
	var freeModule = typeof module == 'object' && module &&
		module.exports == freeExports && module;

	// Detect free variable `global`, from Node.js or Browserified code,
	// and use it as `root`.
	var freeGlobal = typeof global == 'object' && global;
	if (freeGlobal.global === freeGlobal || freeGlobal.window === freeGlobal) {
		root = freeGlobal;
	}

	/*--------------------------------------------------------------------------*/

	// All astral symbols.
	var regexAstralSymbols = /[\uD800-\uDBFF][\uDC00-\uDFFF]/g;
	// All ASCII symbols (not just printable ASCII) except those listed in the
	// first column of the overrides table.
	// https://html.spec.whatwg.org/multipage/syntax.html#table-charref-overrides
	var regexAsciiWhitelist = /[\x01-\x7F]/g;
	// All BMP symbols that are not ASCII newlines, printable ASCII symbols, or
	// code points listed in the first column of the overrides table on
	// https://html.spec.whatwg.org/multipage/syntax.html#table-charref-overrides.
	var regexBmpWhitelist = /[\x01-\t\x0B\f\x0E-\x1F\x7F\x81\x8D\x8F\x90\x9D\xA0-\uFFFF]/g;

	var regexEncodeNonAscii = /<\u20D2|=\u20E5|>\u20D2|\u205F\u200A|\u219D\u0338|\u2202\u0338|\u2220\u20D2|\u2229\uFE00|\u222A\uFE00|\u223C\u20D2|\u223D\u0331|\u223E\u0333|\u2242\u0338|\u224B\u0338|\u224D\u20D2|\u224E\u0338|\u224F\u0338|\u2250\u0338|\u2261\u20E5|\u2264\u20D2|\u2265\u20D2|\u2266\u0338|\u2267\u0338|\u2268\uFE00|\u2269\uFE00|\u226A\u0338|\u226A\u20D2|\u226B\u0338|\u226B\u20D2|\u227F\u0338|\u2282\u20D2|\u2283\u20D2|\u228A\uFE00|\u228B\uFE00|\u228F\u0338|\u2290\u0338|\u2293\uFE00|\u2294\uFE00|\u22B4\u20D2|\u22B5\u20D2|\u22D8\u0338|\u22D9\u0338|\u22DA\uFE00|\u22DB\uFE00|\u22F5\u0338|\u22F9\u0338|\u2933\u0338|\u29CF\u0338|\u29D0\u0338|\u2A6D\u0338|\u2A70\u0338|\u2A7D\u0338|\u2A7E\u0338|\u2AA1\u0338|\u2AA2\u0338|\u2AAC\uFE00|\u2AAD\uFE00|\u2AAF\u0338|\u2AB0\u0338|\u2AC5\u0338|\u2AC6\u0338|\u2ACB\uFE00|\u2ACC\uFE00|\u2AFD\u20E5|[\xA0-\u0113\u0116-\u0122\u0124-\u012B\u012E-\u014D\u0150-\u017E\u0192\u01B5\u01F5\u0237\u02C6\u02C7\u02D8-\u02DD\u0311\u0391-\u03A1\u03A3-\u03A9\u03B1-\u03C9\u03D1\u03D2\u03D5\u03D6\u03DC\u03DD\u03F0\u03F1\u03F5\u03F6\u0401-\u040C\u040E-\u044F\u0451-\u045C\u045E\u045F\u2002-\u2005\u2007-\u2010\u2013-\u2016\u2018-\u201A\u201C-\u201E\u2020-\u2022\u2025\u2026\u2030-\u2035\u2039\u203A\u203E\u2041\u2043\u2044\u204F\u2057\u205F-\u2063\u20AC\u20DB\u20DC\u2102\u2105\u210A-\u2113\u2115-\u211E\u2122\u2124\u2127-\u2129\u212C\u212D\u212F-\u2131\u2133-\u2138\u2145-\u2148\u2153-\u215E\u2190-\u219B\u219D-\u21A7\u21A9-\u21AE\u21B0-\u21B3\u21B5-\u21B7\u21BA-\u21DB\u21DD\u21E4\u21E5\u21F5\u21FD-\u2205\u2207-\u2209\u220B\u220C\u220F-\u2214\u2216-\u2218\u221A\u221D-\u2238\u223A-\u2257\u2259\u225A\u225C\u225F-\u2262\u2264-\u228B\u228D-\u229B\u229D-\u22A5\u22A7-\u22B0\u22B2-\u22BB\u22BD-\u22DB\u22DE-\u22E3\u22E6-\u22F7\u22F9-\u22FE\u2305\u2306\u2308-\u2310\u2312\u2313\u2315\u2316\u231C-\u231F\u2322\u2323\u232D\u232E\u2336\u233D\u233F\u237C\u23B0\u23B1\u23B4-\u23B6\u23DC-\u23DF\u23E2\u23E7\u2423\u24C8\u2500\u2502\u250C\u2510\u2514\u2518\u251C\u2524\u252C\u2534\u253C\u2550-\u256C\u2580\u2584\u2588\u2591-\u2593\u25A1\u25AA\u25AB\u25AD\u25AE\u25B1\u25B3-\u25B5\u25B8\u25B9\u25BD-\u25BF\u25C2\u25C3\u25CA\u25CB\u25EC\u25EF\u25F8-\u25FC\u2605\u2606\u260E\u2640\u2642\u2660\u2663\u2665\u2666\u266A\u266D-\u266F\u2713\u2717\u2720\u2736\u2758\u2772\u2773\u27C8\u27C9\u27E6-\u27ED\u27F5-\u27FA\u27FC\u27FF\u2902-\u2905\u290C-\u2913\u2916\u2919-\u2920\u2923-\u292A\u2933\u2935-\u2939\u293C\u293D\u2945\u2948-\u294B\u294E-\u2976\u2978\u2979\u297B-\u297F\u2985\u2986\u298B-\u2996\u299A\u299C\u299D\u29A4-\u29B7\u29B9\u29BB\u29BC\u29BE-\u29C5\u29C9\u29CD-\u29D0\u29DC-\u29DE\u29E3-\u29E5\u29EB\u29F4\u29F6\u2A00-\u2A02\u2A04\u2A06\u2A0C\u2A0D\u2A10-\u2A17\u2A22-\u2A27\u2A29\u2A2A\u2A2D-\u2A31\u2A33-\u2A3C\u2A3F\u2A40\u2A42-\u2A4D\u2A50\u2A53-\u2A58\u2A5A-\u2A5D\u2A5F\u2A66\u2A6A\u2A6D-\u2A75\u2A77-\u2A9A\u2A9D-\u2AA2\u2AA4-\u2AB0\u2AB3-\u2AC8\u2ACB\u2ACC\u2ACF-\u2ADB\u2AE4\u2AE6-\u2AE9\u2AEB-\u2AF3\u2AFD\uFB00-\uFB04]|\uD835[\uDC9C\uDC9E\uDC9F\uDCA2\uDCA5\uDCA6\uDCA9-\uDCAC\uDCAE-\uDCB9\uDCBB\uDCBD-\uDCC3\uDCC5-\uDCCF\uDD04\uDD05\uDD07-\uDD0A\uDD0D-\uDD14\uDD16-\uDD1C\uDD1E-\uDD39\uDD3B-\uDD3E\uDD40-\uDD44\uDD46\uDD4A-\uDD50\uDD52-\uDD6B]/g;
	var encodeMap = {'\xAD':'shy','\u200C':'zwnj','\u200D':'zwj','\u200E':'lrm','\u2063':'ic','\u2062':'it','\u2061':'af','\u200F':'rlm','\u200B':'ZeroWidthSpace','\u2060':'NoBreak','\u0311':'DownBreve','\u20DB':'tdot','\u20DC':'DotDot','\t':'Tab','\n':'NewLine','\u2008':'puncsp','\u205F':'MediumSpace','\u2009':'thinsp','\u200A':'hairsp','\u2004':'emsp13','\u2002':'ensp','\u2005':'emsp14','\u2003':'emsp','\u2007':'numsp','\xA0':'nbsp','\u205F\u200A':'ThickSpace','\u203E':'oline','_':'lowbar','\u2010':'dash','\u2013':'ndash','\u2014':'mdash','\u2015':'horbar',',':'comma',';':'semi','\u204F':'bsemi',':':'colon','\u2A74':'Colone','!':'excl','\xA1':'iexcl','?':'quest','\xBF':'iquest','.':'period','\u2025':'nldr','\u2026':'mldr','\xB7':'middot','\'':'apos','\u2018':'lsquo','\u2019':'rsquo','\u201A':'sbquo','\u2039':'lsaquo','\u203A':'rsaquo','"':'quot','\u201C':'ldquo','\u201D':'rdquo','\u201E':'bdquo','\xAB':'laquo','\xBB':'raquo','(':'lpar',')':'rpar','[':'lsqb',']':'rsqb','{':'lcub','}':'rcub','\u2308':'lceil','\u2309':'rceil','\u230A':'lfloor','\u230B':'rfloor','\u2985':'lopar','\u2986':'ropar','\u298B':'lbrke','\u298C':'rbrke','\u298D':'lbrkslu','\u298E':'rbrksld','\u298F':'lbrksld','\u2990':'rbrkslu','\u2991':'langd','\u2992':'rangd','\u2993':'lparlt','\u2994':'rpargt','\u2995':'gtlPar','\u2996':'ltrPar','\u27E6':'lobrk','\u27E7':'robrk','\u27E8':'lang','\u27E9':'rang','\u27EA':'Lang','\u27EB':'Rang','\u27EC':'loang','\u27ED':'roang','\u2772':'lbbrk','\u2773':'rbbrk','\u2016':'Vert','\xA7':'sect','\xB6':'para','@':'commat','*':'ast','/':'sol','undefined':null,'&':'amp','#':'num','%':'percnt','\u2030':'permil','\u2031':'pertenk','\u2020':'dagger','\u2021':'Dagger','\u2022':'bull','\u2043':'hybull','\u2032':'prime','\u2033':'Prime','\u2034':'tprime','\u2057':'qprime','\u2035':'bprime','\u2041':'caret','`':'grave','\xB4':'acute','\u02DC':'tilde','^':'Hat','\xAF':'macr','\u02D8':'breve','\u02D9':'dot','\xA8':'die','\u02DA':'ring','\u02DD':'dblac','\xB8':'cedil','\u02DB':'ogon','\u02C6':'circ','\u02C7':'caron','\xB0':'deg','\xA9':'copy','\xAE':'reg','\u2117':'copysr','\u2118':'wp','\u211E':'rx','\u2127':'mho','\u2129':'iiota','\u2190':'larr','\u219A':'nlarr','\u2192':'rarr','\u219B':'nrarr','\u2191':'uarr','\u2193':'darr','\u2194':'harr','\u21AE':'nharr','\u2195':'varr','\u2196':'nwarr','\u2197':'nearr','\u2198':'searr','\u2199':'swarr','\u219D':'rarrw','\u219D\u0338':'nrarrw','\u219E':'Larr','\u219F':'Uarr','\u21A0':'Rarr','\u21A1':'Darr','\u21A2':'larrtl','\u21A3':'rarrtl','\u21A4':'mapstoleft','\u21A5':'mapstoup','\u21A6':'map','\u21A7':'mapstodown','\u21A9':'larrhk','\u21AA':'rarrhk','\u21AB':'larrlp','\u21AC':'rarrlp','\u21AD':'harrw','\u21B0':'lsh','\u21B1':'rsh','\u21B2':'ldsh','\u21B3':'rdsh','\u21B5':'crarr','\u21B6':'cularr','\u21B7':'curarr','\u21BA':'olarr','\u21BB':'orarr','\u21BC':'lharu','\u21BD':'lhard','\u21BE':'uharr','\u21BF':'uharl','\u21C0':'rharu','\u21C1':'rhard','\u21C2':'dharr','\u21C3':'dharl','\u21C4':'rlarr','\u21C5':'udarr','\u21C6':'lrarr','\u21C7':'llarr','\u21C8':'uuarr','\u21C9':'rrarr','\u21CA':'ddarr','\u21CB':'lrhar','\u21CC':'rlhar','\u21D0':'lArr','\u21CD':'nlArr','\u21D1':'uArr','\u21D2':'rArr','\u21CF':'nrArr','\u21D3':'dArr','\u21D4':'iff','\u21CE':'nhArr','\u21D5':'vArr','\u21D6':'nwArr','\u21D7':'neArr','\u21D8':'seArr','\u21D9':'swArr','\u21DA':'lAarr','\u21DB':'rAarr','\u21DD':'zigrarr','\u21E4':'larrb','\u21E5':'rarrb','\u21F5':'duarr','\u21FD':'loarr','\u21FE':'roarr','\u21FF':'hoarr','\u2200':'forall','\u2201':'comp','\u2202':'part','\u2202\u0338':'npart','\u2203':'exist','\u2204':'nexist','\u2205':'empty','\u2207':'Del','\u2208':'in','\u2209':'notin','\u220B':'ni','\u220C':'notni','\u03F6':'bepsi','\u220F':'prod','\u2210':'coprod','\u2211':'sum','+':'plus','\xB1':'pm','\xF7':'div','\xD7':'times','<':'lt','\u226E':'nlt','<\u20D2':'nvlt','=':'equals','\u2260':'ne','=\u20E5':'bne','\u2A75':'Equal','>':'gt','\u226F':'ngt','>\u20D2':'nvgt','\xAC':'not','|':'vert','\xA6':'brvbar','\u2212':'minus','\u2213':'mp','\u2214':'plusdo','\u2044':'frasl','\u2216':'setmn','\u2217':'lowast','\u2218':'compfn','\u221A':'Sqrt','\u221D':'prop','\u221E':'infin','\u221F':'angrt','\u2220':'ang','\u2220\u20D2':'nang','\u2221':'angmsd','\u2222':'angsph','\u2223':'mid','\u2224':'nmid','\u2225':'par','\u2226':'npar','\u2227':'and','\u2228':'or','\u2229':'cap','\u2229\uFE00':'caps','\u222A':'cup','\u222A\uFE00':'cups','\u222B':'int','\u222C':'Int','\u222D':'tint','\u2A0C':'qint','\u222E':'oint','\u222F':'Conint','\u2230':'Cconint','\u2231':'cwint','\u2232':'cwconint','\u2233':'awconint','\u2234':'there4','\u2235':'becaus','\u2236':'ratio','\u2237':'Colon','\u2238':'minusd','\u223A':'mDDot','\u223B':'homtht','\u223C':'sim','\u2241':'nsim','\u223C\u20D2':'nvsim','\u223D':'bsim','\u223D\u0331':'race','\u223E':'ac','\u223E\u0333':'acE','\u223F':'acd','\u2240':'wr','\u2242':'esim','\u2242\u0338':'nesim','\u2243':'sime','\u2244':'nsime','\u2245':'cong','\u2247':'ncong','\u2246':'simne','\u2248':'ap','\u2249':'nap','\u224A':'ape','\u224B':'apid','\u224B\u0338':'napid','\u224C':'bcong','\u224D':'CupCap','\u226D':'NotCupCap','\u224D\u20D2':'nvap','\u224E':'bump','\u224E\u0338':'nbump','\u224F':'bumpe','\u224F\u0338':'nbumpe','\u2250':'doteq','\u2250\u0338':'nedot','\u2251':'eDot','\u2252':'efDot','\u2253':'erDot','\u2254':'colone','\u2255':'ecolon','\u2256':'ecir','\u2257':'cire','\u2259':'wedgeq','\u225A':'veeeq','\u225C':'trie','\u225F':'equest','\u2261':'equiv','\u2262':'nequiv','\u2261\u20E5':'bnequiv','\u2264':'le','\u2270':'nle','\u2264\u20D2':'nvle','\u2265':'ge','\u2271':'nge','\u2265\u20D2':'nvge','\u2266':'lE','\u2266\u0338':'nlE','\u2267':'gE','\u2267\u0338':'ngE','\u2268\uFE00':'lvnE','\u2268':'lnE','\u2269':'gnE','\u2269\uFE00':'gvnE','\u226A':'ll','\u226A\u0338':'nLtv','\u226A\u20D2':'nLt','\u226B':'gg','\u226B\u0338':'nGtv','\u226B\u20D2':'nGt','\u226C':'twixt','\u2272':'lsim','\u2274':'nlsim','\u2273':'gsim','\u2275':'ngsim','\u2276':'lg','\u2278':'ntlg','\u2277':'gl','\u2279':'ntgl','\u227A':'pr','\u2280':'npr','\u227B':'sc','\u2281':'nsc','\u227C':'prcue','\u22E0':'nprcue','\u227D':'sccue','\u22E1':'nsccue','\u227E':'prsim','\u227F':'scsim','\u227F\u0338':'NotSucceedsTilde','\u2282':'sub','\u2284':'nsub','\u2282\u20D2':'vnsub','\u2283':'sup','\u2285':'nsup','\u2283\u20D2':'vnsup','\u2286':'sube','\u2288':'nsube','\u2287':'supe','\u2289':'nsupe','\u228A\uFE00':'vsubne','\u228A':'subne','\u228B\uFE00':'vsupne','\u228B':'supne','\u228D':'cupdot','\u228E':'uplus','\u228F':'sqsub','\u228F\u0338':'NotSquareSubset','\u2290':'sqsup','\u2290\u0338':'NotSquareSuperset','\u2291':'sqsube','\u22E2':'nsqsube','\u2292':'sqsupe','\u22E3':'nsqsupe','\u2293':'sqcap','\u2293\uFE00':'sqcaps','\u2294':'sqcup','\u2294\uFE00':'sqcups','\u2295':'oplus','\u2296':'ominus','\u2297':'otimes','\u2298':'osol','\u2299':'odot','\u229A':'ocir','\u229B':'oast','\u229D':'odash','\u229E':'plusb','\u229F':'minusb','\u22A0':'timesb','\u22A1':'sdotb','\u22A2':'vdash','\u22AC':'nvdash','\u22A3':'dashv','\u22A4':'top','\u22A5':'bot','\u22A7':'models','\u22A8':'vDash','\u22AD':'nvDash','\u22A9':'Vdash','\u22AE':'nVdash','\u22AA':'Vvdash','\u22AB':'VDash','\u22AF':'nVDash','\u22B0':'prurel','\u22B2':'vltri','\u22EA':'nltri','\u22B3':'vrtri','\u22EB':'nrtri','\u22B4':'ltrie','\u22EC':'nltrie','\u22B4\u20D2':'nvltrie','\u22B5':'rtrie','\u22ED':'nrtrie','\u22B5\u20D2':'nvrtrie','\u22B6':'origof','\u22B7':'imof','\u22B8':'mumap','\u22B9':'hercon','\u22BA':'intcal','\u22BB':'veebar','\u22BD':'barvee','\u22BE':'angrtvb','\u22BF':'lrtri','\u22C0':'Wedge','\u22C1':'Vee','\u22C2':'xcap','\u22C3':'xcup','\u22C4':'diam','\u22C5':'sdot','\u22C6':'Star','\u22C7':'divonx','\u22C8':'bowtie','\u22C9':'ltimes','\u22CA':'rtimes','\u22CB':'lthree','\u22CC':'rthree','\u22CD':'bsime','\u22CE':'cuvee','\u22CF':'cuwed','\u22D0':'Sub','\u22D1':'Sup','\u22D2':'Cap','\u22D3':'Cup','\u22D4':'fork','\u22D5':'epar','\u22D6':'ltdot','\u22D7':'gtdot','\u22D8':'Ll','\u22D8\u0338':'nLl','\u22D9':'Gg','\u22D9\u0338':'nGg','\u22DA\uFE00':'lesg','\u22DA':'leg','\u22DB':'gel','\u22DB\uFE00':'gesl','\u22DE':'cuepr','\u22DF':'cuesc','\u22E6':'lnsim','\u22E7':'gnsim','\u22E8':'prnsim','\u22E9':'scnsim','\u22EE':'vellip','\u22EF':'ctdot','\u22F0':'utdot','\u22F1':'dtdot','\u22F2':'disin','\u22F3':'isinsv','\u22F4':'isins','\u22F5':'isindot','\u22F5\u0338':'notindot','\u22F6':'notinvc','\u22F7':'notinvb','\u22F9':'isinE','\u22F9\u0338':'notinE','\u22FA':'nisd','\u22FB':'xnis','\u22FC':'nis','\u22FD':'notnivc','\u22FE':'notnivb','\u2305':'barwed','\u2306':'Barwed','\u230C':'drcrop','\u230D':'dlcrop','\u230E':'urcrop','\u230F':'ulcrop','\u2310':'bnot','\u2312':'profline','\u2313':'profsurf','\u2315':'telrec','\u2316':'target','\u231C':'ulcorn','\u231D':'urcorn','\u231E':'dlcorn','\u231F':'drcorn','\u2322':'frown','\u2323':'smile','\u232D':'cylcty','\u232E':'profalar','\u2336':'topbot','\u233D':'ovbar','\u233F':'solbar','\u237C':'angzarr','\u23B0':'lmoust','\u23B1':'rmoust','\u23B4':'tbrk','\u23B5':'bbrk','\u23B6':'bbrktbrk','\u23DC':'OverParenthesis','\u23DD':'UnderParenthesis','\u23DE':'OverBrace','\u23DF':'UnderBrace','\u23E2':'trpezium','\u23E7':'elinters','\u2423':'blank','\u2500':'boxh','\u2502':'boxv','\u250C':'boxdr','\u2510':'boxdl','\u2514':'boxur','\u2518':'boxul','\u251C':'boxvr','\u2524':'boxvl','\u252C':'boxhd','\u2534':'boxhu','\u253C':'boxvh','\u2550':'boxH','\u2551':'boxV','\u2552':'boxdR','\u2553':'boxDr','\u2554':'boxDR','\u2555':'boxdL','\u2556':'boxDl','\u2557':'boxDL','\u2558':'boxuR','\u2559':'boxUr','\u255A':'boxUR','\u255B':'boxuL','\u255C':'boxUl','\u255D':'boxUL','\u255E':'boxvR','\u255F':'boxVr','\u2560':'boxVR','\u2561':'boxvL','\u2562':'boxVl','\u2563':'boxVL','\u2564':'boxHd','\u2565':'boxhD','\u2566':'boxHD','\u2567':'boxHu','\u2568':'boxhU','\u2569':'boxHU','\u256A':'boxvH','\u256B':'boxVh','\u256C':'boxVH','\u2580':'uhblk','\u2584':'lhblk','\u2588':'block','\u2591':'blk14','\u2592':'blk12','\u2593':'blk34','\u25A1':'squ','\u25AA':'squf','\u25AB':'EmptyVerySmallSquare','\u25AD':'rect','\u25AE':'marker','\u25B1':'fltns','\u25B3':'xutri','\u25B4':'utrif','\u25B5':'utri','\u25B8':'rtrif','\u25B9':'rtri','\u25BD':'xdtri','\u25BE':'dtrif','\u25BF':'dtri','\u25C2':'ltrif','\u25C3':'ltri','\u25CA':'loz','\u25CB':'cir','\u25EC':'tridot','\u25EF':'xcirc','\u25F8':'ultri','\u25F9':'urtri','\u25FA':'lltri','\u25FB':'EmptySmallSquare','\u25FC':'FilledSmallSquare','\u2605':'starf','\u2606':'star','\u260E':'phone','\u2640':'female','\u2642':'male','\u2660':'spades','\u2663':'clubs','\u2665':'hearts','\u2666':'diams','\u266A':'sung','\u2713':'check','\u2717':'cross','\u2720':'malt','\u2736':'sext','\u2758':'VerticalSeparator','\u27C8':'bsolhsub','\u27C9':'suphsol','\u27F5':'xlarr','\u27F6':'xrarr','\u27F7':'xharr','\u27F8':'xlArr','\u27F9':'xrArr','\u27FA':'xhArr','\u27FC':'xmap','\u27FF':'dzigrarr','\u2902':'nvlArr','\u2903':'nvrArr','\u2904':'nvHarr','\u2905':'Map','\u290C':'lbarr','\u290D':'rbarr','\u290E':'lBarr','\u290F':'rBarr','\u2910':'RBarr','\u2911':'DDotrahd','\u2912':'UpArrowBar','\u2913':'DownArrowBar','\u2916':'Rarrtl','\u2919':'latail','\u291A':'ratail','\u291B':'lAtail','\u291C':'rAtail','\u291D':'larrfs','\u291E':'rarrfs','\u291F':'larrbfs','\u2920':'rarrbfs','\u2923':'nwarhk','\u2924':'nearhk','\u2925':'searhk','\u2926':'swarhk','\u2927':'nwnear','\u2928':'toea','\u2929':'tosa','\u292A':'swnwar','\u2933':'rarrc','\u2933\u0338':'nrarrc','\u2935':'cudarrr','\u2936':'ldca','\u2937':'rdca','\u2938':'cudarrl','\u2939':'larrpl','\u293C':'curarrm','\u293D':'cularrp','\u2945':'rarrpl','\u2948':'harrcir','\u2949':'Uarrocir','\u294A':'lurdshar','\u294B':'ldrushar','\u294E':'LeftRightVector','\u294F':'RightUpDownVector','\u2950':'DownLeftRightVector','\u2951':'LeftUpDownVector','\u2952':'LeftVectorBar','\u2953':'RightVectorBar','\u2954':'RightUpVectorBar','\u2955':'RightDownVectorBar','\u2956':'DownLeftVectorBar','\u2957':'DownRightVectorBar','\u2958':'LeftUpVectorBar','\u2959':'LeftDownVectorBar','\u295A':'LeftTeeVector','\u295B':'RightTeeVector','\u295C':'RightUpTeeVector','\u295D':'RightDownTeeVector','\u295E':'DownLeftTeeVector','\u295F':'DownRightTeeVector','\u2960':'LeftUpTeeVector','\u2961':'LeftDownTeeVector','\u2962':'lHar','\u2963':'uHar','\u2964':'rHar','\u2965':'dHar','\u2966':'luruhar','\u2967':'ldrdhar','\u2968':'ruluhar','\u2969':'rdldhar','\u296A':'lharul','\u296B':'llhard','\u296C':'rharul','\u296D':'lrhard','\u296E':'udhar','\u296F':'duhar','\u2970':'RoundImplies','\u2971':'erarr','\u2972':'simrarr','\u2973':'larrsim','\u2974':'rarrsim','\u2975':'rarrap','\u2976':'ltlarr','\u2978':'gtrarr','\u2979':'subrarr','\u297B':'suplarr','\u297C':'lfisht','\u297D':'rfisht','\u297E':'ufisht','\u297F':'dfisht','\u299A':'vzigzag','\u299C':'vangrt','\u299D':'angrtvbd','\u29A4':'ange','\u29A5':'range','\u29A6':'dwangle','\u29A7':'uwangle','\u29A8':'angmsdaa','\u29A9':'angmsdab','\u29AA':'angmsdac','\u29AB':'angmsdad','\u29AC':'angmsdae','\u29AD':'angmsdaf','\u29AE':'angmsdag','\u29AF':'angmsdah','\u29B0':'bemptyv','\u29B1':'demptyv','\u29B2':'cemptyv','\u29B3':'raemptyv','\u29B4':'laemptyv','\u29B5':'ohbar','\u29B6':'omid','\u29B7':'opar','\u29B9':'operp','\u29BB':'olcross','\u29BC':'odsold','\u29BE':'olcir','\u29BF':'ofcir','\u29C0':'olt','\u29C1':'ogt','\u29C2':'cirscir','\u29C3':'cirE','\u29C4':'solb','\u29C5':'bsolb','\u29C9':'boxbox','\u29CD':'trisb','\u29CE':'rtriltri','\u29CF':'LeftTriangleBar','\u29CF\u0338':'NotLeftTriangleBar','\u29D0':'RightTriangleBar','\u29D0\u0338':'NotRightTriangleBar','\u29DC':'iinfin','\u29DD':'infintie','\u29DE':'nvinfin','\u29E3':'eparsl','\u29E4':'smeparsl','\u29E5':'eqvparsl','\u29EB':'lozf','\u29F4':'RuleDelayed','\u29F6':'dsol','\u2A00':'xodot','\u2A01':'xoplus','\u2A02':'xotime','\u2A04':'xuplus','\u2A06':'xsqcup','\u2A0D':'fpartint','\u2A10':'cirfnint','\u2A11':'awint','\u2A12':'rppolint','\u2A13':'scpolint','\u2A14':'npolint','\u2A15':'pointint','\u2A16':'quatint','\u2A17':'intlarhk','\u2A22':'pluscir','\u2A23':'plusacir','\u2A24':'simplus','\u2A25':'plusdu','\u2A26':'plussim','\u2A27':'plustwo','\u2A29':'mcomma','\u2A2A':'minusdu','\u2A2D':'loplus','\u2A2E':'roplus','\u2A2F':'Cross','\u2A30':'timesd','\u2A31':'timesbar','\u2A33':'smashp','\u2A34':'lotimes','\u2A35':'rotimes','\u2A36':'otimesas','\u2A37':'Otimes','\u2A38':'odiv','\u2A39':'triplus','\u2A3A':'triminus','\u2A3B':'tritime','\u2A3C':'iprod','\u2A3F':'amalg','\u2A40':'capdot','\u2A42':'ncup','\u2A43':'ncap','\u2A44':'capand','\u2A45':'cupor','\u2A46':'cupcap','\u2A47':'capcup','\u2A48':'cupbrcap','\u2A49':'capbrcup','\u2A4A':'cupcup','\u2A4B':'capcap','\u2A4C':'ccups','\u2A4D':'ccaps','\u2A50':'ccupssm','\u2A53':'And','\u2A54':'Or','\u2A55':'andand','\u2A56':'oror','\u2A57':'orslope','\u2A58':'andslope','\u2A5A':'andv','\u2A5B':'orv','\u2A5C':'andd','\u2A5D':'ord','\u2A5F':'wedbar','\u2A66':'sdote','\u2A6A':'simdot','\u2A6D':'congdot','\u2A6D\u0338':'ncongdot','\u2A6E':'easter','\u2A6F':'apacir','\u2A70':'apE','\u2A70\u0338':'napE','\u2A71':'eplus','\u2A72':'pluse','\u2A73':'Esim','\u2A77':'eDDot','\u2A78':'equivDD','\u2A79':'ltcir','\u2A7A':'gtcir','\u2A7B':'ltquest','\u2A7C':'gtquest','\u2A7D':'les','\u2A7D\u0338':'nles','\u2A7E':'ges','\u2A7E\u0338':'nges','\u2A7F':'lesdot','\u2A80':'gesdot','\u2A81':'lesdoto','\u2A82':'gesdoto','\u2A83':'lesdotor','\u2A84':'gesdotol','\u2A85':'lap','\u2A86':'gap','\u2A87':'lne','\u2A88':'gne','\u2A89':'lnap','\u2A8A':'gnap','\u2A8B':'lEg','\u2A8C':'gEl','\u2A8D':'lsime','\u2A8E':'gsime','\u2A8F':'lsimg','\u2A90':'gsiml','\u2A91':'lgE','\u2A92':'glE','\u2A93':'lesges','\u2A94':'gesles','\u2A95':'els','\u2A96':'egs','\u2A97':'elsdot','\u2A98':'egsdot','\u2A99':'el','\u2A9A':'eg','\u2A9D':'siml','\u2A9E':'simg','\u2A9F':'simlE','\u2AA0':'simgE','\u2AA1':'LessLess','\u2AA1\u0338':'NotNestedLessLess','\u2AA2':'GreaterGreater','\u2AA2\u0338':'NotNestedGreaterGreater','\u2AA4':'glj','\u2AA5':'gla','\u2AA6':'ltcc','\u2AA7':'gtcc','\u2AA8':'lescc','\u2AA9':'gescc','\u2AAA':'smt','\u2AAB':'lat','\u2AAC':'smte','\u2AAC\uFE00':'smtes','\u2AAD':'late','\u2AAD\uFE00':'lates','\u2AAE':'bumpE','\u2AAF':'pre','\u2AAF\u0338':'npre','\u2AB0':'sce','\u2AB0\u0338':'nsce','\u2AB3':'prE','\u2AB4':'scE','\u2AB5':'prnE','\u2AB6':'scnE','\u2AB7':'prap','\u2AB8':'scap','\u2AB9':'prnap','\u2ABA':'scnap','\u2ABB':'Pr','\u2ABC':'Sc','\u2ABD':'subdot','\u2ABE':'supdot','\u2ABF':'subplus','\u2AC0':'supplus','\u2AC1':'submult','\u2AC2':'supmult','\u2AC3':'subedot','\u2AC4':'supedot','\u2AC5':'subE','\u2AC5\u0338':'nsubE','\u2AC6':'supE','\u2AC6\u0338':'nsupE','\u2AC7':'subsim','\u2AC8':'supsim','\u2ACB\uFE00':'vsubnE','\u2ACB':'subnE','\u2ACC\uFE00':'vsupnE','\u2ACC':'supnE','\u2ACF':'csub','\u2AD0':'csup','\u2AD1':'csube','\u2AD2':'csupe','\u2AD3':'subsup','\u2AD4':'supsub','\u2AD5':'subsub','\u2AD6':'supsup','\u2AD7':'suphsub','\u2AD8':'supdsub','\u2AD9':'forkv','\u2ADA':'topfork','\u2ADB':'mlcp','\u2AE4':'Dashv','\u2AE6':'Vdashl','\u2AE7':'Barv','\u2AE8':'vBar','\u2AE9':'vBarv','\u2AEB':'Vbar','\u2AEC':'Not','\u2AED':'bNot','\u2AEE':'rnmid','\u2AEF':'cirmid','\u2AF0':'midcir','\u2AF1':'topcir','\u2AF2':'nhpar','\u2AF3':'parsim','\u2AFD':'parsl','\u2AFD\u20E5':'nparsl','\u266D':'flat','\u266E':'natur','\u266F':'sharp','\xA4':'curren','\xA2':'cent','$':'dollar','\xA3':'pound','\xA5':'yen','\u20AC':'euro','\xB9':'sup1','\xBD':'half','\u2153':'frac13','\xBC':'frac14','\u2155':'frac15','\u2159':'frac16','\u215B':'frac18','\xB2':'sup2','\u2154':'frac23','\u2156':'frac25','\xB3':'sup3','\xBE':'frac34','\u2157':'frac35','\u215C':'frac38','\u2158':'frac45','\u215A':'frac56','\u215D':'frac58','\u215E':'frac78','\uD835\uDCB6':'ascr','\uD835\uDD52':'aopf','\uD835\uDD1E':'afr','\uD835\uDD38':'Aopf','\uD835\uDD04':'Afr','\uD835\uDC9C':'Ascr','\xAA':'ordf','\xE1':'aacute','\xC1':'Aacute','\xE0':'agrave','\xC0':'Agrave','\u0103':'abreve','\u0102':'Abreve','\xE2':'acirc','\xC2':'Acirc','\xE5':'aring','\xC5':'angst','\xE4':'auml','\xC4':'Auml','\xE3':'atilde','\xC3':'Atilde','\u0105':'aogon','\u0104':'Aogon','\u0101':'amacr','\u0100':'Amacr','\xE6':'aelig','\xC6':'AElig','\uD835\uDCB7':'bscr','\uD835\uDD53':'bopf','\uD835\uDD1F':'bfr','\uD835\uDD39':'Bopf','\u212C':'Bscr','\uD835\uDD05':'Bfr','\uD835\uDD20':'cfr','\uD835\uDCB8':'cscr','\uD835\uDD54':'copf','\u212D':'Cfr','\uD835\uDC9E':'Cscr','\u2102':'Copf','\u0107':'cacute','\u0106':'Cacute','\u0109':'ccirc','\u0108':'Ccirc','\u010D':'ccaron','\u010C':'Ccaron','\u010B':'cdot','\u010A':'Cdot','\xE7':'ccedil','\xC7':'Ccedil','\u2105':'incare','\uD835\uDD21':'dfr','\u2146':'dd','\uD835\uDD55':'dopf','\uD835\uDCB9':'dscr','\uD835\uDC9F':'Dscr','\uD835\uDD07':'Dfr','\u2145':'DD','\uD835\uDD3B':'Dopf','\u010F':'dcaron','\u010E':'Dcaron','\u0111':'dstrok','\u0110':'Dstrok','\xF0':'eth','\xD0':'ETH','\u2147':'ee','\u212F':'escr','\uD835\uDD22':'efr','\uD835\uDD56':'eopf','\u2130':'Escr','\uD835\uDD08':'Efr','\uD835\uDD3C':'Eopf','\xE9':'eacute','\xC9':'Eacute','\xE8':'egrave','\xC8':'Egrave','\xEA':'ecirc','\xCA':'Ecirc','\u011B':'ecaron','\u011A':'Ecaron','\xEB':'euml','\xCB':'Euml','\u0117':'edot','\u0116':'Edot','\u0119':'eogon','\u0118':'Eogon','\u0113':'emacr','\u0112':'Emacr','\uD835\uDD23':'ffr','\uD835\uDD57':'fopf','\uD835\uDCBB':'fscr','\uD835\uDD09':'Ffr','\uD835\uDD3D':'Fopf','\u2131':'Fscr','\uFB00':'fflig','\uFB03':'ffilig','\uFB04':'ffllig','\uFB01':'filig','fj':'fjlig','\uFB02':'fllig','\u0192':'fnof','\u210A':'gscr','\uD835\uDD58':'gopf','\uD835\uDD24':'gfr','\uD835\uDCA2':'Gscr','\uD835\uDD3E':'Gopf','\uD835\uDD0A':'Gfr','\u01F5':'gacute','\u011F':'gbreve','\u011E':'Gbreve','\u011D':'gcirc','\u011C':'Gcirc','\u0121':'gdot','\u0120':'Gdot','\u0122':'Gcedil','\uD835\uDD25':'hfr','\u210E':'planckh','\uD835\uDCBD':'hscr','\uD835\uDD59':'hopf','\u210B':'Hscr','\u210C':'Hfr','\u210D':'Hopf','\u0125':'hcirc','\u0124':'Hcirc','\u210F':'hbar','\u0127':'hstrok','\u0126':'Hstrok','\uD835\uDD5A':'iopf','\uD835\uDD26':'ifr','\uD835\uDCBE':'iscr','\u2148':'ii','\uD835\uDD40':'Iopf','\u2110':'Iscr','\u2111':'Im','\xED':'iacute','\xCD':'Iacute','\xEC':'igrave','\xCC':'Igrave','\xEE':'icirc','\xCE':'Icirc','\xEF':'iuml','\xCF':'Iuml','\u0129':'itilde','\u0128':'Itilde','\u0130':'Idot','\u012F':'iogon','\u012E':'Iogon','\u012B':'imacr','\u012A':'Imacr','\u0133':'ijlig','\u0132':'IJlig','\u0131':'imath','\uD835\uDCBF':'jscr','\uD835\uDD5B':'jopf','\uD835\uDD27':'jfr','\uD835\uDCA5':'Jscr','\uD835\uDD0D':'Jfr','\uD835\uDD41':'Jopf','\u0135':'jcirc','\u0134':'Jcirc','\u0237':'jmath','\uD835\uDD5C':'kopf','\uD835\uDCC0':'kscr','\uD835\uDD28':'kfr','\uD835\uDCA6':'Kscr','\uD835\uDD42':'Kopf','\uD835\uDD0E':'Kfr','\u0137':'kcedil','\u0136':'Kcedil','\uD835\uDD29':'lfr','\uD835\uDCC1':'lscr','\u2113':'ell','\uD835\uDD5D':'lopf','\u2112':'Lscr','\uD835\uDD0F':'Lfr','\uD835\uDD43':'Lopf','\u013A':'lacute','\u0139':'Lacute','\u013E':'lcaron','\u013D':'Lcaron','\u013C':'lcedil','\u013B':'Lcedil','\u0142':'lstrok','\u0141':'Lstrok','\u0140':'lmidot','\u013F':'Lmidot','\uD835\uDD2A':'mfr','\uD835\uDD5E':'mopf','\uD835\uDCC2':'mscr','\uD835\uDD10':'Mfr','\uD835\uDD44':'Mopf','\u2133':'Mscr','\uD835\uDD2B':'nfr','\uD835\uDD5F':'nopf','\uD835\uDCC3':'nscr','\u2115':'Nopf','\uD835\uDCA9':'Nscr','\uD835\uDD11':'Nfr','\u0144':'nacute','\u0143':'Nacute','\u0148':'ncaron','\u0147':'Ncaron','\xF1':'ntilde','\xD1':'Ntilde','\u0146':'ncedil','\u0145':'Ncedil','\u2116':'numero','\u014B':'eng','\u014A':'ENG','\uD835\uDD60':'oopf','\uD835\uDD2C':'ofr','\u2134':'oscr','\uD835\uDCAA':'Oscr','\uD835\uDD12':'Ofr','\uD835\uDD46':'Oopf','\xBA':'ordm','\xF3':'oacute','\xD3':'Oacute','\xF2':'ograve','\xD2':'Ograve','\xF4':'ocirc','\xD4':'Ocirc','\xF6':'ouml','\xD6':'Ouml','\u0151':'odblac','\u0150':'Odblac','\xF5':'otilde','\xD5':'Otilde','\xF8':'oslash','\xD8':'Oslash','\u014D':'omacr','\u014C':'Omacr','\u0153':'oelig','\u0152':'OElig','\uD835\uDD2D':'pfr','\uD835\uDCC5':'pscr','\uD835\uDD61':'popf','\u2119':'Popf','\uD835\uDD13':'Pfr','\uD835\uDCAB':'Pscr','\uD835\uDD62':'qopf','\uD835\uDD2E':'qfr','\uD835\uDCC6':'qscr','\uD835\uDCAC':'Qscr','\uD835\uDD14':'Qfr','\u211A':'Qopf','\u0138':'kgreen','\uD835\uDD2F':'rfr','\uD835\uDD63':'ropf','\uD835\uDCC7':'rscr','\u211B':'Rscr','\u211C':'Re','\u211D':'Ropf','\u0155':'racute','\u0154':'Racute','\u0159':'rcaron','\u0158':'Rcaron','\u0157':'rcedil','\u0156':'Rcedil','\uD835\uDD64':'sopf','\uD835\uDCC8':'sscr','\uD835\uDD30':'sfr','\uD835\uDD4A':'Sopf','\uD835\uDD16':'Sfr','\uD835\uDCAE':'Sscr','\u24C8':'oS','\u015B':'sacute','\u015A':'Sacute','\u015D':'scirc','\u015C':'Scirc','\u0161':'scaron','\u0160':'Scaron','\u015F':'scedil','\u015E':'Scedil','\xDF':'szlig','\uD835\uDD31':'tfr','\uD835\uDCC9':'tscr','\uD835\uDD65':'topf','\uD835\uDCAF':'Tscr','\uD835\uDD17':'Tfr','\uD835\uDD4B':'Topf','\u0165':'tcaron','\u0164':'Tcaron','\u0163':'tcedil','\u0162':'Tcedil','\u2122':'trade','\u0167':'tstrok','\u0166':'Tstrok','\uD835\uDCCA':'uscr','\uD835\uDD66':'uopf','\uD835\uDD32':'ufr','\uD835\uDD4C':'Uopf','\uD835\uDD18':'Ufr','\uD835\uDCB0':'Uscr','\xFA':'uacute','\xDA':'Uacute','\xF9':'ugrave','\xD9':'Ugrave','\u016D':'ubreve','\u016C':'Ubreve','\xFB':'ucirc','\xDB':'Ucirc','\u016F':'uring','\u016E':'Uring','\xFC':'uuml','\xDC':'Uuml','\u0171':'udblac','\u0170':'Udblac','\u0169':'utilde','\u0168':'Utilde','\u0173':'uogon','\u0172':'Uogon','\u016B':'umacr','\u016A':'Umacr','\uD835\uDD33':'vfr','\uD835\uDD67':'vopf','\uD835\uDCCB':'vscr','\uD835\uDD19':'Vfr','\uD835\uDD4D':'Vopf','\uD835\uDCB1':'Vscr','\uD835\uDD68':'wopf','\uD835\uDCCC':'wscr','\uD835\uDD34':'wfr','\uD835\uDCB2':'Wscr','\uD835\uDD4E':'Wopf','\uD835\uDD1A':'Wfr','\u0175':'wcirc','\u0174':'Wcirc','\uD835\uDD35':'xfr','\uD835\uDCCD':'xscr','\uD835\uDD69':'xopf','\uD835\uDD4F':'Xopf','\uD835\uDD1B':'Xfr','\uD835\uDCB3':'Xscr','\uD835\uDD36':'yfr','\uD835\uDCCE':'yscr','\uD835\uDD6A':'yopf','\uD835\uDCB4':'Yscr','\uD835\uDD1C':'Yfr','\uD835\uDD50':'Yopf','\xFD':'yacute','\xDD':'Yacute','\u0177':'ycirc','\u0176':'Ycirc','\xFF':'yuml','\u0178':'Yuml','\uD835\uDCCF':'zscr','\uD835\uDD37':'zfr','\uD835\uDD6B':'zopf','\u2128':'Zfr','\u2124':'Zopf','\uD835\uDCB5':'Zscr','\u017A':'zacute','\u0179':'Zacute','\u017E':'zcaron','\u017D':'Zcaron','\u017C':'zdot','\u017B':'Zdot','\u01B5':'imped','\xFE':'thorn','\xDE':'THORN','\u0149':'napos','\u03B1':'alpha','\u0391':'Alpha','\u03B2':'beta','\u0392':'Beta','\u03B3':'gamma','\u0393':'Gamma','\u03B4':'delta','\u0394':'Delta','\u03B5':'epsi','\u03F5':'epsiv','\u0395':'Epsilon','\u03DD':'gammad','\u03DC':'Gammad','\u03B6':'zeta','\u0396':'Zeta','\u03B7':'eta','\u0397':'Eta','\u03B8':'theta','\u03D1':'thetav','\u0398':'Theta','\u03B9':'iota','\u0399':'Iota','\u03BA':'kappa','\u03F0':'kappav','\u039A':'Kappa','\u03BB':'lambda','\u039B':'Lambda','\u03BC':'mu','\xB5':'micro','\u039C':'Mu','\u03BD':'nu','\u039D':'Nu','\u03BE':'xi','\u039E':'Xi','\u03BF':'omicron','\u039F':'Omicron','\u03C0':'pi','\u03D6':'piv','\u03A0':'Pi','\u03C1':'rho','\u03F1':'rhov','\u03A1':'Rho','\u03C3':'sigma','\u03A3':'Sigma','\u03C2':'sigmaf','\u03C4':'tau','\u03A4':'Tau','\u03C5':'upsi','\u03A5':'Upsilon','\u03D2':'Upsi','\u03C6':'phi','\u03D5':'phiv','\u03A6':'Phi','\u03C7':'chi','\u03A7':'Chi','\u03C8':'psi','\u03A8':'Psi','\u03C9':'omega','\u03A9':'ohm','\u0430':'acy','\u0410':'Acy','\u0431':'bcy','\u0411':'Bcy','\u0432':'vcy','\u0412':'Vcy','\u0433':'gcy','\u0413':'Gcy','\u0453':'gjcy','\u0403':'GJcy','\u0434':'dcy','\u0414':'Dcy','\u0452':'djcy','\u0402':'DJcy','\u0435':'iecy','\u0415':'IEcy','\u0451':'iocy','\u0401':'IOcy','\u0454':'jukcy','\u0404':'Jukcy','\u0436':'zhcy','\u0416':'ZHcy','\u0437':'zcy','\u0417':'Zcy','\u0455':'dscy','\u0405':'DScy','\u0438':'icy','\u0418':'Icy','\u0456':'iukcy','\u0406':'Iukcy','\u0457':'yicy','\u0407':'YIcy','\u0439':'jcy','\u0419':'Jcy','\u0458':'jsercy','\u0408':'Jsercy','\u043A':'kcy','\u041A':'Kcy','\u045C':'kjcy','\u040C':'KJcy','\u043B':'lcy','\u041B':'Lcy','\u0459':'ljcy','\u0409':'LJcy','\u043C':'mcy','\u041C':'Mcy','\u043D':'ncy','\u041D':'Ncy','\u045A':'njcy','\u040A':'NJcy','\u043E':'ocy','\u041E':'Ocy','\u043F':'pcy','\u041F':'Pcy','\u0440':'rcy','\u0420':'Rcy','\u0441':'scy','\u0421':'Scy','\u0442':'tcy','\u0422':'Tcy','\u045B':'tshcy','\u040B':'TSHcy','\u0443':'ucy','\u0423':'Ucy','\u045E':'ubrcy','\u040E':'Ubrcy','\u0444':'fcy','\u0424':'Fcy','\u0445':'khcy','\u0425':'KHcy','\u0446':'tscy','\u0426':'TScy','\u0447':'chcy','\u0427':'CHcy','\u045F':'dzcy','\u040F':'DZcy','\u0448':'shcy','\u0428':'SHcy','\u0449':'shchcy','\u0429':'SHCHcy','\u044A':'hardcy','\u042A':'HARDcy','\u044B':'ycy','\u042B':'Ycy','\u044C':'softcy','\u042C':'SOFTcy','\u044D':'ecy','\u042D':'Ecy','\u044E':'yucy','\u042E':'YUcy','\u044F':'yacy','\u042F':'YAcy','\u2135':'aleph','\u2136':'beth','\u2137':'gimel','\u2138':'daleth'};

	var regexEscape = /["&'<>`]/g;
	var escapeMap = {
		'"': '&quot;',
		'&': '&amp;',
		'\'': '&#x27;',
		'<': '&lt;',
		// See https://mathiasbynens.be/notes/ambiguous-ampersands: in HTML, the
		// following is not strictly necessary unless it’s part of a tag or an
		// unquoted attribute value. We’re only escaping it to support those
		// situations, and for XML support.
		'>': '&gt;',
		// In Internet Explorer ≤ 8, the backtick character can be used
		// to break out of (un)quoted attribute values or HTML comments.
		// See http://html5sec.org/#102, http://html5sec.org/#108, and
		// http://html5sec.org/#133.
		'`': '&#x60;'
	};

	var regexInvalidEntity = /&#(?:[xX][^a-fA-F0-9]|[^0-9xX])/;
	var regexInvalidRawCodePoint = /[\0-\x08\x0B\x0E-\x1F\x7F-\x9F\uFDD0-\uFDEF\uFFFE\uFFFF]|[\uD83F\uD87F\uD8BF\uD8FF\uD93F\uD97F\uD9BF\uD9FF\uDA3F\uDA7F\uDABF\uDAFF\uDB3F\uDB7F\uDBBF\uDBFF][\uDFFE\uDFFF]|[\uD800-\uDBFF](?![\uDC00-\uDFFF])|(?:[^\uD800-\uDBFF]|^)[\uDC00-\uDFFF]/;
	var regexDecode = /&#([0-9]+)(;?)|&#[xX]([a-fA-F0-9]+)(;?)|&([0-9a-zA-Z]+);|&(Aacute|Agrave|Atilde|Ccedil|Eacute|Egrave|Iacute|Igrave|Ntilde|Oacute|Ograve|Oslash|Otilde|Uacute|Ugrave|Yacute|aacute|agrave|atilde|brvbar|ccedil|curren|divide|eacute|egrave|frac12|frac14|frac34|iacute|igrave|iquest|middot|ntilde|oacute|ograve|oslash|otilde|plusmn|uacute|ugrave|yacute|AElig|Acirc|Aring|Ecirc|Icirc|Ocirc|THORN|Ucirc|acirc|acute|aelig|aring|cedil|ecirc|icirc|iexcl|laquo|micro|ocirc|pound|raquo|szlig|thorn|times|ucirc|Auml|COPY|Euml|Iuml|Ouml|QUOT|Uuml|auml|cent|copy|euml|iuml|macr|nbsp|ordf|ordm|ouml|para|quot|sect|sup1|sup2|sup3|uuml|yuml|AMP|ETH|REG|amp|deg|eth|not|reg|shy|uml|yen|GT|LT|gt|lt)([=a-zA-Z0-9])?/g;
	var decodeMap = {'aacute':'\xE1','Aacute':'\xC1','abreve':'\u0103','Abreve':'\u0102','ac':'\u223E','acd':'\u223F','acE':'\u223E\u0333','acirc':'\xE2','Acirc':'\xC2','acute':'\xB4','acy':'\u0430','Acy':'\u0410','aelig':'\xE6','AElig':'\xC6','af':'\u2061','afr':'\uD835\uDD1E','Afr':'\uD835\uDD04','agrave':'\xE0','Agrave':'\xC0','alefsym':'\u2135','aleph':'\u2135','alpha':'\u03B1','Alpha':'\u0391','amacr':'\u0101','Amacr':'\u0100','amalg':'\u2A3F','amp':'&','AMP':'&','and':'\u2227','And':'\u2A53','andand':'\u2A55','andd':'\u2A5C','andslope':'\u2A58','andv':'\u2A5A','ang':'\u2220','ange':'\u29A4','angle':'\u2220','angmsd':'\u2221','angmsdaa':'\u29A8','angmsdab':'\u29A9','angmsdac':'\u29AA','angmsdad':'\u29AB','angmsdae':'\u29AC','angmsdaf':'\u29AD','angmsdag':'\u29AE','angmsdah':'\u29AF','angrt':'\u221F','angrtvb':'\u22BE','angrtvbd':'\u299D','angsph':'\u2222','angst':'\xC5','angzarr':'\u237C','aogon':'\u0105','Aogon':'\u0104','aopf':'\uD835\uDD52','Aopf':'\uD835\uDD38','ap':'\u2248','apacir':'\u2A6F','ape':'\u224A','apE':'\u2A70','apid':'\u224B','apos':'\'','ApplyFunction':'\u2061','approx':'\u2248','approxeq':'\u224A','aring':'\xE5','Aring':'\xC5','ascr':'\uD835\uDCB6','Ascr':'\uD835\uDC9C','Assign':'\u2254','ast':'*','asymp':'\u2248','asympeq':'\u224D','atilde':'\xE3','Atilde':'\xC3','auml':'\xE4','Auml':'\xC4','awconint':'\u2233','awint':'\u2A11','backcong':'\u224C','backepsilon':'\u03F6','backprime':'\u2035','backsim':'\u223D','backsimeq':'\u22CD','Backslash':'\u2216','Barv':'\u2AE7','barvee':'\u22BD','barwed':'\u2305','Barwed':'\u2306','barwedge':'\u2305','bbrk':'\u23B5','bbrktbrk':'\u23B6','bcong':'\u224C','bcy':'\u0431','Bcy':'\u0411','bdquo':'\u201E','becaus':'\u2235','because':'\u2235','Because':'\u2235','bemptyv':'\u29B0','bepsi':'\u03F6','bernou':'\u212C','Bernoullis':'\u212C','beta':'\u03B2','Beta':'\u0392','beth':'\u2136','between':'\u226C','bfr':'\uD835\uDD1F','Bfr':'\uD835\uDD05','bigcap':'\u22C2','bigcirc':'\u25EF','bigcup':'\u22C3','bigodot':'\u2A00','bigoplus':'\u2A01','bigotimes':'\u2A02','bigsqcup':'\u2A06','bigstar':'\u2605','bigtriangledown':'\u25BD','bigtriangleup':'\u25B3','biguplus':'\u2A04','bigvee':'\u22C1','bigwedge':'\u22C0','bkarow':'\u290D','blacklozenge':'\u29EB','blacksquare':'\u25AA','blacktriangle':'\u25B4','blacktriangledown':'\u25BE','blacktriangleleft':'\u25C2','blacktriangleright':'\u25B8','blank':'\u2423','blk12':'\u2592','blk14':'\u2591','blk34':'\u2593','block':'\u2588','bne':'=\u20E5','bnequiv':'\u2261\u20E5','bnot':'\u2310','bNot':'\u2AED','bopf':'\uD835\uDD53','Bopf':'\uD835\uDD39','bot':'\u22A5','bottom':'\u22A5','bowtie':'\u22C8','boxbox':'\u29C9','boxdl':'\u2510','boxdL':'\u2555','boxDl':'\u2556','boxDL':'\u2557','boxdr':'\u250C','boxdR':'\u2552','boxDr':'\u2553','boxDR':'\u2554','boxh':'\u2500','boxH':'\u2550','boxhd':'\u252C','boxhD':'\u2565','boxHd':'\u2564','boxHD':'\u2566','boxhu':'\u2534','boxhU':'\u2568','boxHu':'\u2567','boxHU':'\u2569','boxminus':'\u229F','boxplus':'\u229E','boxtimes':'\u22A0','boxul':'\u2518','boxuL':'\u255B','boxUl':'\u255C','boxUL':'\u255D','boxur':'\u2514','boxuR':'\u2558','boxUr':'\u2559','boxUR':'\u255A','boxv':'\u2502','boxV':'\u2551','boxvh':'\u253C','boxvH':'\u256A','boxVh':'\u256B','boxVH':'\u256C','boxvl':'\u2524','boxvL':'\u2561','boxVl':'\u2562','boxVL':'\u2563','boxvr':'\u251C','boxvR':'\u255E','boxVr':'\u255F','boxVR':'\u2560','bprime':'\u2035','breve':'\u02D8','Breve':'\u02D8','brvbar':'\xA6','bscr':'\uD835\uDCB7','Bscr':'\u212C','bsemi':'\u204F','bsim':'\u223D','bsime':'\u22CD','bsol':'\\','bsolb':'\u29C5','bsolhsub':'\u27C8','bull':'\u2022','bullet':'\u2022','bump':'\u224E','bumpe':'\u224F','bumpE':'\u2AAE','bumpeq':'\u224F','Bumpeq':'\u224E','cacute':'\u0107','Cacute':'\u0106','cap':'\u2229','Cap':'\u22D2','capand':'\u2A44','capbrcup':'\u2A49','capcap':'\u2A4B','capcup':'\u2A47','capdot':'\u2A40','CapitalDifferentialD':'\u2145','caps':'\u2229\uFE00','caret':'\u2041','caron':'\u02C7','Cayleys':'\u212D','ccaps':'\u2A4D','ccaron':'\u010D','Ccaron':'\u010C','ccedil':'\xE7','Ccedil':'\xC7','ccirc':'\u0109','Ccirc':'\u0108','Cconint':'\u2230','ccups':'\u2A4C','ccupssm':'\u2A50','cdot':'\u010B','Cdot':'\u010A','cedil':'\xB8','Cedilla':'\xB8','cemptyv':'\u29B2','cent':'\xA2','centerdot':'\xB7','CenterDot':'\xB7','cfr':'\uD835\uDD20','Cfr':'\u212D','chcy':'\u0447','CHcy':'\u0427','check':'\u2713','checkmark':'\u2713','chi':'\u03C7','Chi':'\u03A7','cir':'\u25CB','circ':'\u02C6','circeq':'\u2257','circlearrowleft':'\u21BA','circlearrowright':'\u21BB','circledast':'\u229B','circledcirc':'\u229A','circleddash':'\u229D','CircleDot':'\u2299','circledR':'\xAE','circledS':'\u24C8','CircleMinus':'\u2296','CirclePlus':'\u2295','CircleTimes':'\u2297','cire':'\u2257','cirE':'\u29C3','cirfnint':'\u2A10','cirmid':'\u2AEF','cirscir':'\u29C2','ClockwiseContourIntegral':'\u2232','CloseCurlyDoubleQuote':'\u201D','CloseCurlyQuote':'\u2019','clubs':'\u2663','clubsuit':'\u2663','colon':':','Colon':'\u2237','colone':'\u2254','Colone':'\u2A74','coloneq':'\u2254','comma':',','commat':'@','comp':'\u2201','compfn':'\u2218','complement':'\u2201','complexes':'\u2102','cong':'\u2245','congdot':'\u2A6D','Congruent':'\u2261','conint':'\u222E','Conint':'\u222F','ContourIntegral':'\u222E','copf':'\uD835\uDD54','Copf':'\u2102','coprod':'\u2210','Coproduct':'\u2210','copy':'\xA9','COPY':'\xA9','copysr':'\u2117','CounterClockwiseContourIntegral':'\u2233','crarr':'\u21B5','cross':'\u2717','Cross':'\u2A2F','cscr':'\uD835\uDCB8','Cscr':'\uD835\uDC9E','csub':'\u2ACF','csube':'\u2AD1','csup':'\u2AD0','csupe':'\u2AD2','ctdot':'\u22EF','cudarrl':'\u2938','cudarrr':'\u2935','cuepr':'\u22DE','cuesc':'\u22DF','cularr':'\u21B6','cularrp':'\u293D','cup':'\u222A','Cup':'\u22D3','cupbrcap':'\u2A48','cupcap':'\u2A46','CupCap':'\u224D','cupcup':'\u2A4A','cupdot':'\u228D','cupor':'\u2A45','cups':'\u222A\uFE00','curarr':'\u21B7','curarrm':'\u293C','curlyeqprec':'\u22DE','curlyeqsucc':'\u22DF','curlyvee':'\u22CE','curlywedge':'\u22CF','curren':'\xA4','curvearrowleft':'\u21B6','curvearrowright':'\u21B7','cuvee':'\u22CE','cuwed':'\u22CF','cwconint':'\u2232','cwint':'\u2231','cylcty':'\u232D','dagger':'\u2020','Dagger':'\u2021','daleth':'\u2138','darr':'\u2193','dArr':'\u21D3','Darr':'\u21A1','dash':'\u2010','dashv':'\u22A3','Dashv':'\u2AE4','dbkarow':'\u290F','dblac':'\u02DD','dcaron':'\u010F','Dcaron':'\u010E','dcy':'\u0434','Dcy':'\u0414','dd':'\u2146','DD':'\u2145','ddagger':'\u2021','ddarr':'\u21CA','DDotrahd':'\u2911','ddotseq':'\u2A77','deg':'\xB0','Del':'\u2207','delta':'\u03B4','Delta':'\u0394','demptyv':'\u29B1','dfisht':'\u297F','dfr':'\uD835\uDD21','Dfr':'\uD835\uDD07','dHar':'\u2965','dharl':'\u21C3','dharr':'\u21C2','DiacriticalAcute':'\xB4','DiacriticalDot':'\u02D9','DiacriticalDoubleAcute':'\u02DD','DiacriticalGrave':'`','DiacriticalTilde':'\u02DC','diam':'\u22C4','diamond':'\u22C4','Diamond':'\u22C4','diamondsuit':'\u2666','diams':'\u2666','die':'\xA8','DifferentialD':'\u2146','digamma':'\u03DD','disin':'\u22F2','div':'\xF7','divide':'\xF7','divideontimes':'\u22C7','divonx':'\u22C7','djcy':'\u0452','DJcy':'\u0402','dlcorn':'\u231E','dlcrop':'\u230D','dollar':'$','dopf':'\uD835\uDD55','Dopf':'\uD835\uDD3B','dot':'\u02D9','Dot':'\xA8','DotDot':'\u20DC','doteq':'\u2250','doteqdot':'\u2251','DotEqual':'\u2250','dotminus':'\u2238','dotplus':'\u2214','dotsquare':'\u22A1','doublebarwedge':'\u2306','DoubleContourIntegral':'\u222F','DoubleDot':'\xA8','DoubleDownArrow':'\u21D3','DoubleLeftArrow':'\u21D0','DoubleLeftRightArrow':'\u21D4','DoubleLeftTee':'\u2AE4','DoubleLongLeftArrow':'\u27F8','DoubleLongLeftRightArrow':'\u27FA','DoubleLongRightArrow':'\u27F9','DoubleRightArrow':'\u21D2','DoubleRightTee':'\u22A8','DoubleUpArrow':'\u21D1','DoubleUpDownArrow':'\u21D5','DoubleVerticalBar':'\u2225','downarrow':'\u2193','Downarrow':'\u21D3','DownArrow':'\u2193','DownArrowBar':'\u2913','DownArrowUpArrow':'\u21F5','DownBreve':'\u0311','downdownarrows':'\u21CA','downharpoonleft':'\u21C3','downharpoonright':'\u21C2','DownLeftRightVector':'\u2950','DownLeftTeeVector':'\u295E','DownLeftVector':'\u21BD','DownLeftVectorBar':'\u2956','DownRightTeeVector':'\u295F','DownRightVector':'\u21C1','DownRightVectorBar':'\u2957','DownTee':'\u22A4','DownTeeArrow':'\u21A7','drbkarow':'\u2910','drcorn':'\u231F','drcrop':'\u230C','dscr':'\uD835\uDCB9','Dscr':'\uD835\uDC9F','dscy':'\u0455','DScy':'\u0405','dsol':'\u29F6','dstrok':'\u0111','Dstrok':'\u0110','dtdot':'\u22F1','dtri':'\u25BF','dtrif':'\u25BE','duarr':'\u21F5','duhar':'\u296F','dwangle':'\u29A6','dzcy':'\u045F','DZcy':'\u040F','dzigrarr':'\u27FF','eacute':'\xE9','Eacute':'\xC9','easter':'\u2A6E','ecaron':'\u011B','Ecaron':'\u011A','ecir':'\u2256','ecirc':'\xEA','Ecirc':'\xCA','ecolon':'\u2255','ecy':'\u044D','Ecy':'\u042D','eDDot':'\u2A77','edot':'\u0117','eDot':'\u2251','Edot':'\u0116','ee':'\u2147','efDot':'\u2252','efr':'\uD835\uDD22','Efr':'\uD835\uDD08','eg':'\u2A9A','egrave':'\xE8','Egrave':'\xC8','egs':'\u2A96','egsdot':'\u2A98','el':'\u2A99','Element':'\u2208','elinters':'\u23E7','ell':'\u2113','els':'\u2A95','elsdot':'\u2A97','emacr':'\u0113','Emacr':'\u0112','empty':'\u2205','emptyset':'\u2205','EmptySmallSquare':'\u25FB','emptyv':'\u2205','EmptyVerySmallSquare':'\u25AB','emsp':'\u2003','emsp13':'\u2004','emsp14':'\u2005','eng':'\u014B','ENG':'\u014A','ensp':'\u2002','eogon':'\u0119','Eogon':'\u0118','eopf':'\uD835\uDD56','Eopf':'\uD835\uDD3C','epar':'\u22D5','eparsl':'\u29E3','eplus':'\u2A71','epsi':'\u03B5','epsilon':'\u03B5','Epsilon':'\u0395','epsiv':'\u03F5','eqcirc':'\u2256','eqcolon':'\u2255','eqsim':'\u2242','eqslantgtr':'\u2A96','eqslantless':'\u2A95','Equal':'\u2A75','equals':'=','EqualTilde':'\u2242','equest':'\u225F','Equilibrium':'\u21CC','equiv':'\u2261','equivDD':'\u2A78','eqvparsl':'\u29E5','erarr':'\u2971','erDot':'\u2253','escr':'\u212F','Escr':'\u2130','esdot':'\u2250','esim':'\u2242','Esim':'\u2A73','eta':'\u03B7','Eta':'\u0397','eth':'\xF0','ETH':'\xD0','euml':'\xEB','Euml':'\xCB','euro':'\u20AC','excl':'!','exist':'\u2203','Exists':'\u2203','expectation':'\u2130','exponentiale':'\u2147','ExponentialE':'\u2147','fallingdotseq':'\u2252','fcy':'\u0444','Fcy':'\u0424','female':'\u2640','ffilig':'\uFB03','fflig':'\uFB00','ffllig':'\uFB04','ffr':'\uD835\uDD23','Ffr':'\uD835\uDD09','filig':'\uFB01','FilledSmallSquare':'\u25FC','FilledVerySmallSquare':'\u25AA','fjlig':'fj','flat':'\u266D','fllig':'\uFB02','fltns':'\u25B1','fnof':'\u0192','fopf':'\uD835\uDD57','Fopf':'\uD835\uDD3D','forall':'\u2200','ForAll':'\u2200','fork':'\u22D4','forkv':'\u2AD9','Fouriertrf':'\u2131','fpartint':'\u2A0D','frac12':'\xBD','frac13':'\u2153','frac14':'\xBC','frac15':'\u2155','frac16':'\u2159','frac18':'\u215B','frac23':'\u2154','frac25':'\u2156','frac34':'\xBE','frac35':'\u2157','frac38':'\u215C','frac45':'\u2158','frac56':'\u215A','frac58':'\u215D','frac78':'\u215E','frasl':'\u2044','frown':'\u2322','fscr':'\uD835\uDCBB','Fscr':'\u2131','gacute':'\u01F5','gamma':'\u03B3','Gamma':'\u0393','gammad':'\u03DD','Gammad':'\u03DC','gap':'\u2A86','gbreve':'\u011F','Gbreve':'\u011E','Gcedil':'\u0122','gcirc':'\u011D','Gcirc':'\u011C','gcy':'\u0433','Gcy':'\u0413','gdot':'\u0121','Gdot':'\u0120','ge':'\u2265','gE':'\u2267','gel':'\u22DB','gEl':'\u2A8C','geq':'\u2265','geqq':'\u2267','geqslant':'\u2A7E','ges':'\u2A7E','gescc':'\u2AA9','gesdot':'\u2A80','gesdoto':'\u2A82','gesdotol':'\u2A84','gesl':'\u22DB\uFE00','gesles':'\u2A94','gfr':'\uD835\uDD24','Gfr':'\uD835\uDD0A','gg':'\u226B','Gg':'\u22D9','ggg':'\u22D9','gimel':'\u2137','gjcy':'\u0453','GJcy':'\u0403','gl':'\u2277','gla':'\u2AA5','glE':'\u2A92','glj':'\u2AA4','gnap':'\u2A8A','gnapprox':'\u2A8A','gne':'\u2A88','gnE':'\u2269','gneq':'\u2A88','gneqq':'\u2269','gnsim':'\u22E7','gopf':'\uD835\uDD58','Gopf':'\uD835\uDD3E','grave':'`','GreaterEqual':'\u2265','GreaterEqualLess':'\u22DB','GreaterFullEqual':'\u2267','GreaterGreater':'\u2AA2','GreaterLess':'\u2277','GreaterSlantEqual':'\u2A7E','GreaterTilde':'\u2273','gscr':'\u210A','Gscr':'\uD835\uDCA2','gsim':'\u2273','gsime':'\u2A8E','gsiml':'\u2A90','gt':'>','Gt':'\u226B','GT':'>','gtcc':'\u2AA7','gtcir':'\u2A7A','gtdot':'\u22D7','gtlPar':'\u2995','gtquest':'\u2A7C','gtrapprox':'\u2A86','gtrarr':'\u2978','gtrdot':'\u22D7','gtreqless':'\u22DB','gtreqqless':'\u2A8C','gtrless':'\u2277','gtrsim':'\u2273','gvertneqq':'\u2269\uFE00','gvnE':'\u2269\uFE00','Hacek':'\u02C7','hairsp':'\u200A','half':'\xBD','hamilt':'\u210B','hardcy':'\u044A','HARDcy':'\u042A','harr':'\u2194','hArr':'\u21D4','harrcir':'\u2948','harrw':'\u21AD','Hat':'^','hbar':'\u210F','hcirc':'\u0125','Hcirc':'\u0124','hearts':'\u2665','heartsuit':'\u2665','hellip':'\u2026','hercon':'\u22B9','hfr':'\uD835\uDD25','Hfr':'\u210C','HilbertSpace':'\u210B','hksearow':'\u2925','hkswarow':'\u2926','hoarr':'\u21FF','homtht':'\u223B','hookleftarrow':'\u21A9','hookrightarrow':'\u21AA','hopf':'\uD835\uDD59','Hopf':'\u210D','horbar':'\u2015','HorizontalLine':'\u2500','hscr':'\uD835\uDCBD','Hscr':'\u210B','hslash':'\u210F','hstrok':'\u0127','Hstrok':'\u0126','HumpDownHump':'\u224E','HumpEqual':'\u224F','hybull':'\u2043','hyphen':'\u2010','iacute':'\xED','Iacute':'\xCD','ic':'\u2063','icirc':'\xEE','Icirc':'\xCE','icy':'\u0438','Icy':'\u0418','Idot':'\u0130','iecy':'\u0435','IEcy':'\u0415','iexcl':'\xA1','iff':'\u21D4','ifr':'\uD835\uDD26','Ifr':'\u2111','igrave':'\xEC','Igrave':'\xCC','ii':'\u2148','iiiint':'\u2A0C','iiint':'\u222D','iinfin':'\u29DC','iiota':'\u2129','ijlig':'\u0133','IJlig':'\u0132','Im':'\u2111','imacr':'\u012B','Imacr':'\u012A','image':'\u2111','ImaginaryI':'\u2148','imagline':'\u2110','imagpart':'\u2111','imath':'\u0131','imof':'\u22B7','imped':'\u01B5','Implies':'\u21D2','in':'\u2208','incare':'\u2105','infin':'\u221E','infintie':'\u29DD','inodot':'\u0131','int':'\u222B','Int':'\u222C','intcal':'\u22BA','integers':'\u2124','Integral':'\u222B','intercal':'\u22BA','Intersection':'\u22C2','intlarhk':'\u2A17','intprod':'\u2A3C','InvisibleComma':'\u2063','InvisibleTimes':'\u2062','iocy':'\u0451','IOcy':'\u0401','iogon':'\u012F','Iogon':'\u012E','iopf':'\uD835\uDD5A','Iopf':'\uD835\uDD40','iota':'\u03B9','Iota':'\u0399','iprod':'\u2A3C','iquest':'\xBF','iscr':'\uD835\uDCBE','Iscr':'\u2110','isin':'\u2208','isindot':'\u22F5','isinE':'\u22F9','isins':'\u22F4','isinsv':'\u22F3','isinv':'\u2208','it':'\u2062','itilde':'\u0129','Itilde':'\u0128','iukcy':'\u0456','Iukcy':'\u0406','iuml':'\xEF','Iuml':'\xCF','jcirc':'\u0135','Jcirc':'\u0134','jcy':'\u0439','Jcy':'\u0419','jfr':'\uD835\uDD27','Jfr':'\uD835\uDD0D','jmath':'\u0237','jopf':'\uD835\uDD5B','Jopf':'\uD835\uDD41','jscr':'\uD835\uDCBF','Jscr':'\uD835\uDCA5','jsercy':'\u0458','Jsercy':'\u0408','jukcy':'\u0454','Jukcy':'\u0404','kappa':'\u03BA','Kappa':'\u039A','kappav':'\u03F0','kcedil':'\u0137','Kcedil':'\u0136','kcy':'\u043A','Kcy':'\u041A','kfr':'\uD835\uDD28','Kfr':'\uD835\uDD0E','kgreen':'\u0138','khcy':'\u0445','KHcy':'\u0425','kjcy':'\u045C','KJcy':'\u040C','kopf':'\uD835\uDD5C','Kopf':'\uD835\uDD42','kscr':'\uD835\uDCC0','Kscr':'\uD835\uDCA6','lAarr':'\u21DA','lacute':'\u013A','Lacute':'\u0139','laemptyv':'\u29B4','lagran':'\u2112','lambda':'\u03BB','Lambda':'\u039B','lang':'\u27E8','Lang':'\u27EA','langd':'\u2991','langle':'\u27E8','lap':'\u2A85','Laplacetrf':'\u2112','laquo':'\xAB','larr':'\u2190','lArr':'\u21D0','Larr':'\u219E','larrb':'\u21E4','larrbfs':'\u291F','larrfs':'\u291D','larrhk':'\u21A9','larrlp':'\u21AB','larrpl':'\u2939','larrsim':'\u2973','larrtl':'\u21A2','lat':'\u2AAB','latail':'\u2919','lAtail':'\u291B','late':'\u2AAD','lates':'\u2AAD\uFE00','lbarr':'\u290C','lBarr':'\u290E','lbbrk':'\u2772','lbrace':'{','lbrack':'[','lbrke':'\u298B','lbrksld':'\u298F','lbrkslu':'\u298D','lcaron':'\u013E','Lcaron':'\u013D','lcedil':'\u013C','Lcedil':'\u013B','lceil':'\u2308','lcub':'{','lcy':'\u043B','Lcy':'\u041B','ldca':'\u2936','ldquo':'\u201C','ldquor':'\u201E','ldrdhar':'\u2967','ldrushar':'\u294B','ldsh':'\u21B2','le':'\u2264','lE':'\u2266','LeftAngleBracket':'\u27E8','leftarrow':'\u2190','Leftarrow':'\u21D0','LeftArrow':'\u2190','LeftArrowBar':'\u21E4','LeftArrowRightArrow':'\u21C6','leftarrowtail':'\u21A2','LeftCeiling':'\u2308','LeftDoubleBracket':'\u27E6','LeftDownTeeVector':'\u2961','LeftDownVector':'\u21C3','LeftDownVectorBar':'\u2959','LeftFloor':'\u230A','leftharpoondown':'\u21BD','leftharpoonup':'\u21BC','leftleftarrows':'\u21C7','leftrightarrow':'\u2194','Leftrightarrow':'\u21D4','LeftRightArrow':'\u2194','leftrightarrows':'\u21C6','leftrightharpoons':'\u21CB','leftrightsquigarrow':'\u21AD','LeftRightVector':'\u294E','LeftTee':'\u22A3','LeftTeeArrow':'\u21A4','LeftTeeVector':'\u295A','leftthreetimes':'\u22CB','LeftTriangle':'\u22B2','LeftTriangleBar':'\u29CF','LeftTriangleEqual':'\u22B4','LeftUpDownVector':'\u2951','LeftUpTeeVector':'\u2960','LeftUpVector':'\u21BF','LeftUpVectorBar':'\u2958','LeftVector':'\u21BC','LeftVectorBar':'\u2952','leg':'\u22DA','lEg':'\u2A8B','leq':'\u2264','leqq':'\u2266','leqslant':'\u2A7D','les':'\u2A7D','lescc':'\u2AA8','lesdot':'\u2A7F','lesdoto':'\u2A81','lesdotor':'\u2A83','lesg':'\u22DA\uFE00','lesges':'\u2A93','lessapprox':'\u2A85','lessdot':'\u22D6','lesseqgtr':'\u22DA','lesseqqgtr':'\u2A8B','LessEqualGreater':'\u22DA','LessFullEqual':'\u2266','LessGreater':'\u2276','lessgtr':'\u2276','LessLess':'\u2AA1','lesssim':'\u2272','LessSlantEqual':'\u2A7D','LessTilde':'\u2272','lfisht':'\u297C','lfloor':'\u230A','lfr':'\uD835\uDD29','Lfr':'\uD835\uDD0F','lg':'\u2276','lgE':'\u2A91','lHar':'\u2962','lhard':'\u21BD','lharu':'\u21BC','lharul':'\u296A','lhblk':'\u2584','ljcy':'\u0459','LJcy':'\u0409','ll':'\u226A','Ll':'\u22D8','llarr':'\u21C7','llcorner':'\u231E','Lleftarrow':'\u21DA','llhard':'\u296B','lltri':'\u25FA','lmidot':'\u0140','Lmidot':'\u013F','lmoust':'\u23B0','lmoustache':'\u23B0','lnap':'\u2A89','lnapprox':'\u2A89','lne':'\u2A87','lnE':'\u2268','lneq':'\u2A87','lneqq':'\u2268','lnsim':'\u22E6','loang':'\u27EC','loarr':'\u21FD','lobrk':'\u27E6','longleftarrow':'\u27F5','Longleftarrow':'\u27F8','LongLeftArrow':'\u27F5','longleftrightarrow':'\u27F7','Longleftrightarrow':'\u27FA','LongLeftRightArrow':'\u27F7','longmapsto':'\u27FC','longrightarrow':'\u27F6','Longrightarrow':'\u27F9','LongRightArrow':'\u27F6','looparrowleft':'\u21AB','looparrowright':'\u21AC','lopar':'\u2985','lopf':'\uD835\uDD5D','Lopf':'\uD835\uDD43','loplus':'\u2A2D','lotimes':'\u2A34','lowast':'\u2217','lowbar':'_','LowerLeftArrow':'\u2199','LowerRightArrow':'\u2198','loz':'\u25CA','lozenge':'\u25CA','lozf':'\u29EB','lpar':'(','lparlt':'\u2993','lrarr':'\u21C6','lrcorner':'\u231F','lrhar':'\u21CB','lrhard':'\u296D','lrm':'\u200E','lrtri':'\u22BF','lsaquo':'\u2039','lscr':'\uD835\uDCC1','Lscr':'\u2112','lsh':'\u21B0','Lsh':'\u21B0','lsim':'\u2272','lsime':'\u2A8D','lsimg':'\u2A8F','lsqb':'[','lsquo':'\u2018','lsquor':'\u201A','lstrok':'\u0142','Lstrok':'\u0141','lt':'<','Lt':'\u226A','LT':'<','ltcc':'\u2AA6','ltcir':'\u2A79','ltdot':'\u22D6','lthree':'\u22CB','ltimes':'\u22C9','ltlarr':'\u2976','ltquest':'\u2A7B','ltri':'\u25C3','ltrie':'\u22B4','ltrif':'\u25C2','ltrPar':'\u2996','lurdshar':'\u294A','luruhar':'\u2966','lvertneqq':'\u2268\uFE00','lvnE':'\u2268\uFE00','macr':'\xAF','male':'\u2642','malt':'\u2720','maltese':'\u2720','map':'\u21A6','Map':'\u2905','mapsto':'\u21A6','mapstodown':'\u21A7','mapstoleft':'\u21A4','mapstoup':'\u21A5','marker':'\u25AE','mcomma':'\u2A29','mcy':'\u043C','Mcy':'\u041C','mdash':'\u2014','mDDot':'\u223A','measuredangle':'\u2221','MediumSpace':'\u205F','Mellintrf':'\u2133','mfr':'\uD835\uDD2A','Mfr':'\uD835\uDD10','mho':'\u2127','micro':'\xB5','mid':'\u2223','midast':'*','midcir':'\u2AF0','middot':'\xB7','minus':'\u2212','minusb':'\u229F','minusd':'\u2238','minusdu':'\u2A2A','MinusPlus':'\u2213','mlcp':'\u2ADB','mldr':'\u2026','mnplus':'\u2213','models':'\u22A7','mopf':'\uD835\uDD5E','Mopf':'\uD835\uDD44','mp':'\u2213','mscr':'\uD835\uDCC2','Mscr':'\u2133','mstpos':'\u223E','mu':'\u03BC','Mu':'\u039C','multimap':'\u22B8','mumap':'\u22B8','nabla':'\u2207','nacute':'\u0144','Nacute':'\u0143','nang':'\u2220\u20D2','nap':'\u2249','napE':'\u2A70\u0338','napid':'\u224B\u0338','napos':'\u0149','napprox':'\u2249','natur':'\u266E','natural':'\u266E','naturals':'\u2115','nbsp':'\xA0','nbump':'\u224E\u0338','nbumpe':'\u224F\u0338','ncap':'\u2A43','ncaron':'\u0148','Ncaron':'\u0147','ncedil':'\u0146','Ncedil':'\u0145','ncong':'\u2247','ncongdot':'\u2A6D\u0338','ncup':'\u2A42','ncy':'\u043D','Ncy':'\u041D','ndash':'\u2013','ne':'\u2260','nearhk':'\u2924','nearr':'\u2197','neArr':'\u21D7','nearrow':'\u2197','nedot':'\u2250\u0338','NegativeMediumSpace':'\u200B','NegativeThickSpace':'\u200B','NegativeThinSpace':'\u200B','NegativeVeryThinSpace':'\u200B','nequiv':'\u2262','nesear':'\u2928','nesim':'\u2242\u0338','NestedGreaterGreater':'\u226B','NestedLessLess':'\u226A','NewLine':'\n','nexist':'\u2204','nexists':'\u2204','nfr':'\uD835\uDD2B','Nfr':'\uD835\uDD11','nge':'\u2271','ngE':'\u2267\u0338','ngeq':'\u2271','ngeqq':'\u2267\u0338','ngeqslant':'\u2A7E\u0338','nges':'\u2A7E\u0338','nGg':'\u22D9\u0338','ngsim':'\u2275','ngt':'\u226F','nGt':'\u226B\u20D2','ngtr':'\u226F','nGtv':'\u226B\u0338','nharr':'\u21AE','nhArr':'\u21CE','nhpar':'\u2AF2','ni':'\u220B','nis':'\u22FC','nisd':'\u22FA','niv':'\u220B','njcy':'\u045A','NJcy':'\u040A','nlarr':'\u219A','nlArr':'\u21CD','nldr':'\u2025','nle':'\u2270','nlE':'\u2266\u0338','nleftarrow':'\u219A','nLeftarrow':'\u21CD','nleftrightarrow':'\u21AE','nLeftrightarrow':'\u21CE','nleq':'\u2270','nleqq':'\u2266\u0338','nleqslant':'\u2A7D\u0338','nles':'\u2A7D\u0338','nless':'\u226E','nLl':'\u22D8\u0338','nlsim':'\u2274','nlt':'\u226E','nLt':'\u226A\u20D2','nltri':'\u22EA','nltrie':'\u22EC','nLtv':'\u226A\u0338','nmid':'\u2224','NoBreak':'\u2060','NonBreakingSpace':'\xA0','nopf':'\uD835\uDD5F','Nopf':'\u2115','not':'\xAC','Not':'\u2AEC','NotCongruent':'\u2262','NotCupCap':'\u226D','NotDoubleVerticalBar':'\u2226','NotElement':'\u2209','NotEqual':'\u2260','NotEqualTilde':'\u2242\u0338','NotExists':'\u2204','NotGreater':'\u226F','NotGreaterEqual':'\u2271','NotGreaterFullEqual':'\u2267\u0338','NotGreaterGreater':'\u226B\u0338','NotGreaterLess':'\u2279','NotGreaterSlantEqual':'\u2A7E\u0338','NotGreaterTilde':'\u2275','NotHumpDownHump':'\u224E\u0338','NotHumpEqual':'\u224F\u0338','notin':'\u2209','notindot':'\u22F5\u0338','notinE':'\u22F9\u0338','notinva':'\u2209','notinvb':'\u22F7','notinvc':'\u22F6','NotLeftTriangle':'\u22EA','NotLeftTriangleBar':'\u29CF\u0338','NotLeftTriangleEqual':'\u22EC','NotLess':'\u226E','NotLessEqual':'\u2270','NotLessGreater':'\u2278','NotLessLess':'\u226A\u0338','NotLessSlantEqual':'\u2A7D\u0338','NotLessTilde':'\u2274','NotNestedGreaterGreater':'\u2AA2\u0338','NotNestedLessLess':'\u2AA1\u0338','notni':'\u220C','notniva':'\u220C','notnivb':'\u22FE','notnivc':'\u22FD','NotPrecedes':'\u2280','NotPrecedesEqual':'\u2AAF\u0338','NotPrecedesSlantEqual':'\u22E0','NotReverseElement':'\u220C','NotRightTriangle':'\u22EB','NotRightTriangleBar':'\u29D0\u0338','NotRightTriangleEqual':'\u22ED','NotSquareSubset':'\u228F\u0338','NotSquareSubsetEqual':'\u22E2','NotSquareSuperset':'\u2290\u0338','NotSquareSupersetEqual':'\u22E3','NotSubset':'\u2282\u20D2','NotSubsetEqual':'\u2288','NotSucceeds':'\u2281','NotSucceedsEqual':'\u2AB0\u0338','NotSucceedsSlantEqual':'\u22E1','NotSucceedsTilde':'\u227F\u0338','NotSuperset':'\u2283\u20D2','NotSupersetEqual':'\u2289','NotTilde':'\u2241','NotTildeEqual':'\u2244','NotTildeFullEqual':'\u2247','NotTildeTilde':'\u2249','NotVerticalBar':'\u2224','npar':'\u2226','nparallel':'\u2226','nparsl':'\u2AFD\u20E5','npart':'\u2202\u0338','npolint':'\u2A14','npr':'\u2280','nprcue':'\u22E0','npre':'\u2AAF\u0338','nprec':'\u2280','npreceq':'\u2AAF\u0338','nrarr':'\u219B','nrArr':'\u21CF','nrarrc':'\u2933\u0338','nrarrw':'\u219D\u0338','nrightarrow':'\u219B','nRightarrow':'\u21CF','nrtri':'\u22EB','nrtrie':'\u22ED','nsc':'\u2281','nsccue':'\u22E1','nsce':'\u2AB0\u0338','nscr':'\uD835\uDCC3','Nscr':'\uD835\uDCA9','nshortmid':'\u2224','nshortparallel':'\u2226','nsim':'\u2241','nsime':'\u2244','nsimeq':'\u2244','nsmid':'\u2224','nspar':'\u2226','nsqsube':'\u22E2','nsqsupe':'\u22E3','nsub':'\u2284','nsube':'\u2288','nsubE':'\u2AC5\u0338','nsubset':'\u2282\u20D2','nsubseteq':'\u2288','nsubseteqq':'\u2AC5\u0338','nsucc':'\u2281','nsucceq':'\u2AB0\u0338','nsup':'\u2285','nsupe':'\u2289','nsupE':'\u2AC6\u0338','nsupset':'\u2283\u20D2','nsupseteq':'\u2289','nsupseteqq':'\u2AC6\u0338','ntgl':'\u2279','ntilde':'\xF1','Ntilde':'\xD1','ntlg':'\u2278','ntriangleleft':'\u22EA','ntrianglelefteq':'\u22EC','ntriangleright':'\u22EB','ntrianglerighteq':'\u22ED','nu':'\u03BD','Nu':'\u039D','num':'#','numero':'\u2116','numsp':'\u2007','nvap':'\u224D\u20D2','nvdash':'\u22AC','nvDash':'\u22AD','nVdash':'\u22AE','nVDash':'\u22AF','nvge':'\u2265\u20D2','nvgt':'>\u20D2','nvHarr':'\u2904','nvinfin':'\u29DE','nvlArr':'\u2902','nvle':'\u2264\u20D2','nvlt':'<\u20D2','nvltrie':'\u22B4\u20D2','nvrArr':'\u2903','nvrtrie':'\u22B5\u20D2','nvsim':'\u223C\u20D2','nwarhk':'\u2923','nwarr':'\u2196','nwArr':'\u21D6','nwarrow':'\u2196','nwnear':'\u2927','oacute':'\xF3','Oacute':'\xD3','oast':'\u229B','ocir':'\u229A','ocirc':'\xF4','Ocirc':'\xD4','ocy':'\u043E','Ocy':'\u041E','odash':'\u229D','odblac':'\u0151','Odblac':'\u0150','odiv':'\u2A38','odot':'\u2299','odsold':'\u29BC','oelig':'\u0153','OElig':'\u0152','ofcir':'\u29BF','ofr':'\uD835\uDD2C','Ofr':'\uD835\uDD12','ogon':'\u02DB','ograve':'\xF2','Ograve':'\xD2','ogt':'\u29C1','ohbar':'\u29B5','ohm':'\u03A9','oint':'\u222E','olarr':'\u21BA','olcir':'\u29BE','olcross':'\u29BB','oline':'\u203E','olt':'\u29C0','omacr':'\u014D','Omacr':'\u014C','omega':'\u03C9','Omega':'\u03A9','omicron':'\u03BF','Omicron':'\u039F','omid':'\u29B6','ominus':'\u2296','oopf':'\uD835\uDD60','Oopf':'\uD835\uDD46','opar':'\u29B7','OpenCurlyDoubleQuote':'\u201C','OpenCurlyQuote':'\u2018','operp':'\u29B9','oplus':'\u2295','or':'\u2228','Or':'\u2A54','orarr':'\u21BB','ord':'\u2A5D','order':'\u2134','orderof':'\u2134','ordf':'\xAA','ordm':'\xBA','origof':'\u22B6','oror':'\u2A56','orslope':'\u2A57','orv':'\u2A5B','oS':'\u24C8','oscr':'\u2134','Oscr':'\uD835\uDCAA','oslash':'\xF8','Oslash':'\xD8','osol':'\u2298','otilde':'\xF5','Otilde':'\xD5','otimes':'\u2297','Otimes':'\u2A37','otimesas':'\u2A36','ouml':'\xF6','Ouml':'\xD6','ovbar':'\u233D','OverBar':'\u203E','OverBrace':'\u23DE','OverBracket':'\u23B4','OverParenthesis':'\u23DC','par':'\u2225','para':'\xB6','parallel':'\u2225','parsim':'\u2AF3','parsl':'\u2AFD','part':'\u2202','PartialD':'\u2202','pcy':'\u043F','Pcy':'\u041F','percnt':'%','period':'.','permil':'\u2030','perp':'\u22A5','pertenk':'\u2031','pfr':'\uD835\uDD2D','Pfr':'\uD835\uDD13','phi':'\u03C6','Phi':'\u03A6','phiv':'\u03D5','phmmat':'\u2133','phone':'\u260E','pi':'\u03C0','Pi':'\u03A0','pitchfork':'\u22D4','piv':'\u03D6','planck':'\u210F','planckh':'\u210E','plankv':'\u210F','plus':'+','plusacir':'\u2A23','plusb':'\u229E','pluscir':'\u2A22','plusdo':'\u2214','plusdu':'\u2A25','pluse':'\u2A72','PlusMinus':'\xB1','plusmn':'\xB1','plussim':'\u2A26','plustwo':'\u2A27','pm':'\xB1','Poincareplane':'\u210C','pointint':'\u2A15','popf':'\uD835\uDD61','Popf':'\u2119','pound':'\xA3','pr':'\u227A','Pr':'\u2ABB','prap':'\u2AB7','prcue':'\u227C','pre':'\u2AAF','prE':'\u2AB3','prec':'\u227A','precapprox':'\u2AB7','preccurlyeq':'\u227C','Precedes':'\u227A','PrecedesEqual':'\u2AAF','PrecedesSlantEqual':'\u227C','PrecedesTilde':'\u227E','preceq':'\u2AAF','precnapprox':'\u2AB9','precneqq':'\u2AB5','precnsim':'\u22E8','precsim':'\u227E','prime':'\u2032','Prime':'\u2033','primes':'\u2119','prnap':'\u2AB9','prnE':'\u2AB5','prnsim':'\u22E8','prod':'\u220F','Product':'\u220F','profalar':'\u232E','profline':'\u2312','profsurf':'\u2313','prop':'\u221D','Proportion':'\u2237','Proportional':'\u221D','propto':'\u221D','prsim':'\u227E','prurel':'\u22B0','pscr':'\uD835\uDCC5','Pscr':'\uD835\uDCAB','psi':'\u03C8','Psi':'\u03A8','puncsp':'\u2008','qfr':'\uD835\uDD2E','Qfr':'\uD835\uDD14','qint':'\u2A0C','qopf':'\uD835\uDD62','Qopf':'\u211A','qprime':'\u2057','qscr':'\uD835\uDCC6','Qscr':'\uD835\uDCAC','quaternions':'\u210D','quatint':'\u2A16','quest':'?','questeq':'\u225F','quot':'"','QUOT':'"','rAarr':'\u21DB','race':'\u223D\u0331','racute':'\u0155','Racute':'\u0154','radic':'\u221A','raemptyv':'\u29B3','rang':'\u27E9','Rang':'\u27EB','rangd':'\u2992','range':'\u29A5','rangle':'\u27E9','raquo':'\xBB','rarr':'\u2192','rArr':'\u21D2','Rarr':'\u21A0','rarrap':'\u2975','rarrb':'\u21E5','rarrbfs':'\u2920','rarrc':'\u2933','rarrfs':'\u291E','rarrhk':'\u21AA','rarrlp':'\u21AC','rarrpl':'\u2945','rarrsim':'\u2974','rarrtl':'\u21A3','Rarrtl':'\u2916','rarrw':'\u219D','ratail':'\u291A','rAtail':'\u291C','ratio':'\u2236','rationals':'\u211A','rbarr':'\u290D','rBarr':'\u290F','RBarr':'\u2910','rbbrk':'\u2773','rbrace':'}','rbrack':']','rbrke':'\u298C','rbrksld':'\u298E','rbrkslu':'\u2990','rcaron':'\u0159','Rcaron':'\u0158','rcedil':'\u0157','Rcedil':'\u0156','rceil':'\u2309','rcub':'}','rcy':'\u0440','Rcy':'\u0420','rdca':'\u2937','rdldhar':'\u2969','rdquo':'\u201D','rdquor':'\u201D','rdsh':'\u21B3','Re':'\u211C','real':'\u211C','realine':'\u211B','realpart':'\u211C','reals':'\u211D','rect':'\u25AD','reg':'\xAE','REG':'\xAE','ReverseElement':'\u220B','ReverseEquilibrium':'\u21CB','ReverseUpEquilibrium':'\u296F','rfisht':'\u297D','rfloor':'\u230B','rfr':'\uD835\uDD2F','Rfr':'\u211C','rHar':'\u2964','rhard':'\u21C1','rharu':'\u21C0','rharul':'\u296C','rho':'\u03C1','Rho':'\u03A1','rhov':'\u03F1','RightAngleBracket':'\u27E9','rightarrow':'\u2192','Rightarrow':'\u21D2','RightArrow':'\u2192','RightArrowBar':'\u21E5','RightArrowLeftArrow':'\u21C4','rightarrowtail':'\u21A3','RightCeiling':'\u2309','RightDoubleBracket':'\u27E7','RightDownTeeVector':'\u295D','RightDownVector':'\u21C2','RightDownVectorBar':'\u2955','RightFloor':'\u230B','rightharpoondown':'\u21C1','rightharpoonup':'\u21C0','rightleftarrows':'\u21C4','rightleftharpoons':'\u21CC','rightrightarrows':'\u21C9','rightsquigarrow':'\u219D','RightTee':'\u22A2','RightTeeArrow':'\u21A6','RightTeeVector':'\u295B','rightthreetimes':'\u22CC','RightTriangle':'\u22B3','RightTriangleBar':'\u29D0','RightTriangleEqual':'\u22B5','RightUpDownVector':'\u294F','RightUpTeeVector':'\u295C','RightUpVector':'\u21BE','RightUpVectorBar':'\u2954','RightVector':'\u21C0','RightVectorBar':'\u2953','ring':'\u02DA','risingdotseq':'\u2253','rlarr':'\u21C4','rlhar':'\u21CC','rlm':'\u200F','rmoust':'\u23B1','rmoustache':'\u23B1','rnmid':'\u2AEE','roang':'\u27ED','roarr':'\u21FE','robrk':'\u27E7','ropar':'\u2986','ropf':'\uD835\uDD63','Ropf':'\u211D','roplus':'\u2A2E','rotimes':'\u2A35','RoundImplies':'\u2970','rpar':')','rpargt':'\u2994','rppolint':'\u2A12','rrarr':'\u21C9','Rrightarrow':'\u21DB','rsaquo':'\u203A','rscr':'\uD835\uDCC7','Rscr':'\u211B','rsh':'\u21B1','Rsh':'\u21B1','rsqb':']','rsquo':'\u2019','rsquor':'\u2019','rthree':'\u22CC','rtimes':'\u22CA','rtri':'\u25B9','rtrie':'\u22B5','rtrif':'\u25B8','rtriltri':'\u29CE','RuleDelayed':'\u29F4','ruluhar':'\u2968','rx':'\u211E','sacute':'\u015B','Sacute':'\u015A','sbquo':'\u201A','sc':'\u227B','Sc':'\u2ABC','scap':'\u2AB8','scaron':'\u0161','Scaron':'\u0160','sccue':'\u227D','sce':'\u2AB0','scE':'\u2AB4','scedil':'\u015F','Scedil':'\u015E','scirc':'\u015D','Scirc':'\u015C','scnap':'\u2ABA','scnE':'\u2AB6','scnsim':'\u22E9','scpolint':'\u2A13','scsim':'\u227F','scy':'\u0441','Scy':'\u0421','sdot':'\u22C5','sdotb':'\u22A1','sdote':'\u2A66','searhk':'\u2925','searr':'\u2198','seArr':'\u21D8','searrow':'\u2198','sect':'\xA7','semi':';','seswar':'\u2929','setminus':'\u2216','setmn':'\u2216','sext':'\u2736','sfr':'\uD835\uDD30','Sfr':'\uD835\uDD16','sfrown':'\u2322','sharp':'\u266F','shchcy':'\u0449','SHCHcy':'\u0429','shcy':'\u0448','SHcy':'\u0428','ShortDownArrow':'\u2193','ShortLeftArrow':'\u2190','shortmid':'\u2223','shortparallel':'\u2225','ShortRightArrow':'\u2192','ShortUpArrow':'\u2191','shy':'\xAD','sigma':'\u03C3','Sigma':'\u03A3','sigmaf':'\u03C2','sigmav':'\u03C2','sim':'\u223C','simdot':'\u2A6A','sime':'\u2243','simeq':'\u2243','simg':'\u2A9E','simgE':'\u2AA0','siml':'\u2A9D','simlE':'\u2A9F','simne':'\u2246','simplus':'\u2A24','simrarr':'\u2972','slarr':'\u2190','SmallCircle':'\u2218','smallsetminus':'\u2216','smashp':'\u2A33','smeparsl':'\u29E4','smid':'\u2223','smile':'\u2323','smt':'\u2AAA','smte':'\u2AAC','smtes':'\u2AAC\uFE00','softcy':'\u044C','SOFTcy':'\u042C','sol':'/','solb':'\u29C4','solbar':'\u233F','sopf':'\uD835\uDD64','Sopf':'\uD835\uDD4A','spades':'\u2660','spadesuit':'\u2660','spar':'\u2225','sqcap':'\u2293','sqcaps':'\u2293\uFE00','sqcup':'\u2294','sqcups':'\u2294\uFE00','Sqrt':'\u221A','sqsub':'\u228F','sqsube':'\u2291','sqsubset':'\u228F','sqsubseteq':'\u2291','sqsup':'\u2290','sqsupe':'\u2292','sqsupset':'\u2290','sqsupseteq':'\u2292','squ':'\u25A1','square':'\u25A1','Square':'\u25A1','SquareIntersection':'\u2293','SquareSubset':'\u228F','SquareSubsetEqual':'\u2291','SquareSuperset':'\u2290','SquareSupersetEqual':'\u2292','SquareUnion':'\u2294','squarf':'\u25AA','squf':'\u25AA','srarr':'\u2192','sscr':'\uD835\uDCC8','Sscr':'\uD835\uDCAE','ssetmn':'\u2216','ssmile':'\u2323','sstarf':'\u22C6','star':'\u2606','Star':'\u22C6','starf':'\u2605','straightepsilon':'\u03F5','straightphi':'\u03D5','strns':'\xAF','sub':'\u2282','Sub':'\u22D0','subdot':'\u2ABD','sube':'\u2286','subE':'\u2AC5','subedot':'\u2AC3','submult':'\u2AC1','subne':'\u228A','subnE':'\u2ACB','subplus':'\u2ABF','subrarr':'\u2979','subset':'\u2282','Subset':'\u22D0','subseteq':'\u2286','subseteqq':'\u2AC5','SubsetEqual':'\u2286','subsetneq':'\u228A','subsetneqq':'\u2ACB','subsim':'\u2AC7','subsub':'\u2AD5','subsup':'\u2AD3','succ':'\u227B','succapprox':'\u2AB8','succcurlyeq':'\u227D','Succeeds':'\u227B','SucceedsEqual':'\u2AB0','SucceedsSlantEqual':'\u227D','SucceedsTilde':'\u227F','succeq':'\u2AB0','succnapprox':'\u2ABA','succneqq':'\u2AB6','succnsim':'\u22E9','succsim':'\u227F','SuchThat':'\u220B','sum':'\u2211','Sum':'\u2211','sung':'\u266A','sup':'\u2283','Sup':'\u22D1','sup1':'\xB9','sup2':'\xB2','sup3':'\xB3','supdot':'\u2ABE','supdsub':'\u2AD8','supe':'\u2287','supE':'\u2AC6','supedot':'\u2AC4','Superset':'\u2283','SupersetEqual':'\u2287','suphsol':'\u27C9','suphsub':'\u2AD7','suplarr':'\u297B','supmult':'\u2AC2','supne':'\u228B','supnE':'\u2ACC','supplus':'\u2AC0','supset':'\u2283','Supset':'\u22D1','supseteq':'\u2287','supseteqq':'\u2AC6','supsetneq':'\u228B','supsetneqq':'\u2ACC','supsim':'\u2AC8','supsub':'\u2AD4','supsup':'\u2AD6','swarhk':'\u2926','swarr':'\u2199','swArr':'\u21D9','swarrow':'\u2199','swnwar':'\u292A','szlig':'\xDF','Tab':'\t','target':'\u2316','tau':'\u03C4','Tau':'\u03A4','tbrk':'\u23B4','tcaron':'\u0165','Tcaron':'\u0164','tcedil':'\u0163','Tcedil':'\u0162','tcy':'\u0442','Tcy':'\u0422','tdot':'\u20DB','telrec':'\u2315','tfr':'\uD835\uDD31','Tfr':'\uD835\uDD17','there4':'\u2234','therefore':'\u2234','Therefore':'\u2234','theta':'\u03B8','Theta':'\u0398','thetasym':'\u03D1','thetav':'\u03D1','thickapprox':'\u2248','thicksim':'\u223C','ThickSpace':'\u205F\u200A','thinsp':'\u2009','ThinSpace':'\u2009','thkap':'\u2248','thksim':'\u223C','thorn':'\xFE','THORN':'\xDE','tilde':'\u02DC','Tilde':'\u223C','TildeEqual':'\u2243','TildeFullEqual':'\u2245','TildeTilde':'\u2248','times':'\xD7','timesb':'\u22A0','timesbar':'\u2A31','timesd':'\u2A30','tint':'\u222D','toea':'\u2928','top':'\u22A4','topbot':'\u2336','topcir':'\u2AF1','topf':'\uD835\uDD65','Topf':'\uD835\uDD4B','topfork':'\u2ADA','tosa':'\u2929','tprime':'\u2034','trade':'\u2122','TRADE':'\u2122','triangle':'\u25B5','triangledown':'\u25BF','triangleleft':'\u25C3','trianglelefteq':'\u22B4','triangleq':'\u225C','triangleright':'\u25B9','trianglerighteq':'\u22B5','tridot':'\u25EC','trie':'\u225C','triminus':'\u2A3A','TripleDot':'\u20DB','triplus':'\u2A39','trisb':'\u29CD','tritime':'\u2A3B','trpezium':'\u23E2','tscr':'\uD835\uDCC9','Tscr':'\uD835\uDCAF','tscy':'\u0446','TScy':'\u0426','tshcy':'\u045B','TSHcy':'\u040B','tstrok':'\u0167','Tstrok':'\u0166','twixt':'\u226C','twoheadleftarrow':'\u219E','twoheadrightarrow':'\u21A0','uacute':'\xFA','Uacute':'\xDA','uarr':'\u2191','uArr':'\u21D1','Uarr':'\u219F','Uarrocir':'\u2949','ubrcy':'\u045E','Ubrcy':'\u040E','ubreve':'\u016D','Ubreve':'\u016C','ucirc':'\xFB','Ucirc':'\xDB','ucy':'\u0443','Ucy':'\u0423','udarr':'\u21C5','udblac':'\u0171','Udblac':'\u0170','udhar':'\u296E','ufisht':'\u297E','ufr':'\uD835\uDD32','Ufr':'\uD835\uDD18','ugrave':'\xF9','Ugrave':'\xD9','uHar':'\u2963','uharl':'\u21BF','uharr':'\u21BE','uhblk':'\u2580','ulcorn':'\u231C','ulcorner':'\u231C','ulcrop':'\u230F','ultri':'\u25F8','umacr':'\u016B','Umacr':'\u016A','uml':'\xA8','UnderBar':'_','UnderBrace':'\u23DF','UnderBracket':'\u23B5','UnderParenthesis':'\u23DD','Union':'\u22C3','UnionPlus':'\u228E','uogon':'\u0173','Uogon':'\u0172','uopf':'\uD835\uDD66','Uopf':'\uD835\uDD4C','uparrow':'\u2191','Uparrow':'\u21D1','UpArrow':'\u2191','UpArrowBar':'\u2912','UpArrowDownArrow':'\u21C5','updownarrow':'\u2195','Updownarrow':'\u21D5','UpDownArrow':'\u2195','UpEquilibrium':'\u296E','upharpoonleft':'\u21BF','upharpoonright':'\u21BE','uplus':'\u228E','UpperLeftArrow':'\u2196','UpperRightArrow':'\u2197','upsi':'\u03C5','Upsi':'\u03D2','upsih':'\u03D2','upsilon':'\u03C5','Upsilon':'\u03A5','UpTee':'\u22A5','UpTeeArrow':'\u21A5','upuparrows':'\u21C8','urcorn':'\u231D','urcorner':'\u231D','urcrop':'\u230E','uring':'\u016F','Uring':'\u016E','urtri':'\u25F9','uscr':'\uD835\uDCCA','Uscr':'\uD835\uDCB0','utdot':'\u22F0','utilde':'\u0169','Utilde':'\u0168','utri':'\u25B5','utrif':'\u25B4','uuarr':'\u21C8','uuml':'\xFC','Uuml':'\xDC','uwangle':'\u29A7','vangrt':'\u299C','varepsilon':'\u03F5','varkappa':'\u03F0','varnothing':'\u2205','varphi':'\u03D5','varpi':'\u03D6','varpropto':'\u221D','varr':'\u2195','vArr':'\u21D5','varrho':'\u03F1','varsigma':'\u03C2','varsubsetneq':'\u228A\uFE00','varsubsetneqq':'\u2ACB\uFE00','varsupsetneq':'\u228B\uFE00','varsupsetneqq':'\u2ACC\uFE00','vartheta':'\u03D1','vartriangleleft':'\u22B2','vartriangleright':'\u22B3','vBar':'\u2AE8','Vbar':'\u2AEB','vBarv':'\u2AE9','vcy':'\u0432','Vcy':'\u0412','vdash':'\u22A2','vDash':'\u22A8','Vdash':'\u22A9','VDash':'\u22AB','Vdashl':'\u2AE6','vee':'\u2228','Vee':'\u22C1','veebar':'\u22BB','veeeq':'\u225A','vellip':'\u22EE','verbar':'|','Verbar':'\u2016','vert':'|','Vert':'\u2016','VerticalBar':'\u2223','VerticalLine':'|','VerticalSeparator':'\u2758','VerticalTilde':'\u2240','VeryThinSpace':'\u200A','vfr':'\uD835\uDD33','Vfr':'\uD835\uDD19','vltri':'\u22B2','vnsub':'\u2282\u20D2','vnsup':'\u2283\u20D2','vopf':'\uD835\uDD67','Vopf':'\uD835\uDD4D','vprop':'\u221D','vrtri':'\u22B3','vscr':'\uD835\uDCCB','Vscr':'\uD835\uDCB1','vsubne':'\u228A\uFE00','vsubnE':'\u2ACB\uFE00','vsupne':'\u228B\uFE00','vsupnE':'\u2ACC\uFE00','Vvdash':'\u22AA','vzigzag':'\u299A','wcirc':'\u0175','Wcirc':'\u0174','wedbar':'\u2A5F','wedge':'\u2227','Wedge':'\u22C0','wedgeq':'\u2259','weierp':'\u2118','wfr':'\uD835\uDD34','Wfr':'\uD835\uDD1A','wopf':'\uD835\uDD68','Wopf':'\uD835\uDD4E','wp':'\u2118','wr':'\u2240','wreath':'\u2240','wscr':'\uD835\uDCCC','Wscr':'\uD835\uDCB2','xcap':'\u22C2','xcirc':'\u25EF','xcup':'\u22C3','xdtri':'\u25BD','xfr':'\uD835\uDD35','Xfr':'\uD835\uDD1B','xharr':'\u27F7','xhArr':'\u27FA','xi':'\u03BE','Xi':'\u039E','xlarr':'\u27F5','xlArr':'\u27F8','xmap':'\u27FC','xnis':'\u22FB','xodot':'\u2A00','xopf':'\uD835\uDD69','Xopf':'\uD835\uDD4F','xoplus':'\u2A01','xotime':'\u2A02','xrarr':'\u27F6','xrArr':'\u27F9','xscr':'\uD835\uDCCD','Xscr':'\uD835\uDCB3','xsqcup':'\u2A06','xuplus':'\u2A04','xutri':'\u25B3','xvee':'\u22C1','xwedge':'\u22C0','yacute':'\xFD','Yacute':'\xDD','yacy':'\u044F','YAcy':'\u042F','ycirc':'\u0177','Ycirc':'\u0176','ycy':'\u044B','Ycy':'\u042B','yen':'\xA5','yfr':'\uD835\uDD36','Yfr':'\uD835\uDD1C','yicy':'\u0457','YIcy':'\u0407','yopf':'\uD835\uDD6A','Yopf':'\uD835\uDD50','yscr':'\uD835\uDCCE','Yscr':'\uD835\uDCB4','yucy':'\u044E','YUcy':'\u042E','yuml':'\xFF','Yuml':'\u0178','zacute':'\u017A','Zacute':'\u0179','zcaron':'\u017E','Zcaron':'\u017D','zcy':'\u0437','Zcy':'\u0417','zdot':'\u017C','Zdot':'\u017B','zeetrf':'\u2128','ZeroWidthSpace':'\u200B','zeta':'\u03B6','Zeta':'\u0396','zfr':'\uD835\uDD37','Zfr':'\u2128','zhcy':'\u0436','ZHcy':'\u0416','zigrarr':'\u21DD','zopf':'\uD835\uDD6B','Zopf':'\u2124','zscr':'\uD835\uDCCF','Zscr':'\uD835\uDCB5','zwj':'\u200D','zwnj':'\u200C'};
	var decodeMapLegacy = {'aacute':'\xE1','Aacute':'\xC1','acirc':'\xE2','Acirc':'\xC2','acute':'\xB4','aelig':'\xE6','AElig':'\xC6','agrave':'\xE0','Agrave':'\xC0','amp':'&','AMP':'&','aring':'\xE5','Aring':'\xC5','atilde':'\xE3','Atilde':'\xC3','auml':'\xE4','Auml':'\xC4','brvbar':'\xA6','ccedil':'\xE7','Ccedil':'\xC7','cedil':'\xB8','cent':'\xA2','copy':'\xA9','COPY':'\xA9','curren':'\xA4','deg':'\xB0','divide':'\xF7','eacute':'\xE9','Eacute':'\xC9','ecirc':'\xEA','Ecirc':'\xCA','egrave':'\xE8','Egrave':'\xC8','eth':'\xF0','ETH':'\xD0','euml':'\xEB','Euml':'\xCB','frac12':'\xBD','frac14':'\xBC','frac34':'\xBE','gt':'>','GT':'>','iacute':'\xED','Iacute':'\xCD','icirc':'\xEE','Icirc':'\xCE','iexcl':'\xA1','igrave':'\xEC','Igrave':'\xCC','iquest':'\xBF','iuml':'\xEF','Iuml':'\xCF','laquo':'\xAB','lt':'<','LT':'<','macr':'\xAF','micro':'\xB5','middot':'\xB7','nbsp':'\xA0','not':'\xAC','ntilde':'\xF1','Ntilde':'\xD1','oacute':'\xF3','Oacute':'\xD3','ocirc':'\xF4','Ocirc':'\xD4','ograve':'\xF2','Ograve':'\xD2','ordf':'\xAA','ordm':'\xBA','oslash':'\xF8','Oslash':'\xD8','otilde':'\xF5','Otilde':'\xD5','ouml':'\xF6','Ouml':'\xD6','para':'\xB6','plusmn':'\xB1','pound':'\xA3','quot':'"','QUOT':'"','raquo':'\xBB','reg':'\xAE','REG':'\xAE','sect':'\xA7','shy':'\xAD','sup1':'\xB9','sup2':'\xB2','sup3':'\xB3','szlig':'\xDF','thorn':'\xFE','THORN':'\xDE','times':'\xD7','uacute':'\xFA','Uacute':'\xDA','ucirc':'\xFB','Ucirc':'\xDB','ugrave':'\xF9','Ugrave':'\xD9','uml':'\xA8','uuml':'\xFC','Uuml':'\xDC','yacute':'\xFD','Yacute':'\xDD','yen':'\xA5','yuml':'\xFF'};
	var decodeMapNumeric = {'0':'\uFFFD','128':'\u20AC','130':'\u201A','131':'\u0192','132':'\u201E','133':'\u2026','134':'\u2020','135':'\u2021','136':'\u02C6','137':'\u2030','138':'\u0160','139':'\u2039','140':'\u0152','142':'\u017D','145':'\u2018','146':'\u2019','147':'\u201C','148':'\u201D','149':'\u2022','150':'\u2013','151':'\u2014','152':'\u02DC','153':'\u2122','154':'\u0161','155':'\u203A','156':'\u0153','158':'\u017E','159':'\u0178'};
	var invalidReferenceCodePoints = [1,2,3,4,5,6,7,8,11,13,14,15,16,17,18,19,20,21,22,23,24,25,26,27,28,29,30,31,127,128,129,130,131,132,133,134,135,136,137,138,139,140,141,142,143,144,145,146,147,148,149,150,151,152,153,154,155,156,157,158,159,64976,64977,64978,64979,64980,64981,64982,64983,64984,64985,64986,64987,64988,64989,64990,64991,64992,64993,64994,64995,64996,64997,64998,64999,65000,65001,65002,65003,65004,65005,65006,65007,65534,65535,131070,131071,196606,196607,262142,262143,327678,327679,393214,393215,458750,458751,524286,524287,589822,589823,655358,655359,720894,720895,786430,786431,851966,851967,917502,917503,983038,983039,1048574,1048575,1114110,1114111];

	/*--------------------------------------------------------------------------*/

	var stringFromCharCode = String.fromCharCode;

	var object = {};
	var hasOwnProperty = object.hasOwnProperty;
	var has = function(object, propertyName) {
		return hasOwnProperty.call(object, propertyName);
	};

	var contains = function(array, value) {
		var index = -1;
		var length = array.length;
		while (++index < length) {
			if (array[index] == value) {
				return true;
			}
		}
		return false;
	};

	var merge = function(options, defaults) {
		if (!options) {
			return defaults;
		}
		var result = {};
		var key;
		for (key in defaults) {
			// A `hasOwnProperty` check is not needed here, since only recognized
			// option names are used anyway. Any others are ignored.
			result[key] = has(options, key) ? options[key] : defaults[key];
		}
		return result;
	};

	// Modified version of `ucs2encode`; see https://mths.be/punycode.
	var codePointToSymbol = function(codePoint, strict) {
		var output = '';
		if ((codePoint >= 0xD800 && codePoint <= 0xDFFF) || codePoint > 0x10FFFF) {
			// See issue #4:
			// “Otherwise, if the number is in the range 0xD800 to 0xDFFF or is
			// greater than 0x10FFFF, then this is a parse error. Return a U+FFFD
			// REPLACEMENT CHARACTER.”
			if (strict) {
				parseError('character reference outside the permissible Unicode range');
			}
			return '\uFFFD';
		}
		if (has(decodeMapNumeric, codePoint)) {
			if (strict) {
				parseError('disallowed character reference');
			}
			return decodeMapNumeric[codePoint];
		}
		if (strict && contains(invalidReferenceCodePoints, codePoint)) {
			parseError('disallowed character reference');
		}
		if (codePoint > 0xFFFF) {
			codePoint -= 0x10000;
			output += stringFromCharCode(codePoint >>> 10 & 0x3FF | 0xD800);
			codePoint = 0xDC00 | codePoint & 0x3FF;
		}
		output += stringFromCharCode(codePoint);
		return output;
	};

	var hexEscape = function(codePoint) {
		return '&#x' + codePoint.toString(16).toUpperCase() + ';';
	};

	var decEscape = function(codePoint) {
		return '&#' + codePoint + ';';
	};

	var parseError = function(message) {
		throw Error('Parse error: ' + message);
	};

	/*--------------------------------------------------------------------------*/

	var encode = function(string, options) {
		options = merge(options, encode.options);
		var strict = options.strict;
		if (strict && regexInvalidRawCodePoint.test(string)) {
			parseError('forbidden code point');
		}
		var encodeEverything = options.encodeEverything;
		var useNamedReferences = options.useNamedReferences;
		var allowUnsafeSymbols = options.allowUnsafeSymbols;
		var escapeCodePoint = options.decimal ? decEscape : hexEscape;

		var escapeBmpSymbol = function(symbol) {
			return escapeCodePoint(symbol.charCodeAt(0));
		};

		if (encodeEverything) {
			// Encode ASCII symbols.
			string = string.replace(regexAsciiWhitelist, function(symbol) {
				// Use named references if requested & possible.
				if (useNamedReferences && has(encodeMap, symbol)) {
					return '&' + encodeMap[symbol] + ';';
				}
				return escapeBmpSymbol(symbol);
			});
			// Shorten a few escapes that represent two symbols, of which at least one
			// is within the ASCII range.
			if (useNamedReferences) {
				string = string
					.replace(/&gt;\u20D2/g, '&nvgt;')
					.replace(/&lt;\u20D2/g, '&nvlt;')
					.replace(/&#x66;&#x6A;/g, '&fjlig;');
			}
			// Encode non-ASCII symbols.
			if (useNamedReferences) {
				// Encode non-ASCII symbols that can be replaced with a named reference.
				string = string.replace(regexEncodeNonAscii, function(string) {
					// Note: there is no need to check `has(encodeMap, string)` here.
					return '&' + encodeMap[string] + ';';
				});
			}
			// Note: any remaining non-ASCII symbols are handled outside of the `if`.
		} else if (useNamedReferences) {
			// Apply named character references.
			// Encode `<>"'&` using named character references.
			if (!allowUnsafeSymbols) {
				string = string.replace(regexEscape, function(string) {
					return '&' + encodeMap[string] + ';'; // no need to check `has()` here
				});
			}
			// Shorten escapes that represent two symbols, of which at least one is
			// `<>"'&`.
			string = string
				.replace(/&gt;\u20D2/g, '&nvgt;')
				.replace(/&lt;\u20D2/g, '&nvlt;');
			// Encode non-ASCII symbols that can be replaced with a named reference.
			string = string.replace(regexEncodeNonAscii, function(string) {
				// Note: there is no need to check `has(encodeMap, string)` here.
				return '&' + encodeMap[string] + ';';
			});
		} else if (!allowUnsafeSymbols) {
			// Encode `<>"'&` using hexadecimal escapes, now that they’re not handled
			// using named character references.
			string = string.replace(regexEscape, escapeBmpSymbol);
		}
		return string
			// Encode astral symbols.
			.replace(regexAstralSymbols, function($0) {
				// https://mathiasbynens.be/notes/javascript-encoding#surrogate-formulae
				var high = $0.charCodeAt(0);
				var low = $0.charCodeAt(1);
				var codePoint = (high - 0xD800) * 0x400 + low - 0xDC00 + 0x10000;
				return escapeCodePoint(codePoint);
			})
			// Encode any remaining BMP symbols that are not printable ASCII symbols
			// using a hexadecimal escape.
			.replace(regexBmpWhitelist, escapeBmpSymbol);
	};
	// Expose default options (so they can be overridden globally).
	encode.options = {
		'allowUnsafeSymbols': false,
		'encodeEverything': false,
		'strict': false,
		'useNamedReferences': false,
		'decimal' : false
	};

	var decode = function(html, options) {
		options = merge(options, decode.options);
		var strict = options.strict;
		if (strict && regexInvalidEntity.test(html)) {
			parseError('malformed character reference');
		}
		return html.replace(regexDecode, function($0, $1, $2, $3, $4, $5, $6, $7) {
			var codePoint;
			var semicolon;
			var decDigits;
			var hexDigits;
			var reference;
			var next;
			if ($1) {
				// Decode decimal escapes, e.g. `&#119558;`.
				decDigits = $1;
				semicolon = $2;
				if (strict && !semicolon) {
					parseError('character reference was not terminated by a semicolon');
				}
				codePoint = parseInt(decDigits, 10);
				return codePointToSymbol(codePoint, strict);
			}
			if ($3) {
				// Decode hexadecimal escapes, e.g. `&#x1D306;`.
				hexDigits = $3;
				semicolon = $4;
				if (strict && !semicolon) {
					parseError('character reference was not terminated by a semicolon');
				}
				codePoint = parseInt(hexDigits, 16);
				return codePointToSymbol(codePoint, strict);
			}
			if ($5) {
				// Decode named character references with trailing `;`, e.g. `&copy;`.
				reference = $5;
				if (has(decodeMap, reference)) {
					return decodeMap[reference];
				} else {
					// Ambiguous ampersand. https://mths.be/notes/ambiguous-ampersands
					if (strict) {
						parseError(
							'named character reference was not terminated by a semicolon'
						);
					}
					return $0;
				}
			}
			// If we’re still here, it’s a legacy reference for sure. No need for an
			// extra `if` check.
			// Decode named character references without trailing `;`, e.g. `&amp`
			// This is only a parse error if it gets converted to `&`, or if it is
			// followed by `=` in an attribute context.
			reference = $6;
			next = $7;
			if (next && options.isAttributeValue) {
				if (strict && next == '=') {
					parseError('`&` did not start a character reference');
				}
				return $0;
			} else {
				if (strict) {
					parseError(
						'named character reference was not terminated by a semicolon'
					);
				}
				// Note: there is no need to check `has(decodeMapLegacy, reference)`.
				return decodeMapLegacy[reference] + (next || '');
			}
		});
	};
	// Expose default options (so they can be overridden globally).
	decode.options = {
		'isAttributeValue': false,
		'strict': false
	};

	var escape = function(string) {
		return string.replace(regexEscape, function($0) {
			// Note: there is no need to check `has(escapeMap, $0)` here.
			return escapeMap[$0];
		});
	};

	/*--------------------------------------------------------------------------*/

	var he = {
		'version': '1.1.1',
		'encode': encode,
		'decode': decode,
		'escape': escape,
		'unescape': decode
	};

	// Some AMD build optimizers, like r.js, check for specific condition patterns
	// like the following:
	if (
		typeof define == 'function' &&
		typeof define.amd == 'object' &&
		define.amd
	) {
		define(function() {
			return he;
		});
	}	else if (freeExports && !freeExports.nodeType) {
		if (freeModule) { // in Node.js, io.js, or RingoJS v0.8.0+
			freeModule.exports = he;
		} else { // in Narwhal or RingoJS v0.7.0-
			for (var key in he) {
				has(he, key) && (freeExports[key] = he[key]);
			}
		}
	} else { // in Rhino or a web browser
		root.he = he;
	}

}(this));

}).call(this,typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})
},{}],18:[function(require,module,exports){
exports.read = function (buffer, offset, isLE, mLen, nBytes) {
  var e, m
  var eLen = (nBytes * 8) - mLen - 1
  var eMax = (1 << eLen) - 1
  var eBias = eMax >> 1
  var nBits = -7
  var i = isLE ? (nBytes - 1) : 0
  var d = isLE ? -1 : 1
  var s = buffer[offset + i]

  i += d

  e = s & ((1 << (-nBits)) - 1)
  s >>= (-nBits)
  nBits += eLen
  for (; nBits > 0; e = (e * 256) + buffer[offset + i], i += d, nBits -= 8) {}

  m = e & ((1 << (-nBits)) - 1)
  e >>= (-nBits)
  nBits += mLen
  for (; nBits > 0; m = (m * 256) + buffer[offset + i], i += d, nBits -= 8) {}

  if (e === 0) {
    e = 1 - eBias
  } else if (e === eMax) {
    return m ? NaN : ((s ? -1 : 1) * Infinity)
  } else {
    m = m + Math.pow(2, mLen)
    e = e - eBias
  }
  return (s ? -1 : 1) * m * Math.pow(2, e - mLen)
}

exports.write = function (buffer, value, offset, isLE, mLen, nBytes) {
  var e, m, c
  var eLen = (nBytes * 8) - mLen - 1
  var eMax = (1 << eLen) - 1
  var eBias = eMax >> 1
  var rt = (mLen === 23 ? Math.pow(2, -24) - Math.pow(2, -77) : 0)
  var i = isLE ? 0 : (nBytes - 1)
  var d = isLE ? 1 : -1
  var s = value < 0 || (value === 0 && 1 / value < 0) ? 1 : 0

  value = Math.abs(value)

  if (isNaN(value) || value === Infinity) {
    m = isNaN(value) ? 1 : 0
    e = eMax
  } else {
    e = Math.floor(Math.log(value) / Math.LN2)
    if (value * (c = Math.pow(2, -e)) < 1) {
      e--
      c *= 2
    }
    if (e + eBias >= 1) {
      value += rt / c
    } else {
      value += rt * Math.pow(2, 1 - eBias)
    }
    if (value * c >= 2) {
      e++
      c /= 2
    }

    if (e + eBias >= eMax) {
      m = 0
      e = eMax
    } else if (e + eBias >= 1) {
      m = ((value * c) - 1) * Math.pow(2, mLen)
      e = e + eBias
    } else {
      m = value * Math.pow(2, eBias - 1) * Math.pow(2, mLen)
      e = 0
    }
  }

  for (; mLen >= 8; buffer[offset + i] = m & 0xff, i += d, m /= 256, mLen -= 8) {}

  e = (e << mLen) | m
  eLen += mLen
  for (; eLen > 0; buffer[offset + i] = e & 0xff, i += d, e /= 256, eLen -= 8) {}

  buffer[offset + i - d] |= s * 128
}

},{}],19:[function(require,module,exports){
require("fa-nodejs/beautify");

},{"fa-nodejs/beautify":7}]},{},[19])
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi92YXIvd3d3L3Byb2plY3RzL3VzdWFsbHkvcm9vdC9ub2RlX21vZHVsZXMvYnJvd3Nlci1wYWNrL19wcmVsdWRlLmpzIiwiL3Zhci93d3cvcHJvamVjdHMvdXN1YWxseS9yb290L25vZGVfbW9kdWxlcy9iYXNlNjQtanMvbGliL2I2NC5qcyIsIi92YXIvd3d3L3Byb2plY3RzL3VzdWFsbHkvcm9vdC9ub2RlX21vZHVsZXMvYnVmZmVyL2luZGV4LmpzIiwiL3Zhci93d3cvcHJvamVjdHMvdXN1YWxseS9yb290L25vZGVfbW9kdWxlcy9mYS1ub2RlanMvYmFzZS90cmFjZS5qcyIsIi92YXIvd3d3L3Byb2plY3RzL3VzdWFsbHkvcm9vdC9ub2RlX21vZHVsZXMvZmEtbm9kZWpzL2JlYXV0aWZ5L2NvbnNvbGUtdHlwZS5qcyIsIi92YXIvd3d3L3Byb2plY3RzL3VzdWFsbHkvcm9vdC9ub2RlX21vZHVsZXMvZmEtbm9kZWpzL2JlYXV0aWZ5L2NvbnNvbGUuanMiLCIvdmFyL3d3dy9wcm9qZWN0cy91c3VhbGx5L3Jvb3Qvbm9kZV9tb2R1bGVzL2ZhLW5vZGVqcy9iZWF1dGlmeS9odG1sLmpzIiwiL3Zhci93d3cvcHJvamVjdHMvdXN1YWxseS9yb290L25vZGVfbW9kdWxlcy9mYS1ub2RlanMvYmVhdXRpZnkvaW5kZXguanMiLCIvdmFyL3d3dy9wcm9qZWN0cy91c3VhbGx5L3Jvb3Qvbm9kZV9tb2R1bGVzL2ZhLW5vZGVqcy9iZWF1dGlmeS9wbGFpbi5qcyIsIi92YXIvd3d3L3Byb2plY3RzL3VzdWFsbHkvcm9vdC9ub2RlX21vZHVsZXMvZmEtbm9kZWpzL2JlYXV0aWZ5L3dyYXAuanMiLCIvdmFyL3d3dy9wcm9qZWN0cy91c3VhbGx5L3Jvb3Qvbm9kZV9tb2R1bGVzL2ZhLW5vZGVqcy9jb25zb2xlL2NvbnNvbGUtaGVscGVyLmpzIiwiL3Zhci93d3cvcHJvamVjdHMvdXN1YWxseS9yb290L25vZGVfbW9kdWxlcy9mYXN0LXhtbC1wYXJzZXIvc3JjL2oyeC5qcyIsIi92YXIvd3d3L3Byb2plY3RzL3VzdWFsbHkvcm9vdC9ub2RlX21vZHVsZXMvZmFzdC14bWwtcGFyc2VyL3NyYy9wYXJzZXIuanMiLCIvdmFyL3d3dy9wcm9qZWN0cy91c3VhbGx5L3Jvb3Qvbm9kZV9tb2R1bGVzL2Zhc3QteG1sLXBhcnNlci9zcmMvdXRpbC5qcyIsIi92YXIvd3d3L3Byb2plY3RzL3VzdWFsbHkvcm9vdC9ub2RlX21vZHVsZXMvZmFzdC14bWwtcGFyc2VyL3NyYy92YWxpZGF0b3IuanMiLCIvdmFyL3d3dy9wcm9qZWN0cy91c3VhbGx5L3Jvb3Qvbm9kZV9tb2R1bGVzL2Zhc3QteG1sLXBhcnNlci9zcmMveG1sTm9kZS5qcyIsIi92YXIvd3d3L3Byb2plY3RzL3VzdWFsbHkvcm9vdC9ub2RlX21vZHVsZXMvZmlsZS10eXBlL2luZGV4LmpzIiwiL3Zhci93d3cvcHJvamVjdHMvdXN1YWxseS9yb290L25vZGVfbW9kdWxlcy9oZS9oZS5qcyIsIi92YXIvd3d3L3Byb2plY3RzL3VzdWFsbHkvcm9vdC9ub2RlX21vZHVsZXMvaWVlZTc1NC9pbmRleC5qcyIsIi92YXIvd3d3L3Byb2plY3RzL3VzdWFsbHkvcm9vdC9wcml2YXRlL2ZhL3NyYy9qcy9mYWtlX2VhYjg5ZDcwLmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBO0FDQUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUM1SEE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3JsQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQzdIQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDbERBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQzlFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ25FQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDdE9BO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDUEE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDck5BO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDbkVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ2xOQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQzFQQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNsRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDOVFBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ1RBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUN0N0JBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUN4VkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDcEZBO0FBQ0EiLCJmaWxlIjoiZ2VuZXJhdGVkLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXNDb250ZW50IjpbIihmdW5jdGlvbiBlKHQsbixyKXtmdW5jdGlvbiBzKG8sdSl7aWYoIW5bb10pe2lmKCF0W29dKXt2YXIgYT10eXBlb2YgcmVxdWlyZT09XCJmdW5jdGlvblwiJiZyZXF1aXJlO2lmKCF1JiZhKXJldHVybiBhKG8sITApO2lmKGkpcmV0dXJuIGkobywhMCk7dGhyb3cgbmV3IEVycm9yKFwiQ2Fubm90IGZpbmQgbW9kdWxlICdcIitvK1wiJ1wiKX12YXIgZj1uW29dPXtleHBvcnRzOnt9fTt0W29dWzBdLmNhbGwoZi5leHBvcnRzLGZ1bmN0aW9uKGUpe3ZhciBuPXRbb11bMV1bZV07cmV0dXJuIHMobj9uOmUpfSxmLGYuZXhwb3J0cyxlLHQsbixyKX1yZXR1cm4gbltvXS5leHBvcnRzfXZhciBpPXR5cGVvZiByZXF1aXJlPT1cImZ1bmN0aW9uXCImJnJlcXVpcmU7Zm9yKHZhciBvPTA7bzxyLmxlbmd0aDtvKyspcyhyW29dKTtyZXR1cm4gc30pIiwidmFyIGxvb2t1cCA9ICdBQkNERUZHSElKS0xNTk9QUVJTVFVWV1hZWmFiY2RlZmdoaWprbG1ub3BxcnN0dXZ3eHl6MDEyMzQ1Njc4OSsvJztcblxuOyhmdW5jdGlvbiAoZXhwb3J0cykge1xuXHQndXNlIHN0cmljdCc7XG5cbiAgdmFyIEFyciA9ICh0eXBlb2YgVWludDhBcnJheSAhPT0gJ3VuZGVmaW5lZCcpXG4gICAgPyBVaW50OEFycmF5XG4gICAgOiBBcnJheVxuXG5cdHZhciBQTFVTICAgPSAnKycuY2hhckNvZGVBdCgwKVxuXHR2YXIgU0xBU0ggID0gJy8nLmNoYXJDb2RlQXQoMClcblx0dmFyIE5VTUJFUiA9ICcwJy5jaGFyQ29kZUF0KDApXG5cdHZhciBMT1dFUiAgPSAnYScuY2hhckNvZGVBdCgwKVxuXHR2YXIgVVBQRVIgID0gJ0EnLmNoYXJDb2RlQXQoMClcblx0dmFyIFBMVVNfVVJMX1NBRkUgPSAnLScuY2hhckNvZGVBdCgwKVxuXHR2YXIgU0xBU0hfVVJMX1NBRkUgPSAnXycuY2hhckNvZGVBdCgwKVxuXG5cdGZ1bmN0aW9uIGRlY29kZSAoZWx0KSB7XG5cdFx0dmFyIGNvZGUgPSBlbHQuY2hhckNvZGVBdCgwKVxuXHRcdGlmIChjb2RlID09PSBQTFVTIHx8XG5cdFx0ICAgIGNvZGUgPT09IFBMVVNfVVJMX1NBRkUpXG5cdFx0XHRyZXR1cm4gNjIgLy8gJysnXG5cdFx0aWYgKGNvZGUgPT09IFNMQVNIIHx8XG5cdFx0ICAgIGNvZGUgPT09IFNMQVNIX1VSTF9TQUZFKVxuXHRcdFx0cmV0dXJuIDYzIC8vICcvJ1xuXHRcdGlmIChjb2RlIDwgTlVNQkVSKVxuXHRcdFx0cmV0dXJuIC0xIC8vbm8gbWF0Y2hcblx0XHRpZiAoY29kZSA8IE5VTUJFUiArIDEwKVxuXHRcdFx0cmV0dXJuIGNvZGUgLSBOVU1CRVIgKyAyNiArIDI2XG5cdFx0aWYgKGNvZGUgPCBVUFBFUiArIDI2KVxuXHRcdFx0cmV0dXJuIGNvZGUgLSBVUFBFUlxuXHRcdGlmIChjb2RlIDwgTE9XRVIgKyAyNilcblx0XHRcdHJldHVybiBjb2RlIC0gTE9XRVIgKyAyNlxuXHR9XG5cblx0ZnVuY3Rpb24gYjY0VG9CeXRlQXJyYXkgKGI2NCkge1xuXHRcdHZhciBpLCBqLCBsLCB0bXAsIHBsYWNlSG9sZGVycywgYXJyXG5cblx0XHRpZiAoYjY0Lmxlbmd0aCAlIDQgPiAwKSB7XG5cdFx0XHR0aHJvdyBuZXcgRXJyb3IoJ0ludmFsaWQgc3RyaW5nLiBMZW5ndGggbXVzdCBiZSBhIG11bHRpcGxlIG9mIDQnKVxuXHRcdH1cblxuXHRcdC8vIHRoZSBudW1iZXIgb2YgZXF1YWwgc2lnbnMgKHBsYWNlIGhvbGRlcnMpXG5cdFx0Ly8gaWYgdGhlcmUgYXJlIHR3byBwbGFjZWhvbGRlcnMsIHRoYW4gdGhlIHR3byBjaGFyYWN0ZXJzIGJlZm9yZSBpdFxuXHRcdC8vIHJlcHJlc2VudCBvbmUgYnl0ZVxuXHRcdC8vIGlmIHRoZXJlIGlzIG9ubHkgb25lLCB0aGVuIHRoZSB0aHJlZSBjaGFyYWN0ZXJzIGJlZm9yZSBpdCByZXByZXNlbnQgMiBieXRlc1xuXHRcdC8vIHRoaXMgaXMganVzdCBhIGNoZWFwIGhhY2sgdG8gbm90IGRvIGluZGV4T2YgdHdpY2Vcblx0XHR2YXIgbGVuID0gYjY0Lmxlbmd0aFxuXHRcdHBsYWNlSG9sZGVycyA9ICc9JyA9PT0gYjY0LmNoYXJBdChsZW4gLSAyKSA/IDIgOiAnPScgPT09IGI2NC5jaGFyQXQobGVuIC0gMSkgPyAxIDogMFxuXG5cdFx0Ly8gYmFzZTY0IGlzIDQvMyArIHVwIHRvIHR3byBjaGFyYWN0ZXJzIG9mIHRoZSBvcmlnaW5hbCBkYXRhXG5cdFx0YXJyID0gbmV3IEFycihiNjQubGVuZ3RoICogMyAvIDQgLSBwbGFjZUhvbGRlcnMpXG5cblx0XHQvLyBpZiB0aGVyZSBhcmUgcGxhY2Vob2xkZXJzLCBvbmx5IGdldCB1cCB0byB0aGUgbGFzdCBjb21wbGV0ZSA0IGNoYXJzXG5cdFx0bCA9IHBsYWNlSG9sZGVycyA+IDAgPyBiNjQubGVuZ3RoIC0gNCA6IGI2NC5sZW5ndGhcblxuXHRcdHZhciBMID0gMFxuXG5cdFx0ZnVuY3Rpb24gcHVzaCAodikge1xuXHRcdFx0YXJyW0wrK10gPSB2XG5cdFx0fVxuXG5cdFx0Zm9yIChpID0gMCwgaiA9IDA7IGkgPCBsOyBpICs9IDQsIGogKz0gMykge1xuXHRcdFx0dG1wID0gKGRlY29kZShiNjQuY2hhckF0KGkpKSA8PCAxOCkgfCAoZGVjb2RlKGI2NC5jaGFyQXQoaSArIDEpKSA8PCAxMikgfCAoZGVjb2RlKGI2NC5jaGFyQXQoaSArIDIpKSA8PCA2KSB8IGRlY29kZShiNjQuY2hhckF0KGkgKyAzKSlcblx0XHRcdHB1c2goKHRtcCAmIDB4RkYwMDAwKSA+PiAxNilcblx0XHRcdHB1c2goKHRtcCAmIDB4RkYwMCkgPj4gOClcblx0XHRcdHB1c2godG1wICYgMHhGRilcblx0XHR9XG5cblx0XHRpZiAocGxhY2VIb2xkZXJzID09PSAyKSB7XG5cdFx0XHR0bXAgPSAoZGVjb2RlKGI2NC5jaGFyQXQoaSkpIDw8IDIpIHwgKGRlY29kZShiNjQuY2hhckF0KGkgKyAxKSkgPj4gNClcblx0XHRcdHB1c2godG1wICYgMHhGRilcblx0XHR9IGVsc2UgaWYgKHBsYWNlSG9sZGVycyA9PT0gMSkge1xuXHRcdFx0dG1wID0gKGRlY29kZShiNjQuY2hhckF0KGkpKSA8PCAxMCkgfCAoZGVjb2RlKGI2NC5jaGFyQXQoaSArIDEpKSA8PCA0KSB8IChkZWNvZGUoYjY0LmNoYXJBdChpICsgMikpID4+IDIpXG5cdFx0XHRwdXNoKCh0bXAgPj4gOCkgJiAweEZGKVxuXHRcdFx0cHVzaCh0bXAgJiAweEZGKVxuXHRcdH1cblxuXHRcdHJldHVybiBhcnJcblx0fVxuXG5cdGZ1bmN0aW9uIHVpbnQ4VG9CYXNlNjQgKHVpbnQ4KSB7XG5cdFx0dmFyIGksXG5cdFx0XHRleHRyYUJ5dGVzID0gdWludDgubGVuZ3RoICUgMywgLy8gaWYgd2UgaGF2ZSAxIGJ5dGUgbGVmdCwgcGFkIDIgYnl0ZXNcblx0XHRcdG91dHB1dCA9IFwiXCIsXG5cdFx0XHR0ZW1wLCBsZW5ndGhcblxuXHRcdGZ1bmN0aW9uIGVuY29kZSAobnVtKSB7XG5cdFx0XHRyZXR1cm4gbG9va3VwLmNoYXJBdChudW0pXG5cdFx0fVxuXG5cdFx0ZnVuY3Rpb24gdHJpcGxldFRvQmFzZTY0IChudW0pIHtcblx0XHRcdHJldHVybiBlbmNvZGUobnVtID4+IDE4ICYgMHgzRikgKyBlbmNvZGUobnVtID4+IDEyICYgMHgzRikgKyBlbmNvZGUobnVtID4+IDYgJiAweDNGKSArIGVuY29kZShudW0gJiAweDNGKVxuXHRcdH1cblxuXHRcdC8vIGdvIHRocm91Z2ggdGhlIGFycmF5IGV2ZXJ5IHRocmVlIGJ5dGVzLCB3ZSdsbCBkZWFsIHdpdGggdHJhaWxpbmcgc3R1ZmYgbGF0ZXJcblx0XHRmb3IgKGkgPSAwLCBsZW5ndGggPSB1aW50OC5sZW5ndGggLSBleHRyYUJ5dGVzOyBpIDwgbGVuZ3RoOyBpICs9IDMpIHtcblx0XHRcdHRlbXAgPSAodWludDhbaV0gPDwgMTYpICsgKHVpbnQ4W2kgKyAxXSA8PCA4KSArICh1aW50OFtpICsgMl0pXG5cdFx0XHRvdXRwdXQgKz0gdHJpcGxldFRvQmFzZTY0KHRlbXApXG5cdFx0fVxuXG5cdFx0Ly8gcGFkIHRoZSBlbmQgd2l0aCB6ZXJvcywgYnV0IG1ha2Ugc3VyZSB0byBub3QgZm9yZ2V0IHRoZSBleHRyYSBieXRlc1xuXHRcdHN3aXRjaCAoZXh0cmFCeXRlcykge1xuXHRcdFx0Y2FzZSAxOlxuXHRcdFx0XHR0ZW1wID0gdWludDhbdWludDgubGVuZ3RoIC0gMV1cblx0XHRcdFx0b3V0cHV0ICs9IGVuY29kZSh0ZW1wID4+IDIpXG5cdFx0XHRcdG91dHB1dCArPSBlbmNvZGUoKHRlbXAgPDwgNCkgJiAweDNGKVxuXHRcdFx0XHRvdXRwdXQgKz0gJz09J1xuXHRcdFx0XHRicmVha1xuXHRcdFx0Y2FzZSAyOlxuXHRcdFx0XHR0ZW1wID0gKHVpbnQ4W3VpbnQ4Lmxlbmd0aCAtIDJdIDw8IDgpICsgKHVpbnQ4W3VpbnQ4Lmxlbmd0aCAtIDFdKVxuXHRcdFx0XHRvdXRwdXQgKz0gZW5jb2RlKHRlbXAgPj4gMTApXG5cdFx0XHRcdG91dHB1dCArPSBlbmNvZGUoKHRlbXAgPj4gNCkgJiAweDNGKVxuXHRcdFx0XHRvdXRwdXQgKz0gZW5jb2RlKCh0ZW1wIDw8IDIpICYgMHgzRilcblx0XHRcdFx0b3V0cHV0ICs9ICc9J1xuXHRcdFx0XHRicmVha1xuXHRcdH1cblxuXHRcdHJldHVybiBvdXRwdXRcblx0fVxuXG5cdGV4cG9ydHMudG9CeXRlQXJyYXkgPSBiNjRUb0J5dGVBcnJheVxuXHRleHBvcnRzLmZyb21CeXRlQXJyYXkgPSB1aW50OFRvQmFzZTY0XG59KHR5cGVvZiBleHBvcnRzID09PSAndW5kZWZpbmVkJyA/ICh0aGlzLmJhc2U2NGpzID0ge30pIDogZXhwb3J0cykpXG4iLCIvKiFcbiAqIFRoZSBidWZmZXIgbW9kdWxlIGZyb20gbm9kZS5qcywgZm9yIHRoZSBicm93c2VyLlxuICpcbiAqIEBhdXRob3IgICBGZXJvc3MgQWJvdWtoYWRpamVoIDxmZXJvc3NAZmVyb3NzLm9yZz4gPGh0dHA6Ly9mZXJvc3Mub3JnPlxuICogQGxpY2Vuc2UgIE1JVFxuICovXG5cbnZhciBiYXNlNjQgPSByZXF1aXJlKCdiYXNlNjQtanMnKVxudmFyIGllZWU3NTQgPSByZXF1aXJlKCdpZWVlNzU0JylcblxuZXhwb3J0cy5CdWZmZXIgPSBCdWZmZXJcbmV4cG9ydHMuU2xvd0J1ZmZlciA9IEJ1ZmZlclxuZXhwb3J0cy5JTlNQRUNUX01BWF9CWVRFUyA9IDUwXG5CdWZmZXIucG9vbFNpemUgPSA4MTkyXG5cbi8qKlxuICogSWYgYEJ1ZmZlci5fdXNlVHlwZWRBcnJheXNgOlxuICogICA9PT0gdHJ1ZSAgICBVc2UgVWludDhBcnJheSBpbXBsZW1lbnRhdGlvbiAoZmFzdGVzdClcbiAqICAgPT09IGZhbHNlICAgVXNlIE9iamVjdCBpbXBsZW1lbnRhdGlvbiAoY29tcGF0aWJsZSBkb3duIHRvIElFNilcbiAqL1xuQnVmZmVyLl91c2VUeXBlZEFycmF5cyA9IChmdW5jdGlvbiAoKSB7XG4gIC8vIERldGVjdCBpZiBicm93c2VyIHN1cHBvcnRzIFR5cGVkIEFycmF5cy4gU3VwcG9ydGVkIGJyb3dzZXJzIGFyZSBJRSAxMCssIEZpcmVmb3ggNCssXG4gIC8vIENocm9tZSA3KywgU2FmYXJpIDUuMSssIE9wZXJhIDExLjYrLCBpT1MgNC4yKy4gSWYgdGhlIGJyb3dzZXIgZG9lcyBub3Qgc3VwcG9ydCBhZGRpbmdcbiAgLy8gcHJvcGVydGllcyB0byBgVWludDhBcnJheWAgaW5zdGFuY2VzLCB0aGVuIHRoYXQncyB0aGUgc2FtZSBhcyBubyBgVWludDhBcnJheWAgc3VwcG9ydFxuICAvLyBiZWNhdXNlIHdlIG5lZWQgdG8gYmUgYWJsZSB0byBhZGQgYWxsIHRoZSBub2RlIEJ1ZmZlciBBUEkgbWV0aG9kcy4gVGhpcyBpcyBhbiBpc3N1ZVxuICAvLyBpbiBGaXJlZm94IDQtMjkuIE5vdyBmaXhlZDogaHR0cHM6Ly9idWd6aWxsYS5tb3ppbGxhLm9yZy9zaG93X2J1Zy5jZ2k/aWQ9Njk1NDM4XG4gIHRyeSB7XG4gICAgdmFyIGJ1ZiA9IG5ldyBBcnJheUJ1ZmZlcigwKVxuICAgIHZhciBhcnIgPSBuZXcgVWludDhBcnJheShidWYpXG4gICAgYXJyLmZvbyA9IGZ1bmN0aW9uICgpIHsgcmV0dXJuIDQyIH1cbiAgICByZXR1cm4gNDIgPT09IGFyci5mb28oKSAmJlxuICAgICAgICB0eXBlb2YgYXJyLnN1YmFycmF5ID09PSAnZnVuY3Rpb24nIC8vIENocm9tZSA5LTEwIGxhY2sgYHN1YmFycmF5YFxuICB9IGNhdGNoIChlKSB7XG4gICAgcmV0dXJuIGZhbHNlXG4gIH1cbn0pKClcblxuLyoqXG4gKiBDbGFzczogQnVmZmVyXG4gKiA9PT09PT09PT09PT09XG4gKlxuICogVGhlIEJ1ZmZlciBjb25zdHJ1Y3RvciByZXR1cm5zIGluc3RhbmNlcyBvZiBgVWludDhBcnJheWAgdGhhdCBhcmUgYXVnbWVudGVkXG4gKiB3aXRoIGZ1bmN0aW9uIHByb3BlcnRpZXMgZm9yIGFsbCB0aGUgbm9kZSBgQnVmZmVyYCBBUEkgZnVuY3Rpb25zLiBXZSB1c2VcbiAqIGBVaW50OEFycmF5YCBzbyB0aGF0IHNxdWFyZSBicmFja2V0IG5vdGF0aW9uIHdvcmtzIGFzIGV4cGVjdGVkIC0tIGl0IHJldHVybnNcbiAqIGEgc2luZ2xlIG9jdGV0LlxuICpcbiAqIEJ5IGF1Z21lbnRpbmcgdGhlIGluc3RhbmNlcywgd2UgY2FuIGF2b2lkIG1vZGlmeWluZyB0aGUgYFVpbnQ4QXJyYXlgXG4gKiBwcm90b3R5cGUuXG4gKi9cbmZ1bmN0aW9uIEJ1ZmZlciAoc3ViamVjdCwgZW5jb2RpbmcsIG5vWmVybykge1xuICBpZiAoISh0aGlzIGluc3RhbmNlb2YgQnVmZmVyKSlcbiAgICByZXR1cm4gbmV3IEJ1ZmZlcihzdWJqZWN0LCBlbmNvZGluZywgbm9aZXJvKVxuXG4gIHZhciB0eXBlID0gdHlwZW9mIHN1YmplY3RcblxuICAvLyBXb3JrYXJvdW5kOiBub2RlJ3MgYmFzZTY0IGltcGxlbWVudGF0aW9uIGFsbG93cyBmb3Igbm9uLXBhZGRlZCBzdHJpbmdzXG4gIC8vIHdoaWxlIGJhc2U2NC1qcyBkb2VzIG5vdC5cbiAgaWYgKGVuY29kaW5nID09PSAnYmFzZTY0JyAmJiB0eXBlID09PSAnc3RyaW5nJykge1xuICAgIHN1YmplY3QgPSBzdHJpbmd0cmltKHN1YmplY3QpXG4gICAgd2hpbGUgKHN1YmplY3QubGVuZ3RoICUgNCAhPT0gMCkge1xuICAgICAgc3ViamVjdCA9IHN1YmplY3QgKyAnPSdcbiAgICB9XG4gIH1cblxuICAvLyBGaW5kIHRoZSBsZW5ndGhcbiAgdmFyIGxlbmd0aFxuICBpZiAodHlwZSA9PT0gJ251bWJlcicpXG4gICAgbGVuZ3RoID0gY29lcmNlKHN1YmplY3QpXG4gIGVsc2UgaWYgKHR5cGUgPT09ICdzdHJpbmcnKVxuICAgIGxlbmd0aCA9IEJ1ZmZlci5ieXRlTGVuZ3RoKHN1YmplY3QsIGVuY29kaW5nKVxuICBlbHNlIGlmICh0eXBlID09PSAnb2JqZWN0JylcbiAgICBsZW5ndGggPSBjb2VyY2Uoc3ViamVjdC5sZW5ndGgpIC8vIGFzc3VtZSB0aGF0IG9iamVjdCBpcyBhcnJheS1saWtlXG4gIGVsc2VcbiAgICB0aHJvdyBuZXcgRXJyb3IoJ0ZpcnN0IGFyZ3VtZW50IG5lZWRzIHRvIGJlIGEgbnVtYmVyLCBhcnJheSBvciBzdHJpbmcuJylcblxuICB2YXIgYnVmXG4gIGlmIChCdWZmZXIuX3VzZVR5cGVkQXJyYXlzKSB7XG4gICAgLy8gUHJlZmVycmVkOiBSZXR1cm4gYW4gYXVnbWVudGVkIGBVaW50OEFycmF5YCBpbnN0YW5jZSBmb3IgYmVzdCBwZXJmb3JtYW5jZVxuICAgIGJ1ZiA9IEJ1ZmZlci5fYXVnbWVudChuZXcgVWludDhBcnJheShsZW5ndGgpKVxuICB9IGVsc2Uge1xuICAgIC8vIEZhbGxiYWNrOiBSZXR1cm4gVEhJUyBpbnN0YW5jZSBvZiBCdWZmZXIgKGNyZWF0ZWQgYnkgYG5ld2ApXG4gICAgYnVmID0gdGhpc1xuICAgIGJ1Zi5sZW5ndGggPSBsZW5ndGhcbiAgICBidWYuX2lzQnVmZmVyID0gdHJ1ZVxuICB9XG5cbiAgdmFyIGlcbiAgaWYgKEJ1ZmZlci5fdXNlVHlwZWRBcnJheXMgJiYgdHlwZW9mIHN1YmplY3QuYnl0ZUxlbmd0aCA9PT0gJ251bWJlcicpIHtcbiAgICAvLyBTcGVlZCBvcHRpbWl6YXRpb24gLS0gdXNlIHNldCBpZiB3ZSdyZSBjb3B5aW5nIGZyb20gYSB0eXBlZCBhcnJheVxuICAgIGJ1Zi5fc2V0KHN1YmplY3QpXG4gIH0gZWxzZSBpZiAoaXNBcnJheWlzaChzdWJqZWN0KSkge1xuICAgIC8vIFRyZWF0IGFycmF5LWlzaCBvYmplY3RzIGFzIGEgYnl0ZSBhcnJheVxuICAgIGZvciAoaSA9IDA7IGkgPCBsZW5ndGg7IGkrKykge1xuICAgICAgaWYgKEJ1ZmZlci5pc0J1ZmZlcihzdWJqZWN0KSlcbiAgICAgICAgYnVmW2ldID0gc3ViamVjdC5yZWFkVUludDgoaSlcbiAgICAgIGVsc2VcbiAgICAgICAgYnVmW2ldID0gc3ViamVjdFtpXVxuICAgIH1cbiAgfSBlbHNlIGlmICh0eXBlID09PSAnc3RyaW5nJykge1xuICAgIGJ1Zi53cml0ZShzdWJqZWN0LCAwLCBlbmNvZGluZylcbiAgfSBlbHNlIGlmICh0eXBlID09PSAnbnVtYmVyJyAmJiAhQnVmZmVyLl91c2VUeXBlZEFycmF5cyAmJiAhbm9aZXJvKSB7XG4gICAgZm9yIChpID0gMDsgaSA8IGxlbmd0aDsgaSsrKSB7XG4gICAgICBidWZbaV0gPSAwXG4gICAgfVxuICB9XG5cbiAgcmV0dXJuIGJ1ZlxufVxuXG4vLyBTVEFUSUMgTUVUSE9EU1xuLy8gPT09PT09PT09PT09PT1cblxuQnVmZmVyLmlzRW5jb2RpbmcgPSBmdW5jdGlvbiAoZW5jb2RpbmcpIHtcbiAgc3dpdGNoIChTdHJpbmcoZW5jb2RpbmcpLnRvTG93ZXJDYXNlKCkpIHtcbiAgICBjYXNlICdoZXgnOlxuICAgIGNhc2UgJ3V0ZjgnOlxuICAgIGNhc2UgJ3V0Zi04JzpcbiAgICBjYXNlICdhc2NpaSc6XG4gICAgY2FzZSAnYmluYXJ5JzpcbiAgICBjYXNlICdiYXNlNjQnOlxuICAgIGNhc2UgJ3Jhdyc6XG4gICAgY2FzZSAndWNzMic6XG4gICAgY2FzZSAndWNzLTInOlxuICAgIGNhc2UgJ3V0ZjE2bGUnOlxuICAgIGNhc2UgJ3V0Zi0xNmxlJzpcbiAgICAgIHJldHVybiB0cnVlXG4gICAgZGVmYXVsdDpcbiAgICAgIHJldHVybiBmYWxzZVxuICB9XG59XG5cbkJ1ZmZlci5pc0J1ZmZlciA9IGZ1bmN0aW9uIChiKSB7XG4gIHJldHVybiAhIShiICE9PSBudWxsICYmIGIgIT09IHVuZGVmaW5lZCAmJiBiLl9pc0J1ZmZlcilcbn1cblxuQnVmZmVyLmJ5dGVMZW5ndGggPSBmdW5jdGlvbiAoc3RyLCBlbmNvZGluZykge1xuICB2YXIgcmV0XG4gIHN0ciA9IHN0ciArICcnXG4gIHN3aXRjaCAoZW5jb2RpbmcgfHwgJ3V0ZjgnKSB7XG4gICAgY2FzZSAnaGV4JzpcbiAgICAgIHJldCA9IHN0ci5sZW5ndGggLyAyXG4gICAgICBicmVha1xuICAgIGNhc2UgJ3V0ZjgnOlxuICAgIGNhc2UgJ3V0Zi04JzpcbiAgICAgIHJldCA9IHV0ZjhUb0J5dGVzKHN0cikubGVuZ3RoXG4gICAgICBicmVha1xuICAgIGNhc2UgJ2FzY2lpJzpcbiAgICBjYXNlICdiaW5hcnknOlxuICAgIGNhc2UgJ3Jhdyc6XG4gICAgICByZXQgPSBzdHIubGVuZ3RoXG4gICAgICBicmVha1xuICAgIGNhc2UgJ2Jhc2U2NCc6XG4gICAgICByZXQgPSBiYXNlNjRUb0J5dGVzKHN0cikubGVuZ3RoXG4gICAgICBicmVha1xuICAgIGNhc2UgJ3VjczInOlxuICAgIGNhc2UgJ3Vjcy0yJzpcbiAgICBjYXNlICd1dGYxNmxlJzpcbiAgICBjYXNlICd1dGYtMTZsZSc6XG4gICAgICByZXQgPSBzdHIubGVuZ3RoICogMlxuICAgICAgYnJlYWtcbiAgICBkZWZhdWx0OlxuICAgICAgdGhyb3cgbmV3IEVycm9yKCdVbmtub3duIGVuY29kaW5nJylcbiAgfVxuICByZXR1cm4gcmV0XG59XG5cbkJ1ZmZlci5jb25jYXQgPSBmdW5jdGlvbiAobGlzdCwgdG90YWxMZW5ndGgpIHtcbiAgYXNzZXJ0KGlzQXJyYXkobGlzdCksICdVc2FnZTogQnVmZmVyLmNvbmNhdChsaXN0LCBbdG90YWxMZW5ndGhdKVxcbicgK1xuICAgICAgJ2xpc3Qgc2hvdWxkIGJlIGFuIEFycmF5LicpXG5cbiAgaWYgKGxpc3QubGVuZ3RoID09PSAwKSB7XG4gICAgcmV0dXJuIG5ldyBCdWZmZXIoMClcbiAgfSBlbHNlIGlmIChsaXN0Lmxlbmd0aCA9PT0gMSkge1xuICAgIHJldHVybiBsaXN0WzBdXG4gIH1cblxuICB2YXIgaVxuICBpZiAodHlwZW9mIHRvdGFsTGVuZ3RoICE9PSAnbnVtYmVyJykge1xuICAgIHRvdGFsTGVuZ3RoID0gMFxuICAgIGZvciAoaSA9IDA7IGkgPCBsaXN0Lmxlbmd0aDsgaSsrKSB7XG4gICAgICB0b3RhbExlbmd0aCArPSBsaXN0W2ldLmxlbmd0aFxuICAgIH1cbiAgfVxuXG4gIHZhciBidWYgPSBuZXcgQnVmZmVyKHRvdGFsTGVuZ3RoKVxuICB2YXIgcG9zID0gMFxuICBmb3IgKGkgPSAwOyBpIDwgbGlzdC5sZW5ndGg7IGkrKykge1xuICAgIHZhciBpdGVtID0gbGlzdFtpXVxuICAgIGl0ZW0uY29weShidWYsIHBvcylcbiAgICBwb3MgKz0gaXRlbS5sZW5ndGhcbiAgfVxuICByZXR1cm4gYnVmXG59XG5cbi8vIEJVRkZFUiBJTlNUQU5DRSBNRVRIT0RTXG4vLyA9PT09PT09PT09PT09PT09PT09PT09PVxuXG5mdW5jdGlvbiBfaGV4V3JpdGUgKGJ1Ziwgc3RyaW5nLCBvZmZzZXQsIGxlbmd0aCkge1xuICBvZmZzZXQgPSBOdW1iZXIob2Zmc2V0KSB8fCAwXG4gIHZhciByZW1haW5pbmcgPSBidWYubGVuZ3RoIC0gb2Zmc2V0XG4gIGlmICghbGVuZ3RoKSB7XG4gICAgbGVuZ3RoID0gcmVtYWluaW5nXG4gIH0gZWxzZSB7XG4gICAgbGVuZ3RoID0gTnVtYmVyKGxlbmd0aClcbiAgICBpZiAobGVuZ3RoID4gcmVtYWluaW5nKSB7XG4gICAgICBsZW5ndGggPSByZW1haW5pbmdcbiAgICB9XG4gIH1cblxuICAvLyBtdXN0IGJlIGFuIGV2ZW4gbnVtYmVyIG9mIGRpZ2l0c1xuICB2YXIgc3RyTGVuID0gc3RyaW5nLmxlbmd0aFxuICBhc3NlcnQoc3RyTGVuICUgMiA9PT0gMCwgJ0ludmFsaWQgaGV4IHN0cmluZycpXG5cbiAgaWYgKGxlbmd0aCA+IHN0ckxlbiAvIDIpIHtcbiAgICBsZW5ndGggPSBzdHJMZW4gLyAyXG4gIH1cbiAgZm9yICh2YXIgaSA9IDA7IGkgPCBsZW5ndGg7IGkrKykge1xuICAgIHZhciBieXRlID0gcGFyc2VJbnQoc3RyaW5nLnN1YnN0cihpICogMiwgMiksIDE2KVxuICAgIGFzc2VydCghaXNOYU4oYnl0ZSksICdJbnZhbGlkIGhleCBzdHJpbmcnKVxuICAgIGJ1ZltvZmZzZXQgKyBpXSA9IGJ5dGVcbiAgfVxuICBCdWZmZXIuX2NoYXJzV3JpdHRlbiA9IGkgKiAyXG4gIHJldHVybiBpXG59XG5cbmZ1bmN0aW9uIF91dGY4V3JpdGUgKGJ1Ziwgc3RyaW5nLCBvZmZzZXQsIGxlbmd0aCkge1xuICB2YXIgY2hhcnNXcml0dGVuID0gQnVmZmVyLl9jaGFyc1dyaXR0ZW4gPVxuICAgIGJsaXRCdWZmZXIodXRmOFRvQnl0ZXMoc3RyaW5nKSwgYnVmLCBvZmZzZXQsIGxlbmd0aClcbiAgcmV0dXJuIGNoYXJzV3JpdHRlblxufVxuXG5mdW5jdGlvbiBfYXNjaWlXcml0ZSAoYnVmLCBzdHJpbmcsIG9mZnNldCwgbGVuZ3RoKSB7XG4gIHZhciBjaGFyc1dyaXR0ZW4gPSBCdWZmZXIuX2NoYXJzV3JpdHRlbiA9XG4gICAgYmxpdEJ1ZmZlcihhc2NpaVRvQnl0ZXMoc3RyaW5nKSwgYnVmLCBvZmZzZXQsIGxlbmd0aClcbiAgcmV0dXJuIGNoYXJzV3JpdHRlblxufVxuXG5mdW5jdGlvbiBfYmluYXJ5V3JpdGUgKGJ1Ziwgc3RyaW5nLCBvZmZzZXQsIGxlbmd0aCkge1xuICByZXR1cm4gX2FzY2lpV3JpdGUoYnVmLCBzdHJpbmcsIG9mZnNldCwgbGVuZ3RoKVxufVxuXG5mdW5jdGlvbiBfYmFzZTY0V3JpdGUgKGJ1Ziwgc3RyaW5nLCBvZmZzZXQsIGxlbmd0aCkge1xuICB2YXIgY2hhcnNXcml0dGVuID0gQnVmZmVyLl9jaGFyc1dyaXR0ZW4gPVxuICAgIGJsaXRCdWZmZXIoYmFzZTY0VG9CeXRlcyhzdHJpbmcpLCBidWYsIG9mZnNldCwgbGVuZ3RoKVxuICByZXR1cm4gY2hhcnNXcml0dGVuXG59XG5cbmZ1bmN0aW9uIF91dGYxNmxlV3JpdGUgKGJ1Ziwgc3RyaW5nLCBvZmZzZXQsIGxlbmd0aCkge1xuICB2YXIgY2hhcnNXcml0dGVuID0gQnVmZmVyLl9jaGFyc1dyaXR0ZW4gPVxuICAgIGJsaXRCdWZmZXIodXRmMTZsZVRvQnl0ZXMoc3RyaW5nKSwgYnVmLCBvZmZzZXQsIGxlbmd0aClcbiAgcmV0dXJuIGNoYXJzV3JpdHRlblxufVxuXG5CdWZmZXIucHJvdG90eXBlLndyaXRlID0gZnVuY3Rpb24gKHN0cmluZywgb2Zmc2V0LCBsZW5ndGgsIGVuY29kaW5nKSB7XG4gIC8vIFN1cHBvcnQgYm90aCAoc3RyaW5nLCBvZmZzZXQsIGxlbmd0aCwgZW5jb2RpbmcpXG4gIC8vIGFuZCB0aGUgbGVnYWN5IChzdHJpbmcsIGVuY29kaW5nLCBvZmZzZXQsIGxlbmd0aClcbiAgaWYgKGlzRmluaXRlKG9mZnNldCkpIHtcbiAgICBpZiAoIWlzRmluaXRlKGxlbmd0aCkpIHtcbiAgICAgIGVuY29kaW5nID0gbGVuZ3RoXG4gICAgICBsZW5ndGggPSB1bmRlZmluZWRcbiAgICB9XG4gIH0gZWxzZSB7ICAvLyBsZWdhY3lcbiAgICB2YXIgc3dhcCA9IGVuY29kaW5nXG4gICAgZW5jb2RpbmcgPSBvZmZzZXRcbiAgICBvZmZzZXQgPSBsZW5ndGhcbiAgICBsZW5ndGggPSBzd2FwXG4gIH1cblxuICBvZmZzZXQgPSBOdW1iZXIob2Zmc2V0KSB8fCAwXG4gIHZhciByZW1haW5pbmcgPSB0aGlzLmxlbmd0aCAtIG9mZnNldFxuICBpZiAoIWxlbmd0aCkge1xuICAgIGxlbmd0aCA9IHJlbWFpbmluZ1xuICB9IGVsc2Uge1xuICAgIGxlbmd0aCA9IE51bWJlcihsZW5ndGgpXG4gICAgaWYgKGxlbmd0aCA+IHJlbWFpbmluZykge1xuICAgICAgbGVuZ3RoID0gcmVtYWluaW5nXG4gICAgfVxuICB9XG4gIGVuY29kaW5nID0gU3RyaW5nKGVuY29kaW5nIHx8ICd1dGY4JykudG9Mb3dlckNhc2UoKVxuXG4gIHZhciByZXRcbiAgc3dpdGNoIChlbmNvZGluZykge1xuICAgIGNhc2UgJ2hleCc6XG4gICAgICByZXQgPSBfaGV4V3JpdGUodGhpcywgc3RyaW5nLCBvZmZzZXQsIGxlbmd0aClcbiAgICAgIGJyZWFrXG4gICAgY2FzZSAndXRmOCc6XG4gICAgY2FzZSAndXRmLTgnOlxuICAgICAgcmV0ID0gX3V0ZjhXcml0ZSh0aGlzLCBzdHJpbmcsIG9mZnNldCwgbGVuZ3RoKVxuICAgICAgYnJlYWtcbiAgICBjYXNlICdhc2NpaSc6XG4gICAgICByZXQgPSBfYXNjaWlXcml0ZSh0aGlzLCBzdHJpbmcsIG9mZnNldCwgbGVuZ3RoKVxuICAgICAgYnJlYWtcbiAgICBjYXNlICdiaW5hcnknOlxuICAgICAgcmV0ID0gX2JpbmFyeVdyaXRlKHRoaXMsIHN0cmluZywgb2Zmc2V0LCBsZW5ndGgpXG4gICAgICBicmVha1xuICAgIGNhc2UgJ2Jhc2U2NCc6XG4gICAgICByZXQgPSBfYmFzZTY0V3JpdGUodGhpcywgc3RyaW5nLCBvZmZzZXQsIGxlbmd0aClcbiAgICAgIGJyZWFrXG4gICAgY2FzZSAndWNzMic6XG4gICAgY2FzZSAndWNzLTInOlxuICAgIGNhc2UgJ3V0ZjE2bGUnOlxuICAgIGNhc2UgJ3V0Zi0xNmxlJzpcbiAgICAgIHJldCA9IF91dGYxNmxlV3JpdGUodGhpcywgc3RyaW5nLCBvZmZzZXQsIGxlbmd0aClcbiAgICAgIGJyZWFrXG4gICAgZGVmYXVsdDpcbiAgICAgIHRocm93IG5ldyBFcnJvcignVW5rbm93biBlbmNvZGluZycpXG4gIH1cbiAgcmV0dXJuIHJldFxufVxuXG5CdWZmZXIucHJvdG90eXBlLnRvU3RyaW5nID0gZnVuY3Rpb24gKGVuY29kaW5nLCBzdGFydCwgZW5kKSB7XG4gIHZhciBzZWxmID0gdGhpc1xuXG4gIGVuY29kaW5nID0gU3RyaW5nKGVuY29kaW5nIHx8ICd1dGY4JykudG9Mb3dlckNhc2UoKVxuICBzdGFydCA9IE51bWJlcihzdGFydCkgfHwgMFxuICBlbmQgPSAoZW5kICE9PSB1bmRlZmluZWQpXG4gICAgPyBOdW1iZXIoZW5kKVxuICAgIDogZW5kID0gc2VsZi5sZW5ndGhcblxuICAvLyBGYXN0cGF0aCBlbXB0eSBzdHJpbmdzXG4gIGlmIChlbmQgPT09IHN0YXJ0KVxuICAgIHJldHVybiAnJ1xuXG4gIHZhciByZXRcbiAgc3dpdGNoIChlbmNvZGluZykge1xuICAgIGNhc2UgJ2hleCc6XG4gICAgICByZXQgPSBfaGV4U2xpY2Uoc2VsZiwgc3RhcnQsIGVuZClcbiAgICAgIGJyZWFrXG4gICAgY2FzZSAndXRmOCc6XG4gICAgY2FzZSAndXRmLTgnOlxuICAgICAgcmV0ID0gX3V0ZjhTbGljZShzZWxmLCBzdGFydCwgZW5kKVxuICAgICAgYnJlYWtcbiAgICBjYXNlICdhc2NpaSc6XG4gICAgICByZXQgPSBfYXNjaWlTbGljZShzZWxmLCBzdGFydCwgZW5kKVxuICAgICAgYnJlYWtcbiAgICBjYXNlICdiaW5hcnknOlxuICAgICAgcmV0ID0gX2JpbmFyeVNsaWNlKHNlbGYsIHN0YXJ0LCBlbmQpXG4gICAgICBicmVha1xuICAgIGNhc2UgJ2Jhc2U2NCc6XG4gICAgICByZXQgPSBfYmFzZTY0U2xpY2Uoc2VsZiwgc3RhcnQsIGVuZClcbiAgICAgIGJyZWFrXG4gICAgY2FzZSAndWNzMic6XG4gICAgY2FzZSAndWNzLTInOlxuICAgIGNhc2UgJ3V0ZjE2bGUnOlxuICAgIGNhc2UgJ3V0Zi0xNmxlJzpcbiAgICAgIHJldCA9IF91dGYxNmxlU2xpY2Uoc2VsZiwgc3RhcnQsIGVuZClcbiAgICAgIGJyZWFrXG4gICAgZGVmYXVsdDpcbiAgICAgIHRocm93IG5ldyBFcnJvcignVW5rbm93biBlbmNvZGluZycpXG4gIH1cbiAgcmV0dXJuIHJldFxufVxuXG5CdWZmZXIucHJvdG90eXBlLnRvSlNPTiA9IGZ1bmN0aW9uICgpIHtcbiAgcmV0dXJuIHtcbiAgICB0eXBlOiAnQnVmZmVyJyxcbiAgICBkYXRhOiBBcnJheS5wcm90b3R5cGUuc2xpY2UuY2FsbCh0aGlzLl9hcnIgfHwgdGhpcywgMClcbiAgfVxufVxuXG4vLyBjb3B5KHRhcmdldEJ1ZmZlciwgdGFyZ2V0U3RhcnQ9MCwgc291cmNlU3RhcnQ9MCwgc291cmNlRW5kPWJ1ZmZlci5sZW5ndGgpXG5CdWZmZXIucHJvdG90eXBlLmNvcHkgPSBmdW5jdGlvbiAodGFyZ2V0LCB0YXJnZXRfc3RhcnQsIHN0YXJ0LCBlbmQpIHtcbiAgdmFyIHNvdXJjZSA9IHRoaXNcblxuICBpZiAoIXN0YXJ0KSBzdGFydCA9IDBcbiAgaWYgKCFlbmQgJiYgZW5kICE9PSAwKSBlbmQgPSB0aGlzLmxlbmd0aFxuICBpZiAoIXRhcmdldF9zdGFydCkgdGFyZ2V0X3N0YXJ0ID0gMFxuXG4gIC8vIENvcHkgMCBieXRlczsgd2UncmUgZG9uZVxuICBpZiAoZW5kID09PSBzdGFydCkgcmV0dXJuXG4gIGlmICh0YXJnZXQubGVuZ3RoID09PSAwIHx8IHNvdXJjZS5sZW5ndGggPT09IDApIHJldHVyblxuXG4gIC8vIEZhdGFsIGVycm9yIGNvbmRpdGlvbnNcbiAgYXNzZXJ0KGVuZCA+PSBzdGFydCwgJ3NvdXJjZUVuZCA8IHNvdXJjZVN0YXJ0JylcbiAgYXNzZXJ0KHRhcmdldF9zdGFydCA+PSAwICYmIHRhcmdldF9zdGFydCA8IHRhcmdldC5sZW5ndGgsXG4gICAgICAndGFyZ2V0U3RhcnQgb3V0IG9mIGJvdW5kcycpXG4gIGFzc2VydChzdGFydCA+PSAwICYmIHN0YXJ0IDwgc291cmNlLmxlbmd0aCwgJ3NvdXJjZVN0YXJ0IG91dCBvZiBib3VuZHMnKVxuICBhc3NlcnQoZW5kID49IDAgJiYgZW5kIDw9IHNvdXJjZS5sZW5ndGgsICdzb3VyY2VFbmQgb3V0IG9mIGJvdW5kcycpXG5cbiAgLy8gQXJlIHdlIG9vYj9cbiAgaWYgKGVuZCA+IHRoaXMubGVuZ3RoKVxuICAgIGVuZCA9IHRoaXMubGVuZ3RoXG4gIGlmICh0YXJnZXQubGVuZ3RoIC0gdGFyZ2V0X3N0YXJ0IDwgZW5kIC0gc3RhcnQpXG4gICAgZW5kID0gdGFyZ2V0Lmxlbmd0aCAtIHRhcmdldF9zdGFydCArIHN0YXJ0XG5cbiAgdmFyIGxlbiA9IGVuZCAtIHN0YXJ0XG5cbiAgaWYgKGxlbiA8IDEwMCB8fCAhQnVmZmVyLl91c2VUeXBlZEFycmF5cykge1xuICAgIGZvciAodmFyIGkgPSAwOyBpIDwgbGVuOyBpKyspXG4gICAgICB0YXJnZXRbaSArIHRhcmdldF9zdGFydF0gPSB0aGlzW2kgKyBzdGFydF1cbiAgfSBlbHNlIHtcbiAgICB0YXJnZXQuX3NldCh0aGlzLnN1YmFycmF5KHN0YXJ0LCBzdGFydCArIGxlbiksIHRhcmdldF9zdGFydClcbiAgfVxufVxuXG5mdW5jdGlvbiBfYmFzZTY0U2xpY2UgKGJ1Ziwgc3RhcnQsIGVuZCkge1xuICBpZiAoc3RhcnQgPT09IDAgJiYgZW5kID09PSBidWYubGVuZ3RoKSB7XG4gICAgcmV0dXJuIGJhc2U2NC5mcm9tQnl0ZUFycmF5KGJ1ZilcbiAgfSBlbHNlIHtcbiAgICByZXR1cm4gYmFzZTY0LmZyb21CeXRlQXJyYXkoYnVmLnNsaWNlKHN0YXJ0LCBlbmQpKVxuICB9XG59XG5cbmZ1bmN0aW9uIF91dGY4U2xpY2UgKGJ1Ziwgc3RhcnQsIGVuZCkge1xuICB2YXIgcmVzID0gJydcbiAgdmFyIHRtcCA9ICcnXG4gIGVuZCA9IE1hdGgubWluKGJ1Zi5sZW5ndGgsIGVuZClcblxuICBmb3IgKHZhciBpID0gc3RhcnQ7IGkgPCBlbmQ7IGkrKykge1xuICAgIGlmIChidWZbaV0gPD0gMHg3Rikge1xuICAgICAgcmVzICs9IGRlY29kZVV0ZjhDaGFyKHRtcCkgKyBTdHJpbmcuZnJvbUNoYXJDb2RlKGJ1ZltpXSlcbiAgICAgIHRtcCA9ICcnXG4gICAgfSBlbHNlIHtcbiAgICAgIHRtcCArPSAnJScgKyBidWZbaV0udG9TdHJpbmcoMTYpXG4gICAgfVxuICB9XG5cbiAgcmV0dXJuIHJlcyArIGRlY29kZVV0ZjhDaGFyKHRtcClcbn1cblxuZnVuY3Rpb24gX2FzY2lpU2xpY2UgKGJ1Ziwgc3RhcnQsIGVuZCkge1xuICB2YXIgcmV0ID0gJydcbiAgZW5kID0gTWF0aC5taW4oYnVmLmxlbmd0aCwgZW5kKVxuXG4gIGZvciAodmFyIGkgPSBzdGFydDsgaSA8IGVuZDsgaSsrKVxuICAgIHJldCArPSBTdHJpbmcuZnJvbUNoYXJDb2RlKGJ1ZltpXSlcbiAgcmV0dXJuIHJldFxufVxuXG5mdW5jdGlvbiBfYmluYXJ5U2xpY2UgKGJ1Ziwgc3RhcnQsIGVuZCkge1xuICByZXR1cm4gX2FzY2lpU2xpY2UoYnVmLCBzdGFydCwgZW5kKVxufVxuXG5mdW5jdGlvbiBfaGV4U2xpY2UgKGJ1Ziwgc3RhcnQsIGVuZCkge1xuICB2YXIgbGVuID0gYnVmLmxlbmd0aFxuXG4gIGlmICghc3RhcnQgfHwgc3RhcnQgPCAwKSBzdGFydCA9IDBcbiAgaWYgKCFlbmQgfHwgZW5kIDwgMCB8fCBlbmQgPiBsZW4pIGVuZCA9IGxlblxuXG4gIHZhciBvdXQgPSAnJ1xuICBmb3IgKHZhciBpID0gc3RhcnQ7IGkgPCBlbmQ7IGkrKykge1xuICAgIG91dCArPSB0b0hleChidWZbaV0pXG4gIH1cbiAgcmV0dXJuIG91dFxufVxuXG5mdW5jdGlvbiBfdXRmMTZsZVNsaWNlIChidWYsIHN0YXJ0LCBlbmQpIHtcbiAgdmFyIGJ5dGVzID0gYnVmLnNsaWNlKHN0YXJ0LCBlbmQpXG4gIHZhciByZXMgPSAnJ1xuICBmb3IgKHZhciBpID0gMDsgaSA8IGJ5dGVzLmxlbmd0aDsgaSArPSAyKSB7XG4gICAgcmVzICs9IFN0cmluZy5mcm9tQ2hhckNvZGUoYnl0ZXNbaV0gKyBieXRlc1tpKzFdICogMjU2KVxuICB9XG4gIHJldHVybiByZXNcbn1cblxuQnVmZmVyLnByb3RvdHlwZS5zbGljZSA9IGZ1bmN0aW9uIChzdGFydCwgZW5kKSB7XG4gIHZhciBsZW4gPSB0aGlzLmxlbmd0aFxuICBzdGFydCA9IGNsYW1wKHN0YXJ0LCBsZW4sIDApXG4gIGVuZCA9IGNsYW1wKGVuZCwgbGVuLCBsZW4pXG5cbiAgaWYgKEJ1ZmZlci5fdXNlVHlwZWRBcnJheXMpIHtcbiAgICByZXR1cm4gQnVmZmVyLl9hdWdtZW50KHRoaXMuc3ViYXJyYXkoc3RhcnQsIGVuZCkpXG4gIH0gZWxzZSB7XG4gICAgdmFyIHNsaWNlTGVuID0gZW5kIC0gc3RhcnRcbiAgICB2YXIgbmV3QnVmID0gbmV3IEJ1ZmZlcihzbGljZUxlbiwgdW5kZWZpbmVkLCB0cnVlKVxuICAgIGZvciAodmFyIGkgPSAwOyBpIDwgc2xpY2VMZW47IGkrKykge1xuICAgICAgbmV3QnVmW2ldID0gdGhpc1tpICsgc3RhcnRdXG4gICAgfVxuICAgIHJldHVybiBuZXdCdWZcbiAgfVxufVxuXG4vLyBgZ2V0YCB3aWxsIGJlIHJlbW92ZWQgaW4gTm9kZSAwLjEzK1xuQnVmZmVyLnByb3RvdHlwZS5nZXQgPSBmdW5jdGlvbiAob2Zmc2V0KSB7XG4gIGNvbnNvbGUubG9nKCcuZ2V0KCkgaXMgZGVwcmVjYXRlZC4gQWNjZXNzIHVzaW5nIGFycmF5IGluZGV4ZXMgaW5zdGVhZC4nKVxuICByZXR1cm4gdGhpcy5yZWFkVUludDgob2Zmc2V0KVxufVxuXG4vLyBgc2V0YCB3aWxsIGJlIHJlbW92ZWQgaW4gTm9kZSAwLjEzK1xuQnVmZmVyLnByb3RvdHlwZS5zZXQgPSBmdW5jdGlvbiAodiwgb2Zmc2V0KSB7XG4gIGNvbnNvbGUubG9nKCcuc2V0KCkgaXMgZGVwcmVjYXRlZC4gQWNjZXNzIHVzaW5nIGFycmF5IGluZGV4ZXMgaW5zdGVhZC4nKVxuICByZXR1cm4gdGhpcy53cml0ZVVJbnQ4KHYsIG9mZnNldClcbn1cblxuQnVmZmVyLnByb3RvdHlwZS5yZWFkVUludDggPSBmdW5jdGlvbiAob2Zmc2V0LCBub0Fzc2VydCkge1xuICBpZiAoIW5vQXNzZXJ0KSB7XG4gICAgYXNzZXJ0KG9mZnNldCAhPT0gdW5kZWZpbmVkICYmIG9mZnNldCAhPT0gbnVsbCwgJ21pc3Npbmcgb2Zmc2V0JylcbiAgICBhc3NlcnQob2Zmc2V0IDwgdGhpcy5sZW5ndGgsICdUcnlpbmcgdG8gcmVhZCBiZXlvbmQgYnVmZmVyIGxlbmd0aCcpXG4gIH1cblxuICBpZiAob2Zmc2V0ID49IHRoaXMubGVuZ3RoKVxuICAgIHJldHVyblxuXG4gIHJldHVybiB0aGlzW29mZnNldF1cbn1cblxuZnVuY3Rpb24gX3JlYWRVSW50MTYgKGJ1Ziwgb2Zmc2V0LCBsaXR0bGVFbmRpYW4sIG5vQXNzZXJ0KSB7XG4gIGlmICghbm9Bc3NlcnQpIHtcbiAgICBhc3NlcnQodHlwZW9mIGxpdHRsZUVuZGlhbiA9PT0gJ2Jvb2xlYW4nLCAnbWlzc2luZyBvciBpbnZhbGlkIGVuZGlhbicpXG4gICAgYXNzZXJ0KG9mZnNldCAhPT0gdW5kZWZpbmVkICYmIG9mZnNldCAhPT0gbnVsbCwgJ21pc3Npbmcgb2Zmc2V0JylcbiAgICBhc3NlcnQob2Zmc2V0ICsgMSA8IGJ1Zi5sZW5ndGgsICdUcnlpbmcgdG8gcmVhZCBiZXlvbmQgYnVmZmVyIGxlbmd0aCcpXG4gIH1cblxuICB2YXIgbGVuID0gYnVmLmxlbmd0aFxuICBpZiAob2Zmc2V0ID49IGxlbilcbiAgICByZXR1cm5cblxuICB2YXIgdmFsXG4gIGlmIChsaXR0bGVFbmRpYW4pIHtcbiAgICB2YWwgPSBidWZbb2Zmc2V0XVxuICAgIGlmIChvZmZzZXQgKyAxIDwgbGVuKVxuICAgICAgdmFsIHw9IGJ1ZltvZmZzZXQgKyAxXSA8PCA4XG4gIH0gZWxzZSB7XG4gICAgdmFsID0gYnVmW29mZnNldF0gPDwgOFxuICAgIGlmIChvZmZzZXQgKyAxIDwgbGVuKVxuICAgICAgdmFsIHw9IGJ1ZltvZmZzZXQgKyAxXVxuICB9XG4gIHJldHVybiB2YWxcbn1cblxuQnVmZmVyLnByb3RvdHlwZS5yZWFkVUludDE2TEUgPSBmdW5jdGlvbiAob2Zmc2V0LCBub0Fzc2VydCkge1xuICByZXR1cm4gX3JlYWRVSW50MTYodGhpcywgb2Zmc2V0LCB0cnVlLCBub0Fzc2VydClcbn1cblxuQnVmZmVyLnByb3RvdHlwZS5yZWFkVUludDE2QkUgPSBmdW5jdGlvbiAob2Zmc2V0LCBub0Fzc2VydCkge1xuICByZXR1cm4gX3JlYWRVSW50MTYodGhpcywgb2Zmc2V0LCBmYWxzZSwgbm9Bc3NlcnQpXG59XG5cbmZ1bmN0aW9uIF9yZWFkVUludDMyIChidWYsIG9mZnNldCwgbGl0dGxlRW5kaWFuLCBub0Fzc2VydCkge1xuICBpZiAoIW5vQXNzZXJ0KSB7XG4gICAgYXNzZXJ0KHR5cGVvZiBsaXR0bGVFbmRpYW4gPT09ICdib29sZWFuJywgJ21pc3Npbmcgb3IgaW52YWxpZCBlbmRpYW4nKVxuICAgIGFzc2VydChvZmZzZXQgIT09IHVuZGVmaW5lZCAmJiBvZmZzZXQgIT09IG51bGwsICdtaXNzaW5nIG9mZnNldCcpXG4gICAgYXNzZXJ0KG9mZnNldCArIDMgPCBidWYubGVuZ3RoLCAnVHJ5aW5nIHRvIHJlYWQgYmV5b25kIGJ1ZmZlciBsZW5ndGgnKVxuICB9XG5cbiAgdmFyIGxlbiA9IGJ1Zi5sZW5ndGhcbiAgaWYgKG9mZnNldCA+PSBsZW4pXG4gICAgcmV0dXJuXG5cbiAgdmFyIHZhbFxuICBpZiAobGl0dGxlRW5kaWFuKSB7XG4gICAgaWYgKG9mZnNldCArIDIgPCBsZW4pXG4gICAgICB2YWwgPSBidWZbb2Zmc2V0ICsgMl0gPDwgMTZcbiAgICBpZiAob2Zmc2V0ICsgMSA8IGxlbilcbiAgICAgIHZhbCB8PSBidWZbb2Zmc2V0ICsgMV0gPDwgOFxuICAgIHZhbCB8PSBidWZbb2Zmc2V0XVxuICAgIGlmIChvZmZzZXQgKyAzIDwgbGVuKVxuICAgICAgdmFsID0gdmFsICsgKGJ1ZltvZmZzZXQgKyAzXSA8PCAyNCA+Pj4gMClcbiAgfSBlbHNlIHtcbiAgICBpZiAob2Zmc2V0ICsgMSA8IGxlbilcbiAgICAgIHZhbCA9IGJ1ZltvZmZzZXQgKyAxXSA8PCAxNlxuICAgIGlmIChvZmZzZXQgKyAyIDwgbGVuKVxuICAgICAgdmFsIHw9IGJ1ZltvZmZzZXQgKyAyXSA8PCA4XG4gICAgaWYgKG9mZnNldCArIDMgPCBsZW4pXG4gICAgICB2YWwgfD0gYnVmW29mZnNldCArIDNdXG4gICAgdmFsID0gdmFsICsgKGJ1ZltvZmZzZXRdIDw8IDI0ID4+PiAwKVxuICB9XG4gIHJldHVybiB2YWxcbn1cblxuQnVmZmVyLnByb3RvdHlwZS5yZWFkVUludDMyTEUgPSBmdW5jdGlvbiAob2Zmc2V0LCBub0Fzc2VydCkge1xuICByZXR1cm4gX3JlYWRVSW50MzIodGhpcywgb2Zmc2V0LCB0cnVlLCBub0Fzc2VydClcbn1cblxuQnVmZmVyLnByb3RvdHlwZS5yZWFkVUludDMyQkUgPSBmdW5jdGlvbiAob2Zmc2V0LCBub0Fzc2VydCkge1xuICByZXR1cm4gX3JlYWRVSW50MzIodGhpcywgb2Zmc2V0LCBmYWxzZSwgbm9Bc3NlcnQpXG59XG5cbkJ1ZmZlci5wcm90b3R5cGUucmVhZEludDggPSBmdW5jdGlvbiAob2Zmc2V0LCBub0Fzc2VydCkge1xuICBpZiAoIW5vQXNzZXJ0KSB7XG4gICAgYXNzZXJ0KG9mZnNldCAhPT0gdW5kZWZpbmVkICYmIG9mZnNldCAhPT0gbnVsbCxcbiAgICAgICAgJ21pc3Npbmcgb2Zmc2V0JylcbiAgICBhc3NlcnQob2Zmc2V0IDwgdGhpcy5sZW5ndGgsICdUcnlpbmcgdG8gcmVhZCBiZXlvbmQgYnVmZmVyIGxlbmd0aCcpXG4gIH1cblxuICBpZiAob2Zmc2V0ID49IHRoaXMubGVuZ3RoKVxuICAgIHJldHVyblxuXG4gIHZhciBuZWcgPSB0aGlzW29mZnNldF0gJiAweDgwXG4gIGlmIChuZWcpXG4gICAgcmV0dXJuICgweGZmIC0gdGhpc1tvZmZzZXRdICsgMSkgKiAtMVxuICBlbHNlXG4gICAgcmV0dXJuIHRoaXNbb2Zmc2V0XVxufVxuXG5mdW5jdGlvbiBfcmVhZEludDE2IChidWYsIG9mZnNldCwgbGl0dGxlRW5kaWFuLCBub0Fzc2VydCkge1xuICBpZiAoIW5vQXNzZXJ0KSB7XG4gICAgYXNzZXJ0KHR5cGVvZiBsaXR0bGVFbmRpYW4gPT09ICdib29sZWFuJywgJ21pc3Npbmcgb3IgaW52YWxpZCBlbmRpYW4nKVxuICAgIGFzc2VydChvZmZzZXQgIT09IHVuZGVmaW5lZCAmJiBvZmZzZXQgIT09IG51bGwsICdtaXNzaW5nIG9mZnNldCcpXG4gICAgYXNzZXJ0KG9mZnNldCArIDEgPCBidWYubGVuZ3RoLCAnVHJ5aW5nIHRvIHJlYWQgYmV5b25kIGJ1ZmZlciBsZW5ndGgnKVxuICB9XG5cbiAgdmFyIGxlbiA9IGJ1Zi5sZW5ndGhcbiAgaWYgKG9mZnNldCA+PSBsZW4pXG4gICAgcmV0dXJuXG5cbiAgdmFyIHZhbCA9IF9yZWFkVUludDE2KGJ1Ziwgb2Zmc2V0LCBsaXR0bGVFbmRpYW4sIHRydWUpXG4gIHZhciBuZWcgPSB2YWwgJiAweDgwMDBcbiAgaWYgKG5lZylcbiAgICByZXR1cm4gKDB4ZmZmZiAtIHZhbCArIDEpICogLTFcbiAgZWxzZVxuICAgIHJldHVybiB2YWxcbn1cblxuQnVmZmVyLnByb3RvdHlwZS5yZWFkSW50MTZMRSA9IGZ1bmN0aW9uIChvZmZzZXQsIG5vQXNzZXJ0KSB7XG4gIHJldHVybiBfcmVhZEludDE2KHRoaXMsIG9mZnNldCwgdHJ1ZSwgbm9Bc3NlcnQpXG59XG5cbkJ1ZmZlci5wcm90b3R5cGUucmVhZEludDE2QkUgPSBmdW5jdGlvbiAob2Zmc2V0LCBub0Fzc2VydCkge1xuICByZXR1cm4gX3JlYWRJbnQxNih0aGlzLCBvZmZzZXQsIGZhbHNlLCBub0Fzc2VydClcbn1cblxuZnVuY3Rpb24gX3JlYWRJbnQzMiAoYnVmLCBvZmZzZXQsIGxpdHRsZUVuZGlhbiwgbm9Bc3NlcnQpIHtcbiAgaWYgKCFub0Fzc2VydCkge1xuICAgIGFzc2VydCh0eXBlb2YgbGl0dGxlRW5kaWFuID09PSAnYm9vbGVhbicsICdtaXNzaW5nIG9yIGludmFsaWQgZW5kaWFuJylcbiAgICBhc3NlcnQob2Zmc2V0ICE9PSB1bmRlZmluZWQgJiYgb2Zmc2V0ICE9PSBudWxsLCAnbWlzc2luZyBvZmZzZXQnKVxuICAgIGFzc2VydChvZmZzZXQgKyAzIDwgYnVmLmxlbmd0aCwgJ1RyeWluZyB0byByZWFkIGJleW9uZCBidWZmZXIgbGVuZ3RoJylcbiAgfVxuXG4gIHZhciBsZW4gPSBidWYubGVuZ3RoXG4gIGlmIChvZmZzZXQgPj0gbGVuKVxuICAgIHJldHVyblxuXG4gIHZhciB2YWwgPSBfcmVhZFVJbnQzMihidWYsIG9mZnNldCwgbGl0dGxlRW5kaWFuLCB0cnVlKVxuICB2YXIgbmVnID0gdmFsICYgMHg4MDAwMDAwMFxuICBpZiAobmVnKVxuICAgIHJldHVybiAoMHhmZmZmZmZmZiAtIHZhbCArIDEpICogLTFcbiAgZWxzZVxuICAgIHJldHVybiB2YWxcbn1cblxuQnVmZmVyLnByb3RvdHlwZS5yZWFkSW50MzJMRSA9IGZ1bmN0aW9uIChvZmZzZXQsIG5vQXNzZXJ0KSB7XG4gIHJldHVybiBfcmVhZEludDMyKHRoaXMsIG9mZnNldCwgdHJ1ZSwgbm9Bc3NlcnQpXG59XG5cbkJ1ZmZlci5wcm90b3R5cGUucmVhZEludDMyQkUgPSBmdW5jdGlvbiAob2Zmc2V0LCBub0Fzc2VydCkge1xuICByZXR1cm4gX3JlYWRJbnQzMih0aGlzLCBvZmZzZXQsIGZhbHNlLCBub0Fzc2VydClcbn1cblxuZnVuY3Rpb24gX3JlYWRGbG9hdCAoYnVmLCBvZmZzZXQsIGxpdHRsZUVuZGlhbiwgbm9Bc3NlcnQpIHtcbiAgaWYgKCFub0Fzc2VydCkge1xuICAgIGFzc2VydCh0eXBlb2YgbGl0dGxlRW5kaWFuID09PSAnYm9vbGVhbicsICdtaXNzaW5nIG9yIGludmFsaWQgZW5kaWFuJylcbiAgICBhc3NlcnQob2Zmc2V0ICsgMyA8IGJ1Zi5sZW5ndGgsICdUcnlpbmcgdG8gcmVhZCBiZXlvbmQgYnVmZmVyIGxlbmd0aCcpXG4gIH1cblxuICByZXR1cm4gaWVlZTc1NC5yZWFkKGJ1Ziwgb2Zmc2V0LCBsaXR0bGVFbmRpYW4sIDIzLCA0KVxufVxuXG5CdWZmZXIucHJvdG90eXBlLnJlYWRGbG9hdExFID0gZnVuY3Rpb24gKG9mZnNldCwgbm9Bc3NlcnQpIHtcbiAgcmV0dXJuIF9yZWFkRmxvYXQodGhpcywgb2Zmc2V0LCB0cnVlLCBub0Fzc2VydClcbn1cblxuQnVmZmVyLnByb3RvdHlwZS5yZWFkRmxvYXRCRSA9IGZ1bmN0aW9uIChvZmZzZXQsIG5vQXNzZXJ0KSB7XG4gIHJldHVybiBfcmVhZEZsb2F0KHRoaXMsIG9mZnNldCwgZmFsc2UsIG5vQXNzZXJ0KVxufVxuXG5mdW5jdGlvbiBfcmVhZERvdWJsZSAoYnVmLCBvZmZzZXQsIGxpdHRsZUVuZGlhbiwgbm9Bc3NlcnQpIHtcbiAgaWYgKCFub0Fzc2VydCkge1xuICAgIGFzc2VydCh0eXBlb2YgbGl0dGxlRW5kaWFuID09PSAnYm9vbGVhbicsICdtaXNzaW5nIG9yIGludmFsaWQgZW5kaWFuJylcbiAgICBhc3NlcnQob2Zmc2V0ICsgNyA8IGJ1Zi5sZW5ndGgsICdUcnlpbmcgdG8gcmVhZCBiZXlvbmQgYnVmZmVyIGxlbmd0aCcpXG4gIH1cblxuICByZXR1cm4gaWVlZTc1NC5yZWFkKGJ1Ziwgb2Zmc2V0LCBsaXR0bGVFbmRpYW4sIDUyLCA4KVxufVxuXG5CdWZmZXIucHJvdG90eXBlLnJlYWREb3VibGVMRSA9IGZ1bmN0aW9uIChvZmZzZXQsIG5vQXNzZXJ0KSB7XG4gIHJldHVybiBfcmVhZERvdWJsZSh0aGlzLCBvZmZzZXQsIHRydWUsIG5vQXNzZXJ0KVxufVxuXG5CdWZmZXIucHJvdG90eXBlLnJlYWREb3VibGVCRSA9IGZ1bmN0aW9uIChvZmZzZXQsIG5vQXNzZXJ0KSB7XG4gIHJldHVybiBfcmVhZERvdWJsZSh0aGlzLCBvZmZzZXQsIGZhbHNlLCBub0Fzc2VydClcbn1cblxuQnVmZmVyLnByb3RvdHlwZS53cml0ZVVJbnQ4ID0gZnVuY3Rpb24gKHZhbHVlLCBvZmZzZXQsIG5vQXNzZXJ0KSB7XG4gIGlmICghbm9Bc3NlcnQpIHtcbiAgICBhc3NlcnQodmFsdWUgIT09IHVuZGVmaW5lZCAmJiB2YWx1ZSAhPT0gbnVsbCwgJ21pc3NpbmcgdmFsdWUnKVxuICAgIGFzc2VydChvZmZzZXQgIT09IHVuZGVmaW5lZCAmJiBvZmZzZXQgIT09IG51bGwsICdtaXNzaW5nIG9mZnNldCcpXG4gICAgYXNzZXJ0KG9mZnNldCA8IHRoaXMubGVuZ3RoLCAndHJ5aW5nIHRvIHdyaXRlIGJleW9uZCBidWZmZXIgbGVuZ3RoJylcbiAgICB2ZXJpZnVpbnQodmFsdWUsIDB4ZmYpXG4gIH1cblxuICBpZiAob2Zmc2V0ID49IHRoaXMubGVuZ3RoKSByZXR1cm5cblxuICB0aGlzW29mZnNldF0gPSB2YWx1ZVxufVxuXG5mdW5jdGlvbiBfd3JpdGVVSW50MTYgKGJ1ZiwgdmFsdWUsIG9mZnNldCwgbGl0dGxlRW5kaWFuLCBub0Fzc2VydCkge1xuICBpZiAoIW5vQXNzZXJ0KSB7XG4gICAgYXNzZXJ0KHZhbHVlICE9PSB1bmRlZmluZWQgJiYgdmFsdWUgIT09IG51bGwsICdtaXNzaW5nIHZhbHVlJylcbiAgICBhc3NlcnQodHlwZW9mIGxpdHRsZUVuZGlhbiA9PT0gJ2Jvb2xlYW4nLCAnbWlzc2luZyBvciBpbnZhbGlkIGVuZGlhbicpXG4gICAgYXNzZXJ0KG9mZnNldCAhPT0gdW5kZWZpbmVkICYmIG9mZnNldCAhPT0gbnVsbCwgJ21pc3Npbmcgb2Zmc2V0JylcbiAgICBhc3NlcnQob2Zmc2V0ICsgMSA8IGJ1Zi5sZW5ndGgsICd0cnlpbmcgdG8gd3JpdGUgYmV5b25kIGJ1ZmZlciBsZW5ndGgnKVxuICAgIHZlcmlmdWludCh2YWx1ZSwgMHhmZmZmKVxuICB9XG5cbiAgdmFyIGxlbiA9IGJ1Zi5sZW5ndGhcbiAgaWYgKG9mZnNldCA+PSBsZW4pXG4gICAgcmV0dXJuXG5cbiAgZm9yICh2YXIgaSA9IDAsIGogPSBNYXRoLm1pbihsZW4gLSBvZmZzZXQsIDIpOyBpIDwgajsgaSsrKSB7XG4gICAgYnVmW29mZnNldCArIGldID1cbiAgICAgICAgKHZhbHVlICYgKDB4ZmYgPDwgKDggKiAobGl0dGxlRW5kaWFuID8gaSA6IDEgLSBpKSkpKSA+Pj5cbiAgICAgICAgICAgIChsaXR0bGVFbmRpYW4gPyBpIDogMSAtIGkpICogOFxuICB9XG59XG5cbkJ1ZmZlci5wcm90b3R5cGUud3JpdGVVSW50MTZMRSA9IGZ1bmN0aW9uICh2YWx1ZSwgb2Zmc2V0LCBub0Fzc2VydCkge1xuICBfd3JpdGVVSW50MTYodGhpcywgdmFsdWUsIG9mZnNldCwgdHJ1ZSwgbm9Bc3NlcnQpXG59XG5cbkJ1ZmZlci5wcm90b3R5cGUud3JpdGVVSW50MTZCRSA9IGZ1bmN0aW9uICh2YWx1ZSwgb2Zmc2V0LCBub0Fzc2VydCkge1xuICBfd3JpdGVVSW50MTYodGhpcywgdmFsdWUsIG9mZnNldCwgZmFsc2UsIG5vQXNzZXJ0KVxufVxuXG5mdW5jdGlvbiBfd3JpdGVVSW50MzIgKGJ1ZiwgdmFsdWUsIG9mZnNldCwgbGl0dGxlRW5kaWFuLCBub0Fzc2VydCkge1xuICBpZiAoIW5vQXNzZXJ0KSB7XG4gICAgYXNzZXJ0KHZhbHVlICE9PSB1bmRlZmluZWQgJiYgdmFsdWUgIT09IG51bGwsICdtaXNzaW5nIHZhbHVlJylcbiAgICBhc3NlcnQodHlwZW9mIGxpdHRsZUVuZGlhbiA9PT0gJ2Jvb2xlYW4nLCAnbWlzc2luZyBvciBpbnZhbGlkIGVuZGlhbicpXG4gICAgYXNzZXJ0KG9mZnNldCAhPT0gdW5kZWZpbmVkICYmIG9mZnNldCAhPT0gbnVsbCwgJ21pc3Npbmcgb2Zmc2V0JylcbiAgICBhc3NlcnQob2Zmc2V0ICsgMyA8IGJ1Zi5sZW5ndGgsICd0cnlpbmcgdG8gd3JpdGUgYmV5b25kIGJ1ZmZlciBsZW5ndGgnKVxuICAgIHZlcmlmdWludCh2YWx1ZSwgMHhmZmZmZmZmZilcbiAgfVxuXG4gIHZhciBsZW4gPSBidWYubGVuZ3RoXG4gIGlmIChvZmZzZXQgPj0gbGVuKVxuICAgIHJldHVyblxuXG4gIGZvciAodmFyIGkgPSAwLCBqID0gTWF0aC5taW4obGVuIC0gb2Zmc2V0LCA0KTsgaSA8IGo7IGkrKykge1xuICAgIGJ1ZltvZmZzZXQgKyBpXSA9XG4gICAgICAgICh2YWx1ZSA+Pj4gKGxpdHRsZUVuZGlhbiA/IGkgOiAzIC0gaSkgKiA4KSAmIDB4ZmZcbiAgfVxufVxuXG5CdWZmZXIucHJvdG90eXBlLndyaXRlVUludDMyTEUgPSBmdW5jdGlvbiAodmFsdWUsIG9mZnNldCwgbm9Bc3NlcnQpIHtcbiAgX3dyaXRlVUludDMyKHRoaXMsIHZhbHVlLCBvZmZzZXQsIHRydWUsIG5vQXNzZXJ0KVxufVxuXG5CdWZmZXIucHJvdG90eXBlLndyaXRlVUludDMyQkUgPSBmdW5jdGlvbiAodmFsdWUsIG9mZnNldCwgbm9Bc3NlcnQpIHtcbiAgX3dyaXRlVUludDMyKHRoaXMsIHZhbHVlLCBvZmZzZXQsIGZhbHNlLCBub0Fzc2VydClcbn1cblxuQnVmZmVyLnByb3RvdHlwZS53cml0ZUludDggPSBmdW5jdGlvbiAodmFsdWUsIG9mZnNldCwgbm9Bc3NlcnQpIHtcbiAgaWYgKCFub0Fzc2VydCkge1xuICAgIGFzc2VydCh2YWx1ZSAhPT0gdW5kZWZpbmVkICYmIHZhbHVlICE9PSBudWxsLCAnbWlzc2luZyB2YWx1ZScpXG4gICAgYXNzZXJ0KG9mZnNldCAhPT0gdW5kZWZpbmVkICYmIG9mZnNldCAhPT0gbnVsbCwgJ21pc3Npbmcgb2Zmc2V0JylcbiAgICBhc3NlcnQob2Zmc2V0IDwgdGhpcy5sZW5ndGgsICdUcnlpbmcgdG8gd3JpdGUgYmV5b25kIGJ1ZmZlciBsZW5ndGgnKVxuICAgIHZlcmlmc2ludCh2YWx1ZSwgMHg3ZiwgLTB4ODApXG4gIH1cblxuICBpZiAob2Zmc2V0ID49IHRoaXMubGVuZ3RoKVxuICAgIHJldHVyblxuXG4gIGlmICh2YWx1ZSA+PSAwKVxuICAgIHRoaXMud3JpdGVVSW50OCh2YWx1ZSwgb2Zmc2V0LCBub0Fzc2VydClcbiAgZWxzZVxuICAgIHRoaXMud3JpdGVVSW50OCgweGZmICsgdmFsdWUgKyAxLCBvZmZzZXQsIG5vQXNzZXJ0KVxufVxuXG5mdW5jdGlvbiBfd3JpdGVJbnQxNiAoYnVmLCB2YWx1ZSwgb2Zmc2V0LCBsaXR0bGVFbmRpYW4sIG5vQXNzZXJ0KSB7XG4gIGlmICghbm9Bc3NlcnQpIHtcbiAgICBhc3NlcnQodmFsdWUgIT09IHVuZGVmaW5lZCAmJiB2YWx1ZSAhPT0gbnVsbCwgJ21pc3NpbmcgdmFsdWUnKVxuICAgIGFzc2VydCh0eXBlb2YgbGl0dGxlRW5kaWFuID09PSAnYm9vbGVhbicsICdtaXNzaW5nIG9yIGludmFsaWQgZW5kaWFuJylcbiAgICBhc3NlcnQob2Zmc2V0ICE9PSB1bmRlZmluZWQgJiYgb2Zmc2V0ICE9PSBudWxsLCAnbWlzc2luZyBvZmZzZXQnKVxuICAgIGFzc2VydChvZmZzZXQgKyAxIDwgYnVmLmxlbmd0aCwgJ1RyeWluZyB0byB3cml0ZSBiZXlvbmQgYnVmZmVyIGxlbmd0aCcpXG4gICAgdmVyaWZzaW50KHZhbHVlLCAweDdmZmYsIC0weDgwMDApXG4gIH1cblxuICB2YXIgbGVuID0gYnVmLmxlbmd0aFxuICBpZiAob2Zmc2V0ID49IGxlbilcbiAgICByZXR1cm5cblxuICBpZiAodmFsdWUgPj0gMClcbiAgICBfd3JpdGVVSW50MTYoYnVmLCB2YWx1ZSwgb2Zmc2V0LCBsaXR0bGVFbmRpYW4sIG5vQXNzZXJ0KVxuICBlbHNlXG4gICAgX3dyaXRlVUludDE2KGJ1ZiwgMHhmZmZmICsgdmFsdWUgKyAxLCBvZmZzZXQsIGxpdHRsZUVuZGlhbiwgbm9Bc3NlcnQpXG59XG5cbkJ1ZmZlci5wcm90b3R5cGUud3JpdGVJbnQxNkxFID0gZnVuY3Rpb24gKHZhbHVlLCBvZmZzZXQsIG5vQXNzZXJ0KSB7XG4gIF93cml0ZUludDE2KHRoaXMsIHZhbHVlLCBvZmZzZXQsIHRydWUsIG5vQXNzZXJ0KVxufVxuXG5CdWZmZXIucHJvdG90eXBlLndyaXRlSW50MTZCRSA9IGZ1bmN0aW9uICh2YWx1ZSwgb2Zmc2V0LCBub0Fzc2VydCkge1xuICBfd3JpdGVJbnQxNih0aGlzLCB2YWx1ZSwgb2Zmc2V0LCBmYWxzZSwgbm9Bc3NlcnQpXG59XG5cbmZ1bmN0aW9uIF93cml0ZUludDMyIChidWYsIHZhbHVlLCBvZmZzZXQsIGxpdHRsZUVuZGlhbiwgbm9Bc3NlcnQpIHtcbiAgaWYgKCFub0Fzc2VydCkge1xuICAgIGFzc2VydCh2YWx1ZSAhPT0gdW5kZWZpbmVkICYmIHZhbHVlICE9PSBudWxsLCAnbWlzc2luZyB2YWx1ZScpXG4gICAgYXNzZXJ0KHR5cGVvZiBsaXR0bGVFbmRpYW4gPT09ICdib29sZWFuJywgJ21pc3Npbmcgb3IgaW52YWxpZCBlbmRpYW4nKVxuICAgIGFzc2VydChvZmZzZXQgIT09IHVuZGVmaW5lZCAmJiBvZmZzZXQgIT09IG51bGwsICdtaXNzaW5nIG9mZnNldCcpXG4gICAgYXNzZXJ0KG9mZnNldCArIDMgPCBidWYubGVuZ3RoLCAnVHJ5aW5nIHRvIHdyaXRlIGJleW9uZCBidWZmZXIgbGVuZ3RoJylcbiAgICB2ZXJpZnNpbnQodmFsdWUsIDB4N2ZmZmZmZmYsIC0weDgwMDAwMDAwKVxuICB9XG5cbiAgdmFyIGxlbiA9IGJ1Zi5sZW5ndGhcbiAgaWYgKG9mZnNldCA+PSBsZW4pXG4gICAgcmV0dXJuXG5cbiAgaWYgKHZhbHVlID49IDApXG4gICAgX3dyaXRlVUludDMyKGJ1ZiwgdmFsdWUsIG9mZnNldCwgbGl0dGxlRW5kaWFuLCBub0Fzc2VydClcbiAgZWxzZVxuICAgIF93cml0ZVVJbnQzMihidWYsIDB4ZmZmZmZmZmYgKyB2YWx1ZSArIDEsIG9mZnNldCwgbGl0dGxlRW5kaWFuLCBub0Fzc2VydClcbn1cblxuQnVmZmVyLnByb3RvdHlwZS53cml0ZUludDMyTEUgPSBmdW5jdGlvbiAodmFsdWUsIG9mZnNldCwgbm9Bc3NlcnQpIHtcbiAgX3dyaXRlSW50MzIodGhpcywgdmFsdWUsIG9mZnNldCwgdHJ1ZSwgbm9Bc3NlcnQpXG59XG5cbkJ1ZmZlci5wcm90b3R5cGUud3JpdGVJbnQzMkJFID0gZnVuY3Rpb24gKHZhbHVlLCBvZmZzZXQsIG5vQXNzZXJ0KSB7XG4gIF93cml0ZUludDMyKHRoaXMsIHZhbHVlLCBvZmZzZXQsIGZhbHNlLCBub0Fzc2VydClcbn1cblxuZnVuY3Rpb24gX3dyaXRlRmxvYXQgKGJ1ZiwgdmFsdWUsIG9mZnNldCwgbGl0dGxlRW5kaWFuLCBub0Fzc2VydCkge1xuICBpZiAoIW5vQXNzZXJ0KSB7XG4gICAgYXNzZXJ0KHZhbHVlICE9PSB1bmRlZmluZWQgJiYgdmFsdWUgIT09IG51bGwsICdtaXNzaW5nIHZhbHVlJylcbiAgICBhc3NlcnQodHlwZW9mIGxpdHRsZUVuZGlhbiA9PT0gJ2Jvb2xlYW4nLCAnbWlzc2luZyBvciBpbnZhbGlkIGVuZGlhbicpXG4gICAgYXNzZXJ0KG9mZnNldCAhPT0gdW5kZWZpbmVkICYmIG9mZnNldCAhPT0gbnVsbCwgJ21pc3Npbmcgb2Zmc2V0JylcbiAgICBhc3NlcnQob2Zmc2V0ICsgMyA8IGJ1Zi5sZW5ndGgsICdUcnlpbmcgdG8gd3JpdGUgYmV5b25kIGJ1ZmZlciBsZW5ndGgnKVxuICAgIHZlcmlmSUVFRTc1NCh2YWx1ZSwgMy40MDI4MjM0NjYzODUyODg2ZSszOCwgLTMuNDAyODIzNDY2Mzg1Mjg4NmUrMzgpXG4gIH1cblxuICB2YXIgbGVuID0gYnVmLmxlbmd0aFxuICBpZiAob2Zmc2V0ID49IGxlbilcbiAgICByZXR1cm5cblxuICBpZWVlNzU0LndyaXRlKGJ1ZiwgdmFsdWUsIG9mZnNldCwgbGl0dGxlRW5kaWFuLCAyMywgNClcbn1cblxuQnVmZmVyLnByb3RvdHlwZS53cml0ZUZsb2F0TEUgPSBmdW5jdGlvbiAodmFsdWUsIG9mZnNldCwgbm9Bc3NlcnQpIHtcbiAgX3dyaXRlRmxvYXQodGhpcywgdmFsdWUsIG9mZnNldCwgdHJ1ZSwgbm9Bc3NlcnQpXG59XG5cbkJ1ZmZlci5wcm90b3R5cGUud3JpdGVGbG9hdEJFID0gZnVuY3Rpb24gKHZhbHVlLCBvZmZzZXQsIG5vQXNzZXJ0KSB7XG4gIF93cml0ZUZsb2F0KHRoaXMsIHZhbHVlLCBvZmZzZXQsIGZhbHNlLCBub0Fzc2VydClcbn1cblxuZnVuY3Rpb24gX3dyaXRlRG91YmxlIChidWYsIHZhbHVlLCBvZmZzZXQsIGxpdHRsZUVuZGlhbiwgbm9Bc3NlcnQpIHtcbiAgaWYgKCFub0Fzc2VydCkge1xuICAgIGFzc2VydCh2YWx1ZSAhPT0gdW5kZWZpbmVkICYmIHZhbHVlICE9PSBudWxsLCAnbWlzc2luZyB2YWx1ZScpXG4gICAgYXNzZXJ0KHR5cGVvZiBsaXR0bGVFbmRpYW4gPT09ICdib29sZWFuJywgJ21pc3Npbmcgb3IgaW52YWxpZCBlbmRpYW4nKVxuICAgIGFzc2VydChvZmZzZXQgIT09IHVuZGVmaW5lZCAmJiBvZmZzZXQgIT09IG51bGwsICdtaXNzaW5nIG9mZnNldCcpXG4gICAgYXNzZXJ0KG9mZnNldCArIDcgPCBidWYubGVuZ3RoLFxuICAgICAgICAnVHJ5aW5nIHRvIHdyaXRlIGJleW9uZCBidWZmZXIgbGVuZ3RoJylcbiAgICB2ZXJpZklFRUU3NTQodmFsdWUsIDEuNzk3NjkzMTM0ODYyMzE1N0UrMzA4LCAtMS43OTc2OTMxMzQ4NjIzMTU3RSszMDgpXG4gIH1cblxuICB2YXIgbGVuID0gYnVmLmxlbmd0aFxuICBpZiAob2Zmc2V0ID49IGxlbilcbiAgICByZXR1cm5cblxuICBpZWVlNzU0LndyaXRlKGJ1ZiwgdmFsdWUsIG9mZnNldCwgbGl0dGxlRW5kaWFuLCA1MiwgOClcbn1cblxuQnVmZmVyLnByb3RvdHlwZS53cml0ZURvdWJsZUxFID0gZnVuY3Rpb24gKHZhbHVlLCBvZmZzZXQsIG5vQXNzZXJ0KSB7XG4gIF93cml0ZURvdWJsZSh0aGlzLCB2YWx1ZSwgb2Zmc2V0LCB0cnVlLCBub0Fzc2VydClcbn1cblxuQnVmZmVyLnByb3RvdHlwZS53cml0ZURvdWJsZUJFID0gZnVuY3Rpb24gKHZhbHVlLCBvZmZzZXQsIG5vQXNzZXJ0KSB7XG4gIF93cml0ZURvdWJsZSh0aGlzLCB2YWx1ZSwgb2Zmc2V0LCBmYWxzZSwgbm9Bc3NlcnQpXG59XG5cbi8vIGZpbGwodmFsdWUsIHN0YXJ0PTAsIGVuZD1idWZmZXIubGVuZ3RoKVxuQnVmZmVyLnByb3RvdHlwZS5maWxsID0gZnVuY3Rpb24gKHZhbHVlLCBzdGFydCwgZW5kKSB7XG4gIGlmICghdmFsdWUpIHZhbHVlID0gMFxuICBpZiAoIXN0YXJ0KSBzdGFydCA9IDBcbiAgaWYgKCFlbmQpIGVuZCA9IHRoaXMubGVuZ3RoXG5cbiAgaWYgKHR5cGVvZiB2YWx1ZSA9PT0gJ3N0cmluZycpIHtcbiAgICB2YWx1ZSA9IHZhbHVlLmNoYXJDb2RlQXQoMClcbiAgfVxuXG4gIGFzc2VydCh0eXBlb2YgdmFsdWUgPT09ICdudW1iZXInICYmICFpc05hTih2YWx1ZSksICd2YWx1ZSBpcyBub3QgYSBudW1iZXInKVxuICBhc3NlcnQoZW5kID49IHN0YXJ0LCAnZW5kIDwgc3RhcnQnKVxuXG4gIC8vIEZpbGwgMCBieXRlczsgd2UncmUgZG9uZVxuICBpZiAoZW5kID09PSBzdGFydCkgcmV0dXJuXG4gIGlmICh0aGlzLmxlbmd0aCA9PT0gMCkgcmV0dXJuXG5cbiAgYXNzZXJ0KHN0YXJ0ID49IDAgJiYgc3RhcnQgPCB0aGlzLmxlbmd0aCwgJ3N0YXJ0IG91dCBvZiBib3VuZHMnKVxuICBhc3NlcnQoZW5kID49IDAgJiYgZW5kIDw9IHRoaXMubGVuZ3RoLCAnZW5kIG91dCBvZiBib3VuZHMnKVxuXG4gIGZvciAodmFyIGkgPSBzdGFydDsgaSA8IGVuZDsgaSsrKSB7XG4gICAgdGhpc1tpXSA9IHZhbHVlXG4gIH1cbn1cblxuQnVmZmVyLnByb3RvdHlwZS5pbnNwZWN0ID0gZnVuY3Rpb24gKCkge1xuICB2YXIgb3V0ID0gW11cbiAgdmFyIGxlbiA9IHRoaXMubGVuZ3RoXG4gIGZvciAodmFyIGkgPSAwOyBpIDwgbGVuOyBpKyspIHtcbiAgICBvdXRbaV0gPSB0b0hleCh0aGlzW2ldKVxuICAgIGlmIChpID09PSBleHBvcnRzLklOU1BFQ1RfTUFYX0JZVEVTKSB7XG4gICAgICBvdXRbaSArIDFdID0gJy4uLidcbiAgICAgIGJyZWFrXG4gICAgfVxuICB9XG4gIHJldHVybiAnPEJ1ZmZlciAnICsgb3V0LmpvaW4oJyAnKSArICc+J1xufVxuXG4vKipcbiAqIENyZWF0ZXMgYSBuZXcgYEFycmF5QnVmZmVyYCB3aXRoIHRoZSAqY29waWVkKiBtZW1vcnkgb2YgdGhlIGJ1ZmZlciBpbnN0YW5jZS5cbiAqIEFkZGVkIGluIE5vZGUgMC4xMi4gT25seSBhdmFpbGFibGUgaW4gYnJvd3NlcnMgdGhhdCBzdXBwb3J0IEFycmF5QnVmZmVyLlxuICovXG5CdWZmZXIucHJvdG90eXBlLnRvQXJyYXlCdWZmZXIgPSBmdW5jdGlvbiAoKSB7XG4gIGlmICh0eXBlb2YgVWludDhBcnJheSAhPT0gJ3VuZGVmaW5lZCcpIHtcbiAgICBpZiAoQnVmZmVyLl91c2VUeXBlZEFycmF5cykge1xuICAgICAgcmV0dXJuIChuZXcgQnVmZmVyKHRoaXMpKS5idWZmZXJcbiAgICB9IGVsc2Uge1xuICAgICAgdmFyIGJ1ZiA9IG5ldyBVaW50OEFycmF5KHRoaXMubGVuZ3RoKVxuICAgICAgZm9yICh2YXIgaSA9IDAsIGxlbiA9IGJ1Zi5sZW5ndGg7IGkgPCBsZW47IGkgKz0gMSlcbiAgICAgICAgYnVmW2ldID0gdGhpc1tpXVxuICAgICAgcmV0dXJuIGJ1Zi5idWZmZXJcbiAgICB9XG4gIH0gZWxzZSB7XG4gICAgdGhyb3cgbmV3IEVycm9yKCdCdWZmZXIudG9BcnJheUJ1ZmZlciBub3Qgc3VwcG9ydGVkIGluIHRoaXMgYnJvd3NlcicpXG4gIH1cbn1cblxuLy8gSEVMUEVSIEZVTkNUSU9OU1xuLy8gPT09PT09PT09PT09PT09PVxuXG5mdW5jdGlvbiBzdHJpbmd0cmltIChzdHIpIHtcbiAgaWYgKHN0ci50cmltKSByZXR1cm4gc3RyLnRyaW0oKVxuICByZXR1cm4gc3RyLnJlcGxhY2UoL15cXHMrfFxccyskL2csICcnKVxufVxuXG52YXIgQlAgPSBCdWZmZXIucHJvdG90eXBlXG5cbi8qKlxuICogQXVnbWVudCBhIFVpbnQ4QXJyYXkgKmluc3RhbmNlKiAobm90IHRoZSBVaW50OEFycmF5IGNsYXNzISkgd2l0aCBCdWZmZXIgbWV0aG9kc1xuICovXG5CdWZmZXIuX2F1Z21lbnQgPSBmdW5jdGlvbiAoYXJyKSB7XG4gIGFyci5faXNCdWZmZXIgPSB0cnVlXG5cbiAgLy8gc2F2ZSByZWZlcmVuY2UgdG8gb3JpZ2luYWwgVWludDhBcnJheSBnZXQvc2V0IG1ldGhvZHMgYmVmb3JlIG92ZXJ3cml0aW5nXG4gIGFyci5fZ2V0ID0gYXJyLmdldFxuICBhcnIuX3NldCA9IGFyci5zZXRcblxuICAvLyBkZXByZWNhdGVkLCB3aWxsIGJlIHJlbW92ZWQgaW4gbm9kZSAwLjEzK1xuICBhcnIuZ2V0ID0gQlAuZ2V0XG4gIGFyci5zZXQgPSBCUC5zZXRcblxuICBhcnIud3JpdGUgPSBCUC53cml0ZVxuICBhcnIudG9TdHJpbmcgPSBCUC50b1N0cmluZ1xuICBhcnIudG9Mb2NhbGVTdHJpbmcgPSBCUC50b1N0cmluZ1xuICBhcnIudG9KU09OID0gQlAudG9KU09OXG4gIGFyci5jb3B5ID0gQlAuY29weVxuICBhcnIuc2xpY2UgPSBCUC5zbGljZVxuICBhcnIucmVhZFVJbnQ4ID0gQlAucmVhZFVJbnQ4XG4gIGFyci5yZWFkVUludDE2TEUgPSBCUC5yZWFkVUludDE2TEVcbiAgYXJyLnJlYWRVSW50MTZCRSA9IEJQLnJlYWRVSW50MTZCRVxuICBhcnIucmVhZFVJbnQzMkxFID0gQlAucmVhZFVJbnQzMkxFXG4gIGFyci5yZWFkVUludDMyQkUgPSBCUC5yZWFkVUludDMyQkVcbiAgYXJyLnJlYWRJbnQ4ID0gQlAucmVhZEludDhcbiAgYXJyLnJlYWRJbnQxNkxFID0gQlAucmVhZEludDE2TEVcbiAgYXJyLnJlYWRJbnQxNkJFID0gQlAucmVhZEludDE2QkVcbiAgYXJyLnJlYWRJbnQzMkxFID0gQlAucmVhZEludDMyTEVcbiAgYXJyLnJlYWRJbnQzMkJFID0gQlAucmVhZEludDMyQkVcbiAgYXJyLnJlYWRGbG9hdExFID0gQlAucmVhZEZsb2F0TEVcbiAgYXJyLnJlYWRGbG9hdEJFID0gQlAucmVhZEZsb2F0QkVcbiAgYXJyLnJlYWREb3VibGVMRSA9IEJQLnJlYWREb3VibGVMRVxuICBhcnIucmVhZERvdWJsZUJFID0gQlAucmVhZERvdWJsZUJFXG4gIGFyci53cml0ZVVJbnQ4ID0gQlAud3JpdGVVSW50OFxuICBhcnIud3JpdGVVSW50MTZMRSA9IEJQLndyaXRlVUludDE2TEVcbiAgYXJyLndyaXRlVUludDE2QkUgPSBCUC53cml0ZVVJbnQxNkJFXG4gIGFyci53cml0ZVVJbnQzMkxFID0gQlAud3JpdGVVSW50MzJMRVxuICBhcnIud3JpdGVVSW50MzJCRSA9IEJQLndyaXRlVUludDMyQkVcbiAgYXJyLndyaXRlSW50OCA9IEJQLndyaXRlSW50OFxuICBhcnIud3JpdGVJbnQxNkxFID0gQlAud3JpdGVJbnQxNkxFXG4gIGFyci53cml0ZUludDE2QkUgPSBCUC53cml0ZUludDE2QkVcbiAgYXJyLndyaXRlSW50MzJMRSA9IEJQLndyaXRlSW50MzJMRVxuICBhcnIud3JpdGVJbnQzMkJFID0gQlAud3JpdGVJbnQzMkJFXG4gIGFyci53cml0ZUZsb2F0TEUgPSBCUC53cml0ZUZsb2F0TEVcbiAgYXJyLndyaXRlRmxvYXRCRSA9IEJQLndyaXRlRmxvYXRCRVxuICBhcnIud3JpdGVEb3VibGVMRSA9IEJQLndyaXRlRG91YmxlTEVcbiAgYXJyLndyaXRlRG91YmxlQkUgPSBCUC53cml0ZURvdWJsZUJFXG4gIGFyci5maWxsID0gQlAuZmlsbFxuICBhcnIuaW5zcGVjdCA9IEJQLmluc3BlY3RcbiAgYXJyLnRvQXJyYXlCdWZmZXIgPSBCUC50b0FycmF5QnVmZmVyXG5cbiAgcmV0dXJuIGFyclxufVxuXG4vLyBzbGljZShzdGFydCwgZW5kKVxuZnVuY3Rpb24gY2xhbXAgKGluZGV4LCBsZW4sIGRlZmF1bHRWYWx1ZSkge1xuICBpZiAodHlwZW9mIGluZGV4ICE9PSAnbnVtYmVyJykgcmV0dXJuIGRlZmF1bHRWYWx1ZVxuICBpbmRleCA9IH5+aW5kZXg7ICAvLyBDb2VyY2UgdG8gaW50ZWdlci5cbiAgaWYgKGluZGV4ID49IGxlbikgcmV0dXJuIGxlblxuICBpZiAoaW5kZXggPj0gMCkgcmV0dXJuIGluZGV4XG4gIGluZGV4ICs9IGxlblxuICBpZiAoaW5kZXggPj0gMCkgcmV0dXJuIGluZGV4XG4gIHJldHVybiAwXG59XG5cbmZ1bmN0aW9uIGNvZXJjZSAobGVuZ3RoKSB7XG4gIC8vIENvZXJjZSBsZW5ndGggdG8gYSBudW1iZXIgKHBvc3NpYmx5IE5hTiksIHJvdW5kIHVwXG4gIC8vIGluIGNhc2UgaXQncyBmcmFjdGlvbmFsIChlLmcuIDEyMy40NTYpIHRoZW4gZG8gYVxuICAvLyBkb3VibGUgbmVnYXRlIHRvIGNvZXJjZSBhIE5hTiB0byAwLiBFYXN5LCByaWdodD9cbiAgbGVuZ3RoID0gfn5NYXRoLmNlaWwoK2xlbmd0aClcbiAgcmV0dXJuIGxlbmd0aCA8IDAgPyAwIDogbGVuZ3RoXG59XG5cbmZ1bmN0aW9uIGlzQXJyYXkgKHN1YmplY3QpIHtcbiAgcmV0dXJuIChBcnJheS5pc0FycmF5IHx8IGZ1bmN0aW9uIChzdWJqZWN0KSB7XG4gICAgcmV0dXJuIE9iamVjdC5wcm90b3R5cGUudG9TdHJpbmcuY2FsbChzdWJqZWN0KSA9PT0gJ1tvYmplY3QgQXJyYXldJ1xuICB9KShzdWJqZWN0KVxufVxuXG5mdW5jdGlvbiBpc0FycmF5aXNoIChzdWJqZWN0KSB7XG4gIHJldHVybiBpc0FycmF5KHN1YmplY3QpIHx8IEJ1ZmZlci5pc0J1ZmZlcihzdWJqZWN0KSB8fFxuICAgICAgc3ViamVjdCAmJiB0eXBlb2Ygc3ViamVjdCA9PT0gJ29iamVjdCcgJiZcbiAgICAgIHR5cGVvZiBzdWJqZWN0Lmxlbmd0aCA9PT0gJ251bWJlcidcbn1cblxuZnVuY3Rpb24gdG9IZXggKG4pIHtcbiAgaWYgKG4gPCAxNikgcmV0dXJuICcwJyArIG4udG9TdHJpbmcoMTYpXG4gIHJldHVybiBuLnRvU3RyaW5nKDE2KVxufVxuXG5mdW5jdGlvbiB1dGY4VG9CeXRlcyAoc3RyKSB7XG4gIHZhciBieXRlQXJyYXkgPSBbXVxuICBmb3IgKHZhciBpID0gMDsgaSA8IHN0ci5sZW5ndGg7IGkrKykge1xuICAgIHZhciBiID0gc3RyLmNoYXJDb2RlQXQoaSlcbiAgICBpZiAoYiA8PSAweDdGKVxuICAgICAgYnl0ZUFycmF5LnB1c2goc3RyLmNoYXJDb2RlQXQoaSkpXG4gICAgZWxzZSB7XG4gICAgICB2YXIgc3RhcnQgPSBpXG4gICAgICBpZiAoYiA+PSAweEQ4MDAgJiYgYiA8PSAweERGRkYpIGkrK1xuICAgICAgdmFyIGggPSBlbmNvZGVVUklDb21wb25lbnQoc3RyLnNsaWNlKHN0YXJ0LCBpKzEpKS5zdWJzdHIoMSkuc3BsaXQoJyUnKVxuICAgICAgZm9yICh2YXIgaiA9IDA7IGogPCBoLmxlbmd0aDsgaisrKVxuICAgICAgICBieXRlQXJyYXkucHVzaChwYXJzZUludChoW2pdLCAxNikpXG4gICAgfVxuICB9XG4gIHJldHVybiBieXRlQXJyYXlcbn1cblxuZnVuY3Rpb24gYXNjaWlUb0J5dGVzIChzdHIpIHtcbiAgdmFyIGJ5dGVBcnJheSA9IFtdXG4gIGZvciAodmFyIGkgPSAwOyBpIDwgc3RyLmxlbmd0aDsgaSsrKSB7XG4gICAgLy8gTm9kZSdzIGNvZGUgc2VlbXMgdG8gYmUgZG9pbmcgdGhpcyBhbmQgbm90ICYgMHg3Ri4uXG4gICAgYnl0ZUFycmF5LnB1c2goc3RyLmNoYXJDb2RlQXQoaSkgJiAweEZGKVxuICB9XG4gIHJldHVybiBieXRlQXJyYXlcbn1cblxuZnVuY3Rpb24gdXRmMTZsZVRvQnl0ZXMgKHN0cikge1xuICB2YXIgYywgaGksIGxvXG4gIHZhciBieXRlQXJyYXkgPSBbXVxuICBmb3IgKHZhciBpID0gMDsgaSA8IHN0ci5sZW5ndGg7IGkrKykge1xuICAgIGMgPSBzdHIuY2hhckNvZGVBdChpKVxuICAgIGhpID0gYyA+PiA4XG4gICAgbG8gPSBjICUgMjU2XG4gICAgYnl0ZUFycmF5LnB1c2gobG8pXG4gICAgYnl0ZUFycmF5LnB1c2goaGkpXG4gIH1cblxuICByZXR1cm4gYnl0ZUFycmF5XG59XG5cbmZ1bmN0aW9uIGJhc2U2NFRvQnl0ZXMgKHN0cikge1xuICByZXR1cm4gYmFzZTY0LnRvQnl0ZUFycmF5KHN0cilcbn1cblxuZnVuY3Rpb24gYmxpdEJ1ZmZlciAoc3JjLCBkc3QsIG9mZnNldCwgbGVuZ3RoKSB7XG4gIHZhciBwb3NcbiAgZm9yICh2YXIgaSA9IDA7IGkgPCBsZW5ndGg7IGkrKykge1xuICAgIGlmICgoaSArIG9mZnNldCA+PSBkc3QubGVuZ3RoKSB8fCAoaSA+PSBzcmMubGVuZ3RoKSlcbiAgICAgIGJyZWFrXG4gICAgZHN0W2kgKyBvZmZzZXRdID0gc3JjW2ldXG4gIH1cbiAgcmV0dXJuIGlcbn1cblxuZnVuY3Rpb24gZGVjb2RlVXRmOENoYXIgKHN0cikge1xuICB0cnkge1xuICAgIHJldHVybiBkZWNvZGVVUklDb21wb25lbnQoc3RyKVxuICB9IGNhdGNoIChlcnIpIHtcbiAgICByZXR1cm4gU3RyaW5nLmZyb21DaGFyQ29kZSgweEZGRkQpIC8vIFVURiA4IGludmFsaWQgY2hhclxuICB9XG59XG5cbi8qXG4gKiBXZSBoYXZlIHRvIG1ha2Ugc3VyZSB0aGF0IHRoZSB2YWx1ZSBpcyBhIHZhbGlkIGludGVnZXIuIFRoaXMgbWVhbnMgdGhhdCBpdFxuICogaXMgbm9uLW5lZ2F0aXZlLiBJdCBoYXMgbm8gZnJhY3Rpb25hbCBjb21wb25lbnQgYW5kIHRoYXQgaXQgZG9lcyBub3RcbiAqIGV4Y2VlZCB0aGUgbWF4aW11bSBhbGxvd2VkIHZhbHVlLlxuICovXG5mdW5jdGlvbiB2ZXJpZnVpbnQgKHZhbHVlLCBtYXgpIHtcbiAgYXNzZXJ0KHR5cGVvZiB2YWx1ZSA9PT0gJ251bWJlcicsICdjYW5ub3Qgd3JpdGUgYSBub24tbnVtYmVyIGFzIGEgbnVtYmVyJylcbiAgYXNzZXJ0KHZhbHVlID49IDAsICdzcGVjaWZpZWQgYSBuZWdhdGl2ZSB2YWx1ZSBmb3Igd3JpdGluZyBhbiB1bnNpZ25lZCB2YWx1ZScpXG4gIGFzc2VydCh2YWx1ZSA8PSBtYXgsICd2YWx1ZSBpcyBsYXJnZXIgdGhhbiBtYXhpbXVtIHZhbHVlIGZvciB0eXBlJylcbiAgYXNzZXJ0KE1hdGguZmxvb3IodmFsdWUpID09PSB2YWx1ZSwgJ3ZhbHVlIGhhcyBhIGZyYWN0aW9uYWwgY29tcG9uZW50Jylcbn1cblxuZnVuY3Rpb24gdmVyaWZzaW50ICh2YWx1ZSwgbWF4LCBtaW4pIHtcbiAgYXNzZXJ0KHR5cGVvZiB2YWx1ZSA9PT0gJ251bWJlcicsICdjYW5ub3Qgd3JpdGUgYSBub24tbnVtYmVyIGFzIGEgbnVtYmVyJylcbiAgYXNzZXJ0KHZhbHVlIDw9IG1heCwgJ3ZhbHVlIGxhcmdlciB0aGFuIG1heGltdW0gYWxsb3dlZCB2YWx1ZScpXG4gIGFzc2VydCh2YWx1ZSA+PSBtaW4sICd2YWx1ZSBzbWFsbGVyIHRoYW4gbWluaW11bSBhbGxvd2VkIHZhbHVlJylcbiAgYXNzZXJ0KE1hdGguZmxvb3IodmFsdWUpID09PSB2YWx1ZSwgJ3ZhbHVlIGhhcyBhIGZyYWN0aW9uYWwgY29tcG9uZW50Jylcbn1cblxuZnVuY3Rpb24gdmVyaWZJRUVFNzU0ICh2YWx1ZSwgbWF4LCBtaW4pIHtcbiAgYXNzZXJ0KHR5cGVvZiB2YWx1ZSA9PT0gJ251bWJlcicsICdjYW5ub3Qgd3JpdGUgYSBub24tbnVtYmVyIGFzIGEgbnVtYmVyJylcbiAgYXNzZXJ0KHZhbHVlIDw9IG1heCwgJ3ZhbHVlIGxhcmdlciB0aGFuIG1heGltdW0gYWxsb3dlZCB2YWx1ZScpXG4gIGFzc2VydCh2YWx1ZSA+PSBtaW4sICd2YWx1ZSBzbWFsbGVyIHRoYW4gbWluaW11bSBhbGxvd2VkIHZhbHVlJylcbn1cblxuZnVuY3Rpb24gYXNzZXJ0ICh0ZXN0LCBtZXNzYWdlKSB7XG4gIGlmICghdGVzdCkgdGhyb3cgbmV3IEVycm9yKG1lc3NhZ2UgfHwgJ0ZhaWxlZCBhc3NlcnRpb24nKVxufVxuIiwiXCJ1c2Ugc3RyaWN0XCI7XG5jbGFzcyBGYVRyYWNlIHtcblx0LyoqXG5cdCAqXG5cdCAqIEBwYXJhbSBzdGFjayB7QXJyYXl9XG5cdCAqIEByZXR1cm4ge0FycmF5fVxuXHQgKiBAcHJpdmF0ZVxuXHQgKi9cblx0c3RhdGljIF9leHRyYWN0RnJvbVN0YWNrKHN0YWNrKSB7XG5cdFx0bGV0IHJlc3VsdCA9IFtdO1xuXHRcdGxldCBFeHByZXNzaW9uMSA9IG5ldyBSZWdFeHAoXCJeXFxcXHMrYXRcXFxccyguKylcXFxcc1xcXFwoKC4rKTooXFxcXGQrKTooXFxcXGQrKVxcXFwpJFwiKTtcblx0XHRsZXQgRXhwcmVzc2lvbjIgPSBuZXcgUmVnRXhwKFwiXlxcXFxzK2F0XFxcXHMoLispOihcXFxcZCspOihcXFxcZCspJFwiKTtcblx0XHRsZXQgRXhwcmVzc2lvbjMgPSBuZXcgUmVnRXhwKFwiXlxcXFxzK2F0XFxcXHMoLispJFwiKTtcblx0XHRzdGFjay5mb3JFYWNoKGZ1bmN0aW9uIChpdGVtKSB7XG5cdFx0XHRsZXQgTWF0Y2gxID0gRXhwcmVzc2lvbjEuZXhlYyhpdGVtKTtcblx0XHRcdGxldCBNYXRjaDIgPSBFeHByZXNzaW9uMi5leGVjKGl0ZW0pO1xuXHRcdFx0bGV0IE1hdGNoMyA9IEV4cHJlc3Npb24zLmV4ZWMoaXRlbSk7XG5cdFx0XHRpZiAoTWF0Y2gxKSB7XG5cdFx0XHRcdHJlc3VsdC5wdXNoKHtcblx0XHRcdFx0XHRtZXRob2Q6IE1hdGNoMVsxXSxcblx0XHRcdFx0XHRwYXRoOiBNYXRjaDFbMl0sXG5cdFx0XHRcdFx0bGluZTogTWF0Y2gxWzNdLFxuXHRcdFx0XHRcdGNvbHVtbjogTWF0Y2gxWzRdLFxuXHRcdFx0XHR9KTtcblx0XHRcdH0gZWxzZSBpZiAoTWF0Y2gyKSB7XG5cdFx0XHRcdHJlc3VsdC5wdXNoKHtcblx0XHRcdFx0XHRtZXRob2Q6IG51bGwsXG5cdFx0XHRcdFx0cGF0aDogTWF0Y2gyWzFdLFxuXHRcdFx0XHRcdGxpbmU6IE1hdGNoMlsyXSxcblx0XHRcdFx0XHRjb2x1bW46IE1hdGNoMlszXSxcblx0XHRcdFx0fSk7XG5cdFx0XHR9IGVsc2UgaWYgKE1hdGNoMykge1xuXHRcdFx0XHRyZXN1bHQucHVzaCh7XG5cdFx0XHRcdFx0bWV0aG9kOiBNYXRjaDNbMV0sXG5cdFx0XHRcdFx0cGF0aDogbnVsbCxcblx0XHRcdFx0XHRsaW5lOiBudWxsLFxuXHRcdFx0XHRcdGNvbHVtbjogbnVsbCxcblx0XHRcdFx0fSk7XG5cdFx0XHR9IGVsc2Uge1xuXHRcdFx0XHRjb25zb2xlLmVycm9yKGBjYW4ndCBwYXJzZSBzdGFjayBzdHJpbmc6ICR7c3RhY2t9YCk7XG5cdFx0XHRcdC8vIHRocm93IG5ldyBFcnJvcihgY2FuJ3QgcGFyc2Ugc3RhY2sgc3RyaW5nOiAke2l0ZW19YCk7XG5cdFx0XHR9XG5cdFx0fSk7XG5cdFx0cmV0dXJuIHJlc3VsdDtcblx0fVxuXG5cdC8qKlxuXHQgKlxuXHQgKiBAcGFyYW0gbGV2ZWwge251bWJlcnxudWxsfVxuXHQgKiBAcmV0dXJuIHtBcnJheXxPYmplY3R9XG5cdCAqL1xuXHRzdGF0aWMgdHJhY2UobGV2ZWwgPSBudWxsKSB7XG5cdFx0bGV0IHN0YWNrID0gbmV3IEVycm9yKClbXCJzdGFja1wiXTtcblx0XHRsZXQgZGF0YSA9IHN0YWNrLnNwbGl0KFwiXFxuXCIpO1xuXHRcdGRhdGEuc3BsaWNlKDAsIDIpO1xuXHRcdGxldCByZXN1bHQgPSBGYVRyYWNlLl9leHRyYWN0RnJvbVN0YWNrKGRhdGEpO1xuXHRcdGlmIChsZXZlbCAhPT0gbnVsbCkge1xuXHRcdFx0cmV0dXJuIHJlc3VsdFtsZXZlbF07XG5cdFx0fSBlbHNlIHtcblx0XHRcdHJldHVybiByZXN1bHQ7XG5cdFx0fVxuXHR9XG5cblx0LyoqXG5cdCAqXG5cdCAqIEBwYXJhbSBzdGFja1xuXHQgKiBAcGFyYW0gbGV2ZWwge251bWJlcnxudWxsfVxuXHQgKiBAcmV0dXJuIHtBcnJheXxPYmplY3R9XG5cdCAqL1xuXHRzdGF0aWMgc3RhY2soc3RhY2ssIGxldmVsID0gbnVsbCkge1xuXHRcdGxldCBkYXRhID0gc3RhY2suc3BsaXQoXCJcXG5cIik7XG5cdFx0ZGF0YS5zcGxpY2UoMCwgMSk7XG5cdFx0bGV0IHJlc3VsdCA9IEZhVHJhY2UuX2V4dHJhY3RGcm9tU3RhY2soZGF0YSk7XG5cdFx0aWYgKGxldmVsICE9PSBudWxsKSB7XG5cdFx0XHRyZXR1cm4gcmVzdWx0W2xldmVsXTtcblx0XHR9IGVsc2Uge1xuXHRcdFx0cmV0dXJuIHJlc3VsdDtcblx0XHR9XG5cdH1cblxuXHQvKipcblx0ICogQGRlcHJlY2F0ZWRcblx0ICogQHBhcmFtIHN0YWNrXG5cdCAqIEByZXR1cm4ge0FycmF5fVxuXHQgKi9cblx0Ly8gb2xkKHN0YWNrKSB7XG5cdC8vIFx0bGV0IHRleHQgPSBzdGFjay5zcGxpdChcIlxcblwiKTtcblx0Ly8gXHRsZXQgRXhwcmVzc2lvbk1ldGhvZCA9IG5ldyBSZWdFeHAoXCJeKC4rKSBcXFxcKCguKylcXFxcKSRcIik7XG5cdC8vIFx0bGV0IEV4cHJlc3Npb25TdHJpbmcgPSBuZXcgUmVnRXhwKFwiXiguKyk6KFxcXFxkKyk6KFxcXFxkKykkXCIpO1xuXHQvLyBcdGxldCByZXN1bHQgPSBbXTtcblx0Ly8gXHR0ZXh0LnNwbGljZSgwLCAxKTtcblx0Ly8gXHR0ZXh0LmZvckVhY2goZnVuY3Rpb24gKGl0ZW0pIHtcblx0Ly8gXHRcdGxldCB0cmFjZSA9IHtcblx0Ly8gXHRcdFx0bWV0aG9kOiBudWxsLFxuXHQvLyBcdFx0XHRwYXRoOiBudWxsLFxuXHQvLyBcdFx0XHRsaW5lOiBudWxsLFxuXHQvLyBcdFx0XHRjb2x1bW46IG51bGwsXG5cdC8vIFx0XHR9O1xuXHQvLyBcdFx0bGV0IHN0cmluZyA9IFwiXCI7XG5cdC8vIFx0XHRsZXQgbGluZSA9IGl0ZW0uc2xpY2UoaXRlbS5pbmRleE9mKFwiYXQgXCIpICsgMywgaXRlbS5sZW5ndGgpO1xuXHQvLyBcdFx0bGV0IE1hdGNoTWV0aG9kID0gRXhwcmVzc2lvbk1ldGhvZC5leGVjKGxpbmUpO1xuXHQvLyBcdFx0aWYgKE1hdGNoTWV0aG9kKSB7XG5cdC8vIFx0XHRcdHRyYWNlLm1ldGhvZCA9IE1hdGNoTWV0aG9kWzFdO1xuXHQvLyBcdFx0XHRzdHJpbmcgPSBNYXRjaE1ldGhvZFsyXTtcblx0Ly8gXHRcdH0gZWxzZSB7XG5cdC8vIFx0XHRcdHN0cmluZyA9IGxpbmU7XG5cdC8vIFx0XHR9XG5cdC8vIFx0XHRsZXQgTWF0Y2hTdHJpbmcgPSBFeHByZXNzaW9uU3RyaW5nLmV4ZWMoc3RyaW5nKTtcblx0Ly8gXHRcdGlmIChNYXRjaFN0cmluZykge1xuXHQvLyBcdFx0XHR0cmFjZS5wYXRoID0gTWF0Y2hTdHJpbmdbMV07XG5cdC8vIFx0XHRcdHRyYWNlLmxpbmUgPSBNYXRjaFN0cmluZ1syXTtcblx0Ly8gXHRcdFx0dHJhY2UuY29sdW1uID0gTWF0Y2hTdHJpbmdbM107XG5cdC8vIFx0XHR9IGVsc2Uge1xuXHQvLyBcdFx0XHR0cmFjZS5tZXRob2QgPSBzdHJpbmc7XG5cdC8vIFx0XHR9XG5cdC8vIFx0XHRyZXN1bHQucHVzaCh0cmFjZSk7XG5cdC8vIFx0fSk7XG5cdC8vIFx0cmV0dXJuIHJlc3VsdDtcblx0Ly8gfVxufVxuLyoqXG4gKlxuICogQHR5cGUge0ZhVHJhY2V9XG4gKi9cbm1vZHVsZS5leHBvcnRzID0gRmFUcmFjZTtcbiIsIlwidXNlIHN0cmljdFwiO1xuY29uc3QgRmFCZWF1dGlmeUNvbnNvbGUgPSByZXF1aXJlKFwiLi9jb25zb2xlXCIpO1xuY29uc3QgRkNIID0gcmVxdWlyZShcIi4uL2NvbnNvbGUvY29uc29sZS1oZWxwZXJcIik7XG5cbmNsYXNzIEZhQmVhdXRpZnlDb25zb2xlVHlwZSBleHRlbmRzIEZhQmVhdXRpZnlDb25zb2xlIHtcblx0d3JhcERhdGFLZXkoa2V5LCB0eXBlLCBsZW5ndGgsIGxldmVsKSB7XG5cdFx0bGV0IHRhYiA9IHRoaXMuZ2V0VGFiKGxldmVsKTtcblx0XHRsZXQgZGltZW5zaW9uID0gXCJcIjtcblx0XHRpZiAobGVuZ3RoKSB7XG5cdFx0XHRkaW1lbnNpb24gPSBgJHt0eXBlLmNhcGl0YWxpemUoKX0oJHtsZW5ndGh9KWBcblx0XHR9IGVsc2Uge1xuXHRcdFx0ZGltZW5zaW9uID0gdHlwZS5jYXBpdGFsaXplKCk7XG5cdFx0fVxuXHRcdHN3aXRjaCAodHlwZSkge1xuXHRcdFx0Ly8gY2FzZSBcImFycmF5XCI6XG5cdFx0XHQvLyBcdHJldHVybiBgJHt0YWJ9JHtGQ0guZWZmZWN0LmJvbGR9JHtrZXl9JHtGQ0guZWZmZWN0LnJlc2V0fSAke0ZDSC5lZmZlY3QuZGltfSR7RkNILmNvbG9yLmdyZWVufSR7ZGltZW5zaW9ufSR7RkNILmVmZmVjdC5yZXNldH06IGA7XG5cdFx0XHQvLyBjYXNlIFwib2JqZWN0XCI6XG5cdFx0XHQvLyBcdHJldHVybiBgJHt0YWJ9JHtGQ0guZWZmZWN0LmJvbGR9JHtrZXl9JHtGQ0guZWZmZWN0LnJlc2V0fSAke0ZDSC5lZmZlY3QuZGltfSR7RkNILmNvbG9yLmN5YW59JHtkaW1lbnNpb259JHtGQ0guZWZmZWN0LnJlc2V0fTogYDtcblx0XHRcdGNhc2UgXCJqc29uXCI6XG5cdFx0XHRcdHJldHVybiBgJHt0YWJ9JHtGQ0guZWZmZWN0LmJvbGR9JHtrZXl9JHtGQ0guZWZmZWN0LnJlc2V0fSAke0ZDSC5iZy5ncmVlbn0ke0ZDSC5jb2xvci53aGl0ZX0ke2RpbWVuc2lvbn0ke0ZDSC5lZmZlY3QucmVzZXR9OiBgO1xuXHRcdFx0Y2FzZSBcInhtbFwiOlxuXHRcdFx0XHRyZXR1cm4gYCR7dGFifSR7RkNILmVmZmVjdC5ib2xkfSR7a2V5fSR7RkNILmVmZmVjdC5yZXNldH0gJHtGQ0guYmcucmVkfSR7RkNILmNvbG9yLndoaXRlfSR7ZGltZW5zaW9ufSR7RkNILmVmZmVjdC5yZXNldH06IGA7XG5cdFx0XHRkZWZhdWx0OlxuXHRcdFx0XHRyZXR1cm4gYCR7dGFifSR7RkNILmVmZmVjdC5ib2xkfSR7a2V5fSR7RkNILmVmZmVjdC5yZXNldH0gJHtGQ0guZWZmZWN0LmRpbX0ke2RpbWVuc2lvbn0ke0ZDSC5lZmZlY3QucmVzZXR9OiBgO1xuXHRcdH1cblx0fVxuXG5cdHdyYXBEYXRhVmFsdWUoZGF0YSwgdHlwZSwgbGVuZ3RoLCBsZXZlbCkge1xuXHRcdGxldCB0YWIgPSB0aGlzLmdldFRhYihsZXZlbCk7XG5cdFx0bGV0IG5sID0gXCJcXG5cIjtcblx0XHRzd2l0Y2ggKHR5cGUpIHtcblx0XHRcdC8vIGNhc2UgXCJhcnJheVwiOlxuXHRcdFx0Ly8gXHRyZXR1cm4gYCR7RkNILmVmZmVjdC5kaW19JHtGQ0guY29sb3IuZ3JlZW59WyR7RkNILmVmZmVjdC5yZXNldH0ke25sfSR7ZGF0YX0ke3RhYn0ke0ZDSC5lZmZlY3QucmVzZXR9JHtGQ0guZWZmZWN0LmRpbX0ke0ZDSC5jb2xvci5ncmVlbn1dJHtGQ0guZWZmZWN0LnJlc2V0fWA7XG5cdFx0XHQvLyBjYXNlIFwib2JqZWN0XCI6XG5cdFx0XHQvLyBcdHJldHVybiBgJHtGQ0guZWZmZWN0LmRpbX0ke0ZDSC5jb2xvci5jeWFufXske0ZDSC5lZmZlY3QucmVzZXR9JHtubH0ke2RhdGF9JHt0YWJ9JHtGQ0guZWZmZWN0LnJlc2V0fSR7RkNILmVmZmVjdC5kaW19JHtGQ0guY29sb3IuY3lhbn19JHtGQ0guZWZmZWN0LnJlc2V0fWA7XG5cdFx0XHRjYXNlIFwianNvblwiOlxuXHRcdFx0XHRyZXR1cm4gYCR7RkNILmVmZmVjdC5kaW19eyR7RkNILmVmZmVjdC5yZXNldH0ke25sfSR7ZGF0YX0ke3RhYn0ke0ZDSC5lZmZlY3QucmVzZXR9JHtGQ0guZWZmZWN0LmRpbX19JHtGQ0guZWZmZWN0LnJlc2V0fWA7XG5cdFx0XHRjYXNlIFwieG1sXCI6XG5cdFx0XHRcdHJldHVybiBgJHtGQ0guZWZmZWN0LmRpbX17JHtGQ0guZWZmZWN0LnJlc2V0fSR7bmx9JHtkYXRhfSR7dGFifSR7RkNILmVmZmVjdC5yZXNldH0ke0ZDSC5lZmZlY3QuZGltfX0ke0ZDSC5lZmZlY3QucmVzZXR9YDtcblx0XHRcdGRlZmF1bHQ6XG5cdFx0XHRcdHJldHVybiBzdXBlci53cmFwRGF0YVZhbHVlKGRhdGEsIHR5cGUsIGxlbmd0aCwgbGV2ZWwpO1xuXHRcdH1cblx0fVxufVxuXG4vKipcbiAqXG4gKiBAdHlwZSB7RmFCZWF1dGlmeUNvbnNvbGVUeXBlfVxuICovXG5tb2R1bGUuZXhwb3J0cyA9IEZhQmVhdXRpZnlDb25zb2xlVHlwZTtcbiIsIlwidXNlIHN0cmljdFwiO1xuY29uc3QgRmFCZWF1dGlmeVdyYXAgPSByZXF1aXJlKFwiLi93cmFwXCIpO1xuY29uc3QgRkNIID0gcmVxdWlyZShcIi4uL2NvbnNvbGUvY29uc29sZS1oZWxwZXJcIik7XG5cbmNsYXNzIEZhQmVhdXRpZnlDb25zb2xlIGV4dGVuZHMgRmFCZWF1dGlmeVdyYXAge1xuXHR3cmFwRGF0YUtleShrZXksIHR5cGUsIGxlbmd0aCwgbGV2ZWwpIHtcblx0XHRyZXR1cm4gYCR7dGhpcy5nZXRUYWIobGV2ZWwpfSR7RkNILmVmZmVjdC5ib2xkfSR7RkNILmNvbG9yLndoaXRlfSR7a2V5fSR7RkNILmVmZmVjdC5yZXNldH06IGA7XG5cdH1cblxuXHR3cmFwRGF0YVZhbHVlKHZhbHVlLCB0eXBlLCBsZW5ndGgsIGxldmVsKSB7XG5cdFx0bGV0IHRhYiA9IHRoaXMuZ2V0VGFiKGxldmVsKTtcblx0XHRsZXQgbmwgPSBcIlxcblwiO1xuXHRcdHN3aXRjaCAodHlwZSkge1xuXHRcdFx0Y2FzZSBcImFycmF5XCI6XG5cdFx0XHRcdHJldHVybiBgJHtGQ0guZWZmZWN0LmRpbX0ke0ZDSC5jb2xvci53aGl0ZX1bJHtGQ0guZWZmZWN0LnJlc2V0fSR7bmx9JHt2YWx1ZX0ke3RhYn0ke0ZDSC5lZmZlY3QuZGltfSR7RkNILmNvbG9yLndoaXRlfV0ke0ZDSC5lZmZlY3QucmVzZXR9YDtcblx0XHRcdGNhc2UgXCJib29sXCI6XG5cdFx0XHRcdHJldHVybiBgJHtGQ0guZWZmZWN0LmJvbGR9JHt2YWx1ZSA9PT0gdHJ1ZSA/IEZDSC5jb2xvci5ncmVlbiA6IEZDSC5jb2xvci5yZWR9JHt2YWx1ZX0ke0ZDSC5lZmZlY3QucmVzZXR9YDtcblx0XHRcdGNhc2UgXCJidWZmZXJcIjpcblx0XHRcdFx0cmV0dXJuIGAke0ZDSC5lZmZlY3QuZGltfTwke0ZDSC5lZmZlY3QucmVzZXR9JHtGQ0guZWZmZWN0LmJvbGR9JHtGQ0guY29sb3IuYmx1ZX0ke3R5cGV9JHtGQ0guZWZmZWN0LnJlc2V0fSR7RkNILmVmZmVjdC5kaW19PiR7RkNILmVmZmVjdC5yZXNldH1gO1xuXHRcdFx0Y2FzZSBcImNpcmN1bGFyXCI6XG5cdFx0XHRcdHJldHVybiBgJHtGQ0guZWZmZWN0LmRpbX08JHtGQ0guZWZmZWN0LnJlc2V0fSR7RkNILmVmZmVjdC5ib2xkfSR7RkNILmNvbG9yLmN5YW59JHt0eXBlfSR7RkNILmVmZmVjdC5yZXNldH0ke0ZDSC5lZmZlY3QuZGltfT4ke0ZDSC5lZmZlY3QucmVzZXR9YDtcblx0XHRcdGNhc2UgXCJkYXRlXCI6XG5cdFx0XHRcdHJldHVybiBgJHtGQ0guY29sb3IueWVsbG93fSR7dmFsdWV9JHtGQ0guZWZmZWN0LnJlc2V0fWA7XG5cdFx0XHRjYXNlIFwiZmlsZVwiOlxuXHRcdFx0XHRyZXR1cm4gYCR7RkNILmVmZmVjdC5kaW19PCR7RkNILmVmZmVjdC5yZXNldH0ke0ZDSC5lZmZlY3QuYm9sZH0ke0ZDSC5jb2xvci5ibHVlfSR7dmFsdWV9JHtGQ0guZWZmZWN0LnJlc2V0fSR7RkNILmVmZmVjdC5kaW19PiR7RkNILmVmZmVjdC5yZXNldH1gO1xuXHRcdFx0Y2FzZSBcImZsb2F0XCI6XG5cdFx0XHRcdHJldHVybiBgJHtGQ0guY29sb3IucmVkfSR7dmFsdWV9JHtGQ0guZWZmZWN0LnJlc2V0fWA7XG5cdFx0XHRjYXNlIFwiZnVuY3Rpb25cIjpcblx0XHRcdFx0cmV0dXJuIGAke0ZDSC5jb2xvci5jeWFufSR7dmFsdWV9JHtGQ0guZWZmZWN0LnJlc2V0fWA7XG5cdFx0XHRjYXNlIFwianNvblwiOlxuXHRcdFx0XHRyZXR1cm4gYCR7RkNILmJnLmdyZWVufXske0ZDSC5lZmZlY3QucmVzZXR9JHtubH0ke3ZhbHVlfSR7dGFifSR7RkNILmJnLmdyZWVufX0ke0ZDSC5lZmZlY3QucmVzZXR9YDtcblx0XHRcdGNhc2UgXCJpbnRcIjpcblx0XHRcdFx0cmV0dXJuIGAke0ZDSC5jb2xvci5ncmVlbn0ke3ZhbHVlfSR7RkNILmVmZmVjdC5yZXNldH1gO1xuXHRcdFx0Y2FzZSBcIm1vbmdvSWRcIjpcblx0XHRcdFx0cmV0dXJuIGAke0ZDSC5jb2xvci53aGl0ZX08JHtGQ0guZWZmZWN0LnJlc2V0fSR7RkNILmVmZmVjdC5ib2xkfSR7RkNILmNvbG9yLndoaXRlfSR7dmFsdWV9JHtGQ0guZWZmZWN0LnJlc2V0fSR7RkNILmNvbG9yLndoaXRlfT4ke0ZDSC5lZmZlY3QucmVzZXR9YDtcblx0XHRcdGNhc2UgXCJudWxsXCI6XG5cdFx0XHRcdHJldHVybiBgJHtGQ0guZWZmZWN0LmJvbGR9JHtGQ0guY29sb3IuY3lhbn0ke3ZhbHVlfSR7RkNILmVmZmVjdC5yZXNldH1gO1xuXHRcdFx0Y2FzZSBcIm9iamVjdFwiOlxuXHRcdFx0XHRyZXR1cm4gYCR7RkNILmVmZmVjdC5kaW19JHtGQ0guY29sb3Iud2hpdGV9eyR7RkNILmVmZmVjdC5yZXNldH0ke25sfSR7dmFsdWV9JHt0YWJ9JHtGQ0guZWZmZWN0LmRpbX0ke0ZDSC5jb2xvci53aGl0ZX19JHtGQ0guZWZmZWN0LnJlc2V0fWA7XG5cdFx0XHRjYXNlIFwicmVnRXhwXCI6XG5cdFx0XHRcdHJldHVybiBgJHtGQ0guZWZmZWN0LmJvbGR9JHtGQ0guY29sb3IueWVsbG93fSR7dmFsdWV9JHtGQ0guZWZmZWN0LnJlc2V0fWA7XG5cdFx0XHRjYXNlIFwic3RyaW5nXCI6XG5cdFx0XHRcdHJldHVybiBgJHtGQ0guZWZmZWN0LmRpbX0ke0ZDSC5jb2xvci53aGl0ZX1cIiR7RkNILmVmZmVjdC5yZXNldH0ke0ZDSC5jb2xvci53aGl0ZX0ke3ZhbHVlfSR7RkNILmVmZmVjdC5yZXNldH0ke0ZDSC5lZmZlY3QuZGltfSR7RkNILmNvbG9yLndoaXRlfVwiJHtGQ0guZWZmZWN0LnJlc2V0fWA7XG5cdFx0XHRjYXNlIFwidW5kZWZpbmVkXCI6XG5cdFx0XHRcdHJldHVybiBgJHtGQ0guZWZmZWN0LmJvbGR9JHtGQ0guY29sb3IubWFnZW50YX0ke3ZhbHVlfSR7RkNILmVmZmVjdC5yZXNldH1gO1xuXHRcdFx0Y2FzZSBcInhtbFwiOlxuXHRcdFx0XHRyZXR1cm4gYCR7RkNILmJnLnJlZH17JHtGQ0guZWZmZWN0LnJlc2V0fSR7bmx9JHt2YWx1ZX0ke3RhYn0ke0ZDSC5iZy5yZWR9fSR7RkNILmVmZmVjdC5yZXNldH1gO1xuXHRcdFx0ZGVmYXVsdDpcblx0XHRcdFx0cmV0dXJuIGAke0ZDSC5iZy5tYWdlbnRhfS8qJHt0eXBlfSovJHtGQ0guZWZmZWN0LnJlc2V0fWA7XG5cdFx0fVxuXHR9XG5cblx0d3JhcEVycm9yKGRhdGEsIHR5cGUpIHtcblx0XHRzd2l0Y2ggKHR5cGUpIHtcblx0XHRcdGNhc2UgXCJuYW1lXCI6XG5cdFx0XHRcdHJldHVybiBgJHtGQ0guZWZmZWN0LnVuZGVyc2NvcmV9JHtGQ0guY29sb3Iud2hpdGV9JHtkYXRhfSR7RkNILmVmZmVjdC5yZXNldH06IGA7XG5cdFx0XHRcdC8vIHJldHVybiBcIlwiO1xuXHRcdFx0Y2FzZSBcIm1lc3NhZ2VcIjpcblx0XHRcdFx0cmV0dXJuIGAke0ZDSC5lZmZlY3QuYm9sZH0ke0ZDSC5lZmZlY3QudW5kZXJzY29yZX0ke0ZDSC5jb2xvci5yZWR9JHtkYXRhfSR7RkNILmVmZmVjdC5yZXNldH1gO1xuXHRcdFx0Y2FzZSBcIm1ldGhvZFwiOlxuXHRcdFx0XHRyZXR1cm4gYCR7RkNILmNvbG9yLndoaXRlfSR7ZGF0YX0ke0ZDSC5lZmZlY3QucmVzZXR9YDtcblx0XHRcdGNhc2UgXCJwYXRoXCI6XG5cdFx0XHRcdHJldHVybiBgJHtGQ0guZWZmZWN0LmRpbX0ke2RhdGF9JHtGQ0guZWZmZWN0LnJlc2V0fWA7XG5cdFx0XHRjYXNlIFwibGluZVwiOlxuXHRcdFx0XHRyZXR1cm4gYCR7RkNILmNvbG9yLmN5YW59JHtkYXRhfSR7RkNILmVmZmVjdC5yZXNldH1gO1xuXHRcdFx0Y2FzZSBcImNvbHVtblwiOlxuXHRcdFx0XHRyZXR1cm4gYCR7RkNILmNvbG9yLndoaXRlfSR7ZGF0YX0ke0ZDSC5lZmZlY3QucmVzZXR9YDtcblx0XHRcdGRlZmF1bHQ6XG5cdFx0XHRcdHJldHVybiBgJHtGQ0guYmcubWFnZW50YX0vKiR7ZGF0YX0qLyR7RkNILmVmZmVjdC5yZXNldH1gO1xuXHRcdH1cblx0fVxufVxuXG4vKipcbiAqXG4gKiBAdHlwZSB7RmFCZWF1dGlmeUNvbnNvbGV9XG4gKi9cbm1vZHVsZS5leHBvcnRzID0gRmFCZWF1dGlmeUNvbnNvbGU7XG4iLCJcInVzZSBzdHJpY3RcIjtcbmNvbnN0IEZhQmVhdXRpZnlXcmFwID0gcmVxdWlyZShcIi4vd3JhcFwiKTtcblxuY2xhc3MgRmFCZWF1dGlmeVdyYXBIdG1sIGV4dGVuZHMgRmFCZWF1dGlmeVdyYXAge1xuXHR3cmFwRGF0YUtleShrZXksIHR5cGUsIGxlbmd0aCwgbGV2ZWwpIHtcblx0XHRyZXR1cm4gYCR7dGhpcy5nZXRUYWIobGV2ZWwpfTxzcGFuIGNsYXNzPVwiZmEtYmVhdXRpZnkta2V5XCI+JHtrZXl9PC9zcGFuPjogYDtcblx0fVxuXG5cdHdyYXBEYXRhVmFsdWUoZGF0YSwgdHlwZSwgbGVuZ3RoLCBsZXZlbCkge1xuXHRcdGxldCB0YWIgPSB0aGlzLmdldFRhYihsZXZlbCk7XG5cdFx0bGV0IG5sID0gXCJcXG5cIjtcblx0XHRzd2l0Y2ggKHR5cGUpIHtcblx0XHRcdGNhc2UgXCJhcnJheVwiOlxuXHRcdFx0XHRyZXR1cm4gYFs8c3BhbiBjbGFzcz1cImZhLWJlYXV0aWZ5LWFycmF5XCI+JHtubH0ke2RhdGF9JHt0YWJ9XTwvc3Bhbj5gO1xuXHRcdFx0Y2FzZSBcImJvb2xcIjpcblx0XHRcdFx0Ly8gcmV0dXJuIGAke0ZDSC5lZmZlY3QuYm9sZH0ke2RhdGEgPT09IHRydWUgPyBGQ0guY29sb3IuZ3JlZW4gOiBGQ0guY29sb3IucmVkfSR7bmx9JHtkYXRhfSR7dGFifTwvc3Bhbj5gO1xuXHRcdFx0XHRyZXR1cm4gYDxzcGFuIGNsYXNzPVwiZmEtYmVhdXRpZnktJHt0eXBlfS0ke2RhdGEgPT09IHRydWUgPyBcInRydWVcIiA6IFwiZmFsc2VcIn1cIj4ke2RhdGF9PC9zcGFuPmA7XG5cdFx0XHRjYXNlIFwiYnVmZmVyXCI6XG5cdFx0XHRcdC8vIHJldHVybiBgJHtGQ0guZWZmZWN0LmJvbGR9JHtGQ0guY29sb3IuY3lhbn0ke25sfSR7ZGF0YX0ke3RhYn08L3NwYW4+YDtcblx0XHRcdFx0cmV0dXJuIGA8PHNwYW4gY2xhc3M9XCJmYS1iZWF1dGlmeS0ke3R5cGV9XCI+JHt0eXBlfTwvc3Bhbj4+YDtcblx0XHRcdGNhc2UgXCJjaXJjdWxhclwiOlxuXHRcdFx0XHQvLyByZXR1cm4gYCR7RkNILmVmZmVjdC5ib2xkfSR7RkNILmNvbG9yLmN5YW59JHtubH0ke2RhdGF9JHt0YWJ9PC9zcGFuPmA7XG5cdFx0XHRcdHJldHVybiBgPDxzcGFuIGNsYXNzPVwiZmEtYmVhdXRpZnktJHt0eXBlfVwiPiR7dHlwZX08L3NwYW4+PmA7XG5cdFx0XHRjYXNlIFwiZGF0ZVwiOlxuXHRcdFx0XHQvLyByZXR1cm4gYCR7RkNILmNvbG9yLnllbGxvd30ke25sfSR7ZGF0YX0ke3RhYn08L3NwYW4+YDtcblx0XHRcdFx0cmV0dXJuIGA8c3BhbiBjbGFzcz1cImZhLWJlYXV0aWZ5LSR7dHlwZX1cIj4ke2RhdGF9PC9zcGFuPmA7XG5cdFx0XHRjYXNlIFwiZmlsZVwiOlxuXHRcdFx0XHQvLyByZXR1cm4gYCR7RkNILmJnLmN5YW59ICR7bmx9JHtkYXRhfSR7dGFifSA8L3NwYW4+YDtcblx0XHRcdFx0cmV0dXJuIGA8PHNwYW4gY2xhc3M9XCJmYS1iZWF1dGlmeS1maWxlXCI+JHtkYXRhfTwvc3Bhbj4+YDtcblx0XHRcdGNhc2UgXCJmbG9hdFwiOlxuXHRcdFx0XHQvLyByZXR1cm4gYCR7RkNILmNvbG9yLnJlZH0ke25sfSR7ZGF0YX0ke3RhYn08L3NwYW4+YDtcblx0XHRcdFx0cmV0dXJuIGA8c3BhbiBjbGFzcz1cImZhLWJlYXV0aWZ5LSR7dHlwZX1cIj4ke2RhdGF9PC9zcGFuPmA7XG5cdFx0XHRjYXNlIFwiZnVuY3Rpb25cIjpcblx0XHRcdFx0Ly8gcmV0dXJuIGAke0ZDSC5jb2xvci5jeWFufSR7bmx9JHtkYXRhfSR7dGFifTwvc3Bhbj5gO1xuXHRcdFx0XHRyZXR1cm4gYDxzcGFuIGNsYXNzPVwiZmEtYmVhdXRpZnktJHt0eXBlfVwiPiR7ZGF0YX08L3NwYW4+YDtcblx0XHRcdGNhc2UgXCJqc29uXCI6XG5cdFx0XHRcdHJldHVybiBgPHNwYW4gY2xhc3M9XCJmYS1iZWF1dGlmeS0ke3R5cGV9XCI+eyR7bmx9JHtkYXRhfSR7dGFifX08L3NwYW4+YDtcblx0XHRcdGNhc2UgXCJpbnRcIjpcblx0XHRcdFx0Ly8gcmV0dXJuIGAke0ZDSC5jb2xvci5ncmVlbn0ke25sfSR7ZGF0YX0ke3RhYn08L3NwYW4+YDtcblx0XHRcdFx0cmV0dXJuIGA8c3BhbiBjbGFzcz1cImZhLWJlYXV0aWZ5LWludFwiPiR7ZGF0YX08L3NwYW4+YDtcblx0XHRcdGNhc2UgXCJtb25nb0lkXCI6XG5cdFx0XHRcdC8vIHJldHVybiBgJHtGQ0guYmcuYmx1ZX0gJHtubH0ke2RhdGF9JHt0YWJ9IDwvc3Bhbj5gO1xuXHRcdFx0XHRyZXR1cm4gYDw8c3BhbiBjbGFzcz1cImZhLWJlYXV0aWZ5LSR7dHlwZX1cIj4ke2RhdGF9PC9zcGFuPj5gO1xuXHRcdFx0Y2FzZSBcIm51bGxcIjpcblx0XHRcdFx0Ly8gcmV0dXJuIGAke0ZDSC5lZmZlY3QuYm9sZH0ke0ZDSC5jb2xvci53aGl0ZX0ke25sfSR7ZGF0YX0ke3RhYn08L3NwYW4+YDtcblx0XHRcdFx0cmV0dXJuIGA8c3BhbiBjbGFzcz1cImZhLWJlYXV0aWZ5LSR7dHlwZX1cIj4ke2RhdGF9PC9zcGFuPmA7XG5cdFx0XHRjYXNlIFwib2JqZWN0XCI6XG5cdFx0XHRcdHJldHVybiBgezxzcGFuIGNsYXNzPVwiZmEtYmVhdXRpZnktJHt0eXBlfVwiPiR7bmx9JHtkYXRhfSR7dGFifTwvc3Bhbj59YDtcblx0XHRcdGNhc2UgXCJyZWdFeHBcIjpcblx0XHRcdFx0Ly8gcmV0dXJuIGAke0ZDSC5lZmZlY3QuYm9sZH0ke0ZDSC5jb2xvci55ZWxsb3d9JHtubH0ke2RhdGF9JHt0YWJ9PC9zcGFuPmA7XG5cdFx0XHRcdHJldHVybiBgPHNwYW4gY2xhc3M9XCJmYS1iZWF1dGlmeS0ke3R5cGV9XCI+JHtkYXRhfTwvc3Bhbj5gO1xuXHRcdFx0Y2FzZSBcInN0cmluZ1wiOlxuXHRcdFx0XHQvLyByZXR1cm4gYCR7RkNILmNvbG9yLndoaXRlfSR7bmx9JHtkYXRhfSR7dGFifTwvc3Bhbj4tLT5gO1xuXHRcdFx0XHRyZXR1cm4gYFwiPHNwYW4gY2xhc3M9XCJmYS1iZWF1dGlmeS0ke3R5cGV9XCI+JHtkYXRhfTwvc3Bhbj5cImA7XG5cdFx0XHRjYXNlIFwidW5kZWZpbmVkXCI6XG5cdFx0XHRcdC8vIHJldHVybiBgJHtGQ0guZWZmZWN0LmJvbGR9JHtGQ0guY29sb3IubWFnZW50YX0ke25sfSR7ZGF0YX0ke3RhYn08L3NwYW4+YDtcblx0XHRcdFx0cmV0dXJuIGA8c3BhbiBjbGFzcz1cImZhLWJlYXV0aWZ5LSR7dHlwZX1cIj4ke2RhdGF9PC9zcGFuPmA7XG5cdFx0XHRjYXNlIFwieG1sXCI6XG5cdFx0XHRcdHJldHVybiBgPHNwYW4gY2xhc3M9XCJmYS1iZWF1dGlmeS0ke3R5cGV9XCI+eyR7bmx9JHtkYXRhfSR7dGFifX08L3NwYW4+YDtcblx0XHRcdGRlZmF1bHQ6XG5cdFx0XHRcdC8vIHJldHVybiBgJHtGQ0guYmcubWFnZW50YX0gJHtubH0ke2RhdGF9JHt0YWJ9IDwvc3Bhbj5gO1xuXHRcdFx0XHRyZXR1cm4gYDxzcGFuIGNsYXNzPVwiZmEtYmVhdXRpZnktZGVmYXVsdFwiPi8qJHtkYXRhfSovPC9zcGFuPmA7XG5cdFx0fVxuXHR9XG59XG5cbm1vZHVsZS5leHBvcnRzID0gRmFCZWF1dGlmeVdyYXBIdG1sO1xuIiwiXCJ1c2Ugc3RyaWN0XCI7XG4vKm5vZGUqL1xuY29uc3QgQnVmZmVyID0gcmVxdWlyZShcImJ1ZmZlclwiKS5CdWZmZXI7XG5jb25zdCBGYXN0WG1sUGFyc2VyID0gcmVxdWlyZShcImZhc3QteG1sLXBhcnNlclwiKTtcbmNvbnN0IEZpbGVUeXBlID0gcmVxdWlyZShcImZpbGUtdHlwZVwiKTtcblxuLyoqXG4gKlxuICogQHBhcmFtIGRhdGFcbiAqIEByZXR1cm5zIHtib29sZWFufVxuICovXG5mdW5jdGlvbiBpc0pzb24oZGF0YSkge1xuXHR0cnkge1xuXHRcdGxldCBqc29uID0gSlNPTi5wYXJzZShkYXRhKTtcblx0XHRyZXR1cm4gdHlwZW9mIGpzb24gPT09IFwib2JqZWN0XCIgJiYganNvbiAhPT0gbnVsbDtcblx0fSBjYXRjaCAoZSkge1xuXHRcdHJldHVybiBmYWxzZTtcblx0fVxuXHQvLyBpZiAoL15bXFxdLDp7fVxcc10qJC8udGVzdChqc29uLnJlcGxhY2UoL1xcXFxbXCJcXFxcXFwvYmZucnR1XS9nLCAnQCcpLnJlcGxhY2UoL1wiW15cIlxcXFxcXG5cXHJdKlwifHRydWV8ZmFsc2V8bnVsbHwtP1xcZCsoPzpcXC5cXGQqKT8oPzpbZUVdWytcXC1dP1xcZCspPy9nLCAnXScpLnJlcGxhY2UoLyg/Ol58OnwsKSg/OlxccypcXFspKy9nLCAnJykpKSB7XG5cdC8vIFx0cmV0dXJuIGZhbHNlO1xuXHQvLyB9IGVsc2Uge1xuXHQvLyBcdHJldHVybiBmYWxzZTtcblx0Ly8gfVxufVxuXG4vKipcbiAqXG4gKiBAcGFyYW0gbW9uZ29JZFxuICogQHJldHVybnMge2Jvb2xlYW59XG4gKi9cbmZ1bmN0aW9uIGlzTW9uZ29JZChtb25nb0lkKSB7XG5cdHRyeSB7XG5cdFx0cmV0dXJuIG5ldyBSZWdFeHAoXCJeWzAtOWEtZkEtRl17MjR9JFwiKS50ZXN0KG1vbmdvSWQudG9TdHJpbmcoKSk7XG5cdH0gY2F0Y2ggKGUpIHtcblx0XHRyZXR1cm4gZmFsc2U7XG5cdH1cbn1cblxuLyoqXG4gKlxuICogQHBhcmFtIHhtbFxuICogQHJldHVybnMge2Jvb2xlYW59XG4gKi9cbmZ1bmN0aW9uIGlzWG1sKHhtbCkge1xuXHR0cnkge1xuXHRcdHJldHVybiBGYXN0WG1sUGFyc2VyLnZhbGlkYXRlKHhtbCkgPT09IHRydWU7XG5cdH0gY2F0Y2ggKGUpIHtcblx0XHRyZXR1cm4gZmFsc2U7XG5cdH1cbn1cblxuZnVuY3Rpb24gaXNDaXJjdWxhcihvYmplY3QsIGNpcmN1bGFyKSB7XG5cdGlmIChvYmplY3QgJiYgdHlwZW9mIG9iamVjdCA9PT0gXCJvYmplY3RcIikge1xuXHRcdGlmIChjaXJjdWxhci5pbmRleE9mKG9iamVjdCkgIT09IC0xKSB7XG5cdFx0XHRyZXR1cm4gdHJ1ZTtcblx0XHR9XG5cdFx0Y2lyY3VsYXIucHVzaChvYmplY3QpO1xuXHRcdGZvciAobGV0IGtleSBpbiBvYmplY3QpIHtcblx0XHRcdC8vIGlmIChvYmplY3QuaGFzT3duUHJvcGVydHkoa2V5KSAmJiBpc0NpcmN1bGFyKG9iamVjdFtrZXldLCBjaXJjdWxhcikpIHtcblx0XHRcdGlmIChvYmplY3Rba2V5XSAmJiBpc0NpcmN1bGFyKG9iamVjdFtrZXldLCBjaXJjdWxhcikpIHtcblx0XHRcdFx0cmV0dXJuIHRydWU7XG5cdFx0XHR9XG5cdFx0fVxuXHR9XG5cdHJldHVybiBmYWxzZTtcbn1cblxuZnVuY3Rpb24gZ2V0VHlwZShkYXRhKSB7XG5cdGlmIChkYXRhID09PSBudWxsKSB7XG5cdFx0cmV0dXJuIFwibnVsbFwiO1xuXHR9IGVsc2UgaWYgKEFycmF5LmlzQXJyYXkoZGF0YSkpIHtcblx0XHRyZXR1cm4gXCJhcnJheVwiO1xuXHR9IGVsc2UgaWYgKHR5cGVvZiBkYXRhID09PSBcImJvb2xlYW5cIikge1xuXHRcdHJldHVybiBcImJvb2xcIjtcblx0fSBlbHNlIGlmICh0eXBlb2YgZGF0YSA9PT0gJ251bWJlcicgJiYgZGF0YSAlIDEgPT09IDApIHtcblx0XHRyZXR1cm4gXCJpbnRcIjtcblx0fSBlbHNlIGlmICh0eXBlb2YgZGF0YSA9PT0gXCJudW1iZXJcIiAmJiBkYXRhICUgMSAhPT0gMCkge1xuXHRcdHJldHVybiBcImZsb2F0XCI7XG5cdH0gZWxzZSBpZiAoZGF0YSBpbnN0YW5jZW9mIERhdGUpIHtcblx0XHRyZXR1cm4gXCJkYXRlXCI7XG5cdH0gZWxzZSBpZiAodHlwZW9mIGRhdGEgPT09IFwiZnVuY3Rpb25cIikgey8vIWlzTmFOKERhdGUucGFyc2UoZGF0YSkpXG5cdFx0cmV0dXJuIFwiZnVuY3Rpb25cIjtcblx0fSBlbHNlIGlmIChkYXRhIGluc3RhbmNlb2YgRXJyb3IpIHtcblx0XHRyZXR1cm4gXCJlcnJvclwiO1xuXHR9IGVsc2UgaWYgKHR5cGVvZiBkYXRhID09PSBcIm9iamVjdFwiKSB7XG5cdFx0aWYgKGlzTW9uZ29JZChkYXRhKSkge1xuXHRcdFx0cmV0dXJuIFwibW9uZ29JZFwiO1xuXHRcdH0gZWxzZSBpZiAoZGF0YSBpbnN0YW5jZW9mIFJlZ0V4cCkge1xuXHRcdFx0cmV0dXJuIFwicmVnRXhwXCI7XG5cdFx0fSBlbHNlIGlmIChkYXRhLmJ5dGVMZW5ndGgpIHtcblx0XHRcdGlmIChGaWxlVHlwZShkYXRhKSkge1xuXHRcdFx0XHRyZXR1cm4gXCJmaWxlXCI7XG5cdFx0XHR9IGVsc2Uge1xuXHRcdFx0XHRyZXR1cm4gXCJidWZmZXJcIjtcblx0XHRcdH1cblx0XHR9IGVsc2Uge1xuXHRcdFx0cmV0dXJuIFwib2JqZWN0XCI7XG5cdFx0fVxuXHR9IGVsc2UgaWYgKHR5cGVvZiBkYXRhID09PSBcInN0cmluZ1wiKSB7XG5cdFx0aWYgKGlzSnNvbihkYXRhKSkge1xuXHRcdFx0cmV0dXJuIFwianNvblwiO1xuXHRcdH0gZWxzZSBpZiAoaXNYbWwoZGF0YSkpIHtcblx0XHRcdHJldHVybiBcInhtbFwiO1xuXHRcdH0gZWxzZSBpZiAoRmlsZVR5cGUoQnVmZmVyKGRhdGEsIFwiYmFzZTY0XCIpKSkge1xuXHRcdFx0cmV0dXJuIFwiZmlsZVwiO1xuXHRcdH0gZWxzZSB7XG5cdFx0XHRyZXR1cm4gXCJzdHJpbmdcIjtcblx0XHR9XG5cdH0gZWxzZSB7XG5cdFx0cmV0dXJuIFwidW5kZWZpbmVkXCI7XG5cdH1cbn1cblxuZnVuY3Rpb24gZ2V0TGVuZ3RoKGRhdGEsIHR5cGUpIHtcblx0aWYgKHR5cGUgPT09IFwiYXJyYXlcIikge1xuXHRcdHJldHVybiBkYXRhLmxlbmd0aDtcblx0fSBlbHNlIGlmICh0eXBlID09PSBcImJ1ZmZlclwiKSB7XG5cdFx0cmV0dXJuIGRhdGEuYnl0ZUxlbmd0aDtcblx0fSBlbHNlIGlmICh0eXBlID09PSBcImZpbGVcIikge1xuXHRcdHJldHVybiBkYXRhLmJ5dGVMZW5ndGggPyBkYXRhLmJ5dGVMZW5ndGggOiBCdWZmZXIoZGF0YSwgXCJiYXNlNjRcIikuYnl0ZUxlbmd0aDtcblx0fSBlbHNlIGlmICh0eXBlID09PSBcImZ1bmN0aW9uXCIpIHtcblx0XHRyZXR1cm4gZGF0YS50b1N0cmluZygpLmxlbmd0aDtcblx0fSBlbHNlIGlmICh0eXBlID09PSBcImpzb25cIikge1xuXHRcdHJldHVybiBkYXRhLmxlbmd0aDtcblx0fSBlbHNlIGlmICh0eXBlID09PSBcIm9iamVjdFwiKSB7XG5cdFx0cmV0dXJuIE9iamVjdC5rZXlzKGRhdGEpLmxlbmd0aDtcblx0fSBlbHNlIGlmICh0eXBlID09PSBcInN0cmluZ1wiKSB7XG5cdFx0cmV0dXJuIGRhdGEubGVuZ3RoO1xuXHR9IGVsc2UgaWYgKHR5cGUgPT09IFwieG1sXCIpIHtcblx0XHRyZXR1cm4gZGF0YS5sZW5ndGg7XG5cdH0gZWxzZSB7XG5cdFx0cmV0dXJuIG51bGw7XG5cdH1cbn1cblxuZnVuY3Rpb24gcGFyc2VPYmplY3QoZGF0YSwgdHlwZSkge1xuXHQvLyBjb25zb2xlLndyaXRlKFwiUEFSU0VcIiwgdHlwZSk7XG5cdGlmICh0eXBlID09PSBcImpzb25cIikge1xuXHRcdHJldHVybiBKU09OLnBhcnNlKGRhdGEpO1xuXHR9IGVsc2UgaWYgKHR5cGUgPT09IFwieG1sXCIpIHtcblx0XHRyZXR1cm4gRmFzdFhtbFBhcnNlci5wYXJzZShkYXRhLCB7fSk7XG5cdH0gZWxzZSB7XG5cdFx0cmV0dXJuIGRhdGE7XG5cdH1cbn1cblxuZnVuY3Rpb24gYmVhdXRpZnlPYmplY3QoZGF0YSwgd3JhcHBlciwgbGV2ZWwpIHtcblx0bGV0IGNpcmN1bGFyID0gW107XG5cdGxldCBubCA9ICdcXG4nO1xuXHRsZXQgb2JqZWN0ID0gcGFyc2VPYmplY3QoZGF0YSwgZ2V0VHlwZShkYXRhKSk7XG5cdGxldCByZXN1bHQgPSBcIlwiO1xuXHRmb3IgKGxldCBrZXlzID0gT2JqZWN0LmtleXMob2JqZWN0KSwgaSA9IDAsIGVuZCA9IGtleXMubGVuZ3RoIC0gMTsgaSA8PSBlbmQ7IGkrKykge1xuXHRcdGxldCBpdGVtID0gb2JqZWN0W2tleXNbaV1dO1xuXHRcdGxldCBpdGVtVHlwZSA9IGdldFR5cGUoaXRlbSk7XG5cdFx0bGV0IGl0ZW1MZW5ndGggPSBnZXRMZW5ndGgoaXRlbSwgaXRlbVR5cGUpO1xuXHRcdGxldCBrZXkgPSB3cmFwcGVyLndyYXBEYXRhS2V5KGtleXNbaV0sIGl0ZW1UeXBlLCBpdGVtTGVuZ3RoLCBsZXZlbCk7XG5cdFx0bGV0IHZhbHVlID0gaXNDaXJjdWxhcihpdGVtLCBjaXJjdWxhcikgPyB3cmFwcGVyLmNpcmN1bGFyKGl0ZW0sIGxldmVsKSA6IGJlYXV0aWZ5KGl0ZW0sIHdyYXBwZXIsIGxldmVsKTtcblx0XHRpZiAoaSA9PT0gMCkge1xuXHRcdFx0cmVzdWx0ICs9IGAke2tleX0ke3ZhbHVlfSwke25sfWA7XG5cdFx0fSBlbHNlIGlmIChpID09PSBlbmQpIHtcblx0XHRcdHJlc3VsdCArPSBgJHtrZXl9JHt2YWx1ZX0ke25sfWA7XG5cdFx0fSBlbHNlIHtcblx0XHRcdHJlc3VsdCArPSBgJHtrZXl9JHt2YWx1ZX0sJHtubH1gO1xuXHRcdH1cblx0fVxuXHRyZXR1cm4gcmVzdWx0O1xufVxuXG5mdW5jdGlvbiBiZWF1dGlmeShkYXRhLCB3cmFwcGVyLCBsZXZlbCA9IDApIHtcblx0c3dpdGNoIChnZXRUeXBlKGRhdGEpKSB7XG5cdFx0Y2FzZSBcImFycmF5XCI6XG5cdFx0XHRyZXR1cm4gd3JhcHBlci5hcnJheShiZWF1dGlmeU9iamVjdChkYXRhLCB3cmFwcGVyLCBsZXZlbCArIDEpLCBsZXZlbCk7XG5cdFx0Y2FzZSBcImJvb2xcIjpcblx0XHRcdHJldHVybiB3cmFwcGVyLmJvb2woZGF0YSwgbGV2ZWwpO1xuXHRcdGNhc2UgXCJidWZmZXJcIjpcblx0XHRcdHJldHVybiB3cmFwcGVyLmJ1ZmZlcihkYXRhLCBsZXZlbCk7XG5cdFx0Y2FzZSBcImRhdGVcIjpcblx0XHRcdHJldHVybiB3cmFwcGVyLmRhdGUoZGF0YSwgbGV2ZWwpO1xuXHRcdGNhc2UgXCJlcnJvclwiOlxuXHRcdFx0cmV0dXJuIHdyYXBwZXIuZXJyb3IoZGF0YSwgbGV2ZWwgKyAxKTtcblx0XHRjYXNlIFwiZmlsZVwiOlxuXHRcdFx0cmV0dXJuIHdyYXBwZXIuZmlsZShkYXRhLCBsZXZlbCk7XG5cdFx0Y2FzZSBcImZsb2F0XCI6XG5cdFx0XHRyZXR1cm4gd3JhcHBlci5mbG9hdChkYXRhLCBsZXZlbCk7XG5cdFx0Y2FzZSBcImZ1bmN0aW9uXCI6XG5cdFx0XHRyZXR1cm4gd3JhcHBlci5mdW5jdGlvbihkYXRhLCBsZXZlbCArIDEpO1xuXHRcdGNhc2UgXCJqc29uXCI6XG5cdFx0XHRyZXR1cm4gd3JhcHBlci5qc29uKGJlYXV0aWZ5T2JqZWN0KGRhdGEsIHdyYXBwZXIsIGxldmVsICsgMSksIGxldmVsKTtcblx0XHRjYXNlIFwiaW50XCI6XG5cdFx0XHRyZXR1cm4gd3JhcHBlci5pbnQoZGF0YSwgbGV2ZWwpO1xuXHRcdGNhc2UgXCJtb25nb0lkXCI6XG5cdFx0XHRyZXR1cm4gd3JhcHBlci5tb25nb0lkKGRhdGEsIGxldmVsKTtcblx0XHRjYXNlIFwibnVsbFwiOlxuXHRcdFx0cmV0dXJuIHdyYXBwZXIubnVsbChkYXRhLCBsZXZlbCk7XG5cdFx0Y2FzZSBcIm9iamVjdFwiOlxuXHRcdFx0cmV0dXJuIHdyYXBwZXIub2JqZWN0KGJlYXV0aWZ5T2JqZWN0KGRhdGEsIHdyYXBwZXIsIGxldmVsICsgMSksIGxldmVsKTtcblx0XHRjYXNlIFwicmVnRXhwXCI6XG5cdFx0XHRyZXR1cm4gd3JhcHBlci5yZWdFeHAoZGF0YS50b1N0cmluZygpLCBsZXZlbCk7XG5cdFx0Y2FzZSBcInN0cmluZ1wiOlxuXHRcdFx0cmV0dXJuIHdyYXBwZXIuc3RyaW5nKGRhdGEsIGxldmVsICsgMSk7XG5cdFx0Y2FzZSBcInVuZGVmaW5lZFwiOlxuXHRcdFx0cmV0dXJuIHdyYXBwZXIudW5kZWZpbmVkKGRhdGEsIGxldmVsKTtcblx0XHRjYXNlIFwieG1sXCI6XG5cdFx0XHRyZXR1cm4gd3JhcHBlci54bWwoYmVhdXRpZnlPYmplY3QoZGF0YSwgd3JhcHBlciwgbGV2ZWwgKyAxKSwgbGV2ZWwpO1xuXHRcdGRlZmF1bHQ6XG5cdFx0XHRyZXR1cm4gd3JhcHBlci5kZWZhdWx0KGRhdGEpO1xuXHR9XG59XG5cbmNvbnN0IEZhQmVhdXRpZnlQbGFpbiA9IHJlcXVpcmUoXCIuL3BsYWluXCIpO1xuY29uc3QgRmFCZWF1dGlmeUNvbnNvbGUgPSByZXF1aXJlKFwiLi9jb25zb2xlXCIpO1xuY29uc3QgRmFCZWF1dGlmeUNvbnNvbGVUeXBlID0gcmVxdWlyZShcIi4vY29uc29sZS10eXBlXCIpO1xuY29uc3QgRmFCZWF1dGlmeUh0bWwgPSByZXF1aXJlKFwiLi9odG1sXCIpO1xuY29uc3QgRmFCZWF1dGlmeUh0bWxUeXBlID0gcmVxdWlyZShcIi4vaHRtbFwiKTtcbi8qbmV3Ki9cbmV4cG9ydHMucGxhaW4gPSBmdW5jdGlvbiAoZGF0YSkge1xuXHRyZXR1cm4gYmVhdXRpZnkoZGF0YSwgbmV3IEZhQmVhdXRpZnlQbGFpbigpKTtcbn07XG5leHBvcnRzLmNvbnNvbGUgPSBmdW5jdGlvbiAoZGF0YSwgbGV2ZWwgPSAwKSB7XG5cdHJldHVybiBiZWF1dGlmeShkYXRhLCBuZXcgRmFCZWF1dGlmeUNvbnNvbGUoKSwgbGV2ZWwpO1xufTtcbmV4cG9ydHMuY29uc29sZVR5cGUgPSBmdW5jdGlvbiAoZGF0YSkge1xuXHRyZXR1cm4gYmVhdXRpZnkoZGF0YSwgbmV3IEZhQmVhdXRpZnlDb25zb2xlVHlwZSgpKTtcbn07XG5leHBvcnRzLmh0bWwgPSBmdW5jdGlvbiAoZGF0YSkge1xuXHRyZXR1cm4gYDxkaXYgY2xhc3M9XCJmYS1iZWF1dGlmeVwiPiR7YmVhdXRpZnkoZGF0YSwgbmV3IEZhQmVhdXRpZnlIdG1sKCkpfTwvZGl2PmA7XG59O1xuZXhwb3J0cy5odG1sVHlwZSA9IGZ1bmN0aW9uIChkYXRhKSB7XG5cdHJldHVybiBiZWF1dGlmeShkYXRhLCBuZXcgRmFCZWF1dGlmeUh0bWxUeXBlKCkpO1xufTtcbiIsIlwidXNlIHN0cmljdFwiO1xuY29uc3QgRmFCZWF1dGlmeVdyYXAgPSByZXF1aXJlKFwiLi93cmFwXCIpO1xuXG5jbGFzcyBGYUJlYXV0aWZ5V3JhcENvbnNvbGUgZXh0ZW5kcyBGYUJlYXV0aWZ5V3JhcCB7XG59XG5cbm1vZHVsZS5leHBvcnRzID0gRmFCZWF1dGlmeVdyYXBDb25zb2xlO1xuIiwiXCJ1c2Ugc3RyaWN0XCI7XG4vKm5vZGVqcyovXG5jb25zdCBCdWZmZXIgPSByZXF1aXJlKFwiYnVmZmVyXCIpLkJ1ZmZlcjtcbmNvbnN0IEZpbGVUeXBlID0gcmVxdWlyZShcImZpbGUtdHlwZVwiKTtcbi8qZmEqL1xuY29uc3QgRmFUcmFjZSA9IHJlcXVpcmUoXCJmYS1ub2RlanMvYmFzZS90cmFjZVwiKTtcbi8vIGNvbnN0IEJlYXV0aWZ5ID0gcmVxdWlyZShcImZhLW5vZGVqcy9iZWF1dGlmeS9pbmRleFwiKTtcbi8vIGNvbnN0IEJlYXV0aWZ5UGxhaW4gPSByZXF1aXJlKFwiZmEtbm9kZWpzL2JlYXV0aWZ5L3BsYWluXCIpO1xuY2xhc3MgRmFCZWF1dGlmeVdyYXAge1xuXHRnZXRUYWIobGV2ZWwpIHtcblx0XHRsZXQgdGFiID0gYCAgICBgO1xuXHRcdGxldCByZXN1bHQgPSBcIlwiO1xuXHRcdGxldCBjb3VudCA9IGxldmVsID8gbGV2ZWwgOiAwO1xuXHRcdGZvciAobGV0IGkgPSAwOyBpIDw9IGNvdW50IC0gMTsgaSsrKSB7XG5cdFx0XHRyZXN1bHQgKz0gdGFiO1xuXHRcdH1cblx0XHRyZXR1cm4gcmVzdWx0O1xuXHR9O1xuXG5cdHdyYXBEYXRhS2V5KGtleSwgdHlwZSwgbGVuZ3RoLCBsZXZlbCkge1xuXHRcdGxldCB0YWIgPSB0aGlzLmdldFRhYihsZXZlbCk7XG5cdFx0cmV0dXJuIGAke3RhYn0ke2tleX06IGA7XG5cdH1cblxuXHR3cmFwRGF0YVZhbHVlKHZhbHVlLCB0eXBlLCBsZW5ndGgsIGxldmVsKSB7XG5cdFx0bGV0IHRhYiA9IHRoaXMuZ2V0VGFiKGxldmVsKTtcblx0XHRsZXQgbmwgPSBcIlxcblwiO1xuXHRcdHN3aXRjaCAodHlwZSkge1xuXHRcdFx0Y2FzZSBcImFycmF5XCI6XG5cdFx0XHRcdHJldHVybiBgWyR7bmx9JHt2YWx1ZX0ke3RhYn1dYDtcblx0XHRcdGNhc2UgXCJib29sXCI6XG5cdFx0XHRcdHJldHVybiB2YWx1ZTtcblx0XHRcdGNhc2UgXCJidWZmZXJcIjpcblx0XHRcdFx0cmV0dXJuIGA8JHt0eXBlfT5gO1xuXHRcdFx0Y2FzZSBcImNpcmN1bGFyXCI6XG5cdFx0XHRcdHJldHVybiBgPCR7dHlwZX0+YDtcblx0XHRcdGNhc2UgXCJkYXRlXCI6XG5cdFx0XHRcdHJldHVybiB2YWx1ZTtcblx0XHRcdGNhc2UgXCJmaWxlXCI6XG5cdFx0XHRcdHJldHVybiBgPCR7dmFsdWV9PmA7XG5cdFx0XHRjYXNlIFwiZmxvYXRcIjpcblx0XHRcdFx0cmV0dXJuIHZhbHVlO1xuXHRcdFx0Y2FzZSBcImZ1bmN0aW9uXCI6XG5cdFx0XHRcdHJldHVybiB2YWx1ZTtcblx0XHRcdGNhc2UgXCJqc29uXCI6XG5cdFx0XHRcdHJldHVybiBgeyR7bmx9JHt2YWx1ZX0ke3RhYn19YDtcblx0XHRcdGNhc2UgXCJpbnRcIjpcblx0XHRcdFx0cmV0dXJuIHZhbHVlO1xuXHRcdFx0Y2FzZSBcIm1vbmdvSWRcIjpcblx0XHRcdFx0cmV0dXJuIGA8JHt2YWx1ZX0+YDtcblx0XHRcdGNhc2UgXCJudWxsXCI6XG5cdFx0XHRcdHJldHVybiB2YWx1ZTtcblx0XHRcdGNhc2UgXCJvYmplY3RcIjpcblx0XHRcdFx0cmV0dXJuIGB7JHtubH0ke3ZhbHVlfSR7dGFifX1gO1xuXHRcdFx0Y2FzZSBcInJlZ0V4cFwiOlxuXHRcdFx0XHRyZXR1cm4gdmFsdWU7XG5cdFx0XHRjYXNlIFwic3RyaW5nXCI6XG5cdFx0XHRcdHJldHVybiBgXCIke3ZhbHVlfVwiYDtcblx0XHRcdGNhc2UgXCJ1bmRlZmluZWRcIjpcblx0XHRcdFx0cmV0dXJuIHZhbHVlO1xuXHRcdFx0Y2FzZSBcInhtbFwiOlxuXHRcdFx0XHRyZXR1cm4gYHske25sfSR7dmFsdWV9JHt0YWJ9fWA7XG5cdFx0XHRkZWZhdWx0OlxuXHRcdFx0XHRyZXR1cm4gYC8qJHt2YWx1ZX0qL2A7XG5cdFx0fVxuXHR9XG5cblx0d3JhcEVycm9yKGRhdGEsIHR5cGUpIHtcblx0XHRsZXQgcmVzdWx0ID0gXCJcIjtcblx0XHRzd2l0Y2ggKHR5cGUpIHtcblx0XHRcdGNhc2UgXCJuYW1lXCI6XG5cdFx0XHRcdHJlc3VsdCA9IGAke2RhdGF9OiBgO1xuXHRcdFx0XHRicmVhaztcblx0XHRcdGNhc2UgXCJtZXNzYWdlXCI6XG5cdFx0XHRcdHJlc3VsdCA9IGAke2RhdGF9YDtcblx0XHRcdFx0YnJlYWs7XG5cdFx0XHRjYXNlIFwibWV0aG9kXCI6XG5cdFx0XHRcdHJlc3VsdCA9IGAke2RhdGF9YDtcblx0XHRcdFx0YnJlYWs7XG5cdFx0XHRjYXNlIFwicGF0aFwiOlxuXHRcdFx0XHRyZXN1bHQgPSBgJHtkYXRhfWA7XG5cdFx0XHRcdGJyZWFrO1xuXHRcdFx0Y2FzZSBcImxpbmVcIjpcblx0XHRcdFx0cmVzdWx0ID0gYCR7ZGF0YX1gO1xuXHRcdFx0XHRicmVhaztcblx0XHRcdGNhc2UgXCJjb2x1bW5cIjpcblx0XHRcdFx0cmVzdWx0ID0gYCR7ZGF0YX1gO1xuXHRcdFx0XHRicmVhaztcblx0XHRcdGRlZmF1bHQ6XG5cdFx0XHRcdHJlc3VsdCA9IGAke2RhdGF9YDtcblx0XHR9XG5cdFx0cmV0dXJuIHJlc3VsdDtcblx0fVxuXG5cdHdyYXBFcnJvclRyYWNlKHRyYWNlLCBsZXZlbCkge1xuXHRcdGxldCByZXN1bHQgPSBbXTtcblx0XHQvLyBjb25zb2xlLndhcm4odHJhY2UpXG5cdFx0Ly8gbG9nKHRyYWNlKTtcblx0XHRmb3IgKGxldCBrZXlzID0gT2JqZWN0LmtleXModHJhY2UpLCBpID0gMCwgZW5kID0ga2V5cy5sZW5ndGggLSAxOyBpIDw9IGVuZDsgaSsrKSB7XG5cdFx0XHRsZXQge21ldGhvZCwgcGF0aCwgbGluZSwgY29sdW1ufSA9IHRyYWNlW2tleXNbaV1dO1xuXHRcdFx0cmVzdWx0LnB1c2goYFxcbiR7dGhpcy5nZXRUYWIobGV2ZWwpfXwgJHt0aGlzLndyYXBFcnJvcihtZXRob2QsIFwibWV0aG9kXCIpfSAke3RoaXMud3JhcEVycm9yKHBhdGgsIFwicGF0aFwiKX06JHt0aGlzLndyYXBFcnJvcihsaW5lLCBcImxpbmVcIil9OiR7dGhpcy53cmFwRXJyb3IoY29sdW1uLCBcImNvbHVtblwiKX1gKTtcblx0XHR9XG5cdFx0cmV0dXJuIHJlc3VsdC5qb2luKCk7XG5cdH1cblxuXHR3cmFwRXJyb3JDb250ZXh0KGNvbnRleHQsIGxldmVsKSB7XG5cdFx0bGV0IHJlc3VsdCA9IFwiXCI7XG5cdFx0aWYgKGNvbnRleHQpIHtcblx0XHRcdC8vIFx0cmVzdWx0ICs9IGBcXG4ke3RoaXMuZ2V0VGFiKGxldmVsKX1gO1xuXHRcdFx0Ly8gXHRyZXN1bHQgKz0gQmVhdXRpZnkucGxhaW4oY29udGV4dCwgbGV2ZWwpO1xuXHRcdH1cblx0XHRyZXR1cm4gcmVzdWx0O1xuXHR9XG5cblx0d3JhcFRleHQoZGF0YSwgbGV2ZWwpIHtcblx0XHRyZXR1cm4gZGF0YS5yZXBsYWNlQWxsKFtcIlxcdFwiLCBcIlxcblwiXSwgW3RoaXMuZ2V0VGFiKDEpLCBgXFxuJHt0aGlzLmdldFRhYihsZXZlbCl9YF0pO1xuXHRcdC8vIHJldHVybiBkYXRhLnJlcGxhY2UoL1xcdC9nLCB0aGlzLmdldFRhYigxKSkucmVwbGFjZSgvXFxuL2csIGBcXG4ke3RoaXMuZ2V0VGFiKGxldmVsKX1gKTtcblx0fTtcblxuXHQvKiovXG5cdGFycmF5KGRhdGEsIGxldmVsKSB7XG5cdFx0cmV0dXJuIHRoaXMud3JhcERhdGFWYWx1ZShkYXRhLCBcImFycmF5XCIsIGRhdGEubGVuZ3RoLCBsZXZlbCk7XG5cdH07XG5cblx0Ym9vbChkYXRhLCBsZXZlbCkge1xuXHRcdHJldHVybiB0aGlzLndyYXBEYXRhVmFsdWUoZGF0YSwgXCJib29sXCIsIG51bGwsIGxldmVsKTtcblx0fTtcblxuXHRidWZmZXIoZGF0YSwgbGV2ZWwpIHtcblx0XHRyZXR1cm4gdGhpcy53cmFwRGF0YVZhbHVlKGRhdGEsIFwiYnVmZmVyXCIsIGRhdGEuYnl0ZUxlbmd0aCwgbGV2ZWwpO1xuXHR9O1xuXG5cdGNpcmN1bGFyKGRhdGEsIGxldmVsKSB7XG5cdFx0cmV0dXJuIHRoaXMud3JhcERhdGFWYWx1ZShkYXRhLCBcImNpcmN1bGFyXCIsIGRhdGEubGVuZ3RoLCBsZXZlbCk7XG5cdH07XG5cblx0ZGF0ZShkYXRhLCBsZXZlbCkge1xuXHRcdHJldHVybiB0aGlzLndyYXBEYXRhVmFsdWUoZGF0YSwgXCJkYXRlXCIsIG51bGwsIGxldmVsKTtcblx0fTtcblxuXHRlcnJvcihkYXRhLCBsZXZlbCkge1xuXHRcdGxldCB0cmFjZSA9IGRhdGFbXCJ0cmFjZVwiXSA/IGRhdGFbXCJ0cmFjZVwiXSA6IEZhVHJhY2Uuc3RhY2soZGF0YVtcInN0YWNrXCJdKTtcblx0XHRyZXR1cm4gYCR7dGhpcy53cmFwRXJyb3IoZGF0YVtcIm5hbWVcIl0sIFwibmFtZVwiKX0ke3RoaXMud3JhcEVycm9yKGRhdGFbXCJtZXNzYWdlXCJdLCBcIm1lc3NhZ2VcIil9JHt0aGlzLndyYXBFcnJvclRyYWNlKHRyYWNlLCBsZXZlbCl9JHt0aGlzLndyYXBFcnJvckNvbnRleHQoZGF0YVtcImNvbnRleHRcIl0sIGxldmVsKX1gO1xuXHR9O1xuXG5cdGZpbGUoZGF0YSwgbGV2ZWwpIHtcblx0XHRsZXQgZmlsZU1pbWU7XG5cdFx0bGV0IGZpbGVMZW5ndGg7XG5cdFx0aWYgKGRhdGEuYnl0ZUxlbmd0aCkge1xuXHRcdFx0ZmlsZU1pbWUgPSBGaWxlVHlwZShkYXRhKS5taW1lO1xuXHRcdFx0ZmlsZUxlbmd0aCA9IGRhdGEuYnl0ZUxlbmd0aDtcblx0XHR9IGVsc2Uge1xuXHRcdFx0ZmlsZU1pbWUgPSBGaWxlVHlwZShCdWZmZXIoZGF0YSwgXCJiYXNlNjRcIikpLm1pbWU7XG5cdFx0XHRmaWxlTGVuZ3RoID0gZGF0YS5sZW5ndGg7XG5cdFx0fVxuXHRcdHJldHVybiB0aGlzLndyYXBEYXRhVmFsdWUoZmlsZU1pbWUsIFwiZmlsZVwiLCBmaWxlTGVuZ3RoLCBsZXZlbCk7XG5cdH07XG5cblx0ZmxvYXQoZGF0YSwgbGV2ZWwpIHtcblx0XHRyZXR1cm4gdGhpcy53cmFwRGF0YVZhbHVlKGRhdGEsIFwiZmxvYXRcIiwgbnVsbCwgbGV2ZWwpO1xuXHR9O1xuXG5cdGZ1bmN0aW9uKGRhdGEsIGxldmVsKSB7XG5cdFx0cmV0dXJuIHRoaXMud3JhcERhdGFWYWx1ZSh0aGlzLndyYXBUZXh0KGRhdGEudG9TdHJpbmcoKSwgbGV2ZWwpLCBcImZ1bmN0aW9uXCIsIGRhdGEudG9TdHJpbmcoKS5sZW5ndGgsIGxldmVsKTtcblx0fTtcblxuXHRqc29uKGRhdGEsIGxldmVsKSB7XG5cdFx0cmV0dXJuIHRoaXMud3JhcERhdGFWYWx1ZShkYXRhLCBcImpzb25cIiwgZGF0YS5sZW5ndGgsIGxldmVsKTtcblx0fTtcblxuXHRpbnQoZGF0YSwgbGV2ZWwpIHtcblx0XHRyZXR1cm4gdGhpcy53cmFwRGF0YVZhbHVlKGRhdGEsIFwiaW50XCIsIG51bGwsIGxldmVsKTtcblx0fTtcblxuXHRtb25nb0lkKGRhdGEsIGxldmVsKSB7XG5cdFx0cmV0dXJuIHRoaXMud3JhcERhdGFWYWx1ZShkYXRhLCBcIm1vbmdvSWRcIiwgbnVsbCwgbGV2ZWwpO1xuXHR9O1xuXG5cdG51bGwoZGF0YSwgbGV2ZWwpIHtcblx0XHRyZXR1cm4gdGhpcy53cmFwRGF0YVZhbHVlKGRhdGEsIFwibnVsbFwiLCBudWxsLCBsZXZlbCk7XG5cdH07XG5cblx0b2JqZWN0KGRhdGEsIGxldmVsKSB7XG5cdFx0cmV0dXJuIHRoaXMud3JhcERhdGFWYWx1ZShkYXRhLCBcIm9iamVjdFwiLCBkYXRhLmxlbmd0aCwgbGV2ZWwpO1xuXHR9O1xuXG5cdHJlZ0V4cChkYXRhLCBsZXZlbCkge1xuXHRcdHJldHVybiB0aGlzLndyYXBEYXRhVmFsdWUoZGF0YSwgXCJyZWdFeHBcIiwgbnVsbCwgbGV2ZWwpO1xuXHR9O1xuXG5cdHN0cmluZyhkYXRhLCBsZXZlbCkge1xuXHRcdGxldCBzdHJpbmcgPSB0aGlzLndyYXBUZXh0KGRhdGEsIGxldmVsKS5yZXBsYWNlQWxsKCdcIicsICdcXFxcXCInKTtcblx0XHRyZXR1cm4gdGhpcy53cmFwRGF0YVZhbHVlKHN0cmluZywgXCJzdHJpbmdcIiwgZGF0YS5sZW5ndGgsIGxldmVsKTtcblx0fTtcblxuXHR1bmRlZmluZWQoZGF0YSwgbGV2ZWwpIHtcblx0XHRyZXR1cm4gdGhpcy53cmFwRGF0YVZhbHVlKGRhdGEsIFwidW5kZWZpbmVkXCIsIG51bGwsIGxldmVsKTtcblx0fTtcblxuXHR4bWwoZGF0YSwgbGV2ZWwpIHtcblx0XHRyZXR1cm4gdGhpcy53cmFwRGF0YVZhbHVlKGRhdGEsIFwieG1sXCIsIGRhdGEubGVuZ3RoLCBsZXZlbCk7XG5cdH07XG5cblx0ZGVmYXVsdChkYXRhLCBsZXZlbCkge1xuXHRcdHJldHVybiB0aGlzLndyYXBEYXRhVmFsdWUoZGF0YSwgXCJkZWZhdWx0XCIsIGRhdGEubGVuZ3RoLCBsZXZlbCk7XG5cdH07XG59XG5cbi8qKlxuICpcbiAqIEB0eXBlIHtGYUJlYXV0aWZ5V3JhcH1cbiAqL1xubW9kdWxlLmV4cG9ydHMgPSBGYUJlYXV0aWZ5V3JhcDtcbiIsIi8qaHR0cHM6Ly93d3cuY29tcGFydC5jb20vZW4vdW5pY29kZS9jYXRlZ29yeS9TbyovXG5cInVzZSBzdHJpY3RcIjtcbi8qKlxuICpcbiAqIEB0eXBlIHt7cmVzZXQ6IHN0cmluZywgYm9sZDogc3RyaW5nLCBkaW06IHN0cmluZywgdW5kZXJzY29yZTogc3RyaW5nLCBibGluazogc3RyaW5nLCByZXZlcnNlOiBzdHJpbmcsIGhpZGRlbjogc3RyaW5nfX1cbiAqL1xuZXhwb3J0cy5lZmZlY3QgPSB7XG5cdHJlc2V0OiBcIlxceDFiWzBtXCIsXG5cdGJvbGQ6IFwiXFx4MWJbMW1cIixcblx0ZGltOiBcIlxceDFiWzJtXCIsXG5cdHVuZGVyc2NvcmU6IFwiXFx4MWJbNG1cIixcblx0Ymxpbms6IFwiXFx4MWJbNW1cIixcblx0cmV2ZXJzZTogXCJcXHgxYls3bVwiLFxuXHRoaWRkZW46IFwiXFx4MWJbOG1cIixcbn07XG4vKipcbiAqXG4gKiBAdHlwZSB7e2JsYWNrOiBzdHJpbmcsIHJlZDogc3RyaW5nLCBncmVlbjogc3RyaW5nLCB5ZWxsb3c6IHN0cmluZywgYmx1ZTogc3RyaW5nLCBtYWdlbnRhOiBzdHJpbmcsIGN5YW46IHN0cmluZywgd2hpdGU6IHN0cmluZ319XG4gKi9cbmV4cG9ydHMuY29sb3IgPSB7XG5cdGJsYWNrOiBcIlxceDFiWzMwbVwiLFxuXHRyZWQ6IFwiXFx4MWJbMzFtXCIsXG5cdGdyZWVuOiBcIlxceDFiWzMybVwiLFxuXHR5ZWxsb3c6IFwiXFx4MWJbMzNtXCIsXG5cdGJsdWU6IFwiXFx4MWJbMzRtXCIsXG5cdG1hZ2VudGE6IFwiXFx4MWJbMzVtXCIsXG5cdGN5YW46IFwiXFx4MWJbMzZtXCIsXG5cdHdoaXRlOiBcIlxceDFiWzM3bVwiLFxufTtcbi8qKlxuICpcbiAqIEB0eXBlIHt7YmxhY2s6IHN0cmluZywgcmVkOiBzdHJpbmcsIGdyZWVuOiBzdHJpbmcsIHllbGxvdzogc3RyaW5nLCBibHVlOiBzdHJpbmcsIG1hZ2VudGE6IHN0cmluZywgY3lhbjogc3RyaW5nLCB3aGl0ZTogc3RyaW5nfX1cbiAqL1xuZXhwb3J0cy5iZyA9IHtcblx0YmxhY2s6IFwiXFx4MWJbNDBtXCIsXG5cdHJlZDogXCJcXHgxYls0MW1cIixcblx0Z3JlZW46IFwiXFx4MWJbNDJtXCIsXG5cdHllbGxvdzogXCJcXHgxYls0M21cIixcblx0Ymx1ZTogXCJcXHgxYls0NG1cIixcblx0bWFnZW50YTogXCJcXHgxYls0NW1cIixcblx0Y3lhbjogXCJcXHgxYls0Nm1cIixcblx0d2hpdGU6IFwiXFx4MWJbNDdtXCIsXG59O1xuLyoqXG4gKlxuICogQHR5cGUge3tjb21tYXQ6IHN0cmluZywgYXN0OiBzdHJpbmcsIGFtcDogc3RyaW5nLCBudW06IHN0cmluZywgbHQ6IHN0cmluZywgY3Jvc3M6IHN0cmluZywgY3VydmVhcnJvd2xlZnQ6IHN0cmluZywgY2hlY2s6IHN0cmluZywgZ3Q6IHN0cmluZywgcXVlc3Q6IHN0cmluZywgcGx1czogc3RyaW5nLCBwZXJjbnQ6IHN0cmluZywgY2lyY2xlYXJyb3dyaWdodDogc3RyaW5nLCBleGNsOiBzdHJpbmcsIGNpcmNsZWFycm93bGVmdDogc3RyaW5nLCBlcXVhbHM6IHN0cmluZywgY29weTogc3RyaW5nLCBjdXJ2ZWFycm93cmlnaHQ6IHN0cmluZ319XG4gKi9cbmV4cG9ydHMuc2lnbiA9IHtcblx0ZXhjbDogXCJcXHUwMDIxXCIsXG5cdG51bTogXCJcXHUwMDIzXCIsXG5cdHBlcmNudDogXCJcXHUwMDI1XCIsXG5cdGFtcDogXCJcXHUwMDI2XCIsXG5cdGFzdDogXCJcXHUwMDJhXCIsXG5cdHBsdXM6IFwiXFx1MDAyYlwiLFxuXHRsdDogXCJcXHUwMDNjXCIsXG5cdGVxdWFsczogXCJcXHUwMDNkXCIsXG5cdGd0OiBcIlxcdTAwM2VcIixcblx0cXVlc3Q6IFwiXFx1MDAzZlwiLFxuXHRjb21tYXQ6IFwiXFx1MDA0MFwiLFxuXHRjb3B5OiBcIlxcdTAwYTlcIixcblx0Y3VydmVhcnJvd2xlZnQ6IFwiXFx1MjFiNlwiLFxuXHRjdXJ2ZWFycm93cmlnaHQ6IFwiXFx1MjFiN1wiLFxuXHRjaXJjbGVhcnJvd2xlZnQ6IFwiXFx1MjFiYVwiLFxuXHRjaXJjbGVhcnJvd3JpZ2h0OiBcIlxcdTIxYmJcIixcblx0Y2hlY2s6IFwiXFx1MjcxM1wiLFxuXHRjcm9zczogXCJcXHUyNzE3XCIsXG59O1xuIiwiLy9wYXJzZSBFbXB0eSBOb2RlIGFzIHNlbGYgY2xvc2luZyBub2RlXG52YXIgaGUgPSByZXF1aXJlKFwiaGVcIik7XG5cbnZhciBkZWZhdWx0T3B0aW9ucyA9IHtcbiAgICBhdHRyaWJ1dGVOYW1lUHJlZml4IDogXCJAX1wiLFxuICAgIGF0dHJOb2RlTmFtZTogZmFsc2UsXG4gICAgdGV4dE5vZGVOYW1lIDogXCIjdGV4dFwiLFxuICAgIGlnbm9yZUF0dHJpYnV0ZXMgOiB0cnVlLFxuICAgIGVuY29kZUhUTUxjaGFyOiBmYWxzZSxcbiAgICBjZGF0YVRhZ05hbWU6IGZhbHNlLFxuICAgIGNkYXRhUG9zaXRpb25DaGFyOiBcIlxcXFxjXCIsXG4gICAgZm9ybWF0OiBmYWxzZSxcbiAgICBpbmRlbnRCeTogXCIgIFwiLFxuICAgIHN1cHJlc3NFbXB0eU5vZGU6IGZhbHNlXG59O1xuXG5mdW5jdGlvbiBQYXJzZXIob3B0aW9ucyl7XG4gICAgdGhpcy5vcHRpb25zID0gT2JqZWN0LmFzc2lnbih7fSxkZWZhdWx0T3B0aW9ucyxvcHRpb25zKTtcbiAgICBpZih0aGlzLm9wdGlvbnMuaWdub3JlQXR0cmlidXRlcykge1xuICAgICAgICB0aGlzLmlzQXR0cmlidXRlID0gYSA9PiBmYWxzZTtcbiAgICB9ZWxzZXtcbiAgICAgICAgdGhpcy5hdHRyUHJlZml4TGVuID0gdGhpcy5vcHRpb25zLmF0dHJpYnV0ZU5hbWVQcmVmaXgubGVuZ3RoO1xuICAgICAgICB0aGlzLmlzQXR0cmlidXRlID0gaXNBdHRyaWJ1dGU7XG4gICAgfVxuICAgIGlmKHRoaXMub3B0aW9ucy5jZGF0YVRhZ05hbWUpe1xuICAgICAgICB0aGlzLmlzQ0RBVEEgPSBpc0NEQVRBO1xuICAgIH1lbHNle1xuICAgICAgICB0aGlzLmlzQ0RBVEEgPSBhID0+IGZhbHNlO1xuICAgIH1cbiAgICB0aGlzLnJlcGxhY2VDREFUQXN0ciA9IHJlcGxhY2VDREFUQXN0cjtcbiAgICB0aGlzLnJlcGxhY2VDREFUQWFyciA9IHJlcGxhY2VDREFUQWFycjtcbiAgICBpZih0aGlzLm9wdGlvbnMuZW5jb2RlSFRNTGNoYXIpe1xuICAgICAgICB0aGlzLmVuY29kZUhUTUxjaGFyID0gZW5jb2RlSFRNTGNoYXI7XG4gICAgfWVsc2V7XG4gICAgICAgIHRoaXMuZW5jb2RlSFRNTGNoYXIgPSBhID0+IGE7XG4gICAgfVxuXG4gICAgaWYodGhpcy5vcHRpb25zLmZvcm1hdCl7XG4gICAgICAgIHRoaXMuaW5kZW50YXRlID0gaW5kZW50YXRlOyBcbiAgICAgICAgdGhpcy50YWdFbmRDaGFyID0gXCI+XFxuXCI7XG4gICAgICAgIHRoaXMubmV3TGluZSA9IFwiXFxuXCI7XG4gICAgfWVsc2V7XG4gICAgICAgIHRoaXMuaW5kZW50YXRlID0gKCkgPT4gXCJcIjtcbiAgICAgICAgdGhpcy50YWdFbmRDaGFyID0gXCI+XCI7XG4gICAgICAgIHRoaXMubmV3TGluZSA9IFwiXCI7XG4gICAgfVxuXG4gICAgaWYodGhpcy5vcHRpb25zLnN1cHJlc3NFbXB0eU5vZGUpe1xuICAgICAgICB0aGlzLmJ1aWxkVGV4dE5vZGUgPSBidWlsZEVtcHR5VGV4dE5vZGU7XG4gICAgICAgIHRoaXMuYnVpbGRPYmpOb2RlID0gYnVpbGRFbXB0eU9iak5vZGU7XG4gICAgfWVsc2V7XG4gICAgICAgIHRoaXMuYnVpbGRUZXh0Tm9kZSA9IGJ1aWxkVGV4dFZhbE5vZGU7XG4gICAgICAgIHRoaXMuYnVpbGRPYmpOb2RlID0gYnVpbGRPYmplY3ROb2RlO1xuICAgIH1cblxuICAgIHRoaXMuYnVpbGRUZXh0VmFsTm9kZSA9IGJ1aWxkVGV4dFZhbE5vZGU7XG4gICAgdGhpcy5idWlsZE9iamVjdE5vZGUgPSBidWlsZE9iamVjdE5vZGU7XG5cbn1cblxuXG5QYXJzZXIucHJvdG90eXBlLnBhcnNlID0gZnVuY3Rpb24oak9iail7XG4gICAgcmV0dXJuIHRoaXMuajJ4KGpPYmosMCkudmFsO1xufVxuXG5QYXJzZXIucHJvdG90eXBlLmoyeCA9IGZ1bmN0aW9uKGpPYmosbGV2ZWwpe1xuICAgIHZhciB4bWxTdHIgPSBcIlwiLCBhdHRyU3RyID0gXCJcIiAsIHZhbCA9IFwiXCI7XG4gICAgdmFyIGtleXMgPSBPYmplY3Qua2V5cyhqT2JqKTtcbiAgICB2YXIgbGVuID0ga2V5cy5sZW5ndGg7XG4gICAgZm9yKHZhciBpPTA7aTxsZW47aSsrKXtcbiAgICAgICAgdmFyIGtleSA9IGtleXNbaV07XG4gICAgICAgIGlmKHR5cGVvZiBqT2JqW2tleV0gIT09IFwib2JqZWN0XCIpey8vcHJlbWl0aXZlIHR5cGVcbiAgICAgICAgICAgIHZhciBhdHRyID0gdGhpcy5pc0F0dHJpYnV0ZShrZXkpO1xuICAgICAgICAgICAgaWYoYXR0cil7XG4gICAgICAgICAgICAgICAgYXR0clN0ciArPSBcIiBcIiArYXR0citcIj1cXFwiXCIrIHRoaXMuZW5jb2RlSFRNTGNoYXIoak9ialtrZXldLCB0cnVlKSArXCJcXFwiXCI7XG4gICAgICAgICAgICB9ZWxzZSBpZih0aGlzLmlzQ0RBVEEoa2V5KSl7XG4gICAgICAgICAgICAgICAgaWYoak9ialt0aGlzLm9wdGlvbnMudGV4dE5vZGVOYW1lXSl7XG4gICAgICAgICAgICAgICAgICAgIHZhbCArPSB0aGlzLnJlcGxhY2VDREFUQXN0cihqT2JqW3RoaXMub3B0aW9ucy50ZXh0Tm9kZU5hbWVdLCBqT2JqW2tleV0pO1xuICAgICAgICAgICAgICAgIH1lbHNle1xuICAgICAgICAgICAgICAgICAgICB2YWwgKz0gdGhpcy5yZXBsYWNlQ0RBVEFzdHIoXCJcIiwgak9ialtrZXldKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9ZWxzZXsvL3RhZyB2YWx1ZVxuICAgICAgICAgICAgICAgIGlmKGtleSA9PT0gdGhpcy5vcHRpb25zLnRleHROb2RlTmFtZSl7XG4gICAgICAgICAgICAgICAgICAgIGlmKGpPYmpbdGhpcy5vcHRpb25zLmNkYXRhVGFnTmFtZV0pe1xuICAgICAgICAgICAgICAgICAgICAgICAgLy92YWx1ZSB3aWxsIGFkZGVkIHdoaWxlIHByb2Nlc3NpbmcgY2RhdGFcbiAgICAgICAgICAgICAgICAgICAgfWVsc2V7XG4gICAgICAgICAgICAgICAgICAgICAgICB2YWwgKz0gdGhpcy5lbmNvZGVIVE1MY2hhcihqT2JqW2tleV0pOyAgICBcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH1lbHNle1xuICAgICAgICAgICAgICAgICAgICB2YWwgKz0gdGhpcy5idWlsZFRleHROb2RlKGpPYmpba2V5XSxrZXksXCJcIixsZXZlbCk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICB9ZWxzZSBpZihBcnJheS5pc0FycmF5KGpPYmpba2V5XSkpey8vcmVwZWF0ZWQgbm9kZXNcbiAgICAgICAgICAgIGlmKHRoaXMuaXNDREFUQShrZXkpKXtcbiAgICAgICAgICAgICAgICBpZihqT2JqW3RoaXMub3B0aW9ucy50ZXh0Tm9kZU5hbWVdKXtcbiAgICAgICAgICAgICAgICAgICAgdmFsICs9IHRoaXMucmVwbGFjZUNEQVRBYXJyKGpPYmpbdGhpcy5vcHRpb25zLnRleHROb2RlTmFtZV0sIGpPYmpba2V5XSk7XG4gICAgICAgICAgICAgICAgfWVsc2V7XG4gICAgICAgICAgICAgICAgICAgIHZhbCArPSB0aGlzLnJlcGxhY2VDREFUQWFycihcIlwiLCBqT2JqW2tleV0pO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1lbHNley8vbmVzdGVkIG5vZGVzXG4gICAgICAgICAgICAgICAgdmFyIGFyckxlbiA9IGpPYmpba2V5XS5sZW5ndGg7XG4gICAgICAgICAgICAgICAgZm9yKHZhciBqPTA7ajxhcnJMZW47aisrKXtcbiAgICAgICAgICAgICAgICAgICAgdmFyIGl0ZW0gPSBqT2JqW2tleV1bal07XG4gICAgICAgICAgICAgICAgICAgIGlmKHR5cGVvZiBpdGVtID09PSBcIm9iamVjdFwiKXtcbiAgICAgICAgICAgICAgICAgICAgICAgIHZhciByZXN1bHQgPSB0aGlzLmoyeChpdGVtLGxldmVsKzEpO1xuICAgICAgICAgICAgICAgICAgICAgICAgdmFsICArPSB0aGlzLmJ1aWxkT2JqTm9kZShyZXN1bHQudmFsLGtleSxyZXN1bHQuYXR0clN0cixsZXZlbCk7XG4gICAgICAgICAgICAgICAgICAgIH1lbHNle1xuICAgICAgICAgICAgICAgICAgICAgICAgdmFsICs9IHRoaXMuYnVpbGRUZXh0Tm9kZShpdGVtLGtleSxcIlwiLGxldmVsKTtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgfWVsc2V7XG4gICAgICAgICAgICBcbiAgICAgICAgICAgIGlmKHRoaXMub3B0aW9ucy5hdHRyTm9kZU5hbWUgJiYga2V5ID09PSB0aGlzLm9wdGlvbnMuYXR0ck5vZGVOYW1lKXtcbiAgICAgICAgICAgICAgICB2YXIgS3MgPSBPYmplY3Qua2V5cyhqT2JqW2tleV0pO1xuICAgICAgICAgICAgICAgIHZhciBMID0gS3MubGVuZ3RoO1xuICAgICAgICAgICAgICAgIGZvcih2YXIgaj0wO2o8TDtqKyspe1xuICAgICAgICAgICAgICAgICAgICBhdHRyU3RyICs9IFwiIFwiK0tzW2pdK1wiPVxcXCJcIiArIHRoaXMuZW5jb2RlSFRNTGNoYXIoak9ialtrZXldW0tzW2pdXSkgKyBcIlxcXCJcIjtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9ZWxzZXtcbiAgICAgICAgICAgICAgICB2YXIgcmVzdWx0ID0gdGhpcy5qMngoak9ialtrZXldLGxldmVsKzEpO1xuICAgICAgICAgICAgICAgIHZhbCAgKz0gdGhpcy5idWlsZE9iak5vZGUocmVzdWx0LnZhbCxrZXkscmVzdWx0LmF0dHJTdHIsbGV2ZWwpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgfVxuICAgIHJldHVybiB7YXR0clN0ciA6IGF0dHJTdHIgLCB2YWwgOiB2YWx9O1xufVxuXG5mdW5jdGlvbiByZXBsYWNlQ0RBVEFzdHIoc3RyLGNkYXRhKXtcbiAgICBzdHIgPSB0aGlzLmVuY29kZUhUTUxjaGFyKHN0cik7XG4gICAgaWYodGhpcy5vcHRpb25zLmNkYXRhUG9zaXRpb25DaGFyID09PSBcIlwiIHx8IHN0ciA9PT0gXCJcIil7XG4gICAgICAgIHJldHVybiBzdHIgKyBcIjwhW0NEQVRBW1wiICtjZGF0YStcIl1dPlwiO1xuICAgIH1lbHNle1xuICAgICAgICByZXR1cm4gc3RyLnJlcGxhY2UodGhpcy5vcHRpb25zLmNkYXRhUG9zaXRpb25DaGFyLFwiPCFbQ0RBVEFbXCIgK2NkYXRhK1wiXV0+XCIpXG4gICAgfVxufVxuXG5mdW5jdGlvbiByZXBsYWNlQ0RBVEFhcnIoc3RyLGNkYXRhKXtcbiAgICBzdHIgPSB0aGlzLmVuY29kZUhUTUxjaGFyKHN0cik7XG4gICAgaWYodGhpcy5vcHRpb25zLmNkYXRhUG9zaXRpb25DaGFyID09PSBcIlwiIHx8IHN0ciA9PT0gXCJcIil7XG4gICAgICAgIHJldHVybiBzdHIgKyBcIjwhW0NEQVRBW1wiICsgY2RhdGEuam9pbihcIl1dPjwhW0NEQVRBW1wiKStcIl1dPlwiO1xuICAgIH1lbHNle1xuICAgICAgICBmb3IodmFyIHYgaW4gY2RhdGEpe1xuICAgICAgICAgICAgc3RyID0gc3RyLnJlcGxhY2UodGhpcy5vcHRpb25zLmNkYXRhUG9zaXRpb25DaGFyLCBcIjwhW0NEQVRBW1wiICtjZGF0YVt2XStcIl1dPlwiKTtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gc3RyO1xuICAgIH1cbn1cblxuZnVuY3Rpb24gYnVpbGRPYmplY3ROb2RlKHZhbCxrZXksYXR0clN0cixsZXZlbCl7XG4gICAgcmV0dXJuIHRoaXMuaW5kZW50YXRlKGxldmVsKSBcbiAgICAgICAgICAgICAgICArIFwiPFwiICsga2V5ICsgYXR0clN0ciBcbiAgICAgICAgICAgICAgICArIHRoaXMudGFnRW5kQ2hhciBcbiAgICAgICAgICAgICAgICArIHZhbCBcbiAgICAgICAgICAgICAgICAvLysgdGhpcy5uZXdMaW5lXG4gICAgICAgICAgICAgICAgKyB0aGlzLmluZGVudGF0ZShsZXZlbClcbiAgICAgICAgICAgICAgICArIFwiPC9cIitrZXkrdGhpcy50YWdFbmRDaGFyO1xufVxuXG5mdW5jdGlvbiBidWlsZEVtcHR5T2JqTm9kZSh2YWwsa2V5LGF0dHJTdHIsbGV2ZWwpe1xuICAgIGlmKHZhbCAhPT0gXCJcIiApe1xuICAgICAgICByZXR1cm4gdGhpcy5idWlsZE9iamVjdE5vZGUodmFsLGtleSxhdHRyU3RyLGxldmVsKTtcbiAgICB9ZWxzZXtcbiAgICAgICAgcmV0dXJuIHRoaXMuaW5kZW50YXRlKGxldmVsKSBcbiAgICAgICAgICAgICAgICArIFwiPFwiICsga2V5ICsgYXR0clN0ciBcbiAgICAgICAgICAgICAgICArIFwiL1wiXG4gICAgICAgICAgICAgICAgKyB0aGlzLnRhZ0VuZENoYXIgXG4gICAgICAgICAgICAgICAgLy8rIHRoaXMubmV3TGluZVxuICAgIH1cbn1cblxuZnVuY3Rpb24gYnVpbGRUZXh0VmFsTm9kZSh2YWwsa2V5LGF0dHJTdHIsbGV2ZWwpe1xuICAgIHJldHVybiB0aGlzLmluZGVudGF0ZShsZXZlbCkgKyBcIjxcIiArIGtleSArIGF0dHJTdHIgKyAgXCI+XCIgK3RoaXMuZW5jb2RlSFRNTGNoYXIodmFsKStcIjwvXCIra2V5KyB0aGlzLnRhZ0VuZENoYXI7XG59XG5cbmZ1bmN0aW9uIGJ1aWxkRW1wdHlUZXh0Tm9kZSh2YWwsa2V5LGF0dHJTdHIsbGV2ZWwpe1xuICAgIGlmKHZhbCAhPT0gXCJcIil7XG4gICAgICAgIHJldHVybiB0aGlzLmJ1aWxkVGV4dFZhbE5vZGUodmFsLGtleSxhdHRyU3RyLGxldmVsKTtcbiAgICB9ZWxzZXtcbiAgICAgICAgcmV0dXJuIHRoaXMuaW5kZW50YXRlKGxldmVsKSArIFwiPFwiICsga2V5ICsgYXR0clN0ciArIFwiL1wiICsgdGhpcy50YWdFbmRDaGFyO1xuICAgIH1cbn1cblxuZnVuY3Rpb24gaW5kZW50YXRlKGxldmVsKXtcbiAgICByZXR1cm4gdGhpcy5vcHRpb25zLmluZGVudEJ5LnJlcGVhdChsZXZlbCk7XG59XG5mdW5jdGlvbiBlbmNvZGVIVE1MY2hhcih2YWwsIGlzQXR0cmlidXRlKXtcbiAgICByZXR1cm4gaGUuZW5jb2RlKFwiXCIgKyB2YWwsIHtpc0F0dHJpYnV0ZVZhbHVlIDogaXNBdHRyaWJ1dGUsIHVzZU5hbWVkUmVmZXJlbmNlczogdHJ1ZX0pO1xufVxuXG5mdW5jdGlvbiBpc0F0dHJpYnV0ZShuYW1lLG9wdGlvbnMpe1xuICAgIGlmKG5hbWUuc3RhcnRzV2l0aCh0aGlzLm9wdGlvbnMuYXR0cmlidXRlTmFtZVByZWZpeCkpe1xuICAgICAgICByZXR1cm4gbmFtZS5zdWJzdHIodGhpcy5hdHRyUHJlZml4TGVuKTtcbiAgICB9ZWxzZXtcbiAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgIH1cbn1cblxuZnVuY3Rpb24gaXNDREFUQShuYW1lKXtcbiAgICBpZihuYW1lID09PSB0aGlzLm9wdGlvbnMuY2RhdGFUYWdOYW1lKXtcbiAgICAgICAgcmV0dXJuIHRydWU7XG4gICAgfWVsc2V7XG4gICAgICAgIHJldHVybiBmYWxzZTtcbiAgICB9XG59XG4vL2Zvcm1hdHRpbmdcbi8vaW5kZW50YXRpb25cbi8vXFxuIGFmdGVyIGVhY2ggY2xvc2luZyBvciBzZWxmIGNsb3NpbmcgdGFnXG5cblxubW9kdWxlLmV4cG9ydHMgPSBQYXJzZXI7IiwidmFyIHV0aWwgPSByZXF1aXJlKFwiLi91dGlsXCIpO1xudmFyIHhtbE5vZGUgPSByZXF1aXJlKFwiLi94bWxOb2RlXCIpO1xudmFyIGhlID0gcmVxdWlyZShcImhlXCIpO1xudmFyIFRhZ1R5cGUgPSB7XCJPUEVOSU5HXCI6MSwgXCJDTE9TSU5HXCI6MiwgXCJTRUxGXCI6MywgXCJDREFUQVwiOiA0fTtcblxuLy92YXIgdGFnc1JlZ3ggPSBuZXcgUmVnRXhwKFwiPChcXFxcLz9bXFxcXHc6XFxcXC1cXC5fXSspKFtePl0qKT4oXFxcXHMqXCIrY2RhdGFSZWd4K1wiKSooW148XSspP1wiLFwiZ1wiKTtcbi8vdmFyIHRhZ3NSZWd4ID0gbmV3IFJlZ0V4cChcIjwoXFxcXC8/KSgoXFxcXHcqOik/KFtcXFxcdzpcXFxcLVxcLl9dKykpKFtePl0qKT4oW148XSopKFwiK2NkYXRhUmVneCtcIihbXjxdKikpKihbXjxdKyk/XCIsXCJnXCIpO1xuXG4vL3RyZWF0IGNkYXRhIGFzIGEgdGFnXG5cblxudmFyIGRlZmF1bHRPcHRpb25zID0ge1xuICAgIGF0dHJpYnV0ZU5hbWVQcmVmaXggOiBcIkBfXCIsXG4gICAgYXR0ck5vZGVOYW1lOiBmYWxzZSxcbiAgICB0ZXh0Tm9kZU5hbWUgOiBcIiN0ZXh0XCIsXG4gICAgaWdub3JlQXR0cmlidXRlcyA6IHRydWUsXG4gICAgaWdub3JlTmFtZVNwYWNlIDogZmFsc2UsXG4gICAgYWxsb3dCb29sZWFuQXR0cmlidXRlcyA6IGZhbHNlLCAgICAgICAgIC8vYSB0YWcgY2FuIGhhdmUgYXR0cmlidXRlcyB3aXRob3V0IGFueSB2YWx1ZVxuICAgIC8vaWdub3JlUm9vdEVsZW1lbnQgOiBmYWxzZSxcbiAgICBwYXJzZU5vZGVWYWx1ZSA6IHRydWUsXG4gICAgcGFyc2VBdHRyaWJ1dGVWYWx1ZSA6IGZhbHNlLFxuICAgIGFycmF5TW9kZSA6IGZhbHNlLFxuICAgIHRyaW1WYWx1ZXM6IHRydWUsICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAvL1RyaW0gc3RyaW5nIHZhbHVlcyBvZiB0YWcgYW5kIGF0dHJpYnV0ZXMgXG4gICAgZGVjb2RlSFRNTGNoYXI6IGZhbHNlLFxuICAgIGNkYXRhVGFnTmFtZTogZmFsc2UsXG4gICAgY2RhdGFQb3NpdGlvbkNoYXI6IFwiXFxcXGNcIlxuICAgIC8vZGVjb2RlU3RyaWN0OiBmYWxzZSxcbn07XG5cbnZhciBidWlsZE9wdGlvbnMgPSBmdW5jdGlvbiAob3B0aW9ucyl7XG4gICAgaWYoIW9wdGlvbnMpIG9wdGlvbnMgPSB7fTtcbiAgICB2YXIgcHJvcHMgPSBbXCJhdHRyaWJ1dGVOYW1lUHJlZml4XCIsXG4gICAgICAgICAgICAgICAgICAgICAgICBcImF0dHJOb2RlTmFtZVwiLFxuICAgICAgICAgICAgICAgICAgICAgICAgXCJpZ25vcmVBdHRyaWJ1dGVzXCIsXG4gICAgICAgICAgICAgICAgICAgICAgICBcImlnbm9yZU5hbWVTcGFjZVwiLFxuICAgICAgICAgICAgICAgICAgICAgICAgXCJ0ZXh0Tm9kZU5hbWVcIixcbiAgICAgICAgICAgICAgICAgICAgICAgIFwicGFyc2VOb2RlVmFsdWVcIixcbiAgICAgICAgICAgICAgICAgICAgICAgIFwicGFyc2VBdHRyaWJ1dGVWYWx1ZVwiLFxuICAgICAgICAgICAgICAgICAgICAgICAgXCJhcnJheU1vZGVcIixcbiAgICAgICAgICAgICAgICAgICAgICAgIFwidHJpbVZhbHVlc1wiLFxuICAgICAgICAgICAgICAgICAgICAgICAgXCJjZGF0YVBvc2l0aW9uQ2hhclwiLFxuICAgICAgICAgICAgICAgIF07XG4gICAgdmFyIGxlbiA9IHByb3BzLmxlbmd0aDtcbiAgICBmb3IgKHZhciBpID0gMDsgaSA8IGxlbjsgaSsrKSB7XG4gICAgICAgIGlmKHR5cGVvZiBvcHRpb25zW3Byb3BzW2ldXSA9PT0gXCJ1bmRlZmluZWRcIil7XG4gICAgICAgICAgICBvcHRpb25zW3Byb3BzW2ldXSA9IGRlZmF1bHRPcHRpb25zW3Byb3BzW2ldXTtcbiAgICAgICAgfVxuICAgIH1cbiAgICByZXR1cm4gb3B0aW9ucztcbn07XG5cbnZhciBnZXRUcmF2ZXJzYWxPYmogPWZ1bmN0aW9uICh4bWxEYXRhLG9wdGlvbnMpe1xuICAgIG9wdGlvbnMgPSBidWlsZE9wdGlvbnMob3B0aW9ucyk7XG4gICAgLy94bWxEYXRhID0geG1sRGF0YS5yZXBsYWNlKC9cXHI/XFxuL2csIFwiIFwiKTsvL21ha2UgaXQgc2luZ2xlIGxpbmVcbiAgICB4bWxEYXRhID0geG1sRGF0YS5yZXBsYWNlKC88IS0tW1xcc1xcU10qPy0tPi9nLCBcIlwiKTsvL1JlbW92ZSAgY29tbWVudHNcbiAgICBcbiAgICB2YXIgeG1sT2JqID0gbmV3IHhtbE5vZGUoJyF4bWwnKTtcbiAgICB2YXIgY3VycmVudE5vZGUgPSB4bWxPYmo7XG5cbiAgICB2YXIgdGFnc1JlZ3ggPSBuZXcgUmVnRXhwKFwiPCgoIVxcXFxbQ0RBVEFcXFxcWyhbXFxcXHNcXFxcU10qPykoXFxcXF1cXFxcXT4pKXwoKFxcXFx3KjopPyhbXFxcXHc6XFxcXC1cXFxcLl9dKykpKFtePl0qKT58KChcXFxcLykoKFxcXFx3KjopPyhbXFxcXHc6XFxcXC1cXFxcLl9dKykpPikpKFtePF0qKVwiLFwiZ1wiKTtcbiAgICB2YXIgdGFnID0gdGFnc1JlZ3guZXhlYyh4bWxEYXRhKTtcbiAgICB2YXIgbmV4dFRhZyA9IHRhZ3NSZWd4LmV4ZWMoeG1sRGF0YSk7XG4gICAgdmFyIHByZXZpb3VzTWF0Y2gsbmV4dE1hdGNoO1xuICAgIHdoaWxlICh0YWcpIHtcbiAgICAgICAgdmFyIHRhZ1R5cGUgPSBjaGVja0ZvclRhZ1R5cGUodGFnKTtcblxuICAgICAgICBpZih0YWdUeXBlID09PSBUYWdUeXBlLkNMT1NJTkcpe1xuICAgICAgICAgICAgLy9hZGQgcGFyc2VkIGRhdGEgdG8gcGFyZW50IG5vZGVcbiAgICAgICAgICAgIGlmKGN1cnJlbnROb2RlLnBhcmVudCAmJiB0YWdbMTRdKXtcbiAgICAgICAgICAgICAgICBjdXJyZW50Tm9kZS5wYXJlbnQudmFsID0gdXRpbC5nZXRWYWx1ZShjdXJyZW50Tm9kZS5wYXJlbnQudmFsKSArIFwiXCIgKyBwcm9jZXNzVGFnVmFsdWUodGFnWzE0XSxvcHRpb25zKTtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgY3VycmVudE5vZGUgPSBjdXJyZW50Tm9kZS5wYXJlbnQ7XG4gICAgICAgIH1lbHNlIGlmKHRhZ1R5cGUgPT09IFRhZ1R5cGUuQ0RBVEEpe1xuICAgICAgICAgICAgaWYob3B0aW9ucy5jZGF0YVRhZ05hbWUpe1xuICAgICAgICAgICAgICAgIC8vYWRkIGNkYXRhIG5vZGVcbiAgICAgICAgICAgICAgICB2YXIgY2hpbGROb2RlID0gbmV3IHhtbE5vZGUoIG9wdGlvbnMuY2RhdGFUYWdOYW1lLGN1cnJlbnROb2RlLHRhZ1szXSk7XG4gICAgICAgICAgICAgICAgY2hpbGROb2RlLmF0dHJzTWFwID0gYnVpbGRBdHRyaWJ1dGVzTWFwKHRhZ1s4XSxvcHRpb25zKTtcbiAgICAgICAgICAgICAgICBjdXJyZW50Tm9kZS5hZGRDaGlsZChjaGlsZE5vZGUpO1xuICAgICAgICAgICAgICAgIC8vZm9yIGJhY2t0cmFja2luZ1xuICAgICAgICAgICAgICAgIGN1cnJlbnROb2RlLnZhbCA9IHV0aWwuZ2V0VmFsdWUoY3VycmVudE5vZGUudmFsKSArIG9wdGlvbnMuY2RhdGFQb3NpdGlvbkNoYXI7XG4gICAgICAgICAgICAgICAgLy9hZGQgcmVzdCB2YWx1ZSB0byBwYXJlbnQgbm9kZVxuICAgICAgICAgICAgICAgIGlmKHRhZ1sxNF0pe1xuICAgICAgICAgICAgICAgICAgICBjdXJyZW50Tm9kZS52YWwgKz0gcHJvY2Vzc1RhZ1ZhbHVlKHRhZ1sxNF0sb3B0aW9ucyk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfWVsc2V7XG4gICAgICAgICAgICAgICAgY3VycmVudE5vZGUudmFsID0gKGN1cnJlbnROb2RlLnZhbCB8fCBcIlwiKSArICh0YWdbM10gfHwgXCJcIikgKyBwcm9jZXNzVGFnVmFsdWUodGFnWzE0XSxvcHRpb25zKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfWVsc2UgaWYodGFnVHlwZSA9PT0gVGFnVHlwZS5TRUxGKXtcbiAgICAgICAgICAgIHZhciBjaGlsZE5vZGUgPSBuZXcgeG1sTm9kZSggb3B0aW9ucy5pZ25vcmVOYW1lU3BhY2UgPyB0YWdbN10gOiB0YWdbNV0sY3VycmVudE5vZGUsIFwiXCIpO1xuICAgICAgICAgICAgaWYodGFnWzhdICYmIHRhZ1s4XS5sZW5ndGggPiAxKXtcbiAgICAgICAgICAgICAgICB0YWdbOF0gPSB0YWdbOF0uc3Vic3RyKDAsdGFnWzhdLmxlbmd0aCAtMSk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBjaGlsZE5vZGUuYXR0cnNNYXAgPSBidWlsZEF0dHJpYnV0ZXNNYXAodGFnWzhdLG9wdGlvbnMpO1xuICAgICAgICAgICAgY3VycmVudE5vZGUuYWRkQ2hpbGQoY2hpbGROb2RlKTtcbiAgICAgICAgfWVsc2V7Ly9UYWdUeXBlLk9QRU5JTkdcbiAgICAgICAgICAgIHZhciBjaGlsZE5vZGUgPSBuZXcgeG1sTm9kZSggb3B0aW9ucy5pZ25vcmVOYW1lU3BhY2UgPyB0YWdbN10gOiB0YWdbNV0sY3VycmVudE5vZGUscHJvY2Vzc1RhZ1ZhbHVlKHRhZ1sxNF0sb3B0aW9ucykpO1xuICAgICAgICAgICAgY2hpbGROb2RlLmF0dHJzTWFwID0gYnVpbGRBdHRyaWJ1dGVzTWFwKHRhZ1s4XSxvcHRpb25zKTtcbiAgICAgICAgICAgIGN1cnJlbnROb2RlLmFkZENoaWxkKGNoaWxkTm9kZSk7XG4gICAgICAgICAgICBjdXJyZW50Tm9kZSA9IGNoaWxkTm9kZTtcbiAgICAgICAgfVxuXG4gICAgICAgIHRhZyA9IG5leHRUYWc7XG4gICAgICAgIG5leHRUYWcgPSB0YWdzUmVneC5leGVjKHhtbERhdGEpO1xuICAgIH1cblxuICAgIHJldHVybiB4bWxPYmo7XG59O1xuXG5mdW5jdGlvbiBwcm9jZXNzVGFnVmFsdWUodmFsLG9wdGlvbnMpe1xuICAgIGlmKHZhbCl7XG4gICAgICAgIGlmKG9wdGlvbnMudHJpbVZhbHVlcyl7XG4gICAgICAgICAgICB2YWwgPSB2YWwudHJpbSgpO1xuICAgICAgICB9XG4gICAgICAgIGlmKG9wdGlvbnMuZGVjb2RlSFRNTGNoYXIpe1xuICAgICAgICAgICAgdmFsID0gaGUuZGVjb2RlKHZhbCk7XG4gICAgICAgIH1cbiAgICAgICAgdmFsID0gcGFyc2VWYWx1ZSh2YWwsb3B0aW9ucy5wYXJzZU5vZGVWYWx1ZSk7XG4gICAgfVxuXG4gICAgcmV0dXJuIHZhbDtcbn1cblxuZnVuY3Rpb24gY2hlY2tGb3JUYWdUeXBlKG1hdGNoKXtcbiAgICBpZihtYXRjaFs0XSA9PT0gXCJdXT5cIil7XG4gICAgICAgIHJldHVybiBUYWdUeXBlLkNEQVRBO1xuICAgIH1lbHNlIGlmKG1hdGNoWzEwXSA9PT0gXCIvXCIpe1xuICAgICAgICByZXR1cm4gVGFnVHlwZS5DTE9TSU5HO1xuICAgIH1lbHNlIGlmKHR5cGVvZiBtYXRjaFs4XSAhPT0gXCJ1bmRlZmluZWRcIiAmJiBtYXRjaFs4XS5zdWJzdHIobWF0Y2hbOF0ubGVuZ3RoLTEpID09PSBcIi9cIil7XG4gICAgICAgIHJldHVybiBUYWdUeXBlLlNFTEY7XG4gICAgfWVsc2V7XG4gICAgICAgIHJldHVybiBUYWdUeXBlLk9QRU5JTkc7XG4gICAgfVxufVxuXG52YXIgeG1sMmpzb24gPSBmdW5jdGlvbiAoeG1sRGF0YSxvcHRpb25zKXtcbiAgICBvcHRpb25zID0gYnVpbGRPcHRpb25zKG9wdGlvbnMpO1xuICAgIHJldHVybiBjb252ZXJ0VG9Kc29uKGdldFRyYXZlcnNhbE9iaih4bWxEYXRhLG9wdGlvbnMpLCBvcHRpb25zKTtcbn07XG5cbmZ1bmN0aW9uIHJlc29sdmVOYW1lU3BhY2UodGFnbmFtZSxvcHRpb25zKXtcbiAgICBpZihvcHRpb25zLmlnbm9yZU5hbWVTcGFjZSApe1xuICAgICAgICB2YXIgdGFncyA9IHRhZ25hbWUuc3BsaXQoXCI6XCIpO1xuICAgICAgICB2YXIgcHJlZml4ID0gdGFnbmFtZS5jaGFyQXQoMCkgPT09IFwiL1wiID8gXCIvXCIgOiBcIlwiO1xuICAgICAgICBpZih0YWdzLmxlbmd0aCA9PT0gMikge1xuICAgICAgICAgICAgaWYodGFnc1swXSA9PT0gXCJ4bWxuc1wiKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIFwiXCI7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICB0YWduYW1lID0gcHJlZml4ICsgdGFnc1sxXTtcbiAgICAgICAgfVxuICAgIH1cbiAgICByZXR1cm4gdGFnbmFtZTtcbn1cblxuZnVuY3Rpb24gcGFyc2VWYWx1ZSh2YWwsc2hvdWxkUGFyc2Upe1xuICAgIGlmKHNob3VsZFBhcnNlICYmIHR5cGVvZiB2YWwgPT09IFwic3RyaW5nXCIpe1xuICAgICAgICBpZih2YWwudHJpbSgpID09PSBcIlwiIHx8IGlzTmFOKHZhbCkpe1xuICAgICAgICAgICAgdmFsID0gdmFsID09PSBcInRydWVcIiA/IHRydWUgOiB2YWwgPT09IFwiZmFsc2VcIiA/IGZhbHNlIDogdmFsO1xuICAgICAgICB9ZWxzZXtcbiAgICAgICAgICAgIGlmKHZhbC5pbmRleE9mKFwiLlwiKSAhPT0gLTEpe1xuICAgICAgICAgICAgICAgIHZhbCA9IE51bWJlci5wYXJzZUZsb2F0KHZhbCk7XG4gICAgICAgICAgICB9ZWxzZXtcbiAgICAgICAgICAgICAgICB2YWwgPSBOdW1iZXIucGFyc2VJbnQodmFsLDEwKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gdmFsO1xuICAgIH1lbHNle1xuICAgICAgICBpZih1dGlsLmlzRXhpc3QodmFsKSkgcmV0dXJuIHZhbDtcbiAgICAgICAgZWxzZSByZXR1cm4gIFwiXCI7XG4gICAgfVxufVxuXG4vL1RPRE86IGNoYW5nZSByZWdleCB0byBjYXB0dXJlIE5TXG4vL3ZhciBhdHRyc1JlZ3ggPSBuZXcgUmVnRXhwKFwiKFtcXFxcd1xcXFwtXFxcXC5cXFxcOl0rKVxcXFxzKj1cXFxccyooWydcXFwiXSkoKC58XFxuKSo/KVxcXFwyXCIsXCJnbVwiKTtcbnZhciBhdHRyc1JlZ3ggPSBuZXcgUmVnRXhwKFwiKFteXFxcXHM9XSspXFxcXHMqKD1cXFxccyooWydcXFwiXSkoLio/KVxcXFwzKT9cIixcImdcIik7XG5mdW5jdGlvbiBidWlsZEF0dHJpYnV0ZXNNYXAoYXR0clN0cixvcHRpb25zKXtcbiAgICBpZiggIW9wdGlvbnMuaWdub3JlQXR0cmlidXRlcyAmJiB0eXBlb2YgYXR0clN0ciA9PT0gXCJzdHJpbmdcIiApe1xuICAgICAgICBhdHRyU3RyID0gYXR0clN0ci5yZXBsYWNlKC9cXHI/XFxuL2csIFwiIFwiKTtcbiAgICAgICAgLy9hdHRyU3RyID0gYXR0clN0ciB8fCBhdHRyU3RyLnRyaW0oKTtcbiAgICAgICAgXG4gICAgICAgIHZhciBtYXRjaGVzID0gdXRpbC5nZXRBbGxNYXRjaGVzKGF0dHJTdHIsYXR0cnNSZWd4KTtcbiAgICAgICAgdmFyIGxlbiA9IG1hdGNoZXMubGVuZ3RoOyAvL2Rvbid0IG1ha2UgaXQgaW5saW5lXG4gICAgICAgIHZhciBhdHRycyA9IHt9O1xuICAgICAgICBmb3IgKHZhciBpID0gMDsgaSA8IGxlbiA7IGkrKykge1xuICAgICAgICAgICAgdmFyIGF0dHJOYW1lID0gcmVzb2x2ZU5hbWVTcGFjZShtYXRjaGVzW2ldWzFdLG9wdGlvbnMpO1xuICAgICAgICAgICAgaWYoYXR0ck5hbWUubGVuZ3RoICYmIGF0dHJOYW1lICE9PSBcInhtbG5zXCIpIHtcbiAgICAgICAgICAgICAgICBpZihtYXRjaGVzW2ldWzRdKXtcbiAgICAgICAgICAgICAgICAgICAgaWYob3B0aW9ucy50cmltVmFsdWVzKXtcbiAgICAgICAgICAgICAgICAgICAgICAgIG1hdGNoZXNbaV1bNF0gPSBtYXRjaGVzW2ldWzRdLnRyaW0oKTtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICBpZihvcHRpb25zLmRlY29kZUhUTUxjaGFyKXtcbiAgICAgICAgICAgICAgICAgICAgICAgIG1hdGNoZXNbaV1bNF0gPSBoZS5kZWNvZGUobWF0Y2hlc1tpXVs0XSwge2lzQXR0cmlidXRlVmFsdWUgOiB0cnVlfSk7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgYXR0cnNbb3B0aW9ucy5hdHRyaWJ1dGVOYW1lUHJlZml4ICsgYXR0ck5hbWVdID0gcGFyc2VWYWx1ZShtYXRjaGVzW2ldWzRdLG9wdGlvbnMucGFyc2VBdHRyaWJ1dGVWYWx1ZSk7XG4gICAgICAgICAgICAgICAgfWVsc2UgaWYob3B0aW9ucy5hbGxvd0Jvb2xlYW5BdHRyaWJ1dGVzKXtcbiAgICAgICAgICAgICAgICAgICAgYXR0cnNbb3B0aW9ucy5hdHRyaWJ1dGVOYW1lUHJlZml4ICsgYXR0ck5hbWVdID0gdHJ1ZTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgXG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgaWYoIU9iamVjdC5rZXlzKGF0dHJzKS5sZW5ndGgpe1xuICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9XG4gICAgICAgIGlmKG9wdGlvbnMuYXR0ck5vZGVOYW1lKXtcbiAgICAgICAgICAgIHZhciBhdHRyQ29sbGVjdGlvbiA9IHt9O1xuICAgICAgICAgICAgYXR0ckNvbGxlY3Rpb25bb3B0aW9ucy5hdHRyTm9kZU5hbWVdID0gYXR0cnM7XG4gICAgICAgICAgICByZXR1cm4gYXR0ckNvbGxlY3Rpb247XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIGF0dHJzO1xuICAgIH1cbn1cblxudmFyIGNvbnZlcnRUb0pzb24gPSBmdW5jdGlvbiAobm9kZSwgb3B0aW9ucyl7XG4gICAgdmFyIGpPYmogPSB7fTtcblxuICAgIC8vdHJhdmVyIHRocm91Z2ggYWxsIHRoZSBjaGlsZHJlblxuICAgIGZvciAodmFyIGluZGV4ID0gMDsgaW5kZXggPCBub2RlLmNoaWxkLmxlbmd0aDsgaW5kZXgrKykge1xuICAgICAgICB2YXIgcHJvcCA9IG5vZGUuY2hpbGRbaW5kZXhdLnRhZ25hbWU7XG4gICAgICAgIHZhciBvYmogPSBjb252ZXJ0VG9Kc29uKG5vZGUuY2hpbGRbaW5kZXhdLG9wdGlvbnMpO1xuICAgICAgICBpZih0eXBlb2Ygak9ialtwcm9wXSAhPT0gXCJ1bmRlZmluZWRcIil7XG4gICAgICAgICAgICBpZighQXJyYXkuaXNBcnJheShqT2JqW3Byb3BdKSl7XG4gICAgICAgICAgICAgICAgdmFyIHN3YXAgPSBqT2JqW3Byb3BdO1xuICAgICAgICAgICAgICAgIGpPYmpbcHJvcF0gPSBbXTtcbiAgICAgICAgICAgICAgICBqT2JqW3Byb3BdLnB1c2goc3dhcCk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBqT2JqW3Byb3BdLnB1c2gob2JqKTtcbiAgICAgICAgfWVsc2V7XG4gICAgICAgICAgICBqT2JqW3Byb3BdID0gb3B0aW9ucy5hcnJheU1vZGUgPyBbb2JqXSA6IG9iajtcbiAgICAgICAgfVxuICAgIH1cbiAgICB1dGlsLm1lcmdlKGpPYmosbm9kZS5hdHRyc01hcCk7XG4gICAgLy9hZGQgYXR0cnNNYXAgYXMgbmV3IGNoaWxkcmVuXG4gICAgaWYodXRpbC5pc0VtcHR5T2JqZWN0KGpPYmopKXtcbiAgICAgICAgcmV0dXJuIHV0aWwuaXNFeGlzdChub2RlLnZhbCk/IG5vZGUudmFsIDogIFwiXCI7XG4gICAgfWVsc2V7XG4gICAgICAgIGlmKHV0aWwuaXNFeGlzdChub2RlLnZhbCkpe1xuICAgICAgICAgICAgaWYoISh0eXBlb2Ygbm9kZS52YWwgPT09IFwic3RyaW5nXCIgJiYgKG5vZGUudmFsID09PSBcIlwiIHx8IG5vZGUudmFsID09PSBvcHRpb25zLmNkYXRhUG9zaXRpb25DaGFyKSkpe1xuICAgICAgICAgICAgICAgIGpPYmpbb3B0aW9ucy50ZXh0Tm9kZU5hbWVdID0gbm9kZS52YWw7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICB9XG4gICAgLy9hZGQgdmFsdWVcbiAgICByZXR1cm4gak9iajtcbn07XG5cbmV4cG9ydHMucGFyc2UgPSB4bWwyanNvbjtcbmV4cG9ydHMuZ2V0VHJhdmVyc2FsT2JqID0gZ2V0VHJhdmVyc2FsT2JqO1xuZXhwb3J0cy5jb252ZXJ0VG9Kc29uID0gY29udmVydFRvSnNvbjtcbmV4cG9ydHMudmFsaWRhdGUgPSByZXF1aXJlKFwiLi92YWxpZGF0b3JcIikudmFsaWRhdGU7XG5leHBvcnRzLmoyeFBhcnNlciA9IHJlcXVpcmUoXCIuL2oyeFwiKTtcbiIsInZhciBnZXRBbGxNYXRjaGVzID0gZnVuY3Rpb24oc3RyaW5nLCByZWdleCkge1xuICB2YXIgbWF0Y2hlcyA9IFtdO1xuICB2YXIgbWF0Y2ggPSByZWdleC5leGVjKHN0cmluZyk7XG4gIHdoaWxlIChtYXRjaCkge1xuICAgIHZhciBhbGxtYXRjaGVzID0gW107XG4gICAgdmFyIGxlbiA9IG1hdGNoLmxlbmd0aDtcbiAgICBmb3IgKHZhciBpbmRleCA9IDA7IGluZGV4IDwgbGVuOyBpbmRleCsrKSB7XG4gIFx0XHRhbGxtYXRjaGVzLnB1c2gobWF0Y2hbaW5kZXhdKTtcbiAgXHR9XG4gICAgbWF0Y2hlcy5wdXNoKGFsbG1hdGNoZXMpO1xuICAgIG1hdGNoID0gcmVnZXguZXhlYyhzdHJpbmcpO1xuICB9XG4gIHJldHVybiBtYXRjaGVzO1xufTtcblxuXG52YXIgZG9lc01hdGNoID0gZnVuY3Rpb24oc3RyaW5nLHJlZ2V4KXtcbiAgdmFyIG1hdGNoID0gcmVnZXguZXhlYyhzdHJpbmcpO1xuICBpZihtYXRjaCA9PT0gbnVsbCB8fCB0eXBlb2YgbWF0Y2ggPT09IFwidW5kZWZpbmVkXCIpIHJldHVybiBmYWxzZTtcbiAgZWxzZSByZXR1cm4gdHJ1ZTtcbn1cblxudmFyIGRvZXNOb3RNYXRjaCA9IGZ1bmN0aW9uKHN0cmluZyxyZWdleCl7XG4gIHJldHVybiAhZG9lc01hdGNoKHN0cmluZyxyZWdleCk7XG59XG5cblxuZXhwb3J0cy5pc0V4aXN0PSBmdW5jdGlvbih2KXtcbiAgcmV0dXJuIHR5cGVvZiB2ICE9PSBcInVuZGVmaW5lZFwiO1xufVxuXG5leHBvcnRzLmlzRW1wdHlPYmplY3Q9IGZ1bmN0aW9uKG9iaikge1xuICByZXR1cm4gT2JqZWN0LmtleXMob2JqKS5sZW5ndGggPT09IDBcbn1cblxuLyoqXG4gKiBDb3B5IGFsbCB0aGUgcHJvcGVydGllcyBvZiBhIGludG8gYi5cbiAqIEBwYXJhbSB7Kn0gdGFyZ2V0XG4gKiBAcGFyYW0geyp9IGEgXG4gKi9cbmV4cG9ydHMubWVyZ2UgPWZ1bmN0aW9uICh0YXJnZXQsYSl7XG4gIGlmKGEpe1xuICAgIHZhciBrZXlzID0gT2JqZWN0LmtleXMoYSkgLy8gd2lsbCByZXR1cm4gYW4gYXJyYXkgb2Ygb3duIHByb3BlcnRpZXNcbiAgICB2YXIgbGVuID0ga2V5cy5sZW5ndGg7IC8vZG9uJ3QgbWFrZSBpdCBpbmxpbmVcbiAgICBmb3IodmFyIGkgPSAwOyBpIDwgbGVuOyBpKyspe1xuICAgICAgdGFyZ2V0W2tleXNbaV1dID0gYVtrZXlzW2ldXSA7XG4gICAgfVxuICB9XG59XG4vKiBleHBvcnRzLm1lcmdlID1mdW5jdGlvbiAoYixhKXtcbiAgcmV0dXJuIE9iamVjdC5hc3NpZ24oYixhKTtcbn0gKi9cblxuZXhwb3J0cy5nZXRWYWx1ZSA9IGZ1bmN0aW9uICh2KXtcbiAgaWYoZXhwb3J0cy5pc0V4aXN0KHYpKXtcbiAgICAgIHJldHVybiB2O1xuICB9ZWxzZXtcbiAgICAgIHJldHVybiBcIlwiO1xuICB9XG59XG5cbnZhciBmYWtlQ2FsbCA9ICBmdW5jdGlvbihhKSB7cmV0dXJuIGE7fVxudmFyIGZha2VDYWxsTm9SZXR1cm4gPSAgZnVuY3Rpb24oKSB7fVxuXG5leHBvcnRzLmRvZXNNYXRjaCA9IGRvZXNNYXRjaFxuZXhwb3J0cy5kb2VzTm90TWF0Y2ggPSBkb2VzTm90TWF0Y2hcbmV4cG9ydHMuZ2V0QWxsTWF0Y2hlcyA9IGdldEFsbE1hdGNoZXM7IiwidmFyIHV0aWwgPSByZXF1aXJlKFwiLi91dGlsXCIpO1xuXG5cbnZhciBkZWZhdWx0T3B0aW9ucyA9IHtcbiAgICBhbGxvd0Jvb2xlYW5BdHRyaWJ1dGVzIDogZmFsc2UsICAgICAgICAgLy9BIHRhZyBjYW4gaGF2ZSBhdHRyaWJ1dGVzIHdpdGhvdXQgYW55IHZhbHVlXG59O1xuXG52YXIgYnVpbGRPcHRpb25zID0gZnVuY3Rpb24gKG9wdGlvbnMpe1xuICAgIGlmKCFvcHRpb25zKSBvcHRpb25zID0ge307XG4gICAgdmFyIHByb3BzID0gW1wiYWxsb3dCb29sZWFuQXR0cmlidXRlc1wiXTtcbiAgICBmb3IgKHZhciBpID0gMDsgaSA8IHByb3BzLmxlbmd0aDsgaSsrKSB7XG4gICAgICAgIGlmKG9wdGlvbnNbcHJvcHNbaV1dID09PSB1bmRlZmluZWQpe1xuICAgICAgICAgICAgb3B0aW9uc1twcm9wc1tpXV0gPSBkZWZhdWx0T3B0aW9uc1twcm9wc1tpXV07XG4gICAgICAgIH1cbiAgICB9XG4gICAgcmV0dXJuIG9wdGlvbnM7XG59O1xuXG5cbi8vdmFyIHRhZ3NQYXR0ZXJuID0gbmV3IFJlZ0V4cChcIjxcXFxcLz8oW1xcXFx3OlxcXFwtX1xcLl0rKVxcXFxzKlxcLz8+XCIsXCJnXCIpO1xuZXhwb3J0cy52YWxpZGF0ZSA9IGZ1bmN0aW9uKHhtbERhdGEsIG9wdGlvbnMpe1xuICAgIG9wdGlvbnMgPSBidWlsZE9wdGlvbnMob3B0aW9ucyk7ICAgXG5cbiAgICAvL3htbERhdGEgPSB4bWxEYXRhLnJlcGxhY2UoLyhcXHJcXG58XFxufFxccikvZ20sXCJcIik7Ly9tYWtlIGl0IHNpbmdsZSBsaW5lXG4gICAgLy94bWxEYXRhID0geG1sRGF0YS5yZXBsYWNlKC8oXlxccyo8XFw/eG1sLio/XFw/PikvZyxcIlwiKTsvL1JlbW92ZSBYTUwgc3RhcnRpbmcgdGFnXG4gICAgLy94bWxEYXRhID0geG1sRGF0YS5yZXBsYWNlKC8oPCFET0NUWVBFW1xcc1xcd1xcXCJcXC5cXC9cXC1cXDpdKyhcXFsuKlxcXSkqXFxzKj4pL2csXCJcIik7Ly9SZW1vdmUgRE9DVFlQRVxuXG4gICAgdmFyIHRhZ3MgPSBbXTtcbiAgICB2YXIgdGFnRm91bmQgPSBmYWxzZTtcbiAgICBmb3IgKHZhciBpID0gMDsgaSA8IHhtbERhdGEubGVuZ3RoOyBpKyspIHtcblxuICAgICAgICBpZih4bWxEYXRhW2ldID09PSBcIjxcIil7Ly9zdGFydGluZyBvZiB0YWdcbiAgICAgICAgICAgIC8vcmVhZCB1bnRpbCB5b3UgcmVhY2ggdG8gJz4nIGF2b2lkaW5nIGFueSAnPicgaW4gYXR0cmlidXRlIHZhbHVlXG5cbiAgICAgICAgICAgIGkrKztcbiAgICAgICAgICAgIGlmKHhtbERhdGFbaV0gPT09IFwiP1wiKXtcbiAgICAgICAgICAgICAgICBpZihpICE9PSAxKXtcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIHtlcnIgOiB7IGNvZGUgOiBcIkludmFsaWRYbWxcIiwgbXNnIDogXCJYTUwgZGVjbGFyYXRpb24gYWxsb3dlZCBvbmx5IGF0IHRoZSBzdGFydCBvZiB0aGUgZG9jdW1lbnQuXCJ9fTtcbiAgICAgICAgICAgICAgICB9ZWxzZXtcbiAgICAgICAgICAgICAgICAgICAgLy9yZWFkIHVudGlsID8+IGlzIGZvdW5kXG4gICAgICAgICAgICAgICAgICAgIGZvcig7aTx4bWxEYXRhLmxlbmd0aDtpKyspe1xuICAgICAgICAgICAgICAgICAgICAgICAgaWYoeG1sRGF0YVtpXSA9PSBcIj9cIiAmJiB4bWxEYXRhW2krMV0gPT0gXCI+XCIpe1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGkrKztcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1lbHNlIGlmKHhtbERhdGFbaV0gPT09IFwiIVwiKXtcbiAgICAgICAgICAgICAgICBpID0gcmVhZENvbW1lbnRBbmRDREFUQSh4bWxEYXRhLGkpO1xuICAgICAgICAgICAgICAgIGNvbnRpbnVlO1xuICAgICAgICAgICAgfWVsc2V7XG4gICAgICAgICAgICAgICAgdmFyIGNsb3NpbmdUYWcgPSBmYWxzZTtcbiAgICAgICAgICAgICAgICBpZih4bWxEYXRhW2ldID09PSBcIi9cIil7Ly9jbG9zaW5nIHRhZ1xuICAgICAgICAgICAgICAgICAgICBjbG9zaW5nVGFnID0gdHJ1ZTtcbiAgICAgICAgICAgICAgICAgICAgaSsrO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAvL3JlYWQgdGFnbmFtZVxuICAgICAgICAgICAgICAgIHZhciB0YWdOYW1lID0gXCJcIjtcbiAgICAgICAgICAgICAgICBmb3IoO2kgPCB4bWxEYXRhLmxlbmd0aFxuICAgICAgICAgICAgICAgICAgICAmJiB4bWxEYXRhW2ldICE9PSBcIj5cIlxuICAgICAgICAgICAgICAgICAgICAmJiB4bWxEYXRhW2ldICE9PSBcIiBcIlxuICAgICAgICAgICAgICAgICAgICAmJiB4bWxEYXRhW2ldICE9PSBcIlxcdFwiIDsgaSsrKSB7XG5cbiAgICAgICAgICAgICAgICAgICAgdGFnTmFtZSArPXhtbERhdGFbaV07XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIHRhZ05hbWUgPSB0YWdOYW1lLnRyaW0oKTtcbiAgICAgICAgICAgICAgICAvL2NvbnNvbGUubG9nKHRhZ05hbWUpO1xuXG4gICAgICAgICAgICAgICAgaWYodGFnTmFtZVt0YWdOYW1lLmxlbmd0aC0xXSA9PT0gXCIvXCIpey8vc2VsZiBjbG9zaW5nIHRhZyB3aXRob3V0IGF0dHJpYnV0ZXNcbiAgICAgICAgICAgICAgICAgICAgdGFnTmFtZSA9IHRhZ05hbWUuc3Vic3RyaW5nKDAsdGFnTmFtZS5sZW5ndGgtMSk7XG4gICAgICAgICAgICAgICAgICAgIGNvbnRpbnVlO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBpZighdmFsaWRhdGVUYWdOYW1lKHRhZ05hbWUpKSBcbiAgICAgICAgICAgICAgICByZXR1cm4geyBlcnI6IHsgY29kZTpcIkludmFsaWRUYWdcIixtc2c6XCJUYWcgXCIgKyB0YWdOYW1lICsgXCIgaXMgYW4gaW52YWxpZCBuYW1lLlwifX07XG5cblxuICAgICAgICAgICAgICAgIHZhciByZXN1bHQgPSByZWFkQXR0cmlidXRlU3RyKHhtbERhdGEsaSk7XG4gICAgICAgICAgICAgICAgaWYocmVzdWx0ID09PSBmYWxzZSkge1xuICAgICAgICAgICAgICAgICAgICByZXR1cm4geyBlcnI6IHsgY29kZTpcIkludmFsaWRBdHRyXCIsbXNnOlwiQXR0cmlidXRlcyBmb3IgXCIgKyB0YWdOYW1lICsgXCIgaGF2ZSBvcGVuIHF1b3RlXCJ9fTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgdmFyIGF0dHJTdHIgPSByZXN1bHQudmFsdWU7XG4gICAgICAgICAgICAgICAgaSA9IHJlc3VsdC5pbmRleDtcblxuICAgICAgICAgICAgICAgIGlmKGF0dHJTdHJbYXR0clN0ci5sZW5ndGgtMV0gPT09IFwiL1wiICl7Ly9zZWxmIGNsb3NpbmcgdGFnXG4gICAgICAgICAgICAgICAgICAgIGF0dHJTdHIgPSBhdHRyU3RyLnN1YnN0cmluZygwLGF0dHJTdHIubGVuZ3RoLTEpO1xuICAgICAgICAgICAgICAgICAgICB2YXIgaXNWYWxpZCA9IHZhbGlkYXRlQXR0cmlidXRlU3RyaW5nKGF0dHJTdHIsIG9wdGlvbnMpO1xuICAgICAgICAgICAgICAgICAgICBpZihpc1ZhbGlkID09PSB0cnVlKXtcbiAgICAgICAgICAgICAgICAgICAgICAgIHRhZ0ZvdW5kID0gdHJ1ZTtcbiAgICAgICAgICAgICAgICAgICAgICAgIGNvbnRpbnVlO1xuICAgICAgICAgICAgICAgICAgICB9ZWxzZXtcbiAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybiBpc1ZhbGlkO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfWVsc2UgaWYoY2xvc2luZ1RhZyl7XG4gICAgICAgICAgICAgICAgICAgIGlmKGF0dHJTdHIudHJpbSgpLmxlbmd0aCA+IDApe1xuICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuIHsgZXJyOiB7IGNvZGU6XCJJbnZhbGlkVGFnXCIsbXNnOlwiY2xvc2luZyB0YWcgXCIgKyB0YWdOYW1lICsgXCIgY2FuJ3QgaGF2ZSBhdHRyaWJ1dGVzIG9yIGludmFsaWQgc3RhcnRpbmcuXCJ9fTtcbiAgICAgICAgICAgICAgICAgICAgfWVsc2V7XG4gICAgICAgICAgICAgICAgICAgICAgICB2YXIgb3RnID0gdGFncy5wb3AoKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIGlmKHRhZ05hbWUgIT09IG90Zyl7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuIHsgZXJyOiB7IGNvZGU6XCJJbnZhbGlkVGFnXCIsbXNnOlwiY2xvc2luZyB0YWcgXCIgKyBvdGcgKyBcIiBpcyBleHBlY3RlZCBpbnBsYWNlIG9mIFwiK3RhZ05hbWUrXCIuXCJ9fTtcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH1lbHNle1xuICAgICAgICAgICAgICAgICAgICB2YXIgaXNWYWxpZCA9IHZhbGlkYXRlQXR0cmlidXRlU3RyaW5nKGF0dHJTdHIsIG9wdGlvbnMpO1xuICAgICAgICAgICAgICAgICAgICBpZihpc1ZhbGlkICE9PSB0cnVlICl7XG4gICAgICAgICAgICAgICAgICAgICAgICByZXR1cm4gaXNWYWxpZDtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICB0YWdzLnB1c2godGFnTmFtZSk7IHRhZ0ZvdW5kID0gdHJ1ZTtcbiAgICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgICAgICAvL3NraXAgdGFnIHRleHQgdmFsdWVcbiAgICAgICAgICAgICAgICAvL0l0IG1heSBpbmNsdWRlIGNvbW1lbnRzIGFuZCBDREFUQSB2YWx1ZVxuICAgICAgICAgICAgICAgIGZvcihpKys7aSA8IHhtbERhdGEubGVuZ3RoIDsgaSsrKXtcbiAgICAgICAgICAgICAgICAgICAgaWYoeG1sRGF0YVtpXSA9PT0gXCI8XCIpe1xuICAgICAgICAgICAgICAgICAgICAgICAgaWYoeG1sRGF0YVtpKzFdID09PSBcIiFcIil7Ly9jb21tZW50IG9yIENBREFUQVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGkrKztcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBpID0gcmVhZENvbW1lbnRBbmRDREFUQSh4bWxEYXRhLGkpO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNvbnRpbnVlO1xuICAgICAgICAgICAgICAgICAgICAgICAgfWVsc2V7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9Ly9lbmQgb2YgcmVhZGluZyB0YWcgdGV4dCB2YWx1ZVxuICAgICAgICAgICAgICAgIGlmKHhtbERhdGFbaV0gPT09IFwiPFwiKSBpLS07XG4gICAgICAgICAgICB9XG4gICAgICAgIH1lbHNle1xuXG4gICAgICAgICAgICBpZih4bWxEYXRhW2ldID09PSBcIiBcIiB8fCB4bWxEYXRhW2ldID09PSBcIlxcdFwiIHx8IHhtbERhdGFbaV0gPT09IFwiXFxuXCIgfHwgeG1sRGF0YVtpXSA9PT0gXCJcXHJcIikgY29udGludWU7XG4gICAgICAgICAgICByZXR1cm4geyBlcnI6IHsgY29kZTpcIkludmFsaWRDaGFyXCIsbXNnOlwiY2hhciBcIiArIHhtbERhdGFbaV0gK1wiIGlzIG5vdCBleHBlY3RlZCAuXCJ9fTtcbiAgICAgICAgfVxuICAgIH1cblxuXG4gICAgaWYoIXRhZ0ZvdW5kKXtcbiAgICAgICAgcmV0dXJuIHtlcnIgOiB7IGNvZGUgOiBcIkludmFsaWRYbWxcIiwgbXNnIDogXCJTdGFydCB0YWcgZXhwZWN0ZWQuXCJ9fTtcbiAgICB9ZWxzZSBpZih0YWdzLmxlbmd0aCA+IDApe1xuICAgICAgICByZXR1cm4geyBlcnI6IHsgY29kZTpcIkludmFsaWRYbWxcIixtc2c6XCJJbnZhbGlkIFwiICsgSlNPTi5zdHJpbmdpZnkodGFncyxudWxsLDQpLnJlcGxhY2UoL1xccj9cXG4vZyxcIlwiKSArXCIgZm91bmQuXCJ9fTtcbiAgICB9XG5cbiAgICByZXR1cm4gdHJ1ZTtcbn1cblxuZnVuY3Rpb24gcmVhZENvbW1lbnRBbmRDREFUQSh4bWxEYXRhLGkpe1xuICAgIGlmKHhtbERhdGEubGVuZ3RoID4gaSs1ICYmIHhtbERhdGFbaSsxXSA9PT0gXCItXCIgJiYgeG1sRGF0YVtpKzJdID09PSBcIi1cIil7Ly9jb21tZW50XG4gICAgICAgIGZvcihpKz0zO2k8eG1sRGF0YS5sZW5ndGg7aSsrKXtcbiAgICAgICAgICAgIGlmKHhtbERhdGFbaV0gPT09IFwiLVwiICYmIHhtbERhdGFbaSsxXSA9PT0gXCItXCIgJiYgeG1sRGF0YVtpKzJdID09PSBcIj5cIil7XG4gICAgICAgICAgICAgICAgaSs9MjtcbiAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgIH1lbHNlIGlmKCB4bWxEYXRhLmxlbmd0aCA+IGkrOFxuICAgICAgICAmJiB4bWxEYXRhW2krMV0gPT09IFwiRFwiXG4gICAgICAgICYmIHhtbERhdGFbaSsyXSA9PT0gXCJPXCJcbiAgICAgICAgJiYgeG1sRGF0YVtpKzNdID09PSBcIkNcIlxuICAgICAgICAmJiB4bWxEYXRhW2krNF0gPT09IFwiVFwiXG4gICAgICAgICYmIHhtbERhdGFbaSs1XSA9PT0gXCJZXCJcbiAgICAgICAgJiYgeG1sRGF0YVtpKzZdID09PSBcIlBcIlxuICAgICAgICAmJiB4bWxEYXRhW2krN10gPT09IFwiRVwiKXtcbiAgICAgICAgICAgIHZhciBhbmdsZUJyYWNrZXRzQ291bnQgPSAxO1xuICAgICAgICAgICAgZm9yKGkrPTg7aTx4bWxEYXRhLmxlbmd0aDtpKyspe1xuICAgICAgICAgICAgICAgIGlmKHhtbERhdGFbaV0gPT0gXCI8XCIpIHthbmdsZUJyYWNrZXRzQ291bnQrKzt9XG4gICAgICAgICAgICAgICAgZWxzZSBpZih4bWxEYXRhW2ldID09IFwiPlwiKSB7XG4gICAgICAgICAgICAgICAgICAgIGFuZ2xlQnJhY2tldHNDb3VudC0tO1xuICAgICAgICAgICAgICAgICAgICBpZihhbmdsZUJyYWNrZXRzQ291bnQgPT09IDApIGJyZWFrO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICB9ZWxzZSBpZiggeG1sRGF0YS5sZW5ndGggPiBpKzlcbiAgICAgICAgJiYgeG1sRGF0YVtpKzFdID09PSBcIltcIlxuICAgICAgICAmJiB4bWxEYXRhW2krMl0gPT09IFwiQ1wiXG4gICAgICAgICYmIHhtbERhdGFbaSszXSA9PT0gXCJEXCJcbiAgICAgICAgJiYgeG1sRGF0YVtpKzRdID09PSBcIkFcIlxuICAgICAgICAmJiB4bWxEYXRhW2krNV0gPT09IFwiVFwiXG4gICAgICAgICYmIHhtbERhdGFbaSs2XSA9PT0gXCJBXCJcbiAgICAgICAgJiYgeG1sRGF0YVtpKzddID09PSBcIltcIil7XG5cbiAgICAgICAgZm9yKGkrPTg7aTx4bWxEYXRhLmxlbmd0aDtpKyspe1xuICAgICAgICAgICAgaWYoeG1sRGF0YVtpXSA9PT0gXCJdXCIgJiYgeG1sRGF0YVtpKzFdID09PSBcIl1cIiAmJiB4bWxEYXRhW2krMl0gPT09IFwiPlwiICl7XG4gICAgICAgICAgICAgICAgaSs9MjtcbiAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgIH1cblxuICAgIHJldHVybiBpO1xufVxuXG4vKipcbiAqIEtlZXAgcmVhZGluZyB4bWxEYXRhIHVudGlsICc8JyBpcyBmb3VuZCBvdXRzaWRlIHRoZSBhdHRyaWJ1dGUgdmFsdWUuXG4gKiBAcGFyYW0ge3N0cmluZ30geG1sRGF0YSBcbiAqIEBwYXJhbSB7bnVtYmVyfSBpIFxuICovXG5mdW5jdGlvbiByZWFkQXR0cmlidXRlU3RyKHhtbERhdGEsaSl7XG4gICAgdmFyIGF0dHJTdHIgPSBcIlwiO1xuICAgIHZhciBzdGFydENoYXIgPSBcIlwiO1xuICAgIGZvcig7aSA8IHhtbERhdGEubGVuZ3RoIDtpKyspe1xuICAgICAgICBpZih4bWxEYXRhW2ldID09PSAnXCInIHx8IHhtbERhdGFbaV0gPT09IFwiJ1wiKXtcbiAgICAgICAgICAgIGlmKHN0YXJ0Q2hhciA9PT0gXCJcIil7XG4gICAgICAgICAgICAgICAgc3RhcnRDaGFyID0geG1sRGF0YVtpXTtcbiAgICAgICAgICAgIH1lbHNle1xuICAgICAgICAgICAgICAgIHN0YXJ0Q2hhciA9IFwiXCI7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1lbHNlIGlmKHhtbERhdGFbaV0gPT09IFwiPlwiKXtcbiAgICAgICAgICAgIGlmKHN0YXJ0Q2hhciA9PT0gXCJcIil7XG4gICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgYXR0clN0ciArPSB4bWxEYXRhW2ldO1xuICAgIH1cbiAgICBpZihzdGFydENoYXIgIT09IFwiXCIpIHJldHVybiBmYWxzZTtcblxuICAgIHJldHVybiB7IHZhbHVlOiBhdHRyU3RyLCBpbmRleDogaX07XG59XG5cbi8qKlxuICogU2VsZWN0IGFsbCB0aGUgYXR0cmlidXRlcyB3aGV0aGVyIHZhbGlkIG9yIGludmFsaWQuXG4gKi9cbnZhciB2YWxpZEF0dHJTdHJSZWd4cCA9IG5ldyBSZWdFeHAoXCIoXFxcXHMqKShbXlxcXFxzPV0rKShcXFxccyo9KT8oXFxcXHMqKFsnXFxcIl0pKChbXFxcXHNcXFxcU10pKj8pXFxcXDUpP1wiLCBcImdcIik7XG5cbi8vYXR0ciwgPVwic2RcIiwgYT1cImFtaXQnc1wiLCBhPVwic2RcImI9XCJzYWZcIiwgYWIgIGNkPVwiXCJcblxuZnVuY3Rpb24gdmFsaWRhdGVBdHRyaWJ1dGVTdHJpbmcoYXR0clN0cixvcHRpb25zKXtcbiAgICAvL2NvbnNvbGUubG9nKFwic3RhcnQ6XCIrYXR0clN0citcIjplbmRcIik7XG5cbiAgICAvL2lmKGF0dHJTdHIudHJpbSgpLmxlbmd0aCA9PT0gMCkgcmV0dXJuIHRydWU7IC8vZW1wdHkgc3RyaW5nXG5cbiAgICB2YXIgbWF0Y2hlcyA9IHV0aWwuZ2V0QWxsTWF0Y2hlcyhhdHRyU3RyLHZhbGlkQXR0clN0clJlZ3hwKTtcbiAgICB2YXIgYXR0ck5hbWVzID0gW107XG4gICAgdmFyIGF0dHJPYmogPSB7fTtcblxuXG4gICAgZm9yKHZhciBpPTA7aTxtYXRjaGVzLmxlbmd0aDtpKyspe1xuICAgICAgICAvL2NvbnNvbGUubG9nKG1hdGNoZXNbaV0pO1xuICAgICAgICBcbiAgICAgICAgaWYobWF0Y2hlc1tpXVsxXS5sZW5ndGggPT09IDApey8vbm9zcGFjZSBiZWZvcmUgYXR0cmlidXRlIG5hbWU6IGE9XCJzZFwiYj1cInNhZlwiXG4gICAgICAgICAgICByZXR1cm4geyBlcnI6IHsgY29kZTpcIkludmFsaWRBdHRyXCIsbXNnOlwiYXR0cmlidXRlIFwiICsgbWF0Y2hlc1tpXVsyXSArIFwiIGhhcyBubyBzcGFjZSBpbiBzdGFydGluZy5cIn19O1xuICAgICAgICB9ZWxzZSBpZihtYXRjaGVzW2ldWzNdID09PSB1bmRlZmluZWQgJiYgIW9wdGlvbnMuYWxsb3dCb29sZWFuQXR0cmlidXRlcyl7Ly9pbmRlcGVuZGVudCBhdHRyaWJ1dGU6IGFiIFxuICAgICAgICAgICAgcmV0dXJuIHsgZXJyOiB7IGNvZGU6XCJJbnZhbGlkQXR0clwiLG1zZzpcImJvb2xlYW4gYXR0cmlidXRlIFwiICsgbWF0Y2hlc1tpXVsyXSArIFwiIGlzIG5vdCBhbGxvd2VkLlwifX07XG4gICAgICAgIH0vKiBlbHNlIGlmKG1hdGNoZXNbaV1bNl0gPT09IHVuZGVmaW5lZCl7Ly9hdHRyaWJ1dGUgd2l0aG91dCB2YWx1ZTogYWI9XG4gICAgICAgICAgICByZXR1cm4geyBlcnI6IHsgY29kZTpcIkludmFsaWRBdHRyXCIsbXNnOlwiYXR0cmlidXRlIFwiICsgbWF0Y2hlc1tpXVsyXSArIFwiIGhhcyBubyB2YWx1ZSBhc3NpZ25lZC5cIn19O1xuICAgICAgICB9ICovXG4gICAgICAgIHZhciBhdHRyTmFtZT1tYXRjaGVzW2ldWzJdO1xuICAgICAgICBpZighdmFsaWRhdGVBdHRyTmFtZShhdHRyTmFtZSkpe1xuICAgICAgICAgICAgcmV0dXJuIHsgZXJyOiB7IGNvZGU6XCJJbnZhbGlkQXR0clwiLG1zZzpcImF0dHJpYnV0ZSBcIiArIGF0dHJOYW1lICsgXCIgaXMgYW4gaW52YWxpZCBuYW1lLlwifX07XG4gICAgICAgIH1cbiAgICAgICAgaWYoIWF0dHJOYW1lcy5oYXNPd25Qcm9wZXJ0eShhdHRyTmFtZSkpey8vY2hlY2sgZm9yIGR1cGxpY2F0ZSBhdHRyaWJ1dGUuXG4gICAgICAgICAgICBhdHRyTmFtZXNbYXR0ck5hbWVdPTE7XG4gICAgICAgIH1lbHNle1xuICAgICAgICAgICAgcmV0dXJuIHsgZXJyOiB7IGNvZGU6XCJJbnZhbGlkQXR0clwiLG1zZzpcImF0dHJpYnV0ZSBcIiArIGF0dHJOYW1lICsgXCIgaXMgcmVwZWF0ZWQuXCJ9fTtcbiAgICAgICAgfVxuICAgIH1cblxuICAgIHJldHVybiB0cnVlO1xuICAgIFxufVxuXG52YXIgdmFsaWRBdHRyUmVneHAgPSBuZXcgUmVnRXhwKFwiXltfYS16QS1aXVtcXFxcd1xcXFwtXFxcXC5cXFxcOl0qJFwiKTtcblxuXG5mdW5jdGlvbiB2YWxpZGF0ZUF0dHJOYW1lKGF0dHJOYW1lKXtcbiAgICByZXR1cm4gdXRpbC5kb2VzTWF0Y2goYXR0ck5hbWUsdmFsaWRBdHRyUmVneHApO1xufVxuLy92YXIgc3RhcnRzV2l0aFhNTCA9IG5ldyBSZWdFeHAoXCJeW1h4XVtNbV1bTGxdXCIpO1xudmFyIHN0YXJ0c1dpdGggPSBuZXcgUmVnRXhwKFwiXihbYS16QS1aXXxfKVtcXFxcd1xcLlxcXFwtXzpdKlwiKTtcblxuZnVuY3Rpb24gdmFsaWRhdGVUYWdOYW1lKHRhZ25hbWUpe1xuICAgIC8qaWYodXRpbC5kb2VzTWF0Y2godGFnbmFtZSxzdGFydHNXaXRoWE1MKSkgcmV0dXJuIGZhbHNlO1xuICAgIGVsc2UqLyBpZih1dGlsLmRvZXNOb3RNYXRjaCh0YWduYW1lLHN0YXJ0c1dpdGgpKSByZXR1cm4gZmFsc2U7XG4gICAgZWxzZSByZXR1cm4gdHJ1ZTtcbn1cblxuXG4iLCJtb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uKHRhZ25hbWUscGFyZW50LHZhbCl7XG4gICAgdGhpcy50YWduYW1lID0gdGFnbmFtZTtcbiAgICB0aGlzLnBhcmVudCA9IHBhcmVudDtcbiAgICB0aGlzLmNoaWxkID0gW107Ly9jaGlsZCB0YWdzXG4gICAgdGhpcy5hdHRyc01hcDsvL2F0dHJpYnV0ZXMgbWFwXG4gICAgdGhpcy52YWwgPSB2YWw7Ly90ZXh0IG9ubHlcbiAgICB0aGlzLmFkZENoaWxkID0gZnVuY3Rpb24gKGNoaWxkKXtcbiAgICAgICAgdGhpcy5jaGlsZC5wdXNoKGNoaWxkKTtcbiAgICB9O1xufTsiLCIoZnVuY3Rpb24gKEJ1ZmZlcil7XG4ndXNlIHN0cmljdCc7XG5jb25zdCB0b0J5dGVzID0gcyA9PiBbLi4uc10ubWFwKGMgPT4gYy5jaGFyQ29kZUF0KDApKTtcbmNvbnN0IHhwaVppcEZpbGVuYW1lID0gdG9CeXRlcygnTUVUQS1JTkYvbW96aWxsYS5yc2EnKTtcbmNvbnN0IG94bWxDb250ZW50VHlwZXMgPSB0b0J5dGVzKCdbQ29udGVudF9UeXBlc10ueG1sJyk7XG5jb25zdCBveG1sUmVscyA9IHRvQnl0ZXMoJ19yZWxzLy5yZWxzJyk7XG5cbmZ1bmN0aW9uIHJlYWRVSW50NjRMRShidWYsIG9mZnNldCA9IDApIHtcblx0bGV0IG4gPSBidWZbb2Zmc2V0XTtcblx0bGV0IG11bCA9IDE7XG5cdGxldCBpID0gMDtcblx0d2hpbGUgKCsraSA8IDgpIHtcblx0XHRtdWwgKj0gMHgxMDA7XG5cdFx0biArPSBidWZbb2Zmc2V0ICsgaV0gKiBtdWw7XG5cdH1cblxuXHRyZXR1cm4gbjtcbn1cblxuY29uc3QgZmlsZVR5cGUgPSBpbnB1dCA9PiB7XG5cdGlmICghKGlucHV0IGluc3RhbmNlb2YgVWludDhBcnJheSB8fCBCdWZmZXIuaXNCdWZmZXIoaW5wdXQpKSkge1xuXHRcdHRocm93IG5ldyBUeXBlRXJyb3IoYEV4cGVjdGVkIHRoZSBcXGBpbnB1dFxcYCBhcmd1bWVudCB0byBiZSBvZiB0eXBlIFxcYFVpbnQ4QXJyYXlcXGAgb3IgXFxgQnVmZmVyXFxgLCBnb3QgXFxgJHt0eXBlb2YgaW5wdXR9XFxgYCk7XG5cdH1cblxuXHRjb25zdCBidWYgPSBpbnB1dCBpbnN0YW5jZW9mIFVpbnQ4QXJyYXkgPyBpbnB1dCA6IG5ldyBVaW50OEFycmF5KGlucHV0KTtcblxuXHRpZiAoIShidWYgJiYgYnVmLmxlbmd0aCA+IDEpKSB7XG5cdFx0cmV0dXJuIG51bGw7XG5cdH1cblxuXHRjb25zdCBjaGVjayA9IChoZWFkZXIsIG9wdGlvbnMpID0+IHtcblx0XHRvcHRpb25zID0gT2JqZWN0LmFzc2lnbih7XG5cdFx0XHRvZmZzZXQ6IDBcblx0XHR9LCBvcHRpb25zKTtcblxuXHRcdGZvciAobGV0IGkgPSAwOyBpIDwgaGVhZGVyLmxlbmd0aDsgaSsrKSB7XG5cdFx0XHQvLyBJZiBhIGJpdG1hc2sgaXMgc2V0XG5cdFx0XHRpZiAob3B0aW9ucy5tYXNrKSB7XG5cdFx0XHRcdC8vIElmIGhlYWRlciBkb2Vzbid0IGVxdWFsIGBidWZgIHdpdGggYml0cyBtYXNrZWQgb2ZmXG5cdFx0XHRcdGlmIChoZWFkZXJbaV0gIT09IChvcHRpb25zLm1hc2tbaV0gJiBidWZbaSArIG9wdGlvbnMub2Zmc2V0XSkpIHtcblx0XHRcdFx0XHRyZXR1cm4gZmFsc2U7XG5cdFx0XHRcdH1cblx0XHRcdH0gZWxzZSBpZiAoaGVhZGVyW2ldICE9PSBidWZbaSArIG9wdGlvbnMub2Zmc2V0XSkge1xuXHRcdFx0XHRyZXR1cm4gZmFsc2U7XG5cdFx0XHR9XG5cdFx0fVxuXG5cdFx0cmV0dXJuIHRydWU7XG5cdH07XG5cblx0Y29uc3QgY2hlY2tTdHJpbmcgPSAoaGVhZGVyLCBvcHRpb25zKSA9PiBjaGVjayh0b0J5dGVzKGhlYWRlciksIG9wdGlvbnMpO1xuXG5cdGlmIChjaGVjayhbMHhGRiwgMHhEOCwgMHhGRl0pKSB7XG5cdFx0cmV0dXJuIHtcblx0XHRcdGV4dDogJ2pwZycsXG5cdFx0XHRtaW1lOiAnaW1hZ2UvanBlZydcblx0XHR9O1xuXHR9XG5cblx0aWYgKGNoZWNrKFsweDg5LCAweDUwLCAweDRFLCAweDQ3LCAweDBELCAweDBBLCAweDFBLCAweDBBXSkpIHtcblx0XHRyZXR1cm4ge1xuXHRcdFx0ZXh0OiAncG5nJyxcblx0XHRcdG1pbWU6ICdpbWFnZS9wbmcnXG5cdFx0fTtcblx0fVxuXG5cdGlmIChjaGVjayhbMHg0NywgMHg0OSwgMHg0Nl0pKSB7XG5cdFx0cmV0dXJuIHtcblx0XHRcdGV4dDogJ2dpZicsXG5cdFx0XHRtaW1lOiAnaW1hZ2UvZ2lmJ1xuXHRcdH07XG5cdH1cblxuXHRpZiAoY2hlY2soWzB4NTcsIDB4NDUsIDB4NDIsIDB4NTBdLCB7b2Zmc2V0OiA4fSkpIHtcblx0XHRyZXR1cm4ge1xuXHRcdFx0ZXh0OiAnd2VicCcsXG5cdFx0XHRtaW1lOiAnaW1hZ2Uvd2VicCdcblx0XHR9O1xuXHR9XG5cblx0aWYgKGNoZWNrKFsweDQ2LCAweDRDLCAweDQ5LCAweDQ2XSkpIHtcblx0XHRyZXR1cm4ge1xuXHRcdFx0ZXh0OiAnZmxpZicsXG5cdFx0XHRtaW1lOiAnaW1hZ2UvZmxpZidcblx0XHR9O1xuXHR9XG5cblx0Ly8gTmVlZHMgdG8gYmUgYmVmb3JlIGB0aWZgIGNoZWNrXG5cdGlmIChcblx0XHQoY2hlY2soWzB4NDksIDB4NDksIDB4MkEsIDB4MF0pIHx8IGNoZWNrKFsweDRELCAweDRELCAweDAsIDB4MkFdKSkgJiZcblx0XHRjaGVjayhbMHg0MywgMHg1Ml0sIHtvZmZzZXQ6IDh9KVxuXHQpIHtcblx0XHRyZXR1cm4ge1xuXHRcdFx0ZXh0OiAnY3IyJyxcblx0XHRcdG1pbWU6ICdpbWFnZS94LWNhbm9uLWNyMidcblx0XHR9O1xuXHR9XG5cblx0aWYgKFxuXHRcdGNoZWNrKFsweDQ5LCAweDQ5LCAweDJBLCAweDBdKSB8fFxuXHRcdGNoZWNrKFsweDRELCAweDRELCAweDAsIDB4MkFdKVxuXHQpIHtcblx0XHRyZXR1cm4ge1xuXHRcdFx0ZXh0OiAndGlmJyxcblx0XHRcdG1pbWU6ICdpbWFnZS90aWZmJ1xuXHRcdH07XG5cdH1cblxuXHRpZiAoY2hlY2soWzB4NDIsIDB4NERdKSkge1xuXHRcdHJldHVybiB7XG5cdFx0XHRleHQ6ICdibXAnLFxuXHRcdFx0bWltZTogJ2ltYWdlL2JtcCdcblx0XHR9O1xuXHR9XG5cblx0aWYgKGNoZWNrKFsweDQ5LCAweDQ5LCAweEJDXSkpIHtcblx0XHRyZXR1cm4ge1xuXHRcdFx0ZXh0OiAnanhyJyxcblx0XHRcdG1pbWU6ICdpbWFnZS92bmQubXMtcGhvdG8nXG5cdFx0fTtcblx0fVxuXG5cdGlmIChjaGVjayhbMHgzOCwgMHg0MiwgMHg1MCwgMHg1M10pKSB7XG5cdFx0cmV0dXJuIHtcblx0XHRcdGV4dDogJ3BzZCcsXG5cdFx0XHRtaW1lOiAnaW1hZ2Uvdm5kLmFkb2JlLnBob3Rvc2hvcCdcblx0XHR9O1xuXHR9XG5cblx0Ly8gWmlwLWJhc2VkIGZpbGUgZm9ybWF0c1xuXHQvLyBOZWVkIHRvIGJlIGJlZm9yZSB0aGUgYHppcGAgY2hlY2tcblx0aWYgKGNoZWNrKFsweDUwLCAweDRCLCAweDMsIDB4NF0pKSB7XG5cdFx0aWYgKFxuXHRcdFx0Y2hlY2soWzB4NkQsIDB4NjksIDB4NkQsIDB4NjUsIDB4NzQsIDB4NzksIDB4NzAsIDB4NjUsIDB4NjEsIDB4NzAsIDB4NzAsIDB4NkMsIDB4NjksIDB4NjMsIDB4NjEsIDB4NzQsIDB4NjksIDB4NkYsIDB4NkUsIDB4MkYsIDB4NjUsIDB4NzAsIDB4NzUsIDB4NjIsIDB4MkIsIDB4N0EsIDB4NjksIDB4NzBdLCB7b2Zmc2V0OiAzMH0pXG5cdFx0KSB7XG5cdFx0XHRyZXR1cm4ge1xuXHRcdFx0XHRleHQ6ICdlcHViJyxcblx0XHRcdFx0bWltZTogJ2FwcGxpY2F0aW9uL2VwdWIremlwJ1xuXHRcdFx0fTtcblx0XHR9XG5cblx0XHQvLyBBc3N1bWVzIHNpZ25lZCBgLnhwaWAgZnJvbSBhZGRvbnMubW96aWxsYS5vcmdcblx0XHRpZiAoY2hlY2soeHBpWmlwRmlsZW5hbWUsIHtvZmZzZXQ6IDMwfSkpIHtcblx0XHRcdHJldHVybiB7XG5cdFx0XHRcdGV4dDogJ3hwaScsXG5cdFx0XHRcdG1pbWU6ICdhcHBsaWNhdGlvbi94LXhwaW5zdGFsbCdcblx0XHRcdH07XG5cdFx0fVxuXG5cdFx0aWYgKGNoZWNrU3RyaW5nKCdtaW1ldHlwZWFwcGxpY2F0aW9uL3ZuZC5vYXNpcy5vcGVuZG9jdW1lbnQudGV4dCcsIHtvZmZzZXQ6IDMwfSkpIHtcblx0XHRcdHJldHVybiB7XG5cdFx0XHRcdGV4dDogJ29kdCcsXG5cdFx0XHRcdG1pbWU6ICdhcHBsaWNhdGlvbi92bmQub2FzaXMub3BlbmRvY3VtZW50LnRleHQnXG5cdFx0XHR9O1xuXHRcdH1cblxuXHRcdGlmIChjaGVja1N0cmluZygnbWltZXR5cGVhcHBsaWNhdGlvbi92bmQub2FzaXMub3BlbmRvY3VtZW50LnNwcmVhZHNoZWV0Jywge29mZnNldDogMzB9KSkge1xuXHRcdFx0cmV0dXJuIHtcblx0XHRcdFx0ZXh0OiAnb2RzJyxcblx0XHRcdFx0bWltZTogJ2FwcGxpY2F0aW9uL3ZuZC5vYXNpcy5vcGVuZG9jdW1lbnQuc3ByZWFkc2hlZXQnXG5cdFx0XHR9O1xuXHRcdH1cblxuXHRcdGlmIChjaGVja1N0cmluZygnbWltZXR5cGVhcHBsaWNhdGlvbi92bmQub2FzaXMub3BlbmRvY3VtZW50LnByZXNlbnRhdGlvbicsIHtvZmZzZXQ6IDMwfSkpIHtcblx0XHRcdHJldHVybiB7XG5cdFx0XHRcdGV4dDogJ29kcCcsXG5cdFx0XHRcdG1pbWU6ICdhcHBsaWNhdGlvbi92bmQub2FzaXMub3BlbmRvY3VtZW50LnByZXNlbnRhdGlvbidcblx0XHRcdH07XG5cdFx0fVxuXG5cdFx0Ly8gVGhlIGRvY3gsIHhsc3ggYW5kIHBwdHggZmlsZSB0eXBlcyBleHRlbmQgdGhlIE9mZmljZSBPcGVuIFhNTCBmaWxlIGZvcm1hdDpcblx0XHQvLyBodHRwczovL2VuLndpa2lwZWRpYS5vcmcvd2lraS9PZmZpY2VfT3Blbl9YTUxfZmlsZV9mb3JtYXRzXG5cdFx0Ly8gV2UgbG9vayBmb3I6XG5cdFx0Ly8gLSBvbmUgZW50cnkgbmFtZWQgJ1tDb250ZW50X1R5cGVzXS54bWwnIG9yICdfcmVscy8ucmVscycsXG5cdFx0Ly8gLSBvbmUgZW50cnkgaW5kaWNhdGluZyBzcGVjaWZpYyB0eXBlIG9mIGZpbGUuXG5cdFx0Ly8gTVMgT2ZmaWNlLCBPcGVuT2ZmaWNlIGFuZCBMaWJyZU9mZmljZSBtYXkgcHV0IHRoZSBwYXJ0cyBpbiBkaWZmZXJlbnQgb3JkZXIsIHNvIHRoZSBjaGVjayBzaG91bGQgbm90IHJlbHkgb24gaXQuXG5cdFx0Y29uc3QgZmluZE5leHRaaXBIZWFkZXJJbmRleCA9IChhcnIsIHN0YXJ0QXQgPSAwKSA9PiBhcnIuZmluZEluZGV4KChlbCwgaSwgYXJyKSA9PiBpID49IHN0YXJ0QXQgJiYgYXJyW2ldID09PSAweDUwICYmIGFycltpICsgMV0gPT09IDB4NEIgJiYgYXJyW2kgKyAyXSA9PT0gMHgzICYmIGFycltpICsgM10gPT09IDB4NCk7XG5cblx0XHRsZXQgemlwSGVhZGVySW5kZXggPSAwOyAvLyBUaGUgZmlyc3QgemlwIGhlYWRlciB3YXMgYWxyZWFkeSBmb3VuZCBhdCBpbmRleCAwXG5cdFx0bGV0IG94bWxGb3VuZCA9IGZhbHNlO1xuXHRcdGxldCB0eXBlID0gbnVsbDtcblxuXHRcdGRvIHtcblx0XHRcdGNvbnN0IG9mZnNldCA9IHppcEhlYWRlckluZGV4ICsgMzA7XG5cblx0XHRcdGlmICghb3htbEZvdW5kKSB7XG5cdFx0XHRcdG94bWxGb3VuZCA9IChjaGVjayhveG1sQ29udGVudFR5cGVzLCB7b2Zmc2V0fSkgfHwgY2hlY2sob3htbFJlbHMsIHtvZmZzZXR9KSk7XG5cdFx0XHR9XG5cblx0XHRcdGlmICghdHlwZSkge1xuXHRcdFx0XHRpZiAoY2hlY2tTdHJpbmcoJ3dvcmQvJywge29mZnNldH0pKSB7XG5cdFx0XHRcdFx0dHlwZSA9IHtcblx0XHRcdFx0XHRcdGV4dDogJ2RvY3gnLFxuXHRcdFx0XHRcdFx0bWltZTogJ2FwcGxpY2F0aW9uL3ZuZC5vcGVueG1sZm9ybWF0cy1vZmZpY2Vkb2N1bWVudC53b3JkcHJvY2Vzc2luZ21sLmRvY3VtZW50J1xuXHRcdFx0XHRcdH07XG5cdFx0XHRcdH0gZWxzZSBpZiAoY2hlY2tTdHJpbmcoJ3BwdC8nLCB7b2Zmc2V0fSkpIHtcblx0XHRcdFx0XHR0eXBlID0ge1xuXHRcdFx0XHRcdFx0ZXh0OiAncHB0eCcsXG5cdFx0XHRcdFx0XHRtaW1lOiAnYXBwbGljYXRpb24vdm5kLm9wZW54bWxmb3JtYXRzLW9mZmljZWRvY3VtZW50LnByZXNlbnRhdGlvbm1sLnByZXNlbnRhdGlvbidcblx0XHRcdFx0XHR9O1xuXHRcdFx0XHR9IGVsc2UgaWYgKGNoZWNrU3RyaW5nKCd4bC8nLCB7b2Zmc2V0fSkpIHtcblx0XHRcdFx0XHR0eXBlID0ge1xuXHRcdFx0XHRcdFx0ZXh0OiAneGxzeCcsXG5cdFx0XHRcdFx0XHRtaW1lOiAnYXBwbGljYXRpb24vdm5kLm9wZW54bWxmb3JtYXRzLW9mZmljZWRvY3VtZW50LnNwcmVhZHNoZWV0bWwuc2hlZXQnXG5cdFx0XHRcdFx0fTtcblx0XHRcdFx0fVxuXHRcdFx0fVxuXG5cdFx0XHRpZiAob3htbEZvdW5kICYmIHR5cGUpIHtcblx0XHRcdFx0cmV0dXJuIHR5cGU7XG5cdFx0XHR9XG5cblx0XHRcdHppcEhlYWRlckluZGV4ID0gZmluZE5leHRaaXBIZWFkZXJJbmRleChidWYsIG9mZnNldCk7XG5cdFx0fSB3aGlsZSAoemlwSGVhZGVySW5kZXggPj0gMCk7XG5cblx0XHQvLyBObyBtb3JlIHppcCBwYXJ0cyBhdmFpbGFibGUgaW4gdGhlIGJ1ZmZlciwgYnV0IG1heWJlIHdlIGFyZSBhbG1vc3QgY2VydGFpbiBhYm91dCB0aGUgdHlwZT9cblx0XHRpZiAodHlwZSkge1xuXHRcdFx0cmV0dXJuIHR5cGU7XG5cdFx0fVxuXHR9XG5cblx0aWYgKFxuXHRcdGNoZWNrKFsweDUwLCAweDRCXSkgJiZcblx0XHQoYnVmWzJdID09PSAweDMgfHwgYnVmWzJdID09PSAweDUgfHwgYnVmWzJdID09PSAweDcpICYmXG5cdFx0KGJ1ZlszXSA9PT0gMHg0IHx8IGJ1ZlszXSA9PT0gMHg2IHx8IGJ1ZlszXSA9PT0gMHg4KVxuXHQpIHtcblx0XHRyZXR1cm4ge1xuXHRcdFx0ZXh0OiAnemlwJyxcblx0XHRcdG1pbWU6ICdhcHBsaWNhdGlvbi96aXAnXG5cdFx0fTtcblx0fVxuXG5cdGlmIChjaGVjayhbMHg3NSwgMHg3MywgMHg3NCwgMHg2MSwgMHg3Ml0sIHtvZmZzZXQ6IDI1N30pKSB7XG5cdFx0cmV0dXJuIHtcblx0XHRcdGV4dDogJ3RhcicsXG5cdFx0XHRtaW1lOiAnYXBwbGljYXRpb24veC10YXInXG5cdFx0fTtcblx0fVxuXG5cdGlmIChcblx0XHRjaGVjayhbMHg1MiwgMHg2MSwgMHg3MiwgMHgyMSwgMHgxQSwgMHg3XSkgJiZcblx0XHQoYnVmWzZdID09PSAweDAgfHwgYnVmWzZdID09PSAweDEpXG5cdCkge1xuXHRcdHJldHVybiB7XG5cdFx0XHRleHQ6ICdyYXInLFxuXHRcdFx0bWltZTogJ2FwcGxpY2F0aW9uL3gtcmFyLWNvbXByZXNzZWQnXG5cdFx0fTtcblx0fVxuXG5cdGlmIChjaGVjayhbMHgxRiwgMHg4QiwgMHg4XSkpIHtcblx0XHRyZXR1cm4ge1xuXHRcdFx0ZXh0OiAnZ3onLFxuXHRcdFx0bWltZTogJ2FwcGxpY2F0aW9uL2d6aXAnXG5cdFx0fTtcblx0fVxuXG5cdGlmIChjaGVjayhbMHg0MiwgMHg1QSwgMHg2OF0pKSB7XG5cdFx0cmV0dXJuIHtcblx0XHRcdGV4dDogJ2J6MicsXG5cdFx0XHRtaW1lOiAnYXBwbGljYXRpb24veC1iemlwMidcblx0XHR9O1xuXHR9XG5cblx0aWYgKGNoZWNrKFsweDM3LCAweDdBLCAweEJDLCAweEFGLCAweDI3LCAweDFDXSkpIHtcblx0XHRyZXR1cm4ge1xuXHRcdFx0ZXh0OiAnN3onLFxuXHRcdFx0bWltZTogJ2FwcGxpY2F0aW9uL3gtN3otY29tcHJlc3NlZCdcblx0XHR9O1xuXHR9XG5cblx0aWYgKGNoZWNrKFsweDc4LCAweDAxXSkpIHtcblx0XHRyZXR1cm4ge1xuXHRcdFx0ZXh0OiAnZG1nJyxcblx0XHRcdG1pbWU6ICdhcHBsaWNhdGlvbi94LWFwcGxlLWRpc2tpbWFnZSdcblx0XHR9O1xuXHR9XG5cblx0aWYgKGNoZWNrKFsweDMzLCAweDY3LCAweDcwLCAweDM1XSkgfHwgLy8gM2dwNVxuXHRcdChcblx0XHRcdGNoZWNrKFsweDAsIDB4MCwgMHgwXSkgJiYgY2hlY2soWzB4NjYsIDB4NzQsIDB4NzksIDB4NzBdLCB7b2Zmc2V0OiA0fSkgJiZcblx0XHRcdFx0KFxuXHRcdFx0XHRcdGNoZWNrKFsweDZELCAweDcwLCAweDM0LCAweDMxXSwge29mZnNldDogOH0pIHx8IC8vIE1QNDFcblx0XHRcdFx0XHRjaGVjayhbMHg2RCwgMHg3MCwgMHgzNCwgMHgzMl0sIHtvZmZzZXQ6IDh9KSB8fCAvLyBNUDQyXG5cdFx0XHRcdFx0Y2hlY2soWzB4NjksIDB4NzMsIDB4NkYsIDB4NkRdLCB7b2Zmc2V0OiA4fSkgfHwgLy8gSVNPTVxuXHRcdFx0XHRcdGNoZWNrKFsweDY5LCAweDczLCAweDZGLCAweDMyXSwge29mZnNldDogOH0pIHx8IC8vIElTTzJcblx0XHRcdFx0XHRjaGVjayhbMHg2RCwgMHg2RCwgMHg3MCwgMHgzNF0sIHtvZmZzZXQ6IDh9KSB8fCAvLyBNTVA0XG5cdFx0XHRcdFx0Y2hlY2soWzB4NEQsIDB4MzQsIDB4NTZdLCB7b2Zmc2V0OiA4fSkgfHwgLy8gTTRWXG5cdFx0XHRcdFx0Y2hlY2soWzB4NjQsIDB4NjEsIDB4NzMsIDB4NjhdLCB7b2Zmc2V0OiA4fSkgLy8gREFTSFxuXHRcdFx0XHQpXG5cdFx0KSkge1xuXHRcdHJldHVybiB7XG5cdFx0XHRleHQ6ICdtcDQnLFxuXHRcdFx0bWltZTogJ3ZpZGVvL21wNCdcblx0XHR9O1xuXHR9XG5cblx0aWYgKGNoZWNrKFsweDRELCAweDU0LCAweDY4LCAweDY0XSkpIHtcblx0XHRyZXR1cm4ge1xuXHRcdFx0ZXh0OiAnbWlkJyxcblx0XHRcdG1pbWU6ICdhdWRpby9taWRpJ1xuXHRcdH07XG5cdH1cblxuXHQvLyBodHRwczovL2dpdGh1Yi5jb20vdGhyZWF0c3RhY2svbGlibWFnaWMvYmxvYi9tYXN0ZXIvbWFnaWMvTWFnZGlyL21hdHJvc2thXG5cdGlmIChjaGVjayhbMHgxQSwgMHg0NSwgMHhERiwgMHhBM10pKSB7XG5cdFx0Y29uc3Qgc2xpY2VkID0gYnVmLnN1YmFycmF5KDQsIDQgKyA0MDk2KTtcblx0XHRjb25zdCBpZFBvcyA9IHNsaWNlZC5maW5kSW5kZXgoKGVsLCBpLCBhcnIpID0+IGFycltpXSA9PT0gMHg0MiAmJiBhcnJbaSArIDFdID09PSAweDgyKTtcblxuXHRcdGlmIChpZFBvcyAhPT0gLTEpIHtcblx0XHRcdGNvbnN0IGRvY1R5cGVQb3MgPSBpZFBvcyArIDM7XG5cdFx0XHRjb25zdCBmaW5kRG9jVHlwZSA9IHR5cGUgPT4gWy4uLnR5cGVdLmV2ZXJ5KChjLCBpKSA9PiBzbGljZWRbZG9jVHlwZVBvcyArIGldID09PSBjLmNoYXJDb2RlQXQoMCkpO1xuXG5cdFx0XHRpZiAoZmluZERvY1R5cGUoJ21hdHJvc2thJykpIHtcblx0XHRcdFx0cmV0dXJuIHtcblx0XHRcdFx0XHRleHQ6ICdta3YnLFxuXHRcdFx0XHRcdG1pbWU6ICd2aWRlby94LW1hdHJvc2thJ1xuXHRcdFx0XHR9O1xuXHRcdFx0fVxuXG5cdFx0XHRpZiAoZmluZERvY1R5cGUoJ3dlYm0nKSkge1xuXHRcdFx0XHRyZXR1cm4ge1xuXHRcdFx0XHRcdGV4dDogJ3dlYm0nLFxuXHRcdFx0XHRcdG1pbWU6ICd2aWRlby93ZWJtJ1xuXHRcdFx0XHR9O1xuXHRcdFx0fVxuXHRcdH1cblx0fVxuXG5cdGlmIChjaGVjayhbMHgwLCAweDAsIDB4MCwgMHgxNCwgMHg2NiwgMHg3NCwgMHg3OSwgMHg3MCwgMHg3MSwgMHg3NCwgMHgyMCwgMHgyMF0pIHx8XG5cdFx0Y2hlY2soWzB4NjYsIDB4NzIsIDB4NjUsIDB4NjVdLCB7b2Zmc2V0OiA0fSkgfHwgLy8gVHlwZTogYGZyZWVgXG5cdFx0Y2hlY2soWzB4NjYsIDB4NzQsIDB4NzksIDB4NzAsIDB4NzEsIDB4NzQsIDB4MjAsIDB4MjBdLCB7b2Zmc2V0OiA0fSkgfHxcblx0XHRjaGVjayhbMHg2RCwgMHg2NCwgMHg2MSwgMHg3NF0sIHtvZmZzZXQ6IDR9KSB8fCAvLyBNSlBFR1xuXHRcdGNoZWNrKFsweDZELCAweDZGLCAweDZGLCAweDc2XSwge29mZnNldDogNH0pIHx8IC8vIFR5cGU6IGBtb292YFxuXHRcdGNoZWNrKFsweDc3LCAweDY5LCAweDY0LCAweDY1XSwge29mZnNldDogNH0pKSB7XG5cdFx0cmV0dXJuIHtcblx0XHRcdGV4dDogJ21vdicsXG5cdFx0XHRtaW1lOiAndmlkZW8vcXVpY2t0aW1lJ1xuXHRcdH07XG5cdH1cblxuXHQvLyBSSUZGIGZpbGUgZm9ybWF0IHdoaWNoIG1pZ2h0IGJlIEFWSSwgV0FWLCBRQ1AsIGV0Y1xuXHRpZiAoY2hlY2soWzB4NTIsIDB4NDksIDB4NDYsIDB4NDZdKSkge1xuXHRcdGlmIChjaGVjayhbMHg0MSwgMHg1NiwgMHg0OV0sIHtvZmZzZXQ6IDh9KSkge1xuXHRcdFx0cmV0dXJuIHtcblx0XHRcdFx0ZXh0OiAnYXZpJyxcblx0XHRcdFx0bWltZTogJ3ZpZGVvL3ZuZC5hdmknXG5cdFx0XHR9O1xuXHRcdH1cblxuXHRcdGlmIChjaGVjayhbMHg1NywgMHg0MSwgMHg1NiwgMHg0NV0sIHtvZmZzZXQ6IDh9KSkge1xuXHRcdFx0cmV0dXJuIHtcblx0XHRcdFx0ZXh0OiAnd2F2Jyxcblx0XHRcdFx0bWltZTogJ2F1ZGlvL3ZuZC53YXZlJ1xuXHRcdFx0fTtcblx0XHR9XG5cblx0XHQvLyBRTENNLCBRQ1AgZmlsZVxuXHRcdGlmIChjaGVjayhbMHg1MSwgMHg0QywgMHg0MywgMHg0RF0sIHtvZmZzZXQ6IDh9KSkge1xuXHRcdFx0cmV0dXJuIHtcblx0XHRcdFx0ZXh0OiAncWNwJyxcblx0XHRcdFx0bWltZTogJ2F1ZGlvL3FjZWxwJ1xuXHRcdFx0fTtcblx0XHR9XG5cdH1cblxuXHQvLyBBU0ZfSGVhZGVyX09iamVjdCBmaXJzdCA4MCBieXRlc1xuXHRpZiAoY2hlY2soWzB4MzAsIDB4MjYsIDB4QjIsIDB4NzUsIDB4OEUsIDB4NjYsIDB4Q0YsIDB4MTEsIDB4QTYsIDB4RDldKSkge1xuXHRcdC8vIFNlYXJjaCBmb3IgaGVhZGVyIHNob3VsZCBiZSBpbiBmaXJzdCAxS0Igb2YgZmlsZS5cblxuXHRcdGxldCBvZmZzZXQgPSAzMDtcblx0XHRkbyB7XG5cdFx0XHRjb25zdCBvYmplY3RTaXplID0gcmVhZFVJbnQ2NExFKGJ1Ziwgb2Zmc2V0ICsgMTYpO1xuXHRcdFx0aWYgKGNoZWNrKFsweDkxLCAweDA3LCAweERDLCAweEI3LCAweEI3LCAweEE5LCAweENGLCAweDExLCAweDhFLCAweEU2LCAweDAwLCAweEMwLCAweDBDLCAweDIwLCAweDUzLCAweDY1XSwge29mZnNldH0pKSB7XG5cdFx0XHRcdC8vIFN5bmMgb24gU3RyZWFtLVByb3BlcnRpZXMtT2JqZWN0IChCN0RDMDc5MS1BOUI3LTExQ0YtOEVFNi0wMEMwMEMyMDUzNjUpXG5cdFx0XHRcdGlmIChjaGVjayhbMHg0MCwgMHg5RSwgMHg2OSwgMHhGOCwgMHg0RCwgMHg1QiwgMHhDRiwgMHgxMSwgMHhBOCwgMHhGRCwgMHgwMCwgMHg4MCwgMHg1RiwgMHg1QywgMHg0NCwgMHgyQl0sIHtvZmZzZXQ6IG9mZnNldCArIDI0fSkpIHtcblx0XHRcdFx0XHQvLyBGb3VuZCBhdWRpbzpcblx0XHRcdFx0XHRyZXR1cm4ge1xuXHRcdFx0XHRcdFx0ZXh0OiAnd21hJyxcblx0XHRcdFx0XHRcdG1pbWU6ICdhdWRpby94LW1zLXdtYSdcblx0XHRcdFx0XHR9O1xuXHRcdFx0XHR9XG5cblx0XHRcdFx0aWYgKGNoZWNrKFsweEMwLCAweEVGLCAweDE5LCAweEJDLCAweDRELCAweDVCLCAweENGLCAweDExLCAweEE4LCAweEZELCAweDAwLCAweDgwLCAweDVGLCAweDVDLCAweDQ0LCAweDJCXSwge29mZnNldDogb2Zmc2V0ICsgMjR9KSkge1xuXHRcdFx0XHRcdC8vIEZvdW5kIHZpZGVvOlxuXHRcdFx0XHRcdHJldHVybiB7XG5cdFx0XHRcdFx0XHRleHQ6ICd3bXYnLFxuXHRcdFx0XHRcdFx0bWltZTogJ3ZpZGVvL3gtbXMtYXNmJ1xuXHRcdFx0XHRcdH07XG5cdFx0XHRcdH1cblxuXHRcdFx0XHRicmVhaztcblx0XHRcdH1cblxuXHRcdFx0b2Zmc2V0ICs9IG9iamVjdFNpemU7XG5cdFx0fSB3aGlsZSAob2Zmc2V0ICsgMjQgPD0gYnVmLmxlbmd0aCk7XG5cblx0XHQvLyBEZWZhdWx0IHRvIEFTRiBnZW5lcmljIGV4dGVuc2lvblxuXHRcdHJldHVybiB7XG5cdFx0XHRleHQ6ICdhc2YnLFxuXHRcdFx0bWltZTogJ2FwcGxpY2F0aW9uL3ZuZC5tcy1hc2YnXG5cdFx0fTtcblx0fVxuXG5cdGlmIChcblx0XHRjaGVjayhbMHgwLCAweDAsIDB4MSwgMHhCQV0pIHx8XG5cdFx0Y2hlY2soWzB4MCwgMHgwLCAweDEsIDB4QjNdKVxuXHQpIHtcblx0XHRyZXR1cm4ge1xuXHRcdFx0ZXh0OiAnbXBnJyxcblx0XHRcdG1pbWU6ICd2aWRlby9tcGVnJ1xuXHRcdH07XG5cdH1cblxuXHRpZiAoY2hlY2soWzB4NjYsIDB4NzQsIDB4NzksIDB4NzAsIDB4MzMsIDB4NjddLCB7b2Zmc2V0OiA0fSkpIHtcblx0XHRyZXR1cm4ge1xuXHRcdFx0ZXh0OiAnM2dwJyxcblx0XHRcdG1pbWU6ICd2aWRlby8zZ3BwJ1xuXHRcdH07XG5cdH1cblxuXHQvLyBDaGVjayBmb3IgTVBFRyBoZWFkZXIgYXQgZGlmZmVyZW50IHN0YXJ0aW5nIG9mZnNldHNcblx0Zm9yIChsZXQgc3RhcnQgPSAwOyBzdGFydCA8IDIgJiYgc3RhcnQgPCAoYnVmLmxlbmd0aCAtIDE2KTsgc3RhcnQrKykge1xuXHRcdGlmIChcblx0XHRcdGNoZWNrKFsweDQ5LCAweDQ0LCAweDMzXSwge29mZnNldDogc3RhcnR9KSB8fCAvLyBJRDMgaGVhZGVyXG5cdFx0XHRjaGVjayhbMHhGRiwgMHhFMl0sIHtvZmZzZXQ6IHN0YXJ0LCBtYXNrOiBbMHhGRiwgMHhFMl19KSAvLyBNUEVHIDEgb3IgMiBMYXllciAzIGhlYWRlclxuXHRcdCkge1xuXHRcdFx0cmV0dXJuIHtcblx0XHRcdFx0ZXh0OiAnbXAzJyxcblx0XHRcdFx0bWltZTogJ2F1ZGlvL21wZWcnXG5cdFx0XHR9O1xuXHRcdH1cblxuXHRcdGlmIChcblx0XHRcdGNoZWNrKFsweEZGLCAweEU0XSwge29mZnNldDogc3RhcnQsIG1hc2s6IFsweEZGLCAweEU0XX0pIC8vIE1QRUcgMSBvciAyIExheWVyIDIgaGVhZGVyXG5cdFx0KSB7XG5cdFx0XHRyZXR1cm4ge1xuXHRcdFx0XHRleHQ6ICdtcDInLFxuXHRcdFx0XHRtaW1lOiAnYXVkaW8vbXBlZydcblx0XHRcdH07XG5cdFx0fVxuXG5cdFx0aWYgKFxuXHRcdFx0Y2hlY2soWzB4RkYsIDB4RjhdLCB7b2Zmc2V0OiBzdGFydCwgbWFzazogWzB4RkYsIDB4RkNdfSkgLy8gTVBFRyAyIGxheWVyIDAgdXNpbmcgQURUU1xuXHRcdCkge1xuXHRcdFx0cmV0dXJuIHtcblx0XHRcdFx0ZXh0OiAnbXAyJyxcblx0XHRcdFx0bWltZTogJ2F1ZGlvL21wZWcnXG5cdFx0XHR9O1xuXHRcdH1cblxuXHRcdGlmIChcblx0XHRcdGNoZWNrKFsweEZGLCAweEYwXSwge29mZnNldDogc3RhcnQsIG1hc2s6IFsweEZGLCAweEZDXX0pIC8vIE1QRUcgNCBsYXllciAwIHVzaW5nIEFEVFNcblx0XHQpIHtcblx0XHRcdHJldHVybiB7XG5cdFx0XHRcdGV4dDogJ21wNCcsXG5cdFx0XHRcdG1pbWU6ICdhdWRpby9tcGVnJ1xuXHRcdFx0fTtcblx0XHR9XG5cdH1cblxuXHRpZiAoXG5cdFx0Y2hlY2soWzB4NjYsIDB4NzQsIDB4NzksIDB4NzAsIDB4NEQsIDB4MzQsIDB4NDFdLCB7b2Zmc2V0OiA0fSlcblx0KSB7XG5cdFx0cmV0dXJuIHsgLy8gTVBFRy00IGxheWVyIDMgKGF1ZGlvKVxuXHRcdFx0ZXh0OiAnbTRhJyxcblx0XHRcdG1pbWU6ICdhdWRpby9tcDQnIC8vIFJGQyA0MzM3XG5cdFx0fTtcblx0fVxuXG5cdC8vIE5lZWRzIHRvIGJlIGJlZm9yZSBgb2dnYCBjaGVja1xuXHRpZiAoY2hlY2soWzB4NEYsIDB4NzAsIDB4NzUsIDB4NzMsIDB4NDgsIDB4NjUsIDB4NjEsIDB4NjRdLCB7b2Zmc2V0OiAyOH0pKSB7XG5cdFx0cmV0dXJuIHtcblx0XHRcdGV4dDogJ29wdXMnLFxuXHRcdFx0bWltZTogJ2F1ZGlvL29wdXMnXG5cdFx0fTtcblx0fVxuXG5cdC8vIElmICdPZ2dTJyBpbiBmaXJzdCAgYnl0ZXMsIHRoZW4gT0dHIGNvbnRhaW5lclxuXHRpZiAoY2hlY2soWzB4NEYsIDB4NjcsIDB4NjcsIDB4NTNdKSkge1xuXHRcdC8vIFRoaXMgaXMgYSBPR0cgY29udGFpbmVyXG5cblx0XHQvLyBJZiAnIHRoZW9yYScgaW4gaGVhZGVyLlxuXHRcdGlmIChjaGVjayhbMHg4MCwgMHg3NCwgMHg2OCwgMHg2NSwgMHg2RiwgMHg3MiwgMHg2MV0sIHtvZmZzZXQ6IDI4fSkpIHtcblx0XHRcdHJldHVybiB7XG5cdFx0XHRcdGV4dDogJ29ndicsXG5cdFx0XHRcdG1pbWU6ICd2aWRlby9vZ2cnXG5cdFx0XHR9O1xuXHRcdH1cblxuXHRcdC8vIElmICdcXHgwMXZpZGVvJyBpbiBoZWFkZXIuXG5cdFx0aWYgKGNoZWNrKFsweDAxLCAweDc2LCAweDY5LCAweDY0LCAweDY1LCAweDZGLCAweDAwXSwge29mZnNldDogMjh9KSkge1xuXHRcdFx0cmV0dXJuIHtcblx0XHRcdFx0ZXh0OiAnb2dtJyxcblx0XHRcdFx0bWltZTogJ3ZpZGVvL29nZydcblx0XHRcdH07XG5cdFx0fVxuXG5cdFx0Ly8gSWYgJyBGTEFDJyBpbiBoZWFkZXIgIGh0dHBzOi8veGlwaC5vcmcvZmxhYy9mYXEuaHRtbFxuXHRcdGlmIChjaGVjayhbMHg3RiwgMHg0NiwgMHg0QywgMHg0MSwgMHg0M10sIHtvZmZzZXQ6IDI4fSkpIHtcblx0XHRcdHJldHVybiB7XG5cdFx0XHRcdGV4dDogJ29nYScsXG5cdFx0XHRcdG1pbWU6ICdhdWRpby9vZ2cnXG5cdFx0XHR9O1xuXHRcdH1cblxuXHRcdC8vICdTcGVleCAgJyBpbiBoZWFkZXIgaHR0cHM6Ly9lbi53aWtpcGVkaWEub3JnL3dpa2kvU3BlZXhcblx0XHRpZiAoY2hlY2soWzB4NTMsIDB4NzAsIDB4NjUsIDB4NjUsIDB4NzgsIDB4MjAsIDB4MjBdLCB7b2Zmc2V0OiAyOH0pKSB7XG5cdFx0XHRyZXR1cm4ge1xuXHRcdFx0XHRleHQ6ICdzcHgnLFxuXHRcdFx0XHRtaW1lOiAnYXVkaW8vb2dnJ1xuXHRcdFx0fTtcblx0XHR9XG5cblx0XHQvLyBJZiAnXFx4MDF2b3JiaXMnIGluIGhlYWRlclxuXHRcdGlmIChjaGVjayhbMHgwMSwgMHg3NiwgMHg2RiwgMHg3MiwgMHg2MiwgMHg2OSwgMHg3M10sIHtvZmZzZXQ6IDI4fSkpIHtcblx0XHRcdHJldHVybiB7XG5cdFx0XHRcdGV4dDogJ29nZycsXG5cdFx0XHRcdG1pbWU6ICdhdWRpby9vZ2cnXG5cdFx0XHR9O1xuXHRcdH1cblxuXHRcdC8vIERlZmF1bHQgT0dHIGNvbnRhaW5lciBodHRwczovL3d3dy5pYW5hLm9yZy9hc3NpZ25tZW50cy9tZWRpYS10eXBlcy9hcHBsaWNhdGlvbi9vZ2dcblx0XHRyZXR1cm4ge1xuXHRcdFx0ZXh0OiAnb2d4Jyxcblx0XHRcdG1pbWU6ICdhcHBsaWNhdGlvbi9vZ2cnXG5cdFx0fTtcblx0fVxuXG5cdGlmIChjaGVjayhbMHg2NiwgMHg0QywgMHg2MSwgMHg0M10pKSB7XG5cdFx0cmV0dXJuIHtcblx0XHRcdGV4dDogJ2ZsYWMnLFxuXHRcdFx0bWltZTogJ2F1ZGlvL3gtZmxhYydcblx0XHR9O1xuXHR9XG5cblx0aWYgKGNoZWNrKFsweDRELCAweDQxLCAweDQzLCAweDIwXSkpIHsgLy8gJ01BQyAnXG5cdFx0cmV0dXJuIHtcblx0XHRcdGV4dDogJ2FwZScsXG5cdFx0XHRtaW1lOiAnYXVkaW8vYXBlJ1xuXHRcdH07XG5cdH1cblxuXHRpZiAoY2hlY2soWzB4NzcsIDB4NzYsIDB4NzAsIDB4NkJdKSkgeyAvLyAnd3Zwaydcblx0XHRyZXR1cm4ge1xuXHRcdFx0ZXh0OiAnd3YnLFxuXHRcdFx0bWltZTogJ2F1ZGlvL3dhdnBhY2snXG5cdFx0fTtcblx0fVxuXG5cdGlmIChjaGVjayhbMHgyMywgMHgyMSwgMHg0MSwgMHg0RCwgMHg1MiwgMHgwQV0pKSB7XG5cdFx0cmV0dXJuIHtcblx0XHRcdGV4dDogJ2FtcicsXG5cdFx0XHRtaW1lOiAnYXVkaW8vYW1yJ1xuXHRcdH07XG5cdH1cblxuXHRpZiAoY2hlY2soWzB4MjUsIDB4NTAsIDB4NDQsIDB4NDZdKSkge1xuXHRcdHJldHVybiB7XG5cdFx0XHRleHQ6ICdwZGYnLFxuXHRcdFx0bWltZTogJ2FwcGxpY2F0aW9uL3BkZidcblx0XHR9O1xuXHR9XG5cblx0aWYgKGNoZWNrKFsweDRELCAweDVBXSkpIHtcblx0XHRyZXR1cm4ge1xuXHRcdFx0ZXh0OiAnZXhlJyxcblx0XHRcdG1pbWU6ICdhcHBsaWNhdGlvbi94LW1zZG93bmxvYWQnXG5cdFx0fTtcblx0fVxuXG5cdGlmIChcblx0XHQoYnVmWzBdID09PSAweDQzIHx8IGJ1ZlswXSA9PT0gMHg0NikgJiZcblx0XHRjaGVjayhbMHg1NywgMHg1M10sIHtvZmZzZXQ6IDF9KVxuXHQpIHtcblx0XHRyZXR1cm4ge1xuXHRcdFx0ZXh0OiAnc3dmJyxcblx0XHRcdG1pbWU6ICdhcHBsaWNhdGlvbi94LXNob2Nrd2F2ZS1mbGFzaCdcblx0XHR9O1xuXHR9XG5cblx0aWYgKGNoZWNrKFsweDdCLCAweDVDLCAweDcyLCAweDc0LCAweDY2XSkpIHtcblx0XHRyZXR1cm4ge1xuXHRcdFx0ZXh0OiAncnRmJyxcblx0XHRcdG1pbWU6ICdhcHBsaWNhdGlvbi9ydGYnXG5cdFx0fTtcblx0fVxuXG5cdGlmIChjaGVjayhbMHgwMCwgMHg2MSwgMHg3MywgMHg2RF0pKSB7XG5cdFx0cmV0dXJuIHtcblx0XHRcdGV4dDogJ3dhc20nLFxuXHRcdFx0bWltZTogJ2FwcGxpY2F0aW9uL3dhc20nXG5cdFx0fTtcblx0fVxuXG5cdGlmIChcblx0XHRjaGVjayhbMHg3NywgMHg0RiwgMHg0NiwgMHg0Nl0pICYmXG5cdFx0KFxuXHRcdFx0Y2hlY2soWzB4MDAsIDB4MDEsIDB4MDAsIDB4MDBdLCB7b2Zmc2V0OiA0fSkgfHxcblx0XHRcdGNoZWNrKFsweDRGLCAweDU0LCAweDU0LCAweDRGXSwge29mZnNldDogNH0pXG5cdFx0KVxuXHQpIHtcblx0XHRyZXR1cm4ge1xuXHRcdFx0ZXh0OiAnd29mZicsXG5cdFx0XHRtaW1lOiAnZm9udC93b2ZmJ1xuXHRcdH07XG5cdH1cblxuXHRpZiAoXG5cdFx0Y2hlY2soWzB4NzcsIDB4NEYsIDB4NDYsIDB4MzJdKSAmJlxuXHRcdChcblx0XHRcdGNoZWNrKFsweDAwLCAweDAxLCAweDAwLCAweDAwXSwge29mZnNldDogNH0pIHx8XG5cdFx0XHRjaGVjayhbMHg0RiwgMHg1NCwgMHg1NCwgMHg0Rl0sIHtvZmZzZXQ6IDR9KVxuXHRcdClcblx0KSB7XG5cdFx0cmV0dXJuIHtcblx0XHRcdGV4dDogJ3dvZmYyJyxcblx0XHRcdG1pbWU6ICdmb250L3dvZmYyJ1xuXHRcdH07XG5cdH1cblxuXHRpZiAoXG5cdFx0Y2hlY2soWzB4NEMsIDB4NTBdLCB7b2Zmc2V0OiAzNH0pICYmXG5cdFx0KFxuXHRcdFx0Y2hlY2soWzB4MDAsIDB4MDAsIDB4MDFdLCB7b2Zmc2V0OiA4fSkgfHxcblx0XHRcdGNoZWNrKFsweDAxLCAweDAwLCAweDAyXSwge29mZnNldDogOH0pIHx8XG5cdFx0XHRjaGVjayhbMHgwMiwgMHgwMCwgMHgwMl0sIHtvZmZzZXQ6IDh9KVxuXHRcdClcblx0KSB7XG5cdFx0cmV0dXJuIHtcblx0XHRcdGV4dDogJ2VvdCcsXG5cdFx0XHRtaW1lOiAnYXBwbGljYXRpb24vdm5kLm1zLWZvbnRvYmplY3QnXG5cdFx0fTtcblx0fVxuXG5cdGlmIChjaGVjayhbMHgwMCwgMHgwMSwgMHgwMCwgMHgwMCwgMHgwMF0pKSB7XG5cdFx0cmV0dXJuIHtcblx0XHRcdGV4dDogJ3R0ZicsXG5cdFx0XHRtaW1lOiAnZm9udC90dGYnXG5cdFx0fTtcblx0fVxuXG5cdGlmIChjaGVjayhbMHg0RiwgMHg1NCwgMHg1NCwgMHg0RiwgMHgwMF0pKSB7XG5cdFx0cmV0dXJuIHtcblx0XHRcdGV4dDogJ290ZicsXG5cdFx0XHRtaW1lOiAnZm9udC9vdGYnXG5cdFx0fTtcblx0fVxuXG5cdGlmIChjaGVjayhbMHgwMCwgMHgwMCwgMHgwMSwgMHgwMF0pKSB7XG5cdFx0cmV0dXJuIHtcblx0XHRcdGV4dDogJ2ljbycsXG5cdFx0XHRtaW1lOiAnaW1hZ2UveC1pY29uJ1xuXHRcdH07XG5cdH1cblxuXHRpZiAoY2hlY2soWzB4MDAsIDB4MDAsIDB4MDIsIDB4MDBdKSkge1xuXHRcdHJldHVybiB7XG5cdFx0XHRleHQ6ICdjdXInLFxuXHRcdFx0bWltZTogJ2ltYWdlL3gtaWNvbidcblx0XHR9O1xuXHR9XG5cblx0aWYgKGNoZWNrKFsweDQ2LCAweDRDLCAweDU2LCAweDAxXSkpIHtcblx0XHRyZXR1cm4ge1xuXHRcdFx0ZXh0OiAnZmx2Jyxcblx0XHRcdG1pbWU6ICd2aWRlby94LWZsdidcblx0XHR9O1xuXHR9XG5cblx0aWYgKGNoZWNrKFsweDI1LCAweDIxXSkpIHtcblx0XHRyZXR1cm4ge1xuXHRcdFx0ZXh0OiAncHMnLFxuXHRcdFx0bWltZTogJ2FwcGxpY2F0aW9uL3Bvc3RzY3JpcHQnXG5cdFx0fTtcblx0fVxuXG5cdGlmIChjaGVjayhbMHhGRCwgMHgzNywgMHg3QSwgMHg1OCwgMHg1QSwgMHgwMF0pKSB7XG5cdFx0cmV0dXJuIHtcblx0XHRcdGV4dDogJ3h6Jyxcblx0XHRcdG1pbWU6ICdhcHBsaWNhdGlvbi94LXh6J1xuXHRcdH07XG5cdH1cblxuXHRpZiAoY2hlY2soWzB4NTMsIDB4NTEsIDB4NEMsIDB4NjldKSkge1xuXHRcdHJldHVybiB7XG5cdFx0XHRleHQ6ICdzcWxpdGUnLFxuXHRcdFx0bWltZTogJ2FwcGxpY2F0aW9uL3gtc3FsaXRlMydcblx0XHR9O1xuXHR9XG5cblx0aWYgKGNoZWNrKFsweDRFLCAweDQ1LCAweDUzLCAweDFBXSkpIHtcblx0XHRyZXR1cm4ge1xuXHRcdFx0ZXh0OiAnbmVzJyxcblx0XHRcdG1pbWU6ICdhcHBsaWNhdGlvbi94LW5pbnRlbmRvLW5lcy1yb20nXG5cdFx0fTtcblx0fVxuXG5cdGlmIChjaGVjayhbMHg0MywgMHg3MiwgMHgzMiwgMHgzNF0pKSB7XG5cdFx0cmV0dXJuIHtcblx0XHRcdGV4dDogJ2NyeCcsXG5cdFx0XHRtaW1lOiAnYXBwbGljYXRpb24veC1nb29nbGUtY2hyb21lLWV4dGVuc2lvbidcblx0XHR9O1xuXHR9XG5cblx0aWYgKFxuXHRcdGNoZWNrKFsweDRELCAweDUzLCAweDQzLCAweDQ2XSkgfHxcblx0XHRjaGVjayhbMHg0OSwgMHg1MywgMHg2MywgMHgyOF0pXG5cdCkge1xuXHRcdHJldHVybiB7XG5cdFx0XHRleHQ6ICdjYWInLFxuXHRcdFx0bWltZTogJ2FwcGxpY2F0aW9uL3ZuZC5tcy1jYWItY29tcHJlc3NlZCdcblx0XHR9O1xuXHR9XG5cblx0Ly8gTmVlZHMgdG8gYmUgYmVmb3JlIGBhcmAgY2hlY2tcblx0aWYgKGNoZWNrKFsweDIxLCAweDNDLCAweDYxLCAweDcyLCAweDYzLCAweDY4LCAweDNFLCAweDBBLCAweDY0LCAweDY1LCAweDYyLCAweDY5LCAweDYxLCAweDZFLCAweDJELCAweDYyLCAweDY5LCAweDZFLCAweDYxLCAweDcyLCAweDc5XSkpIHtcblx0XHRyZXR1cm4ge1xuXHRcdFx0ZXh0OiAnZGViJyxcblx0XHRcdG1pbWU6ICdhcHBsaWNhdGlvbi94LWRlYidcblx0XHR9O1xuXHR9XG5cblx0aWYgKGNoZWNrKFsweDIxLCAweDNDLCAweDYxLCAweDcyLCAweDYzLCAweDY4LCAweDNFXSkpIHtcblx0XHRyZXR1cm4ge1xuXHRcdFx0ZXh0OiAnYXInLFxuXHRcdFx0bWltZTogJ2FwcGxpY2F0aW9uL3gtdW5peC1hcmNoaXZlJ1xuXHRcdH07XG5cdH1cblxuXHRpZiAoY2hlY2soWzB4RUQsIDB4QUIsIDB4RUUsIDB4REJdKSkge1xuXHRcdHJldHVybiB7XG5cdFx0XHRleHQ6ICdycG0nLFxuXHRcdFx0bWltZTogJ2FwcGxpY2F0aW9uL3gtcnBtJ1xuXHRcdH07XG5cdH1cblxuXHRpZiAoXG5cdFx0Y2hlY2soWzB4MUYsIDB4QTBdKSB8fFxuXHRcdGNoZWNrKFsweDFGLCAweDlEXSlcblx0KSB7XG5cdFx0cmV0dXJuIHtcblx0XHRcdGV4dDogJ1onLFxuXHRcdFx0bWltZTogJ2FwcGxpY2F0aW9uL3gtY29tcHJlc3MnXG5cdFx0fTtcblx0fVxuXG5cdGlmIChjaGVjayhbMHg0QywgMHg1QSwgMHg0OSwgMHg1MF0pKSB7XG5cdFx0cmV0dXJuIHtcblx0XHRcdGV4dDogJ2x6Jyxcblx0XHRcdG1pbWU6ICdhcHBsaWNhdGlvbi94LWx6aXAnXG5cdFx0fTtcblx0fVxuXG5cdGlmIChjaGVjayhbMHhEMCwgMHhDRiwgMHgxMSwgMHhFMCwgMHhBMSwgMHhCMSwgMHgxQSwgMHhFMV0pKSB7XG5cdFx0cmV0dXJuIHtcblx0XHRcdGV4dDogJ21zaScsXG5cdFx0XHRtaW1lOiAnYXBwbGljYXRpb24veC1tc2knXG5cdFx0fTtcblx0fVxuXG5cdGlmIChjaGVjayhbMHgwNiwgMHgwRSwgMHgyQiwgMHgzNCwgMHgwMiwgMHgwNSwgMHgwMSwgMHgwMSwgMHgwRCwgMHgwMSwgMHgwMiwgMHgwMSwgMHgwMSwgMHgwMl0pKSB7XG5cdFx0cmV0dXJuIHtcblx0XHRcdGV4dDogJ214ZicsXG5cdFx0XHRtaW1lOiAnYXBwbGljYXRpb24vbXhmJ1xuXHRcdH07XG5cdH1cblxuXHRpZiAoY2hlY2soWzB4NDddLCB7b2Zmc2V0OiA0fSkgJiYgKGNoZWNrKFsweDQ3XSwge29mZnNldDogMTkyfSkgfHwgY2hlY2soWzB4NDddLCB7b2Zmc2V0OiAxOTZ9KSkpIHtcblx0XHRyZXR1cm4ge1xuXHRcdFx0ZXh0OiAnbXRzJyxcblx0XHRcdG1pbWU6ICd2aWRlby9tcDJ0J1xuXHRcdH07XG5cdH1cblxuXHRpZiAoY2hlY2soWzB4NDIsIDB4NEMsIDB4NDUsIDB4NEUsIDB4NDQsIDB4NDUsIDB4NTJdKSkge1xuXHRcdHJldHVybiB7XG5cdFx0XHRleHQ6ICdibGVuZCcsXG5cdFx0XHRtaW1lOiAnYXBwbGljYXRpb24veC1ibGVuZGVyJ1xuXHRcdH07XG5cdH1cblxuXHRpZiAoY2hlY2soWzB4NDIsIDB4NTAsIDB4NDcsIDB4RkJdKSkge1xuXHRcdHJldHVybiB7XG5cdFx0XHRleHQ6ICdicGcnLFxuXHRcdFx0bWltZTogJ2ltYWdlL2JwZydcblx0XHR9O1xuXHR9XG5cblx0aWYgKGNoZWNrKFsweDAwLCAweDAwLCAweDAwLCAweDBDLCAweDZBLCAweDUwLCAweDIwLCAweDIwLCAweDBELCAweDBBLCAweDg3LCAweDBBXSkpIHtcblx0XHQvLyBKUEVHLTIwMDAgZmFtaWx5XG5cblx0XHRpZiAoY2hlY2soWzB4NkEsIDB4NzAsIDB4MzIsIDB4MjBdLCB7b2Zmc2V0OiAyMH0pKSB7XG5cdFx0XHRyZXR1cm4ge1xuXHRcdFx0XHRleHQ6ICdqcDInLFxuXHRcdFx0XHRtaW1lOiAnaW1hZ2UvanAyJ1xuXHRcdFx0fTtcblx0XHR9XG5cblx0XHRpZiAoY2hlY2soWzB4NkEsIDB4NzAsIDB4NzgsIDB4MjBdLCB7b2Zmc2V0OiAyMH0pKSB7XG5cdFx0XHRyZXR1cm4ge1xuXHRcdFx0XHRleHQ6ICdqcHgnLFxuXHRcdFx0XHRtaW1lOiAnaW1hZ2UvanB4J1xuXHRcdFx0fTtcblx0XHR9XG5cblx0XHRpZiAoY2hlY2soWzB4NkEsIDB4NzAsIDB4NkQsIDB4MjBdLCB7b2Zmc2V0OiAyMH0pKSB7XG5cdFx0XHRyZXR1cm4ge1xuXHRcdFx0XHRleHQ6ICdqcG0nLFxuXHRcdFx0XHRtaW1lOiAnaW1hZ2UvanBtJ1xuXHRcdFx0fTtcblx0XHR9XG5cblx0XHRpZiAoY2hlY2soWzB4NkQsIDB4NkEsIDB4NzAsIDB4MzJdLCB7b2Zmc2V0OiAyMH0pKSB7XG5cdFx0XHRyZXR1cm4ge1xuXHRcdFx0XHRleHQ6ICdtajInLFxuXHRcdFx0XHRtaW1lOiAnaW1hZ2UvbWoyJ1xuXHRcdFx0fTtcblx0XHR9XG5cdH1cblxuXHRpZiAoY2hlY2soWzB4NDYsIDB4NEYsIDB4NTIsIDB4NERdKSkge1xuXHRcdHJldHVybiB7XG5cdFx0XHRleHQ6ICdhaWYnLFxuXHRcdFx0bWltZTogJ2F1ZGlvL2FpZmYnXG5cdFx0fTtcblx0fVxuXG5cdGlmIChjaGVja1N0cmluZygnPD94bWwgJykpIHtcblx0XHRyZXR1cm4ge1xuXHRcdFx0ZXh0OiAneG1sJyxcblx0XHRcdG1pbWU6ICdhcHBsaWNhdGlvbi94bWwnXG5cdFx0fTtcblx0fVxuXG5cdGlmIChjaGVjayhbMHg0MiwgMHg0RiwgMHg0RiwgMHg0QiwgMHg0RCwgMHg0RiwgMHg0MiwgMHg0OV0sIHtvZmZzZXQ6IDYwfSkpIHtcblx0XHRyZXR1cm4ge1xuXHRcdFx0ZXh0OiAnbW9iaScsXG5cdFx0XHRtaW1lOiAnYXBwbGljYXRpb24veC1tb2JpcG9ja2V0LWVib29rJ1xuXHRcdH07XG5cdH1cblxuXHQvLyBGaWxlIFR5cGUgQm94IChodHRwczovL2VuLndpa2lwZWRpYS5vcmcvd2lraS9JU09fYmFzZV9tZWRpYV9maWxlX2Zvcm1hdClcblx0aWYgKGNoZWNrKFsweDY2LCAweDc0LCAweDc5LCAweDcwXSwge29mZnNldDogNH0pKSB7XG5cdFx0aWYgKGNoZWNrKFsweDZELCAweDY5LCAweDY2LCAweDMxXSwge29mZnNldDogOH0pKSB7XG5cdFx0XHRyZXR1cm4ge1xuXHRcdFx0XHRleHQ6ICdoZWljJyxcblx0XHRcdFx0bWltZTogJ2ltYWdlL2hlaWYnXG5cdFx0XHR9O1xuXHRcdH1cblxuXHRcdGlmIChjaGVjayhbMHg2RCwgMHg3MywgMHg2NiwgMHgzMV0sIHtvZmZzZXQ6IDh9KSkge1xuXHRcdFx0cmV0dXJuIHtcblx0XHRcdFx0ZXh0OiAnaGVpYycsXG5cdFx0XHRcdG1pbWU6ICdpbWFnZS9oZWlmLXNlcXVlbmNlJ1xuXHRcdFx0fTtcblx0XHR9XG5cblx0XHRpZiAoY2hlY2soWzB4NjgsIDB4NjUsIDB4NjksIDB4NjNdLCB7b2Zmc2V0OiA4fSkgfHwgY2hlY2soWzB4NjgsIDB4NjUsIDB4NjksIDB4NzhdLCB7b2Zmc2V0OiA4fSkpIHtcblx0XHRcdHJldHVybiB7XG5cdFx0XHRcdGV4dDogJ2hlaWMnLFxuXHRcdFx0XHRtaW1lOiAnaW1hZ2UvaGVpYydcblx0XHRcdH07XG5cdFx0fVxuXG5cdFx0aWYgKGNoZWNrKFsweDY4LCAweDY1LCAweDc2LCAweDYzXSwge29mZnNldDogOH0pIHx8IGNoZWNrKFsweDY4LCAweDY1LCAweDc2LCAweDc4XSwge29mZnNldDogOH0pKSB7XG5cdFx0XHRyZXR1cm4ge1xuXHRcdFx0XHRleHQ6ICdoZWljJyxcblx0XHRcdFx0bWltZTogJ2ltYWdlL2hlaWMtc2VxdWVuY2UnXG5cdFx0XHR9O1xuXHRcdH1cblx0fVxuXG5cdGlmIChjaGVjayhbMHhBQiwgMHg0QiwgMHg1NCwgMHg1OCwgMHgyMCwgMHgzMSwgMHgzMSwgMHhCQiwgMHgwRCwgMHgwQSwgMHgxQSwgMHgwQV0pKSB7XG5cdFx0cmV0dXJuIHtcblx0XHRcdGV4dDogJ2t0eCcsXG5cdFx0XHRtaW1lOiAnaW1hZ2Uva3R4J1xuXHRcdH07XG5cdH1cblxuXHRpZiAoY2hlY2soWzB4NDQsIDB4NDksIDB4NDMsIDB4NERdLCB7b2Zmc2V0OiAxMjh9KSkge1xuXHRcdHJldHVybiB7XG5cdFx0XHRleHQ6ICdkY20nLFxuXHRcdFx0bWltZTogJ2FwcGxpY2F0aW9uL2RpY29tJ1xuXHRcdH07XG5cdH1cblxuXHQvLyBNdXNlcGFjaywgU1Y3XG5cdGlmIChjaGVjayhbMHg0RCwgMHg1MCwgMHgyQl0pKSB7XG5cdFx0cmV0dXJuIHtcblx0XHRcdGV4dDogJ21wYycsXG5cdFx0XHRtaW1lOiAnYXVkaW8veC1tdXNlcGFjaydcblx0XHR9O1xuXHR9XG5cblx0Ly8gTXVzZXBhY2ssIFNWOFxuXHRpZiAoY2hlY2soWzB4NEQsIDB4NTAsIDB4NDMsIDB4NEJdKSkge1xuXHRcdHJldHVybiB7XG5cdFx0XHRleHQ6ICdtcGMnLFxuXHRcdFx0bWltZTogJ2F1ZGlvL3gtbXVzZXBhY2snXG5cdFx0fTtcblx0fVxuXG5cdGlmIChjaGVjayhbMHg0MiwgMHg0NSwgMHg0NywgMHg0OSwgMHg0RSwgMHgzQV0pKSB7XG5cdFx0cmV0dXJuIHtcblx0XHRcdGV4dDogJ2ljcycsXG5cdFx0XHRtaW1lOiAndGV4dC9jYWxlbmRhcidcblx0XHR9O1xuXHR9XG5cblx0aWYgKGNoZWNrKFsweDY3LCAweDZDLCAweDU0LCAweDQ2LCAweDAyLCAweDAwLCAweDAwLCAweDAwXSkpIHtcblx0XHRyZXR1cm4ge1xuXHRcdFx0ZXh0OiAnZ2xiJyxcblx0XHRcdG1pbWU6ICdtb2RlbC9nbHRmLWJpbmFyeSdcblx0XHR9O1xuXHR9XG5cblx0aWYgKGNoZWNrKFsweEQ0LCAweEMzLCAweEIyLCAweEExXSkgfHwgY2hlY2soWzB4QTEsIDB4QjIsIDB4QzMsIDB4RDRdKSkge1xuXHRcdHJldHVybiB7XG5cdFx0XHRleHQ6ICdwY2FwJyxcblx0XHRcdG1pbWU6ICdhcHBsaWNhdGlvbi92bmQudGNwZHVtcC5wY2FwJ1xuXHRcdH07XG5cdH1cblxuXHRyZXR1cm4gbnVsbDtcbn07XG5cbm1vZHVsZS5leHBvcnRzID0gZmlsZVR5cGU7XG4vLyBUT0RPOiBSZW1vdmUgdGhpcyBmb3IgdGhlIG5leHQgbWFqb3IgcmVsZWFzZVxubW9kdWxlLmV4cG9ydHMuZGVmYXVsdCA9IGZpbGVUeXBlO1xuXG5PYmplY3QuZGVmaW5lUHJvcGVydHkoZmlsZVR5cGUsICdtaW5pbXVtQnl0ZXMnLCB7dmFsdWU6IDQxMDB9KTtcblxubW9kdWxlLmV4cG9ydHMuc3RyZWFtID0gcmVhZGFibGVTdHJlYW0gPT4gbmV3IFByb21pc2UocmVzb2x2ZSA9PiB7XG5cdC8vIFVzaW5nIGBldmFsYCB0byB3b3JrIGFyb3VuZCBpc3N1ZXMgd2hlbiBidW5kbGluZyB3aXRoIFdlYnBhY2tcblx0Y29uc3Qgc3RyZWFtID0gZXZhbCgncmVxdWlyZScpKCdzdHJlYW0nKTsgLy8gZXNsaW50LWRpc2FibGUtbGluZSBuby1ldmFsXG5cblx0cmVhZGFibGVTdHJlYW0ub25jZSgncmVhZGFibGUnLCAoKSA9PiB7XG5cdFx0Y29uc3QgcGFzcyA9IG5ldyBzdHJlYW0uUGFzc1Rocm91Z2goKTtcblx0XHRjb25zdCBjaHVuayA9IHJlYWRhYmxlU3RyZWFtLnJlYWQobW9kdWxlLmV4cG9ydHMubWluaW11bUJ5dGVzKSB8fCByZWFkYWJsZVN0cmVhbS5yZWFkKCk7XG5cdFx0cGFzcy5maWxlVHlwZSA9IGZpbGVUeXBlKGNodW5rKTtcblx0XHRyZWFkYWJsZVN0cmVhbS51bnNoaWZ0KGNodW5rKTtcblxuXHRcdGlmIChzdHJlYW0ucGlwZWxpbmUpIHtcblx0XHRcdHJlc29sdmUoc3RyZWFtLnBpcGVsaW5lKHJlYWRhYmxlU3RyZWFtLCBwYXNzKSk7XG5cdFx0fSBlbHNlIHtcblx0XHRcdHJlc29sdmUocmVhZGFibGVTdHJlYW0ucGlwZShwYXNzKSk7XG5cdFx0fVxuXHR9KTtcbn0pO1xuXG59KS5jYWxsKHRoaXMscmVxdWlyZShcImJ1ZmZlclwiKS5CdWZmZXIpIiwiKGZ1bmN0aW9uIChnbG9iYWwpe1xuLyohIGh0dHBzOi8vbXRocy5iZS9oZSB2MS4xLjEgYnkgQG1hdGhpYXMgfCBNSVQgbGljZW5zZSAqL1xuOyhmdW5jdGlvbihyb290KSB7XG5cblx0Ly8gRGV0ZWN0IGZyZWUgdmFyaWFibGVzIGBleHBvcnRzYC5cblx0dmFyIGZyZWVFeHBvcnRzID0gdHlwZW9mIGV4cG9ydHMgPT0gJ29iamVjdCcgJiYgZXhwb3J0cztcblxuXHQvLyBEZXRlY3QgZnJlZSB2YXJpYWJsZSBgbW9kdWxlYC5cblx0dmFyIGZyZWVNb2R1bGUgPSB0eXBlb2YgbW9kdWxlID09ICdvYmplY3QnICYmIG1vZHVsZSAmJlxuXHRcdG1vZHVsZS5leHBvcnRzID09IGZyZWVFeHBvcnRzICYmIG1vZHVsZTtcblxuXHQvLyBEZXRlY3QgZnJlZSB2YXJpYWJsZSBgZ2xvYmFsYCwgZnJvbSBOb2RlLmpzIG9yIEJyb3dzZXJpZmllZCBjb2RlLFxuXHQvLyBhbmQgdXNlIGl0IGFzIGByb290YC5cblx0dmFyIGZyZWVHbG9iYWwgPSB0eXBlb2YgZ2xvYmFsID09ICdvYmplY3QnICYmIGdsb2JhbDtcblx0aWYgKGZyZWVHbG9iYWwuZ2xvYmFsID09PSBmcmVlR2xvYmFsIHx8IGZyZWVHbG9iYWwud2luZG93ID09PSBmcmVlR2xvYmFsKSB7XG5cdFx0cm9vdCA9IGZyZWVHbG9iYWw7XG5cdH1cblxuXHQvKi0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tKi9cblxuXHQvLyBBbGwgYXN0cmFsIHN5bWJvbHMuXG5cdHZhciByZWdleEFzdHJhbFN5bWJvbHMgPSAvW1xcdUQ4MDAtXFx1REJGRl1bXFx1REMwMC1cXHVERkZGXS9nO1xuXHQvLyBBbGwgQVNDSUkgc3ltYm9scyAobm90IGp1c3QgcHJpbnRhYmxlIEFTQ0lJKSBleGNlcHQgdGhvc2UgbGlzdGVkIGluIHRoZVxuXHQvLyBmaXJzdCBjb2x1bW4gb2YgdGhlIG92ZXJyaWRlcyB0YWJsZS5cblx0Ly8gaHR0cHM6Ly9odG1sLnNwZWMud2hhdHdnLm9yZy9tdWx0aXBhZ2Uvc3ludGF4Lmh0bWwjdGFibGUtY2hhcnJlZi1vdmVycmlkZXNcblx0dmFyIHJlZ2V4QXNjaWlXaGl0ZWxpc3QgPSAvW1xceDAxLVxceDdGXS9nO1xuXHQvLyBBbGwgQk1QIHN5bWJvbHMgdGhhdCBhcmUgbm90IEFTQ0lJIG5ld2xpbmVzLCBwcmludGFibGUgQVNDSUkgc3ltYm9scywgb3Jcblx0Ly8gY29kZSBwb2ludHMgbGlzdGVkIGluIHRoZSBmaXJzdCBjb2x1bW4gb2YgdGhlIG92ZXJyaWRlcyB0YWJsZSBvblxuXHQvLyBodHRwczovL2h0bWwuc3BlYy53aGF0d2cub3JnL211bHRpcGFnZS9zeW50YXguaHRtbCN0YWJsZS1jaGFycmVmLW92ZXJyaWRlcy5cblx0dmFyIHJlZ2V4Qm1wV2hpdGVsaXN0ID0gL1tcXHgwMS1cXHRcXHgwQlxcZlxceDBFLVxceDFGXFx4N0ZcXHg4MVxceDhEXFx4OEZcXHg5MFxceDlEXFx4QTAtXFx1RkZGRl0vZztcblxuXHR2YXIgcmVnZXhFbmNvZGVOb25Bc2NpaSA9IC88XFx1MjBEMnw9XFx1MjBFNXw+XFx1MjBEMnxcXHUyMDVGXFx1MjAwQXxcXHUyMTlEXFx1MDMzOHxcXHUyMjAyXFx1MDMzOHxcXHUyMjIwXFx1MjBEMnxcXHUyMjI5XFx1RkUwMHxcXHUyMjJBXFx1RkUwMHxcXHUyMjNDXFx1MjBEMnxcXHUyMjNEXFx1MDMzMXxcXHUyMjNFXFx1MDMzM3xcXHUyMjQyXFx1MDMzOHxcXHUyMjRCXFx1MDMzOHxcXHUyMjREXFx1MjBEMnxcXHUyMjRFXFx1MDMzOHxcXHUyMjRGXFx1MDMzOHxcXHUyMjUwXFx1MDMzOHxcXHUyMjYxXFx1MjBFNXxcXHUyMjY0XFx1MjBEMnxcXHUyMjY1XFx1MjBEMnxcXHUyMjY2XFx1MDMzOHxcXHUyMjY3XFx1MDMzOHxcXHUyMjY4XFx1RkUwMHxcXHUyMjY5XFx1RkUwMHxcXHUyMjZBXFx1MDMzOHxcXHUyMjZBXFx1MjBEMnxcXHUyMjZCXFx1MDMzOHxcXHUyMjZCXFx1MjBEMnxcXHUyMjdGXFx1MDMzOHxcXHUyMjgyXFx1MjBEMnxcXHUyMjgzXFx1MjBEMnxcXHUyMjhBXFx1RkUwMHxcXHUyMjhCXFx1RkUwMHxcXHUyMjhGXFx1MDMzOHxcXHUyMjkwXFx1MDMzOHxcXHUyMjkzXFx1RkUwMHxcXHUyMjk0XFx1RkUwMHxcXHUyMkI0XFx1MjBEMnxcXHUyMkI1XFx1MjBEMnxcXHUyMkQ4XFx1MDMzOHxcXHUyMkQ5XFx1MDMzOHxcXHUyMkRBXFx1RkUwMHxcXHUyMkRCXFx1RkUwMHxcXHUyMkY1XFx1MDMzOHxcXHUyMkY5XFx1MDMzOHxcXHUyOTMzXFx1MDMzOHxcXHUyOUNGXFx1MDMzOHxcXHUyOUQwXFx1MDMzOHxcXHUyQTZEXFx1MDMzOHxcXHUyQTcwXFx1MDMzOHxcXHUyQTdEXFx1MDMzOHxcXHUyQTdFXFx1MDMzOHxcXHUyQUExXFx1MDMzOHxcXHUyQUEyXFx1MDMzOHxcXHUyQUFDXFx1RkUwMHxcXHUyQUFEXFx1RkUwMHxcXHUyQUFGXFx1MDMzOHxcXHUyQUIwXFx1MDMzOHxcXHUyQUM1XFx1MDMzOHxcXHUyQUM2XFx1MDMzOHxcXHUyQUNCXFx1RkUwMHxcXHUyQUNDXFx1RkUwMHxcXHUyQUZEXFx1MjBFNXxbXFx4QTAtXFx1MDExM1xcdTAxMTYtXFx1MDEyMlxcdTAxMjQtXFx1MDEyQlxcdTAxMkUtXFx1MDE0RFxcdTAxNTAtXFx1MDE3RVxcdTAxOTJcXHUwMUI1XFx1MDFGNVxcdTAyMzdcXHUwMkM2XFx1MDJDN1xcdTAyRDgtXFx1MDJERFxcdTAzMTFcXHUwMzkxLVxcdTAzQTFcXHUwM0EzLVxcdTAzQTlcXHUwM0IxLVxcdTAzQzlcXHUwM0QxXFx1MDNEMlxcdTAzRDVcXHUwM0Q2XFx1MDNEQ1xcdTAzRERcXHUwM0YwXFx1MDNGMVxcdTAzRjVcXHUwM0Y2XFx1MDQwMS1cXHUwNDBDXFx1MDQwRS1cXHUwNDRGXFx1MDQ1MS1cXHUwNDVDXFx1MDQ1RVxcdTA0NUZcXHUyMDAyLVxcdTIwMDVcXHUyMDA3LVxcdTIwMTBcXHUyMDEzLVxcdTIwMTZcXHUyMDE4LVxcdTIwMUFcXHUyMDFDLVxcdTIwMUVcXHUyMDIwLVxcdTIwMjJcXHUyMDI1XFx1MjAyNlxcdTIwMzAtXFx1MjAzNVxcdTIwMzlcXHUyMDNBXFx1MjAzRVxcdTIwNDFcXHUyMDQzXFx1MjA0NFxcdTIwNEZcXHUyMDU3XFx1MjA1Ri1cXHUyMDYzXFx1MjBBQ1xcdTIwREJcXHUyMERDXFx1MjEwMlxcdTIxMDVcXHUyMTBBLVxcdTIxMTNcXHUyMTE1LVxcdTIxMUVcXHUyMTIyXFx1MjEyNFxcdTIxMjctXFx1MjEyOVxcdTIxMkNcXHUyMTJEXFx1MjEyRi1cXHUyMTMxXFx1MjEzMy1cXHUyMTM4XFx1MjE0NS1cXHUyMTQ4XFx1MjE1My1cXHUyMTVFXFx1MjE5MC1cXHUyMTlCXFx1MjE5RC1cXHUyMUE3XFx1MjFBOS1cXHUyMUFFXFx1MjFCMC1cXHUyMUIzXFx1MjFCNS1cXHUyMUI3XFx1MjFCQS1cXHUyMURCXFx1MjFERFxcdTIxRTRcXHUyMUU1XFx1MjFGNVxcdTIxRkQtXFx1MjIwNVxcdTIyMDctXFx1MjIwOVxcdTIyMEJcXHUyMjBDXFx1MjIwRi1cXHUyMjE0XFx1MjIxNi1cXHUyMjE4XFx1MjIxQVxcdTIyMUQtXFx1MjIzOFxcdTIyM0EtXFx1MjI1N1xcdTIyNTlcXHUyMjVBXFx1MjI1Q1xcdTIyNUYtXFx1MjI2MlxcdTIyNjQtXFx1MjI4QlxcdTIyOEQtXFx1MjI5QlxcdTIyOUQtXFx1MjJBNVxcdTIyQTctXFx1MjJCMFxcdTIyQjItXFx1MjJCQlxcdTIyQkQtXFx1MjJEQlxcdTIyREUtXFx1MjJFM1xcdTIyRTYtXFx1MjJGN1xcdTIyRjktXFx1MjJGRVxcdTIzMDVcXHUyMzA2XFx1MjMwOC1cXHUyMzEwXFx1MjMxMlxcdTIzMTNcXHUyMzE1XFx1MjMxNlxcdTIzMUMtXFx1MjMxRlxcdTIzMjJcXHUyMzIzXFx1MjMyRFxcdTIzMkVcXHUyMzM2XFx1MjMzRFxcdTIzM0ZcXHUyMzdDXFx1MjNCMFxcdTIzQjFcXHUyM0I0LVxcdTIzQjZcXHUyM0RDLVxcdTIzREZcXHUyM0UyXFx1MjNFN1xcdTI0MjNcXHUyNEM4XFx1MjUwMFxcdTI1MDJcXHUyNTBDXFx1MjUxMFxcdTI1MTRcXHUyNTE4XFx1MjUxQ1xcdTI1MjRcXHUyNTJDXFx1MjUzNFxcdTI1M0NcXHUyNTUwLVxcdTI1NkNcXHUyNTgwXFx1MjU4NFxcdTI1ODhcXHUyNTkxLVxcdTI1OTNcXHUyNUExXFx1MjVBQVxcdTI1QUJcXHUyNUFEXFx1MjVBRVxcdTI1QjFcXHUyNUIzLVxcdTI1QjVcXHUyNUI4XFx1MjVCOVxcdTI1QkQtXFx1MjVCRlxcdTI1QzJcXHUyNUMzXFx1MjVDQVxcdTI1Q0JcXHUyNUVDXFx1MjVFRlxcdTI1RjgtXFx1MjVGQ1xcdTI2MDVcXHUyNjA2XFx1MjYwRVxcdTI2NDBcXHUyNjQyXFx1MjY2MFxcdTI2NjNcXHUyNjY1XFx1MjY2NlxcdTI2NkFcXHUyNjZELVxcdTI2NkZcXHUyNzEzXFx1MjcxN1xcdTI3MjBcXHUyNzM2XFx1Mjc1OFxcdTI3NzJcXHUyNzczXFx1MjdDOFxcdTI3QzlcXHUyN0U2LVxcdTI3RURcXHUyN0Y1LVxcdTI3RkFcXHUyN0ZDXFx1MjdGRlxcdTI5MDItXFx1MjkwNVxcdTI5MEMtXFx1MjkxM1xcdTI5MTZcXHUyOTE5LVxcdTI5MjBcXHUyOTIzLVxcdTI5MkFcXHUyOTMzXFx1MjkzNS1cXHUyOTM5XFx1MjkzQ1xcdTI5M0RcXHUyOTQ1XFx1Mjk0OC1cXHUyOTRCXFx1Mjk0RS1cXHUyOTc2XFx1Mjk3OFxcdTI5NzlcXHUyOTdCLVxcdTI5N0ZcXHUyOTg1XFx1Mjk4NlxcdTI5OEItXFx1Mjk5NlxcdTI5OUFcXHUyOTlDXFx1Mjk5RFxcdTI5QTQtXFx1MjlCN1xcdTI5QjlcXHUyOUJCXFx1MjlCQ1xcdTI5QkUtXFx1MjlDNVxcdTI5QzlcXHUyOUNELVxcdTI5RDBcXHUyOURDLVxcdTI5REVcXHUyOUUzLVxcdTI5RTVcXHUyOUVCXFx1MjlGNFxcdTI5RjZcXHUyQTAwLVxcdTJBMDJcXHUyQTA0XFx1MkEwNlxcdTJBMENcXHUyQTBEXFx1MkExMC1cXHUyQTE3XFx1MkEyMi1cXHUyQTI3XFx1MkEyOVxcdTJBMkFcXHUyQTJELVxcdTJBMzFcXHUyQTMzLVxcdTJBM0NcXHUyQTNGXFx1MkE0MFxcdTJBNDItXFx1MkE0RFxcdTJBNTBcXHUyQTUzLVxcdTJBNThcXHUyQTVBLVxcdTJBNURcXHUyQTVGXFx1MkE2NlxcdTJBNkFcXHUyQTZELVxcdTJBNzVcXHUyQTc3LVxcdTJBOUFcXHUyQTlELVxcdTJBQTJcXHUyQUE0LVxcdTJBQjBcXHUyQUIzLVxcdTJBQzhcXHUyQUNCXFx1MkFDQ1xcdTJBQ0YtXFx1MkFEQlxcdTJBRTRcXHUyQUU2LVxcdTJBRTlcXHUyQUVCLVxcdTJBRjNcXHUyQUZEXFx1RkIwMC1cXHVGQjA0XXxcXHVEODM1W1xcdURDOUNcXHVEQzlFXFx1REM5RlxcdURDQTJcXHVEQ0E1XFx1RENBNlxcdURDQTktXFx1RENBQ1xcdURDQUUtXFx1RENCOVxcdURDQkJcXHVEQ0JELVxcdURDQzNcXHVEQ0M1LVxcdURDQ0ZcXHVERDA0XFx1REQwNVxcdUREMDctXFx1REQwQVxcdUREMEQtXFx1REQxNFxcdUREMTYtXFx1REQxQ1xcdUREMUUtXFx1REQzOVxcdUREM0ItXFx1REQzRVxcdURENDAtXFx1REQ0NFxcdURENDZcXHVERDRBLVxcdURENTBcXHVERDUyLVxcdURENkJdL2c7XG5cdHZhciBlbmNvZGVNYXAgPSB7J1xceEFEJzonc2h5JywnXFx1MjAwQyc6J3p3bmonLCdcXHUyMDBEJzonendqJywnXFx1MjAwRSc6J2xybScsJ1xcdTIwNjMnOidpYycsJ1xcdTIwNjInOidpdCcsJ1xcdTIwNjEnOidhZicsJ1xcdTIwMEYnOidybG0nLCdcXHUyMDBCJzonWmVyb1dpZHRoU3BhY2UnLCdcXHUyMDYwJzonTm9CcmVhaycsJ1xcdTAzMTEnOidEb3duQnJldmUnLCdcXHUyMERCJzondGRvdCcsJ1xcdTIwREMnOidEb3REb3QnLCdcXHQnOidUYWInLCdcXG4nOidOZXdMaW5lJywnXFx1MjAwOCc6J3B1bmNzcCcsJ1xcdTIwNUYnOidNZWRpdW1TcGFjZScsJ1xcdTIwMDknOid0aGluc3AnLCdcXHUyMDBBJzonaGFpcnNwJywnXFx1MjAwNCc6J2Vtc3AxMycsJ1xcdTIwMDInOidlbnNwJywnXFx1MjAwNSc6J2Vtc3AxNCcsJ1xcdTIwMDMnOidlbXNwJywnXFx1MjAwNyc6J251bXNwJywnXFx4QTAnOiduYnNwJywnXFx1MjA1RlxcdTIwMEEnOidUaGlja1NwYWNlJywnXFx1MjAzRSc6J29saW5lJywnXyc6J2xvd2JhcicsJ1xcdTIwMTAnOidkYXNoJywnXFx1MjAxMyc6J25kYXNoJywnXFx1MjAxNCc6J21kYXNoJywnXFx1MjAxNSc6J2hvcmJhcicsJywnOidjb21tYScsJzsnOidzZW1pJywnXFx1MjA0Ric6J2JzZW1pJywnOic6J2NvbG9uJywnXFx1MkE3NCc6J0NvbG9uZScsJyEnOidleGNsJywnXFx4QTEnOidpZXhjbCcsJz8nOidxdWVzdCcsJ1xceEJGJzonaXF1ZXN0JywnLic6J3BlcmlvZCcsJ1xcdTIwMjUnOidubGRyJywnXFx1MjAyNic6J21sZHInLCdcXHhCNyc6J21pZGRvdCcsJ1xcJyc6J2Fwb3MnLCdcXHUyMDE4JzonbHNxdW8nLCdcXHUyMDE5JzoncnNxdW8nLCdcXHUyMDFBJzonc2JxdW8nLCdcXHUyMDM5JzonbHNhcXVvJywnXFx1MjAzQSc6J3JzYXF1bycsJ1wiJzoncXVvdCcsJ1xcdTIwMUMnOidsZHF1bycsJ1xcdTIwMUQnOidyZHF1bycsJ1xcdTIwMUUnOidiZHF1bycsJ1xceEFCJzonbGFxdW8nLCdcXHhCQic6J3JhcXVvJywnKCc6J2xwYXInLCcpJzoncnBhcicsJ1snOidsc3FiJywnXSc6J3JzcWInLCd7JzonbGN1YicsJ30nOidyY3ViJywnXFx1MjMwOCc6J2xjZWlsJywnXFx1MjMwOSc6J3JjZWlsJywnXFx1MjMwQSc6J2xmbG9vcicsJ1xcdTIzMEInOidyZmxvb3InLCdcXHUyOTg1JzonbG9wYXInLCdcXHUyOTg2Jzoncm9wYXInLCdcXHUyOThCJzonbGJya2UnLCdcXHUyOThDJzoncmJya2UnLCdcXHUyOThEJzonbGJya3NsdScsJ1xcdTI5OEUnOidyYnJrc2xkJywnXFx1Mjk4Ric6J2xicmtzbGQnLCdcXHUyOTkwJzoncmJya3NsdScsJ1xcdTI5OTEnOidsYW5nZCcsJ1xcdTI5OTInOidyYW5nZCcsJ1xcdTI5OTMnOidscGFybHQnLCdcXHUyOTk0JzoncnBhcmd0JywnXFx1Mjk5NSc6J2d0bFBhcicsJ1xcdTI5OTYnOidsdHJQYXInLCdcXHUyN0U2JzonbG9icmsnLCdcXHUyN0U3Jzoncm9icmsnLCdcXHUyN0U4JzonbGFuZycsJ1xcdTI3RTknOidyYW5nJywnXFx1MjdFQSc6J0xhbmcnLCdcXHUyN0VCJzonUmFuZycsJ1xcdTI3RUMnOidsb2FuZycsJ1xcdTI3RUQnOidyb2FuZycsJ1xcdTI3NzInOidsYmJyaycsJ1xcdTI3NzMnOidyYmJyaycsJ1xcdTIwMTYnOidWZXJ0JywnXFx4QTcnOidzZWN0JywnXFx4QjYnOidwYXJhJywnQCc6J2NvbW1hdCcsJyonOidhc3QnLCcvJzonc29sJywndW5kZWZpbmVkJzpudWxsLCcmJzonYW1wJywnIyc6J251bScsJyUnOidwZXJjbnQnLCdcXHUyMDMwJzoncGVybWlsJywnXFx1MjAzMSc6J3BlcnRlbmsnLCdcXHUyMDIwJzonZGFnZ2VyJywnXFx1MjAyMSc6J0RhZ2dlcicsJ1xcdTIwMjInOididWxsJywnXFx1MjA0Myc6J2h5YnVsbCcsJ1xcdTIwMzInOidwcmltZScsJ1xcdTIwMzMnOidQcmltZScsJ1xcdTIwMzQnOid0cHJpbWUnLCdcXHUyMDU3JzoncXByaW1lJywnXFx1MjAzNSc6J2JwcmltZScsJ1xcdTIwNDEnOidjYXJldCcsJ2AnOidncmF2ZScsJ1xceEI0JzonYWN1dGUnLCdcXHUwMkRDJzondGlsZGUnLCdeJzonSGF0JywnXFx4QUYnOidtYWNyJywnXFx1MDJEOCc6J2JyZXZlJywnXFx1MDJEOSc6J2RvdCcsJ1xceEE4JzonZGllJywnXFx1MDJEQSc6J3JpbmcnLCdcXHUwMkREJzonZGJsYWMnLCdcXHhCOCc6J2NlZGlsJywnXFx1MDJEQic6J29nb24nLCdcXHUwMkM2JzonY2lyYycsJ1xcdTAyQzcnOidjYXJvbicsJ1xceEIwJzonZGVnJywnXFx4QTknOidjb3B5JywnXFx4QUUnOidyZWcnLCdcXHUyMTE3JzonY29weXNyJywnXFx1MjExOCc6J3dwJywnXFx1MjExRSc6J3J4JywnXFx1MjEyNyc6J21obycsJ1xcdTIxMjknOidpaW90YScsJ1xcdTIxOTAnOidsYXJyJywnXFx1MjE5QSc6J25sYXJyJywnXFx1MjE5Mic6J3JhcnInLCdcXHUyMTlCJzonbnJhcnInLCdcXHUyMTkxJzondWFycicsJ1xcdTIxOTMnOidkYXJyJywnXFx1MjE5NCc6J2hhcnInLCdcXHUyMUFFJzonbmhhcnInLCdcXHUyMTk1JzondmFycicsJ1xcdTIxOTYnOidud2FycicsJ1xcdTIxOTcnOiduZWFycicsJ1xcdTIxOTgnOidzZWFycicsJ1xcdTIxOTknOidzd2FycicsJ1xcdTIxOUQnOidyYXJydycsJ1xcdTIxOURcXHUwMzM4JzonbnJhcnJ3JywnXFx1MjE5RSc6J0xhcnInLCdcXHUyMTlGJzonVWFycicsJ1xcdTIxQTAnOidSYXJyJywnXFx1MjFBMSc6J0RhcnInLCdcXHUyMUEyJzonbGFycnRsJywnXFx1MjFBMyc6J3JhcnJ0bCcsJ1xcdTIxQTQnOidtYXBzdG9sZWZ0JywnXFx1MjFBNSc6J21hcHN0b3VwJywnXFx1MjFBNic6J21hcCcsJ1xcdTIxQTcnOidtYXBzdG9kb3duJywnXFx1MjFBOSc6J2xhcnJoaycsJ1xcdTIxQUEnOidyYXJyaGsnLCdcXHUyMUFCJzonbGFycmxwJywnXFx1MjFBQyc6J3JhcnJscCcsJ1xcdTIxQUQnOidoYXJydycsJ1xcdTIxQjAnOidsc2gnLCdcXHUyMUIxJzoncnNoJywnXFx1MjFCMic6J2xkc2gnLCdcXHUyMUIzJzoncmRzaCcsJ1xcdTIxQjUnOidjcmFycicsJ1xcdTIxQjYnOidjdWxhcnInLCdcXHUyMUI3JzonY3VyYXJyJywnXFx1MjFCQSc6J29sYXJyJywnXFx1MjFCQic6J29yYXJyJywnXFx1MjFCQyc6J2xoYXJ1JywnXFx1MjFCRCc6J2xoYXJkJywnXFx1MjFCRSc6J3VoYXJyJywnXFx1MjFCRic6J3VoYXJsJywnXFx1MjFDMCc6J3JoYXJ1JywnXFx1MjFDMSc6J3JoYXJkJywnXFx1MjFDMic6J2RoYXJyJywnXFx1MjFDMyc6J2RoYXJsJywnXFx1MjFDNCc6J3JsYXJyJywnXFx1MjFDNSc6J3VkYXJyJywnXFx1MjFDNic6J2xyYXJyJywnXFx1MjFDNyc6J2xsYXJyJywnXFx1MjFDOCc6J3V1YXJyJywnXFx1MjFDOSc6J3JyYXJyJywnXFx1MjFDQSc6J2RkYXJyJywnXFx1MjFDQic6J2xyaGFyJywnXFx1MjFDQyc6J3JsaGFyJywnXFx1MjFEMCc6J2xBcnInLCdcXHUyMUNEJzonbmxBcnInLCdcXHUyMUQxJzondUFycicsJ1xcdTIxRDInOidyQXJyJywnXFx1MjFDRic6J25yQXJyJywnXFx1MjFEMyc6J2RBcnInLCdcXHUyMUQ0JzonaWZmJywnXFx1MjFDRSc6J25oQXJyJywnXFx1MjFENSc6J3ZBcnInLCdcXHUyMUQ2JzonbndBcnInLCdcXHUyMUQ3JzonbmVBcnInLCdcXHUyMUQ4Jzonc2VBcnInLCdcXHUyMUQ5Jzonc3dBcnInLCdcXHUyMURBJzonbEFhcnInLCdcXHUyMURCJzonckFhcnInLCdcXHUyMUREJzonemlncmFycicsJ1xcdTIxRTQnOidsYXJyYicsJ1xcdTIxRTUnOidyYXJyYicsJ1xcdTIxRjUnOidkdWFycicsJ1xcdTIxRkQnOidsb2FycicsJ1xcdTIxRkUnOidyb2FycicsJ1xcdTIxRkYnOidob2FycicsJ1xcdTIyMDAnOidmb3JhbGwnLCdcXHUyMjAxJzonY29tcCcsJ1xcdTIyMDInOidwYXJ0JywnXFx1MjIwMlxcdTAzMzgnOiducGFydCcsJ1xcdTIyMDMnOidleGlzdCcsJ1xcdTIyMDQnOiduZXhpc3QnLCdcXHUyMjA1JzonZW1wdHknLCdcXHUyMjA3JzonRGVsJywnXFx1MjIwOCc6J2luJywnXFx1MjIwOSc6J25vdGluJywnXFx1MjIwQic6J25pJywnXFx1MjIwQyc6J25vdG5pJywnXFx1MDNGNic6J2JlcHNpJywnXFx1MjIwRic6J3Byb2QnLCdcXHUyMjEwJzonY29wcm9kJywnXFx1MjIxMSc6J3N1bScsJysnOidwbHVzJywnXFx4QjEnOidwbScsJ1xceEY3JzonZGl2JywnXFx4RDcnOid0aW1lcycsJzwnOidsdCcsJ1xcdTIyNkUnOidubHQnLCc8XFx1MjBEMic6J252bHQnLCc9JzonZXF1YWxzJywnXFx1MjI2MCc6J25lJywnPVxcdTIwRTUnOidibmUnLCdcXHUyQTc1JzonRXF1YWwnLCc+JzonZ3QnLCdcXHUyMjZGJzonbmd0JywnPlxcdTIwRDInOidudmd0JywnXFx4QUMnOidub3QnLCd8JzondmVydCcsJ1xceEE2JzonYnJ2YmFyJywnXFx1MjIxMic6J21pbnVzJywnXFx1MjIxMyc6J21wJywnXFx1MjIxNCc6J3BsdXNkbycsJ1xcdTIwNDQnOidmcmFzbCcsJ1xcdTIyMTYnOidzZXRtbicsJ1xcdTIyMTcnOidsb3dhc3QnLCdcXHUyMjE4JzonY29tcGZuJywnXFx1MjIxQSc6J1NxcnQnLCdcXHUyMjFEJzoncHJvcCcsJ1xcdTIyMUUnOidpbmZpbicsJ1xcdTIyMUYnOidhbmdydCcsJ1xcdTIyMjAnOidhbmcnLCdcXHUyMjIwXFx1MjBEMic6J25hbmcnLCdcXHUyMjIxJzonYW5nbXNkJywnXFx1MjIyMic6J2FuZ3NwaCcsJ1xcdTIyMjMnOidtaWQnLCdcXHUyMjI0Jzonbm1pZCcsJ1xcdTIyMjUnOidwYXInLCdcXHUyMjI2JzonbnBhcicsJ1xcdTIyMjcnOidhbmQnLCdcXHUyMjI4Jzonb3InLCdcXHUyMjI5JzonY2FwJywnXFx1MjIyOVxcdUZFMDAnOidjYXBzJywnXFx1MjIyQSc6J2N1cCcsJ1xcdTIyMkFcXHVGRTAwJzonY3VwcycsJ1xcdTIyMkInOidpbnQnLCdcXHUyMjJDJzonSW50JywnXFx1MjIyRCc6J3RpbnQnLCdcXHUyQTBDJzoncWludCcsJ1xcdTIyMkUnOidvaW50JywnXFx1MjIyRic6J0NvbmludCcsJ1xcdTIyMzAnOidDY29uaW50JywnXFx1MjIzMSc6J2N3aW50JywnXFx1MjIzMic6J2N3Y29uaW50JywnXFx1MjIzMyc6J2F3Y29uaW50JywnXFx1MjIzNCc6J3RoZXJlNCcsJ1xcdTIyMzUnOidiZWNhdXMnLCdcXHUyMjM2JzoncmF0aW8nLCdcXHUyMjM3JzonQ29sb24nLCdcXHUyMjM4JzonbWludXNkJywnXFx1MjIzQSc6J21ERG90JywnXFx1MjIzQic6J2hvbXRodCcsJ1xcdTIyM0MnOidzaW0nLCdcXHUyMjQxJzonbnNpbScsJ1xcdTIyM0NcXHUyMEQyJzonbnZzaW0nLCdcXHUyMjNEJzonYnNpbScsJ1xcdTIyM0RcXHUwMzMxJzoncmFjZScsJ1xcdTIyM0UnOidhYycsJ1xcdTIyM0VcXHUwMzMzJzonYWNFJywnXFx1MjIzRic6J2FjZCcsJ1xcdTIyNDAnOid3cicsJ1xcdTIyNDInOidlc2ltJywnXFx1MjI0MlxcdTAzMzgnOiduZXNpbScsJ1xcdTIyNDMnOidzaW1lJywnXFx1MjI0NCc6J25zaW1lJywnXFx1MjI0NSc6J2NvbmcnLCdcXHUyMjQ3JzonbmNvbmcnLCdcXHUyMjQ2Jzonc2ltbmUnLCdcXHUyMjQ4JzonYXAnLCdcXHUyMjQ5JzonbmFwJywnXFx1MjI0QSc6J2FwZScsJ1xcdTIyNEInOidhcGlkJywnXFx1MjI0QlxcdTAzMzgnOiduYXBpZCcsJ1xcdTIyNEMnOidiY29uZycsJ1xcdTIyNEQnOidDdXBDYXAnLCdcXHUyMjZEJzonTm90Q3VwQ2FwJywnXFx1MjI0RFxcdTIwRDInOidudmFwJywnXFx1MjI0RSc6J2J1bXAnLCdcXHUyMjRFXFx1MDMzOCc6J25idW1wJywnXFx1MjI0Ric6J2J1bXBlJywnXFx1MjI0RlxcdTAzMzgnOiduYnVtcGUnLCdcXHUyMjUwJzonZG90ZXEnLCdcXHUyMjUwXFx1MDMzOCc6J25lZG90JywnXFx1MjI1MSc6J2VEb3QnLCdcXHUyMjUyJzonZWZEb3QnLCdcXHUyMjUzJzonZXJEb3QnLCdcXHUyMjU0JzonY29sb25lJywnXFx1MjI1NSc6J2Vjb2xvbicsJ1xcdTIyNTYnOidlY2lyJywnXFx1MjI1Nyc6J2NpcmUnLCdcXHUyMjU5Jzond2VkZ2VxJywnXFx1MjI1QSc6J3ZlZWVxJywnXFx1MjI1Qyc6J3RyaWUnLCdcXHUyMjVGJzonZXF1ZXN0JywnXFx1MjI2MSc6J2VxdWl2JywnXFx1MjI2Mic6J25lcXVpdicsJ1xcdTIyNjFcXHUyMEU1JzonYm5lcXVpdicsJ1xcdTIyNjQnOidsZScsJ1xcdTIyNzAnOidubGUnLCdcXHUyMjY0XFx1MjBEMic6J252bGUnLCdcXHUyMjY1JzonZ2UnLCdcXHUyMjcxJzonbmdlJywnXFx1MjI2NVxcdTIwRDInOidudmdlJywnXFx1MjI2Nic6J2xFJywnXFx1MjI2NlxcdTAzMzgnOidubEUnLCdcXHUyMjY3JzonZ0UnLCdcXHUyMjY3XFx1MDMzOCc6J25nRScsJ1xcdTIyNjhcXHVGRTAwJzonbHZuRScsJ1xcdTIyNjgnOidsbkUnLCdcXHUyMjY5JzonZ25FJywnXFx1MjI2OVxcdUZFMDAnOidndm5FJywnXFx1MjI2QSc6J2xsJywnXFx1MjI2QVxcdTAzMzgnOiduTHR2JywnXFx1MjI2QVxcdTIwRDInOiduTHQnLCdcXHUyMjZCJzonZ2cnLCdcXHUyMjZCXFx1MDMzOCc6J25HdHYnLCdcXHUyMjZCXFx1MjBEMic6J25HdCcsJ1xcdTIyNkMnOid0d2l4dCcsJ1xcdTIyNzInOidsc2ltJywnXFx1MjI3NCc6J25sc2ltJywnXFx1MjI3Myc6J2dzaW0nLCdcXHUyMjc1JzonbmdzaW0nLCdcXHUyMjc2JzonbGcnLCdcXHUyMjc4JzonbnRsZycsJ1xcdTIyNzcnOidnbCcsJ1xcdTIyNzknOidudGdsJywnXFx1MjI3QSc6J3ByJywnXFx1MjI4MCc6J25wcicsJ1xcdTIyN0InOidzYycsJ1xcdTIyODEnOiduc2MnLCdcXHUyMjdDJzoncHJjdWUnLCdcXHUyMkUwJzonbnByY3VlJywnXFx1MjI3RCc6J3NjY3VlJywnXFx1MjJFMSc6J25zY2N1ZScsJ1xcdTIyN0UnOidwcnNpbScsJ1xcdTIyN0YnOidzY3NpbScsJ1xcdTIyN0ZcXHUwMzM4JzonTm90U3VjY2VlZHNUaWxkZScsJ1xcdTIyODInOidzdWInLCdcXHUyMjg0JzonbnN1YicsJ1xcdTIyODJcXHUyMEQyJzondm5zdWInLCdcXHUyMjgzJzonc3VwJywnXFx1MjI4NSc6J25zdXAnLCdcXHUyMjgzXFx1MjBEMic6J3Zuc3VwJywnXFx1MjI4Nic6J3N1YmUnLCdcXHUyMjg4JzonbnN1YmUnLCdcXHUyMjg3Jzonc3VwZScsJ1xcdTIyODknOiduc3VwZScsJ1xcdTIyOEFcXHVGRTAwJzondnN1Ym5lJywnXFx1MjI4QSc6J3N1Ym5lJywnXFx1MjI4QlxcdUZFMDAnOid2c3VwbmUnLCdcXHUyMjhCJzonc3VwbmUnLCdcXHUyMjhEJzonY3VwZG90JywnXFx1MjI4RSc6J3VwbHVzJywnXFx1MjI4Ric6J3Nxc3ViJywnXFx1MjI4RlxcdTAzMzgnOidOb3RTcXVhcmVTdWJzZXQnLCdcXHUyMjkwJzonc3FzdXAnLCdcXHUyMjkwXFx1MDMzOCc6J05vdFNxdWFyZVN1cGVyc2V0JywnXFx1MjI5MSc6J3Nxc3ViZScsJ1xcdTIyRTInOiduc3FzdWJlJywnXFx1MjI5Mic6J3Nxc3VwZScsJ1xcdTIyRTMnOiduc3FzdXBlJywnXFx1MjI5Myc6J3NxY2FwJywnXFx1MjI5M1xcdUZFMDAnOidzcWNhcHMnLCdcXHUyMjk0Jzonc3FjdXAnLCdcXHUyMjk0XFx1RkUwMCc6J3NxY3VwcycsJ1xcdTIyOTUnOidvcGx1cycsJ1xcdTIyOTYnOidvbWludXMnLCdcXHUyMjk3Jzonb3RpbWVzJywnXFx1MjI5OCc6J29zb2wnLCdcXHUyMjk5Jzonb2RvdCcsJ1xcdTIyOUEnOidvY2lyJywnXFx1MjI5Qic6J29hc3QnLCdcXHUyMjlEJzonb2Rhc2gnLCdcXHUyMjlFJzoncGx1c2InLCdcXHUyMjlGJzonbWludXNiJywnXFx1MjJBMCc6J3RpbWVzYicsJ1xcdTIyQTEnOidzZG90YicsJ1xcdTIyQTInOid2ZGFzaCcsJ1xcdTIyQUMnOidudmRhc2gnLCdcXHUyMkEzJzonZGFzaHYnLCdcXHUyMkE0JzondG9wJywnXFx1MjJBNSc6J2JvdCcsJ1xcdTIyQTcnOidtb2RlbHMnLCdcXHUyMkE4JzondkRhc2gnLCdcXHUyMkFEJzonbnZEYXNoJywnXFx1MjJBOSc6J1ZkYXNoJywnXFx1MjJBRSc6J25WZGFzaCcsJ1xcdTIyQUEnOidWdmRhc2gnLCdcXHUyMkFCJzonVkRhc2gnLCdcXHUyMkFGJzonblZEYXNoJywnXFx1MjJCMCc6J3BydXJlbCcsJ1xcdTIyQjInOid2bHRyaScsJ1xcdTIyRUEnOidubHRyaScsJ1xcdTIyQjMnOid2cnRyaScsJ1xcdTIyRUInOiducnRyaScsJ1xcdTIyQjQnOidsdHJpZScsJ1xcdTIyRUMnOidubHRyaWUnLCdcXHUyMkI0XFx1MjBEMic6J252bHRyaWUnLCdcXHUyMkI1JzoncnRyaWUnLCdcXHUyMkVEJzonbnJ0cmllJywnXFx1MjJCNVxcdTIwRDInOidudnJ0cmllJywnXFx1MjJCNic6J29yaWdvZicsJ1xcdTIyQjcnOidpbW9mJywnXFx1MjJCOCc6J211bWFwJywnXFx1MjJCOSc6J2hlcmNvbicsJ1xcdTIyQkEnOidpbnRjYWwnLCdcXHUyMkJCJzondmVlYmFyJywnXFx1MjJCRCc6J2JhcnZlZScsJ1xcdTIyQkUnOidhbmdydHZiJywnXFx1MjJCRic6J2xydHJpJywnXFx1MjJDMCc6J1dlZGdlJywnXFx1MjJDMSc6J1ZlZScsJ1xcdTIyQzInOid4Y2FwJywnXFx1MjJDMyc6J3hjdXAnLCdcXHUyMkM0JzonZGlhbScsJ1xcdTIyQzUnOidzZG90JywnXFx1MjJDNic6J1N0YXInLCdcXHUyMkM3JzonZGl2b254JywnXFx1MjJDOCc6J2Jvd3RpZScsJ1xcdTIyQzknOidsdGltZXMnLCdcXHUyMkNBJzoncnRpbWVzJywnXFx1MjJDQic6J2x0aHJlZScsJ1xcdTIyQ0MnOidydGhyZWUnLCdcXHUyMkNEJzonYnNpbWUnLCdcXHUyMkNFJzonY3V2ZWUnLCdcXHUyMkNGJzonY3V3ZWQnLCdcXHUyMkQwJzonU3ViJywnXFx1MjJEMSc6J1N1cCcsJ1xcdTIyRDInOidDYXAnLCdcXHUyMkQzJzonQ3VwJywnXFx1MjJENCc6J2ZvcmsnLCdcXHUyMkQ1JzonZXBhcicsJ1xcdTIyRDYnOidsdGRvdCcsJ1xcdTIyRDcnOidndGRvdCcsJ1xcdTIyRDgnOidMbCcsJ1xcdTIyRDhcXHUwMzM4JzonbkxsJywnXFx1MjJEOSc6J0dnJywnXFx1MjJEOVxcdTAzMzgnOiduR2cnLCdcXHUyMkRBXFx1RkUwMCc6J2xlc2cnLCdcXHUyMkRBJzonbGVnJywnXFx1MjJEQic6J2dlbCcsJ1xcdTIyREJcXHVGRTAwJzonZ2VzbCcsJ1xcdTIyREUnOidjdWVwcicsJ1xcdTIyREYnOidjdWVzYycsJ1xcdTIyRTYnOidsbnNpbScsJ1xcdTIyRTcnOidnbnNpbScsJ1xcdTIyRTgnOidwcm5zaW0nLCdcXHUyMkU5Jzonc2Nuc2ltJywnXFx1MjJFRSc6J3ZlbGxpcCcsJ1xcdTIyRUYnOidjdGRvdCcsJ1xcdTIyRjAnOid1dGRvdCcsJ1xcdTIyRjEnOidkdGRvdCcsJ1xcdTIyRjInOidkaXNpbicsJ1xcdTIyRjMnOidpc2luc3YnLCdcXHUyMkY0JzonaXNpbnMnLCdcXHUyMkY1JzonaXNpbmRvdCcsJ1xcdTIyRjVcXHUwMzM4Jzonbm90aW5kb3QnLCdcXHUyMkY2Jzonbm90aW52YycsJ1xcdTIyRjcnOidub3RpbnZiJywnXFx1MjJGOSc6J2lzaW5FJywnXFx1MjJGOVxcdTAzMzgnOidub3RpbkUnLCdcXHUyMkZBJzonbmlzZCcsJ1xcdTIyRkInOid4bmlzJywnXFx1MjJGQyc6J25pcycsJ1xcdTIyRkQnOidub3RuaXZjJywnXFx1MjJGRSc6J25vdG5pdmInLCdcXHUyMzA1JzonYmFyd2VkJywnXFx1MjMwNic6J0JhcndlZCcsJ1xcdTIzMEMnOidkcmNyb3AnLCdcXHUyMzBEJzonZGxjcm9wJywnXFx1MjMwRSc6J3VyY3JvcCcsJ1xcdTIzMEYnOid1bGNyb3AnLCdcXHUyMzEwJzonYm5vdCcsJ1xcdTIzMTInOidwcm9mbGluZScsJ1xcdTIzMTMnOidwcm9mc3VyZicsJ1xcdTIzMTUnOid0ZWxyZWMnLCdcXHUyMzE2JzondGFyZ2V0JywnXFx1MjMxQyc6J3VsY29ybicsJ1xcdTIzMUQnOid1cmNvcm4nLCdcXHUyMzFFJzonZGxjb3JuJywnXFx1MjMxRic6J2RyY29ybicsJ1xcdTIzMjInOidmcm93bicsJ1xcdTIzMjMnOidzbWlsZScsJ1xcdTIzMkQnOidjeWxjdHknLCdcXHUyMzJFJzoncHJvZmFsYXInLCdcXHUyMzM2JzondG9wYm90JywnXFx1MjMzRCc6J292YmFyJywnXFx1MjMzRic6J3NvbGJhcicsJ1xcdTIzN0MnOidhbmd6YXJyJywnXFx1MjNCMCc6J2xtb3VzdCcsJ1xcdTIzQjEnOidybW91c3QnLCdcXHUyM0I0JzondGJyaycsJ1xcdTIzQjUnOidiYnJrJywnXFx1MjNCNic6J2Jicmt0YnJrJywnXFx1MjNEQyc6J092ZXJQYXJlbnRoZXNpcycsJ1xcdTIzREQnOidVbmRlclBhcmVudGhlc2lzJywnXFx1MjNERSc6J092ZXJCcmFjZScsJ1xcdTIzREYnOidVbmRlckJyYWNlJywnXFx1MjNFMic6J3RycGV6aXVtJywnXFx1MjNFNyc6J2VsaW50ZXJzJywnXFx1MjQyMyc6J2JsYW5rJywnXFx1MjUwMCc6J2JveGgnLCdcXHUyNTAyJzonYm94dicsJ1xcdTI1MEMnOidib3hkcicsJ1xcdTI1MTAnOidib3hkbCcsJ1xcdTI1MTQnOidib3h1cicsJ1xcdTI1MTgnOidib3h1bCcsJ1xcdTI1MUMnOidib3h2cicsJ1xcdTI1MjQnOidib3h2bCcsJ1xcdTI1MkMnOidib3hoZCcsJ1xcdTI1MzQnOidib3hodScsJ1xcdTI1M0MnOidib3h2aCcsJ1xcdTI1NTAnOidib3hIJywnXFx1MjU1MSc6J2JveFYnLCdcXHUyNTUyJzonYm94ZFInLCdcXHUyNTUzJzonYm94RHInLCdcXHUyNTU0JzonYm94RFInLCdcXHUyNTU1JzonYm94ZEwnLCdcXHUyNTU2JzonYm94RGwnLCdcXHUyNTU3JzonYm94REwnLCdcXHUyNTU4JzonYm94dVInLCdcXHUyNTU5JzonYm94VXInLCdcXHUyNTVBJzonYm94VVInLCdcXHUyNTVCJzonYm94dUwnLCdcXHUyNTVDJzonYm94VWwnLCdcXHUyNTVEJzonYm94VUwnLCdcXHUyNTVFJzonYm94dlInLCdcXHUyNTVGJzonYm94VnInLCdcXHUyNTYwJzonYm94VlInLCdcXHUyNTYxJzonYm94dkwnLCdcXHUyNTYyJzonYm94VmwnLCdcXHUyNTYzJzonYm94VkwnLCdcXHUyNTY0JzonYm94SGQnLCdcXHUyNTY1JzonYm94aEQnLCdcXHUyNTY2JzonYm94SEQnLCdcXHUyNTY3JzonYm94SHUnLCdcXHUyNTY4JzonYm94aFUnLCdcXHUyNTY5JzonYm94SFUnLCdcXHUyNTZBJzonYm94dkgnLCdcXHUyNTZCJzonYm94VmgnLCdcXHUyNTZDJzonYm94VkgnLCdcXHUyNTgwJzondWhibGsnLCdcXHUyNTg0JzonbGhibGsnLCdcXHUyNTg4JzonYmxvY2snLCdcXHUyNTkxJzonYmxrMTQnLCdcXHUyNTkyJzonYmxrMTInLCdcXHUyNTkzJzonYmxrMzQnLCdcXHUyNUExJzonc3F1JywnXFx1MjVBQSc6J3NxdWYnLCdcXHUyNUFCJzonRW1wdHlWZXJ5U21hbGxTcXVhcmUnLCdcXHUyNUFEJzoncmVjdCcsJ1xcdTI1QUUnOidtYXJrZXInLCdcXHUyNUIxJzonZmx0bnMnLCdcXHUyNUIzJzoneHV0cmknLCdcXHUyNUI0JzondXRyaWYnLCdcXHUyNUI1JzondXRyaScsJ1xcdTI1QjgnOidydHJpZicsJ1xcdTI1QjknOidydHJpJywnXFx1MjVCRCc6J3hkdHJpJywnXFx1MjVCRSc6J2R0cmlmJywnXFx1MjVCRic6J2R0cmknLCdcXHUyNUMyJzonbHRyaWYnLCdcXHUyNUMzJzonbHRyaScsJ1xcdTI1Q0EnOidsb3onLCdcXHUyNUNCJzonY2lyJywnXFx1MjVFQyc6J3RyaWRvdCcsJ1xcdTI1RUYnOid4Y2lyYycsJ1xcdTI1RjgnOid1bHRyaScsJ1xcdTI1RjknOid1cnRyaScsJ1xcdTI1RkEnOidsbHRyaScsJ1xcdTI1RkInOidFbXB0eVNtYWxsU3F1YXJlJywnXFx1MjVGQyc6J0ZpbGxlZFNtYWxsU3F1YXJlJywnXFx1MjYwNSc6J3N0YXJmJywnXFx1MjYwNic6J3N0YXInLCdcXHUyNjBFJzoncGhvbmUnLCdcXHUyNjQwJzonZmVtYWxlJywnXFx1MjY0Mic6J21hbGUnLCdcXHUyNjYwJzonc3BhZGVzJywnXFx1MjY2Myc6J2NsdWJzJywnXFx1MjY2NSc6J2hlYXJ0cycsJ1xcdTI2NjYnOidkaWFtcycsJ1xcdTI2NkEnOidzdW5nJywnXFx1MjcxMyc6J2NoZWNrJywnXFx1MjcxNyc6J2Nyb3NzJywnXFx1MjcyMCc6J21hbHQnLCdcXHUyNzM2Jzonc2V4dCcsJ1xcdTI3NTgnOidWZXJ0aWNhbFNlcGFyYXRvcicsJ1xcdTI3QzgnOidic29saHN1YicsJ1xcdTI3QzknOidzdXBoc29sJywnXFx1MjdGNSc6J3hsYXJyJywnXFx1MjdGNic6J3hyYXJyJywnXFx1MjdGNyc6J3hoYXJyJywnXFx1MjdGOCc6J3hsQXJyJywnXFx1MjdGOSc6J3hyQXJyJywnXFx1MjdGQSc6J3hoQXJyJywnXFx1MjdGQyc6J3htYXAnLCdcXHUyN0ZGJzonZHppZ3JhcnInLCdcXHUyOTAyJzonbnZsQXJyJywnXFx1MjkwMyc6J252ckFycicsJ1xcdTI5MDQnOidudkhhcnInLCdcXHUyOTA1JzonTWFwJywnXFx1MjkwQyc6J2xiYXJyJywnXFx1MjkwRCc6J3JiYXJyJywnXFx1MjkwRSc6J2xCYXJyJywnXFx1MjkwRic6J3JCYXJyJywnXFx1MjkxMCc6J1JCYXJyJywnXFx1MjkxMSc6J0REb3RyYWhkJywnXFx1MjkxMic6J1VwQXJyb3dCYXInLCdcXHUyOTEzJzonRG93bkFycm93QmFyJywnXFx1MjkxNic6J1JhcnJ0bCcsJ1xcdTI5MTknOidsYXRhaWwnLCdcXHUyOTFBJzoncmF0YWlsJywnXFx1MjkxQic6J2xBdGFpbCcsJ1xcdTI5MUMnOidyQXRhaWwnLCdcXHUyOTFEJzonbGFycmZzJywnXFx1MjkxRSc6J3JhcnJmcycsJ1xcdTI5MUYnOidsYXJyYmZzJywnXFx1MjkyMCc6J3JhcnJiZnMnLCdcXHUyOTIzJzonbndhcmhrJywnXFx1MjkyNCc6J25lYXJoaycsJ1xcdTI5MjUnOidzZWFyaGsnLCdcXHUyOTI2Jzonc3dhcmhrJywnXFx1MjkyNyc6J253bmVhcicsJ1xcdTI5MjgnOid0b2VhJywnXFx1MjkyOSc6J3Rvc2EnLCdcXHUyOTJBJzonc3dud2FyJywnXFx1MjkzMyc6J3JhcnJjJywnXFx1MjkzM1xcdTAzMzgnOiducmFycmMnLCdcXHUyOTM1JzonY3VkYXJycicsJ1xcdTI5MzYnOidsZGNhJywnXFx1MjkzNyc6J3JkY2EnLCdcXHUyOTM4JzonY3VkYXJybCcsJ1xcdTI5MzknOidsYXJycGwnLCdcXHUyOTNDJzonY3VyYXJybScsJ1xcdTI5M0QnOidjdWxhcnJwJywnXFx1Mjk0NSc6J3JhcnJwbCcsJ1xcdTI5NDgnOidoYXJyY2lyJywnXFx1Mjk0OSc6J1VhcnJvY2lyJywnXFx1Mjk0QSc6J2x1cmRzaGFyJywnXFx1Mjk0Qic6J2xkcnVzaGFyJywnXFx1Mjk0RSc6J0xlZnRSaWdodFZlY3RvcicsJ1xcdTI5NEYnOidSaWdodFVwRG93blZlY3RvcicsJ1xcdTI5NTAnOidEb3duTGVmdFJpZ2h0VmVjdG9yJywnXFx1Mjk1MSc6J0xlZnRVcERvd25WZWN0b3InLCdcXHUyOTUyJzonTGVmdFZlY3RvckJhcicsJ1xcdTI5NTMnOidSaWdodFZlY3RvckJhcicsJ1xcdTI5NTQnOidSaWdodFVwVmVjdG9yQmFyJywnXFx1Mjk1NSc6J1JpZ2h0RG93blZlY3RvckJhcicsJ1xcdTI5NTYnOidEb3duTGVmdFZlY3RvckJhcicsJ1xcdTI5NTcnOidEb3duUmlnaHRWZWN0b3JCYXInLCdcXHUyOTU4JzonTGVmdFVwVmVjdG9yQmFyJywnXFx1Mjk1OSc6J0xlZnREb3duVmVjdG9yQmFyJywnXFx1Mjk1QSc6J0xlZnRUZWVWZWN0b3InLCdcXHUyOTVCJzonUmlnaHRUZWVWZWN0b3InLCdcXHUyOTVDJzonUmlnaHRVcFRlZVZlY3RvcicsJ1xcdTI5NUQnOidSaWdodERvd25UZWVWZWN0b3InLCdcXHUyOTVFJzonRG93bkxlZnRUZWVWZWN0b3InLCdcXHUyOTVGJzonRG93blJpZ2h0VGVlVmVjdG9yJywnXFx1Mjk2MCc6J0xlZnRVcFRlZVZlY3RvcicsJ1xcdTI5NjEnOidMZWZ0RG93blRlZVZlY3RvcicsJ1xcdTI5NjInOidsSGFyJywnXFx1Mjk2Myc6J3VIYXInLCdcXHUyOTY0JzonckhhcicsJ1xcdTI5NjUnOidkSGFyJywnXFx1Mjk2Nic6J2x1cnVoYXInLCdcXHUyOTY3JzonbGRyZGhhcicsJ1xcdTI5NjgnOidydWx1aGFyJywnXFx1Mjk2OSc6J3JkbGRoYXInLCdcXHUyOTZBJzonbGhhcnVsJywnXFx1Mjk2Qic6J2xsaGFyZCcsJ1xcdTI5NkMnOidyaGFydWwnLCdcXHUyOTZEJzonbHJoYXJkJywnXFx1Mjk2RSc6J3VkaGFyJywnXFx1Mjk2Ric6J2R1aGFyJywnXFx1Mjk3MCc6J1JvdW5kSW1wbGllcycsJ1xcdTI5NzEnOidlcmFycicsJ1xcdTI5NzInOidzaW1yYXJyJywnXFx1Mjk3Myc6J2xhcnJzaW0nLCdcXHUyOTc0JzoncmFycnNpbScsJ1xcdTI5NzUnOidyYXJyYXAnLCdcXHUyOTc2JzonbHRsYXJyJywnXFx1Mjk3OCc6J2d0cmFycicsJ1xcdTI5NzknOidzdWJyYXJyJywnXFx1Mjk3Qic6J3N1cGxhcnInLCdcXHUyOTdDJzonbGZpc2h0JywnXFx1Mjk3RCc6J3JmaXNodCcsJ1xcdTI5N0UnOid1ZmlzaHQnLCdcXHUyOTdGJzonZGZpc2h0JywnXFx1Mjk5QSc6J3Z6aWd6YWcnLCdcXHUyOTlDJzondmFuZ3J0JywnXFx1Mjk5RCc6J2FuZ3J0dmJkJywnXFx1MjlBNCc6J2FuZ2UnLCdcXHUyOUE1JzoncmFuZ2UnLCdcXHUyOUE2JzonZHdhbmdsZScsJ1xcdTI5QTcnOid1d2FuZ2xlJywnXFx1MjlBOCc6J2FuZ21zZGFhJywnXFx1MjlBOSc6J2FuZ21zZGFiJywnXFx1MjlBQSc6J2FuZ21zZGFjJywnXFx1MjlBQic6J2FuZ21zZGFkJywnXFx1MjlBQyc6J2FuZ21zZGFlJywnXFx1MjlBRCc6J2FuZ21zZGFmJywnXFx1MjlBRSc6J2FuZ21zZGFnJywnXFx1MjlBRic6J2FuZ21zZGFoJywnXFx1MjlCMCc6J2JlbXB0eXYnLCdcXHUyOUIxJzonZGVtcHR5dicsJ1xcdTI5QjInOidjZW1wdHl2JywnXFx1MjlCMyc6J3JhZW1wdHl2JywnXFx1MjlCNCc6J2xhZW1wdHl2JywnXFx1MjlCNSc6J29oYmFyJywnXFx1MjlCNic6J29taWQnLCdcXHUyOUI3Jzonb3BhcicsJ1xcdTI5QjknOidvcGVycCcsJ1xcdTI5QkInOidvbGNyb3NzJywnXFx1MjlCQyc6J29kc29sZCcsJ1xcdTI5QkUnOidvbGNpcicsJ1xcdTI5QkYnOidvZmNpcicsJ1xcdTI5QzAnOidvbHQnLCdcXHUyOUMxJzonb2d0JywnXFx1MjlDMic6J2NpcnNjaXInLCdcXHUyOUMzJzonY2lyRScsJ1xcdTI5QzQnOidzb2xiJywnXFx1MjlDNSc6J2Jzb2xiJywnXFx1MjlDOSc6J2JveGJveCcsJ1xcdTI5Q0QnOid0cmlzYicsJ1xcdTI5Q0UnOidydHJpbHRyaScsJ1xcdTI5Q0YnOidMZWZ0VHJpYW5nbGVCYXInLCdcXHUyOUNGXFx1MDMzOCc6J05vdExlZnRUcmlhbmdsZUJhcicsJ1xcdTI5RDAnOidSaWdodFRyaWFuZ2xlQmFyJywnXFx1MjlEMFxcdTAzMzgnOidOb3RSaWdodFRyaWFuZ2xlQmFyJywnXFx1MjlEQyc6J2lpbmZpbicsJ1xcdTI5REQnOidpbmZpbnRpZScsJ1xcdTI5REUnOidudmluZmluJywnXFx1MjlFMyc6J2VwYXJzbCcsJ1xcdTI5RTQnOidzbWVwYXJzbCcsJ1xcdTI5RTUnOidlcXZwYXJzbCcsJ1xcdTI5RUInOidsb3pmJywnXFx1MjlGNCc6J1J1bGVEZWxheWVkJywnXFx1MjlGNic6J2Rzb2wnLCdcXHUyQTAwJzoneG9kb3QnLCdcXHUyQTAxJzoneG9wbHVzJywnXFx1MkEwMic6J3hvdGltZScsJ1xcdTJBMDQnOid4dXBsdXMnLCdcXHUyQTA2JzoneHNxY3VwJywnXFx1MkEwRCc6J2ZwYXJ0aW50JywnXFx1MkExMCc6J2NpcmZuaW50JywnXFx1MkExMSc6J2F3aW50JywnXFx1MkExMic6J3JwcG9saW50JywnXFx1MkExMyc6J3NjcG9saW50JywnXFx1MkExNCc6J25wb2xpbnQnLCdcXHUyQTE1JzoncG9pbnRpbnQnLCdcXHUyQTE2JzoncXVhdGludCcsJ1xcdTJBMTcnOidpbnRsYXJoaycsJ1xcdTJBMjInOidwbHVzY2lyJywnXFx1MkEyMyc6J3BsdXNhY2lyJywnXFx1MkEyNCc6J3NpbXBsdXMnLCdcXHUyQTI1JzoncGx1c2R1JywnXFx1MkEyNic6J3BsdXNzaW0nLCdcXHUyQTI3JzoncGx1c3R3bycsJ1xcdTJBMjknOidtY29tbWEnLCdcXHUyQTJBJzonbWludXNkdScsJ1xcdTJBMkQnOidsb3BsdXMnLCdcXHUyQTJFJzoncm9wbHVzJywnXFx1MkEyRic6J0Nyb3NzJywnXFx1MkEzMCc6J3RpbWVzZCcsJ1xcdTJBMzEnOid0aW1lc2JhcicsJ1xcdTJBMzMnOidzbWFzaHAnLCdcXHUyQTM0JzonbG90aW1lcycsJ1xcdTJBMzUnOidyb3RpbWVzJywnXFx1MkEzNic6J290aW1lc2FzJywnXFx1MkEzNyc6J090aW1lcycsJ1xcdTJBMzgnOidvZGl2JywnXFx1MkEzOSc6J3RyaXBsdXMnLCdcXHUyQTNBJzondHJpbWludXMnLCdcXHUyQTNCJzondHJpdGltZScsJ1xcdTJBM0MnOidpcHJvZCcsJ1xcdTJBM0YnOidhbWFsZycsJ1xcdTJBNDAnOidjYXBkb3QnLCdcXHUyQTQyJzonbmN1cCcsJ1xcdTJBNDMnOiduY2FwJywnXFx1MkE0NCc6J2NhcGFuZCcsJ1xcdTJBNDUnOidjdXBvcicsJ1xcdTJBNDYnOidjdXBjYXAnLCdcXHUyQTQ3JzonY2FwY3VwJywnXFx1MkE0OCc6J2N1cGJyY2FwJywnXFx1MkE0OSc6J2NhcGJyY3VwJywnXFx1MkE0QSc6J2N1cGN1cCcsJ1xcdTJBNEInOidjYXBjYXAnLCdcXHUyQTRDJzonY2N1cHMnLCdcXHUyQTREJzonY2NhcHMnLCdcXHUyQTUwJzonY2N1cHNzbScsJ1xcdTJBNTMnOidBbmQnLCdcXHUyQTU0JzonT3InLCdcXHUyQTU1JzonYW5kYW5kJywnXFx1MkE1Nic6J29yb3InLCdcXHUyQTU3Jzonb3JzbG9wZScsJ1xcdTJBNTgnOidhbmRzbG9wZScsJ1xcdTJBNUEnOidhbmR2JywnXFx1MkE1Qic6J29ydicsJ1xcdTJBNUMnOidhbmRkJywnXFx1MkE1RCc6J29yZCcsJ1xcdTJBNUYnOid3ZWRiYXInLCdcXHUyQTY2Jzonc2RvdGUnLCdcXHUyQTZBJzonc2ltZG90JywnXFx1MkE2RCc6J2Nvbmdkb3QnLCdcXHUyQTZEXFx1MDMzOCc6J25jb25nZG90JywnXFx1MkE2RSc6J2Vhc3RlcicsJ1xcdTJBNkYnOidhcGFjaXInLCdcXHUyQTcwJzonYXBFJywnXFx1MkE3MFxcdTAzMzgnOiduYXBFJywnXFx1MkE3MSc6J2VwbHVzJywnXFx1MkE3Mic6J3BsdXNlJywnXFx1MkE3Myc6J0VzaW0nLCdcXHUyQTc3JzonZUREb3QnLCdcXHUyQTc4JzonZXF1aXZERCcsJ1xcdTJBNzknOidsdGNpcicsJ1xcdTJBN0EnOidndGNpcicsJ1xcdTJBN0InOidsdHF1ZXN0JywnXFx1MkE3Qyc6J2d0cXVlc3QnLCdcXHUyQTdEJzonbGVzJywnXFx1MkE3RFxcdTAzMzgnOidubGVzJywnXFx1MkE3RSc6J2dlcycsJ1xcdTJBN0VcXHUwMzM4JzonbmdlcycsJ1xcdTJBN0YnOidsZXNkb3QnLCdcXHUyQTgwJzonZ2VzZG90JywnXFx1MkE4MSc6J2xlc2RvdG8nLCdcXHUyQTgyJzonZ2VzZG90bycsJ1xcdTJBODMnOidsZXNkb3RvcicsJ1xcdTJBODQnOidnZXNkb3RvbCcsJ1xcdTJBODUnOidsYXAnLCdcXHUyQTg2JzonZ2FwJywnXFx1MkE4Nyc6J2xuZScsJ1xcdTJBODgnOidnbmUnLCdcXHUyQTg5JzonbG5hcCcsJ1xcdTJBOEEnOidnbmFwJywnXFx1MkE4Qic6J2xFZycsJ1xcdTJBOEMnOidnRWwnLCdcXHUyQThEJzonbHNpbWUnLCdcXHUyQThFJzonZ3NpbWUnLCdcXHUyQThGJzonbHNpbWcnLCdcXHUyQTkwJzonZ3NpbWwnLCdcXHUyQTkxJzonbGdFJywnXFx1MkE5Mic6J2dsRScsJ1xcdTJBOTMnOidsZXNnZXMnLCdcXHUyQTk0JzonZ2VzbGVzJywnXFx1MkE5NSc6J2VscycsJ1xcdTJBOTYnOidlZ3MnLCdcXHUyQTk3JzonZWxzZG90JywnXFx1MkE5OCc6J2Vnc2RvdCcsJ1xcdTJBOTknOidlbCcsJ1xcdTJBOUEnOidlZycsJ1xcdTJBOUQnOidzaW1sJywnXFx1MkE5RSc6J3NpbWcnLCdcXHUyQTlGJzonc2ltbEUnLCdcXHUyQUEwJzonc2ltZ0UnLCdcXHUyQUExJzonTGVzc0xlc3MnLCdcXHUyQUExXFx1MDMzOCc6J05vdE5lc3RlZExlc3NMZXNzJywnXFx1MkFBMic6J0dyZWF0ZXJHcmVhdGVyJywnXFx1MkFBMlxcdTAzMzgnOidOb3ROZXN0ZWRHcmVhdGVyR3JlYXRlcicsJ1xcdTJBQTQnOidnbGonLCdcXHUyQUE1JzonZ2xhJywnXFx1MkFBNic6J2x0Y2MnLCdcXHUyQUE3JzonZ3RjYycsJ1xcdTJBQTgnOidsZXNjYycsJ1xcdTJBQTknOidnZXNjYycsJ1xcdTJBQUEnOidzbXQnLCdcXHUyQUFCJzonbGF0JywnXFx1MkFBQyc6J3NtdGUnLCdcXHUyQUFDXFx1RkUwMCc6J3NtdGVzJywnXFx1MkFBRCc6J2xhdGUnLCdcXHUyQUFEXFx1RkUwMCc6J2xhdGVzJywnXFx1MkFBRSc6J2J1bXBFJywnXFx1MkFBRic6J3ByZScsJ1xcdTJBQUZcXHUwMzM4JzonbnByZScsJ1xcdTJBQjAnOidzY2UnLCdcXHUyQUIwXFx1MDMzOCc6J25zY2UnLCdcXHUyQUIzJzoncHJFJywnXFx1MkFCNCc6J3NjRScsJ1xcdTJBQjUnOidwcm5FJywnXFx1MkFCNic6J3NjbkUnLCdcXHUyQUI3JzoncHJhcCcsJ1xcdTJBQjgnOidzY2FwJywnXFx1MkFCOSc6J3BybmFwJywnXFx1MkFCQSc6J3NjbmFwJywnXFx1MkFCQic6J1ByJywnXFx1MkFCQyc6J1NjJywnXFx1MkFCRCc6J3N1YmRvdCcsJ1xcdTJBQkUnOidzdXBkb3QnLCdcXHUyQUJGJzonc3VicGx1cycsJ1xcdTJBQzAnOidzdXBwbHVzJywnXFx1MkFDMSc6J3N1Ym11bHQnLCdcXHUyQUMyJzonc3VwbXVsdCcsJ1xcdTJBQzMnOidzdWJlZG90JywnXFx1MkFDNCc6J3N1cGVkb3QnLCdcXHUyQUM1Jzonc3ViRScsJ1xcdTJBQzVcXHUwMzM4JzonbnN1YkUnLCdcXHUyQUM2Jzonc3VwRScsJ1xcdTJBQzZcXHUwMzM4JzonbnN1cEUnLCdcXHUyQUM3Jzonc3Vic2ltJywnXFx1MkFDOCc6J3N1cHNpbScsJ1xcdTJBQ0JcXHVGRTAwJzondnN1Ym5FJywnXFx1MkFDQic6J3N1Ym5FJywnXFx1MkFDQ1xcdUZFMDAnOid2c3VwbkUnLCdcXHUyQUNDJzonc3VwbkUnLCdcXHUyQUNGJzonY3N1YicsJ1xcdTJBRDAnOidjc3VwJywnXFx1MkFEMSc6J2NzdWJlJywnXFx1MkFEMic6J2NzdXBlJywnXFx1MkFEMyc6J3N1YnN1cCcsJ1xcdTJBRDQnOidzdXBzdWInLCdcXHUyQUQ1Jzonc3Vic3ViJywnXFx1MkFENic6J3N1cHN1cCcsJ1xcdTJBRDcnOidzdXBoc3ViJywnXFx1MkFEOCc6J3N1cGRzdWInLCdcXHUyQUQ5JzonZm9ya3YnLCdcXHUyQURBJzondG9wZm9yaycsJ1xcdTJBREInOidtbGNwJywnXFx1MkFFNCc6J0Rhc2h2JywnXFx1MkFFNic6J1ZkYXNobCcsJ1xcdTJBRTcnOidCYXJ2JywnXFx1MkFFOCc6J3ZCYXInLCdcXHUyQUU5JzondkJhcnYnLCdcXHUyQUVCJzonVmJhcicsJ1xcdTJBRUMnOidOb3QnLCdcXHUyQUVEJzonYk5vdCcsJ1xcdTJBRUUnOidybm1pZCcsJ1xcdTJBRUYnOidjaXJtaWQnLCdcXHUyQUYwJzonbWlkY2lyJywnXFx1MkFGMSc6J3RvcGNpcicsJ1xcdTJBRjInOiduaHBhcicsJ1xcdTJBRjMnOidwYXJzaW0nLCdcXHUyQUZEJzoncGFyc2wnLCdcXHUyQUZEXFx1MjBFNSc6J25wYXJzbCcsJ1xcdTI2NkQnOidmbGF0JywnXFx1MjY2RSc6J25hdHVyJywnXFx1MjY2Ric6J3NoYXJwJywnXFx4QTQnOidjdXJyZW4nLCdcXHhBMic6J2NlbnQnLCckJzonZG9sbGFyJywnXFx4QTMnOidwb3VuZCcsJ1xceEE1JzoneWVuJywnXFx1MjBBQyc6J2V1cm8nLCdcXHhCOSc6J3N1cDEnLCdcXHhCRCc6J2hhbGYnLCdcXHUyMTUzJzonZnJhYzEzJywnXFx4QkMnOidmcmFjMTQnLCdcXHUyMTU1JzonZnJhYzE1JywnXFx1MjE1OSc6J2ZyYWMxNicsJ1xcdTIxNUInOidmcmFjMTgnLCdcXHhCMic6J3N1cDInLCdcXHUyMTU0JzonZnJhYzIzJywnXFx1MjE1Nic6J2ZyYWMyNScsJ1xceEIzJzonc3VwMycsJ1xceEJFJzonZnJhYzM0JywnXFx1MjE1Nyc6J2ZyYWMzNScsJ1xcdTIxNUMnOidmcmFjMzgnLCdcXHUyMTU4JzonZnJhYzQ1JywnXFx1MjE1QSc6J2ZyYWM1NicsJ1xcdTIxNUQnOidmcmFjNTgnLCdcXHUyMTVFJzonZnJhYzc4JywnXFx1RDgzNVxcdURDQjYnOidhc2NyJywnXFx1RDgzNVxcdURENTInOidhb3BmJywnXFx1RDgzNVxcdUREMUUnOidhZnInLCdcXHVEODM1XFx1REQzOCc6J0FvcGYnLCdcXHVEODM1XFx1REQwNCc6J0FmcicsJ1xcdUQ4MzVcXHVEQzlDJzonQXNjcicsJ1xceEFBJzonb3JkZicsJ1xceEUxJzonYWFjdXRlJywnXFx4QzEnOidBYWN1dGUnLCdcXHhFMCc6J2FncmF2ZScsJ1xceEMwJzonQWdyYXZlJywnXFx1MDEwMyc6J2FicmV2ZScsJ1xcdTAxMDInOidBYnJldmUnLCdcXHhFMic6J2FjaXJjJywnXFx4QzInOidBY2lyYycsJ1xceEU1JzonYXJpbmcnLCdcXHhDNSc6J2FuZ3N0JywnXFx4RTQnOidhdW1sJywnXFx4QzQnOidBdW1sJywnXFx4RTMnOidhdGlsZGUnLCdcXHhDMyc6J0F0aWxkZScsJ1xcdTAxMDUnOidhb2dvbicsJ1xcdTAxMDQnOidBb2dvbicsJ1xcdTAxMDEnOidhbWFjcicsJ1xcdTAxMDAnOidBbWFjcicsJ1xceEU2JzonYWVsaWcnLCdcXHhDNic6J0FFbGlnJywnXFx1RDgzNVxcdURDQjcnOidic2NyJywnXFx1RDgzNVxcdURENTMnOidib3BmJywnXFx1RDgzNVxcdUREMUYnOidiZnInLCdcXHVEODM1XFx1REQzOSc6J0JvcGYnLCdcXHUyMTJDJzonQnNjcicsJ1xcdUQ4MzVcXHVERDA1JzonQmZyJywnXFx1RDgzNVxcdUREMjAnOidjZnInLCdcXHVEODM1XFx1RENCOCc6J2NzY3InLCdcXHVEODM1XFx1REQ1NCc6J2NvcGYnLCdcXHUyMTJEJzonQ2ZyJywnXFx1RDgzNVxcdURDOUUnOidDc2NyJywnXFx1MjEwMic6J0NvcGYnLCdcXHUwMTA3JzonY2FjdXRlJywnXFx1MDEwNic6J0NhY3V0ZScsJ1xcdTAxMDknOidjY2lyYycsJ1xcdTAxMDgnOidDY2lyYycsJ1xcdTAxMEQnOidjY2Fyb24nLCdcXHUwMTBDJzonQ2Nhcm9uJywnXFx1MDEwQic6J2Nkb3QnLCdcXHUwMTBBJzonQ2RvdCcsJ1xceEU3JzonY2NlZGlsJywnXFx4QzcnOidDY2VkaWwnLCdcXHUyMTA1JzonaW5jYXJlJywnXFx1RDgzNVxcdUREMjEnOidkZnInLCdcXHUyMTQ2JzonZGQnLCdcXHVEODM1XFx1REQ1NSc6J2RvcGYnLCdcXHVEODM1XFx1RENCOSc6J2RzY3InLCdcXHVEODM1XFx1REM5Ric6J0RzY3InLCdcXHVEODM1XFx1REQwNyc6J0RmcicsJ1xcdTIxNDUnOidERCcsJ1xcdUQ4MzVcXHVERDNCJzonRG9wZicsJ1xcdTAxMEYnOidkY2Fyb24nLCdcXHUwMTBFJzonRGNhcm9uJywnXFx1MDExMSc6J2RzdHJvaycsJ1xcdTAxMTAnOidEc3Ryb2snLCdcXHhGMCc6J2V0aCcsJ1xceEQwJzonRVRIJywnXFx1MjE0Nyc6J2VlJywnXFx1MjEyRic6J2VzY3InLCdcXHVEODM1XFx1REQyMic6J2VmcicsJ1xcdUQ4MzVcXHVERDU2JzonZW9wZicsJ1xcdTIxMzAnOidFc2NyJywnXFx1RDgzNVxcdUREMDgnOidFZnInLCdcXHVEODM1XFx1REQzQyc6J0VvcGYnLCdcXHhFOSc6J2VhY3V0ZScsJ1xceEM5JzonRWFjdXRlJywnXFx4RTgnOidlZ3JhdmUnLCdcXHhDOCc6J0VncmF2ZScsJ1xceEVBJzonZWNpcmMnLCdcXHhDQSc6J0VjaXJjJywnXFx1MDExQic6J2VjYXJvbicsJ1xcdTAxMUEnOidFY2Fyb24nLCdcXHhFQic6J2V1bWwnLCdcXHhDQic6J0V1bWwnLCdcXHUwMTE3JzonZWRvdCcsJ1xcdTAxMTYnOidFZG90JywnXFx1MDExOSc6J2VvZ29uJywnXFx1MDExOCc6J0VvZ29uJywnXFx1MDExMyc6J2VtYWNyJywnXFx1MDExMic6J0VtYWNyJywnXFx1RDgzNVxcdUREMjMnOidmZnInLCdcXHVEODM1XFx1REQ1Nyc6J2ZvcGYnLCdcXHVEODM1XFx1RENCQic6J2ZzY3InLCdcXHVEODM1XFx1REQwOSc6J0ZmcicsJ1xcdUQ4MzVcXHVERDNEJzonRm9wZicsJ1xcdTIxMzEnOidGc2NyJywnXFx1RkIwMCc6J2ZmbGlnJywnXFx1RkIwMyc6J2ZmaWxpZycsJ1xcdUZCMDQnOidmZmxsaWcnLCdcXHVGQjAxJzonZmlsaWcnLCdmaic6J2ZqbGlnJywnXFx1RkIwMic6J2ZsbGlnJywnXFx1MDE5Mic6J2Zub2YnLCdcXHUyMTBBJzonZ3NjcicsJ1xcdUQ4MzVcXHVERDU4JzonZ29wZicsJ1xcdUQ4MzVcXHVERDI0JzonZ2ZyJywnXFx1RDgzNVxcdURDQTInOidHc2NyJywnXFx1RDgzNVxcdUREM0UnOidHb3BmJywnXFx1RDgzNVxcdUREMEEnOidHZnInLCdcXHUwMUY1JzonZ2FjdXRlJywnXFx1MDExRic6J2dicmV2ZScsJ1xcdTAxMUUnOidHYnJldmUnLCdcXHUwMTFEJzonZ2NpcmMnLCdcXHUwMTFDJzonR2NpcmMnLCdcXHUwMTIxJzonZ2RvdCcsJ1xcdTAxMjAnOidHZG90JywnXFx1MDEyMic6J0djZWRpbCcsJ1xcdUQ4MzVcXHVERDI1JzonaGZyJywnXFx1MjEwRSc6J3BsYW5ja2gnLCdcXHVEODM1XFx1RENCRCc6J2hzY3InLCdcXHVEODM1XFx1REQ1OSc6J2hvcGYnLCdcXHUyMTBCJzonSHNjcicsJ1xcdTIxMEMnOidIZnInLCdcXHUyMTBEJzonSG9wZicsJ1xcdTAxMjUnOidoY2lyYycsJ1xcdTAxMjQnOidIY2lyYycsJ1xcdTIxMEYnOidoYmFyJywnXFx1MDEyNyc6J2hzdHJvaycsJ1xcdTAxMjYnOidIc3Ryb2snLCdcXHVEODM1XFx1REQ1QSc6J2lvcGYnLCdcXHVEODM1XFx1REQyNic6J2lmcicsJ1xcdUQ4MzVcXHVEQ0JFJzonaXNjcicsJ1xcdTIxNDgnOidpaScsJ1xcdUQ4MzVcXHVERDQwJzonSW9wZicsJ1xcdTIxMTAnOidJc2NyJywnXFx1MjExMSc6J0ltJywnXFx4RUQnOidpYWN1dGUnLCdcXHhDRCc6J0lhY3V0ZScsJ1xceEVDJzonaWdyYXZlJywnXFx4Q0MnOidJZ3JhdmUnLCdcXHhFRSc6J2ljaXJjJywnXFx4Q0UnOidJY2lyYycsJ1xceEVGJzonaXVtbCcsJ1xceENGJzonSXVtbCcsJ1xcdTAxMjknOidpdGlsZGUnLCdcXHUwMTI4JzonSXRpbGRlJywnXFx1MDEzMCc6J0lkb3QnLCdcXHUwMTJGJzonaW9nb24nLCdcXHUwMTJFJzonSW9nb24nLCdcXHUwMTJCJzonaW1hY3InLCdcXHUwMTJBJzonSW1hY3InLCdcXHUwMTMzJzonaWpsaWcnLCdcXHUwMTMyJzonSUpsaWcnLCdcXHUwMTMxJzonaW1hdGgnLCdcXHVEODM1XFx1RENCRic6J2pzY3InLCdcXHVEODM1XFx1REQ1Qic6J2pvcGYnLCdcXHVEODM1XFx1REQyNyc6J2pmcicsJ1xcdUQ4MzVcXHVEQ0E1JzonSnNjcicsJ1xcdUQ4MzVcXHVERDBEJzonSmZyJywnXFx1RDgzNVxcdURENDEnOidKb3BmJywnXFx1MDEzNSc6J2pjaXJjJywnXFx1MDEzNCc6J0pjaXJjJywnXFx1MDIzNyc6J2ptYXRoJywnXFx1RDgzNVxcdURENUMnOidrb3BmJywnXFx1RDgzNVxcdURDQzAnOidrc2NyJywnXFx1RDgzNVxcdUREMjgnOidrZnInLCdcXHVEODM1XFx1RENBNic6J0tzY3InLCdcXHVEODM1XFx1REQ0Mic6J0tvcGYnLCdcXHVEODM1XFx1REQwRSc6J0tmcicsJ1xcdTAxMzcnOidrY2VkaWwnLCdcXHUwMTM2JzonS2NlZGlsJywnXFx1RDgzNVxcdUREMjknOidsZnInLCdcXHVEODM1XFx1RENDMSc6J2xzY3InLCdcXHUyMTEzJzonZWxsJywnXFx1RDgzNVxcdURENUQnOidsb3BmJywnXFx1MjExMic6J0xzY3InLCdcXHVEODM1XFx1REQwRic6J0xmcicsJ1xcdUQ4MzVcXHVERDQzJzonTG9wZicsJ1xcdTAxM0EnOidsYWN1dGUnLCdcXHUwMTM5JzonTGFjdXRlJywnXFx1MDEzRSc6J2xjYXJvbicsJ1xcdTAxM0QnOidMY2Fyb24nLCdcXHUwMTNDJzonbGNlZGlsJywnXFx1MDEzQic6J0xjZWRpbCcsJ1xcdTAxNDInOidsc3Ryb2snLCdcXHUwMTQxJzonTHN0cm9rJywnXFx1MDE0MCc6J2xtaWRvdCcsJ1xcdTAxM0YnOidMbWlkb3QnLCdcXHVEODM1XFx1REQyQSc6J21mcicsJ1xcdUQ4MzVcXHVERDVFJzonbW9wZicsJ1xcdUQ4MzVcXHVEQ0MyJzonbXNjcicsJ1xcdUQ4MzVcXHVERDEwJzonTWZyJywnXFx1RDgzNVxcdURENDQnOidNb3BmJywnXFx1MjEzMyc6J01zY3InLCdcXHVEODM1XFx1REQyQic6J25mcicsJ1xcdUQ4MzVcXHVERDVGJzonbm9wZicsJ1xcdUQ4MzVcXHVEQ0MzJzonbnNjcicsJ1xcdTIxMTUnOidOb3BmJywnXFx1RDgzNVxcdURDQTknOidOc2NyJywnXFx1RDgzNVxcdUREMTEnOidOZnInLCdcXHUwMTQ0JzonbmFjdXRlJywnXFx1MDE0Myc6J05hY3V0ZScsJ1xcdTAxNDgnOiduY2Fyb24nLCdcXHUwMTQ3JzonTmNhcm9uJywnXFx4RjEnOidudGlsZGUnLCdcXHhEMSc6J050aWxkZScsJ1xcdTAxNDYnOiduY2VkaWwnLCdcXHUwMTQ1JzonTmNlZGlsJywnXFx1MjExNic6J251bWVybycsJ1xcdTAxNEInOidlbmcnLCdcXHUwMTRBJzonRU5HJywnXFx1RDgzNVxcdURENjAnOidvb3BmJywnXFx1RDgzNVxcdUREMkMnOidvZnInLCdcXHUyMTM0Jzonb3NjcicsJ1xcdUQ4MzVcXHVEQ0FBJzonT3NjcicsJ1xcdUQ4MzVcXHVERDEyJzonT2ZyJywnXFx1RDgzNVxcdURENDYnOidPb3BmJywnXFx4QkEnOidvcmRtJywnXFx4RjMnOidvYWN1dGUnLCdcXHhEMyc6J09hY3V0ZScsJ1xceEYyJzonb2dyYXZlJywnXFx4RDInOidPZ3JhdmUnLCdcXHhGNCc6J29jaXJjJywnXFx4RDQnOidPY2lyYycsJ1xceEY2Jzonb3VtbCcsJ1xceEQ2JzonT3VtbCcsJ1xcdTAxNTEnOidvZGJsYWMnLCdcXHUwMTUwJzonT2RibGFjJywnXFx4RjUnOidvdGlsZGUnLCdcXHhENSc6J090aWxkZScsJ1xceEY4Jzonb3NsYXNoJywnXFx4RDgnOidPc2xhc2gnLCdcXHUwMTREJzonb21hY3InLCdcXHUwMTRDJzonT21hY3InLCdcXHUwMTUzJzonb2VsaWcnLCdcXHUwMTUyJzonT0VsaWcnLCdcXHVEODM1XFx1REQyRCc6J3BmcicsJ1xcdUQ4MzVcXHVEQ0M1JzoncHNjcicsJ1xcdUQ4MzVcXHVERDYxJzoncG9wZicsJ1xcdTIxMTknOidQb3BmJywnXFx1RDgzNVxcdUREMTMnOidQZnInLCdcXHVEODM1XFx1RENBQic6J1BzY3InLCdcXHVEODM1XFx1REQ2Mic6J3FvcGYnLCdcXHVEODM1XFx1REQyRSc6J3FmcicsJ1xcdUQ4MzVcXHVEQ0M2JzoncXNjcicsJ1xcdUQ4MzVcXHVEQ0FDJzonUXNjcicsJ1xcdUQ4MzVcXHVERDE0JzonUWZyJywnXFx1MjExQSc6J1FvcGYnLCdcXHUwMTM4Jzona2dyZWVuJywnXFx1RDgzNVxcdUREMkYnOidyZnInLCdcXHVEODM1XFx1REQ2Myc6J3JvcGYnLCdcXHVEODM1XFx1RENDNyc6J3JzY3InLCdcXHUyMTFCJzonUnNjcicsJ1xcdTIxMUMnOidSZScsJ1xcdTIxMUQnOidSb3BmJywnXFx1MDE1NSc6J3JhY3V0ZScsJ1xcdTAxNTQnOidSYWN1dGUnLCdcXHUwMTU5JzoncmNhcm9uJywnXFx1MDE1OCc6J1JjYXJvbicsJ1xcdTAxNTcnOidyY2VkaWwnLCdcXHUwMTU2JzonUmNlZGlsJywnXFx1RDgzNVxcdURENjQnOidzb3BmJywnXFx1RDgzNVxcdURDQzgnOidzc2NyJywnXFx1RDgzNVxcdUREMzAnOidzZnInLCdcXHVEODM1XFx1REQ0QSc6J1NvcGYnLCdcXHVEODM1XFx1REQxNic6J1NmcicsJ1xcdUQ4MzVcXHVEQ0FFJzonU3NjcicsJ1xcdTI0QzgnOidvUycsJ1xcdTAxNUInOidzYWN1dGUnLCdcXHUwMTVBJzonU2FjdXRlJywnXFx1MDE1RCc6J3NjaXJjJywnXFx1MDE1Qyc6J1NjaXJjJywnXFx1MDE2MSc6J3NjYXJvbicsJ1xcdTAxNjAnOidTY2Fyb24nLCdcXHUwMTVGJzonc2NlZGlsJywnXFx1MDE1RSc6J1NjZWRpbCcsJ1xceERGJzonc3psaWcnLCdcXHVEODM1XFx1REQzMSc6J3RmcicsJ1xcdUQ4MzVcXHVEQ0M5JzondHNjcicsJ1xcdUQ4MzVcXHVERDY1JzondG9wZicsJ1xcdUQ4MzVcXHVEQ0FGJzonVHNjcicsJ1xcdUQ4MzVcXHVERDE3JzonVGZyJywnXFx1RDgzNVxcdURENEInOidUb3BmJywnXFx1MDE2NSc6J3RjYXJvbicsJ1xcdTAxNjQnOidUY2Fyb24nLCdcXHUwMTYzJzondGNlZGlsJywnXFx1MDE2Mic6J1RjZWRpbCcsJ1xcdTIxMjInOid0cmFkZScsJ1xcdTAxNjcnOid0c3Ryb2snLCdcXHUwMTY2JzonVHN0cm9rJywnXFx1RDgzNVxcdURDQ0EnOid1c2NyJywnXFx1RDgzNVxcdURENjYnOid1b3BmJywnXFx1RDgzNVxcdUREMzInOid1ZnInLCdcXHVEODM1XFx1REQ0Qyc6J1VvcGYnLCdcXHVEODM1XFx1REQxOCc6J1VmcicsJ1xcdUQ4MzVcXHVEQ0IwJzonVXNjcicsJ1xceEZBJzondWFjdXRlJywnXFx4REEnOidVYWN1dGUnLCdcXHhGOSc6J3VncmF2ZScsJ1xceEQ5JzonVWdyYXZlJywnXFx1MDE2RCc6J3VicmV2ZScsJ1xcdTAxNkMnOidVYnJldmUnLCdcXHhGQic6J3VjaXJjJywnXFx4REInOidVY2lyYycsJ1xcdTAxNkYnOid1cmluZycsJ1xcdTAxNkUnOidVcmluZycsJ1xceEZDJzondXVtbCcsJ1xceERDJzonVXVtbCcsJ1xcdTAxNzEnOid1ZGJsYWMnLCdcXHUwMTcwJzonVWRibGFjJywnXFx1MDE2OSc6J3V0aWxkZScsJ1xcdTAxNjgnOidVdGlsZGUnLCdcXHUwMTczJzondW9nb24nLCdcXHUwMTcyJzonVW9nb24nLCdcXHUwMTZCJzondW1hY3InLCdcXHUwMTZBJzonVW1hY3InLCdcXHVEODM1XFx1REQzMyc6J3ZmcicsJ1xcdUQ4MzVcXHVERDY3Jzondm9wZicsJ1xcdUQ4MzVcXHVEQ0NCJzondnNjcicsJ1xcdUQ4MzVcXHVERDE5JzonVmZyJywnXFx1RDgzNVxcdURENEQnOidWb3BmJywnXFx1RDgzNVxcdURDQjEnOidWc2NyJywnXFx1RDgzNVxcdURENjgnOid3b3BmJywnXFx1RDgzNVxcdURDQ0MnOid3c2NyJywnXFx1RDgzNVxcdUREMzQnOid3ZnInLCdcXHVEODM1XFx1RENCMic6J1dzY3InLCdcXHVEODM1XFx1REQ0RSc6J1dvcGYnLCdcXHVEODM1XFx1REQxQSc6J1dmcicsJ1xcdTAxNzUnOid3Y2lyYycsJ1xcdTAxNzQnOidXY2lyYycsJ1xcdUQ4MzVcXHVERDM1JzoneGZyJywnXFx1RDgzNVxcdURDQ0QnOid4c2NyJywnXFx1RDgzNVxcdURENjknOid4b3BmJywnXFx1RDgzNVxcdURENEYnOidYb3BmJywnXFx1RDgzNVxcdUREMUInOidYZnInLCdcXHVEODM1XFx1RENCMyc6J1hzY3InLCdcXHVEODM1XFx1REQzNic6J3lmcicsJ1xcdUQ4MzVcXHVEQ0NFJzoneXNjcicsJ1xcdUQ4MzVcXHVERDZBJzoneW9wZicsJ1xcdUQ4MzVcXHVEQ0I0JzonWXNjcicsJ1xcdUQ4MzVcXHVERDFDJzonWWZyJywnXFx1RDgzNVxcdURENTAnOidZb3BmJywnXFx4RkQnOid5YWN1dGUnLCdcXHhERCc6J1lhY3V0ZScsJ1xcdTAxNzcnOid5Y2lyYycsJ1xcdTAxNzYnOidZY2lyYycsJ1xceEZGJzoneXVtbCcsJ1xcdTAxNzgnOidZdW1sJywnXFx1RDgzNVxcdURDQ0YnOid6c2NyJywnXFx1RDgzNVxcdUREMzcnOid6ZnInLCdcXHVEODM1XFx1REQ2Qic6J3pvcGYnLCdcXHUyMTI4JzonWmZyJywnXFx1MjEyNCc6J1pvcGYnLCdcXHVEODM1XFx1RENCNSc6J1pzY3InLCdcXHUwMTdBJzonemFjdXRlJywnXFx1MDE3OSc6J1phY3V0ZScsJ1xcdTAxN0UnOid6Y2Fyb24nLCdcXHUwMTdEJzonWmNhcm9uJywnXFx1MDE3Qyc6J3pkb3QnLCdcXHUwMTdCJzonWmRvdCcsJ1xcdTAxQjUnOidpbXBlZCcsJ1xceEZFJzondGhvcm4nLCdcXHhERSc6J1RIT1JOJywnXFx1MDE0OSc6J25hcG9zJywnXFx1MDNCMSc6J2FscGhhJywnXFx1MDM5MSc6J0FscGhhJywnXFx1MDNCMic6J2JldGEnLCdcXHUwMzkyJzonQmV0YScsJ1xcdTAzQjMnOidnYW1tYScsJ1xcdTAzOTMnOidHYW1tYScsJ1xcdTAzQjQnOidkZWx0YScsJ1xcdTAzOTQnOidEZWx0YScsJ1xcdTAzQjUnOidlcHNpJywnXFx1MDNGNSc6J2Vwc2l2JywnXFx1MDM5NSc6J0Vwc2lsb24nLCdcXHUwM0REJzonZ2FtbWFkJywnXFx1MDNEQyc6J0dhbW1hZCcsJ1xcdTAzQjYnOid6ZXRhJywnXFx1MDM5Nic6J1pldGEnLCdcXHUwM0I3JzonZXRhJywnXFx1MDM5Nyc6J0V0YScsJ1xcdTAzQjgnOid0aGV0YScsJ1xcdTAzRDEnOid0aGV0YXYnLCdcXHUwMzk4JzonVGhldGEnLCdcXHUwM0I5JzonaW90YScsJ1xcdTAzOTknOidJb3RhJywnXFx1MDNCQSc6J2thcHBhJywnXFx1MDNGMCc6J2thcHBhdicsJ1xcdTAzOUEnOidLYXBwYScsJ1xcdTAzQkInOidsYW1iZGEnLCdcXHUwMzlCJzonTGFtYmRhJywnXFx1MDNCQyc6J211JywnXFx4QjUnOidtaWNybycsJ1xcdTAzOUMnOidNdScsJ1xcdTAzQkQnOidudScsJ1xcdTAzOUQnOidOdScsJ1xcdTAzQkUnOid4aScsJ1xcdTAzOUUnOidYaScsJ1xcdTAzQkYnOidvbWljcm9uJywnXFx1MDM5Ric6J09taWNyb24nLCdcXHUwM0MwJzoncGknLCdcXHUwM0Q2JzoncGl2JywnXFx1MDNBMCc6J1BpJywnXFx1MDNDMSc6J3JobycsJ1xcdTAzRjEnOidyaG92JywnXFx1MDNBMSc6J1JobycsJ1xcdTAzQzMnOidzaWdtYScsJ1xcdTAzQTMnOidTaWdtYScsJ1xcdTAzQzInOidzaWdtYWYnLCdcXHUwM0M0JzondGF1JywnXFx1MDNBNCc6J1RhdScsJ1xcdTAzQzUnOid1cHNpJywnXFx1MDNBNSc6J1Vwc2lsb24nLCdcXHUwM0QyJzonVXBzaScsJ1xcdTAzQzYnOidwaGknLCdcXHUwM0Q1JzoncGhpdicsJ1xcdTAzQTYnOidQaGknLCdcXHUwM0M3JzonY2hpJywnXFx1MDNBNyc6J0NoaScsJ1xcdTAzQzgnOidwc2knLCdcXHUwM0E4JzonUHNpJywnXFx1MDNDOSc6J29tZWdhJywnXFx1MDNBOSc6J29obScsJ1xcdTA0MzAnOidhY3knLCdcXHUwNDEwJzonQWN5JywnXFx1MDQzMSc6J2JjeScsJ1xcdTA0MTEnOidCY3knLCdcXHUwNDMyJzondmN5JywnXFx1MDQxMic6J1ZjeScsJ1xcdTA0MzMnOidnY3knLCdcXHUwNDEzJzonR2N5JywnXFx1MDQ1Myc6J2dqY3knLCdcXHUwNDAzJzonR0pjeScsJ1xcdTA0MzQnOidkY3knLCdcXHUwNDE0JzonRGN5JywnXFx1MDQ1Mic6J2RqY3knLCdcXHUwNDAyJzonREpjeScsJ1xcdTA0MzUnOidpZWN5JywnXFx1MDQxNSc6J0lFY3knLCdcXHUwNDUxJzonaW9jeScsJ1xcdTA0MDEnOidJT2N5JywnXFx1MDQ1NCc6J2p1a2N5JywnXFx1MDQwNCc6J0p1a2N5JywnXFx1MDQzNic6J3poY3knLCdcXHUwNDE2JzonWkhjeScsJ1xcdTA0MzcnOid6Y3knLCdcXHUwNDE3JzonWmN5JywnXFx1MDQ1NSc6J2RzY3knLCdcXHUwNDA1JzonRFNjeScsJ1xcdTA0MzgnOidpY3knLCdcXHUwNDE4JzonSWN5JywnXFx1MDQ1Nic6J2l1a2N5JywnXFx1MDQwNic6J0l1a2N5JywnXFx1MDQ1Nyc6J3lpY3knLCdcXHUwNDA3JzonWUljeScsJ1xcdTA0MzknOidqY3knLCdcXHUwNDE5JzonSmN5JywnXFx1MDQ1OCc6J2pzZXJjeScsJ1xcdTA0MDgnOidKc2VyY3knLCdcXHUwNDNBJzona2N5JywnXFx1MDQxQSc6J0tjeScsJ1xcdTA0NUMnOidramN5JywnXFx1MDQwQyc6J0tKY3knLCdcXHUwNDNCJzonbGN5JywnXFx1MDQxQic6J0xjeScsJ1xcdTA0NTknOidsamN5JywnXFx1MDQwOSc6J0xKY3knLCdcXHUwNDNDJzonbWN5JywnXFx1MDQxQyc6J01jeScsJ1xcdTA0M0QnOiduY3knLCdcXHUwNDFEJzonTmN5JywnXFx1MDQ1QSc6J25qY3knLCdcXHUwNDBBJzonTkpjeScsJ1xcdTA0M0UnOidvY3knLCdcXHUwNDFFJzonT2N5JywnXFx1MDQzRic6J3BjeScsJ1xcdTA0MUYnOidQY3knLCdcXHUwNDQwJzoncmN5JywnXFx1MDQyMCc6J1JjeScsJ1xcdTA0NDEnOidzY3knLCdcXHUwNDIxJzonU2N5JywnXFx1MDQ0Mic6J3RjeScsJ1xcdTA0MjInOidUY3knLCdcXHUwNDVCJzondHNoY3knLCdcXHUwNDBCJzonVFNIY3knLCdcXHUwNDQzJzondWN5JywnXFx1MDQyMyc6J1VjeScsJ1xcdTA0NUUnOid1YnJjeScsJ1xcdTA0MEUnOidVYnJjeScsJ1xcdTA0NDQnOidmY3knLCdcXHUwNDI0JzonRmN5JywnXFx1MDQ0NSc6J2toY3knLCdcXHUwNDI1JzonS0hjeScsJ1xcdTA0NDYnOid0c2N5JywnXFx1MDQyNic6J1RTY3knLCdcXHUwNDQ3JzonY2hjeScsJ1xcdTA0MjcnOidDSGN5JywnXFx1MDQ1Ric6J2R6Y3knLCdcXHUwNDBGJzonRFpjeScsJ1xcdTA0NDgnOidzaGN5JywnXFx1MDQyOCc6J1NIY3knLCdcXHUwNDQ5Jzonc2hjaGN5JywnXFx1MDQyOSc6J1NIQ0hjeScsJ1xcdTA0NEEnOidoYXJkY3knLCdcXHUwNDJBJzonSEFSRGN5JywnXFx1MDQ0Qic6J3ljeScsJ1xcdTA0MkInOidZY3knLCdcXHUwNDRDJzonc29mdGN5JywnXFx1MDQyQyc6J1NPRlRjeScsJ1xcdTA0NEQnOidlY3knLCdcXHUwNDJEJzonRWN5JywnXFx1MDQ0RSc6J3l1Y3knLCdcXHUwNDJFJzonWVVjeScsJ1xcdTA0NEYnOid5YWN5JywnXFx1MDQyRic6J1lBY3knLCdcXHUyMTM1JzonYWxlcGgnLCdcXHUyMTM2JzonYmV0aCcsJ1xcdTIxMzcnOidnaW1lbCcsJ1xcdTIxMzgnOidkYWxldGgnfTtcblxuXHR2YXIgcmVnZXhFc2NhcGUgPSAvW1wiJic8PmBdL2c7XG5cdHZhciBlc2NhcGVNYXAgPSB7XG5cdFx0J1wiJzogJyZxdW90OycsXG5cdFx0JyYnOiAnJmFtcDsnLFxuXHRcdCdcXCcnOiAnJiN4Mjc7Jyxcblx0XHQnPCc6ICcmbHQ7Jyxcblx0XHQvLyBTZWUgaHR0cHM6Ly9tYXRoaWFzYnluZW5zLmJlL25vdGVzL2FtYmlndW91cy1hbXBlcnNhbmRzOiBpbiBIVE1MLCB0aGVcblx0XHQvLyBmb2xsb3dpbmcgaXMgbm90IHN0cmljdGx5IG5lY2Vzc2FyeSB1bmxlc3MgaXTigJlzIHBhcnQgb2YgYSB0YWcgb3IgYW5cblx0XHQvLyB1bnF1b3RlZCBhdHRyaWJ1dGUgdmFsdWUuIFdl4oCZcmUgb25seSBlc2NhcGluZyBpdCB0byBzdXBwb3J0IHRob3NlXG5cdFx0Ly8gc2l0dWF0aW9ucywgYW5kIGZvciBYTUwgc3VwcG9ydC5cblx0XHQnPic6ICcmZ3Q7Jyxcblx0XHQvLyBJbiBJbnRlcm5ldCBFeHBsb3JlciDiiaQgOCwgdGhlIGJhY2t0aWNrIGNoYXJhY3RlciBjYW4gYmUgdXNlZFxuXHRcdC8vIHRvIGJyZWFrIG91dCBvZiAodW4pcXVvdGVkIGF0dHJpYnV0ZSB2YWx1ZXMgb3IgSFRNTCBjb21tZW50cy5cblx0XHQvLyBTZWUgaHR0cDovL2h0bWw1c2VjLm9yZy8jMTAyLCBodHRwOi8vaHRtbDVzZWMub3JnLyMxMDgsIGFuZFxuXHRcdC8vIGh0dHA6Ly9odG1sNXNlYy5vcmcvIzEzMy5cblx0XHQnYCc6ICcmI3g2MDsnXG5cdH07XG5cblx0dmFyIHJlZ2V4SW52YWxpZEVudGl0eSA9IC8mIyg/Olt4WF1bXmEtZkEtRjAtOV18W14wLTl4WF0pLztcblx0dmFyIHJlZ2V4SW52YWxpZFJhd0NvZGVQb2ludCA9IC9bXFwwLVxceDA4XFx4MEJcXHgwRS1cXHgxRlxceDdGLVxceDlGXFx1RkREMC1cXHVGREVGXFx1RkZGRVxcdUZGRkZdfFtcXHVEODNGXFx1RDg3RlxcdUQ4QkZcXHVEOEZGXFx1RDkzRlxcdUQ5N0ZcXHVEOUJGXFx1RDlGRlxcdURBM0ZcXHVEQTdGXFx1REFCRlxcdURBRkZcXHVEQjNGXFx1REI3RlxcdURCQkZcXHVEQkZGXVtcXHVERkZFXFx1REZGRl18W1xcdUQ4MDAtXFx1REJGRl0oPyFbXFx1REMwMC1cXHVERkZGXSl8KD86W15cXHVEODAwLVxcdURCRkZdfF4pW1xcdURDMDAtXFx1REZGRl0vO1xuXHR2YXIgcmVnZXhEZWNvZGUgPSAvJiMoWzAtOV0rKSg7Pyl8JiNbeFhdKFthLWZBLUYwLTldKykoOz8pfCYoWzAtOWEtekEtWl0rKTt8JihBYWN1dGV8QWdyYXZlfEF0aWxkZXxDY2VkaWx8RWFjdXRlfEVncmF2ZXxJYWN1dGV8SWdyYXZlfE50aWxkZXxPYWN1dGV8T2dyYXZlfE9zbGFzaHxPdGlsZGV8VWFjdXRlfFVncmF2ZXxZYWN1dGV8YWFjdXRlfGFncmF2ZXxhdGlsZGV8YnJ2YmFyfGNjZWRpbHxjdXJyZW58ZGl2aWRlfGVhY3V0ZXxlZ3JhdmV8ZnJhYzEyfGZyYWMxNHxmcmFjMzR8aWFjdXRlfGlncmF2ZXxpcXVlc3R8bWlkZG90fG50aWxkZXxvYWN1dGV8b2dyYXZlfG9zbGFzaHxvdGlsZGV8cGx1c21ufHVhY3V0ZXx1Z3JhdmV8eWFjdXRlfEFFbGlnfEFjaXJjfEFyaW5nfEVjaXJjfEljaXJjfE9jaXJjfFRIT1JOfFVjaXJjfGFjaXJjfGFjdXRlfGFlbGlnfGFyaW5nfGNlZGlsfGVjaXJjfGljaXJjfGlleGNsfGxhcXVvfG1pY3JvfG9jaXJjfHBvdW5kfHJhcXVvfHN6bGlnfHRob3JufHRpbWVzfHVjaXJjfEF1bWx8Q09QWXxFdW1sfEl1bWx8T3VtbHxRVU9UfFV1bWx8YXVtbHxjZW50fGNvcHl8ZXVtbHxpdW1sfG1hY3J8bmJzcHxvcmRmfG9yZG18b3VtbHxwYXJhfHF1b3R8c2VjdHxzdXAxfHN1cDJ8c3VwM3x1dW1sfHl1bWx8QU1QfEVUSHxSRUd8YW1wfGRlZ3xldGh8bm90fHJlZ3xzaHl8dW1sfHllbnxHVHxMVHxndHxsdCkoWz1hLXpBLVowLTldKT8vZztcblx0dmFyIGRlY29kZU1hcCA9IHsnYWFjdXRlJzonXFx4RTEnLCdBYWN1dGUnOidcXHhDMScsJ2FicmV2ZSc6J1xcdTAxMDMnLCdBYnJldmUnOidcXHUwMTAyJywnYWMnOidcXHUyMjNFJywnYWNkJzonXFx1MjIzRicsJ2FjRSc6J1xcdTIyM0VcXHUwMzMzJywnYWNpcmMnOidcXHhFMicsJ0FjaXJjJzonXFx4QzInLCdhY3V0ZSc6J1xceEI0JywnYWN5JzonXFx1MDQzMCcsJ0FjeSc6J1xcdTA0MTAnLCdhZWxpZyc6J1xceEU2JywnQUVsaWcnOidcXHhDNicsJ2FmJzonXFx1MjA2MScsJ2Fmcic6J1xcdUQ4MzVcXHVERDFFJywnQWZyJzonXFx1RDgzNVxcdUREMDQnLCdhZ3JhdmUnOidcXHhFMCcsJ0FncmF2ZSc6J1xceEMwJywnYWxlZnN5bSc6J1xcdTIxMzUnLCdhbGVwaCc6J1xcdTIxMzUnLCdhbHBoYSc6J1xcdTAzQjEnLCdBbHBoYSc6J1xcdTAzOTEnLCdhbWFjcic6J1xcdTAxMDEnLCdBbWFjcic6J1xcdTAxMDAnLCdhbWFsZyc6J1xcdTJBM0YnLCdhbXAnOicmJywnQU1QJzonJicsJ2FuZCc6J1xcdTIyMjcnLCdBbmQnOidcXHUyQTUzJywnYW5kYW5kJzonXFx1MkE1NScsJ2FuZGQnOidcXHUyQTVDJywnYW5kc2xvcGUnOidcXHUyQTU4JywnYW5kdic6J1xcdTJBNUEnLCdhbmcnOidcXHUyMjIwJywnYW5nZSc6J1xcdTI5QTQnLCdhbmdsZSc6J1xcdTIyMjAnLCdhbmdtc2QnOidcXHUyMjIxJywnYW5nbXNkYWEnOidcXHUyOUE4JywnYW5nbXNkYWInOidcXHUyOUE5JywnYW5nbXNkYWMnOidcXHUyOUFBJywnYW5nbXNkYWQnOidcXHUyOUFCJywnYW5nbXNkYWUnOidcXHUyOUFDJywnYW5nbXNkYWYnOidcXHUyOUFEJywnYW5nbXNkYWcnOidcXHUyOUFFJywnYW5nbXNkYWgnOidcXHUyOUFGJywnYW5ncnQnOidcXHUyMjFGJywnYW5ncnR2Yic6J1xcdTIyQkUnLCdhbmdydHZiZCc6J1xcdTI5OUQnLCdhbmdzcGgnOidcXHUyMjIyJywnYW5nc3QnOidcXHhDNScsJ2FuZ3phcnInOidcXHUyMzdDJywnYW9nb24nOidcXHUwMTA1JywnQW9nb24nOidcXHUwMTA0JywnYW9wZic6J1xcdUQ4MzVcXHVERDUyJywnQW9wZic6J1xcdUQ4MzVcXHVERDM4JywnYXAnOidcXHUyMjQ4JywnYXBhY2lyJzonXFx1MkE2RicsJ2FwZSc6J1xcdTIyNEEnLCdhcEUnOidcXHUyQTcwJywnYXBpZCc6J1xcdTIyNEInLCdhcG9zJzonXFwnJywnQXBwbHlGdW5jdGlvbic6J1xcdTIwNjEnLCdhcHByb3gnOidcXHUyMjQ4JywnYXBwcm94ZXEnOidcXHUyMjRBJywnYXJpbmcnOidcXHhFNScsJ0FyaW5nJzonXFx4QzUnLCdhc2NyJzonXFx1RDgzNVxcdURDQjYnLCdBc2NyJzonXFx1RDgzNVxcdURDOUMnLCdBc3NpZ24nOidcXHUyMjU0JywnYXN0JzonKicsJ2FzeW1wJzonXFx1MjI0OCcsJ2FzeW1wZXEnOidcXHUyMjREJywnYXRpbGRlJzonXFx4RTMnLCdBdGlsZGUnOidcXHhDMycsJ2F1bWwnOidcXHhFNCcsJ0F1bWwnOidcXHhDNCcsJ2F3Y29uaW50JzonXFx1MjIzMycsJ2F3aW50JzonXFx1MkExMScsJ2JhY2tjb25nJzonXFx1MjI0QycsJ2JhY2tlcHNpbG9uJzonXFx1MDNGNicsJ2JhY2twcmltZSc6J1xcdTIwMzUnLCdiYWNrc2ltJzonXFx1MjIzRCcsJ2JhY2tzaW1lcSc6J1xcdTIyQ0QnLCdCYWNrc2xhc2gnOidcXHUyMjE2JywnQmFydic6J1xcdTJBRTcnLCdiYXJ2ZWUnOidcXHUyMkJEJywnYmFyd2VkJzonXFx1MjMwNScsJ0JhcndlZCc6J1xcdTIzMDYnLCdiYXJ3ZWRnZSc6J1xcdTIzMDUnLCdiYnJrJzonXFx1MjNCNScsJ2Jicmt0YnJrJzonXFx1MjNCNicsJ2Jjb25nJzonXFx1MjI0QycsJ2JjeSc6J1xcdTA0MzEnLCdCY3knOidcXHUwNDExJywnYmRxdW8nOidcXHUyMDFFJywnYmVjYXVzJzonXFx1MjIzNScsJ2JlY2F1c2UnOidcXHUyMjM1JywnQmVjYXVzZSc6J1xcdTIyMzUnLCdiZW1wdHl2JzonXFx1MjlCMCcsJ2JlcHNpJzonXFx1MDNGNicsJ2Jlcm5vdSc6J1xcdTIxMkMnLCdCZXJub3VsbGlzJzonXFx1MjEyQycsJ2JldGEnOidcXHUwM0IyJywnQmV0YSc6J1xcdTAzOTInLCdiZXRoJzonXFx1MjEzNicsJ2JldHdlZW4nOidcXHUyMjZDJywnYmZyJzonXFx1RDgzNVxcdUREMUYnLCdCZnInOidcXHVEODM1XFx1REQwNScsJ2JpZ2NhcCc6J1xcdTIyQzInLCdiaWdjaXJjJzonXFx1MjVFRicsJ2JpZ2N1cCc6J1xcdTIyQzMnLCdiaWdvZG90JzonXFx1MkEwMCcsJ2JpZ29wbHVzJzonXFx1MkEwMScsJ2JpZ290aW1lcyc6J1xcdTJBMDInLCdiaWdzcWN1cCc6J1xcdTJBMDYnLCdiaWdzdGFyJzonXFx1MjYwNScsJ2JpZ3RyaWFuZ2xlZG93bic6J1xcdTI1QkQnLCdiaWd0cmlhbmdsZXVwJzonXFx1MjVCMycsJ2JpZ3VwbHVzJzonXFx1MkEwNCcsJ2JpZ3ZlZSc6J1xcdTIyQzEnLCdiaWd3ZWRnZSc6J1xcdTIyQzAnLCdia2Fyb3cnOidcXHUyOTBEJywnYmxhY2tsb3plbmdlJzonXFx1MjlFQicsJ2JsYWNrc3F1YXJlJzonXFx1MjVBQScsJ2JsYWNrdHJpYW5nbGUnOidcXHUyNUI0JywnYmxhY2t0cmlhbmdsZWRvd24nOidcXHUyNUJFJywnYmxhY2t0cmlhbmdsZWxlZnQnOidcXHUyNUMyJywnYmxhY2t0cmlhbmdsZXJpZ2h0JzonXFx1MjVCOCcsJ2JsYW5rJzonXFx1MjQyMycsJ2JsazEyJzonXFx1MjU5MicsJ2JsazE0JzonXFx1MjU5MScsJ2JsazM0JzonXFx1MjU5MycsJ2Jsb2NrJzonXFx1MjU4OCcsJ2JuZSc6Jz1cXHUyMEU1JywnYm5lcXVpdic6J1xcdTIyNjFcXHUyMEU1JywnYm5vdCc6J1xcdTIzMTAnLCdiTm90JzonXFx1MkFFRCcsJ2JvcGYnOidcXHVEODM1XFx1REQ1MycsJ0JvcGYnOidcXHVEODM1XFx1REQzOScsJ2JvdCc6J1xcdTIyQTUnLCdib3R0b20nOidcXHUyMkE1JywnYm93dGllJzonXFx1MjJDOCcsJ2JveGJveCc6J1xcdTI5QzknLCdib3hkbCc6J1xcdTI1MTAnLCdib3hkTCc6J1xcdTI1NTUnLCdib3hEbCc6J1xcdTI1NTYnLCdib3hETCc6J1xcdTI1NTcnLCdib3hkcic6J1xcdTI1MEMnLCdib3hkUic6J1xcdTI1NTInLCdib3hEcic6J1xcdTI1NTMnLCdib3hEUic6J1xcdTI1NTQnLCdib3hoJzonXFx1MjUwMCcsJ2JveEgnOidcXHUyNTUwJywnYm94aGQnOidcXHUyNTJDJywnYm94aEQnOidcXHUyNTY1JywnYm94SGQnOidcXHUyNTY0JywnYm94SEQnOidcXHUyNTY2JywnYm94aHUnOidcXHUyNTM0JywnYm94aFUnOidcXHUyNTY4JywnYm94SHUnOidcXHUyNTY3JywnYm94SFUnOidcXHUyNTY5JywnYm94bWludXMnOidcXHUyMjlGJywnYm94cGx1cyc6J1xcdTIyOUUnLCdib3h0aW1lcyc6J1xcdTIyQTAnLCdib3h1bCc6J1xcdTI1MTgnLCdib3h1TCc6J1xcdTI1NUInLCdib3hVbCc6J1xcdTI1NUMnLCdib3hVTCc6J1xcdTI1NUQnLCdib3h1cic6J1xcdTI1MTQnLCdib3h1Uic6J1xcdTI1NTgnLCdib3hVcic6J1xcdTI1NTknLCdib3hVUic6J1xcdTI1NUEnLCdib3h2JzonXFx1MjUwMicsJ2JveFYnOidcXHUyNTUxJywnYm94dmgnOidcXHUyNTNDJywnYm94dkgnOidcXHUyNTZBJywnYm94VmgnOidcXHUyNTZCJywnYm94VkgnOidcXHUyNTZDJywnYm94dmwnOidcXHUyNTI0JywnYm94dkwnOidcXHUyNTYxJywnYm94VmwnOidcXHUyNTYyJywnYm94VkwnOidcXHUyNTYzJywnYm94dnInOidcXHUyNTFDJywnYm94dlInOidcXHUyNTVFJywnYm94VnInOidcXHUyNTVGJywnYm94VlInOidcXHUyNTYwJywnYnByaW1lJzonXFx1MjAzNScsJ2JyZXZlJzonXFx1MDJEOCcsJ0JyZXZlJzonXFx1MDJEOCcsJ2JydmJhcic6J1xceEE2JywnYnNjcic6J1xcdUQ4MzVcXHVEQ0I3JywnQnNjcic6J1xcdTIxMkMnLCdic2VtaSc6J1xcdTIwNEYnLCdic2ltJzonXFx1MjIzRCcsJ2JzaW1lJzonXFx1MjJDRCcsJ2Jzb2wnOidcXFxcJywnYnNvbGInOidcXHUyOUM1JywnYnNvbGhzdWInOidcXHUyN0M4JywnYnVsbCc6J1xcdTIwMjInLCdidWxsZXQnOidcXHUyMDIyJywnYnVtcCc6J1xcdTIyNEUnLCdidW1wZSc6J1xcdTIyNEYnLCdidW1wRSc6J1xcdTJBQUUnLCdidW1wZXEnOidcXHUyMjRGJywnQnVtcGVxJzonXFx1MjI0RScsJ2NhY3V0ZSc6J1xcdTAxMDcnLCdDYWN1dGUnOidcXHUwMTA2JywnY2FwJzonXFx1MjIyOScsJ0NhcCc6J1xcdTIyRDInLCdjYXBhbmQnOidcXHUyQTQ0JywnY2FwYnJjdXAnOidcXHUyQTQ5JywnY2FwY2FwJzonXFx1MkE0QicsJ2NhcGN1cCc6J1xcdTJBNDcnLCdjYXBkb3QnOidcXHUyQTQwJywnQ2FwaXRhbERpZmZlcmVudGlhbEQnOidcXHUyMTQ1JywnY2Fwcyc6J1xcdTIyMjlcXHVGRTAwJywnY2FyZXQnOidcXHUyMDQxJywnY2Fyb24nOidcXHUwMkM3JywnQ2F5bGV5cyc6J1xcdTIxMkQnLCdjY2Fwcyc6J1xcdTJBNEQnLCdjY2Fyb24nOidcXHUwMTBEJywnQ2Nhcm9uJzonXFx1MDEwQycsJ2NjZWRpbCc6J1xceEU3JywnQ2NlZGlsJzonXFx4QzcnLCdjY2lyYyc6J1xcdTAxMDknLCdDY2lyYyc6J1xcdTAxMDgnLCdDY29uaW50JzonXFx1MjIzMCcsJ2NjdXBzJzonXFx1MkE0QycsJ2NjdXBzc20nOidcXHUyQTUwJywnY2RvdCc6J1xcdTAxMEInLCdDZG90JzonXFx1MDEwQScsJ2NlZGlsJzonXFx4QjgnLCdDZWRpbGxhJzonXFx4QjgnLCdjZW1wdHl2JzonXFx1MjlCMicsJ2NlbnQnOidcXHhBMicsJ2NlbnRlcmRvdCc6J1xceEI3JywnQ2VudGVyRG90JzonXFx4QjcnLCdjZnInOidcXHVEODM1XFx1REQyMCcsJ0Nmcic6J1xcdTIxMkQnLCdjaGN5JzonXFx1MDQ0NycsJ0NIY3knOidcXHUwNDI3JywnY2hlY2snOidcXHUyNzEzJywnY2hlY2ttYXJrJzonXFx1MjcxMycsJ2NoaSc6J1xcdTAzQzcnLCdDaGknOidcXHUwM0E3JywnY2lyJzonXFx1MjVDQicsJ2NpcmMnOidcXHUwMkM2JywnY2lyY2VxJzonXFx1MjI1NycsJ2NpcmNsZWFycm93bGVmdCc6J1xcdTIxQkEnLCdjaXJjbGVhcnJvd3JpZ2h0JzonXFx1MjFCQicsJ2NpcmNsZWRhc3QnOidcXHUyMjlCJywnY2lyY2xlZGNpcmMnOidcXHUyMjlBJywnY2lyY2xlZGRhc2gnOidcXHUyMjlEJywnQ2lyY2xlRG90JzonXFx1MjI5OScsJ2NpcmNsZWRSJzonXFx4QUUnLCdjaXJjbGVkUyc6J1xcdTI0QzgnLCdDaXJjbGVNaW51cyc6J1xcdTIyOTYnLCdDaXJjbGVQbHVzJzonXFx1MjI5NScsJ0NpcmNsZVRpbWVzJzonXFx1MjI5NycsJ2NpcmUnOidcXHUyMjU3JywnY2lyRSc6J1xcdTI5QzMnLCdjaXJmbmludCc6J1xcdTJBMTAnLCdjaXJtaWQnOidcXHUyQUVGJywnY2lyc2Npcic6J1xcdTI5QzInLCdDbG9ja3dpc2VDb250b3VySW50ZWdyYWwnOidcXHUyMjMyJywnQ2xvc2VDdXJseURvdWJsZVF1b3RlJzonXFx1MjAxRCcsJ0Nsb3NlQ3VybHlRdW90ZSc6J1xcdTIwMTknLCdjbHVicyc6J1xcdTI2NjMnLCdjbHVic3VpdCc6J1xcdTI2NjMnLCdjb2xvbic6JzonLCdDb2xvbic6J1xcdTIyMzcnLCdjb2xvbmUnOidcXHUyMjU0JywnQ29sb25lJzonXFx1MkE3NCcsJ2NvbG9uZXEnOidcXHUyMjU0JywnY29tbWEnOicsJywnY29tbWF0JzonQCcsJ2NvbXAnOidcXHUyMjAxJywnY29tcGZuJzonXFx1MjIxOCcsJ2NvbXBsZW1lbnQnOidcXHUyMjAxJywnY29tcGxleGVzJzonXFx1MjEwMicsJ2NvbmcnOidcXHUyMjQ1JywnY29uZ2RvdCc6J1xcdTJBNkQnLCdDb25ncnVlbnQnOidcXHUyMjYxJywnY29uaW50JzonXFx1MjIyRScsJ0NvbmludCc6J1xcdTIyMkYnLCdDb250b3VySW50ZWdyYWwnOidcXHUyMjJFJywnY29wZic6J1xcdUQ4MzVcXHVERDU0JywnQ29wZic6J1xcdTIxMDInLCdjb3Byb2QnOidcXHUyMjEwJywnQ29wcm9kdWN0JzonXFx1MjIxMCcsJ2NvcHknOidcXHhBOScsJ0NPUFknOidcXHhBOScsJ2NvcHlzcic6J1xcdTIxMTcnLCdDb3VudGVyQ2xvY2t3aXNlQ29udG91ckludGVncmFsJzonXFx1MjIzMycsJ2NyYXJyJzonXFx1MjFCNScsJ2Nyb3NzJzonXFx1MjcxNycsJ0Nyb3NzJzonXFx1MkEyRicsJ2NzY3InOidcXHVEODM1XFx1RENCOCcsJ0NzY3InOidcXHVEODM1XFx1REM5RScsJ2NzdWInOidcXHUyQUNGJywnY3N1YmUnOidcXHUyQUQxJywnY3N1cCc6J1xcdTJBRDAnLCdjc3VwZSc6J1xcdTJBRDInLCdjdGRvdCc6J1xcdTIyRUYnLCdjdWRhcnJsJzonXFx1MjkzOCcsJ2N1ZGFycnInOidcXHUyOTM1JywnY3VlcHInOidcXHUyMkRFJywnY3Vlc2MnOidcXHUyMkRGJywnY3VsYXJyJzonXFx1MjFCNicsJ2N1bGFycnAnOidcXHUyOTNEJywnY3VwJzonXFx1MjIyQScsJ0N1cCc6J1xcdTIyRDMnLCdjdXBicmNhcCc6J1xcdTJBNDgnLCdjdXBjYXAnOidcXHUyQTQ2JywnQ3VwQ2FwJzonXFx1MjI0RCcsJ2N1cGN1cCc6J1xcdTJBNEEnLCdjdXBkb3QnOidcXHUyMjhEJywnY3Vwb3InOidcXHUyQTQ1JywnY3Vwcyc6J1xcdTIyMkFcXHVGRTAwJywnY3VyYXJyJzonXFx1MjFCNycsJ2N1cmFycm0nOidcXHUyOTNDJywnY3VybHllcXByZWMnOidcXHUyMkRFJywnY3VybHllcXN1Y2MnOidcXHUyMkRGJywnY3VybHl2ZWUnOidcXHUyMkNFJywnY3VybHl3ZWRnZSc6J1xcdTIyQ0YnLCdjdXJyZW4nOidcXHhBNCcsJ2N1cnZlYXJyb3dsZWZ0JzonXFx1MjFCNicsJ2N1cnZlYXJyb3dyaWdodCc6J1xcdTIxQjcnLCdjdXZlZSc6J1xcdTIyQ0UnLCdjdXdlZCc6J1xcdTIyQ0YnLCdjd2NvbmludCc6J1xcdTIyMzInLCdjd2ludCc6J1xcdTIyMzEnLCdjeWxjdHknOidcXHUyMzJEJywnZGFnZ2VyJzonXFx1MjAyMCcsJ0RhZ2dlcic6J1xcdTIwMjEnLCdkYWxldGgnOidcXHUyMTM4JywnZGFycic6J1xcdTIxOTMnLCdkQXJyJzonXFx1MjFEMycsJ0RhcnInOidcXHUyMUExJywnZGFzaCc6J1xcdTIwMTAnLCdkYXNodic6J1xcdTIyQTMnLCdEYXNodic6J1xcdTJBRTQnLCdkYmthcm93JzonXFx1MjkwRicsJ2RibGFjJzonXFx1MDJERCcsJ2RjYXJvbic6J1xcdTAxMEYnLCdEY2Fyb24nOidcXHUwMTBFJywnZGN5JzonXFx1MDQzNCcsJ0RjeSc6J1xcdTA0MTQnLCdkZCc6J1xcdTIxNDYnLCdERCc6J1xcdTIxNDUnLCdkZGFnZ2VyJzonXFx1MjAyMScsJ2RkYXJyJzonXFx1MjFDQScsJ0REb3RyYWhkJzonXFx1MjkxMScsJ2Rkb3RzZXEnOidcXHUyQTc3JywnZGVnJzonXFx4QjAnLCdEZWwnOidcXHUyMjA3JywnZGVsdGEnOidcXHUwM0I0JywnRGVsdGEnOidcXHUwMzk0JywnZGVtcHR5dic6J1xcdTI5QjEnLCdkZmlzaHQnOidcXHUyOTdGJywnZGZyJzonXFx1RDgzNVxcdUREMjEnLCdEZnInOidcXHVEODM1XFx1REQwNycsJ2RIYXInOidcXHUyOTY1JywnZGhhcmwnOidcXHUyMUMzJywnZGhhcnInOidcXHUyMUMyJywnRGlhY3JpdGljYWxBY3V0ZSc6J1xceEI0JywnRGlhY3JpdGljYWxEb3QnOidcXHUwMkQ5JywnRGlhY3JpdGljYWxEb3VibGVBY3V0ZSc6J1xcdTAyREQnLCdEaWFjcml0aWNhbEdyYXZlJzonYCcsJ0RpYWNyaXRpY2FsVGlsZGUnOidcXHUwMkRDJywnZGlhbSc6J1xcdTIyQzQnLCdkaWFtb25kJzonXFx1MjJDNCcsJ0RpYW1vbmQnOidcXHUyMkM0JywnZGlhbW9uZHN1aXQnOidcXHUyNjY2JywnZGlhbXMnOidcXHUyNjY2JywnZGllJzonXFx4QTgnLCdEaWZmZXJlbnRpYWxEJzonXFx1MjE0NicsJ2RpZ2FtbWEnOidcXHUwM0REJywnZGlzaW4nOidcXHUyMkYyJywnZGl2JzonXFx4RjcnLCdkaXZpZGUnOidcXHhGNycsJ2RpdmlkZW9udGltZXMnOidcXHUyMkM3JywnZGl2b254JzonXFx1MjJDNycsJ2RqY3knOidcXHUwNDUyJywnREpjeSc6J1xcdTA0MDInLCdkbGNvcm4nOidcXHUyMzFFJywnZGxjcm9wJzonXFx1MjMwRCcsJ2RvbGxhcic6JyQnLCdkb3BmJzonXFx1RDgzNVxcdURENTUnLCdEb3BmJzonXFx1RDgzNVxcdUREM0InLCdkb3QnOidcXHUwMkQ5JywnRG90JzonXFx4QTgnLCdEb3REb3QnOidcXHUyMERDJywnZG90ZXEnOidcXHUyMjUwJywnZG90ZXFkb3QnOidcXHUyMjUxJywnRG90RXF1YWwnOidcXHUyMjUwJywnZG90bWludXMnOidcXHUyMjM4JywnZG90cGx1cyc6J1xcdTIyMTQnLCdkb3RzcXVhcmUnOidcXHUyMkExJywnZG91YmxlYmFyd2VkZ2UnOidcXHUyMzA2JywnRG91YmxlQ29udG91ckludGVncmFsJzonXFx1MjIyRicsJ0RvdWJsZURvdCc6J1xceEE4JywnRG91YmxlRG93bkFycm93JzonXFx1MjFEMycsJ0RvdWJsZUxlZnRBcnJvdyc6J1xcdTIxRDAnLCdEb3VibGVMZWZ0UmlnaHRBcnJvdyc6J1xcdTIxRDQnLCdEb3VibGVMZWZ0VGVlJzonXFx1MkFFNCcsJ0RvdWJsZUxvbmdMZWZ0QXJyb3cnOidcXHUyN0Y4JywnRG91YmxlTG9uZ0xlZnRSaWdodEFycm93JzonXFx1MjdGQScsJ0RvdWJsZUxvbmdSaWdodEFycm93JzonXFx1MjdGOScsJ0RvdWJsZVJpZ2h0QXJyb3cnOidcXHUyMUQyJywnRG91YmxlUmlnaHRUZWUnOidcXHUyMkE4JywnRG91YmxlVXBBcnJvdyc6J1xcdTIxRDEnLCdEb3VibGVVcERvd25BcnJvdyc6J1xcdTIxRDUnLCdEb3VibGVWZXJ0aWNhbEJhcic6J1xcdTIyMjUnLCdkb3duYXJyb3cnOidcXHUyMTkzJywnRG93bmFycm93JzonXFx1MjFEMycsJ0Rvd25BcnJvdyc6J1xcdTIxOTMnLCdEb3duQXJyb3dCYXInOidcXHUyOTEzJywnRG93bkFycm93VXBBcnJvdyc6J1xcdTIxRjUnLCdEb3duQnJldmUnOidcXHUwMzExJywnZG93bmRvd25hcnJvd3MnOidcXHUyMUNBJywnZG93bmhhcnBvb25sZWZ0JzonXFx1MjFDMycsJ2Rvd25oYXJwb29ucmlnaHQnOidcXHUyMUMyJywnRG93bkxlZnRSaWdodFZlY3Rvcic6J1xcdTI5NTAnLCdEb3duTGVmdFRlZVZlY3Rvcic6J1xcdTI5NUUnLCdEb3duTGVmdFZlY3Rvcic6J1xcdTIxQkQnLCdEb3duTGVmdFZlY3RvckJhcic6J1xcdTI5NTYnLCdEb3duUmlnaHRUZWVWZWN0b3InOidcXHUyOTVGJywnRG93blJpZ2h0VmVjdG9yJzonXFx1MjFDMScsJ0Rvd25SaWdodFZlY3RvckJhcic6J1xcdTI5NTcnLCdEb3duVGVlJzonXFx1MjJBNCcsJ0Rvd25UZWVBcnJvdyc6J1xcdTIxQTcnLCdkcmJrYXJvdyc6J1xcdTI5MTAnLCdkcmNvcm4nOidcXHUyMzFGJywnZHJjcm9wJzonXFx1MjMwQycsJ2RzY3InOidcXHVEODM1XFx1RENCOScsJ0RzY3InOidcXHVEODM1XFx1REM5RicsJ2RzY3knOidcXHUwNDU1JywnRFNjeSc6J1xcdTA0MDUnLCdkc29sJzonXFx1MjlGNicsJ2RzdHJvayc6J1xcdTAxMTEnLCdEc3Ryb2snOidcXHUwMTEwJywnZHRkb3QnOidcXHUyMkYxJywnZHRyaSc6J1xcdTI1QkYnLCdkdHJpZic6J1xcdTI1QkUnLCdkdWFycic6J1xcdTIxRjUnLCdkdWhhcic6J1xcdTI5NkYnLCdkd2FuZ2xlJzonXFx1MjlBNicsJ2R6Y3knOidcXHUwNDVGJywnRFpjeSc6J1xcdTA0MEYnLCdkemlncmFycic6J1xcdTI3RkYnLCdlYWN1dGUnOidcXHhFOScsJ0VhY3V0ZSc6J1xceEM5JywnZWFzdGVyJzonXFx1MkE2RScsJ2VjYXJvbic6J1xcdTAxMUInLCdFY2Fyb24nOidcXHUwMTFBJywnZWNpcic6J1xcdTIyNTYnLCdlY2lyYyc6J1xceEVBJywnRWNpcmMnOidcXHhDQScsJ2Vjb2xvbic6J1xcdTIyNTUnLCdlY3knOidcXHUwNDREJywnRWN5JzonXFx1MDQyRCcsJ2VERG90JzonXFx1MkE3NycsJ2Vkb3QnOidcXHUwMTE3JywnZURvdCc6J1xcdTIyNTEnLCdFZG90JzonXFx1MDExNicsJ2VlJzonXFx1MjE0NycsJ2VmRG90JzonXFx1MjI1MicsJ2Vmcic6J1xcdUQ4MzVcXHVERDIyJywnRWZyJzonXFx1RDgzNVxcdUREMDgnLCdlZyc6J1xcdTJBOUEnLCdlZ3JhdmUnOidcXHhFOCcsJ0VncmF2ZSc6J1xceEM4JywnZWdzJzonXFx1MkE5NicsJ2Vnc2RvdCc6J1xcdTJBOTgnLCdlbCc6J1xcdTJBOTknLCdFbGVtZW50JzonXFx1MjIwOCcsJ2VsaW50ZXJzJzonXFx1MjNFNycsJ2VsbCc6J1xcdTIxMTMnLCdlbHMnOidcXHUyQTk1JywnZWxzZG90JzonXFx1MkE5NycsJ2VtYWNyJzonXFx1MDExMycsJ0VtYWNyJzonXFx1MDExMicsJ2VtcHR5JzonXFx1MjIwNScsJ2VtcHR5c2V0JzonXFx1MjIwNScsJ0VtcHR5U21hbGxTcXVhcmUnOidcXHUyNUZCJywnZW1wdHl2JzonXFx1MjIwNScsJ0VtcHR5VmVyeVNtYWxsU3F1YXJlJzonXFx1MjVBQicsJ2Vtc3AnOidcXHUyMDAzJywnZW1zcDEzJzonXFx1MjAwNCcsJ2Vtc3AxNCc6J1xcdTIwMDUnLCdlbmcnOidcXHUwMTRCJywnRU5HJzonXFx1MDE0QScsJ2Vuc3AnOidcXHUyMDAyJywnZW9nb24nOidcXHUwMTE5JywnRW9nb24nOidcXHUwMTE4JywnZW9wZic6J1xcdUQ4MzVcXHVERDU2JywnRW9wZic6J1xcdUQ4MzVcXHVERDNDJywnZXBhcic6J1xcdTIyRDUnLCdlcGFyc2wnOidcXHUyOUUzJywnZXBsdXMnOidcXHUyQTcxJywnZXBzaSc6J1xcdTAzQjUnLCdlcHNpbG9uJzonXFx1MDNCNScsJ0Vwc2lsb24nOidcXHUwMzk1JywnZXBzaXYnOidcXHUwM0Y1JywnZXFjaXJjJzonXFx1MjI1NicsJ2VxY29sb24nOidcXHUyMjU1JywnZXFzaW0nOidcXHUyMjQyJywnZXFzbGFudGd0cic6J1xcdTJBOTYnLCdlcXNsYW50bGVzcyc6J1xcdTJBOTUnLCdFcXVhbCc6J1xcdTJBNzUnLCdlcXVhbHMnOic9JywnRXF1YWxUaWxkZSc6J1xcdTIyNDInLCdlcXVlc3QnOidcXHUyMjVGJywnRXF1aWxpYnJpdW0nOidcXHUyMUNDJywnZXF1aXYnOidcXHUyMjYxJywnZXF1aXZERCc6J1xcdTJBNzgnLCdlcXZwYXJzbCc6J1xcdTI5RTUnLCdlcmFycic6J1xcdTI5NzEnLCdlckRvdCc6J1xcdTIyNTMnLCdlc2NyJzonXFx1MjEyRicsJ0VzY3InOidcXHUyMTMwJywnZXNkb3QnOidcXHUyMjUwJywnZXNpbSc6J1xcdTIyNDInLCdFc2ltJzonXFx1MkE3MycsJ2V0YSc6J1xcdTAzQjcnLCdFdGEnOidcXHUwMzk3JywnZXRoJzonXFx4RjAnLCdFVEgnOidcXHhEMCcsJ2V1bWwnOidcXHhFQicsJ0V1bWwnOidcXHhDQicsJ2V1cm8nOidcXHUyMEFDJywnZXhjbCc6JyEnLCdleGlzdCc6J1xcdTIyMDMnLCdFeGlzdHMnOidcXHUyMjAzJywnZXhwZWN0YXRpb24nOidcXHUyMTMwJywnZXhwb25lbnRpYWxlJzonXFx1MjE0NycsJ0V4cG9uZW50aWFsRSc6J1xcdTIxNDcnLCdmYWxsaW5nZG90c2VxJzonXFx1MjI1MicsJ2ZjeSc6J1xcdTA0NDQnLCdGY3knOidcXHUwNDI0JywnZmVtYWxlJzonXFx1MjY0MCcsJ2ZmaWxpZyc6J1xcdUZCMDMnLCdmZmxpZyc6J1xcdUZCMDAnLCdmZmxsaWcnOidcXHVGQjA0JywnZmZyJzonXFx1RDgzNVxcdUREMjMnLCdGZnInOidcXHVEODM1XFx1REQwOScsJ2ZpbGlnJzonXFx1RkIwMScsJ0ZpbGxlZFNtYWxsU3F1YXJlJzonXFx1MjVGQycsJ0ZpbGxlZFZlcnlTbWFsbFNxdWFyZSc6J1xcdTI1QUEnLCdmamxpZyc6J2ZqJywnZmxhdCc6J1xcdTI2NkQnLCdmbGxpZyc6J1xcdUZCMDInLCdmbHRucyc6J1xcdTI1QjEnLCdmbm9mJzonXFx1MDE5MicsJ2ZvcGYnOidcXHVEODM1XFx1REQ1NycsJ0ZvcGYnOidcXHVEODM1XFx1REQzRCcsJ2ZvcmFsbCc6J1xcdTIyMDAnLCdGb3JBbGwnOidcXHUyMjAwJywnZm9yayc6J1xcdTIyRDQnLCdmb3Jrdic6J1xcdTJBRDknLCdGb3VyaWVydHJmJzonXFx1MjEzMScsJ2ZwYXJ0aW50JzonXFx1MkEwRCcsJ2ZyYWMxMic6J1xceEJEJywnZnJhYzEzJzonXFx1MjE1MycsJ2ZyYWMxNCc6J1xceEJDJywnZnJhYzE1JzonXFx1MjE1NScsJ2ZyYWMxNic6J1xcdTIxNTknLCdmcmFjMTgnOidcXHUyMTVCJywnZnJhYzIzJzonXFx1MjE1NCcsJ2ZyYWMyNSc6J1xcdTIxNTYnLCdmcmFjMzQnOidcXHhCRScsJ2ZyYWMzNSc6J1xcdTIxNTcnLCdmcmFjMzgnOidcXHUyMTVDJywnZnJhYzQ1JzonXFx1MjE1OCcsJ2ZyYWM1Nic6J1xcdTIxNUEnLCdmcmFjNTgnOidcXHUyMTVEJywnZnJhYzc4JzonXFx1MjE1RScsJ2ZyYXNsJzonXFx1MjA0NCcsJ2Zyb3duJzonXFx1MjMyMicsJ2ZzY3InOidcXHVEODM1XFx1RENCQicsJ0ZzY3InOidcXHUyMTMxJywnZ2FjdXRlJzonXFx1MDFGNScsJ2dhbW1hJzonXFx1MDNCMycsJ0dhbW1hJzonXFx1MDM5MycsJ2dhbW1hZCc6J1xcdTAzREQnLCdHYW1tYWQnOidcXHUwM0RDJywnZ2FwJzonXFx1MkE4NicsJ2dicmV2ZSc6J1xcdTAxMUYnLCdHYnJldmUnOidcXHUwMTFFJywnR2NlZGlsJzonXFx1MDEyMicsJ2djaXJjJzonXFx1MDExRCcsJ0djaXJjJzonXFx1MDExQycsJ2djeSc6J1xcdTA0MzMnLCdHY3knOidcXHUwNDEzJywnZ2RvdCc6J1xcdTAxMjEnLCdHZG90JzonXFx1MDEyMCcsJ2dlJzonXFx1MjI2NScsJ2dFJzonXFx1MjI2NycsJ2dlbCc6J1xcdTIyREInLCdnRWwnOidcXHUyQThDJywnZ2VxJzonXFx1MjI2NScsJ2dlcXEnOidcXHUyMjY3JywnZ2Vxc2xhbnQnOidcXHUyQTdFJywnZ2VzJzonXFx1MkE3RScsJ2dlc2NjJzonXFx1MkFBOScsJ2dlc2RvdCc6J1xcdTJBODAnLCdnZXNkb3RvJzonXFx1MkE4MicsJ2dlc2RvdG9sJzonXFx1MkE4NCcsJ2dlc2wnOidcXHUyMkRCXFx1RkUwMCcsJ2dlc2xlcyc6J1xcdTJBOTQnLCdnZnInOidcXHVEODM1XFx1REQyNCcsJ0dmcic6J1xcdUQ4MzVcXHVERDBBJywnZ2cnOidcXHUyMjZCJywnR2cnOidcXHUyMkQ5JywnZ2dnJzonXFx1MjJEOScsJ2dpbWVsJzonXFx1MjEzNycsJ2dqY3knOidcXHUwNDUzJywnR0pjeSc6J1xcdTA0MDMnLCdnbCc6J1xcdTIyNzcnLCdnbGEnOidcXHUyQUE1JywnZ2xFJzonXFx1MkE5MicsJ2dsaic6J1xcdTJBQTQnLCdnbmFwJzonXFx1MkE4QScsJ2duYXBwcm94JzonXFx1MkE4QScsJ2duZSc6J1xcdTJBODgnLCdnbkUnOidcXHUyMjY5JywnZ25lcSc6J1xcdTJBODgnLCdnbmVxcSc6J1xcdTIyNjknLCdnbnNpbSc6J1xcdTIyRTcnLCdnb3BmJzonXFx1RDgzNVxcdURENTgnLCdHb3BmJzonXFx1RDgzNVxcdUREM0UnLCdncmF2ZSc6J2AnLCdHcmVhdGVyRXF1YWwnOidcXHUyMjY1JywnR3JlYXRlckVxdWFsTGVzcyc6J1xcdTIyREInLCdHcmVhdGVyRnVsbEVxdWFsJzonXFx1MjI2NycsJ0dyZWF0ZXJHcmVhdGVyJzonXFx1MkFBMicsJ0dyZWF0ZXJMZXNzJzonXFx1MjI3NycsJ0dyZWF0ZXJTbGFudEVxdWFsJzonXFx1MkE3RScsJ0dyZWF0ZXJUaWxkZSc6J1xcdTIyNzMnLCdnc2NyJzonXFx1MjEwQScsJ0dzY3InOidcXHVEODM1XFx1RENBMicsJ2dzaW0nOidcXHUyMjczJywnZ3NpbWUnOidcXHUyQThFJywnZ3NpbWwnOidcXHUyQTkwJywnZ3QnOic+JywnR3QnOidcXHUyMjZCJywnR1QnOic+JywnZ3RjYyc6J1xcdTJBQTcnLCdndGNpcic6J1xcdTJBN0EnLCdndGRvdCc6J1xcdTIyRDcnLCdndGxQYXInOidcXHUyOTk1JywnZ3RxdWVzdCc6J1xcdTJBN0MnLCdndHJhcHByb3gnOidcXHUyQTg2JywnZ3RyYXJyJzonXFx1Mjk3OCcsJ2d0cmRvdCc6J1xcdTIyRDcnLCdndHJlcWxlc3MnOidcXHUyMkRCJywnZ3RyZXFxbGVzcyc6J1xcdTJBOEMnLCdndHJsZXNzJzonXFx1MjI3NycsJ2d0cnNpbSc6J1xcdTIyNzMnLCdndmVydG5lcXEnOidcXHUyMjY5XFx1RkUwMCcsJ2d2bkUnOidcXHUyMjY5XFx1RkUwMCcsJ0hhY2VrJzonXFx1MDJDNycsJ2hhaXJzcCc6J1xcdTIwMEEnLCdoYWxmJzonXFx4QkQnLCdoYW1pbHQnOidcXHUyMTBCJywnaGFyZGN5JzonXFx1MDQ0QScsJ0hBUkRjeSc6J1xcdTA0MkEnLCdoYXJyJzonXFx1MjE5NCcsJ2hBcnInOidcXHUyMUQ0JywnaGFycmNpcic6J1xcdTI5NDgnLCdoYXJydyc6J1xcdTIxQUQnLCdIYXQnOideJywnaGJhcic6J1xcdTIxMEYnLCdoY2lyYyc6J1xcdTAxMjUnLCdIY2lyYyc6J1xcdTAxMjQnLCdoZWFydHMnOidcXHUyNjY1JywnaGVhcnRzdWl0JzonXFx1MjY2NScsJ2hlbGxpcCc6J1xcdTIwMjYnLCdoZXJjb24nOidcXHUyMkI5JywnaGZyJzonXFx1RDgzNVxcdUREMjUnLCdIZnInOidcXHUyMTBDJywnSGlsYmVydFNwYWNlJzonXFx1MjEwQicsJ2hrc2Vhcm93JzonXFx1MjkyNScsJ2hrc3dhcm93JzonXFx1MjkyNicsJ2hvYXJyJzonXFx1MjFGRicsJ2hvbXRodCc6J1xcdTIyM0InLCdob29rbGVmdGFycm93JzonXFx1MjFBOScsJ2hvb2tyaWdodGFycm93JzonXFx1MjFBQScsJ2hvcGYnOidcXHVEODM1XFx1REQ1OScsJ0hvcGYnOidcXHUyMTBEJywnaG9yYmFyJzonXFx1MjAxNScsJ0hvcml6b250YWxMaW5lJzonXFx1MjUwMCcsJ2hzY3InOidcXHVEODM1XFx1RENCRCcsJ0hzY3InOidcXHUyMTBCJywnaHNsYXNoJzonXFx1MjEwRicsJ2hzdHJvayc6J1xcdTAxMjcnLCdIc3Ryb2snOidcXHUwMTI2JywnSHVtcERvd25IdW1wJzonXFx1MjI0RScsJ0h1bXBFcXVhbCc6J1xcdTIyNEYnLCdoeWJ1bGwnOidcXHUyMDQzJywnaHlwaGVuJzonXFx1MjAxMCcsJ2lhY3V0ZSc6J1xceEVEJywnSWFjdXRlJzonXFx4Q0QnLCdpYyc6J1xcdTIwNjMnLCdpY2lyYyc6J1xceEVFJywnSWNpcmMnOidcXHhDRScsJ2ljeSc6J1xcdTA0MzgnLCdJY3knOidcXHUwNDE4JywnSWRvdCc6J1xcdTAxMzAnLCdpZWN5JzonXFx1MDQzNScsJ0lFY3knOidcXHUwNDE1JywnaWV4Y2wnOidcXHhBMScsJ2lmZic6J1xcdTIxRDQnLCdpZnInOidcXHVEODM1XFx1REQyNicsJ0lmcic6J1xcdTIxMTEnLCdpZ3JhdmUnOidcXHhFQycsJ0lncmF2ZSc6J1xceENDJywnaWknOidcXHUyMTQ4JywnaWlpaW50JzonXFx1MkEwQycsJ2lpaW50JzonXFx1MjIyRCcsJ2lpbmZpbic6J1xcdTI5REMnLCdpaW90YSc6J1xcdTIxMjknLCdpamxpZyc6J1xcdTAxMzMnLCdJSmxpZyc6J1xcdTAxMzInLCdJbSc6J1xcdTIxMTEnLCdpbWFjcic6J1xcdTAxMkInLCdJbWFjcic6J1xcdTAxMkEnLCdpbWFnZSc6J1xcdTIxMTEnLCdJbWFnaW5hcnlJJzonXFx1MjE0OCcsJ2ltYWdsaW5lJzonXFx1MjExMCcsJ2ltYWdwYXJ0JzonXFx1MjExMScsJ2ltYXRoJzonXFx1MDEzMScsJ2ltb2YnOidcXHUyMkI3JywnaW1wZWQnOidcXHUwMUI1JywnSW1wbGllcyc6J1xcdTIxRDInLCdpbic6J1xcdTIyMDgnLCdpbmNhcmUnOidcXHUyMTA1JywnaW5maW4nOidcXHUyMjFFJywnaW5maW50aWUnOidcXHUyOUREJywnaW5vZG90JzonXFx1MDEzMScsJ2ludCc6J1xcdTIyMkInLCdJbnQnOidcXHUyMjJDJywnaW50Y2FsJzonXFx1MjJCQScsJ2ludGVnZXJzJzonXFx1MjEyNCcsJ0ludGVncmFsJzonXFx1MjIyQicsJ2ludGVyY2FsJzonXFx1MjJCQScsJ0ludGVyc2VjdGlvbic6J1xcdTIyQzInLCdpbnRsYXJoayc6J1xcdTJBMTcnLCdpbnRwcm9kJzonXFx1MkEzQycsJ0ludmlzaWJsZUNvbW1hJzonXFx1MjA2MycsJ0ludmlzaWJsZVRpbWVzJzonXFx1MjA2MicsJ2lvY3knOidcXHUwNDUxJywnSU9jeSc6J1xcdTA0MDEnLCdpb2dvbic6J1xcdTAxMkYnLCdJb2dvbic6J1xcdTAxMkUnLCdpb3BmJzonXFx1RDgzNVxcdURENUEnLCdJb3BmJzonXFx1RDgzNVxcdURENDAnLCdpb3RhJzonXFx1MDNCOScsJ0lvdGEnOidcXHUwMzk5JywnaXByb2QnOidcXHUyQTNDJywnaXF1ZXN0JzonXFx4QkYnLCdpc2NyJzonXFx1RDgzNVxcdURDQkUnLCdJc2NyJzonXFx1MjExMCcsJ2lzaW4nOidcXHUyMjA4JywnaXNpbmRvdCc6J1xcdTIyRjUnLCdpc2luRSc6J1xcdTIyRjknLCdpc2lucyc6J1xcdTIyRjQnLCdpc2luc3YnOidcXHUyMkYzJywnaXNpbnYnOidcXHUyMjA4JywnaXQnOidcXHUyMDYyJywnaXRpbGRlJzonXFx1MDEyOScsJ0l0aWxkZSc6J1xcdTAxMjgnLCdpdWtjeSc6J1xcdTA0NTYnLCdJdWtjeSc6J1xcdTA0MDYnLCdpdW1sJzonXFx4RUYnLCdJdW1sJzonXFx4Q0YnLCdqY2lyYyc6J1xcdTAxMzUnLCdKY2lyYyc6J1xcdTAxMzQnLCdqY3knOidcXHUwNDM5JywnSmN5JzonXFx1MDQxOScsJ2pmcic6J1xcdUQ4MzVcXHVERDI3JywnSmZyJzonXFx1RDgzNVxcdUREMEQnLCdqbWF0aCc6J1xcdTAyMzcnLCdqb3BmJzonXFx1RDgzNVxcdURENUInLCdKb3BmJzonXFx1RDgzNVxcdURENDEnLCdqc2NyJzonXFx1RDgzNVxcdURDQkYnLCdKc2NyJzonXFx1RDgzNVxcdURDQTUnLCdqc2VyY3knOidcXHUwNDU4JywnSnNlcmN5JzonXFx1MDQwOCcsJ2p1a2N5JzonXFx1MDQ1NCcsJ0p1a2N5JzonXFx1MDQwNCcsJ2thcHBhJzonXFx1MDNCQScsJ0thcHBhJzonXFx1MDM5QScsJ2thcHBhdic6J1xcdTAzRjAnLCdrY2VkaWwnOidcXHUwMTM3JywnS2NlZGlsJzonXFx1MDEzNicsJ2tjeSc6J1xcdTA0M0EnLCdLY3knOidcXHUwNDFBJywna2ZyJzonXFx1RDgzNVxcdUREMjgnLCdLZnInOidcXHVEODM1XFx1REQwRScsJ2tncmVlbic6J1xcdTAxMzgnLCdraGN5JzonXFx1MDQ0NScsJ0tIY3knOidcXHUwNDI1Jywna2pjeSc6J1xcdTA0NUMnLCdLSmN5JzonXFx1MDQwQycsJ2tvcGYnOidcXHVEODM1XFx1REQ1QycsJ0tvcGYnOidcXHVEODM1XFx1REQ0MicsJ2tzY3InOidcXHVEODM1XFx1RENDMCcsJ0tzY3InOidcXHVEODM1XFx1RENBNicsJ2xBYXJyJzonXFx1MjFEQScsJ2xhY3V0ZSc6J1xcdTAxM0EnLCdMYWN1dGUnOidcXHUwMTM5JywnbGFlbXB0eXYnOidcXHUyOUI0JywnbGFncmFuJzonXFx1MjExMicsJ2xhbWJkYSc6J1xcdTAzQkInLCdMYW1iZGEnOidcXHUwMzlCJywnbGFuZyc6J1xcdTI3RTgnLCdMYW5nJzonXFx1MjdFQScsJ2xhbmdkJzonXFx1Mjk5MScsJ2xhbmdsZSc6J1xcdTI3RTgnLCdsYXAnOidcXHUyQTg1JywnTGFwbGFjZXRyZic6J1xcdTIxMTInLCdsYXF1byc6J1xceEFCJywnbGFycic6J1xcdTIxOTAnLCdsQXJyJzonXFx1MjFEMCcsJ0xhcnInOidcXHUyMTlFJywnbGFycmInOidcXHUyMUU0JywnbGFycmJmcyc6J1xcdTI5MUYnLCdsYXJyZnMnOidcXHUyOTFEJywnbGFycmhrJzonXFx1MjFBOScsJ2xhcnJscCc6J1xcdTIxQUInLCdsYXJycGwnOidcXHUyOTM5JywnbGFycnNpbSc6J1xcdTI5NzMnLCdsYXJydGwnOidcXHUyMUEyJywnbGF0JzonXFx1MkFBQicsJ2xhdGFpbCc6J1xcdTI5MTknLCdsQXRhaWwnOidcXHUyOTFCJywnbGF0ZSc6J1xcdTJBQUQnLCdsYXRlcyc6J1xcdTJBQURcXHVGRTAwJywnbGJhcnInOidcXHUyOTBDJywnbEJhcnInOidcXHUyOTBFJywnbGJicmsnOidcXHUyNzcyJywnbGJyYWNlJzoneycsJ2xicmFjayc6J1snLCdsYnJrZSc6J1xcdTI5OEInLCdsYnJrc2xkJzonXFx1Mjk4RicsJ2xicmtzbHUnOidcXHUyOThEJywnbGNhcm9uJzonXFx1MDEzRScsJ0xjYXJvbic6J1xcdTAxM0QnLCdsY2VkaWwnOidcXHUwMTNDJywnTGNlZGlsJzonXFx1MDEzQicsJ2xjZWlsJzonXFx1MjMwOCcsJ2xjdWInOid7JywnbGN5JzonXFx1MDQzQicsJ0xjeSc6J1xcdTA0MUInLCdsZGNhJzonXFx1MjkzNicsJ2xkcXVvJzonXFx1MjAxQycsJ2xkcXVvcic6J1xcdTIwMUUnLCdsZHJkaGFyJzonXFx1Mjk2NycsJ2xkcnVzaGFyJzonXFx1Mjk0QicsJ2xkc2gnOidcXHUyMUIyJywnbGUnOidcXHUyMjY0JywnbEUnOidcXHUyMjY2JywnTGVmdEFuZ2xlQnJhY2tldCc6J1xcdTI3RTgnLCdsZWZ0YXJyb3cnOidcXHUyMTkwJywnTGVmdGFycm93JzonXFx1MjFEMCcsJ0xlZnRBcnJvdyc6J1xcdTIxOTAnLCdMZWZ0QXJyb3dCYXInOidcXHUyMUU0JywnTGVmdEFycm93UmlnaHRBcnJvdyc6J1xcdTIxQzYnLCdsZWZ0YXJyb3d0YWlsJzonXFx1MjFBMicsJ0xlZnRDZWlsaW5nJzonXFx1MjMwOCcsJ0xlZnREb3VibGVCcmFja2V0JzonXFx1MjdFNicsJ0xlZnREb3duVGVlVmVjdG9yJzonXFx1Mjk2MScsJ0xlZnREb3duVmVjdG9yJzonXFx1MjFDMycsJ0xlZnREb3duVmVjdG9yQmFyJzonXFx1Mjk1OScsJ0xlZnRGbG9vcic6J1xcdTIzMEEnLCdsZWZ0aGFycG9vbmRvd24nOidcXHUyMUJEJywnbGVmdGhhcnBvb251cCc6J1xcdTIxQkMnLCdsZWZ0bGVmdGFycm93cyc6J1xcdTIxQzcnLCdsZWZ0cmlnaHRhcnJvdyc6J1xcdTIxOTQnLCdMZWZ0cmlnaHRhcnJvdyc6J1xcdTIxRDQnLCdMZWZ0UmlnaHRBcnJvdyc6J1xcdTIxOTQnLCdsZWZ0cmlnaHRhcnJvd3MnOidcXHUyMUM2JywnbGVmdHJpZ2h0aGFycG9vbnMnOidcXHUyMUNCJywnbGVmdHJpZ2h0c3F1aWdhcnJvdyc6J1xcdTIxQUQnLCdMZWZ0UmlnaHRWZWN0b3InOidcXHUyOTRFJywnTGVmdFRlZSc6J1xcdTIyQTMnLCdMZWZ0VGVlQXJyb3cnOidcXHUyMUE0JywnTGVmdFRlZVZlY3Rvcic6J1xcdTI5NUEnLCdsZWZ0dGhyZWV0aW1lcyc6J1xcdTIyQ0InLCdMZWZ0VHJpYW5nbGUnOidcXHUyMkIyJywnTGVmdFRyaWFuZ2xlQmFyJzonXFx1MjlDRicsJ0xlZnRUcmlhbmdsZUVxdWFsJzonXFx1MjJCNCcsJ0xlZnRVcERvd25WZWN0b3InOidcXHUyOTUxJywnTGVmdFVwVGVlVmVjdG9yJzonXFx1Mjk2MCcsJ0xlZnRVcFZlY3Rvcic6J1xcdTIxQkYnLCdMZWZ0VXBWZWN0b3JCYXInOidcXHUyOTU4JywnTGVmdFZlY3Rvcic6J1xcdTIxQkMnLCdMZWZ0VmVjdG9yQmFyJzonXFx1Mjk1MicsJ2xlZyc6J1xcdTIyREEnLCdsRWcnOidcXHUyQThCJywnbGVxJzonXFx1MjI2NCcsJ2xlcXEnOidcXHUyMjY2JywnbGVxc2xhbnQnOidcXHUyQTdEJywnbGVzJzonXFx1MkE3RCcsJ2xlc2NjJzonXFx1MkFBOCcsJ2xlc2RvdCc6J1xcdTJBN0YnLCdsZXNkb3RvJzonXFx1MkE4MScsJ2xlc2RvdG9yJzonXFx1MkE4MycsJ2xlc2cnOidcXHUyMkRBXFx1RkUwMCcsJ2xlc2dlcyc6J1xcdTJBOTMnLCdsZXNzYXBwcm94JzonXFx1MkE4NScsJ2xlc3Nkb3QnOidcXHUyMkQ2JywnbGVzc2VxZ3RyJzonXFx1MjJEQScsJ2xlc3NlcXFndHInOidcXHUyQThCJywnTGVzc0VxdWFsR3JlYXRlcic6J1xcdTIyREEnLCdMZXNzRnVsbEVxdWFsJzonXFx1MjI2NicsJ0xlc3NHcmVhdGVyJzonXFx1MjI3NicsJ2xlc3NndHInOidcXHUyMjc2JywnTGVzc0xlc3MnOidcXHUyQUExJywnbGVzc3NpbSc6J1xcdTIyNzInLCdMZXNzU2xhbnRFcXVhbCc6J1xcdTJBN0QnLCdMZXNzVGlsZGUnOidcXHUyMjcyJywnbGZpc2h0JzonXFx1Mjk3QycsJ2xmbG9vcic6J1xcdTIzMEEnLCdsZnInOidcXHVEODM1XFx1REQyOScsJ0xmcic6J1xcdUQ4MzVcXHVERDBGJywnbGcnOidcXHUyMjc2JywnbGdFJzonXFx1MkE5MScsJ2xIYXInOidcXHUyOTYyJywnbGhhcmQnOidcXHUyMUJEJywnbGhhcnUnOidcXHUyMUJDJywnbGhhcnVsJzonXFx1Mjk2QScsJ2xoYmxrJzonXFx1MjU4NCcsJ2xqY3knOidcXHUwNDU5JywnTEpjeSc6J1xcdTA0MDknLCdsbCc6J1xcdTIyNkEnLCdMbCc6J1xcdTIyRDgnLCdsbGFycic6J1xcdTIxQzcnLCdsbGNvcm5lcic6J1xcdTIzMUUnLCdMbGVmdGFycm93JzonXFx1MjFEQScsJ2xsaGFyZCc6J1xcdTI5NkInLCdsbHRyaSc6J1xcdTI1RkEnLCdsbWlkb3QnOidcXHUwMTQwJywnTG1pZG90JzonXFx1MDEzRicsJ2xtb3VzdCc6J1xcdTIzQjAnLCdsbW91c3RhY2hlJzonXFx1MjNCMCcsJ2xuYXAnOidcXHUyQTg5JywnbG5hcHByb3gnOidcXHUyQTg5JywnbG5lJzonXFx1MkE4NycsJ2xuRSc6J1xcdTIyNjgnLCdsbmVxJzonXFx1MkE4NycsJ2xuZXFxJzonXFx1MjI2OCcsJ2xuc2ltJzonXFx1MjJFNicsJ2xvYW5nJzonXFx1MjdFQycsJ2xvYXJyJzonXFx1MjFGRCcsJ2xvYnJrJzonXFx1MjdFNicsJ2xvbmdsZWZ0YXJyb3cnOidcXHUyN0Y1JywnTG9uZ2xlZnRhcnJvdyc6J1xcdTI3RjgnLCdMb25nTGVmdEFycm93JzonXFx1MjdGNScsJ2xvbmdsZWZ0cmlnaHRhcnJvdyc6J1xcdTI3RjcnLCdMb25nbGVmdHJpZ2h0YXJyb3cnOidcXHUyN0ZBJywnTG9uZ0xlZnRSaWdodEFycm93JzonXFx1MjdGNycsJ2xvbmdtYXBzdG8nOidcXHUyN0ZDJywnbG9uZ3JpZ2h0YXJyb3cnOidcXHUyN0Y2JywnTG9uZ3JpZ2h0YXJyb3cnOidcXHUyN0Y5JywnTG9uZ1JpZ2h0QXJyb3cnOidcXHUyN0Y2JywnbG9vcGFycm93bGVmdCc6J1xcdTIxQUInLCdsb29wYXJyb3dyaWdodCc6J1xcdTIxQUMnLCdsb3Bhcic6J1xcdTI5ODUnLCdsb3BmJzonXFx1RDgzNVxcdURENUQnLCdMb3BmJzonXFx1RDgzNVxcdURENDMnLCdsb3BsdXMnOidcXHUyQTJEJywnbG90aW1lcyc6J1xcdTJBMzQnLCdsb3dhc3QnOidcXHUyMjE3JywnbG93YmFyJzonXycsJ0xvd2VyTGVmdEFycm93JzonXFx1MjE5OScsJ0xvd2VyUmlnaHRBcnJvdyc6J1xcdTIxOTgnLCdsb3onOidcXHUyNUNBJywnbG96ZW5nZSc6J1xcdTI1Q0EnLCdsb3pmJzonXFx1MjlFQicsJ2xwYXInOicoJywnbHBhcmx0JzonXFx1Mjk5MycsJ2xyYXJyJzonXFx1MjFDNicsJ2xyY29ybmVyJzonXFx1MjMxRicsJ2xyaGFyJzonXFx1MjFDQicsJ2xyaGFyZCc6J1xcdTI5NkQnLCdscm0nOidcXHUyMDBFJywnbHJ0cmknOidcXHUyMkJGJywnbHNhcXVvJzonXFx1MjAzOScsJ2xzY3InOidcXHVEODM1XFx1RENDMScsJ0xzY3InOidcXHUyMTEyJywnbHNoJzonXFx1MjFCMCcsJ0xzaCc6J1xcdTIxQjAnLCdsc2ltJzonXFx1MjI3MicsJ2xzaW1lJzonXFx1MkE4RCcsJ2xzaW1nJzonXFx1MkE4RicsJ2xzcWInOidbJywnbHNxdW8nOidcXHUyMDE4JywnbHNxdW9yJzonXFx1MjAxQScsJ2xzdHJvayc6J1xcdTAxNDInLCdMc3Ryb2snOidcXHUwMTQxJywnbHQnOic8JywnTHQnOidcXHUyMjZBJywnTFQnOic8JywnbHRjYyc6J1xcdTJBQTYnLCdsdGNpcic6J1xcdTJBNzknLCdsdGRvdCc6J1xcdTIyRDYnLCdsdGhyZWUnOidcXHUyMkNCJywnbHRpbWVzJzonXFx1MjJDOScsJ2x0bGFycic6J1xcdTI5NzYnLCdsdHF1ZXN0JzonXFx1MkE3QicsJ2x0cmknOidcXHUyNUMzJywnbHRyaWUnOidcXHUyMkI0JywnbHRyaWYnOidcXHUyNUMyJywnbHRyUGFyJzonXFx1Mjk5NicsJ2x1cmRzaGFyJzonXFx1Mjk0QScsJ2x1cnVoYXInOidcXHUyOTY2JywnbHZlcnRuZXFxJzonXFx1MjI2OFxcdUZFMDAnLCdsdm5FJzonXFx1MjI2OFxcdUZFMDAnLCdtYWNyJzonXFx4QUYnLCdtYWxlJzonXFx1MjY0MicsJ21hbHQnOidcXHUyNzIwJywnbWFsdGVzZSc6J1xcdTI3MjAnLCdtYXAnOidcXHUyMUE2JywnTWFwJzonXFx1MjkwNScsJ21hcHN0byc6J1xcdTIxQTYnLCdtYXBzdG9kb3duJzonXFx1MjFBNycsJ21hcHN0b2xlZnQnOidcXHUyMUE0JywnbWFwc3RvdXAnOidcXHUyMUE1JywnbWFya2VyJzonXFx1MjVBRScsJ21jb21tYSc6J1xcdTJBMjknLCdtY3knOidcXHUwNDNDJywnTWN5JzonXFx1MDQxQycsJ21kYXNoJzonXFx1MjAxNCcsJ21ERG90JzonXFx1MjIzQScsJ21lYXN1cmVkYW5nbGUnOidcXHUyMjIxJywnTWVkaXVtU3BhY2UnOidcXHUyMDVGJywnTWVsbGludHJmJzonXFx1MjEzMycsJ21mcic6J1xcdUQ4MzVcXHVERDJBJywnTWZyJzonXFx1RDgzNVxcdUREMTAnLCdtaG8nOidcXHUyMTI3JywnbWljcm8nOidcXHhCNScsJ21pZCc6J1xcdTIyMjMnLCdtaWRhc3QnOicqJywnbWlkY2lyJzonXFx1MkFGMCcsJ21pZGRvdCc6J1xceEI3JywnbWludXMnOidcXHUyMjEyJywnbWludXNiJzonXFx1MjI5RicsJ21pbnVzZCc6J1xcdTIyMzgnLCdtaW51c2R1JzonXFx1MkEyQScsJ01pbnVzUGx1cyc6J1xcdTIyMTMnLCdtbGNwJzonXFx1MkFEQicsJ21sZHInOidcXHUyMDI2JywnbW5wbHVzJzonXFx1MjIxMycsJ21vZGVscyc6J1xcdTIyQTcnLCdtb3BmJzonXFx1RDgzNVxcdURENUUnLCdNb3BmJzonXFx1RDgzNVxcdURENDQnLCdtcCc6J1xcdTIyMTMnLCdtc2NyJzonXFx1RDgzNVxcdURDQzInLCdNc2NyJzonXFx1MjEzMycsJ21zdHBvcyc6J1xcdTIyM0UnLCdtdSc6J1xcdTAzQkMnLCdNdSc6J1xcdTAzOUMnLCdtdWx0aW1hcCc6J1xcdTIyQjgnLCdtdW1hcCc6J1xcdTIyQjgnLCduYWJsYSc6J1xcdTIyMDcnLCduYWN1dGUnOidcXHUwMTQ0JywnTmFjdXRlJzonXFx1MDE0MycsJ25hbmcnOidcXHUyMjIwXFx1MjBEMicsJ25hcCc6J1xcdTIyNDknLCduYXBFJzonXFx1MkE3MFxcdTAzMzgnLCduYXBpZCc6J1xcdTIyNEJcXHUwMzM4JywnbmFwb3MnOidcXHUwMTQ5JywnbmFwcHJveCc6J1xcdTIyNDknLCduYXR1cic6J1xcdTI2NkUnLCduYXR1cmFsJzonXFx1MjY2RScsJ25hdHVyYWxzJzonXFx1MjExNScsJ25ic3AnOidcXHhBMCcsJ25idW1wJzonXFx1MjI0RVxcdTAzMzgnLCduYnVtcGUnOidcXHUyMjRGXFx1MDMzOCcsJ25jYXAnOidcXHUyQTQzJywnbmNhcm9uJzonXFx1MDE0OCcsJ05jYXJvbic6J1xcdTAxNDcnLCduY2VkaWwnOidcXHUwMTQ2JywnTmNlZGlsJzonXFx1MDE0NScsJ25jb25nJzonXFx1MjI0NycsJ25jb25nZG90JzonXFx1MkE2RFxcdTAzMzgnLCduY3VwJzonXFx1MkE0MicsJ25jeSc6J1xcdTA0M0QnLCdOY3knOidcXHUwNDFEJywnbmRhc2gnOidcXHUyMDEzJywnbmUnOidcXHUyMjYwJywnbmVhcmhrJzonXFx1MjkyNCcsJ25lYXJyJzonXFx1MjE5NycsJ25lQXJyJzonXFx1MjFENycsJ25lYXJyb3cnOidcXHUyMTk3JywnbmVkb3QnOidcXHUyMjUwXFx1MDMzOCcsJ05lZ2F0aXZlTWVkaXVtU3BhY2UnOidcXHUyMDBCJywnTmVnYXRpdmVUaGlja1NwYWNlJzonXFx1MjAwQicsJ05lZ2F0aXZlVGhpblNwYWNlJzonXFx1MjAwQicsJ05lZ2F0aXZlVmVyeVRoaW5TcGFjZSc6J1xcdTIwMEInLCduZXF1aXYnOidcXHUyMjYyJywnbmVzZWFyJzonXFx1MjkyOCcsJ25lc2ltJzonXFx1MjI0MlxcdTAzMzgnLCdOZXN0ZWRHcmVhdGVyR3JlYXRlcic6J1xcdTIyNkInLCdOZXN0ZWRMZXNzTGVzcyc6J1xcdTIyNkEnLCdOZXdMaW5lJzonXFxuJywnbmV4aXN0JzonXFx1MjIwNCcsJ25leGlzdHMnOidcXHUyMjA0JywnbmZyJzonXFx1RDgzNVxcdUREMkInLCdOZnInOidcXHVEODM1XFx1REQxMScsJ25nZSc6J1xcdTIyNzEnLCduZ0UnOidcXHUyMjY3XFx1MDMzOCcsJ25nZXEnOidcXHUyMjcxJywnbmdlcXEnOidcXHUyMjY3XFx1MDMzOCcsJ25nZXFzbGFudCc6J1xcdTJBN0VcXHUwMzM4Jywnbmdlcyc6J1xcdTJBN0VcXHUwMzM4JywnbkdnJzonXFx1MjJEOVxcdTAzMzgnLCduZ3NpbSc6J1xcdTIyNzUnLCduZ3QnOidcXHUyMjZGJywnbkd0JzonXFx1MjI2QlxcdTIwRDInLCduZ3RyJzonXFx1MjI2RicsJ25HdHYnOidcXHUyMjZCXFx1MDMzOCcsJ25oYXJyJzonXFx1MjFBRScsJ25oQXJyJzonXFx1MjFDRScsJ25ocGFyJzonXFx1MkFGMicsJ25pJzonXFx1MjIwQicsJ25pcyc6J1xcdTIyRkMnLCduaXNkJzonXFx1MjJGQScsJ25pdic6J1xcdTIyMEInLCduamN5JzonXFx1MDQ1QScsJ05KY3knOidcXHUwNDBBJywnbmxhcnInOidcXHUyMTlBJywnbmxBcnInOidcXHUyMUNEJywnbmxkcic6J1xcdTIwMjUnLCdubGUnOidcXHUyMjcwJywnbmxFJzonXFx1MjI2NlxcdTAzMzgnLCdubGVmdGFycm93JzonXFx1MjE5QScsJ25MZWZ0YXJyb3cnOidcXHUyMUNEJywnbmxlZnRyaWdodGFycm93JzonXFx1MjFBRScsJ25MZWZ0cmlnaHRhcnJvdyc6J1xcdTIxQ0UnLCdubGVxJzonXFx1MjI3MCcsJ25sZXFxJzonXFx1MjI2NlxcdTAzMzgnLCdubGVxc2xhbnQnOidcXHUyQTdEXFx1MDMzOCcsJ25sZXMnOidcXHUyQTdEXFx1MDMzOCcsJ25sZXNzJzonXFx1MjI2RScsJ25MbCc6J1xcdTIyRDhcXHUwMzM4JywnbmxzaW0nOidcXHUyMjc0Jywnbmx0JzonXFx1MjI2RScsJ25MdCc6J1xcdTIyNkFcXHUyMEQyJywnbmx0cmknOidcXHUyMkVBJywnbmx0cmllJzonXFx1MjJFQycsJ25MdHYnOidcXHUyMjZBXFx1MDMzOCcsJ25taWQnOidcXHUyMjI0JywnTm9CcmVhayc6J1xcdTIwNjAnLCdOb25CcmVha2luZ1NwYWNlJzonXFx4QTAnLCdub3BmJzonXFx1RDgzNVxcdURENUYnLCdOb3BmJzonXFx1MjExNScsJ25vdCc6J1xceEFDJywnTm90JzonXFx1MkFFQycsJ05vdENvbmdydWVudCc6J1xcdTIyNjInLCdOb3RDdXBDYXAnOidcXHUyMjZEJywnTm90RG91YmxlVmVydGljYWxCYXInOidcXHUyMjI2JywnTm90RWxlbWVudCc6J1xcdTIyMDknLCdOb3RFcXVhbCc6J1xcdTIyNjAnLCdOb3RFcXVhbFRpbGRlJzonXFx1MjI0MlxcdTAzMzgnLCdOb3RFeGlzdHMnOidcXHUyMjA0JywnTm90R3JlYXRlcic6J1xcdTIyNkYnLCdOb3RHcmVhdGVyRXF1YWwnOidcXHUyMjcxJywnTm90R3JlYXRlckZ1bGxFcXVhbCc6J1xcdTIyNjdcXHUwMzM4JywnTm90R3JlYXRlckdyZWF0ZXInOidcXHUyMjZCXFx1MDMzOCcsJ05vdEdyZWF0ZXJMZXNzJzonXFx1MjI3OScsJ05vdEdyZWF0ZXJTbGFudEVxdWFsJzonXFx1MkE3RVxcdTAzMzgnLCdOb3RHcmVhdGVyVGlsZGUnOidcXHUyMjc1JywnTm90SHVtcERvd25IdW1wJzonXFx1MjI0RVxcdTAzMzgnLCdOb3RIdW1wRXF1YWwnOidcXHUyMjRGXFx1MDMzOCcsJ25vdGluJzonXFx1MjIwOScsJ25vdGluZG90JzonXFx1MjJGNVxcdTAzMzgnLCdub3RpbkUnOidcXHUyMkY5XFx1MDMzOCcsJ25vdGludmEnOidcXHUyMjA5Jywnbm90aW52Yic6J1xcdTIyRjcnLCdub3RpbnZjJzonXFx1MjJGNicsJ05vdExlZnRUcmlhbmdsZSc6J1xcdTIyRUEnLCdOb3RMZWZ0VHJpYW5nbGVCYXInOidcXHUyOUNGXFx1MDMzOCcsJ05vdExlZnRUcmlhbmdsZUVxdWFsJzonXFx1MjJFQycsJ05vdExlc3MnOidcXHUyMjZFJywnTm90TGVzc0VxdWFsJzonXFx1MjI3MCcsJ05vdExlc3NHcmVhdGVyJzonXFx1MjI3OCcsJ05vdExlc3NMZXNzJzonXFx1MjI2QVxcdTAzMzgnLCdOb3RMZXNzU2xhbnRFcXVhbCc6J1xcdTJBN0RcXHUwMzM4JywnTm90TGVzc1RpbGRlJzonXFx1MjI3NCcsJ05vdE5lc3RlZEdyZWF0ZXJHcmVhdGVyJzonXFx1MkFBMlxcdTAzMzgnLCdOb3ROZXN0ZWRMZXNzTGVzcyc6J1xcdTJBQTFcXHUwMzM4Jywnbm90bmknOidcXHUyMjBDJywnbm90bml2YSc6J1xcdTIyMEMnLCdub3RuaXZiJzonXFx1MjJGRScsJ25vdG5pdmMnOidcXHUyMkZEJywnTm90UHJlY2VkZXMnOidcXHUyMjgwJywnTm90UHJlY2VkZXNFcXVhbCc6J1xcdTJBQUZcXHUwMzM4JywnTm90UHJlY2VkZXNTbGFudEVxdWFsJzonXFx1MjJFMCcsJ05vdFJldmVyc2VFbGVtZW50JzonXFx1MjIwQycsJ05vdFJpZ2h0VHJpYW5nbGUnOidcXHUyMkVCJywnTm90UmlnaHRUcmlhbmdsZUJhcic6J1xcdTI5RDBcXHUwMzM4JywnTm90UmlnaHRUcmlhbmdsZUVxdWFsJzonXFx1MjJFRCcsJ05vdFNxdWFyZVN1YnNldCc6J1xcdTIyOEZcXHUwMzM4JywnTm90U3F1YXJlU3Vic2V0RXF1YWwnOidcXHUyMkUyJywnTm90U3F1YXJlU3VwZXJzZXQnOidcXHUyMjkwXFx1MDMzOCcsJ05vdFNxdWFyZVN1cGVyc2V0RXF1YWwnOidcXHUyMkUzJywnTm90U3Vic2V0JzonXFx1MjI4MlxcdTIwRDInLCdOb3RTdWJzZXRFcXVhbCc6J1xcdTIyODgnLCdOb3RTdWNjZWVkcyc6J1xcdTIyODEnLCdOb3RTdWNjZWVkc0VxdWFsJzonXFx1MkFCMFxcdTAzMzgnLCdOb3RTdWNjZWVkc1NsYW50RXF1YWwnOidcXHUyMkUxJywnTm90U3VjY2VlZHNUaWxkZSc6J1xcdTIyN0ZcXHUwMzM4JywnTm90U3VwZXJzZXQnOidcXHUyMjgzXFx1MjBEMicsJ05vdFN1cGVyc2V0RXF1YWwnOidcXHUyMjg5JywnTm90VGlsZGUnOidcXHUyMjQxJywnTm90VGlsZGVFcXVhbCc6J1xcdTIyNDQnLCdOb3RUaWxkZUZ1bGxFcXVhbCc6J1xcdTIyNDcnLCdOb3RUaWxkZVRpbGRlJzonXFx1MjI0OScsJ05vdFZlcnRpY2FsQmFyJzonXFx1MjIyNCcsJ25wYXInOidcXHUyMjI2JywnbnBhcmFsbGVsJzonXFx1MjIyNicsJ25wYXJzbCc6J1xcdTJBRkRcXHUyMEU1JywnbnBhcnQnOidcXHUyMjAyXFx1MDMzOCcsJ25wb2xpbnQnOidcXHUyQTE0JywnbnByJzonXFx1MjI4MCcsJ25wcmN1ZSc6J1xcdTIyRTAnLCducHJlJzonXFx1MkFBRlxcdTAzMzgnLCducHJlYyc6J1xcdTIyODAnLCducHJlY2VxJzonXFx1MkFBRlxcdTAzMzgnLCducmFycic6J1xcdTIxOUInLCduckFycic6J1xcdTIxQ0YnLCducmFycmMnOidcXHUyOTMzXFx1MDMzOCcsJ25yYXJydyc6J1xcdTIxOURcXHUwMzM4JywnbnJpZ2h0YXJyb3cnOidcXHUyMTlCJywnblJpZ2h0YXJyb3cnOidcXHUyMUNGJywnbnJ0cmknOidcXHUyMkVCJywnbnJ0cmllJzonXFx1MjJFRCcsJ25zYyc6J1xcdTIyODEnLCduc2NjdWUnOidcXHUyMkUxJywnbnNjZSc6J1xcdTJBQjBcXHUwMzM4JywnbnNjcic6J1xcdUQ4MzVcXHVEQ0MzJywnTnNjcic6J1xcdUQ4MzVcXHVEQ0E5JywnbnNob3J0bWlkJzonXFx1MjIyNCcsJ25zaG9ydHBhcmFsbGVsJzonXFx1MjIyNicsJ25zaW0nOidcXHUyMjQxJywnbnNpbWUnOidcXHUyMjQ0JywnbnNpbWVxJzonXFx1MjI0NCcsJ25zbWlkJzonXFx1MjIyNCcsJ25zcGFyJzonXFx1MjIyNicsJ25zcXN1YmUnOidcXHUyMkUyJywnbnNxc3VwZSc6J1xcdTIyRTMnLCduc3ViJzonXFx1MjI4NCcsJ25zdWJlJzonXFx1MjI4OCcsJ25zdWJFJzonXFx1MkFDNVxcdTAzMzgnLCduc3Vic2V0JzonXFx1MjI4MlxcdTIwRDInLCduc3Vic2V0ZXEnOidcXHUyMjg4JywnbnN1YnNldGVxcSc6J1xcdTJBQzVcXHUwMzM4JywnbnN1Y2MnOidcXHUyMjgxJywnbnN1Y2NlcSc6J1xcdTJBQjBcXHUwMzM4JywnbnN1cCc6J1xcdTIyODUnLCduc3VwZSc6J1xcdTIyODknLCduc3VwRSc6J1xcdTJBQzZcXHUwMzM4JywnbnN1cHNldCc6J1xcdTIyODNcXHUyMEQyJywnbnN1cHNldGVxJzonXFx1MjI4OScsJ25zdXBzZXRlcXEnOidcXHUyQUM2XFx1MDMzOCcsJ250Z2wnOidcXHUyMjc5JywnbnRpbGRlJzonXFx4RjEnLCdOdGlsZGUnOidcXHhEMScsJ250bGcnOidcXHUyMjc4JywnbnRyaWFuZ2xlbGVmdCc6J1xcdTIyRUEnLCdudHJpYW5nbGVsZWZ0ZXEnOidcXHUyMkVDJywnbnRyaWFuZ2xlcmlnaHQnOidcXHUyMkVCJywnbnRyaWFuZ2xlcmlnaHRlcSc6J1xcdTIyRUQnLCdudSc6J1xcdTAzQkQnLCdOdSc6J1xcdTAzOUQnLCdudW0nOicjJywnbnVtZXJvJzonXFx1MjExNicsJ251bXNwJzonXFx1MjAwNycsJ252YXAnOidcXHUyMjREXFx1MjBEMicsJ252ZGFzaCc6J1xcdTIyQUMnLCdudkRhc2gnOidcXHUyMkFEJywnblZkYXNoJzonXFx1MjJBRScsJ25WRGFzaCc6J1xcdTIyQUYnLCdudmdlJzonXFx1MjI2NVxcdTIwRDInLCdudmd0JzonPlxcdTIwRDInLCdudkhhcnInOidcXHUyOTA0JywnbnZpbmZpbic6J1xcdTI5REUnLCdudmxBcnInOidcXHUyOTAyJywnbnZsZSc6J1xcdTIyNjRcXHUyMEQyJywnbnZsdCc6JzxcXHUyMEQyJywnbnZsdHJpZSc6J1xcdTIyQjRcXHUyMEQyJywnbnZyQXJyJzonXFx1MjkwMycsJ252cnRyaWUnOidcXHUyMkI1XFx1MjBEMicsJ252c2ltJzonXFx1MjIzQ1xcdTIwRDInLCdud2FyaGsnOidcXHUyOTIzJywnbndhcnInOidcXHUyMTk2JywnbndBcnInOidcXHUyMUQ2JywnbndhcnJvdyc6J1xcdTIxOTYnLCdud25lYXInOidcXHUyOTI3Jywnb2FjdXRlJzonXFx4RjMnLCdPYWN1dGUnOidcXHhEMycsJ29hc3QnOidcXHUyMjlCJywnb2Npcic6J1xcdTIyOUEnLCdvY2lyYyc6J1xceEY0JywnT2NpcmMnOidcXHhENCcsJ29jeSc6J1xcdTA0M0UnLCdPY3knOidcXHUwNDFFJywnb2Rhc2gnOidcXHUyMjlEJywnb2RibGFjJzonXFx1MDE1MScsJ09kYmxhYyc6J1xcdTAxNTAnLCdvZGl2JzonXFx1MkEzOCcsJ29kb3QnOidcXHUyMjk5Jywnb2Rzb2xkJzonXFx1MjlCQycsJ29lbGlnJzonXFx1MDE1MycsJ09FbGlnJzonXFx1MDE1MicsJ29mY2lyJzonXFx1MjlCRicsJ29mcic6J1xcdUQ4MzVcXHVERDJDJywnT2ZyJzonXFx1RDgzNVxcdUREMTInLCdvZ29uJzonXFx1MDJEQicsJ29ncmF2ZSc6J1xceEYyJywnT2dyYXZlJzonXFx4RDInLCdvZ3QnOidcXHUyOUMxJywnb2hiYXInOidcXHUyOUI1Jywnb2htJzonXFx1MDNBOScsJ29pbnQnOidcXHUyMjJFJywnb2xhcnInOidcXHUyMUJBJywnb2xjaXInOidcXHUyOUJFJywnb2xjcm9zcyc6J1xcdTI5QkInLCdvbGluZSc6J1xcdTIwM0UnLCdvbHQnOidcXHUyOUMwJywnb21hY3InOidcXHUwMTREJywnT21hY3InOidcXHUwMTRDJywnb21lZ2EnOidcXHUwM0M5JywnT21lZ2EnOidcXHUwM0E5Jywnb21pY3Jvbic6J1xcdTAzQkYnLCdPbWljcm9uJzonXFx1MDM5RicsJ29taWQnOidcXHUyOUI2Jywnb21pbnVzJzonXFx1MjI5NicsJ29vcGYnOidcXHVEODM1XFx1REQ2MCcsJ09vcGYnOidcXHVEODM1XFx1REQ0NicsJ29wYXInOidcXHUyOUI3JywnT3BlbkN1cmx5RG91YmxlUXVvdGUnOidcXHUyMDFDJywnT3BlbkN1cmx5UXVvdGUnOidcXHUyMDE4Jywnb3BlcnAnOidcXHUyOUI5Jywnb3BsdXMnOidcXHUyMjk1Jywnb3InOidcXHUyMjI4JywnT3InOidcXHUyQTU0Jywnb3JhcnInOidcXHUyMUJCJywnb3JkJzonXFx1MkE1RCcsJ29yZGVyJzonXFx1MjEzNCcsJ29yZGVyb2YnOidcXHUyMTM0Jywnb3JkZic6J1xceEFBJywnb3JkbSc6J1xceEJBJywnb3JpZ29mJzonXFx1MjJCNicsJ29yb3InOidcXHUyQTU2Jywnb3JzbG9wZSc6J1xcdTJBNTcnLCdvcnYnOidcXHUyQTVCJywnb1MnOidcXHUyNEM4Jywnb3Njcic6J1xcdTIxMzQnLCdPc2NyJzonXFx1RDgzNVxcdURDQUEnLCdvc2xhc2gnOidcXHhGOCcsJ09zbGFzaCc6J1xceEQ4Jywnb3NvbCc6J1xcdTIyOTgnLCdvdGlsZGUnOidcXHhGNScsJ090aWxkZSc6J1xceEQ1Jywnb3RpbWVzJzonXFx1MjI5NycsJ090aW1lcyc6J1xcdTJBMzcnLCdvdGltZXNhcyc6J1xcdTJBMzYnLCdvdW1sJzonXFx4RjYnLCdPdW1sJzonXFx4RDYnLCdvdmJhcic6J1xcdTIzM0QnLCdPdmVyQmFyJzonXFx1MjAzRScsJ092ZXJCcmFjZSc6J1xcdTIzREUnLCdPdmVyQnJhY2tldCc6J1xcdTIzQjQnLCdPdmVyUGFyZW50aGVzaXMnOidcXHUyM0RDJywncGFyJzonXFx1MjIyNScsJ3BhcmEnOidcXHhCNicsJ3BhcmFsbGVsJzonXFx1MjIyNScsJ3BhcnNpbSc6J1xcdTJBRjMnLCdwYXJzbCc6J1xcdTJBRkQnLCdwYXJ0JzonXFx1MjIwMicsJ1BhcnRpYWxEJzonXFx1MjIwMicsJ3BjeSc6J1xcdTA0M0YnLCdQY3knOidcXHUwNDFGJywncGVyY250JzonJScsJ3BlcmlvZCc6Jy4nLCdwZXJtaWwnOidcXHUyMDMwJywncGVycCc6J1xcdTIyQTUnLCdwZXJ0ZW5rJzonXFx1MjAzMScsJ3Bmcic6J1xcdUQ4MzVcXHVERDJEJywnUGZyJzonXFx1RDgzNVxcdUREMTMnLCdwaGknOidcXHUwM0M2JywnUGhpJzonXFx1MDNBNicsJ3BoaXYnOidcXHUwM0Q1JywncGhtbWF0JzonXFx1MjEzMycsJ3Bob25lJzonXFx1MjYwRScsJ3BpJzonXFx1MDNDMCcsJ1BpJzonXFx1MDNBMCcsJ3BpdGNoZm9yayc6J1xcdTIyRDQnLCdwaXYnOidcXHUwM0Q2JywncGxhbmNrJzonXFx1MjEwRicsJ3BsYW5ja2gnOidcXHUyMTBFJywncGxhbmt2JzonXFx1MjEwRicsJ3BsdXMnOicrJywncGx1c2FjaXInOidcXHUyQTIzJywncGx1c2InOidcXHUyMjlFJywncGx1c2Npcic6J1xcdTJBMjInLCdwbHVzZG8nOidcXHUyMjE0JywncGx1c2R1JzonXFx1MkEyNScsJ3BsdXNlJzonXFx1MkE3MicsJ1BsdXNNaW51cyc6J1xceEIxJywncGx1c21uJzonXFx4QjEnLCdwbHVzc2ltJzonXFx1MkEyNicsJ3BsdXN0d28nOidcXHUyQTI3JywncG0nOidcXHhCMScsJ1BvaW5jYXJlcGxhbmUnOidcXHUyMTBDJywncG9pbnRpbnQnOidcXHUyQTE1JywncG9wZic6J1xcdUQ4MzVcXHVERDYxJywnUG9wZic6J1xcdTIxMTknLCdwb3VuZCc6J1xceEEzJywncHInOidcXHUyMjdBJywnUHInOidcXHUyQUJCJywncHJhcCc6J1xcdTJBQjcnLCdwcmN1ZSc6J1xcdTIyN0MnLCdwcmUnOidcXHUyQUFGJywncHJFJzonXFx1MkFCMycsJ3ByZWMnOidcXHUyMjdBJywncHJlY2FwcHJveCc6J1xcdTJBQjcnLCdwcmVjY3VybHllcSc6J1xcdTIyN0MnLCdQcmVjZWRlcyc6J1xcdTIyN0EnLCdQcmVjZWRlc0VxdWFsJzonXFx1MkFBRicsJ1ByZWNlZGVzU2xhbnRFcXVhbCc6J1xcdTIyN0MnLCdQcmVjZWRlc1RpbGRlJzonXFx1MjI3RScsJ3ByZWNlcSc6J1xcdTJBQUYnLCdwcmVjbmFwcHJveCc6J1xcdTJBQjknLCdwcmVjbmVxcSc6J1xcdTJBQjUnLCdwcmVjbnNpbSc6J1xcdTIyRTgnLCdwcmVjc2ltJzonXFx1MjI3RScsJ3ByaW1lJzonXFx1MjAzMicsJ1ByaW1lJzonXFx1MjAzMycsJ3ByaW1lcyc6J1xcdTIxMTknLCdwcm5hcCc6J1xcdTJBQjknLCdwcm5FJzonXFx1MkFCNScsJ3BybnNpbSc6J1xcdTIyRTgnLCdwcm9kJzonXFx1MjIwRicsJ1Byb2R1Y3QnOidcXHUyMjBGJywncHJvZmFsYXInOidcXHUyMzJFJywncHJvZmxpbmUnOidcXHUyMzEyJywncHJvZnN1cmYnOidcXHUyMzEzJywncHJvcCc6J1xcdTIyMUQnLCdQcm9wb3J0aW9uJzonXFx1MjIzNycsJ1Byb3BvcnRpb25hbCc6J1xcdTIyMUQnLCdwcm9wdG8nOidcXHUyMjFEJywncHJzaW0nOidcXHUyMjdFJywncHJ1cmVsJzonXFx1MjJCMCcsJ3BzY3InOidcXHVEODM1XFx1RENDNScsJ1BzY3InOidcXHVEODM1XFx1RENBQicsJ3BzaSc6J1xcdTAzQzgnLCdQc2knOidcXHUwM0E4JywncHVuY3NwJzonXFx1MjAwOCcsJ3Fmcic6J1xcdUQ4MzVcXHVERDJFJywnUWZyJzonXFx1RDgzNVxcdUREMTQnLCdxaW50JzonXFx1MkEwQycsJ3FvcGYnOidcXHVEODM1XFx1REQ2MicsJ1FvcGYnOidcXHUyMTFBJywncXByaW1lJzonXFx1MjA1NycsJ3FzY3InOidcXHVEODM1XFx1RENDNicsJ1FzY3InOidcXHVEODM1XFx1RENBQycsJ3F1YXRlcm5pb25zJzonXFx1MjEwRCcsJ3F1YXRpbnQnOidcXHUyQTE2JywncXVlc3QnOic/JywncXVlc3RlcSc6J1xcdTIyNUYnLCdxdW90JzonXCInLCdRVU9UJzonXCInLCdyQWFycic6J1xcdTIxREInLCdyYWNlJzonXFx1MjIzRFxcdTAzMzEnLCdyYWN1dGUnOidcXHUwMTU1JywnUmFjdXRlJzonXFx1MDE1NCcsJ3JhZGljJzonXFx1MjIxQScsJ3JhZW1wdHl2JzonXFx1MjlCMycsJ3JhbmcnOidcXHUyN0U5JywnUmFuZyc6J1xcdTI3RUInLCdyYW5nZCc6J1xcdTI5OTInLCdyYW5nZSc6J1xcdTI5QTUnLCdyYW5nbGUnOidcXHUyN0U5JywncmFxdW8nOidcXHhCQicsJ3JhcnInOidcXHUyMTkyJywnckFycic6J1xcdTIxRDInLCdSYXJyJzonXFx1MjFBMCcsJ3JhcnJhcCc6J1xcdTI5NzUnLCdyYXJyYic6J1xcdTIxRTUnLCdyYXJyYmZzJzonXFx1MjkyMCcsJ3JhcnJjJzonXFx1MjkzMycsJ3JhcnJmcyc6J1xcdTI5MUUnLCdyYXJyaGsnOidcXHUyMUFBJywncmFycmxwJzonXFx1MjFBQycsJ3JhcnJwbCc6J1xcdTI5NDUnLCdyYXJyc2ltJzonXFx1Mjk3NCcsJ3JhcnJ0bCc6J1xcdTIxQTMnLCdSYXJydGwnOidcXHUyOTE2JywncmFycncnOidcXHUyMTlEJywncmF0YWlsJzonXFx1MjkxQScsJ3JBdGFpbCc6J1xcdTI5MUMnLCdyYXRpbyc6J1xcdTIyMzYnLCdyYXRpb25hbHMnOidcXHUyMTFBJywncmJhcnInOidcXHUyOTBEJywnckJhcnInOidcXHUyOTBGJywnUkJhcnInOidcXHUyOTEwJywncmJicmsnOidcXHUyNzczJywncmJyYWNlJzonfScsJ3JicmFjayc6J10nLCdyYnJrZSc6J1xcdTI5OEMnLCdyYnJrc2xkJzonXFx1Mjk4RScsJ3JicmtzbHUnOidcXHUyOTkwJywncmNhcm9uJzonXFx1MDE1OScsJ1JjYXJvbic6J1xcdTAxNTgnLCdyY2VkaWwnOidcXHUwMTU3JywnUmNlZGlsJzonXFx1MDE1NicsJ3JjZWlsJzonXFx1MjMwOScsJ3JjdWInOid9JywncmN5JzonXFx1MDQ0MCcsJ1JjeSc6J1xcdTA0MjAnLCdyZGNhJzonXFx1MjkzNycsJ3JkbGRoYXInOidcXHUyOTY5JywncmRxdW8nOidcXHUyMDFEJywncmRxdW9yJzonXFx1MjAxRCcsJ3Jkc2gnOidcXHUyMUIzJywnUmUnOidcXHUyMTFDJywncmVhbCc6J1xcdTIxMUMnLCdyZWFsaW5lJzonXFx1MjExQicsJ3JlYWxwYXJ0JzonXFx1MjExQycsJ3JlYWxzJzonXFx1MjExRCcsJ3JlY3QnOidcXHUyNUFEJywncmVnJzonXFx4QUUnLCdSRUcnOidcXHhBRScsJ1JldmVyc2VFbGVtZW50JzonXFx1MjIwQicsJ1JldmVyc2VFcXVpbGlicml1bSc6J1xcdTIxQ0InLCdSZXZlcnNlVXBFcXVpbGlicml1bSc6J1xcdTI5NkYnLCdyZmlzaHQnOidcXHUyOTdEJywncmZsb29yJzonXFx1MjMwQicsJ3Jmcic6J1xcdUQ4MzVcXHVERDJGJywnUmZyJzonXFx1MjExQycsJ3JIYXInOidcXHUyOTY0JywncmhhcmQnOidcXHUyMUMxJywncmhhcnUnOidcXHUyMUMwJywncmhhcnVsJzonXFx1Mjk2QycsJ3Jobyc6J1xcdTAzQzEnLCdSaG8nOidcXHUwM0ExJywncmhvdic6J1xcdTAzRjEnLCdSaWdodEFuZ2xlQnJhY2tldCc6J1xcdTI3RTknLCdyaWdodGFycm93JzonXFx1MjE5MicsJ1JpZ2h0YXJyb3cnOidcXHUyMUQyJywnUmlnaHRBcnJvdyc6J1xcdTIxOTInLCdSaWdodEFycm93QmFyJzonXFx1MjFFNScsJ1JpZ2h0QXJyb3dMZWZ0QXJyb3cnOidcXHUyMUM0JywncmlnaHRhcnJvd3RhaWwnOidcXHUyMUEzJywnUmlnaHRDZWlsaW5nJzonXFx1MjMwOScsJ1JpZ2h0RG91YmxlQnJhY2tldCc6J1xcdTI3RTcnLCdSaWdodERvd25UZWVWZWN0b3InOidcXHUyOTVEJywnUmlnaHREb3duVmVjdG9yJzonXFx1MjFDMicsJ1JpZ2h0RG93blZlY3RvckJhcic6J1xcdTI5NTUnLCdSaWdodEZsb29yJzonXFx1MjMwQicsJ3JpZ2h0aGFycG9vbmRvd24nOidcXHUyMUMxJywncmlnaHRoYXJwb29udXAnOidcXHUyMUMwJywncmlnaHRsZWZ0YXJyb3dzJzonXFx1MjFDNCcsJ3JpZ2h0bGVmdGhhcnBvb25zJzonXFx1MjFDQycsJ3JpZ2h0cmlnaHRhcnJvd3MnOidcXHUyMUM5JywncmlnaHRzcXVpZ2Fycm93JzonXFx1MjE5RCcsJ1JpZ2h0VGVlJzonXFx1MjJBMicsJ1JpZ2h0VGVlQXJyb3cnOidcXHUyMUE2JywnUmlnaHRUZWVWZWN0b3InOidcXHUyOTVCJywncmlnaHR0aHJlZXRpbWVzJzonXFx1MjJDQycsJ1JpZ2h0VHJpYW5nbGUnOidcXHUyMkIzJywnUmlnaHRUcmlhbmdsZUJhcic6J1xcdTI5RDAnLCdSaWdodFRyaWFuZ2xlRXF1YWwnOidcXHUyMkI1JywnUmlnaHRVcERvd25WZWN0b3InOidcXHUyOTRGJywnUmlnaHRVcFRlZVZlY3Rvcic6J1xcdTI5NUMnLCdSaWdodFVwVmVjdG9yJzonXFx1MjFCRScsJ1JpZ2h0VXBWZWN0b3JCYXInOidcXHUyOTU0JywnUmlnaHRWZWN0b3InOidcXHUyMUMwJywnUmlnaHRWZWN0b3JCYXInOidcXHUyOTUzJywncmluZyc6J1xcdTAyREEnLCdyaXNpbmdkb3RzZXEnOidcXHUyMjUzJywncmxhcnInOidcXHUyMUM0JywncmxoYXInOidcXHUyMUNDJywncmxtJzonXFx1MjAwRicsJ3Jtb3VzdCc6J1xcdTIzQjEnLCdybW91c3RhY2hlJzonXFx1MjNCMScsJ3JubWlkJzonXFx1MkFFRScsJ3JvYW5nJzonXFx1MjdFRCcsJ3JvYXJyJzonXFx1MjFGRScsJ3JvYnJrJzonXFx1MjdFNycsJ3JvcGFyJzonXFx1Mjk4NicsJ3JvcGYnOidcXHVEODM1XFx1REQ2MycsJ1JvcGYnOidcXHUyMTFEJywncm9wbHVzJzonXFx1MkEyRScsJ3JvdGltZXMnOidcXHUyQTM1JywnUm91bmRJbXBsaWVzJzonXFx1Mjk3MCcsJ3JwYXInOicpJywncnBhcmd0JzonXFx1Mjk5NCcsJ3JwcG9saW50JzonXFx1MkExMicsJ3JyYXJyJzonXFx1MjFDOScsJ1JyaWdodGFycm93JzonXFx1MjFEQicsJ3JzYXF1byc6J1xcdTIwM0EnLCdyc2NyJzonXFx1RDgzNVxcdURDQzcnLCdSc2NyJzonXFx1MjExQicsJ3JzaCc6J1xcdTIxQjEnLCdSc2gnOidcXHUyMUIxJywncnNxYic6J10nLCdyc3F1byc6J1xcdTIwMTknLCdyc3F1b3InOidcXHUyMDE5JywncnRocmVlJzonXFx1MjJDQycsJ3J0aW1lcyc6J1xcdTIyQ0EnLCdydHJpJzonXFx1MjVCOScsJ3J0cmllJzonXFx1MjJCNScsJ3J0cmlmJzonXFx1MjVCOCcsJ3J0cmlsdHJpJzonXFx1MjlDRScsJ1J1bGVEZWxheWVkJzonXFx1MjlGNCcsJ3J1bHVoYXInOidcXHUyOTY4JywncngnOidcXHUyMTFFJywnc2FjdXRlJzonXFx1MDE1QicsJ1NhY3V0ZSc6J1xcdTAxNUEnLCdzYnF1byc6J1xcdTIwMUEnLCdzYyc6J1xcdTIyN0InLCdTYyc6J1xcdTJBQkMnLCdzY2FwJzonXFx1MkFCOCcsJ3NjYXJvbic6J1xcdTAxNjEnLCdTY2Fyb24nOidcXHUwMTYwJywnc2NjdWUnOidcXHUyMjdEJywnc2NlJzonXFx1MkFCMCcsJ3NjRSc6J1xcdTJBQjQnLCdzY2VkaWwnOidcXHUwMTVGJywnU2NlZGlsJzonXFx1MDE1RScsJ3NjaXJjJzonXFx1MDE1RCcsJ1NjaXJjJzonXFx1MDE1QycsJ3NjbmFwJzonXFx1MkFCQScsJ3NjbkUnOidcXHUyQUI2Jywnc2Nuc2ltJzonXFx1MjJFOScsJ3NjcG9saW50JzonXFx1MkExMycsJ3Njc2ltJzonXFx1MjI3RicsJ3NjeSc6J1xcdTA0NDEnLCdTY3knOidcXHUwNDIxJywnc2RvdCc6J1xcdTIyQzUnLCdzZG90Yic6J1xcdTIyQTEnLCdzZG90ZSc6J1xcdTJBNjYnLCdzZWFyaGsnOidcXHUyOTI1Jywnc2VhcnInOidcXHUyMTk4Jywnc2VBcnInOidcXHUyMUQ4Jywnc2VhcnJvdyc6J1xcdTIxOTgnLCdzZWN0JzonXFx4QTcnLCdzZW1pJzonOycsJ3Nlc3dhcic6J1xcdTI5MjknLCdzZXRtaW51cyc6J1xcdTIyMTYnLCdzZXRtbic6J1xcdTIyMTYnLCdzZXh0JzonXFx1MjczNicsJ3Nmcic6J1xcdUQ4MzVcXHVERDMwJywnU2ZyJzonXFx1RDgzNVxcdUREMTYnLCdzZnJvd24nOidcXHUyMzIyJywnc2hhcnAnOidcXHUyNjZGJywnc2hjaGN5JzonXFx1MDQ0OScsJ1NIQ0hjeSc6J1xcdTA0MjknLCdzaGN5JzonXFx1MDQ0OCcsJ1NIY3knOidcXHUwNDI4JywnU2hvcnREb3duQXJyb3cnOidcXHUyMTkzJywnU2hvcnRMZWZ0QXJyb3cnOidcXHUyMTkwJywnc2hvcnRtaWQnOidcXHUyMjIzJywnc2hvcnRwYXJhbGxlbCc6J1xcdTIyMjUnLCdTaG9ydFJpZ2h0QXJyb3cnOidcXHUyMTkyJywnU2hvcnRVcEFycm93JzonXFx1MjE5MScsJ3NoeSc6J1xceEFEJywnc2lnbWEnOidcXHUwM0MzJywnU2lnbWEnOidcXHUwM0EzJywnc2lnbWFmJzonXFx1MDNDMicsJ3NpZ21hdic6J1xcdTAzQzInLCdzaW0nOidcXHUyMjNDJywnc2ltZG90JzonXFx1MkE2QScsJ3NpbWUnOidcXHUyMjQzJywnc2ltZXEnOidcXHUyMjQzJywnc2ltZyc6J1xcdTJBOUUnLCdzaW1nRSc6J1xcdTJBQTAnLCdzaW1sJzonXFx1MkE5RCcsJ3NpbWxFJzonXFx1MkE5RicsJ3NpbW5lJzonXFx1MjI0NicsJ3NpbXBsdXMnOidcXHUyQTI0Jywnc2ltcmFycic6J1xcdTI5NzInLCdzbGFycic6J1xcdTIxOTAnLCdTbWFsbENpcmNsZSc6J1xcdTIyMTgnLCdzbWFsbHNldG1pbnVzJzonXFx1MjIxNicsJ3NtYXNocCc6J1xcdTJBMzMnLCdzbWVwYXJzbCc6J1xcdTI5RTQnLCdzbWlkJzonXFx1MjIyMycsJ3NtaWxlJzonXFx1MjMyMycsJ3NtdCc6J1xcdTJBQUEnLCdzbXRlJzonXFx1MkFBQycsJ3NtdGVzJzonXFx1MkFBQ1xcdUZFMDAnLCdzb2Z0Y3knOidcXHUwNDRDJywnU09GVGN5JzonXFx1MDQyQycsJ3NvbCc6Jy8nLCdzb2xiJzonXFx1MjlDNCcsJ3NvbGJhcic6J1xcdTIzM0YnLCdzb3BmJzonXFx1RDgzNVxcdURENjQnLCdTb3BmJzonXFx1RDgzNVxcdURENEEnLCdzcGFkZXMnOidcXHUyNjYwJywnc3BhZGVzdWl0JzonXFx1MjY2MCcsJ3NwYXInOidcXHUyMjI1Jywnc3FjYXAnOidcXHUyMjkzJywnc3FjYXBzJzonXFx1MjI5M1xcdUZFMDAnLCdzcWN1cCc6J1xcdTIyOTQnLCdzcWN1cHMnOidcXHUyMjk0XFx1RkUwMCcsJ1NxcnQnOidcXHUyMjFBJywnc3FzdWInOidcXHUyMjhGJywnc3FzdWJlJzonXFx1MjI5MScsJ3Nxc3Vic2V0JzonXFx1MjI4RicsJ3Nxc3Vic2V0ZXEnOidcXHUyMjkxJywnc3FzdXAnOidcXHUyMjkwJywnc3FzdXBlJzonXFx1MjI5MicsJ3Nxc3Vwc2V0JzonXFx1MjI5MCcsJ3Nxc3Vwc2V0ZXEnOidcXHUyMjkyJywnc3F1JzonXFx1MjVBMScsJ3NxdWFyZSc6J1xcdTI1QTEnLCdTcXVhcmUnOidcXHUyNUExJywnU3F1YXJlSW50ZXJzZWN0aW9uJzonXFx1MjI5MycsJ1NxdWFyZVN1YnNldCc6J1xcdTIyOEYnLCdTcXVhcmVTdWJzZXRFcXVhbCc6J1xcdTIyOTEnLCdTcXVhcmVTdXBlcnNldCc6J1xcdTIyOTAnLCdTcXVhcmVTdXBlcnNldEVxdWFsJzonXFx1MjI5MicsJ1NxdWFyZVVuaW9uJzonXFx1MjI5NCcsJ3NxdWFyZic6J1xcdTI1QUEnLCdzcXVmJzonXFx1MjVBQScsJ3NyYXJyJzonXFx1MjE5MicsJ3NzY3InOidcXHVEODM1XFx1RENDOCcsJ1NzY3InOidcXHVEODM1XFx1RENBRScsJ3NzZXRtbic6J1xcdTIyMTYnLCdzc21pbGUnOidcXHUyMzIzJywnc3N0YXJmJzonXFx1MjJDNicsJ3N0YXInOidcXHUyNjA2JywnU3Rhcic6J1xcdTIyQzYnLCdzdGFyZic6J1xcdTI2MDUnLCdzdHJhaWdodGVwc2lsb24nOidcXHUwM0Y1Jywnc3RyYWlnaHRwaGknOidcXHUwM0Q1Jywnc3RybnMnOidcXHhBRicsJ3N1Yic6J1xcdTIyODInLCdTdWInOidcXHUyMkQwJywnc3ViZG90JzonXFx1MkFCRCcsJ3N1YmUnOidcXHUyMjg2Jywnc3ViRSc6J1xcdTJBQzUnLCdzdWJlZG90JzonXFx1MkFDMycsJ3N1Ym11bHQnOidcXHUyQUMxJywnc3VibmUnOidcXHUyMjhBJywnc3VibkUnOidcXHUyQUNCJywnc3VicGx1cyc6J1xcdTJBQkYnLCdzdWJyYXJyJzonXFx1Mjk3OScsJ3N1YnNldCc6J1xcdTIyODInLCdTdWJzZXQnOidcXHUyMkQwJywnc3Vic2V0ZXEnOidcXHUyMjg2Jywnc3Vic2V0ZXFxJzonXFx1MkFDNScsJ1N1YnNldEVxdWFsJzonXFx1MjI4NicsJ3N1YnNldG5lcSc6J1xcdTIyOEEnLCdzdWJzZXRuZXFxJzonXFx1MkFDQicsJ3N1YnNpbSc6J1xcdTJBQzcnLCdzdWJzdWInOidcXHUyQUQ1Jywnc3Vic3VwJzonXFx1MkFEMycsJ3N1Y2MnOidcXHUyMjdCJywnc3VjY2FwcHJveCc6J1xcdTJBQjgnLCdzdWNjY3VybHllcSc6J1xcdTIyN0QnLCdTdWNjZWVkcyc6J1xcdTIyN0InLCdTdWNjZWVkc0VxdWFsJzonXFx1MkFCMCcsJ1N1Y2NlZWRzU2xhbnRFcXVhbCc6J1xcdTIyN0QnLCdTdWNjZWVkc1RpbGRlJzonXFx1MjI3RicsJ3N1Y2NlcSc6J1xcdTJBQjAnLCdzdWNjbmFwcHJveCc6J1xcdTJBQkEnLCdzdWNjbmVxcSc6J1xcdTJBQjYnLCdzdWNjbnNpbSc6J1xcdTIyRTknLCdzdWNjc2ltJzonXFx1MjI3RicsJ1N1Y2hUaGF0JzonXFx1MjIwQicsJ3N1bSc6J1xcdTIyMTEnLCdTdW0nOidcXHUyMjExJywnc3VuZyc6J1xcdTI2NkEnLCdzdXAnOidcXHUyMjgzJywnU3VwJzonXFx1MjJEMScsJ3N1cDEnOidcXHhCOScsJ3N1cDInOidcXHhCMicsJ3N1cDMnOidcXHhCMycsJ3N1cGRvdCc6J1xcdTJBQkUnLCdzdXBkc3ViJzonXFx1MkFEOCcsJ3N1cGUnOidcXHUyMjg3Jywnc3VwRSc6J1xcdTJBQzYnLCdzdXBlZG90JzonXFx1MkFDNCcsJ1N1cGVyc2V0JzonXFx1MjI4MycsJ1N1cGVyc2V0RXF1YWwnOidcXHUyMjg3Jywnc3VwaHNvbCc6J1xcdTI3QzknLCdzdXBoc3ViJzonXFx1MkFENycsJ3N1cGxhcnInOidcXHUyOTdCJywnc3VwbXVsdCc6J1xcdTJBQzInLCdzdXBuZSc6J1xcdTIyOEInLCdzdXBuRSc6J1xcdTJBQ0MnLCdzdXBwbHVzJzonXFx1MkFDMCcsJ3N1cHNldCc6J1xcdTIyODMnLCdTdXBzZXQnOidcXHUyMkQxJywnc3Vwc2V0ZXEnOidcXHUyMjg3Jywnc3Vwc2V0ZXFxJzonXFx1MkFDNicsJ3N1cHNldG5lcSc6J1xcdTIyOEInLCdzdXBzZXRuZXFxJzonXFx1MkFDQycsJ3N1cHNpbSc6J1xcdTJBQzgnLCdzdXBzdWInOidcXHUyQUQ0Jywnc3Vwc3VwJzonXFx1MkFENicsJ3N3YXJoayc6J1xcdTI5MjYnLCdzd2Fycic6J1xcdTIxOTknLCdzd0Fycic6J1xcdTIxRDknLCdzd2Fycm93JzonXFx1MjE5OScsJ3N3bndhcic6J1xcdTI5MkEnLCdzemxpZyc6J1xceERGJywnVGFiJzonXFx0JywndGFyZ2V0JzonXFx1MjMxNicsJ3RhdSc6J1xcdTAzQzQnLCdUYXUnOidcXHUwM0E0JywndGJyayc6J1xcdTIzQjQnLCd0Y2Fyb24nOidcXHUwMTY1JywnVGNhcm9uJzonXFx1MDE2NCcsJ3RjZWRpbCc6J1xcdTAxNjMnLCdUY2VkaWwnOidcXHUwMTYyJywndGN5JzonXFx1MDQ0MicsJ1RjeSc6J1xcdTA0MjInLCd0ZG90JzonXFx1MjBEQicsJ3RlbHJlYyc6J1xcdTIzMTUnLCd0ZnInOidcXHVEODM1XFx1REQzMScsJ1Rmcic6J1xcdUQ4MzVcXHVERDE3JywndGhlcmU0JzonXFx1MjIzNCcsJ3RoZXJlZm9yZSc6J1xcdTIyMzQnLCdUaGVyZWZvcmUnOidcXHUyMjM0JywndGhldGEnOidcXHUwM0I4JywnVGhldGEnOidcXHUwMzk4JywndGhldGFzeW0nOidcXHUwM0QxJywndGhldGF2JzonXFx1MDNEMScsJ3RoaWNrYXBwcm94JzonXFx1MjI0OCcsJ3RoaWNrc2ltJzonXFx1MjIzQycsJ1RoaWNrU3BhY2UnOidcXHUyMDVGXFx1MjAwQScsJ3RoaW5zcCc6J1xcdTIwMDknLCdUaGluU3BhY2UnOidcXHUyMDA5JywndGhrYXAnOidcXHUyMjQ4JywndGhrc2ltJzonXFx1MjIzQycsJ3Rob3JuJzonXFx4RkUnLCdUSE9STic6J1xceERFJywndGlsZGUnOidcXHUwMkRDJywnVGlsZGUnOidcXHUyMjNDJywnVGlsZGVFcXVhbCc6J1xcdTIyNDMnLCdUaWxkZUZ1bGxFcXVhbCc6J1xcdTIyNDUnLCdUaWxkZVRpbGRlJzonXFx1MjI0OCcsJ3RpbWVzJzonXFx4RDcnLCd0aW1lc2InOidcXHUyMkEwJywndGltZXNiYXInOidcXHUyQTMxJywndGltZXNkJzonXFx1MkEzMCcsJ3RpbnQnOidcXHUyMjJEJywndG9lYSc6J1xcdTI5MjgnLCd0b3AnOidcXHUyMkE0JywndG9wYm90JzonXFx1MjMzNicsJ3RvcGNpcic6J1xcdTJBRjEnLCd0b3BmJzonXFx1RDgzNVxcdURENjUnLCdUb3BmJzonXFx1RDgzNVxcdURENEInLCd0b3Bmb3JrJzonXFx1MkFEQScsJ3Rvc2EnOidcXHUyOTI5JywndHByaW1lJzonXFx1MjAzNCcsJ3RyYWRlJzonXFx1MjEyMicsJ1RSQURFJzonXFx1MjEyMicsJ3RyaWFuZ2xlJzonXFx1MjVCNScsJ3RyaWFuZ2xlZG93bic6J1xcdTI1QkYnLCd0cmlhbmdsZWxlZnQnOidcXHUyNUMzJywndHJpYW5nbGVsZWZ0ZXEnOidcXHUyMkI0JywndHJpYW5nbGVxJzonXFx1MjI1QycsJ3RyaWFuZ2xlcmlnaHQnOidcXHUyNUI5JywndHJpYW5nbGVyaWdodGVxJzonXFx1MjJCNScsJ3RyaWRvdCc6J1xcdTI1RUMnLCd0cmllJzonXFx1MjI1QycsJ3RyaW1pbnVzJzonXFx1MkEzQScsJ1RyaXBsZURvdCc6J1xcdTIwREInLCd0cmlwbHVzJzonXFx1MkEzOScsJ3RyaXNiJzonXFx1MjlDRCcsJ3RyaXRpbWUnOidcXHUyQTNCJywndHJwZXppdW0nOidcXHUyM0UyJywndHNjcic6J1xcdUQ4MzVcXHVEQ0M5JywnVHNjcic6J1xcdUQ4MzVcXHVEQ0FGJywndHNjeSc6J1xcdTA0NDYnLCdUU2N5JzonXFx1MDQyNicsJ3RzaGN5JzonXFx1MDQ1QicsJ1RTSGN5JzonXFx1MDQwQicsJ3RzdHJvayc6J1xcdTAxNjcnLCdUc3Ryb2snOidcXHUwMTY2JywndHdpeHQnOidcXHUyMjZDJywndHdvaGVhZGxlZnRhcnJvdyc6J1xcdTIxOUUnLCd0d29oZWFkcmlnaHRhcnJvdyc6J1xcdTIxQTAnLCd1YWN1dGUnOidcXHhGQScsJ1VhY3V0ZSc6J1xceERBJywndWFycic6J1xcdTIxOTEnLCd1QXJyJzonXFx1MjFEMScsJ1VhcnInOidcXHUyMTlGJywnVWFycm9jaXInOidcXHUyOTQ5JywndWJyY3knOidcXHUwNDVFJywnVWJyY3knOidcXHUwNDBFJywndWJyZXZlJzonXFx1MDE2RCcsJ1VicmV2ZSc6J1xcdTAxNkMnLCd1Y2lyYyc6J1xceEZCJywnVWNpcmMnOidcXHhEQicsJ3VjeSc6J1xcdTA0NDMnLCdVY3knOidcXHUwNDIzJywndWRhcnInOidcXHUyMUM1JywndWRibGFjJzonXFx1MDE3MScsJ1VkYmxhYyc6J1xcdTAxNzAnLCd1ZGhhcic6J1xcdTI5NkUnLCd1ZmlzaHQnOidcXHUyOTdFJywndWZyJzonXFx1RDgzNVxcdUREMzInLCdVZnInOidcXHVEODM1XFx1REQxOCcsJ3VncmF2ZSc6J1xceEY5JywnVWdyYXZlJzonXFx4RDknLCd1SGFyJzonXFx1Mjk2MycsJ3VoYXJsJzonXFx1MjFCRicsJ3VoYXJyJzonXFx1MjFCRScsJ3VoYmxrJzonXFx1MjU4MCcsJ3VsY29ybic6J1xcdTIzMUMnLCd1bGNvcm5lcic6J1xcdTIzMUMnLCd1bGNyb3AnOidcXHUyMzBGJywndWx0cmknOidcXHUyNUY4JywndW1hY3InOidcXHUwMTZCJywnVW1hY3InOidcXHUwMTZBJywndW1sJzonXFx4QTgnLCdVbmRlckJhcic6J18nLCdVbmRlckJyYWNlJzonXFx1MjNERicsJ1VuZGVyQnJhY2tldCc6J1xcdTIzQjUnLCdVbmRlclBhcmVudGhlc2lzJzonXFx1MjNERCcsJ1VuaW9uJzonXFx1MjJDMycsJ1VuaW9uUGx1cyc6J1xcdTIyOEUnLCd1b2dvbic6J1xcdTAxNzMnLCdVb2dvbic6J1xcdTAxNzInLCd1b3BmJzonXFx1RDgzNVxcdURENjYnLCdVb3BmJzonXFx1RDgzNVxcdURENEMnLCd1cGFycm93JzonXFx1MjE5MScsJ1VwYXJyb3cnOidcXHUyMUQxJywnVXBBcnJvdyc6J1xcdTIxOTEnLCdVcEFycm93QmFyJzonXFx1MjkxMicsJ1VwQXJyb3dEb3duQXJyb3cnOidcXHUyMUM1JywndXBkb3duYXJyb3cnOidcXHUyMTk1JywnVXBkb3duYXJyb3cnOidcXHUyMUQ1JywnVXBEb3duQXJyb3cnOidcXHUyMTk1JywnVXBFcXVpbGlicml1bSc6J1xcdTI5NkUnLCd1cGhhcnBvb25sZWZ0JzonXFx1MjFCRicsJ3VwaGFycG9vbnJpZ2h0JzonXFx1MjFCRScsJ3VwbHVzJzonXFx1MjI4RScsJ1VwcGVyTGVmdEFycm93JzonXFx1MjE5NicsJ1VwcGVyUmlnaHRBcnJvdyc6J1xcdTIxOTcnLCd1cHNpJzonXFx1MDNDNScsJ1Vwc2knOidcXHUwM0QyJywndXBzaWgnOidcXHUwM0QyJywndXBzaWxvbic6J1xcdTAzQzUnLCdVcHNpbG9uJzonXFx1MDNBNScsJ1VwVGVlJzonXFx1MjJBNScsJ1VwVGVlQXJyb3cnOidcXHUyMUE1JywndXB1cGFycm93cyc6J1xcdTIxQzgnLCd1cmNvcm4nOidcXHUyMzFEJywndXJjb3JuZXInOidcXHUyMzFEJywndXJjcm9wJzonXFx1MjMwRScsJ3VyaW5nJzonXFx1MDE2RicsJ1VyaW5nJzonXFx1MDE2RScsJ3VydHJpJzonXFx1MjVGOScsJ3VzY3InOidcXHVEODM1XFx1RENDQScsJ1VzY3InOidcXHVEODM1XFx1RENCMCcsJ3V0ZG90JzonXFx1MjJGMCcsJ3V0aWxkZSc6J1xcdTAxNjknLCdVdGlsZGUnOidcXHUwMTY4JywndXRyaSc6J1xcdTI1QjUnLCd1dHJpZic6J1xcdTI1QjQnLCd1dWFycic6J1xcdTIxQzgnLCd1dW1sJzonXFx4RkMnLCdVdW1sJzonXFx4REMnLCd1d2FuZ2xlJzonXFx1MjlBNycsJ3ZhbmdydCc6J1xcdTI5OUMnLCd2YXJlcHNpbG9uJzonXFx1MDNGNScsJ3ZhcmthcHBhJzonXFx1MDNGMCcsJ3Zhcm5vdGhpbmcnOidcXHUyMjA1JywndmFycGhpJzonXFx1MDNENScsJ3ZhcnBpJzonXFx1MDNENicsJ3ZhcnByb3B0byc6J1xcdTIyMUQnLCd2YXJyJzonXFx1MjE5NScsJ3ZBcnInOidcXHUyMUQ1JywndmFycmhvJzonXFx1MDNGMScsJ3ZhcnNpZ21hJzonXFx1MDNDMicsJ3ZhcnN1YnNldG5lcSc6J1xcdTIyOEFcXHVGRTAwJywndmFyc3Vic2V0bmVxcSc6J1xcdTJBQ0JcXHVGRTAwJywndmFyc3Vwc2V0bmVxJzonXFx1MjI4QlxcdUZFMDAnLCd2YXJzdXBzZXRuZXFxJzonXFx1MkFDQ1xcdUZFMDAnLCd2YXJ0aGV0YSc6J1xcdTAzRDEnLCd2YXJ0cmlhbmdsZWxlZnQnOidcXHUyMkIyJywndmFydHJpYW5nbGVyaWdodCc6J1xcdTIyQjMnLCd2QmFyJzonXFx1MkFFOCcsJ1ZiYXInOidcXHUyQUVCJywndkJhcnYnOidcXHUyQUU5JywndmN5JzonXFx1MDQzMicsJ1ZjeSc6J1xcdTA0MTInLCd2ZGFzaCc6J1xcdTIyQTInLCd2RGFzaCc6J1xcdTIyQTgnLCdWZGFzaCc6J1xcdTIyQTknLCdWRGFzaCc6J1xcdTIyQUInLCdWZGFzaGwnOidcXHUyQUU2JywndmVlJzonXFx1MjIyOCcsJ1ZlZSc6J1xcdTIyQzEnLCd2ZWViYXInOidcXHUyMkJCJywndmVlZXEnOidcXHUyMjVBJywndmVsbGlwJzonXFx1MjJFRScsJ3ZlcmJhcic6J3wnLCdWZXJiYXInOidcXHUyMDE2JywndmVydCc6J3wnLCdWZXJ0JzonXFx1MjAxNicsJ1ZlcnRpY2FsQmFyJzonXFx1MjIyMycsJ1ZlcnRpY2FsTGluZSc6J3wnLCdWZXJ0aWNhbFNlcGFyYXRvcic6J1xcdTI3NTgnLCdWZXJ0aWNhbFRpbGRlJzonXFx1MjI0MCcsJ1ZlcnlUaGluU3BhY2UnOidcXHUyMDBBJywndmZyJzonXFx1RDgzNVxcdUREMzMnLCdWZnInOidcXHVEODM1XFx1REQxOScsJ3ZsdHJpJzonXFx1MjJCMicsJ3Zuc3ViJzonXFx1MjI4MlxcdTIwRDInLCd2bnN1cCc6J1xcdTIyODNcXHUyMEQyJywndm9wZic6J1xcdUQ4MzVcXHVERDY3JywnVm9wZic6J1xcdUQ4MzVcXHVERDREJywndnByb3AnOidcXHUyMjFEJywndnJ0cmknOidcXHUyMkIzJywndnNjcic6J1xcdUQ4MzVcXHVEQ0NCJywnVnNjcic6J1xcdUQ4MzVcXHVEQ0IxJywndnN1Ym5lJzonXFx1MjI4QVxcdUZFMDAnLCd2c3VibkUnOidcXHUyQUNCXFx1RkUwMCcsJ3ZzdXBuZSc6J1xcdTIyOEJcXHVGRTAwJywndnN1cG5FJzonXFx1MkFDQ1xcdUZFMDAnLCdWdmRhc2gnOidcXHUyMkFBJywndnppZ3phZyc6J1xcdTI5OUEnLCd3Y2lyYyc6J1xcdTAxNzUnLCdXY2lyYyc6J1xcdTAxNzQnLCd3ZWRiYXInOidcXHUyQTVGJywnd2VkZ2UnOidcXHUyMjI3JywnV2VkZ2UnOidcXHUyMkMwJywnd2VkZ2VxJzonXFx1MjI1OScsJ3dlaWVycCc6J1xcdTIxMTgnLCd3ZnInOidcXHVEODM1XFx1REQzNCcsJ1dmcic6J1xcdUQ4MzVcXHVERDFBJywnd29wZic6J1xcdUQ4MzVcXHVERDY4JywnV29wZic6J1xcdUQ4MzVcXHVERDRFJywnd3AnOidcXHUyMTE4Jywnd3InOidcXHUyMjQwJywnd3JlYXRoJzonXFx1MjI0MCcsJ3dzY3InOidcXHVEODM1XFx1RENDQycsJ1dzY3InOidcXHVEODM1XFx1RENCMicsJ3hjYXAnOidcXHUyMkMyJywneGNpcmMnOidcXHUyNUVGJywneGN1cCc6J1xcdTIyQzMnLCd4ZHRyaSc6J1xcdTI1QkQnLCd4ZnInOidcXHVEODM1XFx1REQzNScsJ1hmcic6J1xcdUQ4MzVcXHVERDFCJywneGhhcnInOidcXHUyN0Y3JywneGhBcnInOidcXHUyN0ZBJywneGknOidcXHUwM0JFJywnWGknOidcXHUwMzlFJywneGxhcnInOidcXHUyN0Y1JywneGxBcnInOidcXHUyN0Y4JywneG1hcCc6J1xcdTI3RkMnLCd4bmlzJzonXFx1MjJGQicsJ3hvZG90JzonXFx1MkEwMCcsJ3hvcGYnOidcXHVEODM1XFx1REQ2OScsJ1hvcGYnOidcXHVEODM1XFx1REQ0RicsJ3hvcGx1cyc6J1xcdTJBMDEnLCd4b3RpbWUnOidcXHUyQTAyJywneHJhcnInOidcXHUyN0Y2JywneHJBcnInOidcXHUyN0Y5JywneHNjcic6J1xcdUQ4MzVcXHVEQ0NEJywnWHNjcic6J1xcdUQ4MzVcXHVEQ0IzJywneHNxY3VwJzonXFx1MkEwNicsJ3h1cGx1cyc6J1xcdTJBMDQnLCd4dXRyaSc6J1xcdTI1QjMnLCd4dmVlJzonXFx1MjJDMScsJ3h3ZWRnZSc6J1xcdTIyQzAnLCd5YWN1dGUnOidcXHhGRCcsJ1lhY3V0ZSc6J1xceEREJywneWFjeSc6J1xcdTA0NEYnLCdZQWN5JzonXFx1MDQyRicsJ3ljaXJjJzonXFx1MDE3NycsJ1ljaXJjJzonXFx1MDE3NicsJ3ljeSc6J1xcdTA0NEInLCdZY3knOidcXHUwNDJCJywneWVuJzonXFx4QTUnLCd5ZnInOidcXHVEODM1XFx1REQzNicsJ1lmcic6J1xcdUQ4MzVcXHVERDFDJywneWljeSc6J1xcdTA0NTcnLCdZSWN5JzonXFx1MDQwNycsJ3lvcGYnOidcXHVEODM1XFx1REQ2QScsJ1lvcGYnOidcXHVEODM1XFx1REQ1MCcsJ3lzY3InOidcXHVEODM1XFx1RENDRScsJ1lzY3InOidcXHVEODM1XFx1RENCNCcsJ3l1Y3knOidcXHUwNDRFJywnWVVjeSc6J1xcdTA0MkUnLCd5dW1sJzonXFx4RkYnLCdZdW1sJzonXFx1MDE3OCcsJ3phY3V0ZSc6J1xcdTAxN0EnLCdaYWN1dGUnOidcXHUwMTc5JywnemNhcm9uJzonXFx1MDE3RScsJ1pjYXJvbic6J1xcdTAxN0QnLCd6Y3knOidcXHUwNDM3JywnWmN5JzonXFx1MDQxNycsJ3pkb3QnOidcXHUwMTdDJywnWmRvdCc6J1xcdTAxN0InLCd6ZWV0cmYnOidcXHUyMTI4JywnWmVyb1dpZHRoU3BhY2UnOidcXHUyMDBCJywnemV0YSc6J1xcdTAzQjYnLCdaZXRhJzonXFx1MDM5NicsJ3pmcic6J1xcdUQ4MzVcXHVERDM3JywnWmZyJzonXFx1MjEyOCcsJ3poY3knOidcXHUwNDM2JywnWkhjeSc6J1xcdTA0MTYnLCd6aWdyYXJyJzonXFx1MjFERCcsJ3pvcGYnOidcXHVEODM1XFx1REQ2QicsJ1pvcGYnOidcXHUyMTI0JywnenNjcic6J1xcdUQ4MzVcXHVEQ0NGJywnWnNjcic6J1xcdUQ4MzVcXHVEQ0I1JywnendqJzonXFx1MjAwRCcsJ3p3bmonOidcXHUyMDBDJ307XG5cdHZhciBkZWNvZGVNYXBMZWdhY3kgPSB7J2FhY3V0ZSc6J1xceEUxJywnQWFjdXRlJzonXFx4QzEnLCdhY2lyYyc6J1xceEUyJywnQWNpcmMnOidcXHhDMicsJ2FjdXRlJzonXFx4QjQnLCdhZWxpZyc6J1xceEU2JywnQUVsaWcnOidcXHhDNicsJ2FncmF2ZSc6J1xceEUwJywnQWdyYXZlJzonXFx4QzAnLCdhbXAnOicmJywnQU1QJzonJicsJ2FyaW5nJzonXFx4RTUnLCdBcmluZyc6J1xceEM1JywnYXRpbGRlJzonXFx4RTMnLCdBdGlsZGUnOidcXHhDMycsJ2F1bWwnOidcXHhFNCcsJ0F1bWwnOidcXHhDNCcsJ2JydmJhcic6J1xceEE2JywnY2NlZGlsJzonXFx4RTcnLCdDY2VkaWwnOidcXHhDNycsJ2NlZGlsJzonXFx4QjgnLCdjZW50JzonXFx4QTInLCdjb3B5JzonXFx4QTknLCdDT1BZJzonXFx4QTknLCdjdXJyZW4nOidcXHhBNCcsJ2RlZyc6J1xceEIwJywnZGl2aWRlJzonXFx4RjcnLCdlYWN1dGUnOidcXHhFOScsJ0VhY3V0ZSc6J1xceEM5JywnZWNpcmMnOidcXHhFQScsJ0VjaXJjJzonXFx4Q0EnLCdlZ3JhdmUnOidcXHhFOCcsJ0VncmF2ZSc6J1xceEM4JywnZXRoJzonXFx4RjAnLCdFVEgnOidcXHhEMCcsJ2V1bWwnOidcXHhFQicsJ0V1bWwnOidcXHhDQicsJ2ZyYWMxMic6J1xceEJEJywnZnJhYzE0JzonXFx4QkMnLCdmcmFjMzQnOidcXHhCRScsJ2d0JzonPicsJ0dUJzonPicsJ2lhY3V0ZSc6J1xceEVEJywnSWFjdXRlJzonXFx4Q0QnLCdpY2lyYyc6J1xceEVFJywnSWNpcmMnOidcXHhDRScsJ2lleGNsJzonXFx4QTEnLCdpZ3JhdmUnOidcXHhFQycsJ0lncmF2ZSc6J1xceENDJywnaXF1ZXN0JzonXFx4QkYnLCdpdW1sJzonXFx4RUYnLCdJdW1sJzonXFx4Q0YnLCdsYXF1byc6J1xceEFCJywnbHQnOic8JywnTFQnOic8JywnbWFjcic6J1xceEFGJywnbWljcm8nOidcXHhCNScsJ21pZGRvdCc6J1xceEI3JywnbmJzcCc6J1xceEEwJywnbm90JzonXFx4QUMnLCdudGlsZGUnOidcXHhGMScsJ050aWxkZSc6J1xceEQxJywnb2FjdXRlJzonXFx4RjMnLCdPYWN1dGUnOidcXHhEMycsJ29jaXJjJzonXFx4RjQnLCdPY2lyYyc6J1xceEQ0Jywnb2dyYXZlJzonXFx4RjInLCdPZ3JhdmUnOidcXHhEMicsJ29yZGYnOidcXHhBQScsJ29yZG0nOidcXHhCQScsJ29zbGFzaCc6J1xceEY4JywnT3NsYXNoJzonXFx4RDgnLCdvdGlsZGUnOidcXHhGNScsJ090aWxkZSc6J1xceEQ1Jywnb3VtbCc6J1xceEY2JywnT3VtbCc6J1xceEQ2JywncGFyYSc6J1xceEI2JywncGx1c21uJzonXFx4QjEnLCdwb3VuZCc6J1xceEEzJywncXVvdCc6J1wiJywnUVVPVCc6J1wiJywncmFxdW8nOidcXHhCQicsJ3JlZyc6J1xceEFFJywnUkVHJzonXFx4QUUnLCdzZWN0JzonXFx4QTcnLCdzaHknOidcXHhBRCcsJ3N1cDEnOidcXHhCOScsJ3N1cDInOidcXHhCMicsJ3N1cDMnOidcXHhCMycsJ3N6bGlnJzonXFx4REYnLCd0aG9ybic6J1xceEZFJywnVEhPUk4nOidcXHhERScsJ3RpbWVzJzonXFx4RDcnLCd1YWN1dGUnOidcXHhGQScsJ1VhY3V0ZSc6J1xceERBJywndWNpcmMnOidcXHhGQicsJ1VjaXJjJzonXFx4REInLCd1Z3JhdmUnOidcXHhGOScsJ1VncmF2ZSc6J1xceEQ5JywndW1sJzonXFx4QTgnLCd1dW1sJzonXFx4RkMnLCdVdW1sJzonXFx4REMnLCd5YWN1dGUnOidcXHhGRCcsJ1lhY3V0ZSc6J1xceEREJywneWVuJzonXFx4QTUnLCd5dW1sJzonXFx4RkYnfTtcblx0dmFyIGRlY29kZU1hcE51bWVyaWMgPSB7JzAnOidcXHVGRkZEJywnMTI4JzonXFx1MjBBQycsJzEzMCc6J1xcdTIwMUEnLCcxMzEnOidcXHUwMTkyJywnMTMyJzonXFx1MjAxRScsJzEzMyc6J1xcdTIwMjYnLCcxMzQnOidcXHUyMDIwJywnMTM1JzonXFx1MjAyMScsJzEzNic6J1xcdTAyQzYnLCcxMzcnOidcXHUyMDMwJywnMTM4JzonXFx1MDE2MCcsJzEzOSc6J1xcdTIwMzknLCcxNDAnOidcXHUwMTUyJywnMTQyJzonXFx1MDE3RCcsJzE0NSc6J1xcdTIwMTgnLCcxNDYnOidcXHUyMDE5JywnMTQ3JzonXFx1MjAxQycsJzE0OCc6J1xcdTIwMUQnLCcxNDknOidcXHUyMDIyJywnMTUwJzonXFx1MjAxMycsJzE1MSc6J1xcdTIwMTQnLCcxNTInOidcXHUwMkRDJywnMTUzJzonXFx1MjEyMicsJzE1NCc6J1xcdTAxNjEnLCcxNTUnOidcXHUyMDNBJywnMTU2JzonXFx1MDE1MycsJzE1OCc6J1xcdTAxN0UnLCcxNTknOidcXHUwMTc4J307XG5cdHZhciBpbnZhbGlkUmVmZXJlbmNlQ29kZVBvaW50cyA9IFsxLDIsMyw0LDUsNiw3LDgsMTEsMTMsMTQsMTUsMTYsMTcsMTgsMTksMjAsMjEsMjIsMjMsMjQsMjUsMjYsMjcsMjgsMjksMzAsMzEsMTI3LDEyOCwxMjksMTMwLDEzMSwxMzIsMTMzLDEzNCwxMzUsMTM2LDEzNywxMzgsMTM5LDE0MCwxNDEsMTQyLDE0MywxNDQsMTQ1LDE0NiwxNDcsMTQ4LDE0OSwxNTAsMTUxLDE1MiwxNTMsMTU0LDE1NSwxNTYsMTU3LDE1OCwxNTksNjQ5NzYsNjQ5NzcsNjQ5NzgsNjQ5NzksNjQ5ODAsNjQ5ODEsNjQ5ODIsNjQ5ODMsNjQ5ODQsNjQ5ODUsNjQ5ODYsNjQ5ODcsNjQ5ODgsNjQ5ODksNjQ5OTAsNjQ5OTEsNjQ5OTIsNjQ5OTMsNjQ5OTQsNjQ5OTUsNjQ5OTYsNjQ5OTcsNjQ5OTgsNjQ5OTksNjUwMDAsNjUwMDEsNjUwMDIsNjUwMDMsNjUwMDQsNjUwMDUsNjUwMDYsNjUwMDcsNjU1MzQsNjU1MzUsMTMxMDcwLDEzMTA3MSwxOTY2MDYsMTk2NjA3LDI2MjE0MiwyNjIxNDMsMzI3Njc4LDMyNzY3OSwzOTMyMTQsMzkzMjE1LDQ1ODc1MCw0NTg3NTEsNTI0Mjg2LDUyNDI4Nyw1ODk4MjIsNTg5ODIzLDY1NTM1OCw2NTUzNTksNzIwODk0LDcyMDg5NSw3ODY0MzAsNzg2NDMxLDg1MTk2Niw4NTE5NjcsOTE3NTAyLDkxNzUwMyw5ODMwMzgsOTgzMDM5LDEwNDg1NzQsMTA0ODU3NSwxMTE0MTEwLDExMTQxMTFdO1xuXG5cdC8qLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0qL1xuXG5cdHZhciBzdHJpbmdGcm9tQ2hhckNvZGUgPSBTdHJpbmcuZnJvbUNoYXJDb2RlO1xuXG5cdHZhciBvYmplY3QgPSB7fTtcblx0dmFyIGhhc093blByb3BlcnR5ID0gb2JqZWN0Lmhhc093blByb3BlcnR5O1xuXHR2YXIgaGFzID0gZnVuY3Rpb24ob2JqZWN0LCBwcm9wZXJ0eU5hbWUpIHtcblx0XHRyZXR1cm4gaGFzT3duUHJvcGVydHkuY2FsbChvYmplY3QsIHByb3BlcnR5TmFtZSk7XG5cdH07XG5cblx0dmFyIGNvbnRhaW5zID0gZnVuY3Rpb24oYXJyYXksIHZhbHVlKSB7XG5cdFx0dmFyIGluZGV4ID0gLTE7XG5cdFx0dmFyIGxlbmd0aCA9IGFycmF5Lmxlbmd0aDtcblx0XHR3aGlsZSAoKytpbmRleCA8IGxlbmd0aCkge1xuXHRcdFx0aWYgKGFycmF5W2luZGV4XSA9PSB2YWx1ZSkge1xuXHRcdFx0XHRyZXR1cm4gdHJ1ZTtcblx0XHRcdH1cblx0XHR9XG5cdFx0cmV0dXJuIGZhbHNlO1xuXHR9O1xuXG5cdHZhciBtZXJnZSA9IGZ1bmN0aW9uKG9wdGlvbnMsIGRlZmF1bHRzKSB7XG5cdFx0aWYgKCFvcHRpb25zKSB7XG5cdFx0XHRyZXR1cm4gZGVmYXVsdHM7XG5cdFx0fVxuXHRcdHZhciByZXN1bHQgPSB7fTtcblx0XHR2YXIga2V5O1xuXHRcdGZvciAoa2V5IGluIGRlZmF1bHRzKSB7XG5cdFx0XHQvLyBBIGBoYXNPd25Qcm9wZXJ0eWAgY2hlY2sgaXMgbm90IG5lZWRlZCBoZXJlLCBzaW5jZSBvbmx5IHJlY29nbml6ZWRcblx0XHRcdC8vIG9wdGlvbiBuYW1lcyBhcmUgdXNlZCBhbnl3YXkuIEFueSBvdGhlcnMgYXJlIGlnbm9yZWQuXG5cdFx0XHRyZXN1bHRba2V5XSA9IGhhcyhvcHRpb25zLCBrZXkpID8gb3B0aW9uc1trZXldIDogZGVmYXVsdHNba2V5XTtcblx0XHR9XG5cdFx0cmV0dXJuIHJlc3VsdDtcblx0fTtcblxuXHQvLyBNb2RpZmllZCB2ZXJzaW9uIG9mIGB1Y3MyZW5jb2RlYDsgc2VlIGh0dHBzOi8vbXRocy5iZS9wdW55Y29kZS5cblx0dmFyIGNvZGVQb2ludFRvU3ltYm9sID0gZnVuY3Rpb24oY29kZVBvaW50LCBzdHJpY3QpIHtcblx0XHR2YXIgb3V0cHV0ID0gJyc7XG5cdFx0aWYgKChjb2RlUG9pbnQgPj0gMHhEODAwICYmIGNvZGVQb2ludCA8PSAweERGRkYpIHx8IGNvZGVQb2ludCA+IDB4MTBGRkZGKSB7XG5cdFx0XHQvLyBTZWUgaXNzdWUgIzQ6XG5cdFx0XHQvLyDigJxPdGhlcndpc2UsIGlmIHRoZSBudW1iZXIgaXMgaW4gdGhlIHJhbmdlIDB4RDgwMCB0byAweERGRkYgb3IgaXNcblx0XHRcdC8vIGdyZWF0ZXIgdGhhbiAweDEwRkZGRiwgdGhlbiB0aGlzIGlzIGEgcGFyc2UgZXJyb3IuIFJldHVybiBhIFUrRkZGRFxuXHRcdFx0Ly8gUkVQTEFDRU1FTlQgQ0hBUkFDVEVSLuKAnVxuXHRcdFx0aWYgKHN0cmljdCkge1xuXHRcdFx0XHRwYXJzZUVycm9yKCdjaGFyYWN0ZXIgcmVmZXJlbmNlIG91dHNpZGUgdGhlIHBlcm1pc3NpYmxlIFVuaWNvZGUgcmFuZ2UnKTtcblx0XHRcdH1cblx0XHRcdHJldHVybiAnXFx1RkZGRCc7XG5cdFx0fVxuXHRcdGlmIChoYXMoZGVjb2RlTWFwTnVtZXJpYywgY29kZVBvaW50KSkge1xuXHRcdFx0aWYgKHN0cmljdCkge1xuXHRcdFx0XHRwYXJzZUVycm9yKCdkaXNhbGxvd2VkIGNoYXJhY3RlciByZWZlcmVuY2UnKTtcblx0XHRcdH1cblx0XHRcdHJldHVybiBkZWNvZGVNYXBOdW1lcmljW2NvZGVQb2ludF07XG5cdFx0fVxuXHRcdGlmIChzdHJpY3QgJiYgY29udGFpbnMoaW52YWxpZFJlZmVyZW5jZUNvZGVQb2ludHMsIGNvZGVQb2ludCkpIHtcblx0XHRcdHBhcnNlRXJyb3IoJ2Rpc2FsbG93ZWQgY2hhcmFjdGVyIHJlZmVyZW5jZScpO1xuXHRcdH1cblx0XHRpZiAoY29kZVBvaW50ID4gMHhGRkZGKSB7XG5cdFx0XHRjb2RlUG9pbnQgLT0gMHgxMDAwMDtcblx0XHRcdG91dHB1dCArPSBzdHJpbmdGcm9tQ2hhckNvZGUoY29kZVBvaW50ID4+PiAxMCAmIDB4M0ZGIHwgMHhEODAwKTtcblx0XHRcdGNvZGVQb2ludCA9IDB4REMwMCB8IGNvZGVQb2ludCAmIDB4M0ZGO1xuXHRcdH1cblx0XHRvdXRwdXQgKz0gc3RyaW5nRnJvbUNoYXJDb2RlKGNvZGVQb2ludCk7XG5cdFx0cmV0dXJuIG91dHB1dDtcblx0fTtcblxuXHR2YXIgaGV4RXNjYXBlID0gZnVuY3Rpb24oY29kZVBvaW50KSB7XG5cdFx0cmV0dXJuICcmI3gnICsgY29kZVBvaW50LnRvU3RyaW5nKDE2KS50b1VwcGVyQ2FzZSgpICsgJzsnO1xuXHR9O1xuXG5cdHZhciBkZWNFc2NhcGUgPSBmdW5jdGlvbihjb2RlUG9pbnQpIHtcblx0XHRyZXR1cm4gJyYjJyArIGNvZGVQb2ludCArICc7Jztcblx0fTtcblxuXHR2YXIgcGFyc2VFcnJvciA9IGZ1bmN0aW9uKG1lc3NhZ2UpIHtcblx0XHR0aHJvdyBFcnJvcignUGFyc2UgZXJyb3I6ICcgKyBtZXNzYWdlKTtcblx0fTtcblxuXHQvKi0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tKi9cblxuXHR2YXIgZW5jb2RlID0gZnVuY3Rpb24oc3RyaW5nLCBvcHRpb25zKSB7XG5cdFx0b3B0aW9ucyA9IG1lcmdlKG9wdGlvbnMsIGVuY29kZS5vcHRpb25zKTtcblx0XHR2YXIgc3RyaWN0ID0gb3B0aW9ucy5zdHJpY3Q7XG5cdFx0aWYgKHN0cmljdCAmJiByZWdleEludmFsaWRSYXdDb2RlUG9pbnQudGVzdChzdHJpbmcpKSB7XG5cdFx0XHRwYXJzZUVycm9yKCdmb3JiaWRkZW4gY29kZSBwb2ludCcpO1xuXHRcdH1cblx0XHR2YXIgZW5jb2RlRXZlcnl0aGluZyA9IG9wdGlvbnMuZW5jb2RlRXZlcnl0aGluZztcblx0XHR2YXIgdXNlTmFtZWRSZWZlcmVuY2VzID0gb3B0aW9ucy51c2VOYW1lZFJlZmVyZW5jZXM7XG5cdFx0dmFyIGFsbG93VW5zYWZlU3ltYm9scyA9IG9wdGlvbnMuYWxsb3dVbnNhZmVTeW1ib2xzO1xuXHRcdHZhciBlc2NhcGVDb2RlUG9pbnQgPSBvcHRpb25zLmRlY2ltYWwgPyBkZWNFc2NhcGUgOiBoZXhFc2NhcGU7XG5cblx0XHR2YXIgZXNjYXBlQm1wU3ltYm9sID0gZnVuY3Rpb24oc3ltYm9sKSB7XG5cdFx0XHRyZXR1cm4gZXNjYXBlQ29kZVBvaW50KHN5bWJvbC5jaGFyQ29kZUF0KDApKTtcblx0XHR9O1xuXG5cdFx0aWYgKGVuY29kZUV2ZXJ5dGhpbmcpIHtcblx0XHRcdC8vIEVuY29kZSBBU0NJSSBzeW1ib2xzLlxuXHRcdFx0c3RyaW5nID0gc3RyaW5nLnJlcGxhY2UocmVnZXhBc2NpaVdoaXRlbGlzdCwgZnVuY3Rpb24oc3ltYm9sKSB7XG5cdFx0XHRcdC8vIFVzZSBuYW1lZCByZWZlcmVuY2VzIGlmIHJlcXVlc3RlZCAmIHBvc3NpYmxlLlxuXHRcdFx0XHRpZiAodXNlTmFtZWRSZWZlcmVuY2VzICYmIGhhcyhlbmNvZGVNYXAsIHN5bWJvbCkpIHtcblx0XHRcdFx0XHRyZXR1cm4gJyYnICsgZW5jb2RlTWFwW3N5bWJvbF0gKyAnOyc7XG5cdFx0XHRcdH1cblx0XHRcdFx0cmV0dXJuIGVzY2FwZUJtcFN5bWJvbChzeW1ib2wpO1xuXHRcdFx0fSk7XG5cdFx0XHQvLyBTaG9ydGVuIGEgZmV3IGVzY2FwZXMgdGhhdCByZXByZXNlbnQgdHdvIHN5bWJvbHMsIG9mIHdoaWNoIGF0IGxlYXN0IG9uZVxuXHRcdFx0Ly8gaXMgd2l0aGluIHRoZSBBU0NJSSByYW5nZS5cblx0XHRcdGlmICh1c2VOYW1lZFJlZmVyZW5jZXMpIHtcblx0XHRcdFx0c3RyaW5nID0gc3RyaW5nXG5cdFx0XHRcdFx0LnJlcGxhY2UoLyZndDtcXHUyMEQyL2csICcmbnZndDsnKVxuXHRcdFx0XHRcdC5yZXBsYWNlKC8mbHQ7XFx1MjBEMi9nLCAnJm52bHQ7Jylcblx0XHRcdFx0XHQucmVwbGFjZSgvJiN4NjY7JiN4NkE7L2csICcmZmpsaWc7Jyk7XG5cdFx0XHR9XG5cdFx0XHQvLyBFbmNvZGUgbm9uLUFTQ0lJIHN5bWJvbHMuXG5cdFx0XHRpZiAodXNlTmFtZWRSZWZlcmVuY2VzKSB7XG5cdFx0XHRcdC8vIEVuY29kZSBub24tQVNDSUkgc3ltYm9scyB0aGF0IGNhbiBiZSByZXBsYWNlZCB3aXRoIGEgbmFtZWQgcmVmZXJlbmNlLlxuXHRcdFx0XHRzdHJpbmcgPSBzdHJpbmcucmVwbGFjZShyZWdleEVuY29kZU5vbkFzY2lpLCBmdW5jdGlvbihzdHJpbmcpIHtcblx0XHRcdFx0XHQvLyBOb3RlOiB0aGVyZSBpcyBubyBuZWVkIHRvIGNoZWNrIGBoYXMoZW5jb2RlTWFwLCBzdHJpbmcpYCBoZXJlLlxuXHRcdFx0XHRcdHJldHVybiAnJicgKyBlbmNvZGVNYXBbc3RyaW5nXSArICc7Jztcblx0XHRcdFx0fSk7XG5cdFx0XHR9XG5cdFx0XHQvLyBOb3RlOiBhbnkgcmVtYWluaW5nIG5vbi1BU0NJSSBzeW1ib2xzIGFyZSBoYW5kbGVkIG91dHNpZGUgb2YgdGhlIGBpZmAuXG5cdFx0fSBlbHNlIGlmICh1c2VOYW1lZFJlZmVyZW5jZXMpIHtcblx0XHRcdC8vIEFwcGx5IG5hbWVkIGNoYXJhY3RlciByZWZlcmVuY2VzLlxuXHRcdFx0Ly8gRW5jb2RlIGA8PlwiJyZgIHVzaW5nIG5hbWVkIGNoYXJhY3RlciByZWZlcmVuY2VzLlxuXHRcdFx0aWYgKCFhbGxvd1Vuc2FmZVN5bWJvbHMpIHtcblx0XHRcdFx0c3RyaW5nID0gc3RyaW5nLnJlcGxhY2UocmVnZXhFc2NhcGUsIGZ1bmN0aW9uKHN0cmluZykge1xuXHRcdFx0XHRcdHJldHVybiAnJicgKyBlbmNvZGVNYXBbc3RyaW5nXSArICc7JzsgLy8gbm8gbmVlZCB0byBjaGVjayBgaGFzKClgIGhlcmVcblx0XHRcdFx0fSk7XG5cdFx0XHR9XG5cdFx0XHQvLyBTaG9ydGVuIGVzY2FwZXMgdGhhdCByZXByZXNlbnQgdHdvIHN5bWJvbHMsIG9mIHdoaWNoIGF0IGxlYXN0IG9uZSBpc1xuXHRcdFx0Ly8gYDw+XCInJmAuXG5cdFx0XHRzdHJpbmcgPSBzdHJpbmdcblx0XHRcdFx0LnJlcGxhY2UoLyZndDtcXHUyMEQyL2csICcmbnZndDsnKVxuXHRcdFx0XHQucmVwbGFjZSgvJmx0O1xcdTIwRDIvZywgJyZudmx0OycpO1xuXHRcdFx0Ly8gRW5jb2RlIG5vbi1BU0NJSSBzeW1ib2xzIHRoYXQgY2FuIGJlIHJlcGxhY2VkIHdpdGggYSBuYW1lZCByZWZlcmVuY2UuXG5cdFx0XHRzdHJpbmcgPSBzdHJpbmcucmVwbGFjZShyZWdleEVuY29kZU5vbkFzY2lpLCBmdW5jdGlvbihzdHJpbmcpIHtcblx0XHRcdFx0Ly8gTm90ZTogdGhlcmUgaXMgbm8gbmVlZCB0byBjaGVjayBgaGFzKGVuY29kZU1hcCwgc3RyaW5nKWAgaGVyZS5cblx0XHRcdFx0cmV0dXJuICcmJyArIGVuY29kZU1hcFtzdHJpbmddICsgJzsnO1xuXHRcdFx0fSk7XG5cdFx0fSBlbHNlIGlmICghYWxsb3dVbnNhZmVTeW1ib2xzKSB7XG5cdFx0XHQvLyBFbmNvZGUgYDw+XCInJmAgdXNpbmcgaGV4YWRlY2ltYWwgZXNjYXBlcywgbm93IHRoYXQgdGhleeKAmXJlIG5vdCBoYW5kbGVkXG5cdFx0XHQvLyB1c2luZyBuYW1lZCBjaGFyYWN0ZXIgcmVmZXJlbmNlcy5cblx0XHRcdHN0cmluZyA9IHN0cmluZy5yZXBsYWNlKHJlZ2V4RXNjYXBlLCBlc2NhcGVCbXBTeW1ib2wpO1xuXHRcdH1cblx0XHRyZXR1cm4gc3RyaW5nXG5cdFx0XHQvLyBFbmNvZGUgYXN0cmFsIHN5bWJvbHMuXG5cdFx0XHQucmVwbGFjZShyZWdleEFzdHJhbFN5bWJvbHMsIGZ1bmN0aW9uKCQwKSB7XG5cdFx0XHRcdC8vIGh0dHBzOi8vbWF0aGlhc2J5bmVucy5iZS9ub3Rlcy9qYXZhc2NyaXB0LWVuY29kaW5nI3N1cnJvZ2F0ZS1mb3JtdWxhZVxuXHRcdFx0XHR2YXIgaGlnaCA9ICQwLmNoYXJDb2RlQXQoMCk7XG5cdFx0XHRcdHZhciBsb3cgPSAkMC5jaGFyQ29kZUF0KDEpO1xuXHRcdFx0XHR2YXIgY29kZVBvaW50ID0gKGhpZ2ggLSAweEQ4MDApICogMHg0MDAgKyBsb3cgLSAweERDMDAgKyAweDEwMDAwO1xuXHRcdFx0XHRyZXR1cm4gZXNjYXBlQ29kZVBvaW50KGNvZGVQb2ludCk7XG5cdFx0XHR9KVxuXHRcdFx0Ly8gRW5jb2RlIGFueSByZW1haW5pbmcgQk1QIHN5bWJvbHMgdGhhdCBhcmUgbm90IHByaW50YWJsZSBBU0NJSSBzeW1ib2xzXG5cdFx0XHQvLyB1c2luZyBhIGhleGFkZWNpbWFsIGVzY2FwZS5cblx0XHRcdC5yZXBsYWNlKHJlZ2V4Qm1wV2hpdGVsaXN0LCBlc2NhcGVCbXBTeW1ib2wpO1xuXHR9O1xuXHQvLyBFeHBvc2UgZGVmYXVsdCBvcHRpb25zIChzbyB0aGV5IGNhbiBiZSBvdmVycmlkZGVuIGdsb2JhbGx5KS5cblx0ZW5jb2RlLm9wdGlvbnMgPSB7XG5cdFx0J2FsbG93VW5zYWZlU3ltYm9scyc6IGZhbHNlLFxuXHRcdCdlbmNvZGVFdmVyeXRoaW5nJzogZmFsc2UsXG5cdFx0J3N0cmljdCc6IGZhbHNlLFxuXHRcdCd1c2VOYW1lZFJlZmVyZW5jZXMnOiBmYWxzZSxcblx0XHQnZGVjaW1hbCcgOiBmYWxzZVxuXHR9O1xuXG5cdHZhciBkZWNvZGUgPSBmdW5jdGlvbihodG1sLCBvcHRpb25zKSB7XG5cdFx0b3B0aW9ucyA9IG1lcmdlKG9wdGlvbnMsIGRlY29kZS5vcHRpb25zKTtcblx0XHR2YXIgc3RyaWN0ID0gb3B0aW9ucy5zdHJpY3Q7XG5cdFx0aWYgKHN0cmljdCAmJiByZWdleEludmFsaWRFbnRpdHkudGVzdChodG1sKSkge1xuXHRcdFx0cGFyc2VFcnJvcignbWFsZm9ybWVkIGNoYXJhY3RlciByZWZlcmVuY2UnKTtcblx0XHR9XG5cdFx0cmV0dXJuIGh0bWwucmVwbGFjZShyZWdleERlY29kZSwgZnVuY3Rpb24oJDAsICQxLCAkMiwgJDMsICQ0LCAkNSwgJDYsICQ3KSB7XG5cdFx0XHR2YXIgY29kZVBvaW50O1xuXHRcdFx0dmFyIHNlbWljb2xvbjtcblx0XHRcdHZhciBkZWNEaWdpdHM7XG5cdFx0XHR2YXIgaGV4RGlnaXRzO1xuXHRcdFx0dmFyIHJlZmVyZW5jZTtcblx0XHRcdHZhciBuZXh0O1xuXHRcdFx0aWYgKCQxKSB7XG5cdFx0XHRcdC8vIERlY29kZSBkZWNpbWFsIGVzY2FwZXMsIGUuZy4gYCYjMTE5NTU4O2AuXG5cdFx0XHRcdGRlY0RpZ2l0cyA9ICQxO1xuXHRcdFx0XHRzZW1pY29sb24gPSAkMjtcblx0XHRcdFx0aWYgKHN0cmljdCAmJiAhc2VtaWNvbG9uKSB7XG5cdFx0XHRcdFx0cGFyc2VFcnJvcignY2hhcmFjdGVyIHJlZmVyZW5jZSB3YXMgbm90IHRlcm1pbmF0ZWQgYnkgYSBzZW1pY29sb24nKTtcblx0XHRcdFx0fVxuXHRcdFx0XHRjb2RlUG9pbnQgPSBwYXJzZUludChkZWNEaWdpdHMsIDEwKTtcblx0XHRcdFx0cmV0dXJuIGNvZGVQb2ludFRvU3ltYm9sKGNvZGVQb2ludCwgc3RyaWN0KTtcblx0XHRcdH1cblx0XHRcdGlmICgkMykge1xuXHRcdFx0XHQvLyBEZWNvZGUgaGV4YWRlY2ltYWwgZXNjYXBlcywgZS5nLiBgJiN4MUQzMDY7YC5cblx0XHRcdFx0aGV4RGlnaXRzID0gJDM7XG5cdFx0XHRcdHNlbWljb2xvbiA9ICQ0O1xuXHRcdFx0XHRpZiAoc3RyaWN0ICYmICFzZW1pY29sb24pIHtcblx0XHRcdFx0XHRwYXJzZUVycm9yKCdjaGFyYWN0ZXIgcmVmZXJlbmNlIHdhcyBub3QgdGVybWluYXRlZCBieSBhIHNlbWljb2xvbicpO1xuXHRcdFx0XHR9XG5cdFx0XHRcdGNvZGVQb2ludCA9IHBhcnNlSW50KGhleERpZ2l0cywgMTYpO1xuXHRcdFx0XHRyZXR1cm4gY29kZVBvaW50VG9TeW1ib2woY29kZVBvaW50LCBzdHJpY3QpO1xuXHRcdFx0fVxuXHRcdFx0aWYgKCQ1KSB7XG5cdFx0XHRcdC8vIERlY29kZSBuYW1lZCBjaGFyYWN0ZXIgcmVmZXJlbmNlcyB3aXRoIHRyYWlsaW5nIGA7YCwgZS5nLiBgJmNvcHk7YC5cblx0XHRcdFx0cmVmZXJlbmNlID0gJDU7XG5cdFx0XHRcdGlmIChoYXMoZGVjb2RlTWFwLCByZWZlcmVuY2UpKSB7XG5cdFx0XHRcdFx0cmV0dXJuIGRlY29kZU1hcFtyZWZlcmVuY2VdO1xuXHRcdFx0XHR9IGVsc2Uge1xuXHRcdFx0XHRcdC8vIEFtYmlndW91cyBhbXBlcnNhbmQuIGh0dHBzOi8vbXRocy5iZS9ub3Rlcy9hbWJpZ3VvdXMtYW1wZXJzYW5kc1xuXHRcdFx0XHRcdGlmIChzdHJpY3QpIHtcblx0XHRcdFx0XHRcdHBhcnNlRXJyb3IoXG5cdFx0XHRcdFx0XHRcdCduYW1lZCBjaGFyYWN0ZXIgcmVmZXJlbmNlIHdhcyBub3QgdGVybWluYXRlZCBieSBhIHNlbWljb2xvbidcblx0XHRcdFx0XHRcdCk7XG5cdFx0XHRcdFx0fVxuXHRcdFx0XHRcdHJldHVybiAkMDtcblx0XHRcdFx0fVxuXHRcdFx0fVxuXHRcdFx0Ly8gSWYgd2XigJlyZSBzdGlsbCBoZXJlLCBpdOKAmXMgYSBsZWdhY3kgcmVmZXJlbmNlIGZvciBzdXJlLiBObyBuZWVkIGZvciBhblxuXHRcdFx0Ly8gZXh0cmEgYGlmYCBjaGVjay5cblx0XHRcdC8vIERlY29kZSBuYW1lZCBjaGFyYWN0ZXIgcmVmZXJlbmNlcyB3aXRob3V0IHRyYWlsaW5nIGA7YCwgZS5nLiBgJmFtcGBcblx0XHRcdC8vIFRoaXMgaXMgb25seSBhIHBhcnNlIGVycm9yIGlmIGl0IGdldHMgY29udmVydGVkIHRvIGAmYCwgb3IgaWYgaXQgaXNcblx0XHRcdC8vIGZvbGxvd2VkIGJ5IGA9YCBpbiBhbiBhdHRyaWJ1dGUgY29udGV4dC5cblx0XHRcdHJlZmVyZW5jZSA9ICQ2O1xuXHRcdFx0bmV4dCA9ICQ3O1xuXHRcdFx0aWYgKG5leHQgJiYgb3B0aW9ucy5pc0F0dHJpYnV0ZVZhbHVlKSB7XG5cdFx0XHRcdGlmIChzdHJpY3QgJiYgbmV4dCA9PSAnPScpIHtcblx0XHRcdFx0XHRwYXJzZUVycm9yKCdgJmAgZGlkIG5vdCBzdGFydCBhIGNoYXJhY3RlciByZWZlcmVuY2UnKTtcblx0XHRcdFx0fVxuXHRcdFx0XHRyZXR1cm4gJDA7XG5cdFx0XHR9IGVsc2Uge1xuXHRcdFx0XHRpZiAoc3RyaWN0KSB7XG5cdFx0XHRcdFx0cGFyc2VFcnJvcihcblx0XHRcdFx0XHRcdCduYW1lZCBjaGFyYWN0ZXIgcmVmZXJlbmNlIHdhcyBub3QgdGVybWluYXRlZCBieSBhIHNlbWljb2xvbidcblx0XHRcdFx0XHQpO1xuXHRcdFx0XHR9XG5cdFx0XHRcdC8vIE5vdGU6IHRoZXJlIGlzIG5vIG5lZWQgdG8gY2hlY2sgYGhhcyhkZWNvZGVNYXBMZWdhY3ksIHJlZmVyZW5jZSlgLlxuXHRcdFx0XHRyZXR1cm4gZGVjb2RlTWFwTGVnYWN5W3JlZmVyZW5jZV0gKyAobmV4dCB8fCAnJyk7XG5cdFx0XHR9XG5cdFx0fSk7XG5cdH07XG5cdC8vIEV4cG9zZSBkZWZhdWx0IG9wdGlvbnMgKHNvIHRoZXkgY2FuIGJlIG92ZXJyaWRkZW4gZ2xvYmFsbHkpLlxuXHRkZWNvZGUub3B0aW9ucyA9IHtcblx0XHQnaXNBdHRyaWJ1dGVWYWx1ZSc6IGZhbHNlLFxuXHRcdCdzdHJpY3QnOiBmYWxzZVxuXHR9O1xuXG5cdHZhciBlc2NhcGUgPSBmdW5jdGlvbihzdHJpbmcpIHtcblx0XHRyZXR1cm4gc3RyaW5nLnJlcGxhY2UocmVnZXhFc2NhcGUsIGZ1bmN0aW9uKCQwKSB7XG5cdFx0XHQvLyBOb3RlOiB0aGVyZSBpcyBubyBuZWVkIHRvIGNoZWNrIGBoYXMoZXNjYXBlTWFwLCAkMClgIGhlcmUuXG5cdFx0XHRyZXR1cm4gZXNjYXBlTWFwWyQwXTtcblx0XHR9KTtcblx0fTtcblxuXHQvKi0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tKi9cblxuXHR2YXIgaGUgPSB7XG5cdFx0J3ZlcnNpb24nOiAnMS4xLjEnLFxuXHRcdCdlbmNvZGUnOiBlbmNvZGUsXG5cdFx0J2RlY29kZSc6IGRlY29kZSxcblx0XHQnZXNjYXBlJzogZXNjYXBlLFxuXHRcdCd1bmVzY2FwZSc6IGRlY29kZVxuXHR9O1xuXG5cdC8vIFNvbWUgQU1EIGJ1aWxkIG9wdGltaXplcnMsIGxpa2Ugci5qcywgY2hlY2sgZm9yIHNwZWNpZmljIGNvbmRpdGlvbiBwYXR0ZXJuc1xuXHQvLyBsaWtlIHRoZSBmb2xsb3dpbmc6XG5cdGlmIChcblx0XHR0eXBlb2YgZGVmaW5lID09ICdmdW5jdGlvbicgJiZcblx0XHR0eXBlb2YgZGVmaW5lLmFtZCA9PSAnb2JqZWN0JyAmJlxuXHRcdGRlZmluZS5hbWRcblx0KSB7XG5cdFx0ZGVmaW5lKGZ1bmN0aW9uKCkge1xuXHRcdFx0cmV0dXJuIGhlO1xuXHRcdH0pO1xuXHR9XHRlbHNlIGlmIChmcmVlRXhwb3J0cyAmJiAhZnJlZUV4cG9ydHMubm9kZVR5cGUpIHtcblx0XHRpZiAoZnJlZU1vZHVsZSkgeyAvLyBpbiBOb2RlLmpzLCBpby5qcywgb3IgUmluZ29KUyB2MC44LjArXG5cdFx0XHRmcmVlTW9kdWxlLmV4cG9ydHMgPSBoZTtcblx0XHR9IGVsc2UgeyAvLyBpbiBOYXJ3aGFsIG9yIFJpbmdvSlMgdjAuNy4wLVxuXHRcdFx0Zm9yICh2YXIga2V5IGluIGhlKSB7XG5cdFx0XHRcdGhhcyhoZSwga2V5KSAmJiAoZnJlZUV4cG9ydHNba2V5XSA9IGhlW2tleV0pO1xuXHRcdFx0fVxuXHRcdH1cblx0fSBlbHNlIHsgLy8gaW4gUmhpbm8gb3IgYSB3ZWIgYnJvd3NlclxuXHRcdHJvb3QuaGUgPSBoZTtcblx0fVxuXG59KHRoaXMpKTtcblxufSkuY2FsbCh0aGlzLHR5cGVvZiBzZWxmICE9PSBcInVuZGVmaW5lZFwiID8gc2VsZiA6IHR5cGVvZiB3aW5kb3cgIT09IFwidW5kZWZpbmVkXCIgPyB3aW5kb3cgOiB7fSkiLCJleHBvcnRzLnJlYWQgPSBmdW5jdGlvbiAoYnVmZmVyLCBvZmZzZXQsIGlzTEUsIG1MZW4sIG5CeXRlcykge1xuICB2YXIgZSwgbVxuICB2YXIgZUxlbiA9IChuQnl0ZXMgKiA4KSAtIG1MZW4gLSAxXG4gIHZhciBlTWF4ID0gKDEgPDwgZUxlbikgLSAxXG4gIHZhciBlQmlhcyA9IGVNYXggPj4gMVxuICB2YXIgbkJpdHMgPSAtN1xuICB2YXIgaSA9IGlzTEUgPyAobkJ5dGVzIC0gMSkgOiAwXG4gIHZhciBkID0gaXNMRSA/IC0xIDogMVxuICB2YXIgcyA9IGJ1ZmZlcltvZmZzZXQgKyBpXVxuXG4gIGkgKz0gZFxuXG4gIGUgPSBzICYgKCgxIDw8ICgtbkJpdHMpKSAtIDEpXG4gIHMgPj49ICgtbkJpdHMpXG4gIG5CaXRzICs9IGVMZW5cbiAgZm9yICg7IG5CaXRzID4gMDsgZSA9IChlICogMjU2KSArIGJ1ZmZlcltvZmZzZXQgKyBpXSwgaSArPSBkLCBuQml0cyAtPSA4KSB7fVxuXG4gIG0gPSBlICYgKCgxIDw8ICgtbkJpdHMpKSAtIDEpXG4gIGUgPj49ICgtbkJpdHMpXG4gIG5CaXRzICs9IG1MZW5cbiAgZm9yICg7IG5CaXRzID4gMDsgbSA9IChtICogMjU2KSArIGJ1ZmZlcltvZmZzZXQgKyBpXSwgaSArPSBkLCBuQml0cyAtPSA4KSB7fVxuXG4gIGlmIChlID09PSAwKSB7XG4gICAgZSA9IDEgLSBlQmlhc1xuICB9IGVsc2UgaWYgKGUgPT09IGVNYXgpIHtcbiAgICByZXR1cm4gbSA/IE5hTiA6ICgocyA/IC0xIDogMSkgKiBJbmZpbml0eSlcbiAgfSBlbHNlIHtcbiAgICBtID0gbSArIE1hdGgucG93KDIsIG1MZW4pXG4gICAgZSA9IGUgLSBlQmlhc1xuICB9XG4gIHJldHVybiAocyA/IC0xIDogMSkgKiBtICogTWF0aC5wb3coMiwgZSAtIG1MZW4pXG59XG5cbmV4cG9ydHMud3JpdGUgPSBmdW5jdGlvbiAoYnVmZmVyLCB2YWx1ZSwgb2Zmc2V0LCBpc0xFLCBtTGVuLCBuQnl0ZXMpIHtcbiAgdmFyIGUsIG0sIGNcbiAgdmFyIGVMZW4gPSAobkJ5dGVzICogOCkgLSBtTGVuIC0gMVxuICB2YXIgZU1heCA9ICgxIDw8IGVMZW4pIC0gMVxuICB2YXIgZUJpYXMgPSBlTWF4ID4+IDFcbiAgdmFyIHJ0ID0gKG1MZW4gPT09IDIzID8gTWF0aC5wb3coMiwgLTI0KSAtIE1hdGgucG93KDIsIC03NykgOiAwKVxuICB2YXIgaSA9IGlzTEUgPyAwIDogKG5CeXRlcyAtIDEpXG4gIHZhciBkID0gaXNMRSA/IDEgOiAtMVxuICB2YXIgcyA9IHZhbHVlIDwgMCB8fCAodmFsdWUgPT09IDAgJiYgMSAvIHZhbHVlIDwgMCkgPyAxIDogMFxuXG4gIHZhbHVlID0gTWF0aC5hYnModmFsdWUpXG5cbiAgaWYgKGlzTmFOKHZhbHVlKSB8fCB2YWx1ZSA9PT0gSW5maW5pdHkpIHtcbiAgICBtID0gaXNOYU4odmFsdWUpID8gMSA6IDBcbiAgICBlID0gZU1heFxuICB9IGVsc2Uge1xuICAgIGUgPSBNYXRoLmZsb29yKE1hdGgubG9nKHZhbHVlKSAvIE1hdGguTE4yKVxuICAgIGlmICh2YWx1ZSAqIChjID0gTWF0aC5wb3coMiwgLWUpKSA8IDEpIHtcbiAgICAgIGUtLVxuICAgICAgYyAqPSAyXG4gICAgfVxuICAgIGlmIChlICsgZUJpYXMgPj0gMSkge1xuICAgICAgdmFsdWUgKz0gcnQgLyBjXG4gICAgfSBlbHNlIHtcbiAgICAgIHZhbHVlICs9IHJ0ICogTWF0aC5wb3coMiwgMSAtIGVCaWFzKVxuICAgIH1cbiAgICBpZiAodmFsdWUgKiBjID49IDIpIHtcbiAgICAgIGUrK1xuICAgICAgYyAvPSAyXG4gICAgfVxuXG4gICAgaWYgKGUgKyBlQmlhcyA+PSBlTWF4KSB7XG4gICAgICBtID0gMFxuICAgICAgZSA9IGVNYXhcbiAgICB9IGVsc2UgaWYgKGUgKyBlQmlhcyA+PSAxKSB7XG4gICAgICBtID0gKCh2YWx1ZSAqIGMpIC0gMSkgKiBNYXRoLnBvdygyLCBtTGVuKVxuICAgICAgZSA9IGUgKyBlQmlhc1xuICAgIH0gZWxzZSB7XG4gICAgICBtID0gdmFsdWUgKiBNYXRoLnBvdygyLCBlQmlhcyAtIDEpICogTWF0aC5wb3coMiwgbUxlbilcbiAgICAgIGUgPSAwXG4gICAgfVxuICB9XG5cbiAgZm9yICg7IG1MZW4gPj0gODsgYnVmZmVyW29mZnNldCArIGldID0gbSAmIDB4ZmYsIGkgKz0gZCwgbSAvPSAyNTYsIG1MZW4gLT0gOCkge31cblxuICBlID0gKGUgPDwgbUxlbikgfCBtXG4gIGVMZW4gKz0gbUxlblxuICBmb3IgKDsgZUxlbiA+IDA7IGJ1ZmZlcltvZmZzZXQgKyBpXSA9IGUgJiAweGZmLCBpICs9IGQsIGUgLz0gMjU2LCBlTGVuIC09IDgpIHt9XG5cbiAgYnVmZmVyW29mZnNldCArIGkgLSBkXSB8PSBzICogMTI4XG59XG4iLCJyZXF1aXJlKFwiZmEtbm9kZWpzL2JlYXV0aWZ5XCIpO1xuIl19
