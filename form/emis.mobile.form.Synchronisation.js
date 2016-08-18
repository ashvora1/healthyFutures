( function( ) {
	var lastPage;
	var _app;
	var toGeocode = [];
	var pageid = 'syncLoading' ;
	var _password;
	var lastSinglePatientReturnPage = null;
	var syncReturnPage = null;
	var geocodingTimer = null;
	var syncMarker = Math.random();
	var deletedSlots = [];
	var deletedPatientIds = [];

	var unbindEvents = function( ) {
		emis.mobile.UI.removeOrientationEventsForDialog( orientationChange );
		$( "#appointments, #caseloads, #bookAppointments, #patientsummary, #patientmedications, #patientconsultations, #patientproblemslist, "
		+ "#patientvalues, #patientmedicationdetails, #patientimmunisations, "
		+ "#patientdiary, #patientallergies, #templatelist, #templateParser, #taskList" ).css( {
			"overflow": "visible",
			"max-height": "none"
		} );
	}
	var pageShow = function( ) {
		orientationChange( );
	}
	var orientationChange = function( ) {
		var alertsContainer = lastPage.find( ".alertsContainer:visible" );
		var alertsContainerHeight = 0;
		if ( alertsContainer.length ) {
			alertsContainerHeight = alertsContainer.outerHeight( true ) + alertsContainer.offset().top;
		}

		lastPage.css( {
			"padding-bottom": "",
			"height": ""
		});

		var newHeight;
		if ( alertsContainerHeight >= lastPage.height() ) {
			newHeight = emis.mobile.UI.calculateDialogPadding( main, lastPage, alertsContainerHeight );
			lastPage.css( {
				"padding-bottom": "",
				"height": alertsContainerHeight
			});
		} else {
			newHeight = emis.mobile.UI.calculateDialogPadding( main, lastPage );
			lastPage.css( {
				"padding-bottom": "",
				"height": ""
			});
		}

		$( "#appointments, #caseloads, #bookAppointments, #patientsummary, #patientmedications, #patientconsultations, #patientproblemslist, "
		+ "#patientvalues, #patientmedicationdetails, #patientimmunisations, "
		+ "#patientdiary, #patientallergies, #templatelist, #templateParser, #taskList" ).css( {
			"min-height": newHeight,
			"max-height": newHeight,
			"overflow": "hidden"
		} );

	} ;

	var updateAlerts = function (item) {
		$('#progressInfo').find('.failed').each (function (i, failed) {
			var ac = $(failed).find('.alertsContainer') ;

			var all = ac.find('.alertMessage') ;
			if (! all.length) {
				ac.hide() ;
			}
		}) ;
	} ;

	var showAlertsContainer = function( item ) {
		item.addClass('hasfailed') ;
		item.find('.state').hide();
		if ( emis.mobile.UI.isWindows ) {
			item.find('.alertsButtonContainer').addClass( 'windows' );
		}
		item.find('.alertsButtonContainer').show();
	} ;

	var displayFailedData = function (item) {
		var failed = $(item).find('.failed') ;
		var ac = failed.find('.alertsContainer') ;
		if (ac.find('.alertMessage').length > 0) {
			ac.toggle () ;
		}
		lastPage.find( '.failed .alertsContainer' ).not( ac ).hide(); //hide other alertContainers, if any
		orientationChange() ;
	} ;

	var removeDeletedPatients = function() {
		for ( var i = 0; i < deletedPatientIds.length; i++ ) {
			main.dataProvider.removePatientDataByPatientId( deletedPatientIds[i] ) ;
		}
		deletedPatientIds = [];
		for ( var i = 0; i < deletedSlots.length; i++ ) {
			main.dataProvider.removePatientDataBySlotId( deletedSlots[i] ) ;
		}
		deletedSlots = [];
	};

	emis.mobile.form.Synchronisation = function( appObject ) {
		_app = appObject;
		var that = this;
		this.steps = [] ;
		this.failed = false ;

		$( document ).delegate("#"+pageid, "pageinit", function() {

			var $page = $(this) ;

			$page.on( 'pageshow', pageShow );
			$page.on( 'pagehide', unbindEvents );

			// propare progress ui
			$(window).on('emis.syncinitialized', function (event, stepsData){
				that.syncCompleted = false ;
				if ( ! that.sync.bSinglePatientSync ) {
					that.setSteps(stepsData) ;
				}
				//$page.find('.startSync').text('Sync all data') ;
			}) ;

			// disable close button
			$(window).on('emis.syncstarted', function (event){
				//$page.find('.startSync').text('Sync in progress...') ;
			}) ;

			// enable close button
			$(window).on('emis.syncstatusupdated', function (event){
				$page.find('.close, .startSync').removeClass('ui-disabled') ;
				//$page.find('.startSync').text('Sync again') ;
				that.syncCompleted = true ;
			}) ;

			// update step on sync progress
			$(window).on('emis.syncprogress', function (event, step){
				that.updateLastStep(step) ;
			}) ;

			// update sync ui when sync item failed
			$(window).on('emis.syncitemfailed', function (event, failedData){
				if ( ! that.sync.bSinglePatientSync ) {
					that.updateFailedStep(failedData) ;
				}
			}) ;

			$(window).on('emis.startsync', function (event){
				startSyncCallback();
			}) ;

			var startSyncCallback = function() {
				that.sync.reinitialiseData();
				clearTimeout( geocodingTimer );
				geocodingTimer = null;
				syncMarker = Math.random();
				main.controller.isTrustedFinished = false;
				main.controller.duringPreSynchronisation = true;
				if ( main.controller.onlineLogged == false ) {
					that.needToGetNewSession = true;
				}
				if ( that.needToGetNewSession == true ) {
					that.UserSession = new emis.mobile.UserSessionAPI( );
					that.UserSession.delegate = that;
					that.UserSession.getSession( main.controller.user.login, _password, main.controller.user.cdb );
				} else {
						if(CALL_OTK_INSTEAD) {
							if(main.controller.isTrustedFinished) {
								//main.controller.user.accessToken = "50003";
								that.sync.status = "sessionSynchronized";
								that.sync.start();
							} else {
								that.UserSession = new emis.mobile.UserSessionAPI( );
								that.UserSession.delegate = that;
								that.UserSession.isTrusted( main.dataProvider.getUserSessionId( ) );
							}
						} else {
							var code = TOTP.generateCode(main.storage.find("SS",main.controller.user.login+"#"+main.controller.user.cdb),
									new Date());
							that.codeAuthenticator = new emis.mobile.VerifyAuthenticationCodeAPI();
							that.codeAuthenticator.delegate = that;
							that.codeAuthenticator.verifyAuthenticationCode(main.storage.find("PersistentId",main.controller.user.login+"#"+main.controller.user.cdb),code);
						}
					//}
				}
				$page.find('.close, .startSync').addClass('ui-disabled') ;
			}

			// start synchronizing
			$page.find('.startSync').click(function(){
				if ($(this).hasClass('ui-disabled')) {
					return false ;
				}
				startSyncCallback();
			}) ;

			// close sync dialog
			$page.find('.close').click(function(){
				if ($(this).hasClass('ui-disabled')) {
					return false ;
				}
				that.close () ;
			}) ;


			// display failed items
			$page.delegate('.failed .alertsButtonContainer', 'click', function (){
				var item = $(this).closest('.item') ;
				if (item) {
					var status = item.data('status') ;
					if (status) {
						displayFailedData(item) ;
					}
				}
			}) ;

			// delete failed appointments
			$page.delegate('.failed .alertsContainer .delete', 'click', function (){

				function removeAlert (am) {
					am.fadeOut(function (){
						$(this).remove() ;
						updateAlerts () ;
					}) ;
				}

				var patientId = $(this).data('patientid') ;
				var am = $(this).closest('.alertMessage') ;
				var status = am.data('status');
				if ( status.toLowerCase().indexOf('patient data') != -1 ) {
					emis.mobile.Utilities.confirm({message: "Delete data for this patient?", title: "Delete confirmation", ok:'Delete', cancel:'Cancel',
						callback:function (confirm){
							if (confirm) {
								if ( patientId ) {
									deletedPatientIds.push( patientId );
								} else if ( slotId ) {
									deletedSlots.push( slotId );
								}
								if ( ! main.controller.bDuringSynchronisation ) {
									removeDeletedPatients();
								}
								removeAlert(am) ;
							}
						}
					});
				}
			}) ;

		}) ;

		this.goToBackgroundPage = function() {
			$.mobile.changePage( main.controller.backPage );
		} ;

		this.gotoAccessToken = function( ) {
			this.goToBackgroundPage() ;
			unbindEvents( );
			setTimeout(function() {
				main.controller.duringPreSynchronisation = false;
				$.mobile.changePage( "#syncAccessToken" );
			}, 1000)
		}

		this.setPassword = function( pass ) {
			_password = pass;
		}

		this.sessionSynchronized = function( SessionResponse ) {

			var rawSessionResponse = SessionResponse;
			if ( SessionResponse.Payload ) {
				rawSessionResponse = SessionResponse.Payload;
			}
			// proper response from server
			if ( SessionResponse.Payload.EventCode ) {
				if ( SessionResponse.Payload.EventCode == main.constants.SESSION_ENDED && !this.needToGetNewSession ) {
					this.needToGetNewSession = true;
					this.UserSession.getSession( main.controller.user.login, _password, main.controller.user.cdb );
				} else {
					var ErrorDescription = '' ;
					if ( DEMO_AUTO_LOGIN ) {
						ErrorDescription = SessionResponse.Payload.Display + " (Error code: " + SessionResponse.Payload.EventCode + ")";
					} else {
						ErrorDescription = SessionResponse.Payload.Display;
					}
					emis.mobile.Utilities.alert( {message: ErrorDescription, backPage: main.controller.backPage} );
					main.controller.duringPreSynchronisation = false;
					unbindEvents( );
					this.goToBackgroundPage() ;
				}
			} else {
				if ( this.needToGetNewSession == true ) {
					if ( SessionResponse.Payload && SessionResponse.InteractionId ) {
						usm = new emis.mobile.UserSessionModel( );
						usm.saveSessionId( SessionResponse.Payload.SessionId );
						main.controller.SessionId = SessionResponse.Payload.SessionId;
						this.needToGetNewSession = false;
						if(CALL_OTK_INSTEAD) {
							if(main.controller.isTrustedFinished) {
								main.controller.user.accessToken = "50003";
								that.sync.status = "sessionSynchronized";
								that.sync.start();
							} else {
								that.UserSession = new emis.mobile.UserSessionAPI( );
								that.UserSession.delegate = that;
								that.UserSession.isTrusted( main.dataProvider.getUserSessionId( ) );
							}
						} else {
							var code = TOTP.generateCode(main.storage.find("SS",main.controller.user.login+"#"+main.controller.user.cdb),
								new Date());
							that.codeAuthenticator = new emis.mobile.VerifyAuthenticationCodeAPI();
							that.codeAuthenticator.delegate = that;
							that.codeAuthenticator.verifyAuthenticationCode(main.storage.find("PersistentId",main.controller.user.login+"#"+main.controller.user.cdb),code);
						}
					}
				} else {
					//rawSessionResponse = false; DEBUG for asking for OTK
					if ( rawSessionResponse == true || rawSessionResponse == "true" ) {
						main.controller.duringPreSynchronisation = false;
						that.sync.status = main.controller.status = "KeySynchronized";
						that.sync.start();
					} else {
						main.controller.syncInitStatus = "sessionSynchronized";
						if(CALL_OTK_INSTEAD)
							main.controller.isTrustedFinished = true;
						this.gotoAccessToken( );
					}
				}
			}
		}

		this.ParseVerifyAuthenticationCodeResponse = function(response) {
			if(response.Payload== true || response.Payload == "True" || response.Payload == "true") {
				main.controller.duringPreSynchronisation = false;
				that.sync.status = main.controller.status = "KeySynchronized";
				that.sync.start();
			} else {
				emis.mobile.Utilities.alert( {message: "Authentication has failed.<br>The clock settings on your device may be incorrect. Update the clock settings to continue.", title: "Error",backPage: main.controller.backPage,bAlert: false,ok: "Close"} );
				main.controller.duringPreSynchronisation = false;
				unbindEvents( );
				this.goToBackgroundPage() ;
			}
		}

		this.APIFailed = function( Error ) {
			new emis.mobile.IncidentLogger( ).SyncIncidentLog( Error.description );
			// To
			// log any Synchronization failure
			// Failure delegate to be implemented in the classes, where Synchronizer
			// object is created
			emis.mobile.Utilities.alert( {message: Error.description, backPage: main.controller.backPage} );
			main.controller.duringPreSynchronisation = false;
			this.goToBackgroundPage() ;
		}

		this.bindDataAndEvents = function( $page, refresh ) {

			lastPage = $page;

			if ( ! main.controller.bDuringSynchronisation ) {

				that.failed = false;

				that.sync = new emis.mobile.Synchronizer( );

				emis.mobile.UI.addOrientationEventsForDialog( orientationChange );

				that.sync.delegate = that;
				emis.mobile.console.log( 'before sync' );
				lastSinglePatientReturnPage = main.controller.syncSinglePatientReturnPage;
				syncReturnPage = main.controller.syncReturnPage;
				main.controller.syncSinglePatientReturnPage = null ;

				that.resetLastStep();
				main.controller.errorShown = false;

				$('#syncFailedInfo').hide() ;

				that.sync.initSynchronizer();

				if ( that.sync.bSinglePatientSync ) {
					$page.find('.single-sync').find('.top-text').text('Synchronising patient');
					$page.find('.single-sync').find('.middle-error-text, .close-wrapper').hide();
					$page.find('.multi-sync').hide();
					$page.find('.single-sync').show();
					$page.find('.single-sync').find('.progress').show();
				} else {
					$page.find('.single-sync').hide();
					$page.find('.multi-sync').show();
				}

				orientationChange( );

				if(main.controller.isTrustedFinished) {
					main.controller.isTrustedFinished = false;
					that.sync.start();
				} else if ( that.sync.bSinglePatientSync ) {
					$(window).trigger('emis.startsync');
				} else {
					$page.find('.close, .startSync').removeClass('ui-disabled') ;
				}
			}
			//alert(emis.mobile.console.logText);
		};

		return this;
	} ;


	emis.mobile.form.Synchronisation.prototype.setSteps = function (stepsData) {
		$( "#progressInfo" ).html('');
		$.each(stepsData, function (i, step){
			var count = {} ;
			count.all = step.all || 0 ;
			if (count.all === 1 && ! step.bDisplayEvenOne ) {
				count.all = '' ;
			}
			if (step.all !== 0) {
				var html = '<div class="e-blocks item" data-status="'+_.h(step.status)+'">' ;
				html += '<div class="grid-5 e-block-a status">'+_.h(step.status)+'</div>' ;
				html += '<div class="grid-5 e-block-b done"></div>' ;
				html += '<div class="grid-5 e-block-c"><span class="progress"></span></div>' ;
				html += '<div class="grid-5 e-block-d all"></div>' ;
				html += '<div class="grid-5 e-block-e failed"><div class="state'+ (count.all ? ' number' : '') +'"><div class="data">'+(count.all || '&nbsp;')+'</div></div><div class="standaloneButton alertsButtonContainer">&nbsp;</div><div class="alertsContainer"><div class="arrow-up"></div></div></div>' ;
				html += '</div>' ;
				$( "#progressInfo").append(html) ;

				$( "#progressInfo .item[data-status='"+_.h(step.status)+"'] .progress" ).progressbar({"value": 0});

			}
		}) ;
	} ;

	emis.mobile.form.Synchronisation.prototype.updateLastStep = function(step) {
		if (step.status) {
			var percent = 100 ;
			var item = $("#progressInfo .item[data-status='"+_.h(step.status)+"']") ;
			var completedCallback = function() {
				if ( item.find( '.alertMessage' ).length ) {
					showAlertsContainer( item );
				}
				item.removeClass('loading').addClass ('completed') ;
				item.find('.state').html("&nbsp;").removeClass('number').addClass('sprite complete-icon');
				$(window).trigger('emis.progressbarupdated') ;
				$(window).trigger('emis.progressbarcompleted') ;
			}
			if (step.all) {
				if ( step.calcAll ) {
					percent = 100 - parseInt((step.calcLeft)/step.calcAll * 100);
					step.left = step.all - Math.floor( step.all * ( percent / 100 ) );
				} else {
					percent = 100 - parseInt((step.left)/step.all * 100) ;
				}

				if ( item.find(".progress").progressbar( "value" ) == 0 ) {
					item.find(".progress").progressbar( "value", 0.1 ); //can't start animation from 0
				}
				var duration = 0;
				var callback = null;
				if (percent < 100) {
					callback = function() {
						$(window).trigger('emis.progressbarupdated') ;
					}
					item.addClass('loading') ;
					if ( step.all === 1 || ( step.realAll && step.realAll === 1 ) ) {
						percent = 75;
						duration = 2000;
					} else {
						duration = 500;
					}
				} else {
					callback = completedCallback;
					if ( step.all === 1 || ( step.realAll && step.realAll === 1 ) ) {
						duration = 300;
					} else {
						duration = 100;
					}
				}
				if ( item.length ) {
					item.find(".progress").find(".ui-progressbar-value").stop().animate(
						{ width: percent + "%" },
						{ queue: false,
							easing: "linear",
							duration: duration,
							complete: function() {
								if ( callback ) {
									callback();
								}
							}
						}
					);
				} else if ( callback ) {
					callback();
				}
			} else {
				completedCallback();
			}

			if (step.all !== 1) { // dont set 0 for one item list
				item.find(".done").text(step.all - step.left) ;
				if ( percent < 100 ) {
					item.find(".state").addClass("number").find(".data").html(step.all);
				}
				item.find(".all").text(step.all) ;
			}
		}
		orientationChange();
	} ;

	emis.mobile.form.Synchronisation.prototype.updateFailedStep = function(failedData) {
		var item = $("#progressInfo .item[data-status='"+_.h(failedData.desc)+"']") ;

		var slotId = failedData.slotId;
		var patientId = failedData.patientId;

		// try to find patient name
		var ac = item.find('.alertsContainer') ;
		if (patientId) {
			if ( item.find( '.alertMessage[data-patientid="' + patientId + '"]' ).length ) {
				return false; //there is already patient with that id on list, so don't add it
			}
			var slots = main.dataProvider.getAppointmentsIdsByPatientId( patientId );
			for ( var i = 0; i < slots.length; i++ ) {
				if ( item.find( '.alertMessage a[data-slotid="' + slots[i] + '"]' ).length ) {
					return false; //there is already patient with that id on list, so don't add it
				}
			}

			if ( ! failedData.patientName ) {
				var patient = main.dataProvider.getPatientById(patientId) ;
				if (patient) {
					failedData.patientName = patient.name ;
				} else if (slotId) {
					var app = main.dataProvider.getAppointmentById(slotId) ;
					if (app) {
						failedData.patientName = app.PatientName ;
					}
				}
			}
		}

		var bShowAlertNow = true;
		if ( failedData.desc.toLowerCase().indexOf( 'patient data' ) != -1 && ( slotId || patientId )) {
			var html = '<div class="alertMessage" data-status="'+_.h(failedData.desc)+'"';
			if ( patientId ) {
				html += ' data-patientid="'+patientId+'"';
			}
			html += '><span class="text">'+_.h(failedData.patientName)+'</span>';
            html += '<span class="text">Error '+_.h(failedData.eventCode.toString())+' - '+_.h(failedData.eventMessage)+'</span>';

			if ( failedData.desc.toLowerCase().indexOf( 'upload' ) != -1 ) {
				bShowAlertNow = false;
				html += '<a data-role="none" class="delete standaloneButton button red"';
				if ( slotId ) {
					html += ' data-slotid="'+slotId+'"';
				}
				if ( patientId ) {
					html += ' data-patientid="'+patientId+'"';
				}
				html += '>Delete</a>';
			}
			html += '</div>';
			ac.append(html) ;
		}

		if ( bShowAlertNow ) {
			showAlertsContainer( item );
		}

		updateAlerts() ;
	} ;

	emis.mobile.form.Synchronisation.prototype.endLastStep = function( status ) {
		$("#progressInfo .item").each( function() {
			var item = $(this);
			if ( item.find( '.alertMessage' ).length ) {
				showAlertsContainer( item );
			}
			item.find( '.progress' ).progressbar( "value", 100 );
			item.removeClass('loading').addClass('completed');
			item.find('.state').html("&nbsp;").removeClass('number').addClass('sprite complete-icon');
		})
	} ;

	emis.mobile.form.Synchronisation.prototype.resetLastStep = function() {
		$( "#progressInfo" ).html('');
	} ;

	emis.mobile.form.Synchronisation.prototype.syncFailed = function( Error, status ) {
		if ( main.controller.errorShown == true ) {
			return false ;
		}
		main.controller.errorShown = true;
		if (main.storage.getItem("SyncStatus") !== null) {
			var syncStatus = parseInt( main.storage.getItem( "SyncStatus" ) );
			var st = new emis.mobile.Storage( );
			if ( syncStatus == 1 ) {// if upload has been broken
				main.dataProvider.makeAllTasksNotSynchronised( );
				main.dataProvider.makeAllCompletedEventsetsNotSynchronised( );
				main.dataProvider.makeAllNewDrugsNotSynchronised( );
				main.dataProvider.makeAllQuickNotesNotSynchronised( );
				main.dataProvider.makeAllSchedulesNotSynchronised( );
			}
			// if download has been broken
			if ( syncStatus == 2 ) {
				main.controller.clearVisibleStorage( st );
			}
		}

		removeDeletedPatients();

		// To clear the sync event
		// marker, in the current
		// session
		unbindEvents( );

		jQuery(document).trigger('emis.syncstatusupdated', ['failed']) ;

		var pageToChangeTo = main.controller.backPage;
		if (!pageToChangeTo) {
			pageToChangeTo = "#appointments";
		}

		$.mobile.changePage( pageToChangeTo, {
			allowSamePageTransition: true
		} );

		emis.mobile.console.log( "Error:" + Error.description + "\nStatus:" + status );
		this.failed = true;
		main.controller.delayCheckingLogout( );
		main.controller.bDuringSynchronisation = false;
		main.controller.syncSinglePatientSlotId = null;
		main.controller.afterSyncMaps = true;

		if ( Error.description && Error.description != SERVER_ERROR_DESCRIPTION ) {
			emis.mobile.Utilities.alert( {message: Error.description, title: "Synchronisation Error", backPage: pageToChangeTo} );
		} else {
			emis.mobile.Utilities.alert( {message: "Synchronisation could not be completed.\nPlease check your internet connection or try again later.", title: "Synchronisation Error", backPage: pageToChangeTo} );
		}
	} ;



	emis.mobile.form.Synchronisation.prototype.syncComplete = function( ) {

		// To clear the sync event marker, in the current session
		main.storage.removeItem( "SyncStatus" );

		// saving sync date
		var date = new Date( );
		var dateObj = {'date': _app.util.formatDate( date ), 'time':date.getTime()} ;
		var dateStr = JSON.stringify(dateObj) ;

		var usm = new emis.mobile.UserSessionModel( ) ;

		if (this.sync.patientId) {
			//usm.saveLastSyncDate(dateStr, this.sync.patientId) ;
			// we don't need this date to be saved
		} else {
			usm.saveLastSyncDate(dateStr) ;
			usm.saveAutoLastSyncDate(dateStr) ;
		}
		jQuery(document).trigger('emis.syncstatusupdated', ['completed', this.sync.patientId]) ;

		removeDeletedPatients();
		main.controller.bDuringSynchronisation = false;
		main.controller.afterSyncMaps = true;

		//this.updateLastStep('Sync complete', {all:0}) ;
		this.endLastStep() ;

		if ( this.sync.bSinglePatientSync ) {
			lastPage.find('.single-sync').find('.close-wrapper').show();
			lastPage.find('.single-sync').find('.progress').hide();
			if ( ! main.controller.downloadFailed && ! main.controller.uploadFailed ) {
				lastPage.find('.single-sync').find('.top-text').text('Synchronisation complete');
			} else if ( main.controller.downloadFailed && ! main.controller.uploadFailed ) {
				// if broken download only!
				lastPage.find('.single-sync').find('.top-text').text('Synchronisation complete');
				lastPage.find('.middle-error-text.download').show();
			} else {
				lastPage.find('.single-sync').find('.top-text').text('Synchronisation incomplete');
				lastPage.find('.middle-error-text.upload').show();
			}
		}
		DataConsistencyCheck(_app);
	}

	emis.mobile.form.Synchronisation.prototype.close = function( ) {

		this.updateLastStep( "" );
		main.controller.syncSinglePatientSlotId = null;
		var pageToChangeTo = syncReturnPage;

		if (lastSinglePatientReturnPage) {
			pageToChangeTo = lastSinglePatientReturnPage;
			jQuery(document).trigger('emis.needrefresh') ;
		} else {
			jQuery(document).trigger('emis.needrefresh', ['appointments']) ;
			jQuery(document).trigger('emis.needrefresh', ['caseloads']) ;
		}

		unbindEvents();
		$.mobile.changePage( pageToChangeTo );
	}

	emis.mobile.form.Synchronisation.prototype.geocode = function( ) {



		function setGeocodingEnd (failed) {
			var success = failed ? 'false' : 'true' ;
			main.controller.geocodingRunning = false;
			main.storage.setItem( "geocodingSuccess", success );
			main.storage.setItem( "geocodingEnd", "true" );
			$(document).trigger('geocodingsuccess') ;
		}

		$(document).trigger('geocodingstart') ;

		// geocoding and saving markup data
		toGeocode = [];

		main.storage.removeItem( "geocodingSuccess" );
		main.storage.setItem( "geocodingEnd", "false" );
		main.controller.geocodingRunning = true;

		var syncObj = this;
		main.maps.useGoogleAPI( function( ) {

			var requestGeocoding = function( timeout, txt, id, address, sessionId, slotId, innerSyncMarker ) {
				setTimeout( function( txt, id, address, sessionId, slotId ) {
					return function( ) {
						function callback( result, status ) {

							if ( ! geocodingTimer && innerSyncMarker != syncMarker ) {
								// if callback is from previous geocoding (as new geocoding may be in progress now)
								return;
							}

							if ( status != google.maps.GeocoderStatus.OVER_QUERY_LIMIT ) {
								if ( status == google.maps.GeocoderStatus.OK ) {
									geocoded = {};
									geocoded.address = address;
									geocoded.location = {};
									geocoded.location.X = result[0].geometry.location.lat( );
									geocoded.location.Y = result[0].geometry.location.lng( );
									geocoded.txt = txt;
									geocoded.id = slotId;
									geocoded.patientId = id;
									geocoded.slotId = slotId;
									geocoded.sessionId = sessionId;
									main.storage.save( "MarkupData", slotId, JSON.stringify( geocoded ) );
									$(document).trigger('addressgeocoded', [geocoded]) ;
								}

								main.controller.geocodingPatientsSuccess++;
								var j = main.controller.geocodingPatientsSuccess;
								if ( main.controller.geocodingPatientsSuccess == main.controller.geocodingPatientsAmount ) {
									emis.mobile.console.log("last patient geocoded");

									setGeocodingEnd() ;
									if ( ! main.controller.bDuringSynchronisation ) {
										emis.mobile.console.log( "going after geocoding" );
										//syncObj.syncSuccessGoToAppointments( );
									}
								} else {
									if ( syncObj.failed != true && !offline ) {
										// geocode next address
										requestGeocoding( 10, toGeocode[j].txt, toGeocode[j].id, toGeocode[j].address, toGeocode[j].sessionId, toGeocode[j].slotId, innerSyncMarker );
									}
								}
							} else {

								if ( syncObj.failed != true && !offline ) {
									requestGeocoding( 1000, txt, id, address, sessionId, slotId, innerSyncMarker );
								}
							}
						} ; //return function

						if ( ! geocodingTimer && innerSyncMarker != syncMarker ) {
							// if callback is from previous geocoding (as new geocoding may be in progress now)
							return;
						}

						if ( !offline ) {
							geokoder.geocode( address, callback );
						} else {
							setGeocodingEnd(true) ;
							syncObj.syncFailed( new emis.mobile.ErrorModel( CONNECTION_ERROR_CODE, null ), syncObj.sync.status );
						}
					}
				}( txt, id, address, sessionId, slotId, syncMarker ), timeout );

			} ;

			patientsAddresses = new Array( );
			var geokoder = new google.maps.Geocoder( );

			// here
			var sessions = _app.dataProvider.getAllSessionIDs( );
			if ( sessions != null ) {
				for ( var j = 0; j < sessions.length; j++ ) {
					appointments = _app.dataProvider.getAllAppointmentsBySession( sessions[j] );
					if ( appointments != null ) {
						for ( var i = 0; i < appointments.length; i++ ) {
							var appointment = appointments[i];
							var patient = _app.dataProvider.getPatientDemographicById( appointment.PatientId );
							address = null;
							if ( patient ) {
								if ( patient.address && patient.address.toLowerCase( ) != "unknown" && patient.postcode ) {
									address = patient.address + " , " + patient.postcode;
								} else if ( patient.postcode ) {
									address = patient.postcode;
								} else if ( patient.address && patient.address.toLowerCase( ) != "unknown" ) {
									address = patient.address;
								}
								var patientName = appointment.PatientName;
								if ( !patientName ) {
									patientName = patient.name;
								}
							}
							if ( appointment && address ) {
								patientsAddresses.push( {
									address: {
										address: address
									},
									sessionId: sessions[j],
									id: appointment.PatientId,
									slotId: appointment.SlotId,
									txt: patientName + ' - ' + _app.util.standardizeTime( appointment.StartDateTime )
								} );
							}
						}
					}
				}
			}

			main.controller.geocodingPatientsAmount = patientsAddresses.length;
			main.controller.geocodingPatientsSuccess = 0;
			// insert info about need for synchronise map markers
			main.dataProvider.setNeedForSyncMarkers( true );

			if ( patientsAddresses.length > 0 ) {
				for ( var i = 0; i < patientsAddresses.length; i++ ) {
					// check to see if geodata is already in storage
					if (main.storage.find('MarkupData', patientsAddresses[i].slotId)){
						continue ;
					}
					var next = {};
					next.txt = patientsAddresses[i].txt;
					next.id = patientsAddresses[i].id;
					next.address = patientsAddresses[i].address;
					next.sessionId = patientsAddresses[i].sessionId;
					next.slotId = patientsAddresses[i].slotId;
					if ( next.address != null ) {
						toGeocode.push( next );
					}
				}
				main.controller.geocodingPatientsAmount = toGeocode.length;

				if (main.controller.geocodingPatientsAmount > 0) {
					requestGeocoding( 0, toGeocode[0].txt, toGeocode[0].id, toGeocode[0].address, toGeocode[0].sessionId, toGeocode[0].slotId, syncMarker );
				} else {
					setGeocodingEnd() ;
				}
			} else {
				emis.mobile.console.log( "last patient geocoded" );

				setGeocodingEnd() ;
				if ( ! main.controller.bDuringSynchronisation ) {
					emis.mobile.console.log( "going after geocoding" );
					//syncObj.syncSuccessGoToAppointments( );
				}
			}

		} );

	}
} )( );
