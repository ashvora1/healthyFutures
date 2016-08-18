/**
 * Login form controller Functionalities provided:
 */

emis.mobile.form.SharingViewPermission = function( appObject ) {
	var _app = appObject;
	var that = this;

	var _noConsent = "NoConsent";
	var lastPage;
	var panel = $("#editSchedule > div")
	oldHeight = $(".over-content.book-appointments.no-color").height()


	this.unbindEvents = function( ) {
		$("#sharingViewPermissionReason").val("Given")
		$("#sharingViewPermissionReasonDetailsText").val("")
		$("#ConsentAgreeBtn").off('click')
		$("#sharingViewPermissionCloseBtn").off('click')
		$( "#sharingViewPermission" ).unbind( );
		$( "#sharingViewPermissionReason").off('change')
		lastPage.off( 'pageshow', pageShow );
		emis.mobile.UI.removeOrientationEventsForDialog( orientationChange );
		$( "#appointments, #caseloads, #bookAppointments, #patientsummary, #patientmedications, #patientconsultations, #patientproblemslist, "
		+ "#patientvalues, #patientmedicationdetails, #patientimmunisations, "
		+ "#patientdiary, #patientallergies" ).css( {
			"max-height": "none",
			"overflow": "visible"
		} );
	}
	var pageShow = function( ) {
		orientationChange( );
	}
	var orientationChange = function( ) {
		var newHeight = emis.mobile.UI.calculateDialogPadding( _app );
		$( "#appointments, #caseloads, #bookAppointments, #patientsummary, #patientmedications, #patientconsultations, #patientproblemslist, "
		+ "#patientvalues, #patientmedicationdetails, #patientimmunisations, "
		+ "#patientdiary, #patientallergies" ).css( {
			"min-height": newHeight,
			"max-height": newHeight,
			"overflow": "hidden"
		} );

		if ( lastPage ) {
			lastPage.css( {
				"padding-bottom": "",
				"height": ""
			});
		}
	}
	function f( v ) {
		if ( v )
			return v;
		return '';
	}

	var toggleSwitch = function( itemOn, itemOff ) {
		itemOn.removeClass( "ui-radio-on ui-btn-active" ).addClass( "ui-radio-off" );
		itemOff.removeClass( "ui-radio-off" ).addClass( "ui-radio-on ui-btn-active" );
	};

	var handlePermissionReasonChange = function(){
		var aa = $('#sharingViewPermissionReason').val();
		if ($('#sharingViewPermissionReason').val() !== 'Other')
			$("#sharingViewPermissionReasonDetails").hide()
		else
			$("#sharingViewPermissionReasonDetails").show()
	}

	this.bindDataAndEvents = function( $page ) {

		lastPage = $page;
		this.unbindEvents( );
		handlePermissionReasonChange()
		$( "#sharingViewPermissionReason" ).on('change', handlePermissionReasonChange)

		$( "#sharingViewPermissionCloseBtn" ).click( function( e ) {
			saveObject(true);
			that.unbindEvents( );
			$.mobile.changePage( main.controller.sharedOrgs.sharingViewPermissionParent );
		} );

		emis.mobile.UI.addOrientationEventsForDialog( orientationChange );
		$page.on( 'pageshow', pageShow );

		var saveObject = function(cancel){
			cancel = cancel == null ? false : cancel;
			var result = {};
			var reason = $('#sharingViewPermissionReason').val();
			result["patientId"] = main.controller.patient.id;
			result["consentReason"] = cancel ? _noConsent : reason;

			//Fix for adding consentReasonText as the JSON properties are set to required.
			if(!cancel && reason != "Other") {
				result["consentReasonText"] = reason;
			}

			if ( !cancel && reason === 'Other') {
				result["consentReasonText"] = $("#sharingViewPermissionReasonDetailsText").val();
			}
			if ( !cancel && result["consentReasonText"] == "" ) {
				//Replacement for alert message
				$('#sharingViewPermissionReasonDetailsText').addClass('requiredFieldEmpty');
				return false;
			}

			result["timeCaptured"] = main.util.getISONowUTCDate();

			result = {"consentCapture": result};

			main.dataProvider.removePatientPreviousConsent( main.controller.patient.id );
			main.dataProvider.addConsent( result );

			jQuery(document).trigger('emis.needsync', ['consents']) ;

			return true;
		}

		$("#ConsentAgreeBtn").on('click', function(){
			var valid = saveObject(false);
			if ( valid ) {
				main.controller.sharedOrgs.lastOrgOpened[main.controller.patient.id] = "all";
				main.controller.currentlySharedOrg = "all";

				// refresh all pages that can have already filtered shared values
				// (if dataProvider.filterSharedValuesWithHistory method was used)
				main.controller.refreshPages[ "patientvalues" ] = true;
				main.controller.refreshPages[ "patientimmunisations" ] = true;
				main.controller.refreshPages[ "patientsummary" ] = true;

				$.mobile.changePage( main.controller.sharedOrgs.sharingViewPermissionParent );
				$("#accessSharedRecordsBtn").hide();
				$("#sharedRecordsFilter").show();
				that.unbindEvents();
			}
		})

		orientationChange( );
	};


	return this;
}