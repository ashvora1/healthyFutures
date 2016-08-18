/**
 * Login form controller Functionalities provided:
 */

emis.mobile.form.TaskAllUsers = function( appObject ) {
	var lastPage;
	var _app = appObject, that = this, codes = null, afterReturnUnbind = false, counter = 0, reasonTable = new Array( ), ignoreNextOrientationChange = false, orientationChangesOnly = false;

	var unbindEvents = function( ) {
		afterReturnUnbind = true;
		lastPage.off( 'pageshow', pageShow );
		lastPage.off( 'pagehide', pageHide );
		emis.mobile.UI.removeOrientationEventsForDialog( orientationChangeTimeout );
		$( "#taskList" ).css( "overflow", "visible" );
		$( "#taskList" ).css( "max-height", "none" );
	}
	var pageShow = function( ) {
		// $("#selectTemplate > div").addClass("whiteBackground");
		$( "#inputFilterSelectUser" ).removeClass( "ui-input-text" );
		$( "#inputFilterSelectUser" ).removeClass( "ui-body-a" );
		$( "#inputFilterSelectUser" ).removeClass( "ui-overlay-a" );
		$( "#inputFilterSelectUser" );
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
			if ( reason == "orientationChange" )
				ignoreNextOrientationChange = false;
			emis.mobile.console.log( "ignored!!!" )
			orientationChangesOnly = true;
			return;
		}

		if ( reason != "orientationChange" )
			orientationChangesOnly = false;
		emis.mobile.console.log( 'newHeight ' + newHeight );
		var newHeight = emis.mobile.UI.calculateDialogPadding( _app );

		if ( !appObject.controller.isScreenKeyboard && appObject.controller.isLandscape ) {
			if ( reason != "keyup" && reason != "blur" && reason != "focusin" )
				appObject.controller.taskAllUsersBackgroundHeight = newHeight;
		} else if ( appObject.controller.isLandscape ) {
			if ( appObject.controller.taskAllUsersBackgroundHeight == null ) {
				appObject.controller.taskAllUsersBackgroundHeight = window.innerHeight - 81;
			}
			newHeight = appObject.controller.taskAllUsersBackgroundHeight;
		}
		taskAllUsersHeight = newHeight;
		if ( appObject.controller.isLandscape && appObject.controller.isScreenKeyboard && reason != "keyupEnter" && !orientationChangesOnly && !emis.mobile.UI.isiPad )
			taskAllUsersHeight -= 81;
		$( "#taskList" ).css( {
			"min-height": taskAllUsersHeight,
			"height": taskAllUsersHeight,
			"max-height": taskAllUsersHeight,
			"overflow": "hidden"
		} );

		if ( lastPage ) {
			lastPage.css( {
				"min-height": taskAllUsersHeight,
				"height": taskAllUsersHeight,
				"max-height": taskAllUsersHeight,
				"overflow": "scroll"
			} );
			content = lastPage.find( ":jqmData(role=content)" );
			contentHeight = newHeight - 200;
			if ( appObject.controller.isScreenKeyboard && reason != "keyupEnter" && !orientationChangesOnly && !emis.mobile.UI.isiPad )
				contentHeight -= 81;
			content.css( {
				"max-height": contentHeight,
				"-webkit-overflow-scrolling": "touch"
			} );

			content.find( ".content" ).css( "max-height", contentHeight );

			lastPage.css( {
				//so the shadow is covering whole page
				"padding-bottom": ( $( document ).height( ) - lastPage.height( ) ) + 'px'
			} );
		}

		emis.mobile.console.log( 'newHeight ' + newHeight + ' taskAllUsersHeight ' + taskAllUsersHeight + ' contentHeight ' + contentHeight );
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
		var organisationPeople = _app.dataProvider.getOrganisationPeople( );
		var codes = new Array( );
		var idSelected = 0;
		var indexSelected = 0;

		// if(that.data.templateRecord)
		// idSelected = that.data.templateRecord.id;

		if ( organisationPeople ) {
			for ( var i = 0; i < organisationPeople.length; i++ ) {
				var singlePerson = organisationPeople[i];
				if ( singlePerson.object ) {
					singlePerson = singlePerson.object;
				}
				var object = new Object( );
				object.code = singlePerson.Id;
				object.term = singlePerson.DisplayName;
				codes.push( object );

			}
			that.codes = codes;
			that.title = "All users";


		}
		//

		if ( emis.mobile.UI.isChrome ) {
			// fix for #68352
			$( "#contentTaskAllusersCodes" ).css( "-webkit-transform", "none" );
		}
		$( '#inputFilterSelectUser' ).val( "" );
		$page.off( 'pageshow', pageShow );
		lastPage = $page;
		unbindEvents( );
		// its not after return here
		afterReturnUnbind = false;
		$( "#taskAllUsersCloseBtn" ).click( function( e ) {
			unbindEvents( );
			$.mobile.changePage( "#taskList" );
		} );

		var data = that.codes;
		data.sort( function( a, b ) {
			return a.term.localeCompare( b.term );
		} );
		if ( !_app.util.isEmptyObject( data ) ) {

			var $content = $( "#contentTaskAllusersCodes" );
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

				var tpController = _app.controller.getFormControllerStruct( '#taskList' ).controller;
				main.controller.assignTo = codeTerm.code;
				$.mobile.changePage( "#taskList", {
					delay: true
				} );
			} )
			var usersList = $content.find( ".content" );
			if ( ( emis.mobile.UI.isAndroid && emis.mobile.UI.isNative ) || emis.mobile.UI.isIE10 || emis.mobile.UI.isAtLeastIE11 || emis.mobile.UI.isiPad ) {
				usersList.css( "overflow-y", "scroll" );
			} else {
				var userListScrollStartPos = 0;
				usersList.on( 'touchstart', function( e ) {
					userListScrollStartPos = this.scrollTop + e.originalEvent.touches[0].pageY;
				} );
				usersList.on( 'touchmove', function( e ) {
					if ( this.scrollHeight > $( this ).height( ) ) {
						this.scrollTop = userListScrollStartPos - e.originalEvent.touches[0].pageY;
						e.preventDefault( );
					}
				} );
			}

			$( "#contentTaskAllusersCodesTitle" ).html( that.title );
		} else {
			var $content = $( "#contentTaskAllusersCodes" );
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
			$( "#contentTaskAllusersCodesTitle" ).html( that.title );

		}

		emis.mobile.UI.addOrientationEventsForDialog( orientationChangeTimeout );

		orientationChangeTimeout( );

		// filtering mechanism for data lists - search while you type
		var $rows = $( '#contentTaskAllusersCodes > .contentPanel > .content > .e-blocks' );
		$( '#inputFilterSelectUser' ).keyup( function( ) {
			var val = $.trim( $( this ).val( ) ).replace( / +/g, ' ' ).toLowerCase( );
			$rows.show( ).filter( function( ) {
				var text = $( this ).text( ).replace( /\s+/g, ' ' ).toLowerCase( );
				text = text.substring( 0, text.length - 6 );
				valWords = val.split( " " );
				for ( i in valWords ) {
					if ( text.indexOf( valWords[i] ) < 0 )
						return true;
				}
				return false;
			} ).hide( );

			// show/hide 'no data' block
			$( '#contentTaskAllusersCodes > .contentPanel > .content' ).each( function( ) {
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

		$( '#inputFilterSelectUser' ).on( "blur", function( ) {
			orientationChangeTimeout( );
		} );

		$page.on( 'pageshow', pageShow );
		$page.on( 'pagehide', pageHide );

		if ( _app.util.isEmptyObject( data ) ) {
			$( '#inputFilterSelectUser' ).keyup( );
		}

	};

	return this;
}
