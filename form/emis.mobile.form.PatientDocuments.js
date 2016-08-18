/**
 * Patient Documents form controller Functionalities provided: - view patient's documentation - support all DocMan's
 * formats
 */

emis.mobile.form.PatientDocuments = function( appObject ) {
	var that = this;
	var _app = appObject;
	var windowEventsInitalised = false;
	var documents, $loadingSpinner, lastDocId, lastDoc, lastAttachmentId, doc;
	var pageid = 'patientdocuments';

	function getSectionNoData( sectionTitle ) {
		return '<div class="contentPanel"><div class="header no-data">' + sectionTitle + ' (None)</div></div>';
	}

	function f( v, suffix ) {
		if ( v )
			return suffix ? v + suffix : v;
		return '';
	}

	function updateOfflineElements( ) {
		if ( !offline ) {
			$( "#patientDocumentsContent .downloadDoc" ).removeClass( "ui-disabled" );
		} else {
			$( "#patientDocumentsContent .downloadDoc" ).addClass( "ui-disabled" );
		}
	}


	this.bindDataAndEvents = function( $page, refresh ) {
		main.controller.docList = that;
		emis.mobile.UI.preparePatientPage( $page );
		emis.mobile.UI.injectSelectMenu( $page.selector );

		// get data
		documents = _app.dataProvider.getPatientDocumentation( );
		// Prepare the markup
		var markup = '';
		if ( documents ) {
			markup = fillSectionListview( markup, documents );
			// Inject the markup
			$( "#patientDocumentsContent" ).html( markup );

			bindEventsToButtons( );
		}
		var spinnerMarkup = '<div class="ui-dialog-contain ui-corner-all ui-overlay-shadow" id="loadingSpinner">';
		spinnerMarkup += '<div data-role="content">';
		spinnerMarkup += '<h2> Downloading </h2>';
		spinnerMarkup += '<img src="./../images/loader.gif" alt="loading...">';
		spinnerMarkup += '</div></div>';
		$( '#patientdocuments .contentWrapper' ).append( spinnerMarkup );
		$loadingSpinner = $page.find( "#loadingSpinner" );

		updateOfflineElements( );
		if ( !windowEventsInitalised ) {
			windowEventsInitalised = true;
			if ( emis.mobile.nativeFrame.isNative ) {
				$(document).on( 'emis-native.app-became-online', updateOfflineElements );
				$(document).on( 'emis-native.app-became-offline', updateOfflineElements );
			}
			window.addEventListener( "offline", updateOfflineElements );
			window.addEventListener( "online", updateOfflineElements );
		}

		emis.mobile.UI.addOrientationEventsForDialog( orientationChange );
		orientationChange( );
		emis.mobile.UI.tryBindShowHideToPage($page, orientationChange, unbindEvents)
		main.controller.sharedOrgs.attachSharedOrgsToScreen(that, "#" + pageid, ".content.grid > .e-blocks", documents);

		if ( main.controller.runNonSyncWSManager ) {
			main.controller.runNonSyncWSManager = false;
			nonSyncManager = new emis.mobile.NonSyncWSManager( );
			nonSyncManager.delegate = this;
			if(CALL_OTK_INSTEAD) {
				nonSyncManager.verifyOTK( );
			} else {
				nonSyncManager.authenticate();
			}
		}
		if ( main.controller.askForOTK ) {
			main.controller.askForOTK = false;
			setTimeout( function( ) {
				that.askForOTK( );
			}, 1000 );
		}
		if (main.controller.askForAuth) {
			main.controller.askForAuth = false;
			nonSyncManager = new emis.mobile.NonSyncWSManager( );
			nonSyncManager.delegate = this;
			nonSyncManager.authenticate();
		}
	};

	var findDocInArray = function( docId ) {
		var doc = $.grep( documents, function( e ) {
			return e.id == docId;
		} );
		return doc;
	};

	this.retry = function( ) {
		var messageToDisplay = '';
		if ( doc[0].size ) {
			if(doc[0].size==0) {
				messageToDisplay += 'The file size is 0 bytes. ';
			} else if(doc[0].size<1) {
				messageToDisplay += 'The file size is ' + f( Math.round( 1000 * doc[0].size ) ) + 'B. ';
			} else {
				messageToDisplay += 'The file size is ' + f( Math.round( doc[0].size ) ) + 'kB. ';
			}
		}
		messageToDisplay += 'Are you sure you want to download the document?';
		emis.mobile.Utilities.customConfirmPopup( { ok: "Yes", cancel: "No", message: messageToDisplay, title: f( doc[0].date ) + ' - ' + f( doc[0].term ), callback: function( r ) {
			if ( r === true ) {
				showLoadingSpinner( true );
				downloadAttachment( docId );
			}
		} } );
	};

	this.updateDocumentsButtons = function( toIgnore ) {
		setTimeout( function( ) {
			if ( emis.mobile.nativeFrame.isNative ) {
				for ( var i = 0; i < documents.length; i++ ) {
					if ( documents[i].id == toIgnore ) {
						updateButtons( false, documents[i] );
						continue;
					}
					main.dataProvider.isAttachmentPresent( documents[i].id, function( document ) {
						return function( result ) {
							updateButtons( result, document );
						}
					} ( documents[i] ) );
				}
			} else {
				if ( main.controller.useLocalStorageForDocs ) {
					var storage = new emis.mobile.Storage( );
					idList = storage.findAllIds( "DocAttachment" );
					for ( var i = 0; i < documents.length; i++ ) {
						var found = false;
						for ( var j = 0; j < idList.length; j++ ) {
							if ( ( documents[i].id == idList[j] ) && ( idList[j] != toIgnore ) ) {
								found = true;
								break;
							}
						}
						updateButtons( found, documents[i] );
					}
				} else {
					main.dataProvider.getDocStorage( ).findAllIds( "DocAttachment" ).done( function( idList ) {

						for ( var i = 0; i < documents.length; i++ ) {
							var found = false;
							for ( var j = 0; j < idList.length; j++ ) {
								if ( ( documents[i].id == idList[j] ) && ( idList[j] != toIgnore ) ) {
									found = true;
									break;
								}
							}
							updateButtons( found, documents[i] );
						}
					} );
				}
			}
		} );
	};

	var bindEventsToButtons = function( toIgnore ) {
		$( "#patientDocumentsContent .removeDoc" ).off( 'click' ).on( 'click', function( ) {
			var docId = $( this ).data( "em-value-index" );
			emis.mobile.Utilities.customConfirmPopup( {ok:"Yes", cancel:"No", message:'Do you want to remove this file from your local device?', title:'Remove?', callback: function( r ) {
				if ( r === true ) {
					var updateLayout = function() {
						updateButtons( false, findDocInArray( docId )[0] );
						bindEventsToButtons( docId );
						updateOfflineElements( );
					}
					if ( main.controller.useLocalStorageForDocs ) {
						main.storage.removeItem( "DocAttachment_" + docId );
						updateLayout();
					} else {
						main.dataProvider.removeAttachment( docId, function( ) {
							updateLayout();
						} );
					}
				}
			} } );
		} );

		$( "#patientDocumentsContent .showDoc" ).off( 'click' ).on( 'click', function( ) {
			if ( $( this ).data( "em-value-index" ) != undefined ) {
				emis.mobile.form.PatientDocuments.openDocument( $( this ).data( "em-value-index" ) );
			}
		} );

		$( "#patientDocumentsContent .downloadDoc" ).off( 'click' ).on( 'click', function( ) {
			if ( $( this ).hasClass( "ui-disabled" ) ) {
				return false;
			}
			var docId = $( this ).data( "em-value-index" );
			doc = $.grep( documents, function( e ) {
				return e.id == docId;
			} );
			lastDocId = docId;
			lastDoc = doc;
			var messageToDisplay = '';
			if ( doc[0].size ) {
				if(doc[0].size==0) {
					messageToDisplay += 'The file size is 0 bytes. ';
				} else if(doc[0].size<1) {
					messageToDisplay += 'The file size is ' + f( Math.round( 1000 * doc[0].size ) ) + 'B. ';
				} else {
					messageToDisplay += 'The file size is ' + f( Math.round( doc[0].size ) ) + 'kB. ';
				}
			}
			messageToDisplay += 'Are you sure you want to download the document?';

			emis.mobile.Utilities.customConfirmPopup( { ok:"Yes", cancel:"No", message: messageToDisplay, title: f( doc[0].date ) + ' - ' + f( doc[0].term ), callback: function( r ) {
				if ( r === true ) {
					// showLoadingSpinner(true);
					downloadAttachment( docId );
				}
			} } );

		} );

		that.updateDocumentsButtons( toIgnore );
	};

	var markupButtons = function( inStorage, docData ) {
		var markup = '';
		// default not in storage
		var docCachedClass = " hidden";
		var docNotCachedClass = "";
		if ( inStorage ) {
			docCachedClass = " ";
			docNotCachedClass = " hidden";
		}
		// show and remove buttons
		markup += '<a data-role="none" class="removeDoc button red ' + docCachedClass + '" href="" data-em-value-index="' + f( docData.id ) + '">Remove</a>';
		markup += '<a data-role="none" class="showDoc button green ' + docCachedClass + '" href="" data-em-value-index="' + f( docData.id ) + '">View</a>';
		// download button
		markup += '<a data-role="none" class="downloadDoc button ' + docNotCachedClass + '" href="" data-em-value-index="' + f( docData.id ) + '">Download</a></div>';
		return markup;
	};

	/**
	 * update buttons state
	 */
	var updateButtons = function( inStorage, docData ) {
		var prefix = "a[data-em-value-index='" + docData.id + "']";
		var $removeDoc = $( prefix + ".removeDoc " );
		var $showDoc = $( prefix + ".showDoc " );
		var $downloadDoc = $( prefix + ".downloadDoc " );

		if ( inStorage ) {
			$downloadDoc.addClass( "hidden" );
			$removeDoc.removeClass( "hidden" );
			$showDoc.removeClass( "hidden" );
		} else {
			$downloadDoc.removeClass( "hidden" );
			$removeDoc.addClass( "hidden" );
			$showDoc.addClass( "hidden" );
		}

		//fix for dissapearing top bar after downloading document on iPad
		(function(){
			var oldVal = $("#headerPatient").css("z-index")
			$("#headerPatient").css("z-index", -1);
			$("#headerPatient").css("z-index", oldVal);
		})()

	};

	function fillSectionListview( markup, data ) {
		if ( !markup )
			markup = '';

		if ( _app.util.isEmptyObject( data ) ) {
			markup += getSectionNoData( 'Documents' );
		} else {
			markup += '<div class="contentPanel">';
			markup += '<div class="e-blocks headerBorder">';
			markup += 'Documents (<span id="docsNumber">' + f( data.length ) + '</span>)';
			markup += '</div>';
			markup += '<div class="documentsHeader grid">';
			markup += '<div class="e-blocks">';
			markup += '<div class="grid-5 e-block-a">Date</div>';
			markup += '<div class="grid-5 e-block-b">Type</div>';
			markup += '<div class="grid-5 e-block-c">Details</div>';
			markup += '<div class="grid-5 e-block-d">File Size</div>';
			markup += '<div class="grid-5 e-block-e"></div>';
			markup += '</div>';
			markup += '</div>';

			/* content */
			markup += '<div class="content grid">';

			for ( var i = 0; i < data.length; i++ ) {
				var docs = data[i];
				markup += '<div class="e-blocks" id="' + _.h( docs.id ) + '"';
				if(docs.organisationId) {
					markup += ' data-org="' + docs.organisationId + '"';
				}
				markup += '>';
				markup += '<div class="grid-5 e-block-a">' + _.h( docs.date ) + '</div>';
				markup += '<div class="grid-5 e-block-b">' + _.h( docs.term );
				if(docs.organisationId) {
					markup += '<i class="shared-orgs"></i>';
				}
				markup += '</div>';
				markup += '<div class="grid-5 e-block-c">' + _.h( docs.associatedText ) + '</div>';
				if(docs.size==0) {
					markup += '<div class="grid-5 e-block-d">0B</div>';
				} else if(docs.size<1) {
					markup += '<div class="grid-5 e-block-d">' + f( Math.round( 1000 * docs.size ), "B" ) + '</div>';
				} else {
					markup += '<div class="grid-5 e-block-d">' + f( Math.round( docs.size ), "kB" ) + '</div>';
				}
				markup += '<div class="grid-5 e-block-e">';
				if ( docs.available && docs.size < 5000 ) {
					markup += markupButtons( false, docs );
				} else {
					markup += '<span class="unavailable">Unavailable</span></div>';
				}
				markup += '</div>';
			}

			markup += '</div>';
			markup += '</div>';
		}
		return markup;
	}

	var unbindEvents = function( ) {
		emis.mobile.UI.removeOrientationEventsForDialog( orientationChange );
	};

	function orientationChange( ) {
		// $( "#patientdocuments" ).css( {
			// "min-height": 300
			// // to redo jquery.mobile.1.1.1.js : 2881 min-height set
		// } );
	}


	emis.mobile.form.PatientDocuments.openDocument = function openDocument( docId ) {
		main.controller.documentId = docId;
		var doc = findDocInArray( docId );

		if ( emis.mobile.nativeFrame.isNative ) {
			function f( v, suffix ) {
				if ( v )
					return suffix ? v + suffix : v;
				return '';
			}

			var docSize = 'N/A';
			var docUnit = '';
			if(f(doc[0].size ) != '') {
				if(doc[0].size<1) {
					docSize = f( Math.round( 1000 * doc[0].size ) );
					if(doc[0].size==0) docSize = 0;
					docUnit = "B";
				} else {
					docSize = f( Math.round( doc[0].size ) );
					docUnit = "kB";
				}
			}

			main.storage.openDocument(
				docId,
				main.controller.patient.name,
				f( doc[0].date ) == '' ? 'N/A' : f( doc[0].date ),
				docSize + docUnit,
				f( doc[0].term ) == '' ? 'N/A' : f( doc[0].term ),
				f( doc[0].associatedText ) == '' ? 'N/A' : f( doc[0].associatedText ),
				f( doc[0].source ) == '' ? 'N/A' : f( doc[0].source ),
				'' + main.controller.slotId
			).done( function() {
				// no need to do anything
			}).fail( function() {
				// display problem with opening a document?
			});
		} else {
			var fctrs = _app.controller.getFormControllerStruct( '#documentDetails' );
			fctrs.controller.data = doc;

			// var content = $( "#patientdocuments .contentPanel .content" );
			// if ( emis.mobile.UI.isiPad ) {
				// content.css( '-webkit-overflow-scrolling', 'auto' );
			// }
			// content.css( 'overflow-y', 'hidden' );
			$.mobile.changePage( "#documentDetails", {
				delay: true
			} );
		}
	};

	function showLoadingSpinner( bshow ) {
		if ( bshow ) {
			$loadingSpinner.show( );
		} else {
			$loadingSpinner.hide( );
		}
	}

	function downloadAttachment( attachmentId ) {
		main.controller.attachmentId = attachmentId;
		lastAttachmentId = attachmentId;
		var document = findDocInArray( attachmentId )[0];
		main.controller.attachmentFileType = document.fileType;
		main.controller.attachmentSharingOrganisationId = document.organisationId;
		if ( emis.mobile.nativeFrame.isNative ) {
			main.storage.downloadDocument(
				attachmentId,
				main.controller.patient.id,
				main.controller.slotId,
				main.controller.attachmentFileType,
				main.controller.attachmentSharingOrganisationId
			).done( function() {
				updateButtons( true, document );
			}).fail( function() {
				updateButtons( false, document );
			});
		} else {
			$.mobile.changePage( "#loadingDialog" );
		}
	}


	this.askForOTK = function( ) {
		unbindEvents( );
		main.controller.lastNonSyncWSManagerDelegate = "#patientdocuments";
		$.mobile.changePage( "#OTKverification" );
	};

	// options - not used for this script
	this.nonSyncWSManagerSuccess = function( options ) {
		if ( options == "sessionOnly" ) {
			nonSyncManager = new emis.mobile.NonSyncWSManager( );
			nonSyncManager.delegate = this;
			nonSyncManager.authenticate();
		} else {
			downloadAttachment( lastAttachmentId );
		}
	};

	return this;
};
