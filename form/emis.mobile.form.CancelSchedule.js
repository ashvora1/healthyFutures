
emis.mobile.form.CancelSchedule = function( appObject ) {
	var _app = appObject;
	var that = this;
	var pageId = '#cancelSchedule';
	var page;

	var closeDialogBtn,
		submitCancelSchedule,
		inputCancelReason,
		selectLinkedSwitchWrapper,
		selectLinkedSwitchWrapperBlock,
		linkedAppointmentsWrapper;

	this.data = {};

	var unbindEvents = function( ) {
		emis.mobile.UI.removeOrientationEventsForDialog( orientationChange );
		$( "#bookAppointments, #schedulesList" ).removeClass( 'backround-page-for-multiple-dialogs' );
		$( "#schedulesList" ).removeClass( 'no-background' );
		page.removeClass( 'top-dialog' );
		$( "#bookAppointments" ).css( {
			"overflow": "visible",
			"max-height": "none"
		} );
	}
	var pageShow = function( ) {
		orientationChange( );
	}
	var orientationChange = function( ) {
		$( "#bookAppointments, #schedulesList" ).addClass( 'backround-page-for-multiple-dialogs' );
		$( "#schedulesList" ).addClass( 'no-background' );
		page.addClass( 'top-dialog' );

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
		if ( $( '#schedulesList' ).height() > higherHeight ) {
			higherPage = '#schedulesList';
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

		inputCancelReason = $( '#cancel-schedule-reason' );
		selectLinkedSwitchWrapperBlock = $( '#cancel-schedule-linked-switch-wrapper' );
		selectLinkedSwitchWrapper = selectLinkedSwitchWrapperBlock.find( '.e-input' );
		linkedAppointmentsWrapper = $( '#cancel-schedule-linked-appointments-wrapper' );
		closeDialogBtn = $( '#cancel-schedule-close' );
		submitCancelSchedule = $( '#cancel-schedule-submit' );

		selectLinkedSwitchWrapper.find( 'div' ).on( 'click', function( e) {
			var el = $( this );
			selectLinkedSwitchWrapper.find( 'div' ).not( el ).removeClass( 'ui-radio-on ui-btn-active' ).addClass( 'ui-radio-off' );
			el.removeClass( 'ui-radio-off' ).addClass( 'ui-radio-on ui-btn-active' );
		} );

		submitCancelSchedule.on( 'click', function( e ) {
			var valid = validateFields();
			if ( valid ) {
				that.data.object.lastModified = _app.util.getISONowUTCDate();
				_app.dataProvider.cancelSchedule( _app.controller.patient.id, that.data.scheduleId, that.data.object );
				jQuery(document).trigger('emis.needsync', ['schedules']);

				emis.mobile.console.log( "cancel schedule object: " + JSON.stringify( that.data.object ) );

				unbindEvents( );
				$.mobile.changePage( "#bookAppointments" );
				setTimeout(function() {
					$.mobile.changePage( "#schedulesList" );
				}, 1000);
			}
		} );

		closeDialogBtn.on( 'click', function( e ) {
			unbindEvents( );
			$.mobile.changePage( "#bookAppointments" );
			setTimeout(function() {
				$.mobile.changePage( "#schedulesList" );
			}, 1000);
		} );
	});

	function fillLinkedAppointmentsTable( linkedAppointments ) {
		var markup = '';

		markup += '<div class="contentPanel">';
		markup += '<div class="top-header-text">Linked appointments</div>';

		/* header */
		markup += '<div class="header grid">';
		markup += '<div class="e-blocks">';
		markup += '<div class="grid-4 e-block-a">Date</div>';
		markup += '<div class="grid-4 e-block-b">At</div>';
		markup += '<div class="grid-4 e-block-c">Session holder</div>';
		markup += '<div class="grid-4 e-block-d">Session name</div>';
		markup += '</div>';
		markup += '</div>';

		/* content */
		markup += '<div class="content grid scroll">';

		for (var i = 0; i < linkedAppointments.length; i++) {
			var linkedAppointment = linkedAppointments[i];
			markup += '<div class="e-blocks">';
			var startDate = linkedAppointment.startDateTime;
			markup += '<div class="grid-4 e-block-a">' + _app.util.getWeekDayShort( _app.util.getDate( startDate ) ) + ' ' + _app.util.standardizeDate( startDate ) + '</div>';
			markup += '<div class="grid-4 e-block-b">' + _app.util.standardizeTime( startDate ) + '</div>';
			markup += '<div class="grid-4 e-block-c">' + _.h( linkedAppointment.sessionOwners ) + '</div>';
			markup += '<div class="grid-4 e-block-d">' + _.h( linkedAppointment.sessionName ) + '</div>';
			markup += '</div>';
		}

		markup += '</div>';
		markup += '</div>';

		linkedAppointmentsWrapper.html( markup );

		var linkedAppointmentsScrollStartPos = 0;
		var additionalInfoInnerDiv = linkedAppointmentsWrapper.find( 'div.scroll' );
		additionalInfoInnerDiv.on( 'touchstart', function( e ) {
			linkedAppointmentsScrollStartPos = this.scrollTop + e.originalEvent.touches[0].pageY;
		} );
		additionalInfoInnerDiv.on( 'touchmove', function( e ) {
			if ( this.scrollHeight > $( this ).height( ) ) {
				this.scrollTop = linkedAppointmentsScrollStartPos - e.originalEvent.touches[0].pageY;
				e.preventDefault( );
			}
		} );
	};

	function reloadFields() {
		unvalidateFields();

		selectLinkedSwitchWrapper.find( 'div[data-cancel="on"]' ).removeClass( 'ui-radio-on ui-btn-active' ).addClass( 'ui-radio-off' );
		selectLinkedSwitchWrapper.find( 'div[data-cancel="off"]' ).removeClass( 'ui-radio-off' ).addClass( 'ui-radio-on ui-btn-active' );

		inputCancelReason.val( '' );

		var linkedAppointments = _app.dataProvider.getLinkedAppointments( _app.controller.patient.id, that.data.scheduleId );
		if ( linkedAppointments && linkedAppointments.length ) {
			selectLinkedSwitchWrapperBlock.show();
			linkedAppointmentsWrapper.show();
			fillLinkedAppointmentsTable( linkedAppointments );
		} else {
			selectLinkedSwitchWrapperBlock.hide();
			linkedAppointmentsWrapper.hide();
		}
	};

	function unvalidateFields() {
		inputCancelReason.parent().removeClass( 'notValid' );
	};

	function validateFields() {
		unvalidateFields();

		var valid = true;
		var cancelObject = {};
		var schedule = _app.dataProvider.getSchedule( that.data.scheduleId );

		cancelObject.patientId = _app.controller.patient.id;
		cancelObject.slotId = _app.controller.slotId;
		if ( schedule.data.id ) {
			cancelObject.patientScheduleId = schedule.data.id;
		} else if ( schedule.data.patientScheduleId ) {
			cancelObject.patientScheduleId = schedule.data.patientScheduleId;
		}

		var cancelReason = _app.sanitizer.sanitize( inputCancelReason.val() );
		if ( cancelReason ) {
			cancelObject.cancellationReason = cancelReason;
		} else {
			valid = false;
			inputCancelReason.parent().addClass( 'notValid' );
		}

		var selectedLinkedSwitch = selectLinkedSwitchWrapper.find( 'div.ui-radio-on' );
		var bCancelLinkedAppointments = false;
		if ( selectedLinkedSwitch.data( 'cancel' ) == 'on' ) {
			bCancelLinkedAppointments = true;
		}
		cancelObject.deleteAssociatedAppointments = bCancelLinkedAppointments;

		that.data.object = cancelObject;

		return valid;
	};

	this.bindDataAndEvents = function( $page ) {

		reloadFields();

		emis.mobile.UI.addOrientationEventsForDialog( orientationChange );
		orientationChange( );
	};

	return this;
}
