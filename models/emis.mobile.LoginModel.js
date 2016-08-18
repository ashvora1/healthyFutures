/**
 * Model Class to exchange the login details Functionalities provided: Provide the online login Provide the offline
 * login
 */
( function( ) {

	var _password;
	var _sessionResponse;

	emis.mobile.LoginModel = function( ) {

	}
 
	emis.mobile.LoginModel.prototype.nativeLogin = function( username, response ) {
 
		this.username = username;
		_password = "";
		this.offlinePass = "";
		this.cdb = "";
		sessionResponse = response;
		this.sessionSynchronized( );
 
	}

	emis.mobile.LoginModel.prototype.onlineLogin = function( username, password, offlinePass, cdb, response ) {

		this.username = username;
		_password = password;
		this.offlinePass = offlinePass;
		this.cdb = cdb;
		sessionResponse = response;
		this.sessionSynchronized( );

	}

	emis.mobile.LoginModel.prototype.offlineLogin = function( username, password, offlinePass, cdb ) {

		var lastUser = new emis.mobile.UserSessionModel( );
		if ( username == lastUser.getUserName( ) && offlinePass == lastUser.getOfflinePassword( ) && cdb == lastUser.getCDB( ) ) {

			var storage = new emis.mobile.Storage( );
			storage.setEncryptionKey( new emis.mobile.Encryptor( ).prepareKey( password ) );
			new emis.mobile.IDBStorage( ).setEncryptionKey( new emis.mobile.Encryptor( ).prepareKey( password ) );

			var syncFormCtrl = main.controller.getFormControllerStruct("#syncLoading");
			syncFormCtrl.controller.setPassword( password );
			var nsm = new emis.mobile.NonSyncWSManager( );
			nsm.setPassword( password );
			error = this.checkDate( storage );
			if ( error > 0 ) {
				return false;
			}
			return true;

		} else {
			return false;
		}
	}

	emis.mobile.LoginModel.prototype.isPreviousUser = function( username, cdb ) {

		var lastUser = new emis.mobile.UserSessionModel( );
		if ( username === lastUser.getUserName( ) && cdb === lastUser.getCDB( ) ) {
			return true;
		} else {
			return false;
		}
	}

	emis.mobile.LoginModel.prototype.sessionSynchronized = function( ) {

		var storage = new emis.mobile.Storage( );
		storage.setEncryptionKey( new emis.mobile.Encryptor( ).prepareKey( _password ) );
		new emis.mobile.IDBStorage( ).setEncryptionKey( new emis.mobile.Encryptor( ).prepareKey( _password ) );

		if ( sessionResponse.Payload && sessionResponse.InteractionId ) {
			var nsm = new emis.mobile.NonSyncWSManager( );
			nsm.setPassword( _password );
			this.delegate.onlineLoginSuccess.call( this.delegate, sessionResponse );
		} else {

			// wrongLogins - if we got 3 we are doing some wiping
			var wrongLogins = 0;
			wrongLoginsAmount = storage.findWithoutEncryption( "WrongOnlineLoginsInRow", "0" );
			if ( wrongLoginsAmount ) {
				wrongLoginsAmountObj = JSON.parse( wrongLoginsAmount );
				wrongLogins = wrongLoginsAmountObj.amount;
			}
			wrongLogins++;

			if ( wrongLogins > 2 ) {
				var dw = new emis.mobile.DataWipe( );
				dw.wipeData( );
			}
			storage.saveWithoutEncryption( "WrongOnlineLoginsInRow", "0", "{\"amount\":\"" + wrongLogins + "\"}" );
			storage.saveWithoutEncryption( "WrongOfflineLoginsInRow", "0", "{\"amount\":\"" + wrongLogins + "\"}" );

			if ( DEMO_AUTO_LOGIN ) {
				this.delegate.onlineLoginFailed.call( this.delegate, new emis.mobile.ErrorModel( INVALID_RESPONSE_CODE, sessionResponse.Payload.Display + " (Error code: " + sessionResponse.Payload.EventCode + ")" ) );
			} else {
				this.delegate.onlineLoginFailed.call( this.delegate, new emis.mobile.ErrorModel( INVALID_RESPONSE_CODE, sessionResponse.Payload.Display ) );
			}
		}
	}

	emis.mobile.LoginModel.prototype.APIFailed = function( error ) {
		emis.mobile.console.log( "login failed due to " + error.description );
		this.delegate.onlineLoginFailed.call( this.delegate, error );
		// to be
		// implemented in the class invoking the method 'OnlineLogin'
	}

	emis.mobile.LoginModel.prototype.checkDate = function( storage ) {
		var lastLoginDateObj = storage.find( "LastLoginDate", "0" );
		if ( lastLoginDateObj == null ) {
			if ( offline )
				return 1;
			// important line - detects last char error in password
			storage.save( "LastLoginDate", "0", "{\"date\":\"" + new Date( ) + "\"}" );
		} else {
			var lastLoginDateString;
			try {
				lastLoginDateString = JSON.parse( lastLoginDateObj ).date;
			} catch ( err ) {
				// error
				return 1;
			}

			var lastLoginDate = new Date( lastLoginDateString );
			var diff = Math.abs( new Date( ) - lastLoginDate );
			// 259200000 (3 days)
			if ( diff > 3 * 24 * 3600 * 1000 ) {
				storage.clearStorage( );
			}
			storage.save( "LastLoginDate", "0", "{\"date\":\"" + new Date( ) + "\"}" );
		}
		return 0;
	}
} )( );
