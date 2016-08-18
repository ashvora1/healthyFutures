
var EMIS_EventOnlineChange = function( bIsOnline ) {
	if ( bIsOnline ) {
		EMIS_Online_Handler();
		$(document).trigger( 'emis-native.app-became-online' );
	} else {
		EMIS_Offline_Handler();
		$(document).trigger( 'emis-native.app-became-offline' );
	}
}

var EMIS_EventKeyboardVisibilityChange = function( keyboardState ) {
	if ( !window.jQuery ) return;

	switch ( keyboardState ) {
		case 0:
			$(document).trigger( 'emis-native.keyboard.hide' );
			break;
		case 1:
			$(document).trigger( 'emis-native.keyboard.show' );
			break;
		case 2:
			$(document).trigger( 'emis-native.keyboard.show' );
			break;
	}
}

var EMIS_EventOrientationChange = function( currentOrientation, screenWidth, screenHeight ) {
	if ( !window.jQuery ) return;

	$(document).trigger( 'emis-native.orientationchanged', [ {
		isLandscape: currentOrientation == 1,
		width: screenWidth,
		height: screenHeight
	} ] );
}

var EMIS_GetSessionResponseUpdated = function( response ) {
	$(document).trigger( 'emis-native.session-updated', [ { response: response } ] );
};

var EMIS_BackToForeground = function( inactiveTime ) {
	$(document).trigger( 'emis-native.back-to-foreground', [ { inactiveTime: inactiveTime } ] );
};

var EMIS_BackButtonPressed = function( ) {
	// only for android, to detect whether back button was pressed
	$(document).trigger( 'emis-native.back-button-pressed', [ { } ] );
};

var EMIS_EventKeyboardHidden = function( ) {
	// only for android: it detects whether user pressed down (back) button if keyboard was opened
	$(document).trigger( 'emis-native.event-keyboard-hidden', [ { } ] );
};

var deviceNetworkStatusChange = function( bIsOnline) {
	EMIS_EventOnlineChange( bIsOnline );
};

var keyboardStatusChange = function( keyboardState ) {
	EMIS_EventKeyboardVisibilityChange( keyboardState );
};

var deviceOrientationChange = function( currentOrientation, screenWidth, screenHeight ) {
	EMIS_EventOrientationChange( currentOrientation, screenWidth, screenHeight );
};

var EMIS_ResetInactivityTimer = function() {
	main.controller.lastTimestamp = ( new Date( ) ).getTime( );
	main.controller.lastActivityCheckTime = (new Date()).getTime();
};
