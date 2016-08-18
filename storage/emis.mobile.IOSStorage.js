(function(){

var pluginName = 'NativePlugin' ;

emis.mobile.IOSStorage = function () {

	this.setItem = function(key,val, bEncrypt, delegate){
		if ( ! bEncrypt ) {
			bEncrypt = false;
		}
		cordova.exec(
			function (data) {
				//delegate.done(key,val);
			},
			// Register the errorHandler
			function (err) {
				//delegate.fail(err);
			},
			pluginName,
			'setItem',
			[key, val, true, bEncrypt]
		);
	};

	this.setGlobalItem = function(key,val,delegate){
		cordova.exec(
			function (data) {
				//delegate.done(key,val);
			},
			// Register the errorHandler
			function (err) {
				//delegate.fail(err);
			},
			pluginName,
			'setGlobalItem',
			[key, val]
		);
	};

	this.getItem = function(key,delegate){
		cordova.exec(
			function (data) {
				//delegate.done(key,data[key]);
			},
			function (err) {
				//delegate.fail(err);
			},
			pluginName,
			'getItem',
			[key]
		);
	};

	this.getGlobalItem = function(key,delegate){
		cordova.exec(
			function (data) {
				//delegate.done(key,data[key]);
			},
			function (err) {
				//delegate.fail(err);
			},
			pluginName,
			'getGlobalItem',
			[key]
		);
	};

	this.removeItem = function (key, delegate) {
		cordova.exec(
			function (data) {
				if ( delegate ) {
					delegate.resolve(key);
				}
			},
			function (err) {
				if ( delegate ) {
					delegate.reject();
				}
			},
			pluginName,
			'removeItem',
			[key]
		);
	} ;

	this.removeGlobalItem = function (key, delegate) {
		this.setGlobalItem(key, '');
		cordova.exec(
			function (data) {
				//delegate.done(key,data[key]);
			},
			function (err) {
				//delegate.fail(err);
			},
			pluginName,
			'removeGlobalItem',
			[key]
		);
	} ;

	this.clear = function(delegate){
		cordova.exec(
			function (data) {
				//delegate.done(key,data[key]);
			},
			function (err) {
				//delegate.fail(err);
			},
			pluginName,
			'removeAllItems',
			[]
		);
	};

	// get all the data from native frame storage and put it into local memory
	this.getCache = function (delegate) {
		cordova.exec(
			function (data) {
				delegate.resolve(data) ;
			},
			function (err) {
				delegate.resolve(null) ;
			},
			pluginName,
			'getCachedItems',
			[]
		);
	} ;

	this.isDocumentPresent = function(key, delegate){
		cordova.exec(
			function (data) {
				if ( delegate ) {
					delegate.resolve( true );
				}
			},
			function (err) {
				if ( delegate ) {
					delegate.resolve( false );
				}
			},
			pluginName,
			'isItemPresent',
			[key]
		);
	};

	this.getDocument = function(key, delegate){
		cordova.exec(
			function (data) {
				if ( delegate ) {
					delegate.resolve( data[key] );
				}
			},
			function (err) {
				if ( delegate ) {
					delegate.reject();
				}
			},
			pluginName,
			'getEncryptedDocument',
			[key]
		);
	};

	this.saveDocument = function(key, data, delegate){
		cordova.exec(
			function (data) {
				if ( delegate ) {
					delegate.resolve( key );
				}
			},
			function (err) {
				if ( delegate ) {
					delegate.reject( key );
				}
			},
			pluginName,
			'setItem',
			[key, data, false, true]
		);
	};

	this.downloadDocument = function( attachmentId, patientId, slotId, fileType, sharingOrganisationId, delegate ) {
		cordova.exec(
			function (data) {
				if ( delegate ) {
					delegate.resolve( attachmentId );
				}
			},
			function (err) {
				if ( delegate ) {
					delegate.reject( attachmentId );
				}
			},
			pluginName,
			'downloadDocument',
			[attachmentId, patientId, slotId, fileType, sharingOrganisationId]
		);
	};

	this.openDocument = function( attachmentId, patientName, date, size, type, associatedText, source, delegate ) {
		cordova.exec(
			function (data) {
				if ( delegate ) {
					delegate.resolve( attachmentId );
				}
			},
			function (err) {
				if ( delegate ) {
					delegate.reject( attachmentId );
				}
			},
			pluginName,
			'openDocument',
			[attachmentId, patientName, date, size, type, associatedText, source]
		);
	};

	this.goToLoginPage = function() {
		cordova.exec(
			function () {
			},
			function () {
			},
			pluginName,
			'goToLoginScreen',
			[]
		);
	};

	this.setSessionResponse = function( response ) {
		cordova.exec(
			function () {
			},
			function () {
			},
			pluginName,
			'setSessionResponse',
			[response]
		);
	};
}
})() ;

