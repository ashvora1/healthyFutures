/**
 * Encryptor class Functionalities provided: Encrypt the input text Decrypt the encrypted input text
 */

(function () {

var cacheEnc = {} ; // encoder cache orig:enc
var cacheDec = {} ; // decoder cache enc:orig

emis.mobile.Encryptor = function( ) {
	
}

emis.mobile.Encryptor.prototype.encrypt = function( text, key ) {

	if (cacheEnc[text] === undefined) {
		cacheEnc[text] = GibberishAES.enc( text, key );
		cacheDec[cacheEnc[text]] = text ;
	}
	return cacheEnc[text] ;
} ;

emis.mobile.Encryptor.prototype.decrypt = function( encText, key ) {
	if ( encText != null ) {
		if (cacheDec[encText] === undefined) {
			cacheDec[encText] = GibberishAES.dec( encText, key );
		}
		return cacheDec[encText] ;
	} else {
		return null;
	}
} ;

emis.mobile.Encryptor.prototype.encryptDoc = function( text, key, id ) {
	var result = CryptoJS.AES.encrypt( text, key );
	return result.toString( );
}

emis.mobile.Encryptor.prototype.decryptDoc = function( text, key, id ) {
	var bSuccess = false;
	var counter = 0;
	main.controller.docTime = new Date( ).getTime( );
	while ( !bSuccess && counter < 50 ) {
		try {
			resultTmp = CryptoJS.AES.decrypt( text, key );
			result = resultTmp.toString( CryptoJS.enc.Utf8 );
			bSuccess = true;
			
		} catch ( e ) {
			counter = counter + 1;
		}
	}
	
	return result;
}
/**
 * To hash code the password with the cdb, as recommended.
 */
emis.mobile.Encryptor.prototype.hashPassword = function( password, username ) {
	var hash1 = CryptoJS.SHA256( password );
	var hash2 = CryptoJS.SHA256( hash1 + username );
	var result = hash2.toString( CryptoJS.enc.Base64 );
	return result;
}
/**
 * Used to differ password and encryption key
 */

emis.mobile.Encryptor.prototype.prepareKey = function( message ) {
	return CryptoJS.SHA256( message.substr( 1 ) ).toString( CryptoJS.enc.Base64 );
}

emis.mobile.Encryptor.prototype.generateEncryptionKeyForJSON = function( hashedPassword, username ) {
	var hash1 = CryptoJS.SHA256( hashedPassword );
	var hash2 = CryptoJS.SHA256( username + hash1 );
	var result = hash2.toString( CryptoJS.enc.Base64 );
	return result;
}
}) () ;
