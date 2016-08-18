/**
 * Login form controller Functionalities provided:
 */

emis.mobile.form.TemplateList = function(appObject) {
	// var OLD_VERSION = false;
	var viewMode = true;
	var bShouldBlockFields = false;
	var contactPage = null;
	var encounterJSON = null;
	var that = this;
	var _app = appObject;
	var number = 0;
	var validationFieldsArray = null;
	var notSynchronisedTemplates = [];
	var careEpisodes = [];
	var careEpisodesModified = [];
	var rttStatuses = {};
	var rttPanel, changeCareEpisodeWrapper, changeRttStatusBtn,
		currentRTTWrapper, currentRTT, previousRTTWrapper, previousRTT,
		careEpisodeContactSwitch, careEpisodeSubjectSwitch = null;
	var pageId = '#templateList';

	/**
	 * shortcut for string formatting
	 */
	var fs = _app.util.formatString;

	function f(v) {
		if (v)
			return v;
		return '';
	}

	function getSectionNoData(sectionTitle) {
		var markup = '<div class="contentPanel">';
		markup += '<div class="header no-data no-data-show">';
		markup += '<div class="e-blocks">';
		markup += '<div class="grid-2 e-block-a"><span>' + sectionTitle + ' (None)</span>';
		if ( ! v2features ) {
			markup += '<div class="standaloneButton" id="addContact2">Add template <b>+</b></div>';
		}
		markup += '</div>';
		markup += '</div>'; // e-blocks

		markup += '</div>';
		return markup;

	}

	function getSectionOpen() {
		return '<div class="contentPanel">';
	}

	function getSectionClose() {
		return '</div>';
	}

	function getSectionHeaderOpen() {
		var markup = '<div class="header grid">';
		return markup; ;
	}

	function getSectionHeaderClose() {
		return '</div>';
	}

	function getSectionContentOpen() {
		return '<div class="content grid">';
	}

	function getSectionContentClose() {
		return '</div>';
	}

	function fillSectionListview( markup, data ) {

		if ( !markup )
			markup = '';

		if (data === null || data.length === 0) {
			markup += getSectionNoData('Contacts');
		} else {

			markup += getSectionOpen();

			/* header */
			markup += getSectionHeaderOpen();
			markup += '<div class="e-blocks">';
			markup += '<div class="grid-2 e-block-a"><span>Templates added</span>';
			if ( ! v2features ) {
				markup += '<div class="standaloneButton" id="addContact2">Add template <b>+</b></div>';
			}
			markup += '</div>';
			markup += '</div>';
			markup += getSectionHeaderClose();

			/* content */
			markup += getSectionContentOpen();

			notSynchronisedTemplates = [];
			for (var i = 0; i < data.length; i++) {
				var contact = data[i];
				var sUpdatedTime = (" (updated "+f(contact.effectiveTime)+")");
				markup += '<div class="e-blocks"';
				var disableClass = '';
				var editTextButton = 'Edit';
				/*if ( (contact.isCompleted && _app.dataProvider.isEventsetNotSynchronised( contact.localId )) || (!contact.isCompleted && main.storage.getItem( "DataWipeReached" )=="0") ) {
					notSynchronisedTemplates.push( contact.localId );
					disableClass = ' ui-disabled"';
					editTextButton = 'View';
				}*/
				markup += ' id="template_idx_' + i + '">';
				markup += '<div class="grid-5 e-block-a">' + f(contact.name) + '<span class="dateInfo">'+sUpdatedTime+'</span></div>';
				markup += '<div class="grid-5 e-block-b">';
				markup += (contact.isCompleted ? '<div class="sprite complete-icon">Completed</div>' : '<div class="sprite not-complete-icon">Mandatory field(s) incomplete</div>');
				markup += '</div>';
				markup += '<div class="grid-5 e-block-c"><a id="template_edit_idx_' + i + '" class="button" data-role="none" href="">' + editTextButton + '</a></div>';
				markup += '<div class="grid-5 e-block-d"><a id="templateList-remove-' + i + '" class="button red' + disableClass + '" data-role="none" href="">Remove</a></div>';
				markup += '</div>';
			}

			markup += getSectionContentClose();
			markup += getSectionClose();
		}

		return markup;
	}

	function removeTemplate(i, event) {
		_app.dataProvider.removeEventset(i);
		templateAddedSuccesfullyInfo();
		event.preventDefault();
		event.stopPropagation();
		return true;
	}

	function templateAction(actionCtx) {
		var templateCtr = _app.controller.getFormController('#templateParser');
		templateCtr.data.action = actionCtx.action;
		templateCtr.data.blocked = actionCtx.blocked;
		templateCtr.setTemplateRecord(actionCtx.templateRecord);
		$.mobile.changePage('#templateParser', {delay:true});
	}

	var addEditSelectActions = {
		taskList : function() {
			$.mobile.changePage('#taskList', {delay:true});
		},
		templateList : function() {
			$.mobile.changePage('#templateList', {delay:true});
		}
	};

	/* ***************************** */
	/* Consultation Properties ***** */

	var _app = appObject;

	function getConsultationType(consultationTypes, id) {
		for (var i = 0; i < consultationTypes.length; i++) {
			var consultationType = consultationTypes[i];
			if (consultationType.object)
				consultationType = consultationType.object;
			// stripping record
			// wrapper
			if (consultationType.CodeId == id)
				return {
					code : consultationType.CodeId,
					term : consultationType.Description
				};
		}
		return null;
	}

	function format(v) {
		if (v)
			return v;
		return '';
	}

	function getTimeFromEffectiveTime(effectiveTime) {
		var result = '';
		if (effectiveTime) {
			var time = effectiveTime.split( 'T' )[1];
			var hour = time.split( ':' )[0]
			var minute = time.split( ':' )[1];
			result = hour + ':' + minute;
		}
		return result;
	}

	function fillTemplatesSelect( data ) {

		// including usability rate, also sorting(alphanumeric by name) - JI
		for( var i = 0; i< data.length; i++) {
			var counter = main.storage.find("TemplateCounter",data[i].Id);
			if(counter) {
				counter = JSON.parse(counter).count;
			} else {
				counter = 0;
			}
			data[i].counter = counter;
		}
		data.sort( function( a, b ) {
			if(a.counter!=b.counter) return b.counter-a.counter;
			return a.Title.localeCompare(b.Title);
		} );

		var maxTemplatesCount = 5;

		if ( data.length > maxTemplatesCount ) {
			for(var i = maxTemplatesCount; i< data.length; i++) {
				data[i].counter = 0;
			}
			data.sort( function( a, b ) {
				if(a.counter!=b.counter) return b.counter-a.counter;
				return a.Title.localeCompare(b.Title);
			} );
		}

		var codes = new Array();
		var idSelected = 0;
		var indexSelected = 0;

		//Clear the markup
		$('#addContact, #addContact2').html("");

		var html = "";

		if(data.templateRecord)
			idSelected = data.templateRecord.id;

		html += "\n<option value='0' disabled='disabled' selected='selected' style='display: none;'>Add template</option>";

		if ( data ) {
			for (var i = 0; i < data.length && i < maxTemplatesCount; i++) {
				html += "<option value='" + data[i].Id + "'";
				if (idSelected == data[i].Id) {
					html += " selected='selected'";
				}
				html += ">" + data[i].Title + "</option>";
			}
			html += "<option value='1'>All templates</option>";

			$('#addContact, #addContact2').html('<select data-role="none" class="styled-select">' + html + '</select>') ;


			function addContactSelectOnChange( event ) {

				var tempId = $( event.target ).val();

				var tpController = _app.controller.getFormControllerStruct( '#templateParser' ).controller;
				if(tempId != "1" && tempId != "0"){
					tpController.allTemplates = false;
					tpController.setCurrentTemplate( tempId, false);
				}else if(tempId == "1"){
					tpController.allTemplates = true;
					tpController.clearTemplateContent();
					$.mobile.changePage( "#selectTemplate", {delay:true} );
				}
				if(tempId != "1") {
					$.mobile.changePage( "#templateParser", {delay:true} );
				}

				return true;
			}

			$( '#addContact, #addContact2' ).unbind();
			$( '#addContact, #addContact2' ).on( 'change', addContactSelectOnChange );
			$( '#addContact, #addContact2' ).off("click").on("click", function() {
				if ( $(this).hasClass("ui-disabled") ) {
					return false;
				}
			} );

		}
	}

	function clearValidationMarks() {
		var validArray = getValidationFieldsArray();

		for (var i = 0; i < validArray.length; i++)
			validArray[i].redElement.removeClass('notValid');
	}

	function getValidationFieldsArray() {
		if (validationFieldsArray == null) {
			validationFieldsArray = [{
				element : $('#consPropDate'),
				redElement : $('#consPropDate').parent()
			}, {
				element : $('#consPropTime'),
				redElement : $('#consPropTime').parent()
			}, {
				element : $('#consPropDuration'),
				redElement : $('#consPropDuration')
			}, {
				element : $('#consPropConsultor'),
				redElement : $('#consPropConsultor')
			}, {
				element : $('#consPropConsultationType'),
				redElement : $('#consPropConsultationType').parent()
			}]
		}
		return validationFieldsArray;
	}

	function validateFields() {
		var isValid = true;
		var validArray = getValidationFieldsArray();

		clearValidationMarks();

		for (var i = 0; i < validArray.length; i++)
			if (!validArray[i].element.val()) {
				isValid = false;
				if (!validArray[i].redElement.hasClass('notValid')) {
					validArray[i].redElement.addClass('notValid');
				}
			}

		// validate values
		// check if duration is not less then 0
		if (validArray[2].element.val() < 0) {
			if (!validArray[2].redElement.hasClass('notValid')) {
				validArray[2].redElement.addClass('notValid');
			}
			isValid = false;
		}

		return isValid;
	}

	function saveChanges() {
		if(document.activeElement != null){
			document.activeElement.blur();
		}
		_app.dataProvider.saveEncounterJSON(encounterJSON);
	}

	function sortAndMakeDefaultsOfConsultationTypes(consultationTypes)
	{
		consultationTypes.sort(
					function(a, b) {
						var aDescritpion = a.object.Description.toUpperCase();
						var bDescription = b.object.Description.toUpperCase();
						if (aDescritpion < bDescription)
							return -1;
						if (aDescritpion > bDescription)
							return 1;
						// a must be equal to b
						return 0;
					});

		var idxA = -1;
		var idxB = -1;
		for (var a = 0; a < consultationTypes.length; a++)
		{
			if ( consultationTypes[a].object.Description == 'Face to face consultation' )
			{
				idxA = a;
			}
			if ( consultationTypes[a].object.Description == 'Home visit note' )
			{
				idxB = a;
			}
			if (idxA != -1 && idxB != -1)
			{
				break;
			}
		}
		if (idxA != -1 && idxB != -1) {
			var partA = consultationTypes.slice(0,idxA);
			var partB = consultationTypes.slice(idxA+1,idxB);
			var partC = consultationTypes.slice(idxB+1);
			var sumOfParts = new Array();
			sumOfParts.push(consultationTypes[idxB]); // this is default
			sumOfParts.push(consultationTypes[idxA]);
			return sumOfParts.concat(partA, partB, partC);
		} else if(idxA != -1) {
			var partA = consultationTypes.slice(0,idxA);
			var partB = consultationTypes.slice(idxA+1);
			var sumOfParts = new Array();
			sumOfParts.push(consultationTypes[idxA]);
			return sumOfParts.concat(partA, partB);
		} else if(idxB != -1) {
			var partA = consultationTypes.slice(0,idxB);
			var partB = consultationTypes.slice(idxB+1);
			var sumOfParts = new Array();
			sumOfParts.push(consultationTypes[idxB]); // this is default
			return sumOfParts.concat(partA, partB);
		}
		return consultationTypes;
	}

	function fillConsultationProperties($page) {
		encounterJSON = _app.dataProvider.getEncounterJSON();

		var consultationTypes = _app.dataProvider.getConsultationTypes();

		consultationTypes = sortAndMakeDefaultsOfConsultationTypes(consultationTypes);

		var slot = _app.dataProvider.getAppointmentById(_app.controller.slotId);
		if (encounterJSON) {

			$content = $page.find(":jqmData(role=content)");

			if (encounterJSON.duration == '' || encounterJSON.duration == null) {
				try {
					var durationInMinutes = ((_app.util.getDate(slot.EndDateTime)).getTime() - (_app.util.getDate(slot.StartDateTime)).getTime()) / 60000;

					if (!durationInMinutes)
						durationInMinutes = 1;

					encounterJSON.duration = '' + (durationInMinutes <= 0 ? 1 : durationInMinutes);
					encounterJSON.duration = '' + (durationInMinutes > 480 ? 480 : durationInMinutes);
					if(encounterJSON.duration === '' ) encounterJSON.duration = 1;
				} catch(ex) {
					encounterJSON.duration = 1;
					emis.mobile.console.log("Exception caught, consultation properties duration error");
				}
			}

			if (encounterJSON.effectiveTime == '' || encounterJSON.effectiveTime == null) {
				if ( main.dataProvider.isMinimumPatientDataServiceVersion( main.controller.patient.id, "0004" ) ) {
					encounterJSON.effectiveTime = _app.util.getISONowUTCDate();
				} else {
					encounterJSON.effectiveTime = _app.util.getISONowDate();
				}
			}

			var optionsMarkup = '';
			if(encounterJSON.consultationType.code == null||encounterJSON.consultationType.code.length==0)
			{
				if(consultationTypes.length>0) {
					encounterJSON.consultationType.code = consultationTypes[0].object.CodeId;
					encounterJSON.consultationType.term = consultationTypes[0].object.Description;
				}
			}
			for (var i = 0; i < consultationTypes.length; i++) {
				var consultationType = consultationTypes[i].object;
				if(encounterJSON.consultationType.code == consultationType.CodeId) {
					optionsMarkup += '<option value="' + consultationType.CodeId + '" selected>' + consultationType.Description + '</option>';
				} else {
					optionsMarkup += '<option value="' + consultationType.CodeId + '">' + consultationType.Description + '</option>';
				}
			}

			var selectConsType = $content.find('#consPropConsultationType');
			selectConsType.html(optionsMarkup);

			encounterJSON.appointmentSlotId = _app.controller.slotId;

			encounterJSON.consultors = new Array();

			// one consultor. perhaps need to change later
			var resp = main.dataProvider.getSessionData();

			encounterJSON.consultors[0] = new Object();
			encounterJSON.consultors[0].id = resp.Payload.UserInRoleId;
			encounterJSON.consultors[0].name = _app.controller.user.name;
			var selectConsConsultor = $content.find('#consPropConsultor');
			userId = resp.Payload.UserInRoleId;
			organisationPeople = main.dataProvider.getOrganisationPeople();
			for(var i in organisationPeople) {
				if(userId == organisationPeople[i].id) {
					encounterJSON.consultors[0].name = organisationPeople[i].object.DisplayName;
					break;
				}
			}
			selectConsConsultor.val(encounterJSON.consultors[0].name);

			// insert quick notes
			var selectQuickNotesArea = $content.find( '#quickNotesArea' );
			var quickNoteId = main.controller.patient.id + "#" + main.controller.slotId;
			var quickNotesValue = main.storage.find( "quickNote", quickNoteId );
			if ( quickNotesValue != null ) {
				selectQuickNotesArea.val( quickNotesValue );
			} else {
				selectQuickNotesArea.val( '' );
			}

			$( '#consPropConsultationType' ).off( 'change' );
			$( '#consPropConsultationType' ).on( 'change', function( event ) {
				var value = $( this ).val();
				emis.mobile.console.log('#consPropConsultationType setValue: ' + value);
				encounterJSON.consultationType = getConsultationType(consultationTypes, value);
				saveChanges();
			} );

			var effectiveTimeToDisplay = encounterJSON.effectiveTime;
			if ( effectiveTimeToDisplay && main.dataProvider.isMinimumPatientDataServiceVersion( main.controller.patient.id, "0004" ) ) {
				// convert UTC date to display local time
				effectiveTimeToDisplay = _app.util.getISODate( new Date( _app.util.getUTCDate( effectiveTimeToDisplay ) ) );
			}
			$('#consPropDate').val(_app.util.standardizeDate(effectiveTimeToDisplay));
			$('#consPropTime').val(getTimeFromEffectiveTime(effectiveTimeToDisplay));
			$('#consPropDuration').val(encounterJSON.duration);
			if (encounterJSON.consultationType) {
				$('#consPropConsultationType').val(encounterJSON.consultationType.code);
			}

			_app.dataProvider.saveEncounterJSON(encounterJSON);

		}
	}

	/* Consultation Properties ***** */
	/* ***************************** */

	function fillEventsetsList( $page ) {

		//Clear the markup
		$("#templateListContent").html("");

		var data = _app.dataProvider.getEventsets();

		if ( data ) {
			var markup = fillSectionListview( markup, data );

			// Inject the markup
			$("#templateListContent").html(markup);
			$page.page();


			// handlers
			for (var i = 0; i < data.length; i++) {
				$page.find('#template_edit_idx_' + i).on('click', (function(templateRecord) {
					return function(e) {
						templateRecord.edit = true;
						templateAction({
							action : 'editTemplate',
							templateRecord : templateRecord,
							blocked : false
						});
					}
				})(data[i]));

				$page.find( '#templateList-remove-' + i ).on( 'click', ( function( templateRecord, idx ) {
					return function( e ) {
						if ( notSynchronisedTemplates.indexOf( templateRecord.localId ) != -1 ) {
							return false;
						}
						emis.mobile.Utilities.customConfirmPopup( {ok: "Yes", cancel: "No", message: "Do you really want to delete?", title: "Delete?", callback: function( r ) {
							if ( r === true ) {
								removeTemplate( templateRecord.localId, e );
								$( '#template_idx_' + idx ).remove( );
								if ( $( "#templateListContent .content.grid" ).children( ).length === 0 ) {
									$( "#templateListContent" ).html( getSectionNoData( 'Contacts' ) );
									fillTemplatesSelect( _app.dataProvider.getTemplateHeaders( ) );
								}
								jQuery(document).trigger('emis.needsync', ['contact']) ;
								emis.mobile.UI.updateDrawerContactStar( _app );
							}
						} } );
					}
				} )( data[i], i ) );

			}
		}
	}

	function showCareEpisodesBlocks( shouldShowPanels, shouldBlockContactAndSubject ) {
		var eblocks = rttPanel.find( '#careEpisodeArea .e-blocks' );
		var firstPanel = eblocks.eq( 0 );
		var selectedCareEpisodePanel = rttPanel.find( '.selected-care-episode-wrapper' );
		if ( shouldShowPanels ) {
			firstPanel.addClass( 'no-bottom-border' );
			selectedCareEpisodePanel.show();
		} else {
			firstPanel.removeClass( 'no-bottom-border' );
			selectedCareEpisodePanel.hide();
		}
		if ( shouldBlockContactAndSubject || bShouldBlockFields ) {
			careEpisodeContactSwitch.find( 'div' ).addClass( 'ui-disabled' );
			careEpisodeSubjectSwitch.find( 'div' ).addClass( 'ui-disabled' );
		} else {
			careEpisodeContactSwitch.find( 'div' ).removeClass( 'ui-disabled' );
			careEpisodeSubjectSwitch.find( 'div' ).removeClass( 'ui-disabled' );
		}
	}

	function fillRTTPanel( page ) {
		var buildCareEpisodeTitle = function( careEpisode ) {
			var service = main.dataProvider.getServiceById( careEpisode.serviceId );
			var carePathway = main.dataProvider.getCarePathwayByCareEpisode( _app.controller.patient.id, careEpisode.id );
			var careEpisodeTitle = careEpisode.title;
			if ( carePathway && carePathway.name ) {
				careEpisodeTitle += ' on ' + carePathway.name;
			}
			if ( service && service.Name ) {
				careEpisodeTitle += ' (' + service.Name + ')';
			}
			return careEpisodeTitle;
		}

		careEpisodes = _app.dataProvider.getPatientCareEpisodes( _app.controller.patient.id );
		careEpisodesModified = _app.dataProvider.getPatientModifiedCareEpisodes( _app.controller.patient.id, _app.controller.slotId );
		var sessionObject = _app.dataProvider.getSessionData();
		if ( ENABLE_RTT &&
				sessionObject &&
				sessionObject.Payload &&
				emis.mobile.Utilities.isTrue( sessionObject.Payload.EpisodeManagementEnabled ) &&
				careEpisodes &&
				careEpisodes.length ) {
			rttPanel.show();
			changeCareEpisodeWrapper.find( 'select' ).remove();
			var markup = '';
			var selectedCareEpisode = null;
			var patientAppt = _app.dataProvider.getAppointmentById( _app.controller.slotId );
			rttStatuses = {};
			var defaultSelectedCareEpisode = null;
			var lastSelectedCareEpisode = null;
			for (var i = 0; i < careEpisodes.length; i++) {
				var tempCareEpisode = careEpisodes[i];
				if ( encounterJSON.careEpisode && encounterJSON.careEpisode.id == tempCareEpisode.id ) {
					selectedCareEpisode = tempCareEpisode;
				}
				if ( patientAppt && patientAppt.CareEpisodeId && patientAppt.CareEpisodeId == tempCareEpisode.id ) {
					defaultSelectedCareEpisode = tempCareEpisode;
				}
				if ( encounterJSON.currentlySelectedCareEpisodeId &&
						encounterJSON.currentlySelectedCareEpisodeId == tempCareEpisode.id ) {
					lastSelectedCareEpisode = tempCareEpisode;
				}
				if ( tempCareEpisode.validNextStatuses ) {
					rttStatuses[ tempCareEpisode.id ] = jQuery.extend( true, [], tempCareEpisode.validNextStatuses );
				} else {
					rttStatuses[ tempCareEpisode.id ] = [];
				}
				if ( tempCareEpisode.rttStatus ) {
					rttStatuses[ tempCareEpisode.id ].push( tempCareEpisode.rttStatus );
				}
				markup += "<option value='" + tempCareEpisode.id + "'>" + buildCareEpisodeTitle( tempCareEpisode ) + "</option>";
			}
			markup += '</select>';

			if ( defaultSelectedCareEpisode && ! encounterJSON.careEpisode ) {
				selectedCareEpisode = defaultSelectedCareEpisode;
			}
			if ( lastSelectedCareEpisode ) {
				// used if different care episode was selected but user
				// didn't change anything in this care episode
				// and because of that we do not have encounter.careEpisode inside it
				selectedCareEpisode = lastSelectedCareEpisode;
			}

			if ( ! defaultSelectedCareEpisode ) {
				markup = "<option value='None'>None</option>" + markup;
			}
			markup = '<select data-role="none">' + markup;
			changeCareEpisodeWrapper.append( markup ) ;

			resetRttTextFields();

			if ( selectedCareEpisode ) {
				showCareEpisodesBlocks( false, false );
				if ( main.dataProvider.isRttBlockEnabledForService( selectedCareEpisode.serviceId ) ) {
					displayCareEpisode( selectedCareEpisode );
				} else {
					var modifiedCareEpisode = null;
					for ( var i = 0; i < careEpisodesModified.length; i++ ) {
						var tempModifiedCareEpisode = careEpisodesModified[i];
						if ( selectedCareEpisode.id == tempModifiedCareEpisode.id ) {
							modifiedCareEpisode = tempModifiedCareEpisode;
							break;
						}
					}
					var currentlySelectedContact = selectedCareEpisode.contact;
					if ( modifiedCareEpisode && modifiedCareEpisode.contact ) {
						currentlySelectedContact = modifiedCareEpisode.contact;
					}
					careEpisodeContactSwitch.find( 'div' ).removeClass( 'ui-radio-on ui-btn-active' ).addClass( 'ui-radio-off' );
					careEpisodeContactSwitch.find( 'div[data-contact="' + currentlySelectedContact + '"]' ).removeClass( 'ui-radio-off' ).addClass( 'ui-radio-on ui-btn-active' );
				}
				changeCareEpisodeWrapper.find( 'select' ).val( selectedCareEpisode.id );
			} else {
				showCareEpisodesBlocks( false, true );
				changeCareEpisodeWrapper.find( 'select' ).val( "None" );
			}
			careEpisodeSubjectSwitch.find( 'div' ).removeClass( 'ui-radio-on ui-btn-active' ).addClass( 'ui-radio-off' );
			if ( encounterJSON.currentlySelectedSubject ) {
				careEpisodeSubjectSwitch.find( 'div[data-subject="' + encounterJSON.currentlySelectedSubject + '"]' ).removeClass( 'ui-radio-off' ).addClass( 'ui-radio-on ui-btn-active' );
			}
		} else {
			rttPanel.hide();
		}
	}

	function saveCareEpisode( bCareEpisodeSwitch ) {
		var careEpisodeObj = {};
		if ( bCareEpisodeSwitch ) {
			// delete saved encounterJSON when we are switching care episodes as it breaks a few things and does not give us anything
			delete encounterJSON.careEpisode;
			saveChanges();
		}

		careEpisodeObj.id = changeCareEpisodeWrapper.find( 'select' ).find( 'option:selected' ).val();

		var selectedContact = careEpisodeContactSwitch.find( 'div.ui-radio-on' );
		careEpisodeObj.contact = selectedContact.data( 'contact' );

		var selectedSubject = careEpisodeSubjectSwitch.find( 'div.ui-radio-on' );
		if ( selectedSubject.length ) {
			careEpisodeObj.subject = selectedSubject.data( 'subject' );
		}

		var originalCareEpisode = null;
		var patientAppt = _app.dataProvider.getAppointmentById( _app.controller.slotId );
		if ( careEpisodes && careEpisodes.length ) {
			for (var i = 0; i < careEpisodes.length; i++) {
				var tempCareEpisode = careEpisodes[i];
				if ( careEpisodeObj.id == tempCareEpisode.id ) {
					originalCareEpisode = tempCareEpisode;
					break;
				}
			}
		}

		var selectedRttCode = changeRttStatusBtn.find( 'select' ).find( 'option:selected' ).val();
		if ( selectedRttCode == "None" ) {
			selectedRttCode = null;
			if ( encounterJSON.careEpisode ) {
				delete encounterJSON.careEpisode.rttStatus;
			}
		}
		if ( originalCareEpisode &&
				main.dataProvider.isRttBlockEnabledForService( originalCareEpisode.serviceId ) &&
				selectedRttCode ) {
			// there is no need to create this object as user can't change this
			// and web service is expecting this field only if it has changed

			careEpisodeObj.rttStatus = {};
			careEpisodeObj.rttStatus.code = selectedRttCode;

			/* rttStatus.term is mandatory but we are saving it for modified care episodes purpose
			 *  this field is removed before sending to server
			 *  similar with the rttStatus.rttClockState field
			 */
			var currentRtts = rttStatuses[ careEpisodeObj.id ];
			for ( var i = 0; i < currentRtts.length; i++ ) {
				var tempRtt = currentRtts[i];
				if ( tempRtt.code == selectedRttCode ) {
					careEpisodeObj.rttStatus.term = tempRtt.term;
					careEpisodeObj.rttStatus.rttClockState = tempRtt.rttClockState;
					break;
				}
			}
		} else if ( encounterJSON.careEpisode ) {
			delete encounterJSON.careEpisode.rttStatus;
		}

		/*
		 * some of below conditions support
		 * obsolete condition when careEpisode could have already assigned rttStatus
		 * In the future it may be enough to check if rttStatus has been set - and that's it
		 */

		// remove RTT if it has not changed
		if ( originalCareEpisode &&
				originalCareEpisode.rttStatus &&
				careEpisodeObj.rttStatus &&
				originalCareEpisode.rttStatus.code == careEpisodeObj.rttStatus.code ) {
			delete careEpisodeObj.rttStatus;
			if ( encounterJSON.careEpisode &&
					encounterJSON.careEpisode.rttStatus ) {
				delete encounterJSON.careEpisode.rttStatus;
				saveChanges();
			}
		}

		// remove care episode if it has not changed
		if ( originalCareEpisode &&
				originalCareEpisode.contact == careEpisodeObj.contact &&
				originalCareEpisode.subject == careEpisodeObj.subject &&
				( ( originalCareEpisode.rttStatus && ! careEpisodeObj.rttStatus ) ||
					( ! originalCareEpisode.rttStatus && ! careEpisodeObj.rttStatus ) ) ) {
			if ( encounterJSON.careEpisode ) {
				careEpisodesModified = main.dataProvider.updatePatientModifiedCareEpisodes(
															_app.controller.patient.id,
															_app.controller.slotId,
															encounterJSON.careEpisode,
															true );
				delete encounterJSON.careEpisode;
				saveChanges();
			}
			return;
		}

		encounterJSON.careEpisode = careEpisodeObj;
		careEpisodesModified = main.dataProvider.updatePatientModifiedCareEpisodes(
															_app.controller.patient.id,
															_app.controller.slotId,
															encounterJSON.careEpisode );

		if ( ! originalCareEpisode.rttStatus &&
				! encounterJSON.careEpisode.rttStatus &&
				main.dataProvider.isRttBlockEnabledForService( originalCareEpisode.serviceId ) ) {
			/*
			 * if original care episode does not have rttStatus and
			 * if RTTEnabled is true for this care episode's service
			 * and there is no rttStatus object
			 * then remove careEpisode from encounterJSON
			 * because otherwise it would be an error in web services
			 * But we save it for careEpisodesModified to remember last user selection
			 * (it's for UI purpose only)
			 */
			delete encounterJSON.careEpisode;
		}
		saveChanges();
	}

	function resetRttTextFields( ) {
		careEpisodeElapsedTime.text( '' );
		previousRTT.text( '' );
		currentRTT.text( '' )
	}

	function displayRttStatus( rttStatus ) {
		currentRTTWrapper.find( 'div.clock-state' ).removeClass( 'none play stop' );
		if ( rttStatus ) {
			currentRTT.text( _.h( rttStatus.term ) );
			currentRTTWrapper.find( 'div.clock-state' ).addClass( rttStatus.rttClockState.toLowerCase() );
		} else {
			currentRTT.text( 'Not Set' );
		}
	}

	function displayPreviousRttStatus( rttStatus ) {
		previousRTTWrapper.find( 'div.clock-state' ).removeClass( 'none play stop' );
		if ( rttStatus ) {
			previousRTT.text( _.h( rttStatus.term ) );
			previousRTTWrapper.find( 'div.clock-state' ).addClass( rttStatus.rttClockState.toLowerCase() );
		} else {
			previousRTT.text( 'Not Set' );
		}
	}

	function displayCareEpisode( careEpisode ) {

		function calculateElapsedTime( startDate ) {
			var resettedStartDate = new Date( startDate );
			resettedStartDate = main.util.resetTimeToFullDay( resettedStartDate );
			var todayDate = new Date();
			todayDate = main.util.resetTimeToFullDay( todayDate );
			var totalElapsedDays = Math.abs( todayDate.getTime() - resettedStartDate.getTime() );
			totalElapsedDays = Math.ceil( totalElapsedDays / ( 1000 * 60 * 60 * 24 ) );

			var weeksString = "";
			var weeks = Math.floor( totalElapsedDays / 7 );
			var days = totalElapsedDays;

			if ( totalElapsedDays > 13 ) {
				weeksString = weeks + " Weeks ";
				days = totalElapsedDays % 7;
			}

			var daysString = days + " Day";
			if ( days != 1 ) {
				daysString += "s";
			}
			return weeksString + daysString;
		}

		var modifiedCareEpisode = null;
		for ( var i = 0; i < careEpisodesModified.length; i++ ) {
			var tempModifiedCareEpisode = careEpisodesModified[i];
			if ( tempModifiedCareEpisode.id == careEpisode.id ) {
				modifiedCareEpisode = tempModifiedCareEpisode;
				break;
			}
		}

		careEpisodeElapsedTime.text( calculateElapsedTime( careEpisode.rttPeriodStartDate ) );

		displayPreviousRttStatus( careEpisode.previousRttStatus );

		var currentlySelectedRTT = null;
		if ( modifiedCareEpisode && modifiedCareEpisode.rttStatus ) {
			currentlySelectedRTT = modifiedCareEpisode.rttStatus;
		}
		if ( ! currentlySelectedRTT ) {
			currentlySelectedRTT = careEpisode.rttStatus;
		}
		changeRttStatusBtn.find( 'select' ).remove();

		displayRttStatus( currentlySelectedRTT );
		var currentRttStatuses = rttStatuses[ careEpisode.id ];
		currentRttStatuses.sort( function( a, b ) {
			var firstNumber = parseInt( a.term, 10 );
			var secondNumber = parseInt( b.term, 10 );
			if ( isNaN( firstNumber) || isNaN( secondNumber ) ) {
				// should never happen but.. don't sort if it happens
				return 0;
			} else {
				return firstNumber - secondNumber;
			}
		} );
		var markup = '<select data-role="none" data-care-episode-id="' + careEpisode.id + '" class="styled-select">';
		if ( ! careEpisode.rttStatus ) {
			// when original care episode does not have set rttStatus

			/*
			 * TODO: to JAKUB :-) Please comment below line if
			 * EMIS decides not to have an option to deselect selected
			 * RTT status where one has been selected in error
			 */
			markup += "<option value='None'>None</option>";
		}
		for (var i = 0; i < currentRttStatuses.length; i++) {
			var rttStatus = currentRttStatuses[i];
			markup += "<option value='" + rttStatus.code + "'>" + rttStatus.term + "</option>";
		}
		markup += '</select>';
		changeRttStatusBtn.append( markup ) ;
		if ( ! careEpisode.rttStatus ) {
			changeRttStatusBtn.find( 'select' ).val( 'None' );
		}
		if ( currentlySelectedRTT ) {
			changeRttStatusBtn.find( 'select' ).val( currentlySelectedRTT.code );
			showCareEpisodesBlocks( true, false );
		} else {
			showCareEpisodesBlocks( true, true );
		}
		if ( ( ! careEpisode.rttStatus && currentRttStatuses.length == 0 ) ||
				( careEpisode.rttStatus && currentRttStatuses.length == 1 ) ||
				bShouldBlockFields ) {
			changeRttStatusBtn.addClass( 'ui-disabled' );
		} else {
			changeRttStatusBtn.removeClass( 'ui-disabled' );
		}

		var currentlySelectedContact = careEpisode.contact;
		if ( modifiedCareEpisode && modifiedCareEpisode.contact ) {
			currentlySelectedContact = modifiedCareEpisode.contact;
		}
		careEpisodeContactSwitch.find( 'div' ).removeClass( 'ui-radio-on ui-btn-active' ).addClass( 'ui-radio-off' );
		careEpisodeContactSwitch.find( 'div[data-contact="' + currentlySelectedContact + '"]' ).removeClass( 'ui-radio-off' ).addClass( 'ui-radio-on ui-btn-active' );
	}

	var unbindEvents = function() {
		emis.mobile.UI.removeOrientationEventsForDialog( orientationChange );
	}

	function orientationChange() {
		$( "#templateList").css( {
			"min-height" : 300 // to redo jquery.mobile.1.1.1.js : 2881 min-height set
		})

		// if iPad do the blur so there is no effect that select indicates
		// somewhere else than select field
		if(emis.mobile.UI.isiPad)
		{
			$('select').blur();
		}
	}

	function templateAddedSuccesfullyInfo() {
		if ($("#templateAddedInfo").attr("name") == "on") {
			$("#templateAddedInfo").attr("name", "off");
			$("#templateAddedInfo").show();
		} else {
			$("#templateAddedInfo").hide();
		}
	}

	// register global page events
	$( document ).delegate( pageId, "pageinit", function() {
		var page = $( this );

		rttPanel = $( '#templateListRttPanel' );
		changeCareEpisodeWrapper = $( '#change-care-episode-wrapper' );
		careEpisodeElapsedTime = rttPanel.find( '.elapsed-time' );
		previousRTTWrapper = rttPanel.find( '.previous-rtt-wrapper' );
		previousRTT = previousRTTWrapper.find( 'label' );
		currentRTTWrapper = rttPanel.find( '.current-rtt-wrapper' );
		currentRTT = currentRTTWrapper.find( 'label' );
		careEpisodeContactSwitch = rttPanel.find( '.contact-wrapper' );
		careEpisodeSubjectSwitch = rttPanel.find( '.subject-wrapper' );
		changeRttStatusBtn = $( '#change-RTT-status-wrapper' );

		changeCareEpisodeWrapper.on( 'change', function( evt ) {
			if ( changeCareEpisodeWrapper.hasClass( 'ui-disabled' ) ) {
				return false;
			}
			var selectedVal = changeCareEpisodeWrapper.find( 'option:selected' ).val();
			if ( selectedVal == "None" ) {
				showCareEpisodesBlocks( false, true );
				if ( encounterJSON.currentlySelectedCareEpisodeId ) {
					delete encounterJSON.currentlySelectedCareEpisodeId;
					saveChanges();
				}
				if ( encounterJSON.careEpisode ) {
					delete encounterJSON.careEpisode;
					saveChanges();
				}
			} else {
				var newCareEpisode = null;
				for ( var i = 0; i < careEpisodes.length; i++ ) {
					if ( careEpisodes[i].id == selectedVal ) {
						newCareEpisode = careEpisodes[i];
						break;
					}
				}
				if ( main.dataProvider.isRttBlockEnabledForService( newCareEpisode.serviceId ) ) {
					if ( newCareEpisode.rttStatus ) {
						showCareEpisodesBlocks( true, false );
					} else {
						showCareEpisodesBlocks( true, true );
					}
					displayCareEpisode( newCareEpisode );
				} else {
					var modifiedCareEpisode = null;
					for ( var i = 0; i < careEpisodesModified.length; i++ ) {
						var tempModifiedCareEpisode = careEpisodesModified[i];
						if ( newCareEpisode.id == tempModifiedCareEpisode.id ) {
							modifiedCareEpisode = tempModifiedCareEpisode;
							break;
						}
					}
					var currentlySelectedContact = newCareEpisode.contact;
					if ( modifiedCareEpisode && modifiedCareEpisode.contact ) {
						currentlySelectedContact = modifiedCareEpisode.contact;
					}
					careEpisodeContactSwitch.find( 'div' ).removeClass( 'ui-radio-on ui-btn-active' ).addClass( 'ui-radio-off' );
					careEpisodeContactSwitch.find( 'div[data-contact="' + currentlySelectedContact + '"]' ).removeClass( 'ui-radio-off' ).addClass( 'ui-radio-on ui-btn-active' );
					showCareEpisodesBlocks( false, false );
				}
				encounterJSON.currentlySelectedCareEpisodeId = newCareEpisode.id;
				saveCareEpisode( true );
			}
			emis.mobile.UI.updateDrawerContactStar();
		} );

		changeRttStatusBtn.on( 'click', function() {
			if ( changeRttStatusBtn.hasClass( 'ui-disabled' ) ) {
				return false;
			}
		});

		changeRttStatusBtn.on( 'change', function( evt ) {
			var careEpisodeId = changeRttStatusBtn.find( 'select' ).data( 'careEpisodeId' );
			var currentRtts = rttStatuses[ careEpisodeId ];
			var selectedVal = $( evt.target ).val();
			if ( selectedVal == 'None' ) {
				displayRttStatus( null );
				showCareEpisodesBlocks( true, true );
			} else {
				showCareEpisodesBlocks( true, false );
				for ( var i = 0; i < currentRtts.length; i++ ) {
					var tempRtt = currentRtts[i];
					if ( tempRtt.code == selectedVal ) {
						displayRttStatus( tempRtt );
						break;
					}
				}
			}
			saveCareEpisode();
			emis.mobile.UI.updateDrawerContactStar();
		} );

		careEpisodeContactSwitch.find( 'div' ).on( 'click', function( e) {
			var el = $( this );
			if ( el.hasClass( 'ui-disabled' ) ) {
				return false;
			}
			careEpisodeContactSwitch.find( 'div' ).not( el ).removeClass( 'ui-radio-on ui-btn-active' ).addClass( 'ui-radio-off' );
			el.removeClass( 'ui-radio-off' ).addClass( 'ui-radio-on ui-btn-active' );
			saveCareEpisode();
		} );

		careEpisodeSubjectSwitch.find( 'div' ).on( 'click', function( e) {
			var el = $( this );
			if ( el.hasClass( 'ui-disabled' ) ) {
				return false;
			}
			careEpisodeSubjectSwitch.find( 'div' ).not( el ).removeClass( 'ui-radio-on ui-btn-active' ).addClass( 'ui-radio-off' );
			el.removeClass( 'ui-radio-off' ).addClass( 'ui-radio-on ui-btn-active' );
			saveCareEpisode();

			encounterJSON.currentlySelectedSubject = careEpisodeSubjectSwitch.find( 'div.ui-radio-on' ).data( 'subject' );
			// used for storing currently selected subject
			// it's needed when switching between "None" and some care episode
			// it's saved per patientId
			saveChanges();
		} );

		$( '#consPropDate' ).on( 'datebox', function( event, payload ) {
			if ( payload.method === 'set' ) {
				var value = $( '#consPropDate' ).val();
				// isoDate - which is '2012-05-23T00:00:00'
				var isoDate = _app.util.toISODate( value ).split( "T" )[0];
				var isoTime = encounterJSON.effectiveTime.split( "T" )[1];

				encounterJSON.effectiveTime = isoDate + 'T' + isoTime;

				// if date of appointment is today then do not allow to set time
				// after current time
				// for appointment date other than today do not check time at all
				var isoDate = encounterJSON.effectiveTime.split( "T" )[0];
				var isoTime = $('#consPropTime').val() + ':00';
				var isoNowCompareDate = null;
				var isoNowDate = main.util.getISONowDate();
				if ( main.dataProvider.isMinimumPatientDataServiceVersion( main.controller.patient.id, "0004" ) ) {
					isoNowCompareDate = main.util.getISONowUTCDate();
				} else {
					isoNowCompareDate = isoNowDate;
				}
				if (isoNowCompareDate.split('T')[0] == isoDate &&
					(isoTime > isoNowDate.split('T')[1]))
				{
					var dateToSet = isoNowCompareDate;
					encounterJSON.effectiveTime = dateToSet;
					$('#consPropTime').val(isoNowDate.substring(11,16));
				}
				saveChanges();
			}
		} );

		$( '#consPropTime' ).on( 'datebox', function( event, payload ) {
			if ( payload.method === 'set' ) {
				var value = $( '#consPropTime' ).val();
				var isoDate = encounterJSON.effectiveTime.split( "T" )[0];
				// which is
				// '2012-05-23T00:00:00'
				var isoTime = value + ':00';
				var isoNowCompareDate = null;
				var isoNowDate = main.util.getISONowDate();
				var isMinimumService = main.dataProvider.isMinimumPatientDataServiceVersion( main.controller.patient.id, "0004" );
				if ( isMinimumService ) {
					isoNowCompareDate = main.util.getISONowUTCDate();
				} else {
					isoNowCompareDate = isoNowDate;
				}

				// if date of appointment is today then do not allow to set time
				// after current time
				// for appointment date other than today do not check time at all
				if (isoNowCompareDate.split('T')[0] == isoDate &&
					(isoTime > isoNowDate.split('T')[1]))
					{
						var dateToSet = isoNowCompareDate;
						encounterJSON.effectiveTime = dateToSet;
						$('#consPropTime').val(isoNowDate.substring(11,16));
					}
				else
				{
					if ( isMinimumService ) {
						var timeSplit = isoTime.split( ':' );
						var minutesFromMidnight = parseInt( timeSplit[0], 10 ) * 60 + parseInt( timeSplit[1] );
						var utcMinutes = minutesFromMidnight + new Date().getTimezoneOffset();
						var newHours = Math.floor( utcMinutes / 60 );
						var newMinutes = utcMinutes % 60;
						encounterJSON.effectiveTime = isoDate + 'T' +
														( newHours < 10 ? '0' + newHours : newHours ) +
														':' +
														( newMinutes < 10 ? '0' + newMinutes : newMinutes ) +
														':00';
					} else {
						encounterJSON.effectiveTime = isoDate + 'T' + isoTime;
					}
				}
				saveChanges();
			}
		} );

		$( '#consPropDuration' ).on( 'change', function( event ) {
			var el = $( this );
			var value = el.val();
			if ((value == "") && el.is(":focus") == true){
				return;
			} else {
				if (value <= 0)
				{
					value = 1;
				}
				else if (value > 480)
				{
					value = 480;
				}
			}
			encounterJSON.duration = value;
			el.val(encounterJSON.duration);
			$('#consPropDurationView').val(encounterJSON.duration);
			saveChanges();
		} );

		$('#consPropDuration').on( 'blur', function( e ) {
			var dur = $('#consPropDuration').val();
			if(dur>480) $('#consPropDuration').val('480');
			if(dur<=0) $('#consPropDuration').val('1');
			saveChanges();
		} );

		$('#consPropDuration').on( 'keyup', function( e ) {
			var dur = $('#consPropDuration').val();
			var pattern = new RegExp("^[0-9]{0,3}$");
			if (!pattern.test(dur)) {
				$('#consPropDuration').val("");
				$('#consPropDurationView').val("");
			}
		} );

		$( '#quickNotesArea' ).on( 'keyup', function( event ) {
			var value = $( this ).val();
			var type = "quickNote";
			var noteId = main.controller.patient.id+"#"+main.controller.slotId;
			if(value) {
				main.storage.save(type,noteId,value);
			} else {
				main.storage.removeItem("quickNote_"+main.controller.patient.id+"#"+main.controller.slotId);
			}
			setTimeout( function() {
				emis.mobile.UI.updateSyncButtons();
				emis.mobile.UI.updateDrawerContactStar();
			}, 0 );
		} );

		$( document ).on( 'click', function( e ) {
			$( "#templateList #changeTemplateDiv" ).hide();
		} );

		$('input,textarea').bind('cut copy paste', function (e) {
			e.preventDefault(); //disable cut,copy,paste
		});

	});

	this.bindDataAndEvents = function($page) {
		$page.off( 'pagehide', unbindEvents );
		$page.off( 'pageshow', orientationChange );
		contactPage = $page;
		//bShouldBlockFields = main.dataProvider.getErrorAppointmentByPatientId(main.controller.patient.id);
		bShouldBlockFields =false;
		//set contact page header
		emis.mobile.UI.prepareTemplatePage( $page );
		$( '#changeTemplateDiv' ).hide();

		templateAddedSuccesfullyInfo();
		$( "#consPropEditMode" ).show();
		$( "#consPropViewMode" ).hide();
		$( "#imageEditOn" ).hide();
		$( "#imageEditOff" ).hide();

		fillConsultationProperties(contactPage);
		fillRTTPanel( contactPage );
		fillEventsetsList( contactPage );

		var dataTemplateHeaders = _app.dataProvider.getTemplateHeaders();
		fillTemplatesSelect(dataTemplateHeaders);

		clearValidationMarks();

		$( '#tempList form div input' ).val( "" );

		emis.mobile.UI.preparePatientHeader();

		if(main.storage.getItem( "DataWipeReached" )=== '0' )
		{
			if(!($( "#addContact" ).hasClass( "ui-disabled" ))) {
				$( "#addContact, #addContact2" ).addClass( "ui-disabled" );
			}
		} else {
			if($( "#addContact" ).hasClass( "ui-disabled" )) {
				$( "#addContact, #addContact2" ).removeClass( "ui-disabled" );
			}
		}

		/*fix for #113291 and all similar problems in the future*/
		$( "#drawer li" ).removeClass( "drawer-active" ).siblings("#drawer-contact").addClass( "drawer-active" );
		if (main.controller.currentlySelectedAppointment.SlotId != main.controller.previousSlotId) {
			//Date should change to the date that the appointment is on.
			//Time on the contact form should change to the time that you load open that page.
			var dt = main.controller.currentlySelectedAppointment.StartDateTime;
			$('#consPropDate').val(_app.util.standardizeDate(dt));
			var newDt = new Date();
			var time = ((newDt.getHours() < 10)?"0":"") + newDt.getHours() +":"+ ((newDt.getMinutes() < 10)?"0":"") + newDt.getMinutes()
			$('#consPropTime').val(time);
			if ( main.dataProvider.isMinimumPatientDataServiceVersion( main.controller.patient.id, "0004" ) ) {
				var oldDateWithNewTime = new Date( dt );
				oldDateWithNewTime.setHours( newDt.getHours() );
				oldDateWithNewTime.setMinutes( newDt.getMinutes() );
				oldDateWithNewTime.setSeconds( newDt.getSeconds() );
				encounterJSON.effectiveTime = _app.util.getISOUTCDate( oldDateWithNewTime );
			} else {
				encounterJSON.effectiveTime = dt.substring(0,11) +time + ":00";
			}
			$('#consPropDuration').val(encounterJSON.duration);
			saveChanges();
		}
		emis.mobile.UI.addOrientationEventsForDialog(orientationChange);
		orientationChange();
		main.controller.previousSlotId = main.controller.slotId;
		if ( bShouldBlockFields ) {
			$("#addContact, #addContact2").addClass("ui-disabled");
			$("#consPropDate, #consPropTime, #consPropDuration, #consPropConsultationType, #quickNotesArea").attr( "disabled", "disabled" );
			changeCareEpisodeWrapper.addClass( 'ui-disabled' );
		} else {
			$("#addContact, #addContact2").removeClass("ui-disabled");
			$("#consPropDate, #consPropTime, #consPropDuration, #consPropConsultationType, #quickNotesArea").removeAttr( "disabled" );
			changeCareEpisodeWrapper.removeClass( 'ui-disabled' );
		}
		$page.on( 'pageshow', orientationChange );
		$page.on( 'pagehide', unbindEvents );
	};

	return this;
}