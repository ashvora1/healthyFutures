/**
 * Consultation Properties data model Functionalities provided: save Consultation Properties
 *
 */
var ENTITY_CONSULTATION_PROPERTIES = "ConsultationProperties";

emis.mobile.ConsultationPropertiesModel = function( ) {
	this.storage = new emis.mobile.Storage( );
}
emis.mobile.ConsultationPropertiesModel.prototype.insert = function( patientId, jsonData ) {

	this.storage.save( ENTITY_CONSULTATION_PROPERTIES, patientId, JSON.stringify( jsonData ) );

	return patientId;
}
emis.mobile.ConsultationPropertiesModel.prototype.save = function( id, jsonData ) {

	this.storage.save( ENTITY_CONSULTATION_PROPERTIES, id, JSON.stringify( jsonData ) );
}
emis.mobile.ConsultationPropertiesModel.prototype.getById = function( id ) {
	var data = this.storage.find( ENTITY_CONSULTATION_PROPERTIES, id );
	return JSON.parse( data );

}
/**
 * @returns {id:cpId, object:json}
 */
emis.mobile.ConsultationPropertiesModel.prototype.findAll = function( ) {
	var data = this.storage.findAll( ENTITY_CONSULTATION_PROPERTIES );
	return data;
}
/**
 * @returns {}
 */
emis.mobile.ConsultationPropertiesModel.prototype.findAllIds = function( ) {
	var data = this.storage.findAllIds( ENTITY_CONSULTATION_PROPERTIES );
	return data;
}
emis.mobile.ConsultationPropertiesModel.prototype.remove = function( cpId ) {
	this.storage.remove( ENTITY_CONSULTATION_PROPERTIES, cpId );
}