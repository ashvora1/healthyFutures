/**
 * Common functions for Routine sync data
 */
/**
 * ConsultationType model Functionalities provided: save consultation type data getById findAllIds findAll
 *
 */
var ENTITY_CONSULTATIONTYPE = "ConsultationType";

emis.mobile.ConsultationType = function( ) {
	this.storage = new emis.mobile.Storage( );
}
emis.mobile.ConsultationType.prototype.save = function( codeId, jsonData ) {
	this.storage.save( ENTITY_CONSULTATIONTYPE, codeId, JSON.stringify( jsonData ) );
}
emis.mobile.ConsultationType.prototype.getById = function( codeId ) {
	var data = this.storage.find( ENTITY_CONSULTATIONTYPE, codeId );
	return JSON.parse( data );
}
/**
 * @returns array of ids
 */
emis.mobile.ConsultationType.prototype.findAllIds = function( ) {
	var data = this.storage.findAllIds( ENTITY_CONSULTATIONTYPE );
	return data;
}
/**
 * @returns {id:codeId, object:json}
 */
emis.mobile.ConsultationType.prototype.findAll = function( ) {
	var data = this.storage.findAll( ENTITY_CONSULTATIONTYPE );
	return data;
}

/**
 * RttStatus model Functionalities provided: save RttStatus getById findAllIds findAll
 */
var ENTITY_RTTSTATUS = "RttStatus";

emis.mobile.RttStatus = function( ) {
	this.storage = new emis.mobile.Storage( );
}
emis.mobile.RttStatus.prototype.save = function( codeId, jsonData ) {
	this.storage.save( ENTITY_RTTSTATUS, codeId, JSON.stringify( jsonData ) );
}
emis.mobile.RttStatus.prototype.getById = function( codeId ) {
	var data = this.storage.find( ENTITY_RTTSTATUS, codeId );
	return JSON.parse( data );
}
/**
 * @returns {}
 */
emis.mobile.RttStatus.prototype.findAllIds = function( ) {
	var data = this.storage.findAllIds( ENTITY_RTTSTATUS );
	return data;
}
/**
 * @returns {id:codeId, object:json}
 */
emis.mobile.RttStatus.prototype.findAll = function( ) {
	var data = this.storage.findAll( ENTITY_RTTSTATUS );
	return data;
}
/**
 * TaskType model Functionalities provided: save Task type getById findAllIds findAll
 */
var ENTITY_TASKTYPE = "TaskType";

emis.mobile.TaskType = function( ) {
	this.storage = new emis.mobile.Storage( );
}
emis.mobile.TaskType.prototype.save = function( id, jsonData ) {
	this.storage.save( ENTITY_TASKTYPE, id, JSON.stringify( jsonData ) );
}
emis.mobile.TaskType.prototype.getById = function( id ) {
	var data = this.storage.find( ENTITY_TASKTYPE, id );
	return JSON.parse( data );
}
/**
 * @returns {}
 */
emis.mobile.TaskType.prototype.findAllIds = function( ) {
	var data = this.storage.findAllIds( ENTITY_TASKTYPE );
	return data;
}
/**
 * @returns {id:id, object:json}
 */
emis.mobile.TaskType.prototype.findAll = function( ) {
	var data = this.storage.findAll( ENTITY_TASKTYPE );
	return data;
}
/**
 * TemplateHeader model Functionalities provided: save Template header getById findAllIds findAll
 */
var ENTITY_TEMPLATEHEADER = "TemplateHeader";

emis.mobile.TemplateHeader = function( ) {
	this.storage = new emis.mobile.Storage( );
}
emis.mobile.TemplateHeader.prototype.save = function( id, jsonData ) {
	this.storage.save( ENTITY_TEMPLATEHEADER, id, JSON.stringify( jsonData ) );
}
emis.mobile.TemplateHeader.prototype.getById = function( id ) {
	var data = this.storage.find( ENTITY_TEMPLATEHEADER, id );
	return JSON.parse( data );
}
/**
 * @returns {}
 */
emis.mobile.TemplateHeader.prototype.findAllIds = function( ) {
	var data = this.storage.findAllIds( ENTITY_TEMPLATEHEADER );
	return data;
}
/**
 * @returns {id:id, object:json}
 */
emis.mobile.TemplateHeader.prototype.findAll = function( ) {
	var data = this.storage.findAll( ENTITY_TEMPLATEHEADER );
	return data;
}
/**
 * OrganisationPeople model Functionalities provided: save Organisation people getById findAllIds findAll
 */
var ENTITY_ORGANISATIONPEOPLE = "OrganisationPeople";

emis.mobile.OrganisationPeople = function( ) {
	this.storage = new emis.mobile.Storage( );
}
emis.mobile.OrganisationPeople.prototype.save = function( id, jsonData ) {
	this.storage.save( ENTITY_ORGANISATIONPEOPLE, id, JSON.stringify( jsonData ) );
}
emis.mobile.OrganisationPeople.prototype.getById = function( id ) {
	var data = this.storage.find( ENTITY_ORGANISATIONPEOPLE, id );
	return JSON.parse( data );
}
/**
 * @returns {}
 */
emis.mobile.OrganisationPeople.prototype.findAllIds = function( ) {
	var data = this.storage.findAllIds( ENTITY_ORGANISATIONPEOPLE );
	return data;
}
/**
 * @returns {id:id, object:json}
 */
emis.mobile.OrganisationPeople.prototype.findAll = function( ) {
	var data = this.storage.findAll( ENTITY_ORGANISATIONPEOPLE );
	return data;
}
/**
 * Locations functionalities
 */
var ENTITY_LOCATIONS = "Locations";

emis.mobile.Locations = function( ) {
	this.storage = new emis.mobile.Storage( );
}
emis.mobile.Locations.prototype.save = function( id, jsonData ) {
	this.storage.save( ENTITY_LOCATIONS, id, JSON.stringify( jsonData ) );
}
emis.mobile.Locations.prototype.getById = function( id ) {
	var data = this.storage.find( ENTITY_LOCATIONS, id );
	return JSON.parse( data );
}

emis.mobile.Locations.prototype.findAllIds = function( ) {
	var data = this.storage.findAllIds( ENTITY_LOCATIONS );
	return data;
}

emis.mobile.Locations.prototype.findAll = function( ) {
	var data = this.storage.findAll( ENTITY_LOCATIONS );
	return data;
}
/**
 * SlotTypes functionalities
 */
var ENTITY_SLOTTYPES = "SlotTypes";

emis.mobile.SlotTypes = function( ) {
	this.storage = new emis.mobile.Storage( );
}
emis.mobile.SlotTypes.prototype.save = function( id, jsonData ) {
	this.storage.save( ENTITY_SLOTTYPES, id, JSON.stringify( jsonData ) );
}
emis.mobile.SlotTypes.prototype.getById = function( id ) {
	var data = this.storage.find( ENTITY_SLOTTYPES, id );
	return JSON.parse( data );
}

emis.mobile.SlotTypes.prototype.findAllIds = function( ) {
	var data = this.storage.findAllIds( ENTITY_SLOTTYPES );
	return data;
}

emis.mobile.SlotTypes.prototype.findAll = function( ) {
	var data = this.storage.findAll( ENTITY_SLOTTYPES );
	return data;
}
/**
 * SessionCategories functionalities
 */
var ENTITY_SESSIONCATEGORIES = "SessionCategories";

emis.mobile.SessionCategories = function( ) {
	this.storage = new emis.mobile.Storage( );
}
emis.mobile.SessionCategories.prototype.save = function( id, jsonData ) {
	this.storage.save( ENTITY_SESSIONCATEGORIES, id, JSON.stringify( jsonData ) );
}
emis.mobile.SessionCategories.prototype.getById = function( id ) {
	var data = this.storage.find( ENTITY_SESSIONCATEGORIES, id );
	return JSON.parse( data );
}

emis.mobile.SessionCategories.prototype.findAllIds = function( ) {
	var data = this.storage.findAllIds( ENTITY_SESSIONCATEGORIES );
	return data;
}

emis.mobile.SessionCategories.prototype.findAll = function( ) {
	var data = this.storage.findAll( ENTITY_SESSIONCATEGORIES );
	return data;
}
/**
 * SessionHolders functionalities
 */
var ENTITY_SESSIONHOLDERS = "SessionHolders";

emis.mobile.SessionHolders = function( ) {
	this.storage = new emis.mobile.Storage( );
}
emis.mobile.SessionHolders.prototype.save = function( id, jsonData ) {
	this.storage.save( ENTITY_SESSIONHOLDERS, id, JSON.stringify( jsonData ) );
}
emis.mobile.SessionHolders.prototype.getById = function( id ) {
	var data = this.storage.find( ENTITY_SESSIONHOLDERS, id );
	return JSON.parse( data );
}

emis.mobile.SessionHolders.prototype.findAllIds = function( ) {
	var data = this.storage.findAllIds( ENTITY_SESSIONHOLDERS );
	return data;
}

emis.mobile.SessionHolders.prototype.findAll = function( ) {
	var data = this.storage.findAll( ENTITY_SESSIONHOLDERS );
	return data;
}
/**
 * SessionHolderFilters functionalities
 */
var ENTITY_SESSIONHOLDERFILTERS = "SessionFilterHolders";

emis.mobile.SessionHolderFilters = function( ) {
	this.storage = new emis.mobile.Storage( );
}
emis.mobile.SessionHolderFilters.prototype.save = function( id, jsonData ) {
	this.storage.save( ENTITY_SESSIONHOLDERFILTERS, id, JSON.stringify( jsonData ) );
}
emis.mobile.SessionHolderFilters.prototype.getById = function( id ) {
	var data = this.storage.find( ENTITY_SESSIONHOLDERFILTERS, id );
	return JSON.parse( data );
}

emis.mobile.SessionHolderFilters.prototype.findAllIds = function( ) {
	var data = this.storage.findAllIds( ENTITY_SESSIONHOLDERFILTERS );
	return data;
}

emis.mobile.SessionHolderFilters.prototype.findAll = function( ) {
	var data = this.storage.findAll( ENTITY_SESSIONHOLDERFILTERS );
	return data;
}
/**
 * AppointmentBookingReasons functionalities
 */
var ENTITY_APPOINTMENTBOOKINGREASONS = "AppointmentBookingReasons";

emis.mobile.AppointmentBookingReasons = function( ) {
	this.storage = new emis.mobile.Storage( );
}
emis.mobile.AppointmentBookingReasons.prototype.save = function( id, jsonData ) {
	this.storage.save( ENTITY_APPOINTMENTBOOKINGREASONS, id, JSON.stringify( jsonData ) );
}
emis.mobile.AppointmentBookingReasons.prototype.getById = function( id ) {
	var data = this.storage.find( ENTITY_APPOINTMENTBOOKINGREASONS, id );
	return JSON.parse( data );
}

emis.mobile.AppointmentBookingReasons.prototype.findAllIds = function( ) {
	var data = this.storage.findAllIds( ENTITY_APPOINTMENTBOOKINGREASONS );
	return data;
}

emis.mobile.AppointmentBookingReasons.prototype.findAll = function( ) {
	var data = this.storage.findAll( ENTITY_APPOINTMENTBOOKINGREASONS );
	dataString = new Array( );
	for ( i in data ) {
		dataString.push( data[i].object.Text );
	}
	dataString.sort( function( a, b ) {
		return a.toLowerCase( ).localeCompare( b.toLowerCase( ) );
	} );
	return dataString;
}

/**
 * ScheduleTemplate functionalities
 */
var ENTITY_SCHEDULETEMPLATE = "ScheduleTemplate";

emis.mobile.ScheduleTemplateModel = function( ) {
	this.storage = new emis.mobile.Storage( );
}
emis.mobile.ScheduleTemplateModel.prototype.save = function( id, jsonData ) {
	this.storage.save( ENTITY_SCHEDULETEMPLATE, id, JSON.stringify( jsonData ) );
}
emis.mobile.ScheduleTemplateModel.prototype.getById = function( id ) {
	var data = this.storage.find( ENTITY_SCHEDULETEMPLATE, id );
	return JSON.parse( data );
}
emis.mobile.ScheduleTemplateModel.prototype.findAll = function( ) {
	var data = this.storage.findAll( ENTITY_SCHEDULETEMPLATE );
	return data;
}
emis.mobile.ScheduleTemplateModel.prototype.findAllIds = function( ) {
	var data = this.storage.findAllIds( ENTITY_SCHEDULETEMPLATE );
	return data;
}

/**
 * ScheduleTemplate functionalities
 */
var ENTITY_SERVICES = "Services";

emis.mobile.ServicesModel = function( ) {
	this.storage = new emis.mobile.Storage( );
}
emis.mobile.ServicesModel.prototype.save = function( id, jsonData ) {
	this.storage.save( ENTITY_SERVICES, id, JSON.stringify( jsonData ) );
}
emis.mobile.ServicesModel.prototype.getById = function( id ) {
	var data = this.storage.find( ENTITY_SERVICES, id );
	return JSON.parse( data );
}
emis.mobile.ServicesModel.prototype.findAll = function( ) {
	var data = this.storage.findAll( ENTITY_SERVICES );
	return data;
}
emis.mobile.ServicesModel.prototype.findAllIds = function( ) {
	var data = this.storage.findAllIds( ENTITY_SERVICES );
	return data;
}
