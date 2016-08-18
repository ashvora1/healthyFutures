/**
 * Immunisations form conctroller Functionalities provided:
 */

emis.mobile.form.Immunisations = function( appObject ) {
	var _app = appObject;
	var that = this;
	var pageid = 'patientimmunisations';

	function f( v ) {
		if ( v )
			return v;
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

		if ( !markup ) {
			markup = '';
		}

		if ( _app.util.isEmptyObject( data ) ) {
			markup += getSectionNoData( 'Immunisations' );
		} else {
			markup += getSectionOpen( );

			/* header */
			markup += getSectionHeaderOpen( );
			markup += '<div class="no-data">Immunisations (None)</div>';
			markup += '<div class="e-blocks">';
			markup += '<div class="grid-4 e-block-a">Date</div>';
			markup += '<div class="grid-4 e-block-b">Term</div>';
			markup += '<div class="grid-4 e-block-c">Details</div>';
			markup += '<div class="grid-4 e-block-d"></div>';
			markup += '</div>';
			markup += getSectionHeaderClose( );

			/* content */
			markup += getSectionContentOpen( );

			for ( var i = 0; i < data.length; i++ ) {
				var allImmunisations = data[i];
				var immunisation = allImmunisations[0];
				markup += '<div class="e-blocks"';
				if(immunisation.organisationId) {
					markup += ' data-org="' + immunisation.organisationId + '"';
				}
				markup += '>';
				markup += '<div class="grid-4 e-block-a">' + _.h( immunisation.date ) + '</div>';
				markup += '<div class="grid-4 e-block-b">' + _.h( immunisation.term );
				if(immunisation.organisationId) {
					markup += '<i class="shared-orgs"></i>';
				}
				markup += '</div>';
				markup += '<div class="grid-4 e-block-c">' + _.h( immunisation.associatedText ) + '</div>';
				markup += '<div class="grid-4 e-block-d">' + ( allImmunisations.length > 1 ? '<a data-role="none" class="button" href="" data-em-immunisation-custom-id="' + immunisation.customId + '">View record</a>' : '' ) + '</div>';
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
		$( "#patientimmunisations" ).css( {
			"min-height": 300
			// to redo jquery.mobile.1.1.1.js : 2881 min-height set
		} )
	}

	this.bindDataAndEvents = function( $page, refresh ) {
		emis.mobile.UI.preparePatientPage( $page );
		emis.mobile.UI.injectSelectMenu( $page.selector );

		var immunisations = _app.dataProvider.getPatientImmunisations( );

		if ( refresh === true ) {
			// Clear the markup
			$( "#immunisationsContent" ).html( "" );

			if ( immunisations.sort ) {
				_app.util.sortBy( immunisations, "dueDate" );
			} else {
				// for empty immunistaion comes an empty object {} not null or array
				immunisations = null;
			}

			// Prepare markup
			var markup = '';
			var filteredImmunisations = [];
			if ( immunisations ) {
				filteredImmunisations = _app.dataProvider.filterSharedValuesWithHistory( immunisations );
			}
			markup = fillSectionListview( markup, filteredImmunisations );

			// Inject the markup
			$( "#immunisationsContent" ).html( markup );

			// Bind button click events
			$( "#immunisationsContent a.button" ).on( 'click', function( ) {
				window.scrolled = $( window ).scrollTop( );
				if ( $( this ).data( "em-immunisation-custom-id" ) != undefined ) {
					emis.mobile.form.Immunisations.openhistory( $( this ).data( "em-immunisation-custom-id" ) );
				}
			} );

			var data = _app.dataProvider.getPatientDemographic( );
			// Inject the page title (info)
			emis.mobile.UI.preparePatientHeader() ;

		}

		emis.mobile.UI.addOrientationEventsForDialog( orientationChange );
		orientationChange( );
		emis.mobile.UI.tryBindShowHideToPage($page, orientationChange, unbindEvents)

		// Scroll back to the viewing position
		// emis.mobile.UI.returnToScrolledPosition();

		main.controller.sharedOrgs.attachSharedOrgsToScreen(that, "#" + pageid, ".content.grid > .e-blocks", immunisations);
	};

	return this;
}

emis.mobile.form.Immunisations.openhistory = function openhistory( customId ) {
	main.controller.immunisationsHistoryId = customId;
	$.mobile.changePage( "#patientimmunisationshistory", {
		delay: true
	} );
}
