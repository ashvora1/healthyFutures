/**
 * Constants class Functionalities provided: Holds all the constants
 */
emis.mobile.Constants = function( ) {

	APP_VERSION = "EMIS Mobile v3.1.0.1000.20160620";

	LIVE_WEBSERVICE_URL = "https://mobile.e-mis.co.uk/handler.svc";
	TEST_WEBSERVICE_URL = "http://poland.qburst.com:91/emismobile/handler.svc";

	JSON_BASE_URL = emis.mobile.Utilities.relativeToAbsoluteUrl( "./TestData" );

	// via direct json;
	LOCAL_JSON = "JSONMODE";
	// via PHP proxy;
	EMIS_PROXY = "PROXYMODE";
	// via emis services;
	EMIS_DIRECT = "DIRECTMODE";
	// via qburst tunnel to emis services;
	QBURST_TEST_DIRECT = "QBURSTTESTMODE";

	PATIENT_LIMIT = 50;

	MAX_PATIENT_FULL_DOM_LOAD = 25;
	MAX_PATIENT_SCROLL_PAGES = 3;

	//WEBSERVICE_MODE = LOCAL_JSON;
	//WEBSERVICE_MODE = EMIS_PROXY;
	//WEBSERVICE_MODE = EMIS_DIRECT;
	//WEBSERVICE_MODE = QBURST_TEST_DIRECT;

	v2features = false; // later change to false
	CALL_OTK_INSTEAD = true;
	ENABLE_CASELOADS = false ;
	ENABLE_SHARED_DATA = true;
	ENABLE_SCHEDULES = true;
	ENABLE_RTT = true;

	if ( emis.mobile.nativeFrame.isNative ) {
		CALL_OTK_INSTEAD = false;
		WEBSERVICE_MODE = EMIS_DIRECT;
		v2features = false;
		APP_VERSION = "EMIS Mobile v3.1.0.1000.20160620";
	} else {
		WEBSERVICE_MODE = EMIS_DIRECT;
		ENABLE_SHARED_DATA = false;
		ENABLE_SCHEDULES = false;
		ENABLE_RTT = false;
		//WEBSERVICE_MODE = LOCAL_JSON;
	}
	DELAY_BEFORE_PAGE_CHANGE = 10 ;

	DISPLAY_LOGS_DURING_SYNC = false;
	DISPLAY_CONSENTS_DURING_SYNC = false;
	DISPLAY_CONSENTS_AVAILABLE_FOR_SINGLE_PATIENT_SYNC = false;

	if(v2features == true) {
		DISPLAY_CONSENTS_DURING_SYNC = false;
		DISPLAY_CONSENTS_AVAILABLE_FOR_SINGLE_PATIENT_SYNC = false;
		CALL_OTK_INSTEAD = true;
		ENABLE_CASELOADS = false ;
		ENABLE_SHARED_DATA = false;
		ENABLE_SCHEDULES = false;
		ENABLE_RTT = false;
	}
	DISPLAY_OPEN_APPOINTMENTS_PANEL = false;
	DISPLAY_STAR_INSTEAD_SYNC = false;

	/**
	 * automatic logout time out in seconds
	 */

	LOGOUT_TIMEOUT = 15 * 60;

	NEW_ID = "00000000-0000-0000-0000-000000000000";
	// because of bug in jQuery Mobile delay after closing dialog
	// or changing tab to scroll page to top
	SCROLLTO_DELAY = 200;
	SCROLLTO_DELAY_WITH_KEYBOARD = 1000;
	// delay if keyboard is open

	QUICKNOTES_TEMPLATE_ID = "87901000000115" ;
	DIARY_COMPONENT_CODE = "849441000006118"

	AUTO_SYNC_INTERVAL = 3*60*60*1000 ; // time to alert user if he needs to sync
	AUTO_SYNC_ASK_INTERVAL = 10*60*1000 ; // interval to ask user again if he want to sync


	// generic constants
	SUCCESS_STR = JSON.stringify({"success":true}) ;
	FAIL_STR = JSON.stringify({"success":false}) ;


	/**
	 * is auto login demo fill active
	 */
	DEMO_AUTO_LOGIN = false;
	DEMO_LOGIN = 'qbursttest1';
	DEMO_PASS = 'Qbursttest123';
	DEMO_CDB = '50003';

	REQUEST_GET = "GET";
	REQUEST_POST = "POST";

	if ( WEBSERVICE_MODE == EMIS_PROXY ) {
		EMIS_BASE_URL = JSON_BASE_URL + "/EmisWebInterface.php";

		GET_SESSION_URL = "/getsession/UserId/{userName}/cdb/{rawCdb}/";
		// IS_TRUSTED_URL = "/isTrusted";
		IS_TRUSTED_URL = "/istrusted/sessionId/{rawSessionId}/";
		END_SESSION_URL = "/endsession/sessionId/{rawSessionId}/";
		KEY_VERIFICATION_URL = "/verifyotk/sessionId/{rawSessionId}/key/{oneTimeKey}/";

		TEMPLATES_URL = "/gettemplate/sessionId/{rawSessionId}/templateId/{rawTemplateId}/";

		TASK_URL = "/posttask";

		CONSENT_URL = "/consentcapture";

		ROUTINE_SYNC_DATA_URL = "/getroutinesyncdata/sessionId/{rawSessionId}/";

		PATIENT_LIST_URL = "/getpatientlist/sessionId/{rawSessionId}/";

		PATIENT_RECORD_URL = "/getpatient/sessionId/{rawSessionId}/patientId/{rawPatientId}/slotid/{rawSlotId}";

		LOG_URL = "/postlog";

		ENCOUNTER_URL = "/postencounter";

		SEARCH_APPOINTMENTS_URL = "/searchappointments";
		BOOK_APPOINTMENT_URL = "/bookappointment";
		RESERVE_APPOINTMENT_URL = "/reserveappointment";
		GET_MEDICATION_REFERENCE_URL = "/getmedicationreference/sessionId/{rawSessionId}/";
		POST_MEDICATION_URL = "/postmedication/patientId/{rawPatientId}/slotId/{rawSlotId}/";
		GET_ATTACHMENT_URL = "/getattachment2";
		GET_AUTHENTICATION_SERVER_DATE_TIME_URL = "/getauthenticationserverdatetime/sessionId/{rawSessionId}/";
		REQUEST_SHARED_SECRET_URL = "/requestSharedSecret";
		VERIFY_AUTHENTICATION_CODE_URL = "/verifyAuthenticationCode";
		CANCEL_SCHEDULE_URL = "/cancelschedule";
		CREATE_SCHEDULE_URL = "/createschedule";
		EDIT_SCHEDULE_URL = "/editschedule";
	} else if ( WEBSERVICE_MODE == "JSONMODE" ) {

		EMIS_BASE_URL = JSON_BASE_URL;

		GET_SESSION_URL = "/getSessionv3";
		IS_TRUSTED_URL = "/isTrusted";
		END_SESSION_URL = "/endSession";
		KEY_VERIFICATION_URL = "/verifyKey";

		TEMPLATES_URL = "/GetTemplate/{rawTemplateId}";

		// "/postTask.php";
		TASK_URL = "/postTask";

		CONSENT_URL = "/consentcapture";

		ROUTINE_SYNC_DATA_URL = "/RoutineSyncDatav3";

		PATIENT_LIST_URL = "/AppointmentListJson_B";

		PATIENT_RECORD_URL = "/31";

		// "/postLog.php";
		LOG_URL = "/postLog";

		ENCOUNTER_URL = "/postencounter";

		SEARCH_APPOINTMENTS_URL = "/searchAppointments";
		BOOK_APPOINTMENT_URL = "/bookappointment";
		RESERVE_APPOINTMENT_URL = "/reserveappointment";
		GET_MEDICATION_REFERENCE_URL = "/getmedicationreference";
		POST_MEDICATION_URL = "/postmedication/patientId/{rawPatientId}/slotId/{rawSlotId}/";
		GET_ATTACHMENT_URL = "/getattachment2";
		GET_AUTHENTICATION_SERVER_DATE_TIME_URL = "/getauthenticationserverdatetime";
		REQUEST_SHARED_SECRET_URL = "/requestSharedSecret";
		VERIFY_AUTHENTICATION_CODE_URL = "/verifyAuthenticationCode";
		CANCEL_SCHEDULE_URL = "/cancelschedule";
		CREATE_SCHEDULE_URL = "/createschedule";
		EDIT_SCHEDULE_URL = "/editschedule";
	} else if ( WEBSERVICE_MODE == EMIS_DIRECT || WEBSERVICE_MODE == QBURST_TEST_DIRECT ) {
		if ( WEBSERVICE_MODE == QBURST_TEST_DIRECT ) {
			EMIS_BASE_URL = TEST_WEBSERVICE_URL;
		} else {
			EMIS_BASE_URL = LIVE_WEBSERVICE_URL;
		}

		GET_SESSION_URL = "/getsession/UserId/{userName}/cdb/{rawCdb}/";
		IS_TRUSTED_URL = "/istrusted/sessionId/{rawSessionId}/";
		END_SESSION_URL = "/endsession/sessionId/{rawSessionId}/";
		KEY_VERIFICATION_URL = "/verifyotk/sessionId/{rawSessionId}/key/{oneTimeKey}/";

		TEMPLATES_URL = "/gettemplate/sessionId/{rawSessionId}/templateId/{rawTemplateId}/";

		TASK_URL = "/posttask";

		CONSENT_URL = "/consentcapture";

		ROUTINE_SYNC_DATA_URL = "/getroutinesyncdata/sessionId/{rawSessionId}/";

		PATIENT_LIST_URL = "/getpatientlist/sessionId/{rawSessionId}/";

		PATIENT_RECORD_URL = "/getpatient/sessionId/{rawSessionId}/patientId/{rawPatientId}/slotid/{rawSlotId}";

		LOG_URL = "/postlog";

		ENCOUNTER_URL = "/postencounter";

		SEARCH_APPOINTMENTS_URL = "/searchappointments";
		BOOK_APPOINTMENT_URL = "/bookappointment";
		RESERVE_APPOINTMENT_URL = "/reserveappointment";
		GET_MEDICATION_REFERENCE_URL = "/getmedicationreference/sessionId/{rawSessionId}/";
		POST_MEDICATION_URL = "/postmedication/patientId/{rawPatientId}/slotId/{rawSlotId}/";
		GET_ATTACHMENT_URL = "/getattachment2";
		GET_AUTHENTICATION_SERVER_DATE_TIME_URL = "/getauthenticationserverdatetime/sessionId/{rawSessionId}/";
		REQUEST_SHARED_SECRET_URL = "/requestSharedSecret";
		VERIFY_AUTHENTICATION_CODE_URL = "/verifyAuthenticationCode";
		CANCEL_SCHEDULE_URL = "/cancelschedule";
		CREATE_SCHEDULE_URL = "/createschedule";
		EDIT_SCHEDULE_URL = "/editschedule";
	}

	// for production server turn off console logging
	if ( WEBSERVICE_MODE == EMIS_DIRECT ) {
		emis.mobile.console.setDebugLevel( emis.mobile.console.NONE );
	} else {
		emis.mobile.console.setDebugLevel( emis.mobile.console.DEBUG );
	}

	// when we call JSON.parse and there is an error
	this.CORRUPTED_DATA = 1234;

	// WebService response EventCode values
	// The application could not file the encounter data, please contact support
	this.COULD_NOT_FILE_ENCOUNTER = -15001;
	// The application could not file the given task data, please contact
	// support
	this.COULD_NOT_FILE_TASK = -15002;
	// This requested patient is not in a mobile session
	this.PATIENT_NOT_IN_MOBILE_SESSION = -15004;
	// The mobile service could not handle your request
	this.COULD_NOT_HANDLE_REQUEST = -15008;
	// The provided CDB number is not valid
	this.CDB_NUMBER_IS_NOT_VALID = -159;
	// No valid session
	this.NO_VALID_SESSION = -160;
	// The requested action requires token verification
	this.ACTION_REQUIRES_TOKEN_VERIFICATION = -161;
	// Your mobile session has expired
	this.SESSION_HAS_EXPIRED = -162;
	// Invalid session length
	this.INVALID_SESSION_LENGTH = -163;
	// Invalid session OTK length
	this.INVALID_OTK_LENGTH = -164;
	// One time key session has ended
	this.OTK_SESSION_ENDED = -165;
	// Malformed session length
	this.MALFORMED_SESSION_LENGTH = -166;
	// Malformed session OTK length
	this.MALFORMED_OTK_LENGTH = -167;
	// Your mobile session has been ended
	this.SESSION_ENDED = -168;
	// Malformed session ID
	this.MALFORMED_SESSION_ID = -169;
	// Undefined session ID
	this.UNDEFINED_SESSION_ID = -170;
	// Invalid user ID
	this.INVALID_USER_ID = -171;
	// Invalid CDB
	this.INVALID_CDB = -172;
	// Invalid password
	this.INVALID_PASSWORD = -173;
	// Malformed CDB
	this.MALFORMED_CDB = -174;
	// Application disabled
	this.APPLICATION_DISBLED = -178;
	// Access denied
	this.ACCESS_DENIED = -179;
	// The provided one time key is invalid
	this.INVALID_OTK = -180;
	// Malformed OTK value
	this.MALFORMED_OTK = -181;
	// Malformed patient ID
	this.MALFORMED_PATIENT_ID = -182;
	// Malformed user name
	this.MALFORMED_USER_NAME = -183;
	// Malformed payload
	this.MALFORMED_PAYLOAD = -184;
	// Your EMIS Mobile account is locked, this can be unlocked in EMIS Web
	this.ACCOUNT_LOCKED = -185;
	// Your EMIS Mobile password has expired, this can be reset in EMIS Web
	this.PASSWORD_EXPIRED = -186;
	// User or organisation is inactive
	this.USER_ORGANISATION_INACTIVE - 187;
	// Requestor does not have access to the requested service
	this.ACCESS_DENIED_TO_REQUESTED_SERVICE = -2;

}