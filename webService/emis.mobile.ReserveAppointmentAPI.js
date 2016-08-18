emis.mobile.ReserveAppointmentAPI = function( ) {

}

emis.mobile.ReserveAppointmentAPI.prototype.reserveAppointment = function( ReserveAppointmentObjJson, sessionId ) {
	var reserveAppointmentUrl = RESERVE_APPOINTMENT_URL;
	var requestUrl = EMIS_BASE_URL + reserveAppointmentUrl;
	var requestType = REQUEST_POST;
	var requestParameters = ReserveAppointmentObjJson;
	if ( WEBSERVICE_MODE == "PROXYMODE" ) {
		requestUrl = EMIS_BASE_URL;
		requestParameters = "method=" + REQUEST_POST + "&url=" + reserveAppointmentUrl + "&body=" + encodeURIComponent( ReserveAppointmentObjJson );
	}
	this.webServiceObj = new emis.mobile.WebService( requestType, requestUrl, requestParameters );
	this.webServiceObj.delegate = this;
	this.webServiceObj.performRequest( );
}

emis.mobile.ReserveAppointmentAPI.prototype.fetchCompleted = function( response ) {
	var AppointmentsResponse = null;
	var storage = new emis.mobile.Storage( );
	try {
		AppointmentsResponse = JSON.parse( response );
	} catch ( e ) {
		this.delegate.APIFailed.call( this.delegate, new emis.mobile.ErrorModel( JSON_ERROR_CODE, JSON_ERROR_DESCRIPTION ) );
	}
	if ( AppointmentsResponse && AppointmentsResponse.Payload && !AppointmentsResponse.Payload.EventCode ) {
		// this.delegate.ParseReserveAppointmentResponse.call(this.delegate,
		// AppointmentsResponse);
		this.delegate.ParseReserveAppointmentResponse( AppointmentsResponse );
	} else {
		emis.mobile.console.warn( "AppointmentsResponse " );
		emis.mobile.console.warn( AppointmentsResponse );
		if ( AppointmentsResponse.Payload && ( AppointmentsResponse.Payload.EventCode == -161 || AppointmentsResponse.Payload.EventCode == -164 || AppointmentsResponse.Payload.EventCode == -165 ) ) {
			if(CALL_OTK_INSTEAD) {
				this.delegate.askForOTK( );
			} else {
				this.delegate.askForAuth( );
			}
		} else {
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
emis.mobile.ReserveAppointmentAPI.prototype.fetchFailed = function( Error ) {
	this.delegate.APIFailed( Error );
}
