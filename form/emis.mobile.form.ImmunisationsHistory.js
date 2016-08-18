/**
 * ImmunisationsHistory form conctroller Functionalities provided:
 */

emis.mobile.form.ImmunisationsHistory = function( appObject ) {
	var _app = appObject;
	var lastPage;
	var that = this;
	var pageid = 'patientimmunisationshistory';

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
			markup += '<div class="e-blocks">';
			markup += '<div class="grid-3 e-block-a">Date</div>';
			markup += '<div class="grid-3 e-block-b">Term</div>';
			markup += '<div class="grid-3 e-block-c">Details</div>';
			markup += '</div>';
			markup += getSectionHeaderClose( );

			/* content */
			markup += getSectionContentOpen( );

			for ( var i = 0; i < data.length; i++ ) {
				var value = data[i];
				markup += '<div class="e-blocks"';
				if( value.organisationId ) {
					markup += ' data-org="' + value.organisationId + '"';
				}
				markup += '>';
				markup += '<div class="grid-3 e-block-a">' + _.h( value.date ) + '</div>';
				markup += '<div class="grid-3 e-block-b">' + _.h( value.term );
				if ( value.organisationId ) {
					markup += '<i class="shared-orgs"></i>';
				}
				markup += '</div>';
				markup += '<div class="grid-3 e-block-c">' + _.h( value.associatedText ) + '</div>';
				markup += '</div>';
			}

			markup += getSectionContentClose( );
			markup += getSectionClose( );
		}
		return markup;
	}

	var unbindEvents = function( ) {
		emis.mobile.UI.removeOrientationEventsForDialog( orientationChange );
		lastPage.off( 'pageshow', pageShow );
		$( "#immunisationsHistoryCloseBtn" ).unbind( );
		$( "#patientimmunisations" ).css( "overflow", "visible" );
		$( "#patientimmunisations" ).css( "max-height", "none" );
	}
	var pageShow = function( ) {
		orientationChange( );
	}
	var orientationChange = function( ) {
		var newHeight = emis.mobile.UI.calculateDialogPadding( _app, lastPage );
		$( "#patientimmunisations" ).css( {
			"max-height": newHeight,
			"overflow": "hidden"
		} );
		if ( lastPage ) {
			lastPage.css( {
				"padding-bottom": "",
				"height": ""
			});
		}

		var content = $( "#patientimmunisationshistory" ).find( ":jqmData(role=content)" );
		var dialog = $( "#patientimmunisationshistory > div" );
		var dialogHeader = $( "#immunisationsHistoryHeader" );
		var marginTop = dialog.css( 'margin-top' );
		if ( dialog.css( 'margin-top' ).indexOf( "%" ) != -1 ) {
			marginTop = parseInt( parseInt( marginTop ) * window.innerHeight / 100 );
		} else {
			marginTop = parseInt( marginTop );
		}
		var dialogHeight = window.innerHeight - marginTop * 2 - dialogHeader.height( ) - parseInt( content.css( 'padding-top' ) ) - parseInt( content.css( 'padding-bottom' ) ) - parseInt( content.css( 'margin-top' ) ) - parseInt( content.css( 'margin-bottom' ) );
		content.css( {
			"max-height": dialogHeight + "px"
		} );
	}

	this.bindDataAndEvents = function( $page, refresh ) {

		// Clear the markup
		$( "#immunisationsHistoryContent" ).html( "" );

		lastPage = $page;
		var immunisations = _app.dataProvider.getPatientImmunisations( );
		unbindEvents( );
		$( "#immunisationsHistoryCloseBtn" ).click( function( e ) {
			unbindEvents( );
			$.mobile.changePage( "#patientimmunisations" );
		} );
		if ( !_app.util.isEmptyObject( immunisations ) ) {

			_app.util.sortBy( immunisations, "dueDate" );

			var customId = main.controller.immunisationsHistoryId;
			var immunisationIndex = null;
			if ( immunisations ) {
				for ( var i = 0; i < immunisations.length; i++ ) {
					if ( immunisations[i].customId == customId ) {
						immunisationIndex = i;
						break;
					}
				}
			}
			var immunisation = main.dataProvider.filterSharedValuesWithHistory( [ immunisations[immunisationIndex] ] );
			if ( immunisation.length ) {
				var history = immunisation[0].slice( 1 );
				var markup = '';
				markup = fillSectionListview( markup, history );
				// Inject the markup
				$( "#immunisationsHistoryContent" ).html( markup );
			}

			// Inject the markup
			$( "#immunisationsHistoryContent" ).html( markup );
		}
		emis.mobile.UI.addOrientationEventsForDialog( orientationChange );
		orientationChange( );
		$page.on( 'pageshow', pageShow );

		main.controller.sharedOrgs.attachSharedOrgsToScreen(that, "#" + pageid, ".content.grid > .e-blocks");
	};

	return this;
}
