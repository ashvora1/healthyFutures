/**
 * Referrals form conctroller Functionalities provided:
 */

emis.mobile.form.Referrals = function( appObject ) {
	var _app = appObject;
	var that = this;
	var pageid = 'patientreferrals';

	function f( v ) {
		if ( v )
			return v;
		return '';
	}

	function getSectionNoData( sectionTitle ) {
		return '<div class="contentPanel"><div class="header no-data">' + sectionTitle + ' (None)</div></div>'
	}

	function getSectionOverContentOpen( text ) {
		return '<div class="over-content"><div class="over-header">' + text + '</div>';
	}

	function getSectionOverContentClose( ) {
		return '</div>';
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

	function fillSectionListview( markup, data, sectionName, sectionTitle ) {

		if ( !markup )
			markup = '';

		markup += getSectionOverContentOpen( sectionTitle );
		if ( _app.util.isEmptyObject( data ) ) {
			markup += getSectionNoData( "" );
		} else {
			markup += getSectionOpen( );

			/* header */
			markup += getSectionHeaderOpen( );
			markup += '<div class="no-data">' + sectionTitle + ' (None)</div>';
			markup += '<div class="e-blocks">';
			markup += '<div class="grid-4 e-block-a">Date<br/>To</div>';
			markup += '<div class="grid-4 e-block-b">Term<br/>Urgency</div>';
			markup += '<div class="grid-4 e-block-c">Details<br/>Speciality</div>';
			markup += '<div class="grid-4 e-block-d">From</div>';
			markup += '</div>';
			markup += getSectionHeaderClose( );

			/* content */
			markup += getSectionContentOpen( );

			for ( var i = 0; i < data.length; i++ ) {
				var referral = data[i];
				markup += '<div class="e-blocks"';
				if(referral.organisationId) {
					markup += ' data-org="' + referral.organisationId + '"';
				}
				markup += '>';
				markup += '<div class="grid-4 e-block-a">' + _.h( referral.date ) + '<br/>' + _.h( referral.to );
				if (referral.organisationId) {
					markup += '<i class="shared-orgs"></i>';
				}
				markup += '</div>';
				markup += '<div class="grid-4 e-block-b">' + _.h( referral.term ) + '<br/>' + _.h( referral.urgency ) + '</div>';
				markup += '<div class="grid-4 e-block-c">' + _.h( referral.associatedText ) + '<br/>' + _.h( referral.spaciality ) + '</div>';
				markup += '<div class="grid-4 e-block-d">' + _.h( referral.from ) + '</div>';
				markup += '</div>';
			}

			markup += getSectionContentClose( );
			markup += getSectionClose( );
		}
		markup += getSectionOverContentClose( );
		return markup;
	}

	var unbindEvents = function( ) {
		emis.mobile.UI.removeOrientationEventsForDialog( orientationChange );
	}
	function orientationChange( ) {
		$( "#patientreferrals" ).css( {
			"min-height": 300
			// to redo jquery.mobile.1.1.1.js : 2881 min-height set
		} )
	}


	this.bindDataAndEvents = function( $page, refresh ) {
		emis.mobile.UI.preparePatientPage( $page );
		emis.mobile.UI.injectSelectMenu( $page.selector );
		var referrals = _app.dataProvider.getPatientReferrals( );
		if ( refresh === true ) {
			// Clear the markup
			$( "#referralsContent" ).html( "" );

			var markup = '';

			if ( !_app.util.isEmptyObject( referrals ) ) {
				// Prepare the markup
				markup = fillSectionListview( markup, referrals.outbound, 'outbound', 'Outbound' );
				markup = fillSectionListview( markup, referrals.inbound, 'inbound', 'Inbound' );
			} else {
				// Prepare the markup
				markup += getSectionNoData( 'Outbound' );
				markup += getSectionNoData( 'Inbound' );
			}

			// Inject the markup
			$( "#referralsContent" ).html( markup );

			emis.mobile.UI.preparePatientHeader() ;

		}
		emis.mobile.UI.addOrientationEventsForDialog( orientationChange );
		orientationChange( );
		emis.mobile.UI.tryBindShowHideToPage($page, orientationChange, unbindEvents);
		main.controller.sharedOrgs.attachSharedOrgsToScreen(that, "#" + pageid, ".content.grid > .e-blocks", referrals);
	};

	return this;
}
