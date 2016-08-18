/**
 * API Class to interface the HTTP services Functionalities provided: Fetch the patient list Delegate the patient list
 * to the appropriate methods
 */

emis.mobile.PatientListAPI = function( ) {

}

emis.mobile.PatientListAPI.prototype.getPatientList = function( sessionId ) {
	var patientListUrl = PATIENT_LIST_URL.replace( "{rawSessionId}", sessionId );
	// in local json mode, the replace method returns the same source string,
	// if it cannot find the sub-string to be replaced

	var requestUrl = EMIS_BASE_URL + patientListUrl;
	var requestType = REQUEST_GET;
	var requestParameters = "";
	if ( WEBSERVICE_MODE == "PROXYMODE" ) {
		requestType = REQUEST_POST;
		requestUrl = EMIS_BASE_URL;
		requestParameters = "method=" + REQUEST_GET + "&url=" + patientListUrl;
	}
	this.webServiceObj = new emis.mobile.WebService( requestType, requestUrl, requestParameters );
	this.webServiceObj.delegate = this;
	this.webServiceObj.performRequest( );
}

emis.mobile.PatientListAPI.prototype.fetchCompleted = function( response ) {

	var PatientList = null;
	try {
		PatientList = JSON.parse( response );
	} catch ( e ) {
		// Failure delegate to be implemented in the classes, where
		// PatientListAPI object is created
		this.delegate.APIFailed.call( this.delegate, new emis.mobile.ErrorModel( JSON_ERROR_CODE, JSON_ERROR_DESCRIPTION ) );
	}

	if ( PatientList.InteractionId && PatientList.Payload ) {
		// Success delegate to be implemented in the classes, where
		// PatientListAPI object is created
		this.delegate.patientlistSynchronized.call( this.delegate, PatientList );
	} else {
		display = ( PatientList.Payload.EventCode ) ? PatientList.Payload.Display : INVALID_RESPONSE_DESCRIPTION;
		if ( DEMO_AUTO_LOGIN ) {
			this.delegate.APIFailed.call( this.delegate, new emis.mobile.ErrorModel( INVALID_RESPONSE_CODE, display + " (Error code: " + PatientList.Payload.EventCode + ")" ) );
		} else {
			this.delegate.APIFailed.call( this.delegate, new emis.mobile.ErrorModel( INVALID_RESPONSE_CODE, display ) );
		}
	}

}
/** * Delegate. Invoked when webserviceObj, fetch Failed event is triggered. ** */
emis.mobile.PatientListAPI.prototype.fetchFailed = function( Error ) {
	// Failure delegate to be implemented in the classes, where PatientListAPI
	// object is created
	this.delegate.APIFailed.call( this.delegate, Error );
}
