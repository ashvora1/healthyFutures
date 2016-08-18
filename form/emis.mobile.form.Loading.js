/*
 * Loading dialog, to be used in the future
 */
emis.mobile.form.Loading = function( appObject ) {
	var _app = appObject;
	var that = this;
	var lastPage;
	var cancelDownloadButton;
	var wasCancelClicked;

	// put documents downloading logic here
	this.bindDataAndEvents = function( $page ) {
		lastPage = $page;
		unbindEvents( );

		wasCancelClicked = false;
		cancelDownloadButton = $( document.getElementById( 'cancelDownload' ) );
		cancelDownloadButton.removeClass( "ui-disabled" );
		cancelDownloadButton.off( 'click' ).on( 'click', function( ) {
			if ( $( this ).hasClass( "ui-disabled" ) ) {
				return false;
			} else {
				wasCancelClicked = true;
				xmlhttpObject.abort( );
				$.mobile.changePage( "#patientdocuments" );
			}
		} );

		var getAttachmentObj = {};
		getAttachmentObj.patientId = main.controller.patient.id;
		getAttachmentObj.slotId = main.controller.slotId;
		getAttachmentObj.attachmentId = main.controller.attachmentId;
		getAttachmentObj.fileType = main.controller.attachmentFileType;
		if ( main.controller.attachmentSharingOrganisationId ) {
			getAttachmentObj.sharingOrganisationId = main.controller.attachmentSharingOrganisationId;
		}

		var getAttachmentAPI = new emis.mobile.GetAttachmentAPI( );
		getAttachmentAPI.delegate = that;
		var requestAttachmentObj = {};
		requestAttachmentObj.sessionId = main.dataProvider.getUserSessionId( );
		requestAttachmentObj.Payload = {};
		requestAttachmentObj.Payload.getAttachment = getAttachmentObj;

		var xmlhttpObject = getAttachmentAPI.getAttachment( requestAttachmentObj );

		$page.on( 'pageshow', pageShow );
	};

	var unbindEvents = function( ) {
		lastPage.off( 'pageshow', pageShow );
		emis.mobile.UI.removeOrientationEventsForDialog( orientationChange );
		$( "#patientdocuments" ).css( {
			"overflow": "visible",
			"max-height": "none"
		} );
	};

	var pageShow = function( ) {
		orientationChange( );
	};

	var orientationChange = function( ) {
		var newHeight = emis.mobile.UI.calculateDialogPadding( _app, lastPage );
		$( "#patientdocuments" ).css( {
			"min-height": newHeight,
			"max-height": newHeight,
			"overflow": "hidden"
		} );
		if ( lastPage ) {
			lastPage.css( {
				"padding-bottom": "",
				"height": ""
			});
		}
	};

	this.getSessionAndAskForOTK = function( ) {
		nonSyncManager = new emis.mobile.NonSyncWSManager( );
		nonSyncManager.delegate = that;
		nonSyncManager.getSession( );
	}

	this.nonSyncWSManagerSuccess = function( options ) {
		if ( options == "sessionOnly" ) {
			this.askForOTK( );
		} else {
			// should never be called - JI
			$.mobile.changePage( "#patientdocuments" );
		}
	}

	this.askForOTK = function( ) {
		unbindEvents( );
		if(CALL_OTK_INSTEAD) {
			main.controller.askForOTK = true;
		} else {
			main.controller.askForAuth = true;
		}
		$.mobile.changePage( "#patientdocuments" );
	};

	this.Complete = function( AttachmentResponse ) {
		cancelDownloadButton.addClass( "ui-disabled" );
		var sentId = AttachmentResponse.Payload.id;
		if ( main.controller.showDocLogs ) {
			main.storage.setItem( "docSize_" + sentId, AttachmentResponse.Payload.content.length );
		}
		var htmlContent = CryptoJS.enc.Base64.parse( AttachmentResponse.Payload.content ).toString( CryptoJS.enc.Utf8 );
		unbindEvents( );
		var pageToChangeTo = "#patientdocuments";
		if ( main.controller.useLocalStorageForDocs ) {
			var storage = new emis.mobile.Storage( );
			storage.save( "DocAttachment", sentId, AttachmentResponse.Payload.content );
			if ( main.storage.getItem( "DocAttachment_" + sentId ) == null ) {
				emis.mobile.Utilities.alert( {message: "Upload failed due to insufficient storage space.", backPage: pageToChangeTo} );
			}
			$.mobile.changePage( pageToChangeTo );
		} else {
			main.controller.docTime = new Date( ).getTime( );
			main.dataProvider.saveAttachment( sentId, htmlContent, function( ) {
				var diff = ( new Date( ).getTime( ) ) - main.controller.docTime;
				if ( main.controller.showDocLogs ) {
					main.storage.setItem( "insertingTime_" + sentId, diff );
				}
				$.mobile.changePage( pageToChangeTo );
			} );
		}

		//fix for dissapearing top bar after downloading document on iPad
		(function(){
			var oldVal = $("#headerPatient").css("z-index")
			$("#headerPatient").css("z-index", -1);
			$("#headerPatient").css("z-index", oldVal);
		})()
	};

	this.APIFailed = function( Error ) {
		var pageToChangeTo = "#patientdocuments";
		if ( wasCancelClicked ) {
			wasCancelClicked = false;
		} else {
			// $("#loadingSpinner").hide();
			cancelDownloadButton.addClass( "ui-disabled" );
			if ( Error.description ) {
				emis.mobile.Utilities.alert( {message: Error.description, title: "Error", backPage: pageToChangeTo} );
			} else {
				emis.mobile.Utilities.alert( {message: "Operation could not be completed.\nPlease check your internet connection or try again later.", title: "Error", backPage: pageToChangeTo} );
			}
		}
		$.mobile.changePage( pageToChangeTo );
	};

	return this;
};
