/**
 * Model Class to exchange the error details Functionalities provided: Provide the error codes Provide the error
 * description
 */

SERVER_ERROR_CODE = 103;
JSON_ERROR_CODE = 102;
CONNECTION_ERROR_CODE = 101;
KEY_VERIFICATIONFAIL_CODE = 105;
LOGIN_ERROR_CODE = 104;
LOGIN_ERROR_DATA_WIPE_CODE = 106;
INVALID_RESPONSE_CODE = 107;
INVALID_SYNC_CODE = 108;
L0GIN_ERROR_PREVIOUS_DATA_CODE = 109;
LOGIN_ERROR_ACCOUNT_LOCKED_CODE = 110;
SYNC_ERROR_GENERAL_CODE = 111;

// SERVER_ERROR_DESCRIPTION = "Could not retrieve data";
SERVER_ERROR_DESCRIPTION = "Operation failed. Please check your internet connection or try again later";
JSON_ERROR_DESCRIPTION = "The json content is invalid";
CONNECTION_ERROR_DESCRIPTION = "The connection to the server is taking too much time";
KEY_VERIFICATIONFAIL_DESCRIPTION = "Invalid key";
LOGIN_ERROR_DESCRIPTION = "Invalid login credentials";
LOGIN_ERROR_DATA_WIPE_DESCRIPTION = "You have entered invalid login credentials three times in row. All data in EMIS Mobile will be wiped. You may enter a new password and then you must synchronised with EMIS Web";
LOGIN_ERROR_DATA_WIPE_OFFLINE_DESCRIPTION = "You have entered invalid login credentials three times in a row. Offline mode will remain unavailable until you log in successfully online. Failure to login online three times in a row will lock your Emis Mobile account and purge all data from the application.";
INVALID_RESPONSE_DESCRIPTION = "Invalid response from the server";
INVALID_SYNC_DESCRIPTION = "Cannot synchronise, before the current synchronisation session...";
L0GIN_ERROR_PREVIOUS_DATA_DESCRIPTION = "Cannot login. Previous user's data is present";
LOGIN_ERROR_ACCOUNT_LOCKED_DESCRIPTION = "Your account is locked. Contact EMIS support to unlock it";

emis.mobile.ErrorModel = function( code, description ) {
	this.code = code;
	this.description = description;
}
