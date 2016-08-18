/**
 * common UI settings, event handlers etc.
 *
 */
emis.mobile.UI = function( ) {
	var that = this;

	var _wasLandscapeOnStart;

	var drawerAnimTime = 300;
	var drawerWidth = $( "#drawer" ).width( );
	var drawerMenuClick = function(e) {
		if ( !main.controller.isDrawerOpen ) {
			var delay = 0;

			var callback = function() {
				$( document ).off( "hiddenKeyboard", callback );

				$( "#drawer" ).css( "z-index", "0" );
				$( "#drawer" ).show( );
				$( ".drawer-menu-button" ).addClass( "drawer-menu-button-active" );

				emis.mobile.UI.updateDrawerLoggedInfo( main );

				var patientRecordDrawerItems = $( "#drawer-patient,#drawer-patient-record,#drawer-new-appointment,#drawer-new-drug,#drawer-tasks,#drawer-contact" );

				if ( isAppointmentsPage( ) || isCaseloadsPage( ) ) {
					patientRecordDrawerItems.hide( );
				} else {
					patientRecordDrawerItems.show( );
				}
				$( ".ui-page-active" ).animate( {
					marginLeft: drawerWidth
				}, drawerAnimTime, function( ) {
					$( "#drawer" ).css( "z-index", "10000" );
					main.controller.isDrawerOpen = true;
					//emis.mobile.console.log( "drawer: " + $( "#drawer-tasks" ).css( "display" ) );
				} );
				$( main.controller.pageHeaders ).animate( {
					marginLeft: drawerWidth
					// ,
					// uncomment commented code if headers should squeeze
					// width: window.innerWidth - drawerWidth
				}, drawerAnimTime );
			}

			if ( main.controller.isScreenKeyboard ) {
				// delay fixes R#133678 on iPad and Android
				delay = SCROLLTO_DELAY_WITH_KEYBOARD;
				document.activeElement.blur();
				setTimeout(callback, delay) ;
			} else if ( main.controller.keyboardHidingTimer && (emis.mobile.UI.isIE10 || emis.mobile.UI.isAtLeastIE11)  ) {
				// hiddenKeyboard fixes R#133678 on Windows
				$( document ).on( "hiddenKeyboard", callback );
			} else {
				callback();
			}
		} else {
			$( "#drawer" ).css( "z-index", "0" );
			$( ".drawer-menu-button" ).removeClass( "drawer-menu-button-active" );
			$( ".ui-page-active" ).animate( {
				marginLeft: "0px",
				width: $('body').innerWidth()
			}, {
				duration: drawerAnimTime,
				complete: function( ) {
					main.controller.isDrawerOpen = false;
					// $( main.controller.pageHeaders ).width( window.innerWidth );
					$( "#drawer" ).hide( );
				},
				queue: false
			} );
			$( main.controller.pageHeaders ).animate( {
				marginLeft: "0px",
				width: $('body').innerWidth()
			}, drawerAnimTime );
		}
		return false;
	} ;

	function isAppointmentsPage( ) {
		var page = "#" + $.mobile.activePage[0].id;
		var backPage = main.controller.backPage;

		return ( page == "#appointments" || page == "#map" ) || ( backPage && ( backPage == "#appointments" || backPage == "#map" ) );
	}
	function isCaseloadsPage( ) {
		var page = "#" + $.mobile.activePage[0].id;
		var backPage = main.controller.backPage;

		return page == "#caseloads" || ( backPage && backPage == "#caseloads" );
	}

	// application init code
	// App custom javascript
	this.initMain = function( ) {

		// jqm options
		$.mobile.page.prototype.options.domCache = true;
		$.mobile.defaultDialogTransition = 'none';
		$.mobile.defaultPageTransition = 'none';
		$.mobile.orientationChangeEnabled = false;
		$.mobile.base.reset( );
		$.fn.buttonMarkup.defaults = {
			corners: true,
			shadow: true,
			iconshadow: true,
			iconsize: 18,
			wrapperEls: "span"
		};

		if ( !window.bMainInitialized ) {
			window.bMainInitialized = true;
			window.main = new emis.mobile.Main( );



			// all main application components are initialised now
			window.main.init( function( ) {

				( function checkIfMobile( ) {
					if ( emis.mobile.UI.isiPad ) {
						$( 'body' ).addClass( 'mobile-ios' );
					} else if ( emis.mobile.UI.isAndroid ) {
						$( 'body' ).addClass( 'mobile-android' );
					}
				} )( );

				/**
				 * sets orientation related data for the first time
				 */
				( function setWindowSize( ) {
					var docBodyHeight = $(document).height() - $('body').offset().top;
					var docBodyWidth = $(document).width() - $('body').offset().left;
					if ( docBodyWidth > docBodyHeight ) {
						_wasLandscapeOnStart = true;
						main.controller.windowLandscapeWidth = docBodyWidth;
						main.controller.windowLandscapeHeight = docBodyHeight;
					} else {
						_wasLandscapeOnStart = false;
						main.controller.windowLandscapeWidth = docBodyHeight;
						main.controller.windowLandscapeHeight = docBodyWidth;
					}
					if ( emis.mobile.UI.isiPad ) {
						if ( window.orientation === 0 || window.orientation === 180 ) {
							main.controller.isLandscape = false;
							// there is bug on iPad that screen.width or screen.availWidth is returning value in
							// wrong orientation
							if ( window.screen.availHeight > window.screen.availWidth ) {
								main.controller.windowLandscapeWidth = window.screen.height;
								main.controller.windowLandscapeHeight = window.screen.width;
							} else {
								main.controller.windowLandscapeWidth = window.screen.width;
								main.controller.windowLandscapeHeight = window.screen.height;
							}
						} else {
							main.controller.isLandscape = true;
							// there is bug on iPad that screen.width or screen.availWidth is returning value in
							// wrong orientation
							if ( window.screen.availWidth > window.screen.availHeight ) {
								main.controller.windowLandscapeWidth = window.screen.width;
								main.controller.windowLandscapeHeight = window.screen.height;
							} else {
								main.controller.windowLandscapeWidth = window.screen.height;
								main.controller.windowLandscapeHeight = window.screen.width;
							}
						}
					}

					main.controller.isLandscape = _wasLandscapeOnStart;

				} )( );

				/**
				 * binds events to drawer drawer handler
				 */

				( function prepareDrawer( ) {

					$( document ).on( "click", ".drawer-menu-button", drawerMenuClick );

					$( "#drawer-logout" ).click( function() {
						emis.mobile.Utilities.customConfirmPopup( {ok: "Yes", cancel: "No", message: 'Are you sure you want to log out?', title: 'Log out?', callback: function( r ) {
							if ( r === true ) {
								main.controller.logout( );
							}
						} } );
					} );
					$( "#drawer li.drawer-default" ).click( function(e) {

						var drawerButtons = {
							'drawer-appointments':'appointments',
							'drawer-patient-record':'patientsummary',
							'drawer-new-appointment':'bookAppointments',
							'drawer-new-drug':'addDrug',
							'drawer-tasks':'taskList',
							'drawer-contact':'templateList'
						} ;

						if (ENABLE_CASELOADS) {
							drawerButtons['drawer-caseloads'] = 'caseloads' ;
						} ;

						e.preventDefault () ;
						var element = $( this );
						var elementId = element[0].id;
						var page = "#" + $.mobile.activePage[0].id;

						$( "#drawer li" ).removeClass( "drawer-active" );
						var changePage = function( page ) {
							$.mobile.changePage( page, {
								delay: true,
								callback: function( ) {
									var bBackButtonPressed = main.controller.backButtonOnAndroidPressed;
									if ( bBackButtonPressed ) {
										main.controller.backButtonOnAndroidPressed = false;
									}
									if ( !main.controller.isLandscape && ! bBackButtonPressed ) {
										drawerMenuClick( );
									}
								}
							} );
						} ;
						element.addClass( "drawer-active" );

						// reset states of pressed buttons in menu
						$( "#selectPatientRecordDiv a.menuItem" ).removeClass( "pressed" );
						$( "#SummaryBtn" ).addClass( "pressed" );

						var nextPage = drawerButtons[elementId] ;
						if (nextPage && nextPage != $.mobile.activePage[0].id) {
							changePage('#'+nextPage) ;
						}

						return false ;
					} );

					if (!ENABLE_CASELOADS) {
						$('#drawer-caseloads').hide() ;
					} ;

				} )( );
				// end of prepareDrawer ^^^

				/**
				 * shows or hides drawer on orientationchange and pageshow drawer handler
				 */
				function showOrHideDrawer( currentWindowWidth, currentWindowHeight ) {

					var calculateSecondHeaderHeight = function( page ) {
						var secondHeaderHeight = 0;
						if ( $( page + " .patientSummaryInfo" ).height( ) ) {
							secondHeaderHeight += $( page + " .patientSummaryInfo" ).height( );
						} else if ( $( page + " .appointmentsHeader" ).height( ) ) {
							secondHeaderHeight += $( page + " .appointmentsHeader" ).height( );
						}
						return secondHeaderHeight;
					};
					var addPadding = function( selector, paddingSelector ) {
						$( selector ).css( {
							"padding-top": ( $( paddingSelector ).height( ) + calculateSecondHeaderHeight( selector ) ) + "px"
						} );
					} ;
					var dialogInPortrait = function( isDialog ) {
						var drawer = $( "#drawer" );
						drawer.hide( );
						if ( isDialog ) {
							if ( main.controller.backPage ) {
								$( main.controller.backPage + "," + main.controller.pageHeaders ).css( {
									"width": "100%",
									"margin-left": "0px"
								} );
								addPadding( main.controller.backPage, main.controller.backPage + " .ui-header" );
							}
						} else {
							$( ".ui-page-active," + main.controller.pageHeaders ).css( "width", "100%" );
							$( ".ui-page-active," + main.controller.pageHeaders ).css( "margin-left", "0px" );
							addPadding( ".ui-page-active", ".ui-page-active .ui-header" );
						}
					};
					var page = "#" + $.mobile.activePage[0].id;

					if ( page != "#page1" && page != "#authenticationToken" ) {
						var drawer = $( "#drawer" );
						var isDialog = false;
						var drawerWidth = drawer.width( );

						if ( $.mobile.activePage.data( "role" ) == "dialog" ) {
							isDialog = true;
						}
						if ( main.controller.isLandscape ) {
							$( ".drawer-menu-button" ).hide( );
						} else {
							$( ".drawer-menu-button" ).show( );
						}
						if ( main.controller.isLandscape || main.controller.isDrawerOpen ) {
							emis.mobile.UI.updateDrawerLoggedInfo( main );
							var drawerCaseloads = $( "#drawer-caseloads" );
							if ( isAppointmentsPage( ) || isCaseloadsPage( ) ) {
								if ( isAppointmentsPage ( ) ) {
									$( "#drawer-appointments" ).addClass( "drawer-active" );
								} else {
									drawerCaseloads.addClass( "drawer-active" );
								}
								if ( ENABLE_CASELOADS ) {
									drawerCaseloads.show();
								}
								$( "#drawer-patient," + "#drawer-patient-record," + "#drawer-new-appointment," + "#drawer-new-drug," + "#drawer-tasks," + "#drawer-contact" ).hide( );
							} else {
								$( "#drawer-appointments" ).removeClass( "drawer-active" );
								drawerCaseloads.removeClass( "drawer-active" );
								$( "#drawer li" ).show( );
							}
							if ( !isDialog ) {
								drawer.css( "z-index", "10000" );
								var bShowDrawer = true;
								if ( main.controller.isScreenKeyboard && emis.mobile.UI.isiPad ) {
									if ( main.controller.isLandscape ) {
										$( main.controller.pageHeaders ).css( "margin-left", "0px" );
										$( ".ui-page-active" ).css( "margin-left", drawerWidth + "px" );
									} else {
										main.controller.isDrawerOpen = false;
										bShowDrawer = false;
										dialogInPortrait( isDialog );
									}
								} else {
									$( ".ui-page-active," + main.controller.pageHeaders ).css( "margin-left", drawerWidth + "px" );
								}
								if ( main.controller.isLandscape ) {
									$( ".ui-page-active," + main.controller.pageHeaders ).width( currentWindowWidth - drawerWidth );
								} else {
									$( main.controller.pageHeaders ).width( currentWindowWidth );
								}
								if ( bShowDrawer ) {
									drawer.show( );
								}
								addPadding( ".ui-page-active", ".ui-page-active .ui-header" );
							} else {
								if ( main.controller.isLandscape ) {
									if ( !main.controller.isScreenKeyboard ) {
										$( main.controller.pageHeaders ).css( {
											"margin-left": drawerWidth,
											"width": ( currentWindowWidth - drawerWidth ) + "px"
										} );
									}
									if ( main.controller.backPage ) {
										$( main.controller.backPage ).css( {
											"margin-left": drawerWidth + "px",
											"width": ( currentWindowWidth - drawerWidth ) + "px"
										} );
									}
									drawer.css( "z-index", "1" );
									drawer.show( );
									if ( main.controller.backPage ) {
										addPadding( main.controller.backPage, main.controller.backPage + " .ui-header" );
									}
								} else {
									dialogInPortrait( isDialog );
								}
							}
						} else {
							dialogInPortrait( isDialog );
						}
					} else {
						$( "#drawer" ).hide( );
					}

					if (!ENABLE_CASELOADS) {
						$('#drawer-caseloads').hide() ;
					}
				}

				// end of showOrHideDrawer ^^^
				$( document ).on( 'pageshow', 'div[data-role="dialog"]', function( e, ui ) {
					setTimeout(function(){
						$( '#selectPatientRecordDiv' ).hide( );
					},0);
				});
				/*
				 * method to remember last back page (mainly for popups, but don't take into accout dialogs)
				 */
				$( document ).on( 'pagebeforeshow', 'div[data-role="page"]', function( e, ui ) {
					main.controller.backPage = $.mobile.activePage.selector;
				} );
				/**
				 * events binding related to showing and hiding drawer
				 */
				$( document ).on( 'pageshow', 'div[data-role="page"],div[data-role="dialog"]', function( e, ui ) {

					// if it's first page with drawer, headers, etc...
					if ( $.mobile.activePage && $.mobile.activePage.selector == "#appointments"
							&& ui && ui.prevPage && ui.prevPage.length && ( ui.prevPage[0].id == "page1" || ui.prevPage[0].id == "appointments" ) ) {

						if ( emis.mobile.nativeFrame.android ) {
							var exists = function( val ) {
								return ! ( val === undefined || val === null );
							}

							// for initial loading as checking these values in "main" is too soon
							var screenWidth = main.storage.getItem( 'screenWidth' );
							var screenHeight = main.storage.getItem( 'screenHeight' );
							var currentOrientation = main.storage.getItem( 'currentOrientation' );
							if ( exists(screenWidth) && exists(screenHeight) && exists(currentOrientation) ) {
								emis.mobile.UI.orientationChangeDrawerFunction( [ {
									isLandscape: currentOrientation == 1,
									width: screenWidth,
									height: screenHeight
								} ] );
							} else {
								emis.mobile.UI.orientationChangeDrawerFunction();
							}
						}
						emis.mobile.UI.orientationChangeDrawerFunction();
					}

					$( document ).trigger( "emis.manageheaders" );

					setTimeout( function( ) {
						/* fix for #68738 */
						/**
						 * scrolls page to top, because of some bug in JQM (sometimes footer and header were not in place where they should be
						 * after closing dialog or changing tab)
						 */
						// do not touch this
						window.scrollTo( 50, 50 );
						window.scrollTo( 0, 0 );

						if ( $( '#dynamic-popup' ).length ) {
							$( '#dynamic-popup' ).popup( "open" );
						}
					}, SCROLLTO_DELAY );
				} );

				$( document ).on( 'emis.manageheaders', function( e, ui ) {
					showOrHideDrawer( $(document).width() - $('body').offset().left,
						$(document).height() - $('body').offset().top );
				} );

				emis.mobile.UI.orientationChangeDrawerFunction = function( event, data ) {
					var currentWindowWidth = null;
					var currentWindowHeight = null;
					if ( data ) {
						currentWindowWidth = data.width;
						currentWindowHeight = data.height;
						main.controller.isLandscape = data.isLandscape;
					} else {
						currentWindowWidth = window.innerWidth;
						currentWindowHeight = window.innerHeight;

						if ( emis.mobile.UI.isAndroid ) {
							currentWindowWidth = window.innerWidth;
							currentWindowHeight = window.innerHeight;
							if ( main.controller.isScreenKeyboard ) {
								currentWindowWidth = window.screen.width;
								currentWindowHeight = window.screen.height;
							}
						}
						if ( emis.mobile.UI.isIE10 || emis.mobile.UI.isAtLeastIE11) {
							currentWindowWidth = window.screen.availWidth;
							currentWindowHeight = window.screen.availHeight;
						}
						if ( currentWindowWidth == 800 ) {
							main.controller.isLandscape = false;
						}
						else if ( currentWindowWidth == 1280 ) {
							main.controller.isLandscape = true;
						}
						else if ( currentWindowWidth > currentWindowHeight ) {
							main.controller.isLandscape = true;
						} else {
							main.controller.isLandscape = false;
						}

						/* end of block for fix #76114 */
						if ( emis.mobile.UI.isiPad ) {
							if ( window.orientation === 0 || window.orientation === 180 ) {
								main.controller.isLandscape = false;
								currentWindowWidth = main.controller.windowLandscapeHeight;
								currentWindowHeight = main.controller.windowLandscapeWidth;
							} else {
								main.controller.isLandscape = true;
								currentWindowWidth = main.controller.windowLandscapeWidth;
								currentWindowHeight = main.controller.windowLandscapeHeight;
							}
						}
					}

					var callback = function() {
						showOrHideDrawer( currentWindowWidth, currentWindowHeight );
						setTimeout(function( windowWidth ){
							return function() {
								emis.mobile.UI.fixWindowWidth( windowWidth );
								if ( $( '#dynamic-popup' ).length ) {
									if ( ! main.controller.isLandscape && main.controller.isDrawerOpen ) {
										setTimeout( function() {
											emis.mobile.Utilities.repositionPopup( undefined, true );
										}, SCROLLTO_DELAY );
									} else {
										emis.mobile.Utilities.repositionPopup( undefined, true );
									}
								}
								if ( $( '#sharedOrgsPopup' ).length ) {
									emis.mobile.Utilities.repositionSharedOrgsPopup( windowWidth );
								}
								if ( emis.mobile.UI.isiPad && main.controller.isScreenKeyboard && $(".ui-datebox-screen:visible").length ) {
									var height = 0;
									var iOSVersion = emis.mobile.UI.getiOSversion()[0];
									if ( $.mobile.activePage.data( "role" ) == "dialog" ) {
										if ( parseInt( $.mobile.activePage.css( "min-height" ), 10 ) > $.mobile.activePage.height( )) {
											height = parseInt( $.mobile.activePage.css( "min-height" ), 10 );
										} else {
											height = $.mobile.activePage.height( );
										}
									} else {
										height = $.mobile.activePage.height( );
										height += parseInt( $.mobile.activePage.css( "padding-top" ), 10 );
										if ( iOSVersion >= 7 ) {
											height += 20; //ipad status bar? not sure, but works
										}
									}

									$(".ui-datebox-screen").css( {
										"height": height,
										"width": windowWidth,
										"left": ( main.controller.isDrawerOpen || main.controller.isLandscape ) ? "-200px" : "0px"
									} );
								};
							}
						}( currentWindowWidth ),0);

						$(document).trigger('emis.orientationchanged', [main.controller.isLandscape]) ;
					}

					if ( emis.mobile.UI.isAndroid && emis.mobile.UI.isNative && $( '#dynamic-popup' ).length ) {
						var $popupBackground = $( "#dynamic-popup-screen");
						var $popupContainer = $( "#dynamic-popup-popup" );
						$popupContainer.css( {
							"left" : "",
							"top" : "",
							"position" : ""
						});
						$popupBackground.add( $popupContainer ).hide();
						setTimeout( function() {
							callback();
						}, SCROLLTO_DELAY );
					} else {
						callback();
					}
				};

				if ( emis.mobile.nativeFrame.isNative ) {
					// there are problems with this values coming from Native Frame
					$( document ).on( 'emis-native.orientationchanged', emis.mobile.UI.orientationChangeDrawerFunction );
				} else {
					emis.mobile.UI.addOrientationEventsForDialog(emis.mobile.UI.orientationChangeDrawerFunction) ;
				}

				function orientationchangeFix( e, duration ) {
					var oldPageOffset = window.pageYOffset;
					var delay;
					if ( main.controller.isScreenKeyboard && emis.mobile.UI.isiPad ) {
						delay = SCROLLTO_DELAY_WITH_KEYBOARD;
					} else {
						delay = SCROLLTO_DELAY;
					}
					if ( duration ) {
						delay = duration;
					}
					setTimeout( function( ) {
						window.scrollTo( 50, 50 );
						window.scrollTo( 0, oldPageOffset );
						var drawer = $( "#drawer" );
						// fix for RM #65862
						if ( !main.controller.isLandscape ) {
							var activePage = ".ui-page-active";
							if ( main.controller.backPage && !main.controller.isScreenKeyboard ) {
								activePage = main.controller.backPage;
							}
							drawer.css( "z-index", "10000" );
							var oldActivePageMargin = parseInt( $( activePage ).css( "margin-left" ) );

							$( activePage ).css( "margin-left", ( oldActivePageMargin - 1 ) + "px" );

							setTimeout(function() { //timeout is a workaround for bug #128092
								drawer.hide( );
								$(activePage).css("margin-left", oldActivePageMargin + "px");

								if ($.mobile.activePage.data("role") !== "dialog" && main.controller.isDrawerOpen && !main.controller.isScreenKeyboard) {
									drawer.show();
								}
							}, 0)
						}

					}, delay );
					if ( e ) {
						e.preventDefault( );
					}
					return true;
				}

				// orientiation change bad layout iPad bug fix - (RM # 62514)
				( function iPadOrientationChangeBugFix( ) {
					if ( emis.mobile.UI.isiPad ) {
						window.addEventListener( "orientationchange", orientationchangeFix, false );
					}
				} )( );
				// end of iPadOrientationChangeBugFix ^^^

				/*
				 * Logged in box in drawer menu overlaps buttons in drawer on Samsung and possible other Android
				 * devices (but not Nexus 7)
				 */
				function androidDrawerLayoutFix( ) {
					if ( !emis.mobile.UI.isNexus7 ) {
						var drawer = $( "#drawer" );
						var lastLi = drawer.find( ".drawer-last-before-info" );
						var loggedInfo = drawer.find( "#drawer-logged-info" );
						var lastLiOffset = lastLi.offset( ).top;
						var loggedInfoOffset = loggedInfo.offset( ).top;
						var marginBetweenLastAndLogged = 10;

						var newBottom = -( lastLiOffset - loggedInfoOffset );

						if ( loggedInfoOffset < lastLiOffset ) {
							loggedInfo.css( "bottom", "" + newBottom + "px" );
						} else {
							if ( loggedInfoOffset != lastLiOffset ) {
								loggedInfo.css( "bottom", "" );
							}
						}
					}
				}

				// fix for bug RM #67664
				( function androidResizeBugFix( ) {
					if ( emis.mobile.UI.isAndroid ) {
						window.addEventListener( "resize", function( e ) {
							var drawer = $( "#drawer" );

							androidDrawerLayoutFix( );

							drawer.css( "margin-left", "1px" );
							drawer.css( "margin-left", "0px" );
							drawer.css( "left", "1px" );
							drawer.css( "left", "0px" );
							drawer.css( "margin-top", "1px" );
							drawer.css( "margin-top", "0px" );
							drawer.css( "top", "1px" );
							drawer.css( "top", "0px" );
						} );
					}
				} )( );

				/**
				 * hide keypad while changing orientation to prevent breaking of layout
				 */
				function hideKeyPad( ) {
					$( "input,textarea" ).trigger( "blur" );
				}

				/**
				 * these functions called on focusin and blur are needed for Contacts screen, because fixed
				 * header and footer doesn't work on mobile devices with software keyboard open.
				 */
				( function keyboardAndFixedLayoutFix( ) {
					var keyboardShowEvents, keyboardHideEvents = null;

					// I've disabled native events as they don't work correctly on both iOS and Android
					if ( emis.mobile.nativeFrame.isNative &&
							! emis.mobile.nativeFrame.android &&
							! emis.mobile.nativeFrame.ios ) {
						keyboardShowEvents = 'emis-native.keyboard.show';
						keyboardHideEvents = 'emis-native.keyboard.hide';
					} else {
						keyboardShowEvents = 'focusin';
						keyboardHideEvents = 'blur focusout';
					}

					//not("input[data-role='datebox']").
					$( document ).on( keyboardShowEvents, 'input:text, textarea, input:password, input[type="number"]', function( ) {
						if ( !main.controller.isScreenKeyboard ) {
							main.controller.isScreenKeyboard = true;

							var height = null ;
							if ( emis.mobile.UI.isiPad ) {
								$( main.controller.pageHeaders ).css( {
									"position": "absolute",
									"margin-left": "0px"
								} );

								var iOSVersion = emis.mobile.UI.getiOSversion()[0];
								if ( $.mobile.activePage.data( "role" ) == "dialog" ) {
									if ( parseInt( $.mobile.activePage.css( "min-height" ), 10 ) > $.mobile.activePage.height( )) {
										height = parseInt( $.mobile.activePage.css( "min-height" ), 10 );
									} else {
										height = $.mobile.activePage.height( );
									}
									if ( emis.mobile.nativeFrame.ios ) {
										var tempHeight = $( main.controller.backPage ).height();
										var headersHeight = $( main.controller.backPage + " .ui-header" ).height( ) + $( main.controller.backPage + " .appointmentsHeader" ).height( ) + $( main.controller.backPage + " .patientSummaryInfo" ).height( );
										tempHeight += headersHeight;
										if ( tempHeight > $.mobile.activePage.height( ) ) {
											height = tempHeight;
											$.mobile.activePage.css( "height", height );
										}
									}
								} else {
									height = $.mobile.activePage.height( );
									height += parseInt( $.mobile.activePage.css( "padding-top" ), 10 );
									if ( iOSVersion >= 7 ) {
										height += 20; //ipad status bar? not sure, but works
									}
								}

								var drawer = $( "#drawer" );
								drawer.css( {
									"position": "absolute",
									"height": height,
									"top": "0px"
								} );

							}
							androidDrawerLayoutFix( );

							if ( !main.controller.isLandscape && main.controller.isDrawerOpen ) {
								drawerMenuClick( );
							}

							if ( emis.mobile.UI.isiPad && $(".ui-datebox-screen:visible").length ) {
								$(".ui-datebox-screen").addClass("important-datebox-screen");
								$(".ui-datebox-screen").css( {
									"height": height,
									"width": $(window).width(),
									"top": "0px",
									"left": ( main.controller.isDrawerOpen || main.controller.isLandscape ) ? "-200px" : "0px"
								} );
							}

							if ( main.controller.keyboardHidingTimer ) {
								clearTimeout( main.controller.keyboardHidingTimer );
								main.controller.keyboardHidingTimer = null;
							}

							//emis.mobile.console.log( 'focusin on inputs' );
						}
					} );

					var hideKeyboardCallback = function() {
						if ( main.controller.isScreenKeyboard ) {
							main.controller.isScreenKeyboard = false;
							var drawer = $( "#drawer" );
							if ( emis.mobile.UI.isiPad ) {
								$( main.controller.pageHeaders ).css( "position", "fixed" );
								drawer.css( "position", "fixed" );
								drawer.css( "height", "100%" );

								$(".ui-datebox-screen").removeClass("important-datebox-screen");
								$(".ui-datebox-screen").css( {
									"position": "",
									"height": "",
									"width": "",
									"top": "",
									"left": ""
								} );

								$( document ).trigger( "emis.manageheaders" );

								orientationchangeFix( undefined, SCROLLTO_DELAY_WITH_KEYBOARD );
							}

							if ( emis.mobile.UI.isAndroid ) {
								drawer.find( "#drawer-logged-info" ).css( "bottom", "" );
							}

							//emis.mobile.console.log( 'blur on inputs' );
							if (emis.mobile.UI.isIE10 || emis.mobile.UI.isAtLeastIE11) {
								$(".ui-datebox-container > .ui-header > a.ui-btn-left").click()
							}

							main.controller.keyboardHidingTimer = setTimeout( function() {
								main.controller.keyboardHidingTimer = null;
								$( document ).trigger( "hiddenKeyboard" );
							}, SCROLLTO_DELAY_WITH_KEYBOARD );

						}
					}

					$( document ).on( keyboardHideEvents, 'input:text, textarea, input:password, input[type="number"]', hideKeyboardCallback );

					if ( emis.mobile.nativeFrame.android ) {
						$( document ).on( 'emis-native.event-keyboard-hidden', hideKeyboardCallback );
					}

					$( document ).on( 'click', 'select#consPropConsultationType', function( ) {
						// because of R#135279 bug, this is happening probably because select list is very very long...
						// I don't like this fix but currently I don't have a better idea
						if ( emis.mobile.UI.isiPad && ! main.controller.isLandscape && main.controller.isDrawerOpen ) {
							drawerMenuClick( );
						}
					} );
				} )( );

				/*
				 * Show no results information in lists on filtering if there are no results.
				 */
				( function listFilterHook( ) {
					$( document ).delegate( '[data-role="page"]', 'pageinit', function( ) {
						var $listview = $( this ).find( '[data-role="listview"]' );
						$( this ).delegate( 'input[data-type="search"]', 'keyup', function( ) {
							if ( $listview.children( ':visible' ).not( '.no-results' ).length === 0 ) {
								$( '.no-results' ).fadeIn( 500 );
							} else {
								$( '.no-results' ).fadeOut( 250 );
							}
						} );
					} );
				} )( );
				// end of listFilterHook ^^^

				/*
				 * pressing GO button on keyboard makes filter input lose focus and therefore hide keyboard
				 */
				$( document ).on( 'keyup', '.ui-listview-filter .ui-input-text', function( event ) {
					if ( event.keyCode == 13 ) {
						// 'Go' pressed
						$( '.ui-listview-filter .ui-input-text' ).trigger( 'blur' );
					}
				} );
				// end of GO button and keyboard fix ^^^

				if ( ! emis.mobile.nativeFrame.isNative ) {
					/**
					 * offline cache resources loading progress bar this script really needs to be run on pageload.
					 */
					( function CachedResourcesProgresssBar( ) {
						var progress = 0;
						var appCache = window.applicationCache;
						var cachedEvent = function( ) {
							$( "#progressBarInner" ).css( "width", "100%" );
							//setTimeout( function( ) {
								$( "#loading" ).fadeOut( 300 );
								$( "#loaded" ).fadeIn( 1000 );
							//}, 1000 );
						};

						function updateReadyEvent( ) {
							applicationCache.swapCache( );
							cachedEvent( );
							main.controller.askForUpdate = true;
						}


						appCache.addEventListener( 'progress', function( e ) {
							if ( offline ) {
								main.storage.setItem( "showManifestFailAlert", "true" );
								main.controller.gotoLoginPage() ;
							}
							$( "#loaded" ).hide( );
							$( "#loading" ).show( );
							var total = e.total;
							var w = e.loaded / total * 100;
							$( "#progressBarInner" ).css( "width", Math.round( w ) + "%" );
							if ( e.loaded == total ) {
								cachedEvent( );
								appCache.removeEventListener( 'cached', cachedEvent, false );
								appCache.removeEventListener( 'updateready', updateReadyEvent, false );
							}
						}, false );

						appCache.addEventListener( 'cached', cachedEvent, false );
						appCache.addEventListener( 'updateready', updateReadyEvent, false );
					} )( );
					// end of CachedResourcesProgresssBar ^^^
				}

				/**
				 * scrollBackFromDialog scrolling page to previous state while returning from dialog
				 */

				$( function scrollBackFromDialog( ) {
					$( document ).on( 'pageshow', 'div[data-role="page"]', function( e, ui ) {
						if ( main.controller.backFromDialog == true && main.controller.showWarningsAnyway == false ) {
							setTimeout( function( ) {
								emis.mobile.UI.scrollPage( window.scrolled );
							}, 300 );
						} else {
							var targ = e.target.id;
							if ( targ == 'patientsummary' ) {
								emis.mobile.UI.checkPatientWarnings( targ, ["SwapPatient", "ArrivePatient", "LoadMedicalRecord"] );
							} else if ( targ == 'addDrug' ) {
								emis.mobile.UI.checkPatientWarnings( targ, ["AddDrug", "IssueDrug"] );
							} else if ( targ == 'templateList' ) {
								emis.mobile.UI.checkPatientWarnings( targ, ["AddConsultation"] );
							} else if ( targ == 'bookAppointments' ) {
								emis.mobile.UI.checkPatientWarnings( targ, ["BookAppointment"] );
							}
							main.controller.showWarningsAnyway = false;
						}
						main.controller.backFromDialog = false;
					} );
				} );



				/**
				 * TransparentDialog making dialogs with transparent background works with css style (search for
				 * TransparentDialog in project)
				 */
				$( function transparentDialogBackground( ) {
					$( document ).on( 'pagebeforeshow', 'div[data-role="dialog"]', function( e, ui ) {
						if ( $( this ).data( "dialogRole" ) == "top-dialog" ) {
							return ;
						}

						main.controller.isInDialogPage = true;
						main.controller.backPage = "#" + ui.prevPage[0].id;
						ui.prevPage.addClass( "ui-dialog-background " );
					} );

					$( document ).on( 'pagehide', 'div[data-role="dialog"]', function( e, ui ) {
						if ( ui.nextPage && ui.nextPage.data( "dialogRole" ) == "top-dialog" ) {
							return ;
						}

						//uncomment below if page below dialog should be scrolled to previous position
						//$( main.controller.backPage ).css( "margin-top", "0px" );
						main.controller.isInDialogPage = false;
						main.controller.backFromDialog = true;
						main.controller.backPage = null;
						$( ".ui-dialog-background " ).removeClass( "ui-dialog-background " );
					} );
				} );
				// end of transparentDialogBackground ^^^

				$( document ).delegate("input[type=number]", "keypress", function( e ) {
					var el = $( this );
					var acceptsFloat = el.data("acceptFloat");
					var number = String.fromCharCode( e.keyCode );
					if ( acceptsFloat ){
						if ( !number.match( /[0-9]|\./ ) ) {
							return false;
						}
					} else {
						if ( !number.match( /[0-9]/ ) ) {
							return false;
						}
					}
					var currentNumber = '' + el.val();
					currentNumber = currentNumber.concat( '' + number );
					if ( acceptsFloat ){
						if ( ! ( /^([0-9]+)\.?([0-9]*)$/ ).test( currentNumber ) ) {
							// should match 0.9, .9, 123, 000.9999, 111.1, etc.
							return false;
						}
						currentNumber = parseFloat( currentNumber );
					} else {
						currentNumber = parseInt( currentNumber, 10 );
					}
					if ( isNaN( currentNumber ) ) {
						return false;
					}
					var min = el.attr( 'min' );
					var max = el.attr( 'max' );
					if ( ( min != undefined && min != null && min != '' ) || ( max != undefined && max != null && max != '' ) ) {
						// support for selecting whole input area
						// i.e. max value is 3 and there are already 3 numbers but user selected at least one of them
						// so we can override it
						var selectionType = "";
						if ( window.getSelection ) {
							selectionType = window.getSelection();
							if ( selectionType ) {
								selectionType = selectionType.type;
							}
						} else if ( document.getSelection ) {
							selectionType = document.getSelection();
							if ( selectionType ) {
								selectionType = selectionType.type;
							}
						} else if ( document.selection ) {
							selectionType = document.selection.type;
						}
						if ( selectionType && selectionType.toLowerCase() == 'range' ) {
							if ( number < min || number > max ) {
								return false;
							}
						}
						if ( ( currentNumber < min || currentNumber > max ) &&
								( ! selectionType || ( selectionType && selectionType.toLowerCase() != 'range' ) ) ) {
							return false;
						}
					}
				} );

				$( document ).delegate(".ui-datebox-container input", "keypress", function( e ) {
					// fix for R#134577, can't detect if .length > 2 because then user can't select text and replace it nor use backspace
					// this is happening because $( this ).val() contains value before any change was made
					if ( !String.fromCharCode( e.keyCode ).match( /[0-9]/ ) || $( this ).val().length > 8 ) {
						return false;
					}
				} );

				$(document).trigger('emis.appready') ;
				if ( emis.mobile.nativeFrame.isNative ) {
					$(document).trigger('emis.nativeappready') ;
				}

				// end application main init code
			} );
		}
	}

	return this;
	// end of constructor
};

/**
 * static helper function
 */
emis.mobile.UI.isiPad = ( /ipad/gi ).test( navigator.appVersion );
emis.mobile.UI.isAndroid = navigator.userAgent.toLowerCase( ).indexOf( "android" ) > -1;
emis.mobile.UI.isChrome = navigator.userAgent.toLowerCase( ).indexOf( "chrome" ) > -1;
emis.mobile.UI.isIE10 = navigator.userAgent.toLowerCase( ).indexOf( "msie 10" ) > -1;
emis.mobile.UI.isAtLeastIE11 = !!(navigator.userAgent.match(/Trident/) && !navigator.userAgent.match(/MSIE/));
emis.mobile.UI.isWindows = navigator.userAgent.toLowerCase( ).indexOf( "windows" ) > -1;
emis.mobile.UI.isSafari = navigator.userAgent.toLowerCase( ).indexOf( "safari" ) > -1;
emis.mobile.UI.isFirefox = navigator.userAgent.toLowerCase( ).indexOf( "firefox" ) > -1;
emis.mobile.UI.isNative = !( /(chrome|opera|firefox)/gi ).test( navigator.userAgent );
emis.mobile.UI.isNexus7 = navigator.userAgent.toLowerCase( ).indexOf( "nexus 7" ) > -1;
emis.mobile.UI.isSamsung = navigator.userAgent.toLowerCase().search(/(gt|sm){1}-[a-z]{1}[0-9]{1,4}/) > -1;
emis.mobile.UI.isDrawerOpened = function() {
	return ($("#drawer").css('display') === "block")
}

emis.mobile.UI.getiOSversion = function() {
	if (/iP(hone|od|ad)/.test(navigator.platform)) {
		var v = (navigator.appVersion).match(/OS (\d+)_(\d+)_?(\d+)?/);
		return [parseInt(v[1], 10), parseInt(v[2], 10), parseInt(v[3] || 0, 10)];
	}
};

emis.mobile.UI.setHeader = function( $page, header ) {
	$header = $( header );
	$header.detach( );
	$header.prependTo( $page );
	$header.trigger( "create" );
};

emis.mobile.UI.prepareBookAppointmentsPage = function( $page ) {
	emis.mobile.UI.setHeader( $page, "#headerBookAppointments" );
	emis.mobile.UI.buildAlerts( $page.selector );
	$( '#bookAppointmentsHeaderTitle' ).html( main.controller.patient.name );
};

emis.mobile.UI.prepareAddDrugPage = function( $page ) {
	emis.mobile.UI.setHeader( $page, "#headerAddDrug" );
	emis.mobile.UI.buildAlerts( $page.selector );
	$( '#addDrug #patientHeaderTitle' ).html( main.controller.patient.name );
};

/**
 * set patient page header and footer
 *
 * @param {Object} $page
 */
emis.mobile.UI.preparePatientPage = function( $page, isPatientSummary ) {
	emis.mobile.UI.setHeader( $page, "#headerPatient" );
	var div = $( $page.selector + ' #addContactButton' );
	if ( $page.selector == "#patientsummary" ) {
		div.show( );
	} else {
		div.hide( );
	}

	div.off( 'click' ).on( 'click', function( ) {
		if ( $( this ).hasClass( "ui-disabled" ) ) {
			return false;
		}
		$.mobile.changePage( "#templateList", {
			delay: true
		} );
	} );

	emis.mobile.UI.buildAlerts( $page.selector );
	$( $page.selector + ' #patientHeaderTitle' ).html( main.controller.patient.name );
};

emis.mobile.UI.fixWindowWidth = function( windowWidth ) {
	var mainWindowsSelector = ".contentWrapper, .ui-header.ui-header-fixed.own-header, .patientSummaryInfo, .pageHeader";
	var drawer = $("#drawer");
	if (main.controller.isLandscape == true)
		$(mainWindowsSelector).css('width', windowWidth - (drawer.is(':visible') ? drawer.width() : 0) + 'px')
	else
		$(mainWindowsSelector).css('width', windowWidth + 'px')
}

emis.mobile.UI.preparePatientHeader = function () {

	var data = main.dataProvider.getPatientDemographic( );
	$( ".patientSummaryInfo" ).html( emis.mobile.UI.getPrecisBar( data, main.util.standardizeDate( data.birthDate ) ) );



	$('.patient-info .syncBtn').on('click', function (event){
		if ($(this).hasClass('ui-disabled')) {
			return false ;
		}
		if (!offline) {
			main.controller.syncSinglePatientSlotId = main.controller.slotId ;
			main.controller.syncSinglePatientReturnPage = $.mobile.activePage.selector;
			emis.mobile.UI.startSynchronize();
		}
	}) ;
	// update state of the button
	emis.mobile.UI.updateSyncButtons () ;

	$('.patientSummaryInfo .patientDetailsInfo').on('click', function (event){
		//var patient = main.dataProvider.getPatientContext() ;
		emis.mobile.UI.openPatientDetails(main.controller.slotId) ;
	}) ;
}

var buildAlertsList = function( alerts, pageSelector ) {
	var markup = '';
	for ( var a = 0; a < alerts.length; a++ ) {
		markup += '<div class="alertMessage"><span class="text"">';
		markup += alerts[a].summaryMessage;
		markup += '</span><a data-role="none" class="dismissAlert standaloneButton button">Dismiss</a>';
		markup += '</div>';
	}
	/*
	 * detailedMessage: "PatientisonthefollowingQOFregisters–PatientonDementiaregister" priority: "Low" summaryMessage:
	 */

	$( pageSelector + ' .alertsContainer' ).html( markup ).prepend( '<div class="arrow-up"></div>' );
	$( pageSelector + ' .alertsBubble' ).html( alerts.length );
	$( pageSelector + ' .dismissAlert' ).off( 'click' ).on( 'click', function( ) {
		var elToDismiss = $( this ).parent();
		var index = elToDismiss.prevAll( ".alertMessage" ).length;
		elToDismiss.remove( );
		main.dataProvider.removePatientAlertByIndex( index );
		alerts.splice( $.inArray( index, alerts ), 1 );
		var btn = $( pageSelector + ' .alertsButtonContainer' );
		if ( alerts.length == 0 ) {
			btn.addClass( 'ui-disabled' ).removeClass( "pressed" );
			$( pageSelector + ' .alertsContainer' ).hide( );
		} else {
			btn.removeClass( 'ui-disabled' );
		}
		$( pageSelector + ' .alertsBubble' ).html( alerts.length );
	} );
};

emis.mobile.UI.buildAlerts = function( pageSelector ) {
	$( pageSelector + ' .alertMessage' ).remove( );
	var alertsElement = $( pageSelector + ' .alertsContainer' );
	alertsElement.hide( );
	var alerts = main.dataProvider.getPatientAlerts( );
	var btn = $( pageSelector + ' .alertsButtonContainer' );
	if (alerts &&  alerts.length ) {

		buildAlertsList( alerts, pageSelector );
		btn.removeClass( 'ui-disabled' );
		btn.off( 'click' ).on( 'click', function( e ) {
			if ( $( this ).hasClass( "ui-disabled" ) ) {
				return;
			}
			e.preventDefault( );
			e.stopPropagation( );
			alertsElement.toggle( );
			if ( alertsElement.is( ":visible" ) ) {
				btn.addClass( "pressed" );
			} else {
				btn.removeClass( "pressed" );
			}
		} );
	} else {
		btn.addClass( 'ui-disabled' );
		$( '.alertsBubble' ).html( '0' );
	}
};

var formatDate = function( dt ) {
	var stdDate = main.util.standardizeDate( dt );
	var dateToDay = main.util.getDate( dt );
	var weekDay = main.util.getWeekDayShort( dateToDay );
	var stdTime = main.util.standardizeTime( dt );
	return stdTime + ' ' + weekDay + ' ' + stdDate;
};

emis.mobile.UI.prepareTemplatePage = function( $page ) {
	emis.mobile.UI.setHeader( $page, "#headerTemplates" );

	var btn = $("#templateList #changeTemplate");
	btn.unbind();
	btn.show();
	var currentAppointments = main.dataProvider.getCurrentPatientAppointments();
	var html = "";
	var appt = main.controller.currentlySelectedAppointment;
	for ( var i = 0; i < currentAppointments.length; i++ ) {
		var time = formatDate(currentAppointments[i].StartDateTime);
		if (currentAppointments.length == 1) {
			btn.html(time);
			html += "<a href='' data-role='none' class='templateItem'>No other appointments</a>";
		} else {
			if (appt.SlotId == currentAppointments[i].SlotId) {
				btn.html(time);
			} else {
				html += "\n<a href='#' data-slotid='"+currentAppointments[i].SlotId+"' ";
				html += "id='Slot_"+currentAppointments[i].SlotId+"' data-role='none' class='templateItem";
				if (currentAppointments[i].SlotId == main.controller.slotId) {
					html+=" pressed'>";
				} else {
					html+=" '>";
				}
				html += time;
				html += "</a>";
			}
		}
	}

	var div = $('#templateList #changeTemplateDiv');
	$("#templateList .templateChange").on('click',function( event ) {
		div.toggle();
		event.preventDefault();
		event.stopPropagation();
		return true;
	});

	div.html(html);
	if(!main.controller.documentBindedForChangeContact) {
		main.controller.documentBindedForChangeContact = true;
		$( "#templateList" ).on( 'click', function( e ) {
			div.hide();
		} );
	}
	div.unbind();
	div.on( 'click', function( e ) {
		$( "#templateList #changeTemplateDiv a.templateItem" ).removeClass( "pressed" );
		$( e.target ).addClass( "pressed" );
		var slotId = $( e.target ).data( "slotid" );

		if(slotId!="addnew") {
			div.toggle();
			if ( slotId ) {
				emis.mobile.UI.slotChange(slotId);
			}
		} else if ( ! offline ) {
			$.mobile.changePage("#bookAppointments",{delay:true});
		}
	} );

	// some devel code for v3
	/*var currentAppointments = main.dataProvider.getCurrentPatientAppointments( );
	var html = "";
	var appt = main.controller.currentlySelectedAppointment;

	$('#contactLabel .time').html (formatDate(appt.StartDateTime)) ;

	markup = '<div class="arrow-up"></div>' ;

	$.each( currentAppointments, function( key, value ) {
		var time = formatDate( value.StartDateTime );
		var selected = '' ;
		if (appt.SlotId == value.SlotId) {
			selected = 'pressed' ;
		}
		markup += '<a href = "#" data-slotid = "'+value.SlotId+'" data-role = "none" class="menuItem '+selected+'" data-title="'+time+'" >'+time+'<span class="tick">&#10003;</span> </a>';
	}) ;

	$('#selectPatientContactDiv').html(markup) ;
	*/

	emis.mobile.UI.buildAlerts( $page.selector );
	$( $page.selector + ' #patientHeaderTitle' ).html( main.controller.patient.name );
};

emis.mobile.UI.prepareMedicationPage = function( $page ) {
	emis.mobile.UI.setHeader( $page, "#headerMedications" );
	emis.mobile.UI.injectSelectMenu( $page.selector );

	emis.mobile.UI.buildAlerts( $page.selector );
	$( $page.selector + ' #patientHeaderTitle' ).html( main.controller.patient.name );
};

emis.mobile.UI.injectSelectMenu = function( pageId, addButton ) {
	var btn = $( pageId + ' #selectPatientRecordBtn' );
	var btnExists = btn.length;
	if ( btnExists == 0 ) {
		var content = $( pageId + ' .contentWrapper div:first-child' ).html( );
		var markup = '';
		markup += '<div data-role = "none" class="menuAboveContent">';

		var items = {
			"#patientsummary": "Summary",
			"#patientmedications": "Medication",
			"#patientconsultations": "Consultations",
			"#patientproblemslist": "Problems",
			"#patientvalues":"Values",
			"#patientreferrals": "Referrals",
			"#patientimmunisations": "Immunisations",
			"#patientallergies": "Allergies",
			"#patientdiary": "Diary",
			"#patientdocuments": "Documents"
		} ;
		var label = items[pageId] ;

		markup += '<label id="selectPatientRecordBtn" data-role = "none">' + label + '</label>';


		markup += '<div class = "commonComponents" id = "selectPatientRecordDiv">';
		markup += '<div class = "arrow-up"></div>';

		$.each( items, function( key, value ) {
			markup += '<a href = "#" data-topage = "'+key+'" id="'+value+'Btn" data-role = "none" class="menuItem" data-title="'+value+'" >'+value+'<span class="tick">&#10003;</span> </a>';
		}) ;

		markup += '</div></div>';
		markup += content;
		$( pageId + ' .contentWrapper div:first-child' ).html( markup ).find( 'a[data-topage="' + pageId + '"]' ).addClass( "pressed" );

		// add click event handler
		emis.mobile.UI.bindMenuEvents( pageId );
	} else {
		$( pageId + ' .contentWrapper div:first-child a' ).removeClass( 'pressed' );
		var link = $( pageId + ' .contentWrapper div:first-child' ).find( 'a[data-topage="' + pageId + '"]' );
		link.addClass( "pressed" );
	}
};

/*
 * events for the 'select record view' menu
 *
 */
emis.mobile.UI.bindMenuEvents = function( pageId ) {


	function toggleMenu( ) {
		$( pageId + ' #selectPatientRecordDiv' ).toggle( );
	}

	function hideMenu( ) {
		$( pageId + ' #selectPatientRecordDiv' ).hide( );
	}




	$( pageId + " #selectPatientRecordDiv" ).on( 'click', function( e ) {
		// event catched by children of menu div element
		// add pressed class to actual button
		//$( pageId + " #selectPatientRecordDiv a.menuItem" ).removeClass( "pressed" );

		var $el = $( e.target );
		if ( $el.is( "span" ) ) {
			$el = $el.parent( );
		}
		var toPage = $el.data( "topage" );
		$el.addClass( "pressed" );
		if ( toPage ) {
			$.mobile.changePage( toPage, {
				delay: true
			} );
		}

		e.preventDefault( );
		e.stopPropagation( );

		// wait for page change
		hideMenu () ;
	} );





	$( document ).on( 'click', function( e ) {
		var $target = $( e.target );
		if ( $target.attr( "id" ) != "selectPatientRecordBtn" && $target.parent( ).attr( "id" ) != "selectPatientRecordBtn" ) {
			hideMenu( );
		}
	} );

	$( pageId + ' #selectPatientRecordBtn' ).on( 'click', function( event ) {
		toggleMenu( );
		event.preventDefault( );
		event.stopPropagation( );

		var closeMe = function() {
			toggleMenu( );
			$("a[class!='menuItem']").off('click', closeMe)
		}
		$("a[class!='menuItem']").on('click', closeMe);

	} );
};

// constrollers and storage are ready
$(document).one('emis.appready', function() {

	/**
	* update stars and sync buttons on every page change
	*/
	$( document ).on( 'pageshow', ":jqmData(role='page')", function( e ) {
		emis.mobile.UI.updateDrawerStars () ;
		emis.mobile.UI.updateSyncButtons () ;
	} );



	/**** CUSTOM EVENTS *****/
	// TODO: namespace
	/**
	* catch all needsync events from: tasks, eventsets, drugs, quicknotes
	* if type is undefined update all types
	*/
	$(document).on('emis.needsync', function(event, type){
		if (!type || type == 'tasks') {
			emis.mobile.UI.updateDrawerTasksStar(main) ;
		}
		if (!type || type == 'contact') {
			emis.mobile.UI.updateDrawerContactStar(main) ;
		}
		if (!type || type == 'drugs') {
			emis.mobile.UI.updateDrawerNewDrugStar(main) ;
		}
		if (!type || type == 'schedules') {
			emis.mobile.UI.updateDrawerAddNewAppointmentStar(main) ;
		}
		emis.mobile.UI.updateSyncButtons () ;

	}) ;

	/**
	* Triggered when one of the pages or all of them need to be refreshed
	*/
	$(document).on('emis.needrefresh', function(event, page) {
		page = page || 'all' ;
		if (page == 'all') {
			main.controller.makeAllSubpagesRefreshable() ;
		} else {
			main.controller.refreshPages[page] = true ;
		}
	}) ;

}) ;

/**
* encryption key has been obtained and storage is ready to use
* this event is run only once when encryption key is loaded
*/
$(document).one('emis.encryptionready', function(event){
	emis.mobile.UI.updateLastSyncInfo () ;
	window.clearTimeout(emis.mobile.UI.autoSyncTimeout) ;
	emis.mobile.UI.autoSyncTimeout = window.setTimeout(emis.mobile.UI.checkAutoSync, AUTO_SYNC_INTERVAL) ;
}) ;


/**
* triggered when synchronizing has ended, either complted or failed
*/
$(document).on('emis.syncstatusupdated', function(event, type, patientId){
	emis.mobile.UI.updateLastSyncInfo () ;
	// set all pages refreshable
	jQuery(document).trigger('emis.needrefresh', ['all']) ;

	if (type == 'completed') {
		// only auto sync for global synchronization
		if (!patientId) {
			window.clearTimeout(emis.mobile.UI.autoSyncTimeout) ;
			emis.mobile.UI.autoSyncTimeout = window.setTimeout(emis.mobile.UI.checkAutoSync, AUTO_SYNC_INTERVAL) ;
		}
	} else if (type == 'failed') {
		main.controller.makeAllSubpagesRefreshable() ;
	}
}) ;

$(document).on('emis.orientationchanged', function (event, isLandscape){
	var cls = isLandscape ? 'landscape' : 'portrait' ;
	if (!$('body').hasClass(cls)) {
		$('body').removeClass('portrait').removeClass('landscape').addClass(cls) ;
	}
}) ;



/**** </EVENTS> *****/

//checks if user should perform synchronization
emis.mobile.UI.checkAutoSync = function () {

	var usm = new emis.mobile.UserSessionModel( ) ;
	var lastSyncDate = usm.getAutoLastSyncDate() ;
	if ( lastSyncDate && lastSyncDate != null && lastSyncDate != "null" ) {
		var dateObj = {} ;
		try {
			dateObj = JSON.parse( lastSyncDate );
		} catch (e) {}

		// auto check is made only if any synchronization was made before
		if (dateObj.time) {
			if (dateObj.time + AUTO_SYNC_INTERVAL <= new Date().getTime()) {
				emis.mobile.Utilities.customConfirmPopup( { ok: "Yes", cancel: "Later", message: 'Synchronize your data now?', title: 'Synchronize now?', callback: function( r ) {
					if ( r === true ) {
						emis.mobile.UI.startSynchronize() ;
					} else {
						// save current date and ask later in x hours
						window.clearTimeout(emis.mobile.UI.autoSyncTimeout) ;
						emis.mobile.UI.autoSyncTimeout = window.setTimeout(emis.mobile.UI.checkAutoSync, AUTO_SYNC_ASK_INTERVAL) ;
					}
				} } );
			}
		}
	}
} ;

emis.mobile.UI.startSynchronize = function () {
	main.controller.syncReturnPage = $.mobile.activePage.selector;
	//alert("changing page to sync screen");
	$.mobile.changePage("#syncLoading");
} ;


emis.mobile.UI.updateSyncButtons = function () {
	// update sync buttons state for current patient
	if (window.offline) {
		$('.patient-info .syncBtn').addClass ('ui-disabled') ;
	} else {
		var needSync = main.dataProvider.getSlotIdsNeedSync(true) ;

		if (needSync.indexOf(main.controller.slotId) > -1) {
			$('.patient-info .syncBtn').removeClass ('ui-disabled') ;
		} else {
			$('.patient-info .syncBtn').addClass ('ui-disabled') ;
		}
	}
} ;

emis.mobile.UI.slotChange = function( slotId ) {
	if ( main.controller.slotId ) {
		main.controller.previousSlotId = main.controller.slotId;
	}
	main.controller.slotId = slotId;
	main.controller.currentlySelectedAppointment = main.dataProvider.getAppointmentById( slotId );
	//jQuery(document).trigger('emis.needsync') ;
	emis.mobile.UI.updateDrawerStars () ;
	if ( $.mobile.activePage[0].id != "templateList" ) {
		$.mobile.changePage( '#patientsummary', {
			delay: true
		} );
	} else {
		$.mobile.changePage( '#templateList', {
			delay: true
		} );
	}
};


/**
 * set appoinmtents page header and footer
 *
 * @param {Object} $page
 */
emis.mobile.UI.prepareAppointmentsPage = function( $page ) {
	emis.mobile.UI.setHeader( $page, "#headerAppointments" );
	// drawer star icons
	$( "#drawer div.drawer-star" ).hide( );
};

emis.mobile.UI.prepareCaseloadsPage = function( $page ) {
	emis.mobile.UI.setHeader( $page, "#headerCaseloads" );
	// drawer star icons
	$( "#drawer div.drawer-star" ).hide( );
};


emis.mobile.UI.updateLastSyncInfo = function (){


	var storage = new emis.mobile.Storage( );

	var usm = new emis.mobile.UserSessionModel( ) ;
	var lastSyncDate = usm.getLastSyncDate() ;

	if ( lastSyncDate && lastSyncDate != null && lastSyncDate != "null" ) {

		var dateObj = JSON.parse( lastSyncDate );
		var dateStr = dateObj.date.replace( ",", "" );
		var dateArr = dateStr.split( " " );

		$( "#drawer-last-sync .date" ).html( dateArr[1] + " " + dateArr[0] );
	} else {

		$( "#drawer-last-sync .date" ).html( "NEVER" );
	}

} ;


emis.mobile.UI.updateDrawerStars = function() {
	emis.mobile.UI.updateDrawerContactStar();
	emis.mobile.UI.updateDrawerTasksStar();
	emis.mobile.UI.updateDrawerNewDrugStar();
	emis.mobile.UI.updateDrawerAddNewAppointmentStar();
};

/**
 * update visibility state of drawer contacts item
 */
emis.mobile.UI.updateDrawerContactStar = function() {
	var totalTmpContact = main.dataProvider.getCompletedEventsets();
	var totalQuickNote = main.dataProvider.findAllPatientIdsWithQuickNotes();
	var totoalEncounterIds = main.storage.findAll( "Encounter" );
	var isValidEncounter=false;
	for (var id in totoalEncounterIds) {
		var encounterobj = JSON.parse(main.storage.find("Encounter",id));
		if(encounterobj && encounterobj.careEpisode && encounterobj.careEpisode.rttStatus)
		{
			isValidEncounter=true;
			break;
		}
	};

	var tmpContact = main.dataProvider.getCompletedEventsets( {
		patientId: main.dataProvider.getPatientContext( ).id + "#" + main.controller.slotId
	} );
	var quickNote = main.storage.getItem( "quickNote_" + main.controller.patient.id + "#" + main.controller.slotId );
	var encounterStr = main.storage.find("Encounter",main.controller.patient.id + "#" + main.controller.slotId);
	var encounter;
	try {

		if ( ( totalTmpContact && totalTmpContact.length > 0 ) || totalQuickNote.length>0
			|| isValidEncounter ) {
			main.storage.setItem("is_data_synced_contact",false);
		} else {
			main.storage.setItem("is_data_synced_contact",true);
		}

		encounter = JSON.parse(encounterStr);
		if ( ( tmpContact && tmpContact.length > 0 ) || quickNote
			|| (encounter && encounter.careEpisode && encounter.careEpisode.rttStatus)  ) {
			$( "#drawer-contact div.drawer-star" ).css( "display", "inline-block" );
		} else {
			$( "#drawer-contact div.drawer-star" ).css( "display", "none" );
		}
	} catch(err) {
		$( "#drawer-contact div.drawer-star" ).css( "display", "none" );
	};
};

emis.mobile.UI.updateDrawerTasksStar = function() {
	var totalList = main.dataProvider.findAllTasks();
	var list = main.dataProvider.findTasks( {
		patientId: main.dataProvider.getPatientContext( ).id
	} );

	if ( totalList && totalList.length > 0 ) {
		main.storage.setItem("is_data_synced_task",false);
	} else {
		main.storage.setItem("is_data_synced_task",true);
	}

	if ( list && list.length > 0 ) {
		$( "#drawer-tasks div.drawer-star" ).css( "display", "inline-block" );
	} else {
		$( "#drawer-tasks div.drawer-star" ).css( "display", "none" );
	}
}
emis.mobile.UI.updateDrawerNewDrugStar = function() {
	var totalList = main.dataProvider.getNewDrugs();
	var list = main.dataProvider.getNewDrugsForPatient( main.dataProvider.getPatientContext( ).id );

	if ( totalList && totalList.length > 0 ) {
		main.storage.setItem("is_data_synced_drug",false);
	} else {
		main.storage.setItem("is_data_synced_drug",true);
	}

	if ( list && list.length > 0 ) {
		$( "#drawer-new-drug div.drawer-star" ).css( "display", "inline-block" );
	} else {
		$( "#drawer-new-drug div.drawer-star" ).css( "display", "none" );
	}
}
emis.mobile.UI.updateDrawerAddNewAppointmentStar = function() {
	var totalList = main.dataProvider.getScheduleIdsForSync();
	var list = main.dataProvider.getScheduleIdsForSync( main.dataProvider.getPatientContext( ).id );
	if ( totalList && totalList.length > 0 ) {
		main.storage.setItem("is_data_synced_appointment",false);
	} else {
		main.storage.setItem("is_data_synced_appointment",true);
	}
	if ( list && list.length > 0 ) {
		$( "#drawer-new-appointment div.drawer-star" ).css( "display", "inline-block" );
	} else {
		$( "#drawer-new-appointment div.drawer-star" ).css( "display", "none" );
	}
}

emis.mobile.UI.updateDrawerLoggedInfo = function() {
	$( "#drawer-user" ).html( main.controller.user.name );
	$( "#drawer-date" ).html( main.util.standardizeDate(main.util.getISONowDate( ) ) );
	$( "#app-version" ).html( APP_VERSION );
}

emis.mobile.UI.calculateDialogPadding = function( appObject, dialogPage, maxHeight ) {
	// add "+ appObject.controller.backPageOffsetY"
	// if page below dialog should be scrolled to previous position
	var height;
	var minHeight = 250;
	var dialogPageHeight = dialogPage ? dialogPage.height() : 0;
	var page = appObject.controller.backPage;
	if ( ! page ) {
		page = $.mobile.activePage.selector;
	}
	var headersHeight = $( page + " .ui-header" ).height( ) + $( page + " .appointmentsHeader" ).height( ) + $( page + " .patientSummaryInfo" ).height( );

	var iPadSpecialCondition = emis.mobile.UI.isiPad && appObject.controller.isScreenKeyboard;
	if ( iPadSpecialCondition ) {
		if ( window.orientation === 0 || window.orientation === 180 ) {
			height = appObject.controller.windowLandscapeWidth;
		} else {
			height = appObject.controller.windowLandscapeHeight;
		}
		var iOSVersion = emis.mobile.UI.getiOSversion()[0];
		if ( window.navigator.standalone ) {
			height -= 20;
			// minus iPad status bar
		} else {
			// minus navbar and tabbar
			if ( $.mobile.activePage.data( "role" ) === "dialog" ) {
				height -= 10; // minus iPad status bar (?) - well.. I've tested it and it looks ok
			}
			if ( iOSVersion < 7 ) {
				height -= 44; // minus iPad nav bar
				height -= 49; // minus iPad tab bar
			} else {
				height -= 69;
			}
		}
	} else {
		if ( appObject.controller.isScreenKeyboard ) {
			height = $( page + " .ui-content" ).height( );
			padding = $( page + " .ui-content" ).css( "padding" );
			height += ( 2 * parseInt( padding ) );
		} else {
			height = window.innerHeight;
		}
	}

	if ( emis.mobile.UI.isiPad && appObject.controller.isScreenKeyboard ) {
		$( "#drawer" ).css( "height", height );
	} else {
		$( "#drawer" ).css( "height", "" );
	}

	if ( emis.mobile.UI.isWindows ) {
		height2 = window.screen.height - 100;
	} else {
		height2 = window.innerHeight;
	}
	var bCheckDialogPageHeight = true;
	if ( emis.mobile.UI.isAndroid && dialogPage &&
			( dialogPage.selector == "#selectTemplate" ||
			dialogPage.selector == "#patientimmunisationshistory" ||
			dialogPage.selector == "#taskallusers" ||
			dialogPage.selector == "#patientvalueshistory" ||
			dialogPage.selector == "#patientvaluesmultihistory" ||
			dialogPage.selector == "#listViewCodes" ) ) {
		bCheckDialogPageHeight = false;
		// don't check dialog page height if dialog height is calculated later by ourself to fit the screen height
	}
	if ( dialogPage && dialogPageHeight > height2 && bCheckDialogPageHeight ) {
		height2 = dialogPageHeight;
	}
	if ( maxHeight && maxHeight > height2 ) {
		height2 = maxHeight;
	}
	height -= headersHeight;
	height2 -= headersHeight;

	if ( ( !appObject.controller.isScreenKeyboard || !appObject.controller.isLandscape || page == "#taskList" || dialogPage ) && ! iPadSpecialCondition ) {
		height = height2;
	}
	if ( height < minHeight ) {
		height = minHeight;
	}

	return height;
};


// only for native frame and dialogs longer than back page where keyboard can be opened and it is already opened
emis.mobile.UI.setDialogHeight = function( dialogPage, backPage ) {
	if ( emis.mobile.nativeFrame.ios && main.controller.isScreenKeyboard ) {
		var backPageHeight = $( backPage ).height() + $( backPage + " .ui-header" ).height( ) + $( backPage + " .appointmentsHeader" ).height( ) + $( backPage + " .patientSummaryInfo" ).height( );
		if ( backPageHeight > dialogPage.height( ) ) {
			dialogPage.css( "height", backPageHeight );
		}
	}
};

emis.mobile.UI.addOrientationEventsForDialog = function( eventCallback ) {
	if ( emis.mobile.UI.isiPad ) {
		window.addEventListener( 'orientationchange', eventCallback );
	} else if ( emis.mobile.UI.isAndroid ) {
		window.addEventListener( 'resize', eventCallback );
	} else if ( emis.mobile.UI.isIE10 || emis.mobile.UI.isAtLeastIE11) {
		window.addEventListener( 'customOrientationChange', eventCallback );
		window.addEventListener( 'resize', eventCallback );
	} else {
		window.addEventListener( 'resize', eventCallback );
	}
};

emis.mobile.UI.tryBind = function(to, event, handler) {
	var found = false;
	if (typeof jQuery._data(to[0]).events[event] !== 'undefined') {
		$.each(jQuery._data(to[0]).events[event], function(index, value) {
			if (value.handler === handler)
				found = true;
		})
	}
	if (!found)
		to.on(event, handler);
}

emis.mobile.UI.tryBindShowHideToPage = function($page, pageShowHandler, pageHideHandler) {
	emis.mobile.UI.tryBind($page, 'pageshow', pageShowHandler);
	emis.mobile.UI.tryBind($page, 'pagehide', pageHideHandler);

}

emis.mobile.UI.removeOrientationEventsForDialog = function( eventCallback ) {
	if ( emis.mobile.UI.isiPad ) {
		window.removeEventListener( 'orientationchange', eventCallback );
	} else if ( emis.mobile.UI.isAndroid ) {
		window.removeEventListener( 'resize', eventCallback );
	} else if ( emis.mobile.UI.isIE10 || emis.mobile.UI.isAtLeastIE11) {
		window.removeEventListener( 'customOrientationChange', eventCallback );
		window.removeEventListener( 'resize', eventCallback );
	} else
		window.removeEventListener( 'resize', eventCallback );
};

emis.mobile.UI.fixUIByScrolling = function( ) {
	var oldPageYOffset = window.pageYOffset;
	var oldPageXOffset = window.pageXOffset;
	setTimeout( function( ) {
		window.scrollTo( window.pageXOffset + 1, window.pageYOffset + 1 );
		window.scrollTo( oldPageXOffset, oldPageYOffset );
	}, 100 );
};

emis.mobile.UI.getPrecisBar = function( data, birthDate ) {
	var age = data.age ? data.age : 'Unknown';
	var nhs = data.primaryIdentifier ? emis.mobile.Utilities.prepareNHS( data.primaryIdentifier ) : 'Unknown';
	var gender = data.gender ? data.gender : 'Unknown';

	var cls = offline ? 'ui-disabled' : '' ;

	var syncButton = '<a class="need-online syncBtn standaloneButton standaloneButton-dark '+cls+'" href="#" data-role="none"><div class="sprite sync"></div></a>' ;

	var markup = '<div class="patient-info">';
	//markup += '<div class="patient-info-el syncBtnField">' + syncButton+ '</div>';
	markup += '<div class="patient-info-el">' + '<div class="info-name">Born</div>' + '<div class="info-data">' + birthDate + ' (' + age + ')' + '</div>' + '</div>' + '<div class="patient-info-el">' + '<div class="info-name">NHS number</div>' + '<div class="info-data">' + nhs + '</div>' + '</div>' + '<div class="patient-info-el">' + '<div class="info-name">Gender</div>' + '<div class="info-data">' + gender + '</div>' + '</div>';
	markup += '<div class="patient-info-el info-button"><a data-role="none" class="standaloneButton standaloneButton-dark patientDetailsInfo"><span class="icon">&nbsp;</span></a></div>' ;
	markup += '</div>' ;
	return markup ;
};

emis.mobile.UI.openPatientDetails = function(slotId) {
	main.controller.patientDetailsBackgroundPage = '#' + $.mobile.activePage[0].id;
	// check if there is patientRecord
	var app = main.dataProvider.getAppointmentById(slotId) ;
	if (app) {
		var pr = main.dataProvider.getPatientById(app.PatientId) ;
		if (!pr) {
			return false ;
		}
	}

	var page = offline ? "#patientDetailsOffline" : '#patientDetails' ;
	var ctrl = main.controller.getFormController(page) ;
	ctrl.slotId = slotId ;
	if(app)
		ctrl.patientId = app.PatientId;
	$.mobile.changePage(page , {
		delay: true
	} );

};

emis.mobile.UI.buildWarningsList = function( warnings ) {
	var markup = '';
	if ( warnings.length > 0 ) {
		markup += '<ul>';
		for ( var warn in warnings ) {
			markup += '<li>' + _.h(warnings[warn].term) + '</li>';
		}
		markup += '</ul>';
	} else {
		markup = 'We couldn\'t get patient warnings for you. Try again later.';
	}
	return markup;
};

emis.mobile.UI.checkPatientWarnings = function( source, triggers ) {
	var patientWarningsData = [];
	for (var j in triggers ) {
		var patientWarnings = main.dataProvider.getPatientWarningsByTrigger( triggers[j] );
		if ( patientWarnings.length > 0 ) {
			for ( var i in patientWarnings ) {
				var foundWarning = false;
				for (var k in main.controller.warningsDisplayed ) {
					if ( patientWarnings[i].id == main.controller.warningsDisplayed[k] ) {
						foundWarning = true;
						break;
					}
				}
				if ( foundWarning ) {
					continue;
				} else {
					main.controller.warningsDisplayed.push( patientWarnings[i].id );
				}
				occured = false;
				for ( var k in patientWarningsData ) {
					if ( patientWarningsData[k].term == patientWarnings[i].term ) {
						occured = true;
						break;
					}
				}
				if ( !occured ) {
					patientWarningsData.push( patientWarnings[i] );
				}
			}
		}
	}
	if ( patientWarningsData.length > 0 ) {
		setTimeout( function() {
			emis.mobile.Utilities.alert({
				title: "Patient Warnings",
				bPatientWarnings: true,
				ok: "Close",
				message: emis.mobile.UI.buildWarningsList( patientWarningsData ),
				backPage: source
			});
		}, 1000 );
	}
};

emis.mobile.UI.scrollPage = function( val ) {
	if ( emis.mobile.UI.isiPad ) {
		window.scrollTo(0, val);
	} else {
		$( 'html, body' ).animate( {
			scrollTop: val
		}, 10 );
	}
};

emis.mobile.UI.immediateScrollPageY = function( val ) {
	if ( emis.mobile.UI.isiPad ) {
		window.scrollTo(0, val);
	} else {
		$( 'html, body' ).scrollTop( val );
	}
};

emis.mobile.UI.immediateScrollPageX = function( val ) {
	window.scrollTo(val, 0);
};

emis.mobile.UI.immediateScrollPageXY = function(x, y) {
	window.scrollTo(x, y);
};