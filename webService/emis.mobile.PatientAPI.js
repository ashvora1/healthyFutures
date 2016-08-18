/**
 * API Class to interface the HTTP services Functionalities provided: Fetch the patient details Delegate the patient
 * details to the appropriate methods
 */

emis.mobile.PatientAPI = function() {

};

emis.mobile.PatientAPI.prototype.getPatientRecord = function( sessionId, patientId, slotId ) {
	var patientRecordUrl = PATIENT_RECORD_URL ;
	this.patientId = patientId ;
	this.slotId = slotId ;
	patientRecordUrl = patientRecordUrl.replace("{rawSessionId}", sessionId);
	patientRecordUrl = patientRecordUrl.replace("{rawPatientId}", this.patientId);
	patientRecordUrl = patientRecordUrl.replace("{rawSlotId}", slotId);
	// in local json mode, the replace method returns the same source string,
	// if it cannot find the sub-string to be replaced

	var requestUrl = EMIS_BASE_URL + patientRecordUrl;
	var requestType = REQUEST_GET;
	var requestParameters = "";
	if (WEBSERVICE_MODE == "PROXYMODE") {
		requestType = REQUEST_POST;
		requestUrl = EMIS_BASE_URL;
		requestParameters = "method=" + REQUEST_GET + "&url=" + patientRecordUrl;
	} else if (WEBSERVICE_MODE == LOCAL_JSON) {
		requestUrl = EMIS_BASE_URL + "/GetPatient/" + this.patientId;

	}
	this.webServiceObj = new emis.mobile.WebService( requestType, requestUrl, requestParameters );
	this.webServiceObj.delegate = this;

	this.webServiceObj.performRequest();
};

emis.mobile.PatientAPI.prototype.fetchCompleted = function( response ) {
	var PatientRecord = null;
	try {
		PatientRecord = JSON.parse( response );
	} catch ( e ) {
		var failedData = {'api':'getPatientRecord',
						'desc':'Download patient data',
						'patientId':this.patientId,
						'slotId':this.slotId,
						'eventCode':main.constants.CORRUPTED_DATA,
						'data':{}} ;
		// Failure delegate to be implemented in the classes, where PatientAPI
		// object is created
		this.delegate.APIFailed.call( this.delegate, new emis.mobile.ErrorModel( JSON_ERROR_CODE,
				JSON_ERROR_DESCRIPTION ), failedData );
		return false ;
	}

	if ( PatientRecord && PatientRecord.Payload && PatientRecord.Payload.id ) {
		this.demographic = {};
		this.demographic.id = PatientRecord.Payload.id;
		this.demographic.version = PatientRecord.Payload.version;
		this.demographic.primaryIdentifier = PatientRecord.Payload.primaryIdentifier;
		this.demographic.name = PatientRecord.Payload.name;
		this.demographic.gender = PatientRecord.Payload.gender;
		this.demographic.birthDate = PatientRecord.Payload.birthDate;
		this.demographic.age = PatientRecord.Payload.age;
		this.demographic.address = (PatientRecord.Payload.address) ? PatientRecord.Payload.address : "";
		this.demographic.postcode = (PatientRecord.Payload.postcode) ? PatientRecord.Payload.postcode : "";
		this.demographic.homePhone = (PatientRecord.Payload.homePhone) ? PatientRecord.Payload.homePhone : "";
		this.demographic.mobilePhone = (PatientRecord.Payload.mobilePhone) ? PatientRecord.Payload.mobilePhone : "";
		this.demographic.usualGP = (PatientRecord.Payload.usualGP) ? PatientRecord.Payload.usualGP : "";
	} else {
		this.demographic = {};
	}

	var PatientDataJson = null ;

	if (PatientRecord && PatientRecord.Payload && PatientRecord.Payload.id) {

		PatientDataJson = {} ;

		PatientDataJson.demographic = this.demographic;
		PatientDataJson.summary = (PatientRecord.Payload.summary) ? PatientRecord.Payload.summary : {};
		PatientDataJson.medication = (PatientRecord.Payload.medication) ? PatientRecord.Payload.medication : {};
		PatientDataJson.encounters = (PatientRecord.Payload.encounters) ? PatientRecord.Payload.encounters : {};
		PatientDataJson.values = (PatientRecord.Payload.values) ? PatientRecord.Payload.values : {};
		PatientDataJson.immunisations = (PatientRecord.Payload.immunisations) ? PatientRecord.Payload.immunisations
				: {};
		PatientDataJson.referrals = (PatientRecord.Payload.referrals) ? PatientRecord.Payload.referrals : {};
		PatientDataJson.problems = (PatientRecord.Payload.problems) ? PatientRecord.Payload.problems : {};
		PatientDataJson.diaryEntries = (PatientRecord.Payload.diaryEntries) ? PatientRecord.Payload.diaryEntries : {};
		PatientDataJson.allergies = (PatientRecord.Payload.allergies) ? PatientRecord.Payload.allergies : {};
		PatientDataJson.appointmentInformation = (PatientRecord.Payload.appointmentInformation) ? PatientRecord.Payload.appointmentInformation
				: {};
		PatientDataJson.alerts = (PatientRecord.Payload.alerts) ? PatientRecord.Payload.alerts : {};
		PatientDataJson.schedules = (PatientRecord.Payload.patientSchedules) ? PatientRecord.Payload.patientSchedules : {};
		PatientDataJson.carePathways = (PatientRecord.Payload.carePathways) ? PatientRecord.Payload.carePathways : {};
		PatientDataJson.documents = (PatientRecord.Payload.documents) ? PatientRecord.Payload.documents : {};
		PatientDataJson.warnings = (PatientRecord.Payload.warnings) ? PatientRecord.Payload.warnings : {};

		PatientDataJson.sharingOrgs = (PatientRecord.Payload.sharingOrganisations) ? PatientRecord.Payload.sharingOrganisations : {};
	} else {

		var data = {} ;
		var failedData = {'api':'getPatientRecord',
						'desc':'Download patient data',
						'patientId':this.patientId,
						'slotId':this.slotId,
						'data':data} ;
		display = (PatientRecord && PatientRecord.Payload && PatientRecord.Payload.EventCode) ? PatientRecord.Payload.Display : INVALID_RESPONSE_DESCRIPTION;
		this.delegate.APIFailed.call( this.delegate, new emis.mobile.ErrorModel( INVALID_RESPONSE_CODE, display ), failedData );
	}
	// Success delegate to be implemented in the classes, where PatientAPI
	// object is created
	this.delegate.patientdataSynchronized.call( this.delegate, PatientDataJson );
}

/** * Delegate. Invoked when webserviceObj, fetch Failed event is triggered. ** */
emis.mobile.PatientAPI.prototype.fetchFailed = function( Error ) {
	// Failure delegate to be implemented in the classes, where PatientAPI
	// object is created
	this.delegate.APIFailed.call( this.delegate, Error );
}
