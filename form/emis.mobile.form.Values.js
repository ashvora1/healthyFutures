/**
 * Values form controller Functionalities provided:
 */

emis.mobile.form.Values = function( appObject ) {
	var _app = appObject;
	var that = this;

	var pageid = 'patientvalues' ;

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

	function getSectionFixedHeaderOpen( ) {
		return '<div class="header floatingHeader grid">';
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

	function getSectionHeaderContent( ) {
		var markup = "";
		markup += '<div class="no-data">Values (None)</div>';
		markup += '<div class="e-blocks">';
		markup += '<div class="grid-7 e-block-a">Term / Date</div>';
		markup += '<div class="grid-7 e-block-b"></div>';
		markup += '<div class="grid-7 e-block-c">Details</div>';
		markup += '<div class="grid-7 e-block-d">Abn</div>';
		markup += '<div class="grid-7 e-block-e">Value / Units</div>';
		markup += '<div class="grid-7 e-block-f">Range</div>';
		markup += '<div class="grid-7 e-block-g"></div>';
		markup += '</div>';
		return markup;
	}

	function fillSectionListview( markup, data ) {

		if ( !markup ) {
			markup = '';
		}

		if ( _app.util.isEmptyObject( data ) ) {
			markup += getSectionNoData( 'Values' );
		} else {

			markup += getSectionOpen( );

			/* invisible fixed header */
			// markup += getSectionFixedHeaderOpen();
			// markup += getSectionHeaderContent();
			// markup += getSectionHeaderClose();
			/* header */
			markup += getSectionHeaderOpen( );
			markup += getSectionHeaderContent( );
			markup += getSectionHeaderClose( );

			/* content */
			markup += getSectionContentOpen( );

			for ( var i = 0; i < data.length; i++ ) {
				var allValues = data[i];
				var value = allValues[0];
				markup += '<div class="e-blocks"';
				if(value.organisationId) {
					markup += ' data-org="' + value.organisationId + '"';
				}
				markup += '>';
				markup += '<div class="grid-7 e-block-a">' + _.h( value.term ) + '<br />' + f( value.date ) + '</div>';
				markup += '<div class="grid-7 e-block-b">';
				if (value.organisationId) {
					markup += '<i class="shared-orgs"></i>';
				}
				markup += '</div>';
				markup += '<div class="grid-7 e-block-c">' + _.h( value.associatedText ) + '</div>';
				markup += '<div class="grid-7 e-block-d abn">' + ( value.abnormal ? '!' : '' ) + '</div>';
				markup += '<div class="grid-7 e-block-e">' + _.h( value.value ) + ' ' + _.h( value.units ) + '</div>';
				markup += '<div class="grid-7 e-block-f">' + _.h( value.range ) + '</div>';
				markup += '<div class="grid-7 e-block-g">';
				markup += ( allValues.length > 1 ? '<a data-role="none" class="button" href="" data-em-value-code="' + value.code + '">View record</a>' : '' );
				markup += '</div>';
				markup += '</div>';
			}

			markup += getSectionContentClose( );
			markup += getSectionClose( );
		}

		return markup;
	}

	var setTableHeader = function( ) {
		var header = $( "#"+pageid+" .header" );
		var content = $( "#"+pageid+" .contentPanel .content" );
		// 15 - 2 - 1; // 15px is for
		// padding on the bottom of the
		// page, 2px is for borders of
		// this element, 1px i because
		// it doesn't work without it -
		// probably radius of border!
		var height = window.innerHeight - header.offset( ).top - header.height( ) - 18;
		content.css( {
			"max-height": height,
			"overflow-y": "scroll",
			"-ms-overflow-style": "scrollbar"
		} );

		$( "#patientvalues" ).css( {
			"min-height": 500 //was 300 but sometimes causes scrolling issue
			// to redo jquery.mobile.1.1.1.js : 2881 min-height set
		} )

		if ( emis.mobile.UI.isiPad ) {
			content.css( '-webkit-overflow-scrolling', 'touch' );
		}

	}
	var orientationChange = function( ) {
		setTableHeader( );
	}
	var pageHide = function( ) {
		emis.mobile.UI.removeOrientationEventsForDialog( orientationChange );
	}
	var pageShow = function( ) {
		emis.mobile.UI.addOrientationEventsForDialog( orientationChange );
		// small delay because we're adding some paddings etc on different events
		setTimeout( function( ) {
			orientationChange( );
		}, 100 );
	} ;

	function openhistory ( code ) {
		main.controller.valuesHistoryOpenByCode = true;
		main.controller.valuesHistoryCode = code;
		var content = $( "#"+pageid+" .contentPanel .content" );
		if ( emis.mobile.UI.isiPad ) {
			content.css( '-webkit-overflow-scrolling', 'auto' );
		}
		content.css( 'overflow-y', 'hidden' );
		main.controller.valuesHistorySource = "#"+pageid;
		$.mobile.changePage( "#patientvalueshistory", {
			delay: true
		} );
	} ;

	$( document ).delegate("#"+pageid, "pageinit", function() {
		$(this).on( 'pagehide', pageHide );
		$(this).on( 'pageshow', pageShow );

	}) ;

	this.bindDataAndEvents = function( $page, refresh ) {
		emis.mobile.UI.preparePatientPage( $page );
		emis.mobile.UI.injectSelectMenu( $page.selector );

		// values do not need sorting
		var notFilteredValues = _app.dataProvider.getPatientValues( _app.controller.patient.id );
		var values = _app.dataProvider.filterSharedValuesWithHistory( notFilteredValues );
		if ( refresh === true ) {
			// Clear the markup
			$( "#valuesContent" ).html( "" );

			// Prepare the markup
			var markup = '';
			markup = fillSectionListview( markup, values );

			// Inject the markup
			$( "#valuesContent" ).html( markup );

			if ( emis.mobile.UI.isAndroid ) {
				// scrolling list does not work on Nexus Android 4.4.2
				// setting -webkit-overflow-scrolling: touch; does not help
				var valuesListScrollStartPos = 0;
				$( "#valuesContent .content" ).on( 'touchstart', function( e ) {
					valuesListScrollStartPos = this.scrollTop + e.originalEvent.touches[0].pageY;
				} );
				$( "#valuesContent .content" ).on( 'touchmove', function( e ) {
					if ( this.scrollHeight > $( this ).height() ) {
						this.scrollTop = valuesListScrollStartPos - e.originalEvent.touches[0].pageY;
						e.preventDefault();
					}
				} );
			}

			// Bind click event for every button
			$( "#valuesContent a.button" ).on( 'click', function( ) {
				if ( $( this ).data( "em-value-code" ) != undefined ) {
					openhistory($(this).data("em-value-code"));
				}
			} );

			emis.mobile.UI.preparePatientHeader() ;
		}

		main.controller.sharedOrgs.attachSharedOrgsToScreen(that, "#" + pageid, ".content.grid > .e-blocks", notFilteredValues);
	};



	return this;
}

