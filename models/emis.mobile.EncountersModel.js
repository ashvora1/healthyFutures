/**
 * EncounterData model Functionalities provided: setEffectiveTime setDuration setConsultors setConsultationType
 * setCareEpisode addEvents findAllEventIds getEventById removeEvent setComplete findAllEncounterIds getInUploadFormat
 */

ENTITY_ENCOUNTER = "Encounter";
var ENTITY_EVENT = "Event";
var ENCOUNTERSTATUS = "NC";

emis.mobile.EncountersModel = function( ) {
	this.storage = new emis.mobile.Storage( );
	this.utils = new emis.mobile.Utilities( );
}
emis.mobile.EncountersModel.prototype.init = function( patientId ) {
	var tempId = patientId;
	// var tempId = patientId+"#"+main.controller.slotId;
	if ( (   this.storage.find( ENTITY_ENCOUNTER, tempId ) ) == null )
		this.storage.save( ENTITY_ENCOUNTER, tempId, JSON.stringify( {
			id: this.utils.generateGUID( ),
			effectiveTime: null,
			duration: null,
			consultors: [{
				"id": null,
				"name": null
			}],
			consultationType: {
				"code": null,
				"term": null
			}
		} ) );
	return JSON.parse( this.storage.find( ENTITY_ENCOUNTER, tempId ) );
}

emis.mobile.EncountersModel.prototype.save = function( patientId, encounterJson ) {
	this.storage.save( ENTITY_ENCOUNTER, patientId, JSON.stringify( encounterJson ) );
}
// TODO unused?

emis.mobile.EncountersModel.prototype.setEffectiveTime = function( patientId, effectiveTime ) {
	var encounterJson = this.init( patientId );
	encounterJson.effectiveTime = effectiveTime;
	this.save( patientId, encounterJson );
}

emis.mobile.EncountersModel.prototype.setDuration = function( patientId, duration ) {
	var encounterJson = this.init( patientId );
	encounterJson.duration = duration;
	this.save( patientId, encounterJson );
}

emis.mobile.EncountersModel.prototype.setConsultors = function( patientId, consultors ) {
	var encounterJson = this.init( patientId );
	encounterJson.consultors = consultors;
	this.save( patientId, encounterJson );
}
emis.mobile.EncountersModel.prototype.setConsultationType = function( patientId, consultationType ) {

	var encounterJson = this.init( patientId );
	encounterJson.consultationType = consultationType;
	this.save( patientId, encounterJson );
}
emis.mobile.EncountersModel.prototype.setCareEpisode = function( patientId, careEpisode ) {
	var encounterJson = this.init( patientId );
	encounterJson.careEpisode = careEpisode;
	this.save( patientId, encounterJson );
}

emis.mobile.EncountersModel.prototype.insertEvent = function( patientId, eventJson, templateVersion ) {
	try {
		eventJson.patientId = patientId;
		eventJson.templateVersion = templateVersion;
		var eventId = patientId + "#" + templateVersion + "#" + new emis.mobile.Utilities( ).generateId( );
		this.storage.save( ENTITY_EVENT, eventId, JSON.stringify( eventJson ) );
		return eventId;
	} catch ( e ) {
		emis.mobile.console.log( e );
		return null;
	}

}

emis.mobile.EncountersModel.prototype.saveEvent = function( id, eventJson, templateVersion ) {
	try {
		eventJson.patientId = id;
		eventJson.templateVersion = templateVersion;
		this.storage.save( ENTITY_EVENT, id, JSON.stringify( eventJson ) );
	} catch ( e ) {
		emis.mobile.console.log( e );
	}

}

emis.mobile.EncountersModel.prototype.findAllEventIds = function( ) {
	var data = this.storage.findAllIds( ENTITY_EVENT );
	return data;
}

emis.mobile.EncountersModel.prototype.getEventCount = function( ) {
	var eventIdArray = this.findAllEventIds( );
	var count = eventIdArray.length;
	return count;
}
emis.mobile.EncountersModel.prototype.removeEvent = function( eventId ) {
	this.storage.remove( ENTITY_EVENT, eventId );
}

emis.mobile.EncountersModel.prototype.removeEncounter = function( id ) {
	this.storage.remove( ENTITY_ENCOUNTER, id );
}

emis.mobile.EncountersModel.prototype.getEventById = function( eventId ) {
	var data = this.storage.find( ENTITY_EVENT, eventId );
	return JSON.parse( data );
}

emis.mobile.EncountersModel.prototype.findAllEventIdsByPatient = function( patientId ) {
	var eventIdsForPatient = new Array( );
	try {
		var eventIdList = this.findAllEventIds( );
		for ( var i = 0; i < eventIdList.length; i++ ) {
			var event = this.getEventById( eventIdList[i] );
			if ( event.patientId == patientId ) {
				eventIdsForPatient.push( eventIdList[i] );
			}
		}
		return eventIdsForPatient;
	} catch ( e ) {
		emis.mobile.console.error( e );
		return null;
	}
}
/*
 * Functionalities provided: Check if all encounter properties are set, Get events for given patient from local storage
 * and add to encounterJson, Remove added events from local storage, Remove incomplete encounter from local storage,
 * Save completed encounter with the generated id.
 *
 * @returns encounterId if success and -1 if failure
 */
emis.mobile.EncountersModel.prototype.setComplete = function( patientId ) {
	try {

		var encounterJson = this.init( patientId );
		var eventIdArray = this.findAllEventIdsByPatient( patientId );
		//@formatter:off
		if ( ( encounterJson.effectiveTime == null )
		|| ( encounterJson.duration == null )
		|| ( encounterJson.consultors == null )
		|| ( encounterJson.consultationType == null )
		|| ( eventIdArray.length == 0 ) ) {
			emis.mobile.console.log( "insufficient data" );
			return -1;
	//@formatter:on
		} else {
			var eventArray = new Array( );
			// stores events in upload format
			// for a given encounter(of a given patient)
			for ( var i = 0; i < eventIdArray.length; i++ ) {
				var event = this.getEventById( eventIdArray[i] );
				delete event.patientId;
				delete event.templateVersion;
				eventArray.push( event );
				this.removeEvent( eventIdArray[i] );
			}

			encounterJson.events = eventArray;

			var encounterId = patientId + "#" + new emis.mobile.Utilities( ).generateId( );
			var tempId = patientId + "#" + ENCOUNTERSTATUS;
			this.storage.remove( ENTITY_ENCOUNTER, tempId );
			// Remove encounter
			// save encounter with new id
			this.storage.save( ENTITY_ENCOUNTER, encounterId, JSON.stringify( encounterJson ) );


			return encounterId;
		}
	} catch ( e ) {
		emis.mobile.console.error( e );
	}
}
/*
 * @returns {}
 */
emis.mobile.EncountersModel.prototype.findAllEncounterIds = function( ) {
	return this.storage.findAllIds( ENTITY_ENCOUNTER );
}

emis.mobile.EncountersModel.prototype.findAllEncounterIdsByPatient = function(id) {
	var all = this.findAllEncounterIds() ;
	var encIds = [] ;
	for (var i=0; i<all.length; i++) {
		var s = all[i].split('#') ;
		if (s.length > 1) {
			if (s[0] == id) {
				encIds.push(all[i]) ;
			}
		}
	}
	return encIds ;
} ;

emis.mobile.EncountersModel.prototype.findAllEncounterIdsBySlotId = function(slotId) {
	var all = this.findAllEncounterIds() ;
	var encIds = [] ;
	for (var i=0; i<all.length; i++) {
		var s = all[i].split('#') ;
		if (s.length > 1) {
			if (s[1] == slotId) {
				encIds.push(all[i]) ;
			}
		}
	}
	return encIds ;
} ;

emis.mobile.EncountersModel.prototype.findAllPatientIdsWithRttChange = function() {
	var all = this.findAllEncounterIds() ;
	var finalIds = [];
	for (var i=0; i<all.length; i++) {
		var encounter = JSON.parse(main.storage.find(ENTITY_ENCOUNTER,all[i]));
		if(encounter.careEpisode && encounter.careEpisode.rttStatus)
			finalIds.push(all[i]);
	}
	return finalIds;
}

/*
 * Create careRecord in upload format Functionalities provided: set patient details and encounter from localstorage, set
 * organisation and author details from session
 *
 * @param encounterId @returns careRecordJson
 */
emis.mobile.EncountersModel.prototype.getInUploadFormat = function( encounterId ) {
	try {
		// separate patientId from encounterId
		var x = encounterId.split( "#" );
		var patientId = x[0];
		var patientName = (  new emis.mobile.PatientDemographic( ).getById( patientId ) ).name;

		var careRecordJson = {};
		careRecordJson.sessionId = main.dataProvider.getUserSessionId( );
		careRecordJson.payload = {};
		careRecordJson.payload.patient = {};
		careRecordJson.payload.patient.id = (  new emis.mobile.PatientDemographic( ).getById( patientId ) ).id;
		careRecordJson.payload.patient.name = patientName;

		careRecordJson.payload.encounter = JSON.parse( this.storage.find( ENTITY_ENCOUNTER, encounterId ) );
		if ( careRecordJson.payload.encounter && careRecordJson.payload.encounter.currentlySelectedSubject ) {
			// used for storing currently selected subject
			// it's needed when switching between "None" and some care episode
			// it's saved per patientId
			delete careRecordJson.payload.encounter.currentlySelectedSubject;
		}
		if ( careRecordJson.payload.encounter && careRecordJson.payload.encounter.currentlySelectedCareEpisodeId ) {
			// used if different care episode was selected but user
			// didn't change anything in this care episode
			// and because of that we do not have encounter.careEpisode inside it
			delete careRecordJson.payload.encounter.currentlySelectedCareEpisodeId;
		}
		if ( careRecordJson.payload.encounter &&
				careRecordJson.payload.encounter.careEpisode &&
				careRecordJson.payload.encounter.careEpisode.rttStatus ) {
			// we don't need to send rttStatus.term as in EMIS Mobile it is connected to rttStatus.code
			// we are saving it for modified care episodes purpose
			delete careRecordJson.payload.encounter.careEpisode.rttStatus.term;

			// similar with rttStatus.rttClockState
			delete careRecordJson.payload.encounter.careEpisode.rttStatus.rttClockState;
		}

		// fetching events from eventsets from localStorage
		careRecordJson.payload.encounter.events = emis.mobile.form.TemplateParser.prepareOutputEvents( careRecordJson.payload.encounter.effectiveTime, encounterId );

		return careRecordJson;
	} catch ( e ) {
		emis.mobile.console.error( e );
		return null;
	}

}
