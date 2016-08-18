/**
 * Login form controller Functionalities provided:
 */

emis.mobile.form.SelectTemplate = function( appObject ) {
	var _app = appObject;
	var that = this;
	var codes = null;
	var afterReturnUnbind = false;
	var counter = 0;
	var reasonTable = new Array( );
	var ignoreNextOrientationChange = false;
	orientationChangesOnly = false;

	var lastPage;

	var unbindEvents = function( ) {
		afterReturnUnbind = true;
		lastPage.off( 'pageshow', pageShow );
		lastPage.off( 'pagehide', pageHide );
		emis.mobile.UI.removeOrientationEventsForDialog( orientationChangeTimeout );
		$( "#templateList" ).css( "overflow", "visible" );
		$( "#templateList" ).css( "max-height", "none" );
	}
	var pageShow = function( ) {
		$( "#selectTemplate > div" ).addClass( "whiteBackground" );
		$( "#inputFilterSelectTemplate" ).removeClass( "ui-input-text" );
		$( "#inputFilterSelectTemplate" ).removeClass( "ui-body-a" );
		$( "#inputFilterSelectTemplate" ).removeClass( "ui-overlay-a" );
		$( "#inputFilterSelectTemplate" ).removeClass( "filterFieldTemplate" ).addClass( "filterFieldTemplate" );
		orientationChangeTimeout( "pageShow" );
	}
	var pageHide = function( ) {
		unbindEvents( );
	}
	var orientationChangeTimeout = function( reason ) {
		time = 300;
		if ( reason == "blur" )
			time = 500;
		if ( !afterReturnUnbind ) {
			reasonTable.push( reason );
			setTimeout( orientationChange, time );
		}
	}
	var orientationChangeTimeoutNoParameter = function( ) {
		reason = "orientationChange";
		if ( !afterReturnUnbind ) {
			reasonTable.push( reason );
			setTimeout( orientationChange, time );
		}
	}
	var orientationChange = function( ) {

		counter++;
		reason = reasonTable.shift( );

		if ( afterReturnUnbind ) {
			return;
		}

		if ( ignoreNextOrientationChange ) {
			if ( reason == "orientationChange" ) {
				ignoreNextOrientationChange = false;
			}

			orientationChangesOnly = true;
			return;
		}

		if ( reason != "orientationChange" )
			orientationChangesOnly = false;
		emis.mobile.console.log( 'newHeight ' + newHeight );
		var newHeight = emis.mobile.UI.calculateDialogPadding( _app );

		if ( !appObject.controller.isScreenKeyboard && appObject.controller.isLandscape ) {
			if ( reason != "keyup" && reason != "blur" && reason != "focusin" )
				appObject.controller.selectTemplateBackgroundHeight = newHeight;
		} else if ( appObject.controller.isLandscape ) {
			if ( appObject.controller.selectTemplateBackgroundHeight == null ) {
				appObject.controller.selectTemplateBackgroundHeight = window.innerHeight - 81;
			}
			newHeight = appObject.controller.selectTemplateBackgroundHeight;
		}
		templateListHeight = newHeight;
		if ( appObject.controller.isLandscape && appObject.controller.isScreenKeyboard && reason != "keyupEnter" && !orientationChangesOnly && !emis.mobile.UI.isiPad )
			templateListHeight -= 81;
		$( "#templateList" ).css( {
			"min-height": templateListHeight,
			"height": templateListHeight,
			"max-height": templateListHeight,
			"overflow": "hidden"
		} );

		if ( lastPage ) {
			lastPage.css( {
				"min-height": newHeight,
				"height": newHeight,
				"max-height": newHeight,
				"overflow": "hidden"
			} );
			content = lastPage.find( ":jqmData(role=content)" );
			contentHeight = newHeight - 200;
			if ( appObject.controller.isScreenKeyboard && reason != "keyupEnter" && !orientationChangesOnly && !emis.mobile.UI.isiPad )
				contentHeight -= 81;
			content.css( {
				"max-height": contentHeight,
				"-webkit-overflow-scrolling": "touch"
			} );

			lastPage.css( {
				//so the shadow is covering whole page
				"padding-bottom": ( $( document ).height( ) - lastPage.height( ) ) + 'px'
			} );
		}

		emis.mobile.console.log( 'newHeight ' + newHeight + ' templateListHeight ' + templateListHeight + ' contentHeight ' + contentHeight );
		if ( reason == "keyupEnter" )
			ignoreNextOrientationChange = true;

	}
	function getSectionNoData( text ) {
		return '<div class="contentPanel"><div class="header no-data">' + text + '</div></div>';
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


	this.bindDataAndEvents = function( $page, refresh ) {
		var dataTemplateHeaders = _app.dataProvider.getTemplateHeaders( );
		var codes = new Array( );
		var idSelected = 0;
		var indexSelected = 0;

		// if(that.data.templateRecord)
		// idSelected = that.data.templateRecord.id;

		if ( dataTemplateHeaders ) {
			for ( var i = 0; i < dataTemplateHeaders.length; i++ ) {
				var object = new Object( );
				object.code = dataTemplateHeaders[i].Id;
				object.term = dataTemplateHeaders[i].Title;
				codes.push( object );
				if ( idSelected == object.code ) {
					indexSelected = i;
				}
			}
			that.codes = codes;
			that.title = "All templates";
		}
		//

		if ( emis.mobile.UI.isChrome ) {
			// fix for #68352
			$( "#contentSelectTemplateCodes" ).css( "-webkit-transform", "none" );
		}
		$( '#inputFilterSelectTemplate' ).val( "" );
		$page.off( 'pageshow', pageShow );
		lastPage = $page;
		unbindEvents( );
		// its not after return here
		afterReturnUnbind = false;
		$( "#selectTemplateCloseBtn" ).click( function( e ) {
			unbindEvents( );
			$.mobile.changePage( "#templateList" );
		} );

		var data = that.codes;
		data.sort( function( a, b ) {
			return a.term.localeCompare( b.term );
		} );
		if ( !_app.util.isEmptyObject( data ) ) {

			var $content = $( "#contentSelectTemplateCodes" );
			// Clear the markup
			$content.html( "" );
			var markup = '';
			var codeNr = '';
			var term = '';
			/* content */
			markup += getSectionOpen( );
			markup += getSectionContentOpen( );
			for ( var i = 0; i < data.length; i++ ) {
				markup += '<div class="e-blocks"><span>';
				if ( data[i].code ) {
					codeNr = data[i].code;
					term = data[i].term;
				} else {
					codeNr = data[i];
					term = data[i];
				}

				markup += _.h(term);
				markup += '</span>';
				markup += '<a data-code-nr="' + codeNr + '" data-role="none" class="navBtn standaloneButton">'
				markup += 'Select</a>';
				markup += '</div>';
			}

			markup += getSectionContentClose( );
			markup += getSectionClose( );
			$content.html( markup );

			$page.page( );

			$content.find( "a" ).on( 'click', function( e ) {
				var el = e.currentTarget;

				var codeNr = $( el ).data( 'code-nr' );
				var codeTerm = null;
				if ( data[0].code ) {
					for ( var i = 0; i < data.length; i++ ) {
						if ( data[i].code == codeNr ) {
							codeTerm = data[i];
							break;
						}
					}
				} else {
					codeTerm = codeNr;
				}

				var tpController = _app.controller.getFormControllerStruct( '#templateParser' ).controller;
				tpController.setCurrentTemplate( codeTerm.code, true );
				tpController.setReturned( );
				$.mobile.changePage( "#templateParser", {
					delay: true
				} );
			} )

			$( "#selectTemplateCodesTitle" ).html( that.title );
		} else {
			var $content = $( "#contentSelectTemplateCodes" );
			var markup = '';
			var codeNr = '';
			var term = '';
			/* content */
			markup += getSectionOpen( );
			markup += getSectionContentOpen( );

			markup += getSectionContentClose( );
			markup += getSectionClose( );
			$content.html( markup );

			$page.page( );
			$( "#selectTemplateCodesTitle" ).html( that.title );

		}

		emis.mobile.UI.addOrientationEventsForDialog( orientationChangeTimeout );

		orientationChangeTimeout( );

		// filtering mechanism for data lists - search while you type
		var $rows = $( '#contentSelectTemplateCodes > .contentPanel > .content > .e-blocks' );
		$( '#inputFilterSelectTemplate' ).keyup( function( ) {
			var val = $.trim( $( this ).val( ) ).replace( / +/g, ' ' ).toLowerCase( );
			$rows.show( ).filter( function( ) {
				var text = $( this ).text( ).replace( /\s+/g, ' ' ).toLowerCase( );
				return !~text.indexOf( val );
			} ).hide( );

			// show/hide 'no data' block
			$( '#contentSelectTemplateCodes > .contentPanel > .content' ).each( function( ) {
				var contentObj = $( this ).find( '.e-blocks > a' );
				var hiddenBlocks = $( this ).find( '.e-blocks > a:hidden' );
				var hasNoData = $( this ).find( 'div.noData' ).length > 0;

				if ( contentObj.length == hiddenBlocks.length && !hasNoData ) {
					$( this ).append( '<div id="noDataFound" class="noData">Nothing found.</div>' );
				} else if ( contentObj.length != hiddenBlocks.length ) {
					$( this ).children( ).remove( '#noDataFound' );
				}
			} );
			orientationChangeTimeout( );
		} );

		$( '#inputFilterSelectTemplate' ).on( "blur", function( ) {
			orientationChangeTimeout( );
		} );

		$page.on( 'pageshow', pageShow );
		$page.on( 'pagehide', pageHide );

		if ( _app.util.isEmptyObject( data ) ) {
			$( '#inputFilterSelectTemplate' ).keyup( );
		}

	};

	return this;
}
