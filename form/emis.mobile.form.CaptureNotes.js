/**
 * Capture Notes form controller Functionalities provided: - create and edit quicknotes
 */

emis.mobile.form.CaptureNotes = function( appObject ) {
	var that = this;
	var _app = appObject;

	function getSectionNoData( sectionTitle ) {
		return '<div class="contentPanel"><div class="header no-data">' + sectionTitle + ' (None)</div></div>'
	}


	this.bindDataAndEvents = function( $page ) {
		$page.off( 'pagehide', unbindEvents );
		$page.off( 'pageshow', orientationChange );

		// get data
		var data = _app.dataProvider.getNotes( );

		// Prepare the markup
		var markup = '';
		markup = fillSectionListview( markup, data );

		// Inject the markup
		$( "#captureNotesContent" ).html( markup );

		$( '#saveNote' ).on( 'click', function( ) {
			saveNote( );
		} );

		emis.mobile.UI.tryBindShowHideToPage($page, orientationChange, unbindEvents)
		
	};

	var saveNote = function( ) {

	};

	function fillSectionListview( markup, data ) {

		if ( !markup )
			markup = '';

		if ( _app.util.isEmptyObject( data ) ) {
			markup += getSectionNoData( 'Capture Notes' );
		} else {

			markup += '<div class="contentPanel">';

			/* header */
			markup += '<div class="header grid">';
			markup += '<div class="e-blocks">';
			markup += '<div class="grid-3 e-block-a">Due Date</div>';
			markup += '<div class="grid-3 e-block-b">Term</div>';
			markup += '<div class="grid-3 e-block-c">Details</div>';
			markup += '</div>';
			markup += '</div>';

			/* content */
			markup += '<div class="content grid">';
			// fill with data
			markup += '</div>';

			markup += '</div>';
		}

		return markup;
	}

	var unbindEvents = function( ) {
		emis.mobile.UI.removeOrientationEventsForDialog( orientationChange );
	}
	function orientationChange( ) {
		$( "#captureNotes" ).css( {
			"min-height": 300
			// to redo jquery.mobile.1.1.1.js : 2881 min-height set
		} );
	}
	return this;
};
