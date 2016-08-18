/**
 * package initialisation code
 */
( function( ) {// module wrapper

	emis.mobile.console = new emis.mobile.Console( );
	// console instance in emis.mobile namespace
	var maps = emis.mobile.Maps.getInstance( );

	var alertDebug = false;
	// global variable
	window.offline = false;


	var setOfflineElements = function () {
		if (window.offline) {
			$('.need-online').addClass('ui-disabled') ;
		} else {
			$('.need-online').removeClass('ui-disabled') ;
		}
	}

	EMIS_Offline_Handler = function() {
		emis.mobile.console.warn( "Application became offline" );
		if ( alertDebug ) {
			alert( "Application became offline" );
		}
		window.offline = true;

		setOfflineElements () ;

		$( document ).bind( "pagechange", setOfflineElements) ;

		if(typeof main !== 'undefined' && typeof main.controller !== 'undefined'){
			if ( main.controller.geocodingRunning ) {
				main.controller.geocodingRunning = false;
				main.storage.setItem( "geocodingSuccess", "false" );
				main.storage.setItem( "geocodingEnd", "true" );
				emis.mobile.form.Synchronisation.prototype.syncFailed( new emis.mobile.ErrorModel( CONNECTION_ERROR_CODE, null ), "Offline" );
			} else if ( main.controller.bDuringSynchronisation ) {
				emis.mobile.form.Synchronisation.prototype.syncFailed( new emis.mobile.ErrorModel( CONNECTION_ERROR_CODE, null ), "Offline" );
			}
		}
	}

	EMIS_Online_Handler = function() {
		emis.mobile.console.warn( "Application became online" );
		if ( alertDebug ) {
			alert( "Application became online" );
		}
		window.offline = false;
		setOfflineElements () ;

		jQuery(document).trigger('emis.needsync') ;
		$(document).unbind('pagechange', setOfflineElements) ;
	}

	window.addEventListener( "offline", EMIS_Offline_Handler );
	window.addEventListener( "online", EMIS_Online_Handler );

	if ( window.applicationCache ) {
		// it does not exists on mobile WebView IE
		window.applicationCache.addEventListener( "error", function( e ) {
			window.offline = !navigator.onLine;
			emis.mobile.console.warn( "Application became " + ( offline ? "offline" : "online" ) + " on error" );
			emis.mobile.console.warn( e );
			if ( alertDebug )
				alert( "Application became " + ( offline ? "offline" : "online" ) + " on error" );
		}, false );
	}

} )( );
// module wrapper
