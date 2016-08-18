( function( ) {
	var _password;
	var that;
	var status;

	emis.mobile.NonSyncWSManager = function( ) {
		that = this;
		status = "unknown";
		return this;
	};

	emis.mobile.NonSyncWSManager.prototype.setPassword = function( pass ) {
		_password = pass;
	}

	emis.mobile.NonSyncWSManager.prototype.getSessionAndOTK = function( ) {
		status = "getSessionAndOTK";
		this.UserSession = new emis.mobile.UserSessionAPI( );
		this.UserSession.delegate = this;
		// to do
	}

	emis.mobile.NonSyncWSManager.prototype.getSession = function( ) {
		status = "getSession";
		this.UserSession = new emis.mobile.UserSessionAPI( );
		this.UserSession.delegate = this;
		this.UserSession.getSession( main.controller.user.login, _password, main.controller.user.cdb );
	}

	emis.mobile.NonSyncWSManager.prototype.verifyOTK = function( ) {
		status = "verifyOTK";
		this.UserSession = new emis.mobile.UserSessionAPI( );
		this.UserSession.delegate = this;
		this.UserSession.verifyKey( main.dataProvider.getUserSessionId( ), main.controller.user.accessToken );
	}

	emis.mobile.NonSyncWSManager.prototype.authenticate = function(){
		var code = TOTP.generateCode(main.storage.find("SS",main.controller.user.login+"#"+main.controller.user.cdb),
			new Date());
		that.codeAuthenticator = new emis.mobile.VerifyAuthenticationCodeAPI();
		that.codeAuthenticator.delegate = that;
		that.codeAuthenticator.verifyAuthenticationCode(main.storage.find("PersistentId",main.controller.user.login+"#"+main.controller.user.cdb),code,main.controller.user.login,main.controller.user.cdb);
	}

	emis.mobile.NonSyncWSManager.prototype.sessionSynchronized = function( SessionResponse ) {
		if ( SessionResponse )
			if ( SessionResponse.Payload )
				if ( SessionResponse.Payload.ServerVersion )
					main.controller.ServerVersion = SessionResponse.Payload.ServerVersion;

		if ( status == "getSession" || status == "getSessionAndOTK" || status == "getSessionAndAuth") {
			if ( SessionResponse.Payload && SessionResponse.InteractionId ) {
				main.controller.SessionId = SessionResponse.Payload.SessionId;
				main.controller.onlineLogged = true;
				main.dataProvider.setSessionData(JSON.stringify(SessionResponse));
				if ( status == "getSessionAndOTK") {
					status = "verifyOTK";
					this.verifyOTK( );
				} else if(status == "getSessionAndAuth"){
					status = "verifyAuth";
					this.authenticate();
				} else {
					status = "unknown";
					this.delegate.nonSyncWSManagerSuccess( "sessionOnly" );
				}
			} else {
				emis.mobile.Utilities.alert( {message: "Operation could not be completed.\nPlease check your internet connection or try again later.", title: "Error", bDebug: true, backPage: main.controller.backPage} );
			}
		} else if ( status == "verifyOTK" ) {
			if ( SessionResponse.Payload && SessionResponse.Payload.InteractionId ) {
				status = "unknown";
				this.delegate.nonSyncWSManagerSuccess( "otk" );
			} else {
				emis.mobile.Utilities.alert( {message: "Operation could not be completed.\nPlease check your internet connection or try again later.", title: "Error", bDebug: true, backPage: main.controller.backPage} );
			}
		}
	}

	emis.mobile.NonSyncWSManager.prototype.ParseVerifyAuthenticationCodeResponse = function(response) {
		if(response.Payload== true || response.Payload == "True" || response.Payload == "true") {
			status = "unknown";
			this.delegate.nonSyncWSManagerSuccess( "auth" );
		} else {
			emis.mobile.Utilities.alert( {message: "Authentication has failed.<br>The clock settings on your device may be incorrect. Update the clock settings to continue.", title: "Error",backPage: main.controller.backPage,bAlert: false,ok: "Close"} );
		}
	}

	emis.mobile.NonSyncWSManager.prototype.APIFailed = function( Error ) {
		new emis.mobile.IncidentLogger( ).SyncIncidentLog( Error.description );
		// To
		// log any Synchronization failure
		// Failure delegate to be implemented in the classes, where Synchronizer
		// object is created
		emis.mobile.console.log( "Error:" + Error.description );
		if ( Error.description && Error.description != SERVER_ERROR_DESCRIPTION ) {
			emis.mobile.Utilities.alert( {message: Error.description, title: "Error", bDebug: true, backPage: main.controller.backPage} );
		} else {
			emis.mobile.Utilities.alert( {message: "Operation could not be completed.\nPlease check your internet connection or try again later.", title: "Error", bDebug: true, backPage: main.controller.backPage} );
		}
	}
} )( );