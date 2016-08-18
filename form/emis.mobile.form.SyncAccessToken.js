emis.mobile.form.SyncAccessToken = function( appObject ) {
	var _app = appObject, that = this, initiated = false, lastPage;

	var unbindEvents = function( ) {
		lastPage.off( 'pageshow', pageShow );
		emis.mobile.UI.removeOrientationEventsForDialog( orientationChange );
		$( "#appointments, #caseloads" ).css( {
			"overflow": "visible",
			"max-height": "none"
		} );
	}
	var pageShow = function( ) {
		orientationChange( );
	}
	var orientationChange = function( ) {
		var newHeight = emis.mobile.UI.calculateDialogPadding( _app, lastPage );
		$( "#appointments, #caseloads" ).css( {
			"min-height": newHeight,
			"max-height": newHeight,
			"overflow": "hidden"
		} );

		if ( lastPage ) {
			lastPage.css( {
				"padding-bottom": "",
				"height": ""
			});
		}
	}
	function gotoSynchronisation( ) {
		// This makes the synchronization login background transparent
		$.mobile.changePage( main.controller.backPage );
		setTimeout( function( ) {
			$.mobile.changePage( "#syncLoading" );
			// delay second page changeto give enough time for first one
		}, 1000 );
	}


	this.bindDataAndEvents = function( $page, refresh ) {
		lastPage = $page;
		unbindEvents( );

		$( "#textinputAccessToken" ).val( '' );

		if ( !initiated ) {

			$( "#confirmAccessToken" ).click( function( ) {
				var accessToken = $( "#textinputAccessToken" ).val( );
				// only digits are acceptable
				var notANumber = isNaN( accessToken );
				if ( accessToken.length > 0 && !notANumber ) {// that way it should work - jakub
					_app.controller.setAccessToken( accessToken );
					accessToken = null;
					gotoSynchronisation( );
				} else {
					emis.mobile.Utilities.alert( {message: "Please enter a valid access token.", backPage: $.mobile.activePage.selector} );
				}
				unbindEvents( );
			} );
			$( "#cancelAccessToken" ).click( function( ) {
				unbindEvents( );
				main.controller.isTrustedFinished = false; //cancelling the token - cancelling is trusted
				$.mobile.changePage( main.controller.backPage );
			} );
			// test aid - to fill login
			if ( DEMO_AUTO_LOGIN ) {
				var loginDiv = $( '#quickLogin' );
				if ( loginDiv != null ) {
					$( "#loginButton" ).parent( ).append( '<div id="quickLogin">&nbsp;</div>' );
				}
				$( '#quickAccessToken' ).on( 'click', function( ) {
					$( '#textinputAccessToken' ).val( DEMO_CDB );
					// TODO fake value
				} );
			} else {
				$( '#quickAccessToken' ).css( "display", "none" );
			}

			initiated = true;
		}

		emis.mobile.UI.addOrientationEventsForDialog( orientationChange );
		orientationChange( );
		$page.on( 'pageshow', pageShow );
	};

	return this;
}
