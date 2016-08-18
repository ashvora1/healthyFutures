emis.mobile.Utilities = function( ) {

}

Object.extend = function(destination, source) {
	for (var property in source) {
		if (source.hasOwnProperty(property)) {
			destination[property] = source[property];
		}
	}
	return destination;
};

emis.mobile.Utilities.prototype.isNormalInteger = function (str) {
	return /^\+?(0|[1-9]\d*)$/.test(str);
} ;

emis.mobile.Utilities.prototype.getCurrentTime = function( bTwelveHourFormat ) {
	var currentTime;
	var currentDate = new Date( );
	var day = currentDate.getDate( );
	var correntMonth = currentDate.getMonth( ) + 1;
	var month = correntMonth < 10 ? "0" + correntMonth : correntMonth;
	var year = currentDate.getFullYear( );
	var hr = currentDate.getHours( );
	var curMeridiem = "";
	if ( bTwelveHourFormat ) {
		hr = hr > 12 ? currentDate.getHours( ) - 12 : currentDate.getHours( );
		curMeridiem = currentDate.getHours( ) > 12 ? "PM" : "AM";
	}
	var min = currentDate.getMinutes( );
	var sec = currentDate.getSeconds( );
	currentTime = day + "/" + month + "/" + year + "-" + hr + "." + min + "." + sec + curMeridiem;

	return currentTime;
}
// Used to generate unique id in the backend
emis.mobile.Utilities.prototype.generateId = function( ) {
	return '' + ( new Date( ) ).getTime( ) + '-' + Math.floor( Math.random( ) * 1000 );
}

emis.mobile.Utilities.prototype.generateGUID = function( ) {
	return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace( /[xy]/g, function( c ) {
		var r = Math.random( ) * 16 | 0, v = c == 'x' ? r : ( r & 0x3 | 0x8 );
		return v.toString( 16 );
	} );
}

emis.mobile.Utilities.prototype.replaceSessionID = function( sessionId, url ) {
	url.replace( "{rawSessionId}", sessionId );
	return url;
}
/**
 * Change ISO date format to emis standard date
 *
 * @param d - date in ISO format
 */
emis.mobile.Utilities.prototype.standardizeDate = function( d ) {
	if ( d != null ) {
		var year = d.slice( 0, 4 );
		var month = d.slice( 5, 7 );
		var day = d.slice( 8, 10 );
		var time = d.slice( 11, 16 );

		var months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
		// 2012-08-30T17:00:00
		return day + '-' + months[parseInt( month, 10 ) - 1] + '-' + year;
	}
	return null;
};

/**
 * Change ISO time format 2013-04-12T09:00:00 to emis standard time
 *
 * @param d - date in ISO format
 */
emis.mobile.Utilities.prototype.standardizeTime = function( d, bTwelveHourFormat ) {
	var time = d.split( "T" )[1].split( "." )[0];
	var suffix = "";

	time = time.substr( 0, time.length - 3 );

	var hours = this.standardizeTimeHour( time, true );
	var minutes = time.substr( 3 );

	if ( bTwelveHourFormat ) {
		if ( hours >= 12 ) {
			suffix = " pm";
		} else
			suffix = " am";
		if ( hours > 12 )
			hours = hours - 12;
	}

	var hoursLength = hours.length;
	if ( hoursLength > 2 )
		hours = hours.substring( hoursLength - 2 );

	time = hours + ":" + minutes + suffix;
	return time;
};

/**
 * @param time in format hh:mm bTwelveHourFormat true or false bLeadingZero true or false
 *
 * Returns hour with or without leading zero
 */
emis.mobile.Utilities.prototype.standardizeTimeHour = function( time, bLeadingZero ) {
	var hours = time.substr( 0, 2 );
	if ( bLeadingZero == true && hours < 10 )
		hours = "0" + hours;
	else if ( hours[0] == 0 ) {
		// remove leading '0' if it exists
		hours = hours.substr( 1 );
	}
	var hoursLength = hours.length;
	if ( hoursLength > 2 )
		hours = hours.substring( hoursLength - 2, hoursLength );

	return hours;
};

emis.mobile.Utilities.prototype.standardizeTimeMinute = function( time, bLeadingZero ) {
	var minutes = time.substr( 3 );
	if ( bLeadingZero == true && minutes < 10 )
		minutes = "0" + minutes;
	else if ( minutes[0] == 0 ) {
		// remove leading '0' if it exists
		minutes = minutes.substr( 1 );
	}
	var minutesLength = minutes.length;
	if ( minutesLength > 2 )
		minutes = minutes.substring( minutesLength - 2, minutesLength );

	return minutes;
};

/**
 * Returns date and time in the following format: dd-MMM-YYYY
 */
emis.mobile.Utilities.prototype.standardizeDateAndTime = function( d ) {
	if ( d != null ) {
		var year = d.slice( 0, 4 );
		var month = d.slice( 5, 7 );
		var day = d.slice( 8, 10 );
		var time = d.slice( 11, 16 );
		// remove leading '0' if it exists
		if ( time[0] == 0 ) {
			time = time.substr( 1 );
		}
		var months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
		// 2012-08-30T17:00:00
		return day + '-' + months[parseInt( month, 10 ) - 1] + '-' + year + ' ' + time;
	}
	return null;
};

emis.mobile.Utilities.prototype.standardizeDateAppointment = function( d ) {

	/*
	 * if (dateISOstring != null) { var dateToStandarize = new Date(dateISOstring); var year =
	 * dateToStandarize.getFullYear(); var month = dateToStandarize.getMonth(); var day = dateToStandarize.getDate();
	 * var months = [ "Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec" ]; return day +
	 * '-' + months[parseInt(month, 10)] + '-' + year; } return null;
	 */

	if ( d != null ) {
		var year = d.slice( 0, 4 );
		var month = d.slice( 5, 7 );
		var day = d.slice( 8, 10 );
		var months = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
		return day + ' ' + months[parseInt( month, 10 ) - 1] + ' ' + year;
	}
	return null;
};

/**
 * Change ISO date format to dd/mm/yy format.
 *
 * @param d - date in ISO format
 *
 */
emis.mobile.Utilities.prototype.standardizeDateAppointment2 = function( d ) {
	var day = d.slice( 8, 10 );
	var month = d.slice( 5, 7 );
	var year = d.slice( 2, 4 );

	if ( day[0] === '0' ) {
		day = day[1];
	}

	if ( month[0] === '0' ) {
		month = month[1];
	}

	return day + '/' + month + '/' + year;
};

/**
 * Change ISO date and time format to emis standard datetime format
 *
 * @param d - date in ISO format
 */
emis.mobile.Utilities.prototype.standardizeDateTime = function( d ) {
	return this.standardizeTime( d ) + " " + this.standardizeDate( d );
}

emis.mobile.Utilities.prototype.standardizeDateTimeComma = function( d ) {
	return this.standardizeTime( d ) + ", " + this.standardizeDate( d );
}
/**
 * Change javascript date object to a form suitable for the users inteface.
 *
 * @param d - javascript date object
 */
emis.mobile.Utilities.prototype.formatDate = function( d ) {
	var months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
	var minutes = parseInt( d.getMinutes( ) % 60, 10 );
	var hours = d.getHours( );
	var day = d.getDate( );
	// day of month
	return ( hours < 10 ? '0' + hours : hours ) + ':' + ( minutes < 10 ? '0' + minutes : minutes ) + ', ' + ( day < 10 ? '0' + day : day ) + '-' + months[d.getMonth( )] + '-' + d.getFullYear( );
}
emis.mobile.Utilities.prototype.formatDateNoTime = function( d ) {
	var months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
	var day = d.getDate( );
	// day of month
	return ( day < 10 ? '0' + day : day ) + '-' + months[d.getMonth( )] + '-' + d.getFullYear( );
}

emis.mobile.Utilities.prototype.getISONowDate = function( ) {
	var d = new Date( );
	var minutes = parseInt( d.getMinutes( ) % 60, 10 );
	var hours = d.getHours( );
	var day = d.getDate( );
	var month = d.getMonth( ) + 1;

	return d.getFullYear( ) + '-' + ( month < 10 ? '0' + month : month ) + '-' + ( day < 10 ? '0' + day : day ) + 'T' + ( hours < 10 ? '0' + hours : hours ) + ':' + ( minutes < 10 ? '0' + minutes : minutes ) + ':00';
}

emis.mobile.Utilities.prototype.getISONowUTCDate = function( ) {
	var d = new Date( );
	var seconds = d.getUTCSeconds( )
	var minutes = d.getUTCMinutes( );
	var hours = d.getUTCHours( );
	var day = d.getUTCDate( );
	var month = d.getUTCMonth( ) + 1;

	return d.getUTCFullYear( ) + '-' + ( month < 10 ? '0' + month : month ) + '-' + ( day < 10 ? '0' + day : day ) + 'T' + ( hours < 10 ? '0' + hours : hours ) + ':' + ( minutes < 10 ? '0' + minutes : minutes ) + ':' + ( seconds < 10 ? '0' + seconds : seconds );
}

emis.mobile.Utilities.prototype.getISODate = function( d ) {
	var minutes = parseInt( d.getMinutes( ) % 60, 10 );
	var hours = d.getHours( );
	var day = d.getDate( );
	var month = d.getMonth( ) + 1;

	return d.getFullYear( ) + '-' + ( month < 10 ? '0' + month : month ) + '-' + ( day < 10 ? '0' + day : day ) + 'T' + ( hours < 10 ? '0' + hours : hours ) + ':' + ( minutes < 10 ? '0' + minutes : minutes ) + ':00';
}

emis.mobile.Utilities.prototype.getISOUTCDate = function( d ) {
	var minutes = parseInt( d.getUTCMinutes( ) % 60, 10 );
	var hours = d.getUTCHours( );
	var day = d.getUTCDate( );
	var month = d.getUTCMonth( ) + 1;

	return d.getUTCFullYear( ) + '-' + ( month < 10 ? '0' + month : month ) + '-' + ( day < 10 ? '0' + day : day ) + 'T' + ( hours < 10 ? '0' + hours : hours ) + ':' + ( minutes < 10 ? '0' + minutes : minutes ) + ':00';
}

emis.mobile.Utilities.prototype.resetTimeToFullDay = function( date ) {
	date = new Date( date.setUTCHours( 0 ) );
	date = new Date( date.setUTCMinutes( 0 ) );
	date = new Date( date.setUTCSeconds( 0 ) );
	date = new Date( date.setUTCMilliseconds( 0 ) );
	return date;
};

emis.mobile.Utilities.prototype.formatString = function( svalue ) {
	if ( svalue )
		return svalue;
	else
		return '';
}
/**
 * Change string in UI format date to iso string date. i.e. 03-May-2012 to 2012-05-03T00:00:00
 *
 * @param emisUIFormatDate - string
 *
 */

emis.mobile.Utilities.prototype.toISODate = function( emisUIFormatDate ) {
	var result = '';
	if ( emisUIFormatDate ) {
		var months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
		var dateTable = emisUIFormatDate.split( "-" );
		var day = dateTable[0];
		var monthWord = dateTable[1];
		var year = dateTable[2];

		for ( var m = 0; m < months.length; m++ ) {
			if ( monthWord == months[m] )
				break;
		}
		m++;
		// result = year + '-' + (m<10?'0'+m:m) + '-' + (day<10?'0'+day:day) + 'T00:00:00';
		result = year + '-' + ( m < 10 ? '0' + m : m ) + '-' + day + 'T00:00:00';
	}
	return result;
}
/**
 * Input format: YYYY-MM-DDTHH:mm:ss
 *
 * returns javascript date object
 */

emis.mobile.Utilities.prototype.getDate = function( date ) {
	var dateAndTime = date.split( "T" );
	var dateParts = dateAndTime[0].split( "-" );
	var timeParts = dateAndTime[1].split( ":" );
	// ignore the part after the dot
	var seconds = timeParts[2].split( "." );
	return new Date( dateParts[0], dateParts[1] - 1, dateParts[2], timeParts[0], timeParts[1], seconds[0], 0 );
}

emis.mobile.Utilities.prototype.getUTCDate = function ( date ) {
	var dateAndTime = date.split( "T" );
	var dateParts = dateAndTime[0].split( "-" );
	var timeParts = dateAndTime[1].split( ":" );
	// ignore the part after the dot
	var seconds = timeParts[2].split( "." );
	return Date.UTC( dateParts[0], dateParts[1] - 1, dateParts[2], timeParts[0], timeParts[1], seconds[0], 0 );
}

emis.mobile.Utilities.prototype.getDurationMinutes = function( dateStart, dateEnd ) {
	var beginTime = this.getDate( dateStart );
	var endTime = this.getDate( dateEnd );
	var seconds = Math.round( ( endTime - beginTime ) / 1000 );
	var minutes = Math.round( seconds / 60 );

	return minutes;
}

emis.mobile.Utilities.prototype.getWeekDayShort = function( date ) {
	var weekday = new Array( 7 );
	weekday[0] = "Sun";
	weekday[1] = "Mon";
	weekday[2] = "Tue";
	weekday[3] = "Wed";
	weekday[4] = "Thu";
	weekday[5] = "Fri";
	weekday[6] = "Sat";

	return weekday[date.getDay( )];
}

/**
 * convert MMM month to number
 */
emis.mobile.Utilities.prototype.convertMonth = function( str ) {
	str = str.replace( "Jan", "1" );
	str = str.replace( "Feb", "2" );
	str = str.replace( "Mar", "3" );
	str = str.replace( "Apr", "4" );
	str = str.replace( "May", "5" );
	str = str.replace( "Jun", "6" );
	str = str.replace( "Jul", "7" );
	str = str.replace( "Aug", "8" );
	str = str.replace( "Sep", "9" );
	str = str.replace( "Oct", "10" );
	str = str.replace( "Nov", "11" );
	str = str.replace( "Dec", "12" );
	return str;
}

emis.mobile.Utilities.prototype.sortBy = function( arrayToSort, propName ) {
	function comparator( a, b ) {
		var aName = (new String( a[main.controller.propName] )).toLowerCase();
		var bName = (new String( b[main.controller.propName] )).toLowerCase();
		return ((aName < bName) ? -1 : ((aName > bName) ? 1 : 0));
	}

	function dateComparator(a,b) { // compares dates in forma dd-mon-yyyy, like 30-May-2014
		if(!a[main.controller.propName] || !b[main.controller.propName])
			return 0;
		var partsA = a[main.controller.propName].split("-");
		var partsB = b[main.controller.propName].split("-");
		lengthA = partsA.length;
		lengthB = partsB.length;
		var yearA,yearB,monthA,monthB,dayA,dayB;
		if(lengthA == 1) {
			if(isNaN(partsA[0])) {
				lengthA = 0;
			} else {
				dayA = 50;
				monthA = 50;
				yearA = partsA[0];
			}
		} else if(lengthA == 2) {
			dayA= 50;
			monthA = partsA[0];
			yearA = partsA[1];
		} else if(lengthA == 3) {
			dayA = partsA[0];
			monthA = partsA[1];
			yearA = partsA[2];
		}
		if(lengthB == 1) {
			if(isNaN(partsB[0])) {
				lengthB = 0;
			} else {
				dayB = 50;
				monthB = 50;
				yearB = partsB[0];
			}
		} else if(lengthB == 2) {
			dayB = -1;
			monthB = partsB[0];
			yearB = partsB[1];
		} else if(lengthB == 3) {
			dayB = partsB[0];
			monthB = partsB[1];
			yearB = partsB[2];
		}

		if(lengthB == 0) {
			return -1;
		} else if(lengthA == 0) {
			return 1;
		} else if(yearB!=yearA) {
			return yearB-yearA;
		} else if(monthB!=monthA) {
			return this.convertMonth(monthB)-this.convertMonth(monthA);
		} else if(dayB!=dayA){
			return dayB-dayA;
		} else if(a["term"] && b["term"]) { //falback to term
			var propName2 = "term";
			var aName = (new String( a[propName2] )).toLowerCase();
			var bName = (new String( b[propName2] )).toLowerCase();
			return ((aName < bName) ? -1 : ((aName > bName) ? 1 : 0));
		} else return 0;
	}
	main.controller.propName = propName;
	if(propName.indexOf("Date")>=0 || propName.indexOf("date")>=0) {
		if ( arrayToSort && arrayToSort.length > 0 ) {
			arrayToSort.sort( dateComparator );
		}
	} else {
		if ( arrayToSort && arrayToSort.length > 0 ) {
			arrayToSort.sort( comparator );
		}
	}
	main.controller.propName = "";
	return arrayToSort;
}

/**
 * check for null, undefined and a bonus empty object {} from storage
 */
emis.mobile.Utilities.prototype.isEmptyObject = function( obj ) {
	return ( obj == null ) || jQuery.isEmptyObject( obj );
}

emis.mobile.Utilities.relativeToAbsoluteUrl = function( url ) {
	/*
	 * Only accept commonly trusted protocols: Only data-image URLs are accepted, Exotic flavours (escaped slash,
	 * html-entitied characters) are not supported to keep the function fast
	 */
	if ( /^(https?|file|ftps?|mailto|javascript|data:image\/[^;]{2,9};):/i.test( url ) )
		//Url is already absolute
		return url;

	var base_url = location.href.match( /^(.+?)\/?(?:#.+)?$/ )[1] + "/";

	url = base_url + url;
	var i = 0
	while ( /\/\.\.\//.test( url = url.replace( /[^\/]+\/+\.\.\//g, "" ) ) );

	/* Escape certain characters to prevent XSS */
	url = url.replace( /\.$/, "" ).replace( /\/\./g, "" ).replace( /"/g, "%22" ).replace( /'/g, "%27" ).replace( /</g, "%3C" ).replace( />/g, "%3E" );
	url = url.replace( 'index.html/', '' );
	return url;
}
/**
 * parses url into single parts
 */
emis.mobile.Utilities.parseUrl = function( url ) {
	//var yourUrl = "http://www.sitename.com/article/2009/09/14/this-is-an-article/";
	var parse_url = /^(?:([A-Za-z]+):)?(\/{0,3})([0-9.\-A-Za-z]+)(?::(\d+))?(?:\/([^?#]*))?(?:\?([^#]*))?(?:#(.*))?$/;
	var parts = parse_url.exec( url );
	return parts;
}
/**
 * Load a page into the DOM. jqm function with fixes
 */
emis.mobile.Utilities.loadPage = function( url, options ) {
	var path = $.mobile.path;
	var base = $.mobile.base;
	var documentUrl = $.mobile.getDocumentUrl( true );
	var documentBase = $.mobile.getDocumentBase( true );

	// The base URL for any given element depends on the page it resides in.
	function getClosestBaseUrl( ele ) {
		// Find the closest page and extract out its url.
		var url = $( ele ).closest( ".ui-page" ).jqmData( "url" ), base = documentBase.hrefNoHash;

		if ( !url || !path.isPath( url ) ) {
			url = base;
		}

		return path.makeUrlAbsolute( url, base );
	}

	// shared page enhancements
	function enhancePage( $page, role ) {
		// If a role was specified, make sure the data-role attribute
		// on the page element is in sync.
		if ( role ) {
			$page.attr( "data-" + $.mobile.ns + "role", role );
		}

		// run page plugin
		$page.page( );
	}

	function _loadPage( html, xhr, textStatus, deferred ) {
		// pre-parse html to check for a data-url,
		// use it as the new fileUrl, base path, etc
		var all = $( "<div></div>" ),

		// page title regexp
		newPageTitle = html.match( /<title[^>]*>([^<]*)/ ) && RegExp.$1, pageElemRegex = new RegExp( "(<[^>]+\\bdata-" + $.mobile.ns + "role=[\"']?page[\"']?[^>]*>)" ), dataUrlRegex = new RegExp( "\\bdata-" + $.mobile.ns + "url=[\"']?([^\"'>]*)[\"']?" );

		// data-url must be provided for the base tag so resource requests can be directed to the
		// correct url. loading into a temprorary element makes these requests immediately
		if ( pageElemRegex.test( html ) && RegExp.$1 && dataUrlRegex.test( RegExp.$1 ) && RegExp.$1 ) {
			url = fileUrl = path.getFilePath( RegExp.$1 );
		}

		if ( base ) {
			base.set( fileUrl );
		}

		// workaround to allow scripts to execute when included in page divs
		all.get( 0 ).innerHTML = html;
		page = all.find( ":jqmData(role='page'), :jqmData(role='dialog')" ).first( );

		// if page elem couldn't be found, create one and insert the body element's contents
		if ( !page.length ) {
			page = $( "<div data-" + $.mobile.ns + "role='page'>" + html.split( /<\/?body[^>]*>/gmi )[1] + "</div>" );
		}

		if ( newPageTitle && !page.jqmData( "title" ) ) {
			if ( ~newPageTitle.indexOf( "&" ) ) {
				newPageTitle = $( "<div>" + newPageTitle + "</div>" ).text( );
			}
			page.jqmData( "title", newPageTitle );
		}

		// rewrite src and href attrs to use a base url
		if ( !$.support.dynamicBaseTag ) {
			var newPath = path.get( fileUrl );
			page.find( "[src], link[href], a[rel='external'], :jqmData(ajax='false'), a[target]" ).each( function( ) {
				var thisAttr = $( this ).is( '[href]' ) ? 'href' : $( this ).is( '[src]' ) ? 'src' : 'action', thisUrl = $( this ).attr( thisAttr );

				// XXX_jblas: We need to fix this so that it removes the document
				// base URL, and then prepends with the new page URL.
				// if full path exists and is same, chop it - helps IE out
				thisUrl = thisUrl.replace( location.protocol + '//' + location.host + location.pathname, '' );

				if ( !/^(\w+:|#|\/)/.test( thisUrl ) ) {
					$( this ).attr( thisAttr, newPath + thisUrl );
				}
			} );
		}

		// append to page and enhance
		// TODO taging a page with external to make sure that embedded pages aren't removed
		// by the various page handling code is bad. Having page handling code in many
		// places is bad. Solutions post 1.0
		page.attr( "data-" + $.mobile.ns + "url", path.convertUrlToDataUrl( fileUrl ) ).attr( "data-" + $.mobile.ns + "external-page", true ).appendTo( settings.pageContainer );

		// wait for page creation to leverage options defined on widget
		page.one( 'pagecreate', $.mobile._bindPageRemove );

		enhancePage( page, settings.role );

		// Enhancing the page may result in new dialogs/sub pages being inserted
		// into the DOM. If the original absUrl refers to a sub-page, that is the
		// real page we are interested in.
		if ( absUrl.indexOf( "&" + $.mobile.subPageUrlKey ) > -1 ) {
			page = settings.pageContainer.children( ":jqmData(url='" + dataUrl + "')" );
		}

		// bind pageHide to removePage after it's hidden, if the page options specify to do so

		// Remove loading message.
		if ( settings.showLoadMsg ) {
			hideMsg( );
		}

		// Add the page reference and xhr to our triggerData.
		triggerData.xhr = xhr;
		triggerData.textStatus = textStatus;
		triggerData.page = page;

		// Let listeners know the page loaded successfully.
		settings.pageContainer.trigger( "pageload", triggerData );

		deferred.resolve( absUrl, options, page, dupCachedPage );
	}

	;

	// This function uses deferred notifications to let callers
	// know when the page is done loading, or if an error has occurred.
	var deferred = $.Deferred( ),

	// The default loadPage options with overrides specified by
	// the caller.
	settings = $.extend( {}, emis.mobile.Utilities.loadPage.defaults, options ),

	// The DOM element for the page after it has been loaded.
	page = null,

	// If the reloadPage option is true, and the page is already
	// in the DOM, dupCachedPage will be set to the page element
	// so that it can be removed after the new version of the
	// page is loaded off the network.
	dupCachedPage = null,

	// determine the current base url
	findBaseWithDefault = function( ) {
		var closestBase = ( $.mobile.activePage && getClosestBaseUrl( $.mobile.activePage ) );
		return closestBase || documentBase.hrefNoHash;
	},

	// The absolute version of the URL passed into the function. This
	// version of the URL may contain dialog/subpage params in it.
	absUrl = path.makeUrlAbsolute( url, findBaseWithDefault( ) );

	// If the caller provided data, and we're using "get" request,
	// append the data to the URL.
	if ( settings.data && settings.type === "get" ) {
		absUrl = path.addSearchParams( absUrl, settings.data );
		settings.data = undefined;
	}

	// If the caller is using a "post" request, reloadPage must be true
	if ( settings.data && settings.type === "post" ) {
		settings.reloadPage = true;
	}

	// The absolute version of the URL minus any dialog/subpage params.
	// In otherwords the real URL of the page to be loaded.
	var fileUrl = path.getFilePath( absUrl ),

	// The version of the Url actually stored in the data-url attribute of
	// the page. For embedded pages, it is just the id of the page. For pages
	// within the same domain as the document base, it is the site relative
	// path. For cross-domain pages (Phone Gap only) the entire absolute Url
	// used to load the page.
	dataUrl = path.convertUrlToDataUrl( absUrl );

	// Make sure we have a pageContainer to work with.
	settings.pageContainer = settings.pageContainer || $.mobile.pageContainer;

	// Check to see if the page already exists in the DOM.
	page = settings.pageContainer.children( ":jqmData(url='" + dataUrl + "')" );

	// If we failed to find the page, check to see if the url is a
	// reference to an embedded page. If so, it may have been dynamically
	// injected by a developer, in which case it would be lacking a data-url
	// attribute and in need of enhancement.
	if ( page.length === 0 && dataUrl && !path.isPath( dataUrl ) ) {
		page = settings.pageContainer.children( "#" + dataUrl ).attr( "data-" + $.mobile.ns + "url", dataUrl );
	}

	// If we failed to find a page in the DOM, check the URL to see if it
	// refers to the first page in the application. If it isn't a reference
	// to the first page and refers to non-existent embedded page, error out.
	if ( page.length === 0 ) {
		if ( $.mobile.firstPage && path.isFirstPageUrl( fileUrl ) ) {
			// Check to make sure our cached-first-page is actually
			// in the DOM. Some user deployed apps are pruning the first
			// page from the DOM for various reasons, we check for this
			// case here because we don't want a first-page with an id
			// falling through to the non-existent embedded page error
			// case. If the first-page is not in the DOM, then we let
			// things fall through to the ajax loading code below so
			// that it gets reloaded.
			if ( $.mobile.firstPage.parent( ).length ) {
				page = $( $.mobile.firstPage );
			}
		} else if ( path.isEmbeddedPage( fileUrl ) ) {
			deferred.reject( absUrl, options );
			return deferred.promise( );
		}
	}

	// Reset base to the default document base.
	if ( base ) {
		base.reset( );
	}

	// If the page we are interested in is already in the DOM,
	// and the caller did not indicate that we should force a
	// reload of the file, we are done. Otherwise, track the
	// existing page as a duplicated.
	if ( page.length ) {
		if ( !settings.reloadPage ) {
			enhancePage( page, settings.role );
			deferred.resolve( absUrl, options, page );
			return deferred.promise( );
		}
		dupCachedPage = page;
	}

	var mpc = settings.pageContainer, pblEvent = new $.Event( "pagebeforeload" ), triggerData = {
		url: url,
		absUrl: absUrl,
		dataUrl: dataUrl,
		deferred: deferred,
		options: settings
	};

	// Let listeners know we're about to load a page.
	mpc.trigger( pblEvent, triggerData );

	// If the default behavior is prevented, stop here!
	if ( pblEvent.isDefaultPrevented( ) ) {
		return deferred.promise( );
	}

	if ( settings.showLoadMsg ) {

		// This configurable timeout allows cached pages a brief delay to load without showing a message
		var loadMsgDelay = setTimeout( function( ) {
			$.mobile.showPageLoadingMsg( );
		}, settings.loadMsgDelay ),

		// Shared logic for clearing timeout and removing message.
		hideMsg = function( ) {

			// Stop message show timer
			clearTimeout( loadMsgDelay );

			// Hide loading message
			$.mobile.hidePageLoadingMsg( );
		};
	}

	if ( !( $.mobile.allowCrossDomainPages || path.isSameDomain( documentUrl, absUrl ) ) ) {
		deferred.reject( absUrl, options );
	} else {
		// Load the new page.
		$.ajax( {
			url: fileUrl,
			type: settings.type,
			data: settings.data,
			dataType: "html",
			success: function( html, textStatus, xhr ) {
				_loadPage( html, xhr, textStatus, deferred );
			},
			error: function( xhr, textStatus, errorThrown ) {
				// the samsung galaxy p5110 'x' bug fix
				if ( emis.mobile.UI.isAndroid ) {
					if ( xhr.status === 0 && xhr.responseText && xhr.responseText !== "" ) {
						// status is 0 but we have response text
						_loadPage( xhr.responseText, xhr, textStatus, deferred );
					}
					return;
				}

				// set base back to current path
				if ( base ) {
					base.set( path.get( ) );
				}

				// Add error info to our triggerData.
				triggerData.xhr = xhr;
				triggerData.textStatus = textStatus;
				triggerData.errorThrown = errorThrown;

				var plfEvent = new $.Event( "pageloadfailed" );

				// Let listeners know the page load failed.
				settings.pageContainer.trigger( plfEvent, triggerData );

				// If the default behavior is prevented, stop here!
				// Note that it is the responsibility of the listener/handler
				// that called preventDefault(), to resolve/reject the
				// deferred object within the triggerData.
				if ( plfEvent.isDefaultPrevented( ) ) {
					return;
				}

				// Remove loading message.
				if ( settings.showLoadMsg ) {

					// Remove loading message.
					hideMsg( );

					// show error message
					$.mobile.showPageLoadingMsg( $.mobile.pageLoadErrorMessageTheme, $.mobile.pageLoadErrorMessage, true );

					// hide after delay
					setTimeout( $.mobile.hidePageLoadingMsg, 1500 );
				}

				deferred.reject( absUrl, options );
			}
		} );
	}

	return deferred.promise( );
};

emis.mobile.Utilities.loadPage.defaults = {
	type: "get",
	data: undefined,
	reloadPage: false,
	//By default we rely on the role defined by the @data-role attribute.
	role: undefined,
	showLoadMsg: false,
	pageContainer: undefined,
	loadMsgDelay: 50
	// This delay allows loads that pull from browser cache to occur without showing the loading message.
};

emis.mobile.Utilities.raf = window.requestAnimationFrame || window.mozRequestAnimationFrame || window.msRequestAnimationFrame || window.webkitRequestAnimationFrame || window.oRequestAnimationFrame;

emis.mobile.Utilities.scroll = {};

emis.mobile.Utilities.scroll.disabler = function(e) {
	e.preventDefault();
}

emis.mobile.Utilities.scroll.disable = function( page ) {
	$('body').addClass('stop-scrolling');
	$(document).bind('touchmove', emis.mobile.Utilities.scroll.disabler);
	// $(page).siblings().addClass('stop-scrolling');
	// $(page).siblings().bind('touchmove', emis.mobile.Utilities.scroll.disabler);
}

emis.mobile.Utilities.scroll.enable = function() {
	$('body').removeClass('stop-scrolling');
	$(document).unbind('touchmove', emis.mobile.Utilities.scroll.disabler);
	// $("body > div[data-role='page'], body > div[data-role='dialog']").removeClass('stop-scrolling');
	// $("body > div[data-role='page'], body > div[data-role='dialog']").unbind('touchmove', emis.mobile.Utilities.scroll.disabler);
}


emis.mobile.Utilities.wrapFunction = function (functionToWrap, before, after, thisObject) {
	return function () {
		var args = Array.prototype.slice.call(arguments) ;
		var result = null ;
		if (before) {
			before.apply(thisObject || this, args);
		}
		result = functionToWrap.apply(thisObject || this, args);
		if (after) {
			after.apply(thisObject || this, args);
		}
		return result;
	};
};

emis.mobile.Utilities.prepareNHS = function ( primaryIdentifier ) {
	var formattedNHS = '';
	if ( primaryIdentifier ) {
		if ( primaryIdentifier.length > 2 ) {
			formattedNHS += primaryIdentifier.substring( 0, 3 );
		}
		if ( primaryIdentifier.length > 5 ) {
			formattedNHS += ' ' + primaryIdentifier.substring( 3, 6 );
		}
		if ( primaryIdentifier.length > 6 ) {
			formattedNHS += ' ' + primaryIdentifier.substr( 6 );
		}
	}
	return formattedNHS;
};

emis.mobile.Utilities.alert = function( par ) {
	if ( ! par ) return;
	par.title = par.title ? par.title : "Alert";
	par.bAlert = true;
	emis.mobile.Utilities.customConfirmPopup( par );
}

emis.mobile.Utilities.fixPopupBackground = function( ) {
	emis.mobile.Utilities.scroll.disable();
	$( "#dynamic-popup-screen" ).bind( "touchmove", emis.mobile.Utilities.scroll.disabler );
}

emis.mobile.Utilities.repositionPopup = function( e, bOrientationChange ) {
	$( '#dynamic-popup' ).popup( "reposition", { positionTo: "window" } );
	if ( ( emis.mobile.UI.isAndroid && emis.mobile.UI.isNative ) || emis.mobile.UI.isWindows ) {
		var callback = function() {
			var $popupBackground = $( "#dynamic-popup-screen");
			var $popupContainer = $( "#dynamic-popup-popup" );
			$popupBackground.add( $popupContainer ).show();
			$popupContainer.css( "top", Math.floor( $(window).height() / 2 - $popupContainer.height() / 2 ) + "px" );
			$popupContainer.css( "left", Math.floor( $(window).width() / 2 - $popupContainer.width() / 2 ) + "px" );
			$popupContainer.css( "position", "fixed" );
		}
		if ( bOrientationChange ) {
			setTimeout( function() {
				callback();
			}, SCROLLTO_DELAY );
		} else {
			callback();
		}
	}
}

emis.mobile.Utilities.customConfirmPopup = function( par ) {
	if ( ! par ) return;

	var dialogId = "dynamic-popup";
	var previousDialog = $( "#" + dialogId );
	if ( previousDialog.length ) {
		previousDialog.remove();
	}

	var customOk = par.ok ? par.ok : "Ok";
	var customCancel = par.cancel ? par.cancel : "Cancel";
	var message = par.message ? par.message : "";
	var title = par.title ? par.title : "Alert";
	var bAlert = par.bAlert ? par.bAlert : false;
	var bPatientWarnings = par.bPatientWarnings ? par.bPatientWarnings : false;
	var callback = par.callback;

	var backPage = par.backPage ? par.backPage : $.mobile.activePage.selector; //it also handles case when passed par.backPage will be null
	/*
	 * Correct use of backPage parameter:
	 *
	 * If popup is fired from page or dialog use {backPage: $.mobile.activePage.selector}
	 * BUT if right after firing popup there is a $.mobile.changePage( newPage ) then use {backPage: newPage}
	 *
	 * Reason? Popup needs to be attached to visible page.
	 */

	var bDebug = par.bDebug ? par.bDebug : false;
	if ( bDebug ) {
		/*
		 * cases where I'm not 100% sure that backPage is set properly
		 * it should work correctly but you may look for "bDebug: true" in
		 * params for emis.mobile.Utilities.alert and emis.mobile.Utilities.customConfirmPopup
		 */
	}

	var markup = "";
	markup += '<div id="' + dialogId + '" data-role="popup" data-dismissible="false" data-theme="emis">';
		markup += '<div data-role="header" data-theme="emis" class="ui-corner-top ui-header ui-bar-emis" role="banner"><h1 data-container="header-title">'+_.h(title)+'</h1></div><div data-role="content">' ;
			markup += '<div class="contentPanel">';
				if ( bPatientWarnings ) {
					markup += '<div id="warningsContainer">' + message + '</div>';
				} else {
					markup += '<div>' + message + '</div>';
				}
				markup += '<div class="e-blocks">';
				if ( bAlert ) {
					markup += '<a data-role="none" href="#" data-confirm="ok" class="button small">' + _.h(customOk) + '</a>';
				} else {
					markup += '<div class="grid-2 e-block-a">';
						markup += '<a data-role="none" href="#" data-confirm="ok" class="button green">' + _.h(customOk) + '</a>';
					markup += '</div>';
					markup += '<div class="grid-2 e-block-b">';
						markup += '<a data-role="none" href="#" data-confirm="cancel" class="button red">' + _.h(customCancel) + '</a>';
					markup += '</div>';
				}
				markup += '</div>';
			markup += '</div>';
		markup += '</div>';
	markup += '</div>';

	var $popup = $( markup );
	var $ok = $popup.find( 'a[data-confirm="ok"]' );
	var $cancel = $popup.find( 'a[data-confirm="cancel"]' );

	$popup.one( "popupbeforeposition", function() {
		if ( ! main.controller.isLandscape && main.controller.isDrawerOpen ) {
			emis.mobile.UI.immediateScrollPageXY( 0, window.pageYOffset );
		}
	} );

	$popup.on( "popupafteropen", function() {
		emis.mobile.Utilities.fixPopupBackground();
		$( backPage ).css( "overflow", "visible" );
		if ( ! main.controller.isLandscape && main.controller.isDrawerOpen ) {
			setTimeout( emis.mobile.Utilities.repositionPopup, SCROLLTO_DELAY );
		} else {
			emis.mobile.Utilities.repositionPopup();
		}
	} );

	$ok.add( $cancel ).on( "click", function() {
		var bOkClicked = false;
		if ( $( this ).data( "confirm" ) == "ok" ) {
			bOkClicked = true;
		}
		$popup.on( "popupafterclose", function() {
			$( this ).remove();
			if ( callback ) {
				callback( bOkClicked );
			}
		});
		$( backPage ).css( "overflow", "" );
		emis.mobile.Utilities.scroll.enable();
		$popup.popup( "close" );
		$( document ).trigger( "emis.manageheaders" );
	} );

	$( backPage ).append( $popup );
	$popup.enhanceWithin().popup( { history: false, positionTo: "window" } );
	if ( main.controller.isScreenKeyboard || main.controller.keyboardHidingTimer ) {
		setTimeout( emis.mobile.Utilities.repositionPopup, SCROLLTO_DELAY_WITH_KEYBOARD);
	}
	$popup.popup( "open" );
};

emis.mobile.Utilities.confirm = emis.mobile.Utilities.customConfirmPopup ;

emis.mobile.Utilities.displayConfirmResync = function( callback ) {
	emis.mobile.Utilities.confirm({message: "There are no items to sync. Do you want to sync again?", title: "Please confirm", ok:'Sync again', cancel:'Cancel',
		callback:function (confirm){
			if (confirm && callback) {
				callback();
			}
		}
	});
};

emis.mobile.Utilities.isTrue = function( val ) {
	if ( val && typeof val != "string" ) {
		return true;
	}
	if ( val && typeof val == "string" && val.toLowerCase() == "true" ) {
		return true;
	}
	return false;
}

emis.mobile.Utilities.capitaliseFirstLetter = function( string ) {
	return string.charAt( 0 ).toUpperCase() + string.slice( 1 );
};

emis.mobile.Utilities.isKeyInJsonObject = function( key, obj ) {
	// test json: [ { a: [ "1", "2", "3" ] }, { b : { c: 4 } }, { d : "aaaa" }, "e" ];
	var bFound = false;
	if ( typeof obj === "object" ) {
		for (var k in obj){
			if ( obj.hasOwnProperty( key ) && obj.length === undefined ){
				return true;
			}
			if ( obj.hasOwnProperty( k ) ){
				bFound = emis.mobile.Utilities.isKeyInJsonObject( key, obj[k] );
				if ( bFound ) {
					break;
				}
			}
		}
	}
	return bFound;
};

emis.mobile.Utilities.repositionSharedOrgsPopup = function( windowWidth ) {
	// when shared icon is near the right side of the screen then change styles, etc...
	var reposition = function() {
		var drawerWidth = $( "#drawer" ).width( );
		var offset = el.offset();
		if ( offset ) {
			if ( el.width() + offset.left > windowWidth ) {
				el.addClass( "right-side" );
			} else if ( offset.left < 0 ||
					( ( main.controller.isDrawerOpen || main.controller.isLandscape ) && offset.left < drawerWidth ) ) {
				el.addClass( "left-side" );
			}
		}
	}

	if ( ! windowWidth ) {
		windowWidth = $( window ).width();
	}

	var el = $( "#sharedOrgsPopup" );
	if ( el.hasClass( "right-side" ) || el.hasClass( "left-side" ) ) {
		el.removeClass( "right-side left-side" );
		setTimeout( function() {
			reposition();
		}, 0 );
	} else {
		reposition();
	}
};

/*
 * methods compares two json objects
 * http://stackoverflow.com/a/1144249
 *
 * */
emis.mobile.Utilities.areObjectsEqual = function() {
	var leftChain, rightChain;

	function compare2Objects(x, y) {
		var p;

		// remember that NaN === NaN returns false
		// and isNaN(undefined) returns true
		if (isNaN(x) && isNaN(y) && typeof x === 'number' && typeof y === 'number') {
			return true;
		}

		// Compare primitives and functions.
		// Check if both arguments link to the same object.
		// Especially useful on step when comparing prototypes
		if (x === y) {
			return true;
		}

		// Works in case when functions are created in constructor.
		// Comparing dates is a common scenario. Another built-ins?
		// We can even handle functions passed across iframes
		if ((typeof x === 'function' && typeof y === 'function') ||
			(x instanceof Date && y instanceof Date) ||
			(x instanceof RegExp && y instanceof RegExp) ||
			(x instanceof String && y instanceof String) ||
			(x instanceof Number && y instanceof Number)) {
			return x.toString() === y.toString();
		}

		// At last checking prototypes as good a we can
		if (!(x instanceof Object && y instanceof Object)) {
			return false;
		}

		if (x.isPrototypeOf(y) || y.isPrototypeOf(x)) {
			return false;
		}

		if (x.constructor !== y.constructor) {
			return false;
		}

		if (x.prototype !== y.prototype) {
			return false;
		}

		// check for infinitive linking loops
		if (leftChain.indexOf(x) > -1 || rightChain.indexOf(y) > -1) {
			return false;
		}

		// Quick checking of one object beeing a subset of another.
		// todo: cache the structure of arguments[0] for performance
		for (p in y) {
			if (y.hasOwnProperty(p) !== x.hasOwnProperty(p)) {
				return false;
			} else if (typeof y[p] !== typeof x[p]) {
				return false;
			}
		}

		for (p in x) {
			if (y.hasOwnProperty(p) !== x.hasOwnProperty(p)) {
				return false;
			} else if (typeof y[p] !== typeof x[p]) {
				return false;
			}

			switch (typeof (x[p])) {
			case 'object':
			case 'function':

				leftChain.push(x);
				rightChain.push(y);

				if (!compare2Objects(x[p], y[p])) {
					return false;
				}

				leftChain.pop();
				rightChain.pop();
				break;

			default:
				if (x[p] !== y[p]) {
					return false;
				}
				break;
			}
		}

		return true;
	}

	if (arguments.length < 1) {
		return true; //Die silently? Don't know how to handle such case, please help...
		// throw "Need two or more arguments to compare";
	}

	for (var i = 1, l = arguments.length; i < l; i++) {

		leftChain = []; //todo: this can be cached
		rightChain = [];

		if (!compare2Objects(arguments[0], arguments[i])) {
			return false;
		}
	}

	return true;
};

