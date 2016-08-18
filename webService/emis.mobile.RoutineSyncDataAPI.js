/**
 * API Class to interface the HTTP services Functionalities provided: Fetch the routine synchronization data from the
 * server Delegate the response to the appropriate methods
 */

emis.mobile.RoutineSyncDataAPI = function( ) {

}

emis.mobile.RoutineSyncDataAPI.prototype.getRoutineSyncData = function( sessionId ) {
	var routineSyncDataUrl = ROUTINE_SYNC_DATA_URL.replace( "{rawSessionId}", sessionId );
	// in local json mode, the replace method returns the same source string,
	// if it cannot find the sub-string to be replaced

	var requestUrl = EMIS_BASE_URL + routineSyncDataUrl;
	var requestType = REQUEST_GET;
	var requestParameters = "";
	if ( WEBSERVICE_MODE == "PROXYMODE" ) {
		requestType = REQUEST_POST;
		requestUrl = EMIS_BASE_URL;
		requestParameters = "method=" + REQUEST_GET + "&url=" + routineSyncDataUrl;
	}
	this.webServiceObj = new emis.mobile.WebService( requestType, requestUrl, requestParameters );
	this.webServiceObj.delegate = this;
	this.webServiceObj.performRequest( );
}

emis.mobile.RoutineSyncDataAPI.prototype.fetchCompleted = function( response ) {

	var RoutineSyncData = null;
	try {
		RoutineSyncData = JSON.parse( response );
	} catch ( e ) {
		// Failure delegate to be implemented in the classes, where
		// RoutineSyncDataAPI object is created
		this.delegate.APIFailed.call( this.delegate, new emis.mobile.ErrorModel( JSON_ERROR_CODE, JSON_ERROR_DESCRIPTION ) );
	}
	if ( RoutineSyncData && !RoutineSyncData.Payload.EventCode ) {
		// Success delegate to be implemented in the classes, where
		// RoutineSyncDataAPI object is created
		this.delegate.RoutineSyncDataSynchronized.call( this.delegate, RoutineSyncData );
	} else {
		display = ( RoutineSyncData.Payload.EventCode ) ? RoutineSyncData.Payload.Display : INVALID_RESPONSE_DESCRIPTION;
		if ( DEMO_AUTO_LOGIN ) {
			this.delegate.APIFailed.call( this.delegate, new emis.mobile.ErrorModel( INVALID_RESPONSE_CODE, display + " (Error code: " + RoutineSyncData.Payload.EventCode + ")" ) );
		} else {
			this.delegate.APIFailed.call( this.delegate, new emis.mobile.ErrorModel( INVALID_RESPONSE_CODE, display ) );
		}
	}

}
/** * Delegate. Invoked when webserviceObj, fetch Failed event is triggered. ** */
emis.mobile.RoutineSyncDataAPI.prototype.fetchFailed = function( Error ) {
	// Failure delegate to be implemented in the classes, where
	// RoutineSyncDataAPI object is created
	this.delegate.APIFailed.call( this.delegate, Error );
}
