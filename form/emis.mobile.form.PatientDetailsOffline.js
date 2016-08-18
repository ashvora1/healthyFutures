/**
 * MapView form controller Functionalities provided:
 */
emis.mobile.form.PatientDetailsOffline = function( appObject ) {
	var _app = appObject, that = this, map = null, mapCtx = null, lastPage = null;

	var unbindEvents = function( ) {
		$( "#patientDetailsOfflineCloseBtn" ).unbind( );
		lastPage.off( 'pageShow' );
		//@formatter:off
		// called on pages with patient details dialog
		$( "#appointments, #caseloads, #patientsummary, #patientmedications, #patientconsultations, #patientproblemslist, "
				+ "#patientvalues, #patientmedicationdetails, #patientimmunisations, "
				+ "#patientdiary, #patientallergies, #templatelist, #templateParser, #taskList" ).css( {
					"min-height": "none",
					"max-height": "none",
					"overflow": "visible"
				} );
		//@formatter:on
		emis.mobile.UI.removeOrientationEventsForDialog( orientationChange );
	}
	var orientationChange = function( ) {
		var newHeight = emis.mobile.UI.calculateDialogPadding( _app, lastPage );

		//@formatter:off
		$( "#appointments, #caseloads, #patientsummary, #patientmedications, #patientconsultations, #patientproblemslist, "
				+ "#patientvalues, #patientmedicationdetails, #patientimmunisations, "
				+ "#patientdiary, #patientallergies, #templatelist, #templateParser, #taskList" ).css( {
					"min-height": newHeight,
					"max-height": newHeight,
					"overflow": "hidden"
				} );
		//@formatter:on

		$( "#patientDetailsOffline" ).css( {
			"min-height": newHeight,
			"height": newHeight,
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
	var pageShow = function( ) {
		orientationChange( );
	}
	function getValue( value ) {
		if ( value != null )
			return value;
		else
			return '';
	}

	function fillFeatureOfflinePanel( markup, patientData ) {
		var postalCode = getValue( patientData.postcode );
		if ( postalCode.length > 0 ) {
			postalCode = ', ' + postalCode;
		}

	//@formatter:off
		markup += '<div class="ui-grid-b">'
		+ '<div class="ui-block-a patientDetailsInfoItem textBold">Address</div>'
		+ '<div class="ui-block-b patientDetailsInfoItem textBold">Phone numbers</div>'
		+ '<div class="ui-block-c patientDetailsInfoItem textBold">Usual GP</div>'
		+ '<div class="ui-block-a patientDetailsInfoItem">'
		+ _.h(patientData.address) + _.h(postalCode)
		+ '</div>'
		+ '<div class="ui-block-b patientDetailsInfoItem">'
		+ '<div>Home: '
		+ _.h( patientData.homePhone ? patientData.homePhone : 'n/a' )
		+ '</div>'
		+ '<div>Mobile: '
		+ _.h( patientData.mobilePhone ? patientData.mobilePhone : 'n/a' )
		+ '</div>' + '</div>'
		+ '<div class="ui-block-c patientDetailsInfoItem">'
		+ _.h(patientData.usualGP)
		+ '</div>' + '</div>';
		return markup;
		//@formatter:on
	}


	this.bindDataAndEvents = function( $page, refresh ) {
		$page.off( 'pageShow' );
		$page.on( ' pageShow' );
		var markup = '';
		var data = main.dataProvider.getPatientDemographicById(this.patientId)
		markup = fillFeatureOfflinePanel( markup, data );

		$( "#patientDetailsOfflineGrid" ).html( markup );

		lastPage = $page;
		unbindEvents( );
		$( "#patientDetailsOfflineCloseBtn" ).click( function( e ) {
			unbindEvents( );
			$.mobile.changePage( main.controller.patientDetailsBackgroundPage );
		} );



		$( "#patientNameOffline" ).html( data.name );
		emis.mobile.UI.addOrientationEventsForDialog( orientationChange );
		setTimeout( orientationChange, 300 );
	}

	return this;
};
