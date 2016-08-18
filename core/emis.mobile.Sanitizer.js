emis.mobile.Sanitizer = function( ) {

	this.sanitize = function( message ) {
		return removeTags( message );
	}
	var tagBody = '(?:[^"\'>]|"[^"]*"|\'[^\']*\')*';

	var tagOrComment = new RegExp( '<(?:'
	// Comment body.
	+ '!--(?:(?:-*[^->])*--+|-?)'
	// Special "raw text" elements whose content should be elided.
	+ '|script\\b' + tagBody + '>[\\s\\S]*?</script\\s*' + '|style\\b' + tagBody + '>[\\s\\S]*?</style\\s*'
	// Regular name
	+ '|/?[a-z]' + tagBody + ')>', 'gi' );

	function removeTags( html ) {
		var oldHtml;
		do {
			oldHtml = html;
			html = html.replace( tagOrComment, '' );
		} while ( html !== oldHtml );
		//return escape(html);
		return html.replace( /</g, '&lt;' );
	}

	return this;
}
// define shortcut to html escape function

if (!window._) {
	window._ = {} ;
}

window._.h = function (text) {
	if (text !== null && text !== undefined && text.replace) {
		return text.replace(/\"/g,"&quot;").replace(/</g,"&lt;").replace(/>/g,"&gt");
	}
	return '' ;
} ;