/**
 * DocumentDetails form controller
 */

emis.mobile.form.DocumentDetails = function( appObject ) {
	var _app = appObject;
	var that = this;
	// document data
	this.data = [];
	var lastPage;
	var documentZoom;
	var docWrapper;
	var docWrapperContent;
	var docContainer;
	var orientation;
	var panelToggleButton;
	var isPanelOpen;
	var docPanel;
	var int;

	var unbindEvents = function( ) {
		window.clearInterval( int );
		lastPage.off( 'pageshow', pageShow );
		emis.mobile.UI.removeOrientationEventsForDialog( orientationChange );
		$( "#documentDetails" ).css( {
			"overflow": "visible",
			"max-height": "none"
		} );
		$( "#patientdocuments" ).css( {
			"min-height": "none",
			"max-height": "none",
			"overflow": "visible"
		} );
	};

	var pageShow = function( ) {

		orientationChange( );
	};

	var setFrameDimensions = function( ) {
		var frameHeight;
		var frameWidth;
		documentZoom.clearOldDocumentData( );
		if ( emis.mobile.UI.isiPad ) {
			docWrapperContent.css( {
				height: "",
				width: ""
			} );
			frameHeight = docWrapper.height( );
			frameWidth = docWrapper.width( );
			docWrapperContent.css( {
				height: frameHeight,
				width: frameWidth
			} );
		} else {
			frameHeight = docWrapperContent.height( );
			frameWidth = docWrapperContent.width( );
		}

		if ( emis.mobile.UI.isIE10 || emis.mobile.UI.isAtLeastIE11) {
			docContainer[0].msContentZoomFactor = 1;
			var docContainerWidth = docContainer[0].scrollWidth;
			var minZoomLevel = 100;
			if ( docContainerWidth > frameWidth ) {
				minZoomLevel = Math.floor( ( frameWidth / docContainerWidth ) * 100 );
			}
			docContainer.css( "-ms-content-zoom-limit-min", "" + minZoomLevel + "%" );
			docContainer[0].msContentZoomFactor = minZoomLevel / 100;
		} else {
			var offset = docWrapperContent.offset( );
			documentZoom.applyNewDimensions( offset.left, offset.top, frameWidth, frameHeight );
		}
	}
	var orientationChange = function( ) {
		var newHeight = emis.mobile.UI.calculateDialogPadding( _app, lastPage );
		$( "#patientdocuments" ).css( {
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

		checkOrientation( );
		setTimeout( function( ) {
			checkOrientation( )
		}, 50 );
		setTimeout( function( ) {
			checkOrientation( )
		}, 100 );
		setTimeout( function( ) {
			checkOrientation( )
		}, 200 );
		setTimeout( function( ) {
			checkOrientation( )
		}, 500 );

		checkOrientation( );
		setTimeout( function( ) {
			checkOrientation( )
		}, 50 );
		setTimeout( function( ) {
			checkOrientation( )
		}, 100 );
		setTimeout( function( ) {
			checkOrientation( )
		}, 200 );
		setTimeout( function( ) {
			checkOrientation( )
		}, 500 );
		setFrameDimensions( );

		var documentDetails = $( "#documentDetails" );

		if ( documentDetails !== null ) {
			documentDetails.css( {
				//so the shadow is covering whole page
				"padding-bottom": ( $( document ).height( ) - documentDetails.height( ) ) + 'px'
			} )
		}

	}
	var checkOrientation = function( ) {
		if ( _app.controller.isLandscape ) {
			if ( orientation != 'landscape' )
				setOrientation( 'landscape' );
		} else {
			if ( orientation != 'portrait' )
				setOrientation( 'portrait' );
		}
	}
	var setOrientation = function( newOrientation ) {
		orientation = newOrientation;
		$( '#documentViewerWrapper' ).removeClass( 'landscape portrait' );
		$( '#documentViewerWrapper' ).addClass( newOrientation );

		setFrameDimensions( );
	}
	function f( v ) {
		if ( v )
			return v;
		return '';
	}

	var createOneBlock = function( name, value ) {
		var markup = '';
		markup += '<div class="e-blocks">';
		markup += '<div class="grid-2 e-block-a"><b>' + _.h(name) + '</b></div>';
		markup += '<div class="grid-2 e-block-b">' + _.h(value) + '</div>';
		markup += '</div>';
		return markup;
	};

	this.bindDataAndEvents = function( $page, refresh ) {
		// Clear the markup
		var panelInfoBar = $( document.getElementById( 'panelInfoBar' ) );
		var panelInfoContent = $( document.getElementById( 'panelInfoContent' ) );

		panelToggleButton = $( document.getElementById( 'panelInfoButton' ) );
		docPanel = $( document.getElementById( 'documentPanelInfo' ) );

		docWrapper = $( "#documentDetailsWrapper" );
		docWrapperContent = $( "#documentDetailsContent" );
		docContainer = $( docWrapperContent[0].contentDocument.body );
		// docContainer = $("#docContainer");

		if ( emis.mobile.UI.isiPad ) {
			docWrapperContent.prop( "scrolling", "no" );
		}

		isPanelOpen = true;
		docWrapper.add( docPanel ).removeClass( "open close" ).addClass( "open" );
		panelToggleButton.off( "click" ).on( "click", function( ) {
			docWrapper.add( docPanel ).removeClass( "open close" );
			if ( isPanelOpen ) {
				docWrapper.add( docPanel ).addClass( "close" );
			} else {
				docWrapper.add( docPanel ).addClass( "open" );
			}

			isPanelOpen = !isPanelOpen;

			setFrameDimensions( );
		} );

		panelInfoBar.html( '' );
		panelInfoContent.html( '' );
		docContainer.html( '' );

		if ( !documentZoom ) {
			documentZoom = new emis.mobile.DocumentZoom( );
			documentZoom.setCorrectTransforms( );
		}
		documentZoom.setDocumentWrapper( docWrapperContent );
		documentZoom.setDocument( docContainer );
		docContainer.css( {
			"webkitTransformOrigin": "0 0",
			"MozTransformOrigin": "0 0",
			"msTransformOrigin": "0 0",
			"transformOrigin": "0 0"
		} );

		if ( emis.mobile.UI.isIE10 || emis.mobile.UI.isAtLeastIE11) {
			docContainer.css( "-ms-content-zooming", "zoom" );
			docContainer.css( "-ms-overflow-style", "-ms-autohiding-scrollbar" );
		}

		$( '#documentDetailsHeader h1.ui-title' ).html( main.controller.patient.name );
		lastPage = $page;
		unbindEvents( );
		$( "#documentDetailsCloseBtn" ).click( function( e ) {
			docContainer.html( '' );
			panelInfoBar.html( '' );
			panelInfoContent.html( '' );
			unbindEvents( );
			$.mobile.changePage( "#patientdocuments" );
		} );

		if ( !emis.mobile.UI.isIE10 || emis.mobile.UI.isAtLeastIE11) {
			$( docWrapperContent[0].contentDocument ).on( "touchstart", function( e ) {
				documentZoom.touchstartEvent( e.originalEvent );
			} );
			$( docWrapperContent[0].contentDocument ).on( "touchmove", function( e ) {
				documentZoom.touchmoveEvent( e.originalEvent );
				e.preventDefault( );
			} );
			$( docWrapperContent[0].contentDocument ).on( "touchend", documentZoom.touchendEvent );
		}

		var doc = that.data;
		if ( !_app.util.isEmptyObject( doc ) ) {
			emis.mobile.console.log( 'DocumentDetails' );
			var markup = '';
			markup += createOneBlock( 'Source', f( doc[0].source ) == '' ? 'N/A' : f( doc[0].source ) );
			markup += createOneBlock( 'Date', f( doc[0].date ) == '' ? 'N/A' : f( doc[0].date ) );
			markup += createOneBlock( 'Type', f( doc[0].term ) == '' ? 'N/A' : f( doc[0].term ) );
			var docSize = 'N/A';
			var docUnit = '';
			if(f(doc[0].size ) != '') {
				if(doc[0].size == 0) {
					docSize = 0;
					docUnit = "B";
				} else if(doc[0].size<1) {
					docSize = f( Math.round( 1000 * doc[0].size ) );
					docUnit = "B";
				} else {
					docSize = f( Math.round( doc[0].size ) );
					docUnit = "kB";
				}
			} else if(doc[0].size == 0) {
				docSize = 0;
				docUnit = "B";
			}
			markup += createOneBlock( 'Size',  docSize + docUnit );
			panelInfoBar.html( f( doc[0].associatedText ) == '' ? 'N/A' : f( doc[0].associatedText ) );
			panelInfoContent.html( markup );
		}
		emis.mobile.UI.addOrientationEventsForDialog( orientationChange );
		orientationChange( );

		var docLoadedCallback = function() {
			emis.mobile.console.log( "LOADED HTML" );
			var $imgs = docContainer.find( "img" );
			var imgCount = $imgs.length;
			$imgs.one( "load", function( ) {
				imgCount--;
				if ( imgCount == 0 ) {
					setTimeout( function( ) {
						setFrameDimensions( );
					}, 50 );
				}
			} ).each( function( ) {
				if ( this.complete ) {
					$( this ).load( );
				}
			} );
			setFrameDimensions( );
		}

		if ( main.controller.useLocalStorageForDocs ) {
			result = new emis.mobile.Storage( ).find( "DocAttachment", main.controller.documentId );
			var decrypted = CryptoJS.enc.Base64.parse( result ).toString( CryptoJS.enc.Utf8 );
			docContainer.html( decrypted ).promise( ).done( docLoadedCallback );
		} else {
			main.dataProvider.getAttachment( main.controller.documentId, function( result ) {
				var decrypted = null;
				if ( emis.mobile.nativeFrame.isNative ) {
					decrypted = result;
				} else {
					decrypted = main.dataProvider.getDocStorage().decryptDoc( result, main.controller.documentId );
				}
				docContainer.html( decrypted ).promise( ).done( docLoadedCallback );
			} );
		}

		$page.on( 'pageshow', pageShow );
	};

	point = function( e ) {
		return ( e.originalEvent.touches && e.originalEvent.touches.length ) ? e.originalEvent.touches[0] : ( e.originalEvent.changedTouches && e.originalEvent.changedTouches.length ) ? e.originalEvent.changedTouches[0] : e;
	}

	return this;
};
