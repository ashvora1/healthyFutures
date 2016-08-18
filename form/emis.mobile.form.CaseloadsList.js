/**
 * Caseloads form controller Functionalities provided:
 */

emis.mobile.form.CaseloadsList = function( appObject ) {
	var _app = appObject;
	var _bStaticElementsInitialised = false;
	var visiblePatientsCounter = null ;
	var visibleScrollPagesCounter = null ;
	var lastScrollSessionEntryId = null ;
	var lastScrollSlotId = null ;
	var bScrollHandlerEnabled = null ;
	var bEnoughPatientsToScroll = null ;
	var lastScrollTop = null ;
	var allEntries = null ;
	var currentEntries = null ;
	var totalPatients = null ;
	var filteredPatientsNumber = null ;

	function enableSyncBtn( bEnable ) {
		if ( bEnable ) {
			$( "#caseloads .syncBtn" ).on( "click", synchronisationStart ).removeClass( "ui-disabled" );
		} else {
			$( "#caseloads .syncBtn" ).off( "click", synchronisationStart ).addClass( "ui-disabled" );
		}
	}

	function updateOfflineElements( ) {
		enableSyncBtn( !offline );
		if ( !offline ) {
			$( "#caseloadsContent .get-record" ).removeClass( "ui-disabled" );
		} else {
			$( "#caseloadsContent .get-record" ).addClass( "ui-disabled" );
		}
	}

	function getValue( value ) {
		if ( value != null ) {
			return value;
		}
		else {
			return '';
		}
	}

	function getSectionNoData( sectionTitle ) {
		return '<div class="contentPanel"><div class="header no-data">' + sectionTitle + ' (None)</div></div>'
	}

	function getSectionSessionOpen( date ) {
		return '<div class="over-content caseloads-array"><div class="over-header">' + date + '</div>';
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

	function isSuitablePatient( slot ) {
		return (( slot.PatientId != null && slot.PatientId != 'null' ) || ( slot.PatientName != null && slot.PatientName != 'null' ));
	}

	function fillNoData( ) {
		var markup = '';
		markup += getSectionSessionOpen( "" );
		markup += getSectionNoData( "Caseloads" );
		markup += getSectionSessionClose( );
		return markup;
	}

	function fillSectionListview( markup, entries, patientsNumber, bFromScroll, elToLoad ) {
		if ( !markup )
			markup = '';

		if ( !_app.util.isEmptyObject( entries ) && entries.length ) {
			// variable to differentiate if sessions are on the same day
			var isLastToScroll = false;
			for ( var i = 0; i < entries.length; i++ ) {
				var entry = entries[i];
				var closeSessionSection = true;
				if ( entry ) {
					var sessionId = entry.SessionId;
					if ( lastScrollSessionEntryId != null ) {
						if ( sessionId == lastScrollSessionEntryId ) {
							lastScrollSessionEntryId = null;
							closeSessionSection = false;
						} else {
							continue;
						}
					}

					var description = entry.Description;
					var startDate = _app.util.standardizeDateAppointment( entry.StartDateTime );
					var sessionHolderDisplayName = entry.SessionHolderDisplayName;
					var sessionCategoryName = entry.SessionCategoryName;
					var availableForMobile = entry.AvailableForMobile;

					markup += getSectionSessionOpen( startDate );
					markup += getSectionOpen( );

					var slots = entries[i].slots;
					if ( slots ) {
						if ( slots.length === 0 ) {
							markup += getSectionHeaderNoDataOpen( );
							markup += getHeader( description, sessionHolderDisplayName, sessionCategoryName );
							markup += getSectionHeaderNoDataClose( );
							markup += getSectionContentOpen( );
							markup += '<div class="noData">No caseloads found.</div>';
							markup += getSectionContentClose( );
						} else {
							/* header */
							markup += getSectionHeaderOpen( );
							markup += getHeader( description, sessionHolderDisplayName, sessionCategoryName );
							markup += getSectionHeaderClose( );

							/* content */
							markup += getSectionContentOpen( );
							markup += '<table>';

							var closeSessionContentSection = true;
							for ( var j = 0; j < slots.length; j++ ) {
								var slot = slots[j];
								var slotId = slot.SlotId;
								if ( lastScrollSlotId != null ) {
									if ( lastScrollSlotId == slotId ) {
										lastScrollSlotId = null;
										$( "#caseloads .last-to-scroll" ).removeClass( "last-to-scroll" );
										markup = "";
										closeSessionContentSection = false;
									}
									continue;
								}
								var sessionId = slot.SessionId;
								var patientId = slot.PatientId;
								var patientName = slot.PatientName;
								var patientRecord = slot.patientRecord;

								if ( isSuitablePatient( slot ) ) {
									markup += '<tr id="caseloads-row-'+slotId+'" class="caseloads-row';
									if ( slots[j + 1] && isSuitablePatient( slots[j + 1] ) ) {
										visiblePatientsCounter++;
										if ( visiblePatientsCounter % MAX_PATIENT_FULL_DOM_LOAD == 0 && visiblePatientsCounter != patientsNumber ) {
											bEnoughPatientsToScroll = true;
											isLastToScroll = true;
											lastScrollSlotId = slotId;
											lastScrollSessionEntryId = sessionId;
											markup += ' last-to-scroll scroll-point">';
										} else {
											markup += '">';
										}
									} else {
										markup += '">';
									}

									markup += '<td class="grid-5 e-block-a time-col">';
									markup += '<span class="arrow-down toggle-details" data-em-slotid="' + slotId + '"  data-em-patientid="' + patientId + '"></span></td>';
									markup += '<td class="grid-5 e-block-b">';
									markup += '<a data-role="none" class="button standaloneButton standaloneButton-dark patientDetailsInfo" data-em-slotid="'+slotId+'"><span class="icon">&nbsp;</span></a>';
									markup += '<div class="star-wrap">' + _.h(patientName);

									// patient star
									markup += '<div id="star-' + patientId + '_' + slotId + '" class="patientStar sync star-guid-' + patientId + '">';
									markup += '</div></div></td>';

									markup += '<td class="grid-5 e-block-c" >';
									if (patientRecord) {
										markup += _.h( patientRecord.DoB ) + ' (' + _.h( patientRecord.age ) + ')<span class="DoB-format2">' + _.h( patientRecord.DoB2 ) ;
									}
									markup += '</td>';
									markup += '<td class="grid-5 e-block-d">' ;
									if (patientRecord) {
										markup += _.h( patientRecord.NHS ) ;
									}
									markup += '</td>';
									markup += '<td class="grid-5 e-block-e">';
									if ( availableForMobile && patientId != null ) {
										var isRecordInStorage = false;

										//TODO: add searching if record is in storage

										markup += '<a href data-role="none" class="button get-record" ';
										markup += 'data-em-slotid="' + slotId + '" ';
										markup += 'data-em-patientid="' + patientId + '" ';
										if ( isRecordInStorage ) {
											markup += 'style="display:none"';
										}
										markup += '>Get record</a>';

										markup += '<a href data-role="none" class="button green view-record" ';
										markup += 'data-em-slotid="' + slotId + '" ';
										markup += 'data-em-patientid="' + patientId + '" ';
										if ( ! isRecordInStorage ) {
											markup += 'style="display:none"';
										}
										markup += '>View record</a>';
									}
									markup += '</td>';
									markup += '</tr>';
								}

								if ( isLastToScroll ) {
									markup += "<tr class='patient-loader'><td colspan='5'><div class='patient-loader'></div></td></tr>";
									break;
								}
							}

							if ( closeSessionContentSection ) {
								markup += '</table>';
								markup += getSectionContentClose( );
							}
						}
					}

					if ( closeSessionSection ) {
						markup += getSectionClose( );
						markup += getSectionSessionClose( );
					}
				}

				if ( isLastToScroll ) {
					break;
				} else if ( bFromScroll && elToLoad ) {
					bFromScroll = false;
					elToLoad.after( markup );
					markup = "";
					elToLoad = elToLoad.parents( "div.caseloads-array" );
				}
			}
		} else {
			markup += fillNoData();
		}

		if ( elToLoad ) {
			elToLoad.after( markup );
		}

		return markup;
	};

	function loadAllData( ) {
		totalPatients = 0;
		allEntries = _app.dataProvider.getAllSessionIDs( );
		if ( !_app.util.isEmptyObject( allEntries ) ) {
			for ( var i = 0; i < allEntries.length; i++ ) {
				var entry = _app.dataProvider.getSessionById( allEntries[i] );
				if ( entry ) {
					var availableForMobile = entry.AvailableForMobile;
					var slots = _app.dataProvider.getAllAppointmentsBySession( allEntries[i] );
					if ( slots ) {
						for ( var j = 0; j < slots.length; j++ ) {
							var slot;
							if ( slots[j].PatientId ) {
								slot = _app.dataProvider.getAppointmentById( slots[j].SlotId );
							} else {
								slot = _app.dataProvider.getAppointmentById( "nullId" + slots[j].SlotId );
							}
							if ( slot == null ) {
								slot = slots[j].object;
							}
							if ( isSuitablePatient( slot ) ) {
								totalPatients++;
								var patientId = slot.PatientId;
								var patientRecord = _app.dataProvider.getPatientById( patientId );
								if ( !_app.util.isEmptyObject( patientRecord ) ) {
									patientRecord.DoB = emis.mobile.Utilities.prototype.standardizeDate( patientRecord.birthDate );
									patientRecord.DoB2 = emis.mobile.Utilities.prototype.standardizeDateAppointment2( patientRecord.birthDate );
									var patientNHS = "Unknown";
									if ( patientId != 'null' && availableForMobile ) {
										patientNHS = patientRecord.primaryIdentifier;
										if ( patientNHS ) {
											patientRecord.unformattedNHS = patientNHS;
											patientNHS = emis.mobile.Utilities.prepareNHS( patientNHS );
										} else {
											patientNHS = "Unknown";
										}
									}
									patientRecord.NHS = patientNHS;
									slot.patientRecord = patientRecord;
								}
							}
							slots[j] = slot;
						}
					}
					entry.slots = slots;
				}
				allEntries[i] = entry;
			}
		};
		filteredPatientsNumber = totalPatients;
	};

	function filterCaseloads( ) {
		resetScrollableData();
		filteredPatientsNumber = totalPatients;
		var val = $( this ).val( ); //TODO: add removing all white spaces and then check if != "" ?
		if ( val != "" && !_app.util.isEmptyObject( currentEntries ) ) {
			var entries = jQuery.extend( true, [], currentEntries );
			val = $.trim( val ).replace( / +/g, ' ' ).toLowerCase( ).split( " " );
			for ( var i = 0; i < entries.length; i++ ) {
				var entry = entries[i];
				entry.slots = $.grep( entry.slots, function( slot, index ) {
					var searchString = "";
					searchString += getValue( slot.PatientName ) + " ";
					var patientRecord = slot.patientRecord;
					if ( patientRecord ) {
						searchString += getValue( patientRecord.DoB ) + " ";
						searchString += getValue( patientRecord.DoB2 ) + " ";
						searchString += getValue( patientRecord.age ) + " ";
						searchString += getValue( patientRecord.NHS ) + " ";
						searchString += getValue( patientRecord.unformattedNHS ) + " ";
						searchString += getValue( patientRecord.address ) + " ";
						searchString += getValue( patientRecord.postcode );
					}
					searchString = searchString.replace( /\s+/g, ' ' ).toLowerCase( );

					var include = false;
					for ( var x = 0; x < val.length; x++ ) {
						if ( searchString.indexOf( val[x] ) != -1 ) {
							include = true;
							break;
						}
					}
					if ( ! include && isSuitablePatient( slot ) ) {
						filteredPatientsNumber--;
					}

					return include;
				});
			}
		} else {
			entries = allEntries;
		}

		currentEntries = entries;
		var markup = '';
		markup = fillSectionListview( markup, entries, filteredPatientsNumber );
		$( "#caseloadsContent" ).html( markup );
		emis.mobile.UI.scrollPage( 0 );
	}

	function resetScrollableData( ) {
		visiblePatientsCounter = 0;
		filteredPatientsNumber = 0;
		visibleScrollPagesCounter = 1;
		lastScrollSessionEntryId = null;
		lastScrollSlotId = null;
		bScrollHandlerEnabled = true;
		bEnoughPatientsToScroll = false;
		lastScrollTop = 0;
	}

	function clearMarkStars( ) {
		$( ".patientStar" ).removeClass( "patientStarAdded" );
	}

	/**
	 * Mark rows in table with stars to inform that templates or tasks exist for a patient
	 */
	function markWithStars( ) {
		var patientIdsArray = _app.dataProvider.getPatientIdsWithEventsets( true );
		for ( var k = 0; k < patientIdsArray.length; k++ ) {
			patientIdsArray[k] = patientIdsArray[k].replace( "#", "_" );
			$( "#star-" + patientIdsArray[k] ).addClass( 'patientStarAdded' );
			$('#sync-button-'+patientIdsArray[k]).removeClass('ui-disabled') ;
		}

		var patientGuidsArray = _app.dataProvider.getPatientIdsWithTasks( );
		for ( var k = 0; k < patientGuidsArray.length; k++ ) {
			$( ".star-guid-" + patientGuidsArray[k] ).addClass( 'patientStarAdded' );
			$('.sync-button-guid-'+patientGuidsArray[k]).removeClass('ui-disabled') ;
		}

		var patientNewDrugsGuidsArray = _app.dataProvider.findAllPatientIdsWithNewDrugs( );
		for ( var k = 0; k < patientNewDrugsGuidsArray.length; k++ ) {
			$( "[id^='star-" + patientNewDrugsGuidsArray[k] + "']" ).addClass( 'patientStarAdded' );
			$("[id^='sync-button-" + patientNewDrugsGuidsArray[k] + "']" ).removeClass('ui-disabled') ;
		}

		var patientQuickNotesArray = _app.dataProvider.findAllPatientIdsWithQuickNotes( );
		for ( var k = 0; k < patientQuickNotesArray.length; k++ ) {
			patientQuickNotesArray[k] = patientQuickNotesArray[k].replace( "#", "_" );
			$( "#star-" + patientQuickNotesArray[k] ).addClass( 'patientStarAdded' );
			$('#sync-button-'+patientQuickNotesArray[k]).removeClass('ui-disabled') ;
		}
	}

	var unbindEvents = function( ) {
		emis.mobile.UI.removeOrientationEventsForDialog( orientationChange );
	}
	function orientationChange( ) {
		$( "#caseloads" ).css( {
			// to redo jquery.mobile.1.1.1.js : 2881 min-height set
			"min-height": 300
		} )

		if ( emis.mobile.UI.isIE10 || emis.mobile.UI.isAtLeastIE11) {
			var appHeader = $( "#headerCaseloads" ).find( "h3" );
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

	function scrollHandler( e ) {
		if ( ! bScrollHandlerEnabled || ! bEnoughPatientsToScroll ) return false;

		var bScrollingDown = true;
		var scrollTopVal = $( window ).scrollTop();
		if ( scrollTopVal < lastScrollTop ){
			bScrollingDown = false;
		}
		lastScrollTop = scrollTopVal;

		var hideEmptyCaseholders = function() {
			$( "#caseloads .caseloads-array" ).show();
			$( "#caseloads .caseloads-array" ).filter( function() {
				if ( $(this).find( ".content.grid tr:visible" ).length == 0 ) {
					return true;
				}
				return false;
			}).hide();
		}

		var allRows = $( "#caseloads" ).find( ".content.grid tr" );
		var visibleScrollPoints = $( "#caseloads" ).find( ".content.grid tr.scroll-point:visible" );
		var scrollPointHeight = visibleScrollPoints.height();
		var hiddenScrollPoints = $( "#caseloads" ).find( ".content.grid tr.scroll-point:hidden" );
		var headersHeight = $("#headerCaseloads").height() * 2;
		if ( bScrollingDown ) {
			var lastVisibleScrollPoint = visibleScrollPoints.last();
			if ( lastVisibleScrollPoint.length &&
					scrollTopVal + $(window).innerHeight() + headersHeight >= lastVisibleScrollPoint.offset().top ) {
				bScrollHandlerEnabled = false;

				var lastToScrollEl = $( "#caseloads tr.last-to-scroll" );

				var indexOfLastVisibleScrollPoint = allRows.index( lastVisibleScrollPoint );
				var firstCondition = allRows.filter( function( index ) {
					return index > indexOfLastVisibleScrollPoint;
				}).filter( ":hidden" );
				//if ( visibleScrollPoints.last().nextAll( "tr:hidden" ).length ) {

				var hidePreviousAndShowLoader = function() {
					var indexOfRowToCheck = allRows.index( visibleScrollPoints.first() );
					allRows.filter( function( index ) {
						return index <= indexOfRowToCheck;
					}).hide();
					allRows.filter( function( index ) {
						return index > indexOfRowToCheck;
					}).filter( ".patient-loader" ).first().show();
				}

				//var scrollDiff =  $(window).innerHeight() + scrollPointHeight - headersHeight;
				var contentPadding = $( "#caseloadsContent .caseloads-array" ).first().css( "padding-top" );
				if ( contentPadding ) {
					contentPadding = parseInt( contentPadding, 10 );
				} else {
					contentPadding = 0;
				}
				var scrollDiff =  $(window).innerHeight() - headersHeight - contentPadding;

				if ( firstCondition.length ) {
					hidePreviousAndShowLoader();

					/*
					 * visibleScrollPoints.last().nextUntil( "tr.scroll-point" ).show();
					 * visibleScrollPoints.last().nextAll( "tr.scroll-point" ).first().show();
					 * visibleScrollPoints.last().nextAll( "tr.scroll-point" ).first().nextAll( "tr.patient-loader" ).first().show();
					 */
					var nextScrollPoint = allRows.filter( function( index ) {
						return index > indexOfLastVisibleScrollPoint;
					}).filter( ".scroll-point" ).first();
					var indexOfNextScrollPoint = allRows.index( nextScrollPoint );
					allRows.filter( function( index ) {
						return index > indexOfLastVisibleScrollPoint && index < indexOfNextScrollPoint;
					}).show();

					nextScrollPoint.show();

					allRows.filter( function( index ) {
						return index > indexOfNextScrollPoint;
					}).filter( ".patient-loader" ).first().show();
					/* ********** */

					/* elToCheckScroll.nextAll( "tr.patient-loader" ).first().hide(); */
					// elToCheckScroll == lastVisibleScrollPoint
					allRows.filter( function( index ) {
						return index > indexOfLastVisibleScrollPoint;
					}).filter( ".patient-loader" ).first().hide();
					/* ********** */

					hideEmptyCaseholders();

					lastScrollTop = lastVisibleScrollPoint.offset().top - scrollDiff;
					emis.mobile.UI.scrollPage( lastScrollTop );
				} else if ( lastToScrollEl.length ) {
					//var loadingRow = lastToScrollEl.nextAll( "tr.patient-loader" ).first();
					var indexOfRowToCheck = allRows.index( lastToScrollEl );
					var loadingRow = allRows.filter( function( index ) {
						return index > indexOfRowToCheck;
					}).filter( ".patient-loader" ).first();

					loadingRow.hide();
					fillSectionListview( "", currentEntries, filteredPatientsNumber, true, loadingRow );

					$( "#caseloads tr.caseloads-row" ).last().addClass( "scroll-point" );
					if ( ++visibleScrollPagesCounter >= MAX_PATIENT_SCROLL_PAGES ) {
						hidePreviousAndShowLoader();
					}

					hideEmptyCaseholders();

					lastScrollTop = lastToScrollEl.offset().top - scrollDiff;
					emis.mobile.UI.scrollPage( lastScrollTop );
				}
				bScrollHandlerEnabled = true;
			}
		} else if ( hiddenScrollPoints.length ) {

			var indexOfRowToCheck = allRows.index( visibleScrollPoints.first() );
			// var nearestWaypoint = visibleScrollPoints.first().prevAll( "tr.scroll-point:hidden" ).first();
			var nearestWaypoint = allRows.filter( function( index ) {
				return index < indexOfRowToCheck;
			}).filter( ".scroll-point:hidden" ).last();

			if ( nearestWaypoint.length ) {
				var indexOfNearestWaypoint = allRows.index( nearestWaypoint );
				var firstCaseloadRow = allRows.filter( function( index ) {
					return index > indexOfNearestWaypoint;
				}).filter( ".caseloads-row" ).first();
				if ( firstCaseloadRow.length && firstCaseloadRow.offset().top >= scrollTopVal + headersHeight ) {
					bScrollHandlerEnabled = false;

					/*
					 * nearestWaypoint.prevUntil( "tr.scroll-point" ).show();
					 * nearestWaypoint.show();
					 */
					var previousScrollPoint = allRows.filter( function( index ) {
						return index < indexOfNearestWaypoint;
					}).filter( ".scroll-point" ).last();
					var indexOfPreviousScrollPoint = allRows.index( previousScrollPoint );
					allRows.filter( function( index ) {
						return index > indexOfPreviousScrollPoint && index <= indexOfNearestWaypoint;
					}).show();
					/* ********** */

					/* nearestWaypoint.nextAll( "tr.patient-loader" ).first().hide(); */
					allRows.filter( function( index ) {
						return index > indexOfNearestWaypoint;
					}).filter( ".patient-loader" ).first().hide();
					/* ********** */


					/* nearestWaypoint.prevAll( "tr.patient-loader" ).first().show(); */
					allRows.filter( function( index ) {
						return index < indexOfNearestWaypoint;
					}).filter( ".patient-loader" ).last().show();
					/* ********** */


					var indexOfLastVisibleScrollPoint = allRows.index( visibleScrollPoints.last() );
					/*
					 * visibleScrollPoints.last().prevUntil( "tr.scroll-point" ).hide();
					 * visibleScrollPoints.last().hide();
					 */
					var previousScrollPoint = allRows.filter( function( index ) {
						return index < indexOfLastVisibleScrollPoint;
					}).filter( ".scroll-point" ).last();
					var indexOfPreviousScrollPoint = allRows.index( previousScrollPoint );
					allRows.filter( function( index ) {
						return index > indexOfPreviousScrollPoint && index <= indexOfLastVisibleScrollPoint;
					}).hide();
					/* ********** */

					/* visibleScrollPoints.last().nextAll( "tr.patient-loader" ).first().hide(); */
					allRows.filter( function( index ) {
						return index > indexOfLastVisibleScrollPoint;
					}).filter( ".patient-loader" ).first().hide();
					/* ********** */

					/* visibleScrollPoints.last().prevAll( "tr.patient-loader" ).first().show(); */
					allRows.filter( function( index ) {
						return index < indexOfLastVisibleScrollPoint;
					}).filter( ".patient-loader" ).last().show();
					/* ********** */

					/* hide empty */

					$( "#caseloads .caseloads-array" ).filter( function() {
						if ( $(this).find( "tr:visible" ).length == 0 ) {
							return true;
						}
						return false;
					}).hide();

					hideEmptyCaseholders();

					lastScrollTop = nearestWaypoint.offset().top - headersHeight;
					emis.mobile.UI.scrollPage( lastScrollTop );

					bScrollHandlerEnabled = true;
				}
			}

		}
	};

	// register global page events
	$( document ).delegate("#caseloads", "pageinit", function() {

		var $page = $(this) ;

		emis.mobile.UI.tryBindShowHideToPage($page, orientationChange, unbindEvents)

		// Bind button click events by jquery delegate
		$( "#caseloadsContent" ).on( 'click', '.button', function(e) {
			var $el = $( this );
			if ( $el.hasClass('view-record') ) {
				if ( $el.data( 'em-slotid' ) != undefined ) {
					_app.controller.makeAllSubpagesRefreshable( );
					emis.mobile.form.CaseloadsList.openPatient( $el.data( 'em-patientid' ), $el.data( 'em-slotid' ) );
				}
			} else if ( $el.hasClass('get-record') ) {
				if ( $el.hasClass( "ui-disabled" ) ) {
					return false;
				}
				if ( $el.data( 'em-slotid' ) != undefined ) {
					// TODO: getPatient and on callback hide button and show "View record button"
					var callback = function( getRecordButton ) {
						return function() {
							getRecordButton.hide();
							getRecordButton.siblings( ".view-record" ).show();
						}
					} ( $el );

					callback();
				}
			} else if ( $el.hasClass('sync-patient') ){
				if ( $el.hasClass('ui-disabled') ) {
					return false;
				}
				var slotId = $(this).data('data-pid-slotid') ;
				if (slotId) {
					slotId = slotId.split('_') ;
					slotId = slotId[1] ;
					main.controller.syncSinglePatientSlotId = slotId ;
					emis.mobile.UI.startSynchronize();
				}
				e.preventDefault();
			} else if ( $el.hasClass('patientDetailsInfo') ){
				var slotId =  $el.data('em-slotid') ;
				emis.mobile.UI.openPatientDetails(slotId) ;
			}
		} );

		$('#caseloadsContent').on('click', '.toggle-details', function(event) {
			var slotId = $(this).data('em-slotid') ;
			var patientId = $(this).data('em-patientid') ;
			if (slotId) {
				emis.mobile.form.CaseloadsList.toggleDetails(slotId, patientId) ;
			}
			event.preventDefault() ;
		}) ;

		$( document ).on( "scroll", $.throttle( 250, scrollHandler ) );


		$( '#caseloadsInputFilter' ).keyup( filterCaseloads );
		initialiseStaticElements( );
	});

	function fillPage() {
		if ( !_app.util.isEmptyObject( currentEntries ) ) {
			var markup = '';
			markup = fillSectionListview( markup, currentEntries, totalPatients );
			$( "#caseloadsContent" ).html( markup );
		} else {
			var markup = ''
			markup += fillNoData();
			$( "#caseloadsContent" ).html( markup );
		}
	}

	this.bindDataAndEvents = function( $page, refresh ) {
		window.offlinePass = null;
		main.controller.Logged = true;
		main.controller.duringSynchronisation = false;
		main.controller.warningsDisplayed = [];
		$( '#caseloadsInputFilter' ).val( "" );

		emis.mobile.UI.prepareCaseloadsPage( $page );

		_app.controller.patient.id = null;
		main.controller.previousSlotId = _app.controller.slotId;
		_app.controller.slotId = null;

		if ( refresh === true ) {
			resetScrollableData();
			loadAllData();
			currentEntries = allEntries;
			fillPage();
		} else {
			currentEntries = allEntries;
			resetScrollableData();
			filteredPatientsNumber = totalPatients;
			fillPage();
			emis.mobile.UI.scrollPage( 0 );
		}

		clearMarkStars( );
		markWithStars( );


		updateOfflineElements( );



		/* fix for #113291 and all similar problems in the future */
		$( "#drawer li" ).removeClass( "drawer-active" ).siblings( "#drawer-caseloads" ).addClass( "drawer-active" );

		emis.mobile.UI.addOrientationEventsForDialog( orientationChange );
		orientationChange( );


	};

	function synchronisationStart( e ) {
		if ( $( this ).hasClass( "ui-disabled" ) ) {
			return false;
		}
		main.controller.syncSinglePatientSlotId = null;
		emis.mobile.UI.startSynchronize();
	}

	function initialiseStaticElements( ) {
		if ( !_bStaticElementsInitialised ) {
			_bStaticElementsInitialised = true;
			$( "#caseloads .syncBtn" ).on( "click", synchronisationStart );

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
}

emis.mobile.form.CaseloadsList.getDetailsHtml = emis.mobile.form.AppointmentsList.getDetailsHtml ;

emis.mobile.form.CaseloadsList.toggleDetails = function (slotId, patientId) {
	var appRow = $('#caseloads-row-'+slotId) ;
	var details = appRow.next('.appointment-details[data-pid-slotid="' + patientId + '_' + slotId + '"]') ;
	if (details.length) {
		$(details).remove() ;
		appRow.find('.time-col').removeClass('open') ;
	} else {
		var detailsHtml = this.getDetailsHtml (appRow, slotId, patientId) ;
		appRow.after(detailsHtml) ;
		appRow.find('.time-col').addClass('open') ;
		$('#caseloads-details-'+slotId+' .controlgroup').controlgroup({ mini: true }) ;
	}
} ;

emis.mobile.form.CaseloadsList.openPatient = emis.mobile.form.AppointmentsList.openPatient ;
