/**
 * Problems form conctroller Functionalities provided:
 */

emis.mobile.form.PatientProblemsList = function( appObject ) {
	var _app = appObject, that = this;
	this.problems = null;

	function onclickListButton( e ) {
		window.scrolled = $( window ).scrollTop( );
		var $el = $( e.currentTarget );
		var fctrs = _app.controller.getFormControllerStruct( '#patientproblemdetails' );
		fctrs.controller.data.problem = that.problems[$el.data( "em-problems-section" )][parseInt( $el.data( "em-problems-index" ) )];
	}

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

	function fillSectionListview( markup, problems, sectionName, sectionTitle ) {

		if ( !markup ) {
			markup = '';
		}

		if ( _app.util.isEmptyObject( problems ) ) {
			markup += getSectionNoData( sectionTitle );
		} else {

			markup += getSectionOpen( );

			// ' (' + problems.length + ')';
			var sItemsCount = '';

			/* header */
			markup += getSectionHeaderOpen( );
			markup += '<div class="no-data">' + sectionTitle + ' (None)</div>';
			markup += '<div class="e-blocks">';
			markup += '<div class="grid-5 e-block-a">' + sectionTitle + sItemsCount + '</div>';
			markup += '<div class="grid-5 e-block-b"></div>';
			markup += '<div class="grid-5 e-block-c">Onset date</div>';
			markup += '<div class="grid-5 e-block-d">Last review</div>';
			markup += '<div class="grid-5 e-block-e"></div>' + '</div>';
			markup += getSectionHeaderClose( );

			/* content */
			markup += getSectionContentOpen( );

			for ( var i = 0; i < problems.length; i++ ) {
				var problem = problems[i];
				markup += '<div class="e-blocks"'
				if(problem.organisationId) {
					markup += ' data-org="' + problem.organisationId + '"'
				}
				markup += '>';
				markup += '<div class="grid-5 e-block-a">' + _.h( problem.term )
				if(problem.organisationId)
					markup += '<i class="shared-orgs"></i>'
				markup += '</div>';
				markup += '<div class="grid-5 e-block-b">' + _.h( problem.associatedText ) + '</div>';
				markup += '<div class="grid-5 e-block-c">' + _.h(problem.onsetDate ) + '</div>';
				markup += '<div class="grid-5 e-block-d">' + _.h(problem.lastReviewDate || problem.endDate ) + '</div>';
				markup += '<div class="grid-5 e-block-e"><a data-role="none" class="button" href="#patientproblemdetails" data-em-problems-section="' + sectionName + '" data-em-problems-index="' + i + '">View record</a></div>';
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
		$( "#patientproblemslist" ).css( {
			"min-height": 300
			// to redo jquery.mobile.1.1.1.js : 2881 min-height set
		} )
	}


	this.bindDataAndEvents = function( $page, refresh ) {
		emis.mobile.UI.preparePatientPage( $page );
		emis.mobile.UI.injectSelectMenu( $page.selector );

		that.problems = _app.dataProvider.getPatientProblems( _app.controller.patient.id );
		if ( refresh === true ) {
			// Clear the markup
			$( "#problemsContent" ).html( "" );

			if ( !_app.util.isEmptyObject( that.problems ) ) {
				// Prepare the markup
				var markup = '';
				markup = fillSectionListview( markup, that.problems.active, 'active', 'Active problems' );
				markup = fillSectionListview( markup, that.problems.significantPast, 'significantPast', 'Significant past problems' );
				markup = fillSectionListview( markup, that.problems.minorPast, 'minorPast', 'Minor past problems' );
			} else {
				// Prepare the markup
				var markup = '';
				markup = fillSectionListview( markup, null, 'active', 'Active problems' );
				markup = fillSectionListview( markup, null, 'significantPast', 'Significant past problems' );
				markup = fillSectionListview( markup, null, 'minorPast', 'Minor past problems' );
			}

			// Inject the markup
			$( "#problemsContent" ).html( markup );

			// Bind button click events
			$( "#problemsContent a.button" ).on( "click", onclickListButton );

			emis.mobile.UI.preparePatientHeader() ;

			// Scroll back to the viewing position
			// emis.mobile.UI.returnToScrolledPosition();
		}
		emis.mobile.UI.addOrientationEventsForDialog( orientationChange );
		orientationChange( );
		emis.mobile.UI.tryBindShowHideToPage($page, orientationChange, unbindEvents)
		main.controller.sharedOrgs.attachSharedOrgsToScreen(that, "#patientproblemslist", ".content.grid > .e-blocks", that.problems)
	};
	return this;
}
