/**
 * Model Class to interface the log data with the local memory Functionalities provided: Save the logs Retrieve the logs
 * from the memory
 */

ENTITY_LOG = "Log";

emis.mobile.LogModel = function( ) {
	this.storage = new emis.mobile.Storage( );
}

emis.mobile.LogModel.prototype.save = function( LogJson ) {
	var LogId = main.controller.user.id + "#" + new emis.mobile.Utilities( ).generateId( );
	this.storage.save( ENTITY_LOG, LogId, JSON.stringify( LogJson ) );
}

emis.mobile.LogModel.prototype.getById = function( id ) {
	var data = this.storage.find( ENTITY_LOG, id );
	return JSON.parse( data );
}

emis.mobile.LogModel.prototype.findAllIds = function( ) {
	var data = this.storage.findAllIds( ENTITY_LOG );
	return data;
}

emis.mobile.LogModel.prototype.findAllCurrentUserIds = function( ) {
	var userId = main.controller.user.id;
	var ids = this.findAllIds() ;
	var logIds = [] ;
	for (var i=0; i<ids.length; i++){
		var s = ids[i].split('#') ;
		if (s.length > 1) {
			if (s[0] == userId) {
				logIds.push(ids[i]) ;
			}
		}
	}
	return logIds ;
}

emis.mobile.LogModel.prototype.findOtherUsersIds = function( ) {
	var userId = main.controller.user.id;
	var ids = this.findAllIds() ;
	var logIds = [] ;
	for (var i=0; i<ids.length; i++){
		var s = ids[i].split('#') ;
		if (s.length > 1) {
			if (s[0] != userId) {
				logIds.push(ids[i]) ;
			}
		}
	}
	return logIds ;
}

emis.mobile.LogModel.prototype.getInUploadFormat = function( LogId, interactionId ) {
	try {
		var uploadLog = {};
		var LogJson = this.getById( LogId );

		LogJson.UserId = main.controller.user.id;
		LogJson.SessionId = main.dataProvider.getUserSessionId( );
		LogJson.InteractionId = interactionId;
		LogJson.Cdb = main.controller.user.cdb;
		uploadLog.SessionId = main.dataProvider.getUserSessionId( );
		uploadLog.Payload = LogJson;
		return uploadLog;
	} catch ( e ) {
		emis.mobile.console.log( e );
		return null;
	}
}