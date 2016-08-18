/*
Copyright �� EMIS Ltd 2013
Author: Danny Moules <danny.moules@e-mis.com>
*/

/* jshint bitwise: false */

var TOTP = TOTP || {};

TOTP._digits = 8;
TOTP._timeStep = 30;
TOTP._moduloConstants = [ 1, 10, 100, 1000, 10000, 100000, 1000000, 10000000, 100000000, 1000000000 ] ;

TOTP.dynamicallyTruncate = function (hash) {
var offset = hash[hash.length - 1] & 0x0000000F;
var offsetWord = hotpToolkit.getWordAtByteOffset(hash, offset);
   var binCode = (offsetWord & 0x7F) << 24 | ((offsetWord >> 8) & 0xFF) << 16 | ((offsetWord >> 16) & 0xFF) << 8 | ((offsetWord >> 24) & 0xFF);
return binCode % TOTP._moduloConstants[TOTP._digits];
};

TOTP.generateCode = function (sharedSecret, dateObj) {
	var words = CryptoJS.enc.Hex.parse(sharedSecret);
	var timestamp = Math.floor((dateObj.getTime() / 1000) / TOTP._timeStep);
	var bigEndianInt64Hex = hotpToolkit.getBigEndianInt64Hex(timestamp);
	var msg = CryptoJS.enc.Hex.parse(bigEndianInt64Hex);
	var hash = CryptoJS.HmacSHA512(msg, words);
	var code = TOTP.dynamicallyTruncate(hash.words);
	code = ""+code;
	while (code.length < TOTP._digits) {
	       code = '0'+code;
	   }
	return code;
};