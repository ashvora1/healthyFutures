/**
 * Main web editor controller, user interface actions manager, form data flow process
 *
 * Functionalities provided: Navigation to forms with related form controllers General UI buttons events Context data of
 * current navigation flow
 *
 * It should be central controller for whole application so single instance is needed
 */

$.extend({
getUrlVars: function(){
	var vars = [], hash;
	var hashes = window.location.href.slice(window.location.href.indexOf('?') + 1).split('&');
	for(var i = 0; i < hashes.length; i++)
	{
	hash = hashes[i].split('=');
	vars.push(hash[0]);
	vars[hash[0]] = hash[1];
	}
	return vars;
},
getUrlVar: function(name){
	return $.getUrlVars()[name];
}
});

emis.mobile.Controller = function( app ) {
	var _HOME_PAGE = "#page1";

	var that = this;
	var _app = app;
	var evt;
	var lastAvailHeight = 0;
	var lastAvailWidth = 0;

	var _registeredFormControllers = {};
	var _registeredFormControllersNames = [];
	var bControllerInitialized = false;
	var _commonComponentsInitHandler = null ;
	var timeNow = null ;
	var wasNotFocused = false;


	var pageHeaders = ['.patientSummaryInfo', '.pageHeader'];

	this.pageHeaders = pageHeaders.join(',') ;

	this.keyboardHidingTimer = null;
	this.isDrawerOpen = false;
	this.isScreenKeyboard = false;
	this.isInDialogPage = false;
	this.backPage = false;
	this.blockDiv = $( "#block-div" );



	// technically its not good that we need to use this variable - we should solve logging out issues
	// without it. Still, leave it for now as workaround - JI

	this.alreadyLoggingOut = false;

	this.bDuringSynchronisation = false;

	// object to tell if we should refresh data
	this.refreshPages = {
		'appointments': true,
		'caseloads': true,
		'patientsummary': true,
		'patientmedications': true,
		'patientconsultations': true,
		'patientproblemslist': true,
		'patientvalues': true,
		'patientreferrals': true,
		'patientimmunisations': true,
		'patientallergies': true,
		'patientdiary': true,
		'bookAppointments': true,
		'patientdocuments': true,
		'addDrug': true
	};


	that.updateDots = function() {
		$("#patientsummary .content").not(".grid").each(function() {
			var children = $(this).children()
			var shouldBeDot = false;
			for (var i = 0; i < children.length; ++i) {
				var child = children.eq(i)
				if (child.hasClass('element')) {
					if (shouldBeDot) {
						child.children().eq(0).show()
					} else {
						child.children().eq(0).hide()
					}
				}

				if (child.hasClass('element')) {
					shouldBeDot = true;
				}
				if (child.hasClass('headerText')) {
					shouldBeDot = false;
				}
			}
		})
	}


	that.sharedOrgs = {};

	that.sharedOrgs.currentSharedOrgs = [];

	that.sharedOrgs.currentSharedOrgsIdsNeedConsent = [];

	that.sharedOrgs.dict = {};

	that.sharedOrgs.lastOrgOpened = {};

	that.sharedOrgs.sharingViewPermissionParent = null;

	that.sharedOrgs.purgeAllSharedOrgs = function() {
		$("span.hidden-value").remove()
	}

	that.sharedOrgs.hideAllSharedOrgs = function(screenId, itemSelector){
		$(screenId + " " + itemSelector).each(function(){
			if ( screenId == "#patientsummary" ) {
				var healthStatusWrapper = $( this ).parents( '.health-status-wrapper' );
				if ( healthStatusWrapper.length ) {
					// don't hide element if it's from health-status-wrapper because they are filtered already
				} else {
					that.sharedOrgs.hideFromDOM(this)
				}
			} else {
				that.sharedOrgs.hideFromDOM(this);
			}
		});
		$(screenId + " .headerText").each(function(){
			that.sharedOrgs.hideHeaderFromDOM(this)
		})
	}

that.sharedOrgs.hideHeaderFromDOM = function(what){
		var dat = $(what)
		var replacement = $("<span class='hidden-header'></span>")
		dat.after(replacement)
		replacement.data("hidden-value", dat.detach())
	}

	that.sharedOrgs.hideFromDOM = function(what){
		var dat = $(what)
		var replacement = $("<span class='hidden-value'></span>")
		dat.after(replacement)
		replacement.data("hidden-value", dat.detach())
	}

	that.sharedOrgs.restoreToDOM = function(what) {
		var dat = $(what)
		var data = dat.data("hidden-value")
		dat.after(data);
		dat.remove()
	}

	that.sharedOrgs.reactToFilterChange = function(screenId, itemSelector) {
		if ( ENABLE_SHARED_DATA ) {
			if ( screenId == "#patientvalueshistory" ||
					screenId == "#patientvaluesmultihistory" ||
					screenId == "#patientimmunisationshistory" ) {
				// on these screens values are already parsed

				that.sharedOrgs.filterSharedOrgs(screenId, "all", itemSelector);
			} else {
				that.sharedOrgs.filterSharedOrgs(screenId, $(screenId + " .sharedRecordsFilter option:selected").attr('data-org'), itemSelector);
			}
		} else {
			that.sharedOrgs.filterSharedOrgs(screenId, "local", itemSelector);
		}
	}

	that.sharedOrgs.showSharedRecords = function(screenId, itemSelector) {
		if ( that.sharedOrgs.hasSavedConsent() || that.sharedOrgs.currentSharedOrgsIdsNeedConsent.length == 0 ) {
			$(screenId + " .accessSharedRecordsBtn").hide();
		}
		$(screenId + " .sharedRecordsFilter").show()
		var elsToDeselect = $(screenId + " .sharedRecordsFilter option");
		var selectedEl = null;
		if ( that.sharedOrgs.lastOrgOpened[main.controller.patient.id] ){
			selectedEl = $(screenId + " .sharedRecordsFilter option[data-org='" + that.sharedOrgs.lastOrgOpened[main.controller.patient.id] +  "']");
		} else {
			selectedEl = $(screenId + " .sharedRecordsFilter option[data-org='all']");
		}
		selectedEl.attr('selected', 'selected');
		$(screenId + " .sharedRecordsFilter option").not( selectedEl ).removeAttr( 'selected' );
		that.sharedOrgs.reactToFilterChange(screenId, itemSelector);
	}

	that.sharedOrgs.updateHeaders = function(screenId) {
		$(screenId + " .header.withButtonInside > a").each(function() {
			var button = $(this)
			var ourArea = button.parent().next('.content')
			var newSize = 0;
			if (ourArea.length > 0) {
				newSize = ourArea.find(".element").length
			}
			button.text(button.text().split('(')[0] + ' (' + (newSize == 0 ? 'None' : newSize) + ')')
		});
		$(screenId + " .header.withoutButtonInside").each(function() {
			var header = $(this)
			var ourArea = header.next('.content')
			var newSize = 0;
			if (ourArea.length > 0) {
				newSize = ourArea.find(".element").length
			}
			header.text(header.text().split('(')[0] + ' (' + (newSize == 0 ? 'None' : newSize) + ')')
		})
	}

	that.sharedOrgs.hasSavedConsent = function() {
		var consent = main.dataProvider.findPatientConsent( main.controller.patient.id )
		if ( consent ) {
			var consentReason = consent.consentCapture.consentReason;
			return !( consentReason === "NoConsent" )
		}
		return false;
	}

	that.sharedOrgs.detachEventsFromIcons = function( screenId ) {
		$(screenId + " i.shared-orgs").off('click');
	};

	that.sharedOrgs.attachEventsToIcons = function( screenId ) {
		$(screenId + " i.shared-orgs").each(function() {
			var icon = $(this);
			if ( ! ENABLE_SHARED_DATA ) {
				icon.hide();
			}

			var orgName = that.sharedOrgs.dict[icon.parents("*[data-org]").first().attr('data-org')]
			icon.on('click', function(evt) {
				var alreadyOpened = $(this).find("#sharedOrgsPopup")
				if (alreadyOpened.length > 0) {
					alreadyOpened.popup("close")
					return;
				}

				var rollWithIt = function() {
					var $popUp = $("<div id='sharedOrgsPopup' />").popup({
						dismissible: true,
						arrow: 'b',
						history: false,
						theme: "a",
						shadow: false
					})

					$popUp.on('click', function() {
						$(this).popup('close');
					})

					var closeItLikeItsHot = function() {
						if ( $popUp && $popUp.length ) {
							$popUp.popup('close')
						}
						$('a').off('click', closeItLikeItsHot);
						$('select').off('touchstart', closeItLikeItsHot);
					}

					$popUp.bind("popupbeforeposition", function() {
						emis.mobile.Utilities.repositionSharedOrgsPopup();
					});

					$popUp.bind("popupafterclose", function() {
						$(this).popup("destroy");
						$(this).remove();
						$("#sharedOrgsPopup").remove();
						$popUp = null;
					});
					$("<p/>", {
						text: orgName
					}).appendTo($popUp);
					icon.append($popUp);
					$popUp.popup("open");
					$('a').on('click', closeItLikeItsHot);
					$('select').on('touchstart', closeItLikeItsHot);
				}

				var existingPopup = $("#sharedOrgsPopup").first()

				if (existingPopup.length > 0 ){
					existingPopup.on('popupafterclose', rollWithIt)
					existingPopup.popup("close")
				} else {
					rollWithIt();
				}
			});
		});
	}

	that.sharedOrgs.attachSharedOrgsToScreen = function(screenObject, screenId, itemSelector, data, bDontAttachIconsEvents) {
		that.sharedOrgs.detachSharedOrgsFromScreen(screenObject, screenId);

		that.sharedOrgs.currentSharedOrgs = main.dataProvider.getPatientSharingOrgs();
		that.sharedOrgs.currentSharedOrgsIdsNeedConsent = [];
		for ( var i = 0 ;i < that.sharedOrgs.currentSharedOrgs.length; i++ ){
			var sharingOrg = that.sharedOrgs.currentSharedOrgs[i];
			that.sharedOrgs.dict[sharingOrg.id] = sharingOrg.displayName;
			if ( emis.mobile.Utilities.isTrue( sharingOrg.isSharingConsentCaptureRequired ) ) {
				that.sharedOrgs.currentSharedOrgsIdsNeedConsent.push( sharingOrg.id );
			}
		}

		var patientHasSavedConsent = that.sharedOrgs.hasSavedConsent();
		var bDisplaySharedData = ! ( ! patientHasSavedConsent && that.sharedOrgs.currentSharedOrgsIdsNeedConsent.length == that.sharedOrgs.currentSharedOrgs.length );
		if ( ! ENABLE_SHARED_DATA ) {
			bDisplaySharedData = false;
		}

		var markup = "<div style='float:right;' class='sharedRecordsButtonArea'><a data-role='none' href='#' class='accessSharedRecordsBtn standaloneButton'>Shared records available</a> <select data-role='none' style='display:none;' class='sharedRecordsFilter'>";
		var lastSelection = that.sharedOrgs.lastOrgOpened[main.controller.patient.id];
		markup += "<option data-org='all'";
		if ( bDisplaySharedData && lastSelection == "all" ){
			markup += " selected='selected'";
		}
		markup += ">All shared records</option>";
		markup += "<option data-org='local'";
		if ( ! bDisplaySharedData || ( ! lastSelection || lastSelection == "local" ) ){
			markup += " selected='selected'";
		}
		markup += ">Only local records</option>";

		for ( var i = 0; i < that.sharedOrgs.currentSharedOrgs.length; i++ ){
			var datOrg = that.sharedOrgs.currentSharedOrgs[i];
			if ( ! patientHasSavedConsent && that.sharedOrgs.currentSharedOrgsIdsNeedConsent.indexOf( datOrg.id ) != -1 ) {
				continue;
			}
			markup += "<option data-org='" + datOrg.id + "'";
			if ( bDisplaySharedData && lastSelection == datOrg.id ) {
				markup += " selected='selected'";
			}
			markup += ">" + datOrg.displayName + "</option>";
		}
		markup += "</select></div>";

		if ( ENABLE_SHARED_DATA && emis.mobile.Utilities.isKeyInJsonObject( "organisationId", data ) ) {
			$(screenId + " .menuAboveContent").append( markup );
		}

		if ( ENABLE_SHARED_DATA && ! bDontAttachIconsEvents ) {
			that.sharedOrgs.attachEventsToIcons( screenId );
		}

		$(screenId + " .sharedRecordsFilter").on('change', function(){
			that.sharedOrgs.lastOrgOpened[main.controller.patient.id] = $(this).find(":selected").data("org");
			that.currentlySharedOrg = that.sharedOrgs.lastOrgOpened[main.controller.patient.id];
			if ( screenId == "#patientvalues" || screenId == "#patientimmunisations" ) {
				main.controller.refreshPages[ screenId.substring( 1 ) ] = true;
				$.mobile.changePage( screenId, {
					allowSamePageTransition: true
				} );
			} else {
				if ( screenId == "#patientsummary" ) {
					$( "#patientsummary" ).trigger( "refresh-health-status" );
				}
				that.sharedOrgs.reactToFilterChange(screenId, itemSelector);
			}
		})

		$(screenId + " .accessSharedRecordsBtn").on('click', function(){
			that.sharedOrgs.sharingViewPermissionParent = screenId;
			$.mobile.changePage( "#sharingViewPermission" )
		})

		if ( ENABLE_SHARED_DATA ) {
			if ( bDisplaySharedData ){
				that.sharedOrgs.showSharedRecords(screenId, itemSelector)
			} else {
				that.sharedOrgs.reactToFilterChange(screenId, itemSelector)
			}
		} else {
			that.sharedOrgs.reactToFilterChange( screenId, itemSelector );
		}
	}

	that.sharedOrgs.detachSharedOrgsFromScreen = function(screenObject, screenId) {
		$(screenId + " .sharedRecordsButtonArea").remove();
		that.sharedOrgs.detachEventsFromIcons( screenId );
	}

	that.sharedOrgs.filterSharedOrgs = function(screenId, value, itemSelector) {
		if(typeof value === 'undefined' || value == '')
			value='local'

		that.sharedOrgs.hideAllSharedOrgs(screenId, itemSelector);

		that.currentlySharedOrg = value;

		if (value === "local") {
			$(screenId + " .hidden-value").each(function() {
				if (typeof $(this).data("hidden-value").attr("data-org") === 'undefined') {
					that.sharedOrgs.restoreToDOM(this)
				}
			})
		} else if (value === "all") {
			var patientHasSavedConsent = that.sharedOrgs.hasSavedConsent() && ENABLE_SHARED_DATA;
			$(screenId + " .hidden-value").each(function() {
				var currentSharedOrg = $(this).data("hidden-value").attr("data-org");
				if ( ! patientHasSavedConsent
					&& currentSharedOrg
					&& that.sharedOrgs.currentSharedOrgsIdsNeedConsent.length
					&& that.sharedOrgs.currentSharedOrgsIdsNeedConsent.indexOf( currentSharedOrg ) != -1 ) {
					// don't show...
				} else {
					that.sharedOrgs.restoreToDOM(this);
				}
			})
		} else {
			$(screenId + " .hidden-value").each(function() {
				if ($(this).data("hidden-value").attr("data-org") == value) {
					that.sharedOrgs.restoreToDOM(this)
				}
			})
		}

		$(screenId + " .hidden-header").each(function(){
			var header = $(this)
			var next = header.nextAll();
			var shouldShow = false;
			for(var i = 0; i < next.length ; ++i){
				if (next.eq(i).hasClass("element")){
					shouldShow = true;
					break;
				} else if(next.eq(i).hasClass("hidden-header")){
					break;
				}
			}
			if(shouldShow){
				that.sharedOrgs.restoreToDOM(this)
			}
		})

		that.sharedOrgs.updateHeaders(screenId)

		if (screenId == "#patientsummary"){
			that.updateDots();
		}

		(function(){
			var selectorElement = itemSelector.split(' ').pop();

			if ( screenId == "#patientconsultations" ) {
				if ( $(screenId).find(selectorElement).length
						&& ! $(screenId).find(selectorElement + ".no-data-consultation" ).is(':visible') ) {

					$("#consultationsContent").remove( '.contentPanel.no-data-consultation' );
				} else {
					$("#consultationsContent").append( '<div class="contentPanel no-data-consultation"><div class="header no-data">Consultations (None)</div></div>' );
				}
			} else {
				$(screenId + " " + ".contentPanel .content").each(function(){
					var contentArea = $(this)
					var header = contentArea.prev()
					var elementsLength = contentArea.find(selectorElement).length;

					if(elementsLength == 0){
						contentArea.hide();
						header.addClass('no-data');
						if ( header.find( '.e-blocks' ).length ) {
							header.removeClass('grid');
						}
						if ( screenId == "#patientdocuments" ) {
							var docsNumber = $('#docsNumber');
							docsNumber.text( 'None' );
							docsNumber.parent().addClass('bottom-radius');
						}
					} else {
						contentArea.show();
						header.removeClass('no-data');
						if ( header.find( '.e-blocks' ).length ) {
							header.addClass('grid');
						}
						if ( screenId == "#patientdocuments" ) {
							var docsNumber = $('#docsNumber');
							docsNumber.text( '' + elementsLength );
							docsNumber.parent().removeClass('bottom-radius');
						}
						if ( screenId == "#patientvalues" ||
								screenId == "#patientvalueshistory" ||
								screenId == "#patientvaluesmultihistory" ) {
							contentArea.find( selectorElement + '.first-visible' ).removeClass( 'first-visible' );
							contentArea.find( selectorElement ).eq( 0 ).addClass( 'first-visible' );
						}
					}
				});
			}
		})();

		if ( $( '#sharedOrgsPopup' ).length ) {
			emis.mobile.Utilities.repositionSharedOrgsPopup();
		}
	}

	/*
	 * Variable that is responsible for resetting controls in Book Appointments search criteria
	 */
	this.resetSearchCriteria = true;

	var sessionCheckerTimer;

	this.gotoLoginPage = function( ) {
		this.logoutCleanup() ;

		var baseHref = main.storage.getItem( "base_href" );
		emis.mobile.console.log("goToLoginPage called");
		if ( emis.mobile.nativeFrame.isNative ) {
			main.storage.goToLoginPage();
		} else {
			if ( baseHref ) {
				window.open( baseHref, "_self" );
			} else {
				window.location.reload( true );
			}
		}

	} ;

	/**
	 * common init code before jqm init
	 */
	this.setCommonComponentsInitHandler = function( handler ) {
		_commonComponentsInitHandler = handler;
	} ;
	var changePage = function( page, options ) {
		if ( options && options.delay ) {
			setTimeout( function( page, options ) {
				return function( ) {
					$.mobile.changePage( page, options );
					if ( options.callback ) {
						options.callback( options.callbackParams );
					}
				}
			}( page, options ), DELAY_BEFORE_PAGE_CHANGE );
		} else {
			$.mobile.changePage( page, options );
			if ( options && options.callback ) {
				options.callback( options.callbackParams );
			}
		}
	} ;
	/**
	 * logged user session data
	 */
	this.user = {
		id: "",
		name: null,
		login: null,
		cdb: null
	};

	/**
	 * logged user origanisation data
	 */
	this.organisation = {
		id: this.user.cdb,
		// temporary name to show something
		name: this.user.cdb

	};

	/**
	 * choosen patient data context
	 */
	this.patient = {
		id: null,
		name: null
	};

	/**
	 * choosen slot id
	 */
	this.slotId = null;

	/**
	 * choosen document id
	 */
	this.documentId = null;

	/**
	 * CanPrescribe
	 */
	this.CanPrescribe = null;

	// used temporary sessionid
	this.SessionId = null;

	this.isLogged = function( ) {
		return !!that.SessionId;
	};


	this.makeAllSubpagesRefreshable = function( ) {
		$.each(main.controller.refreshPages, function( key, value ) {
			main.controller.refreshPages[key] = true ;
		}) ;
	};

	/**
	 * set user session data in controller
	 */
	this.setUserSession = function( username, cdb, accessToken ) {
		this.user.name = username;
		this.user.login = username;
		this.user.cdb = cdb;
		this.user.id = main.dataProvider.getSessionData().Payload.UserInRoleId;

		_setOrganisationSession( username, cdb );
	};

	this.setAccessToken = function( accessToken ) {
		// accessToken comes only during synchronisation
		this.user.accessToken = accessToken;
	};

	this.getAccessToken = function( ) {
		// accessToken comes only during synchronisation
		return this.user.accessToken;
	};

	function _setOrganisationSession( username, cdb ) {
		that.organisation = {};
		that.organisation.id = cdb;
		// temporary name to show something
		that.organisation.name = cdb;
	}

	/**
	 * @return current patient data from controller
	 */
	function _getPatientContext( ) {
		return that.patient;
	}


	this.getPatientContext = _getPatientContext;


	function _pagebeforechangeHandler(e, data) {
		if ( bControllerInitialized ) {
			var options = data.options;

			// We only want to handle changePage() calls where the caller is
			// asking us to load a page by URL.
			if (bControllerInitialized && typeof data.toPage === "string") {

				// We are being asked to load a page by URL, but we only
				// want to handle URLs that request the data for a specific
				// category.
				var u = $.mobile.path.parseUrl( data.toPage );
				emis.mobile.console.log( "pagebeforechange " + u.hash );
				if ( u.hash == "" ) {
					u.hash = "#page1";
				}

				if ( u.hash == "#page1" ) {
					$( "#page1" ).show();
				} else {
					$( "#page1" ).hide();
					// fixes white bottom padding on several pages (for example it fixes R#127414)
				}

				// The pages we use to display our content are already in
				// the DOM. The id of the page we are going to write our
				// content into is specified in the hash before the '?'.
				var pageSelector = u.hash.replace( /\?.*$/, "" );
				var $page = $( pageSelector );

				var bPageFound = true;
				if ( $page.length == 0 ) {
					bPageFound = false;
				}

				// emis.mobile.console.log( "bPageFound " + bPageFound );
				// emis.mobile.console.log( "length: " + $page.length );
				// emis.mobile.console.log( "appointments " + $( "#appointments" ).length );
				// bPageFound = true;

				var bFoundController = false;
				if ( bPageFound ) {
					for ( var i = 0; i < _registeredFormControllersNames.length; i++ ) {
						var pageName = _registeredFormControllersNames[i];

						// emis.mobile.console.log(pageName+" "+u.hash);
						// there is no need for query params cut
						if ( pageName && ( u.hash == pageName ) ) {

							var formObject = _registeredFormControllers[pageName];
							var formc = formObject.controller;

							if ( formc ) {

								if ( $page.length > 0 ) {

									if ( $( pageName ).data( "role" ) == "dialog" ) {
										that.backDialogPageOffsetY = window.pageYOffset;
									}

									if ( $( pageName ).data( "role" ) == "dialog" && !that.isLandscape ) {
										$( "#drawer" ).hide( );
										$( pageName + "," + that.pageHeaders ).css( {
											"margin-left": "0px",
											"width": "100%"
										} );
									}

									// lines to handle browser's back button clicked while in dialog
									emis.mobile.UI.removeOrientationEventsForDialog( );
									if($.getUrlVar('ui-state') !== 'dialog')
										showBlockingDiv( );
									$( ".ui-page-active, .ui-dialog-background" ).css( {
										"overflow": "visible",
										"max-height": "none"
									} );

									emis.mobile.console.log( "bindDataAndEvents " + pageName );

									// remember scrolled position if we are in dialog page
									if ( main.controller.isInDialogPage == false )
										window.scrolled = $( window ).scrollTop( );

									if ( options.dontUseScrollTop ) {
										that.backDialogPageOffsetY = 0;
										window.scrolled = 0;
									}

									try {
										var refresh = main.controller.refreshPages[$page.attr('id')] ;
										formc.bindDataAndEvents( $page, refresh);
										main.controller.refreshPages[$page.attr('id')] = false ;
									} catch ( ex ) {
										if ( ex.message ) {
											emis.mobile.console.error( ex.message + "\n" + ex.stack );
										}
										else {
											emis.mobile.console.error( ex );
										}
									}

									// the code block for refreshing dynamic generated page content
									// empty try-catches to prevent jqm confusing error messages
									try {
										$page.trigger( "create" );
									} catch ( ex ) {
										// nothing interesting to communicate
									}
									try {
										$page.trigger( "pagecreate" );
									} catch ( ex ) {
										// nothing interesting to communicate
									}

									try {
										$page.find( ':jqmData(role="header")' ).trigger("create");
									} catch ( ex ) {
										// nothing interesting to communicate
									}

									try {
										$page.find( ':jqmData(role="listview")' ).listview( "refresh", true );
									} catch ( ex ) {

									}

									// Make sure to tell changePage() we've handled this call so it doesn't have to do
									// anything.
									e.preventDefault( );

									// We don't want the data-url of the page we just modified
									// to be the url that shows up in the browser's location field,
									// so set the dataUrl option to the URL for the category we just loaded.
									options.dataUrl = u.href;

									// Now call changePage() and tell it to switch to the page we just modified.
									changePage( $page, options );
									// $.mobile.changePage( $page, options );
									bFoundController = true;
								} else {
									// error handling , default behaviour is for f5 page refresh
									emis.mobile.console.warn( "going to home page because page could not be found:" + pageName );
									main.storage.setItem( "reloadCause", "going to home page because page could not be found:" + pageName );
									that.gotoLoginPage();
								}
								break;
							}
						}
					}// end of for
				}
				if ( !bFoundController ) {
					if ( bPageFound  && $.getUrlVar('ui-state') !== 'dialog') {
						showBlockingDiv( );
						changePage( $page, options );
						// $.mobile.changePage( $page, options );
					}
					return false;
				}
				if ( ! emis.mobile.nativeFrame.isNative ) {
					var x = data.options.fromPage[0].id;
					if ( u.hash == "#page1" && x != "page1" ) {
						main.storage.setItem( "reloadCause", 'u.hash == "#page1" && x != "page1"' );
						new emis.mobile.Storage().setEncryptionKey( null );
						that.gotoLoginPage();
					}
				}
			} else {
 				if(typeof data.toPage === 'object' && data.toPage[0].id === "page1"){
 					console.log('page 1 loading');
 					e.preventDefault();
 					return false;
				}
			}
		}
		emis.mobile.console.log( "pagebeforechange finished "+data.toPage );
	}

	/**
	 * checks if app should logout
	 */
	this.startCheckingSession = function( ) {

		if ( emis.mobile.nativeFrame.isNative) {
			$(document).on( 'emis-native.back-to-foreground', function( data ) {
				var inactiveTime = data.inactiveTime;
				emis.mobile.console.log("logging out; inactiveTime: " + inactiveTime);
				that.logout();
			});
		} else {
			window.addEventListener( "pagehide", function( ) {
				emis.mobile.console.log( "window.pagehide" );
				that.logout( );
			}, false );
		}

		window.addEventListener( "pageshow", function( ) {
		}, false );
		window.addEventListener( "blur", function( ) {
			if ( emis.mobile.UI.isAndroid ) {
				wasNotFocused = true;
			}
		}, false );
		window.addEventListener( "focusout", function( ) {
		}, false );

		var bDocumentFocusDetection = false;
		if ( bDocumentFocusDetection ) {
			var lastFocus = true;
			// window.document.hasFocus();
			var lastDefocusTime = null;
			var lastTickTime = null;
			setInterval( function( ) {
				var bFocus = window.document.hasFocus( );
				var time = ( new Date( ) ).getTime( );

				if ( lastDefocusTime ) {
					var diffTime = time - lastDefocusTime;
					// emis.mobile.console.log("diffTime: "+diffTime);
					if ( diffTime > 1000 * 5 )
						that.logout( );
				}
				if ( bFocus ) {
					lastDefocusTime = null;
				} else {
					// emis.mobile.console.warn("bez focusa "+time );
					if ( lastDefocusTime == null ) {
						lastDefocusTime = time;
					}
				}

				if ( lastFocus != bFocus ) {
					if ( bFocus ) {
						emis.mobile.console.warn( "bez focusa " + ( new Date( ) ).getTime( ) );
					} else {
						emis.mobile.console.log( "focus " + time );
					}
					lastFocus = bFocus;
				}
				lastTickTime = time;
			}, 100 );
		}
	};

	/* clears visible to user storage data if synchronization was not completed */
	this.clearVisibleStorage = function( storage ) {
		dataWipe = new emis.mobile.DataWipe( );
		var eventsetsNotCompleted = main.dataProvider.getAllIncompletedEventsets( );
		var dataToStore;
		var incompletedEventsPatientIds = [] ;
		if ( eventsetsNotCompleted.length > 0 ) {
			for ( k in eventsetsNotCompleted ) {
				// check if exists
				var patientId = eventsetsNotCompleted[k].patientId;
				var push = true;
				for ( l in incompletedEventsPatientIds ) {
					if ( incompletedEventsPatientIds[l] == patientId ) {
						push = false;
						break;
					}
				}
				if ( push )
					incompletedEventsPatientIds.push( patientId );
			}
			dataToStore = dataWipe.getPatientsWithIncompletedTemplatesData( incompletedEventsPatientIds );
			// var entitiesToRemove= [ENTITY_APPOINTMENT, ENTITY_SESSION, ENTITY_APPOINTMENTS_LIST,
			// ENTITY_SESSION_ORDER];
			var entitiesToRemove = [ENTITY_APPOINTMENT, ENTITY_SESSION];
			for ( var i = 0; i < entitiesToRemove.length; i++ ) {
				storage.removeAll( entitiesToRemove[i] );
			}
			dataWipe.setPatientsWithIncompletedTemplatesData( dataToStore );
		} else {
			// var entitiesToRemove= [ENTITY_APPOINTMENT, ENTITY_SESSION, ENTITY_APPOINTMENTS_LIST,
			// ENTITY_SESSION_ORDER];
			var entitiesToRemove = [ENTITY_APPOINTMENT, ENTITY_SESSION];
			for ( var i = 0; i < entitiesToRemove.length; i++ ) {
				storage.removeAll( entitiesToRemove[i] );
			}
		}

	};

	this.setValuesHistoryCodes = function( codesObj ) {
		that.valuesHistoryOpenByCode = true;
		that.valuesHistoryCode = ( codesObj.code ? codesObj.code : null );
		that.valuesHistoryCode2 = ( codesObj.code2 ? codesObj.code2 : null );
		that.valuesHistoryCodes = ( codesObj.codes ? codesObj.codes : null );
	};

	window.onpopstate = function( ) {
		// if sync was not completed
		if ( $.mobile.activePage ) {
			var hash = '#' + $.mobile.activePage[0].id;
			emis.mobile.console.log( "on pop state:" + hash );
			if ( !that.isLogged( ) && hash != "#page1" ) {
				// bookmark for unlogged user
				$( "body" ).hide( );
				emis.mobile.console.log( "calling reload" );
				main.storage.setItem( "reloadCause", 'onpopstate' );
				that.gotoLoginPage();
				return false;
			}

			if ( hash == "#page1" ) {
				if ( main.storage.getItem("SyncStatus") !== null ) {
					var syncStatus = parseInt( main.storage.getItem( "SyncStatus" ) );
					main.storage.removeItem( "SyncStatus" );
					// if upload has been broken
					if ( syncStatus === 1 ) {
						emis.mobile.Utilities.alert( {message: "Last synchronisation was interrupted before all data has been uploaded"} );
					}
					// if download has been broken
					if ( syncStatus === 2 ) {
						that.clearVisibleStorage( main.storage );
						emis.mobile.Utilities.alert( {message: "Last synchronisation was interrupted but all data has been uploaded"} );
					}
					return;
				} else if ( main.storage.getItem('geocodingEnd') === "false" ) {
					main.storage.removeItem( "geocodingSuccess" );
					main.storage.removeItem( "geocodingEnd" );
					emis.mobile.Utilities.alert( {message: "Last synchronisation was interrupted during geocoding, some map data may be missing"} );
				}
			}
		} else {
			emis.mobile.console.log( "on pop state: no activePage" );
		}
	};

	/********************
	* timed out logout
	*********************/
	function TimedOuts( ) {
		var timedThat = this;
		var TIMEOUT = LOGOUT_TIMEOUT * 1000 ;
		var PERIODIC_CHECK_TIME = 5*1000 ;
		// no of times PERIODIC_CHECK_TIME
		var BLOCKED_THREAD_TRESHOLD = 6 ;
		that.lastTimestamp = ( new Date( ) ).getTime( );

		tempTime = new Date().getTime();
		that.myLoginTimestamp = tempTime;
		that.lastTimestamp = tempTime;
		if ( !emis.mobile.nativeFrame.isNative ) {
			localStorage.setItem("lastLoginTimestamp_0",tempTime);
		}


		this.AFTER_SYNCH_DELAY_TIME = 15*1000 ;
		this.bBlockLogout = false;

		function checkTimeout( ) {
			var current = ( new Date( ) ).getTime( );
			if ( current - that.lastTimestamp > TIMEOUT && that.isLogged( ) ) {
				that.logout( );
			}
		}

		function lastActivityTimestamp( ) {
			that.lastTimestamp = ( new Date( ) ).getTime( );
		}

		that.lastActivityCheckTime = (new Date()).getTime();

		function checkPageActivity( ) {

			var currentTime = timeNow = new Date( ).getTime( );
			var diff = currentTime - that.lastActivityCheckTime;
			mod = 1;
			if ( $.mobile.activePage ) {
				var pageId = $.mobile.activePage[0].id;
				if ( pageId == "map" || pageId == "documentDetails" || pageId == "patientdocuments" ) {
					mod = 3;
				}
			}
			if (diff > BLOCKED_THREAD_TRESHOLD * PERIODIC_CHECK_TIME * mod && that.isLogged()) {
				if ( wasNotFocused ) {
					wasNotFocused = false;
				} else {
					that.logout() ;
				}
			} else {
				that.lastActivityCheckTime = currentTime ;
			}
			if ( !emis.mobile.nativeFrame.isNative ) {
				if(localStorage.getItem("lastLoginTimestamp_0")!=that.myLoginTimestamp) {
					that.logout();
				} else
				if(localStorage.getItem("lastLoadTimestamp_0"))
				if(localStorage.getItem("lastLoadTimestamp_0")>that.myLoginTimestamp) {
					that.logout();
				}
			}
		} ;

		// externalized interface
		this.checkPageActivity = checkPageActivity;

		this.initRafAutoLogout = function( ) {

			var raf = emis.mobile.Utilities.raf;

			function incFunc( ) {
				// checking and firing orientation change for windows
				if ( emis.mobile.UI.isIE10 || emis.mobile.UI.isAtLeastIE11 || emis.mobile.UI.isWindows )

					if ( ( lastAvailWidth > lastAvailHeight && window.screen.availWidth < window.screen.availHeight ) || ( lastAvailWidth < lastAvailHeight && window.screen.availWidth > window.screen.availHeight ) ) {
						window.dispatchEvent( main.controller.evt ); //
					}
				if ( !emis.mobile.UI.isiPad ) {
					lastAvailHeight = window.screen.availHeight;
					lastAvailWidth = window.screen.availWidth;
					timedOuts.checkPageActivity( );
				}
				raf( incFunc );
			} ;

			// (implements request animation frame) and ((not ipad) or (ipad in app mode))
			if ( raf && ( !emis.mobile.UI.isiPad || ( emis.mobile.UI.isiPad && window.navigator.standalone ) ) ) {
				raf( incFunc );
			}
		};

		var timerid = setInterval( checkTimeout, 1000 );
		$( document ).on( "click tap touchmove", lastActivityTimestamp );

		if ( !emis.mobile.UI.isiPad || ( emis.mobile.UI.isiPad && window.navigator.standalone ) ) {
			if(!(emis.mobile.UI.isAndroid && emis.mobile.UI.isChrome))
			timer2id = setInterval( checkPageActivity, PERIODIC_CHECK_TIME );
		}
		return this;
	}

	;

	// instant init
	var timedOuts = new TimedOuts( );

	this.delayCheckingLogout = function( ) {
		timedOuts.bBlockLogout = true;
		setTimeout( function( ) {
			timedOuts.bBlockLogout = false;
		}, timedOuts.AFTER_SYNCH_DELAY_TIME );
	}

	this.logout = function( e ) {

		if ( that.alreadyLoggingOut ) {
			return false ;
		}
		that.alreadyLoggingOut = true;

		function performLogout() {
			if ( sessionCheckerTimer ) {
				clearInterval( sessionCheckerTimer );
			}
			if ( offline || emis.mobile.nativeFrame.isNative ) {
				that.gotoLoginPage() ;
			} else {
				var sessionAPI = new emis.mobile.UserSessionAPI( );
				sessionAPI.endSession( _app.controller.SessionId );
			}
		}

		if (main.controller.bDuringSynchronisation) {
			// wait for sync to end
			$(document).one('emis.syncstatusupdated', function(event){
				performLogout() ;
			}) ;
		} else {
			performLogout() ;
		}

	};


	this.logoutCleanup = function() {
		new emis.mobile.Storage( ).setEncryptionKey( null );
		main.storage.removeItem( "geocodingSuccess" );
		main.storage.removeItem( "geocodingEnd" );

		main.storage.removeItem( "logging" );

	} ;


	var hideBlockingDiv = function( ) {
		that.blockDiv.css( "visibility", "hidden" );
	};
	var showBlockingDiv = function( ) {
		that.blockDiv.css( "visibility", "visible" );
	};

	/**
	 * constructor init function
	 */

	this.init = function( ) {

		$( document ).bind( "mobileinit", function( event ) {
			$.extend( $.mobile.zoom, {
				locked: true,
				enabled: false
			} );
			$.mobile.buttonMarkup.hoverDelay = 0;
		} );

		this.evt = document.createEvent( "HTMLEvents" );
		this.evt.initEvent( "customOrientationChange", true, true );

		window.addEventListener( "customOrientationChange", function( ) {
			emis.mobile.console.log( "its being called now" );
		} );

		var that = this;
		emis.mobile.console.log( "Controller init" );

		// Listen for any attempts to call changePage().
		$( document ).bind( "pagebeforechange", _pagebeforechangeHandler );

		$( document ).bind( "pagechange", hideBlockingDiv );
		$( document ).bind( "pagechangefailed", hideBlockingDiv );

		$(document).on( 'emis-native.back-button-pressed', function() {
			if($( '#dynamic-popup' ).length==1) return;
			if(main.controller.bDuringSynchronisation) return;
			if($(".ui-datebox-container").is(":visible")) return;// check
			emis.mobile.console.log("back button pressed active page: "+$.mobile.activePage[0].id);
			switch($.mobile.activePage[0].id) {
				case "appointments":
					var message = 'Are you sure you want to log out?';
					emis.mobile.Utilities.customConfirmPopup( {ok: "Yes", cancel: "No", message: message, title: 'Log out?', callback: function( r ) {
						if ( r === true ) {
							main.controller.logout( );
						}
					} } );
					break;
				case "map":
					$("#map #appointmentsBtn").click(); break;
				case "patientDetails":
					$("#patientDetails #patientDetailsCloseBtn").click(); break;
				case "patientmedicationdetails":
					$("#patientmedicationdetails #medicationDetailsCloseBtn").click(); break;
				case "patientproblemdetails":
					$("#patientproblemdetails #patientProblemDetailsCloseBtn").click(); break;
				case "patientvalueshistory":
					$("#patientvalueshistory #valuesHistoryCloseBtn").click(); break;
				case "patientvaluesmultihistory":
					$("#patientvaluesmultihistory #valuesMultiHistoryCloseBtn").click(); break;
				case "patientimmunisationshistory":
					$("#patientimmunisationshistory #immunisationsHistoryCloseBtn").click(); break;
				case "schedulesList":
					$("#schedulesList #schedulesListCloseBtn").click(); break;
				case "editSchedule":
					$("#editSchedule #edit-schedule-close").click(); break;
				case "cancelSchedule":
					$("#cancelSchedule #cancel-schedule-close").click(); break;
				case "editScheduleTemplate":
					$("#editScheduleTemplate #edit-schedule-template-close").click(); break;
				case "sharingViewPermission":
					$("#sharingViewPermission #sharingViewPermissionCloseBtn").click(); break;
				case "bookAppointmentsDetails":
					$("#bookAppointmentsDetails #bookAppointmentsDetailsCloseBtn").click(); break;
				case "drugList":
					$("#drugList #drugListcloseBtn").click(); break;
				case "editTask":
					$("#editTask #editTaskcloseBtn").click(); break;
				case "templateParser":
					$("#templateParser #cancelTemplate").click(); break;
				case "listViewCodes":
					$("#listViewCodes #listViewCloseBtn").click(); break;
				case "taskallusers":
					$("#taskallusers #taskAllUsersCloseBtn").click(); break;
				case "selectTemplate":
					$("#selectTemplate #selectTemplateCloseBtn").click(); break;
				case "syncLoading":
					$("#syncLoading .close").click(); break;

				default:
					main.controller.backButtonOnAndroidPressed = true;
					$("#drawer-appointments").click(); break;
			}
		});

		that.initJqm( );
		timedOuts.initRafAutoLogout( );
	};

	function initCommonComponents( ) {
		if ( _commonComponentsInitHandler )
			_commonComponentsInitHandler( );
	}

	/**
	 * @param formId
	 * @param controller - form specific controller
	 */
	this.registerFormController = function( formId, controller, view ) {
		_registeredFormControllers[formId] = {
			formId: formId,
			controller: controller,
			view: view
		};
		_registeredFormControllersNames.push( formId );
	};

	function loadExternalHtmlPages( ) {
		var options = {
			'pageContainer': $( 'body' )
		};

		$( document ).bind( "pageloadfailed", function( event, data ) {
			event.preventDefault( );
			emis.mobile.console.log( data.textStatus );
			// emis.mobile.console.log(data.errorThrown.getMessage());
			emis.mobile.console.log( data.xhr.status );
			emis.mobile.console.log( data.xhr.statusText );
		} );

		function loadSingleView( viewUrl ) {
			if ( viewUrl ) {
				try {
					viewUrl = emis.mobile.Utilities.relativeToAbsoluteUrl( viewUrl );
					emis.mobile.console.log( "loadingPage " + viewUrl );
					// $.mobile.loadPage( viewUrl, options );
					emis.mobile.Utilities.loadPage( viewUrl, options );
				} catch ( ex ) {
					emis.mobile.console.error( viewUrl );
					if ( ex.getMessage )
						emis.mobile.console.error( ex.getMessage( ) );
					if ( ex.message )
						emis.mobile.console.error( ex.message );
					else
						emis.mobile.console.error( ex );
				}
			}
		}


		emis.mobile.console.log( 'load external pages' );
		for ( var i = 0; i < _registeredFormControllersNames.length; i++ ) {
			var ctrInfo = _registeredFormControllers[_registeredFormControllersNames[i]];
			if ( ctrInfo.view instanceof Array ) {
				var views = ctrInfo.view;
				for ( var j = 0; j < views.length; j++ ) {
					loadSingleView( views[j] );
				}
			} else {
				loadSingleView( ctrInfo.view );
			}
		}
		$.mobile.base.set( 'index.html' );
	}


	this.initJqm = function( ) {
		// load external pages
		emis.mobile.console.log( "WE ARE INITIALISING JQM" );

		loadExternalHtmlPages( );

		var bJqmInitializePage = false;
		function jqmInitalize( ) {
			if ( !bJqmInitializePage ) {
				bJqmInitializePage = true;
				emis.mobile.console.log( "first initializePage" );
				$( document ).off( 'pagebeforecreate', "div:jqmData(role='page')", jqmInitalize );
				$.mobile.loading('hide');
			}
		}

		$( document ).on( 'pagebeforecreate', "div:jqmData(role='page')", jqmInitalize );

		initCommonComponents( );

		setTimeout( function( ) {
			bControllerInitialized = true;
			$.mobile.changePage( _HOME_PAGE );
		}, 1000 );
	};

	/**
	 * @param formId
	 * @return form specific controller struct {formId:formId,controller:controller,view:view};
	 */
	this.getFormControllerStruct = function( formId ) {
		return _registeredFormControllers[formId];
	};

	this.getFormController = function( formId ) {
		var struct = that.getFormControllerStruct( formId );
		if ( struct )
			return struct.controller;
	};

	this.isControllerInitialized = function( ) {
		return bControllerInitialized;
	};

	this.setCurrentPatient = function( patientObject ) {
		$( "#drawer-patient" ).html( '<div>' + patientObject.name + '</div>' );
		$( "#drawer li" ).removeClass( "drawer-active" );
		$( "#drawer-patient-record" ).addClass( "drawer-active" );
		this.patient = patientObject;
		return this.patient;
	};

	this.setSlotId = function( slotId ) {
		this.slotId = slotId;
		return this.slotId;
	};

	/**
	 * inner class DataComponentBinder
	 */
	function DataComponentBinder( el, dataAccessor, dataUpdateHandler ) {
		var that = this;
		var lastValue = null;
		// taskDetails
		this.$el = $( el );
		this.dataAccessor = dataAccessor;
		this.dataUpdateHandler = dataUpdateHandler;

		/**
		 * copy value from form to data object
		 */
		this.formToData = function( ) {
			var value = that.$el.val( );
			// update data object
			if ( lastValue != value ) {
				that.dataAccessor.setValue( value );
				// dataupdateevent
				lastValue = value;
				if ( that.dataUpdateHandler )
					that.dataUpdateHandler( value );
			}
		}
		/**
		 * copy value from form to data object
		 */
		this.dataToForm = function( ) {
			var value = that.dataAccessor.getValue( );
			that.$el.val( value ? String( value ) : '' ).trigger( 'change' );
		};

		function formChangedHandler( e ) {
			$.debounce( 500, function () {
				that.formToData( ) ;
			}) ;
		}

		function registerEvent( ) {
			that.$el.on( "keyup change", formChangedHandler );
		}


		this.unregisterEvents = function( ) {
			that.$el.off( "keyup change", formChangedHandler );
		};

		// constructor
		registerEvent( );
	}

	function SimplePropertyAccessor( propertyParent, propertyName ) {
		this.setValue = function( value ) {
			propertyParent[propertyName] = value;
			emis.mobile.console.log( 'setValue:' + value );
		};
		this.getValue = function( value ) {
			return propertyParent[propertyName];
		};
	}

	function BooleanPropertyAccessor( propertyParent, propertyName ) {
		this.setValue = function( value ) {
			propertyParent[propertyName] = ( String( value ) == "true" );
			emis.mobile.console.log( 'setValue:' + value );
		};
		this.getValue = function( value ) {
			var svalue = String( propertyParent[propertyName] );
			return svalue == "true";
		};
	}


	this.BooleanPropertyAccessor = BooleanPropertyAccessor;

	/**
	 * inner class FormDataBinder - managing all binders owned by form
	 */
	this.FormDataBinder = function( ) {
		var _binders = [];
		var _dataupdateHandler = null;
		this.bindDataComponent = function( el, dataAccessorOrPropertyParent, propertyName ) {
			var dataAccessor = dataAccessorOrPropertyParent;
			if ( propertyName )
				dataAccessor = new SimplePropertyAccessor( dataAccessorOrPropertyParent, propertyName );
			var binder = new DataComponentBinder( el, dataAccessor, _dataupdateHandler );
			_binders.push( binder );
			return binder;
		};

		this.dataToForm = function( ) {
			for ( var i = 0; i < _binders.length; i++ )
				_binders[i].dataToForm( );
		};

		this.formToData = function( ) {
			for ( var i = 0; i < _binders.length; i++ )
				_binders[i].formToData( );
		};

		this.dataupdateHandler = function( _newHandler ) {
			if ( _newHandler )
				_dataupdateHandler = _newHandler;
			return _dataupdateHandler;
		};

		this.unbindDataComponents = function( ) {
			for ( var i = 0; i < _binders.length; i++ ) {
				_binders[i].unregisterEvents( );
			}
		};
	};

	return this;
};
