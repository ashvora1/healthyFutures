/**
 * API Class to interface the HTTP services Functionalities provided: Get the user session Terminate the user session
 * Verify the one time key
 */

emis.mobile.VerifyAuthenticationCodeAPI = function( ) {

}

emis.mobile.VerifyAuthenticationCodeAPI.prototype.verifyAuthenticationCode = function( persistentId,authenticationCode) {
	var verifyAuthenticationCodeUrl = VERIFY_AUTHENTICATION_CODE_URL;
	var requestUrl = EMIS_BASE_URL + verifyAuthenticationCodeUrl;
	var requestType = REQUEST_POST;
	var requestParameters;
	var requestObj = {};
	authenticationCode = ""+authenticationCode;
	while(authenticationCode.length<8) { // just in case
		authenticationCode = "0"+authenticationCode;
	}
	requestObj.sessionId = main.controller.SessionId;
	requestObj.Payload = {};
	requestObj.Payload.verifyAuthenticationCode = {};
	requestObj.Payload.verifyAuthenticationCode.persistentId = persistentId;
	requestObj.Payload.verifyAuthenticationCode.authenticationCode = authenticationCode;
	requestParameters = JSON.stringify(requestObj);
	if ( WEBSERVICE_MODE == "PROXYMODE" ) {
		requestType = REQUEST_POST;
		requestUrl = EMIS_BASE_URL;
		requestParameters = "method=" + REQUEST_POST + "&url=" + verifyAuthenticationCodeUrl + "&body=" + encodeURIComponent( requestParameters );
	}
	this.webServiceObj = new emis.mobile.WebService( requestType, requestUrl, requestParameters );
	this.webServiceObj.delegate = this;
	this.webServiceObj.performRequest( );
}

emis.mobile.VerifyAuthenticationCodeAPI.prototype.fetchCompleted = function( response ) {
	var authenticationResponse = null;
	var storage = new emis.mobile.Storage( );
	try {
		authenticationResponse = JSON.parse( response );
	} catch ( e ) {
		this.delegate.APIFailed.call( this.delegate, new emis.mobile.ErrorModel( JSON_ERROR_CODE, JSON_ERROR_DESCRIPTION ) );
	}
	if ( authenticationResponse && authenticationResponse.Payload && !authenticationResponse.Payload.EventCode ) {
		this.delegate.ParseVerifyAuthenticationCodeResponse.call( this.delegate, authenticationResponse );
	} else {
		//emis.mobile.console.warn( "VerifyAuthenticationCodeResponse " );
		emis.mobile.console.warn( authenticationResponse );
		display = ( authenticationResponse.Payload.EventCode ) ? authenticationResponse.Payload.Display : INVALID_RESPONSE_DESCRIPTION;
		if ( authenticationResponse && authenticationResponse.Payload && authenticationResponse.Payload.EventCode== -15017)
			display = "An error has occurred that has prevented authentication. Contact EMIS support.";
		if ( DEMO_AUTO_LOGIN ) {
			this.delegate.APIFailed.call( this.delegate, new emis.mobile.ErrorModel( INVALID_RESPONSE_CODE, display + " (Error code: " + authenticationResponse.Payload.EventCode + ")" ) );
		} else {
			this.delegate.APIFailed.call( this.delegate, new emis.mobile.ErrorModel( INVALID_RESPONSE_CODE, display ) );
		}
	}

}

emis.mobile.VerifyAuthenticationCodeAPI.prototype.fetchFailed = function( Error ) {
	this.delegate.APIFailed( Error );
}