emis.mobile.CancelScheduleAPI = function( ) {

}

emis.mobile.CancelScheduleAPI.prototype.cancelSchedule = function(cancelScheduleBodyObj) {
	this.patientId = cancelScheduleBodyObj.cancelSchedule.patientId;
	var cancelScheduleUrl = CANCEL_SCHEDULE_URL;
	//cancelScheduleUrl = cancelScheduleUrl.replace( "{rawSessionId}", sessionId );

	var cancelScheduleJson = JSON.stringify(cancelScheduleBodyObj);

	var requestUrl = EMIS_BASE_URL + cancelScheduleUrl;
	var requestType = REQUEST_POST;
	var requestObj = {};
	requestObj.sessionId = main.controller.SessionId;
	requestObj.Payload = cancelScheduleBodyObj;
	var requestParameters = JSON.stringify(requestObj)
	if ( WEBSERVICE_MODE == "PROXYMODE" ) {
		requestUrl = EMIS_BASE_URL;
		requestParameters = "method=" + REQUEST_POST + "&url=" + cancelScheduleUrl + "&body=" + encodeURIComponent( requestParameters );
	}
	this.webServiceObj = new emis.mobile.WebService( requestType, requestUrl, requestParameters );
	this.webServiceObj.delegate = this;
	this.webServiceObj.performRequest( );
}

emis.mobile.CancelScheduleAPI.prototype.fetchCompleted = function( response ) {
	var scheduleResponse = null;
	var storage = new emis.mobile.Storage( );
	try {
		scheduleResponse = JSON.parse( response );
	} catch ( e ) {
		// to do: confirm it's necessary
		var failedData = {'api':'cancelSchedule',
						'desc':'Upload patient data',
						'eventCode':main.constants.CORRUPTED_DATA,
						'data':{}};
		//
		this.delegate.APIFailed.call( this.delegate, new emis.mobile.ErrorModel( JSON_ERROR_CODE, JSON_ERROR_DESCRIPTION ), failedData );
	}
	var fail = false;
	if ( scheduleResponse && scheduleResponse.Payload && !scheduleResponse.Payload.EventCode ) {
		if( emis.mobile.Utilities.isTrue( scheduleResponse.Payload.cancelScheduleResponse.success ) ) {

		} else {
			fail = true;
		}
	} else {
		fail = true;
	}
	if(fail){
		var sm = new emis.mobile.ScheduleModel() ;
		var ids = sm.findAllIdsByPatientId(this.patientId) ;
		var eventCode = scheduleResponse.Payload ? scheduleResponse.Payload.EventCode : null;
		display = ( scheduleResponse.Payload.EventCode ) ? scheduleResponse.Payload.Display : INVALID_RESPONSE_DESCRIPTION;

		var failedData = {'api':'cancelSchedule',
						'desc':'Upload patient data',
						'patientId':this.patientId,
						'eventCode':eventCode,
						'eventMessage':display,
						'data':{}} ;
		failedData.data[ENTITY_SCHEDULE] = ids ;

		this.delegate.APIFailed.call( this.delegate, new emis.mobile.ErrorModel( INVALID_RESPONSE_CODE, display ), failedData );
	}

	this.delegate.cancelledScheduleSynchronized.call( this.delegate, scheduleResponse );

}
/** * Delegate. Invoked when webserviceObj, fetch Failed event is triggered. ** */
emis.mobile.CancelScheduleAPI.prototype.fetchFailed = function( Error ) {
	this.delegate.APIFailed( Error );
}
