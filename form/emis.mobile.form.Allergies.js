/**
 * Allergies form conctroller Functionalities provided:
 */

emis.mobile.form.Allergies = function( appObject ) {
	var _app = appObject;
	var that = this;

	function f( v ) {
		if ( v ) {
			return v;
		}
		return '';
	}

	function getSectionNoData( sectionTitle ) {
		return '<div class="contentPanel"><div class="header no-data">' + sectionTitle + ' (None)</div></div>'
	}

	function getSectionOpen( ) {
		return '<div class="contentPanel">';
	}

	function getSectionClose( ) {
		return '</div>';
	}

	function getSectionHeaderOpen( ) {
		return '<div class="header grid">';
	}

	function getSectionHeaderClose( ) {
		return '</div>';
	}

	function getSectionContentOpen( ) {
		return '<div class="content grid">';
	}

	function getSectionContentClose( ) {
		return '</div>';
	}

	function fillSectionListview( markup, data ) {
		if ( !markup )
			markup = '';

		if ( _app.util.isEmptyObject( data ) ) {
			markup += getSectionNoData( 'Allergies' );
		} else {

			markup += getSectionOpen( );

			/* header */
			markup += getSectionHeaderOpen( );
			markup += '<div class="no-data">Allergies (None)</div>';
			markup += '<div class="e-blocks">';
			markup += '<div class="grid-3 e-block-a">Date</div>';
			markup += '<div class="grid-3 e-block-b">Term</div>';
			markup += '<div class="grid-3 e-block-c">Details</div>';
			markup += '</div>';
			markup += getSectionHeaderClose( );

			/* content */
			markup += getSectionContentOpen( );

			for ( var i = 0; i < data.length; i++ ) {
				var allergy = data[i];
				markup += '<div class="e-blocks"'
				if(allergy.organisationId) {
					markup += ' data-org="' + allergy.organisationId + '"'
				}
				markup += '>';

				markup += '<div class="grid-3 e-block-a">' + _.h(allergy.date ) + '</div>';
				markup += '<div class="grid-3 e-block-b">' + _.h( allergy.term )
				if(allergy.organisationId) {
					markup += '<i class="shared-orgs"></i>';
				}
				markup += '</div>';
				markup += '<div class="grid-3 e-block-c">' + _.h(allergy.associatedText ) + '</div>';
				markup += '</div>';
			}

			markup += getSectionContentClose( );
			markup += getSectionClose( );
		}
		return markup;
	}

	var unbindEvents = function( ) {
		emis.mobile.UI.removeOrientationEventsForDialog( orientationChange );
	}
	function orientationChange( ) {
		$( "#patientallergies" ).css( {
			"min-height": 300
			// to redo jquery.mobile.1.1.1.js : 2881 min-height set
		} )
	}

	this.bindDataAndEvents = function( $page, refresh ) {
		emis.mobile.UI.preparePatientPage( $page );
		emis.mobile.UI.injectSelectMenu( $page.selector );

		var allergies = _app.dataProvider.getPatientAllergies( );

		if ( refresh === true ) {
			// Clear the markup
			$( "#allergiesContent" ).html( "" );
			// Prepare markup

			var markup = fillSectionListview( markup, allergies );

			// Inject the markup
			$( "#allergiesContent" ).html( markup );

			emis.mobile.UI.preparePatientHeader() ;

		}

		$( "#drawer li" ).removeClass( "drawer-active" ).siblings( "#drawer-patient-record" ).addClass( "drawer-active" );

		emis.mobile.UI.addOrientationEventsForDialog( orientationChange );
		orientationChange( );

		emis.mobile.UI.tryBindShowHideToPage($page, orientationChange, unbindEvents)
		main.controller.sharedOrgs.attachSharedOrgsToScreen(that, "#patientallergies", ".content.grid > .e-blocks", allergies)
	};

	return this;
}
