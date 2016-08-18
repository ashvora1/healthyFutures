/**
 * Created by Chris on 22/03/2016.
 * Additional Safety feature to check for corruption in the local data storage
 * This will check the patient list entries against the associated record
 * If these don't match then the device will be forced wipe and resync the data
 * This will only be preformed on the sync all action
 */
var NumberOfOutOfSyncRecords = 0;
var _app;

PatientAppointmentSlot = function(_slotId,_patientId,_patientName) {
    this.slotId = _slotId;
    this.patientId = _patientId;
    this.patientName = _patientName;
}

GetPatientListEntries = function() {
    var patientListEntry;

    try {
        patientListEntry = _app.dataProvider.getAllSessionIDs();
    } catch (error) {
        console.log("Failed to retrieve entries : " + error.toString());
        
        //As this is before the appointment list build then this check wont have been preformed, if there is an issue then we have to clear the data and resync the data this could be done here.
        var dataWipe = new emis.mobile.DataWipe();
        dataWipe.clearSynchronisedData(_app.dataProvider, null);
    }

    return patientListEntry;
}

GetAppointmentSessionEntry= function(entry){
    return _app.dataProvider.getSessionById(entry);
}

GetSlotsForPatientListEntry = function(sessionId){
    return _app.dataProvider.getAllAppointmentsBySession(sessionId);
}

GetAppointmentSlot = function(appointmentSlot){

    if ( appointmentSlot.PatientId ) {
        return _app.dataProvider.getAppointmentById( appointmentSlot.SlotId );
    } else {
        return _app.dataProvider.getAppointmentById( "nullId" + appointmentSlot.SlotId );
    }
    if ( appointmentSlot == null ) {
        return appointmentSlot.object;
    }
}

GetPatientRecord = function(patientId){
    return _app.dataProvider.getPatientById(patientId);
}

DataConsistencyCheck = function(appObject){

    _app = appObject;
    NumberOfOutOfSyncRecords = 0;

    var patientListEntries = GetPatientListEntries();

    if (!_app.util.isEmptyObject(patientListEntries) && !patientListEntries.length) {
        console.log("No Entries Returned");
        return;
    }

    for (var patientListEntryIndex = 0; patientListEntryIndex < patientListEntries.length; patientListEntryIndex++) {

        var appointmentSessionEntry = GetAppointmentSessionEntry(patientListEntries[patientListEntryIndex]);

        if(appointmentSessionEntry) {
            CheckEachAppointmentSessionSlotMatchesThePatientRecord(appointmentSessionEntry);
        }
        else{
            console.log("No Entry Returned");
        }
    }

    if(NumberOfOutOfSyncRecords > 0){
        console.log(NumberOfOutOfSyncRecords + " : Record(s) have been found with data inconsistencies");

        var syncButtonTarget = $('.startSync');
        var event = jQuery.Event('click');
        event.target = syncButtonTarget;

        emis.mobile.Utilities.alert( {message: "The patient data is not synced correctly. Tap OK to resync your device with EMIS Web. If this problem persists, contact EMIS Health Support.", callback: function(r) {
            if ( r === true ) {
                syncButtonTarget.trigger(event);
            }
        }} );
    }
}

CheckEachAppointmentSessionSlotMatchesThePatientRecord = function(appointmentSessionEntry){

    var patientListSlots = GetSlotsForPatientListEntry(appointmentSessionEntry.SessionId);

    if(!_app.util.isEmptyObject(patientListSlots) && !patientListSlots.length)
    {
        console.log("No PatientList Slots Returned");
        return;
    }

    for (var appointmentSlotIndex = 0; appointmentSlotIndex < patientListSlots.length; appointmentSlotIndex++ ){

        var appointmentSlot = GetAppointmentSlot(patientListSlots[appointmentSlotIndex])

        if(!appointmentSlot) {
            console.log("No appointmentSlot Returned");
            return;
        }

        var patientAppointmentSlot = new PatientAppointmentSlot(appointmentSlot.SlotId, appointmentSlot.PatientId, appointmentSlot.PatientName);

        if(!patientAppointmentSlot){
            console.log("Unable To Create patientAppointmentSlot object");
        }

        CheckTheAssociatedRecordMatchesThePatientAppointmentSlot(patientAppointmentSlot);
    }
}

CheckTheAssociatedRecordMatchesThePatientAppointmentSlot = function(patientAppointmentSlot){

    var patientRecord = GetPatientRecord(patientAppointmentSlot.patientId);

    //Because of the way the data has been stored we can only match by name.
    if(patientAppointmentSlot.patientName != patientRecord.name){
        NumberOfOutOfSyncRecords ++;
        console.log("Associated record incorrect");
        return;
    }
    return;
}