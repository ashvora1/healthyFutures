( function( ) {

	/**
	 * API Class to interface the HTTP services Functionalities provided: Fetch the templates data from the server
	 * Delegate the server response to the appropriate methods
	 */

	emis.mobile.TemplatesAPI = function( ) {

	}

	emis.mobile.TemplatesAPI.prototype.getTemplates = function( templateid, sessionId ) {
		var templatesUrl = TEMPLATES_URL.replace( "{rawSessionId}", sessionId );
		templatesUrl = templatesUrl.replace( "{rawTemplateId}", templateid );
		// in local json mode, the replace method returns the same source string,
		// if it cannot find the sub-string to be replaced

		var requestUrl = EMIS_BASE_URL + templatesUrl;
		var requestType = REQUEST_GET;
		var requestParameters = "";

		if ( WEBSERVICE_MODE == "PROXYMODE" ) {
			requestType = REQUEST_POST;
			requestUrl = EMIS_BASE_URL;
			requestParameters = "method=" + REQUEST_GET + "&url=" + templatesUrl;
		}
		this.webServiceObj = new emis.mobile.WebService( requestType, requestUrl, requestParameters );
		this.webServiceObj.delegate = this;
		this.webServiceObj.performRequest( );
	}

	emis.mobile.TemplatesAPI.prototype.fetchCompleted = function( response ) {

		var templatesResponse = null;
		try {
			templatesResponse = JSON.parse( response );
		} catch ( e ) {
			// Failure delegate to be implemented in the classes, where TemplatesAPI
			// object is created
			this.delegate.APIFailed.call( this.delegate, new emis.mobile.ErrorModel( JSON_ERROR_CODE, JSON_ERROR_DESCRIPTION ) );
		}

		if ( templatesResponse && !templatesResponse.Payload.EventCode ) {
			// Success delegate to be implemented in the classes, where TemplatesAPI
			// object is created
			this.delegate.templateSynchronized.call( this.delegate, templatesResponse );
		} else {
			display = ( templatesResponse.Payload.EventCode ) ? templatesResponse.Payload.Display : INVALID_RESPONSE_DESCRIPTION;
			if ( DEMO_AUTO_LOGIN ) {
				this.delegate.APIFailed.call( this.delegate, new emis.mobile.ErrorModel( INVALID_RESPONSE_CODE, display + " (Error code: " + templatesResponse.Payload.EventCode + ")" ) );
			} else {
				this.delegate.APIFailed.call( this.delegate, new emis.mobile.ErrorModel( INVALID_RESPONSE_CODE, display ) );
			}
		}
	} ;
	/** * Delegate. Invoked when webserviceObj, fetch Failed event is triggered. ** */
	emis.mobile.TemplatesAPI.prototype.fetchFailed = function( Error ) {
		// Failure delegate to be implemented in the classes, where TemplatesAPI
		// object is created
		this.delegate.APIFailed.call( this.delegate, Error );
	} ;
} )( );
