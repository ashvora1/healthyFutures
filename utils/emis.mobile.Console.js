/**
 * console log wrapper
 *
 */
emis.mobile.Console = function( ) {
	var that = this;
	var _console = window.console;
	this.DEBUG = 0;
	this.WARN = 1;
	this.ERROR = 2;
	this.NONE = 10;
	this.debugLevel = this.NONE;
	this.logText = "";
	this.enableLogging = false;

	function isDebugToOutput( level ) {
		return level >= that.debugLevel;
	}

	function formatMessage( message ) {
		var fmessage = message;
		try {
			if ( message && typeof message !== "string" ) {
				if ( message.getMessage ) {
					fmessage += message.getMessage( );
				} else if ( message.message ) {
					fmessage += message;
				}
				if ( message.getStackTrace ) {
					fmessage += "\n" + message.getStackTrace( );
				}
			}
		} catch ( e ) {
			// empty catch
		}
		var date = new Date( );
		//@formatter:off
		return date.getHours( )
		+ ":" + date.getMinutes( )
		+ ":" + ( date.getSeconds( ) < 10 ? "0" + date.getSeconds( ) : date.getSeconds( ) )
		+ " - " + fmessage;
		//@formatter:on
	}


	this.log = function( message ) {
		//if(this.enableLogging)
		//	this.logText = this.logText + message + "\n";
		if ( isDebugToOutput( that.DEBUG ) )
			_console.log( formatMessage( message ) );
	}

	this.warn = function( message ) {
		//if(this.enableLogging)
		//	this.logText = this.logText + message + "\n";
		if ( isDebugToOutput( that.WARN ) )
			_console.warn( formatMessage( message ) );
	}

	this.error = function( message ) {
		//if(this.enableLogging)
		//	this.logText = this.logText + message + "\n";
		if ( isDebugToOutput( that.ERROR ) ) {
			_console.error( formatMessage( message ) );
		}
	}

	this.setDebugLevel = function( level ) {
		that.debugLevel = level;
	}

	this.setWindowsLogger = function() {
		var windowsStorage = new emis.mobile.WindowsStorage () ;
		window.console = {
			log: function (str) {
				if ( windowsStorage ) {
					windowsStorage.log( str )
				}
			},
			warn: function (str) {
				if ( windowsStorage ) {
					windowsStorage.log( str )
				}
			},
			error: function (str) {
				if ( windowsStorage ) {
					windowsStorage.error( str )
				}
			}
		};
		_console = window.console;
		window.onerror = function (e) {
			if ( windowsStorage ) {
				windowsStorage.error( "window.onerror :: " + JSON.stringify(e) );
			}
		};
	}
};
