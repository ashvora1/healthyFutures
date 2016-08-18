emis.mobile.PostMedicationAPI = function( ) {

}

emis.mobile.PostMedicationAPI.prototype.postMedication = function( sessionId, patientId, slotId, PostMedicationObj, newFormatSlotFound ) {
	this.patientId = patientId ;
	this.slotId = null;
	if ( newFormatSlotFound ) {
		this.slotId = slotId;
	}
	//patientId = '00000' ; // emulate faulty response
	var postMedicationUrl = POST_MEDICATION_URL.replace( "{rawSessionId}", sessionId );
	postMedicationUrl = postMedicationUrl.replace( "{rawPatientId}", patientId );
	postMedicationUrl = postMedicationUrl.replace( "{rawSlotId}", slotId );

	var PostMedicationObjJson = JSON.stringify(PostMedicationObj);

	var requestUrl = EMIS_BASE_URL + postMedicationUrl;
	var requestType = REQUEST_POST;
	var requestParameters = PostMedicationObjJson;
	if ( WEBSERVICE_MODE == "PROXYMODE" ) {
		requestUrl = EMIS_BASE_URL;
		requestParameters = "method=" + REQUEST_POST + "&url=" + postMedicationUrl + "&body=" + encodeURIComponent( PostMedicationObjJson );
	}
	this.webServiceObj = new emis.mobile.WebService( requestType, requestUrl, requestParameters );
	this.webServiceObj.delegate = this;
	this.webServiceObj.performRequest( );
}

emis.mobile.PostMedicationAPI.prototype.fetchCompleted = function( response ) {
	var medicationResponse = null;
	var storage = new emis.mobile.Storage( );
	try {
		medicationResponse = JSON.parse( response );
	} catch ( e ) {
		var failedData = {'api':'postMedication',
						'desc':'Upload patient data',
						'eventCode':main.constants.CORRUPTED_DATA,
						'data':{}};
		this.delegate.APIFailed.call( this.delegate, new emis.mobile.ErrorModel( JSON_ERROR_CODE, JSON_ERROR_DESCRIPTION ), failedData );
	}

	if ( medicationResponse && medicationResponse.Payload && !medicationResponse.Payload.EventCode ) {

	} else {
		var dm = new emis.mobile.NewDrugModel() ;
		var ids;
		if (this.slotId) {
			ids = dm.getAllIdsForPatient(this.patientId, this.slotId);
		} else {
			ids = dm.getAllIdsWithoutSlotIdForPatient(this.patientId);
		}
		var eventCode = medicationResponse.Payload ? medicationResponse.Payload.EventCode : null;
		display = ( medicationResponse.Payload.EventCode ) ? medicationResponse.Payload.Display : INVALID_RESPONSE_DESCRIPTION;

		var failedData = {'api':'postMedication',
						'desc':'Upload patient data',
						'patientId':this.patientId,
						'eventCode':eventCode,
						'eventMessage':display,
						'data':{}} ;
		failedData.data[ENTITY_NEW_DRUG] = ids ;

		this.delegate.APIFailed.call( this.delegate, new emis.mobile.ErrorModel( INVALID_RESPONSE_CODE, display ), failedData );
	}

	this.delegate.addedDrugsSynchronized.call( this.delegate, medicationResponse );

}
/** * Delegate. Invoked when webserviceObj, fetch Failed event is triggered. ** */
emis.mobile.PostMedicationAPI.prototype.fetchFailed = function( Error ) {
	this.delegate.APIFailed( Error );
}
