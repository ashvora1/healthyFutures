/**
 * MapView form controller Functionalities provided:
 */
emis.mobile.form.MapView = function( appObject ) {
	//@formatter:off
	var _app = appObject ;
	var that = this ;
	var mapCtx = null ;
	var counter = 0;
	var pageId = 'map' ;
	var lastPage = null;
	var visibleMarkers = [] ;
	var bMapHeightChanged = false;
	//@formatter:on


	function refreshMarkers (bCenterMap) {
		var markupsData = _app.dataProvider.getMarkupsData( );
		mapCtx.initializeMarkers( markupsData, function( ) {
			mapCtx.openMarkers( );
			visibleMarkers = openMarkersForSession( );

			if (bCenterMap) {
				setTimeout( function( ) {
					centerMap( visibleMarkers );
				}, 100 );
			}
		} );
	} ;

	/*
	 * Fill the markup for session select
	 */
	function fillMapSessionSelect( markup, sessions ) {
		if ( !markup ) {
			markup = '';
		}
		// markup += '<option value="0">All Sessions</option>';

		for ( var i = 0; i < sessions.length; i++ ) {
			var session = _app.dataProvider.getSessionById( sessions[i] );

			// Show only mobile entries
			if ( session.AvailableForMobile ) {
				var sessionId = session.SessionId;
				var description = session.Description;
				var startDate = _app.util.standardizeDateAndTime( session.StartDateTime );
				var textToShow = description + ' (' + startDate + ')';
				markup += '<option value=' + sessionId + '>' + _.h(textToShow) + '</option>';
			}
		}
		return markup;
	}

	/*
	 * Show the map.
	 */
	function startMap( ) {
		mapCtx = new _app.maps.createMapContext( _app );
		mapCtx.startMap( document.getElementById( "mapView" ), function( ) {
			var markupsData = null;
			var refreshIntervalId = null;
			var countOfRefresh = 0;

			var refreshfunction = function( ) {
				countOfRefresh++;
				markupsData = _app.dataProvider.getMarkupsData( );
				if ( !_app.util.isEmptyObject( markupsData ) ) {
					mapCtx.initializeMarkers( markupsData, function( ) {
						mapCtx.openMarkers( );
						visibleMarkers = openMarkersForSession( );

						setTimeout( function( ) {
							centerMap( visibleMarkers );
						}, 100 );
					} );
					countOfRefresh = 21;

					// fix for disappeared markers when map has big zoom level on ipad
					if ( emis.mobile.UI.isiPad ) {
						google.maps.event.addListener( mapCtx.map, 'idle', function( ) {
							$( '.marker-background' ).addClass( "webkitTransform" );
							$( '.marker-background' ).parent( ).addClass( "webkitTransform" );
						} );
					}
				} else if ( countOfRefresh == 1 ) {
					if ( _app.util.isEmptyObject( markupsData ) ) {
						mapCtx.showCurrentLocation( true );
					} else {
						mapCtx.showCurrentLocation( );
					}
				}
				if ( countOfRefresh > 20 ) {
					clearInterval( refreshIntervalId );
				}
			};

			// Initialize them into markers on the map
			if ( refreshIntervalId == null ) {
				refreshIntervalId = setInterval( refreshfunction, 2000 );
			}

			fitMapSize();
		} );
	}

	function centerMap( visibleMarkers ) {
		if ( visibleMarkers.length > 0 ) {
			// center on marker
			//mapCtx.centerOnLocation( visibleMarkers[0].marker.position );
			mapCtx.fitToMarkers($.map(visibleMarkers, function (m) { return m.marker; })) ;
		} else {
			// center on user
			mapCtx.closeMarkers();
			mapCtx.centerOnUserLocation();
			mapCtx.map.setZoom(6);
		}
	}

	/*
	 * resize page height to make map view 100%
	 */
	function fitMapSize( ) {
		counter++;
		//emis.mobile.console.log( "fitting map size " + counter );
		var paddings = $.mobile.activePage.find( '.appointmentsHeader' ).height() + $( '#headerAppointments' ).height( );

		lastPage.css( {
			// to redo jquery.mobile.1.1.1.js : 2881 min-height set
			"min-height": 200,
			"padding-top": paddings
		} );

		var newHeight = emis.mobile.UI.calculateDialogPadding( _app, lastPage );
		lastPage.height( newHeight );

		if ( emis.mobile.UI.isIE10 || emis.mobile.UI.isAtLeastIE11 ) {
			// some bug on orientation change on ie10 (max was not on full height)
			$( "#"+pageId ).css( {
				"max-height": ""
			} );
		}

		if ( emis.mobile.UI.isIE10 || emis.mobile.UI.isAtLeastIE11 ) {
			setTimeout(function(){
				var currWidth = $("#headerAppointments h3").width()
				$("#headerAppointments h3").css('width',currWidth + 1)
				setTimeout(function(){
					$("#headerAppointments h3").css('width','')
				},0)
			},0)
		}

		main.maps.resizeMap( mapCtx.map );
	}

	/*
	 * Open all markers for the currently selected session Close any other
	 */
	function openMarkersForSession( ) {
		var sessionId = $( '#mapSessionSelect' ).val();
		var visibleMarkers = mapCtx.openFilteredMarkers( function( marker ) {
			if ( sessionId == 0 ) {
				return true;
			} else {
				return ( marker.sessionId == sessionId );
			}
		} );
		return visibleMarkers;
	}

	function changeSessionHandler( ) {
		var visibleMarkers = openMarkersForSession( );
		centerMap( visibleMarkers );
	}

	function refreshMarkersGeoEvent() {
		refreshMarkers(false) ;
	} ;

	$(document).delegate('#'+pageId, 'pagehide', function () {
		$(document).off('addressgeocoded', refreshMarkersGeoEvent) ;
	}) ;
	//$(document).on('pageshow','#'+pageId, function () {
	$(document).delegate('#'+pageId, 'pageshow', function () {
		fitMapSize () ;
	}) ;

	$(document).delegate('#'+pageId, 'pageinit', function () {
		$( '#mapSessionSelect' ).on( 'change', changeSessionHandler );
		$( "#"+pageId+" .syncBtn" ).on( "click", function (e){
			if ( $( this ).hasClass( "ui-disabled" ) ) {
				return false;
			}
			main.controller.syncSinglePatientSlotId = null;
			emis.mobile.UI.startSynchronize() ;
		} );
	}) ;


	this.bindDataAndEvents = function( $page, refresh ) {
		lastPage = $page;
		$page.off( 'pageshow' );
		$page.off( 'pagehide' );
		emis.mobile.UI.prepareAppointmentsPage( $page );
		emis.mobile.UI.removeOrientationEventsForDialog( fitMapSize );

		// if ( emis.mobile.UI.isIE10 || emis.mobile.UI.isAtLeastIE11 ) {
			// $( '#appointmentsBtn' ).remove( );
			// $( '#headerAppointments' ).append( '<a id="appointmentsBtn" href="#appointments" data-role="none" class="standaloneButton">List</a>' );
		// }

		mapNotNeedingInit = false;
		var bShowSessionsOnExistingMap = false;
		// If map already exists omit creating it again
		if ( ! mapCtx || _app.dataProvider.getNeedForSyncMarkers( ) == true ) {
			startMap( );
			_app.dataProvider.setNeedForSyncMarkers( false );
		} else {
			// If map exists clear session selection on next map open ("All sessions" becomes selected)
			bShowSessionsOnExistingMap = true;
			mapNotNeedingInit = true;
		}

		// Get the sessions from the local storage
		var sessions = _app.dataProvider.getAllSessionIDs( );

		// Initialize them info the session select
		if ( !_app.util.isEmptyObject( sessions ) ) {
			// Prepare the markup for session select
			var markup = '';
			markup = fillMapSessionSelect( markup, sessions );

			// Inject the markup for session select
			$( '#mapSessionSelect' ).html( markup );

		} else {
			// Prepare the markup
			var markup = '<option value="No Sessions">No Sessions</option>';

			// Inject the markup
			$( '#mapSessionSelect' ).html( markup );
		}
		if ( main.controller.afterSyncMaps && mapNotNeedingInit ) {
			markupsData = _app.dataProvider.getMarkupsData( );
			mapCtx.destroyMarkers( );
			if ( !_app.util.isEmptyObject( markupsData ) ) {
				mapCtx.initializeMarkers( markupsData, function( ) {
					mapCtx.openMarkers( );
					var visibleMarkers = openMarkersForSession( );
					setTimeout( function( ) {
						centerMap( visibleMarkers );
					}, 100 );
				} );
			} else {
				visibleMarkers = [] ;
				mapCtx.showCurrentLocation( true );
			}
		} else {
			mapCtx.closeInfoWindows();
			setTimeout( function( ) {
				centerMap( visibleMarkers );
			}, 100 );
		}
		if ( main.controller.afterSyncMaps ) {
			main.controller.afterSyncMaps = false;
		}
		if ( bShowSessionsOnExistingMap ) {
			changeSessionHandler() ;
		}


		emis.mobile.UI.addOrientationEventsForDialog( fitMapSize );
		fitMapSize( );

		if (main.storage.getItem('geocodingSuccess') === "false" || main.storage.getItem('geocodingEnd') === "false") {
			// main.storage.removeItem( "geocodingSuccess" );
			// main.storage.removeItem( "geocodingEnd" );
			// emis.mobile.Utilities.alert( {message: "Last synchronisation was interrupted during geocoding, some map data may be missing. You may need to synchronise again to view whole data", backPage: $page.selector} );

			emis.mobile.Utilities.alert( {message: "Geocoding is still in progress. Locations are being added to map...", backPage: $page.selector}) ;

			$(document).on('addressgeocoded', refreshMarkersGeoEvent) ;

			$(document).one('geocodingsuccess', function () {
				emis.mobile.Utilities.alert( {message: "Geocoding complete.", backPage: $page.selector}) ;
				refreshMarkers(true) ;
			}) ;
		}
		//alert(emis.mobile.console.logText);
	}

	return this;
};
