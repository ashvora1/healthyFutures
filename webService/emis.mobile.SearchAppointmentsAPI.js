emis.mobile.SearchAppointmentsAPI = function( ) {

}

emis.mobile.SearchAppointmentsAPI.prototype.searchAppointments = function( SearchAppointmentObjJson, sessionId ) {
	var searchAppointmentsUrl = SEARCH_APPOINTMENTS_URL.replace( "{rawSessionId}", sessionId );
	var requestUrl = EMIS_BASE_URL + searchAppointmentsUrl;
	var requestType = REQUEST_POST;
	var requestParameters = SearchAppointmentObjJson;
	emis.mobile.console.log( JSON.parse( requestParameters ) );
	if ( WEBSERVICE_MODE == "PROXYMODE" ) {
		requestUrl = EMIS_BASE_URL;
		requestParameters = "method=" + REQUEST_POST + "&url=" + searchAppointmentsUrl + "&body=" + encodeURIComponent( SearchAppointmentObjJson );
	}
	this.webServiceObj = new emis.mobile.WebService( requestType, requestUrl, requestParameters );
	this.webServiceObj.delegate = this;
	this.webServiceObj.performRequest( );
}

emis.mobile.SearchAppointmentsAPI.prototype.fetchCompleted = function( response ) {
	var AppointmentsResponse = null;
	var storage = new emis.mobile.Storage( );
	try {
		AppointmentsResponse = JSON.parse( response );
		emis.mobile.console.log( AppointmentsResponse );
	} catch ( e ) {
		this.delegate.APIFailed.call( this.delegate, new emis.mobile.ErrorModel( JSON_ERROR_CODE, JSON_ERROR_DESCRIPTION ) );
	}
	if ( AppointmentsResponse && AppointmentsResponse.Payload && !AppointmentsResponse.Payload.EventCode ) {
		// this.delegate.ParseSearchAppointmentsResponse.call(this.delegate,
		// AppointmentsResponse);
		this.delegate.ParseSearchAppointmentsResponse( AppointmentsResponse );
	} else {
		if ( AppointmentsResponse.Payload.EventCode == main.constants.SESSION_ENDED ) {
			this.delegate.getSession.call( this.delegate );
		} else {
			emis.mobile.console.warn( "AppointmentsResponse " );
			emis.mobile.console.warn( AppointmentsResponse );
			display = ( AppointmentsResponse.Payload.EventCode ) ? AppointmentsResponse.Payload.Display : INVALID_RESPONSE_DESCRIPTION;
			if ( DEMO_AUTO_LOGIN ) {
				this.delegate.APIFailed.call( this.delegate, new emis.mobile.ErrorModel( INVALID_RESPONSE_CODE, display + " (Error code: " + AppointmentsResponse.Payload.EventCode + ")" ) );
			} else {
				this.delegate.APIFailed.call( this.delegate, new emis.mobile.ErrorModel( INVALID_RESPONSE_CODE, display ) );
			}
		}
	}

}
/** * Delegate. Invoked when webserviceObj, fetch Failed event is triggered. ** */
emis.mobile.SearchAppointmentsAPI.prototype.fetchFailed = function( Error ) {
	$( document.getElementById( "searchSlotBtn" ) ).removeClass( "ui-disabled" );
	this.delegate.APIFailed( Error );
}
