
emis.mobile.form.EditScheduleTemplate = function( appObject ) {
	var _app = appObject;
	var that = this;
	var pageId = '#editScheduleTemplate';
	var page;
	var initialTotalOccurrencesVal = 1;
	var initialDailyInputVal = 2;
	var initialAppointmentsPerDayVal = 1;
	var lastTotalOccurrencesVal = initialTotalOccurrencesVal;
	var lastDailyInputVal = initialDailyInputVal;
	var bBlockedSchedule = false;

	var headerTitle, closeDialogBtn, saveScheduleTemplate,
		selectPattern,
		recurrenceBlocks, frequencyAndRangeBlock,
		dailySwitch, dailyInput, dailyInputWrapper,
		weeklyInput, weeklyDayWrapper,
		monthlySwitch,
		monthlyDayPatternSelect, monthlyDayTypeSelect, monthlyDayMonthInput,
		monthlyDateDayInput, monthlyDateMonthInput,
		quarterlyDayPatternSelect, quarterlyDayTypeSelect, quarterlyMonthTypeSelect,
		yearlyDayInput, yearlyMonthSelect,
		appointmentsPerDayInputWrapper, appointmentsPerDayInput, endDateSwitch, totalOccurrencesInput, totalOccurrencesInputWrapper;

	this.data = {};

	var monthDays = {
		"January" : 31,
		"February" : 29,
		"March" : 31,
		"April" : 30,
		"May" : 31,
		"June" : 30,
		"July" : 31,
		"August" : 31,
		"September" : 30,
		"October" : 31,
		"November" : 30,
		"December" : 31
	};

	var unbindEvents = function( ) {
		emis.mobile.UI.removeOrientationEventsForDialog( orientationChange );
		$( "#bookAppointments, #editSchedule" ).removeClass( 'backround-page-for-multiple-dialogs' );
		$( "#editSchedule" ).removeClass( 'no-background' );
		$( pageId ).removeClass( 'top-dialog' );
		$( "#bookAppointments" ).css( {
			"overflow": "visible",
			"max-height": "none"
		} );
	}
	var pageShow = function( ) {
		orientationChange( );
	}
	var orientationChange = function( ) {
		$( "#bookAppointments, #editSchedule" ).addClass( 'backround-page-for-multiple-dialogs' );
		$( "#editSchedule" ).addClass( 'no-background' );
		$( pageId ).addClass( 'top-dialog' );

		page.css( {
			"padding-bottom": "",
			"height": ""
		});

		var newHeight = emis.mobile.UI.calculateDialogPadding( _app, page );
		$( "#bookAppointments" ).css( {
			"min-height": newHeight,
			"max-height": newHeight,
			"overflow": "hidden"
		} );

		var higherPage = '#bookAppointments';
		var higherHeight = $( "#bookAppointments" ).height() +
									$( "#bookAppointments .ui-header" ).height( ) +
									$( "#bookAppointments .patientSummaryInfo" ).height( );
		if ( $( '#editSchedule' ).height() > higherHeight ) {
			higherPage = '#editSchedule';
			higherHeight = $( higherPage ).height();
		}
		page.css( "height", higherHeight );

		emis.mobile.UI.setDialogHeight( page, higherPage );
	}

	// register global page events
	$( document ).delegate( pageId, "pageinit", function() {
		page = $( this );
		page.on( 'pagehide', unbindEvents );
		page.on( 'pageshow', pageShow );

		headerTitle = page.find( '[data-container="header-title"]' );
		closeDialogBtn = $( '#edit-schedule-template-close' );
		saveScheduleTemplate = $( '#edit-schedule-template-submit' );

		selectPattern = $( '#edit-schedule-template-recurrence' );
		recurrenceBlocks = page.find( '.recurrence' );
		frequencyAndRangeBlock = $( '#edit-schedule-template-frequency-and-range-block' );

		dailySwitch = $( '#edit-schedule-template-daily-switch' );
		dailyInputWrapper = $( '#edit-schedule-template-daily-day-wrapper' );
		dailyInput = dailyInputWrapper.find( 'input' );

		weeklyInput = $( '#edit-schedule-template-weekly-week' );
		weeklyDayWrapper = $( '#edit-schedule-template-weekly-day' );

		monthlySwitch = $( '#edit-schedule-template-monthly-switch' );
		monthlyDayPatternSelect = $( '#edit-schedule-template-monthly-day-pattern' );
		monthlyDayTypeSelect = $( '#edit-schedule-template-monthly-day-type' );
		monthlyDayMonthInput = $( '#edit-schedule-template-monthly-day-month' );
		monthlyDateDayInput = $( '#edit-schedule-template-monthly-date-day' );
		monthlyDateMonthInput = $( '#edit-schedule-template-monthly-date-month' );

		quarterlyDayPatternSelect = $( '#edit-schedule-template-quarterly-day-pattern' );
		quarterlyDayTypeSelect = $( '#edit-schedule-template-quarterly-day-type' );
		quarterlyMonthTypeSelect = $( '#edit-schedule-template-quarterly-month-type' );

		yearlyDayInput = $( '#edit-schedule-template-yearly-day-type' );
		yearlyMonthSelect = $( '#edit-schedule-template-yearly-month-type' );

		appointmentsPerDayInputWrapper = $( '#edit-schedule-template-appointments-number-wrapper' );
		appointmentsPerDayInput = appointmentsPerDayInputWrapper.find( 'input' );
		endDateSwitch = $( '#edit-schedule-template-end-date-switch' );
		totalOccurrencesInputWrapper = $( '#edit-schedule-template-total-occurrences-wrapper' );
		totalOccurrencesInput = totalOccurrencesInputWrapper.find( 'input' );

		selectPattern.on( 'change', function( e ) {
			var val = selectPattern.find( 'option:selected' ).val().toLowerCase();
			if ( val == "none" ) {
				blockFrequencyAndRangeBlock( true );
			} else {
				blockFrequencyAndRangeBlock( false );
			}
			recurrenceBlocks.hide();
			recurrenceBlocks.siblings( '[data-recurrence="' + val + '"]' ).show();
		});

		dailySwitch.find( 'div' ).on( 'click', function( e ) {
			var el = $( this );
			if ( el.hasClass( 'ui-disabled' ) ) {
				return false;
			}
			dailySwitch.find( 'div' ).not( el ).removeClass( 'ui-radio-on ui-btn-active' ).addClass( 'ui-radio-off' );
			el.removeClass( 'ui-radio-off' ).addClass( 'ui-radio-on ui-btn-active' );

			if ( el.data( 'type' ) == 'on' ) {
				dailyInputWrapper.find( 'span' ).addClass( 'ui-disabled' );
				dailyInput.attr( "disabled", "disabled" );
				dailyInput.val( '' );
			} else {
				dailyInputWrapper.find( 'span' ).removeClass( 'ui-disabled' );
				dailyInput.removeAttr( "disabled" );
				dailyInput.val( lastDailyInputVal );
			}
		} );

		weeklyDayWrapper.find( 'a' ).on( 'click', function( e ) {
			var el = $( this );
			if ( el.hasClass( 'ui-disabled' ) ) {
				return false;
			}
			if ( el.hasClass( 'activated' ) ) {
				el.removeClass( 'activated' );
			} else {
				el.addClass( 'activated' );
			}
		} );

		monthlySwitch.find( 'div' ).on( 'click', function( e ) {
			var el = $( this );
			if ( el.hasClass( 'ui-disabled' ) ) {
				return false;
			}
			monthlySwitch.find( 'div' ).not( el ).removeClass( 'ui-radio-on ui-btn-active' ).addClass( 'ui-radio-off' );
			el.removeClass( 'ui-radio-off' ).addClass( 'ui-radio-on ui-btn-active' );

			var monthlyBlock = recurrenceBlocks.siblings( '[data-recurrence="monthly"]' );
			if ( el.data( 'type' ) == 'day' ) {
				monthlyBlock.find( '[data-monthly-type="date"]' ).hide();
				monthlyBlock.find( '[data-monthly-type="day"]' ).show();
			} else {
				monthlyBlock.find( '[data-monthly-type="day"]' ).hide();
				monthlyBlock.find( '[data-monthly-type="date"]' ).show();
			}
		} );

		endDateSwitch.find( 'div' ).on( 'click', function( e ) {
			var el = $( this );
			if ( el.hasClass( 'ui-disabled' ) ) {
				return false;
			}
			endDateSwitch.find( 'div' ).not( el ).removeClass( 'ui-radio-on ui-btn-active' ).addClass( 'ui-radio-off' );
			el.removeClass( 'ui-radio-off' ).addClass( 'ui-radio-on ui-btn-active' );

			if ( el.data( 'type' ) == 'on' ) {
				totalOccurrencesInputWrapper.find( 'span' ).addClass( 'ui-disabled' );
				totalOccurrencesInput.attr( "disabled", "disabled" );
				totalOccurrencesInput.val( '' );
			} else {
				totalOccurrencesInputWrapper.find( 'span' ).removeClass( 'ui-disabled' );
				totalOccurrencesInput.removeAttr( "disabled" );
				totalOccurrencesInput.val( lastTotalOccurrencesVal );
			}
		} );

		saveScheduleTemplate.on( 'click', function( e ) {
			if ( $( this ).hasClass( 'ui-disabled' ) ) {
				return false;
			}
			var valid = validateFields();
			if ( valid ) {
				var definition = {};
				definition.recurrencePattern = that.data.definition;
				var fctrs = _app.controller.getFormControllerStruct( '#editSchedule' );
				fctrs.controller.data.definition = definition;
				fctrs.controller.selectScheduleTemplate.find( 'option[value="custom"]' ).text(
					main.dataProvider.getDescriptionStringForSchedule( definition.recurrencePattern ) );

				emis.mobile.console.log( "saved schedule template object: " + JSON.stringify( definition ) );

				that.data = {};
				unbindEvents( );
				$.mobile.changePage( "#bookAppointments" );
				setTimeout(function() {
					$.mobile.changePage( '#editSchedule' );
				}, 1000);
			}
		} );

		closeDialogBtn.on( 'click', function( e ) {
			that.data = {};
			unbindEvents( );
			$.mobile.changePage( "#bookAppointments" );
			setTimeout(function() {
				$.mobile.changePage( '#editSchedule' );
			}, 1000);
		} );
	});

	function blockFrequencyAndRangeBlock( bBlock ) {
		if ( bBlock ) {
			appointmentsPerDayInputWrapper.find( 'span' ).addClass( 'ui-disabled' );
			appointmentsPerDayInput.attr( 'disabled', 'disabled' );
			endDateSwitch.prev().addClass( 'ui-disabled' );
			endDateSwitch.find( 'div' ).addClass( 'ui-disabled' );
			totalOccurrencesInputWrapper.find( 'span' ).addClass( 'ui-disabled' );
			totalOccurrencesInput.attr( "disabled", "disabled" );
		} else {
			appointmentsPerDayInputWrapper.find( 'span' ).removeClass( 'ui-disabled' );
			appointmentsPerDayInput.removeAttr( 'disabled' );
			endDateSwitch.prev().removeClass( 'ui-disabled' );
			endDateSwitch.find( 'div' ).removeClass( 'ui-disabled' );
			if ( endDateSwitch.find( 'div.ui-radio-on' ).data( "type" ) == "on" ) {
				totalOccurrencesInputWrapper.find( 'span' ).addClass( 'ui-disabled' );
				totalOccurrencesInput.attr( "disabled", "disabled" );
			} else {
				totalOccurrencesInputWrapper.find( 'span' ).removeClass( 'ui-disabled' );
				totalOccurrencesInput.removeAttr( "disabled" );
			}
		}
	};

	function reloadFields() {
		unvalidateFields();

		var editedPattern;
		var addScheduleText = 'Add custom schedule template';
		var editScheduleText = 'Edit custom schedule template';
		bBlockedSchedule = false;
		if ( that.data.scheduleId ) {
			bBlockedSchedule = _app.dataProvider.isScheduleNotSynchronised( that.data.scheduleId );
		}
		if ( that.data.definition ) {
			headerTitle.html( editScheduleText );
			saveScheduleTemplate.html( editScheduleText );
			editedPattern = that.data.definition.recurrencePattern;
		} else if ( that.data.scheduleId ) {
			headerTitle.html( addScheduleText );
			saveScheduleTemplate.html( addScheduleText );
			var schedule = _app.dataProvider.getSchedule( that.data.scheduleId );
			editedPattern = schedule.data.recurrencePattern;
			if ( ! editedPattern && schedule.data.definition ) {
				editedPattern = schedule.data.definition.recurrencePattern;
			}
			if ( editedPattern ) {
				headerTitle.html( editScheduleText );
				saveScheduleTemplate.html( editScheduleText );
			}
		} else {
			headerTitle.html( addScheduleText );
			saveScheduleTemplate.html( addScheduleText );
		}
		if ( bBlockedSchedule ) {
			saveScheduleTemplate.addClass( 'ui-disabled' );
		} else {
			saveScheduleTemplate.removeClass( 'ui-disabled' );
		}

		recurrenceBlocks.hide();
		var editedPatternType = null;
		if ( editedPattern && ! editedPattern.None ) {
			var recurrenceBlock = "";
			if ( editedPattern.Daily ) {
				editedPatternType = editedPattern.Daily;
				recurrenceBlock = "daily";
			} else if ( editedPattern.Weekly ) {
				editedPatternType = editedPattern.Weekly;
				recurrenceBlock = "weekly";
			} else if ( editedPattern.Monthly ) {
				editedPatternType = editedPattern.Monthly;
				recurrenceBlock = "monthly";
			} else if ( editedPattern.Quarterly ) {
				editedPatternType = editedPattern.Quarterly;
				recurrenceBlock = "quarterly";
			} else if ( editedPattern.Yearly ) {
				editedPatternType = editedPattern.Yearly;
				recurrenceBlock = "yearly";
			}
			blockFrequencyAndRangeBlock( false );
			selectPattern.val( emis.mobile.Utilities.capitaliseFirstLetter( recurrenceBlock ) );
			recurrenceBlocks.siblings( '[data-recurrence="' + recurrenceBlock + '"]' ).show();
		} else {
			blockFrequencyAndRangeBlock( true );
			selectPattern.val( 'None' );
		}

		if ( bBlockedSchedule ) {
			selectPattern.attr( 'disabled', 'disabled' );
		} else {
			selectPattern.removeAttr( 'disabled' );
		}

		dailySwitch.find( 'div' ).removeClass( 'ui-radio-on ui-btn-active' ).addClass( 'ui-radio-off' );
		dailySwitch.find( '[data-type="on"]' ).removeClass( 'ui-radio-off' ).addClass( 'ui-radio-on ui-btn-active' );
		dailyInputWrapper.find( 'span' ).addClass( 'ui-disabled' );
		dailyInput.attr( "disabled", "disabled" );
		dailyInput.val( '' );
		if ( editedPattern && editedPattern.Daily ) {
			lastDailyInputVal = editedPattern.Daily.Pattern.DayPattern;
			if ( lastDailyInputVal ) {
				dailySwitch.find( '[data-type="on"]' ).removeClass( 'ui-radio-on ui-btn-active' ).addClass( 'ui-radio-off' );
				dailySwitch.find( '[data-type="off"]' ).removeClass( 'ui-radio-off' ).addClass( 'ui-radio-on ui-btn-active' );
				dailyInputWrapper.find( 'span' ).removeClass( 'ui-disabled' );
				dailyInput.removeAttr( "disabled" );
				dailyInput.val( lastDailyInputVal );
			} else {
				lastDailyInputVal = initialDailyInputVal;
			}
		}
		if ( bBlockedSchedule ) {
			dailySwitch.find( 'div' ).addClass( 'ui-disabled' );
			dailyInput.attr( "disabled", "disabled" );
		} else {
			dailySwitch.find( 'div' ).removeClass( 'ui-disabled' );
		}

		weeklyInput.val( '1' );
		if ( editedPattern && editedPattern.Weekly ) {
			weeklyDayWrapper.find( 'a' ).removeClass( 'activated' );
			weeklyInput.val( editedPattern.Weekly.Pattern.Count );
			var dayBitFlag = editedPattern.Weekly.Pattern.Days;
			dayBitFlag = dayBitFlag.toString( 2 );
			if ( dayBitFlag.length < 7 ) {
				var howManyZerosNeeded = 7 - dayBitFlag.length;
				for ( var i = 0; i < howManyZerosNeeded; i++ ) {
					dayBitFlag = '0' + dayBitFlag;
				}
			}
			var daysTab = dayBitFlag.split('').reverse();
			for ( var i = 0; i < daysTab.length; i++ ) {
				if ( daysTab[i] === "0" ) {
					continue;
				}
				var day = "";
				if ( i == 0 ) {
					day = "sunday";
				} else if ( i == 1 ) {
					day = "monday";
				} else if ( i == 2 ) {
					day = "tuesday";
				} else if ( i == 3 ) {
					day = "wednesday";
				} else if ( i == 4 ) {
					day = "thursday";
				} else if ( i == 5 ) {
					day = "friday";
				} else if ( i == 6 ) {
					day = "saturday";
				}
				weeklyDayWrapper.find( '[data-day="' + day + '"]' ).addClass( 'activated' );
			}
		}
		if ( bBlockedSchedule ) {
			weeklyInput.attr( "disabled", "disabled" );
			weeklyDayWrapper.find( 'a' ).addClass( 'ui-disabled' );
		} else {
			weeklyInput.removeAttr( "disabled" );
			weeklyDayWrapper.find( 'a' ).removeClass( 'ui-disabled' );
		}

		monthlySwitch.find( 'div' ).removeClass( 'ui-radio-on ui-btn-active' ).addClass( 'ui-radio-off' );
		monthlySwitch.find( '[data-type="day"]' ).removeClass( 'ui-radio-off' ).addClass( 'ui-radio-on ui-btn-active' );
		var monthlyBlock = recurrenceBlocks.siblings( '[data-recurrence="monthly"]' );
		monthlyBlock.find( '[data-monthly-type="date"]' ).hide();
		monthlyBlock.find( '[data-monthly-type="day"]' ).show();
		monthlyDayPatternSelect.val( 'First' );
		monthlyDayTypeSelect.val( 'Day' );
		monthlyDayMonthInput.val( 1 );
		monthlyDateDayInput.val( 1 );
		monthlyDateMonthInput.val( 1 );
		if ( editedPattern && editedPattern.Monthly ) {
			var monthlyPatternType = editedPattern.Monthly.Pattern.PatternSelect;
			if ( monthlyPatternType ) {
				monthlyDayPatternSelect.val( monthlyPatternType.DayPattern );
				monthlyDayTypeSelect.val( monthlyPatternType.DayType );
				monthlyDayMonthInput.val( monthlyPatternType.MonthCount );
			} else {
				monthlyPatternType = editedPattern.Monthly.Pattern.PatternCount;
				monthlySwitch.find( '[data-type="day"]' ).removeClass( 'ui-radio-on ui-btn-active' ).addClass( 'ui-radio-off' );
				monthlySwitch.find( '[data-type="date"]' ).removeClass( 'ui-radio-off' ).addClass( 'ui-radio-on ui-btn-active' );
				monthlyBlock.find( '[data-monthly-type="day"]' ).hide();
				monthlyBlock.find( '[data-monthly-type="date"]' ).show();
				monthlyDateDayInput.val( monthlyPatternType.DayCount );
				monthlyDateMonthInput.val( monthlyPatternType.MonthCount );
			}
		}
		if ( bBlockedSchedule ) {
			monthlySwitch.find( 'div' ).addClass( 'ui-disabled' );
			monthlyDayPatternSelect.attr( 'disabled', 'disabled' );
			monthlyDayTypeSelect.attr( 'disabled', 'disabled' );
			monthlyDayMonthInput.attr( 'disabled', 'disabled' );
			monthlyDateDayInput.attr( 'disabled', 'disabled' );
			monthlyDateMonthInput.attr( 'disabled', 'disabled' );
		} else {
			monthlySwitch.find( 'div' ).removeClass( 'ui-disabled' );
			monthlyDayPatternSelect.removeAttr( 'disabled' );
			monthlyDayTypeSelect.removeAttr( 'disabled' );
			monthlyDayMonthInput.removeAttr( 'disabled' );
			monthlyDateDayInput.removeAttr( 'disabled' );
			monthlyDateMonthInput.removeAttr( 'disabled' );
		}

		quarterlyDayPatternSelect.val( 'First' );
		quarterlyDayTypeSelect.val( 'Monday' );
		quarterlyMonthTypeSelect.val( 'First' );
		if ( editedPattern && editedPattern.Quarterly ) {
			var quaterlyPattern = editedPattern.Quarterly.Pattern;
			quarterlyDayPatternSelect.val( quaterlyPattern.DayPattern );
			quarterlyDayTypeSelect.val( quaterlyPattern.DayType );
			quarterlyMonthTypeSelect.val( quaterlyPattern.MonthInQuarter );
		}
		if ( bBlockedSchedule ) {
			quarterlyDayPatternSelect.attr( 'disabled', 'disabled' );
			quarterlyDayTypeSelect.attr( 'disabled', 'disabled' );
			quarterlyMonthTypeSelect.attr( 'disabled', 'disabled' );
		} else {
			quarterlyDayPatternSelect.removeAttr( 'disabled' );
			quarterlyDayTypeSelect.removeAttr( 'disabled' );
			quarterlyMonthTypeSelect.removeAttr( 'disabled' );
		}

		yearlyDayInput.val( '1' );
		yearlyMonthSelect.val( 'January' );
		if ( editedPattern && editedPattern.Yearly ) {
			yearlyDayInput.val( editedPattern.Yearly.Pattern.DayCount );
			yearlyMonthSelect.val( editedPattern.Yearly.Pattern.MonthCount );
		}
		if ( bBlockedSchedule ) {
			yearlyDayInput.attr( 'disabled', 'disabled' );
			yearlyMonthSelect.attr( 'disabled', 'disabled' );
		} else {
			yearlyDayInput.removeAttr( 'disabled' );
			yearlyMonthSelect.removeAttr( 'disabled' );
		}

		appointmentsPerDayInput.val( initialAppointmentsPerDayVal );
		if ( editedPatternType ) {
			appointmentsPerDayInput.val( editedPatternType.FrequencyPerDay );
		}

		endDateSwitch.find( 'div' ).removeClass( 'ui-radio-on ui-btn-active' ).addClass( 'ui-radio-off' );
		endDateSwitch.find( '[data-type="on"]' ).removeClass( 'ui-radio-off' ).addClass( 'ui-radio-on ui-btn-active' );
		totalOccurrencesInputWrapper.find( 'span' ).addClass( 'ui-disabled' );
		totalOccurrencesInput.attr( "disabled", "disabled" );
		totalOccurrencesInput.val( '' );
		if ( editedPatternType ) {
			lastTotalOccurrencesVal = editedPatternType.End.Occurrences;
			if ( lastTotalOccurrencesVal > 0 ) {
				endDateSwitch.find( '[data-type="on"]' ).removeClass( 'ui-radio-on ui-btn-active' ).addClass( 'ui-radio-off' );
				endDateSwitch.find( '[data-type="off"]' ).removeClass( 'ui-radio-off' ).addClass( 'ui-radio-on ui-btn-active' );
				totalOccurrencesInputWrapper.find( 'span' ).removeClass( 'ui-disabled' );
				totalOccurrencesInput.removeAttr( "disabled" );
				totalOccurrencesInput.val( lastTotalOccurrencesVal );
			} else {
				lastTotalOccurrencesVal = initialTotalOccurrencesVal;
			}
		}
		if ( bBlockedSchedule ) {
			appointmentsPerDayInput.attr( 'disabled', 'disabled' );
			endDateSwitch.find( 'div' ).addClass( 'ui-disabled' );
			totalOccurrencesInput.attr( "disabled", "disabled" );
		} else {
			if ( editedPattern && ! editedPattern.None ) {
				blockFrequencyAndRangeBlock( false );
			} else {
				blockFrequencyAndRangeBlock( true );
			}
		}
	};

	function unvalidateFields() {
		dailyInput.parent().removeClass( 'notValid' );
		weeklyInput.parent().removeClass( 'notValid' );
		weeklyDayWrapper.removeClass( 'notValid' );
		monthlyDayMonthInput.parent().removeClass( 'notValid' );
		monthlyDateDayInput.parent().removeClass( 'notValid' );
		monthlyDateMonthInput.parent().removeClass( 'notValid' );
		yearlyDayInput.parent().removeClass( 'notValid' );
		appointmentsPerDayInput.parent().removeClass( 'notValid' );
		totalOccurrencesInput.parent().removeClass( 'notValid' );
	};

	function validateFields() {
		var pattern = {};

		unvalidateFields();

		var valid = true;

		var chosenPattern = selectPattern.val();
		var chosenPatternObject = null;
		if ( chosenPattern == "None" ) {
			pattern.None = {};
		} else if ( chosenPattern == "Daily" ) {
			pattern.Daily = {};
			chosenPatternObject = pattern.Daily;
			var selectedDailySwitch = dailySwitch.find( 'div.ui-radio-on' );
			if ( selectedDailySwitch.length ) {
				pattern.Daily.Pattern = {};
				if ( selectedDailySwitch.data( "type" ) == "on" ) {
					pattern.Daily.Pattern.EveryWeekday = true;
				} else {
					var dailyInputVal = parseInt( dailyInput.val(), 10 );
					if ( ! isNaN( dailyInputVal ) && dailyInputVal > 0 && dailyInputVal <= 9999 ) {
						pattern.Daily.Pattern.DayPattern = dailyInputVal;
					} else {
						valid = false;
						dailyInput.parent().addClass( 'notValid' );
					}
				}
			} else {
				valid = false;
			}
		} else if ( chosenPattern == "Weekly" ) {
			pattern.Weekly = {};
			pattern.Weekly.Pattern = {};
			chosenPatternObject = pattern.Weekly;
			var weeklyInputVal = parseInt( weeklyInput.val(), 10 );
			if ( ! isNaN( weeklyInputVal ) && weeklyInputVal > 0 && weeklyInputVal <= 9999 ) {
				pattern.Weekly.Pattern.Count = weeklyInputVal;
			} else {
				valid = false;
				weeklyInput.parent().addClass( 'notValid' );
			}
			var activeDays = weeklyDayWrapper.find( '.activated' );
			if ( activeDays.length ) {
				var bitStringArray = [];
				weeklyDayWrapper.find( ':not([data-day=""])').each( function() {
					var el = $( this );
					var day = el.data( "day" );
					var bitToAdd = el.hasClass( 'activated' ) ? "1" : "0";
					if ( day == "sunday" ) {
						bitStringArray[ 6 ] = bitToAdd;
					} else if ( day == "monday" ) {
						bitStringArray[ 5 ] = bitToAdd;
					} else if ( day == "tuesday" ) {
						bitStringArray[ 4 ] = bitToAdd;
					} else if ( day == "wednesday" ) {
						bitStringArray[ 3 ] = bitToAdd;
					} else if ( day == "thursday" ) {
						bitStringArray[ 2 ] = bitToAdd;
					} else if ( day == "friday" ) {
						bitStringArray[ 1 ] = bitToAdd;
					} else if ( day == "saturday" ) {
						bitStringArray[ 0 ] = bitToAdd;
					}
				} );

				var bitString = bitStringArray.join( '' );
				pattern.Weekly.Pattern.Days = parseInt( bitString, 2 );
			} else {
				valid = false;
				weeklyDayWrapper.addClass( 'notValid' );
				emis.mobile.Utilities.alert( {message: "Please select at least one day" } );
			}
		} else if ( chosenPattern == "Monthly" ) {
			pattern.Monthly = {};
			chosenPatternObject = pattern.Monthly;
			var selectedMonthlySwitch = monthlySwitch.find( 'div.ui-radio-on' );
			if ( selectedMonthlySwitch.length ) {
				pattern.Monthly.Pattern = {};
				if ( selectedMonthlySwitch.data( "type" ) == "day" ) {
					pattern.Monthly.Pattern.PatternSelect = {};
					pattern.Monthly.Pattern.PatternSelect.DayPattern = monthlyDayPatternSelect.val();
					pattern.Monthly.Pattern.PatternSelect.DayType = monthlyDayTypeSelect.val();
					var monthlyDayMonthInputVal = parseInt( monthlyDayMonthInput.val(), 10 );
					if ( ! isNaN( monthlyDayMonthInputVal ) && monthlyDayMonthInputVal > 0 && monthlyDayMonthInputVal <= 100 ) {
						pattern.Monthly.Pattern.PatternSelect.MonthCount = monthlyDayMonthInputVal;
					} else {
						valid = false;
						monthlyDayMonthInput.parent().addClass( 'notValid' );
					}
				} else {
					pattern.Monthly.Pattern.PatternCount = {};
					var monthlyDateDayInputVal = parseInt( monthlyDateDayInput.val(), 10 );
					if ( ! isNaN( monthlyDateDayInputVal ) && monthlyDateDayInputVal > 0 && monthlyDateDayInputVal <= 31 ) {
						pattern.Monthly.Pattern.PatternCount.DayCount = monthlyDateDayInputVal;
					} else {
						valid = false;
						monthlyDateDayInput.parent().addClass( 'notValid' );
					}
					var monthlyDateMonthInputVal = parseInt( monthlyDateMonthInput.val(), 10 );
					if ( ! isNaN( monthlyDateMonthInputVal ) && monthlyDateMonthInputVal > 0 && monthlyDateMonthInputVal <= 999 ) {
						pattern.Monthly.Pattern.PatternCount.MonthCount = monthlyDateMonthInputVal;
					} else {
						valid = false;
						monthlyDateMonthInput.parent().addClass( 'notValid' );
					}
				}
			} else {
				valid = false;
			}
		} else if ( chosenPattern == "Quarterly" ) {
			pattern.Quarterly = {};
			chosenPatternObject = pattern.Quarterly;
			pattern.Quarterly.Pattern = {};
			pattern.Quarterly.Pattern.DayPattern = quarterlyDayPatternSelect.val();
			pattern.Quarterly.Pattern.DayType = quarterlyDayTypeSelect.val();
			pattern.Quarterly.Pattern.MonthInQuarter = quarterlyMonthTypeSelect.val();
		} else if ( chosenPattern == "Yearly" ) {
			pattern.Yearly = {};
			chosenPatternObject = pattern.Yearly;
			pattern.Yearly.Pattern = {};
			pattern.Yearly.Pattern.MonthCount = yearlyMonthSelect.val();
			var yearlyDayInputVal = parseInt( yearlyDayInput.val(), 10 );
			if ( ! isNaN( yearlyDayInputVal ) && yearlyDayInputVal > 0 && yearlyDayInputVal <= monthDays[ pattern.Yearly.Pattern.MonthCount ] ) {
				pattern.Yearly.Pattern.DayCount = yearlyDayInputVal;
			} else {
				valid = false;
				yearlyDayInput.parent().addClass( 'notValid' );
				if ( ! isNaN( yearlyDayInputVal ) && yearlyDayInputVal > monthDays[ pattern.Yearly.Pattern.MonthCount ] ) {
					emis.mobile.Utilities.alert( {message: "Please enter valid number of days in selected month" } );
				}
			}
		}

		if ( chosenPatternObject ) {
			var appointmentsPerDayVal = parseInt( appointmentsPerDayInput.val(), 10 );
			if ( ! isNaN( appointmentsPerDayVal ) && appointmentsPerDayVal > 0 && appointmentsPerDayVal <= 99 ) {
				chosenPatternObject.FrequencyPerDay = appointmentsPerDayVal;
			} else {
				valid = false;
				appointmentsPerDayInput.parent().addClass( 'notValid' );
			}

			var selectedEndDateSwitch = endDateSwitch.find( 'div.ui-radio-on' );
			if ( selectedEndDateSwitch.length ) {
				chosenPatternObject.End = {};
				if ( selectedEndDateSwitch.data( "type" ) == "on" ) {
					chosenPatternObject.End.Occurrences = 0;
				} else {
					var totalOccurrencesVal = parseInt( totalOccurrencesInput.val(), 10 );
					if ( ! isNaN( totalOccurrencesVal ) && totalOccurrencesVal > 0 && totalOccurrencesVal <= 9999 ) {
						chosenPatternObject.End.Occurrences = totalOccurrencesVal;
					} else {
						valid = false;
						totalOccurrencesInput.parent().addClass( 'notValid' );
					}
				}
			} else {
				valid = false;
			}
		}

		if ( valid ) {
			that.data.definition = pattern;
		}

		return valid;
	};

	this.bindDataAndEvents = function( $page ) {

		reloadFields();

		emis.mobile.UI.addOrientationEventsForDialog( orientationChange );
		orientationChange( );
	};

	return this;
}
