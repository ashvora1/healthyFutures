emis.mobile.Maps = function( ) {
	var that = this;
	var bLoading = false;
	var centerLat = 53;
	var centerLng = -1;
	var userLat = 53;
	var userLng = -1;

	function isApiReady( ) {
		return !( typeof google === 'undefined' || typeof google.maps === 'undefined' || typeof google.maps.LatLng === 'undefined' );
	}

	/*
	 * Load google map api from remote server.
	 */
	this.loadApi = function( finishedHandler ) {
		var TIMEOUT_AFTER_LOAD = 800;
		function loadMapsAPI( ) {
			$.ajax( {
				url: "https://www.google.com/jsapi",
				dataType: "script",
				success: function( ) {
					google.load( "maps", "3", {
						"other_params": "sensor=false",
						"callback": function( ) {
							//emis.mobile.console.warn( "Google maps.load handler" );
							checkApiLoaded( );
						}
					} );
				},
				error: function( jqXHR, textStatus, errorThrown ) {
					emis.mobile.console.error( errorThrown );
					bLoading = false;
				},
				crossDomain: true
			} );
		}

		function checkApiLoaded( ) {
			if ( isApiReady( ) ) {
				//emis.mobile.console.warn( "Google maps api loaded" );
				if ( finishedHandler ) {
					setTimeout( finishedHandler, TIMEOUT_AFTER_LOAD );
					bLoading = false;
				}
			} else {
				//emis.mobile.console.warn( "checkApiLoaded" );
				setTimeout( checkApiLoaded, 200 );
			}
		}

		/*
		 * function loadMapsAPI2(){ $.ajax( { url : "https://maps.google.com/maps/api/js?sensor=false", dataType :
		 * "script", success : function() { emis.mobile.console.warn("Google maps api loaded"); if(finishedHandler){
		 * setTimeout(finishedHandler,TIMEOUT_AFTER_LOAD); } bLoading = false; }, error: function(jqXHR, textStatus,
		 * errorThrown){ emis.mobile.console.error(errorThrown); bLoading = false; }, crossDomain : true } ); }
		 */

		if ( bLoading ) {
			checkApiLoaded( );
		} else if ( isApiReady( ) ) {
			if ( finishedHandler )
				finishedHandler( );
		} else {
			if ( !offline && !bLoading ) {
				bLoading = true;
				//emis.mobile.console.warn( "Init Google maps api loading" );
				setTimeout( function( ) {
					loadMapsAPI( );
				}, 500 );
			}
		}
	};

	this.useGoogleAPI = function( functionUsingAPI ) {
		if ( !offline ) {
			if ( isApiReady( ) ) {
				functionUsingAPI( );
			} else {
				that.loadApi( functionUsingAPI );
			}
		}
	}

	this.detPosition = function(point1,point2,point3) {
		return point1.lng*point2.lat+point2.lng*point3.lat+point3.lng*point1.lat
			- point1.lng*point3.lat-point2.lng*point1.lat-point3.lng*point2.lat;
	}

	this.resizeMap = function( map ) {
		if ( ( map && typeof google != 'undefined' && google.maps ) ) {
			google.maps.event.trigger( map, 'resize' );
		}
	}

	this.createMapContext = function( _app ) {
		var thatMapCtx = this;
		var markersArray = [];

		/**
		 * google map instance
		 */
		this.map = null;

		/*
		 * Add the marker to markersArray.
		 */
		function addMarker( rawPoint, description, patientId, sessionId, slotId, isOnClick ) {
			var startTime = ( new Date( ) ).getTime( );
			emis.mobile.console.log( "addMarker" );
			var point = new google.maps.LatLng( rawPoint.X, rawPoint.Y );
			var size = new google.maps.Size( 32, 32 );
			var startpoint = new google.maps.Point( 0, 0 );
			var middlepoint = new google.maps.Point( 16, 16 );
			emis.mobile.console.log( "addMarker " + ( ( new Date( ) ).getTime( ) - startTime ) );
			var imagePath = 'images/2downarrow.png';
			if ( emis.mobile.nativeFrame.isNative ) {
				imagePath = emis.mobile.Utilities.relativeToAbsoluteUrl('./') + imagePath;
			} else {
				imagePath = window.location.pathname + '/' + imagePath;
			}
			var icon = new google.maps.MarkerImage( imagePath, size, startpoint, middlepoint );

			var marker = new google.maps.Marker( {
				position: point
			} );

			var infoWindowContent;
			var patient = _app.dataProvider.getPatientById( patientId );
			if ( isOnClick == false ) {
				infoWindowContent = '<div class="marker-text-noarrow" style="-webkit-transform: translateZ(0px)">' + description + '</div>';
			} else {
				var pd = main.dataProvider.getPatientById( patientId );
				var patientGuid = patientId;

				if (pd && pd.id) {
					patientGuid = pd.id;
				}

				//@formatter:off
				infoWindowContent = '<div class="marker-text" onclick="var po={id:\''
				+ patientId + '\', guid:\''
				+ patientGuid + '\', name:\''
				+ patient.name + '\'};' + 'main.controller.setCurrentPatient(po);'
				+ 'main.controller.setSlotId(\''
				+ slotId + '\');' + '$.mobile.changePage(\'#patientsummary\');"'
				+ ' style="-webkit-transform: translateZ(0px)">'
				+ description + '</div>';
				//@formatter:on
			}

			var infoWindowWidth = 350;
			infoWindowContent = '<div style="line-height:1.35;overflow:hidden;min-width:' + infoWindowWidth + 'px;">' +
				infoWindowContent + '</div>';
			var infoWindow = new google.maps.InfoWindow( {
				content: infoWindowContent,
				maxWidth: infoWindowWidth
			} );

			google.maps.event.addListener( marker, 'click', function( map, infoWindow, marker ) {
				return function( ) {
					thatMapCtx.closeInfoWindows();
					infoWindow.open( map, marker );
				}
			} ( thatMapCtx.map, infoWindow, marker ) );

			var element = {
				'marker': marker,
				'infoWindow': infoWindow,
				'isOpen': false,
				'sessionId': sessionId,
				'patientId': patientId,
				'slotId': slotId,
				'onClickListener': null
			};

			//emis.mobile.console.log( "addMarker " + ( ( new Date( ) ).getTime( ) - startTime ) );
			element.marker.setMap( thatMapCtx.map );
			//emis.mobile.console.log( "addMarker " + ( ( new Date( ) ).getTime( ) - startTime ) );

			//emis.mobile.console.log( "addMarker before push" + ( ( new Date( ) ).getTime( ) - startTime ) );
			markersArray.push( element );
			//emis.mobile.console.log( "addMarker finish" + ( ( new Date( ) ).getTime( ) - startTime ) );
		}

		this.closeInfoWindows = function() {
			for ( var i = 0; i < markersArray.length; i++ ) {
				markersArray[i].infoWindow.close();
			}
		}

		this.destroyMarkers = function( ) {
			for ( var i = 0; i < markersArray.length; i++ ) {
				markersArray[i].marker.setMap( null );
				google.maps.event.removeListener( markersArray[i].marker.onClickListener );
				markersArray[i] = null;
			}
			markersArray = [];
		}
		/*
		 * Close all markers
		 */
		this.closeMarkers = function( ) {
			for ( var i = 0; i < markersArray.length; i++ ) {
				closeMarker( i );
			}
		}
		/*
		 * Open all markers
		 */
		this.openMarkers = function( ) {
			for ( var i = 0; i < markersArray.length; i++ ) {
				openMarker( i );
			}
		}

		/**
		 * filter out matching markers and show'em up
		 * also calculates the point to center in case when
		 * gps is not working
		 */
		this.openFilteredMarkers = function( filterFunction ) {
			thatMapCtx.closeMarkers( );
			var filteredMarkers = [];
			var positions = [];
			for ( var i = 0; i < markersArray.length; i++ ) {
				if ( filterFunction( markersArray[i] ) ) {
					openMarker( i );
					filteredMarkers.push( markersArray[i] );
					var position = {}
					position.lat = markersArray[i].marker.position.lat();
					position.lng = markersArray[i].marker.position.lng();
					if(positions.length>1) {
						if(position.lat<positions[0].lat ||
							(position.lat==positions[0].lat && position.lng<positions[0].lng)) {
							positions.unshift(position);
						} else {
							positions.push(position);
						}
					} else {
						positions.push(position);
					}
				}
			}
			if(positions.length>2){
				// prepare Q set
				var x= positions[0].lng;
				var y= positions[0].lat;
				for(var i=1;i<positions.length;i++) {
					var d =  Math.abs(positions[i].lat-y) + Math.abs(positions[i].lng-x);
					if(positions[i].lat-y>=0 && positions[i].lng-x>=0) {
						positions[i].alpha = (positions[i].lat-y)/d;
					} else if(positions[i].lat-y>=0 && positions[i].lng-x<0) {
						positions[i].alpha = 2 - ((positions[i].lat-y)/d);
					} else if(positions[i].lat-y<0 && positions[i].lng-x<0) {
						positions[i].alpha = 2 + (Math.abs(positions[i].lat-y)/d);
					} else {
						positions[i].alpha = 4 - (Math.abs(positions[i].lat-y)/d);
					}
				}

				var first = positions.shift();
				positions.sort(function(a,b) {
					return a.alpha - b.alpha;
				});
				positions.unshift(first);
				// calculate centroid for markers
				var stack = [];
				stack.push(positions[0]);
				stack.push(positions[1]);
				stack.push(positions[2]);
				for(var j=3;j<positions.length;j++) {
					while(that.detPosition(stack[stack.length-2],stack[stack.length-1],positions[j])<0)
						stack.pop();
					stack.push(positions[j]);
				}
				var sumLat=0, sumLng=0;
				for(var j=0;j<stack.length;j++) {
					sumLat = sumLat + stack[j].lat;
					sumLng = sumLng + stack[j].lng;
				}
				centerLat = sumLat/stack.length;
				centerLng = sumLng/stack.length;
			} else if(positions.length==2) {
				centerLat = (positions[0].lat + positions[1].lat)/2;
				centerLng = (positions[0].lng + positions[1].lng)/2;
			} else if(positions.length==1) {
				centerLat = positions[0].lat;
				centerLng = positions[0].lng;
			} else if(positions.length==0) {
				centerLat = userLat;
				centerLng = userLng;
			}
			return filteredMarkers;
		}
		/*
		 * Open the selected marker
		 */
		function openMarker( markerId ) {
			markersArray[markerId].isOpen = true;

			markersArray[markerId].marker.setMap( thatMapCtx.map );


		}

		/*
		 * Close the selected marker
		 */
		function closeMarker( markerId ) {
			markersArray[markerId].isOpen = false;

				markersArray[markerId].marker.setMap( null );
				google.maps.event.removeListener( markersArray[markerId].marker.onClickListener );

		}

		/*
		 * Add all markers to the markersArray
		 */
		this.initializeMarkers = function( markupsData, finishedHandler, isOnClick ) {
			that.useGoogleAPI( function( ) {
				for ( var i = 0; i < markupsData.length; i++ ) {
					addMarker( markupsData[i].object.location, markupsData[i].object.txt, markupsData[i].object.patientId, markupsData[i].object.sessionId, markupsData[i].object.slotId, isOnClick );
				}
				if ( finishedHandler ) {
					finishedHandler( );
				}
			} );
		}
		/*
		 * Show the map.
		 */
		this.startMap = function( mapDomElement, createdHandler ) {
			that.useGoogleAPI( function( ) {
				var cen = new google.maps.LatLng( 53, -1 );
				var mapOptions = {
					center: cen,
					disableDefaultUI: true,
					disableDoubleClickZoom: false,
					draggable: true,
					keyboardShortcuts: false,
					minZoom: 4,
					mapMaker: false,
					mapTypeControl: false,
					mapTypeControlOptions: null,
					mapTypeId: google.maps.MapTypeId.ROADMAP,
					noClear: false,
					overviewMapControl: false,
					overviewMapControlOptions: null,
					panControl: false,
					panControlOptions: null,
					rotateControl: true,
					rotateControlOptions: null,
					scaleControl: true,
					scaleControlOptions: null,
					scrollwheel: true,
					streetViewControl: false,
					zoom: 6,
					zoomControl: true,
					zoomControlOptions: {
						style: google.maps.ZoomControlStyle.LARGE
					}
				};
				thatMapCtx.map = new google.maps.Map( mapDomElement, mapOptions );
				if ( createdHandler ) {
					createdHandler( thatMapCtx );
					//thatMapCtx.showCurrentLocation( true );
				}
			} );
		}

		this.centerOnLocation = function( point ) {
			if ( thatMapCtx.map !== null ) {
				thatMapCtx.map.setCenter( point );
			} else {
				emis.mobile.console.error( "centerOnLocation called on non existing map" );
			}
		} ;

		this.fitToMarkers = function (markers) {

			//  Make an array of the LatLng's of the markers you want to show
			var LatLngList = $.map(markers, function (m) {
				return m.getPosition() ;
			}) ;
			//  Create a new viewpoint bound
			var bounds = new google.maps.LatLngBounds ();
			//  Go through each...
			for (var i = 0, LtLgLen = LatLngList.length; i < LtLgLen; i++) {
			//  And increase the bounds to take this point
			bounds.extend (LatLngList[i]);
			}
			//  Fit these bounds to the map
			thatMapCtx.map.fitBounds (bounds);
		} ;



		this.centerOnUserLocation = function() {
			thatMapCtx.centerOnLocation( new google.maps.LatLng( userLat, userLng ) );
		}

		/*
		 * Show current location of the user.
		 */
		this.showCurrentLocation = function( centerMapOnLocation ) {
			if ( navigator.geolocation || emis.mobile.nativeFrame.windows ) {
				if ( thatMapCtx.map !== null ) {
					that.useGoogleAPI( function( ) {
						function handle_errors( error ) {
							switch ( error.code ) {
								case error.PERMISSION_DENIED:
									emis.mobile.console.log( "user did not share geolocation data" );
									break;

								case error.POSITION_UNAVAILABLE:
									emis.mobile.console.log( "could not detect current position" );
									break;

								case error.TIMEOUT:
									emis.mobile.console.log( "retrieving position timed out" );
									break;

								default:
									emis.mobile.console.log( "unknown error" );
									break;
							}
							//thatMapCtx.centerOnLocation( new google.maps.LatLng( centerLat, centerLng ) );
						}

						function handle_geolocation_query( position ) {
							if ( ( typeof google != 'undefined' ) ) {
								var latitude = position.coords.latitude;
								var longitude = position.coords.longitude;
								userLat = latitude;
								userLng = longitude;
								var coords = new google.maps.LatLng( latitude, longitude );
								var image = 'images/current_location_img.png';
								if ( emis.mobile.nativeFrame.isNative ) {
									image = emis.mobile.Utilities.relativeToAbsoluteUrl('./') + image;
								} else {
									image = window.location.pathname + '/' + image;
								}

								var marker = new google.maps.Marker( {
									position: coords,
									map: thatMapCtx.map,
									title: "Current location",
									icon: image
								} );
								if ( centerMapOnLocation ) {
									thatMapCtx.centerOnLocation( new google.maps.LatLng( userLat, userLng ) );
									//thatMapCtx.centerOnLocation( new google.maps.LatLng( centerLat, centerLng ) );

									//thatMapCtx.centerOnLocation( coords );
								}
							}
						}

						if ( emis.mobile.nativeFrame.windows ) {
							var windowsStorage = new emis.mobile.WindowsStorage();
							var deferred = $.Deferred( );
							windowsStorage.requestGeolocation( deferred );
							deferred.promise( ).done( function(location){
								var position = {};
								position.coords = {};
								position.coords.latitude = location.latitude;
								position.coords.longitude = location.longitude;
								handle_geolocation_query( position );
							}).fail( function() {
								handle_errors();
							}) ;
						} else {
							navigator.geolocation.getCurrentPosition( handle_geolocation_query, handle_errors, {
								timeout: 60000
							} );
						}
					} );
				}
			} else {
				emis.mobile.console.log( "Geolocation API is not supported the browser." );
			}
		}

		return this;
	}
};

emis.mobile.Maps.getInstance = function( ) {
	if ( !emis.mobile.Maps.instance ) {
		emis.mobile.Maps.instance = new emis.mobile.Maps( );
	}
	return emis.mobile.Maps.instance;
}