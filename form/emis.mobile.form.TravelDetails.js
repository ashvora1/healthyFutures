/**
 * Login form controller Functionalities provided:
 */

emis.mobile.form.TravelDetails = function( appObject ) {
	var pageid = 'travelDetails'	;


	$(document).delegate('#'+pageid, 'pageinit', function () {
		$('#travelDetailsSave').click(function(e){

			// TODO: save data then close

		 	$('#'+pageid).dialog( "close" ) ;
		 	return false ;
		})

		$('#'+pageid+ ' .contentPanel input').on('keyup', function(e){
			var val = $(this).val() ;
			if (val == '') {
				$(this).addClass('notValid') ;
			} else if (!main.util.isNormalInteger(val)){
				$(this).addClass('notValid') ;
			} else {
				$(this).removeClass('notValid') ;
			}
		}) ;

	}) ;

	this.bindDataAndEvents = function( $page, refresh ) {
		
		// TODO: insert travel data here
	};

	return this;
}
