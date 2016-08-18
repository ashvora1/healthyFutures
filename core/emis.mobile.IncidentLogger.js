/**
 * Logger class Functionalities provided: Log the input text
 */
emis.mobile.IncidentLogger = function( ) {

}

emis.mobile.IncidentLogger.prototype.IncidentLog = function( logMessage ) {

	var LogJson = {};
	LogJson.EventTime = new emis.mobile.Utilities( ).getCurrentTime( );
	LogJson.EventDetail = logMessage;
	new emis.mobile.LogModel( ).save( LogJson );

}
// To record the synchronization events
emis.mobile.IncidentLogger.prototype.SyncIncidentLog = function( logMessage ) {

	this.IncidentLog( logMessage );

}
