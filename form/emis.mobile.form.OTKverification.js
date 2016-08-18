emis.mobile.form.OTKverification = function( appObject ) {
	var _app = appObject;
	var that = this;
	var initiated = false;
	var lastPage;

	var unbindEvents = function() {
		lastPage.off( 'pageshow', pageShow );
		emis.mobile.UI.removeOrientationEventsForDialog( orientationChange );
		$( "#bookAppointments,#patientdocuments" ).css( {
			"overflow": "visible",
			"max-height": "none"
		} );
	}

	var pageShow = function() {
		orientationChange();
	}

	var orientationChange = function() {
		var newHeight = emis.mobile.UI.calculateDialogPadding( _app, lastPage );
		$( "#bookAppointments,#patientdocuments" ).css( {
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

	function goBack() {
		unbindEvents();
		main.controller.runNonSyncWSManager = true;
		$.mobile.changePage( main.controller.lastNonSyncWSManagerDelegate );
	}

	this.bindDataAndEvents = function( $page ) {
		lastPage = $page;
		unbindEvents();

		$( "#textinputAccessToken" ).val( '' );

		if ( !initiated ) {

			$( "#confirmOTK" ).click( function() {
				var accessToken = $( "#textinputOTK" ).val();
				var notANumber = isNaN( accessToken );
				// that way it should work - jakub
				if ( accessToken.length > 0 && !notANumber ) {
					_app.controller.setAccessToken( accessToken );
					accessToken = null;
					$( "#textinputOTK" ).val( "" );
					goBack();
				} else {
					emis.mobile.Utilities.alert( {message:"Please enter a valid access token.", backPage: $.mobile.activePage.selector} );
				}
				unbindEvents();
			} );
			$( "#cancelOTK" ).click( function() {
				$( "#textinputOTK" ).val( "" );
				unbindEvents();
				$.mobile.changePage( main.controller.lastNonSyncWSManagerDelegate );
			} );
			// test aid - to fill login
			if ( DEMO_AUTO_LOGIN ) {
				var loginDiv = $( '#quickLogin' );
				if ( loginDiv != null ) {
					$( "#loginButton" ).parent().append( '<div id="quickLogin">&nbsp;</div>' );
				}
				$( '#quickOTK' ).on( 'click', function() {
					$( '#textinputOTK' ).val( DEMO_CDB );
				} );
			} else {
				$( '#quickOTK' ).css( "display", "none" );
			}

			initiated = true;
		}

		emis.mobile.UI.addOrientationEventsForDialog( orientationChange );
		orientationChange();
		$page.on( 'pageshow', pageShow );
	};

	return this;
}
