/**
 * EMIS Mobile
 */

emis.mobile.Loader = function( ) {

	/**
	 * @param arrOfScripts
	 * @param callbackHandler - called when all scripts are sucessfully loaded
	 */
	this.loadScripts = function( arrOfScripts, callbackHandler ) {
		var loadedCountdown = arrOfScripts.length;
		for ( var i = 0; i < arrOfScripts.length; i++ ) {
			jQuery.getScript( arrOfScripts[i] ).done( function( script, textStatus ) {
				//emis.mobile.console.log( textStatus );
				loadedCountdown--;
				if ( loadedCountdown === 0 ) {
					callbackHandler( );
				}
			} ).fail( function( jqxhr, settings, exception ) {
				( function( scriptName ) {
					return function( jqxhr, settings, exception ) {
						emis.mobile.console.error( scriptName + ":\n" + exception.toString( ) );
					}
				} )( arrOfScripts[i] );
			} );
		}
	};

	this.loadJsons = function( arrOfUrlHandlerPairs, callbackHandler ) {
		var loadedCountdown = arrOfUrlHandlerPairs.length;
		for ( var i = 0; i < arrOfUrlHandlerPairs.length; i++ ) {
			( function( pair ) {
				jQuery.getJSON( pair.url, function( data ) {
					pair.handler( data );
					loadedCountdown--;
					if ( loadedCountdown === 0 ) {
						callbackHandler( );
					}
				} ).fail( function( jqxhr, settings, exception ) {
					emis.mobile.console.error( pair.url + ":\n" + exception.toString( ) );
				} );
			} )( arrOfUrlHandlerPairs[i] );
		}
	};

	return this;
} ;
/***
 * It should be single instance for whole application so it should be Singleton
 */
emis.mobile.Main = function( ) {

	this.storage = new emis.mobile.Storage( this ) ;
	this.util = new emis.mobile.Utilities( );
	this.sanitizer = new emis.mobile.Sanitizer( );

	if ( emis.mobile.nativeFrame.windows ) {
		this.windowsDeferreds = [];
	}

	var that = this ;

	/**
	 * main initialization procedure to run application
	 *
	 * @param initCallback - callback function called after finished init
	 */
	this.init = function( initCallback ) {
		function _initialize( ) {
			var reloadCause = that.storage.getItem( "reloadCause" );
			if ( reloadCause ) {
				emis.mobile.console.warn( "reloadCause " + reloadCause );
			}
			if ( ! emis.mobile.nativeFrame.isNative && that.storage.getItem( "CONSTANTS_URLS" ) == null ) {
				window.open( "../", "_self" );
				return;
			}
			that.constants = new emis.mobile.Constants( );
			// just initialisation
			that.maps = emis.mobile.Maps.getInstance( );

			that.dataProvider = new emis.mobile.DataProvider( that, function( ) {

				// register subforms controllers and views
				that.controller.registerFormController( "#addDrug", new emis.mobile.form.AddDrug( that ), "form/AddDrug.html" );
				that.controller.registerFormController( "#appointments", new emis.mobile.form.AppointmentsList( that ), "form/AppointmentsList.html" );
				that.controller.registerFormController( "#bookAppointments", new emis.mobile.form.BookAppointments( that ), "form/BookAppointments.html" );
				that.controller.registerFormController( "#bookAppointmentsDetails", new emis.mobile.form.BookAppointmentsDetails( that ), "form/BookAppointmentsDetails.html" );
				that.controller.registerFormController( "#cancelSchedule", new emis.mobile.form.CancelSchedule( that ), "form/CancelSchedule.html" );
				that.controller.registerFormController( "#caseloads", new emis.mobile.form.CaseloadsList( that ), "form/CaseloadsList.html" );
				that.controller.registerFormController( "#documentDetails", new emis.mobile.form.DocumentDetails( that ), "form/DocumentDetails.html" );
				that.controller.registerFormController( "#drugList", new emis.mobile.form.DrugList( that ), "form/DrugList.html" );
				that.controller.registerFormController( "#editSchedule", new emis.mobile.form.EditSchedule( that ), "form/EditSchedule.html" );
				that.controller.registerFormController( "#editScheduleTemplate", new emis.mobile.form.EditScheduleTemplate( that ), "form/EditScheduleTemplate.html" );
				that.controller.registerFormController( "#editTask", new emis.mobile.form.EditTask( that ), "form/EditTask.html" );
				that.controller.registerFormController( "#listViewCodes", new emis.mobile.ListViewCodes( that ), "form/ListViewCodes.html" );
				that.controller.registerFormController( "#loadingDialog", new emis.mobile.form.Loading( that ), "form/Loading.html" );
				that.controller.registerFormController( "#map", new emis.mobile.form.MapView( that ), "form/MapView.html" );
				that.controller.registerFormController( "#OTKverification", new emis.mobile.form.OTKverification( that ), "form/OTKverification.html" );
				that.controller.registerFormController( "#page1", new emis.mobile.form.LoginForm( that ) );
				that.controller.registerFormController( "#patientallergies", new emis.mobile.form.Allergies( that ), "form/Allergies.html" );
				that.controller.registerFormController( "#patientconsultations", new emis.mobile.form.PatientConsultations( that ), "form/PatientConsultations.html" );
				that.controller.registerFormController( "#patientDetails", new emis.mobile.form.PatientMap( that ), "form/PatientMap.html" );
				that.controller.registerFormController( "#patientDetailsOffline", new emis.mobile.form.PatientDetailsOffline( that ), "form/PatientDetailsOffline.html" );
				that.controller.registerFormController( "#patientdiary", new emis.mobile.form.Diary( that ), "form/Diary.html" );
				that.controller.registerFormController( "#patientdocuments", new emis.mobile.form.PatientDocuments( that ), "form/PatientDocuments.html" );
				that.controller.registerFormController( "#patientimmunisations", new emis.mobile.form.Immunisations( that ), "form/Immunisations.html" );
				that.controller.registerFormController( "#patientimmunisationshistory", new emis.mobile.form.ImmunisationsHistory( that ), "form/ImmunisationsHistory.html" );
				that.controller.registerFormController( "#patientmedicationdetails", new emis.mobile.form.MedicationDetails( that ), "form/MedicationDetails.html" );
				that.controller.registerFormController( "#patientmedications", new emis.mobile.form.Medications( that ), "form/Medications.html" );
				that.controller.registerFormController( "#patientproblemdetails", new emis.mobile.form.PatientProblemDetails( that ), "form/PatientProblemDetails.html" );
				that.controller.registerFormController( "#patientproblemslist", new emis.mobile.form.PatientProblemsList( that ), "form/PatientProblemsList.html" );
				that.controller.registerFormController( "#patientreferrals", new emis.mobile.form.Referrals( that ), "form/Referrals.html" );
				that.controller.registerFormController( "#patientsummary", new emis.mobile.form.PatientSummary( that ), "form/PatientSummary.html" );
				that.controller.registerFormController( "#patientvalues", new emis.mobile.form.Values( that ), "form/Values.html" );
				that.controller.registerFormController( "#patientvalueshistory", new emis.mobile.form.ValuesHistory( that ), "form/ValuesHistory.html" );
				that.controller.registerFormController( "#patientvaluesmultihistory", new emis.mobile.form.ValuesMultiHistory( that ), "form/ValuesMultiHistory.html" );
				that.controller.registerFormController( "#schedulesList", new emis.mobile.form.SchedulesList( that ), "form/SchedulesList.html" );
				that.controller.registerFormController( "#selectTemplate", new emis.mobile.form.SelectTemplate( that ), "form/SelectTemplate.html" );
				that.controller.registerFormController( "#sharingViewPermission", new emis.mobile.form.SharingViewPermission( that ), "form/SharingViewPermission.html" );
				that.controller.registerFormController( "#syncAccessToken", new emis.mobile.form.SyncAccessToken( that ), "form/SyncAccessToken.html" );
				that.controller.registerFormController( "#syncLoading", new emis.mobile.form.Synchronisation( that ), ["form/SyncLoading.html", "form/SyncLogin.html"] );
				that.controller.registerFormController( "#taskallusers", new emis.mobile.form.TaskAllUsers( that ), "form/TaskAllUsers.html" );
				that.controller.registerFormController( "#taskList", new emis.mobile.form.TaskList( that ), "form/TaskList.html" );
				that.controller.registerFormController( "#templateList", new emis.mobile.form.TemplateList( that ), "form/TemplateList.html" );
				that.controller.registerFormController( "#templateParser", new emis.mobile.form.TemplateParser( that ), "form/TemplateParser.html" );
				that.controller.registerFormController( "#travelDetails", new emis.mobile.form.TravelDetails( that ), "form/TravelDetails.html" );
				that.controller.init();
				if ( initCallback ) {
					initCallback( that );
				}
			} );

			// frontend
			that.controller = new emis.mobile.Controller( that );
		}

		function _loadInitialData( ) {
			var exists = function( val ) {
				return ! ( val === undefined || val === null );
			}

			var isOnline = that.storage.getItem( 'isOnline' );
			if ( exists(isOnline) ) {
				that.storage.removeItem( 'isOnline' );
				EMIS_EventOnlineChange( isOnline );
			}

			var webserviceBaseUrl = that.storage.getItem( 'BASE_URL' );
			if ( exists(webserviceBaseUrl) ) {
				that.storage.removeItem( 'BASE_URL' );
				EMIS_BASE_URL = webserviceBaseUrl;
			}

			var screenWidth = that.storage.getItem( 'screenWidth' );
			var screenHeight = that.storage.getItem( 'screenHeight' );
			var currentOrientation = that.storage.getItem( 'currentOrientation' );
			if ( exists(screenWidth) && exists(screenHeight) && exists(currentOrientation) ) {
				EMIS_EventOrientationChange( currentOrientation, screenWidth, screenHeight);
			}

			var keyboardState = that.storage.getItem( 'keyboardState' );
			if ( exists(keyboardState) ) {
				that.storage.removeItem( 'keyboardState' );
				EMIS_EventKeyboardVisibilityChange( keyboardState );
			}

			// sometimes may be to soon to call event handlers in this place, so let's delay it and call when app is ready
			$(document).one('emis.nativeappready', function() {
				if ( exists(isOnline) ) {
					EMIS_EventOnlineChange( isOnline );
				}
				if ( exists(webserviceBaseUrl) ) {
					EMIS_BASE_URL = webserviceBaseUrl;
				}
				if ( exists(screenWidth) && exists(screenHeight) && exists(currentOrientation) ) {
					EMIS_EventOrientationChange( currentOrientation, screenWidth, screenHeight);
				}
				if ( exists(keyboardState) ) {
					EMIS_EventKeyboardVisibilityChange( keyboardState );
				}
			});
		}

		// get all the cached data, then start application
		this.storage.getCache( function( data ) {
			if ( emis.mobile.nativeFrame.isNative ) {
				_loadInitialData();
			}
			_initialize();
		}) ;

	};

	that = this;
	return this;
};

( function( ) {
	var userAgent = navigator.userAgent;
	emis.mobile.nativeFrame = {
		ios: userAgent.indexOf( "EMIS-NF-iOS" ) > -1,
		android: userAgent.indexOf( "EMIS-NF-Android" ) > -1,
		windows: userAgent.indexOf( "Windows" ) > -1 && userAgent.indexOf( "WebView" ) > -1
	} ;
	emis.mobile.nativeFrame.isNative = emis.mobile.nativeFrame.ios ||
										emis.mobile.nativeFrame.android ||
										emis.mobile.nativeFrame.windows;

	var ui = new emis.mobile.UI( );

	$(document).on( 'ready', function() {
		if ( emis.mobile.nativeFrame.ios ) {
			document.addEventListener( 'deviceready', function () {
				ui.initMain();
			});
			var cordovaScript = document.createElement( 'script' );
			cordovaScript.setAttribute( 'type','text/javascript' );
			cordovaScript.setAttribute( 'src', 'lib/cordova/cordova.js' );
			document.getElementsByTagName( 'head' )[0].appendChild( cordovaScript );
		} else {
			ui.initMain();
			if ( emis.mobile.nativeFrame.windows ) {
				emis.mobile.console.setWindowsLogger();
			}
		}
	} );
} )( );
