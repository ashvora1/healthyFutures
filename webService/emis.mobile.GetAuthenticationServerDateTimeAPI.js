/**
 * API Class to interface the HTTP services Functionalities provided: Get the user session Terminate the user session
 * Verify the one time key
 */

emis.mobile.GetAuthenticationServerDateTimeAPI = function( ) {

}

emis.mobile.GetAuthenticationServerDateTimeAPI.prototype.getAuthenticationServerDateTime = function( ) {
	var getAuthenticationServerDateTimeUrl = GET_AUTHENTICATION_SERVER_DATE_TIME_URL.replace( "{rawSessionId}", main.controller.SessionId );
	var requestUrl = EMIS_BASE_URL + getAuthenticationServerDateTimeUrl;
	var requestType = REQUEST_GET;
	var requestParameters = "";
	if ( WEBSERVICE_MODE == "PROXYMODE" ) {
		requestType = REQUEST_POST;
		requestUrl = EMIS_BASE_URL;
		requestParameters = "method=" + REQUEST_GET + "&url=" + getAuthenticationServerDateTimeUrl;
	}
	this.webServiceObj = new emis.mobile.WebService( requestType, requestUrl, requestParameters );
	this.webServiceObj.delegate = this;
	this.webServiceObj.performRequest( );
}

emis.mobile.GetAuthenticationServerDateTimeAPI.prototype.fetchCompleted = function( response ) {
	var dateResponse = null;
	var storage = new emis.mobile.Storage( );
	try {
		dateResponse = JSON.parse( response );
	} catch ( e ) {
		this.delegate.APIFailed.call( this.delegate, new emis.mobile.ErrorModel( JSON_ERROR_CODE, JSON_ERROR_DESCRIPTION ) );
	}
	if ( dateResponse && dateResponse.Payload && !dateResponse.Payload.EventCode ) {
		this.delegate.ParseDateResponse.call( this.delegate, dateResponse );
	} else {
		//emis.mobile.console.warn( "RequestSharedSecretResponse " );
		emis.mobile.console.warn( dateResponse );
		display = ( dateResponse.Payload.EventCode ) ? dateResponse.Payload.Display : INVALID_RESPONSE_DESCRIPTION;
		if ( DEMO_AUTO_LOGIN ) {
			this.delegate.APIFailed.call( this.delegate, new emis.mobile.ErrorModel( INVALID_RESPONSE_CODE, display + " (Error code: " + dateResponse.Payload.EventCode + ")" ) );
		} else {
			this.delegate.APIFailed.call( this.delegate, new emis.mobile.ErrorModel( INVALID_RESPONSE_CODE, display ) );
		}
	}

}

emis.mobile.GetAuthenticationServerDateTimeAPI.prototype.fetchFailed = function( Error ) {
	this.delegate.APIFailed( Error );
}
