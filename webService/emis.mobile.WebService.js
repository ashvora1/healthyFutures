/**
 * HTTP request service
 * Functionalities provided:
 * Perform HTTP requests
 */

/** * The constructor ** */
emis.mobile.WebService = function( requestType, requestUrl, requestParameters ) {
	// ie fix - JI
	n = requestUrl.indexOf( "#/" );
	if ( n >= 0 ) {
		requestUrl = ( requestUrl.substring( 0, n ) + requestUrl.substring( n + 2 ) );
	}
	this.requestType = requestType;
	this.requestUrl = requestUrl;
	this.requestParameters = requestParameters;
}

emis.mobile.WebService.prototype.performRequest = function( ) {
	var xmlhttp;
	// Common JavsScript hack to pass this pointer to onreadystatechange
	// function.
	var that = this;

	var timeoutHandler = function() {
		// To be implemented in the classes, where WebService object is created
		// and performrequest method is invoked
		that.delegate.fetchFailed.call( that.delegate, new emis.mobile.ErrorModel( CONNECTION_ERROR_CODE, CONNECTION_ERROR_DESCRIPTION ) );
	}

	var failHandler = function( responseText ) {
		// Webservice failed. Delegate the failure message to caller.
		// to check url:' + that.requestUrl +'\nhttp status:'+xmlhttp.status+'\n response:' + responseText +
		// 'a';
		// just to check the response when we got 'could not retrieve data'- solving bug from emis
		responseText = SERVER_ERROR_DESCRIPTION;

		emis.mobile.console.log( responseText );
		emis.mobile.console.log( 'url:' + that.requestUrl );
		// To be implemented in the classes, where WebService object is
		// created and performrequest method is invoked
		that.delegate.fetchFailed.call( that.delegate, new emis.mobile.ErrorModel( SERVER_ERROR_CODE, responseText ) );
	}

	var responseHandler = function( response ) {
		var bBreak = false;
		var bOk = false;
		try {
			//if( main.DEBUG ) {
			//	response = '{"Reference":"4cbdbf15-1fee-8f54-332b-83c52967b105","Type":0,"HttpFaultCode":"403","Display":"Given patient\/appointment slot is not mobile","EventCode":-15004}';
			//}
			/*
			 * TODO: This adds payload fields if not available in response. to use locally loaded JSONs
			 * instead of webservice, for testing. Need to remove in final version
			 */
			var json = JSON.parse( response );
			var jsonWithPayload = {};
			if ( !json.Payload ) {
				jsonWithPayload.Payload = json;
				json = jsonWithPayload ;
				response = JSON.stringify( json );
			}

			var pyl = json.Payload ;

			var mc = main.constants ;
			if (pyl.EventCode == mc.SESSION_ENDED ||
				pyl.EventCode == mc.ACCESS_DENIED ||
				pyl.EventCode == mc.ACCOUNT_LOCKED) {
				emis.mobile.console.warn('Logging out because of EventCode: ' + pyl.EventCode);
					window.setTimeout(function() {
						main.controller.gotoLoginPage() ;
					}, 1000) ;
					bBreak = true;
			}

			if ( ! bBreak ) {
				// Sucess. Delegate the response to the caller.
				that.delegate.fetchCompleted.call( that.delegate, response );
				bOk = true;
			}
		} catch ( e ) {
			emis.mobile.console.error( e );
		}
		return { "bOk" : bOk, "bBreak" : bBreak };
	}

	if ( emis.mobile.nativeFrame.windows ) {
		var windowsStorage = new emis.mobile.WindowsStorage();
		var deferred = $.Deferred( );
		windowsStorage.sendRequest( this.requestType, this.requestUrl, this.requestParameters, deferred );
		deferred.promise( ).done( function(response){
			var tempResponse = responseHandler( response );
			if ( tempResponse.bBreak ) {
				return false;
			} else if ( ! tempResponse.bOk ) {
				failHandler( response );
			}
		}).fail( function(response) {
			if ( response && typeof response === "string" ) {
				if ( response.toLowerCase() == "timeout" ) {
					timeoutHandler();
				} else {
					failHandler( response );
				}
			}
		}) ;
	} else {
		xmlhttp = new XMLHttpRequest( );
		// var urlEncoded = encodeURIComponent(this.requestUrl).replace(/\%2F/g,"/");
		xmlhttp.open( this.requestType, this.requestUrl, true );
		// We use JSON
		xmlhttp.setRequestHeader( "Accept", "application/json" );
		// GET requests may get cached. Forcing to avoid this.
		xmlhttp.setRequestHeader( "Cache-Control", "no-cache" );
		xmlhttp.setRequestHeader( "pragma", "no-cache" );
		xmlhttp.setRequestHeader( "Content-type", "application/x-www-form-urlencoded" );
		xmlhttp.onreadystatechange = function( ) {
			if ( xmlhttp.readyState == 4 ) {
				var bOk = false;
				if ( xmlhttp.status == 200 || xmlhttp.status >= 400 ) {
					if ( xmlhttp.responseText ) {
						var tempResponse = responseHandler( xmlhttp.responseText );
						if ( tempResponse.bBreak ) {
							return false;
						}
						bOk = tempResponse.bOk;
					}
				}
				if ( !bOk ) {
					failHandler( xmlhttp.responseText );
				}
			}
		}
		xmlhttp.send( this.requestParameters );
		xmlhttp.ontimeout = function( ) {
			timeoutHandler();
		}
	}

	return xmlhttp;

}
