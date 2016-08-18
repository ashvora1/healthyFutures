/**
 * BookAppointments form controller Functionalities provided: - book an appointment - find an available slot - select an
 * appointment reason - view next booked appointment -
 */

emis.mobile.form.BookAppointments = function( appObject ) {
	var that = this;
	var _app = appObject;
	var bindsDone = false;
	var buttonStatesDays = [ 1, 1, 1, 1, 1, 0, 0 ];
	var buttonStatesGender = [ 1, 1 ];
	var _bStaticElementsInitialised = false;
	this.slots = [];
	var currentDatasetForDetails = new Object();
	var reservingNow = false;
	// time of day fields
	var from;
	var to;
	var fromContainer;
	var toContainer;
	// slot date fields
	var searchFrom;
	var searchTo;
	var searchFromContainer;
	var searchToContainer;
	var parametersObj;
	var lastSlotId;
	var lastLastUpdate;
	var orientation;
	var selectFields;
	var schedulesList;

	function getSectionNoData( sectionTitle ) {
		return '<div class="header no-data">' + sectionTitle + '</div>';
	}

	function getHeader() {
		var markup = '<div class="header grid">';
		markup += '<div class="e-blocks">';
		markup += '<div class="grid-7 e-block-a">&nbsp;';
		markup += '</div><div class="grid-7 e-block-b">Date';
		markup += '</div><div class="grid-7 e-block-c">At';
		markup += '</div><div class="grid-7 e-block-d">Duration';
		markup += '</div><div class="grid-7 e-block-e">Session holder';
		markup += '</div><div class="grid-7 e-block-f">Session name';
		markup += '</div><div class="grid-7 e-block-g"></div>';
		markup += '</div></div>';

		return markup;
	}

	function pressButtonState( e ) {
		switch ( e.currentTarget.id ) {
		case "bookAppDayMonday":
			updateButtonStateDay( 0, e );
			break;
		case "bookAppDayTuesday":
			updateButtonStateDay( 1, e );
			break;
		case "bookAppDayWednesday":
			updateButtonStateDay( 2, e );
			break;
		case "bookAppDayThursday":
			updateButtonStateDay( 3, e );
			break;
		case "bookAppDayFriday":
			updateButtonStateDay( 4, e );
			break;
		case "bookAppDaySaturday":
			updateButtonStateDay( 5, e );
			break;
		case "bookAppDaySunday":
			updateButtonStateDay( 6, e );
			break;

		case "bookAppGenderMale":
			updateButtonStateGender( 0, e );
			break;
		case "bookAppGenderFemale":
			updateButtonStateGender( 1, e );
			break;
		}
		return false ;
	}

	function fillSelect( elementId, data ) {
		$( elementId ).html( "" );

		if ( !_app.util.isEmptyObject( data ) ) {
			var selectOptions = "";
			if ( data.length == 0 ) {
				selectOptions = "<option value='0' selected='selected'>No data to display</option>";
				$( elementId ).attr( "disabled", true );
				$( elementId ).html( selectOptions );
			} else {
				if ( elementId == '#searchCriteriaLocations' ) {
					selectOptions += '<option value="All">All locations</option>';
				} else if ( elementId == '#searchCriteriaSessionCategories' ) {
					selectOptions += '<option value="All">All session categories</option>';
				}

				var dataSorted = data.sort(
				// TODO can be optimized
				function( a, b ) {
					var aDisplay = a.object.DisplayName.toUpperCase();
					var bDisplay = b.object.DisplayName.toUpperCase();
					if ( aDisplay < bDisplay )
						return -1;
					if ( aDisplay > bDisplay )
						return 1;
					// a must be equal to b
					return 0;
				} );

				for ( var i = 0; i < dataSorted.length; i++ ) {
					selectOptions += '<option value="' + dataSorted[i].object.Id + '">'
							+ _.h(dataSorted[i].object.DisplayName) + '</option>';
				}
				$( elementId ).attr( "disabled", false );
				$( elementId ).html( selectOptions );
			}
		} else {
			var selectOptions = "<option value='0' selected='selected'>No data to display</option>";
			$( elementId ).attr( "disabled", true );
			$( elementId ).html( selectOptions );
		}
	}

	function fillSelectSlotTypes( elementId, data ) {
		$( elementId ).html( "" );

		if ( !_app.util.isEmptyObject( data ) ) {
			var selectOptions = "";
			if ( data.length == 0 ) {
				selectOptions = "<option selected='selected'>All slot types</option>";
				$( elementId ).attr( "disabled", true );
				$( elementId ).html( selectOptions );
			} else {
				selectOptions = "<option selected='selected' value='All'>All slot types</option>";

				var dataSorted = data.sort(
				// TODO can be optimized
				function( a, b ) {
					var aDisplay = a.object.DisplayName.toUpperCase();
					var bDisplay = b.object.DisplayName.toUpperCase();
					if ( aDisplay < bDisplay )
						return -1;
					if ( aDisplay > bDisplay )
						return 1;
					// a must be equal to b
					return 0;
				} );

				for ( var i = 0; i < dataSorted.length; i++ ) {
					selectOptions += '<option value="' + dataSorted[i].object.Id + '">'
							+ _.h(dataSorted[i].object.DisplayName) + '</option>';
				}
				$( elementId ).attr( "disabled", false );
				$( elementId ).html( selectOptions );
			}
		} else {
			var selectOptions = "<option value='NoData' selected='selected'>No data to display</option>";
			$( elementId ).attr( "disabled", true );
			$( elementId ).html( selectOptions );
		}
	}

	/**
	 * returns display name for based on id and its type
	 */
	function getDisplayName( data ) {
		var toDisplay = "";
		var ob = null;
		// depending on SessionHolderType choose the right name to display

		switch ( data.SessionHolderType ) {
		case "User":
			ob = _app.dataProvider.getOrganisationPeopleById( data.Id )
			if ( !_app.util.isEmptyObject( ob ) ) {
				toDisplay = ob.DisplayName;
			} else {
				emis.mobile.console.warn( "User id was not found in routine data." );
			}
			break;
		case "Location":
			ob = _app.dataProvider.getLocationsById( data.Id );
			if ( !_app.util.isEmptyObject( ob ) ) {
				toDisplay = ob.DisplayName;
			} else {
				emis.mobile.console.warn( "Location id was not found in routine data." );
			}
			break;
		case "List":
		case "Category":
			ob = _app.dataProvider.getSessionCategoriesById( data.Id );
			if ( !_app.util.isEmptyObject( ob ) ) {
				toDisplay = ob.DisplayName;
			} else {
				emis.mobile.console.warn( "List/category id was not found in routine data." );
			}
			break;
		}
		return toDisplay;
	}

	function fillSelectSessionHolder( elementId, data ) {
		$( elementId ).html( "" );

		if ( !_app.util.isEmptyObject( data ) ) {
			var selectOptions = '<option value="All Session Holders">All Session Holders</option>';
			var toDisplay = "";
			var dataSorted = data.sort(
			// TODO can be optimized
			function( a, b ) {
				var aDisplay = getDisplayName( a.object ).toUpperCase();
				var bDisplay = getDisplayName( b.object ).toUpperCase();
				if ( aDisplay < bDisplay )
					return -1;
				if ( aDisplay > bDisplay )
					return 1;
				// a must be equal to b
				return 0;
			} );

			for ( var i = 0; i < dataSorted.length; i++ ) {
				toDisplay = getDisplayName( dataSorted[i].object );
				selectOptions += '<option value="' + dataSorted[i].object.Id + '"';
				selectOptions += ' data-session-holder-type="' + dataSorted[i].object.SessionHolderType + '">'
						+ _.h(toDisplay) + '</option>';
			}
			$( elementId ).html( selectOptions );
		}
	}

	function fillSelectSessionHolderFilters( elementId, data ) {
		$( elementId ).html( "" );

		if ( !_app.util.isEmptyObject( data ) ) {
			var selectOptions = "<option value='0'>Default</option>";
			var dataSorted = data.sort(
			// TODO can be optimized
			function( a, b ) {
				var aDisplay = a.object.Description.toUpperCase();
				var bDisplay = b.object.Description.toUpperCase();
				if ( aDisplay < bDisplay )
					return -1;
				if ( aDisplay > bDisplay )
					return 1;
				// a must be equal to b
				return 0;
			} );

			for ( var i = 0; i < dataSorted.length; i++ ) {
				selectOptions += '<option value="' + dataSorted[i].object.Id + '">' + _.h(dataSorted[i].object.Description)
						+ '</option>';
			}
			$( elementId ).html( selectOptions );
		}
	}

	function filterChange() {
		// getvalue
		var id = $( "#searchCriteriaSessionHolderFilters").val();
		var data = _app.dataProvider.getSessionHolderFilters();

		if ( !_app.util.isEmptyObject( data ) ) {
			// default values for <select>'s
			if ( id == 0 || id == null ) {
				fillSelectSessionHolder( "#searchCriteriaSessionHolders", _app.dataProvider.getSessionHolders() );
			} else {
				for ( var i = 0; i < data.length; i++ ) {
					if ( data[i].object.Id == id ) {
						var selectOptions = "";
						sessionHolders = data[i].object.SessionHolders;

						var sessionHoldersSorted = sessionHolders.sort(
						// TODO can be optimized
						function( a, b ) {
							var aDisplay = getDisplayName( a ).toUpperCase();
							var bDisplay = getDisplayName( b ).toUpperCase();
							if ( aDisplay < bDisplay )
								return -1;
							if ( aDisplay > bDisplay )
								return 1;
							// a must be equal to b
							return 0;
						} );

						selectOptions += '<option value="' + id + '"';
						selectOptions += ' data-session-holder-type="Filter">';
						selectOptions += 'All</option>';

						for ( var j = 0; j < sessionHoldersSorted.length; j++ ) {
							selectOptions += '<option value="' + sessionHoldersSorted[j].Id + '"';
							selectOptions += ' data-session-holder-type="' + sessionHoldersSorted[j].SessionHolderType
									+ '">';
							selectOptions += _.h(getDisplayName( sessionHoldersSorted[j] )) + '</option>';
						}
						// break the for loop
						break;
					}
				}
				$( "#searchCriteriaSessionHolders").html( selectOptions );
			}
		}
	}

	function unvalidateFields() {
		fromContainer.removeClass( 'notValid' );
		toContainer.removeClass( 'notValid' );
		searchFromContainer.removeClass( 'notValid' );
		searchToContainer.removeClass( 'notValid' );
	}

	var _controlsQuery = '#searchCriteria :input, #searchCriteria .button, #searchSlotBtn' ;

	function enableSearch () {
		$(_controlsQuery).removeClass('ui-disabled') ;

	}

	function disableSearch () {
		$(_controlsQuery).addClass('ui-disabled') ;
	}

	function isEnabled () {
		return !$('#searchSlotBtn').hasClass('ui-disabled') ;
	}

	var showControl = function( ctrl ) {
		if ( ctrl.hasClass( 'hidden' ) ) {
			ctrl.removeClass( 'hidden' );
		}
	};

	var hideControl = function( ctrl ) {
		if ( !ctrl.hasClass( 'hidden' ) ) {
			ctrl.addClass( 'hidden' );
		}
	};

	var setFromToDates = function() {
		var today = new Date();
		$("#add-new-app-date-from").val(
				_app.util.getWeekDayShort( today ) + " " + _app.util.standardizeDate( today.toISOString() ) );
		today.setMonth( today.getMonth() + 3 );
		$("#add-new-app-date-to").val(
				_app.util.getWeekDayShort( today ) + " " + _app.util.standardizeDate( today.toISOString() ) );
	};

	var formatDate = function( dt ) {
		var stdDate = _app.util.standardizeDate( dt ),
			dateToDay = _app.util.getDate( dt ),
			weekDay = _app.util.getWeekDayShort( dateToDay ),
			stdTime = _app.util.standardizeTime( dt );
		return stdTime + ' ' + weekDay + ' ' + stdDate;
	}

	this.bindDataAndEvents = function( $page, refresh ) {
		reservingNow = false;


		// deselect drawer option
		$( "#drawer li" ).removeClass( "drawer-active" );

		updateOfflineElements();

		if ( _app.controller.resetSearchCriteria == true ) {
			resetControls();
			_app.controller.resetSearchCriteria = false;
			$( "#searchResultsOverContent").hide();
			$( "#searchResultsContentPanel").html( "" );
		}

		emis.mobile.UI.prepareBookAppointmentsPage( $page );

		if ( refresh === true ) {
			var markup = '<div data-role = "none"><label class="page-label" data-role = "none">Add new appointment</label>';
			var currentAppointments = main.dataProvider.getCurrentPatientAppointments();
			if ( currentAppointments ) {
				// currentAppointments are already sorted by StartDateTime
				var nextAppointment = null;
				for ( var i = 0; i < currentAppointments.length; i++ ) {
					if ( currentAppointments[i].SlotId == main.controller.slotId ) {
						nextAppointment = currentAppointments[i + 1];
						break;
					}
				}
				if ( nextAppointment ) {
					markup += '<label id="nextApptDate"><b>Next appointment:</b> ' + _.h( formatDate( nextAppointment.StartDateTime ) ) + '</label>';
				}
			}

			markup += '</div>';
			$("#bookAppointmentsHeaderPart").html( markup );

			initialiseStaticElements();
			schedulesList = $("#showSchedulesList");
			if(ENABLE_SCHEDULES == false) schedulesList.hide();
			searchFrom = $("#add-new-app-date-from");
			searchTo = $("#add-new-app-date-to");
			searchFromContainer = $("#searchFromContainer");
			searchToContainer = $("#searchToContainer");
			from = $("#fromTime");
			to = $("#toTime");
			fromContainer = $( '#fromTimeContainer div' );
			toContainer = $( '#toTimeContainer div' );

			setFromToDates();
			unvalidateFields();

			if ( bindsDone == false ) {
				$( "#bookAppDayMonday").on( "click", pressButtonState );
				$( "#bookAppDayTuesday").on( "click", pressButtonState );
				$( "#bookAppDayWednesday").on( "click", pressButtonState );
				$( "#bookAppDayThursday").on( "click", pressButtonState );
				$( "#bookAppDayFriday").on( "click", pressButtonState );
				$( "#bookAppDaySaturday").on( "click", pressButtonState );
				$( "#bookAppDaySunday").on( "click", pressButtonState );
				$( "#bookAppGenderMale").on( "click", pressButtonState );
				$( "#bookAppGenderFemale").on( "click", pressButtonState );

				$( "#searchCriteriaSessionHolderFilters").on( "change", filterChange );
				$( "#searchSlotBtn").bind( "click", searchAppointments );
				$( "#searchCriteriaTimeOfDay").on( 'change', timeOfDayFilterChange );

				$( '#add-new-app-date-from' ).on( 'datebox', function( event, payload ) {
					if ( payload.method === 'set' ) {
						if ( validateDateAfterToday( "from" ) == false ) {
							searchFromContainer.addClass( 'notValid' );
							emis.mobile.Utilities.alert( {message: "The date you are searching for cannot be in the past"} );
						} else if ( validateDateFromTo() == false ) {
							valid = false;
							searchFromContainer.addClass( 'notValid' );
							emis.mobile.Utilities.alert( {message: "Search From date cannot be after the Search To date"} );
						} else {
							searchFromContainer.removeClass( 'notValid' );
						}
						searchToContainer.removeClass( 'notValid' );
					} else if ( payload.method === 'open' ) {
						blockSelects();
					} else if ( payload.method === 'close' ) {
						unblockSelects();
					}
				} );

				$( '#add-new-app-date-to' ).on( 'datebox', function( event, payload ) {
					if ( payload.method === 'set' ) {
						if ( validateDateAfterToday( "to" ) == false ) {
							searchToContainer.addClass( 'notValid' );
							emis.mobile.Utilities.alert( {message: "The date you are searching for cannot be in the past"} );
						} else if ( validateDateFromTo() == false ) {
							valid = false;
							searchToContainer.addClass( 'notValid' );
							emis.mobile.Utilities.alert( {message: "Search From date cannot be after the Search To date"} );
						} else {
							searchToContainer.removeClass( 'notValid' );
						}
						searchFromContainer.removeClass( 'notValid' );
					} else if ( payload.method === 'open' ) {
						blockSelects();
					} else if ( payload.method === 'close' ) {
						unblockSelects();
					}
				} );

				$( '#fromTime' ).on( 'datebox', function( event, payload ) {
					if ( payload.method === 'set' ) {
						if ( validateTimeFromTo() == false ) {
							valid = false;
							fromContainer.addClass( 'notValid' );
							emis.mobile.Utilities.alert( {message: "The From time cannot be after the To time."} );
						} else {
							fromContainer.removeClass( 'notValid' );
						}
						toContainer.removeClass( 'notValid' );
					}
				} );

				$( '#toTime' ).on( 'datebox', function( event, payload ) {
					if ( payload.method === 'set' ) {
						if ( validateTimeFromTo() == false ) {
							valid = false;
							toContainer.addClass( 'notValid' );
							emis.mobile.Utilities.alert( {message: "The From time cannot be after the To time."} );
						} else {
							toContainer.removeClass( 'notValid' );
						}
						fromContainer.removeClass( 'notValid' );
					}
				} );

				schedulesList.on('click', openSchedulesList);

				bindsDone = true;
			}

			fillSelectSlotTypes( "#searchCriteriaSlotTypes", _app.dataProvider.getSlotTypes() );
			fillSelectSessionHolder( "#searchCriteriaSessionHolders", _app.dataProvider.getSessionHolders() );
			fillSelectSessionHolderFilters( "#searchCriteriaSessionHolderFilters", _app.dataProvider
					.getSessionHolderFilters() );

			fillSelect( "#searchCriteriaSessionCategories", _app.dataProvider.getSessionCategories() );
			fillSelect( "#searchCriteriaLocations", _app.dataProvider.getLocations() );

			// Inject the page title (info)
			var data = _app.dataProvider.getPatientDemographic();
			$( "#bookAppointmentHeader").html(
					emis.mobile.UI.getPrecisBar( data, _app.util.standardizeDate( data.birthDate ) ) );

			resetControls();


			selectFields = $( '#bookAppointments select' );
		} else {
			unvalidateFields();
		}

		if ( _app.util.isEmptyObject( _app.dataProvider.getScheduleObject()) ||
				_app.dataProvider.isCaseloadSlot( main.controller.slotId ) ) {
			schedulesList.addClass( 'ui-disabled' );
		} else {
			schedulesList.removeClass( 'ui-disabled' );
		}

		/* fix for #113291 and all similar problems in the future */
		$( "#drawer li" ).removeClass( "drawer-active" ).siblings( "#drawer-new-appointment" ).addClass(
				"drawer-active" );

		emis.mobile.UI.addOrientationEventsForDialog( orientationChange );
		orientationChange();

		emis.mobile.UI.tryBindShowHideToPage($page, orientationChange, unbindEvents);
		emis.mobile.UI.tryBind($page, 'pagehide', resettingControls);

		if ( main.controller.runNonSyncWSManager ) {
			main.controller.runNonSyncWSManager = false;
			nonSyncManager = new emis.mobile.NonSyncWSManager();
			nonSyncManager.delegate = this;
			if(CALL_OTK_INSTEAD) {
				nonSyncManager.verifyOTK();
			} else {
				nonSyncManager.authenticate();
			}
		}

		unblockSelects();
	};

	/**
	 * Sets boolean variable that is responsible for resetting controls in Book Appointments search criteria
	 */
	function resettingControls( e, data ) {
		var nextPageId = data.nextPage.attr( "id" );
		if ( nextPageId != "bookAppointmentsDetails"
			&& nextPageId != "OTKverification"
			&& nextPageId != "schedulesList"
			&& nextPageId != "editSchedule" ) {
			_app.controller.resetSearchCriteria = true;
		}
	}
	;

	function timeOfDayFilterChange( e ) {
		fromContainer.removeClass( 'notValid' );
		toContainer.removeClass( 'notValid' );
		var selected = e.target.value;
		var fromCtr = $("#fromTimeContainer");
		var span = $("#andContainer");
		var toCtr = $("#toTimeContainer");
		// clear values in controls
		$("#fromTime").val( "" );
		$("#toTime").val( "" );
		if ( selected == 'Any' || selected == 'AM Only' || selected == 'PM Only' ) {
			hideControl( fromCtr );
			hideControl( toCtr );
			hideControl( span );
			// hide both inputs
		} else if ( selected == 'After' ) {
			showControl( fromCtr );
			hideControl( toCtr );
			hideControl( span );
			// show first input
		} else if ( selected == 'Before' ) {
			showControl( fromCtr );
			hideControl( toCtr );
			hideControl( span );
			// show first input
		} else if ( selected == 'Between' ) {
			// show both inputs
			showControl( fromCtr );
			showControl( toCtr );
			showControl( span );
		}
	}

	function openSchedulesList() {
		if ( $( this ).hasClass( 'ui-disabled' ) ) {
			return false;
		}
		$.mobile.changePage( "#schedulesList" );
	}

	function validateTimeFromTo() {
		var time_from;
		var time_to;

		if ( $( "#searchCriteriaTimeOfDay").val() == 'Between' ) {
			if ( !emis.mobile.UI.isIE10 || emis.mobile.UI.isAtLeastIE11) {
				time_from = from.val();
				time_to = to.val();
			} else {
				time_from = from.val();
				time_to = to.val();
			}

			if ( time_from != '' && time_to != '' && time_from > time_to ) {
				return false;
			}
		}
		return true;
	}

	function validateDateFromTo() {
		var date_from;
		var date_to;
		if ( !emis.mobile.UI.isIE10 || emis.mobile.UI.isAtLeastIE11) {
			date_from = new Date( $( "#add-new-app-date-from" ).val() ).getTime();
			date_to = new Date( $( "#add-new-app-date-to" ).val() ).getTime();
		} else {
			date_from = new Date( $( "#add-new-app-date-from" ).val().split( "-" ).join( " " ) ).getTime();
			date_to = new Date( $( "#add-new-app-date-to" ).val().split( "-" ).join( " " ) ).getTime();
		}

		if ( date_from != '' && date_to != '' && date_from > date_to ) {
			return false;
		}
		return true;
	}

	/**
	 * Checks if Search from date in Search Criteria is valid
	 */
	function validateDateAfterToday( whichDate ) {

		var date_from;
		var date_to;
		if ( !emis.mobile.UI.isIE10 || emis.mobile.UI.isAtLeastIE11) {
			date_from = new Date( $( "#add-new-app-date-from" ).val() ).getTime();
			date_to = new Date( $( "#add-new-app-date-to" ).val() ).getTime();
		} else {
			date_from = new Date( $( "#add-new-app-date-from" ).val().split( "-" ).join( " " ) ).getTime();
			date_to = new Date( $( "#add-new-app-date-to" ).val().split( "-" ).join( " " ) ).getTime();
		}

		var date_today = new Date();
		// set here late date for proper comparison purpose
		date_today = new Date( date_today.setHours( 0 ) );
		date_today = new Date( date_today.setMinutes( 0 ) );
		date_today = new Date( date_today.setSeconds( 0 ) );
		date_today = new Date( date_today.setMilliseconds( 0 ) ).getTime();

		if ( whichDate == "from" ) {
			if ( date_from < date_today ) {
				return false;
			}
		} else {
			if ( date_to < date_today ) {
				return false;
			}
		}

		return true
	}

	this.getSession = function() {
		enableSearch();
		nonSyncManager = new emis.mobile.NonSyncWSManager();
		nonSyncManager.delegate = that;
		nonSyncManager.getSession();
	}

	function searchAppointments() {
		if ( main.controller.SessionId == "SESSION_ID_OFFLINE" ) {
			nonSyncManager = new emis.mobile.NonSyncWSManager();
			nonSyncManager.delegate = that;
			nonSyncManager.getSession();
			return false;
		}
		if (!isEnabled()) {
			return false;
		}
		$("#searchResults").html( "" );
		$( 'div#bookAppointments div#searchResultsOverContent .over-header' ).html( 'Search results (0)' );
		$( 'div#bookAppointments div#searchResultsOverContent .limited-result' ).hide();
		searchAppointment = new Object();
		searchAppointment.search = new Object();
		var startDt = getDate( "#add-new-app-date-from" );
		var dt = new Date();
		var today = dt.getFullYear() + '-' + (((dt.getMonth() + 1) < 10) ? "0" : "") + (dt.getMonth() + 1) + '-'
				+ ((dt.getDate() < 10) ? "0" : "") + dt.getDate();
		if ( startDt.split( 'T' )[0] == today ) {
			var time = ((dt.getHours() < 10) ? "0" : "") + dt.getHours() + ":" + ((dt.getMinutes() < 10) ? "0" : "")
					+ dt.getMinutes() + ":" + ((dt.getSeconds() < 10) ? "0" : "") + dt.getSeconds();
			searchAppointment.search.startDateTime = today + 'T' + time;
		} else {
			// "2012-07-01T00:00:00";
			searchAppointment.search.startDateTime = startDt;
		}

		var endDt = getDate( "#add-new-app-date-to" ).split( "T" )[0] + "T23:59:59";
		searchAppointment.search.endDateTime = endDt;
		searchAppointment.search.excludeDays = getExcludedDays();
		searchAppointment.search.timeOfDay = new Object();
		searchAppointment.search.timeOfDay.rangeType = $("#searchCriteriaTimeOfDay").val();
		var valid = true;
		unvalidateFields();

		if ( !searchFrom.val() ) {
			valid = false;
			if ( !searchFromContainer.hasClass( 'notValid' ) ) {
				searchFromContainer.addClass( 'notValid' );
			}
		}

		if ( !searchTo.val() ) {
			valid = false;
			if ( !searchToContainer.hasClass( 'notValid' ) ) {
				searchToContainer.addClass( 'notValid' );
			}
		}

		var date_from;
		var date_to;
		if ( !emis.mobile.UI.isIE10 || emis.mobile.UI.isAtLeastIE11) {
			date_from = new Date( $( "#add-new-app-date-from" ).val() ).getTime();
			date_to = new Date( $( "#add-new-app-date-to" ).val() ).getTime();
		} else {
			date_from = new Date( $( "#add-new-app-date-from" ).val().split( "-" ).join( " " ) ).getTime();
			date_to = new Date( $( "#add-new-app-date-to" ).val().split( "-" ).join( " " ) ).getTime();
		}

		if ( date_from > date_to ) {
			valid = false;
			searchFromContainer.addClass( 'notValid' );
			searchToContainer.addClass( 'notValid' );
			emis.mobile.Utilities.alert( {message: "Search From date cannot be after the Search To date" } );
			return;
		}

		var date_today = new Date();
		// set here late date for proper comparison purpose
		date_today = new Date( date_today.setHours( 0 ) );
		date_today = new Date( date_today.setMinutes( 0 ) );
		date_today = new Date( date_today.setSeconds( 0 ) );
		date_today = new Date( date_today.setMilliseconds( 0 ) ).getTime();

		if ( date_from < date_today ) {
			valid = false;
			searchFromContainer.addClass( 'notValid' );
			emis.mobile.Utilities.alert( {message: "The date you are searching for cannot be in the past"} );
			return;
		}

		switch ( searchAppointment.search.timeOfDay.rangeType ) {
		case 'After':
			if ( !from.val() ) {
				valid = false;
				if ( !fromContainer.hasClass( 'notValid' ) ) {
					fromContainer.addClass( 'notValid' );
				}
			}
			searchAppointment.search.timeOfDay.startTime = from.val();
			searchAppointment.search.timeOfDay.endTime = '';
			break;
		case 'Before':
			if ( !from.val() ) {
				valid = false;
				if ( !fromContainer.hasClass( 'notValid' ) ) {
					fromContainer.addClass( 'notValid' );
				}
			}
			searchAppointment.search.timeOfDay.startTime = from.val();
			searchAppointment.search.timeOfDay.endTime = '';
			break;
		case 'Between':
			if ( !from.val() ) {
				valid = false;
				if ( !fromContainer.hasClass( 'notValid' ) ) {
					fromContainer.addClass( 'notValid' );
				}
			}
			if ( !to.val() ) {
				valid = false;
				if ( !toContainer.hasClass( 'notValid' ) ) {
					toContainer.addClass( 'notValid' );
				}
			}
			if ( from.val() && to.val() ) {
				if ( from.val() >= to.val() ) {
					valid = false;
					fromContainer.addClass( 'notValid' );
					toContainer.addClass( 'notValid' );
				}
			}
			searchAppointment.search.timeOfDay.startTime = from.val();
			searchAppointment.search.timeOfDay.endTime = to.val();
			break;
		}

		if ( !valid ) {
			return;
		}

		var slotTypeValue = $("#searchCriteriaSlotTypes").val();
		if ( slotTypeValue && slotTypeValue != "All" ) {
			searchAppointment.search.slotTypeId = $("#searchCriteriaSlotTypes").val();
		}
		searchAppointment.search.sessionHolder = new Object();
		var sessionHolderValue = $("#searchCriteriaSessionHolders").val();
		if ( sessionHolderValue && sessionHolderValue != "All Session Holders" ) {
			searchAppointment.search.sessionHolder.id = sessionHolderValue;
			searchAppointment.search.sessionHolder.holderType = $( "#searchCriteriaSessionHolders" ).find( ":selected" )
					.data( "session-holder-type" );
		}

		searchAppointment.search.sessionHolder.gender = getGender();

		if ( $("#searchCriteriaSessionCategories").val() != "All" ) {
			// "4A0A57C6-D04C-436A-B245-7D4116478EA7";
			searchAppointment.search.sessionCategoryId = $("#searchCriteriaSessionCategories")
					.val();
		}
		var loc = $("#searchCriteriaLocations").val();
		if ( loc && loc != 'All' ) {
			// "AC017F5D-7CF8-446B-B3BF-470DC880A76C";
			searchAppointment.search.locationId = $("#searchCriteriaLocations").val();
		}
		disableSearch() ;
		parametersObj = new Object();
		parametersObj.sessionId = main.controller.SessionId;
		parametersObj.Payload = searchAppointment;
		that.searchAppointmentsAPI = new emis.mobile.SearchAppointmentsAPI();
		that.searchAppointmentsAPI.delegate = that;
		that.searchAppointmentsAPI.searchAppointments( JSON.stringify( parametersObj ), main.controller.SessionId );
		// resetControls();
	}

	function initialiseStaticElements() {
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

	function updateOfflineElements() {
		if ( !offline ) {
			$("#searchSlotBtn").removeClass( "ui-disabled" ).text( "Search" );
		} else {
			$("#searchSlotBtn").addClass( "ui-disabled" ).text( "Search (No connection)" );
			// Slot_AddNew
		}
	}

	function openDetailsDialog( slotId, lastUpdated ) {
		if ( reservingNow ) {
			// not sure whether some alert may be better - JI
			return;
		}
		reservingNow = true;
		window.scrolled = $( window ).scrollTop();
		lastSlotId = slotId;
		lastLastUpdated = lastUpdated;
		blockSelects();
		that.reserveAppointment( slotId, lastUpdated );
	}

	function getGender() {
		if ( buttonStatesGender[0] == 1 && buttonStatesGender[1] == 0 ) {
			return "Male";
		} else if ( buttonStatesGender[0] == 0 && buttonStatesGender[1] == 1 ) {
			return "Female";
		}
		return "Any";
	}

	function getExcludedDays() {
		var excludedDays = new Array();
		if ( buttonStatesDays[0] == 0 )
			excludedDays.push( "Monday" );
		if ( buttonStatesDays[1] == 0 )
			excludedDays.push( "Tuesday" );
		if ( buttonStatesDays[2] == 0 )
			excludedDays.push( "Wednesday" );
		if ( buttonStatesDays[3] == 0 )
			excludedDays.push( "Thursday" );
		if ( buttonStatesDays[4] == 0 )
			excludedDays.push( "Friday" );
		if ( buttonStatesDays[5] == 0 )
			excludedDays.push( "Saturday" );
		if ( buttonStatesDays[6] == 0 )
			excludedDays.push( "Sunday" );

		return excludedDays;
	}

	/*
	 * reset controls to default values
	 */
	var resetControls = function() {
		buttonStatesDays = [ 1, 1, 1, 1, 1, 0, 0 ];
		buttonStatesGender = [ 1, 1 ];
		$( "#bookAppDayMonday").addClass( 'activated' );
		$( "#bookAppDayTuesday").addClass( 'activated' );
		$( "#bookAppDayWednesday").addClass( 'activated' );
		$( "#bookAppDayThursday").addClass( 'activated' );
		$( "#bookAppDayFriday").addClass( 'activated' );
		$( "#bookAppDaySaturday").removeClass( 'activated' );
		$( "#bookAppDaySunday").removeClass( 'activated' );
		$( "#bookAppGenderMale").addClass( 'activated' );
		$( "#bookAppGenderFemale").addClass( 'activated' );
		$( "#searchCriteriaTimeOfDay").val( 'Any' );
		setFromToDates();

		$("#searchCriteriaSlotTypes").val( 'All' );
		// $(document.getElementById('searchCriteriaSessionHolders')).val('All Session Holders');
		$("#searchCriteriaSessionHolderFilters").val( '0' );
		filterChange(); // resets #searchCriteriaSessionHolders basing on value of #searchCriteriaSessionHolderFilters
		$( '#searchCriteriaSessionCategories option:first-child' ).attr( 'selected', true );
		$( '#searchCriteriaLocations option:first-child' ).attr( 'selected', true );
		hideControl( $("#fromTimeContainer") );
		hideControl( $( "#andContainer") );
		hideControl( $( "#toTimeContainer") );
	};

	var isLastPressedButton = function( dayNumber ) {
		var count = 0;
		for ( var i = 0; i < buttonStatesDays.length; ++i ) {
			if ( buttonStatesDays[i] == 1 && i != dayNumber )
				count++;
		}

		return (count == 0);
	};

	function updateButtonStateDay( dayNumber, e ) {
		if ( !isLastPressedButton( dayNumber ) ) {
			if ( $( e.target ).hasClass( "activated" ) ) {
				$( e.target ).removeClass( "activated" );
			} else {
				$( e.target ).addClass( "activated" );
			}
			if ( buttonStatesDays.length > dayNumber && dayNumber >= 0 ) {
				buttonStatesDays[dayNumber] = 1 - buttonStatesDays[dayNumber];
			} else {
				emis.console.log( "Out of the array size." );
			}
		}
	}

	function updateButtonStateGender( gender, e ) {
		if ( buttonStatesGender.length > gender && gender >= 0 ) {
			if ( $( e.target ).hasClass( "activated" ) ) {
				$( e.target ).removeClass( "activated" );
			} else {
				$( e.target ).addClass( "activated" );
			}
			buttonStatesGender[gender] = 1 - buttonStatesGender[gender];
		} else {
			emis.console.log( "Out of the array size." );
		}
	}

	function getDate( elementId ) {
		var value = $( elementId ).val();
		if ( value ) {
			value = _app.util.toISODate( value.substring( 4 ) );
		} else {
			value = '';
		}
		return value;
	}

	var unbindEvents = function() {
		emis.mobile.UI.removeOrientationEventsForDialog( orientationChange );
	};

	function orientationChange() {
		$( "#bookAppointment" ).css( {
			"min-height": 300
		// to redo jquery.mobile.1.1.1.js : 2881 min-height set
		} );

		// if iPad do the blur so there is no effect that select indicates
		// somewhere else than select field
		if ( emis.mobile.UI.isiPad ) {
			$( 'select' ).blur();
		}

		checkOrientation();
		setTimeout( function() {
			checkOrientation()
		}, 50 );
		setTimeout( function() {
			checkOrientation()
		}, 100 );
		setTimeout( function() {
			checkOrientation()
		}, 200 );
		setTimeout( function() {
			checkOrientation()
		}, 500 );
	}

	var checkOrientation = function() {
		if ( _app.controller.isLandscape ) {
			if ( orientation != 'landscape' )
				setOrientation( 'landscape', '300px', true );
		} else {
			if ( orientation != 'portrait' ) {
				var windowHeight = window.screen.width > window.screen.height ? window.screen.width
						: window.screen.height;
				windowHeight -= $( "#searchResultsOverContent" ).offset().top;
				if ( windowHeight > 320 ) {
					if ( emis.mobile.UI.isiPad )
						windowHeight -= 180;
					else
						windowHeight -= 220;
					setOrientation( 'portrait', windowHeight + 'px', false );
				} else {
					setOrientation( 'landscape', '300px', true );
					orientation = 'portrait';
				}
			}
		}
	}

	var setOrientation = function( newOrientation, windowHeight, isMaxHeight ) {
		orientation = newOrientation;

		if ( newOrientation == 'landscape' ) {
			$( '#bookAppointments .contentWrapper' ).removeClass( 'portrait' );
		} else {
			$( '#bookAppointments .contentWrapper' ).removeClass( 'landscape' );
		}
		$( '#bookAppointments .contentWrapper' ).addClass( newOrientation );
		$( "#searchResultsOverContent .content" ).css( {
			"max-height": "",
			"height": ""
		} );
		var heightProp = "height";
		if ( isMaxHeight ) {
			heightProp = "max-height";
		}
		$( "#searchResultsOverContent .content" ).css( heightProp, windowHeight );

		var fixingRecount = document.documentElement.offsetWidth;
		fixingRecount = document.documentElement.offsetHeight;
	}

	this.askForOTK = function() {
		unbindEvents();
		main.controller.lastNonSyncWSManagerDelegate = "#bookAppointments";
		$.mobile.changePage( "#OTKverification" );
	}

	this.askForAuth = function() {
		nonSyncManager = new emis.mobile.NonSyncWSManager( );
		nonSyncManager.delegate = this;
		nonSyncManager.authenticate();
	}

	this.nonSyncWSManagerSuccess = function( options ) {
		if ( options == "otk" || options == "auth") {
			that.reserveAppointment( lastSlotId, lastLastUpdated );
		} else {
			searchAppointments();
		}
	}

	this.ParseSearchAppointmentsResponse = function( response ) {
		enableSearch() ;
		sessions = response.Payload.sessions;
		$( "#searchResultsOverContent" ).show();

		$limitedResultContent = $( 'div#bookAppointments div#searchResultsOverContent .limited-result' );

		// _app.util.isEmptyObject(data)
		if ( sessions.length == 0 ) {
			$limitedResultContent.hide();
			var markup = getSectionNoData( "No results" );
			$( "#searchResultsContentPanel" ).html( markup );
			$( 'div#bookAppointments div#searchResultsOverContent .over-header' ).html( 'Search results (0)' );
		} else {
			var isLimitedResult = response.Payload.limitedResults;
			if ( isLimitedResult ) {
				$limitedResultContent.show();
			} else {
				$limitedResultContent.hide();
			}
			$( "#searchResultsContentPanel" ).html( getHeader() );
			$( "#searchResultsContentPanel" ).append( '<div class="content grid" id="searchResults"></div>' );
			// that.slots = [];

			// prepare new array which will be ordered
			var slotsOrdered = new Array();
			var sIdx = 0;
			for ( var i = 0; i < sessions.length; i++ ) {
				var info = new Object();
				info.description = sessions[i].description;
				info.id = sessions[i].id;
				info.sessionHolders = sessions[i].sessionHolders;

				for ( var s = 0; s < sessions[i].slots.length; s++ ) {

					slotsOrdered[sIdx] = new Object();
					slotsOrdered[sIdx].info = info;
					slotsOrdered[sIdx].slotInfo = sessions[i].slots[s];
					sIdx++;
				}
			}

			slotsOrdered.sort( function( a, b ) {
				var aData = a.slotInfo.startDateTime;
				var bData = b.slotInfo.startDateTime;
				if ( aData < bData )
					return -1;
				if ( aData > bData )
					return 1;

				var aHolder = a.info.sessionHolders;
				var bHolder = b.info.sessionHolders;
				if ( aHolder < bHolder )
					return -1;
				if ( aHolder > bHolder )
					return 1;
				// a must be equal to b
				return 0;
			} );

			for ( var s = 0; s < slotsOrdered.length; s++ ) {
				var slot = slotsOrdered[s].slotInfo;
				var stdDate = _app.util.standardizeDate( slot.startDateTime );
				var dateToDay = _app.util.getDate( slot.startDateTime );
				var weekDay = _app.util.getWeekDayShort( dateToDay );
				var stdTime = _app.util.standardizeTime( slot.startDateTime );
				var formattedDate = weekDay + ' ' + stdDate + ' at ' + stdTime;
				var markup = '<div class="e-blocks">';

				markup += '<div class="grid-7 e-block-a">';
				markup += slot.isUrgent ? '<img src="./images/apptUrgent.png" />' : '&nbsp;';
				markup += '</div>';

				markup += '<div class="grid-7 e-block-b">';
				markup += weekDay + " " + stdDate; // Date
				markup += '</div><div class="grid-7 e-block-c">';
				// At
				markup += stdTime;
				markup += '</div><div class="grid-7 e-block-d">';
				markup += _app.util.getDurationMinutes( slot.startDateTime, slot.endDateTime );
				markup += " mins";
				// Duration
				markup += '</div><div class="grid-7 e-block-e">';
				// holderName;//Session holder
				markup += _.h(slotsOrdered[s].info.sessionHolders);
				markup += '</div><div class="grid-7 e-block-f">';
				// Session name
				markup += slotsOrdered[s].info.description;
				markup += '</div><div class="grid-7 e-block-g">';
				// select button
				markup += '<a href="#" id="openBookAppointmentDetails" ';
				markup += 'data-em-book-slotId = "' + slot.id + '" ';
				markup += 'data-em-book-formattedStartDate="' + formattedDate + '" ';
				markup += 'data-em-book-holderName="' + _.h(slotsOrdered[s].info.sessionHolders) + '" ';
				markup += 'data-em-book-slotType="' + slot.slotTypeId + '" ';
				markup += 'data-em-book-locationName="' + slot.locationName + '" ';
				markup += 'data-em-book-sessionname="' + slotsOrdered[s].info.description + '" ';
				markup += 'data-em-book-sessionId="' + slotsOrdered[s].info.id + '" ';
				markup += 'data-em-book-lastUpdated="' + slot.lastUpdated + '" ';
				markup += 'data-em-book-startDateTime="' + slot.startDateTime + '" ';
				markup += 'data-em-book-endDateTime="' + slot.endDateTime + '" ';
				markup += 'data-role="none" class="button select">Select</a>';
				markup += '</div></div>';

				$( "#searchResults" ).append( markup );
			}

			$limitedResultContent.html( "There are more than " + slotsOrdered.length
					+ " results available. You may want to narrow your search." );
			$( 'div#bookAppointments div#searchResultsOverContent .over-header' ).html(
					'Search results (' + slotsOrdered.length + ')' );
			$( '.button.select' ).on( 'click', function( e ) {
				currentDatasetForDetails.emBookSlotid = $( this ).data( 'em-book-slotid' );
				currentDatasetForDetails.emBookHoldername = $( this ).data( 'em-book-holdername' );
				currentDatasetForDetails.emBookFormattedstartdate = $( this ).data( 'em-book-formattedstartdate' );
				currentDatasetForDetails.emBookLocationname = $( this ).data( 'em-book-locationname' );
				currentDatasetForDetails.emBookSlottype = $( this ).data( 'em-book-slottype' );
				currentDatasetForDetails.emBookSessionid = $( this ).data( 'em-book-sessionid' );
				currentDatasetForDetails.emBookSessionname = $( this ).data( 'em-book-sessionname' );
				currentDatasetForDetails.emBookLastUpdated = $( this ).data( 'em-book-lastupdated' );
				currentDatasetForDetails.emBookStartDateTime = $( this ).data( 'em-book-startdatetime' );
				currentDatasetForDetails.emBookEndDateTime = $( this ).data( 'em-book-enddatetime' );
				openDetailsDialog( currentDatasetForDetails.emBookSlotid, currentDatasetForDetails.emBookLastUpdated );
			} );

			if ( !(emis.mobile.UI.isAndroid && emis.mobile.UI.isNative) && !emis.mobile.UI.isiPad ) {
				var searchListScrollStartPos = 0;
				$( "#searchResultsOverContent .content" ).on( 'touchstart', function( e ) {
					searchListScrollStartPos = this.scrollTop + e.originalEvent.touches[0].pageY;
				} );
				$( "#searchResultsOverContent .content" ).on( 'touchmove', function( e ) {
					if ( this.scrollHeight > $( this ).height() ) {
						this.scrollTop = searchListScrollStartPos - e.originalEvent.touches[0].pageY;
						e.preventDefault();
					}
				} );
			}
		}

		var isFirstAnimate = true;

		orientation = '';
		checkOrientation();
		var scrollToY = $( "#searchResultsOverContent" ).offset().top - 80;
		if ( emis.mobile.UI.isiPad ) {
			window.scrollTo(0, scrollToY);
		} else {
			$( 'html, body' ).animate( {
				scrollTop: scrollToY
			}, 'slow' );
		}
	};

	this.ParseReserveAppointmentResponse = function( response ) {
		if ( response.Payload.reserveResponse.action.success == "true"
				|| response.Payload.reserveResponse.action.success == true ) {
			fctrs = _app.controller.getFormControllerStruct( '#bookAppointmentsDetails' );
			fctrs.controller.data.slotId = currentDatasetForDetails.emBookSlotid;
			fctrs.controller.data.holder = currentDatasetForDetails.emBookHoldername;
			fctrs.controller.data.startDate = currentDatasetForDetails.emBookStartdate;
			fctrs.controller.data.location = currentDatasetForDetails.emBookLocationname;
			fctrs.controller.data.slotType = currentDatasetForDetails.emBookSlottype;
			fctrs.controller.data.sessionId = currentDatasetForDetails.emBookSessionid;
			fctrs.controller.data.sessiondescription = currentDatasetForDetails.emBookSessionname;
			fctrs.controller.data.lastUpdated = currentDatasetForDetails.emBookLastUpdated;
			fctrs.controller.data.startDateTime = currentDatasetForDetails.emBookStartDateTime;
			fctrs.controller.data.endDateTime = currentDatasetForDetails.emBookEndDateTime;
			fctrs.controller.data.formattedStartDate = currentDatasetForDetails.emBookFormattedstartdate;
			// perhaps should be move to details? - JI
			reservingNow = false;
			$.mobile.changePage( "#bookAppointmentsDetails", {
				delay: true
			} );
		} else {
			reservingNow = false;
			var reasonText;
			if ( response && response.Payload && response.Payload.reserveResponse
					&& response.Payload.reserveResponse.action ) {
				reasonText = response.Payload.reserveResponse.action.reasonText;
			}

			if ( reasonText ) {
				emis.mobile.Utilities.alert( {message: reasonText + ".\nPlease refresh the list by clicking search button.", title: "Error", callback: function() {
					unblockSelects();
				} } );
			} else {
				emis.mobile.Utilities.alert( {message: "This slot is unavailable.\nPlease refresh the list by clicking search button.", title: "Error",
						callback: function() {
							unblockSelects();
						} } );
			}
		}
	};

	this.reserveAppointment = function( slotId, lastUpdated ) {

		var reserveObj = new Object();

		reserveObj.patientId = parseInt( main.controller.patient.id );
		reserveObj.slotId = main.controller.slotId;
		reserveObj.reserveSlotId = slotId;
		reserveObj.lastUpdated = lastUpdated
		reserveObj.action = "Reserve";

		var reserveAppointmentObj = new Object();
		reserveAppointmentObj.reserve = reserveObj;

		var parametersObj = new Object();
		parametersObj.sessionId = main.controller.SessionId;
		parametersObj.Payload = reserveAppointmentObj;

		that.reserveAppointmentsAPI = new emis.mobile.ReserveAppointmentAPI();
		that.reserveAppointmentsAPI.delegate = that;
		that.reserveAppointmentsAPI.reserveAppointment( JSON.stringify( parametersObj ), main.controller.SessionId );
	};

	this.APIFailed = function( Error ) {
		enableSearch() ;
		reservingNow = false;

		if ( Error.description ) {
			emis.mobile.Utilities.alert( {message: Error.description, title: "Error", callback: function() {
				unblockSelects()
			} } );
		} else {
			emis.mobile.Utilities.alert( {message: "Operation could not be completed.\nPlease check your internet connection or try again later.",
					title: "Error", callback: function() {
						unblockSelects();
					} } );
		}
	};

	var blockSelects = function() {
		if ( emis.mobile.UI.isAndroid )
			selectFields.attr( 'disabled', 'disabled' );
	}

	var unblockSelects = function() {
		if ( emis.mobile.UI.isAndroid )
			selectFields.removeAttr( 'disabled' );
	}

	return this;
};
