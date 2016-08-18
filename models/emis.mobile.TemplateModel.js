/**
 * Templates model Functionalities provided: save template get template find all ids
 */
var ENTITY_TEMPLATE = "Template";

emis.mobile.TemplateModel = function( ) {
	this.storage = new emis.mobile.Storage( );
}

emis.mobile.TemplateModel.prototype.insert = function( patientId, jsonData ) {
	var templateId = patientId + "-" + new emis.mobile.Utilities( ).generateId( );
	this.storage.save( ENTITY_TEMPLATE, templateId, JSON.stringify( jsonData ) );

	return templateId;
}

emis.mobile.TemplateModel.prototype.save = function( id, jsonData ) {
	this.storage.save( ENTITY_TEMPLATE, id, JSON.stringify( jsonData ) );
}
emis.mobile.TemplateModel.prototype.getById = function( id ) {
	var data = this.storage.find( ENTITY_TEMPLATE, id );
	return data;
}
/**
 * @returns {id:templateId, object:json}
 */
emis.mobile.TemplateModel.prototype.findAll = function( ) {
	var data = this.storage.findAll( ENTITY_TEMPLATE );
	return data;
}
/**
 * @returns {}
 */
emis.mobile.TemplateModel.prototype.findAllIds = function( ) {
	var data = this.storage.findAllIds( ENTITY_TEMPLATE );
	return data;
}
