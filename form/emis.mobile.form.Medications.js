/**
 * Medications form conctroller Functionalities provided:
 */

emis.mobile.form.Medications = function( appObject ) {
	var _app = appObject;
	var that = this;
	this.medications = null;

	function onclickListButton( e ) {
		window.scrolled = $( window ).scrollTop( );
		var $el = $( e.currentTarget );
		var fctrs = _app.controller.getFormControllerStruct( '#patientmedicationdetails' );
		var x = that.medications[$el.data( "em-medication-section" )];
		fctrs.controller.data.medication = x[parseInt( $el.data( "em-medication-index" ) )];
	}

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

	function fillSectionListview( markup, data, sectionTitle, sectionName ) {

		if ( !markup )
			markup = '';

		if ( _app.util.isEmptyObject( data ) ) {
			markup += getSectionNoData( sectionTitle );
		} else {

			markup += getSectionOpen( );

			var sItemsCount = '';
			markup += getSectionHeaderOpen( );
			markup += '<div class="no-data">' + sectionTitle + ' (None)</div>';
			markup += '<div class="e-blocks">';
			markup += '<div class="grid-4 e-block-a">' + sectionTitle + sItemsCount + ' </div>';
			markup += '<div class="grid-4 e-block-b">Issues</div>';
			markup += '<div class="grid-4 e-block-c">Date of Issue</div>';
			markup += '<div class="grid-4 e-block-d"></div>';
			markup += '</div>';
			markup += getSectionHeaderClose( );

			/* content */
			markup += getSectionContentOpen( );

			for ( var i = 0; i < data.length; i++ ) {
				var medication = data[i];

				markup += '<div class="e-blocks"';
				if(medication.organisationId) {
					markup += ' data-org="' + medication.organisationId + '"';
				}
				markup += '>';
				markup += '<div class="grid-4 e-block-a">' + _.h( medication.term ) + ' ';
				if(medication.organisationId) {
					markup += '<i class="shared-orgs"></i>';
				}
				markup += '<span class="info-sub">' + _.h( medication.dosage ) + ' (' + _.h( medication.quantity ) + ')</span></div>';
				markup += '<div class="grid-4 e-block-b">' + _.h( medication.issueNumber ) + '</div>';
				markup += '<div class="grid-4 e-block-c">' + _.h( medication.issueDate ? medication.issueDate : medication.lastIssueDate ) + '</div>';
				markup += '<div class="grid-4 e-block-d"><a data-role="none" data-em-medication-index="' + i + '" data-em-medication-section="' + _.h(sectionName) + '" class="button" href="#patientmedicationdetails">View record</a></div>'
				markup += '</div>';

			}

			markup += getSectionContentClose( );
			markup += getSectionClose( );
		}
		return markup;
	}

	var unbindEvents = function( ) {
		emis.mobile.UI.removeOrientationEventsForDialog( orientationChange );
	}
	function orientationChange( ) {
		$( "#patientmedications" ).css( {
			"min-height": 300
			// to redo jquery.mobile.1.1.1.js : 2881 min-height set
		} )
	}


	this.bindDataAndEvents = function( $page, refresh ) {
		$page.off( 'pagehide', unbindEvents );
		$page.off( 'pageshow', orientationChange );
		// injectSelectMenu is called inside prepareMedicationPage
		emis.mobile.UI.prepareMedicationPage( $page );

		that.medications = _app.dataProvider.getPatientMedications( );

		if ( refresh === true ) {
			// Clear the markup
			$( "#medicationContent" ).html( "" );

			if ( !_app.util.isEmptyObject( that.medications ) ) {
				// Prepare the markup
				var markup = '';
				markup = fillSectionListview( markup, that.medications.acute, 'Acute medication', 'acute' );
				markup = fillSectionListview( markup, that.medications.repeat, 'Repeat medication', 'repeat' );
				markup = fillSectionListview( markup, that.medications.repeatDispensing, 'Repeat dispensing medication', 'repeatDispensing' );
			} else {
				// Prepare the markup
				var markup = '';
				markup = fillSectionListview( markup, null, 'Acute medication', 'acute' );
				markup = fillSectionListview( markup, null, 'Repeat medication', 'repeat' );
				markup = fillSectionListview( markup, null, 'Repeat dispensing medication', 'repeatDispensing' );
			}

			// Inject the markup
			$( "#medicationContent" ).html( markup );

			// Bind button click events
			$( "#medicationContent a.button" ).on( "click", onclickListButton );

			// Inject the page title (info)
			var data = _app.dataProvider.getPatientDemographic( );
			emis.mobile.UI.preparePatientHeader() ;

			// emis.mobile.UI.returnToScrolledPosition();
		}

		emis.mobile.UI.addOrientationEventsForDialog( orientationChange );
		orientationChange( );
		emis.mobile.UI.tryBindShowHideToPage($page, orientationChange, unbindEvents)

		// Clear the markup
		var addBtn = $( '#patientmedications #addDrugBtn' );
		addBtn.html( "" );
		var html = "\n<option value='0' disabled='disabled' selected='selected' style='display: none;'>Add drug</option>";
		html += "<option value='acute'>Acute</option>";
		html += "<option value='repeat'>Repeat</option>";
		addBtn.html( '<select data-role="none" class="styled-select styled-select-add-drug">' + html + '</select>' );

		$( '#patientmedications #addDrugBtn' ).unbind( );
		$( '#patientmedications #addDrugBtn' ).on( 'change', function( event ) {
			var selectedOption = $( event.target ).val( );
			var ctrl = _app.controller.getFormControllerStruct( '#addDrug' ).controller;
			if ( selectedOption == 'repeat' ) {
				// otherwise it will be set to 'acute', the default value.
				ctrl.rxType = 'repeat';
			} else if ( selectedOption == 'acute' ) {
				ctrl.rxType = 'acute';
			}

			$.mobile.changePage( "#addDrug", {
				delay: true
			} );
		} );
		main.controller.sharedOrgs.attachSharedOrgsToScreen(that, "#patientmedications", ".content.grid > .e-blocks", that.medications)
	};

	return this;
}
