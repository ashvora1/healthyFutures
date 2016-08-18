emis.mobile.GetMedicationReferenceAPI = function( ) {

}

emis.mobile.GetMedicationReferenceAPI.prototype.getMedicationReference = function( sessionId ) {
	var getMedicationReferenceUrl = GET_MEDICATION_REFERENCE_URL.replace( "{rawSessionId}", sessionId );
	var requestUrl = EMIS_BASE_URL + getMedicationReferenceUrl;
	var requestType = REQUEST_GET;
	var requestParameters = "";
	if ( WEBSERVICE_MODE == "PROXYMODE" ) {
		requestType = REQUEST_POST;
		requestUrl = EMIS_BASE_URL;
		requestParameters = "method=" + REQUEST_GET + "&url=" + getMedicationReferenceUrl;
	}
	this.webServiceObj = new emis.mobile.WebService( requestType, requestUrl, requestParameters );
	this.webServiceObj.delegate = this;
	this.webServiceObj.performRequest( );
}

emis.mobile.GetMedicationReferenceAPI.prototype.fetchCompleted = function( response ) {
	var medicationResponse = null;
	var storage = new emis.mobile.Storage( );
	try {
		medicationResponse = JSON.parse( response );
	} catch ( e ) {
		this.delegate.APIFailed.call( this.delegate, new emis.mobile.ErrorModel( JSON_ERROR_CODE, JSON_ERROR_DESCRIPTION ) );
	}
	if ( medicationResponse && medicationResponse.Payload && !medicationResponse.Payload.EventCode ) {
		// this.delegate.ParseGetMedicationReferenceResponse.call(this.delegate,
		// medicationResponse);
		this.delegate.drugsSynchronized.call( this.delegate, medicationResponse );
	} else {
		emis.mobile.console.warn( "GetMedicationReferenceResponse " );
		emis.mobile.console.warn( medicationResponse );
		display = ( medicationResponse.Payload.EventCode ) ? medicationResponse.Payload.Display : INVALID_RESPONSE_DESCRIPTION;
		if ( DEMO_AUTO_LOGIN ) {
			this.delegate.APIFailed.call( this.delegate, new emis.mobile.ErrorModel( INVALID_RESPONSE_CODE, display + " (Error code: " + medicationResponse.Payload.EventCode + ")" ) );
		} else {
			this.delegate.APIFailed.call( this.delegate, new emis.mobile.ErrorModel( INVALID_RESPONSE_CODE, display ) );
		}
	}

}
/** * Delegate. Invoked when webserviceObj, fetch Failed event is triggered. ** */
emis.mobile.GetMedicationReferenceAPI.prototype.fetchFailed = function( Error ) {
	this.delegate.APIFailed( Error );
}
