/**
 * Diary form conctroller Functionalities provided:
 */

emis.mobile.form.Diary = function( appObject ) {
	var _app = appObject;
	var that = this;
	var pageid = 'patientdiary';

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

		if ( !markup )
			markup = '';

		if ( _app.util.isEmptyObject( data ) ) {
			markup += getSectionNoData( 'Diary' );
		} else {

			markup += getSectionOpen( );

			/* header */
			markup += getSectionHeaderOpen( );
			markup += '<div class="no-data">Diary (None)</div>';
			markup += '<div class="e-blocks">';
			markup += '<div class="grid-3 e-block-a">Due Date</div>';
			markup += '<div class="grid-3 e-block-b">Term</div>';
			markup += '<div class="grid-3 e-block-c">Details</div>';
			markup += '</div>';
			markup += getSectionHeaderClose( );

			/* content */
			markup += getSectionContentOpen( );

			for ( var i = 0; i < data.length; i++ ) {
				var diary = data[i];

				var date = new Date( );
				var monthDate = date.getMonth( ) + 1;
				var nowDate = date.getDate( ) + "" + monthDate + "" + date.getFullYear( );

				var date2 = null;
				var bPastDate = false;
				var diaryDueDate = diary.dueDate || diary.date;
				if ( diaryDueDate ) {
					date2 = diaryDueDate.split( "-" );
					bPastDate = date2[2] < date.getFullYear( ) || ( date2[2] == date.getFullYear( ) && _app.util.convertMonth( date2[1] ) < monthDate ) || ( date2[2] == date.getFullYear( ) && _app.util.convertMonth( date2[1] ) == monthDate && date2[0] < date.getDate( ) );
				}

				markup += '<div class="e-blocks"';
				if(diary.organisationId) {
					markup += ' data-org="' + diary.organisationId + '"';
				}
				markup += '>';
				markup += '<div class="grid-3 e-block-a ' + ( bPastDate ? 'in-past' : '' ) + '">' + _.h( diaryDueDate ) + '</div>';
				markup += '<div class="grid-3 e-block-b">' + _.h( diary.term );
				if(diary.organisationId) {
					markup += '<i class="shared-orgs"></i>';
				}
				markup += '</div>';
				markup += '<div class="grid-3 e-block-c">' + _.h( diary.associatedText ) + '</div>';
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
		$( "#patientdiary" ).css( {
			"min-height": 300
			// to redo jquery.mobile.1.1.1.js : 2881 min-height set
		} )
	}


	this.bindDataAndEvents = function( $page, refresh ) {
		$page.off( 'pagehide', unbindEvents );
		$page.off( 'pageshow', orientationChange );
		emis.mobile.UI.preparePatientPage( $page );
		emis.mobile.UI.injectSelectMenu( $page.selector );

		var diaryEntries = _app.dataProvider.getPatientDiaryEntries( );

		if ( refresh === true ) {
			// Clear the markup
			$( "#diaryContent" ).html( "" );
			// they may want it again...
			//_app.util.sortBy( diaryEntries, "dueDate" );
			//_app.util.sortBy( diaryEntries, "date" );

			// Prepare the markup
			var markup = '';
			markup = fillSectionListview( markup, diaryEntries );

			// Inject the markup
			$( "#diaryContent" ).html( markup );

			emis.mobile.UI.preparePatientHeader() ;


		}
		emis.mobile.UI.addOrientationEventsForDialog( orientationChange );
		orientationChange( );
		emis.mobile.UI.tryBindShowHideToPage($page, orientationChange, unbindEvents);

		main.controller.sharedOrgs.attachSharedOrgsToScreen(that, "#" + pageid, ".content.grid > .e-blocks", diaryEntries);
	};

	return this;
}
