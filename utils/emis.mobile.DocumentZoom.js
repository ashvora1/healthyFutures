emis.mobile.DocumentZoom = function( ) {
	var that = this;
	var isEnabled = true;
	var oldCssTransform = "";
	var transformPrefix = "";
	var transformOriginPrefix = "";
	var multitouchStartDistance = null;

	var $documentParent, $document, translateX, translateY, startPosX, startPosY, frameWidth, frameHeight, maxWidth, maxHeight, documentScale, minDocumentScale, maxDocumentScale, multitouchStartScale, documentParentOffsetLeft, documentParentOffsetTop;

	this.isZoomed = function( ) {
		if ( documentScale == minDocumentScale )
			return false;
		else
			return true;
	}

	this.setDocumentWrapper = function( el ) {
		$documentParent = el;
	};

	this.setDocument = function( el ) {
		$document = el;
	};

	this.getCurrentScale = function( ) {
		return documentScale;
	}

	this.applyNewDimensions = function( left, top, width, height ) {
		frameWidth = width;
		frameHeight = height;

		if ( $documentParent ) {

			maxWidth = $documentParent[0].contentDocument.width;
			maxHeight = $documentParent[0].contentDocument.height;

			if ( maxWidth && maxWidth > frameWidth ) {
				documentScale = parseFloat( ( frameWidth / maxWidth ).toFixed( 5 ) );
			} else {
				documentScale = 1;
			}

			maxWidth *= documentScale;
			maxHeight *= documentScale;

			minDocumentScale = documentScale;
			maxDocumentScale = 5;

			multitouchStartScale = documentScale;
			multitouchStartDistance = null;
			translateX = 0;
			translateY = 0;

			documentParentOffsetLeft = left;
			documentParentOffsetTop = top;

			oldCssTransform = "";

			scaleAndTransformDocument( documentScale, minDocumentScale, frameWidth / 2, frameHeight / 2, false, false );
		}
	};

	this.clearOldDocumentData = function( ) {
		if ( $document ) {
			$document[0].style[transformPrefix] = "";
		}
	};

	this.resetLastDocumentData = function( ) {
		if ( $document ) {
			$document = null;
		}
	}
	var checkTranslateLimits = function( newScale ) {
		// alert( "a: " + $document.height() + "... b: " + $document[0].scrollHeight + "... c: " +
		// $document[0].clientHeight + "... d: " + $document[0].offsetHeight);
		// var documentHeight = Math.max( $document.height(), $document[0].scrollHeight, $document[0].clientHeight,
		// $document[0].offsetHeight );
		// var documentWidth = Math.max( maxWidth, $document.width(), $document[0].scrollWidth,
		// $document[0].clientWidth, $document[0].offsetWidth );
		var documentHeight = maxHeight;
		// $("#documentDetailsContent")[0].contentDocument.height;
		var documentWidth = maxWidth;
		// $("#documentDetailsContent")[0].contentDocument.width;

		// var documentWidth = Math.max( maxWidth, $document.width() );
		if ( documentWidth < frameWidth ) {
			documentWidth = frameWidth;
		}
		if ( documentHeight < frameHeight ) {
			documentHeight = frameHeight;
		}

		if ( translateX >= 0 ) {
			translateX = 0;
		} else if ( translateX < frameWidth - documentWidth * newScale / minDocumentScale ) {
			translateX = frameWidth - documentWidth * newScale / minDocumentScale;
		}
		if ( translateY >= 0 ) {
			translateY = 0;
		} else if ( translateY < frameHeight - documentHeight * newScale / minDocumentScale ) {
			translateY = frameHeight - documentHeight * newScale / minDocumentScale;
		}

		translateX = parseFloat( translateX.toFixed( 5 ) );
		translateY = parseFloat( translateY.toFixed( 5 ) );
	}
	var scaleAndTransformDocument = function( oldScale, newScale, posX, posY, shouldCenter, dontTransform, dontTransition ) {
		if ( !$document || $document.length == 0 ) {
			return;
		}

		var oldDocumentScale = documentScale;
		var oldTranslateX = translateX;
		var oldTranslateY = translateY;

		var relativePosX = posX - translateX;
		var relativePosY = posY - translateY;

		if ( shouldCenter ) {
			translateX = frameWidth / 2 - ( posX * ( newScale / oldScale ) );
			translateY = frameHeight / 2 - ( posY * ( newScale / oldScale ) );
		} else {
			translateX = translateX - ( relativePosX * ( newScale / oldScale ) - relativePosX );
			translateY = translateY - ( relativePosY * ( newScale / oldScale ) - relativePosY );
		}

		checkTranslateLimits( newScale );
		newScale = parseFloat( newScale.toFixed( 5 ) );
		documentScale = newScale;

		if ( dontTransform ) {
			return;
		}

		doScaleAndTransformDocument( );
	}
	var doScaleAndTransformDocument = function( ) {
		var cssScale = "scale(" + documentScale + ")";
		var cssTranslate = "translate(" + translateX + "px," + translateY + "px)";
		var cssTransform = cssTranslate + " " + cssScale;

		$document[0].style[transformPrefix] = cssTransform;
		oldCssTransform = cssTransform;
	};

	this.disableZoom = function( ) {
		isEnabled = false;
	};

	this.enableZoom = function( ) {
		isEnabled = true;
	};

	var getTouchDistance = function( touch1, touch2 ) {
		var x1 = touch1.clientX;
		var x2 = touch2.clientX;
		var y1 = touch1.clientY;
		var y2 = touch2.clientY;
		return Math.sqrt( ( ( x2 - x1 ) * ( x2 - x1 ) ) + ( ( y2 - y1 ) * ( y2 - y1 ) ) );
	};

	this.touchstartEvent = function( e ) {
		if ( !isEnabled )
			return;
		startPosX = e.touches[0].clientX;
		startPosY = e.touches[0].clientY;
		e.preventDefault( );
	};

	this.touchmoveEvent = function( e ) {
		if ( !isEnabled )
			return;
		var touch1 = e.touches[0];
		var touch2 = e.touches[1];
		if ( e.touches.length == 1 ) {
			that.moveDocument( touch1.clientX - startPosX, touch1.clientY - startPosY );
			startPosX = touch1.clientX;
			startPosY = touch1.clientY;
		} else if ( e.touches.length == 2 ) {
			if ( multitouchStartDistance === null ) {
				multitouchStartDistance = getTouchDistance( touch1, touch2 );
				multitouchStartScale = documentScale;
				oldPosX = ( ( touch1.clientX - documentParentOffsetLeft ) + ( touch2.clientX - documentParentOffsetLeft ) ) / 2;
				oldPosY = ( ( touch1.clientY - documentParentOffsetTop ) + ( touch2.clientY - documentParentOffsetTop ) ) / 2;
			} else {
				var touchDistance = getTouchDistance( touch1, touch2 );
				var oldScale = documentScale;
				var newScale = ( touchDistance / multitouchStartDistance ) * multitouchStartScale;

				if ( newScale < minDocumentScale ) {
					newScale = minDocumentScale;
				}
				if ( newScale === documentScale )
					return;

				if ( newScale <= maxDocumentScale ) {
					scaleAndTransformDocument( oldScale, newScale, oldPosX, oldPosY, false, false );
					e.preventDefault( );
				}
			}
		}
	};

	this.moveDocument = function( dX, dY ) {
		if ( !isEnabled )
			return;

		var oldTranslateX = translateX;
		var oldTranslateY = translateY;

		translateX += dX;
		translateY += dY;

		checkTranslateLimits( documentScale );

		if ( oldTranslateX != translateX || oldTranslateY != translateY ) {
			doScaleAndTransformDocument( );
		}
	}

	this.touchendEvent = function( ) {
		if ( !isEnabled )
			return;
		multitouchStartDistance = null;
		multitouchStartScale = documentScale;
	};

	this.scaleToNormal = function( ) {
		scaleAndTransformDocument( documentScale, minDocumentScale, frameWidth / 2, frameHeight / 2 );
		oldCssTransform = "";
	}

	this.setCorrectTransforms = function( ) {
		if ( emis.mobile.UI.isIE10 || emis.mobile.UI.isAtLeastIE11) {
			transformPrefix = "msTransform";
			transformOriginPrefix = "msTransformOrigin";
		} else if ( emis.mobile.UI.isFirefox ) {
			transformPrefix = "MozTransform";
			transformOriginPrefix = "MozTransformOrigin";
		} else {
			transformPrefix = "WebkitTransform";
			transformOriginPrefix = "WebkitTransformOrigin";
		}
	}

	return this;
};
