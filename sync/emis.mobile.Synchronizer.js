/**
 * data synchronization with EMIS server Functionalities provided: Log in/out session, access token session Get Patient
 * List from WS Get Patient Get Routine Sync Data Get Template Post Encounter Post Log Post Task Data uploading Data
 * fetching
 */
( function( ) {
	var _password;
	// initialized in constructor
	var that;

	// var syncStates = ["start",
	// 				"sessionSynchronized",
	// 				"KeySynchronized",
	// 				"newDrugsSynchronized",
	// 				"EncounterSynchronized",
	// 				"taskSynchronized",
	// 				"dataWiped",
	// 				"patientlistSynchronized",
	// 				"patientdataSynchronized",
	// 				"DrugListSynchronized",
	// 				"RoutineSyncDataSynchronized",
	// 				"TemplateSynchronized"] ;

	emis.mobile.Synchronizer = function( ) {
		that = this;
		this.status = main.controller.syncInitStatus;
		// data to sync
		this.patientListArray = [];
		this.taskarray = [];
		this.drugarray = [];
		this.consentsArray = [];
		this.EncounterArray = [];
		this.LogArray = [];
		this.templatesHeadersArray = [];
		this.createdSchedulesArray = [];
		this.editedSchedulesArray = [];
		this.cancelledSchedulesArray = [];

		this.totalPatientsInDataUpload = 0;
		this.totalPatientDataToUpload = 0;
		this.totalPatientDataToUploadLeft = 0;

		this.bSinglePatientSync = false;

		this.failedData = [] ;

		this.newFormatOfNewDrugsSlotIds = [];

		return this;
	};

	/**
	 * set hashed password used for synchronization session renewal
	 */
	emis.mobile.Synchronizer.prototype.setPassword = function( pass ) {
		_password = pass;
	}

	emis.mobile.Synchronizer.prototype.reinitialiseData = function() {
		that.prepareData () ;
		$(window).trigger('emis.syncinitialized', [this.steps]) ;
	}

	emis.mobile.Synchronizer.prototype.initSynchronizer = function() {
		this.slotId = main.controller.syncSinglePatientSlotId;
		if (this.slotId) {
			var slot = main.dataProvider.getAppointmentById(this.slotId) ;
			this.patientId = slot.PatientId ;
			if ( ! this.patientId || this.patientId == 'null' ) {
				this.patientId = "nullId" + this.slotId;
			}
		} else {
			this.patientId = null ;
		}
		this.prepareData () ;
		$(window).trigger('emis.syncinitialized', [this.steps]) ;
	} ;

	emis.mobile.Synchronizer.prototype.start = function() {

		if (!main.controller.bDuringSynchronisation ) {

			main.controller.bDuringSynchronisation = true;
			main.storage.setItem("SyncStatus", "1");
			main.storage.setItem("DataWipeReached", "0");

			$(window).trigger('emis.syncstarted') ;
			this.synchronize() ;
		} else {
			emis.mobile.console.log( "Error : Synchronization initialized more than once, concurrently..." );
			this.delegate.syncFailed.call( this.delegate, new emis.mobile.ErrorModel( INVALID_SYNC_CODE, INVALID_SYNC_DESCRIPTION ), "not started" );
		}


	} ;

	emis.mobile.Synchronizer.prototype.synchronize = function( ) {
		if (this.bSinglePatientSync) {
			this.synchronizeSinglePatient();
		} else {
			this.synchronizeAll() ;
		}
	} ;

	// The method that control the synchronization flow, in the order recommended in
	// the requirement.
	emis.mobile.Synchronizer.prototype.synchronizeAll = function( ) {
		switch ( this.status ) {
			case "start":
			case "sessionSynchronized":

				this.synchronizeSession( );
				break;
			case "KeySynchronized":
				this.synchronizeLog( );
				break;
			case "LogSynchronized":
				if ( main.dataProvider.getPrescriber( ) != null ) {
					this.synchronizeAddedDrugs( );
				} else {
					this.synchronizeEncounter( );
				}
				break;
			case "newDrugsSynchronized":
				this.synchronizeEncounter( );
				break;
			case "EncounterSynchronized":
				this.synchronizeConsents( );
				break;
			case "consentSynchronized":
				this.synchronizetask( );
				break;
			case "taskSynchronized":
				if(ENABLE_SCHEDULES) {
					this.synchronizeCreatedSchedules();
				} else {
					this.wipeData();
				}
				break;
			case "createdSchedulesSynchronized":
				this.synchronizeEditedSchedules();
				break;
			case "editedSchedulesSynchronized":
				this.synchronizeCancelledSchedules()
				break;
			case "cancelledSchedulesSynchronized":
				this.wipeData();
				break;
			case "dataWiped":
				this.synchronizepatientlist();
				break;
			case "patientlistSynchronized":
				this.synchronizepatientdata();
				break;
			case "patientdataSynchronized":
				this.delegate.geocode();
				if (main.dataProvider.getPrescriber() != null) {
					this.synchronizeDrugs();
				} else {
					this.synchronizeRoutineSyncData();
				}
				break;
			case "DrugListSynchronized":
				this.synchronizeRoutineSyncData();
				break;
			case "RoutineSyncDataSynchronized":
				this.synchronizeTemplates();
				break;
			case "TemplateSynchronized":
				this.synchronizeSession();
				break;
			case "sessionEnded":
				emis.mobile.console.log("synchronization: sessionEnded");
				// Success delegate to be implemented in the classes, where Synchronizer
				// object is created



				this.delegate.syncComplete.call(this.delegate );
				break;
			default:
				break;
		}

	} ;

	// synchronize only one patient given this.patientId
	// some methods from synchronizeAll are omitted
	emis.mobile.Synchronizer.prototype.synchronizeSinglePatient = function() {
		switch ( this.status ) {
			case "start":
			case "sessionSynchronized":
				this.synchronizeSession( );
				break;
			case "KeySynchronized":
				this.synchronizeLog( );
				break;
			case "LogSynchronized":
				if ( main.dataProvider.getPrescriber( ) != null ) {
					this.synchronizeAddedDrugs();
				} else {
					this.synchronizeEncounter();
				}
				break;
			case "newDrugsSynchronized":
				this.synchronizeEncounter();
				break;
			case "EncounterSynchronized":
				this.synchronizeConsents();
				break;
			case "consentSynchronized":
				this.synchronizetask();
				break;
			case "taskSynchronized":
				if(ENABLE_SCHEDULES) {
					this.synchronizeCreatedSchedules();
				} else {
					this.wipeData();
				}
				break;
			case "createdSchedulesSynchronized":
				this.synchronizeEditedSchedules();
				break;
			case "editedSchedulesSynchronized":
				this.synchronizeCancelledSchedules()
				break;
			case "cancelledSchedulesSynchronized":
				this.wipeData();
				break;
			case "dataWiped":
			case "patientlistSynchronized":
				this.synchronizepatientdata();
				break;
			case "patientdataSynchronized":
			case "DrugListSynchronized":
			case "RoutineSyncDataSynchronized":
			case "TemplateSynchronized":
			case "sessionEnded":
				emis.mobile.console.log( "synchronization: sessionEnded" );

				// Success delegate to be implemented in the classes, where Synchronizer
				// object is created
				this.delegate.syncComplete.call( this.delegate );

				break;
			default:
				break;
		}
		return true ;
	} ;
	// get all data for synchronization
	// prepare steps for ui
	emis.mobile.Synchronizer.prototype.prepareData = function( ) {
		main.controller.uploadFailed = false;
		main.controller.downloadFailed = false;
		var dm = new emis.mobile.NewDrugModel() ;
		var tm = new emis.mobile.TaskModel() ;
		var em = new emis.mobile.EncountersModel() ;
		var lm = new emis.mobile.LogModel() ;
		var cm = new emis.mobile.ConsentModel() ;
		var sm = new emis.mobile.ScheduleModel();

		if (this.slotId && this.patientId) {
			this.bSinglePatientSync = true;
			// checks if the are drugs to synchronize
			var drugsForPatient = dm.getAllForPatient(this.patientId);
			if (drugsForPatient.length) {
				this.drugarray = [this.patientId] ;
			} else {
				this.drugarray = [] ;
			}
			this.taskarray = tm.findAllIdsByPatientId(this.patientId);
			this.EncounterArray = em.findAllEncounterIdsBySlotId(this.slotId);
			this.consentsArray = cm.findAllNotSyncedIdsByPatientId(this.patientId);
			this.createdSchedulesArray = sm.findAllIdsByStatusAndPatientId(sm.CREATED,this.patientId);
			this.editedSchedulesArray = sm.findAllIdsByStatusAndPatientId(sm.EDITED,this.patientId);
			this.cancelledSchedulesArray = sm.findAllIdsByStatusAndPatientId(sm.CANCELLED,this.patientId);
		} else {
			this.bSinglePatientSync = false;
			this.drugarray = dm.findAllPatientIds( );
			this.taskarray = tm.findAllIds( );
			this.EncounterArray = em.findAllEncounterIds( );
			this.LogArray = lm.findAllCurrentUserIds( );
			this.consentsArray = cm.findAllNotSyncedIds( );
			this.createdSchedulesArray = sm.findAllIdsByStatus(sm.CREATED);
			this.editedSchedulesArray = sm.findAllIdsByStatus(sm.EDITED);
			this.cancelledSchedulesArray = sm.findAllIdsByStatus(sm.CANCELLED);
		}

		this.drugarrayLength = this.drugarray.length ;
		this.taskarrayLength = this.taskarray.length ;
		this.EncounterArrayLength = this.EncounterArray.length ;
		this.logArrayLength = this.LogArray.length ;
		this.consentsArrayLength = this.consentsArray.length ;
		this.createdSchedulesArrayLength = this.createdSchedulesArray.length;
		this.editedSchedulesArrayLength = this.editedSchedulesArray.length;
		this.cancelledSchedulesArrayLength = this.cancelledSchedulesArray.length;

		this.newFormatOfNewDrugsSlotIds = dm.getAllSlotIdsForPatients( );

		var uniquePatientIds = [];
		for ( var i = 0; i < this.drugarray.length; i++ ) {
			if ( uniquePatientIds.indexOf( this.drugarray[i] ) == -1 ) {
				uniquePatientIds.push( this.drugarray[i] );
			}
		}
		for ( var i = 0; i < this.taskarray.length; i++ ) {
			var patientId = this.taskarray[i].split("#");
			if ( patientId.length > 1 ) {
				patientId = patientId[0];
				if ( uniquePatientIds.indexOf( patientId ) == -1 ) {
					uniquePatientIds.push( patientId );
				}
			}
		}

		var uniqueEncountersToSend = [];

		var quickNotes = main.dataProvider.findAllPatientIdsWithQuickNotes();
		if ( ! quickNotes ) {
			quickNotes = [];
		}
		for ( var i = 0; i < quickNotes.length; i++ ) {
			// we're looking only unique patientIds, not slotIds
			var patientId = quickNotes[i].split("#");
			if ( patientId.length > 1 ) {
				patientId = patientId[0];
				if ( uniquePatientIds.indexOf( patientId ) == -1 ) {
					uniquePatientIds.push( patientId );
				}
				var slotId = patientId[1];
				if ( uniqueEncountersToSend.indexOf( slotId ) == -1 ) {
					uniqueEncountersToSend.push( slotId );
				}
			}
		}

		var eventsets = main.dataProvider.getCompletedEventsets();
		for ( var i = 0; i < eventsets.length; i++ ) {
			//we're looking only unique patientIds, not slotIds
			var patientId = eventsets[i].patientId;
			if ( patientId ) {
				patientId = patientId.split("#");
				if ( patientId.length > 1 ) {
					patientId = patientId[0];
					if ( uniquePatientIds.indexOf( patientId ) == -1 ) {
						uniquePatientIds.push( patientId );
					}
					var slotId = patientId[1];
					if ( uniqueEncountersToSend.indexOf( slotId ) == -1 ) {
						uniqueEncountersToSend.push( slotId );
					}
				}
			}
		}

		var rttChangeIds = main.dataProvider.findAllPatientIdsWithRttChange();
		for ( var i = 0; i < rttChangeIds.length; i++ ) {
			//we're looking only unique patientIds, not slotIds
			patientId = rttChangeIds[i].split("#");
			if ( patientId.length > 1 ) {
				patientId = patientId[0];
				if ( uniquePatientIds.indexOf( patientId ) == -1 ) {
					uniquePatientIds.push( patientId );
				}
				var slotId = patientId[1];
				if ( uniqueEncountersToSend.indexOf( slotId ) == -1 ) {
					uniqueEncountersToSend.push( slotId );
				}
			}
		}

//		for ( var i = 0; i < this.consentsArrayLength; i++ ) {
//			var patientId = this.consentsArray[i].split("#");
//			if ( patientId.length > 1 ) {
//				patientId = patientId[0];
//				if ( uniquePatientIds.indexOf( patientId ) == -1 ) {
//					uniquePatientIds.push( patientId );
//				}
//			}
//		}

		for ( var i = 0; i < this.createdSchedulesArrayLength; i++ ) {
			var patientId = this.createdSchedulesArray[i].split("#");
			if ( patientId.length > 1 ) {
				patientId = patientId[0];
				if ( uniquePatientIds.indexOf( patientId ) == -1 ) {
					uniquePatientIds.push( patientId );
				}
			}
		}

		for ( var i = 0; i < this.editedSchedulesArrayLength; i++ ) {
			var patientId = this.editedSchedulesArray[i].split("#");
			if ( patientId.length > 1 ) {
				patientId = patientId[0];
				if ( uniquePatientIds.indexOf( patientId ) == -1 ) {
					uniquePatientIds.push( patientId );
				}
			}
		}

		for ( var i = 0; i < this.cancelledSchedulesArrayLength; i++ ) {
			var patientId = this.cancelledSchedulesArray[i].split("#");
			if ( patientId.length > 1 ) {
				patientId = patientId[0];
				if ( uniquePatientIds.indexOf( patientId ) == -1 ) {
					uniquePatientIds.push( patientId );
				}
			}
		}


		this.totalPatientsInDataUpload = uniquePatientIds.length;
		this.totalPatientDataToUpload = this.drugarrayLength + this.taskarrayLength + uniqueEncountersToSend.length
			+this.consentsArrayLength+ this.createdSchedulesArrayLength + this.editedSchedulesArrayLength + this.cancelledSchedulesArrayLength;
		this.totalPatientDataToUploadLeft = this.totalPatientDataToUpload;

		// costruct steps data for synchronizer dialog
		if ( ! this.bSinglePatientSync ) {
			this.steps = [
				{status:'Upload patient data', all:this.totalPatientsInDataUpload, bDisplayEvenOne: true },
				{status:'Download patient data', all:undefined, bDisplayEvenOne: true},
				{status:'Medication reference', all:1},
				{status:'Template data', all:undefined}
			] ;
		}

	} ;

	emis.mobile.Synchronizer.prototype.getStepByStatus = function (status) {
		var step = $.grep(this.steps, function (s, i){
			return s.status == status ;
		}) ;
		if (step) {
			return step[0] ;
		}
		return null ;
	} ;

	emis.mobile.Synchronizer.prototype.synchronizeSession = function( ) {
		this.UserSession = new emis.mobile.UserSessionAPI( );
		this.UserSession.delegate = this;
		switch ( this.status ) {
			case "start":
				this.UserSession.getSession( main.controller.user.login, _password, main.controller.user.cdb );
				break;
			case "sessionSynchronized":
				this.UserSession.verifyKey( main.dataProvider.getUserSessionId( ), main.controller.user.accessToken );
				break;
			case "TemplateSynchronized":
				// we do not need to end session
				// omit second argument
				this.sessionSynchronized.call( this, null );

				break;
			default:
				break;
		}
	}

	emis.mobile.Synchronizer.prototype.synchronizeAddedDrugs = function() {
		this.PostDrug = new emis.mobile.PostMedicationAPI( );
		var dm = new emis.mobile.NewDrugModel() ;
		this.PostDrug.delegate = this;

		var successCallback = function() {
			var updateStatus = function() {
				that.status = "newDrugsSynchronized";
				that.APISuccess( "Added drugs synchronized" );
			}
			if ( that.bSinglePatientSync ) {
				updateStatus();
			} else {
				$(window).one('emis.progressbarupdated', function() {
					updateStatus();
				});
				$(window).trigger('emis.syncprogress', [{status:'Upload patient data', all:that.totalPatientsInDataUpload, calcAll:that.totalPatientDataToUpload, calcLeft:that.totalPatientDataToUploadLeft, bDisplayEvenOne: true}]) ;
			}
		}

		if ( this.drugarray.length != 0 ) {
			var id = this.drugarray.pop( );

			if ( ! that.bSinglePatientSync ) {
				$(window).trigger('emis.syncprogress', [{status:'Upload patient data', all:this.totalPatientsInDataUpload, calcAll:this.totalPatientDataToUpload, calcLeft:this.totalPatientDataToUploadLeft, bDisplayEvenOne: true}]) ;
			}

			// first we are sending drugs with new format (grouped by slotId)
			// and then we're sending drugs with old format (grouped by patientId) if there any...
			// this everthing is for fixing TFS bug #160828
			// and because previously all drugs were sent with the same slotId
			// nevertheless how many slots for patient with the same patientId have been

			var oldFormatDrugs = dm.getAllWithoutSlotIdForPatient( id );
			var drugObj;
			var slotId;
			var slotFound = false;
			var newFormatSlotFound = false;
			if (this.newFormatOfNewDrugsSlotIds.length &&
					this.newFormatOfNewDrugsSlotIds[id] &&
					this.newFormatOfNewDrugsSlotIds[id].length > 0) {
				slotId = this.newFormatOfNewDrugsSlotIds[id].pop();
				slotFound = true;
				newFormatSlotFound = true;
				drugObj = dm.getInUploadFormat( id, slotId );
				if ( this.newFormatOfNewDrugsSlotIds[id].length > 0 ||
						( this.newFormatOfNewDrugsSlotIds[id].length == 0 && oldFormatDrugs.length ) ) {
					this.drugarray.push(id); //there are still some drugs left...
				}
				if ( this.newFormatOfNewDrugsSlotIds[id].length == 0 && ! oldFormatDrugs.length ) {
					this.totalPatientDataToUploadLeft = this.totalPatientDataToUploadLeft - 1;
				}
			} else if (oldFormatDrugs.length) {
				drugObj = dm.getInUploadFormat( id );
				this.totalPatientDataToUploadLeft = this.totalPatientDataToUploadLeft - 1;
			}

			if ( ! slotFound ) {
				// only for drugs with old format type
				var apps = main.dataProvider.getAppointmentsByPatientId(id) ;
				var app;
				if (apps.length) {
					//finding slot id
					var k = 0;
					while(!slotFound && k<apps.length) {
						app = apps[k];
						var sid = app.SessionId;
						if(sid) {
							var ses = main.dataProvider.getSessionById(sid) ;
							if(ses) {
								if (ses.AvailableForMobile) {
									slotFound = true;
									slotId = app.SlotId;
								}
							}
						}
						k = k + 1;
					}
					if(!slotFound) { // try to call it with first slot found anyway.
						slotId = apps[0].SlotId;
					}
				}
			}
			if (slotFound) {
				this.PostDrug.postMedication( main.controller.SessionId, id, slotId, drugObj, newFormatSlotFound );
			} else {
				successCallback();
			}
		} else {
			successCallback();
		}
	}

	emis.mobile.Synchronizer.prototype.synchronizetask = function( ) {
		this.PostTask = new emis.mobile.TaskAPI( );
		this.PostTask.delegate = this;
		if ( this.taskarray.length != 0 ) {
			if ( ! that.bSinglePatientSync ) {
				$(window).trigger('emis.syncprogress', [{status:'Upload patient data', all:this.totalPatientsInDataUpload, calcAll:this.totalPatientDataToUpload, calcLeft:this.totalPatientDataToUploadLeft, bDisplayEvenOne: true}]) ;
			}
			this.totalPatientDataToUploadLeft = this.totalPatientDataToUploadLeft - 1;

			var id = this.taskarray.pop( );
			var taskObj = new emis.mobile.TaskModel( ).getInUploadFormat( id ) ;
			this.PostTask.postTask(id, taskObj );
		} else {
			var updateStatus = function() {
				that.status = "taskSynchronized";
				that.APISuccess( "Task synchronized" );
			}
			if ( that.bSinglePatientSync ) {
				updateStatus();
			} else {
				$(window).one('emis.progressbarupdated', function() {
					updateStatus();
				});
				$(window).trigger('emis.syncprogress', [{status:'Upload patient data', all:that.totalPatientsInDataUpload, calcAll:that.totalPatientDataToUpload, calcLeft:that.totalPatientDataToUploadLeft, bDisplayEvenOne: true}]) ;
			}
		}
	}

	emis.mobile.Synchronizer.prototype.synchronizeCreatedSchedules = function() {
		this.PostCreateSchedule = new emis.mobile.CreateScheduleAPI();
		this.PostCreateSchedule.delegate = this;
		if(this.createdSchedulesArray.length != 0) {
			var id = this.createdSchedulesArray.pop();
			var createdScheduleObj = new emis.mobile.ScheduleModel().getInUploadFormat(id);
			this.PostCreateSchedule.createSchedule(createdScheduleObj);
		} else {
			var updateStatus = function() {
				that.status = "createdSchedulesSynchronized";
				that.APISuccess( "Created schedules synchronized");
			}
			if ( that.bSinglePatientSync ) {
				updateStatus();
			} else {
				$(window).one('emis.progressbarupdated', function() {
					updateStatus();
				});
				$(window).trigger('emis.syncprogress', [{status:'Upload patient data', all:that.totalPatientsInDataUpload, calcAll:that.totalPatientDataToUpload, calcLeft:that.totalPatientDataToUploadLeft, bDisplayEvenOne: true}]) ;
			}

		}
	}

	emis.mobile.Synchronizer.prototype.synchronizeEditedSchedules = function() {
		this.PostEditSchedule = new emis.mobile.EditScheduleAPI();
		this.PostEditSchedule.delegate = this;
		if(this.editedSchedulesArray.length != 0) {
			var id = this.editedSchedulesArray.pop();
			var editedScheduleObj = new emis.mobile.ScheduleModel().getInUploadFormat(id);
			this.PostEditSchedule.editSchedule(editedScheduleObj);
		} else {
			var updateStatus = function() {
				that.status = "editedSchedulesSynchronized";
				that.APISuccess( "Edited schedules synchronized");
			}
			if ( that.bSinglePatientSync ) {
				updateStatus();
			} else {
				$(window).one('emis.progressbarupdated', function() {
					updateStatus();
				});
				$(window).trigger('emis.syncprogress', [{status:'Upload patient data', all:that.totalPatientsInDataUpload, calcAll:that.totalPatientDataToUpload, calcLeft:that.totalPatientDataToUploadLeft, bDisplayEvenOne: true}]) ;
			}
		}
	}

	emis.mobile.Synchronizer.prototype.synchronizeCancelledSchedules = function() {
		this.PostCancelSchedule = new emis.mobile.CancelScheduleAPI();
		this.PostCancelSchedule.delegate = this;
		if(this.cancelledSchedulesArray.length != 0) {
			var id = this.cancelledSchedulesArray.pop();
			var cancelledScheduleObj = new emis.mobile.ScheduleModel().getInUploadFormat(id);
			this.PostCancelSchedule.cancelSchedule(cancelledScheduleObj);
		} else {
			var updateStatus = function() {
				that.status = "cancelledSchedulesSynchronized";
				that.APISuccess( "Cancelled schedules synchronized");
			}
			if ( that.bSinglePatientSync ) {
				updateStatus();
			} else {
				$(window).one('emis.progressbarcompleted', function() {
					updateStatus();
				});
				$(window).trigger('emis.syncprogress', [{status:'Upload patient data', all:this.totalPatientsInDataUpload, left: 0, bDisplayEvenOne: true}]) ;
			}
		}
	}

	emis.mobile.Synchronizer.prototype.synchronizeConsents = function( ) {
		this.PostConsent = new emis.mobile.ConsentAPI( );
		this.PostConsent.delegate = this;
		if ( this.consentsArray.length != 0 ) {
			var id = this.consentsArray.pop( );
			var consentObj = new emis.mobile.ConsentModel( ).getInUploadFormat( id ) ;
			this.PostConsent.postConsent(id, consentObj );
		} else {
			var updateStatus = function() {
				that.status = "consentSynchronized";
				that.APISuccess( "Consent synchronized" );
			}
			if ( that.bSinglePatientSync ) {
				updateStatus();
			} else {
				$(window).one('emis.progressbarupdated', function() {
					updateStatus();
				});
				$(window).trigger('emis.syncprogress', [{status:'Upload patient data', all:that.totalPatientsInDataUpload, calcAll:that.totalPatientDataToUpload, calcLeft:that.totalPatientDataToUploadLeft, bDisplayEvenOne: true}]) ;
			}
		}
	}

	emis.mobile.Synchronizer.prototype._syncEncounter = function(id) {
		var Encounter = new emis.mobile.EncounterAPI( );
		Encounter.delegate = this;
		var encounterObj = new emis.mobile.EncountersModel( ).getInUploadFormat( id );
		var storage = new emis.mobile.Storage();
		var quickNotes = storage.find( "quickNote", id );
		if ( quickNotes ) {
			var eventToAdd = {};
			eventToAdd.associatedText = quickNotes;
			eventToAdd.consultationSection = {};
			eventToAdd.consultationSection.code = QUICKNOTES_TEMPLATE_ID;
			eventToAdd.consultationSection.term = "Comment";
			encounterObj.payload.encounter.events.push( eventToAdd );
		}
		if ( encounterObj.payload.encounter.events.length > 0 ||
				(encounterObj.payload.encounter.careEpisode && encounterObj.payload.encounter.careEpisode.rttStatus)) {
			// duration bug fix - another check. probably not needed but it's still good to check
			if ( encounterObj.payload.encounter.duration == "" || encounterObj.payload.encounter.duration == null ) {
				encounterObj.payload.encounter.duration = "0";
			}

			for ( var i = 0; i < encounterObj.payload.encounter.consultors.length; i++ ) {
				if ( !encounterObj.payload.encounter.consultors[i].name || encounterObj.payload.encounter.consultors[i].name == '' ) {
					var resp = main.dataProvider.getSessionData();
					var userId = resp.Payload.UserInRoleId;
					var organisationPeople = main.dataProvider.getOrganisationPeople( );
					for ( var j in organisationPeople ) {
						if ( userId == organisationPeople[j].id ) {
							encounterObj.payload.encounter.consultors[i].name = organisationPeople[j].object.DisplayName;
							break;
						}
					}
				}

				if ( !encounterObj.payload.encounter.consultors[i].name || encounterObj.payload.encounter.consultors[i].name == '' ) {
					encounterObj.payload.encounter.consultors[i].name = main.controller.user.name;
				}

				if ( !encounterObj.payload.encounter.consultors[i].name || encounterObj.payload.encounter.consultors[i].name == '' ) {
					encounterObj.payload.encounter.consultors[i].name = "unknown";
				}
			}

			//var EncounterString = JSON.stringify( encounterObj );
			Encounter.postEncounter(id, encounterObj );
		}  else {
			this.EncounterSynchronized( );
		}
	} ;

	emis.mobile.Synchronizer.prototype.synchronizeEncounter = function( ) {
		if ( this.EncounterArray.length != 0 ) {
			var id = this.EncounterArray.pop( );
			if ( ! that.bSinglePatientSync ) {
				$(window).trigger('emis.syncprogress', [{status:'Upload patient data', all:this.totalPatientsInDataUpload, calcAll:this.totalPatientDataToUpload, calcLeft:this.totalPatientDataToUploadLeft, bDisplayEvenOne: true}]) ;
			}
			this.totalPatientDataToUploadLeft = this.totalPatientDataToUploadLeft - 1;
			this._syncEncounter(id) ;
		} else {
			var updateStatus = function() {
				that.status = "EncounterSynchronized";
				that.APISuccess( "Encounter synchronized" );
			}
			if ( that.bSinglePatientSync ) {
				updateStatus();
			} else {
				$(window).one('emis.progressbarupdated', function() {
					updateStatus();
				});
				$(window).trigger('emis.syncprogress', [{status:'Upload patient data', all:that.totalPatientsInDataUpload, calcAll:that.totalPatientDataToUpload, calcLeft:that.totalPatientDataToUploadLeft, bDisplayEvenOne: true}]) ;
			}
		}
	}

	emis.mobile.Synchronizer.prototype.synchronizeLog = function( ) {
		this.Log = new emis.mobile.LogAPI( );
		this.Log.delegate = this;
		if ( this.LogArray.length != 0 ) {
			var id = this.LogArray.pop( );
			var LogString = JSON.stringify( new emis.mobile.LogModel( ).getInUploadFormat( id, this.interactionId ) );
			this.Log.postLog( LogString );
		} else {
			that.status = "LogSynchronized";
			that.APISuccess( "Log synchronized" );
		}
	}

	emis.mobile.Synchronizer.prototype.synchronizepatientlist = function( ) {
		this.patientListFetch = new emis.mobile.PatientListAPI( );
		this.patientListFetch.delegate = this;
		this.patientListFetch.getPatientList( main.dataProvider.getUserSessionId( ) );
	}

	emis.mobile.Synchronizer.prototype.synchronizepatientdata = function( ) {
		// patientListArray
		var appointment = null ;
		if (that.bSinglePatientSync) {
			var appointments = new emis.mobile.AppointmentsModel( ).getAppointmentsByPatientId(this.patientId) ;
			// choose only one appoinment that matches mobileslotId (control checks only)
			for (var i=0; i<appointments.length; i++) {
				if (appointments[i].SlotId == that.slotId) {
					appointment = appointments[i] ;
					break ;
				}
			}
		} else {
			$(window).trigger('emis.syncprogress', [{status: 'Download patient data', all:this.patientListArrayLength || 1, left:this.patientListArray.length, bDisplayEvenOne: true}]) ;

			var id = this.patientListArray.pop();
			appointment = new emis.mobile.AppointmentsModel().getAppointmentById(id);
		}

		var session = null ;
		if (appointment) {
			this.syncPatientId = appointment.PatientId;
			session = new emis.mobile.AppointmentsModel().getSessionById(appointment.SessionId);
		}

		if ( session && session.AvailableForMobile ) {
			this.patientRecordFetch = new emis.mobile.PatientAPI( );
			this.patientRecordFetch.delegate = this;

			this.patientRecordFetch.getPatientRecord( main.dataProvider.getUserSessionId( ), appointment.PatientId, appointment.SlotId );
		} else {
			if ( this.patientListArray.length == 0 ) {
				var updateStatus = function() {
					that.status = "patientdataSynchronized";
					that.APISuccess( "Patient data synchronized" );
				}
				if ( that.bSinglePatientSync ) {
					updateStatus();
				} else {
					$(window).one('emis.progressbarcompleted', function() {
						updateStatus();
					});
					$(window).trigger('emis.syncprogress', [{status: 'Download patient data', all:this.patientListArrayLength || 1, left:0, bDisplayEvenOne: true}]) ;
				}
			} else {
				this.APISuccess( "Patient data synchronized" );
			}
		}
	}

	emis.mobile.Synchronizer.prototype.synchronizeDrugs = function( ) {
		if ( ! that.bSinglePatientSync ) {
			$(window).trigger('emis.syncprogress', [{status: 'Medication reference', all:1, left:1}]) ;
		}
		this.GetDrugs = new emis.mobile.GetMedicationReferenceAPI();
		this.GetDrugs.delegate = this;
		this.GetDrugs.getMedicationReference(main.dataProvider.getUserSessionId());
	}

	emis.mobile.Synchronizer.prototype.synchronizeRoutineSyncData = function( ) {

		this.RoutineSyncData = new emis.mobile.RoutineSyncDataAPI();
		this.RoutineSyncData.delegate = this;
		this.RoutineSyncData.getRoutineSyncData( main.dataProvider.getUserSessionId());
	}

	emis.mobile.Synchronizer.prototype.synchronizeTemplates = function( ) {
		function getOldTemplate( id, version ) {
			for ( var i = 0; i < that.oldTemplates.length; i++ ) {
				var entry = that.oldTemplates[i];
				if (entry.id === id) {
					if (entry.object.version == version) {
						return entry.object;
					} else {
						break;
					}
				}
			}
			return null;
		}

		var bEmptyTemplateHeaders = false;
		if ( this.templatesHeadersArray.length == 0 ) {
			this.templatesHeadersArray = new emis.mobile.TemplateHeader( ).findAll( );
			if ( !this.templatesHeadersArray || this.templatesHeadersArray.length == 0 ) {
				bEmptyTemplateHeaders = true;
			}
			this.templatesHeadersArrayLength = this.templatesHeadersArray.length ;
		}

		var templHeaderEntry = this.templatesHeadersArray.pop();
		if (templHeaderEntry) {
			if ( ! that.bSinglePatientSync ) {
				// left:this.templatesHeadersArray.length + 1 // because we've just popped one of the element
				$(window).trigger('emis.syncprogress', [{status:'Template data', all:this.templatesHeadersArrayLength, left:this.templatesHeadersArray.length + 1, bDisplayEvenOne: true}]) ;
			}
			var id = templHeaderEntry.id;
			// check old templates cache
			var oldTemplate = getOldTemplate(id, templHeaderEntry.object.Version);
			if (oldTemplate) {
				emis.mobile.console.log("using cached template " + id);
				this.processTemplate( oldTemplate );
			} else {
				var templateFetch = new emis.mobile.TemplatesAPI();
				templateFetch.delegate = this;
				templateFetch.getTemplates(id, main.dataProvider.getUserSessionId());
			}
		} else {
			if (this.templatesHeadersArray.length == 0) {
				var updateStatus = function() {
					that.status = "TemplateSynchronized";
					if (bEmptyTemplateHeaders) {
						that.APISuccess( "Template synchronized" );
					}
				}
				if ( that.bSinglePatientSync ) {
					updateStatus();
				} else {
					$(window).one('emis.progressbarcompleted', function() {
						updateStatus();
					});
				}
			} else if (bEmptyTemplateHeaders) {
				this.APISuccess( "Template synchronized" );
			}
			if ( ! that.bSinglePatientSync ) {
				$(window).trigger('emis.syncprogress', [{status:'Template data', all:this.templatesHeadersArrayLength, left:0, bDisplayEvenOne: true}]) ;
			}
		}
	}

	emis.mobile.Synchronizer.prototype.wipeData = function( ) {

		if (!this.bSinglePatientSync) {
			// preserve old templates to maintain cache
			var templm = new emis.mobile.TemplateModel( );
			this.oldTemplates = templm.findAll( );
		}

		main.dataProvider.markNotSyncedConsentsAsSynced();

		var dw = new emis.mobile.DataWipe( ) ;

		this.failedData = main.dataProvider.manageErrorAppointmentsAndPatientData( this.failedData );

		// To clear the local storage, and preserving the login details
		if (this.bSinglePatientSync) {
			dw.clearDataBySlotId (main.dataProvider, this.slotId, this.failedData) ;

			// make all not uploaded things (if any) as not synchronized
			main.dataProvider.makeAllTasksNotSynchronised( this.patientId );
			main.dataProvider.makeAllCompletedEventsetsNotSynchronised( this.slotId );
			main.dataProvider.makeAllNewDrugsNotSynchronised( this.patientId );
			main.dataProvider.makeAllQuickNotesNotSynchronised( this.slotId );
			main.dataProvider.makeAllSchedulesNotSynchronised( this.patientId );
		} else {
			dw.clearSynchronisedData( main.dataProvider, this.failedData);

			// make all not uploaded things (if any) as not synchronized
			main.dataProvider.makeAllTasksNotSynchronised( );
			main.dataProvider.makeAllCompletedEventsetsNotSynchronised( );
			main.dataProvider.makeAllNewDrugsNotSynchronised( );
			main.dataProvider.makeAllQuickNotesNotSynchronised( );
			main.dataProvider.makeAllSchedulesNotSynchronised( );
		}

		main.storage.setItem( "SyncStatus", "2" );
		main.storage.setItem( "DataWipeReached", "1" );
		this.status = "dataWiped";

		this.APISuccess( "Data wiped" );

	}

	emis.mobile.Synchronizer.prototype.sessionSynchronized = function( SessionResponse ) {
		if ( SessionResponse && SessionResponse.Payload && SessionResponse.Payload.ServerVersion ) {
			main.controller.ServerVersion = SessionResponse.Payload.ServerVersion;
		}
		var continueProcess = true;

		function _checkEventCode( eventCode ) {
		//@formatter:off
			var badKey = eventCode == main.constants.OTK_SESSION_ENDED
			|| eventCode == main.constants.UNDEFINED_SESSION_ID
			|| eventCode == main.constants.MALFORMED_SESSION_ID
			|| eventCode == main.constants.SESSION_HAS_EXPIRED;

			//@formatter:on
			if ( badKey ) {
				continueProcess = true;
				// this.status = "sessionEnded";
				if ( SessionResponse.Payload.EventCode == main.constants.OTK_SESSION_ENDED ) {
					this.needToGetNewOTK = true;
					this.status = "sessionSynchronized";
				} else {
					this.needToGetNewSession = true;
					this.status = "start";
				}
			}
			return badKey;
		}

		switch ( this.status ) {
			case "start":
				if ( SessionResponse.Payload && SessionResponse.InteractionId ) {
					main.controller.SessionId = SessionResponse.Payload.SessionId;
					main.controller.onlineLogged = true;
					main.dataProvider.setSessionData(SessionResponse);
					this.status = "sessionSynchronized";

				} else {
					if ( _checkEventCode.call( this, SessionResponse.Payload.EventCode ) ) {

					} else {
						continueProcess = false;

						main.storage.removeItem( "SyncStatus" );

						// Failure delegate to be implemented in the classes, where
						// Synchronizer object is created
						emis.mobile.console.log( "EventCode:" + SessionResponse.Payload.EventCode );
						this.delegate.syncFailed.call( this.delegate, new emis.mobile.ErrorModel( LOGIN_ERROR_CODE, LOGIN_ERROR_DESCRIPTION ), this.status );
					}
				}
				break;
			case "sessionSynchronized":
				var rawSessionResponse = SessionResponse;
				if ( SessionResponse.Payload ) {
					rawSessionResponse = SessionResponse.Payload;
				}
				// InteractionId
				if ( !rawSessionResponse.InteractionId ) {
					if ( _checkEventCode.call( this, SessionResponse.Payload.EventCode ) ) {
					} else {
						continueProcess = false;

						main.storage.removeItem( "SyncStatus" );

						emis.mobile.console.log( "EventCode:" + SessionResponse.Payload.EventCode );
						if ( SessionResponse.Payload.EventCode == main.constants.SESSION_ENDED ) {
							this.needToGetNewSession = true;
							this.status = "start";
							this.synchronize( );
						} else {
							this.delegate.syncFailed.call( this.delegate, new emis.mobile.ErrorModel( KEY_VERIFICATIONFAIL_CODE, KEY_VERIFICATIONFAIL_DESCRIPTION ) );
						}
					}
				} else {
					this.interactionId = rawSessionResponse.InteractionId;
					// TODO store in user session data
					this.status = "KeySynchronized";

					this.needToGetNewOTK = false;
				}
				break;
			case "TemplateSynchronized":
				this.status = "sessionEnded";

				break;
			default:
				break;
		}
		if ( continueProcess ) {
			this.APISuccess( this.status );
		}
	}

	emis.mobile.Synchronizer.prototype.addedDrugsSynchronized = function( medicationResponse ) {
		if ( this.drugarray.length == 0 ) {
			var updateStatus = function() {
				that.status = "newDrugsSynchronized";
				that.APISuccess( "Added drugs synchronized" );
			}
			if ( that.bSinglePatientSync ) {
				updateStatus();
			} else {
				$(window).one('emis.progressbarupdated', function() {
					updateStatus();
				});
				$(window).trigger('emis.syncprogress', [{status:'Upload patient data', all:this.totalPatientsInDataUpload, calcAll:this.totalPatientDataToUpload, calcLeft:this.totalPatientDataToUploadLeft, bDisplayEvenOne: true}]) ;
			}
		} else {
			this.APISuccess( "Added drugs synchronized" );
		}
	}

	emis.mobile.Synchronizer.prototype.taskSynchronized = function( taskResponse ) {
		if ( this.taskarray.length == 0 ) {
			var updateStatus = function() {
				that.status = "taskSynchronized";
				that.APISuccess( "Task synchronized" );
			}
			if ( that.bSinglePatientSync ) {
				updateStatus();
			} else {
				if(!ENABLE_SCHEDULES) {
					$(window).one('emis.progressbarcompleted', function() {
						updateStatus();
					});
					$(window).trigger('emis.syncprogress', [{status:'Upload patient data', all:this.totalPatientsInDataUpload, left: 0, bDisplayEvenOne: true}]) ;
				} else {
					$(window).one('emis.progressbarupdated', function() {
						updateStatus();
					});
					$(window).trigger('emis.syncprogress', [{status:'Upload patient data', all:this.totalPatientsInDataUpload, calcAll:this.totalPatientDataToUpload, calcLeft:this.totalPatientDataToUploadLeft, bDisplayEvenOne: true}]) ;
				}
			}
		} else {
			this.APISuccess( "Task synchronized" );
		}
	}

	emis.mobile.Synchronizer.prototype.consentSynchronized = function( consentResponse ) {
		if ( this.consentsArray.length == 0 ) {
			that.status = "consentSynchronized";
			that.APISuccess( "Consent synchronized" );
		} else {
			this.APISuccess( "Consent synchronized" );
		}
	}

	emis.mobile.Synchronizer.prototype.createdScheduleSynchronized = function(scheduleResponse) {
		if ( this.createdSchedulesArray.length == 0 ) {
			var updateStatus = function() {
				that.status = "createdSchedulesSynchronized";
				that.APISuccess( "Created schedules synchronize" );
			}
			if ( that.bSinglePatientSync ) {
				updateStatus();
			} else {
				$(window).one('emis.progressbarupdated', function() {
					updateStatus();
				});
				$(window).trigger('emis.syncprogress', [{status:'Upload patient data', all:this.totalPatientsInDataUpload, calcAll:this.totalPatientDataToUpload, calcLeft:this.totalPatientDataToUploadLeft, bDisplayEvenOne: true}]) ;
			}
		} else {
			this.APISuccess( "Created schedules synchronized" );
		}
	}

	emis.mobile.Synchronizer.prototype.editedScheduleSynchronized = function(scheduleResponse) {
		if ( this.editedSchedulesArray.length == 0 ) {
			var updateStatus = function() {
				that.status = "editedSchedulesSynchronized";
				that.APISuccess( "Edited schedules synchronize" );
			}
			if ( that.bSinglePatientSync ) {
				updateStatus();
			} else {
				$(window).one('emis.progressbarupdated', function() {
					updateStatus();
				});
				$(window).trigger('emis.syncprogress', [{status:'Upload patient data', all:this.totalPatientsInDataUpload, calcAll:this.totalPatientDataToUpload, calcLeft:this.totalPatientDataToUploadLeft, bDisplayEvenOne: true}]) ;
			}
		} else {
			this.APISuccess( "Edited schedules synchronized" );
		}
	}

	emis.mobile.Synchronizer.prototype.cancelledScheduleSynchronized = function(scheduleResponse) {
		if ( this.cancelledSchedulesArray.length == 0 ) {
			var updateStatus = function() {
				that.status = "cancelledSchedulesSynchronized";
				that.APISuccess( "Cancelled schedules synchronize" );
			}
			if ( that.bSinglePatientSync ) {
				updateStatus();
			} else {
				$(window).one('emis.progressbarupdated', function() {
					updateStatus();
				});
				$(window).trigger('emis.syncprogress', [{status:'Upload patient data', all:this.totalPatientsInDataUpload, calcAll:this.totalPatientDataToUpload, calcLeft:this.totalPatientDataToUploadLeft, bDisplayEvenOne: true}]) ;
			}
		} else {
			this.APISuccess( "Cancelled schedules synchronized" );
		}
	}

	emis.mobile.Synchronizer.prototype.EncounterSynchronized = function( encounterResponse ) {
		if ( this.EncounterArray.length == 0 ) {
			var updateStatus = function() {
				that.status = "EncounterSynchronized";
				that.APISuccess( "Encounter synchronized" );
			}
			if ( that.bSinglePatientSync ) {
				updateStatus();
			} else {
				$(window).one('emis.progressbarupdated', function() {
					updateStatus();
				});
				$(window).trigger('emis.syncprogress', [{status:'Upload patient data', all:this.totalPatientsInDataUpload, calcAll:this.totalPatientDataToUpload, calcLeft:this.totalPatientDataToUploadLeft, bDisplayEvenOne: true}]) ;
			}
		} else {
			this.APISuccess( "Encounter synchronized" );
		}
	}

	emis.mobile.Synchronizer.prototype.LogSynchronized = function( logResponse ) {
		if ( this.LogArray.length == 0 ) {
			that.status = "LogSynchronized";
			that.APISuccess( "Log synchronized" );
		} else {
			this.APISuccess( "Log synchronized" );
		}
	}

	emis.mobile.Synchronizer.prototype.patientlistSynchronized = function( PatientList ) {
		var PatientListJson = PatientList;
		var model = new emis.mobile.AppointmentsModel( );
		var idIsNull = 1;
		var sessionOrderPreserved = new emis.mobile.Storage( ).findAll( "SessionOrder" );
		if ( sessionOrderPreserved == null ) {
			sessionOrderPreserved = new Array( );
		}
		if ( sessionOrderPreserved.length > 0 ) {
			sessionOrderPreserved = sessionOrderPreserved[0].object;
		}
		sessionOrder = new Array( );

		this.patientListArray = [];
		countStored = new emis.mobile.Storage( ).findAll( "Patient" ).length;

		main.controller.patientLimitExceeded = false;

		for ( var i in PatientListJson.Payload.Entries ) {
			if ( this.patientListArray.length + countStored >= PATIENT_LIMIT ) {
				main.controller.patientLimitExceeded = true;
				break;
			}
			var slotOrder = [];
			for ( var j in PatientListJson.Payload.Entries[i].Slots ) {
				if ( this.patientListArray.length + countStored >= PATIENT_LIMIT ) {
					main.controller.patientLimitExceeded = true;
					break;
				}
				var slot = PatientListJson.Payload.Entries[i].Slots[j];
				if ( slot.PatientId ) {
					model.save( slot, slot.SlotId );
					// Save the order of the slots in a session
					slotOrder.push( slot.SlotId );
					// thats the limit, ha!
					if ( PatientListJson.Payload.Entries[i].AvailableForMobile ) {
						this.patientListArray.push( slot.SlotId );
						emis.mobile.console.log( "pushing " + slot.SlotId + ", patientId is " + slot.PatientId );
					}

				} else {
					model.save( slot, slot.SlotId, idIsNull );
					slotOrder.push( "nullId" + slot.SlotId );
				}
			}
			// To avoid the storage duplication
			delete PatientListJson.Payload.Entries[i].Slots;
			PatientListJson.Payload.Entries[i].order = slotOrder;
			var sessionId = PatientListJson.Payload.Entries[i].SessionId;
			model.SaveSession( PatientListJson.Payload.Entries[i], sessionId );
			if ( sessionOrder == null || sessionOrder.length == 0 ) {
				sessionOrder.push( sessionId );
			} else {
				var proceed = true;
				for ( k in sessionOrder ) {
					if ( sessionOrder[k] == PatientListJson.Payload.Entries[i].SessionId ) {
						proceed = false;
						break;
					}
				}
				if ( proceed ) {
					sessionOrder.push( sessionId );
				}
			}
		}
		this.patientListArrayLength = this.patientListArray.length ;
		// merge both lists if needed and save it
		if ( sessionOrderPreserved.length > 0 ) {
			finalSessionOrder = new Array( );
			var i = 0;
			var j = 0;
			while ( i < sessionOrderPreserved.length && j < sessionOrder.length ) {
				// compare dates and push the correct item
				session1 = model.getSessionById( sessionOrderPreserved[i] );
				session2 = model.getSessionById( sessionOrder[j] );
				d1 = main.util.getDate( session1.StartDateTime );
				d2 = main.util.getDate( session2.StartDateTime );
				if ( d1 < d2 ) {
					finalSessionOrder.push( sessionOrderPreserved[i] );
					i++;
				} else if ( d1 > d2 ) {
					finalSessionOrder.push( sessionOrder[j] );
					j++;
				} else {
					finalSessionOrder.push( sessionOrder[j] );
					i++;
					j++;
				}
			}
			while ( i < sessionOrderPreserved.length ) {
				finalSessionOrder.push( sessionOrderPreserved[i] );
				i++;
			}
			while ( j < sessionOrder.length ) {
				finalSessionOrder.push( sessionOrder[j] );
				j++;
			}
			model.SaveSessionOrder( finalSessionOrder );
		} else {
			model.SaveSessionOrder( sessionOrder );
		}

		main.dataProvider.removeNeedlessConsents( this.patientListArray );

		that.status = "patientlistSynchronized";
		that.APISuccess( "Patient list synchronized" );
	}

	emis.mobile.Synchronizer.prototype.patientdataSynchronized = function( PatientData ) {
		// Integer id from the appointment list response
		var id = this.syncPatientId;
		var wsVersion = main.dataProvider.getSessionData().Payload.ServerVersion;
		if(wsVersion) {
			main.storage.save("PatientDataServiceVersion",id,wsVersion);
		} else {
			main.storage.save("PatientDataServiceVersion",id,"old");
		}
		// upload was successful for single patient - clear old patient data
		if(main.controller.uploadFailed == false && that.bSinglePatientSync) {
			new emis.mobile.PatientDemographic( ).remove(id);
			new emis.mobile.PatientSummary( ).remove(id);
			new emis.mobile.PatientMedication( ).remove(id);
			new emis.mobile.PatientEncounters( ).remove(id);
			new emis.mobile.PatientValues( ).remove(id);
			new emis.mobile.PatientImmunisation( ).remove(id);
			new emis.mobile.PatientReferrals( ).remove(id);
			new emis.mobile.PatientProblems( ).remove(id);
			new emis.mobile.PatientDiaryEntry( ).remove(id);
			new emis.mobile.PatientAllergies( ).remove(id);
			new emis.mobile.PatientAppointmentInformation( ).remove(id);
			new emis.mobile.PatientAlerts( ).remove(id);
			new emis.mobile.PatientCarePathways( ).remove(id);
			new emis.mobile.PatientCareEpisodesModified( ).removeAllByPatientId(id);
			new emis.mobile.PatientDocumentation( ).remove(id);
			new emis.mobile.PatientSharingOrgs( ).remove(id);
			new emis.mobile.PatientWarnings( ).remove(id);
			main.dataProvider.removeAllSchedulesByPatientId(id);
		}
		if ( PatientData ) {
			new emis.mobile.PatientDemographic( ).save( id, ( PatientData.demographic ) );
			new emis.mobile.PatientSummary( ).save( id, ( PatientData.summary ) );
			new emis.mobile.PatientMedication( ).save( id, ( PatientData.medication ) );
			new emis.mobile.PatientEncounters( ).save( id, ( PatientData.encounters ) );
//			var values = [];
//			if(!ENABLE_SHARED_DATA) {
//				for(var i in PatientData.values) {
//					if(!PatientData.values[i].organisationId) {
//						var patientValue = PatientData.values[i];
//						if(patientValue.history) {
//							var his = [];
//							for(var j in patientValue.history) {
//								if(!patientValue.history[j].organisationId) {
//									his.push(patientValue.history[j]);
//								}
//							}
//							patientValue.history = his;
//						}
//						values.push(patientValue);
//					}
//				}
//			} else {
//				values = PatientData.values;
//			}
			new emis.mobile.PatientValues( ).save( id, ( PatientData.values ) );
			new emis.mobile.PatientImmunisation( ).save( id, ( PatientData.immunisations ) );
			new emis.mobile.PatientReferrals( ).save( id, ( PatientData.referrals ) );
			new emis.mobile.PatientProblems( ).save( id, ( PatientData.problems ) );
			new emis.mobile.PatientDiaryEntry( ).save( id, ( PatientData.diaryEntries ) );
			new emis.mobile.PatientAllergies( ).save( id, ( PatientData.allergies ) );
			new emis.mobile.PatientAppointmentInformation( ).save( id, ( PatientData.appointmentInformation ) );
			new emis.mobile.PatientAlerts( ).save( id, ( PatientData.alerts ) );
			new emis.mobile.PatientCarePathways( ).save( id, ( PatientData.carePathways ) );
			new emis.mobile.PatientDocumentation( ).save( id, ( PatientData.documents ) );
			new emis.mobile.PatientSharingOrgs( ).save(id, (PatientData.sharingOrgs))
			if ( main.dataProvider.getPatientWarnings( id ).length == 0 ) {
				new emis.mobile.PatientWarnings( ).save( id, ( PatientData.warnings ) );
			}
			main.dataProvider.insertDownloadedSchedules( id, PatientData.schedules );
		}
		if ( this.patientListArray.length == 0 ) {
			var updateStatus = function() {
				that.status = "patientdataSynchronized";
				that.APISuccess( "Patient data synchronized" );
			}
			if ( that.bSinglePatientSync ) {
				updateStatus();
			} else {
				$(window).one('emis.progressbarcompleted', function() {
					updateStatus();
				});
				$(window).trigger('emis.syncprogress', [{status: 'Download patient data', all:this.patientListArrayLength || 1, left:0, bDisplayEvenOne: true}]);
			}
		} else {
			this.APISuccess();
		}
	}

	emis.mobile.Synchronizer.prototype.drugsSynchronized = function( MedicationResponse ) {
		var MedicationData = MedicationResponse;
		if ( MedicationData.Payload ) {
			MedicationData = MedicationResponse.Payload;
		}

		new emis.mobile.DrugModel( ).save( "0", MedicationData );

		var updateStatus = function() {
			that.status = "DrugListSynchronized";
			that.APISuccess( "Drug list synchronized" );
		}
		if ( that.bSinglePatientSync ) {
			updateStatus();
		} else {
			$(window).one('emis.progressbarcompleted', function() {
				updateStatus();
			});
			$(window).trigger('emis.syncprogress', [{status: 'Medication reference', all:1, left:0}]);
		}
	}

	emis.mobile.Synchronizer.prototype.RoutineSyncDataSynchronized = function( RoutineSyncDataResponse ) {
		var RoutineSyncData = RoutineSyncDataResponse;
		if ( RoutineSyncData.Payload ) {
			// striping payload
			RoutineSyncData = RoutineSyncDataResponse.Payload;
		}

		if ( RoutineSyncData ) {
			for ( var i in RoutineSyncData.ConsulationTypes ) {
				new emis.mobile.ConsultationType( ).save( RoutineSyncData.ConsulationTypes[i].CodeId, RoutineSyncData.ConsulationTypes[i] );
			}
			for ( var i in RoutineSyncData.RttStatuses ) {
				new emis.mobile.RttStatus( ).save( RoutineSyncData.RttStatuses[i].CodeId, RoutineSyncData.RttStatuses[i] );
			}
			for ( var i in RoutineSyncData.TaskTypes ) {
				new emis.mobile.TaskType( ).save( RoutineSyncData.TaskTypes[i].Id, RoutineSyncData.TaskTypes[i] );
			}
			for ( var i in RoutineSyncData.TemplateHeaders ) {
				new emis.mobile.TemplateHeader( ).save( RoutineSyncData.TemplateHeaders[i].Id, RoutineSyncData.TemplateHeaders[i] );
			}
			for ( var i in RoutineSyncData.OrganisationPeople ) {
				new emis.mobile.OrganisationPeople( ).save( RoutineSyncData.OrganisationPeople[i].Id, RoutineSyncData.OrganisationPeople[i] );
			}
			for ( var i in RoutineSyncData.Locations ) {
				new emis.mobile.Locations( ).save( RoutineSyncData.Locations[i].Id, RoutineSyncData.Locations[i] );
			}
			for ( var i in RoutineSyncData.SlotTypes ) {
				new emis.mobile.SlotTypes( ).save( RoutineSyncData.SlotTypes[i].Id, RoutineSyncData.SlotTypes[i] );
			}
			for ( var i in RoutineSyncData.SessionCategories ) {
				new emis.mobile.SessionCategories( ).save( RoutineSyncData.SessionCategories[i].Id, RoutineSyncData.SessionCategories[i] );
			}
			for ( var i in RoutineSyncData.SessionHolders ) {
				new emis.mobile.SessionHolders( ).save( RoutineSyncData.SessionHolders[i].Id, RoutineSyncData.SessionHolders[i] );
			}
			for ( var i in RoutineSyncData.SessionHolderFilters ) {
				new emis.mobile.SessionHolderFilters( ).save( RoutineSyncData.SessionHolderFilters[i].Id, RoutineSyncData.SessionHolderFilters[i] );
			}
			for ( var i in RoutineSyncData.AppointmentBookingReasons ) {
				new emis.mobile.AppointmentBookingReasons( ).save( i, RoutineSyncData.AppointmentBookingReasons[i] );
			}
			for ( var i in RoutineSyncData.ScheduleTemplates ) {
				new emis.mobile.ScheduleTemplateModel( ).save( RoutineSyncData.ScheduleTemplates[i].Id, RoutineSyncData.ScheduleTemplates[i] );
			}
			for ( var i in RoutineSyncData.Services ) {
				new emis.mobile.ServicesModel( ).save( RoutineSyncData.Services[i].Id, RoutineSyncData.Services[i] );
			}
		}

		that.status = "RoutineSyncDataSynchronized";
		that.APISuccess( "Routine data synchronized" );
	}

	emis.mobile.Synchronizer.prototype.templateSynchronized = function( templateResponse ) {

		var template = templateResponse;
		if ( templateResponse ) {
			if ( templateResponse.Payload ) {
				// striping payload
				template = templateResponse.Payload;
			}
			this.processTemplate( template );
		}
	}

	emis.mobile.Synchronizer.prototype.processTemplate = function( template ) {
		if ( template ) {
			new emis.mobile.TemplateModel( ).save( template.id, template );
			if ( this.templatesHeadersArray.length == 0 ) {
				var updateStatus = function() {
					that.status = "TemplateSynchronized";
					that.APISuccess( "Template synchronized" );
				}
				if ( that.bSinglePatientSync ) {
					updateStatus();
				} else {
					$(window).one('emis.progressbarcompleted', function() {
						updateStatus();
					});
					$(window).trigger('emis.syncprogress', [{status:'Template data', all:this.templatesHeadersArrayLength, left:this.templatesHeadersArray.length, bDisplayEvenOne: true}]) ;
				}
			} else {
				this.APISuccess( "Template synchronized" );
			}
		}
	}
	// To be invoked after each successful API call
	emis.mobile.Synchronizer.prototype.APISuccess = function(text) {
		this.synchronize( ) ;
	}

	emis.mobile.Synchronizer.prototype.APIFailed = function( Error, failedData ) {
		new emis.mobile.IncidentLogger( ).SyncIncidentLog( Error.description );
		// To log any Synchronization failure

		if (failedData) {
			var slotId = failedData.slotId;
			var patientId = failedData.patientId;
			var appointments = [];
			if ( ( slotId && ! patientId ) || patientId ) {
				if ( ! patientId ) {
					var appointment = main.dataProvider.getAppointmentById( slotId );
					if ( appointment && appointment.PatientId && appointment.PatientId != 'null' ) {
						patientId = appointment.PatientId;
					} else {
						patientId = "nullId" + slotId;
					}
				}
				var objectData = { };
				objectData.eventCode = failedData.eventCode;
				objectData.description = Error.description;

				if ( main.storage.getItem("DataWipeReached") == "0" ) {
					// if broken at upload
					main.controller.uploadFailed = true;
					this.failedData.push ( { 'data': { ENTITY_APPOINTMENT_ERROR : [ patientId ] } } ) ;
					main.dataProvider.saveAppointmentAsError( patientId, objectData );
				} else {
					main.controller.downloadFailed = true;
					if ( ! main.dataProvider.getErrorAppointmentByPatientId( patientId ) ) {
						var patient = main.dataProvider.getPatientById(patientId) ;
						if (patient) {
							failedData.patientName = patient.name ;
						} else if (slotId) {
							var app = main.dataProvider.getAppointmentById(slotId) ;
							if (app) {
								failedData.patientName = app.PatientName ;
							}
						}
						main.dataProvider.removeAppointmentById( slotId );
					}
				}
			}

			this.failedData.push (failedData) ;
			$(window).trigger('emis.syncitemfailed', failedData) ;
		} else {
			// Failure delegate to be implemented in the classes, where Synchronizer
			// object is created
			this.delegate.syncFailed.call( this.delegate, Error, this.status );
		}
	}
	// class wrapper
} )( );
