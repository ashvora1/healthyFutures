/**
 * Indexed DB data storage, access to records by entity type and id Functionalities provided: asynchronous API based on
 * jQuery Deferred and Promises
 */
( function( ) {

	emis.mobile.IDBStorage = function( ) {

	};

	// private static key
	var _encryptionKey = null;
	var db = null;
	var COLLECTION = "keyvalues";
	var ids;
	var counter;
	var that = this;
	var doc;

	emis.mobile.IDBStorage.prototype.open = function( ) {
		var deferred = $.Deferred( );
		if ( emis.mobile.UI.isIE10 || emis.mobile.UI.isAtLeastIE11 || emis.mobile.UI.isFirefox ) {
			window.indexedDB = window.indexedDB || window.mozIndexedDB || window.webkitIndexedDB || window.msIndexedDB;
			window.IDBTransaction = window.IDBTransaction || window.webkitIDBTransaction || window.msIDBTransaction;
			window.IDBKeyRange = window.IDBKeyRange || window.webkitIDBKeyRange || window.msIDBKeyRange;
		} else {
			window.indexedDB = window.shimIndexedDB;
			if (window.shimIndexedDB && window.shimIndexedDB.__useShim){
				window.shimIndexedDB.__useShim( );
			}
		}
		if (indexedDB) {
			var request = indexedDB.open( "EmisMobile" );
			request.onerror = function( event ) {
				emis.mobile.console.log( "error on open:" + event );
				deferred.reject( );
			};
			request.onsuccess = function( event ) {
				db = request.result;
				deferred.resolve( db );
			};

			request.onupgradeneeded = function( event ) {
				var db = event.target.result;

				// TODO add more if needed
				var objectStore = db.createObjectStore( COLLECTION, {
					keyPath: "key"
				} );
			};
		}
		return deferred.promise( );
	};

	function getObjectStore( accessMode ) {
		if (db) {
			var transaction = db.transaction( [COLLECTION], accessMode );
			var objectStore = transaction.objectStore( COLLECTION );
			return objectStore;
		}
		return null ;
	}

	/**
	 * @param entitytype
	 * @param id
	 * @returns jquery promise object
	 */
	function getItem( entitytype, id ) {
		var deferred = $.Deferred( );
		var objectStore = getObjectStore( "readonly" );
		var request = objectStore.get( typeIdPairToKey( entitytype, id ) );
		attachResultValueHandlers( request, deferred );
		return deferred.promise( );
	}

	function setItem( entitytype, id, value ) {
		main.controller.indexedDBSetItemError = false;
		var deferred = $.Deferred( );
		var objectStore = getObjectStore( "readwrite" );
		var key = typeIdPairToKey( entitytype, id );
		var request = objectStore.put( {
			key: key,
			value: value
		} );

		request.onerror = function( event ) {
			emis.mobile.console.log( "error on adding!!" );
			deferred.reject( );
		};

		request.onsuccess = function( event ) {
			deferred.resolve( key );
		};
		return deferred.promise( );
	}

	function hasItem( entitytype, id ) {
		var deferred = $.Deferred( );

		var objectStore = getObjectStore( "readonly" );
		var key = typeIdPairToKey( entitytype, id );

		var request = objectStore.openCursor( key );
		request.onsuccess = function( e ) {
			var cursor = e.target.result;
			if ( cursor ) {
				// key already exist
				deferred.resolve( true );
			} else {
				// key not exist
				deferred.resolve( false );
			}
		};
		request.onerror = function( event ) {
			deferred.reject( );
		};

		return deferred.promise( );
	}

	function removeItem( entitytype, id ) {
		var deferred = $.Deferred( );
		var objectStore = getObjectStore( "readwrite" );

		var key = typeIdPairToKey( entitytype, id );
		// to clean up store
		// var request = objectStore.put({key:key,value:null});
		var request = objectStore.
		delete ( key );

		request.onerror = function( event ) {
			deferred.reject( );
		};
		request.onsuccess = function( event ) {
			deferred.resolve( );
		};

		deferred.resolve( );
		return deferred.promise( );
	}

	function attachResultValueHandlers( request, deferred ) {
		request.onerror = function( event ) {
			// TODO log error
			deferred.reject( );
		};
		request.onsuccess = function( event ) {
			deferred.resolve( request.result ? request.result.value : null );
		};
	}

	function typeIdPairToKey( entitytype, id ) {
		if ( ( id == "" ) || ( entitytype == "" ) )
			emis.mobile.console.log( "null value passed" );

		return entitytype + "_" + id;
	}

	function keyToTypeIdPair( key ) {
		// splits the key to entity type and
		return key.split( "_" );
	}

	/**
	 * @param entitytype
	 * @param id
	 */
	emis.mobile.IDBStorage.prototype.setEncryptionKey = function( key ) {
		_encryptionKey = key;
		// sjcl.cipher.aes(key);
	};

	/**
	 * @param entitytype
	 * @param id
	 * @param bencryption
	 * @returns find promise object
	 */
	function _find( entitytype, id, bencryption ) {
		var deferred = $.Deferred( );
		if ( ( id == "" ) || ( entitytype == "" ) )
			emis.mobile.console.log( "null value passed" );
		try {
			var getPromise = getItem( entitytype, id );

			getPromise.done( function( result ) {
				var localData = result;
				if ( localData == null ) {
					emis.mobile.console.log( "data not found" );
					deferred.resolve( null );
				} else {
					deferred.resolve( result );
				}
				;
			} ).fail( function( ) {
				deferred.reject( );
			} );
		} catch ( e ) {
			emis.mobile.console.log( e );
			deferred.reject( );
		}
		return deferred.promise( );
	}

	;

	/**
	 * @param entitytype
	 * @param id
	 * @returns find promise object
	 */
	emis.mobile.IDBStorage.prototype.find = function( entitytype, id ) {
		return _find( entitytype, id, true );
	};

	/**
	 * @param entitytype
	 * @param id
	 * @returns find promise object
	 */
	emis.mobile.IDBStorage.prototype.findWithoutEncryption = function( entitytype, id ) {
		return _find( entitytype, id, false );
	};

	function _save( entitytype, id, stringToStore, bencryption ) {
		var rowId = null;
		try {
			if ( ( entitytype != "" ) && ( stringToStore != "" ) && ( id != "" ) && ( id != null ) ) {
				if ( bencryption ) {

					stringToStore = new emis.mobile.Encryptor( ).encryptDoc( stringToStore, _encryptionKey, id );

				}
				return setItem( entitytype, id, stringToStore );
			} else {
				emis.mobile.console.log( "null value passed" );
			}
			;
		} catch ( e ) {
			emis.mobile.console.log( e );
		}
		return null;
	}

	;

	/**
	 * @param entitytype
	 * @param id
	 * @param stringToStore
	 * @returns setItem Promise
	 */
	emis.mobile.IDBStorage.prototype.save = function( entitytype, id, stringToStore ) {
		return _save( entitytype, id, stringToStore, true );
	};

	emis.mobile.IDBStorage.prototype.saveWithoutEncryption = function( entitytype, id, stringToStore ) {
		return _save( entitytype, id, stringToStore, false );
	};

	emis.mobile.IDBStorage.prototype.hasItem = function( entitytype, id ) {
		return hasItem( entitytype, id );
	};

	/**
	 * @param entitytype
	 * @param id
	 */
	emis.mobile.IDBStorage.prototype.remove = function( entitytype, id ) {
		try {
			return removeItem( entitytype, id );
		} catch ( e ) {
			emis.mobile.console.log( e );
		}
		;
	};

	/**
	 * @param entitytype
	 * @return {id:id, object:object}
	 */
	emis.mobile.IDBStorage.prototype.findAll = function( entitytype ) {
		var deferred = $.Deferred( );
		var dict = new Array( );

		var objectStore = getObjectStore( "readonly" );
		var cursor = objectStore.openCursor( );
		cursor.onsuccess = function( event ) {
			var cursor = event.target.result;
			if ( cursor ) {
				var key = cursor.key;
				var data = JSON.parse( "{}" );
				var pair = keyToTypeIdPair( key );

				if ( pair[0] == entitytype ) {
					var id = pair[1];
					var object = cursor.value;

					if ( ( object != null ) && ( id != null ) ) {
						data.id = id;
						data.object = object;
					}
					dict.push( data );
				}
				cursor.
				continue( );
			} else {
				deferred.resolve( dict );
			}
		};

		cursor.onerror = function( event ) {
			deferred.reject( );
		};
		return deferred.promise( );
	};

	emis.mobile.IDBStorage.prototype.parseJson = function( sjson ) {
		if ( sjson === "" )
			return null;
		return JSON.parse( sjson );
	};

	/**
	 * @param entitytype
	 * @return {}
	 */
	emis.mobile.IDBStorage.prototype.findAllIds = function( entitytype ) {
		try {
			var deferred = $.Deferred( );
			var idList = new Array( );

			var objectStore = getObjectStore( "readonly" );
			if (!objectStore) {
				return deferred.promise( ) ;
			}
			var cursor = objectStore.openCursor( );
			cursor.onsuccess = function( event ) {
				var cursor = event.target.result;
				if ( cursor ) {
					var key = cursor.key;
					var data = JSON.parse( "{}" );
					var pair = keyToTypeIdPair( key );

					if ( pair[0] == entitytype ) {
						var id = pair[1];

						if ( id != null ) {
							idList.push( id );
						}
					}
					cursor.
					continue( );
				} else {
					deferred.resolve( idList );
				}
			};

			cursor.onerror = function( event ) {
				deferred.reject( );
			};
			return deferred.promise( );
		} catch ( e ) {
			emis.mobile.console.log( e );
		}
		return null;
	};

	/**
	 * clear all data in local storage
	 */
	emis.mobile.IDBStorage.prototype.clearStorage = function( ) {
		entity = "DocAttachment";
		idbs = this;
		this.findAllIds( entity ).done( function( results ) {
			for ( var i in results ) {
				emis.mobile.console.log( results[i] );
				idbs.remove( entity, results[i] );
			}
		} );

	};

	emis.mobile.IDBStorage.prototype.decryptDoc = function( localData, id ) {
		return new emis.mobile.Encryptor( ).decryptDoc( localData, _encryptionKey, id );
	}
} )( );
