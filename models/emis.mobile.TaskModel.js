/**
 * Task data model Functionalities provided: save task data
 */
var ENTITY_TASK = "Task";
// not synchronised Task
var ENTITY_NS_TASK = "NotSyncedTask";

var increseAssignedToCounter = function( storage, recipientId ) {
	// increse counter of choices
	console.warn( 'SAVING: ' + recipientId );

	var counter = storage.find( "PeopleCounter", recipientId );
	console.log( counter );
	if ( counter ) {
		counter = JSON.parse( counter ).count;
	} else {
		counter = 0;
	}
	++counter;
	console.log( counter );

	storage.save( "PeopleCounter", recipientId, JSON.stringify( {
		count: counter
	} ) );
}

emis.mobile.TaskModel = function( ) {
	this.storage = new emis.mobile.Storage( );
}

emis.mobile.TaskModel.prototype.insert = function( patientId, jsonData ) {
	var taskId = patientId + "#" + new emis.mobile.Utilities( ).generateId( );
	this.storage.save( ENTITY_TASK, taskId, JSON.stringify( jsonData ) );

	increseAssignedToCounter( this.storage, jsonData.task.recipient.id );

	return taskId;
}

emis.mobile.TaskModel.prototype.save = function( taskId, jsonData ) {
	this.storage.save( ENTITY_TASK, taskId, JSON.stringify( jsonData ) );

	increseAssignedToCounter( this.storage, jsonData.task.recipient.id );
}

emis.mobile.TaskModel.prototype.setNotSynchronised = function( taskLocalId ) {
	this.storage.save( ENTITY_NS_TASK, taskLocalId, "1" );
}

emis.mobile.TaskModel.prototype.isNotSynchronised = function( taskLocalId ) {
	return this.storage.find( ENTITY_NS_TASK, taskLocalId );
}

emis.mobile.TaskModel.prototype.getById = function( id ) {
	var data = this.storage.find( ENTITY_TASK, id );
	return JSON.parse( data );

}
/**
 * @returns {id:taskId, object:json}
 */
emis.mobile.TaskModel.prototype.findAll = function( ) {
	var data = this.storage.findAll( ENTITY_TASK );
	return data;
}
/**
 * @returns {}
 */
emis.mobile.TaskModel.prototype.findAllIds = function( ) {
	var data = this.storage.findAllIds( ENTITY_TASK );
	return data;
}

emis.mobile.TaskModel.prototype.findAllIdsByPatientId = function(patientId) {
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

emis.mobile.TaskModel.prototype.findAllPatientIds = function( ) {
	// var speedTest = new Date();
	var patientIds = new Array( );
	try {
		var allTasks = this.findAll( );
		for ( var i = 0; i < allTasks.length; i++ ) {
			var patientId = allTasks[i].id;
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
		// emis.mobile.console.log("findAllPatientIds * time to check " + ( (new Date()).getTime() - speedTest.getTime()
		// ) );
		return patientIds;
	} catch ( e ) {
		emis.mobile.console.log( e );
		return null;
	}
}

emis.mobile.TaskModel.prototype.getTaskCount = function( ) {
	var taskIdArray = this.findAllIds( );
	var count = taskIdArray.length;
	return count;
}
emis.mobile.TaskModel.prototype.remove = function( taskId ) {
	this.storage.remove( ENTITY_TASK, taskId );
}

emis.mobile.TaskModel.prototype.getInUploadFormat = function( taskId ) {
	try {
		var x = taskId.split( "#" );
		var patientId = x[0];
		var patientName = new emis.mobile.PatientDemographic( ).getById( patientId ).name;
		var taskJson = {};
		taskJson.sessionId = main.dataProvider.getUserSessionId( );

		taskJson.payload = this.getById( taskId );
		taskJson.payload.patient.name = patientName;

		taskJson.payload.author = {
			id: main.controller.user.id,
			name: main.controller.user.name
		};

		return taskJson;
	} catch ( e ) {
		emis.mobile.console.log( e );
		return null;
	}

}
