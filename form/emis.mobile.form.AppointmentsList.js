/**
 * Appointment Sessions form controller Functionalities provided:
 */

emis.mobile.form.AppointmentsList = function( appObject ) {
	var _app = appObject;
	var _bStaticElementsInitialised = false;

	function enableSyncBtn( bEnable ) {
		if ( bEnable ) {
			$( "#appointments .syncBtn" ).off( "click", synchronisationStart ).on( "click", synchronisationStart ).removeClass( "ui-disabled" );
		} else {
			$( "#appointments .syncBtn" ).off( "click", synchronisationStart ).addClass( "ui-disabled" );
		}
	}

	function enableMapBtn( bEnable ) {
		if ( bEnable ) {
			$( "#MapBtn" ).removeClass( "ui-disabled" );
		} else {
			$( "#MapBtn" ).addClass( "ui-disabled" );
		}
	}

	function updateOfflineElements( ) {
		enableSyncBtn( !window.offline );
		enableMapBtn( !window.offline );
	}

	function getValue( value ) {
		if ( value != null ) {
			return value;
		} else {
			return '';
		}
	}

	function getSectionNoData( sectionTitle ) {
		return '<div class="contentPanel"><div class="header no-data">' + sectionTitle + ' (None)</div></div>'
	}

	function getSectionSessionOpen( date ) {
		return '<div class="over-content"><div class="over-header">' + date + '</div>';
	}

	function getSectionSessionClose( ) {
		return '</div>';
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

	function getSectionHeaderNoDataOpen( ) {
		return '<div class="header grid no-data">';
	}

	function getSectionHeaderNoDataClose( ) {
		return '</div>';
	}

	function getHeader( description, sessionHolderDisplayName, sessionCategoryName ) {
		var markup = '<table>';
		markup += '<tr>';
		markup += '<th class="grid-2 e-block-a">' + _.h(description) + '-' + _.h(sessionHolderDisplayName)
		markup += '</th>';
		markup += '<th class="grid-2 e-block-b">';
		markup += _.h(sessionCategoryName);
		markup += '</th>';
		markup += '</tr>';
		markup += '</table>';
		return markup;
	}

	function getSectionContentOpen( ) {
		return '<div class="content grid">';
	}

	function getSectionContentClose( ) {
		return '</div>';
	}

	function fillNoData( ) {
		var markup = '';
		markup += getSectionSessionOpen( "" );
		markup += getSectionNoData( "Appointments" );
		markup += getSectionSessionClose( );
		return markup;
	}

	function fillSectionListview( markup, entries ) {
		if ( !markup ) {
			markup = '';
		}

		if ( !_app.util.isEmptyObject( entries ) && entries.length ) {
			// variable to differentiate if sessions are on the same day
			var previousStartDate = null;
			var bEntryFound = false;
			for ( var i = 0; i < entries.length; i++ ) {
				var entry = _app.dataProvider.getSessionById( entries[i] );
				if ( entry ) {
					bEntryFound = true;
					var sessionId = entry.SessionId;
					var description = entry.Description;
					var startDate = _app.util.standardizeDateAppointment( entry.StartDateTime );
					var endDate = _app.util.standardizeDate( entry.EndDateTime );
					var sessionHolderDisplayName = entry.SessionHolderDisplayName;
					var sessionCategoryName = entry.SessionCategoryName;
					var availableForMobile = entry.AvailableForMobile;

					if ( i == 0 ) {
						markup += getSectionSessionOpen( startDate );
						previousStartDate = startDate;
					} else if ( previousStartDate !== startDate ) {
						markup += getSectionSessionClose( );
						markup += getSectionSessionOpen( startDate );
						previousStartDate = startDate;
					}

					markup += getSectionOpen( );

					var slots = _app.dataProvider.getAllAppointmentsBySession( entries[i] );

					if ( slots )
						if ( slots.length === 0 ) {
							markup += getSectionHeaderNoDataOpen( );
							markup += getHeader( description, sessionHolderDisplayName, sessionCategoryName );
							markup += getSectionHeaderNoDataClose( );
						} else {
							/* header */
							markup += getSectionHeaderOpen( );
							markup += getHeader( description, sessionHolderDisplayName, sessionCategoryName );
							markup += getSectionHeaderClose( );

							/* content */
							markup += getSectionContentOpen( );
							markup += '<table>';
							markup += fillSlots( slots, availableForMobile, false );
							markup += '</table>';
							markup += getSectionContentClose( );
						}

					markup += getSectionClose( );
				}

			}
			if ( bEntryFound ) {
				markup += getSectionSessionClose( );
			} else {
				markup += fillNoData();
			}
		} else {
			markup += fillNoData();
		}
		return markup;
	} ;

	function fillFailedSectionList( markup, slots ) {
		markup += fillSlots( slots, true, true );
		return markup;
	} ;

	function fillSlots( slots, availableForMobile, bFailed ) {
		var markup = '';
		for ( var j = 0; j < slots.length; j++ ) {
			var slot;
			if ( bFailed ) {
				slot = _app.dataProvider.getAppointmentById( slots[j] );
				if ( ! slot ) {
					emis.mobile.console.log( "failed slot not exists!" ); // I believe it never go here
					continue;
				}
			} else {
				if ( slots[j].PatientId ) {
					slot = _app.dataProvider.getAppointmentById( slots[j].SlotId );
				} else {
					slot = _app.dataProvider.getAppointmentById( "nullId" + slots[j].SlotId );
				}
				if ( slot == null ) {
					slot = slots[j].object;
				}
			}

			var slotId = slot.SlotId;
			var sessionId = slot.SessionId;
			var startDateTime = _app.util.standardizeTime( slot.StartDateTime );
			var endDateTime = _app.util.standardizeTime( slot.EndDateTime );
			var patientId = slot.PatientId;
			var patientName = slot.PatientName;
			// if (patientName == null)
			// patientName = 'no data available';
			var patientDoB = null;
			var patientDoB2 = null;
			var patientRecord = null;
			var patientAddress = null;
			var patientPostcode = null;
			var classDisabled = '' ;
			var isPatientRecordPresent = false;
			if ( patientId ) {
				patientRecord = _app.dataProvider.getPatientById( patientId );
				if ( !_app.util.isEmptyObject( patientRecord ) ) {
					isPatientRecordPresent = true;
					patientDoB = emis.mobile.Utilities.prototype.standardizeDate( patientRecord.birthDate );

					// DoB in a different format (dd/mm/yy)
					patientDoB2 = emis.mobile.Utilities.prototype.standardizeDateAppointment2( patientRecord.birthDate );

					patientAddress = patientRecord.address;
					patientPostcode = patientRecord.postcode;
				}
			}
			var patientIdToCheck = patientId;
			if ( ! patientIdToCheck || patientId == 'null' ) {
				patientIdToCheck = "nullId" + slotId;
			}
			var errorAppointment = main.dataProvider.getErrorAppointmentByPatientId( patientIdToCheck );
			if ( ! bFailed && ! _app.util.isEmptyObject( errorAppointment ) ) {

				// Add the patient to the slot regardless of the error but don't allow the user to edit the patient.
				// When bFailed = False then in this circumstance it's regarding the patient been on the active appointment list even though they have technically failed. (Logic that enters the method is not the best)
				// The patient also contains the errorAppointmentObject (This is probably all we should be checking but as the patient may not be on the active patient list we don't have the required data to add them to the main appointment list)
				// If the patient has failed and is not on the active appointment list do not add them to the active appointment list (Only add them to patients failed to sync bar)

				//Start Row
				markup += '<tr id="appointments-row-' + slotId + '" style = "background-color: rgb(239, 175, 175);">';
				//Time Wrapper
				if (DISPLAY_OPEN_APPOINTMENTS_PANEL) {
					markup += '<td class="grid-5 e-block-a time-col toggle-details" data-em-appointment-slotid="' + slotId + '"  data-em-appointment-patientid="' + patientId + '">';
					markup += '<div class="time-wrapper">' + startDateTime + '<span class="arrow-down ' + classDisabled + '"></span></div></td>';
				} else {
					markup += '<td class="grid-5 e-block-a time-col" data-em-appointment-slotid="' + slotId + '"  data-em-appointment-patientid="' + patientId + '">';
					markup += '<div class="time-wrapper">' + startDateTime;
					markup += '</div></td>';
				}
				//Name Block
				markup += '<td class="grid-5 e-block-b name-block">';
				//Info Button / Map
				var additionalPatientNameClass = '';
				if (availableForMobile && isPatientRecordPresent) {
					markup += '<div class="inner-block-a">';
					markup += '<a data-role="none" class="button standaloneButton standaloneButton-dark patientDetailsInfo ' + classDisabled + '" data-em-appointment-patientid="' + patientId + '"  data-em-slotid="' + slotId + '"><span class="icon">&nbsp;</span></a>';
					markup += '</div>';
				} else {
					additionalPatientNameClass = ' no-map';
				}
				//Patient Name
				markup += '<div class="inner-block-b' + additionalPatientNameClass + '">' + _.h(patientName) + '</div>';
				//Search Text / this is hidden
				markup += '<div class="inner-block-c">';
				markup += '<span style="display:none" class="filter-text">';

				if (patientAddress == null) {
					patientAddress = "";
				}
				if (patientPostcode == null) {
					patientPostcode = "";
				}

				markup += _.h(patientName) + " " + _.h(patientAddress) + " " + _.h(patientPostcode) + " " + _.h(patientNHS) + " " + _.h(reasonOrSlotTypeDisplay);
				markup += '</span>';
				markup += '</div></td>';
				//END Name Block
				//Additional details / Not using these in this circumstance
				markup += '<td class="grid-5 e-block-c"></td>';
				markup += '<td class="grid-5 e-block-d"></td>';
				//Alert Icon
				markup += '<td class="grid-4 e-block-e"><div class="standaloneButton alertsButtonContainer btnFailed" style="left: inherit;" input id="patientAlert'+ patientId + '"><div class="alertButton"></div></div></td>';
				//Closing
				markup += '</tr>';

				continue;
			}
			var reason = slot.Reason;
			var slotTypeDescription = slot.SlotTypeDescription;
			var reasonOrSlotTypeDisplay;
			if ( reason === null ) {
				reasonOrSlotTypeDisplay = "";
			} else if ( reason === "" ) {
				reasonOrSlotTypeDisplay = getValue( slotTypeDescription );
			} else {
				reasonOrSlotTypeDisplay = getValue( reason );
			}

			var patientNHS = "";
			if ( patientId != null && patientId != 'null' ) {
				if ( availableForMobile && isPatientRecordPresent ) {
					patientNHS = patientRecord.primaryIdentifier;
				}
			}
			patientNHS = emis.mobile.Utilities.prepareNHS( patientNHS )
			if ( ( patientId != null && patientId != 'null' ) || ( patientName != null && patientName != 'null' ) ) {
				if ( bFailed ) {
					markup += '<tr id="appointments-failed-row-'+slotId+'" class="appointments-failed-row">';
					markup += '<td class="grid-4 e-block-a name-block">';
				} else {
					markup += '<tr id="appointments-row-'+slotId+'">';
					if ( DISPLAY_OPEN_APPOINTMENTS_PANEL ) {
						markup += '<td class="grid-5 e-block-a time-col toggle-details" data-em-appointment-slotid="' + slotId + '"  data-em-appointment-patientid="' + patientId + '">';
						markup += '<div class="time-wrapper">' + startDateTime + '<span class="arrow-down '+classDisabled+'"></span></div></td>';
					} else {
						markup += '<td class="grid-5 e-block-a time-col" data-em-appointment-slotid="' + slotId + '"  data-em-appointment-patientid="' + patientId + '">';
						markup += '<div class="time-wrapper">' + startDateTime;
						markup += '</div></td>';
					}
					markup += '<td class="grid-5 e-block-b name-block">';
				}

				var additionalPatientNameClass = '';
				if ( availableForMobile && isPatientRecordPresent ) {
					markup += '<div class="inner-block-a">';
					markup += '<a data-role="none" class="button standaloneButton standaloneButton-dark patientDetailsInfo '+classDisabled+'" data-em-appointment-patientid="'+patientId+'"  data-em-slotid="'+slotId+'"><span class="icon">&nbsp;</span></a>' ;
					markup += '</div>';
				} else {
					additionalPatientNameClass = ' no-map';
				}

				markup += '<div class="inner-block-b' + additionalPatientNameClass + '">' + _.h(patientName) + '</div>';

				markup += '<div class="inner-block-c">';
				// additional info is not displayed, only for searching
				markup += '<span style="display:none" class="filter-text">';
				if ( patientAddress == null ) {
					patientAddress = "";
				}
				if ( patientPostcode == null ) {
					patientPostcode = "";
				}
				markup += _.h(patientName) + " " + _.h(patientAddress) + " " + _.h(patientPostcode) + " " + _.h(patientNHS) + " " + _.h(reasonOrSlotTypeDisplay);
				markup += '</span>';
				// end of hidden info

				// patient star
				markup += '<div id="star-' + patientId + '_' + slotId + '" class="patientStar sync star-guid-' + patientId;
				if ( DISPLAY_STAR_INSTEAD_SYNC ) {
					markup += '">&nbsp;';
				} else {
					markup += ' no-star"><a href="#" data-pid-slotid="' + patientId + '_' + slotId + '" data-role="none" class="need-online sync-button button standaloneButton standaloneButton-dark sync-patient';
					markup += ' sync-button-guid-'+patientId;
					if ( window.offline ) {
						markup += ' ui-disabled';
					}
					markup += '" data-em-appointment-patientid="' + patientId + '"><div class="sprite sync"></div></a>';
				}
				markup += '</div>';

				if ( bFailed ) {
					markup += '<div class="alertsWrapper"><div class="standaloneButton alertsButtonContainer';
					if ( emis.mobile.UI.isWindows ) {
						markup += ' windows';
					}
					markup += '">&nbsp;</div>';
					markup += '<div class="alertsContainer"><div class="arrow-up"></div><div class="alertMessage"><span class="text">';
					markup += 'Patient details have not been synced. Manually enter patient details in EMIS Web to save clinical data.';
					markup += '</span></div></div></div>';
				}
				markup += '</div></td>';

				if ( bFailed ) {
					markup += '<td class="grid-4 e-block-b" >' + _.h(patientNHS) + '</td>';
					markup += '<td class="grid-4 e-block-c">' + _.h(reasonOrSlotTypeDisplay) + '</td>';
					markup += '<td class="grid-4 e-block-d">';
				} else {
					markup += '<td class="grid-5 e-block-c" >' + _.h(patientNHS) + '</td>';
					markup += '<td class="grid-5 e-block-d">' + _.h(reasonOrSlotTypeDisplay) + '</td>';
					markup += '<td class="grid-5 e-block-e">';
				}
				if ( availableForMobile && isPatientRecordPresent ) {
					markup += '<a href data-role="none" class="button '+classDisabled+' view-record" ';
					markup += 'data-em-appointment-slotid="' + slotId + '" ';
					markup += 'data-em-appointment-patientid="' + patientId + '">View record</a>';
				}
				if ( bFailed ) {
					markup += '<a href data-role="none" class="button red delete-record" ';
					markup += 'data-em-appointment-slotid="' + slotId + '" ';
					markup += 'data-em-appointment-patientid="' + patientId + '">Delete</a>';
				}
				markup += '</td>';
				markup += '</tr>';
			}
		}
		return markup;
	}

	function syncFailedTest(patientId)
	{
		var syncFailureMessage = "Synchronisation Failed";
		var errorAppointment = main.dataProvider.getErrorAppointmentByPatientId(patientId);
		if(errorAppointment && errorAppointment.description)
		{
			syncFailureMessage = errorAppointment.description;
			if(errorAppointment.eventCode)
			{
				syncFailureMessage = syncFailureMessage + " Event Code : " + errorAppointment.eventCode;
			}
		}

		//using existing logic for markup in customPopUp this is why bAlert is set to true.
		emis.mobile.Utilities.customConfirmPopup( { ok: "Ok", message: syncFailureMessage, title: "Sync Failure", bAlert: true, callback: function( r ) {
			if ( r == true ) {}
		} } );
	}

	$(document).on('emis.needsync', function(event, type){
		emis.mobile.form.AppointmentsList.clearNeedSync().markNeedSync() ;
	}) ;

	/**
	* removes stars from appointment rows,
	* disables sync buttons in appointment rows
	*/
	emis.mobile.form.AppointmentsList.clearNeedSync = function( ) {
		$( ".patientStar" ).removeClass( "patientStarAdded" );
		$( '#appointments .inner-block-b' ).removeClass( "sync-present" );
		$('#appointments .sync-button').addClass('ui-disabled') ;
		return this ;
	}

	/**
	 * Mark rows in table with stars to inform that templates or tasks exist for a patient
	enables sync buttons to appointments that need to be synchronized
	 */
	emis.mobile.form.AppointmentsList.markNeedSync = function( ) {
		var setNameBlockWidth = function( currEl ) {
			var classToAdd = 'sync-present';
			var parentBlock = currEl.closest( '.inner-block-c' );
			parentBlock.addClass( classToAdd );
			parentBlock.prev().addClass( classToAdd );
		}

		var patientIdsArray = _app.dataProvider.getPatientIdsWithEventsets( true );
		for ( var k = 0; k < patientIdsArray.length; k++ ) {
			patientIdsArray[k] = patientIdsArray[k].replace( "#", "_" );
			var elToFind = $( "#star-" + patientIdsArray[k] );
			elToFind.addClass( 'patientStarAdded' );
			setNameBlockWidth( elToFind );
			if (!window.offline) {
				$('.sync-button[data-pid-slotid="'+patientIdsArray[k]+'"]').removeClass('ui-disabled') ;
			}
		}

		var patientGuidsArray = _app.dataProvider.getPatientIdsWithTasks( );
		for ( var k = 0; k < patientGuidsArray.length; k++ ) {
			var elToFind = $( ".star-guid-" + patientGuidsArray[k] );
			elToFind.addClass( 'patientStarAdded' );
			setNameBlockWidth( elToFind );
			if (!window.offline) {
				$('.sync-button-guid-'+patientGuidsArray[k]).removeClass('ui-disabled') ;
			}
		}

		var patientNewDrugsArray = _app.dataProvider.findAllPatientIdsWithNewDrugs( );
		for ( var k = 0; k < patientNewDrugsArray.length; k++ ) {
			var elToFind = $( "[id^='star-" + patientNewDrugsArray[k] + "']" );
			elToFind.addClass( 'patientStarAdded' );
			setNameBlockWidth( elToFind );
			if (!window.offline) {
				$(".sync-button[data-em-appointment-patientid='" + patientNewDrugsArray[k] + "']").removeClass('ui-disabled') ;
			}
		}

		var patientQuickNotesArray = _app.dataProvider.findAllPatientIdsWithQuickNotes( );
		for ( var k = 0; k < patientQuickNotesArray.length; k++ ) {
			patientQuickNotesArray[k] = patientQuickNotesArray[k].replace( "#", "_" );
			var elToFind = $( "#star-" + patientQuickNotesArray[k] );
			elToFind.addClass( 'patientStarAdded' );
			setNameBlockWidth( elToFind );
			if (!window.offline) {
				$('.sync-button[data-pid-slotid="'+patientQuickNotesArray[k]+'"]').removeClass('ui-disabled') ;
			}
		}

		var patientRttChangeArray = _app.dataProvider.findAllPatientIdsWithRttChange();
		for ( var k = 0; k < patientRttChangeArray.length; k++ ) {
			patientRttChangeArray[k] = patientRttChangeArray[k].replace( "#", "_" );
			var elToFind = $( "#star-" + patientRttChangeArray[k] );
			elToFind.addClass( 'patientStarAdded' );
			setNameBlockWidth( elToFind );
			if (!window.offline) {
				$('.sync-button[data-pid-slotid="'+patientRttChangeArray[k]+'"]').removeClass('ui-disabled') ;
			}
		}

		var patientSchedulesArray = _app.dataProvider.getScheduleIdsForSync( );
		for ( var k = 0; k < patientSchedulesArray.length; k++ ) {
			var patientId = patientSchedulesArray[k].split('#');
			if (patientId.length > 1) {
				patientId = patientId[0];
				var elToFind = $( ".star-guid-" + patientId )
				elToFind.addClass( 'patientStarAdded' );
				setNameBlockWidth( elToFind );
				if (!window.offline) {
					$('.sync-button-guid-'+patientId).removeClass('ui-disabled') ;
				}
			}
		}

		return this ;
	}

	var unbindEvents = function( ) {
		emis.mobile.UI.removeOrientationEventsForDialog( orientationChange );
	}
	function orientationChange( ) {
		$( "#appointments" ).css( {
			// to redo jquery.mobile.1.1.1.js : 2881 min-height set
			"min-height": 300
		} )

		if ( emis.mobile.UI.isIE10 || emis.mobile.UI.isAtLeastIE11) {
			var appHeader = $( "#headerAppointments" ).find( "h3" );
			appHeader.css( {
				"margin-top" : -1
			} );
			setTimeout( function( ) {
				appHeader.css( {
					"margin-top" : ""
				} );
			}, SCROLLTO_DELAY );

		}
	}
	// register global page events
	$( document ).delegate("#appointments", "pageinit", function() {

		if ( emis.mobile.nativeFrame.isNative ) {
			main.controller.useLocalStorageForDocs = false;
		} else {
			if ( window.indexedDB ) {
				try {
					new emis.mobile.IDBStorage( ).findAllIds( "DocAttachment" ).done( function( ) {
						main.controller.useLocalStorageForDocs = false;
					} );
				} catch ( e ) {
					main.controller.useLocalStorageForDocs = true;
				}
			} else {
				main.controller.useLocalStorageForDocs = true;
			}
		}

		var $page = $(this) ;

		$page.on( 'pagehide', unbindEvents );
		$page.on( 'pageshow', orientationChange );

		$page.on( 'pageshow', function () {
			if ( main.controller.patientLimitExceeded ) {
				var textToDisplay = "The Patient Record limit has been met. Some Emis Mobile appointments may NOT have been " + "synced to the device. A maximum of " + PATIENT_LIMIT + " patient records can be stored on the device at any one time.";
				emis.mobile.Utilities.alert({message: textToDisplay, title: "Information"} );
				main.controller.patientLimitExceeded = false;
			} else if ( emis.mobile.nativeFrame.android ) {

				// when user is viewing document and webview was killed then go back to documents page
				/*var slotId = main.storage.getItem( "androidSlotId" );
				if ( slotId ) {
					main.storage.removeItem( "androidSlotId" );
					emis.mobile.console.log("lastSlotId + " + slotId );
					var appt = main.dataProvider.getAppointmentById( slotId );
					emis.mobile.console.log("appt")
					if ( appt ) {
						var patientId = appt.PatientId;
						if ( ! patientId ) {
							patientId = 'nullId' + slotId;
						}
						var pd = main.dataProvider.getPatientById( patientId );
						emis.mobile.console.log("pd")
						if ( pd ) {
							var po = {
								id: patientId,
								name: pd.name,
								guid: pd.id
							};
							main.controller.setCurrentPatient( po );
							main.controller.setSlotId( slotId );
							main.controller.currentlySelectedAppointment = appt;
							emis.mobile.console.log("changepage patientdocuments");
							setTimeout( function() {
								$.mobile.changePage( '#patientdocuments', {
									delay: true
								} );
							}, 1000 );
						}
					}
				}*/
			} else if ( emis.mobile.nativeFrame.windows ) {
				var windowsStorage = new emis.mobile.WindowsStorage () ;
				windowsStorage.informPageLoaded();
			}
		}) ;

		// Bind button click events by jquery delegate
		$( "#appointments" ).on( 'click', '.button', function(e) {
			if ($(this).hasClass('ui-disabled')) {
				return false ;
			}
			if ($(this).hasClass('view-record')) {
				if ( $( this ).data( 'em-appointment-slotid' ) != undefined ) {
					_app.controller.makeAllSubpagesRefreshable( );
					//emis.mobile.form.AppointmentsList.openPatient( $( this ).data( 'em-appointment-patientid' ), $( this ).data( 'em-appointment-slotid' ) );
					emis.mobile.form.AppointmentsList.openPatient( $( this )[0].getAttribute("data-em-appointment-patientid"), $( this )[0].getAttribute("data-em-appointment-slotid"));
				}
			} else if ($(this).hasClass('sync-patient')){

				//var slotId = $(this).data('pid-slotid') ;
				var slotId = $(this)[0].getAttribute("data-pid-slotid");
				if (slotId) {
					slotId = slotId.split('_') ;
					slotId = slotId[1] ;
					main.controller.syncSinglePatientSlotId = slotId ;
					emis.mobile.UI.startSynchronize();
				}
				e.preventDefault();
			} else if ($(this).hasClass('patientDetailsInfo')){

				//var slotid =  $(this).data('em-slotid') ;
				var slotid =  $(this)[0].getAttribute("data-em-slotid");
				emis.mobile.UI.openPatientDetails(slotid) ;
			} else if ($(this).hasClass('travel-details-button')) {
				//var patientId = $(this).data('patientid') ;
				var patientId = $(this)[0].getAttribute("data-patientid");
				var ctrl = main.controller.getFormController('#travelDetails') ;
				ctrl.patientId = patientId ;
				$.mobile.changePage( '#travelDetails', {
					delay: true
				} );
			} else if ($(this).hasClass('delete-record')) {
				if ( $( this ).data( 'em-appointment-slotid' ) != undefined ) {
					//var slotId = $( this ).data( 'em-appointment-slotid' );
					var slotId = $( this )[0].getAttribute("data-em-appointment-slotid");
					//var patientId = $( this ).data( 'em-appointment-patientid' );
					var patientId = $( this )[0].getAttribute("data-em-appointment-patientid");
					emis.mobile.Utilities.confirm({message: "Delete data for this patient?", title: "Delete confirmation", ok:'Delete', cancel:'Cancel',
						callback:function (confirm){
							if (confirm) {
								if ( patientId ) {
									main.dataProvider.removePatientDataByPatientId( patientId );
								} else if ( slotId ) {
									main.dataProvider.removePatientDataBySlotId( slotId );
								}

								$( '#appointments-failed-row-' + slotId ).remove();
								if ( $( '#failedToSyncList' ).find( 'tr' ).length == 0 ) {
									$( '#failedToSyncList' ).hide();
								}
							}
						}
					});
				}
			}

		} );

		$('#appointments').on('click', '.toggle-details', function(event) {
			if ($(this).hasClass('ui-disabled')) {
				return false ;
			}
			//var slotId = $(this).data('em-appointment-slotid') ;
			var slotId = $(this)[0].getAttribute("data-em-appointment-slotid");
			//var patientId = $(this).data('em-appointment-patientid') ;
			var patientId = $(this)[0].getAttribute("data-em-appointment-patientid");
			if (slotId) {
				emis.mobile.form.AppointmentsList.toggleDetails(slotId, patientId) ;
			}
			event.preventDefault() ;
		}) ;

		// filtering mechanism for data lists - search while you type
		$( '#inputFilter' ).keyup( function( ) {
			var $rows = $("#appointments .content > table > tbody > tr") ;
			var val = $.trim( $( this ).val( ) ).replace( / +/g, ' ' ).toLowerCase( ).split( " " );
			$rows.show( ).filter( function( ) {
				var text = $( this ).find('.filter-text').text().replace( /\s+/g, ' ' ).toLowerCase( );
				var filter = false;
				for ( var i = 0; i < val.length; i++ ) {
					if ( !~text.indexOf( val[i] ) ) {
						filter = true;
						break ;
					}
				}
				return filter;
			} ).hide( );

			// show/hide 'no data' block
			$( '#appointments .content' ).each( function( ) {
				var contentObj = $( this ).find( 'table > tbody > tr' );
				var hiddenBlocks = $( this ).find( 'table > tbody > tr:hidden' );
				var hasNoData = $( this ).find( 'div.noData' ).length > 0;

				if ( contentObj.length == hiddenBlocks.length && !hasNoData ) {
					var textToDisplay = 'No appointments found.';
					if ( contentObj.hasClass( 'appointments-failed-row' ) ) {
						textToDisplay = 'Please change filter criteria.'
					}
					$( this ).append( '<div class="noData">' + textToDisplay + '</div>' );
				} else if ( contentObj.length != hiddenBlocks.length ) {
					$( this ).children( ).remove( '.noData' );
				}
			} );
		} );

		$( '#failedToSyncList .topthing' ).on( 'click', function( e ) {
			e.stopImmediatePropagation();
			hideFailedSyncAlerts();
			$( "#failedToSyncList .ui-collapsible-heading-toggle" ).click();
			return false;
		});

		$( "#failedToSyncList" ).on( 'collapsiblecollapse', 'div[data-role="collapsible"]', function() {
			hideFailedSyncAlerts();
		} );

		$( '#failedToSyncList' ).on( 'click', '.alertsButtonContainer', function() {
			var ac = $(this).siblings( '.alertsContainer' );
			$( '#failedToSyncList' ).find( '.alertsContainer' ).not( ac ).hide(); //hide other alertContainers, if any
			ac.toggle();
		});

		initialiseStaticElements();

	});

	function hideFailedSyncAlerts() {
		$( '#failedToSyncList' ).find( '.alertsContainer' ).hide();
	}

	this.bindDataAndEvents = function( $page, refresh ) {
		//emis.mobile.console.enableLogging = true;
		//swapping position of collapsible
		$('#failedToSyncList .ui-collapsible-content').insertBefore('#failedToSyncList .ui-collapsible-heading');
		$('#failedToSyncList .ui-collapsible-content').removeClass('ui-corner-all');
		hideFailedSyncAlerts();

		window.offlinePass = null;
		main.controller.Logged = true;
		main.controller.duringSynchronisation = false;
		main.controller.warningsDisplayed = [];
		$( '#inputFilter' ).val( "" );

		// if ( emis.mobile.UI.isIE10 || emis.mobile.UI.isAtLeastIE11) {
			// $( '#MapBtn' ).remove( );
			// $( '#headerAppointments' ).append( '<a id="MapBtn" href="#map" data-role="none" class="standaloneButton">Map</a>' );
		// }
		$( "#MapBtn" ).off( "click" ).on( "click", function( ) {
			if ( $( this ).hasClass( "ui-disabled" ) ) {
				return false;
			}
		} );


		emis.mobile.UI.prepareAppointmentsPage( $page );

		main.controller.patient.id = null;
		main.controller.previousSlotId = main.controller.slotId;
		main.controller.slotId = null;


		if ( refresh === true ) {
			// Clear the markup
			$( "#appointmentContent" ).html( "" );
			$( "#failedToSyncList" ).find( "tbody" ).html( "" );

			var failedEntries;
			try {
				failedEntries= _app.dataProvider.getFailedSlots();
			} catch (err) {}
			if ( !_app.util.isEmptyObject( failedEntries ) && failedEntries.length ) {
				var markup = '';

				// show slots only with distinct patientId
				// and look for slots that are first on patient list
				var entries = [];
				var secondEntries = [];
				for ( var i = 0; i < failedEntries.length; i++ ) {
					var patientId = failedEntries[i];
					var appointments = main.dataProvider.getAppointmentsByPatientId( patientId );
					if ( ! patientId || patientId == "null" ) {
						patientId = "nullId" + slotId;
					}
					if ( appointments.length && ! entries[patientId] ) {
						var firstSlotId = appointments[0].SlotId;
						entries[patientId] = firstSlotId;
						secondEntries.push( firstSlotId );
					}
				}

				markup = fillFailedSectionList( markup, secondEntries );
				$( "#failedToSyncList" ).find( "tbody" ).html( markup );
				if ( $( "#failedToSyncList" ).find( "tr" ).length ) {
					$( "#failedToSyncList" ).show();
					//Fallback for jquery show function as this is not working in all scenarios.
					if($("#failedToSyncList .ui-collapsible-collapsed").length)
					{
						$("#failedToSyncList .ui-collapsible-heading-toggle").click();
					}
				} else {
					$( "#failedToSyncList" ).hide();
				}
			} else {
				$( "#failedToSyncList" ).hide();
			}
			var entries;
			try {
				entries = _app.dataProvider.getAllSessionIDs( );
			} catch(err) {
				var dw = new emis.mobile.DataWipe();
				dw.clearSynchronisedData(_app.dataProvider,null);
			}
			if ( !_app.util.isEmptyObject( entries ) ) {
				// Prepare the markup
				var markup = '';
				markup = fillSectionListview( markup, entries );

				// Inject the markup
				$( "#appointmentContent" ).html( markup );


			} else {
				// Prepare the markup
				var markup = ''
				markup += fillNoData();

				// Inject the markup
				$( "#appointmentContent" ).html( markup );

			}

			$(".btnFailed").each(function(){

				var patientId = $(this).attr("id");
				patientId = patientId.replace("patientAlert", "");

				$(this).click(function () {
					syncFailedTest(patientId);
				});
			});
		}

		emis.mobile.form.AppointmentsList.clearNeedSync( ).markNeedSync( );


		updateOfflineElements( );



		$( '#inputFilter' ).keyup( );
		$( '.noData' ).hide( );

		/* fix for #113291 and all similar problems in the future */
		$( "#drawer li" ).removeClass( "drawer-active" ).siblings( "#drawer-appointments" ).addClass( "drawer-active" );

		emis.mobile.UI.addOrientationEventsForDialog( orientationChange );

		if ( ! emis.mobile.nativeFrame.isNative ) {
			setTimeout( function( ) {
				if ( main.controller.askForUpdate == true || ( window.applicationCache.status == window.applicationCache.UPDATEREADY && main.controller.dontSuppressUpdateQuestion == true ) ) {
					main.controller.askForUpdate = false;
					main.controller.dontSuppressUpdateQuestion = false;
					emis.mobile.Utilities.customConfirmPopup( { ok: "Yes", cancel: "Update later", message: "New Update Available. Would you like to log in again?", title: "New Update Available", callback: function( r ) {
						if ( r == true ) {
							main.controller.logout( );
						}
					} } );
				}
			}, 1500 );
		}

		if ( emis.mobile.UI.isiPad && main.storage.getItem( "GetSession_Response" ) == null ) {
			emis.mobile.Utilities.alert( {message: "An error with your iPad's browser storage configuration was detected. The application needs to be reloaded.", backPage: $page.selector, callback: function(r) {
				if ( r === true ) {
					main.controller.gotoLoginPage();
				}
			}} );
		}
		orientationChange( );
	};

	function synchronisationStart( e ) {
		if ( $( this ).hasClass( "ui-disabled" ) ) {
			return false;
		}
		//if ( main.dataProvider.isAnyDataToSync() ) {
			main.controller.syncSinglePatientSlotId = null;
			emis.mobile.UI.startSynchronize();
		// } else {
			// emis.mobile.Utilities.displayConfirmResync( emis.mobile.UI.startSynchronize );
		// }
	}

	function initialiseStaticElements( ) {
		if ( !_bStaticElementsInitialised ) {
			_bStaticElementsInitialised = true;

			if ( emis.mobile.nativeFrame.isNative ) {
				$(document).on( 'emis-native.app-became-online', function( ) {
					updateOfflineElements( );
				} );
				$(document).on( 'emis-native.app-became-offline', function( ) {
					updateOfflineElements( );
				} );
			}
			window.addEventListener( "offline", function( e ) {
				updateOfflineElements( );
			} );
			window.addEventListener( "online", function( e ) {
				updateOfflineElements( );
			} );
		}
	}

	return this;
} ;

emis.mobile.form.AppointmentsList.getDetailsHtml = function (appRow, slotId, patientId) {
	var patient = main.dataProvider.getPatientById( patientId );
	var cellsnum = appRow.get(0).cells.length ;
	var detailsHtml = '<tr class="appointment-details" data-pid-slotid="' + patientId + '_' + slotId + '">' ;
	// first td
	detailsHtml += '<td class="grid-5 e-block-a"></td>' ;
	//status td
	detailsHtml += '<td colspan="'+(cellsnum-4)+'" class="status">' ;
	detailsHtml += '<div class="controlgroup" data-role="controlgroup" data-type="horizontal" style="display:none">';
	detailsHtml += '<legend>Status</legend>'
	detailsHtml += '<input type="radio" name="radio-choice" value="on"><label>Patient seen</label><input type="radio" name="radio-choice" value="on"><label>Patient not in</label></div>'
	detailsHtml += '</td>';
	// travel td
	detailsHtml += '<td colspan="2">' ;

	detailsHtml += '<div class="contactTravelInfo"><span class="heading">Travel</span><span class="value-miles">'+60+'</span><span class="units miles">Miles</span><span class="value-mins">'+25+'</span><span class="units mins">mins</span><a class="button edit ui-link travel-details-button" href="#" data-patientid="'+patient.id+'">Edit</a></div>' ;

	detailsHtml += '</td>' ;
	// sync button td
	detailsHtml += '<td>'
	detailsHtml += '<a href="#" data-pid-slotid="' + patientId + '_' + slotId + '" data-role="none" class="need-online sync-button button ui-disabled sync-patient sync-button-guid-'+patientId+'"';
	detailsHtml += ' data-em-appointment-patientid="' + patientId + '">Sync.</a>';
	detailsHtml += '</td>' ;
	detailsHtml += '</tr>' ;
	return detailsHtml ;
} ;

emis.mobile.form.AppointmentsList.toggleDetails = function (slotId, patientId) {
	var pd = main.dataProvider.getPatientById( patientId );
	if (!pd) {
		//emis.mobile.Utilities.alert({message: 'Patient data has not been found.', title: "Error"});
		return false ;
	}

	var appRow = $('#appointments-row-'+slotId) ;
	var details = appRow.next('.appointment-details[data-pid-slotid="' + patientId + '_' + slotId + '"]') ;
	if (details.length) {
		$(details).remove() ;
		appRow.find('.time-col').removeClass('open') ;
	} else {

		var detailsHtml = this.getDetailsHtml (appRow, slotId, patientId) ;
		appRow.after(detailsHtml) ;
		appRow.find('.time-col').addClass('open') ;
		//$('#appointments-details-'+slotId+' .controlgroup').controlgroup({ mini: true }) ;

		emis.mobile.form.AppointmentsList.markNeedSync () ;
	}
} ;

emis.mobile.form.AppointmentsList.openPatient = function openPatient( patientId, slotId ) {
	var pd = main.dataProvider.getPatientById( patientId );


	if (!pd) {
		//emis.mobile.Utilities.alert({message: 'Patient data has not been found.', title: "Error"});
		return false ;
	}

	var po = {
		id: patientId,
		name: pd.name,
		guid: pd.id
	};
	if ( main.controller.patient.id != po.id ) {
		var warn = $( document.getElementById( 'drugWarning' ) );
		if ( warn.length > 0 && warn.is( ':hidden' ) ) {
			$( document.getElementById( 'drugWarning' ) ).show( );
		}
	}
	main.controller.setCurrentPatient( po );
	main.controller.setSlotId( slotId );
	$.mobile.changePage( '#patientsummary', {
		delay: true
	} );
}