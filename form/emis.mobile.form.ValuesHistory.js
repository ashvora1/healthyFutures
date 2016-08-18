/**
 * ValuesHistory form controller Functionalities provided:
 */

emis.mobile.form.ValuesHistory = function( appObject ) {
	var _app = appObject;
	var that = this;
	var lic = 0;
	var plot;
	var pageInitiated = false;
	var lastPage;
	var d1 = new Array( );
	var values;
	var PlotLastX = null;
	var PlotLastY = null;
	var pageid = 'patientvalueshistory';
	var previousPoint = null;
	var plot = '';
	// var startY = 0;
	// var touchStartInitialized = false;

	function replaceMonths( str ) {
		str = str.replace( "Jan", "01" );
		str = str.replace( "Feb", "02" );
		str = str.replace( "Mar", "03" );
		str = str.replace( "Apr", "04" );
		str = str.replace( "May", "05" );
		str = str.replace( "Jun", "06" );
		str = str.replace( "Jul", "07" );
		str = str.replace( "Aug", "08" );
		str = str.replace( "Sep", "09" );
		str = str.replace( "Oct", "10" );
		str = str.replace( "Nov", "11" );
		str = str.replace( "Dec", "12" );
		return str;
	}

	function getTimestamp( str ) {
		if ( str.indexOf( "-" ) > 2 )
			str = '01' + str;
		str = replaceMonths( str );
		str += ' 00:00:00';
		// extract date parts
		var d = str.match( /\d+/g );
		// build
		return +new Date( d[2], d[1] - 1, d[0], d[3], d[4], d[5] );
		// Date
		// object
	}

	/**
	 * format value
	 */
	function fv( v ) {
		if ( v ) {
			return v;
		}
		return '';
	}

	function parse( data, history ) {

		var ret = $.extend( {}, data );

		if ( history.term != null ) {
			ret.term = history.term;
		}
		if ( history.associatedText != null ) {
			ret.associatedText = history.associatedText;
		} else {
			ret.associatedText = '';
		}
		if ( history.units != null ) {
			ret.units = history.units;
		}
		if ( history.range != null ) {
			ret.range = history.range;
		}
		ret.value = history.value;
		if ( !ret.value ) {
			ret.value = '';
		}
		ret.abnormal = history.abnormal;
		ret.date = history.date;
		ret.organisationId = history.organisationId;
		if ( ret.range == null ) {
			ret.range = '';
		}
		return ret;
	}

	function f( v ) {
		if ( v )
			return v;
		return '';
	}

	function getSectionNoData( sectionTitle ) {
		return '<div class="contentPanel"><div class="header no-data">' + sectionTitle + ' (None)</div></div>'
	}

	function getSectionOpen( ) {
		return '<div class="contentPanel">';
	}

	function getSectionClose( ) {
		return '</div>';
	}

	function getSectionHeaderOpen( ) {
		return '<div class="header grid" id="patientValueHistoryHeader">';
	}

	function getSectionFixedHeaderOpen( ) {
		return '<div class="header grid floatingHeader">';
	}

	function getSectionHeaderClose( ) {
		return '</div>';
	}

	function getSectionContentOpen( ) {
		return '<div class="content grid" id="patientValueHistoryContent">';
	}

	function getSectionContentClose( ) {
		return '</div>';
	}

	function getSectionHeaderContent( ) {
		var markup = "";
		markup += '<div class="e-blocks">';
		markup += '<div class="grid-6 e-block-a">Term/Date</div>';
		markup += '<div class="grid-6 e-block-b"></div>';
		markup += '<div class="grid-6 e-block-c">Details</div>';
		markup += '<div class="grid-6 e-block-d">Abn</div>';
		markup += '<div class="grid-6 e-block-e">Value/Units</div>';
		markup += '<div class="grid-6 e-block-f">Range</div>';
		markup += '</div>';
		return markup;
	}

	function fillSectionListview( markup, data ) {

		if ( !markup )
			markup = '';

		if ( _app.util.isEmptyObject( data ) ) {
			markup += getSectionNoData( 'Values' );
		} else {

			markup += getSectionOpen( );

			/* invisible fixed header */
			/*
			 * markup += getSectionFixedHeaderOpen(); markup += getSectionHeaderContent(); markup +=
			 * getSectionHeaderClose();
			 */
			/* header */
			markup += getSectionHeaderOpen( );
			markup += getSectionHeaderContent( );
			markup += getSectionHeaderClose( );

			/* content */
			markup += getSectionContentOpen( );

			function fillOne( value ) {
				markup += '<div class="e-blocks"';
				if( value.organisationId ) {
					markup += ' data-org="' + value.organisationId + '"';
				}
				markup += '>';
				markup += '<div class="grid-6 e-block-a">' + _.h( value.term ) + '<br />' + _.h( value.date ) + '</div>';
				markup += '<div class="grid-6 e-block-b">';
				if ( value.organisationId ) {
					markup += '<i class="shared-orgs"></i>';
				}
				markup += '</div>';
				markup += '<div class="grid-6 e-block-c">' + _.h( value.associatedText ) + '</div>';
				markup += '<div class="grid-6 e-block-d abn">' + ( value.abnormal ? '!' : '' ) + '</div>';
				markup += '<div class="grid-6 e-block-e">' + _.h( value.value ) + ' ' + _.h( value.units ) + '</div>';
				markup += '<div class="grid-6 e-block-f">' + _.h( value.range ) + '</div>';
				markup += '</div>';
			}

			fillOne( data );
			if ( data.history ) {
				for ( var i = 0; i < data.history.length; i++ ) {
					fillOne( parse( data, data.history[i] ) );
				}
			}

			markup += getSectionContentClose( );
			markup += getSectionClose( );
		}

		return markup;
	}

	function fillSectionListview2( markup, data, data2 ) {
		if ( !markup ) {
			markup = '';
		}

		markup += getSectionOpen( );

		/* invisible fixed header */
		/*
		 * markup += getSectionFixedHeaderOpen(); markup += getSectionHeaderContent(); markup +=
		 * getSectionHeaderClose();
		 */
		/* header */
		markup += getSectionHeaderOpen( );
		markup += getSectionHeaderContent( );
		markup += getSectionHeaderClose( );

		function fillOne( value ) {
			markup += '<div class="e-blocks"';
			if( value.organisationId ) {
				markup += ' data-org="' + value.organisationId + '"';
			}
			markup += '>';
			markup += '<div class="grid-6 e-block-a">' + _.h( value.term );
			markup += '<br />' + _.h( value.date ) + '</div>';
			markup += '<div class="grid-6 e-block-b">';
			if ( value.organisationId ) {
				markup += '<i class="shared-orgs"></i>';
			}
			markup += '</div>';
			markup += '<div class="grid-6 e-block-c">' + _.h( value.associatedText ) + '</div>';
			markup += '<div class="grid-6 e-block-d abn">' + ( value.abnormal ? '!' : '' ) + '</div>';
			markup += '<div class="grid-6 e-block-e">' + _.h( value.value ) + ' ' + _.h( value.units ) + '</div>';
			markup += '<div class="grid-6 e-block-f">' + _.h( value.range ) + '</div>';
			markup += '</div>';
		}

		if ( data.associatedText == null ) {
			data.associatedText = "";
		}
		if ( data.range == null ) {
			data.range = "";
		}
		var dataObj = '';
		if ( data2.date == data.date ) {
			dataObj = $.extend( {}, data );
			dataObj.value += '/' + data2.value;
		}

		fillOne( dataObj );

		var i = 0, j = 0;
		while ( i < data.history.length && j < data2.history.length ) {
			if ( getTimestamp( data.history[i].date ) > getTimestamp( data.history[i].date ) ) {
				historyObj = parse( data, data.history[i] );
				historyObj.value += '/-';
				i++;
			} else if ( getTimestamp( data.history[i].date ) < getTimestamp( data.history[i].date ) ) {
				historyObj = parse( data2, data2.history[j] );
				historyObj.value = '-/' + historyObj.value;
				j++;
			} else {
				historyObj = parse( data, data.history[i] );
				historyObj.value += '/' + data2.history[j].value;
				i++;
				j++;
			}
			fillOne( historyObj );

		}
		return markup;
	}

	var unbindEvents = function( ) {
		$( "#valuesHistoryCloseBtn" ).unbind( );
		$( "#placeholder" ).unbind( );
		$( window ).unbind( 'hashchange', hashChange );
		emis.mobile.UI.removeOrientationEventsForDialog( orientationChange );
	}
	var setTableHeader = function( ) {

		var height = $( "#valuesHistoryMain" ).height( );
		height -= $( '#patientValueHistoryHeader' ).height( );
		// for top and bottom paddings
		height -= 30;
		$( '#patientValueHistoryContent' ).css( 'max-height', height + 'px' );
		if ( emis.mobile.UI.isiPad ) {
			$( '#valuesHistoryMain' ).css( '-webkit-overflow-scrolling', 'touch' ).css( 'overflow-y', 'auto' );
			$( '#patientValueHistoryContent' ).css( '-webkit-overflow-scrolling', 'touch' );
		}
		$( '#patientValueHistoryContent' ).on( 'scroll', function( e ) {
			var top = $( this ).scrollTop( );
			if ( top <= 0 ) {
				// $('#valuesHistoryMain').trigger('scroll');
				top = Math.floor( $( '#valuesHistoryMain' ).scrollTop( ) + top / 10 );
				$( '#valuesHistoryMain' ).scrollTop( top );
			}
		} );
	}
	var orientationChange = function( ) {
		// custom scrolling is used to scroll the popup content
		// so reset the margin top value before
		// orientation change
		$( '#valuesHistoryInner' ).css( {
			marginTop: 0
		} );

		// checks if table header should be fixed or not in that particular moment
		// if ( touchStartInitialized ) {
		setTableHeader( );
		// }

		var newHeight = emis.mobile.UI.calculateDialogPadding( _app, lastPage );
		$( "#patientvalues, #templateParser" ).css( {
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
		var content = $( "#patientvalueshistory" ).find( ":jqmData(role=content)" );
		var dialog = $( "#patientvalueshistory > div" );
		var dialogHeader = $( "#valuesHistoryHeader" );
		var marginTop = dialog.css( 'margin-top' );
		if ( dialog.css( 'margin-top' ).indexOf( "%" ) != -1 ) {
			marginTop = parseInt( parseInt( marginTop ) * window.innerHeight / 100 );
		} else {
			marginTop = parseInt( marginTop );
		}
		$( "#valuesHistoryMain" ).css( {
			"padding": "0px"
		} );
		var dialogHeight = window.innerHeight - marginTop * 2 - dialogHeader.height( ) - parseInt( content.css( 'padding-top' ) ) - parseInt( content.css( 'padding-bottom' ) ) - parseInt( content.css( 'margin-top' ) ) - parseInt( content.css( 'margin-bottom' ) );

		emis.mobile.console.log( 'dialogHeight ' + dialogHeight );
		content.css( {
			"max-height": dialogHeight
		} );

		setUiGridHeight( );
		setTableHeader( );

		if ( emis.mobile.UI.isIE10 || emis.mobile.UI.isAtLeastIE11) {
			setTimeout( function( ) {
				$( "#patientvalueshistory" ).height( "99%" );
				$( "#patientvalueshistory" ).width( "99%" );
				setTimeout( function( ) {
					$( "#patientvalueshistory" ).height( "100%" );
					$( "#patientvalueshistory" ).width( "100%" );
				}, 0 )
			}, 0 )

			$("#valuesHistoryHeader").css('margin-right','-10px')
			$("#valuesHistoryMain").css('margin-right','-10px')

		}



	}
	var hashChange = function( ) {
		$( "#tooltip" ).remove( );
	}
	// If the data is more than the screen can show, it will scroll. But
	// we must set the height for ui-grid-a
	function setUiGridHeight( ) {
		// apply shadow
		$( '#patientvalueshistory' ).find( '> div:first' ).addClass( 'ui-shadow' );
		var windowsheight = window.innerWidth;
		// $(window).height();
		/*
		 * Random number are paddings and margins of parents and grandparents
		 */
		var allowedHeight = windowsheight - ( windowsheight / 10 + 35 + 35 + 15 + 100 );
		var uiBlockHeight = $( '#patientvalueshistory .ui-grid-a' ).height( );
		// TODO deadcode?
		// if ( false && uiBlockHeight > allowedHeight ) {
		// $( '#patientvalueshistory .ui-grid-a' ).height( allowedHeight );
		// }

		var width = window.innerWidth * 0.8 - 2 * parseInt( $( '.graph-fix' ).css( 'padding-left' ) ) - parseInt( $( '.graph-fix' ).css( 'padding-right' ) ) - parseInt( $( '.graph-fix' ).css( 'margin-left' ) ) - parseInt( $( '.graph-fix' ).css( 'margin-right' ) );

		$( '#placeholder' ).width( width );
		$( '#placeholder' ).height( width * 9 / 16 );
	}

	$( document ).delegate("#"+pageid, "pageinit", function() {
		$( '#valuesHistoryMain' ).on( 'scroll', function( e ) {
			if ( plot && previousPoint != null ) {
				previousPoint = null;
				plot.unhighlight();
				$( "#tooltip" ).remove( );
			}
		} );
	}) ;

	this.bindDataAndEvents = function( $page, refresh) {
		$( "#valuesHistoryInner" ).css( "margin-top", "0" );
		lastPage = $page;
		unbindEvents( );
		$( "#valuesHistoryCloseBtn" ).click( function( e ) {
			unbindEvents( );
			$( "#tooltip" ).remove( );
			$( "#patientvalues" ).css( "overflow", "visible" );
			$( "#patientvalues" ).css( "max-height", "none" );
			$( "#templateParser" ).css( "overflow", "visible" );
			$( "#templateParser" ).css( "max-height", "none" );

			//$.mobile.changePage("#patientvalues");
			$.mobile.changePage( main.controller.valuesHistorySource );
		} );

		if ( emis.mobile.UI.isiPad || ( emis.mobile.UI.isAndroid && emis.mobile.UI.isNative ) ) {
			$( '#valuesHistoryGraphBox' ).addClass( 'graph-fix-transform' );
		}
		$( "#patientvalueshistory" ).unbind( "touchmove" ).bind( "touchmove", function( e ) {
			e.stopPropagation( );
		} );


		emis.mobile.UI.addOrientationEventsForDialog( orientationChange );
		setUiGridHeight( );
		orientationChange( );
		// fixPlotSize();

		// Clear the markup
		$( "#list_values_history" ).html( "" );

		values = _app.dataProvider.getPatientValues( main.controller.patient.id );

		// _app.util.sortBy( values, "term" );
		if ( !_app.util.isEmptyObject( values ) ) {

			var index2 = null;
			if ( main.controller.valuesHistoryOpenByCode == true ) {
				i = 0;
				while ( i < values.length && values[i].code != main.controller.valuesHistoryCode ) {
					i++;
				}
				index = i;
				if ( main.controller.valuesHistoryCode2 != null ) {
					i = 0;
					while ( i < values.length && values[i].code != main.controller.valuesHistoryCode2 ) {
						i++;
					}
					index2 = i;
				}
			} else {
				index = main.controller.valuesHistoryId;
			}
			var value = values[index];
			var markup = '';
			if ( value == undefined || index >= values.length )
				return;
			value = main.dataProvider.filterSharedValuesWithHistory( [ value ] );
			if ( value.length == 0 ) {
				return;
			}
			var history = value[0].slice( 1 );
			value = value[0][0];
			value.history = history;
			if ( index2 == null ) {
				markup = fillSectionListview( markup, value );
			} else {
				var value2 = values[index2];
				value2 = main.dataProvider.filterSharedValuesWithHistory( [ value2 ] );
				if ( value2.length > 0 ) {
					var history2 = value2[0].slice( 1 );
					value2 = value2[0][0];
					value2.history = history2;
					markup = fillSectionListview2( markup, value, value2 );
				} else {
					markup = fillSectionListview( markup, value );
				}
			}
			$( "#list_values_history" ).html( markup );

			function setDataForGraph( ) {
				d1 = [];

				index2 = null;
				if ( main.controller.valuesHistoryOpenByCode == true ) {
					i = 0;
					while ( i < values.length && values[i].code != main.controller.valuesHistoryCode ) {
						i++;
					}
					index = i;
					if ( main.controller.valuesHistoryCode2 != null ) {
						i = 0;
						while ( i < values.length && values[i].code != main.controller.valuesHistoryCode2 ) {
							i++;
						}
						index2 = i;
					}
				} else {
					index = main.controller.valuesHistoryId;
				}
				// _app.util.sortBy( values, "term" );
				value = values[index];
				value = main.dataProvider.filterSharedValuesWithHistory( [ value ] );
				if ( value.length == 0 ) {
					value = undefined;
				}
				var history = null;
				if ( value != undefined ) {
					history = value[0].slice( 1 );
					value = value[0][0];
				} else {
					return;
				}

				// blood pressure?
				if ( value.term == 'O/E Blood Pressure Reading' || value.code == "254063019" || value.code == 254063019 ) {
					// graph
					// -
					// blood
					// pressure
					emis.mobile.form.ValuesHistory.seriesNum = 2;
					if ( !_app.util.isEmptyObject( history ) ) {
						for ( var i = 0; i < history.length; i++ ) {
							if ( history[i].value.length > 0 ) {
								pressures = history[i].value.split( "/" );
								d1.push( [getTimestamp( history[i].date ), pressures[0]] );
								d1.push( [getTimestamp( history[i].date ), pressures[1]] );
							}
						}
					}
					if ( value.value.length > 0 ) {
						pressures = value.value.split( "/" );
						d1.push( [getTimestamp( value.date ), pressures[0]] );
						d1.push( [getTimestamp( value.date ), pressures[1]] );
					}
					d1.sort( function( a, b ) {
						return a[0] - b[0];
					} );
					// single series graphs
				} else if ( index2 == null ) {
					emis.mobile.form.ValuesHistory.seriesNum = 1;
					if ( !_app.util.isEmptyObject( history ) )
						for ( var i = 0; i < history.length; i++ ) {
							d1.push( [getTimestamp( history[i].date ), history[i].value] );
						}
					d1.push( [getTimestamp( value.date ), value.value] );
					d1.sort( function( a, b ) {
						return a[0] - b[0];
					} );
				} else {
					// graph - blood pressure - by diastolic and
					// systolic
					emis.mobile.form.ValuesHistory.seriesNum = 2;
					var value2 = values[index2];
					var history2 = null;
					if ( value2 != undefined ) {
						value2 = main.dataProvider.filterSharedValuesWithHistory( [ value2 ] );
						if ( value2.length ) {
							history2 = value2[0].slice( 1 );
							value2 = value2[0][0];
						} else {
							return;
						}
					} else {
						return;
					}

					if ( !_app.util.isEmptyObject( history ) ) {
						for ( var i = 0; i < history.length; i++ ) {
							d1.push( [getTimestamp( history[i].date ), history[i].value] );
						}
					}
					d1.push( [getTimestamp( value.date ), value.value] );

					if ( !_app.util.isEmptyObject( history2 ) ) {
						for ( var i = 0; i < history2.length; i++ ) {
							d1.push( [getTimestamp( history2[i].date ), history2[i].value] );
						}
					}
					d1.push( [getTimestamp( value2.date ), value2.value] );
					d1.sort( function( a, b ) {
						return a[0] - b[0];
					} );
				}
			}

			function drawPlot( ) {

				function pointSymbol( ctx, x, y, radius, shadow ) {
					var range = 6;
					if ( x - range < 0 ) {
						ctx.moveTo( 0, y - 1 );
						ctx.lineTo( x + range, y - 1 );
						ctx.moveTo( 0, y );
						ctx.lineTo( x + range, y );
						ctx.moveTo( 0, y + 1 );
						ctx.lineTo( x + range, y + 1 );
					} else if ( x + 32 < ctx.canvas.width ) {
						ctx.moveTo( x - range, y - 1 );
						ctx.lineTo( x + range, y - 1 );
						ctx.moveTo( x - range, y );
						ctx.lineTo( x + range, y );
						ctx.moveTo( x - range, y + 1 );
						ctx.lineTo( x + range, y + 1 );
					} else {
						ctx.moveTo( x - range, y - 1 );
						ctx.lineTo( x, y - 1 );
						ctx.moveTo( x - range, y );
						ctx.lineTo( x, y );
						ctx.moveTo( x - range, y + 1 );
						ctx.lineTo( x, y + 1 );
					}

					if ( PlotLastX == x ) {
						ctx.moveTo( x, y );
						ctx.lineTo( PlotLastX, PlotLastY );
					}
					PlotLastX = x;
					PlotLastY = y;
				}

				plot = '';
				lic++;
				if ( emis.mobile.form.ValuesHistory.seriesNum == 1 ) {
					var options = {
						series: {
							lines: {
								show: true,
								fill: false
							},
							points: {
								show: true,
								fill: false
							},
							color: "rgb(0, 0, 255)"
						},
						xaxis: {
							mode: "time",
							timeformat: "%b %y",
							monthNames: ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"]
						},
						grid: {
							clickable: true,
							mouseActiveRadius: 10,
							color: "#545454"
						}
					};
					if ( '' == plot ) {
						plot = $.plot( $( "#placeholder" ), [d1], options );
					} else {
						plot.setData( [d1] );
						plot.setupGrid( );
						plot.draw( );
					}
				} else if ( emis.mobile.form.ValuesHistory.seriesNum == 2 ) {
					var options = {
						series: {
							lines: {
								show: false,
								fill: false
							},
							points: {
								show: true,
								fill: false,
								symbol: pointSymbol
							}
						},
						xaxis: {
							mode: "time",
							timeformat: "%b %y",
							monthNames: ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"]
						},
						grid: {
							clickable: true,
							mouseActiveRadius: 10
						}
					};

					if ( '' == plot ) {
						plot = $.plot( $( "#placeholder" ), [{
							data: d1,
							color: "#ff0000"
						}], options );
					} else {
						plot.setData( [{
							data: d1,
							color: "#ff0000"
						}] );
						plot.setupGrid( );
						plot.draw( );
					}

				}
				function showTooltip( x, y, contents ) {
					$( '<div id="tooltip">' + contents + '</div>' ).css( {
						position: 'absolute',
						'z-index': 100,
						display: 'none',
						top: y + 15,
						left: x - 25,
						border: '1px solid #fdd',
						padding: '2px',
						'background-color': '#fee',
						opacity: 0.80
					} ).appendTo( "body" ).fadeIn( 200 );
				}

				$( "#placeholder" ).bind( "plotclick", function( event, pos, item ) {
					if ( item ) {
						if ( previousPoint != item.dataIndex ) {
							previousPoint = item.dataIndex;

							$( "#tooltip" ).remove( );
							var x = item.datapoint[0].toFixed( 2 ), y = item.datapoint[1].toFixed( 2 );
							showTooltip( item.pageX, item.pageY, y );
						}
					} else {
						$( "#tooltip" ).remove( );
						previousPoint = null;
					}
				} );

				$( window ).bind( 'hashchange', hashChange );

			}

			if (!pageInitiated) {
				pageInitiated = true;
				$page.on('pageshow', function() {
					emis.mobile.console.log("pageshow");
					try {
						setDataForGraph();
						drawPlot();
					} catch (error) {
						emis.mobile.console.error("setDataForGraph or drawPlot failed: " + error.message);
					}
					main.controller.sharedOrgs.attachSharedOrgsToScreen(that, "#" + pageid, ".content.grid > .e-blocks");

					orientationChange();
					$( '#valuesHistoryMain' ).scrollTop( 0 ); // fixes R#138581
				});
			} else {
				orientationChange();
			}

		}
	};

	return this;
}