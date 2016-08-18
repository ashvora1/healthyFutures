/**
 * TaskList form controller Functionalities provided:
 */

emis.mobile.form.EditTask = function( appObject ) {
	var that = this, _app = appObject, _bStaticComponentsInitialized = false, data = [], lastPage = null;

	var taskType, taskUrgency, taskDescription, taskDueDate, taskAppendTo;

	var unbindEvents = function( ) {
		$( "#editTaskcloseBtn" ).unbind( );
		lastPage.off( 'pageshow', pageShow );
		emis.mobile.UI.removeOrientationEventsForDialog( orientationChange );
		$( "#taskList" ).css( {
			"overflow": "visible",
			"max-height": "none"
		} );
	}
	var pageShow = function( ) {
		orientationChange( );
	}
	var orientationChange = function( ) {
		var newHeight = emis.mobile.UI.calculateDialogPadding( _app, lastPage );
		$( "#taskList" ).css( {
			"min-height": newHeight,
			"max-height": newHeight,
			"overflow": "hidden"
		} );

		if ( lastPage ) {
			lastPage.css( {
				"padding-bottom": "",
				"height": ""
			});
			emis.mobile.UI.setDialogHeight( lastPage, "#taskList" );
		}
	}
	/**
	 * get from dictionary and convert it to JSON post format { "taskType": { "code": "1", "term": "Book Appointment" }, }
	 */
	function getTaskType( taskTypes, id ) {
		for ( var i = 0; i < taskTypes.length; i++ ) {
			var singleTaskType = taskTypes[i];
			if ( singleTaskType.object )
				singleTaskType = singleTaskType.object;
			// strip record wrap
			if ( singleTaskType.Id == id ) {
				return {
					code: singleTaskType.Id,
					term: singleTaskType.Description
				};
			}
		}
		return null;
	}

	function getRecipientId( organisationPeople, id ) {
		for ( var i = 0; i < organisationPeople.length; i++ ) {
			var person = organisationPeople[i];
			if ( person.object )
				person = person.object;
			// strip record wrap
			if ( person.Id == id ) {
				return {
					id: person.Id,
					name: person.DisplayName
				};
			}
		}
		return null;
	}

	function unvalidateFields( ) {
		taskType.parent( ).removeClass( 'notValid' );
		taskDueDate.parent( ).removeClass( 'notValid' );
		taskAppendTo.parent( ).removeClass( 'notValid' );
	}

	var setUrgentStyle = function( ) {
		$( "#task-edit-not-urgent" ).removeClass( "ui-radio-on ui-btn-active" ).addClass( "ui-radio-off" );
		$( "#task-edit-urgent" ).removeClass( "ui-radio-off" ).addClass( "ui-radio-on ui-btn-active" );
	}
	var setNotUrgentStyle = function( ) {
		$( "#task-edit-urgent" ).removeClass( "ui-radio-on ui-btn-active" ).addClass( "ui-radio-off" );
		$( "#task-edit-not-urgent" ).removeClass( "ui-radio-off" ).addClass( "ui-radio-on ui-btn-active" );
	}
	var urgencyEvent = function( ) {
		if ( this.id == "task-edit-urgent" ) {
			setUrgentStyle( );
			data.object.task.urgent = true;
		} else {
			setNotUrgentStyle( );
			data.object.task.urgent = false;
		}
	}
	var setTaskTypesAndBinding = function( ) {
		var taskTypes = _app.dataProvider.getTaskTypes( );

		taskTypes.sort( function( a, b ) {
			var aDisplay = a.object.Description.toUpperCase( );
			var bDisplay = b.object.Description.toUpperCase( );
			if ( aDisplay < bDisplay )
				return -1;
			if ( aDisplay > bDisplay )
				return 1;
			// a must be equal to b
			return 0;
		} );

		if ( taskType ) {
			taskType.remove( );
		}
		var selectHtml = '<select name="taskType" id="editTaskType" data-role="none">';
		if ( ! emis.mobile.UI.isIE10 || emis.mobile.UI.isAtLeastIE11) {
			selectHtml += '<option value=""></option>';
		}
		for ( var i = 0; i < taskTypes.length; i++ ) {
			var singleTaskType = taskTypes[i];
			if ( singleTaskType.object )
				singleTaskType = singleTaskType.object;
			// remove storage record wrapper
			if ( singleTaskType.Id == data.object.task.taskType.code ) {
				selectHtml += '<option value="' + singleTaskType.Id + '" selected>' + _.h(singleTaskType.Description) + '</option>';
			} else {
				selectHtml += '<option value="' + singleTaskType.Id + '">' + _.h(singleTaskType.Description) + '</option>';
			}
		}
		selectHtml += '</select>';

		taskType = $( selectHtml );

		$( "#task-type-wrapper2" ).append( taskType );

		// get Organisation people
		var organisationPeople = _app.dataProvider.getOrganisationPeople( );
		if ( taskAppendTo ) {
			taskAppendTo.remove( );
		}

		var appendTo = '<select name="assignTo" id="assignTo2" data-role="none">';
		// if (!emis.mobile.UI.isIE10 || emis.mobile.UI.isAtLeastIE11) {
		// appendTo += '<option value=""></option>';
		// }

		var st = new emis.mobile.Storage( );
		var peopleToWrite = [];
		for ( var i = 0; i < organisationPeople.length; i++ ) {
			var singlePerson = organisationPeople[i];
			if ( singlePerson.object ) {
				singlePerson = singlePerson.object;
			}

			var counter = st.find( "PeopleCounter", singlePerson.Id );
			if ( counter ) {
				counter = JSON.parse( counter ).count;
			} else {
				counter = 0;
			}
			singlePerson.counter = counter;

			peopleToWrite.push( singlePerson );
		}

		peopleToWrite.sort( function( a, b ) {
			if ( a.counter != b.counter )
				return b.counter - a.counter;
			return a.DisplayName.localeCompare( b.DisplayName );
		} );

		// create groups in select? first group with top5, second with all
		// optgroup with options

		var unusedNow = false;
		var addedClass = 'oftenUsed';
		for ( var i = 0; i < peopleToWrite.length; i++ ) {
			var singlePerson = peopleToWrite[i];
			if ( singlePerson.counter == 0 && !unusedNow ) {
				addedClass = '';
				if ( i > 0 )
					appendTo += '<option disabled="disabled">----------------</option>';
				unusedNow = true;
			}

			appendTo += '<option value="' + singlePerson.Id + '" class="' + addedClass + '">' + _.h(singlePerson.DisplayName) + '</option>';
		}

		appendTo += '</select>';

		taskAppendTo = $( appendTo );

		$( "#task-assign-to-wrapper2" ).append( taskAppendTo );
	}
	var updateTask = function( ) {
		var valid = true;
		unvalidateFields( );
		if ( !taskType.val( ) ) {
			valid = false;
			if ( !taskType.parent( ).hasClass( 'notValid' ) ) {
				taskType.parent( ).addClass( 'notValid' );
			}
		}
		if ( !taskDueDate.val( ) ) {
			valid = false;
			if ( !taskDueDate.parent( ).hasClass( 'notValid' ) ) {
				taskDueDate.parent( ).addClass( 'notValid' );
			}
		}
		if ( !taskAppendTo.val( ) ) {
			valid = false;
			if ( !taskAppendTo.parent( ).hasClass( 'notValid' ) ) {
				taskAppendTo.parent( ).addClass( 'notValid' );
			}
		}

		if ( !valid ) {

			return false;
		}
		data.object.task.description = main.sanitizer.sanitize( taskDescription.val( ) );
		data.object.task.taskType = getTaskType( _app.dataProvider.getTaskTypes( ), taskType.val( ) );
		data.object.task.dueDate = _app.util.toISODate( taskDueDate.val( ) );
		data.object.task.recipient = getRecipientId( _app.dataProvider.getOrganisationPeople( ), taskAppendTo.val( ) )
		_app.dataProvider.saveTask( data );
		unbindEvents( );
		$.mobile.changePage( "#taskList" );
	}

	this.bindDataAndEvents = function( $page, refresh ) {
		lastPage = $page;
		$( "#editTaskcloseBtn" ).click( function( e ) {
			unbindEvents( );
			$.mobile.changePage( "#taskList" );
		} );
		var storage = new emis.mobile.Storage( );

		obj = storage.find( "Task", main.controller.editTaskId );
		if ( obj ) {
			data.object = JSON.parse( obj );
		}
		data.id = main.controller.editTaskId;

		taskDescription = $( '#editTaskDescription' );
		taskDueDate = $( '#edit-task-due-date' );
		taskAppendTo = $( '#assignTo2' );

		setTaskTypesAndBinding( );

		initializeStaticComponents( $page, data );

		taskDueDate.val( _app.util.standardizeDate( data.object.task.dueDate ) );
		taskDescription.val( data.object.task.description );
		taskAppendTo.val( data.object.task.recipient.id );

		if ( data.object.task.urgent ) {
			setUrgentStyle( );
		} else {
			setNotUrgentStyle( );
		}

		unvalidateFields( );
		emis.mobile.UI.addOrientationEventsForDialog( orientationChange );
		orientationChange( );
		$page.on( 'pageshow', pageShow );

	};

	function initializeStaticComponents( $page, data ) {
		if ( !_bStaticComponentsInitialized ) {
			$( "#task-edit-urgent, #task-edit-not-urgent" ).on( "click", urgencyEvent );
			$( "#update-task-button" ).on( "click", updateTask );
			_bStaticComponentsInitialized = true;
		}
	}

	return this;
}
