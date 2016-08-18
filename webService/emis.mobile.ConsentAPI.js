/**
 * API Class to interface the HTTP services Functionalities provided: Post the consent data to the server Delegate the
 * server response to the appropriate methods
 */

emis.mobile.ConsentAPI = function( ) {

}

emis.mobile.ConsentAPI.prototype.postConsent = function(id, consentObj ) {
	this.consentId = id ;
	// emulate failed sync
	//consentObj.sessionId = '00000000-0000-0000-0000-000000000000' ;
	var consentJson = JSON.stringify(consentObj);
	var requestUrl = EMIS_BASE_URL + CONSENT_URL;
	var requestType = REQUEST_POST;
	var requestParameters = consentJson;
	if ( WEBSERVICE_MODE == "PROXYMODE" ) {
		requestUrl = EMIS_BASE_URL;
		requestParameters = "method=" + REQUEST_POST + "&url=" + CONSENT_URL + "&body=" + consentJson;
	}
	this.webServiceObj = new emis.mobile.WebService( requestType, requestUrl, requestParameters );
	this.webServiceObj.delegate = this;
	this.webServiceObj.performRequest( );
}

emis.mobile.ConsentAPI.prototype.fetchCompleted = function( response ) {
	var ConsentResponse = null;
	try {
		ConsentResponse = JSON.parse( response );
	} catch ( e ) {
		// Failure delegate to be implemented in the classes, where ConsentAPI
		// object is created
		this.delegate.APIFailed.call( this.delegate, new emis.mobile.ErrorModel( JSON_ERROR_CODE, JSON_ERROR_DESCRIPTION ) );
	}
	if ( ConsentResponse && !ConsentResponse.Payload.EventCode ) {

	} else {
		var patientId = this.consentId.split('#') ;
		patientId = patientId[0] ;
		var failedData = {'api':'postConsent',
						'desc':'Consents',
						'patientId':patientId,
						'eventCode':ConsentResponse.Payload.EventCode,
						'data':{}};
		failedData.data[ENTITY_CONSENT] = [this.consentId] ;
		failedData.data[ENTITY_NS_CONSENT] = [this.consentId] ;

		display = ( ConsentResponse.Payload.EventCode ) ? ConsentResponse.Payload.Display : INVALID_RESPONSE_DESCRIPTION;

		this.delegate.APIFailed.call( this.delegate, new emis.mobile.ErrorModel( INVALID_RESPONSE_CODE, display ), failedData );
	}

	this.delegate.consentSynchronized.call( this.delegate, ConsentResponse );

}
/** * Delegate. Invoked when webserviceObj, fetch Failed event is triggered. ** */
emis.mobile.ConsentAPI.prototype.fetchFailed = function( Error ) {

	// Failure delegate to be implemented in the classes, where ConsentAPI object
	// is created
	this.delegate.APIFailed.call( this.delegate, Error );
}