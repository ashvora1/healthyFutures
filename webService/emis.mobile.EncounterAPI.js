/**
 * API Class to interface the HTTP services Functionalities provided: Post the care record data to the server Delegate
 * the server response to the appropriate methods
 */

emis.mobile.EncounterAPI = function( ) {

}

emis.mobile.EncounterAPI.prototype.postEncounter = function(id, encounterObj ) {
	this.encounterObj = encounterObj ;
	this.encounterId = id ;

	// emulate fault response
	//encounterObj.sessionId = '00000000-0000-0000-0000-000000000000' ;

	var EncounterJson = JSON.stringify( encounterObj );
	var requestUrl = EMIS_BASE_URL + ENCOUNTER_URL;
	var requestType = REQUEST_POST;
	var requestParameters = EncounterJson;
	if ( WEBSERVICE_MODE == "PROXYMODE" ) {
		requestUrl = EMIS_BASE_URL;
		requestParameters = "method=" + REQUEST_POST + "&url=" + ENCOUNTER_URL + "&body=" + encodeURIComponent( EncounterJson );
	}
	this.webServiceObj = new emis.mobile.WebService( requestType, requestUrl, requestParameters );
	this.webServiceObj.delegate = this;
	this.webServiceObj.performRequest( );
}

emis.mobile.EncounterAPI.prototype.fetchCompleted = function( response ) {

	var EncounterResponse = null;
	var storage = new emis.mobile.Storage( );
	try {
		EncounterResponse = JSON.parse( response );
	} catch ( e ) {
		var failedData = {'api':'postEncounter',
						'desc':'Upload patient data',
						'eventCode':main.constants.CORRUPTED_DATA,
						'data':{}};
		// Failure delegate to be implemented in the classes, where EncounterAPI
		// object is created
		this.delegate.APIFailed.call( this.delegate, new emis.mobile.ErrorModel( JSON_ERROR_CODE, JSON_ERROR_DESCRIPTION ), failedData );

	}



	if ( EncounterResponse && EncounterResponse.Payload && !EncounterResponse.Payload.EventCode ) {


	} else {

		var display = ( EncounterResponse && EncounterResponse.Payload && EncounterResponse.Payload.EventCode ) ? EncounterResponse.Payload.Display : INVALID_RESPONSE_DESCRIPTION;

		var eventsets = new emis.mobile.EventsetModel().findEventsetsByPatient(this.encounterId) ;
		var eventsetsIds = [] ;
		for (var i = 0; i < eventsets.length; i++) {
			eventsetsIds.push(eventsets[i].id)
		};

		var data = {} ;
		var patientId = this.encounterId.split('#') ;
		var slotId = null;
		if ( patientId.length > 1 ) {
			slotId = patientId[1];
			patientId = patientId[0] ;
		}
		var eventCode = EncounterResponse.Payload ? EncounterResponse.Payload.EventCode : null;
		var failedData = {'api':'postEncounter',
						'desc':'Upload patient data',
						'patientId':patientId,
						'slotId':slotId,
						'eventCode':eventCode,
						'eventMessage':display,
						'data':{}} ;
		failedData.data[ENTITY_ENCOUNTER] = [this.encounterId] ;
		failedData.data[ENTITY_EVENTSET] = eventsetsIds ;
		var quickNote = storage.find( "quickNote", this.encounterId );
		if ( quickNote ) {
			failedData.data['quickNote'] = [this.encounterId] ;
		}

		this.delegate.APIFailed.call( this.delegate, new emis.mobile.ErrorModel( INVALID_RESPONSE_CODE, display ), failedData );
	}

	this.delegate.EncounterSynchronized.call( this.delegate, EncounterResponse );

}
/** * Delegate. Invoked when webserviceObj, fetch Failed event is triggered. ** */
emis.mobile.EncounterAPI.prototype.fetchFailed = function( Error ) {
	var storage = new emis.mobile.Storage( );
	// Failure delegate to be implemented in the classes, where EncounterAPI
	// object is created
	this.delegate.APIFailed.call( this.delegate, Error );
}
