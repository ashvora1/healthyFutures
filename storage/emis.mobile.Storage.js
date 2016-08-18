/**
 * All local data storage, access to records by entity type and id Functionalities provided: Create interfaces for
 * common operations insert,update - as one save function find remove search findAll findAllIds removeAll clearStorage
 */
(function() {
	var _instance, ms, ls, encryptor = null;

	// private static key
	var _encryptionKey = null ;

	emis.mobile.LocalStorage = window.localStorage ;

	emis.mobile.MemoryStorage = function () {
		var data = {} ;
		this.setItem = function (key, value) {
			return data[key] = value ;
		} ;
		this.getItem = function (key) {
			var val = data[key];
			// needs to explicitly convert to null because it can break sometimes,
			// i.e. JSON.parse( undefined ) breaks but JSON.parse( null ) doesn't
			return val === undefined ? null : val;
		} ;
		this.removeItem = function (key) {
			return delete data[key] ;
		} ;
		this.clear = function () {
			return data = {} ;
		} ;
		this.addData = function (newData) {
			return data = Object.extend(data, newData) ;
		} ;
		this.getAll = function() {
			return data;
		}
	} ;

	// encryptor that does nothing
	var DummyEncryptor = function () {
		this.encrypt = function (text) {
			return text ;
		} ;
		this.decrypt = function (text) {
			return text ;
		} ;
	} ;

	// storage that does nothing
	emis.mobile.DummyStorage = function () {
		this.getItem = function (key) {} ;
		/*
		 * this.getGlobalItem = function (key) {} ;
		 * we don't need it because we'll get everthing from getCache, and later we'll use memoryStorage
		 */
		this.setItem = function (key, value) {} ;
		this.setGlobalItem = function (key, value) {} ;
		this.removeItem = function (key) {} ;
		this.removeGlobalItem = function (key) {} ;
		this.clear = function () {} ;
		this.getCache = function (callback) {};
		this.getDocument = function(callback) {};
		this.saveDocument = function(callback) {};
	} ;

	// read and write to/from memory and local/native storage
	// if key is in memory read it from there
	emis.mobile.Storage = function( ) {
		if ( _instance ) {
			return _instance;
		}

		_instance = this;

		ms = new emis.mobile.MemoryStorage()  ;
		ls = new emis.mobile.DummyStorage() ;
		encryptor = new DummyEncryptor() ;

		// Permament Storage Logic
		if ( emis.mobile.nativeFrame.ios ) { // iOS frame storage
			ls = new emis.mobile.IOSStorage () ;
		} else if ( emis.mobile.nativeFrame.android ) { // Android frame storage
			ls = new emis.mobile.AndroidStorage () ;
		} else if ( emis.mobile.nativeFrame.windows ) { // Windows frame storage
			ls = new emis.mobile.WindowsStorage () ;
		} else if (window.localStorage) { // browser storage
			ls = emis.mobile.LocalStorage ;
			encryptor = new emis.mobile.Encryptor () ;
		}

		$(document).on( 'emis-native.session-updated', function( data ) {
			var response = data.response;
			if ( typeof response === "string" ) {
				response = JSON.parse( response );
			}
			main.controller.SessionId = response.Payload.SessionId;
			main.controller.onlineLogged = true;
			main.dataProvider.setSessionData( JSON.stringify( response ) );
		} );

	} ;


	emis.mobile.Storage.prototype.parseJson = function(sjson) {
		if (sjson === "") {
			return null;
		}
		if (typeof sjson === "string") {
			return JSON.parse(sjson);
		} else { // in case json is already parsed
			return sjson ;
		}
	} ;

	emis.mobile.Storage.prototype.stringify = function(object) {
		if (typeof object !== "string") {
			return JSON.stringify(object);
		} else { // in case object is already stringified
			return object ;
		}
	} ;

	emis.mobile.Storage.prototype.getCache = function(callback) {
		if ( emis.mobile.nativeFrame.isNative ) {
			var deferred = $.Deferred( );
			ls.getCache( deferred );
			deferred.promise( ).done(function (data){
				if ( data ) {
					if ( emis.mobile.nativeFrame.ios ) {
						if ( data['cachedItems'] ) {
							ms.addData( data['cachedItems'] );
						}

						// first save "old" value from getCache and ovveride with new values if exists
						for( key in data ) {
							if ( key == 'cachedItems' ) {
								continue;
							} else if ( key == 'GetSession_Response' ) {
								ms.setItem( key, JSON.stringify(data[key]) );
							} else {
								ms.setItem( key, data[key] );
							}
						}
					} else if ( emis.mobile.nativeFrame.android || emis.mobile.nativeFrame.windows ) {
						for ( obj in data ) {
							for( key in data[obj]) {
								if ( typeof data[obj][key] === "object") {
									ms.setItem( key, JSON.stringify( data[obj][key] ) );
								} else {
									ms.setItem( key, data[obj][key] );
								}
							}
						}
					}
				}
				callback(data) ;
			}) ;
		} else {
			ms.addData( this.getAll() );
			callback () ;
		}
	} ;

	// wrappers for localstorage, read and write also to memory
	emis.mobile.Storage.prototype.setItem = function(key, value, bEncrypted) {
		if (typeof value !== "string") {
			value = this.stringify(value) ;
		}
		ms.setItem(key, value) ;
		try {
			if ( emis.mobile.nativeFrame.isNative ) {
				return ls.setItem(key, value, bEncrypted);
			} else {
				return ls.setItem(key, value);
			}
		} catch(e) {
			if (e.name === 'QUOTA_EXCEEDED_ERR' || e.name === 'NS_ERROR_DOM_QUOTA_REACHED') {
				// TODO: alert user that limit has been reached
				emis.mobile.console.error(e);
			} else {
			}
			return false ;
		}
	} ;

	emis.mobile.Storage.prototype.setGlobalItem = function(key, value) {
		if (typeof value !== "string") {
			value = this.stringify(value) ;
		}
		ms.setItem(key, value) ;
		try {
			if ( emis.mobile.nativeFrame.isNative ) {
				return ls.setGlobalItem(key, value);
			} else {
				return ls.setItem(key, value);
			}
		} catch(e) {
			if (e.name === 'QUOTA_EXCEEDED_ERR' || e.name === 'NS_ERROR_DOM_QUOTA_REACHED') {
				// TODO: alert user that limit has been reached
				emis.mobile.console.error(e);
			} else {
			}
			return false ;
		}
	} ;

	emis.mobile.Storage.prototype.getItem = function(key, callback) {
		var val = ms.getItem(key) ;
		if (callback) {
			callback(val) ;
		}
		return val;
	} ;

	emis.mobile.Storage.prototype.removeItem = function(key) {
		ms.removeItem(key) ;
		return ls.removeItem(key);
	} ;

	emis.mobile.Storage.prototype.removeGlobalItem = function(key) {
		ms.removeItem(key) ;
		if ( emis.mobile.nativeFrame.isNative ) {
			return ls.removeGlobalItem(key);
		} else {
			// if it's localStorage
			return ls.removeItem(key);
		}
	} ;

	/**
	 * clear all data in local storage
	 */
	emis.mobile.Storage.prototype.clearStorage = function() {
		var dw = new emis.mobile.DataWipe();
		var ss = dw.saveByEntity("SS");
		var pids = dw.saveByEntity("PersistentId");
		var deviceData = dw.saveByEntity("Device");
		
		ms.clear();
		ls.clear( );

		var reloadValues = function() {
			dw.loadByIds(ss);
			dw.loadByIds(pids);
			dw.loadByIds(deviceData);
		};

		var RELOAD_DELAY = 1000;

		window.setTimeout(reloadValues, RELOAD_DELAY);
	}

	emis.mobile.Storage.prototype.getAll = function() {
		if ( emis.mobile.nativeFrame.isNative ) {
			return ms.getAll();
		} else {
			return ls;
		}
	} ;


	/**
	 * @param entitytype
	 * @param id
	 * @return object
	 */
	emis.mobile.Storage.prototype.setEncryptionKey = function(key) {
		_encryptionKey = key;
		if (key !== null) {
			jQuery(document).trigger('emis.encryptionready') ;
		}
	}

	emis.mobile.Storage.prototype.find = function(entitytype, id) {
		if ((id == "") || (entitytype == "")) {
			emis.mobile.console.log("null value passed: "+entitytype+', '+id);
		}
		try {
			var localData = this.getItem(entitytype + "_" + id);
			if (localData == null) {
				emis.mobile.console.log("data not found: "+entitytype + "_" + id);
				return localData;
			} else {
				if ( emis.mobile.nativeFrame.isNative ) {
					return localData;
				} else {
					return encryptor.decrypt(localData, _encryptionKey);
				}
			}
		} catch (e) {
			emis.mobile.console.error(e);
			return null;
		}

	}

	emis.mobile.Storage.prototype.findWithoutEncryption = function(entitytype, id) {
		if ((id == "") || (entitytype == "")) {
			emis.mobile.console.log("null value passed");
		}
		try {
			var localData = this.getItem(entitytype + "_" + id);
			if (localData == null) {
				emis.mobile.console.log("data not found: "+entitytype + "_" + id);
			}
			return localData;
		} catch (e) {
			emis.mobile.console.error(e);
			return null;
		}

	}
	/**
	 * @param entitytype
	 * @param search_in
	 * @param search_for
	 * @returns {Array}
	 */
	emis.mobile.Storage.prototype.search = function(entitytype, search_in, search_for) {
		var dict = [];
		try {
			var all = this.getAll() ;
			for (var key in all) {

				// splits the key to entity type and id
				var result = key.split("_");

				if (result[0] == entitytype) {
					var item = this.find(result[0], result[1]);
					if (item != null) {
						switch (search_in) {
							case "name":
								var object = this.parseJson(item);
								if (object && object.name == search_for) {
									dict.push(this.parseJson(item));
								}
								break;
							case "address":
								var n = this.parseJson(item).address.search(search_for);
								if (n != -1) {
									dict.push(this.parseJson(item));
								}
								break;
						}
					}
				}
			}
			//emis.mobile.console.log(dict);
			return dict;
		} catch (e) {
			//emis.mobile.console.error(e);
			return null;
		}
	}
	/**
	 * @param entitytype
	 * @param id
	 * @param stringToStore
	 */
	emis.mobile.Storage.prototype.save = function(entitytype, id, stringToStore) {
		var rowId = null;
		try {
			if ((entitytype != "") && (stringToStore != "") && (id != "") && (id != null)) {
				rowId = entitytype + "_" + id;
				this.setItem(rowId, encryptor.encrypt(stringToStore, _encryptionKey), true);
			} else {
				emis.mobile.console.log("null value passed");
			}
		} catch (e) {
			emis.mobile.console.error(e);
		}
		return rowId;
	}

	emis.mobile.Storage.prototype.saveWithoutEncryption = function(entitytype, id, stringToStore) {
		var rowId = null;
		try {
			if ((entitytype != "") && (stringToStore != "") && (id != "") && (id != null)) {
				rowId = entitytype + "_" + id;
				this.setItem(rowId, stringToStore, false);
			} else {
				emis.mobile.console.log("null value passed");
			}
		} catch (e) {
			emis.mobile.console.error(e);
		}
		return rowId;
	} ;


	/**
	 * @param entitytype
	 * @param id
	 */
	emis.mobile.Storage.prototype.remove = function(entitytype, id) {
		var key = entitytype + "_" + id;
		this.removeItem(key);
	}


	/**
	 * @param entitytype
	 * @return {id:id,object:object}
	 */
	emis.mobile.Storage.prototype.removeAll = function(entitytype) {
		try {
			var all = this.getAll() ;
			for (var key in all) {
				// split the key to entity type and id
				var result = key.split("_");
				if (result[0] == entitytype) {
					this.removeItem(key);
				}
			}
		} catch (e) {
			emis.mobile.console.error(e);
		}
	}
	/**
	 * @param entitytype
	 * @return {id:id, object:object}
	 */
	emis.mobile.Storage.prototype.findAll = function(entitytype) {
		var dict = [] ;

		var all = this.getAll() ;
		for (var key in all) {
			var data = {};
			// split the key to entity type and id
			var result = key.split("_");

			if (result[0] == entitytype) {
				var object = this.find(result[0], result[1]);
				var id = result[1];
				if ((object != null) && (id != null)) {
					data.id = id;
					data.object = this.parseJson(object);
				}
				dict.push(data);
			}
		}
		return dict;
	}

	emis.mobile.Storage.prototype.findAllWithoutEncryption = function(entitytype) {
		var dict = [] ;

		var all = this.getAll() ;
		for (var key in all) {
			var data = {};
			// split the key to entity type and id
			var result = key.split("_");

			if (result[0] == entitytype) {
				var object = this.findWithoutEncryption(result[0], result[1]);
				var id = result[1];
				if ((object != null) && (id != null)) {
					data.id = id;
					data.object = this.parseJson(object);
				}
				dict.push(data);
			}
		}
		return dict;
	}



	/**
	 * @param entitytype
	 * @return {}
	 */
	emis.mobile.Storage.prototype.findAllIds = function(entitytype) {
		try {
			var idList = new Array();
			var all = this.getAll () ;
			for (var key in all) {
				// split the key to entity type and id
				var result = key.split("_");
				if (result[0] == entitytype) {

					if (result[1] != null) {
						idList.push(result[1]);
					}
				}
			}
			return idList;
		} catch (e) {
			emis.mobile.console.error(e);
			return null;
		}
	}

	function typeIdPairToKey( entitytype, id ) {
		return entitytype + "_" + id;
	}

	function keyToTypeIdPair( key ) {
		return key.split( "_" );
	}

	emis.mobile.Storage.prototype.isDocumentPresent = function(entityType, id) {
		var deferred = $.Deferred( );
		ls.isDocumentPresent( typeIdPairToKey(entityType, id), deferred );
		return deferred.promise( );
	}

	emis.mobile.Storage.prototype.getDocument = function(entityType, id) {
		var deferred = $.Deferred( );
		ls.getDocument( typeIdPairToKey(entityType, id), deferred );
		return deferred.promise( );
	}

	emis.mobile.Storage.prototype.saveDocument = function(entityType, id, data) {
		var deferred = $.Deferred( );
		ls.saveDocument(typeIdPairToKey(entityType, id), data, deferred);
		return deferred.promise( );
	}

	emis.mobile.Storage.prototype.downloadDocument = function( attachmentId, patientId, slotId, fileType, sharingOrganisationId ) {
		var deferred = $.Deferred( );
		if ( ! sharingOrganisationId ) {
			sharingOrganisationId = '';
		}
		ls.downloadDocument( attachmentId, patientId, slotId, fileType, sharingOrganisationId, deferred );
		return deferred.promise( );
	}

	emis.mobile.Storage.prototype.openDocument = function( attachmentId, patientName, date, size, type, associatedText, source, slotId ) {
		var deferred = $.Deferred( );
		ls.openDocument(attachmentId, patientName, date, size, type, associatedText, source, deferred, slotId);
		return deferred.promise( );
	}

	emis.mobile.Storage.prototype.removeDocument = function(entityType, id) {
		var deferred = $.Deferred( )
		ls.removeItem(typeIdPairToKey(entityType, id), deferred);
		return deferred.promise( );
	}

	emis.mobile.Storage.prototype.decryptDoc = function(localData, id) {
		return new emis.mobile.Encryptor().decryptDoc(localData, _encryptionKey, id);
	}

	emis.mobile.Storage.prototype.goToLoginPage = function() {
		ls.goToLoginPage();
	}

	emis.mobile.Storage.prototype.setNativeSessionResponse = function( response ) {
		ms.setItem("GetSession_Response", response) ;
		if ( emis.mobile.nativeFrame.android ) {
			ls.setSessionResponse( response );
		} else {
			ls.setSessionResponse( JSON.parse( response ) );
		}
	}
})();