(function(){

emis.mobile.AndroidStorage = function () {

	var deferreds = [];

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

	deferreds[ _setItemCallback ] = [];
	deferreds[ _getEncryptedDocumentCallback ] = [];
	deferreds[ _removeItemCallback ] = [];
	deferreds[ _setGlobalItemCallback ] = [];
	deferreds[ _getGlobalItemCallback ] = [];
	deferreds[ _removeGlobalItemCallback ] = [];
	deferreds[ _downloadDocumentCallback ] = [];
	deferreds[ _openDocumentCallback ] = [];
	deferreds[ _isItemPresentCallback ] = [];

	EMIS_Android_Callback = function( obj ) {
		if ( !obj ) {
			emis.mobile.console.warn("no obj returned");
			return;
		}

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
		var deferred = deferreds[ obj.method ];

		//emis.mobile.console.log("key: " + key + ";method: " + obj.method + " ;response: " + response );
		if ( deferred && key ) {
			deferred = deferred[ key ];
		}
		if ( deferred ) {
			if ( bSuccess && obj.method == _getCacheCallback ) {
				response = JSON.parse( EMIS.EMIS_GetResponse() );
			}
			if ( bSuccess ) {
				deferred.resolve( response );
			} else {
				deferred.reject( response );
			}
			delete deferred;
		}
	}

	this.setItem = function(key, val, bEncrypt){
		if ( ! bEncrypt ) {
			bEncrypt = false;
		}
		EMIS.EMIS_SetItem(key, val, true, bEncrypt);
		// TODO: callback if error?
	};

	this.setGlobalItem = function(key, val){
		EMIS.EMIS_SetGlobalItem(key, val);
		// TODO: callback if error?
	};

	this.getItem = function(key){
		//EMIS.getItem(key);
	};

	this.getGlobalItem = function(key){
		EMIS.EMIS_GetGlobalItem(key);
		// TODO: callback
	};

	this.removeItem = function (key, delegate) {
		deferreds[ _removeItemCallback ][ key ] = delegate;
		EMIS.EMIS_RemoveItem(key);
	} ;

	this.removeGlobalItem = function (key, delegate) {
		deferreds[ _removeGlobalItemCallback ][ key ] = delegate;
		EMIS.EMIS_RemoveGlobalItem(key) ;
	} ;

	this.clear = function(delegate){
		deferreds[ _removeAllCallback ] = delegate;
		EMIS.EMIS_RemoveAll();
	};

	// get all the data from native frame storage and put it into local memory
	this.getCache = function (delegate) {
		deferreds[ _getCacheCallback ] = delegate;
		EMIS.EMIS_GetCache();
	} ;

	this.isDocumentPresent = function(key, delegate){
		deferreds[ _isItemPresentCallback ][ key ] = delegate;
		EMIS.EMIS_IsItemPresent(key);
	};

	this.getDocument = function(key, delegate){
		deferreds[ _getEncryptedDocumentCallback ][ key ] = delegate;
		EMIS.EMIS_GetEncryptedDocument(key);
	};

	this.saveDocument = function(key, data, delegate){
		//
	};

	this.downloadDocument = function( attachmentId, patientId, slotId, fileType, sharingOrganisationId, delegate ) {
		deferreds[ _downloadDocumentCallback ][ attachmentId ] = delegate;
		EMIS.EMIS_DownloadDocument( attachmentId, patientId, slotId, fileType, sharingOrganisationId );
	};

	this.openDocument = function( attachmentId, patientName, date, size, type, associatedText, source, delegate, slotId ) {
		deferreds[ _openDocumentCallback ][ attachmentId ] = delegate;
		EMIS.EMIS_OpenDocument( attachmentId, patientName, date, size, type, associatedText, source, slotId );
	};

	this.goToLoginPage = function() {
		EMIS.EMIS_GoToLoginScreen();
	};

	this.setSessionResponse = function( response ) {
		EMIS.EMIS_SetSessionResponse( response );
	};
}

})() ;

