
emis.mobile.form.EditSchedule = function( appObject ) {
	var _app = appObject;
	var that = this;
	var pageId = '#editSchedule';
	var page;
	var bReloadFields = true;
	var bSkipUnbind = false;

	var bTravelTimeMandatory = true;
	var bVisitDurationMandatory = true;
	var bCareEpisodeEnabled = true;
	var bBlockedSchedule = false;

	var headerTitle,
		closeDialogBtn,
		saveScheduleBtn,
		patientNameField,
		selectService,
		selectCareEpisode, selectCareEpisodeWrapper,
		selectDependencyWrapper,
		selectScheduleTemplate, editScheduleTemplateBtn,
		inputStartDate, inputEndDate,
		inputVisitDuration, inputVisitDurationWrapper,
		inputTravelTime, inputTravelTimeWrapper,
		selectTimeBand,
		selectSlotType,
		selectLocation,
		inputReason,
		inputNotes;

	this.data = {};

	var unbindEvents = function( ) {
		if ( bSkipUnbind ) {
			bSkipUnbind = false;
			return;
		}
		bReloadFields = true;
		emis.mobile.UI.removeOrientationEventsForDialog( orientationChange );
		$( "#bookAppointments" ).css( {
			"overflow": "visible",
			"max-height": "none"
		} );
	}
	var pageShow = function( ) {
		if ( bBlockedSchedule ) {
			page.find( 'input[data-role="datebox"]' ).each( function() {
				$( this ).removeClass( "ui-disabled" );
			} );
		}
		orientationChange( );
	}
	var orientationChange = function( ) {
		var newHeight = emis.mobile.UI.calculateDialogPadding( _app, page );
		$( "#bookAppointments" ).css( {
			"min-height": newHeight,
			"max-height": newHeight,
			"overflow": "hidden"
		} );

		page.css( {
			"padding-bottom": "",
			"height": ""
		});
		emis.mobile.UI.setDialogHeight( page, "#bookAppointments" );
	}

	// register global page events
	$( document ).delegate( pageId, "pageinit", function() {
		page = $( this );
		page.on( 'pagehide', unbindEvents );
		page.on( 'pageshow', pageShow );

		headerTitle = page.find( '[data-container="header-title"]' );
		closeDialogBtn = $( '#edit-schedule-close' );
		saveScheduleBtn = $( '#edit-schedule-save' );
		patientNameField = page.find( '.patient-name' );
		selectService = $( '#edit-schedule-service' );
		selectCareEpisodeWrapper = $( '#edit-schedule-care-episode-wrapper' );
		selectCareEpisode = selectCareEpisodeWrapper.find( 'select' );
		selectDependencyWrapper = $( '#edit-schedule-dependency-wrapper' );
		selectScheduleTemplate = $( '#edit-schedule-select-template-wrapper' ).find( 'select' );
		that.selectScheduleTemplate = selectScheduleTemplate; // for communication with template editor
		editScheduleTemplateBtn = $( '#edit-schedule-edit-template' );
		inputStartDate = $( '#edit-schedule-start-date' );
		inputEndDate = $( '#edit-schedule-end-date' );
		inputVisitDurationWrapper = $( '#edit-schedule-visit-duration-wrapper' );
		inputVisitDuration = inputVisitDurationWrapper.find( 'input' );
		inputTravelTimeWrapper = $( '#edit-schedule-travel-time-wrapper' );
		inputTravelTime = inputTravelTimeWrapper.find( 'input' );
		selectTimeBand = $( '#edit-schedule-time-band' );
		selectSlotType = $( '#edit-schedule-slot-type' );
		selectLocation = $( '#edit-schedule-location' );
		inputReason = $( '#edit-schedule-reason' );
		inputNotes = $( '#edit-schedule-notes' );

		selectDependencyWrapper.find( 'div' ).on( 'click', function( e ) {
			var el = $( this );
			if ( el.hasClass( 'ui-disabled' ) ) {
				return false;
			}
			selectDependencyWrapper.find( 'div' ).not( el ).removeClass( 'ui-radio-on ui-btn-active' ).addClass( 'ui-radio-off' );
			el.removeClass( 'ui-radio-off' ).addClass( 'ui-radio-on ui-btn-active' );
		} );

		selectScheduleTemplate.on( 'change', function( e ) {
			if ( selectScheduleTemplate.find( 'option:selected' ).val() == "custom" ) {
				editScheduleTemplateBtn.removeClass( 'ui-disabled' );
			} else {
				editScheduleTemplateBtn.addClass( 'ui-disabled' );
			}
		} );

		editScheduleTemplateBtn.on( 'click', function( e ) {
			if ( $( this ).hasClass( 'ui-disabled' ) ) {
				return false;
			}
			bSkipUnbind = true;
			var fctrs = _app.controller.getFormControllerStruct( '#editScheduleTemplate' );
			fctrs.controller.data.scheduleId = that.data.scheduleId;
			if ( that.data.definition ) {
				// if recurrence pattern was created or edited
				fctrs.controller.data.definition = that.data.definition;
			}
			$.mobile.changePage( '#editScheduleTemplate' );
		} );

		saveScheduleBtn.on( 'click', function( e ) {
			if ( $( this ).hasClass( 'ui-disabled' ) ) {
				return false;
			}
			var valid = validateFields();
			if ( valid ) {
				that.data.object.lastModified = _app.util.getISONowUTCDate();
				if ( that.data.scheduleId ) {
					_app.dataProvider.saveEditedSchedule( _app.controller.patient.id, that.data.scheduleId, that.data.object );
				} else {
					_app.dataProvider.insertNewSchedule( _app.controller.patient.id, that.data.object );
				}
				jQuery(document).trigger('emis.needsync', ['schedules']);

				emis.mobile.console.log( "saved schedule object: " + JSON.stringify( that.data.object ) );

				that.data = {};

				unbindEvents( );
				$.mobile.changePage( "#bookAppointments" );
				setTimeout(function() {
					$.mobile.changePage( "#schedulesList" );
				}, 1000);
			}
		} );

		closeDialogBtn.on( 'click', function( e ) {
			that.data = {};
			unbindEvents( );
			$.mobile.changePage( "#bookAppointments" );
			setTimeout(function() {
				$.mobile.changePage( "#schedulesList" );
			}, 1000);
		} );
	});

	function reloadFields() {
		unvalidateFields();

		patientNameField.html( _app.controller.patient.name );

		bBlockedSchedule = false;
		var editedSchedule;
		if ( that.data.scheduleId ) {
			bBlockedSchedule = _app.dataProvider.isScheduleNotSynchronised( that.data.scheduleId );
			editedSchedule = _app.dataProvider.getSchedule( that.data.scheduleId );
		} else {
			headerTitle.html( 'Add schedule' );
		}
		if ( bBlockedSchedule ) {
			headerTitle.html( 'View schedule' );
			saveScheduleBtn.addClass( 'ui-disabled' );
		} else {
			if ( editedSchedule ) {
				headerTitle.html( 'Edit schedule' );
			}
			saveScheduleBtn.removeClass( 'ui-disabled' );
		}

		var services = _app.dataProvider.getServices();
		if ( services ) {
			var markup = '';
			var bSthSelected = false;
			for ( var i = 0; i < services.length; i++ ) {
				var service = services[i].object;
				if ( service.AllowsScheduledAppointments || ( editedSchedule && editedSchedule.data.serviceId == service.Id ) ) {
					markup += '<option value="' + service.Id + '"';
				}
				if ( editedSchedule && editedSchedule.data.serviceId == service.Id ) {
					bSthSelected = true;
					markup += ' selected="selected"';
				}
				markup += '>' + service.Name + '</option>';
			}
			var defaultOptionMarkup = '<option value="" disabled="disabled"';
			if ( ! bSthSelected ) {
				defaultOptionMarkup += 'selected="selected"';
			}
			defaultOptionMarkup += '>Select service...</option>';
			markup = defaultOptionMarkup + markup;
			selectService.html( markup );
			if ( bBlockedSchedule ) {
				selectService.attr( 'disabled', 'disabled' );
			} else {
				selectService.removeAttr( 'disabled' );
			}
		}

		var locations = _app.dataProvider.getLocations();
		var markup = '';
		if ( locations ) {
			var bSthSelected = false;
			for ( var i = 0; i < locations.length; i++ ) {
				var location = locations[i].object;
				markup += '<option value="' + location.Id + '"';
				if ( editedSchedule && editedSchedule.data.locationId == location.Id ) {
					bSthSelected = true;
					markup += ' selected="selected"';
				}
				markup += '>' + location.DisplayName + '</option>';
			}
		}
		var defaultOptionMarkup = '<option value="" disabled="disabled"';
		if ( ! bSthSelected ) {
			defaultOptionMarkup += 'selected="selected"';
		}
		defaultOptionMarkup += '>Select location...</option>';
		markup = defaultOptionMarkup + markup;
		selectLocation.html( markup );
		if ( bBlockedSchedule ) {
			selectLocation.attr( 'disabled', 'disabled' );
		} else {
			selectLocation.removeAttr( 'disabled' );
		}

		selectDependencyWrapper.find( 'div' ).removeClass( 'ui-radio-on ui-btn-active' ).addClass( 'ui-radio-off' );
		if ( editedSchedule ) {
			selectDependencyWrapper.find( 'div[data-dependency="' + editedSchedule.data.dependency + '"]' ).removeClass( 'ui-radio-off' ).addClass( 'ui-radio-on ui-btn-active' );
		}
		if ( bBlockedSchedule ) {
			selectDependencyWrapper.find( 'div' ).addClass( 'ui-disabled' );
		} else {
			selectDependencyWrapper.find( 'div' ).removeClass( 'ui-disabled' );
		}

		var scheduleTemplates = _app.dataProvider.getScheduleTemplates();
		var markup = '';
		var bSthSelected = false;
		if ( scheduleTemplates ) {
			for ( var i = 0; i < scheduleTemplates.length; i++ ) {
				var template = scheduleTemplates[i].object;
				markup += '<option value="' + template.Id + '"';
				if ( editedSchedule && editedSchedule.data.scheduleId == template.Id && ! ( editedSchedule.data.recurrencePattern || editedSchedule.data.definition ) ) {
					bSthSelected = true;
					markup += ' selected="selected"';
				}
				markup += '>' + template.RecurrencePattern.Description + '</option>';
			}
		}
		markup += '<option value="custom"';
		if ( editedSchedule && ( editedSchedule.data.recurrencePattern || editedSchedule.data.definition ) ) {
			bSthSelected = true;
			markup += ' selected="selected"';
			var recPattern = editedSchedule.data.recurrencePattern;
			if ( ! recPattern ) {
				recPattern = editedSchedule.data.definition.recurrencePattern;
			}
			markup += '>' + main.dataProvider.getDescriptionStringForSchedule( recPattern ) + '</option>';
		} else {
			markup += '>Custom</option>';
		}
		var defaultOptionMarkup = '<option value="" disabled="disabled"';
		if ( ! bSthSelected ) {
			defaultOptionMarkup += 'selected="selected"';
		}
		defaultOptionMarkup += '>Select...</option>';
		markup = defaultOptionMarkup + markup;
		selectScheduleTemplate.html( markup );
		if ( bBlockedSchedule ) {
			selectScheduleTemplate.attr( 'disabled', 'disabled' );
			editScheduleTemplateBtn.text( 'View' );
		} else {
			selectScheduleTemplate.removeAttr( 'disabled' );
			editScheduleTemplateBtn.text( 'Edit' );
		}
		if ( editedSchedule && ( editedSchedule.data.recurrencePattern || editedSchedule.data.definition ) ) {
			editScheduleTemplateBtn.removeClass( 'ui-disabled' );
		} else {
			editScheduleTemplateBtn.addClass( 'ui-disabled' );
		}

		var slotTypes = _app.dataProvider.getSlotTypes();
		var markup = '';
		if ( slotTypes ) {
			var bSthSelected = false;
			for ( var i = 0; i < slotTypes.length; i++ ) {
				var slotType = slotTypes[i].object;
				markup += '<option value="' + slotType.Id + '"';
				if ( editedSchedule && editedSchedule.data.slotTypeId == slotType.Id ) {
					bSthSelected = true;
					markup += ' selected="selected"';
				}
				markup += '>' + slotType.DisplayName + '</option>';
			}
		}
		var defaultOptionMarkup = '<option value="" disabled="disabled"';
		if ( ! bSthSelected ) {
			defaultOptionMarkup += 'selected="selected"';
		}
		defaultOptionMarkup += '>Select slot type...</option>';
		markup = defaultOptionMarkup + markup;
		selectSlotType.html( markup );
		if ( bBlockedSchedule ) {
			selectSlotType.attr( 'disabled', 'disabled' );
		} else {
			selectSlotType.removeAttr( 'disabled' );
		}

		var todayDate = _app.util.standardizeDate( new Date( ).toISOString( ) );
		inputStartDate.find( 'input' ).val( todayDate );
		inputEndDate.find( 'input' ).val( '' );
		if ( editedSchedule ) {
			if ( editedSchedule.data.startDate ) {
				inputStartDate.find( 'input' ).val( _app.util.standardizeDate( editedSchedule.data.startDate ) );
			}
			if ( editedSchedule.data.endDate ) {
				inputEndDate.find( 'input' ).val( _app.util.standardizeDate( editedSchedule.data.endDate ) );
			}
		}
		if ( bBlockedSchedule ) {
			inputStartDate.find( 'input' ).attr( 'disabled', 'disabled' );
			inputEndDate.find( 'input' ).attr( 'disabled', 'disabled' );
		} else {
			inputStartDate.find( 'input' ).removeAttr( 'disabled' );
			inputEndDate.find( 'input' ).removeAttr( 'disabled' );
		}

		inputVisitDuration.val( '' );
		if ( editedSchedule && editedSchedule.data.visitDuration ) {
			inputVisitDuration.val( editedSchedule.data.visitDuration );
		}
		if ( bBlockedSchedule ) {
			inputVisitDuration.attr( 'disabled', 'disabled' );
		} else {
			inputVisitDuration.removeAttr( 'disabled' );
		}

		inputTravelTime.val( '' );
		if ( editedSchedule && editedSchedule.data.predictedTravelTime ) {
			inputTravelTime.val( editedSchedule.data.predictedTravelTime );
		}
		if ( bBlockedSchedule ) {
			inputTravelTime.attr( 'disabled', 'disabled' );
		} else {
			inputTravelTime.removeAttr( 'disabled' );
		}

		if ( editedSchedule && editedSchedule.data.timeBand ) {
			selectTimeBand.val( editedSchedule.data.timeBand );
		} else {
			selectTimeBand.val( 'None' );
		}
		if ( bBlockedSchedule ) {
			selectTimeBand.attr( 'disabled', 'disabled' );
		} else {
			selectTimeBand.removeAttr( 'disabled' );
		}

		if ( editedSchedule && editedSchedule.data.reason ) {
			inputReason.val( _.h( editedSchedule.data.reason ) );
		} else {
			inputReason.val( '' );
		}
		if ( bBlockedSchedule ) {
			inputReason.attr( 'disabled', 'disabled' );
			inputReason.addClass( 'ui-disabled' );
		} else {
			inputReason.removeAttr( 'disabled' );
			inputReason.removeClass( 'ui-disabled' );
		}

		if ( editedSchedule && editedSchedule.data.notes ) {
			inputNotes.val( _.h( editedSchedule.data.notes ) );
		} else {
			inputNotes.val( '' );
		}
		if ( bBlockedSchedule ) {
			inputNotes.attr( 'disabled', 'disabled' );
			inputNotes.addClass( 'ui-disabled' );
		} else {
			inputNotes.removeAttr( 'disabled' );
			inputNotes.removeClass( 'ui-disabled' );
		}

		bTravelTimeMandatory = true;
		bVisitDurationMandatory = true;
		bCareEpisodeEnabled = true;
		selectCareEpisodeWrapper.show();
		inputVisitDurationWrapper.find( '.star' ).show();
		inputTravelTimeWrapper.find( '.star' ).show();

		var scheduleObject = _app.dataProvider.getScheduleObject();
		if ( scheduleObject ) {
			var careEpisodes = _app.dataProvider.getPatientCareEpisodes( _app.controller.patient.id );
			var sessionObject = _app.dataProvider.getSessionData();
			if ( sessionObject &&
					sessionObject.Payload &&
					emis.mobile.Utilities.isTrue( sessionObject.Payload.EpisodeManagementEnabled ) &&
					careEpisodes &&
					careEpisodes.length ) {
				var markup = '';
				var bSthSelected = false;
				for ( var i = 0; i < careEpisodes.length; i++ ) {
					var careEpisode = careEpisodes[i];
					markup += '<option value="' + careEpisode.id + '"';
					if ( editedSchedule && editedSchedule.data.linkedCareEpisodeId == careEpisode.id ) {
						bSthSelected = true;
						markup += ' selected="selected"';
					}
					markup += '>' + careEpisode.displayText + '</option>';
				}
				var defaultOptionMarkup = '<option value="" disabled="disabled"';
				if ( ! bSthSelected ) {
					defaultOptionMarkup += 'selected="selected"';
				}
				defaultOptionMarkup += '>Select linked care episode...</option>';
				markup = defaultOptionMarkup + markup;
				selectCareEpisode.html( markup );
				if ( bBlockedSchedule ) {
					selectCareEpisode.attr( 'disabled', 'disabled' );
				} else {
					selectCareEpisode.removeAttr( 'disabled' );
				}
			} else {
				bCareEpisodeEnabled = false;
				selectCareEpisodeWrapper.hide();
			}
			if ( ! emis.mobile.Utilities.isTrue( scheduleObject.IsPredictedVisitDurationMandatory ) ) {
				bVisitDurationMandatory = false;
				inputVisitDurationWrapper.find( '.star' ).hide();
			}
			if ( ! emis.mobile.Utilities.isTrue( scheduleObject.IsPredictedTravelTimeMandatory ) ) {
				bTravelTimeMandatory = false;
				inputTravelTimeWrapper.find( '.star' ).hide();
			}
			if ( emis.mobile.Utilities.isTrue( scheduleObject.DefaultLocationId ) ) {
				selectLocation.val( scheduleObject.DefaultLocationId );
			}
		}
	}

	function unvalidateFields() {
		selectService.parent().removeClass( 'notValid' );
		selectCareEpisode.parent().removeClass( 'notValid' );
		selectDependencyWrapper.removeClass( 'notValid' );
		selectScheduleTemplate.parent().removeClass( 'notValid' );
		inputStartDate.children( ':first' ).removeClass( 'notValid' );
		inputEndDate.children( ':first' ).removeClass( 'notValid' );
		inputVisitDuration.parent().removeClass( 'notValid' );
		inputTravelTime.parent().removeClass( 'notValid' );
		selectSlotType.parent().removeClass( 'notValid' );
	}

	function validateFields() {
		var schedule = {};

		unvalidateFields();

		var valid = true;

		schedule.patientId = _app.controller.patient.id;
		schedule.slotId = _app.controller.slotId;

		var editedSchedule = null;
		if ( that.data.scheduleId ) {
			editedSchedule = _app.dataProvider.getSchedule( that.data.scheduleId );
			if ( editedSchedule.data.id ) {
				//if we edit downloaded schedule...
				schedule.patientScheduleId = editedSchedule.data.id;
			} else if ( editedSchedule.data.patientScheduleId ) {
				//if we edit edited schedule then save its id
				schedule.patientScheduleId = editedSchedule.data.patientScheduleId;
			}
		}

		var selectedService = selectService.find( 'option:selected' ).val();
		if ( selectedService ) {
			schedule.serviceId = selectedService;
		} else {
			valid = false;
			selectService.parent().addClass( 'notValid' );
		}

		var selectedDependency = selectDependencyWrapper.find( 'div.ui-radio-on' );
		if ( selectedDependency.length ) {
			schedule.dependency = selectedDependency.data( 'dependency' );
		} else {
			valid = false;
			selectDependencyWrapper.addClass( 'notValid' );
		}

		var startDate = inputStartDate.find( 'input' ).val();
		var endDate = inputEndDate.find( 'input' ).val();
		var todayDate = new Date();
		todayDate = new Date( todayDate.setHours( 0 ) );
		todayDate = new Date( todayDate.setMinutes( 0 ) );
		todayDate = new Date( todayDate.setSeconds( 0 ) );
		todayDate = new Date( todayDate.setMilliseconds( 0 ) ).getTime();

		var comparableStartDate = null;
		var comparableEndDate = null;
		if ( startDate ) {
			comparableStartDate = new Date( startDate.split( "-" ).join( " " ) ).getTime();
		}
		if ( endDate ) {
			comparableEndDate = new Date( endDate.split( "-" ).join( " " ) ).getTime();
		}

		if ( ! startDate || ( ! editedSchedule && comparableStartDate && comparableStartDate < todayDate ) ) {
			valid = false;
			inputStartDate.children( ':first' ).addClass( 'notValid' );
			if ( comparableStartDate && comparableStartDate < todayDate ) {
				emis.mobile.Utilities.alert( {message: "The start date cannot be in the past"} );
			}
		}
		if ( ! editedSchedule && comparableEndDate && comparableEndDate < todayDate ) {
			valid = false;
			inputEndDate.children( ':first' ).addClass( 'notValid' );
			if ( comparableEndDate && comparableEndDate < todayDate ) {
				emis.mobile.Utilities.alert( {message: "The end date cannot be in the past"} );
			}
		}
		if ( comparableStartDate && endDate ) {
			if ( comparableStartDate > comparableEndDate ) {
				valid = false;
				inputStartDate.children( ':first' ).addClass( 'notValid' );
				inputEndDate.children( ':first' ).addClass( 'notValid' );
				emis.mobile.Utilities.alert( {message: "The start date cannot be after the end date" } );
			}
		}
		if ( startDate ) {
			schedule.startDate = _app.util.toISODate( startDate );
		}
		if ( endDate ) {
			schedule.endDate = _app.util.toISODate( endDate );
		}

		var selectedTemplate = selectScheduleTemplate.find( 'option:selected' ).val();
		if ( selectedTemplate ) {
			if ( selectedTemplate == "custom" ) {
				if ( that.data.scheduleId ) {
					editedSchedule = _app.dataProvider.getSchedule( that.data.scheduleId );
				}

				if ( that.data.definition ) {
					// if we created custom template for schedule that not have yet been created
					// or when we are editing created of previously edited or downloaded schedule
					// and we modified or created custom template
					schedule.definition = that.data.definition;
				} else if ( editedSchedule && editedSchedule.data.definition ) {
					// if we are editing created or previously edited schedule but we didn't modify the custom template
					schedule.definition = editedSchedule.data.definition;
				} else if ( editedSchedule && editedSchedule.data.recurrencePattern ) {
					// if we are editing a downloaded schedule and we didn't modify the custom template
					schedule.recurrencePattern = editedSchedule.data.recurrencePattern;
					schedule.scheduleId = editedSchedule.data.scheduleId;
				} else {
					valid = false;
					selectScheduleTemplate.parent().addClass( 'notValid' );
				}
				if ( schedule.startDate && schedule.definition && schedule.definition.recurrencePattern ) {
					schedule.definition.recurrencePattern.StartDate = schedule.startDate;
				}
			} else {
				schedule.scheduleId = selectedTemplate;
			}
			if(schedule.definition)
			{
				//If the definition exists then add the null-able property types to the reccurencePattern so the Json validates successfully
				schedule.definition.recurrencePattern = replaceRecurrencePatternProperties(schedule.definition.recurrencePattern)
			}
		} else {
			valid = false;
			selectScheduleTemplate.parent().addClass( 'notValid' );
		}

		if ( bCareEpisodeEnabled ) {
			var selectedCareEpisode = selectCareEpisode.find( 'option:selected' ).val();
			if ( selectedCareEpisode ) {
				schedule.linkedCareEpisodeId = selectedCareEpisode;
			} else {
				valid = false;
				selectCareEpisode.parent().addClass( 'notValid' );
			}
		}

		var visitDuration = parseInt( inputVisitDuration.val(), 10 );
		if ( ! isNaN( visitDuration ) && visitDuration > 0 && visitDuration <= 99 ) {
			schedule.visitDuration = visitDuration;
		} else if ( ! ( ! bVisitDurationMandatory && inputVisitDuration.val() == '' ) ) {
			valid = false;
			inputVisitDuration.parent().addClass( 'notValid' );
		}

		var travelTime = parseInt( inputTravelTime.val(), 10 );
		if ( ! isNaN( travelTime ) && travelTime > 0 && travelTime <= 99 ) {
			schedule.predictedTravelTime = travelTime;
		} else if ( ! ( ! bTravelTimeMandatory && inputTravelTime.val() == '' ) ) {
			valid = false;
			inputTravelTime.parent().addClass( 'notValid' );
		}

		var selectedTimeBand = selectTimeBand.find( 'option:selected' ).val();
		if ( selectedTimeBand ) {
			schedule.timeBand = selectedTimeBand;
		}

		var selectedSlotType = selectSlotType.find( 'option:selected' ).val();
		if ( selectedSlotType ) {
			schedule.slotTypeId = selectedSlotType;
		} else {
			valid = false;
			selectSlotType.parent().addClass( 'notValid' );
		}

		var selectedLocation = selectLocation.find( 'option:selected' ).val();
		if ( selectedLocation ) {
			schedule.locationId = selectedLocation;
		}

		var notes = _app.sanitizer.sanitize( inputNotes.val() );
		if ( notes ) {
			schedule.notes = notes;
		}

		var reason = _app.sanitizer.sanitize( inputReason.val() );
		if ( reason ) {
			schedule.reason = reason;
		}

		if ( valid ) {
			that.data.object = schedule;
		}

		return valid;
	}

	function replaceRecurrencePatternProperties(scheduleRecurrencePattern){
		var defaultRecurrencePattern = {
			StartDate: null,
			Description: null,
			None: null,
			Daily: null,
			Weekly: null,
			Monthly: null,
			Quarterly: null,
			Yearly: null
		}

		//If Daily object exists
		if(scheduleRecurrencePattern.Daily)
		{
			defaultRecurrencePattern.Daily = {
				Pattern: {
					DayPattern: null,
					EveryWeekday: null
				}
			}
		}

		//If Monthly object exists
		if(scheduleRecurrencePattern.Monthly)
		{
			defaultRecurrencePattern.Monthly = {
				Pattern: {
					PatternSelect: null,
					PatternCount: null
				}
			}
		}

		var mergedRecurrencePattern = $.extend(true, {}, defaultRecurrencePattern, scheduleRecurrencePattern);
		return mergedRecurrencePattern;
	}

	this.bindDataAndEvents = function( $page ) {

		if ( bReloadFields ) {
			reloadFields();
			bReloadFields = false;
		}

		emis.mobile.UI.addOrientationEventsForDialog( orientationChange );
		orientationChange( );
	};

	return this;
}