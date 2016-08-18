/**
 * MedicationDetails form controller
 */

emis.mobile.form.MedicationDetails = function( appObject ) {
	var _app = appObject;
	var that = this;
	// data holder
	this.data = [];
	var lastPage;

	var unbindEvents = function( ) {
		$( "#medicationDetailsCloseBtn" ).unbind( );
		lastPage.off( 'pageshow', pageShow );
		emis.mobile.UI.removeOrientationEventsForDialog( orientationChange );
		$( "#patientmedications" ).css( {
			"overflow": "visible",
			"max-height": "none"
		} );
		$.mobile.changePage( "#patientmedications" );
	}
	var pageShow = function( ) {
		orientationChange( );
	}
	var orientationChange = function( ) {
		var newHeight = emis.mobile.UI.calculateDialogPadding( _app, lastPage );
		$( "#patientmedications" ).css( {
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
	function format( v ) {
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

	function getSectionContentOpen( ) {
		return '<div class="content grid">';
	}

	function getSectionContentClose( ) {
		return '</div>';
	}

	function createOneBlock( markup, name, value ) {
		markup += '<div class="e-blocks">';
		markup += '<div class="grid-2 e-block-a">' + _.h(name) + '</div>';
		markup += '<div class="grid-2 e-block-b">' + _.h(value) + '</div>';
		markup += '</div>';
		return markup;
	}


	this.bindDataAndEvents = function( $page, refresh ) {

		// Clear the markup
		$( "#medicationDetailsContent" ).html( "" );

		lastPage = $page;
		unbindEvents( );
		$( "#medicationDetailsCloseBtn" ).click( function( e ) {
			unbindEvents( );
		} );
		var med = that.data.medication;
		if ( !_app.util.isEmptyObject( med ) ) {
			emis.mobile.console.log( 'MedicationDetails' );

			// Get the content area element for the page.
			$header = $page.find( ":jqmData(role=header)" );

			var date = null, comp = '';
			if ( med.issueDate ) {
				date = med.issueDate;
			} else {
				date = med.lastIssueDate;
			}
			if ( med.compliance ) {
				comp = med.compliance + '%';
			}
			$header.find( ":jqmData(container=header-title)" ).text( format( med.term ) );

			var markup = '';
			markup += getSectionOpen( );
			markup += getSectionContentOpen( );

			markup = createOneBlock( markup, "Dosage/Quantity", format( med.dosage ) + " / " + format(med.quantity) );
			markup = createOneBlock( markup, "No. Authorisations", format( med.issueNumber ) );
			markup = createOneBlock( markup, "Last issue", format( date ) );
			markup = createOneBlock( markup, "Compliance", format( comp ) );
			markup = createOneBlock( markup, "Authorising user", format( med.author ) );

			markup += getSectionContentClose( );
			markup += getSectionClose( );

			$( "#medicationDetailsContent" ).html( markup );
		}
		emis.mobile.UI.addOrientationEventsForDialog( orientationChange );
		orientationChange( );
		$page.on( 'pageshow', pageShow );

		// Scroll back to the viewing position
		// emis.mobile.UI.returnToScrolledPosition(); // is it rly needed for dialog? - JI
	};

	return this;
}
