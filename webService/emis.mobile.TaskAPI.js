/**
 * API Class to interface the HTTP services Functionalities provided: Post the task list Delegate the response to the
 * appropriate methods
 */

emis.mobile.TaskAPI = function( ) {

}

emis.mobile.TaskAPI.prototype.postTask = function(id, TaskObj ) {
	this.taskId = id ;
	// emulate failed sync
	//TaskObj.sessionId = '00000000-0000-0000-0000-000000000000' ;
	var TaskJson = JSON.stringify(TaskObj);
	var requestUrl = EMIS_BASE_URL + TASK_URL;
	var requestType = REQUEST_POST;
	var requestParameters = TaskJson;
	emis.mobile.console.log( JSON.parse( requestParameters ) );
	if ( WEBSERVICE_MODE == "PROXYMODE" ) {
		requestUrl = EMIS_BASE_URL;
		requestParameters = "method=" + REQUEST_POST + "&url=" + TASK_URL + "&body=" + TaskJson;
	}
	this.webServiceObj = new emis.mobile.WebService( requestType, requestUrl, requestParameters );
	this.webServiceObj.delegate = this;
	this.webServiceObj.performRequest( );
}

emis.mobile.TaskAPI.prototype.fetchCompleted = function( response ) {

	var TaskResponse = null;
	try {
		TaskResponse = JSON.parse( response );
	} catch ( e ) {
		var failedData = {'api':'postTask',
						'desc':'Upload patient data',
						'eventCode':main.constants.CORRUPTED_DATA,
						'data':{}};
		// Failure delegate to be implemented in the classes, where TaskAPI
		// object is created
		this.delegate.APIFailed.call( this.delegate, new emis.mobile.ErrorModel( JSON_ERROR_CODE, JSON_ERROR_DESCRIPTION ), failedData );

	}
	if ( TaskResponse && !TaskResponse.Payload.EventCode ) {

	} else {
		var patientId = this.taskId.split('#') ;
		patientId = patientId[0] ;
		display = ( TaskResponse.Payload.EventCode ) ? TaskResponse.Payload.Display : INVALID_RESPONSE_DESCRIPTION;

		var failedData = {'api':'postTask',
						'desc':'Upload patient data',
						'patientId':patientId,
						'taskId':this.taskId,
						'eventCode':TaskResponse.Payload.EventCode,
						'eventMessage':display,
						'data':{}};
		failedData.data[ENTITY_TASK] = [this.taskId] ;

		this.delegate.APIFailed.call( this.delegate, new emis.mobile.ErrorModel( INVALID_RESPONSE_CODE, display ), failedData );
	}

	this.delegate.taskSynchronized.call( this.delegate, TaskResponse );

}
/** * Delegate. Invoked when webserviceObj, fetch Failed event is triggered. ** */
emis.mobile.TaskAPI.prototype.fetchFailed = function( Error ) {

	// Failure delegate to be implemented in the classes, where TaskAPI object
	// is created
	this.delegate.APIFailed.call( this.delegate, Error );
}
