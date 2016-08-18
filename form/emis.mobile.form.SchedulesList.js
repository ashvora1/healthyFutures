/**
 * Login form controller Functionalities provided:
 */

emis.mobile.form.SchedulesList = function( appObject ) {
	var _app = appObject;
	var that = this;
	var pageId = '#schedulesList';
	var page;

	// data holder
	this.data = [];
	var addScheduleBtn, closeDialogBtn, schedulesListContent;
	var lastServiceName;
	var bSkipUnbind = false;

	var unbindEvents = function( ) {
		if ( bSkipUnbind ) {
			bSkipUnbind = false;
			return;
		}
		emis.mobile.UI.removeOrientationEventsForDialog( orientationChange );
		$( "#bookAppointments" ).css( {
			"overflow": "visible",
			"max-height": "none"
		} );
	}
	var pageShow = function( ) {
		orientationChange( );
	}

	var setBackgroundPageHeight = function() {
		var newHeight = emis.mobile.UI.calculateDialogPadding( _app, page );
		$( "#bookAppointments" ).css( {
			"min-height": newHeight,
			"max-height": newHeight,
			"overflow": "hidden"
		} );
	}

	var orientationChange = function( ) {
		setBackgroundPageHeight();
		page.css( {
			"padding-bottom": "",
			"height": ""
		});
		var scrollableContent = schedulesListContent.find( '.content.grid' );
		if ( scrollableContent.length ) {
			scrollableContent.css( "max-height", "" );
			var dialog = page.find( ".ui-dialog-contain" );
			var dialogHeight = dialog.height();
			var scrollableContentHeight = scrollableContent.height();

			if ( dialogHeight > window.innerHeight ) {
				scrollableContent.css( "max-height", scrollableContentHeight - ( dialogHeight - window.innerHeight ) );
			}
			setBackgroundPageHeight();
		}
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

	function getSectionHeaderOpen( ) {
		return '<div class="header grid">';
	}

	function getSectionHeaderClose( ) {
		return '</div>';
	}

	function getSectionContentOpen( ) {
		return '<div class="content grid">';
	}

	function getSectionContentClose( ) {
		return '</div>';
	}

	function fillSectionListview( patientSchedules ) {
		var markup = "";
		markup += getSectionOpen( );

		markup += getSectionHeaderOpen( );
		markup += '<div class="e-blocks">';
		markup += '<div class="grid-5 e-block-a">Description</div>';
		markup += '<div class="grid-5 e-block-b">Reason</div>';
		markup += '<div class="grid-5 e-block-c">Next Occurrence</div>';
		markup += '<div class="grid-5 e-block-d">Last Appointment</div>';
		markup += '<div class="grid-5 e-block-e"></div>';
		markup += '</div>';
		markup += getSectionHeaderClose( );

		markup += getSectionContentOpen( );
		lastServiceName = "";
		for ( var i = 0; i < patientSchedules.length; i++ ) {
			var scheduleWrapper = patientSchedules[i];
			var schedule = scheduleWrapper.data;

			if ( schedule.serviceName != lastServiceName ) {
				lastServiceName = schedule.serviceName;
				markup += '<div class="e-blocks header inner-header">';
				markup += '<div class="grid-5 e-block-a">' + _.h( lastServiceName ) + '</div>';
				markup += '</div>';
			}

			var recPattern = null;
			var scheduleDescription = "";
			if ( schedule.definition ) {
				recPattern = schedule.definition.recurrencePattern;
				scheduleDescription = main.dataProvider.getDescriptionStringForSchedule(recPattern);
			} else if ( schedule.recurrencePattern ) {
				recPattern = schedule.recurrencePattern;
				scheduleDescription = recPattern.Description;
			} else {
				var scheduleTemplate = _app.dataProvider.getScheduleTemplateById( schedule.scheduleId );
				if ( scheduleTemplate ) {
					recPattern = scheduleTemplate.RecurrencePattern;
					scheduleDescription = recPattern.Description;
				}
			}

			markup += '<div class="e-blocks">';
			markup += '<div class="grid-5 e-block-a">' + _.h( scheduleDescription ) + '</div>';
			markup += '<div class="grid-5 e-block-b">' + _.h( schedule.reason ) + '</div>';
			markup += '<div class="grid-5 e-block-c">';


			markup += _app.util.formatDateNoTime( schedule.nextOccurrenceDate );
			markup += '</div>';
			markup += '<div class="grid-5 e-block-d">';
			var lastOccurrenceDate = _app.dataProvider.getScheduleLastOccurrenceDate( schedule, recPattern );
			if ( lastOccurrenceDate ) {
				markup += _app.util.formatDateNoTime( lastOccurrenceDate );
			}
			markup += '</div>';
			markup += '<div class="grid-5 e-block-e">';
			var disableClass = '';
			var editTextButton = 'Edit';
			if ( _app.dataProvider.isScheduleNotSynchronised( scheduleWrapper.id ) ) {
				disableClass = ' ui-disabled"';
				editTextButton = 'View';
			}
			markup += '<a href data-role="none" class="button edit-schedule" ';
			markup += 'data-em-schedule-id="' + scheduleWrapper.id  + '">' + editTextButton + '</a>';
			markup += '<a href data-role="none" class="button red cancel-schedule' + disableClass + '" ';
			markup += 'data-em-schedule-id="' + scheduleWrapper.id  + '">Cancel</a>';
			markup += '</div>';
			markup += '</div>';
		}

		markup += getSectionContentClose( );
		markup += getSectionClose( );

		return markup;
	}

	// register global page events
	$( document ).delegate( pageId, "pageinit", function() {
		page = $( this );

		// Bind button click events by jquery delegate
		page.on( 'click', '.button', function(e) {
			if ($(this).hasClass('ui-disabled')) {
				return false ;
			}
			var scheduleId = $( this ).data( 'em-schedule-id' );
			if ( $(this).hasClass('edit-schedule') ) {
				var fctrs = _app.controller.getFormControllerStruct( '#editSchedule' );
				unbindEvents( );
				fctrs.controller.data.scheduleId = scheduleId;
				$.mobile.changePage( '#bookAppointments' );
				setTimeout(function() {
					$.mobile.changePage( '#editSchedule' );
				}, 1000);
			} else if ( $(this).hasClass('cancel-schedule') ) {
				var fctrs = _app.controller.getFormControllerStruct( '#cancelSchedule' );
				fctrs.controller.data.scheduleId = scheduleId;
				bSkipUnbind = true;
				$.mobile.changePage( '#cancelSchedule' );
			}
		} );

		page.on( 'pagehide', unbindEvents );
		page.on( 'pageshow', pageShow );

		addScheduleBtn = $( '#addScheduleBtn' );
		closeDialogBtn = $( '#schedulesListCloseBtn' );
		schedulesListContent = $( '#schedulesListContent' );

		closeDialogBtn.on( 'click', function( e ) {
			unbindEvents( );
			$.mobile.changePage( '#bookAppointments' );
		} );

		addScheduleBtn.on( 'click', function( e ) {
			if ( $(this).hasClass( 'ui-disabled' ) ) {
				return false;
			}
			unbindEvents( );
			var fctrs = _app.controller.getFormControllerStruct( '#editSchedule' );
			delete fctrs.controller.data.scheduleId;
			$.mobile.changePage( '#bookAppointments' );
			setTimeout(function() {
				$.mobile.changePage( '#editSchedule' );
			}, 1000);
		});
	});

	this.bindDataAndEvents = function( $page ) {

		schedulesListContent.html( '' );
		var markup = "";
		var patientSchedules = _app.dataProvider.getActivePatientSchedules( _app.controller.patient.id );
		if ( !_app.util.isEmptyObject( patientSchedules ) ) {
			markup = fillSectionListview( patientSchedules );
		} else {
			markup = getSectionNoData( 'Schedules' );
		}
		schedulesListContent.html( markup );
		var scrollableContent = schedulesListContent.find( '.content.grid' );
		if ( scrollableContent.length ) {
			if ( emis.mobile.UI.isAndroid ) {
				var listScrollStartPos = 0;
				scrollableContent.on( 'touchstart', function( e ) {
					listScrollStartPos = this.scrollTop + e.originalEvent.touches[0].pageY;
				} );
				scrollableContent.on( 'touchmove', function( e ) {
					if ( this.scrollHeight > $( this ).height() ) {
						this.scrollTop = listScrollStartPos - e.originalEvent.touches[0].pageY;
						e.preventDefault();
					}
				} );
			}
			if ( emis.mobile.UI.isiPad ) {
				scrollableContent.css( '-webkit-overflow-scrolling', 'touch' );
			}
		}

		if( main.dataProvider.getErrorAppointmentByPatientId(main.controller.patient.id) ) {
			addScheduleBtn.addClass( 'ui-disabled' );
		} else {
			addScheduleBtn.removeClass( 'ui-disabled' );
		}

		emis.mobile.UI.addOrientationEventsForDialog( orientationChange );
		orientationChange( );
	};

	return this;
}
