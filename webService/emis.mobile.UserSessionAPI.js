/**
 * API Class to interface the HTTP services Functionalities provided: Get the user session Terminate the user session
 * Verify the one time key
 */

emis.mobile.UserSessionAPI = function( ) {

}

emis.mobile.UserSessionAPI.prototype.getSession = function( username, password, cdb ) {
	var getSessionUrl = GET_SESSION_URL.replace( "{userName}", encodeURIComponent( username ) );
	getSessionUrl = getSessionUrl.replace( "{rawCdb}", encodeURIComponent( cdb ) );
	// in local json mode, the replace method returns the same source string,
	// if it cannot find the string to be replaced
	var requestUrl = EMIS_BASE_URL + getSessionUrl;
	var requestType = REQUEST_POST;
	var passwordJson = this.getPasswordJson( password );
	var requestParameters = passwordJson;
	if ( WEBSERVICE_MODE == "JSONMODE" ) {
		requestType = REQUEST_GET;
		requestParameters = "";
	}
	if ( WEBSERVICE_MODE == "PROXYMODE" ) {
		requestType = REQUEST_POST;
		requestUrl = EMIS_BASE_URL;
		requestParameters = "method=" + REQUEST_POST + "&url=" + getSessionUrl + "&body=" + encodeURIComponent( passwordJson );
	}
	this.webServiceObj = new emis.mobile.WebService( requestType, requestUrl, requestParameters );
	this.webServiceObj.delegate = this;
	this.webServiceObj.performRequest( );
}
// To encode the hashed password to the required json format
emis.mobile.UserSessionAPI.prototype.getPasswordJson = function( password ) {
	var json = {};
	json.Payload = {};
	json.Payload.Password = password;
	return JSON.stringify( json );
}

emis.mobile.UserSessionAPI.prototype.verifyKey = function( sessionId, oneTimeKey ) {
	var keyVerificationUrl = KEY_VERIFICATION_URL.replace( "{oneTimeKey}", oneTimeKey );
	// in local json mode, the replace method returns the same source string, if it cannot find the string to be
	// replaced
	keyVerificationUrl = keyVerificationUrl.replace( "{rawSessionId}", sessionId );

	var requestUrl = EMIS_BASE_URL + keyVerificationUrl;
	var requestType = REQUEST_GET;
	var requestParameters = "";
	if ( WEBSERVICE_MODE == "PROXYMODE" ) {
		requestType = REQUEST_POST;
		requestUrl = EMIS_BASE_URL;
		requestParameters = "method=" + REQUEST_GET + "&url=" + keyVerificationUrl;
	}
	this.webServiceObj = new emis.mobile.WebService( requestType, requestUrl, requestParameters );
	this.webServiceObj.delegate = this;
	this.webServiceObj.performRequest( );
}

emis.mobile.UserSessionAPI.prototype.isTrusted = function( sessionId ) {
	// in local json mode, the replace method returns the same source string, if it cannot find the string to be
	// replaced
	var isTrustedUrl = IS_TRUSTED_URL.replace( "{rawSessionId}", sessionId );
	var requestUrl = EMIS_BASE_URL + isTrustedUrl;
	// requestUrl = JSON_BASE_URL + isTrustedUrl; // fix later
	var requestType = REQUEST_GET;
	var requestParameters = "";
	if ( WEBSERVICE_MODE == "PROXYMODE" ) {
		requestType = REQUEST_POST;
		requestUrl = EMIS_BASE_URL;
		requestParameters = "method=" + REQUEST_GET + "&url=" + isTrustedUrl;
	}
	this.webServiceObj = new emis.mobile.WebService( requestType, requestUrl, requestParameters );
	this.webServiceObj.delegate = this;
	this.webServiceObj.performRequest( );
}

emis.mobile.UserSessionAPI.prototype.endSession = function( sessionId ) {
	// in local json mode, the replace method returns the same source string, if it cannot find the string to be
	// replaced
	if ( main.controller.sessionEndingNow != true && main.controller.Logged == true ) {
		main.controller.sessionEndingNow = true;
		//emis.mobile.console.log( sessionId );
		var endSessionUrl = END_SESSION_URL.replace( "{rawSessionId}", sessionId );
		var requestUrl = EMIS_BASE_URL + endSessionUrl;
		var requestType = REQUEST_GET;
		var requestParameters = "";
		if ( WEBSERVICE_MODE == "PROXYMODE" ) {// fix here later.
			requestType = REQUEST_POST;
			requestUrl = EMIS_BASE_URL;
			requestParameters = "method=" + REQUEST_GET + "&url=" + endSessionUrl;
		}
		this.webServiceObj = new emis.mobile.WebService( requestType, requestUrl, requestParameters );
		this.webServiceObj.delegate = this;
		this.webServiceObj.performRequest( );
	}
}

emis.mobile.UserSessionAPI.prototype.fetchCompleted = function( response ) {

	var SessionResponse = null;
	try {
		SessionResponse = JSON.parse( response );
	} catch ( e ) {
		emis.mobile.console.error( e.getMessage( ));
		// Failure delegate to be implemented in the classes, where
		// UserSessionAPI object is created
		this.delegate.APIFailed.call( this.delegate, new emis.mobile.ErrorModel( JSON_ERROR_CODE, JSON_ERROR_DESCRIPTION ) );
	}
	var evc = SessionResponse.Payload.EventCode;
	var mc = main.constants ;
	if ( SessionResponse && ( !evc || evc == mc.SESSION_ENDED || evc == mc.SESSION_HAS_EXPIRED || evc == mc.ACCESS_DENIED || evc == mc.ACCOUNT_LOCKED || evc == mc.MALFORMED_SESSION_ID )) {
		// Success delegate to be implemented in the classes, where
		// UserSessionAPI object is created
		if ( this.delegate && this.delegate.sessionSynchronized) {
			// it will be null if called from logout, but we dont need to any extra action
			// in that case, we will be redirected to login page anyway
			this.delegate.sessionSynchronized.call( this.delegate, SessionResponse );
		} else {
			// logout here, goto to login page
			main.controller.alreadyLoggingOut = false;
			main.controller.sessionEndingNow = false;
			main.controller.gotoLoginPage() ;
		}
	} else {
		if ( !this.delegate ) {
			main.controller.alreadyLoggingOut = false;
			main.controller.sessionEndingNow = false;
			main.controller.gotoLoginPage() ;
		} else {
			display = ( SessionResponse.Payload.EventCode ) ? SessionResponse.Payload.Display : INVALID_RESPONSE_DESCRIPTION;
			if ( DEMO_AUTO_LOGIN ) {
				this.delegate.APIFailed.call( this.delegate, new emis.mobile.ErrorModel( INVALID_RESPONSE_CODE, display + " (Error code: " + SessionResponse.Payload.EventCode + ")" ) );
			} else {
				this.delegate.APIFailed.call( this.delegate, new emis.mobile.ErrorModel( INVALID_RESPONSE_CODE, display ) );
			}
		}
	}

}
/** * Delegate. Invoked when webserviceObj, fetch Failed event is triggered. ** */
emis.mobile.UserSessionAPI.prototype.fetchFailed = function( Error ) {
	// Failure delegate to be implemented in the classes, where UserSessionAPI
	// object is created
	// TODO error occurs while switching to offline/onelnie mode delegate is undefined
	if ( this.delegate ) {
		this.delegate.APIFailed.call( this.delegate, Error );
	} else {
		main.controller.gotoLoginPage() ;
	}
}
