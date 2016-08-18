/**
 * TaskList form controller Functionalities provided:
 */

emis.mobile.form.TaskList = function( appObject ) {
	var that = this;
	var _app = appObject;
	var _bStaticComponentsInitialized = false;
	var notSynchronisedTasks = [];
	var animDuration = 0;

	var taskType, taskUrgency, taskDescription, taskDueDate, isAddTaskAction, taskAppendTo, currentlyEditedTask, currentlyEditedTaskParent, fdb;

	this.data = [];
	this.currentTaskData = [];

	/**
	 * shortcut for string formatting
	 */
	var fs = _app.util.formatString;

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
		return '<div class="header grid">';
	}

	function getSectionHeaderClose( ) {
		return '</div>';
	}

	function getSectionContentOpen( ) {
		return '<div class="content grid">';
	}

	function getSectionContentClose( ) {
		return '</div>';
	}


	this.setTaskRecord = function( taskRecord ) {
		that.currentTaskData.taskRecord = taskRecord;
		that.currentTaskData.task = that.currentTaskData.taskRecord.object.task;
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

	// makes copy of task to save data in case user clicks cancel
	function makeCopyOfTask( taskRecord ) {
		copiedDescription = "";
		copiedUrgent = true;
		copiedDueDate = "";
		copiedTaskType = "";
		if ( taskRecord ) {
			copiedDescription = taskRecord.object.task.description;
			copiedUrgent = taskRecord.object.task.urgent;
			copiedDueDate = taskRecord.object.task.dueDate;
			copiedTaskType = taskRecord.object.task.taskType;
		}

		if ( copiedUrgent ) {
			setUrgentStyle( );
		} else {
			setNotUrgentStyle( );
		}
		taskDueDate.val( _app.util.standardizeDate( copiedDueDate ) );
		taskDescription.val( copiedDescription );
		$( "#" + taskType[0].id + " option" ).filter( function( ) {
			return $( this ).text( ) == copiedTaskType.term;
		} ).attr( 'selected', true );
	}

	function cancelAction( ) {
		if ( isAddTaskAction === true ) {
			removeTask( that.currentTaskData.taskRecord.id );
		} else {
			that.currentTaskData.taskRecord.object.task.description = copiedDescription;
			that.currentTaskData.taskRecord.object.task.urgent = copiedUrgent;
			if ( copiedTaskType == null )
				that.currentTaskData.taskRecord.object.task.taskType = null;
			that.currentTaskData.taskRecord.object.task.taskType = copiedTaskType;
			if ( copiedDueDate == null )
				$( '#add-task-due-date' ).trigger( 'datebox', {
					'method': 'doclear'
				} );
			else
				that.currentTaskData.taskRecord.object.task.dueDate = copiedDueDate;

			_app.dataProvider.saveTask( that.currentTaskData.taskRecord );
		}
	}

	function onClickCancel( ) {
		cancelAction( );
		unvalidateFields( );
		refreshTasksList( );
		initializeAddTask( );
	}

	function updateTaskRecord( ) {
		that.currentTaskData.taskRecord.object.task.description = main.sanitizer.sanitize( taskDescription.val( ) );
		that.currentTaskData.taskRecord.object.task.taskType = getTaskType( _app.dataProvider.getTaskTypes( ), taskType.val( ) );
		that.currentTaskData.taskRecord.object.task.dueDate = _app.util.toISODate( taskDueDate.val( ) );
		that.currentTaskData.taskRecord.object.task.recipient = getRecipientId( _app.dataProvider.getOrganisationPeople( ), taskAppendTo.val( ) )
	}

	function onClickOk( event ) {
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

		if ( !taskAppendTo.val( ) || taskAppendTo.val( ) == "----------------" ) {
			valid = false;
			if ( !taskAppendTo.parent( ).hasClass( 'notValid' ) ) {
				taskAppendTo.parent( ).addClass( 'notValid' );
			}
		}

		if ( !valid ) {
			return false;
		}


		var callback = function () {
			updateTaskRecord( );

			if ( isAddTaskAction === true ) {
				_app.dataProvider.addTask( that.currentTaskData.taskRecord );
			} else {
				_app.dataProvider.saveTask( that.currentTaskData.taskRecord );
			}


			main.controller.taskDescription = null;
			main.controller.taskDueDate = null;
			main.controller.taskUrgency = null;
			main.controller.taskType = null;
			main.controller.assignTo = null;


			jQuery(document).trigger('emis.needsync', ['tasks']) ;


			refreshTasksList( );
			initializeAddTask( );
		}

		if ( emis.mobile.UI.isIE10 || emis.mobile.UI.isAtLeastIE11) {
			// fix for R#128693
			setTimeout(function() {
				callback();
			}, 0);
			return false;
		} else {
			callback();
		}
	}

	function refreshTasksList( ) {
		getAndSortTasks( );

		// //Clear the markup
		// $( "#taskListContent" ).html( "" );

		var markup = '';
		markup = fillSectionListview( markup, that.data.list );

		$( "#add-task" ).append( $( "#add-task-content" ) );
		$( "#add-task-content" ).addClass( "feature" );

		$( "#add-task .last-block > div" ).hide( animDuration );
		$( "#add-task .last-block > div" ).not( ".edit-task-buttons" ).show( animDuration );

		$( "#taskListContent" ).html( markup );
	}

	function unvalidateFields( ) {
		taskType.parent( ).removeClass( 'notValid' );
		taskDueDate.parent( ).removeClass( 'notValid' );
		taskAppendTo.parent( ).removeClass( 'notValid' );
	}

	function fillSectionListview( markup, data ) {

		if ( !markup )
			markup = '';

		if ( data === null || data.length === 0 ) {
			markup += getSectionNoData( 'Tasks added' );
		} else {

			markup += getSectionOpen( );

			/* header */
			markup += '<div class="header">Tasks added</div>';

			/* content */
			markup += getSectionContentOpen( );

			notSynchronisedTasks = [];
			for ( var i = 0; i < data.length; i++ ) {
				var taskObj = data[i].object;
				markup += '<div class="e-blocks"';
				var disableClass = '';
				/*if ( _app.dataProvider.isTaskNotSynchronised( data[i].id ) ) {
					notSynchronisedTasks.push( data[i].id );
					disableClass = ' ui-disabled"';
				}*/
				markup += ' data-task-index="' + data[i].id + '">';
				markup += '<div class="grid-4 e-block-a">';
				markup += '<div class="task-type">' + _.h( taskObj.task.taskType ? taskObj.task.taskType.term : '' ) + '</div>';
				markup += '</div>';
				markup += '<div class="grid-4 e-block-b">'
				markup += '<div class="task-due-date"><span class="taskDateLabel">Due date:</span>';
				if ( taskObj.task.dueDate ) {
					markup += '<span class="taskDateSpan">' + f( _app.util.standardizeDate( taskObj.task.dueDate ) ) + '</span>';
				}

				markup += '</div>';
				markup += '</div>';
				markup += '<div class="grid-4 e-block-c">';
				if ( taskObj.task.urgent ) {
					markup += '<span class="task-urgency">Urgent</span>';
				}
				markup += '</div>';
				markup += '<div class="grid-4 e-block-d">';
				markup += '<a data-edit="true" data-task-index="' + data[i].id + '" class="task-edit button' + disableClass + '" data-role="none" href="">Edit</a>';
				markup += '<a data-delete="true" data-task-index="' + data[i].id + '" class="task-delete button red' + disableClass + '" data-role="none" href="">Remove</a>';
				markup += '</div>';

				markup += '<div class="inside-e-block">';
				markup += '<div class="grid-2 e-block-a">';
				markup += '<div class="task-recipient"><span>Task Recipient:</span></div>';
				markup += '</div>';
				markup += '<div class="grid-2 e-block-b recipient">' + _.h( taskObj.task.recipient.name ) + '</div>';
				markup += '</div>';

				markup += '<div class="inside-e-block">';
				markup += '<div class="grid-2 e-block-a">';
				markup += '<div class="task-details"><span>Details:</span></div>';
				markup += '</div>';
				markup += '<div class="grid-2 e-block-b">';
				markup += '<div class="task-details-description">' + _.h( taskObj.task.description ) + '</div>';
				markup += '</div>';
				markup += '</div>';

				markup += '</div>';
			}

			markup += getSectionContentClose( );
			markup += getSectionClose( );
		}
		return markup;
	}

	function format( v ) {
		if ( v )
			return v;
		return '';
	}

	function compare( a, b ) {
		if ( a.length != b.length )
			return a.length - b.length;
		it = 0;
		while ( it < a.length && a[it] == b[it] ) {
			it++;
		}
		return b[it] - a[it];
	}

	var setUrgentStyle = function( ) {
		$( "#task-add-not-urgent" ).removeClass( "ui-radio-on ui-btn-active" ).addClass( "ui-radio-off" );
		$( "#task-add-urgent" ).removeClass( "ui-radio-off" ).addClass( "ui-radio-on ui-btn-active" );
	}
	var setNotUrgentStyle = function( ) {
		$( "#task-add-urgent" ).removeClass( "ui-radio-on ui-btn-active" ).addClass( "ui-radio-off" );
		$( "#task-add-not-urgent" ).removeClass( "ui-radio-off" ).addClass( "ui-radio-on ui-btn-active" );
	}
	var urgencyEvent = function( ) {
		if ( this.id == "task-add-urgent" ) {
			setUrgentStyle( );
			that.currentTaskData.taskRecord.object.task.urgent = true;
			main.controller.taskUrgency = true;
		} else {
			setNotUrgentStyle( );
			that.currentTaskData.taskRecord.object.task.urgent = false;
			main.controller.taskUrgency = false;
		}
	}
	var unbindEvents = function( ) {
		emis.mobile.UI.removeOrientationEventsForDialog( orientationChange );
	}
	function orientationChange( ) {
		// I don't know what for this setTimeout was but removing it fixes R#113642 - KKier
		// setTimeout(function() {
		$( "#taskList" ).css( {
			"min-height": 300
			// to redo jquery.mobile.1.1.1.js : 2881 min-height set
		} )
		// },500);

		// if iPad do the blur so there is no effect that select indicates
		// somewhere else than select field
		if ( emis.mobile.UI.isiPad ) {
			$( 'select' ).blur( );
		}

		// $("#editAssignTo").blur();
	}

	var pageHide = function( ) {
		$( window ).off( 'pagehide', pageHide );
		$( window ).off( 'beforeunload', pageHide );
		cancelAction( );
		unbindEvents( );
	}
	var pageShow = function( ) {
		$( window ).on( 'beforeunload', pageHide );
		$( window ).on( 'pagehide', pageHide );
		cancelAction( );
		if ( main.controller.taskUrgency == false ) {
			setNotUrgentStyle( );
		} else {
			setUrgentStyle( );
		}
		orientationChange( );
	}
	var editTask = function( index ) {
		window.scrolled = $( window ).scrollTop( );
		cancelAction( );
		main.controller.editTaskId = index;
		$.mobile.changePage( "#editTask", {
			delay: true
		} );
	}
	var removeTask = function( index ) {
		_app.dataProvider.removeTask( index );
		refreshTasksList( );
	}
	var getAndSortTasks = function( ) {
		that.data.list = _app.dataProvider.findTasks( );

		if ( that.data.list ) {
			that.data.list.sort( function( a, b ) {
				if ( !a.object.task.dueDate || a.object.task.dueDate === "" || !b.object.task.dueDate || b.object.task.dueDate === "" )
					return;
				aparts = a.id.split( "#" )[1];
				bparts = b.id.split( "#" )[1];
				aparts = aparts.split( "-" );
				bparts = bparts.split( "-" );
				aval = aparts[0];
				bval = bparts[0];
				return compare( aval, bval );
			} );
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
		var selectHtml = '<select name="taskType" id="taskType" data-role="none">';
		//if ( ! emis.mobile.UI.isIE10 || emis.mobile.UI.isAtLeastIE11) {
			selectHtml += '<option value=""></option>';
		//}

		for ( var i = 0; i < taskTypes.length; i++ ) {
			var singleTaskType = taskTypes[i];
			if ( singleTaskType.object )
				singleTaskType = singleTaskType.object;
			// remove storage record wrapper
			selectHtml += '<option value="' + singleTaskType.Id + '"';
			if ( main.controller.taskType && main.controller.taskType == singleTaskType.Id ) {
				selectHtml += ' selected="selected"';
			}
			selectHtml += '>' + _.h(singleTaskType.Description) + '</option>';
		}
		selectHtml += '</select>';

		taskType = $( selectHtml );

		$( "#task-type-wrapper" ).append( taskType );

		// get Organisation people
		var organisationPeople = _app.dataProvider.getOrganisationPeople( );
		// make the current user 1st
		if ( organisationPeople.length > 1 ) {
			index = -1;
			loggedUserId = main.storage.getItem( "lastUserId" );
			for ( var i = 0; i < organisationPeople.length; i++ ) {
				if ( organisationPeople[i].id == loggedUserId ) {
					index = i;
					break;
				}
			}
			if ( index > 0 ) {
				var tmp = organisationPeople[0];
				organisationPeople[0] = organisationPeople[index];
				organisationPeople[index] = tmp;
			}
		}
		if ( taskAppendTo ) {
			taskAppendTo.remove( );
		}
		if ( !main.controller.ServerVersion ) {
			$( "#add-task-content .e-block-d .e-label" ).hide( );
			return;
		}
		var appendTo = '<select name="assignTo" id="editAssignTo" data-role="none">';

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

		var loggedUserId = main.storage.getItem( "lastUserId" );
		var unusedNow = false;
		var addedClass = 'oftenUsed';
		var optionsCount = 0;
		var defaultOption = false;

		if ( main.controller.assignTo ) {
			defaultOption = true;
		}

		for ( var i = 0; i < peopleToWrite.length; i++ ) {
			var singlePerson = peopleToWrite[i];
			if ( singlePerson.counter == 0 && !unusedNow ) {
				addedClass = '';
				if ( i > 0 )
					appendTo += '<option disabled="disabled">----------------</option>';
				unusedNow = true;
			}

			if ( optionsCount < 4 || loggedUserId == singlePerson.Id || main.controller.assignTo == singlePerson.Id ) {

				appendTo += '<option value="' + singlePerson.Id + '" class="' + addedClass + '"';
				if ( defaultOption && main.controller.assignTo == singlePerson.Id ) {
					appendTo += 'selected';
				} else if ( !defaultOption && loggedUserId == singlePerson.Id ) {
					appendTo += 'selected';
				} else {
					optionsCount++;
				}
				appendTo += '>' + _.h(singlePerson.DisplayName) + '</option>';
			}
		}
		if ( peopleToWrite.length > 0 ) {
			appendTo += '<option value="all" class="' + addedClass + '"';
			appendTo += '>All users</option>';
		}

		appendTo += '</select>';
		taskAppendTo = $( appendTo );
		$( "#task-assign-to-wrapper" ).append( taskAppendTo );
	}
	var initializeAddTask = function( ) {
		isAddTaskAction = true;

		that.setTaskRecord( {
			id: null,
			object: {
				"patient": {
					"id": _app.controller.getPatientContext( ).guid,
					"name": _app.controller.getPatientContext( ).name
				},
				"task": {
					"dueDate": null,
					"recipient": {
						// _app.controller.user.id
						"id": "1404",
						"name": _app.controller.user.login
					},
					"taskType": {
						"code": null,
						"term": null
					},
					"urgent": true,
					"description": null
				}
			},
			serial: ( Math.random( ) * 1000 )
		} );

		setTaskTypesAndBinding( );

		if ( main.controller.taskDueDate ) {
			taskDueDate.val( main.controller.taskDueDate );
		} else {
			var today = new Date( );
			taskDueDate.val( _app.util.standardizeDate( today.toISOString( ) ) );
		}

		if ( main.controller.taskDescription )
			taskDescription.val( main.controller.taskDescription );
		else
			taskDescription.val( "" );
		$( "#add-task #taskType" ).filter( function( ) {
			return $( this ).text( ) == "";
		} ).attr( 'selected', true );
		if ( main.controller.taskUrgency == false ) {
			setNotUrgentStyle( );
		} else {
			setUrgentStyle( );
		}

		// add onChange events:
		function onchangeTaskAppendTo( event ) {
			window.scrolled = $( window ).scrollTop( );
			var val = $( event.target ).val( );
			if ( val == 'all' ) {
				$.mobile.changePage( "#taskallusers", {
					delay: true
				} );
			} else {
				main.controller.assignTo = val;
			}
		}

		function onchangeTaskType( event ) {
			var val = $( event.target ).val( );
			main.controller.taskType = val;
		}

		function onchangeDueDate( event ) {
			main.controller.taskDueDate = $( '#add-task-due-date' ).val( );
		}

		function onchangeTaskDescription( event ) {
			main.controller.taskDescription = $( '#taskDescription' ).val( );
		}


		taskAppendTo.on( "change", onchangeTaskAppendTo );
		taskType.on( "change", onchangeTaskType );
		taskDueDate.on( "change", onchangeDueDate );
		taskDescription.on( "change", onchangeTaskDescription );

	}

	this.bindDataAndEvents = function( $page, refresh ) {
		$page.off( 'pageshow', pageShow );
		$( '.addTaskLink' ).unbind( );

		var storage = new emis.mobile.Storage( );

		getAndSortTasks( );

		emis.mobile.UI.preparePatientPage( $page );

		var data = that.data.list;

		if ( data ) {
			taskAppendTo = $( '#editAssignTo' );
			taskAppendTo.unbind( );
			taskDescription = $( '#taskDescription' );
			taskType = $( '#taskType' );
			taskUrgency = $( '#taskUrgent' );
			taskDueDate = $( '#add-task-due-date' );

			initializeAddTask( );

			initializeStaticComponents( $page, data );

			refreshTasksList( );

			unvalidateFields( );

			$page.page( );

		}

		// $( '#taskListListview form div input' ).val( "" );
		$page.on( 'pageshow', pageShow );

		/* fix for #113291 and all similar problems in the future */
		$( "#drawer li" ).removeClass( "drawer-active" ).siblings( "#drawer-tasks" ).addClass( "drawer-active" );

		emis.mobile.UI.addOrientationEventsForDialog( orientationChange );
		orientationChange( );
		$( '#taskListListview form div input' ).val( "" );
		main.controller.lastTasksPatientId = main.controller.patient.id;
		/*if(main.dataProvider.getErrorAppointmentByPatientId(main.controller.patient.id)) {
			$("#add-task").addClass("ui-disabled");
		} else {
			$("#add-task").removeClass("ui-disabled");
		}*/
		// emis.mobile.UI.returnToScrolledPosition();
	};

	var clickEvent = function( e ) {
		var el = $( e.target );
		if ( el.is( "a.button" ) ) {
			var index = el.data( "task-index" );
			if ( index && notSynchronisedTasks.indexOf( index ) != -1 ) {
				return false;
			}

			if ( el.data( "edit" ) != undefined ) {
				editTask( index );
			}
			if ( el.data( "delete" ) != undefined ) {
				emis.mobile.Utilities.customConfirmPopup( {ok: "Yes", cancel: "No", message: 'Do you really want to delete?', title: 'Delete?', callback: function( r ) {
					if ( r === true ) {
						removeTask( index );
						jQuery(document).trigger('emis.needsync', ['tasks']) ;
					}
				} } );
			}
		}
	}
	function initializeStaticComponents( $page, data ) {
		if ( !_bStaticComponentsInitialized ) {

			// Bind click event for every button
			$("#taskListContent").on("click", clickEvent );

			$( "#edit-task-cancel-button" ).on( 'click', onClickCancel );
			$( "#edit-task-save-button,#add-task-button" ).on( 'click', onClickOk );

			$( "#task-add-urgent, #task-add-not-urgent" ).on( "click", urgencyEvent );

			emis.mobile.UI.preparePatientHeader() ;
			_bStaticComponentsInitialized = true;

		}
	}

	return this;
}