/**
 * Local data wiping in case of security breach/device stolen Functionalities provided: clear localstorage, preserve
 * user credentials
 */
emis.mobile.DataWipe = function( ) {
	this.userSession = new emis.mobile.UserSessionModel( );
}

emis.mobile.DataWipe.prototype.clearSynchronisedData = function( dataProviderObject, idsToSave ) {
	// TO DO: correct method names!!
	var storage = new emis.mobile.Storage( );

	var savedData = this.saveByIds(idsToSave) ;
	var consentsData = this.saveByEntity( ENTITY_CONSENT ) ;

	var dataProvider = dataProviderObject;

	var otherUsersLogsIds = dataProvider.getOtherUserLogsIds();
	var otherUsersLogsData = null;
	if ( otherUsersLogsIds ) {
		var data = {};
		data[ ENTITY_LOG ] = otherUsersLogsIds;
		otherUsersLogsIds = [{'data':data}];
		otherUsersLogsData = this.saveByIds(otherUsersLogsIds);
	}

	var userName = this.userSession.getUserName( );
	var offlinePass = this.userSession.getOfflinePassword( );
	var cdb = this.userSession.getCDB( );
	var sid = this.userSession.getSessionId( );
	var lastSyncDate = this.userSession.getLastSyncDate( );
	var lastLoginDate = storage.find( "LastLoginDate", "0" );

	var checkItemKey = storage.getItem( "checkItem" );

	var base_href = storage.getItem( "base_href" );
	var lastUserId = storage.getItem( "lastUserId" );
	var lastGetSessionResponse = storage.getItem( "GetSession_Response" );
	var LastOnlineVersion = storage.getItem( "LastOnlineVersion" );
	var eventsetsNotCompleted = dataProvider.getAllIncompletedEventsets();


	var sessionOrderObj = storage.findAll( "SessionOrder" );
	var counters = storage.findAll( "TemplateCounter" );

	var dataToStore = null ;
	var incompletedEventsPatientIds = new Array( );
	if ( eventsetsNotCompleted.length > 0 ) {
		for ( k in eventsetsNotCompleted ) {
			// check if exists
			var patientId = eventsetsNotCompleted[k].patientId;
			var push = true;
			for ( l in incompletedEventsPatientIds ) {
				if ( incompletedEventsPatientIds[l] == patientId ) {
					push = false;
					break;
				}
			}
			if ( push )
				incompletedEventsPatientIds.push( patientId );
		}
		dataToStore = this.getPatientsWithIncompletedTemplatesData( incompletedEventsPatientIds );
		// save ss and persinent ids
		this.clearAll( );
		this.setPatientsWithIncompletedTemplatesData( dataToStore );
		var sessionOrderNew = new Array( );
		for ( i in sessionOrderObj[0].object ) {
			id = sessionOrderObj[0].object[i];
			if ( storage.find( "Session", id ) != null )
				sessionOrderNew.push( id );
		}
		storage.save( "SessionOrder", "ID", JSON.stringify( sessionOrderNew ) );
	} else {
		this.clearAll( );
	}
	for ( var i = 0; i < counters.length; i++ ) {
		storage.save( "TemplateCounter", counters[i].id, JSON.stringify( counters[i].object ) );
	}

	this.userSession.saveUserName( userName );
	this.userSession.saveOfflinePassword( offlinePass );
	this.userSession.saveCDB( cdb );
	this.userSession.saveSessionId( sid );
	this.userSession.saveLastSyncDate( lastSyncDate );
	if ( checkItemKey ) {
		// this is only for natieFrame: emis.mobile.nativeFrame.isNative
		storage.setItem( "checkItem", checkItemKey, true );
	}
	if ( base_href ) {
		storage.setItem( "base_href", base_href );
	}
	if ( lastUserId ) {
		storage.setItem( "lastUserId", lastUserId );
	}
	if ( LastOnlineVersion ) {
		storage.setItem( "LastOnlineVersion", LastOnlineVersion );
	}
	if ( lastGetSessionResponse ){
		main.dataProvider.setSessionData( lastGetSessionResponse );
	}
	storage.save( "LastLoginDate", "0", lastLoginDate );

	for ( var i = 0; i < eventsetsNotCompleted.length; i++ ) {
		var eventsetObj = new Object( );
		eventsetObj.object = eventsetsNotCompleted[i];
		dataProvider.addEventsetWithPatientId( eventsetObj, eventsetsNotCompleted[i].patientId );
	}

	this.loadByIds(savedData) ;
	this.loadByIds(consentsData);

	if ( otherUsersLogsData ) {
		this.loadByIds(otherUsersLogsData);
	}

	emis.mobile.console.log( "datawipe complete" );
} ;



emis.mobile.DataWipe.prototype.clearDataBySlotId = function (dataProvider, slotId, idsToSave) {

	var slot = main.dataProvider.getAppointmentById(slotId) ;
	if (slot) {
		patientId = slot.PatientId ;
		if ( ! patientId || patientId == 'null' ) {
			patientId = "nullId" + slotId;
		}

		var savedData = this.saveByIds(idsToSave) ;

		main.dataProvider.removeErrorAppointmentById( patientId );

		// gather all ids to be wiped: drugs, encounters, tasks
		var ids = dataProvider.getDataNeedSyncBySlotId(slotId) ;

		var dm = new emis.mobile.NewDrugModel() ;
		for (var i = 0; i < ids.drugs.length; i++) {
			dm.remove(ids.drugs[i])
		};
		var em = new emis.mobile.EncountersModel() ;
		for (var i = 0; i < ids.encounters.length; i++) {
			em.removeEncounter(ids.encounters[i]) ;
		};
		var esm = new emis.mobile.EventsetModel() ;
		for (var i = 0; i < ids.eventsets.length; i++) {
			esm.removeEvent(ids.eventsets[i].localId) ;
		};
		var tm = new emis.mobile.TaskModel( ) ;
		for (var i = 0; i < ids.tasks.length; i++) {
			tm.remove(ids.tasks[i]) ;
		};
		var cm = new emis.mobile.ConsentModel( ) ;
		for (var i = 0; i < ids.consents.length; i++) {
			cm.removeNotSynced(ids.consents[i]) ;
		};
		for (var i = 0; i < ids.quicknotes.length; i++) {
			dataProvider.removeQuickNote(ids.quicknotes[i]) ;
		};
		var sm = new emis.mobile.ScheduleModel();
		for (var i = 0; i < ids.schedules.length; i++) {
			sm.remove(ids.schedules[i]) ;
		};

		this.loadByIds(savedData) ;
	}
} ;

// save temporary data to memory array to be laoded after cleanup
emis.mobile.DataWipe.prototype.saveByIds = function (idsToSave) {
	var savedData = {} ;
	var storage = new emis.mobile.Storage( );
	var that = this ;
	if (idsToSave) {
		$.each(idsToSave, function (key, value) {
			if (value.data) {
				$.each(value.data, function (entityid, ids){
					for (var i = 0; i < ids.length; i++) {
						savedData[entityid+'_'+ids[i]] = storage.findWithoutEncryption(entityid, ids[i]) ;
					};
				})
			}
		}) ;
	}
	return savedData ;
} ;

emis.mobile.DataWipe.prototype.loadByIds = function(savedData) {
	var storage = new emis.mobile.Storage( );
	if (savedData) {
		$.each(savedData, function (key, value) {
			if ( value != null && value != undefined ) {
				storage.setItem(key, value, true) ;
			}
		});
	}
} ;

emis.mobile.DataWipe.prototype.saveByEntity = function (entity) {
	var storage = new emis.mobile.Storage( );
	var ids = storage.findAllIds(entity) ;
	var data = {} ;
	data[entity] = ids ;
	ids = [{'data':data}] ;
	return this.saveByIds(ids)
} ;

emis.mobile.DataWipe.prototype.clearAll = function( ) {
	var storage = new emis.mobile.Storage( );
	var wrongLoginOnlineCount = storage.findWithoutEncryption( "WrongOnlineLoginsInRow", "0" );
	var wrongLoginOfflineCount = storage.findWithoutEncryption( "WrongOfflineLoginsInRow", "0" );
	var lastLoginTimestamp;
	if ( !emis.mobile.nativeFrame.isNative )
		lastLoginTimestamp = localStorage.getItem("lastLoginTimestamp_0");
	storage.clearStorage( );
	if ( !main.controller.useLocalStorageForDocs && ! emis.mobile.nativeFrame.isNative ) {
		new emis.mobile.IDBStorage( ).clearStorage( );
	}
	if ( wrongLoginOnlineCount )
		storage.saveWithoutEncryption( "WrongOnlineLoginsInRow", "0", wrongLoginOnlineCount );
	if ( wrongLoginOfflineCount )
		storage.saveWithoutEncryption( "WrongOfflineLoginsInRow", "0", wrongLoginOfflineCount );
	if ( lastLoginTimestamp)
		localStorage.setItem("lastLoginTimestamp_0",lastLoginTimestamp);
}

emis.mobile.DataWipe.prototype.wipeData = function( ) {
	var storage = new emis.mobile.Storage( );
	storage.setEncryptionKey( null );
	// clear encryption key first
	storage.clearStorage( );

	if ( !main.controller.useLocalStorageForDocs && ! emis.mobile.nativeFrame.isNative ) {
		var idbstorage = new emis.mobile.IDBStorage( );
		idbstorage.setEncryptionKey( null );
		idbstorage.clearStorage( );
	}
	var synchronizer = new emis.mobile.Synchronizer( );
	synchronizer.setPassword( null );
}

emis.mobile.DataWipe.prototype.wipeDataByIds = function (ids) {
	var storage = new emis.mobile.Storage( );

	for (var i = 0; i < ids.length; i++) {
		storage.removeItem(ids[i]) ;
	};
} ;

emis.mobile.DataWipe.prototype.getPatientsWithIncompletedTemplatesData = function( patientsToStoreIds ) {
	data = new Array( );
	var storage = new emis.mobile.Storage( );
	// find the appointments ids for given patients and add to data to store
	var appointments = storage.findAll( "Appointment" );
	var sessionIds = new Array( );
	for ( k in appointments ) {
		var Obj_up = appointments[k].object;
		id = Obj_up.PatientId;
		if ( id ) {
			for ( l in patientsToStoreIds ) {
				if ( id == patientsToStoreIds[l] ) {
					var obj = new Object;
					obj.string = JSON.stringify( Obj_up );
					obj.entityType = "Appointment";
					obj.id = Obj_up.SlotId;
					data.push( obj );
					sessionId = Obj_up.SessionId;
					var push = true;
					for ( i in sessionIds ) {
						if ( sessionIds[i] == sessionId ) {
							push = false;
							break;
						}
					}
					if ( push )
						sessionIds.push( sessionId );
				}
			}
		}
	}
	// add sessions
	for ( k in sessionIds ) {
		session = storage.find( "Session", sessionIds[k] );
		if ( session != null ) {
			var obj = new Object( );
			obj.string = session;
			obj.entityType = "Session";
			obj.id = sessionIds[k];
			data.push( obj );
		}
	}

	// find and add other enitites
	entitiesToSave = new Array( );
	entitiesToSave.push( "PatientAllergies" );
	entitiesToSave.push( "PatientDiaryEntry" );
	entitiesToSave.push( "PatientImmunisation" );
	entitiesToSave.push( "PatientMedication" );
	entitiesToSave.push( "PatientProblems" );
	entitiesToSave.push( "PatientReferrals" );
	entitiesToSave.push( "PatientSummary" );
	entitiesToSave.push( "PatientValues" );
	entitiesToSave.push( "PatientCarePathways" );
	entitiesToSave.push( "PatientCareEpisodesModified" );
	entitiesToSave.push( "PatientRTT" );
	entitiesToSave.push( "Patient" );
	for ( k in patientsToStoreIds ) {
		id = patientsToStoreIds[k];
		for ( l in entitiesToSave ) {
			item = storage.find( entitiesToSave[l], id );
			if ( item != null ) {
				var obj = new Object( );
				obj.string = item;
				obj.entityType = entitiesToSave[l];
				obj.id = id;
				data.push( obj );
			}
		}
	}
	return data;
}

emis.mobile.DataWipe.prototype.setPatientsWithIncompletedTemplatesData = function( data ) {
	var storage = new emis.mobile.Storage( );
	for ( k in data ) {
		storage.save( data[k].entityType, data[k].id, data[k].string );
	}
}
