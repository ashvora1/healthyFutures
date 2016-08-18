/**
 * Task data model Functionalities provided: save task data
 */
var ENTITY_DRUG = "Drug";
var ENTITY_NEW_DRUG = "NewDrug";
// not synchronised New Drug
var ENTITY_NS_NEW_DRUG = "NotSyncedNewDrug";

emis.mobile.DrugModel = function( ) {
	this.storage = new emis.mobile.Storage( );
}

emis.mobile.DrugModel.prototype.save = function( id, jsonData ) {
	this.storage.saveWithoutEncryption( ENTITY_DRUG, id, JSON.stringify( jsonData ) );
}
emis.mobile.DrugModel.prototype.getById = function( id ) {
	var data = this.storage.findWithoutEncryption( ENTITY_DRUG, id );
	return JSON.parse( data );
}

emis.mobile.DrugModel.prototype.getAll = function( ) {
	var data = this.storage.findAllWithoutEncryption( ENTITY_DRUG );
	return data;
}

emis.mobile.NewDrugModel = function( ) {
	this.storage = new emis.mobile.Storage( );
}

emis.mobile.NewDrugModel.prototype.setNotSynchronised = function( newDrugLocalId ) {
	this.storage.save( ENTITY_NS_NEW_DRUG, newDrugLocalId, "1" );
}

emis.mobile.NewDrugModel.prototype.removeNotSynchronised = function( newDrugLocalId ) {
	this.storage.remove( ENTITY_NS_NEW_DRUG, newDrugLocalId, "1" );
}

emis.mobile.NewDrugModel.prototype.isNotSynchronised = function( newDrugLocalId ) {
	return this.storage.find( ENTITY_NS_NEW_DRUG, newDrugLocalId );
}

emis.mobile.NewDrugModel.prototype.insert = function( jsonData ) {
	// emis.mobile.NewDrugModel.prototype.insert = function( patientId, jsonData ) {
	// var newDrugId = patientId + "#" + new emis.mobile.Utilities().generateId();
	var newDrugId = main.controller.patient.id + "#" + new emis.mobile.Utilities( ).generateId( );
	if (jsonData) {
		jsonData.slotId = main.controller.slotId; //for backward compatibility saving slotId inside object
	}
	this.storage.save( ENTITY_NEW_DRUG, newDrugId, JSON.stringify( jsonData ) );
	return newDrugId;
}

emis.mobile.NewDrugModel.prototype.save = function( id, jsonData ) {
	this.storage.save( ENTITY_NEW_DRUG, id, JSON.stringify( jsonData ) );
}
emis.mobile.NewDrugModel.prototype.getById = function( id ) {
	var data = this.storage.find( ENTITY_NEW_DRUG, id );
	return JSON.parse( data );
}

emis.mobile.NewDrugModel.prototype.getInUploadFormat = function( id, slotId ) {
	var data;
	if ( slotId ) {
		data = this.getAllForPatient( id, slotId );
	} else {
		data = this.getAllWithoutSlotIdForPatient( id );
	}
	if ( ! data.length ) {
		return -1;
	}
	for ( i = 0; i < data.length; i++ ) {
		data[i] = data[i].object;
		if (data[i].slotId) {
			delete data[i].slotId;
		}
	}
	ret = new Object( );
	ret.sessionId = main.controller.SessionId;
	ret.payload = new Object( );
	ret.payload.items = data;
	return ret;
}

emis.mobile.NewDrugModel.prototype.getAll = function( ) {
	var data = this.storage.findAll( ENTITY_NEW_DRUG );
	data.sort( function( a, b ) {
		return parseInt( b.id.split( "#" )[1].split( "-" )[0] ) - parseInt( a.id.split( "#" )[1].split( "-" )[0] );
	} );
	return data;
}

emis.mobile.NewDrugModel.prototype.getAllForCurrentPatient = function( ) {
	var data = this.storage.findAll( ENTITY_NEW_DRUG );
	data2 = new Array( );
	currentPatientId = main.controller.patient.id;
	for ( i = 0; i < data.length; i++ ) {
		patientId = data[i].id.split( "#" )[0];
		if ( patientId == currentPatientId ) {
			data2.push( data[i] );
		}
	}
	data2.sort( function( a, b ) {
		return parseInt( b.id.split( "#" )[1].split( "-" )[0] ) - parseInt( a.id.split( "#" )[1].split( "-" )[0] );
	} );
	return data2;
}

emis.mobile.NewDrugModel.prototype.getAllForPatient = function( patientId, slotId ) {
	var data = this.storage.findAll( ENTITY_NEW_DRUG );
	data2 = new Array( );
	for ( i = 0; i < data.length; i++ ) {
		idToCheck = data[i].id.split( "#" )[0];
		if ( patientId == idToCheck &&
				( ! slotId ||
					( slotId && data[i].object.slotId && data[i].object.slotId == slotId ))) {
			data2.push( data[i] );
		}
	}
	return data2;
}

emis.mobile.NewDrugModel.prototype.getAllSlotIdsForPatients = function( ) {
	var data = this.storage.findAll( ENTITY_NEW_DRUG );
	var data2 = new Array( );
	for ( i = 0; i < data.length; i++ ) {
		var patientId = data[i].id.split( "#" )[0];
		if ( ! data2[patientId] ) {
			data2[patientId] = [];
		}
		if ( data[i].object.slotId && data2[patientId].indexOf(data[i].object.slotId) == -1 ) {
			data2[patientId].push( data[i].object.slotId );
		}
	}
	return data2;
}

emis.mobile.NewDrugModel.prototype.getAllWithoutSlotIdForPatient = function( patientId ) {
	var data = this.storage.findAll( ENTITY_NEW_DRUG );
	data2 = new Array( );
	for ( i = 0; i < data.length; i++ ) {
		idToCheck = data[i].id.split( "#" )[0];
		if ( patientId == idToCheck && ! data[i].object.slotId ) {
			data2.push( data[i] );
		}
	}
	return data2;
}

emis.mobile.NewDrugModel.prototype.getAllIdsForPatient = function( patientId, slotId ) {
	var all = this.getAllForPatient(patientId) ;
	var allIds = [] ;
	for (var i = 0; i < all.length; i++) {
		if ( ! slotId || ( slotId && all[i].object.slotId == slotId ) ) {
			allIds.push(all[i].id) ;
		}
	}
	return allIds ;
} ;

emis.mobile.NewDrugModel.prototype.getAllIdsWithoutSlotIdForPatient = function( patientId ) {
	var all = this.getAllForPatient(patientId) ;
	var allIds = [] ;
	for (var i = 0; i < all.length; i++) {
		if ( ! all[i].object.slotId ) {
			allIds.push(all[i].id) ;
		}
	}
	return allIds ;
} ;

emis.mobile.NewDrugModel.prototype.findAllIds = function( ) {
	var data = this.storage.findAllIds( ENTITY_NEW_DRUG );
	return data;
}

emis.mobile.NewDrugModel.prototype.findAllPatientIds = function( ) {
	var newDrugIds = new Array( );
	try {
		var allNewDrugs = this.getAll( );
		for ( var i = 0; i < allNewDrugs.length; i++ ) {
			currentId = allNewDrugs[i].id.split( "#" )[0];
			if ( newDrugIds.indexOf( currentId ) == -1 )
				newDrugIds.push( currentId );
		}
		return newDrugIds;
	} catch ( e ) {
		emis.mobile.console.log( e );
		return null;
	}
}

emis.mobile.NewDrugModel.prototype.remove = function( id ) {
	this.storage.remove( ENTITY_NEW_DRUG, id );
}
