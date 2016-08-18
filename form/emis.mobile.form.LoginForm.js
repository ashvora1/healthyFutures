/**
 * Login form controller Functionalities provided:
 */
( function( ) {

	var _password;
	var _app;


	emis.mobile.form.LoginForm = function( appObject ) {
		var initiated = false;
		_app = appObject;
		var integ;

		this.bindDataAndEvents = function( formId ) {
			main.controller.Logged = false;
			window.location.hash = "";
			emis.mobile.console.log( 'LoginForm.bindDataAndEvents' );

			if ( !initiated ) {
				initiated = true;
				var that = this;
				_app.controller.startCheckingSession( );
			}

			if ( emis.mobile.nativeFrame.isNative ) {
				$( "#e-logo" ).hide( );
				$( "#loginContentNew" ).hide( );
				new emis.mobile.form.LoginForm( main ).login( main );
			} else {
				integ = window.setInterval( function( ) {
					emis.mobile.console.log( "STATUS: " + window.applicationCache.status );
					if ( window.applicationCache.status == window.applicationCache.IDLE || window.applicationCache.status == window.applicationCache.UPDATEREADY ) {
						window.clearInterval( integ );
						$( "#e-logo" ).hide( );
						$( "#loginContentNew" ).hide( );
						main.controller.dontSuppressUpdateQuestion = true;
						new emis.mobile.form.LoginForm( main ).login( main );
					} else {
						state = window.applicationCache.status;
						if ( ( state != window.applicationCache.CHECKING && offline ) || state == window.applicationCache.UNCACHED ) {
							// HERE is disabling
							var disableCacheChecking = false;
							if ( disableCacheChecking || emis.mobile.UI.isFirefox ) {
								emis.mobile.console.log("CACHE is DISABLED");
								window.clearInterval( integ );
								$( "#e-logo" ).hide( );
								$( "#loginContentNew" ).hide( );
								new emis.mobile.form.LoginForm( main ).login( main );
							} else {
								main.storage.setItem( "showManifestFailAlert", "version" );
								main.controller.gotoLoginPage() ;
							}
						}
					}
				}, 1000 );
			}
		};

		/**
		 * code for layout updates after orientation change
		 */
		function prepareDynamicFormLayout( ) {
			if ( emis.mobile.UI.isiPad ) {
				$( "#page1" ).css( "background-size", "contain" );
				window.addEventListener( "orientationchange", detectIPadOrientation );
				function detectIPadOrientation( ) {
					if ( orientation == 0 || orientation == 180 ) {
						// Portrait mode
						$( "#loginContent" ).css( {
							position: "absolute",
							"margin-top": "250px",
							left: "25%"
						} );
						$( "#emisLogo" ).css( {
							top: "20%",
							left: "7%"
						} );
					} else if ( orientation == 90 || orientation == -90 ) {
						$( "#loginContent" ).css( {
							position: "absolute",
							"margin-top": "250px",
							left: "29%"
						} );
						$( "#emisLogo" ).css( {
							top: "27%",
							left: "15%"
						} );

					}
				}


				$( "#emisLogo" ).css( "display", "inline" );
				detectIPadOrientation( );
			} else if ( emis.mobile.UI.isAndroid ) {
				$( document ).ready( function( ) {
					var windowBars = window.screen.availHeight - window.innerHeight;
					$( window ).resize( function( ) {
						$( '#page1' ).css( 'min-height', ( window.screen.availHeight - windowBars ) + "px" );
					} );
				} );
				window.addEventListener( "orientationchange", detectAndroidOrientation );
				function detectAndroidOrientation( ) {
					$( document ).ready( function( ) {
						$( window ).resize( function( ) {
							$( '#loginContent' ).css( {
								position: 'absolute',
								left: ( $( window ).width( ) - $( '#loginContent' ).outerWidth( ) ) / 2,
								"margin-top": "300px"
							} );
						} );
						$( window ).resize( );
					} );
				}

				detectAndroidOrientation( );
			} else {
				$( document ).ready( function( ) {
					$( window ).resize( function( ) {
						$( '#page1' ).css( 'min-height', window.innerHeight + "px" );
					} );
					$( window ).resize( function( ) {
						$( '#loginContent' ).css( {
							position: 'absolute',
							left: ( $( window ).width( ) - $( '#loginContent' ).outerWidth( ) ) / 2,
							"margin-top": "300px"
						} );
					} );
					$( window ).resize( );
				} );
			}
		}

		prepareDynamicFormLayout( );

		// prepare screen fade in
		$( document ).ready( function( ) {
			setTimeout( function( ) {
				$( '#page1' ).fadeIn( 1000 );
			}, 500 );
		} );

	}

	emis.mobile.form.LoginForm.prototype.verifyFields = function( username, password, cdb ) {
		if ( username.length == 0 )
			return false;
		// even for our login process it has to be at least 2
		if ( password.length < 2 )
			return false;
		if ( cdb.length == 0 )
			return false;
		return true;
	}

	emis.mobile.form.LoginForm.prototype.login = function( appObject ) {
		main.storage.removeItem( "logging" );
		this.loginObj = new emis.mobile.LoginModel( );
		this.loginObj.delegate = this;

		this.username = main.storage.getItem( "versioningUsername" );
		main.storage.removeItem( "versioningUsername" );
		_password = main.storage.getItem( "versioningPass" );
		main.storage.removeItem( "versioningPass" );
		this.offlinePass = main.storage.getItem( "versioningOffPass" );
		main.storage.removeItem( "versioningOffPass" );
		this.cdb = main.storage.getItem( "versioningCDB" );
		main.storage.removeItem( "versioningCDB" );

		if ( emis.mobile.nativeFrame.isNative ) {
			this.username = main.storage.getItem( "User_UserName" );
			this.cdb = main.storage.getItem( "User_CDB" );

			_password = "";
			this.offlinePass = "";
		}

		var result = false;
		var bOfflineMode = main.storage.getItem( "loginOffline" );
		if ( bOfflineMode == true || bOfflineMode == "true" ) {
			//native frame will never go this path
			var usm = new emis.mobile.UserSessionModel( );
			main.controller.SessionId = "SESSION_ID_OFFLINE";
			main.controller.onlineLogged = false;
			result = this.loginObj.offlineLogin( this.username, _password, this.offlinePass, this.cdb );
		} else {
			LoginResponse = main.dataProvider.getSessionData() ;
			if ( LoginResponse )
				if ( LoginResponse.Payload ) {
					main.storage.setItem( "lastUserId", LoginResponse.Payload.UserInRoleId );
				}
			_app.controller.setUserSession( this.username, this.cdb );
			if ( emis.mobile.nativeFrame.isNative ) {
				this.loginObj.nativeLogin( this.username, LoginResponse );
			} else {
				if ( _password ) {
					this.loginObj.onlineLogin( this.username, _password, this.offlinePass, this.cdb, LoginResponse );
				} else {
					main.controller.gotoLoginPage() ;
				}
			}
		}

		if ( result ) {
			if (main.storage.getItem("SyncStatus") !== null) {
				if ( parseInt( main.storage.getItem( "SyncStatus" ) ) === 1 ) {
					_app.dataProvider.makeAllTasksNotSynchronised( );
					_app.dataProvider.makeAllCompletedEventsetsNotSynchronised( );
					_app.dataProvider.makeAllNewDrugsNotSynchronised( );
					_app.dataProvider.makeAllQuickNotesNotSynchronised( );
					_app.dataProvider.makeAllSchedulesNotSynchronised( );
					main.storage.removeItem( "SyncStatus" );
				}
			}
			_app.controller.setUserSession( this.username, this.cdb );
			main.controller.ServerVersion = main.dataProvider.getSessionData().Payload.ServerVersion;
			$.mobile.changePage( "#appointments" );
		}
	}

	emis.mobile.form.LoginForm.prototype.onlineLoginSuccess = function( LoginResponse ) {
		main.controller.SessionId = LoginResponse.Payload.SessionId;
		main.controller.CanPrescribe = LoginResponse.Payload.CanPrescribe;
		main.controller.ServerVersion = LoginResponse.Payload.ServerVersion;
		main.controller.UserInRoleId = LoginResponse.Payload.UserInRoleId;
		if (main.storage.getItem("SyncStatus") !== null ) {
			if ( parseInt( main.storage.getItem( "SyncStatus" ) ) === 1 ) {
				_app.dataProvider.makeAllTasksNotSynchronised( );
				_app.dataProvider.makeAllCompletedEventsetsNotSynchronised( );
				_app.dataProvider.makeAllNewDrugsNotSynchronised( );
				_app.dataProvider.makeAllQuickNotesNotSynchronised( );
				_app.dataProvider.makeAllSchedulesNotSynchronised( );
				main.storage.removeItem( "SyncStatus" );
			}
		}
		main.storage.setItem( "LastOnlineVersion", "0003" );
		main.controller.onlineLogged = true;
		$.mobile.changePage( "#appointments" );
	}

	emis.mobile.form.LoginForm.prototype.onlineLoginFailed = function( Error ) {
		if ( Error.code == 106 ) {
			emis.mobile.Utilities.alert( {message: Error.description, bDebug: true, backPage: main.controller.backPage} );
		} else {
			emis.mobile.Utilities.alert( {message: "" + Error.description, bDebug: true, backPage: main.controller.backPage} );
		}
	}
} )( );
