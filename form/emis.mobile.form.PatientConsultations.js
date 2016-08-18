/**
 * Consultations form conctroller Functionalities provided:
 */

emis.mobile.form.PatientConsultations = function( appObject ) {
	var _app = appObject;
	var that = this;
	var markup = '';

	function f( v ) {
		if ( v )
			return v;
		return '';
	}

	function getSectionNoData( sectionTitle ) {
		return '<div class="contentPanel no-data-consultation"><div class="header no-data">' + sectionTitle + ' (None)</div></div>';
	}

	function getSectionOpen( organisationId ) {
		var markup = '<div class="contentPanel"';
		if(organisationId) {
			markup += ' data-org="' + organisationId + '"';
		}
		markup += '>';
		return markup;
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

	function getSectionHeaderNoDataOpen( ) {
		return '<div class="header grid no-data no-data-show">';
	}

	function getSectionHeaderNoDataClose( ) {
		return '</div>';
	}

	function getSectionContentOpen( ) {
		return '<div class="content grid">';
	}

	function getSectionContentClose( ) {
		return '</div>';
	}

	function parseBlock( blocks ) {

		if ( !that.markup ) {
			that.markup = '';
		}

		for ( var i = 0; i < blocks.length; i++ ) {
			var block = blocks[i];
			that.markup += '<span';

			// Get styles, add them if they exist
			var style = block.style;
			var color = block.color;
			var isStyled = ( style != null || color != null );

			if ( isStyled ) {
				that.markup += ' style="';
				if ( style != null ) {
					// Since block.style can hold either font-style or font-weight we must brace ourselves
					that.markup += ( style == 'italic' ) ? ( 'font-style:' + style + ';' ) : ( 'font-weight:' + style + ';' );
				}
				if ( color != null ) {
					that.markup += 'color:' + color + ';';
				}
				that.markup += '"';
			}
			that.markup += '>';
			that.markup += _.h(block.text);
			that.markup += '</span> ';

			if ( i + 1 < length ) {
				that.markup += ' ';
			}
		}

	}

	function parseLines( lines ) {

		if ( !that.markup ) {
			that.markup = '';
		}

		for ( var i = 0; i < lines.length; i++ ) {
			that.markup += '<div>';
			parseBlock( lines[i].blocks );
			that.markup += '</div>';
		}

	}

	function parseSection( sections ) {

		if ( !that.markup ) {
			that.markup = '';
		}

		for ( var i = 0; i < sections.length; i++ ) {
			// ' (' + sections[i].length + ')';
			var sItemsCount = '';
			that.markup += '<div class="e-blocks">';
			that.markup += '<div class="grid-2 e-block-a">' + _.h(sections[i].title) + sItemsCount + ' </div>';
			that.markup += '<div class="grid-2 e-block-b">';
			parseLines( sections[i].lines );
			that.markup += '</div>';
			that.markup += '</div>';
		}

	}

	function parsePages( pages ) {
		if ( pages != null ) {
			if ( !that.markup ) {
				that.markup = '';
			}

			for ( var i = 0; i < pages.length; i++ ) {
				parseSection( pages[i].sections );
				if ( i + 1 < pages.length ) {
					that.markup += '<hr />';
				}
			}
		}
	}

	function fillSectionListview( data ) {

		if ( !that.markup ) {
			that.markup = '';
		}

		if ( _app.util.isEmptyObject( data ) ) {
			that.markup += getSectionNoData( 'Consultations' );
		} else {

			for ( var i = 0; i < data.length; i++ ) {

				var dataSet = data[i];
				var pages = dataSet.pages;
				if ( pages != null ) {
					that.markup += getSectionOpen( dataSet.organisationId );

					/* header */
					that.markup += getSectionHeaderOpen( );
					that.markup += '<div class="e-blocks">';
					that.markup += '<div class="grid-3 e-block-a">' + _.h(dataSet.date);
					if (dataSet.organisationId) {
						that.markup += '<i class="shared-orgs"></i>';
					}
					that.markup += '</div>';
					that.markup += '<div class="grid-3 e-block-b">' + _.h(dataSet.author) + '</div>';
					that.markup += '<div class="grid-3 e-block-c">' + _.h(dataSet.source) + '</div>';
					that.markup += '</div>';

					that.markup += getSectionHeaderClose( );

					/* content */
					that.markup += getSectionContentOpen( );
					parsePages( pages )
					that.markup += getSectionContentClose( );

					that.markup += getSectionClose( );
				} else {
					that.markup += getSectionOpen( dataSet.organisationId );

					/* header */
					that.markup += getSectionHeaderNoDataOpen( );
					that.markup += '<div class="e-blocks">';
					that.markup += '<div class="grid-3 e-block-a">' + _.h(dataSet.date);
					if (dataSet.organisationId) {
						that.markup += '<i class="shared-orgs"></i>';
					}
					that.markup += '</div>';
					that.markup += '<div class="grid-3 e-block-b">' + _.h(dataSet.author) + '</div>';
					that.markup += '<div class="grid-3 e-block-c">' + _.h(dataSet.source) + '</div>';
					that.markup += '</div>';

					that.markup += getSectionHeaderNoDataClose( );

					that.markup += getSectionClose( );
				}

			}
		}

	}

	var unbindEvents = function( ) {
		emis.mobile.UI.removeOrientationEventsForDialog( orientationChange );
	}
	function orientationChange( ) {
		$( "#patientconsultations" ).css( {
			"min-height": 300
			// to redo jquery.mobile.1.1.1.js : 2881 min-height set
		} )
	}


	this.bindDataAndEvents = function( $page, refresh ) {
		$page.off( 'pagehide', unbindEvents );
		$page.off( 'pageshow', orientationChange );
		emis.mobile.UI.preparePatientPage( $page );
		emis.mobile.UI.injectSelectMenu( $page.selector );
		var encounters = _app.dataProvider.getPatientEncounters( );

		if ( refresh === true ) {
			// Clear the markup
			$( "#consultationsContent" ).html( "" );

			// Prepare the that.markup
			that.markup = '';
			fillSectionListview( encounters );

			// Inject the that.markup
			$( "#consultationsContent" ).html( that.markup );

			emis.mobile.UI.preparePatientHeader() ;

		}

		emis.mobile.UI.addOrientationEventsForDialog( orientationChange );
		orientationChange( );
		$page.on( 'pageshow', orientationChange );
		$page.on( 'pagehide', unbindEvents );

		main.controller.sharedOrgs.attachSharedOrgsToScreen(that, $page.selector, ".contentPanel", encounters);
	};

	return this;
}
