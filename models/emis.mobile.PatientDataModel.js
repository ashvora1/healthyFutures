/**
 * common functions for patient data
 */

/**
 * Demographic data model Functionalities provided: provide patient demographic data by patient id, name, address save
 * patient data
 *
 */

var ENTITY_PATIENT = "Patient";

emis.mobile.PatientDemographic = function( ) {
	this.storage = new emis.mobile.Storage( );
};

emis.mobile.PatientDemographic.prototype.save = function( id, jsonData ) {
	this.storage.save( ENTITY_PATIENT, id, JSON.stringify( jsonData ) );
};
emis.mobile.PatientDemographic.prototype.remove = function( id ) {
	this.storage.remove( ENTITY_PATIENT, id );
};
emis.mobile.PatientDemographic.prototype.getById = function( id ) {
	var data = this.storage.find( ENTITY_PATIENT, id );
	return JSON.parse( data );
};
emis.mobile.PatientDemographic.prototype.searchByName = function( search_for ) {
	var searchResult = this.storage.search( ENTITY_PATIENT, "name", search_for );
	return searchResult;
};
emis.mobile.PatientDemographic.prototype.searchByAddress = function( search_for ) {
	var searchResult = this.storage.search( ENTITY_PATIENT, "address", search_for );
	return searchResult;
};

/**
 * Summary data model Functionalities provided: provide patient summary save patient summary
 */
var ENTITY_SUMMARY = "PatientSummary";

emis.mobile.PatientSummary = function( ) {
	this.storage = new emis.mobile.Storage( );
};

emis.mobile.PatientSummary.prototype.save = function( id, jsonData ) {
	this.storage.save( ENTITY_SUMMARY, id, JSON.stringify( jsonData ) );
};
emis.mobile.PatientSummary.prototype.remove = function( id ) {
	this.storage.remove( ENTITY_SUMMARY, id );
};

emis.mobile.PatientSummary.prototype.getById = function( id ) {
	var data = this.storage.find( ENTITY_SUMMARY, id );
	return JSON.parse( data );
};

/**
 * Medication data model Functionalities provided: provide patient medication details save medication details
 */

var ENTITY_MEDICATION = "PatientMedication";
emis.mobile.PatientMedication = function( ) {
	this.storage = new emis.mobile.Storage( );
};

emis.mobile.PatientMedication.prototype.save = function( id, jsonData ) {
	this.storage.save( ENTITY_MEDICATION, id, JSON.stringify( jsonData ) );
};
emis.mobile.PatientMedication.prototype.remove = function( id ) {
	this.storage.remove( ENTITY_MEDICATION, id );
};
emis.mobile.PatientMedication.prototype.getById = function( id ) {
	var data = this.storage.find( ENTITY_MEDICATION, id );
	return JSON.parse( data );
};

/**
 * problems data model Functionalities provided: provide patient problems save medication details
 */

var ENTITY_PROBLEMS = "PatientProblems";

emis.mobile.PatientProblems = function( ) {
	this.storage = new emis.mobile.Storage( );
};

emis.mobile.PatientProblems.prototype.save = function( id, jsonData ) {
	this.storage.save( ENTITY_PROBLEMS, id, JSON.stringify( jsonData ) );
};
emis.mobile.PatientProblems.prototype.remove = function( id ) {
	this.storage.remove( ENTITY_PROBLEMS, id );
};
emis.mobile.PatientProblems.prototype.getById = function( id ) {
	var data = this.storage.find( ENTITY_PROBLEMS, id );
	return JSON.parse( data );
};

/**
 * Clinical data model Functionalities provided: provide clinical values save clinical values
 */
var ENTITY_VALUES = "PatientValues";

emis.mobile.PatientValues = function( ) {
	this.storage = new emis.mobile.Storage( );
};

emis.mobile.PatientValues.prototype.save = function( id, jsonData ) {
	this.storage.save( ENTITY_VALUES, id, JSON.stringify( jsonData ) );
};
emis.mobile.PatientValues.prototype.remove = function( id ) {
	this.storage.remove( ENTITY_VALUES, id );
};
emis.mobile.PatientValues.prototype.getById = function( id ) {
	var data = this.storage.find( ENTITY_VALUES, id );
	return JSON.parse( data );
};

/**
 * Patient encounter data model Functionalities provided: provide patient encounters save patient encounters
 */
var ENTITY_ENCOUNTERS = "PatientEncounters";

emis.mobile.PatientEncounters = function( ) {
	this.storage = new emis.mobile.Storage( );
};

emis.mobile.PatientEncounters.prototype.save = function( id, jsonData ) {
	this.storage.save( ENTITY_ENCOUNTERS, id, JSON.stringify( jsonData ) );
};
emis.mobile.PatientEncounters.prototype.remove = function( id ) {
	this.storage.remove( ENTITY_ENCOUNTERS, id );
};
emis.mobile.PatientEncounters.prototype.getById = function( id ) {
	var data = this.storage.find( ENTITY_ENCOUNTERS, id );
	return JSON.parse( data );
};

/**
 * Immunisation data model Functionalities provided: provide immunisation details save immunisation details
 */
var ENTITY_IMMUNISATION = "PatientImmunisation";

emis.mobile.PatientImmunisation = function( ) {
	this.storage = new emis.mobile.Storage( );
};

emis.mobile.PatientImmunisation.prototype.save = function( id, jsonData ) {
	if ( jsonData && jsonData.length ) {
		for ( var i = 0; i < jsonData.length; i++ ) {
			jsonData[i].customId = new emis.mobile.Utilities( ).generateId( );
		}
	}
	this.storage.save( ENTITY_IMMUNISATION, id, JSON.stringify( jsonData ) );
};
emis.mobile.PatientImmunisation.prototype.remove = function( id ) {
	this.storage.remove( ENTITY_IMMUNISATION, id );
};
emis.mobile.PatientImmunisation.prototype.getById = function( id ) {
	var data = this.storage.find( ENTITY_IMMUNISATION, id );
	return JSON.parse( data );
};

/**
 * Patient refferal data model Functionalities provided: provide patient refferals save refferals
 */
var ENTITY_REFFERALS = "PatientReferrals";
emis.mobile.PatientReferrals = function( ) {
	this.storage = new emis.mobile.Storage( );
};

emis.mobile.PatientReferrals.prototype.save = function( id, jsonData ) {
	this.storage.save( ENTITY_REFFERALS, id, JSON.stringify( jsonData ) );
};
emis.mobile.PatientReferrals.prototype.remove = function( id ) {
	this.storage.remove( ENTITY_REFFERALS, id );
};
emis.mobile.PatientReferrals.prototype.getById = function( id ) {
	var data = this.storage.find( ENTITY_REFFERALS, id );
	return JSON.parse( data );
};

/**
 * Diary entry data model Functionalities provided: provide diary entries save diray entries
 */
var ENTITY_DIARYENTRIES = "PatientDiaryEntry";
emis.mobile.PatientDiaryEntry = function( ) {
	this.storage = new emis.mobile.Storage( );
};

emis.mobile.PatientDiaryEntry.prototype.save = function( id, jsonData ) {
	this.storage.save( ENTITY_DIARYENTRIES, id, JSON.stringify( jsonData ) );
};
emis.mobile.PatientDiaryEntry.prototype.remove = function( id ) {
	this.storage.remove( ENTITY_DIARYENTRIES, id );
};
emis.mobile.PatientDiaryEntry.prototype.getById = function( id ) {
	var data = this.storage.find( ENTITY_DIARYENTRIES, id );
	return JSON.parse( data );
};

/**
 * Patient allery data model Functionalities provided: provide patient allergy details save allergy details
 */


var ENTITY_SHARINGORGS = "PatientSharingOrgs"
emis.mobile.PatientSharingOrgs = function ( ) {
	this.storage = new emis.mobile.Storage();
};
emis.mobile.PatientSharingOrgs.prototype.save = function( id, jsonData ){
	this.storage.save( ENTITY_SHARINGORGS, id, JSON.stringify( jsonData ) );
}
emis.mobile.PatientSharingOrgs.prototype.remove = function( id ) {
	this.storage.remove( ENTITY_SHARINGORGS, id );
};
emis.mobile.PatientSharingOrgs.prototype.getById = function( id ) {
	var data = this.storage.find( ENTITY_SHARINGORGS, id );
	return JSON.parse( data );
};

var ENTITY_ALLERGIES = "PatientAllergies";
emis.mobile.PatientAllergies = function( ) {
	this.storage = new emis.mobile.Storage( );
};
emis.mobile.PatientAllergies.prototype.save = function( id, jsonData ) {
	this.storage.save( ENTITY_ALLERGIES, id, JSON.stringify( jsonData ) );
};
emis.mobile.PatientAllergies.prototype.remove = function( id ) {
	this.storage.remove( ENTITY_ALLERGIES, id );
};
emis.mobile.PatientAllergies.prototype.getById = function( id ) {
	var data = this.storage.find( ENTITY_ALLERGIES, id );

	return JSON.parse( data );
};

/**
 * AppointmentInformation data model Functionalities provided: provide appointment information details save appointment
 * information
 */
var ENTITY_APPOINTMENTINFORMATION = "PatientAppointmentInformation";
emis.mobile.PatientAppointmentInformation = function( ) {
	this.storage = new emis.mobile.Storage( );
};
emis.mobile.PatientAppointmentInformation.prototype.save = function( id, jsonData ) {
	this.storage.save( ENTITY_APPOINTMENTINFORMATION, id, JSON.stringify( jsonData ) );
};
emis.mobile.PatientAppointmentInformation.prototype.remove = function( id ) {
	this.storage.remove( ENTITY_APPOINTMENTINFORMATION, id );
};
emis.mobile.PatientAppointmentInformation.prototype.getById = function( id ) {
	var data = this.storage.find( ENTITY_APPOINTMENTINFORMATION, id );
	return JSON.parse( data );
};

/**
 * Alerts model Functionalities provided: provide alert details save alert information
 */
var ENTITY_ALERTS = "PatientAlerts";
emis.mobile.PatientAlerts = function( ) {
	this.storage = new emis.mobile.Storage( );
};
emis.mobile.PatientAlerts.prototype.save = function( id, jsonData ) {
	this.storage.save( ENTITY_ALERTS, id, JSON.stringify( jsonData ) );
};
emis.mobile.PatientAlerts.prototype.remove = function( id ) {
	this.storage.remove( ENTITY_ALERTS, id );
};
emis.mobile.PatientAlerts.prototype.getById = function( id ) {
	var data = this.storage.find( ENTITY_ALERTS, id );
	return JSON.parse( data );
};

/**
 * Warnings model Functionalities provided: provide warning details save warning information
 */
var ENTITY_WARNINGS = "PatientWarnings";
emis.mobile.PatientWarnings = function( ) {
	this.storage = new emis.mobile.Storage( );
};
emis.mobile.PatientWarnings.prototype.save = function( id, warnings ) {
	for ( var i in warnings ) {
		for ( var j in warnings[i].triggers ) {
			var warningId = id + "#" + warnings[i].triggers[j] + "#" + new emis.mobile.Utilities( ).generateId( );
			warning = new Object( );
			warning.id = warningId;
			warning.patientId = id;
			warning.term = warnings[i].term;
			warning.trigger = warnings[i].triggers[j];
			this.storage.save( ENTITY_WARNINGS, warningId, JSON.stringify( warning ) );
		}
	}
};
emis.mobile.PatientWarnings.prototype.remove = function( id ) {
	this.storage.remove( ENTITY_WARNINGS, id );
};
emis.mobile.PatientWarnings.prototype.getById = function( id ) {
	var data = this.storage.findAll( ENTITY_WARNINGS, id );
	var data2 = new Array( );
	for ( var i in data ) {
		patientId = data[i].id.split( '#' )[0];
		if ( id == patientId ) {
			data2.push( data[i].object );
		}
	}
	return data2;
};

emis.mobile.PatientWarnings.prototype.getAllIdsByPatientId = function( id ) {
	var data = this.storage.findAll( ENTITY_WARNINGS, id );
	var data2 = new Array( );
	for ( var i in data ) {
		patientId = data[i].id.split( '#' )[0];
		if ( id == patientId ) {
			data2.push( data[i].id );
		}
	}
	return data2;
};

emis.mobile.PatientWarnings.prototype.getByIdAndTrigger = function( id, trigger ) {
	var data = this.storage.findAll( ENTITY_WARNINGS, id );
	var data2 = new Array( );
	for ( var i in data ) {
		patientId = data[i].id.split( '#' )[0];
		warningTrigger = data[i].id.split( '#' )[1];
		if ( id == patientId && warningTrigger == trigger ) {
			data2.push( data[i].object );
		}
	}
	return data2;
};

/**
 * CarePathway data model Functionalities provided: provide care pathway details save care pathways
 */
var ENTITY_CAREPATHWAY = "PatientCarePathways";
emis.mobile.PatientCarePathways = function( ) {
	this.storage = new emis.mobile.Storage( );
};
emis.mobile.PatientCarePathways.prototype.save = function( id, jsonData ) {
	this.storage.save( ENTITY_CAREPATHWAY, id, JSON.stringify( jsonData ) );
};
emis.mobile.PatientCarePathways.prototype.remove = function( id ) {
	this.storage.remove( ENTITY_CAREPATHWAY, id );
};
emis.mobile.PatientCarePathways.prototype.getById = function( id ) {
	var data = this.storage.find( ENTITY_CAREPATHWAY, id );
	return JSON.parse( data );
};

/*
 * careEpisodes ready to sync (object saved in accordance with care record update schema)
 * it's needed for saving selected care episode
 * for example if user changes current RTT status, changes selected care episode
 * and then changes selected care episode back to the original one
 * then the current RTT status should not be the original one but the one selected by user
 */
var ENTITY_PATIENT_CARE_EPISODES_MODIFIED = "PatientCareEpisodesModified";
emis.mobile.PatientCareEpisodesModified = function( ) {
	this.storage = new emis.mobile.Storage( );
};
emis.mobile.PatientCareEpisodesModified.prototype.save = function( id, jsonData ) {
	this.storage.save( ENTITY_PATIENT_CARE_EPISODES_MODIFIED, id, JSON.stringify( jsonData ) );
};
emis.mobile.PatientCareEpisodesModified.prototype.remove = function( id ) {
	this.storage.remove( ENTITY_PATIENT_CARE_EPISODES_MODIFIED, id );
};
emis.mobile.PatientCareEpisodesModified.prototype.removeAllByPatientId = function( id ) {
	var data = this.storage.findAll( ENTITY_PATIENT_CARE_EPISODES_MODIFIED, id );
	var data2 = [];
	for ( var i in data ) {
		var patientId = data[i].id.split( '#' )[0];
		if ( id == patientId ) {
			data2.push( data[i].id );
		}
	}
	for ( var i = 0; i < data2.length; i++ ) {
		this.storage.remove( ENTITY_PATIENT_CARE_EPISODES_MODIFIED, data2[i] );
	}
};
emis.mobile.PatientCareEpisodesModified.prototype.getById = function( id ) {
	var data = this.storage.find( ENTITY_PATIENT_CARE_EPISODES_MODIFIED, id );
	return JSON.parse( data );
};

var ENTITY_PATIENT_RTT = "PatientRTT";
emis.mobile.PatientRTT = function( ) {
	this.storage = new emis.mobile.Storage( );
};
emis.mobile.PatientRTT.prototype.save = function( id, jsonData ) {
	this.storage.save( ENTITY_PATIENT_RTT, id, JSON.stringify( jsonData ) );
};
emis.mobile.PatientRTT.prototype.remove = function( id ) {
	this.storage.remove( ENTITY_PATIENT_RTT, id );
};
emis.mobile.PatientRTT.prototype.getById = function( id ) {
	var data = this.storage.find( ENTITY_PATIENT_RTT, id );
	return JSON.parse( data );
};

/**
 * Patient Documentation model Functionalities provided: provide patient documentation save patient documentation
 */
var ENTITY_DOCUMENTATION = "PatientDocumentation";
var ENTITY_DOCATTACHMENT = "DocAttachment";
emis.mobile.PatientDocumentation = function( ) {
	this.storage = new emis.mobile.Storage( );
};
emis.mobile.PatientDocumentation.prototype.save = function( id, jsonData ) {
	this.storage.save( ENTITY_DOCUMENTATION, id, JSON.stringify( jsonData ) );
};
emis.mobile.PatientDocumentation.prototype.remove = function( id ) {
	this.storage.remove( ENTITY_DOCUMENTATION, id );
};
emis.mobile.PatientDocumentation.prototype.getById = function( id ) {
	var data = this.storage.find( ENTITY_DOCUMENTATION, id );
	return JSON.parse( data );
};

function getDocStorage( ) {
	return main.dataProvider.getDocStorage( );
}

/**
 * asynchronous call
 *
 * @param id
 * @returns Promise
 */
emis.mobile.PatientDocumentation.prototype.getAttachment = function( id ) {
	if ( emis.mobile.nativeFrame.isNative ) {
		return this.storage.getDocument( ENTITY_DOCATTACHMENT, id );
	} else {
		return getDocStorage( ).find( ENTITY_DOCATTACHMENT, id );
	}
};

/**
 * asynchronous call
 *
 * @param id
 * @returns Promise
 */
emis.mobile.PatientDocumentation.prototype.isAttachmentPresent = function( id ) {
	return this.storage.isDocumentPresent( ENTITY_DOCATTACHMENT, id );
};

/**
 * asynchronous call
 *
 * @param id
 * @param jsonData
 * @returns Promise
 */
emis.mobile.PatientDocumentation.prototype.saveAttachment = function( id, jsonData ) {
	if ( emis.mobile.nativeFrame.isNative ) {
		return this.storage.saveDocument( ENTITY_DOCATTACHMENT, id, jsonData );
	} else {
		return getDocStorage( ).save( ENTITY_DOCATTACHMENT, id, jsonData );
	}
};

/**
 * asynchronous call
 *
 * @param id
 * @returns Promise
 */
emis.mobile.PatientDocumentation.prototype.removeAttachment = function( id ) {
	if ( emis.mobile.nativeFrame.isNative ) {
		return this.storage.removeDocument( ENTITY_DOCATTACHMENT, id );
	} else {
		return getDocStorage( ).remove( ENTITY_DOCATTACHMENT, id );
	}
};
