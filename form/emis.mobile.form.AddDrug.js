/**
 * AddDrug form controller Functionalities provided: - add drugs against a patient - view drug details - view pack
 * information - mark a prescription as private
 */

emis.mobile.form.AddDrug = function( appObject ) {
	var that = this;
	var _app = appObject;
	this.rxType = 'acute';
	var selectDrugName = null ;
	var dosageInput = null ;
	var dosageList = null ;
	var quantityFactor = null ;
	var quantity = null ;
	var duration = null ;
	var rxType = null ;
	var authIssues = null ;
	var reviewDate = null ;
	var issueLater = null ;
	var issuingMethod = null ;
	var issuingMethodDisabled = null ;
	var issueDate = null ;
	var drugUnit = null ;
	var drugs = null ;
	var drugsPending = null ;
	var keywords = null ;
	var preparations = null ;
	var selectedDrugId = null ;
	var listAllergies = null ;
	var areEventsBinded = false;
	var dosageListScrollStartPos = 0;
	var drugNamesListScrollStartPos = 0;
	var isQuantityEditable;
	var latestMatchingAuthIssuesValue = "";
	var countBackKeys = 0;
	var timeBackKey = 0;
	var lastDosageValue = "";
	var specialWordsDosages = [[]] ;


	var dosageTranslateArray = new Array( );
	dosageTranslateArray['1'] = 'one';
	dosageTranslateArray['2'] = 'two';
	dosageTranslateArray['3'] = 'three';
	dosageTranslateArray['4'] = 'four';
	dosageTranslateArray['5'] = 'five';
	dosageTranslateArray['6'] = 'six';
	dosageTranslateArray['7'] = 'seven';
	dosageTranslateArray['8'] = 'eight';
	dosageTranslateArray['one'] = '1';
	dosageTranslateArray['two'] = '2';
	dosageTranslateArray['three'] = '3';
	dosageTranslateArray['four'] = '4';
	dosageTranslateArray['five'] = '5';
	dosageTranslateArray['six'] = '6';
	dosageTranslateArray['seven'] = '7';
	dosageTranslateArray['eight'] = '8';

	var toggleSwitch = function( itemOn, itemOff ) {
		$( itemOn ).removeClass( "ui-radio-on ui-btn-active" ).addClass( "ui-radio-off" );
		$( itemOff ).removeClass( "ui-radio-off" ).addClass( "ui-radio-on ui-btn-active" );
	};

	var privacyEvent = function( ) {
		if ( this.id == "private-off" ) {
			toggleSwitch( '#private-on', '#private-off' );
			issuingMethod.val( issuingMethodDisabled.val( ) );
			issuingMethodDisabled.hide( );
			issuingMethod.show( );
		} else {
			toggleSwitch( '#private-off', '#private-on' );
			if ( issuingMethod.find( "option[value='c']" ).is( ":selected" ) ) {
				issuingMethod.val( "h" );
				$('#dateBlock').removeClass( 'notHiddenIssue' ).addClass( 'hiddenIssue' );
			}
			issuingMethodDisabled.val( issuingMethod.val( ) );
			issuingMethod.hide( );
			issuingMethodDisabled.show( );
		}
	};

	var reviewDateEvent = function( ) {
		if ( this.id == "review-date-off" ) {
			toggleSwitch( '#review-date-on', '#review-date-off' );
			$('#reviewDateContainer').removeClass( 'notHidden' ).addClass( 'hidden' );
		} else {
			toggleSwitch( '#review-date-off', '#review-date-on' );
			var presc = _app.dataProvider.getPrescriber( );
			var DefaultReviewPeriodInDays = presc.DefaultReviewPeriodInDays;
			// set today + 3 months
			setReviewDate( DefaultReviewPeriodInDays );
			$('#reviewDateContainer').removeClass( 'hidden' ).addClass( 'notHidden' );
		}
	};

	var issueLaterEvent = function( ) {
		if ( this.id == "issueLater-off" ) {
			toggleSwitch( '#issueLater-on', '#issueLater-off' );
			$('#methodBlock').removeClass( 'hiddenIssue' ).addClass( 'notHiddenIssue' );
			var currentIssuingMethod = getCurrentIssuingMethodInput( );
			if ( currentIssuingMethod.val( ) == "h" || currentIssuingMethod.val( ) == "p" ) {
				$('#dateBlock').removeClass( 'notHiddenIssue' ).addClass( 'hiddenIssue' );
			} else {
				$('#dateBlock').removeClass( 'hiddenIssue' ).addClass( 'notHiddenIssue' );
			}
		} else {
			toggleSwitch( '#issueLater-off', '#issueLater-on' );
			$('#methodBlock').removeClass( 'notHiddenIssue' ).addClass( 'hiddenIssue' );
			$('#dateBlock').removeClass( 'notHiddenIssue' ).addClass( 'hiddenIssue' );
		}
	};

	var getCurrentIssuingMethodInput = function( ) {
		if ( issuingMethod.is( ":visible" ) ) {
			return issuingMethod;
		} else {
			return issuingMethodDisabled;
		}
	}
	var toggleControls = function( val ) {
		if ( val === 'repeat' ) {
			rxType.val( 'Repeat' );
			var hidden = $( '.hidden' );
			hidden.addClass( 'notHidden' );
			hidden.removeClass( 'hidden' );

			var presc = _app.dataProvider.getPrescriber( );
			var AreReviewsEnabled = presc.AreReviewsEnabled;
			var DefaultReviewPeriodInDays = presc.DefaultReviewPeriodInDays;
			$('#reviewDateContainer').removeClass( 'notHidden' ).addClass( 'hidden' );
			if ( AreReviewsEnabled ) {
				$('#reviewDateBlock').removeClass( 'hidden' ).addClass( 'notHidden' );
				toggleSwitch( '#review-date-on', '#review-date-off' );
				// set today + 3 months
				setReviewDate( DefaultReviewPeriodInDays );
			} else {
				$('#reviewDateBlock').removeClass( 'notHidden' ).addClass( 'hidden' );
				toggleSwitch( '#review-date-off', '#review-date-on' );
			}
			// remove borders
			$( '#rxTypeBlock' ).addClass( 'withoutBottomBorder' );
			$( '#reviewDateBlock' ).addClass( 'withoutTopBorder' );
		} else if ( val === 'acute' ) {
			rxType.val( 'Acute' );
			var hidden = $( '.notHidden' );
			hidden.addClass( 'hidden' );
			hidden.removeClass( 'notHidden' );
			$( '#rxTypeBlock' ).removeClass( 'withoutBottomBorder' );
			$( '#reviewDateBlock' ).removeClass( 'withoutTopBorder' );
		}
	};

	var findPreparations = function( idsToFind, arrayToSearch ) {
		var preps = [];
		for ( var prep in arrayToSearch ) {
			for ( var id in idsToFind ) {
				if ( arrayToSearch[prep].id == idsToFind[id] ) {
					preps[id] = arrayToSearch[prep];
				}
			}
		}
		return preps;
	};

	var findDrugsByKeyword = function( keyword ) {
		var idsForKeyword;
		for ( var key in keywords ) {
			if ( keywords[key].keyword.toLowerCase( ) == keyword.toLowerCase( ) ) {
				idsForKeyword = keywords[key].ids;
			}
		}
		if ( idsForKeyword ) {
			var drugsToShow = findPreparations( idsForKeyword, preparations );

			if ( drugsToShow ) {
				var markup = "";
				markup += "<div id = 'drugOptions' class='ui-body-c ui-corner-all ui-shadow-inset'>";
				for ( var i = 0; i < drugsToShow.length; i += 1 ) {
					markup += "<div class='drugOptionDiv ' id='" + drugsToShow[i].id + "' data-unit='" + drugsToShow[i].unitOfMeasure + "' >";
					markup += drugsToShow[i].term;
					markup += "</div>";
				}
				markup += "</div>";
				var target = $( '#addDrug div#drugOptionsContainer' );
				$('#drugOptions').remove( );
				target.append( markup );

				var drugOptions = $( '#drugOptions' );

				drugOptions.on( 'click', function( e ) {
					var selected = $( e.target )[0];
					selectedDrugId = selected.id;
					selectDrugName.val( selected.innerText );
					$( '#drugOptions' ).remove( );
					var unit = $( e.target ).data( 'unit' );
					drugUnit.html( unit );
					e.stopPropagation( );
					e.preventDefault( );
					var focusOnDosage = function( ) {
						dosageInput.val( '' );
						dosageInput.focus( );
						dosageInputFocus( );
					};
					if ( emis.mobile.UI.isAndroid && emis.mobile.UI.isNative ) {
						setTimeout( function( ) {
							focusOnDosage( );
						}, 100 );
					} else {
						focusOnDosage( );
					}
				} );

				drugOptions.on( 'touchstart', function( e ) {
					if ( emis.mobile.UI.isAndroid && emis.mobile.UI.isNative ) {
						drugNamesListScrollStartPos = -parseInt( drugOptionDiv.children( ).first( ).css( "margin-top" ), 10 ) + e.originalEvent.touches[0].pageY;
					} else {
						drugNamesListScrollStartPos = this.scrollTop + e.originalEvent.touches[0].pageY;
					}

				} );
				drugOptions.on( 'touchmove', function( e ) {
					if ( this.scrollHeight > $( this ).height( ) ) {
						if ( emis.mobile.UI.isAndroid && emis.mobile.UI.isNative ) {
							var newMargin = drugNamesListScrollStartPos - e.originalEvent.touches[0].pageY;
							var listHeight = drugOptionDiv.height( );
							var listInnerHeight = drugOptionDiv[0].scrollHeight;
							if ( listInnerHeight > listHeight ) {
								if ( newMargin < 0 ) {
									newMargin = 0;
								} else if ( newMargin > listInnerHeight - listHeight ) {
									newMargin = listInnerHeight - listHeight;
								}
								drugOptionDiv.children( ).first( ).css( "margin-top", -newMargin );
							}
						} else {
							this.scrollTop = drugNamesListScrollStartPos - e.originalEvent.touches[0].pageY;
						}
					}
					e.preventDefault( );
				} );
			}
		}
	};

	function fillDosageList( data, filterText ) {
		dosageList.html( "" );
		if ( !filterText )
			return true;
		filterText = filterText.toLowerCase( );
		var isListEmpty = true, selectOptions = "";

		if ( specialWordsDosages.length < 2 ) {
			// prepare temp table
			for ( var i = 0; i < 8; i++ )
				specialWordsDosages.push( new Array( ) );
			for ( var i in data ) {
				text = " " + data[i].text.toLowerCase( ) + " ";
				if ( text.indexOf( " 1 " ) > -1 )
					specialWordsDosages[1].push( i );
				if ( text.indexOf( " one " ) > -1 )
					specialWordsDosages[1].push( i );
				if ( text.indexOf( " 2 " ) > -1 )
					specialWordsDosages[2].push( i );
				if ( text.indexOf( " two " ) > -1 )
					specialWordsDosages[2].push( i );
				if ( text.indexOf( " 3 " ) > -1 )
					specialWordsDosages[3].push( i );
				if ( text.indexOf( " three " ) > -1 )
					specialWordsDosages[3].push( i );
				if ( text.indexOf( " 4 " ) > -1 )
					specialWordsDosages[4].push( i );
				if ( text.indexOf( " four " ) > -1 )
					specialWordsDosages[4].push( i );
				if ( text.indexOf( " 5 " ) > -1 )
					specialWordsDosages[5].push( i );
				if ( text.indexOf( " five " ) > -1 )
					specialWordsDosages[5].push( i );
				if ( text.indexOf( " 6 " ) > -1 )
					specialWordsDosages[6].push( i );
				if ( text.indexOf( " six " ) > -1 )
					specialWordsDosages[6].push( i );
				if ( text.indexOf( " 7 " ) > -1 )
					specialWordsDosages[7].push( i );
				if ( text.indexOf( " seven " ) > -1 )
					specialWordsDosages[7].push( i );
				if ( text.indexOf( " 8 " ) > -1 )
					specialWordsDosages[8].push( i );
				if ( text.indexOf( " eight " ) > -1 )
					specialWordsDosages[8].push( i );
			}
		}

		wordsAll = filterText.split( " " );
		specialWordsTmp = new Array( );
		normalWords = new Array( );
		while ( wordsAll.length > 0 && wordsAll[0].length == 0 )
		wordsAll.shift( );
		var theFirst = wordsAll[0];
		for ( var i in wordsAll ) {
			if ( wordsAll[i] == "every" ) {
				normalWords.push( "every" );
				continue;
			}
			if ( dosageTranslateArray[wordsAll[i]] != null ) {
				specialWordsTmp.push( wordsAll[i] );
				specialWordsTmp.push( dosageTranslateArray[wordsAll[i]] );
			} else {
				if ( wordsAll[i].length > 0 )
					normalWords.push( wordsAll[i] );
			}
		}
		specialWords = new Array( );
		for ( var i in specialWordsTmp ) {
			if ( specialWordsTmp[i].length == 1 ) {
				var found = false;
				for ( var j in specialWords ) {
					if ( specialWordsTmp[i] == specialWords[j] ) {
						found = true;
						break;
					}
				}
				if ( !found ) {
					specialWords.push( specialWordsTmp[i] );
				}
			}
		}
		if ( specialWords.length > 0 ) {
			texts = new Array( );
			var specialWord = parseInt( specialWords[0] );
			for ( var i in specialWordsDosages[specialWord] ) {
				if ( specialWords.length == 1 ) {
					texts.push( data[specialWordsDosages[specialWord][i]] );
				} else {
					var missing = false;
					for ( var j = 1; j < specialWords.length; j++ ) {
						if ( binarySearch( specialWordsDosages[parseInt( specialWords[j] )], specialWordsDosages[specialWord][i] ) == false ) {
							missing = true;
							break;
						}
					}
					if ( !missing ) {
						texts.push( data[specialWordsDosages[specialWord][i]] );
					}
				}
			}
			var count = normalWords.length;
			var currentText;
			for ( var i in texts ) {
				currentText = texts[i].text.toLowerCase( );
				if ( currentText.indexOf( theFirst ) != 0 )
					if ( currentText.indexOf( dosageTranslateArray[theFirst] ) != 0 )
						continue;
				var found = 0;
				for ( var j in normalWords ) {
					if ( currentText.indexOf( normalWords[j] ) > -1 ) {
						found++;
					} else {
						break;
					}
				}
				if ( found == count ) {
					isListEmpty = false;
					selectOptions += '<li data-qty = ' + texts[i].quantity + '>' + texts[i].text + '</li>';
				}
			}
		} else {
			var count = normalWords.length;
			if ( normalWords.length == 0 )
				return true;
			var currentText;
			for ( var i in data ) {
				currentText = data[i].text.toLowerCase( );
				if ( currentText.indexOf( theFirst ) != 0 )
					continue;
				var found = 0;
				for ( var j in normalWords ) {
					if ( currentText.indexOf( normalWords[j] ) > -1 ) {
						found++;
					} else {
						break;
					}
				}
				if ( found == count ) {
					isListEmpty = false;
					selectOptions += '<li data-qty = ' + data[i].quantity + '>' + data[i].text + '</li>';
				}
			}
		}
		dosageList.html( selectOptions );
		dosageList.css( 'z-index', '9999' );
		return isListEmpty;
	}

	var binarySearch = function( sortedData, value ) {
		var minn = 0;
		var maxx = sortedData.length - 1;
		var current = ( maxx + minn ) >>> 1;
		while ( minn < maxx && sortedData[current] != value ) {
			if ( sortedData[current] > value ) {
				maxx = current;
				var current = ( maxx + minn ) >>> 1;
			} else {
				if ( minn == current )
					current++;
				minn = current;
				var current = ( maxx + minn ) >>> 1;
			}
			// emis.mobile.console.log(current+" "+minn+" "+maxx+" "+value+" "+sortedData[value]);
		}
		return sortedData[current] == value;
	}
	/* setting default values in form controls */
	var resetControls = function( ) {
		isQuantityEditable = true;
		latestMatchingAuthIssuesValue = "";
		lastDosageValue = "";
		selectDrugName.val( '' );
		dosageInput.val( '' );
		dosageList.hide( );
		dosageList.find( 'li' ).show( );
		quantity.val( '' );
		duration.val( '' );
		drugUnit.html( '' );
		// rxType isn't reset.
		authIssues.val( '' );
		toggleSwitch( '#private-on', '#private-off' );
		// if #private-on should be the default one, disable issuing method = Over the counter
		issuingMethod.val( 'h' );
		issuingMethod.show( );
		issuingMethodDisabled.val( 'h' );
		issuingMethodDisabled.hide( );

		toggleSwitch( '#review-date-on', '#review-date-off' );
		$('#reviewDateContainer').removeClass( 'notHidden' ).addClass( 'hidden' );

		toggleSwitch( '#issueLater-on', '#issueLater-off' );
		$('#methodBlock').removeClass( 'hiddenIssue' ).addClass( 'notHiddenIssue' );

		$('#reviewDate-calendar').val( '' );
		$('#issueDate-calendar').val( '' );

		$('#dateBlock').removeClass( 'notHiddenIssue' ).addClass( 'hiddenIssue' );
	};

	var omitNewLine = function( event ) {
		if ( event.keyCode == 13 ) {
			return false;
		}
	}
	var dosageInputFocus = function( ) {
		countBackKeys = 0;
		var filterValue = dosageInput.val( );
		if ( filterValue != "" ) {
			fillDosageList( drugs.dosages, filterValue );
			dosageList.show( );
		} else {
			dosageList.hide( );
		}
	};

	var setReviewDate = function( DefaultReviewPeriodInDays ) {
		var today = new Date( );
		today.setDate( today.getDate( ) + DefaultReviewPeriodInDays );
		$('#reviewDate-calendar').val( _app.util.standardizeDate( today.toISOString( ) ) );
	};

	var toggleDrugWarning = function( visible ) {
		var warn = $('#drugWarning');
		if ( visible ) {
			warn.find( '#xMark' ).off( 'click' ).on( 'click', function( ) {
				warn.hide( );
				$( '#addDrug .contentWrapper' ).css( 'margin-top', '-40px' );

			} );
			$( '#addDrug .contentWrapper' ).css( 'margin-top', '0px' );
			warn.show( );
		} else {
			$( '#addDrug .contentWrapper' ).css( 'margin-top', '-40px' );
			warn.find( '#xMark' ).off( 'click' );
			warn.hide( );
		}
	};

	function listAllergiesOnChange( event ) {
		$('#drawer-new-drug').removeClass( 'drawer-active' );
		$('#drawer-patient-record').addClass( 'drawer-active' );
		$.mobile.changePage( "#patientallergies", {
			delay: true
		} );
		$( this ).val( 0 );
	}

	function fillListAllergies( ) {
		var shouldBeDisplayed = function(alg) {
			if (alg.organisationId) {
				return main.dataProvider.shouldShowSharedValueForCurrentPatient( alg, true );
			}
			return true;
		}

		listAllergies.find("select").remove();

		var summary = _app.dataProvider.getPatientSummary( );

		var countedAllergies = 0;

		if(typeof summary.allergies !== 'undefined')
			for (var i = 0; i < summary.allergies.length; i++) {
				if (shouldBeDisplayed(summary.allergies[i]))
					countedAllergies++
			}

		if ( summary && summary.allergies && countedAllergies > 0 ) {
			var allergies = summary.allergies;

			//if ( allergies && countedAllergies ) {
				listAllergies.removeClass( "ui-disabled" );
				var html = "";
				html += "\n<option value='0' disabled='disabled' selected='selected' style='display: none;'>";
				//html += "Patient has allergies (" + allergies.length + ")";

				html += "Patient has allergies (" + countedAllergies +")";
				html += "</option>";
				for ( var i = 0; i < allergies.length; i++ ) {
					if (shouldBeDisplayed(allergies[i])) {
						if(main.dataProvider.isMinimumPatientDataServiceVersion(main.controller.patient.id, "0003")) {
							html += "<option " + (allergies[i].organisationId ? allergies[i].organisationId : '') + " value='" + ( i + 10 ) + "'>" + allergies[i].term + "</option>";
						} else {
							html += "<option " + (allergies[i].organisationId ? allergies[i].organisationId : '') + " value='" + ( i + 10 ) + "'>" + allergies[i] + "</option>";
						}
					}
				}

				html += "<option value='1'>View more information</option>";

				listAllergies.find( "span" ).hide( );
				listAllergies.append( '<select data-role="none">' + html + '</select>' );
				listAllergies.find( "select" ).on( 'change', listAllergiesOnChange ).on( 'click', function( ) {
					if ( $( this ).hasClass( "ui-disabled" ) ) {
						return false;
					}
				} );
			//}
		} else {
			listAllergies.addClass( "ui-disabled" );
			listAllergies.find( "span.text" ).text( "No known allergies" ).show( );
		}
	}
	// bind events on all static elements
	$(document).delegate('#addDrug', 'pageinit', function(){

		var isQuantityEditable = true;
		var quantityFactor = "undefined";

		selectDrugName = $('#selectDrugName');
		dosageInput = $( '#dosage-input');
		dosageList = $('#dosage-list');
		quantity = $('#quantityInput');

		if (emis.mobile.UI.isSamsung) {
			$('#quantityInput').attr('type', 'text');
		}

		duration = $('#durationInput');
		rxType = $('#rxType');
		authIssues = $('#authIssuesInput');
		reviewDate = $('#reviewDate-calendar');
		issueLater = $('#issueLater-wrapper');
		issuingMethod = $('#issuingMethod');
		issuingMethodDisabled = $('#issuingMethodDisabled');
		issueDate = $('#issueDate-calendar');
		listAllergies = $('#listAllergies');
		drugUnit = $('#drugUnit');

		$('#rxType').on( "change", function( ) {
			var val = $( this ).val( ).toLowerCase( );
			toggleControls( val );
			if ( val == "repeat" ) {
				$('#authIssuesInput').focus( );
			}
		} );

		$( "#private-on, #private-off" ).on( "click", privacyEvent );
		$( "#review-date-on, #review-date-off" ).on( "click", reviewDateEvent );
		$( "#issueLater-on, #issueLater-off" ).on( "click", issueLaterEvent );
		$('#drugListBtn').on( 'click', function( ) {
			if ( $( this ).hasClass( "ui-disabled" ) ) {
				return false;
			}
			var fctrs = _app.controller.getFormControllerStruct( '#drugList' );
			fctrs.controller.data.newlyAdded = false;
			$.mobile.changePage( "#drugList", {
				delay: true
			} );
		} );

		$('#addDrugButton').on( 'click', addDrug );


		var selectDrugNameCheckEvent = function( e, dontResetInput ) {

			var $rows = dosageList.find( 'li' );

			var clearOptions = function( clearUnit ) {
				$( '#drugOptions' ).remove( );
				if ( clearUnit ) {
					drugUnit.html( '' );
				}
			};
			var val = selectDrugName.val( );

			/* fix for issue with deleting input value on Android */
			if ( dontResetInput ) {
				countBackKeys = 0;
			} else {
				// called from keyup
				dosageInput.val( '' );
				quantity.val( '' );
				duration.val( '' );
				quantityFactor = "undefined";
				drugUnit.html( '' );
			}
			if ( emis.mobile.UI.isAndroid ) {
				var charCode = e.keyCode;
				if ( charCode == 8 ) {
					var d = new Date( );
					var curTime = d.getTime( );
					if ( curTime - timeBackKey < 100 ) {
						countBackKeys++;
						if ( countBackKeys > 15 ) {
							selectDrugName.val( "" );
							val = "";
							countBackKeys = 0;
						}
					}
					timeBackKey = curTime;
				} else {
					countBackKeys = 0;
				}
			}

			var pattern = new RegExp( "^[A-Za-z0-9 \(\)\%\&\*\+\-\/]+$" );
			if ( pattern.test( val ) && val != "" ) {
				selectDrugName.removeClass( 'notValid' );

				var keywordsPattern = new RegExp( "[\(\)\%\&\*\+\-\/]+" );
				val = val.replace( keywordsPattern, "" );
				if ( val.length > 2 ) {
					findDrugsByKeyword( val );
					$( '#drugOptions' ).show( );
				} else {
					clearOptions( false );
				}
			} else {
				clearOptions( false );
				selectDrugName.val( '' );
				if ( !selectDrugName.hasClass( 'notValid' ) ) {
					selectDrugName.addClass( 'notValid' );
				}
			}
			$rows.show( );
		};

		selectDrugName.on( 'focus', function( e ) {
			if ( $( this ).val( ) != "" ) {
				selectDrugNameCheckEvent( e, true );
			}
		} ).on( 'keydown', omitNewLine ).on( 'keyup', selectDrugNameCheckEvent );

		quantity.keypress( function( e ) {
			if ( !String.fromCharCode( e.keyCode ).match( /[0-9\.]/ ) ) {
					return false;
			}
			if ( String.fromCharCode( e.keyCode ).match( /[.]/ ) && this.value.indexOf( '.' ) >= 0 ) {
				return false;
			}
			e.stopImmediatePropagation();
		} ).on( 'keyup change', function( e ) {
			var val = $( this ).val( );
			if ( val == "" ) {
				$(this).addClass('notValid')
				// if NaN characters are enteted, then val == ''
				$(this).val( '' );
			}
			if ( val != "" ) {
				var pattern = new RegExp( "^[0-9]{0,6}(\\.[0-9]{0,3})?$" );
				if ( pattern.test( val ) && val != "" ) {
					$(this).removeClass( 'notValid' );
					isQuantityEditable = false;

					if ( quantityFactor != 'undefined' ) {
						dosageValue = parseFloat( quantityFactor );
						quantityValue = $( this ).val( );
						durationValue = Math.ceil( quantityValue / dosageValue );

						if(durationValue > 65535){
							quantity.val( Math.floor(quantity.val()/10) );
							return false;
						}

						if ( durationValue >= 1 ) {
							duration.val( durationValue );
						} else {
							duration.val( '' );
						}
						duration.removeClass( "notValid" );
					}
				} else {
					$(this).val( "" );
					duration.val( "" );
					isQuantityEditable = true;
					if ( !$(this).hasClass( 'notValid' ) ) {
						$(this).addClass( 'notValid' );
					}
				}
				if ( e.which == 13 ) {
					duration.focus( );
				}
			} else {
				duration.val( "" );
				isQuantityEditable = true;
			}
		} ).on('focus', function(){

			dosageList.hide();
		});

		duration.on( 'keyup change', function( e ) {
			var val = $( this ).val( );
			if ( val == "" ) {
				$(this).addClass('notValid')
				// if NaN characters are enteted, then val == ''
				duration.val( '' );
			}
			if ( val != "" ) {
				var pattern = new RegExp( "^([1-9]|[1-9][0-9]|[1-9][0-9][0-9]|[1-9][0-9][0-9][0-9]|[1-9][0-9][0-9][0-9][0-9])?$" );
				// var pattern = new RegExp("^[0-9]{0,5}(\\.[0-9]{0,2})?$");
				if ( pattern.test( val ) && val != "" && parseFloat( val ) <= 65535 && parseFloat( val ) >= 1 ) {
					duration.removeClass( 'notValid' );
					if ( quantityFactor != 'undefined' ) {
						dosageValue = parseFloat( quantityFactor );
						durationValue = $( this ).val( );
						quantityValue = durationValue * dosageValue;
						if(quantityValue > 999999.999){
							duration.val( Math.floor(duration.val()/10) );
							return false;
						}
						quantity.val( new Number( quantityValue.toFixed( 3 ) ).toString( ) );
						quantity.removeClass( "notValid" );
					}
				} else {
					duration.val( "" );
					if ( isQuantityEditable ) {
						quantity.val( "" );
					}
					if ( !duration.hasClass( 'notValid' ) ) {
						duration.addClass( 'notValid' );
					}
				}
				if ( e.which == 13 ) {
					duration.blur( );
				}
			} else {
				if ( isQuantityEditable == true ) {
					quantity.val( "" );
				}
			}
		} );

		duration.on( "blur", function( e ) {
			if ( duration.val( ) != "" ) {
				isQuantityEditable = false;
			}
		} );

		authIssues.on( 'keyup change', function( e ) {
			//
			authIssues.removeClass( 'notValid' );
			var val = $( this ).val( );
			if ( val.charAt( val.length - 1 ) < '0' || val.charAt( val.length - 1 ) > '9' ) {
				val = val.substr( 0, val.indexOf( val.charAt( val.length - 1 ) ) );
				$( this ).val( val );
			}

			if ( val.length == 0 && e.which != 8 ) {
				val = latestMatchingAuthIssuesValue;
			}
			latestMatchingAuthIssuesValue = val;
			if ( parseInt( val ) > 0 && parseInt( val ) <= 50 ) {
				authIssues.removeClass( 'notValid' );
				$('#authIssuesInput').val(val);
			} else {
				if ( !authIssues.hasClass( 'notValid' ) ) {
					authIssues.addClass( 'notValid' );
				}
				$('#authIssuesInput').val('');
			}
		} );

		dosageInput.on( 'keyup', function( event ) {
			var val = $( this ).val( ).toLowerCase( );

			(function(){
					var proper = true
					$.each([8,9,13], function(index, value) {
						if(value == event.keyCode){
							proper = false;
						}
					})
					if( proper ) {
						dosageInput.removeClass('notValid')
					}
			})()

			if ( val.length == 0 ) {
				dosageInput.addClass('notValid')
				quantity.val( '' );
				duration.val( '' );
				quantityFactor = "undefined";
			}

			if ( event.keyCode == 13 && !emis.mobile.UI.isSamsung ) {
				dosageInput.val( lastDosageValue );
				dosageList.hide( );
				duration.val( '' );
				document.activeElement.blur( );
				$('#quantityInput').val( '' ).focus( );
				return;
			} else {
				lastDosageValue = val;
			}
			/* fix for issue with deleting input value on Android */
			if ( emis.mobile.UI.isAndroid ) {
				var charCode = event.keyCode;
				if ( charCode == 8 ) {
					var d = new Date( );
					var curTime = d.getTime( );
					if ( curTime - timeBackKey < 100 ) {
						countBackKeys++;
						if ( countBackKeys > 15 ) {
							$( this ).val( "" );
							fillDosageList( drugs.dosages );
							dosageList.show( );
							countBackKeys = 0;
							return;
						}
					}
					timeBackKey = curTime;
				} else {
					countBackKeys = 0;
				}
			}

			var isListEmpty = fillDosageList( drugs.dosages, val );

			if ( !isListEmpty ) {
				dosageList.show( );
				dosageList[0].scrollTop = 0;
			} else {
				dosageList.hide( );
			}
		} );
		dosageInput.on( 'focus', dosageInputFocus );
		dosageInput.on( 'blur', function(e){
			var dosageVal = $(this).val( ), elem = $(this);

			var isValidDosage = false;
			quantityFactor = 'undefined';
			dosageList.find('li').each(function() {
				if($.trim($(this).text().toLowerCase()) === $.trim(dosageVal.toLowerCase())){
					// To ensure the quantity validation stands
					elem.val($(this).text());
					quantityFactor = $(this).data('qty')
					isValidDosage = true;
				}
			});

			//fix to allow free text based on the server validation
			var pattern = new RegExp( "^[\x20-\x7E]{1,400}$");
			if(pattern.test(dosageVal.trim().toLowerCase()) && dosageVal.trim().toLowerCase() != "")
			{
				isValidDosage = true;
			}

			console.log(pattern.test(dosageVal.trim().toLowerCase()))

			if(!isValidDosage){
				$(this).addClass( 'notValid' );
			}
		} );

		dosageList.on( 'touchstart', function( e ) {
			if ( emis.mobile.UI.isAndroid && emis.mobile.UI.isNative ) {
				dosageListScrollStartPos = -parseInt( dosageList.children( ).first( ).css( "margin-top" ), 10 ) + e.originalEvent.touches[0].pageY;
			} else {
				dosageListScrollStartPos = this.scrollTop + e.originalEvent.touches[0].pageY;
			}
		} );
		dosageList.on( 'touchmove', function( e ) {
			if ( this.scrollHeight > $( this ).height( ) ) {
				if ( emis.mobile.UI.isAndroid && emis.mobile.UI.isNative ) {
					var newMargin = dosageListScrollStartPos - e.originalEvent.touches[0].pageY;
					var dosageListHeight = dosageList.height( );
					var dosageListInnerHeight = dosageList[0].scrollHeight;
					if ( dosageListInnerHeight > dosageListHeight ) {
						if ( newMargin < 0 ) {
							newMargin = 0;
						} else if ( newMargin > dosageListInnerHeight - dosageListHeight ) {
							newMargin = dosageListInnerHeight - dosageListHeight;
						}
						dosageList.children( ).first( ).css( "margin-top", -newMargin );
					}
				} else {
					this.scrollTop = dosageListScrollStartPos - e.originalEvent.touches[0].pageY;
				}
				e.preventDefault( );
			}
		} );
		dosageList.on( 'click', function( e ) {
			var val = $( e.target ).text( );
			dosageInput.val( val ).removeClass( 'notValid' ).blur( );
			quantityFactor = $( e.target ).data( "qty" );
			dosageList.hide( );
			if ( val ) {
				fillDosageList( drugs.dosages, val.toLowerCase( ) );
			}
			quantity.val( '' );
			duration.val( '' );
			quantity.focus( );
			e.preventDefault( );
			e.stopPropagation( );
			return false;
		} );

		issuingMethod.add( issuingMethodDisabled ).on( "change", function( e ) {
			var val = $( this ).val( );
			var dateBlock = $('#dateBlock');
			$(this).prop('disabled', true)
			if ( val == "h" || val == "p" ) {
				issueDate.val( "" );
				dateBlock.removeClass( 'notHiddenIssue' ).addClass( 'hiddenIssue' );
				dateBlock.removeClass( 'withoutTopBorder' );
				$('#methodBlock').removeClass( 'withoutBottomBorder' );
			} else {
				dateBlock.removeClass( 'hiddenIssue' ).addClass( 'notHiddenIssue' );
				dateBlock.addClass( 'withoutTopBorder' );
				$('#methodBlock').addClass( 'withoutBottomBorder' );
				issueDate.focus( );
			}
			$(this).prop('disabled', false)
		} );

		var wasTouchMoved = false;
		$( '#addDrug' ).on( 'touchmove scroll', function( e ) {
			wasTouchMoved = true;
		} );
		$( '#addDrug' ).on( 'click touchend', function( e ) {
			var container = $( '#drugOptions' );
			var $eTarget = $( e.target );
			if ( wasTouchMoved ) {
				wasTouchMoved = false;
			} else {
				if ( e.target.id != 'drugOptions' && e.target.id != 'selectDrugName' && !$eTarget.hasClass( 'drugOptionDiv' ) ) {
					container.hide( );
				}
				var $eTargetParent = $eTarget.parent( );
				if ( e.target.id != dosageList[0].id && $eTargetParent.length && $eTargetParent[0].id != dosageList[0].id && e.target.id != dosageInput[0].id ) {
					dosageList.hide( );
				}
			}
		} );

	}) ;


	this.bindDataAndEvents = function( $page, refresh ) {

		var isQuantityEditable = true;
		var quantityFactor = "undefined";

		emis.mobile.UI.prepareAddDrugPage( $page );

		if ( !_app.controller.drugs ) {
			_app.controller.drugs = _app.dataProvider.getDrugs( );
		}
		drugs = _app.controller.drugs;
		keywords = drugs.preparationKeywordsAndIds;
		preparations = drugs.preparations;

		$( '#addDrug .contentWrapper' ).css( 'margin-top', '0px' );

		if ( refresh === true ) {
			if ( $('#drugWarning').length == 0 ) {
				var drugWarning = '<div id="drugWarning">';
				drugWarning += 'EMIS Mobile does not display contraindications and interactions';
				drugWarning += '<span id="xMark">x</span></div>';
				$('#addDrug').find( '.patientSummaryInfo' ).append( drugWarning );
				toggleDrugWarning( true );
			}
			selectDrugName = $('#selectDrugName');
			dosageInput = $( '#dosage-input');
			dosageList = $('#dosage-list');
			quantity = $('#quantityInput');
			duration = $('#durationInput');
			rxType = $('#rxType');
			authIssues = $('#authIssuesInput');
			reviewDate = $('#reviewDate-calendar');
			issueLater = $('#issueLater-wrapper');
			issuingMethod = $('#issuingMethod');
			issuingMethodDisabled = $('#issuingMethodDisabled');
			issueDate = $('#issueDate-calendar');
			listAllergies = $('#listAllergies');
			drugUnit = $('#drugUnit');


			fillDosageList( drugs.dosages );

			unvalidateFields( );
			resetControls( );

			emis.mobile.UI.addOrientationEventsForDialog( orientationChange );
			orientationChange( );

			emis.mobile.UI.tryBindShowHideToPage($page, orientationChange, unbindEvents)

			drugsPending = _app.dataProvider.getNewDrugsForCurrentPatient( );
			var drugListBtn = $( '#drugListBtn' );
			if ( drugsPending ) {
				if ( drugsPending.length == 0 ) {
					drugListBtn.html( 'Drugs pending sync (0)' ).addClass( "ui-disabled" );
				} else {
					drugListBtn.html( 'Drugs pending sync (' + drugsPending.length + ')' ).removeClass( "ui-disabled" );
				}
			} else {
				drugListBtn.html( 'Drugs pending sync (0)' ).addClass( "ui-disabled" );
			}
		}

		fillListAllergies( );

		toggleControls( that.rxType );

		/* fix for #113291 and all similar problems in the future */
		$( "#drawer li" ).removeClass( "drawer-active" ).siblings( "#drawer-new-drug" ).addClass( "drawer-active" );

		areEventsBinded = true;
		// if(main.dataProvider.getErrorAppointmentByPatientId(main.controller.patient.id)) {
		// 	$("#selectDrugName, #dosage-input, #quantityInput, #durationInput, #rxType").attr( "disabled", "disabled" );
		// 	$("#private-wrapper, #issueLater-wrapper, #issuingMethod, #addDrugButton").addClass("ui-disabled");
		// } else {
			$("#selectDrugName, #dosage-input, #quantityInput, #durationInput, #rxType").removeAttr( "disabled" );
			$("#private-wrapper, #issueLater-wrapper, #issuingMethod, #addDrugButton").removeClass("ui-disabled");
		// }
	};

	var unbindEvents = function( ) {
		emis.mobile.UI.removeOrientationEventsForDialog( orientationChange );
	};

	function orientationChange( ) {

		$("#addDrug").css( {
			"min-height": 300
			// to redo jquery.mobile.1.1.1.js : 2881 min-height set
		} );

		// if iPad do the blur so there is no effect that select indicates
		// somewhere else than select field
		if ( emis.mobile.UI.isiPad ) {
			$( 'select' ).blur( );
		}
	}

	var unvalidateFields = function( ) {
		selectDrugName.removeClass( 'notValid' );
		dosageInput.removeClass( 'notValid' );
		quantity.removeClass( 'notValid' );
		duration.removeClass( 'notValid' );
		rxType.removeClass( 'notValid' );
		authIssues.removeClass( 'notValid' );
		$( '#reviewDateContainer' ).removeClass( 'notValid' );
		issueLater.removeClass( 'notValid' );
		issuingMethod.add( issuingMethodDisabled ).removeClass( 'notValid' );
		$( '#issueDateContainer' ).removeClass( 'notValid' );
	};

	function validateFields( ) {
		var valid = true;
		unvalidateFields( );
		var drugName = selectDrugName.val( );
		if ( drugName && drugName.length > 3 ) {
			var drugInPreparations = false;
			for ( i in preparations ) {
				if ( preparations[i].term == drugName ) {
					drugInPreparations = true;
					break;
				}
			}
			if ( !drugInPreparations ) {
				valid = false;
			}
		} else {
			valid = false;
		}

		if ( !valid && !selectDrugName.hasClass( 'notValid' ) ) {
			selectDrugName.addClass( 'notValid' );
		}

		var dosageVal = dosageInput.val( );
		fillDosageList(drugs.dosages, dosageVal);
		var isValidDosage = false;
		dosageList.find('li').each(function() {
			if($.trim($(this).text().toLowerCase()) === $.trim(dosageVal.toLowerCase())){
				// To ensure the quantity validation stands
				// $(this).click();
				isValidDosage = true;
 			}
		});

		//fix to allow free text based on the server validation
		var pattern = new RegExp( "^[\x20-\x7E]{1,400}$");
		if(pattern.test(dosageVal.trim().toLowerCase()) && dosageVal.trim().toLowerCase() != "")
		{
			isValidDosage = true;
		}

		valid = valid && isValidDosage;
		if(!isValidDosage && !dosageInput.hasClass( 'notValid' )){
			dosageInput.addClass( 'notValid' );
 		}

		var quan = quantity.val( );
		if ( !quan || quan == 0 ) {
			valid = false;
			if ( !quantity.hasClass( 'notValid' ) ) {
				quantity.addClass( 'notValid' );
			}
		}

		var dur = duration.val( );
		if ( !dur ) {
			valid = false;
			if ( !duration.hasClass( 'notValid' ) ) {
				duration.addClass( 'notValid' );
			}
		}

		var isRepeat = rxType.val( ) == 'Repeat';
		if ( isRepeat ) {
			var canPrescribe = _app.dataProvider.getPrescriber( );
			var showAuthIssues = canPrescribe.AreAuthorisedIssuesRequiredForRepeats;
			var authVal = authIssues.val( );
			if ( showAuthIssues && !authVal ) {
				valid = false;
				if ( !authIssues.hasClass( 'notValid' ) ) {
					authIssues.addClass( 'notValid' );
				}
			}
			var isReviewDateSelected = $('#review-date-on').hasClass( 'ui-btn-active' );
			var revDate = reviewDate.val( );
			var rev = new Date( revDate.split( "-" ).join( " " ) );
			if ( isReviewDateSelected && ( !revDate || rev < new Date( ) ) ) {
				valid = false;
				var container = $( '#reviewDateContainer' );
				if ( !container.hasClass( 'notValid' ) ) {
					container.addClass( 'notValid' );
				}
			}
		}

		var later = $('#issueLater-off').hasClass( 'ui-btn-active' );
		var currentIssuingInput = getCurrentIssuingMethodInput( );
		if ( later && ( !currentIssuingInput.val( ) || ( !issueDate.val( ) && !$('#dateBlock').hasClass( "hiddenIssue" ) ) ) ) {
			valid = false;
			if ( !currentIssuingInput.hasClass( 'notValid' ) ) {
				currentIssuingInput.addClass( 'notValid' );
			}
			var container = $( '#issueDateContainer' );
			if ( !container.hasClass( 'notValid' ) ) {
				container.addClass( 'notValid' );
			}
		}

		if ( !valid ) {
			// emis.mobile.console.log( "selectDrugName.val() " + selectDrugName.val( ) );
			// emis.mobile.console.log( "dosageInput.val() " + dosageInput.val( ) );
			// emis.mobile.console.log( "quantity.val() " + quantity.val( ) );
			// emis.mobile.console.log( "rxType.val() " + rxType.val( ) );
			// emis.mobile.console.log( "authIssues.val() " + authIssues.val( ) );
			// emis.mobile.console.log( "reviewDate.val() " + reviewDate.val( ) );
			// emis.mobile.console.log( "issueLater.val() " + issueLater.val( ) );
			// emis.mobile.console.log( "issuingMethod.val() " + currentIssuingInput.val( ) );
			// emis.mobile.console.log( "issueDate.val() " + issueDate.val( ) );
		}
		return valid;
	}

	function addDrug( ) {
		if ( $(this).hasClass("ui-disabled") ) {
			return false;
		}
		emis.mobile.console.log( "add drug button clicked" );
		isValid = validateFields( );
		if ( !isValid ) {
			return;
		}

		var newDrug = new Object( );
		var type = rxType.val( );
		type = ( type == "Acute" ) ? "a" : "r";
		if ( type == "r" ) {
			newDrug.authorisedIssues = parseInt( authIssues.val( ) );
		}

		newDrug.dosage = dosageInput.val( );
		newDrug.duration = parseInt( $("#durationInput").val( ) );
		newDrug.isPrivate = $("#private-on").hasClass( "ui-btn-active" );
		if ( $( "#issueLater-off" ).hasClass( "ui-btn-active" ) ) {
			newDrug.issue = {};
			var date = issueDate.val( );
			if ( date.length > 0 ) {
				newDrug.issue.date = dataConvertToUploadFormat( date );
			}
			newDrug.issue.method = getCurrentIssuingMethodInput( ).val( );
		}

		newDrug.preparationId = selectedDrugId;
		// hardcoded now, edit later!
		newDrug.prescriptionType = type;
		var quantityRaw = quantity.val( );
		var quant = quantityRaw.split( "," ).join( "." );
		newDrug.quantity = parseFloat( quant );
		if ( type == "r" ) {
			if ( $("#review-date-on").hasClass( "ui-btn-active" ) ) {
				newDrug.reviewDate = dataConvertToUploadFormat( reviewDate.val( ) );
			}
		}
		newDrug.unitOfMeasure = drugUnit.html( );
		new emis.mobile.NewDrugModel( ).insert( newDrug );
		jQuery(document).trigger('emis.needsync', ['drugs']) ;
		//emis.mobile.UI.updateDrawerNewDrugStar( _app );
		var drugsNumber = _app.dataProvider.getNewDrugsForCurrentPatient( ).length;
		var drugListBtn = $( '#drugListBtn' );
		drugListBtn.html( 'Drugs pending sync (' + drugsNumber + ')' ).removeClass( "ui-disabled" );
		// add to form controller info whether the button was clicked to open dialog or auto by adding drug
		fctrs = _app.controller.getFormControllerStruct( '#drugList' );
		fctrs.controller.data.newlyAdded = true;
		$.mobile.changePage( "#drugList", {
			delay: true
		} );
		resetControls( );
		drugListBtn.removeAttr( "disabled" );
	}

	function dataConvertToUploadFormat( input ) {
		// DD-mon-YYYY to YYYY-MM-DD
		if ( input ) {
			var parts = input.split( "-" );
			return parts[2] + "-" + convertMonth( parts[1] ) + "-" + parts[0];
		}
		return "";
	}

	function dataConvertToInputFormat( uploadFormat ) {
		// YYYY-MM-DD to DD-mon-YYYY
		if ( uploadFormat ) {
			var parts = input.split( "-" );
			return parts[2] + "-" + convertMonthBack( parts[1] ) + "-" + parts[0];
		}
		return "";
	}

	convertMonth = function( str ) {
		str = str.replace( "Jan", "01" );
		str = str.replace( "Feb", "02" );
		str = str.replace( "Mar", "03" );
		str = str.replace( "Apr", "04" );
		str = str.replace( "May", "05" );
		str = str.replace( "Jun", "06" );
		str = str.replace( "Jul", "07" );
		str = str.replace( "Aug", "08" );
		str = str.replace( "Sep", "09" );
		str = str.replace( "Oct", "10" );
		str = str.replace( "Nov", "11" );
		str = str.replace( "Dec", "12" );
		return str;
	};

	convertMonthBack = function( str ) {
		str = str.replace( "01", "Jan" );
		str = str.replace( "02", "Feb" );
		str = str.replace( "03", "Mar" );
		str = str.replace( "04", "Apr" );
		str = str.replace( "05", "May" );
		str = str.replace( "06", "Jun" );
		str = str.replace( "07", "Jul" );
		str = str.replace( "08", "Aug" );
		str = str.replace( "09", "Sep" );
		str = str.replace( "10", "Oct" );
		str = str.replace( "11", "Nov" );
		str = str.replace( "12", "Dec" );
		return str;
	};

	return this;
};