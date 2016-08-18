/**
 * UserSession model Functionalities provided: save username, password, cdb provide username, password, cdb
 *
 */
var ENTITY_USER = "User";
var ID_PASSWORD = "Password";
var ID_OFFLINE_PASSWORD = "OFFLINE";
var ID_USERNAME = "UserName";
var ID_CDB = "CDB";
var ID_SESSIONID = "SESSIONID";
var ID_SYNCDATE = "LastSyncDate";
var ID_AUTO_SYNC_LAST_DATE = 'AutoSyncLastDate' ; // storage id for variable that holds date from which we count if user should perfom sync
var ID_ENCOUNTERSYNCSTATUS = "WasEncounterSync";
var ID_TASKSYNCSTATUS = "WasTaskSync";

function getDateStr (date) {
	date = date || new Date() ;
	var dateObj = {'date': main.util.formatDate( date ), 'time':date.getTime()} ;
	return JSON.stringify(dateObj) ;
}

emis.mobile.UserSessionModel = function( ) {
	this.storage = new emis.mobile.Storage( );
	return this;
}
emis.mobile.UserSessionModel.prototype.saveUserName = function( userName ) {
	if ( emis.mobile.nativeFrame.isNative ) {
		this.storage.save( ENTITY_USER, ID_USERNAME, userName );
	} else {
		this.storage.saveWithoutEncryption( ENTITY_USER, ID_USERNAME, userName );
	}
}
emis.mobile.UserSessionModel.prototype.saveOfflinePassword = function( hashedOfflinePassword ) {
	this.storage.saveWithoutEncryption( ENTITY_USER, ID_OFFLINE_PASSWORD, hashedOfflinePassword );
}
emis.mobile.UserSessionModel.prototype.saveCDB = function( cdb ) {
	if ( emis.mobile.nativeFrame.isNative ) {
		this.storage.save( ENTITY_USER, ID_CDB, cdb );
	} else {
		this.storage.saveWithoutEncryption( ENTITY_USER, ID_CDB, cdb );
	}
}
emis.mobile.UserSessionModel.prototype.saveSessionId = function( sessionId ) {
	this.storage.save( ENTITY_USER, ID_SESSIONID, sessionId );
}
emis.mobile.UserSessionModel.prototype.saveLastSyncDate = function( formattedDate, id ) {
	if (!formattedDate) {
		formattedDate = getDateStr() ;
	}
	id = id || "0" ;
	this.storage.save( ID_SYNCDATE, id, formattedDate );
}

emis.mobile.UserSessionModel.prototype.getLastSyncDate = function( id ) {
	id = id || "0" ;
	return this.storage.find( ID_SYNCDATE, id );
}

emis.mobile.UserSessionModel.prototype.saveAutoLastSyncDate = function( formattedDate) {
	if (!formattedDate) {
		formattedDate = getDateStr() ;
	}
	this.storage.save( ID_AUTO_SYNC_LAST_DATE, "0", formattedDate );
}
emis.mobile.UserSessionModel.prototype.getAutoLastSyncDate = function() {
	return this.storage.find( ID_AUTO_SYNC_LAST_DATE, "0" );
}
emis.mobile.UserSessionModel.prototype.saveLastEncounterSyncStatus = function( status ) {
	this.storage.saveWithoutEncryption( ID_ENCOUNTERSYNCSTATUS, "0", status );
}
emis.mobile.UserSessionModel.prototype.saveTaskSyncStatus = function( status ) {
	this.storage.saveWithoutEncryption( ID_TASKSYNCSTATUS, "0", status );
}

emis.mobile.UserSessionModel.prototype.getUserName = function( ) {
	var userName = this.storage.findWithoutEncryption( ENTITY_USER, ID_USERNAME );
	return userName;
}
emis.mobile.UserSessionModel.prototype.getOfflinePassword = function( ) {
	return this.storage.findWithoutEncryption( ENTITY_USER, ID_OFFLINE_PASSWORD );
}
emis.mobile.UserSessionModel.prototype.getCDB = function( ) {
	var cdb = this.storage.findWithoutEncryption( ENTITY_USER, ID_CDB );
	return cdb;
}
emis.mobile.UserSessionModel.prototype.getSessionId = function( ) {
	var sid = this.storage.find( ENTITY_USER, ID_SESSIONID );
	return sid;
}
emis.mobile.UserSessionModel.prototype.getLastEncounterSyncStatus = function( ) {
	return this.storage.findWithoutEncryption( ID_ENCOUNTERSYNCSTATUS, "0" );
}
emis.mobile.UserSessionModel.prototype.getTaskSyncStatus = function( ) {
	return this.storage.findWithoutEncryption( ID_TASKSYNCSTATUS, "0" );
}
emis.mobile.UserSessionModel.prototype.removeTaskSyncStatus = function () {
	return this.storage.remove( ID_TASKSYNCSTATUS, "0" );
}
emis.mobile.UserSessionModel.prototype.removeLastEncounterSyncStatus = function( ) {
	return this.storage.remove( ID_ENCOUNTERSYNCSTATUS, "0" );
}
