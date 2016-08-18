emis.mobile.EditScheduleAPI = function( ) {

}

emis.mobile.EditScheduleAPI.prototype.editSchedule = function(editScheduleBodyObj) {
	this.patientId = editScheduleBodyObj.patientSchedule.patientId;
	var editScheduleUrl = EDIT_SCHEDULE_URL;
	//editScheduleUrl = editScheduleUrl.replace( "{rawSessionId}", sessionId );

	var editScheduleJson = JSON.stringify(editScheduleBodyObj);

	var requestUrl = EMIS_BASE_URL + editScheduleUrl;
	var requestType = REQUEST_POST;
	var requestParameters = editScheduleJson;
	var requestObj = {};
	requestObj.sessionId = main.controller.SessionId;
	requestObj.Payload = editScheduleBodyObj;
	var requestParameters = JSON.stringify(requestObj);
	if ( WEBSERVICE_MODE == "PROXYMODE" ) {
		requestUrl = EMIS_BASE_URL;
		requestParameters = "method=" + REQUEST_POST + "&url=" + editScheduleUrl + "&body=" + encodeURIComponent( requestParameters );
	}
	this.webServiceObj = new emis.mobile.WebService( requestType, requestUrl, requestParameters );
	this.webServiceObj.delegate = this;
	this.webServiceObj.performRequest( );
}

emis.mobile.EditScheduleAPI.prototype.fetchCompleted = function( response ) {
	var scheduleResponse = null;
	var storage = new emis.mobile.Storage( );
	try {
		scheduleResponse = JSON.parse( response );
	} catch ( e ) {
		// to do: confirm it's necessary
		var failedData = {'api':'editSchedule',
						'desc':'Upload patient data',
						'eventCode':main.constants.CORRUPTED_DATA,
						'data':{}};
		//
		this.delegate.APIFailed.call( this.delegate, new emis.mobile.ErrorModel( JSON_ERROR_CODE, JSON_ERROR_DESCRIPTION ), failedData );
	}

	var fail = false;
	if ( scheduleResponse && scheduleResponse.Payload && !scheduleResponse.Payload.EventCode ) {
		if(emis.mobile.Utilities.isTrue(scheduleResponse.Payload.editScheduleResponse.success)) {

		} else {
			fail = true;
		}
	} else {
		fail = true;
	}
	if(fail) {
		var sm = new emis.mobile.ScheduleModel() ;
		var ids = sm.findAllIdsByPatientId(this.patientId) ;
		var eventCode = scheduleResponse.Payload ? scheduleResponse.Payload.EventCode : null;
		display = ( scheduleResponse.Payload.EventCode ) ? scheduleResponse.Payload.Display : INVALID_RESPONSE_DESCRIPTION;

		var failedData = {'api':'editSchedule',
						'desc':'Upload patient data',
						'patientId':this.patientId,
						'eventCode':eventCode,
						'eventMessage':display,
						'data':{}} ;
		failedData.data[ENTITY_SCHEDULE] = ids ;

		this.delegate.APIFailed.call( this.delegate, new emis.mobile.ErrorModel( INVALID_RESPONSE_CODE, display ), failedData );
	}

	this.delegate.editedScheduleSynchronized.call( this.delegate, scheduleResponse );

}
/** * Delegate. Invoked when webserviceObj, fetch Failed event is triggered. ** */
emis.mobile.EditScheduleAPI.prototype.fetchFailed = function( Error ) {
	this.delegate.APIFailed( Error );
}
