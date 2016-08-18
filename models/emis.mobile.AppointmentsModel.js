/**
 * PatientList data model Functionalities provided: save patient list, get all patient ids from memory
 */

var ENTITY_APPOINTMENT = "Appointment";
var ENTITY_APPOINTMENT_ERROR = "AppointmentError";
var ENTITY_SESSION = "Session";
var ENTITY_SESSION_ORDER = "SessionOrder";

emis.mobile.AppointmentsModel = function( ) {
	this.storage = new emis.mobile.Storage( );
	return this;
}
// added null number parameter - we need to save somehow patients with null - thats the id - jakub
emis.mobile.AppointmentsModel.prototype.save = function( jsonData, slotId, idIsNull ) {
	if ( idIsNull != null ) {
		this.storage.save( ENTITY_APPOINTMENT, "nullId" + slotId, JSON.stringify( jsonData ) );
	} else {
		this.storage.save( ENTITY_APPOINTMENT, slotId, JSON.stringify( jsonData ) );
	}
}

emis.mobile.AppointmentsModel.prototype.SaveSession = function( jsonData, sessionId ) {
	this.storage.save( ENTITY_SESSION, sessionId, JSON.stringify( jsonData ) );
}
// To save the order of the sessions
emis.mobile.AppointmentsModel.prototype.SaveSessionOrder = function( jsonData ) {
	this.storage.save( ENTITY_SESSION_ORDER, "ID", JSON.stringify( jsonData ) );
}
// To retrieve the order of the sessions
emis.mobile.AppointmentsModel.prototype.getSessionOrder = function( ) {
	var data = this.storage.find( ENTITY_SESSION_ORDER, "ID" );
	return JSON.parse( data );
}

emis.mobile.AppointmentsModel.prototype.getAppointmentById = function( slotId ) {
	var data = this.storage.find( ENTITY_APPOINTMENT, slotId );
	return JSON.parse( data );
}

emis.mobile.AppointmentsModel.prototype.removeById = function( slotId ) {
	this.storage.remove( ENTITY_APPOINTMENT, slotId );
}


emis.mobile.AppointmentsModel.prototype.getSessionById = function( sessionId ) {
	var data = this.storage.find( ENTITY_SESSION, sessionId );
	return JSON.parse( data );
}

emis.mobile.AppointmentsModel.prototype.getAllSlotIDs = function( ) {
	var slotIds = this.storage.findAllIds( ENTITY_APPOINTMENT );
	return slotIds;
}

emis.mobile.AppointmentsModel.prototype.getAllNotNullPatientIDs = function( ) {
	var patientIDs = this.storage.findAllIds( ENTITY_APPOINTMENT );
	var Ids = new Array( );
	for ( i in patientIDs ) {
		id = '' + patientIDs[i];
		if ( id.length <= 6 ) {
			Ids.push( id );
		} else {
			if ( id.substr( 0, 6 ) != "nullId" ) {
				Ids.push( id );
			}
		}
	}
	return Ids;
}

emis.mobile.AppointmentsModel.prototype.getAllSessionIDs = function( ) {
	var sessionIds = this.getSessionOrder( );
	return sessionIds;
}
/*
 * @param sessionId @return appointment list for given session.
 */

emis.mobile.AppointmentsModel.prototype.getAllAppointmentsBySession = function( sessionId ) {

	var session = this.getSessionById( sessionId );

	var appointments = new Array( );
	var appointmentDetails = {};
	try {
		// Code changed to retain the order of the slots in a session.
		var data = session.order;

		for ( var i in data ) {

			var patient;
			appointmentDetails = this.getAppointmentById( data[i] );
			if ( appointmentDetails ) {
				var patientId = appointmentDetails.PatientId;
				patientIdString = '' + patientId;
				// null id condition
				if ( patientIdString.length > 6 )
					if ( patientIdString.substr( 0, 6 ) == "nullId" ) {

					} else {
						patient = new emis.mobile.PatientDemographic( ).getById( patientId );
					}
				if ( patient != null ) {

					appointmentDetails.address = patient.address;
				}
				appointments.push( appointmentDetails );
			}
		}

		return appointments;
	} catch ( e ) {
		emis.mobile.console.log( e );
		return null;
	}
}

emis.mobile.AppointmentsModel.prototype.getAppointmentsByPatientId = function( patientId ) {
	var data = this.storage.findAll( ENTITY_APPOINTMENT );
	var appointments = new Array( );
	for ( var i in data ) {
		if ( data[i].object.PatientId == patientId ) {
			appointments.push( data[i].object );
		}
	}
	appointments.sort( function( a, b ) {
		return a.StartDateTime.localeCompare( b.StartDateTime );
	} );
	return appointments;
}

emis.mobile.AppointmentsModel.prototype.getAppointmentsIdsByPatientId = function( patientId ) {
	var data = this.storage.findAll( ENTITY_APPOINTMENT );
	var appointments = new Array( );
	for ( var i in data ) {
		if ( data[i].object.PatientId == patientId ) {
			appointments.push( data[i].id );
		}
	}
	return appointments;
}

emis.mobile.AppointmentsModel.prototype.saveAsError = function( id, jsonData ) {
	this.storage.save( ENTITY_APPOINTMENT_ERROR, id, JSON.stringify( jsonData ) );
};

emis.mobile.AppointmentsModel.prototype.getAllErrorAppointmentsIds = function( ) {
	var slotIds = this.storage.findAllIds( ENTITY_APPOINTMENT_ERROR );
	return slotIds;
};

emis.mobile.AppointmentsModel.prototype.removeErrorAppointmentById = function( id ) {
	this.storage.remove( ENTITY_APPOINTMENT_ERROR, id );
};

emis.mobile.AppointmentsModel.prototype.getErrorAppointmentById = function( id ) {
	var data = this.storage.find( ENTITY_APPOINTMENT_ERROR, id );
	return JSON.parse( data );
};

