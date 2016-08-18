/**
 * API Class to interface the HTTP services Functionalities provided: Post the log data to the server Delegate the
 * server response to the appropriate methods
 */

emis.mobile.LogAPI = function( ) {

}

emis.mobile.LogAPI.prototype.postLog = function( LogJson ) {
	var requestUrl = EMIS_BASE_URL + LOG_URL;
	var requestType = REQUEST_POST;
	var requestParameters = LogJson;
	if ( WEBSERVICE_MODE == "PROXYMODE" ) {
		requestUrl = EMIS_BASE_URL;
		requestParameters = "method=" + REQUEST_POST + "&url=" + LOG_URL + "&body=" + LogJson;
	}
	this.webServiceObj = new emis.mobile.WebService( requestType, requestUrl, requestParameters );
	this.webServiceObj.delegate = this;
	this.webServiceObj.performRequest( );
}

emis.mobile.LogAPI.prototype.fetchCompleted = function( response ) {

	var LogResponse = null;
	try {
		LogResponse = JSON.parse( response );
	} catch ( e ) {
		var failedData = {'api':'postLog',
						'desc':'Logs',
						'eventCode':main.constants.CORRUPTED_DATA,
						'data':{}};
		// Failure delegate to be implemented in the classes, where LogAPI
		// object is created
		this.delegate.APIFailed.call( this.delegate, new emis.mobile.ErrorModel( JSON_ERROR_CODE, JSON_ERROR_DESCRIPTION ), failedData );
	}
	if ( LogResponse && !LogResponse.Payload.EventCode ) {

	} else {
		display = ( LogResponse.Payload.EventCode ) ? LogResponse.Payload.Display : INVALID_RESPONSE_DESCRIPTION;
		var failedData = {'api':'postLog',
						'desc':'Logs',
						'eventCode':LogResponse.Payload.EventCode,
						'eventMessage': display,
						'data':{}};
		if ( DEMO_AUTO_LOGIN ) {
			this.delegate.APIFailed.call( this.delegate, new emis.mobile.ErrorModel( INVALID_RESPONSE_CODE, display + " (Error code: " + LogResponse.Payload.EventCode + ")" ), failedData );
		} else {
			this.delegate.APIFailed.call( this.delegate, new emis.mobile.ErrorModel( INVALID_RESPONSE_CODE, display ), failedData );
		}
	}
	this.delegate.LogSynchronized.call( this.delegate, LogResponse );

}
/** * Delegate. Invoked when webserviceObj, fetch Failed event is triggered. ** */
emis.mobile.LogAPI.prototype.fetchFailed = function( Error ) {
	// Failure delegate to be implemented in the classes, where LogAPI object is
	// created
	this.delegate.APIFailed.call( this.delegate, Error );
}
