/**
 * Book Appointment Details controller, Functionalities provided: TODO
 */

emis.mobile.form.BookAppointmentsDetails = function( appObject ) {
	var _app = appObject;
	var slotTypeInitialId;
	var that = this;
	this.data = [];
	// data holder
	var lastPage;
	var lastCall = "book";
	var lastBookAppointment;
	var lastReleaseAppointment;
	var bookDetailsReason;
	var bookDetailsReasonList;
	var bookDetailsSlotType;
	var bookDetailsNotes;
	var mobileNumber;
	var _bStaticElementsInitialised = false;
	var countBackKeys = 0;
	var timeBackKey = 0;

	var unbindEvents = function( ) {
		$( "#bookAppointmentsDetailsCloseBtn" ).unbind( );
		lastPage.off( 'pageshow', pageShow );
		emis.mobile.UI.removeOrientationEventsForDialog( orientationChange );
		$( "#bookAppointments" ).css( {
			"overflow": "visible",
			"max-height": "none"
		} );
	};

	var pageShow = function( ) {
		orientationChange( );
	};

	var orientationChange = function( ) {
		var newHeight = emis.mobile.UI.calculateDialogPadding( _app, lastPage );

		$( "#bookAppointments" ).css( {
			"min-height": newHeight,
			"max-height": newHeight,
			"overflow": "hidden"
		} );

		if ( lastPage ) {
			lastPage.css( {
				"padding-bottom": "",
				"height": ""
			});
			emis.mobile.UI.setDialogHeight( lastPage, "#bookAppointments" );
		}
	};
	function f( v ) {
		if ( v )
			return v;
		return '';
	}

	function getSectionNoData( sectionTitle ) {
		return '<div class="contentPanel"><div class="header no-data">' + sectionTitle + ' (None)</div></div>'
	}

	function getSectionOpen( ) {
		return '<div class="contentPanel">';
	}

	function getSectionClose( ) {
		return '</div>';
	}

	function getSectionContentOpen( additionalClass ) {
		return '<div class="content grid' + ( additionalClass ? ' ' + additionalClass : '' ) + '">';
	}

	function getSectionContentClose( ) {
		return '</div>';
	}

	/*
	 * var setSMSReminder = function(selectorOn, selectorOff) { $(selectorOff).removeClass("ui-radio-on
	 * ui-btn-active").addClass("ui-radio-off"); $(selectorOn).removeClass("ui-radio-off").addClass("ui-radio-on
	 * ui-btn-active"); };
	 *
	 * var setSMSEvent = function() { if (this.id == "sendSMS") { setSMSReminder('#sendSMS', '#dontSendSMS'); } else {
	 * setSMSReminder('#dontSendSMS', '#sendSMS'); mobileNumber.removeClass('notValid'); } };
	 */
	function fillSelect( elementId, data ) {
		$( elementId ).html( "" );
		if ( !_app.util.isEmptyObject( data ) ) {
			var selectOptions = "";
			var dataSorted = data.sort( function( a, b ) {
				var aDisplay = a.object.DisplayName;
				var bDisplay = b.object.DisplayName;
				if ( aDisplay < bDisplay )
					return -1;
				if ( aDisplay > bDisplay )
					return 1;
				return 0;
			} );
			for ( var i = 0; i < dataSorted.length; i++ ) {
				if ( elementId == "#bookDetailsSlotType" && slotTypeInitialId == dataSorted[i].object.Id ) {
					selectOptions += '<option value="' + dataSorted[i].object.Id + '" selected >' + _.h(dataSorted[i].object.DisplayName) + '</option>';
				} else {
					selectOptions += '<option value="' + dataSorted[i].object.Id + '">' + _.h(dataSorted[i].object.DisplayName) + '</option>';
				}
			}
			$( elementId ).html( selectOptions );
		}
	}

	function updateOfflineElements( ) {
		if ( !offline ) {
			$( document.getElementById( "doBookAppointment" ) ).removeClass( "ui-disabled" ).text( "Book appointment" );
		} else {
			$( document.getElementById( "doBookAppointment" ) ).addClass( "ui-disabled" ).text( "Book appointment (No connection)" );
		}
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


	this.bindDataAndEvents = function( $page, refresh ) {
		// temporary for some tests
		main.controller.bookAppointmentsDetailsTmp = this;

		// Clear the markup
		$( "#bookAppointmentsDetailsContent" ).html( "" );

		lastPage = $page;
		unbindEvents( );
		$( "#bookAppointmentsDetailsCloseBtn" ).click( function( e ) {
			unbindEvents( );
			that.releaseAppointment( that.data.slotId, that.data.lastUpdated );
		} );

		updateOfflineElements( );
		initialiseStaticElements( );

		var formattedStartDate = that.data.formattedStartDate;
		var name = main.controller.patient.name;
		var session = that.data.sessiondescription;
		var location = that.data.location;
		var slotType;
		slotTypeObj = main.storage.find( "SlotTypes", that.data.slotType );
		slotType = JSON.parse( slotTypeObj ).DisplayName;
		slotTypeInitialId = JSON.parse( slotTypeObj ).Id;

		emis.mobile.console.log( 'BookAppointmentsDetails' );
		$header = $page.find( ":jqmData(role=header)" );

		$header.find( ":jqmData(container=header-title)" ).html( f( formattedStartDate ) );

		var markup = '';

		// open bookAppointmentsPatientHeader section
		markup += '<div class="e-blocks">';
		markup += '<div class="grid-4 e-block-a gridLabel">Patient name</div>';
		markup += '<div class="grid-4 e-block-b">' + _.h( name ) + '</div>';
		markup += '<div class="grid-4 e-block-c gridLabel">Session</div>';
		markup += '<div class="grid-4 e-block-d">' + _.h( session ) + '</div>';
		markup += '</div>';

		markup += '<div class="e-blocks">';
		markup += '<div class="grid-4 e-block-a gridLabel">Location</div>';
		markup += '<div class="grid-4 e-block-b">' + _.h( location ) + '</div>';
		markup += '<div class="grid-4 e-block-c gridLabel">Slot type</div>';
		markup += '<div class="grid-4 e-block-d">' + _.h( slotType ) + '</div>';
		markup += '</div>';
		// close bookAppointmentsPatientHeader section
		$( "#bookAppointmentsPatientHeader" ).html( markup);

		markup = '';
		markup += getSectionOpen( );
		markup += getSectionContentOpen( );
		markup += '<div class="e-blocks">';
		markup += '<div class="grid-2 e-block-a gridLabel">Reason</div>';
		markup += '<div id="bookDetailsReasonBlock" class="grid-2 e-block-b">';
		markup += '<input id="bookDetailsReason" type="text" placeholder="Choose reason" autocomplete="off" />';
		reasons = _app.dataProvider.getAppointmentBookingReasons( );
		if ( reasons.length != 0 ) {
			markup += '<ul id="bookDetailsReasonList" class="ui-body-c ui-corner-all ui-shadow-inset">';
			var sortedReasons = reasons.sort( function sortMethod( a, b ) {
				return b < a ? 1 : b > a ? -1 : 0;
			} );

			for ( i in sortedReasons ) {
				markup += '<li>' + _.h(sortedReasons[i]) + '</li>';
			}
			markup += '</ul>';
		}

		markup += '</div>';
		markup += '</div>';

		markup += '<div class="e-blocks">';
		markup += '<div class="grid-2 e-block-a gridLabel">Slot type</div>';
		markup += '<div class="grid-2 e-block-b">';
		markup += '<select id="bookDetailsSlotType" data-role="none">';
		markup += '</select>';
		markup += '</div>';
		markup += '</div>';

		markup += '<div class="e-blocks">';
		markup += '<div class="grid-2 e-block-a gridLabel">Notes</div>';
		markup += '<div class="grid-2 e-block-b">';
		markup += '<textarea id="bookDetailsNotes" data-role="none" class="ui-corner-all ui-shadow-inset ui-input-text ui-body-c" placeholder="" ></textarea>';
		markup += '</div>';
		markup += '</div>';
		/*
		 * WARNING: don't remove this code - this feature will be back in phase 3 markup += '<div class="e-blocks">';
		 * markup += ' <div class="grid-4 e-block-a gridLabel">Send SMS reminder</div>'; markup += ' <div class="grid-4
		 * e-block-b">'; markup += ' <div class="e-input" id="smsReminderWrapper">'; markup += ' <div id="sendSMS"
		 * class="ui-btn ui-mini ui-corner-left ui-radio-on ui-btn-active">Yes</div>'; markup += ' <div
		 * id="dontSendSMS" class="ui-btn ui-mini ui-corner-right ui-controlgroup-last ui-radio-off">No</div>';
		 * markup += ' </div>'; markup += ' </div>';
		 *
		 * markup += ' <div class="grid-4 e-block-c gridLabel">Mobile number</div>'; markup += ' <div class="grid-4
		 * e-block-d">'; markup += ' <input id="mobileNumber" type="tel" />'; markup += ' </div>'; markup += '</div>';
		 */
		markup += getSectionContentClose( );
		markup += getSectionClose( );

		// Additional information
		markup += '<div class="additional-info">';
		var info = _app.dataProvider.getPatientAppointmentInformation( );
		if ( _app.util.isEmptyObject( info ) || _app.util.isEmptyObject( info ) ) {
			markup += getSectionNoData( 'Additional information' );
		} else {
			markup += getSectionOpen( );
			markup += '<div class="header">Additional information</div>';
			markup += getSectionContentOpen( "scroll" );
			markup += buildAdditionalInfoTable( info );
			markup += getSectionContentClose( );
			markup += getSectionClose( );
		}
		markup += '</div>';
		// close additional information

		markup += getSectionOpen( );
		markup += getSectionContentOpen( );
		markup += createOTKVerificationDiv( );
		markup += '<div id="doBookAppointmentContainer">';
		markup += '<a href="" id="doBookAppointment" data-role="none" class="button green">Book appointment</a>';
		markup += '</div>';
		markup += getSectionContentClose( );
		markup += getSectionClose( );

		$( "#bookAppointmentsDetailsContent" ).html( f( markup ) );

		// $("#sendSMS, #dontSendSMS").on('click', setSMSEvent);

		$( '#doBookAppointment' ).on( 'click', doBookAppointment );

		bookDetailsReason = $( '#bookDetailsReason' );
		bookDetailsReasonList = $( '#bookDetailsReasonList' );
		// THIS Z-INDEX IS BEACUSE THE LIST WASN'T VISIBLE ON
		// NATIVE SAMSUNG TAB 2 BROWSER, BUT SELECTABLE.
		bookDetailsReasonList.css( 'z-index', '99999' );
		bookDetailsSlotType = $( '#bookDetailsSlotType' );
		bookDetailsNotes = $( '#bookDetailsNotes' );
		bookDetailsNotes.css( 'z-index', '9999' );
		mobileNumber = $( '#mobileNumber' );

		mobileNumber.on( 'keydown', function( ) {
			mobileNumber.removeClass( 'notValid' );
		} );

		bookDetailsReasonList.hide( );

		var $rows = bookDetailsReasonList.find( 'li' );
		bookDetailsReason.keyup( function( e ) {
			var val = $( this ).val( ).toLowerCase( );
			var rowsVisibleCounter = $rows.length;

			$rows.show( ).filter( function( ) {
				var text = $( this ).text( ).toLowerCase( );
				var filter = false;
				if ( text.indexOf( val ) == -1 ) {
					filter = true;
					rowsVisibleCounter--;
				}
				return filter;
			} ).hide( );

			if ( rowsVisibleCounter > 0 ) {
				bookDetailsReasonList.show( );
			} else {
				bookDetailsReasonList.hide( );
			}

			if ( emis.mobile.UI.isAndroid ) {
				var charCode = e.keyCode;
				if ( charCode == 8 ) {
					var d = new Date( );
					var curTime = d.getTime( );
					if ( curTime - timeBackKey < 100 ) {
						countBackKeys++;
						if ( countBackKeys > 15 ) {
							bookDetailsReason.val( "" );
							val = "";
							countBackKeys = 0;
						}
					}
					timeBackKey = curTime;
				} else {
					countBackKeys = 0;
				}
			}

			if ( val != "" ) {
				bookDetailsReason.removeClass( 'notValid' );
			} else if ( !bookDetailsReason.hasClass( 'notValid' ) ) {
				bookDetailsReason.addClass( 'notValid' );
			}

		} );

		var reasonsListScrollStartPos = 0;
		bookDetailsReasonList.on( 'touchstart', function( e ) {
			if ( emis.mobile.UI.isAndroid && emis.mobile.UI.isNative ) {
				reasonsListScrollStartPos = -parseInt( bookDetailsReasonList.children( ).first( ).css( "margin-top" ), 10 ) + e.originalEvent.touches[0].pageY;
			} else {
				reasonsListScrollStartPos = this.scrollTop + e.originalEvent.touches[0].pageY;
			}
			e.stopImmediatePropagation();
		} );
		bookDetailsReasonList.on( 'touchmove', function( e ) {
			if ( this.scrollHeight > $( this ).height( ) ) {
				if ( emis.mobile.UI.isAndroid && emis.mobile.UI.isNative ) {
					var newMargin = reasonsListScrollStartPos - e.originalEvent.touches[0].pageY;
					var reasonListHeight = bookDetailsReasonList.height( );
					var reasonListInnerHeight = bookDetailsReasonList[0].scrollHeight;
					if ( reasonListInnerHeight > reasonListHeight ) {
						if ( newMargin < 0 ) {
							newMargin = 0;
						} else if ( newMargin > reasonListInnerHeight - reasonListHeight ) {
							newMargin = reasonListInnerHeight - reasonListHeight;
						}
						bookDetailsReasonList.children( ).first( ).css( "margin-top", -newMargin );
					}
				} else {
					this.scrollTop = reasonsListScrollStartPos - e.originalEvent.touches[0].pageY;
				}
				e.preventDefault( );
			}
			e.stopImmediatePropagation();
		} );

		bookDetailsReasonList.on( 'click', function( e ) {
			bookDetailsReason.val( $( e.target ).text( ) ).blur( );
			bookDetailsReasonList.hide( );
			bookDetailsReason.removeClass( 'notValid' );
			e.stopImmediatePropagation();
		} );

		bookDetailsReason.on( 'focus click', function( e ) {
			countBackKeys = 0;
			bookDetailsReasonList.show( );
			e.stopImmediatePropagation();
		} );

		var additionalInfoScrollStartPos = 0;
		var additionalInfoInnerDiv = $( "#bookAppointmentsDetailsContent .additional-info div.scroll" );
		additionalInfoInnerDiv.on( 'touchstart', function( e ) {
			additionalInfoScrollStartPos = this.scrollTop + e.originalEvent.touches[0].pageY;
		} );
		additionalInfoInnerDiv.on( 'touchmove', function( e ) {
			if ( this.scrollHeight > $( this ).height( ) ) {
				this.scrollTop = additionalInfoScrollStartPos - e.originalEvent.touches[0].pageY;
				e.preventDefault( );
			}
		} );

		$( document ).on( 'click', function( e ) {
			bookDetailsReasonList.hide( );
		} );

		fillSelect( "#bookDetailsSlotType", main.dataProvider.getSlotTypes( ) );
		// }
		// $("#mobileNumber").val(JSON.parse(main.storage.find("Patient", main.controller.patient.id)).mobilePhone);
		emis.mobile.UI.addOrientationEventsForDialog( orientationChange );
		orientationChange( );
		$page.on( 'pageshow', pageShow );

		toggleOTKVerfication( false );
		if ( main.controller.runNonSyncWSManager ) {
			main.controller.runNonSyncWSManager = false;
			nonSyncManager = new emis.mobile.NonSyncWSManager( );
			nonSyncManager.delegate = this;
			if(CALL_OTK_INSTEAD) {
				nonSyncManager.verifyOTK( );
			} else {
				nonSyncManager.authenticate();
			}
		}
	};

	var createOTKVerificationDiv = function( ) {
		var markup = '';
		markup += '<div id="verifyOneTimeKeyContent">';
		markup += '<div class="contentPanel">';
		markup += '<div style="text-align:center;" data-role="fieldcontain">';
		markup += '<h3>Access Token Required </h3>';
		markup += '<div>One time key session has ended</div>';
		markup += '<fieldset class="syncLoginField">';
		markup += '<input id="textinputOneTimeKey" placeholder="Enter Access Token" value="" type="password">';
		markup += '</fieldset>';
		// close fieldcontain
		markup += '</div>';
		markup += '<div class="e-blocks">';
		markup += '<div class="grid-2 e-block-a">';
		markup += '<a data-role="none" id="confirmOneTimeKey" href="#" class="button green"> <span class="ui-icon ui-icon-check ui-icon-shadow"></span> OK </a>';
		markup += '</div>';
		markup += '<div class="grid-2 e-block-b">';
		markup += '<a data-role="none" id="cancelOneTimeKey" href="#" class="button red"> <span class="ui-icon ui-icon-delete ui-icon-shadow"></span>Cancel </a>';
		// close e-block-b
		markup += '</div>';
		// close e-blocks
		markup += '</div>';
		// close contentPanel
		markup += '</div>';
		// close verifyOneTimeKeyContent
		markup += '</div>';
		return markup;
	};

	var toggleOTKVerfication = function( isVisible ) {
		if ( isVisible ) {
			$( '#bookAppointmentsDetailsContent #doBookAppointment' ).hide( );
			$( '#bookAppointmentsDetailsContent #verifyOneTimeKeyContent' ).show( );
			$( '#confirmOneTimeKey' ).unbind( );
			$( '#cancelOneTimeKey' ).unbind( );
			$( '#confirmOneTimeKey' ).on( "click", function( ) {
				var accessToken = $( "#textinputOneTimeKey" ).val( );
				if ( accessToken.length > 0 ) {
					_app.controller.setAccessToken( accessToken );
					accessToken = null;
					$( "#textinputOneTimeKey" ).val( "" );
					toggleOTKVerfication( false );
					nonSyncManager = new emis.mobile.NonSyncWSManager( );
					nonSyncManager.delegate = that;
					if(CALL_OTK_INSTEAD) {
						nonSyncManager.verifyOTK( );
					} else {
						nonSyncManager.authenticate();
					}
				} else {
					emis.mobile.Utilities.alert( {message: "Please enter access token.", backPage: $.mobile.activePage.selector} );
				}

			} );
			$( '#cancelOneTimeKey' ).on( "click", function( ) {
				$( "#textinputOneTimeKey" ).val( "" );
				toggleOTKVerfication( false );
			} );

		} else {
			$( '#bookAppointmentsDetailsContent #doBookAppointment' ).show( );
			$( '#bookAppointmentsDetailsContent #verifyOneTimeKeyContent' ).hide( );
		}
	};

	function unvalidateFields( ) {
		bookDetailsReason.removeClass( 'notValid' );
		bookDetailsSlotType.removeClass( 'notValid' );
		mobileNumber.removeClass( 'notValid' );
	}

	var doBookAppointment = function( ) {
		if ( $( document.getElementById( "doBookAppointment" ) ).hasClass( "ui-disabled" ) ) {
			return false;
		}
		var valid = true;
		unvalidateFields( );
		if ( !bookDetailsReason.val( ) ) {
			valid = false;
			if ( !bookDetailsReason.hasClass( 'notValid' ) ) {
				bookDetailsReason.addClass( 'notValid' );
			}
		}
		if ( !bookDetailsSlotType.val( ) ) {
			valid = false;
			if ( !bookDetailsSlotType.hasClass( 'notValid' ) ) {
				bookDetailsSlotType.addClass( 'notValid' );
			}
		}
		/*
		 * var smsActive = $('#sendSMS').hasClass('ui-btn-active'); if (smsActive && !mobileNumber.val()) { valid =
		 * false; if (!mobileNumber.hasClass('notValid')) { mobileNumber.addClass('notValid'); } }
		 */
		if ( !valid ) {
			//emis.mobile.console.log( "bookDetailsReason.val() " + bookDetailsReason.val( ) );
			//emis.mobile.console.log( "bookDetailsSlotType.val() " + bookDetailsSlotType.val( ) );
			//emis.mobile.console.log( "mobileNumber.val() " + mobileNumber.val( ) );
			return false;
		}
		$( document.getElementById( "doBookAppointment" ) ).addClass( "ui-disabled" );
		/*
		* data.object.task.description = main.sanitizer.sanitize(taskDescription.val()); data.object.task.taskType =
		* getTaskType(_app.dataProvider.getTaskTypes(), taskType.val() ); data.object.task.dueDate =
		* _app.util.toISODate( taskDueDate.val() ); data.object.task.recipient =
		* getRecipientId(_app.dataProvider.getOrganisationPeople(), taskAppendTo.val())
		*/

		// _app.dataProvider.doBookAppointment( data );
		var slotTypeId = $( "#bookDetailsSlotType" ).val( );
		if ( slotTypeId == slotTypeInitialId )
			slotTypeId = null;
		bookDetailsReasonText = bookDetailsReason.val( );
		if ( bookDetailsReason.val( ).length == 0 )
			bookDetailsReasonText = "";
		// for adding appointment to list
		that.data.slotTypeDescription = JSON.parse( main.storage.find( "SlotTypes", $( "#bookDetailsSlotType" ).val( ) ) ).DisplayName;
		that.data.reason = bookDetailsReasonText;
		//
		// that.bookAppointment(that.data.slotId, slotTypeId, bookDetailsReasonText, $("#bookDetailsNotes").val(),
		// smsActive, mobileNumber.val());
		that.bookAppointment( that.data.slotId, slotTypeId, bookDetailsReasonText, $( "#bookDetailsNotes" ).val( ) );
	};
	/*
	 * info - data to put into the table
	 */
	var buildAdditionalInfoTable = function( info ) {
		var markup = '';

		if ( info ) {
			if ( info.cancelledAppointments ) {
				markup += createCancelledAppointmentsBlock( info.cancelledAppointments );
			}
			if ( info.futureAppointments ) {
				markup += createFutureAppointmentsBlock( info.futureAppointments );
			}
			if ( info.pastAppointments ) {
				var past = $.grep( info.pastAppointments, function( e ) {
					return e.status == 'DNA';
				} );
				if ( past ) {
					markup += createPastAppointmentsBlock( past );
				}
			}
			if ( info.patientAlerts ) {
				markup += createPatientAlertsBlock( info.patientAlerts );
			}
			if ( info.patientWarnings.length > 0 ) {
				markup += createPatientWarningsBlock( info.patientWarnings );
			}
		}
		return markup;
	};

	var createPatientWarningsBlock = function( warnings ) {
		var markup = '<div class="e-blocks">';
		for ( var i = 0; i < warnings.length; i++ ) {
			markup += '<div class="grid-2 e-block-a gridLabel">';
			markup += i == 0 ? 'Patient Warnings</div>' : '</div>';
			markup += '<div class="grid-2 e-block-b">' + _.h(warnings[i].term) + '</div>';
		}

		markup += '</div>';
		return markup;
	};

	var createCancelledAppointmentsBlock = function( cancelled ) {
		var markup = '<div class="e-blocks">';
		for ( var i = 0; i < cancelled.length; i++ ) {
			markup += '<div class="grid-2 e-block-a gridLabel">';
			markup += i == 0 ? 'Cancelled appt</div>' : '</div>';
			markup += '<div class="grid-2 e-block-b">' + formatDate( cancelled[i].startDateTime ) + ' - ' + _.h(cancelled[i].sessionOwners) + '</div>';
		}

		markup += '</div>';
		return markup;
	};

	var createFutureAppointmentsBlock = function( future ) {
		var markup = '';
		if ( future.length > 0 ) {
			markup += '<div class="e-blocks">';
			for ( var i = 0; i < future.length; i++ ) {
				markup += '<div class="grid-2 e-block-a gridLabel">';
				markup += i == 0 ? 'Future appt</div>' : '</div>';
				markup += '<div class="grid-2 e-block-b">' + formatDate( future[i].startDateTime ) + ' - ' + _.h(future[i].sessionOwners) + '</div>';
				/*
				 * markup += obj.sessionOwners; markup += obj.startDateTime; markup += obj.endDateTime; markup +=
				 * obj.status;
				 */
			}

			markup += '</div>';
		}
		return markup;
	};

	var createPastAppointmentsBlock = function( past ) {
		var markup = '';
		if ( past.length > 0 ) {
			markup += '<div class="e-blocks">';
			for ( var i = 0; i < past.length; i++ ) {
				markup += '<div class="grid-2 e-block-a gridLabel">';
				markup += i == 0 ? 'DNA information</div>' : '</div>';
				markup += '<div class="grid-2 e-block-b">' + formatDate( past[i].startDateTime ) + ' - ' + _.h(past[i].sessionOwners) + '</div>';
				/*
				 * markup += obj.sessionOwners; markup += obj.startDateTime; markup += obj.status;
				 */
			}

			markup += '</div>';
		}
		return markup;
	};

	var createPatientAlertsBlock = function( alerts ) {
		var markup = '';
		if ( alerts.length > 0 ) {
			markup += '<div class="e-blocks">';
			for ( var i = 0; i < alerts.length; i++ ) {
				markup += '<div class="grid-2 e-block-a gridLabel">';
				markup += i == 0 ? 'Patient warnings</div>' : '</div>';
				markup += '<div class="grid-2 e-block-b">' + _.h(alerts[i].text) + '</div>';
				// markup += obj.text;
			}

			markup += '</div>';
		}
		return markup;
	};

	this.askForOTK = function( ) {
		unbindEvents( );
		main.controller.lastNonSyncWSManagerDelegate = "#bookAppointmentsDetails";
		toggleOTKVerfication( true );
		orientationChange( );
	};

	this.askForAuth = function() {
		nonSyncManager = new emis.mobile.NonSyncWSManager( );
		nonSyncManager.delegate = this;
		nonSyncManager.authenticate();
	}

	this.nonSyncWSManagerSuccess = function( ) {
		this.retryLastCall( );
	};

	this.retryLastCall = function( ) {
		if ( lastCall == "book" ) {
			parametersObj = new Object( );
			parametersObj.sessionId = main.controller.SessionId;
			parametersObj.Payload = lastBookAppointment;

			emis.mobile.console.log( JSON.stringify( parametersObj ) );
			that.bookAppointmentsAPI = new emis.mobile.BookAppointmentAPI( );
			that.bookAppointmentsAPI.delegate = that;
			that.bookAppointmentsAPI.bookAppointment( JSON.stringify( parametersObj ) );
		} else {
			var parametersObj = new Object( );
			parametersObj.sessionId = main.controller.SessionId;
			parametersObj.Payload = lastReleaseAppointment;

			that.reserveAppointmentsAPI = new emis.mobile.ReserveAppointmentAPI( );
			that.reserveAppointmentsAPI.delegate = that;
			that.reserveAppointmentsAPI.reserveAppointment( JSON.stringify( parametersObj ), main.controller.SessionId );
		}
	};

	this.ParseReserveAppointmentResponse = function( response ) {
		showAlert = false;
		var pageToChangeTo = "#bookAppointments";
		if ( !response.Payload )
			showAlert = true;
		if ( response.Payload )
			if ( !response.Payload.reserveResponse )
				showAlert = true;
		if ( response.Payload )
			if ( response.Payload.reserveResponse )
				if ( !response.Payload.reserveResponse.action )
					showAlert = true;
		if ( response.Payload.reserveResponse.action.success != "true" && response.Payload.reserveResponse.action.success != true )
			showAlert = true;
		if ( showAlert ) {
			emis.mobile.Utilities.alert( {message: "Unable to release slot - It may be temporary blocked", title: "Error", backPage: pageToChangeTo} );
		}
		unbindEvents( );

		$.mobile.changePage( pageToChangeTo, {
			delay: true
		} );
	};

	this.ParseBookAppointmentResponse = function( response ) {
		if ( response.Payload.bookingResponse.success == true ) {
			//

			if ( main.storage.find( "Session", that.data.sessionId ) != null ) {
				var displayOrder = response.Payload.bookingResponse.displayOrder;
				var slotId = response.Payload.bookingResponse.slotId;
				var tmpSession = JSON.parse( main.storage.find( "Session", that.data.sessionId ) );
				tmpSession.order.push( slotId );
				if ( tmpSession.order.length > 1 ) {
					var it = tmpSession.order.length - 2;
					var continueLoop = true;
					while ( (it >= 0) && continueLoop) {
						if(JSON.parse( main.storage.find( "Appointment", tmpSession.order[it]))) {
							if(JSON.parse( main.storage.find( "Appointment", tmpSession.order[it] ) ).DisplayOrder > displayOrder) {
								tmpSession.order[it + 1] = tmpSession.order[it];
								tmpSession.order[it] = slotId;
								it = it - 1;
							} else {
								continueLoop = false;
							}
						} else {
							tmpSession.order[it + 1] = tmpSession.order[it];
							tmpSession.order[it] = slotId;
							it = it - 1;
						}
					}
				}
				main.storage.save( "Session", that.data.sessionId, JSON.stringify( tmpSession ) );
				var appointment = {};
				appointment.StartDateTime = that.data.startDateTime;
				appointment.EndDateTime = that.data.endDateTime;
				appointment.SlotId = slotId;
				appointment.DisplayOrder = displayOrder;
				appointment.Reason = that.data.reason;
				appointment.SlotTypeDescription = that.data.slotTypeDescription;
				appointment.SessionId = that.data.sessionId;
				var tmpApp = main.dataProvider.getAppointmentsByPatientId( main.controller.patient.id )[0];
				appointment.PatientId = tmpApp.PatientId;
				appointment.PatientName = tmpApp.PatientName;
				appointment.PatientNumber = tmpApp.PatientNumber;
				main.storage.save( "Appointment", response.Payload.bookingResponse.slotId, JSON.stringify( appointment ) );

			}
			unbindEvents( );
			_app.controller.resetSearchCriteria = true;
			main.controller.refreshPages[ "bookAppointments" ] = true; // refresh book appointments to refresh "Next appointment date"
			orientationChange();

			emis.mobile.Utilities.alert( {message: 'Appointment slot on ' + formatDate( that.data.startDateTime ) + ' was booked successfully.', backPage: $.mobile.activePage.selector, callback: function( r ) {
				if ( r === true ) {
					main.controller.showWarningsAnyway = true;
					setTimeout( function() {
						/*
						 * setTimeout because on iPad2 there was a bug that
						 * some area over the screen was not touchable after that changePage
						 * It's related to jAlert somehow
						 */
						$.mobile.changePage( "#patientsummary", {
							delay: true,
							dontUseScrollTop : true
						} );
					}, 0 );
				}
			} } );
		} else {
			emis.mobile.Utilities.alert( {message: response.Payload.bookingResponse.reasonText, title: 'Appointment was not booked.', backPage: $.mobile.activePage.selector} );
		}
	};

	this.refreshPatientList = function( ) {
		// to do: match the sessionId
	}

	this.releaseAppointment = function( slotId, lastUpdated ) {

		var reserveObj = new Object( );

		reserveObj.patientId = parseInt( main.controller.patient.id );
		reserveObj.slotId = main.controller.slotId;
		reserveObj.reserveSlotId = slotId;
		reserveObj.lastUpdated = lastUpdated
		reserveObj.action = "Release";

		var reserveAppointmentObj = new Object( );
		reserveAppointmentObj.reserve = reserveObj;

		var parametersObj = new Object( );
		parametersObj.sessionId = main.controller.SessionId;
		parametersObj.Payload = reserveAppointmentObj;
		lastReleaseAppointment = reserveAppointmentObj;
		lastCall = "release";

		that.reserveAppointmentsAPI = new emis.mobile.ReserveAppointmentAPI( );
		that.reserveAppointmentsAPI.delegate = that;
		that.reserveAppointmentsAPI.reserveAppointment( JSON.stringify( parametersObj ), main.controller.SessionId );
	};

	this.APIFailed = function( Error ) {
		if ( lastCall == "release" ) {
			var pageToChangeTo = "#bookAppointments";
			emis.mobile.Utilities.alert( {message: "Unable to release slot - It may be temporary blocked or connection to the server was lost.", title: "Error", backPage: pageToChangeTo} );
			unbindEvents( );
			$.mobile.changePage( pageToChangeTo, {
				delay: true
			} );
		} else if ( Error.description ) {
			emis.mobile.Utilities.alert( {message: Error.description, title: "Error", backPage: $.mobile.activePage.selector } );
		} else {
			emis.mobile.Utilities.alert( {message: "Operation could not be completed.\nPlease check your internet connection or try again later.", title: "Error", backPage: $.mobile.activePage.selector} );
		}
	};

	// this.bookAppointment = function(slotId, slotTypeId, reasonText, notes, sendSms, smsNumber) {
	this.bookAppointment = function( slotId, slotTypeId, reasonText, notes ) {
		bookAppointment = new Object( );
		bookAppointment.booking = new Object( );
		bookAppointment.booking.bookingSlotId = slotId;
		bookAppointment.booking.slotId = main.controller.slotId;
		bookAppointment.booking.sendSms = false;

		if ( slotTypeId ) {
			bookAppointment.booking.slotTypeId = slotTypeId;
		}
		// patient = JSON.parse(main.storage.find("Patient", main.controller.patient.id));
		bookAppointment.booking.patientId = parseInt( main.controller.patient.id );
		// patient.id;
		bookAppointment.booking.reasonText = reasonText;
		if ( notes )
			bookAppointment.booking.notes = notes;
		/*
		 * bookAppointment.booking.sendSms = sendSms; // check it if (sendSms) bookAppointment.booking.smsNumber =
		 * smsNumber;
		 */
		parametersObj = new Object( );
		parametersObj.sessionId = main.controller.SessionId;
		parametersObj.Payload = bookAppointment;
		lastBookAppointment = bookAppointment;
		lastCall = "book";

		emis.mobile.console.log( JSON.stringify( parametersObj ) );
		that.bookAppointmentsAPI = new emis.mobile.BookAppointmentAPI( );
		that.bookAppointmentsAPI.delegate = that;
		that.bookAppointmentsAPI.bookAppointment( JSON.stringify( parametersObj ) );
	};

	var formatDate = function( dt ) {
		var stdDate = _app.util.standardizeDate( dt );
		var dateToDay = _app.util.getDate( dt );
		var weekDay = _app.util.getWeekDayShort( dateToDay );
		var stdTime = _app.util.standardizeTime( dt );
		return weekDay + ' ' + stdDate + ' at ' + stdTime;
	};

	return this;
};
