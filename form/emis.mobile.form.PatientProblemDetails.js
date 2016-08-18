/**
 *
 */

emis.mobile.form.PatientProblemDetails = function( appObject ) {
	var _app = appObject;
	var that = this;
	// data holder
	this.data = [];
	var lastPage;

	var unbindEvents = function( ) {
		$( "#patientProblemDetailsCloseBtn" ).unbind( );
		lastPage.off( 'pageshow', pageShow );
		emis.mobile.UI.removeOrientationEventsForDialog( orientationChange );
		$( "#patientproblemslist" ).css( {
			"overflow": "visible",
			"max-height": "none"
		} );
	}
	var pageShow = function( ) {
		orientationChange( );
	}
	var orientationChange = function( ) {
		var newHeight = emis.mobile.UI.calculateDialogPadding( _app, lastPage );
		$( "#patientproblemslist" ).css( {
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

	function getSectionContentOpen( ) {
		return '<div class="content grid">';
	}

	function getSectionContentClose( ) {
		return '</div>';
	}


	this.bindDataAndEvents = function( $page, refresh ) {

		// Clear the markup
		$( "#patientProblemDetailsContent" ).html( "" );

		lastPage = $page;
		unbindEvents( );
		$( "#patientProblemDetailsCloseBtn" ).click( function( e ) {
			unbindEvents( );
			$.mobile.changePage( "#patientproblemslist" );
		} );

		// active problem from parameter
		var problem = that.data.problem;
		if ( !_app.util.isEmptyObject( problem ) ) {
			// Get the page we are going to dump our content into.

			// Get the content area element for the page.
			$header = $page.find( ":jqmData(role=header)" );

			$header.find( ":jqmData(container=header-title)" ).html( _.h( problem.term ) );

			var markup = '';
			markup += getSectionOpen( );
			markup += getSectionContentOpen( );

			markup += '<div class="e-blocks">';
			markup += '<div class="grid-2 e-block-a">Associated text</div>';
			markup += '<div class="grid-2 e-block-b">' + _.h(problem.associatedText ) + '</div>';
			markup += '</div>';

			markup += '<div class="e-blocks">';
			markup += '<div class="grid-2 e-block-a">Onset date</div>';
			markup += '<div class="grid-2 e-block-b">' + _.h( problem.onsetDate ) + '</div>';
			markup += '</div>';

			/*
			 * "encounters": [ { "date": "13-Jun-2012", "author": "BURNS, Robert (Dr)", "source": "GP Surgery" },
			 */
			markup += '<div class="e-blocks">';
			markup += '<div class="grid-2 e-block-a">Previous reviews</div>';
			markup += '<div class="grid-2 e-block-b">';
			if ( !_app.util.isEmptyObject( problem.encounters ) ) {
				for ( var i = 0; i < problem.encounters.length; i++ ) {
					var encounter = problem.encounters[i];
					markup += '<div class="one-encounter"><span>' + _.h(encounter.date) + '</span> <span>' + _.h(encounter.author) + '</span> <span>' + _.h(encounter.source) + '</span></div>';
				}
			}
			markup += '</div>';
			markup += '</div>';

			markup += getSectionContentClose( );
			markup += getSectionClose( );
			$( "#patientProblemDetailsContent" ).html( f( markup ) );
		}
		emis.mobile.UI.addOrientationEventsForDialog( orientationChange );
		orientationChange( );
		$page.on( 'pageshow', pageShow );
	};

	return this;
}
