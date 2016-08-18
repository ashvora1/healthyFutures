emis.mobile.form.ValuesMultiHistory = function( appObject ) {
	var _app = appObject;
	var lastPage;
	var that = this;
	var pageid = 'patientvaluesmultihistory';

	function replaceMonths( str ) {
		str = str.replace( "Jan", "01" );
		str = str.replace( "Feb", "02" );
		str = str.replace( "Mar", "03" );
		str = str.replace( "Apr", "04" );
		str = str.replace( "May", "05" );
		str = str.replace( "Jun", "06" );
		str = str.replace( "Jul", "07" );
		str = str.replace( "Aug", "08" );
		str = str.replace( "Sep", "09" );
		str = str.replace( "Oct", "10" );
		str = str.replace( "Nov", "11" );
		str = str.replace( "Dec", "12" );
		return str;
	}

	function getTimestamp( str ) {
		if ( str.indexOf( "-" ) > 2 )
			str = '01' + str;
		str = replaceMonths( str );
		str += ' 00:00:00';
		// extract date parts
		var d = str.match( /\d+/g );
		return +new Date( d[2], d[1] - 1, d[0], d[3], d[4], d[5] );
		// build
		// Date
		// object
	}

	/**
	 * format value
	 */
	function fv( v ) {
		if ( v ) {
			return v;
		}
		return '';
	}

	function parse( data, history ) {

		var ret = $.extend( {}, data );

		if ( history.term != null ) {
			ret.term = history.term;
		}
		if ( history.associatedText != null )
			ret.associatedText = history.associatedText;
		else
			ret.associatedText = '';
		if ( history.units != null )
			ret.units = history.units;
		if ( history.range != null )
			ret.range = history.range;
		ret.value = history.value;
		if ( !ret.value )
			ret.value = '';
		ret.abnormal = history.abnormal;
		ret.date = history.date;
		ret.organisationId = history.organisationId;
		if ( ret.range == null )
			ret.range = '';
		return ret;
	}

	// If the data is more than the screen can show, it will scroll. But
	// we must set the height for ui-grid-a
	function setUiGridHeight( ) {
		// apply shadow
		$( '#patientvaluesmultihistory' ).find( '> div:first' ).addClass( 'ui-shadow' );
		var windowsheight = $( window ).height( );
		/*
		 * Random number are paddings and margins of parents and grandparents
		 */
		var allowedHeight = windowsheight - ( windowsheight / 10 + 44 + 30 + 39 + 30 + 100 );
		var uiBlockHeight = $( '#multi_values_history' ).height( );
		if ( uiBlockHeight > allowedHeight ) {
			$( '#values_history_terms' ).height( allowedHeight );
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
			markup += getSectionNoData( 'Values' );
		} else {

			markup += getSectionOpen( );

			/* header */
			markup += getSectionHeaderOpen( );
			markup += '<div class="e-blocks">';
			markup += '<div class="grid-6 e-block-a">Term/Date</div>';
			markup += '<div class="grid-6 e-block-b"></div>';
			markup += '<div class="grid-6 e-block-c">Details</div>';
			markup += '<div class="grid-6 e-block-d">Abn</div>';
			markup += '<div class="grid-6 e-block-e">Value/Units</div>';
			markup += '<div class="grid-6 e-block-f">Range</div>';
			markup += '</div>';
			markup += getSectionHeaderClose( );

			/* content */
			markup += getSectionContentOpen( );

			function fillOne( value ) {
				markup += '<div class="e-blocks"';
				if( value.organisationId ) {
					markup += ' data-org="' + value.organisationId + '"';
				}
				markup += '>';
				markup += '<div class="grid-6 e-block-a">' + _.h( value.term );
				markup += '<br />' + _.h( value.date ) + '</div>';
				markup += '<div class="grid-6 e-block-b">';
				if ( value.organisationId ) {
					markup += '<i class="shared-orgs"></i>';
				}
				markup += '</div>';
				markup += '<div class="grid-6 e-block-c">' + _.h( value.associatedText ) + '</div>';
				markup += '<div class="grid-6 e-block-d abn">' + ( value.abnormal ? '!' : '' ) + '</div>';
				markup += '<div class="grid-6 e-block-e">' + _.h( value.value ) + ' ' + _.h( value.units ) + '</div>';
				markup += '<div class="grid-6 e-block-f">' + _.h( value.range ) + '</div>';
				markup += '</div>';
			}

			fillOne( data );

			if ( data.history ) {
				for ( var i = 0; i < data.history.length; i++ ) {
					fillOne( parse( data, data.history[i] ) );
				}
			}

			markup += getSectionContentClose( );
			markup += getSectionClose( );
		}

		return markup;
	}

	var unbindEvents = function( ) {
		$( "#valuesMultiHistoryCloseBtn" ).unbind( );
		lastPage.off( 'pageshow', pageShow );
		$( window ).unbind( 'orientationchange', orientationChange );
		$( "#templateParser" ).css( "overflow", "visible" );
		$( "#templateParser" ).css( "max-height", "none" );
	}
	var orientationChange = function( ) {
		var newHeight = emis.mobile.UI.calculateDialogPadding( _app, lastPage );
		$( "#templateParser" ).css( {
			"max-height": newHeight,
			"overflow": "hidden"
		} );
		if ( lastPage ) {
			lastPage.css( {
				"padding-bottom": "",
				"height": ""
			});
		}

		var content = $( "#patientvaluesmultihistory" ).find( ":jqmData(role=content)" );
		var dialog = $( "#patientvaluesmultihistory > div" );
		var dialogHeader = $( "#valuesMultiHistoryHeader" );
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
	var pageShow = function( ) {
		orientationChange( );
	}

	this.bindDataAndEvents = function( $page, refresh ) {

		// Clear the markup
		$( "#multi_values_history" ).html( "" );

		lastPage = $page;
		unbindEvents( );
		$( "#valuesMultiHistoryCloseBtn" ).click( function( e ) {
			unbindEvents( );
			$.mobile.changePage( "#templateParser" );
		} );

		var markup = '';

		var values = _app.dataProvider.getPatientValues( main.controller.patient.id );
		if ( !_app.util.isEmptyObject( values ) ) {
			codes = main.controller.valuesHistoryCodes;
			for ( var i = 0; i < codes.length; i++ ) {
				index = 0;
				while ( index < values.length && values[index].code != codes[i] ) {
					index++;
				}

				if ( index < values.length ) {
					var value = values[index];
					value = main.dataProvider.filterSharedValuesWithHistory( [ value ] );
					if ( value.length ) {
						var history = value[0].slice( 1 );
						value = value[0][0];
						value.history = history;
					}
					markup = fillSectionListview( markup, value );
				}
			}
			$( "#multi_values_history" ).html( markup );

			$page.on( 'pageshow', function( ) {
				setUiGridHeight( );
			} );

		}

		$( window ).bind( 'orientationchange', orientationChange );
		orientationChange( );
		$page.on( 'pageshow', pageShow );

		main.controller.sharedOrgs.attachSharedOrgsToScreen(that, "#" + pageid, ".content.grid > .e-blocks");
	};

	return this;
}
