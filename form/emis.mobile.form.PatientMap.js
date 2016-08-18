/**
 * MapView form controller Functionalities provided:
 */
emis.mobile.form.PatientMap = function( appObject ) {
	var _app = appObject;
	var that = this;
	var mapCtx = null ;
	var lastPage = null;
	var visibleMarkers = [] ;
	var bMapStarted = false;
	var bPageShowCalled = false;

	var that = this ;

	/*
	 * Open marker for the currently selected patient Close any other
	 */
	function openMarkerForPatient( ) {

		visibleMarkers = mapCtx.openFilteredMarkers( function( marker ) {
			return marker ;
		});

		centerMap( visibleMarkers );
	} ;

	function initMarker () {
		var markupsData = main.dataProvider.getMarkupsDataBySlotId(that.slotId);

		mapCtx.destroyMarkers(); // close other markers
		if (!_app.util.isEmptyObject(markupsData)) {
			// Initialize them into markers on the map
			mapCtx.initializeMarkers([{'object':markupsData}], function() {
				openMarkerForPatient();
			}, false );
		} else {
			mapCtx.showCurrentLocation( );
		}
	} ;

	/*
	 * Show the map.
	 */
	function startMap( callback ) {
		mapCtx = new _app.maps.createMapContext(_app);
		mapCtx.startMap( document.getElementById("patientMap"), function( ) {
			bMapStarted = true;
			if ( callback ) {
				callback();
			}
		} );
	}

	function centerMap( visibleMarkers ) {
		if ( visibleMarkers.length > 0 ) {
			// center on marker
			//mapCtx.centerOnLocation( visibleMarkers[0].marker.position );
			mapCtx.fitToMarkers($.map(visibleMarkers, function (m) { return m.marker; })) ;
		} else {
			mapCtx.showCurrentLocation( true );
		}
	}

	/*
	 * resize page height to make map view 100%
	 */
	function fitMapSize( ) {
		orientationChange( );
		if ( bMapStarted ) {
			_app.maps.resizeMap( mapCtx.map );
		}
	}

	var unbindEvents = function( ) {
		$( "#patientDetailsCloseBtn" ).unbind( );
		lastPage.off( 'pageshow' );
		lastPage.off( 'pagehide' );
		emis.mobile.UI.removeOrientationEventsForDialog( fitMapSize );
		// called on pages with patient details dialog
		//@formatter:off
		$( "#appointments, #caseloads, #bookAppointments, #patientsummary, #patientmedications, #patientconsultations, #patientproblemslist, "
		+ "#patientvalues, #patientmedicationdetails, #patientimmunisations, "
		+ "#patientdiary, #patientallergies, #templatelist, #templateParser, #taskList" ).css( {
			"max-height": "none",
			"overflow": "visible"
		} );
		//@formatter:on
	}
	var orientationChange = function( ) {
		var newHeight = emis.mobile.UI.calculateDialogPadding( _app, lastPage );

		//@formatter:off
		$( "#appointments, #caseloads, #bookAppointments, #patientsummary, #patientmedications, #patientconsultations, #patientproblemslist, "
		+ "#patientvalues, #patientmedicationdetails, #patientimmunisations, "
		+ "#patientdiary, #patientallergies, #templatelist, #templateParser, #taskList" ).css( {
			"min-height": newHeight,
			"max-height": newHeight,
			"overflow": "hidden"
		} );
		//@formatter:on

		if ( lastPage ) {
			lastPage.css( {
				"padding-bottom": "",
				"height": ""
			});
		}

	}
	function getValue( value ) {
		if ( value != null ) {
			return value;
		} else {
			return '';
		}
	}

	function fillFeaturePanel( markup, patientData ) {
		var postalCode = getValue( patientData.postcode );
		if ( postalCode.length > 0 )
			postalCode = ', ' + postalCode;

		markup += '<div class="headerTextPatientDetails">Address</div>' + '<div class="patientDetailsText">' + _.h(patientData.address) + _.h(postalCode) + '</div>' + '<div class="headerTextPatientDetails">Phone numbers</div>' + '<div class="patientDetailsText">Home: ' + _.h(patientData.homePhone ? patientData.homePhone : 'n/a' ) + '</div>' + '<div class="patientDetailsText">Mobile: ' + _.h( patientData.mobilePhone ? patientData.mobilePhone : 'n/a' ) + '</div>' + '<div class="headerTextPatientDetails">Usual GP</div>' + '<div class="patientDetailsText">' + _.h(patientData.usualGP) + '</div>';
		return markup;
	}

	function pageshowHandler() {
		if ( bMapStarted ) {
			finishMapLoading();
		} else {
			orientationChange();
		}

		bPageShowCalled = true;
	}

	var finishMapLoading = function() {
		fitMapSize();
		initMarker();
	}

	this.bindDataAndEvents = function( $page, refresh ) {
		bPageShowCalled = false;

		var appointment = main.dataProvider.getAppointmentById(this.slotId) ;
		if (appointment) {
			this.patientId = appointment.PatientId ;
			var data = main.dataProvider.getPatientDemographicById(this.patientId);
			var markup = '' ;
			markup = fillFeaturePanel( markup, data );
			$("#patientDetailsContent").html(markup);
			$("#patientName").html(_.h(data.name));
		} else {
			$( "#patientDetailsContent" ).html( "" );
			$( "#patientName" ).html( "" );
		}

		lastPage = $page;
		unbindEvents( );
		$( "#patientDetailsCloseBtn" ).click( function( e ) {
			unbindEvents( );
			$.mobile.changePage( main.controller.patientDetailsBackgroundPage );
		} );

		// If map already exists omit creating it again
		if ( ! mapCtx ) {
			startMap( function() {
				if ( bPageShowCalled ) {
					finishMapLoading();
				}
			} );
		}

		emis.mobile.UI.addOrientationEventsForDialog( fitMapSize );
		emis.mobile.UI.tryBindShowHideToPage($page, pageshowHandler, unbindEvents)

		if (main.controller.geocodingRunning) {
			emis.mobile.Utilities.alert({message: "Geocoding is still running, some map data might be missing.", backPage: $page.selector});
		}

	}

	return this;
};
