emis.mobile.GetAttachmentAPI = function( ) {

};

emis.mobile.GetAttachmentAPI.prototype.getAttachment = function( attachmentObj ) {
	var requestUrl = EMIS_BASE_URL + GET_ATTACHMENT_URL;
	var requestType = REQUEST_POST;
	var attachmentJson = JSON.stringify( attachmentObj );
	var requestParameters = attachmentJson;
	if ( WEBSERVICE_MODE == "PROXYMODE" ) {
		requestUrl = EMIS_BASE_URL;
		requestParameters = "method=" + REQUEST_POST + "&url=" + GET_ATTACHMENT_URL + "&body=" + encodeURIComponent( attachmentJson );
	}
	this.webServiceObj = new emis.mobile.WebService( requestType, requestUrl, requestParameters );
	this.webServiceObj.delegate = this;
	main.controller.docTime = new Date( ).getTime( );
	var xmlhttpObject = this.webServiceObj.performRequest( );
	return xmlhttpObject;
};

emis.mobile.GetAttachmentAPI.prototype.fetchCompleted = function( response ) {

	if ( WEBSERVICE_MODE == "JSONMODE" ) {
		if ( GET_ATTACHMENT_URL == "/getattachment" ) {
			GET_ATTACHMENT_URL = "/getattachment2";
		} else {
			GET_ATTACHMENT_URL = "/getattachment";
		}
	}
	var AttachmentResponse = null;
	try {
		AttachmentResponse = JSON.parse( response );
	} catch ( e ) {
		this.delegate.APIFailed.call( this.delegate, new emis.mobile.ErrorModel( JSON_ERROR_CODE, JSON_ERROR_DESCRIPTION ) );
	}
	if ( AttachmentResponse && AttachmentResponse.Payload && !AttachmentResponse.Payload.EventCode ) {
		var diff = ( new Date( ).getTime( ) ) - main.controller.docTime;
		main.storage.setItem( "downloadingTime_" + AttachmentResponse.Payload.id, diff );
		this.delegate.Complete( AttachmentResponse );
	} else {
		if ( AttachmentResponse.Payload && ( AttachmentResponse.Payload.EventCode == -161 || AttachmentResponse.Payload.EventCode == -164 || AttachmentResponse.Payload.EventCode == -165 ) ) {
			this.delegate.askForOTK( );
		} else if ( AttachmentResponse.Payload && ( AttachmentResponse.Payload.EventCode == -169 ) ) {
			this.delegate.getSessionAndAskForOTK( );
		} else {
			display = ( AttachmentResponse.Payload.EventCode ) ? AttachmentResponse.Payload.Display : INVALID_RESPONSE_DESCRIPTION;
			if ( DEMO_AUTO_LOGIN ) {
				this.delegate.APIFailed.call( this.delegate, new emis.mobile.ErrorModel( INVALID_RESPONSE_CODE, display + " (Error code: " + AttachmentResponse.Payload.EventCode + ")" ) );
			} else {
				this.delegate.APIFailed.call( this.delegate, new emis.mobile.ErrorModel( INVALID_RESPONSE_CODE, display ) );
			}
		}
	}

};

/** * Delegate. Invoked when webserviceObj, fetch Failed event is triggered. ** */
emis.mobile.GetAttachmentAPI.prototype.fetchFailed = function( Error ) {
	this.delegate.APIFailed( Error );
};
