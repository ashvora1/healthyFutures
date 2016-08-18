/*
Copyright �� 2013 Danny Moules <opensource@rushyo.com>

This work is free. You can redistribute it and/or modify it under the terms of the
Do What The Fuck You Want To Public License, Version 2, as published by Sam Hocevar.
See http://www.wtfpl.net/ for more details.

USAGE:

var hexString = hotpToolkit.getBigEndianInt64Hex(jsNum);
var word = hotpToolkit.getWordAtByteOffset(hash.words, byteOffset);
*/

/* jshint bitwise: false */

var hotpToolkit = hotpToolkit || {};

hotpToolkit.splitNum = function (n) {
return {
hi : Math.floor(n / 4294967296),
lo : (n & 0xFFFFFFFF) >>> 0
};
};

hotpToolkit.getBigEndianInt64 = function (hi, lo) {
var i = [];
for(var b = 0; b < 4; b++) {
i[7-b] = (lo >> (b*8)) & 0xFF;
i[3-b] = (hi >> (b*8)) & 0xFF;
}
return i;
};

hotpToolkit.getBigEndianInt64Hex = function (jsNum) {
   var words = hotpToolkit.splitNum(jsNum);
   var binArray = hotpToolkit.getBigEndianInt64(words.hi, words.lo);
var hexString = "";
for(var i = 0; i < 8; i++) {
var s = binArray[i].toString(16);
if(s.length < 2) {
s = "0"+s;
}
hexString += s;
}

return hexString;
};

hotpToolkit.getWordAtByteOffset = function (hash, offset) {
var word = 0;
var preWord = Math.floor(offset / 4);
var sufWord = preWord + 1;
var rem = offset % 4;
var preTake = 4 - rem;
var sufTake = 4 - preTake;

var b;
for(var p = 0; p < preTake; p++) {
b = (hash[preWord] >> (p*8)) & 0xFF;
word = word | (b << (p+rem)*8);
}

for(var s = 0; s < sufTake; s++) {
b = (hash[sufWord] >> ((3-s)*8)) & 0xFF;
word = word | (b << (rem-1-s)*8);
}

//(Redundant) Inverse
word = ((word & 0xFF) << 24) | ((word & 0xFF00) << 8) | ((word >> 8) & 0xFF00) | ((word >> 24) & 0xFF);

return word;
};

hotpToolkit.debugRenderWord = function (word) {
var a = (word & 0xFF).toString(16);
var b = (word >> 8 & 0xFF).toString(16);
var c = (word >> 16 & 0xFF).toString(16);
var d = (word >> 24 & 0xFF).toString(16);
alert(a + " " + b + " " + c + " " + d);
};