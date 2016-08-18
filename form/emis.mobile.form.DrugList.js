/**
 * DrugList form controller Functionalities provided:
 */

emis.mobile.form.DrugList = function( appObject ) {
	var that = this, _app = appObject, notSynchronisedDrugs = [], lastPage = null;
	this.data = [];

	var unbindEvents = function( ) {
		$( "#drugListcloseBtn" ).unbind( );
		lastPage.off( 'pageshow', pageShow );
		emis.mobile.UI.removeOrientationEventsForDialog( orientationChange );
		$( "#drugList" ).css( {
			"overflow": "visible",
			"max-height": "none"
		} );
	};

	var pageShow = function( ) {
		orientationChange( );
	};

	var orientationChange = function( ) {
		var newHeight = emis.mobile.UI.calculateDialogPadding( _app, lastPage );
		$( "#addDrug" ).css( {
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

	var removeDrug = function( index ) {
		_app.dataProvider.removeNewDrug( index );
		$(document).trigger('emis.needrefresh', 'addDrug') ;
	};

	this.bindDataAndEvents = function( $page, refresh ) {
		lastPage = $page;
		$( "#drugListcloseBtn" ).click( function( e ) {
			unbindEvents( );
			$.mobile.changePage( "#addDrug" );
		} );

		var drugs = main.dataProvider.getNewDrugsForCurrentPatient( );
		var preparations = main.controller.drugs.preparations;
		var drugsNumber = ( drugs ) ? drugs.length : 0;
		$( document.getElementById( 'drug-list-content' ) ).html( '' ).css( 'text-align', '' );

		var markup = "";
		if ( drugsNumber == 0 ) {
			markup += 'No drugs awaiting sync';
			$( document.getElementById( 'drug-list-content' ) ).html( markup ).css( 'text-align', 'center' );
		}

		notSynchronisedDrugs = [];

		for ( var i = 0; i < drugsNumber; i++ ) {
			var name;
			var drug = drugs[i].object;
			for ( j in preparations ) {
				if ( preparations[j].id == drug.preparationId ) {
					name = preparations[j].term;
					break;
				}
			}
			markup += '<div class="e-blocks ' + drugs[i].id;
			if ( that.data ) {
				if ( that.data.newlyAdded && i == 0 ) {
					markup += ' newDrug';
				}
			}
			var disableClass = '';
			if ( _app.dataProvider.isNewDrugNotSynchronised( drugs[i].id ) ) {
				// TODO: check R#115414 before uncommenting these two lines
				notSynchronisedDrugs.push( drugs[i].id );
				// disableClass = ' ui-disabled';
			}
			if ( i == drugsNumber - 1 ) {
				markup += ' last-block';
			}
			markup += '"><div class="grid-3 e-block-a"><div>';
			markup += _.h(name);
			markup += '</div>';
			markup += _.h(drug.dosage) + ', ' + drug.quantity + ' ' + _.h(drug.unitOfMeasure);
			markup += '</div><div class="grid-3 e-block-b"><div>';
			if ( drug.prescriptionType == "a" ) {
				markup += "Acute Issue";
			} else {
				if ( drug.authorisedIssues ) {
					markup += "Repeat 1 of " + (drug.authorisedIssues);
				}
			}
			markup += '</div></div><div class="grid-3 e-block-c buttons">';
			markup += '<div data-drug-index="' + drugs[i].id + '" class="standaloneButton' + disableClass + '" id="delDrugBtn">Delete</div></div></div>';
			$('#drug-list-content').html( markup );
		}

		$( '#drug-list-content .standaloneButton' ).on( 'click', function( ) {
			var index = $( this ).data( "drug-index" );
			// if ( index && notSynchronisedDrugs.indexOf( index ) != -1 ) {
			// 	return false;
			// }

			emis.mobile.Utilities.customConfirmPopup( { ok: "Yes", cancel: "No", message: 'Are you sure you want to delete this drug from the list?', title: 'Delete', callback: function( r ) {
				if ( r === true ) {
					var blockToRemove = document.getElementsByClassName( index );
					$( blockToRemove ).remove( );
					removeDrug( index );
					emis.mobile.UI.updateDrawerNewDrugStar( _app );
					drugsNumber = drugsNumber - 1;
					$( '#drugTitle' ).html( 'Drugs pending sync (' + drugsNumber + ')' );
					if ( drugsNumber == 0 ) {
						markup = 'No drugs awaiting sync';
						$( '#drug-list-content').html( markup ).css( 'text-align', 'center' );
					}
				}
			} } );
		} );

		emis.mobile.UI.addOrientationEventsForDialog( orientationChange );
		orientationChange( );
		$page.on( 'pageshow', pageShow );
		$( '#drugTitle' ).html( 'Drugs pending sync (' + drugsNumber + ')' );
	};

	return this;
};
