/**
 * Patient summary form conctroller Functionalities provided:
 */

emis.mobile.form.PatientSummary = function( appObject ) {
	var _app = appObject;
	var _bStaticElementsInitialised = false;
	var externalOrgsDataStoredForLater
	var sharedOrgsDict = {}
	var that = this;
	var summary = null;
	var pageid = 'patientsummary' ;


	var dotClass = '<span class="content-separator">&bullet;</span>';

	/** returns html markup for header when there is no data */
	function getSectionNoData( sectionTitle ) {
		// sectionTitle in this case is used as the name of the class

		return '<div class="contentPanel"><div class="header withButtonInside ' + sectionTitle + ' no-data "><a href="" data-role="none" class="button grey">' + sectionTitle + ' (None)</a></div><div class="content"></div></div>';
	}

	function getSectionNoDataNoButton( sectionTitle, bIsHealthStatus ) {
		return '<div class="contentPanel' + ( bIsHealthStatus ? ' health-status-wrapper' : '' ) + '"><div class="header no-data ">' + sectionTitle + ' (None)</div>';
	}

	/** returns html markup for header */
	function getSectionOpen( sectionTitle, pageClass, toPage ) {
		return '<div class="contentPanel"><div class="header withButtonInside ' + pageClass + '"><a href="" data-role="none" class="button grey" data-to-page="'+toPage+'">' + sectionTitle + '</a></div>';
	}

	function getSectionOpenNoButton( sectionTitle, bIsHealthStatus ) {
		return '<div class="contentPanel' + ( bIsHealthStatus ? ' health-status-wrapper' : '' ) + '"><div class="header withoutButtonInside">' + sectionTitle + '</div>';
	}

	function getSectionClose( ) {
		return '</div>';
	}

	function getSectionContentOpen( ) {
		return '<div class="content">';
	}

	function getSectionContentClose( ) {
		return '</div>';
	}

	function getSectionHeaderText( text ) {
		return '<div class="headerText">' + text + '</div>';
	}

	function getSectionElement( textToWrap ) {
		return '<div class="element">' + textToWrap + '</div>';
	}

	function fillListviewWithSubSections( markup, list, list2, title, subTitle1, subTitle2, toPage ) {
		var row = 1;
		if ( !markup )
			markup = '';

		var sectionTitle = title;

		if ( _app.util.isEmptyObject( list ) && _app.util.isEmptyObject( list2 ) ) {
			markup += getSectionNoData( sectionTitle );
		} else {
			var lengthFirst = 0, lengthSecond = 0;

			if ( !_app.util.isEmptyObject( list ) )
				lengthFirst = list.length;
			if ( !_app.util.isEmptyObject( list2 ) )
				lengthSecond = list2.length;

			markup += getSectionOpen( sectionTitle + ' (' + ( lengthFirst + lengthSecond ) + ')', title, toPage );
			markup += getSectionContentOpen( );

			if ( lengthFirst > 0 ) {
				markup += getSectionHeaderText( subTitle1 );

				for ( var i = 0; i < list.length; i++ ) {
					var obj = list[i];

					var singleObjectWrapped = $(getSectionElement( dotClass + obj.term + '<span class="dateInfo"> (' + obj.onsetDate + ')</span>' ));
					if (obj.organisationId) {
						singleObjectWrapped.attr("data-org",obj.organisationId)
						var tailIcon = $(document.createElement('i'))
						tailIcon.addClass('shared-orgs')
						singleObjectWrapped.append(tailIcon)
					}
					markup += singleObjectWrapped[0].outerHTML
				}
			}

			if ( lengthSecond > 0 ) {
				markup += getSectionHeaderText( subTitle2 );

				for ( var i = 0; i < list2.length; i++ ) {
					var obj = list2[i];

					var singleObjectWrapped = $(getSectionElement( dotClass + obj.term ));
					if (obj.organisationId) {
						singleObjectWrapped.attr("data-org",obj.organisationId)
						var tailIcon = $(document.createElement('i'))
						tailIcon.addClass('shared-orgs')
						singleObjectWrapped.append(tailIcon)
					}
					markup += singleObjectWrapped[0].outerHTML
				}
			}

			markup += getSectionContentClose( );
			markup += getSectionClose( );
		}
		return markup;
	}

	function fillMedications( markup, list, list2, title, subTitle1, subTitle2, toPage ) {
		var row = 1;
		if ( !markup )
			markup = '';

		var sectionTitle = title;

		if ( _app.util.isEmptyObject( list ) && _app.util.isEmptyObject( list2 ) ) {
			markup += getSectionNoData( sectionTitle );
		} else {
			var lengthFirst = 0, lengthSecond = 0;

			if ( !_app.util.isEmptyObject( list ) )
				lengthFirst = list.length;
			if ( !_app.util.isEmptyObject( list2 ) )
				lengthSecond = list2.length;

			markup += getSectionOpen( sectionTitle + ' (' + ( lengthFirst + lengthSecond ) + ')', title, toPage );
			markup += getSectionContentOpen( );

			if ( lengthFirst > 0 ) {
				markup += getSectionHeaderText( subTitle1 );
				for ( var i = 0; i < list.length; i++ ) {
					var obj = list[i];

					var singleObjectWrapped;
					if(main.dataProvider.isMinimumPatientDataServiceVersion(main.controller.patient.id, "0003")) {
						singleObjectWrapped = $(getSectionElement( dotClass + obj.term));
					} else { //earlier version
						singleObjectWrapped = $(getSectionElement( dotClass + obj));
					}

					if (obj.organisationId) {
						singleObjectWrapped.attr("data-org",obj.organisationId)
						var tailIcon = $(document.createElement('i'))
						tailIcon.addClass('shared-orgs')
						singleObjectWrapped.append(tailIcon)
					}
					markup += singleObjectWrapped[0].outerHTML
				}

			}

			if ( lengthSecond > 0 ) {
				markup += getSectionHeaderText( subTitle2 );

				for ( var i = 0; i < list2.length; i++ ) {
					var obj = list2[i];

					var singleObjectWrapped;
					if(main.dataProvider.isMinimumPatientDataServiceVersion(main.controller.patient.id, "0003")) {
						singleObjectWrapped = $(getSectionElement( dotClass + obj.term));
					} else { //earlier version
						singleObjectWrapped = $(getSectionElement( dotClass + obj));
					}
					if (obj.organisationId) {
						singleObjectWrapped.attr("data-org",obj.organisationId)
						var tailIcon = $(document.createElement('i'))
						tailIcon.addClass('shared-orgs')
						singleObjectWrapped.append(tailIcon)
					}
					markup += singleObjectWrapped[0].outerHTML
				}

			}

			markup += getSectionContentClose( );
			markup += getSectionClose( );
		}
		return markup;
	}

	function fillListview( markup, list, sectionTitle, toPage ) {
		var row = 1;
		if ( !markup )
			markup = '';

		if ( !_app.util.isEmptyObject( list ) && list.length > 0 ) {
			markup += getSectionOpen( sectionTitle + ' (' + list.length + ')', sectionTitle, toPage );
			markup += getSectionContentOpen( );

			for ( var i = 0; i < list.length; i++ ) {
				var obj = list[i];

					var singleObjectWrapped;
					if(main.dataProvider.isMinimumPatientDataServiceVersion(main.controller.patient.id, "0003")) {
						singleObjectWrapped = $(getSectionElement( dotClass + obj.term));
					} else { //earlier version
						singleObjectWrapped = $(getSectionElement( dotClass + obj));
					}

					if (obj.organisationId) {
						singleObjectWrapped.attr("data-org",obj.organisationId)
						var tailIcon = $(document.createElement('i'))
						tailIcon.addClass('shared-orgs')
						singleObjectWrapped.append(tailIcon)
					}
					markup += singleObjectWrapped[0].outerHTML
			}

			markup += getSectionContentClose( );
			markup += getSectionClose( );
		} else {
			markup += getSectionNoData( sectionTitle );
		}
		return markup;
	}

	function fillListViewHealthStatus( markup, list, sectionTitle ) {
		var row = 1;
		if ( !markup ) {
			markup = '';
		}

		if ( !_app.util.isEmptyObject( list ) && list.length > 0 ) {
			markup += getSectionOpenNoButton( sectionTitle + ' (' + list.length + ')', true );
			markup += '<div class="content grid">';

			var i = 0, l = list.length, obj = null, date = null, term = null, valu = null;

			for ( i = 0; i < l; i++ ) {
				var healthStatusWithHistory = list[i];
				obj = healthStatusWithHistory[0];
				date = obj.date ? obj.date : '&nbsp;';
				term = obj.term ? obj.term : '&nbsp;';
				valu = getValue( obj.value ) ? getValue( obj.value ) : '&nbsp;';

				markup += '<div class="e-blocks element"';
				if(obj.organisationId) {
					markup += ' data-org="' + obj.organisationId + '"';
				}
				markup += '>';
				markup += '<div class="grid-3 e-block-a">' + _.h(date) + '</div>' + '<div class="grid-3 e-block-b">' + _.h(term);
				if(obj.organisationId) {
					markup += '<i class="shared-orgs"></i>';
				}
				markup += '</div>' + '<div class="grid-3 e-block-c">' + _.h(valu) + '</div>' + '</div>';
			}
			markup += '</div>';
			markup += getSectionClose( );
		} else {
			markup += getSectionNoDataNoButton( sectionTitle, true );
		}
		return markup;
	}

	function getValue( value ) {
		if ( value != null ) {
			return value;
		} else {
			return '';
		}
	}

	function fillListViewContacts( markup, contactList, sectionTitle, toPage ) {
		var row = 1;
		if ( !markup )
			markup = '';

		if ( !_app.util.isEmptyObject( contactList ) && contactList.length > 0 ) {
			markup += getSectionOpen( sectionTitle + ' (' + contactList.length + ')', sectionTitle, toPage );

			markup += '<div class="content grid">';

			var l = contactList.length;
			for ( var i = 0; i < l; i++ ) {
				var contact = contactList[i];
				var date = contact.date ? contact.date : '&nbsp;';
				var author = contact.author ? contact.author : '&nbsp;';
				var source = contact.source ? contact.source : '&nbsp;';

				markup += '<div class="e-blocks element"';
				if(contact.organisationId) {
					markup += ' data-org="' + contact.organisationId + '"';
				}
				markup += '>';
				markup += '<div class="grid-3 e-block-a">' + _.h(date) + '</div>' + '<div class="grid-3 e-block-b">' + _.h(author) + '</div>' + '<div class="grid-3 e-block-c">' + _.h(source);
				if(contact.organisationId) {
					markup += '<i class="shared-orgs"></i>';
				}
				markup += '</div></div>';
			}
			markup += '</div>';
			markup += getSectionClose( );
		} else {
			markup += getSectionNoData( sectionTitle );
		}
		return markup;
	}

	function enableMapBtn( bEnable ) {
		if ( bEnable ) {
			$( "#patientMapBtn" ).removeClass( "ui-disabled" );
		} else {
			$( "#patientMapBtn" ).addClass( "ui-disabled" );
		}
	}

	function updateOfflineElements( ) {
		enableMapBtn( !offline );
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

	var unbindEvents = function( ) {
		//$("#sharedRecordsButtonArea").remove();
		emis.mobile.UI.removeOrientationEventsForDialog( orientationChange );
	}

	function orientationChange( ) {
		$( "#" + pageid ).css( {
			"min-height": 300
			// to redo jquery.mobile.1.1.1.js : 2881 min-height set
		} );
	}


	// register global page events
	$( document ).delegate("#" + pageid, "pageinit", function() {
		var thatPage = $( this );
		// Bind button click events by jquery delegate
		thatPage.on( 'click', '.withButtonInside .button', function(e) {
			var page = $(this).data('to-page') ;
			if (page && $(this).text().indexOf( 'None' ) == -1 ) {
				e.preventDefault() ;
				$.mobile.changePage( '#'+page, {delay: true}) ;
				$(this).blur() ;
				return false ;
			}
		}) ;
		thatPage.on( 'refresh-health-status', function() {
			if ( summary ) {
				var healthStatus = main.dataProvider.filterSharedValuesWithHistory( summary.healthStatus, true );
				$( this ).find( '.health-status-wrapper' ).replaceWith( fillListViewHealthStatus( '', healthStatus, 'Health Status' ) );
				main.controller.sharedOrgs.detachEventsFromIcons( "#" + pageid );
				main.controller.sharedOrgs.attachEventsToIcons( "#" + pageid );
			}
		});

	}) ;


	// this.onsyncstatusupdated = function() {
	// 	$(".sharedRecordsButtonArea").remove()
	// }

	this.bindDataAndEvents = function( $page, refresh ) {

		var appt = main.dataProvider.getAppointmentById( main.controller.slotId );
		main.controller.currentlySelectedAppointment = appt;

		$page.off( 'pagehide', unbindEvents );
		$page.off( 'pageshow', orientationChange );

		// for some form data clearing
		if ( main.controller.lastTasksPatientId != main.controller.patient.id ) {
			main.controller.taskDescription = null;
			main.controller.taskDueDate = null;
			main.controller.taskUrgency = null;
			main.controller.taskType = null;
			main.controller.assignTo = null;
		}

		// the second parameter is for the alerts button to show
		emis.mobile.UI.preparePatientPage( $page, true );

		//emis.mobile.UI.updateDrawerStars( _app );

		$( '#drawer' ).off( 'click' ).on( 'click', function( ) {
			$( '.ui-datebox-screen' ).trigger( 'click' );
		} );

		summary = _app.dataProvider.getPatientSummary( );
		if ( refresh === true ) {
			$( '.alertsContainer' ).hide( );
			// Inject the markup
			$( "div#summaryContent" ).html( "" );

			if ( summary != null ) {

				var problems = summary.problems;
				var markup = '';
				var activeProblems = null;
				var significantPastProblems = null;
				if ( !_app.util.isEmptyObject( problems ) ) {
					activeProblems = problems.active;
					significantPastProblems = problems.significantPast;
				}

				markup = fillListviewWithSubSections( markup, activeProblems, significantPastProblems, 'Problems', 'Active Problems', 'Significant Past Problems', 'patientproblemslist');

				var medication = summary.medication;
				var medicationAcute = null;
				var medicationRepeat = null;
				if ( !_app.util.isEmptyObject( medication ) ) {
					medicationAcute = medication.acute;
					medicationRepeat = medication.repeat;
				}
				markup = fillMedications( markup, medicationAcute, medicationRepeat, 'Medication', 'Acute medication', 'Repeat medication', 'patientmedications');

				var allergies = summary.allergies;
				markup = fillListview( markup, allergies, 'Allergies', 'patientallergies');

				var contacts = summary.contacts;
				markup = fillListViewContacts( markup, contacts, 'Contacts', 'patientconsultations');

				var healthStatus = []; //health status is loaded at the end of the bindDataAndEvents
				// we load here only a placeholder for healthStatus block
				markup = fillListViewHealthStatus( markup, healthStatus, 'Health Status' );

				// Inject the markup
				$( "div#summaryContent" ).html( markup );

				// Inject the page title (info)
				emis.mobile.UI.preparePatientHeader () ;
			} else {
				$( "div#summaryContent" ).html( getSectionNoDataNoButton( 'Patient Summary' ) );
				$( ".patientSummaryInfo" ).html( '' );
			}


			emis.mobile.UI.injectSelectMenu( $page.selector );
		}

		// TODO: i've commented it because #patientMapBtn not exist and because of that we don't need to bind
		// offline events here - KKier
		// initialiseStaticElements();

		updateOfflineElements( );
		emis.mobile.UI.addOrientationEventsForDialog( orientationChange );


		$( "#selectPatientRecordDiv a.menuItem" ).removeClass( "pressed" );
		$( "#selectPatientRecordDiv a.menuItem[data-topage='#patientsummary']" ).addClass( "pressed" );


		/* fix for #113291 and all similar problems in the future */
		$( "#drawer li" ).removeClass( "drawer-active" ).siblings( "#drawer-patient-record" ).addClass( "drawer-active" );

		orientationChange( );

		main.controller.sharedOrgs.attachSharedOrgsToScreen(this, "#" + pageid, ".element", summary, true);

		//health status needs to be loaded again
		$( "#" + pageid ).trigger( 'refresh-health-status' );
	};



	return this;
};
