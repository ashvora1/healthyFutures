/**
 * Eventset model Functionalities provided: save eventset get eventset find all ids
 */
var ENTITY_EVENTSET = "Eventset";
var ENTITY_NS_EVENTSET = "NotSyncedEventset";
// not synchronised EventSet

emis.mobile.EventsetModel = function( ) {
	this.storage = new emis.mobile.Storage( );
}

emis.mobile.EventsetModel.prototype.insert = function( patientId, jsonData ) {
	var eventsetId = patientId + "-" + new emis.mobile.Utilities( ).generateId( );
	this.storage.save( ENTITY_EVENTSET, eventsetId, JSON.stringify( jsonData ) );

	return eventsetId;
}

emis.mobile.EventsetModel.prototype.setNotSynchronised = function( eventsetLocalId ) {
	this.storage.save( ENTITY_NS_EVENTSET, eventsetLocalId, "1" );
}

emis.mobile.EventsetModel.prototype.isNotSynchronised = function( eventsetLocalId ) {
	return this.storage.find( ENTITY_NS_EVENTSET, eventsetLocalId );
}

emis.mobile.EventsetModel.prototype.findAllIdsNotSynchronised = function( ) {
	return this.storage.findAllIds( ENTITY_NS_EVENTSET );
}

emis.mobile.EventsetModel.prototype.save = function( id, jsonData ) {
	this.storage.save( ENTITY_EVENTSET, id, JSON.stringify( jsonData ) );
}
emis.mobile.EventsetModel.prototype.getById = function( id ) {
	var data = this.storage.find( ENTITY_EVENTSET, id );
	return JSON.parse( data );
}
/**
 * @returns {id:eventsetId, object:json}
 */
emis.mobile.EventsetModel.prototype.findAll = function( ) {
	var data = this.storage.findAll( ENTITY_EVENTSET );
	return data;
}
/**
 * @returns {}
 */
emis.mobile.EventsetModel.prototype.findAllIds = function( ) {
	var data = this.storage.findAllIds( ENTITY_EVENTSET );
	return data;
}

emis.mobile.EventsetModel.prototype.removeEvent = function( eventsetId ) {
	this.storage.remove( ENTITY_EVENTSET, eventsetId );
}

// patientid is in form of patientId#Slotid
emis.mobile.EventsetModel.prototype.findEventsetsByPatient = function( patientId ) {
	var eventsetsForPatient = new Array( );
	try {
		var allEventsets = this.findAll( );
		for ( var i = 0; i < allEventsets.length; i++ ) {
			if ( allEventsets[i].object.patientId == patientId ) {
				eventsetsForPatient.push( allEventsets[i] );
			}
		}
		return eventsetsForPatient;
	} catch ( e ) {
		emis.mobile.console.error( e );
		return null;
	}
}

emis.mobile.EventsetModel.prototype.findEventsetsByPatientId = function( patientId ) {
	var eventsetsForPatient = new Array( );
	try {
		var allEventsets = this.findAll( );
		for ( var i = 0; i < allEventsets.length; i++ ) {
			var s = allEventsets[i].object.patientId.split('#') ;
			if (s[0] == patientId ) {
				eventsetsForPatient.push( allEventsets[i] );
			}
		}
		return eventsetsForPatient;
	} catch ( e ) {
		emis.mobile.console.error( e );
		return null;
	}
} ;

emis.mobile.EventsetModel.prototype.findAllPatientIds = function( onlyCompleted ) {
	// var speedTest = new Date();
	var patientIds = new Array( );
	try {
		var allEventsets = this.findAll( );
		if ( onlyCompleted == true ) {
			for ( var i = 0; i < allEventsets.length; i++ ) {
				if ( allEventsets[i].object.isCompleted && ( patientIds.indexOf( allEventsets[i].object.patientId ) == -1 ) )
					patientIds.push( allEventsets[i].object.patientId );
			}
		} else {
			for ( var i = 0; i < allEventsets.length; i++ ) {
				if ( patientIds.indexOf( allEventsets[i].object.patientId ) == -1 )
					patientIds.push( allEventsets[i].object.patientId );
			}
		}
		return patientIds;
	} catch ( e ) {
		emis.mobile.console.error( e );
		return null;
	}
}