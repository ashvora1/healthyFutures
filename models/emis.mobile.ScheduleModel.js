var ENTITY_SCHEDULE = "Schedule";

emis.mobile.ScheduleModel = function( ) {
	this.storage = new emis.mobile.Storage( );
	this.DOWNLOADED = "downloaded";
	this.CREATED = "created";
	this.EDITED = "edited";
	this.CANCELLED = "cancelled";
}

/*
 * "schedule" : {
 * 	  "status" : "downloaded" / "created" / "edited" / "cancelled", // to sync back we should check if schedule was created or edited or cancelled
 *    "bFailedSync" : true / false, //if it failed to sync
 *    "cancel" : { ... }, //object where data for cancel schedule web service is stored
 *    "data" : { ... } //schedule object is holded here
 * }
 *
 *  NOTE: It is possible that we'll need to store "created" and "edited" schedules.
 *  	  We need to check what schedules will be returned in patient record after
 * 		  newly created (or edited) schedules will be synced back to emis.
 *        We need also think about scenario when downloaded schedules in that case
 *        will not be updated and because of that we will need to override downloaded
 *        schedules with the one that were previously edited (scheduleId must be the same)
 */

emis.mobile.ScheduleModel.prototype.save = function( scheduleId, jsonData ) {
	this.storage.save( ENTITY_SCHEDULE, scheduleId, JSON.stringify( jsonData ) );
}

emis.mobile.ScheduleModel.prototype.insert = function( patientId, scheduleStatus, jsonData ) {
	var scheduleId = patientId + "#" + new emis.mobile.Utilities( ).generateId( );
	var scheduleObj = {};
	scheduleObj.id = scheduleId;
	scheduleObj.status = scheduleStatus;
	scheduleObj.bFailedSync = false;
	scheduleObj.data = jsonData;
	this.storage.save( ENTITY_SCHEDULE, scheduleId, JSON.stringify( scheduleObj ) );
}

emis.mobile.ScheduleModel.prototype.setNotSynchronised = function( scheduleId ) {
	var scheduleObj = JSON.parse( this.storage.find( ENTITY_SCHEDULE, scheduleId ) );
	if ( scheduleObj ) {
		scheduleObj.bFailedSync = true;
		this.storage.save( ENTITY_SCHEDULE, scheduleId, JSON.stringify( scheduleObj ) );
	}
}

emis.mobile.ScheduleModel.prototype.isNotSynchronised = function( scheduleId ) {
	var scheduleObj = JSON.parse( this.storage.find( ENTITY_SCHEDULE, scheduleId ) );
	if ( scheduleObj ) {
		return scheduleObj.bFailedSync;
	}
	return false;
}

emis.mobile.ScheduleModel.prototype.getById = function( id ) {
	return JSON.parse( this.storage.find( ENTITY_SCHEDULE, id ) );
}


emis.mobile.ScheduleModel.prototype.remove = function( scheduleId ) {
	this.storage.remove( ENTITY_SCHEDULE, scheduleId );
}

emis.mobile.ScheduleModel.prototype.findAll = function( ) {
	var data = this.storage.findAll( ENTITY_SCHEDULE );
	return data;
}

emis.mobile.ScheduleModel.prototype.findAllIds = function( ) {
	var data = this.storage.findAllIds( ENTITY_SCHEDULE );
	return data;
}

emis.mobile.ScheduleModel.prototype.findAllByPatientId = function(patientId) {
	var schedules = this.findAll();
	var patientSchedules = [];
	for ( var i = 0; i < schedules.length; i++ ) {
		var s = schedules[i].id.split( '#' ) ;
		if ( s.length > 1 ) {
			if ( s[0] == patientId ) {
				patientSchedules.push( schedules[i].object ) ;
			}
		}
	}
	return patientSchedules ;
} ;

emis.mobile.ScheduleModel.prototype.findAllIdsByPatientId = function(patientId) {
	var ids = this.findAllIds() ;
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
} ;

emis.mobile.ScheduleModel.prototype.findAllPatientIds = function( ) {
	var patientIds = new Array( );
	try {
		var allSchedules = this.findAll( );
		for ( var i = 0; i < allSchedules.length; i++ ) {
			var patientId = allSchedules[i].id;
			if ( patientId ) {
				patientId = patientId.split('#');
				if ( patientId.length > 1 ) {
					patientId = patientId[0];
					if ( patientIds.indexOf( patientId ) == -1 ) {
						patientIds.push( patientId );
					}
				}
			}
		}
		return patientIds;
	} catch ( e ) {
		emis.mobile.console.log( e );
		return null;
	}
}

emis.mobile.ScheduleModel.prototype.findAllIdsByStatus = function( status ) {
	var data = this.storage.findAll( ENTITY_SCHEDULE );
	var data2 = [];
	for(var i in data) {
		if(data[i].object.status == status)
			data2.push(data[i].id);
	}
	return data2;
}

emis.mobile.ScheduleModel.prototype.findAllIdsByStatusAndPatientId = function( status, patientId ) {
	var data = this.storage.findAll( ENTITY_SCHEDULE );
	var data2 = [];
	for(var i in data) {
		if(data[i].object.status == status && data[i].id.split('#')[0] == patientId)
			data2.push(data[i].id);
	}
	return data2;
}

emis.mobile.ScheduleModel.prototype.getInUploadFormat = function( scheduleId ) {
	try {
		var schedule = this.getById(scheduleId);
		var scheduleObj = {};
		if ( schedule ) {
			if ( schedule.status == this.CANCELLED ) {
				scheduleObj.cancelSchedule = schedule.cancel;
			} else {
				scheduleObj.patientSchedule = schedule.data;
			}
		}
		return scheduleObj;
	} catch ( e ) {
		emis.mobile.console.log( e );
		return null;
	}

}
