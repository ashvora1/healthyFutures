(function(){

emis.mobile.WindowsStorage = function () {

	var _getCacheCallback = "EMIS_GetCache";
	var _setItemCallback = "EMIS_SetItem";
	var _getEncryptedDocumentCallback = "EMIS_GetEncryptedDocument";
	var _removeItemCallback = "EMIS_RemoveItem";
	var _removeAllCallback = "EMIS_RemoveAll";
	var _setGlobalItemCallback = "EMIS_SetGlobalItem";
	var _getGlobalItemCallback = "EMIS_GetGlobalItem";
	var _removeGlobalItemCallback = "EMIS_RemoveGlobalItem";
	var _downloadDocumentCallback = "EMIS_DownloadDocument";
	var _openDocumentCallback = "EMIS_OpenDocument";
	var _isItemPresentCallback = "EMIS_IsItemPresent";
	var _sendRequestCallback = "EMIS_SendRequest";
	var _sendGeolocationRequestCallback = "EMIS_Geolocation";

	EMIS_Windows_Callback = function( obj ) {
		if ( !obj ) {
			emis.mobile.console.warn("no obj returned");
			return;
		}

		obj = JSON.parse( obj );

		var bSuccess = false;
		if ( obj.status === true ) {
			bSuccess = true;
		}

		var key = obj.key;
		var reason = obj.reason;
		var response = obj.response;
		if ( response && response === "false" ) {
			response = false;
		}
		var deferred = main.windowsDeferreds[ obj.method ];

		if ( deferred && key ) {
			deferred = deferred[ key ];
		}
		if ( deferred ) {
			if ( bSuccess ) {
				deferred.resolve( response );
			} else {
				deferred.reject( response );
			}
			delete deferred;
		}
	}

	function callNative( method, parameters ) {
		var parametersObject = {};
		if ( parameters ) {
			for ( var i = 0; i < parameters.length; i++ ) {
				parametersObject[ "param" + i ] = parameters[i];
			}
		}
		var object = {
			"method" : method
		};
		if ( parameters ) {
			object.parameters = parametersObject;
		}
		window.external.notify( JSON.stringify( object ) );
	};

	this.setItem = function(key, val, bEncrypt){
		if ( ! bEncrypt ) {
			bEncrypt = false;
		}
		callNative( _setItemCallback, [ key, val, true, bEncrypt ] );
	};

	this.setGlobalItem = function(key, val){
		callNative( _setGlobalItemCallback, [ key, val ] );
	};

	this.getItem = function(key){
		//EMIS.getItem(key);
	};

	this.getGlobalItem = function(key){
		//callNative( _getGlobalItemCallback, [ key ] );
	};

	this.removeItem = function (key, delegate) {
		var obj = main.windowsDeferreds[ _removeItemCallback ];
		if ( ! obj ) {
			obj = {};
			main.windowsDeferreds[ _removeItemCallback ] = obj;
		}
		obj[ key ] = delegate;
		callNative( _removeItemCallback, [ key ] );
	} ;

	this.removeGlobalItem = function (key, delegate) {
		callNative( _removeGlobalItemCallback, [ key ] );
	} ;

	this.clear = function(delegate){
		main.windowsDeferreds[ _removeAllCallback ] = delegate;
		callNative( _removeAllCallback, [ ] );
	};

	// get all the data from native frame storage and put it into local memory
	this.getCache = function (delegate) {
		main.windowsDeferreds[ _getCacheCallback ] = delegate;
		callNative( _getCacheCallback, [ ] );
	} ;

	this.isDocumentPresent = function(key, delegate){
		var obj = main.windowsDeferreds[ _isItemPresentCallback ];
		if ( ! obj ) {
			obj = {};
			main.windowsDeferreds[ _isItemPresentCallback ] = obj;
		}
		obj[ key ] = delegate;
		callNative( _isItemPresentCallback, [ key ] );
	};

	this.getDocument = function(key, delegate){
		var obj = main.windowsDeferreds[ _getEncryptedDocumentCallback ];
		if ( ! obj ) {
			obj = {};
			main.windowsDeferreds[ _getEncryptedDocumentCallback ] = obj;
		}
		obj[ key ] = delegate;
		callNative( _getEncryptedDocumentCallback, [ key ] );
	};

	this.saveDocument = function(key, data, delegate){
		//
	};

	this.downloadDocument = function( attachmentId, patientId, slotId, fileType, sharingOrganisationId, delegate ) {
		var obj = main.windowsDeferreds[ _downloadDocumentCallback ];
		if ( ! obj ) {
			obj = {};
			main.windowsDeferreds[ _downloadDocumentCallback ] = obj;
		}
		obj[ attachmentId ] = delegate;
		callNative( _downloadDocumentCallback, [ attachmentId, patientId, slotId, fileType, sharingOrganisationId ] );
	};

	this.openDocument = function( attachmentId, patientName, date, size, type, associatedText, source, delegate, slotId ) {
		var obj = main.windowsDeferreds[ _openDocumentCallback ];
		if ( ! obj ) {
			obj = {};
			main.windowsDeferreds[ _openDocumentCallback ] = obj;
		}
		obj[ attachmentId ] = delegate;
		callNative( _openDocumentCallback, [ attachmentId, patientName, date, size, type, associatedText, source ] );
	};

	this.goToLoginPage = function() {
		callNative( "EMIS_GoToLoginScreen", [ ] );
	};

	this.informPageLoaded = function() {
		callNative( "EMIS_PageLoaded", [ ] );
	};

	this.setSessionResponse = function( response ) {
		callNative( "EMIS_SetSessionResponse", [ response ] );
	};

	this.log = function( message ) {
		callNative( "log", [ message ] );
	};

	this.error = function( message ) {
		callNative( "error", [ message ] );
	};

	this.sendRequest = function( method, url, parameters, delegate ) {
		main.windowsDeferreds[ _sendRequestCallback ] = delegate;
		callNative( _sendRequestCallback, [ method, url, parameters ] );
	};

	this.requestGeolocation = function( delegate ) {
		main.windowsDeferreds[ _sendGeolocationRequestCallback ] = delegate;
		callNative( _sendGeolocationRequestCallback, [ ] );
	};
}

})() ;
