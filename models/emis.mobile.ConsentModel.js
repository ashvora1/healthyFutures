/**
 * Model Class to interface the log data with the local memory Functionalities provided: Save the logs Retrieve the logs
 * from the memory
 */

ENTITY_CONSENT = "Consent";
ENTITY_NS_CONSENT = "NotSyncedConsent";

emis.mobile.ConsentModel = function( ) {
	this.storage = new emis.mobile.Storage( );
}

emis.mobile.ConsentModel.prototype.insertSynced = function( patientId, jsonData ) {
	var consentId = patientId + "#" + new emis.mobile.Utilities( ).generateId( );
	this.storage.save( ENTITY_CONSENT, consentId, JSON.stringify( jsonData ) );
}

emis.mobile.ConsentModel.prototype.insertNotSynced = function( patientId, jsonData ) {
	var consentId = patientId + "#" + new emis.mobile.Utilities( ).generateId( );
	this.storage.save( ENTITY_NS_CONSENT, consentId, JSON.stringify( jsonData ) );
}

emis.mobile.ConsentModel.prototype.getPatientIdByConsentId = function( consentId ) {
	return parseInt( consentId.split('#')[0], 10 );
}

emis.mobile.ConsentModel.prototype.removeSynced = function( id ) {
	this.storage.remove( ENTITY_CONSENT, id );
}

emis.mobile.ConsentModel.prototype.removeNotSynced = function( id ) {
	this.storage.remove( ENTITY_NS_CONSENT, id );
}

emis.mobile.ConsentModel.prototype.getSyncedConsentById = function( id ) {
	var data = this.storage.find( ENTITY_CONSENT, id );
	return JSON.parse( data );
}

emis.mobile.ConsentModel.prototype.getNotSyncedConsentById = function( id ) {
	var data = this.storage.find( ENTITY_NS_CONSENT, id );
	return JSON.parse( data );
}

emis.mobile.ConsentModel.prototype.findAllSynced = function( ) {
	var data = this.storage.findAll( ENTITY_CONSENT );
	return data;
}

emis.mobile.ConsentModel.prototype.findAllNotSynced = function( ) {
	var data = this.storage.findAll( ENTITY_NS_CONSENT );
	return data;
}

emis.mobile.ConsentModel.prototype.findAllSyncedIds = function( ) {
	var data = this.storage.findAllIds( ENTITY_CONSENT );
	return data;
}

emis.mobile.ConsentModel.prototype.findAllNotSyncedIds = function( ) {
	var data = this.storage.findAllIds( ENTITY_NS_CONSENT );
	return data;
}

emis.mobile.ConsentModel.prototype.findAllSyncedIdsByPatientId = function(patientId) {
	var ids = this.findAllSyncedIds() ;
	var patientIds = [] ;
	for (var i=0; i<ids.length; i++){
		var s = ids[i].split('#') ;
		if (s.length > 1) {
			if (s[0] == patientId) {
				patientIds.push(ids[i]) ;
			}
		}
	}
	return patientIds ;
}

emis.mobile.ConsentModel.prototype.findAllNotSyncedIdsByPatientId = function(patientId) {
	var ids = this.findAllNotSyncedIds() ;
	var patientIds = [] ;
	for (var i=0; i<ids.length; i++){
		var s = ids[i].split('#') ;
		if (s.length > 1) {
			if (s[0] == patientId) {
				patientIds.push(ids[i]) ;
			}
		}
	}
	return patientIds ;
}

emis.mobile.ConsentModel.prototype.getInUploadFormat = function( DataId ) {
	try {
		var consentJson = {};
		consentJson.sessionId = main.dataProvider.getUserSessionId( );
		consentJson.payload = this.getNotSyncedConsentById( DataId );
		return consentJson;
	} catch ( e ) {
		emis.mobile.console.log( e );
		return null;
	}
}
