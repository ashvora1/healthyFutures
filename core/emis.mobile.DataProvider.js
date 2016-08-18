/**
 * General, common entry point for data access, storage, and synchronization. Functionalities provided: Provide patient
 * record Provide care record Provide encounters (consultations) Encounter edit complete functionality Values tab
 * provider Dictionaries provider (consultation types, task types, RTTs) Templates provider Task adding
 */

emis.mobile.DataProvider = function( appObject, readyCallback ) {
	var _app = appObject;

	var _samplePatientRecord;
	var _samplePatientList;
	var _readyCallback = readyCallback;

	/**
	 * private
	 */
	var _storage = new emis.mobile.Storage( );
	var _docStorage = new emis.mobile.IDBStorage( );
	var _taskDao = new emis.mobile.TaskModel( );
	var _consentDao = new emis.mobile.ConsentModel( );
	var _templateDao = new emis.mobile.TemplateModel( );
	var _templateHeaderDao = new emis.mobile.TemplateHeader( );
	var _eventsetDao = new emis.mobile.EventsetModel( );
	var _encounterDao = new emis.mobile.EncountersModel( );
	var _taskTypeDao = new emis.mobile.TaskType( );
	var _rttTypeDao = new emis.mobile.RttStatus( );
	var _consultationTypeDao = new emis.mobile.ConsultationType( );
	var _consultationPropertiesDao = new emis.mobile.ConsultationPropertiesModel( );
	var _appointmentDao = new emis.mobile.AppointmentsModel( );
	var _patientDemographicDao = new emis.mobile.PatientDemographic( );
	var _patientSummaryDao = new emis.mobile.PatientSummary( );
	var _patientMedicationsDao = new emis.mobile.PatientMedication( );
	var _patientProblemsDao = new emis.mobile.PatientProblems( );
	var _patientValuesDao = new emis.mobile.PatientValues( );
	var _patientEncountersDao = new emis.mobile.PatientEncounters( );
	var _patientImmunisationsDao = new emis.mobile.PatientImmunisation( );
	var _patientReferralsDao = new emis.mobile.PatientReferrals( );
	var _patientDiaryEntriesDao = new emis.mobile.PatientDiaryEntry( );
	var _patientAllergiesDao = new emis.mobile.PatientAllergies( );
	var _patientAppointmentInformationDao = new emis.mobile.PatientAppointmentInformation( );
	var _patientAlertsDao = new emis.mobile.PatientAlerts( );
	var _patientWarningsDao = new emis.mobile.PatientWarnings( );
	var _patientDocumentationDao = new emis.mobile.PatientDocumentation( );
	var _patientSharingOrgsDao = new emis.mobile.PatientSharingOrgs();
	var _patientCarePathwaysDao = new emis.mobile.PatientCarePathways( );
	var _patientCareEpisodesModifiedDao = new emis.mobile.PatientCareEpisodesModified( );
	var _patientRttDao = new emis.mobile.PatientRTT( );
	var _organisationPeopleDao = new emis.mobile.OrganisationPeople( );
	var _locationsDao = new emis.mobile.Locations( );
	var _slotTypesDao = new emis.mobile.SlotTypes( );
	var _sessionCategoriesDao = new emis.mobile.SessionCategories( );
	var _sessionHoldersDao = new emis.mobile.SessionHolders( );
	var _sessionHolderFiltersDao = new emis.mobile.SessionHolderFilters( );
	var _appointmentBookingReasonsDao = new emis.mobile.AppointmentBookingReasons( );
	var _userSessionModel = new emis.mobile.UserSessionModel( );
	var _drugDao = new emis.mobile.DrugModel( );
	var _newDrugDao = new emis.mobile.NewDrugModel( );
	var _logDao = new emis.mobile.LogModel();
	var _scheduleDao = new emis.mobile.ScheduleModel();
	var _scheduleTemplateDao = new emis.mobile.ScheduleTemplateModel();
	var _servicesDao = new emis.mobile.ServicesModel();

	function _constructor( ) {
		var that = this;

		_docStorage.open( );
		// synchronisation of loading resources-
		// problem doesn't exists in one file deployment format
		setTimeout( _readyCallback, 10 );
	} ;

	this.getSessionData = function () {
		return JSON.parse(_storage.getItem("GetSession_Response"));
	} ;

	this.getPatientDataServiceVersion = function( patientId ) {
		return main.storage.find("PatientDataServiceVersion",patientId);
	};

	this.isMinimumPatientDataServiceVersion = function( patientId, webServiceVersion ) {
		var patientDataServiceVersion = this.getPatientDataServiceVersion( patientId );
		if ( patientDataServiceVersion &&
				patientDataServiceVersion != 'old' &&
				patientDataServiceVersion >= webServiceVersion ) {
			return true;
		}
		return false;
	};

	this.setSessionData = function (data) {
		if ( emis.mobile.nativeFrame.isNative ) {
			_storage.setNativeSessionResponse( data );
		} else {
			_storage.setItem( "GetSession_Response", data);
		}
	} ;

	this.getPrescriber = function( ) {
		var sessionData = this.getSessionData () ;
		if (sessionData && sessionData.Payload.Prescriber) {
			return sessionData.Payload.Prescriber ;
		}
		return null ;
	};

	/*
	 * schedules object from getSessionResponse
	 */
	this.getScheduleObject = function( ) {
		var sessionData = this.getSessionData () ;
		if ( sessionData && sessionData.Payload && sessionData.Payload.Schedules ) {
			return sessionData.Payload.Schedules;
		}
		return null;
	};

	this.getScheduleIdsForSync = function( patientId ) {
		var schedules = [];
		if ( patientId ) {
			schedules = schedules.concat( _scheduleDao.findAllIdsByStatusAndPatientId( _scheduleDao.CREATED, patientId ) );
			schedules = schedules.concat( _scheduleDao.findAllIdsByStatusAndPatientId( _scheduleDao.EDITED, patientId ) );
			schedules = schedules.concat( _scheduleDao.findAllIdsByStatusAndPatientId( _scheduleDao.CANCELLED, patientId ) );
		} else {
			schedules = schedules.concat( _scheduleDao.findAllIdsByStatus( _scheduleDao.CREATED ) );
			schedules = schedules.concat( _scheduleDao.findAllIdsByStatus( _scheduleDao.EDITED  ) );
			schedules = schedules.concat( _scheduleDao.findAllIdsByStatus( _scheduleDao.CANCELLED ) );
		}
		return schedules;
	};

	this.getActivePatientSchedules = function( patientId ) {
		var patientSchedules = _scheduleDao.findAllByPatientId( patientId );
		if ( patientSchedules ) {
			var todayDate = new Date();
			todayDate = main.util.resetTimeToFullDay( todayDate );

			var editedSchedules = _scheduleDao.findAllIdsByStatusAndPatientId( _scheduleDao.EDITED, patientId );
			var editedSchedulesIds = [];
			for ( var i = 0; i < editedSchedules.length; i++ ) {
				var schedule = _scheduleDao.getById( editedSchedules[i] );
				editedSchedulesIds.push( schedule.data.patientScheduleId );
			}

			var sortedOutSchedules = [];
			for ( var i = 0; i < patientSchedules.length; i++ ) {
				var scheduleWrapper = patientSchedules[i];
				if ( scheduleWrapper.status == _scheduleDao.CANCELLED ) {
					continue;
				}
				var schedule = scheduleWrapper.data;
				if ( scheduleWrapper.status == _scheduleDao.DOWNLOADED && editedSchedulesIds.indexOf( schedule.id ) != -1 ) {
					// don't show downloaded schedule if there is edited one with the same id
					// we are keeping both downloaded and edited schedules because emis is checking in web services
					// if user really edited downloaded schedule (so changing some field 60 -> 30 -> 60 and
					// sending it as edited will fail)
					continue;
				}
				var recPattern = null;
				if ( schedule.definition ) {
					recPattern = schedule.definition.recurrencePattern;
				} else if ( schedule.recurrencePattern ) {
					recPattern = schedule.recurrencePattern;
				} else {
					var scheduleTemplate = main.dataProvider.getScheduleTemplateById( schedule.scheduleId );
					if ( scheduleTemplate ) {
						recPattern = scheduleTemplate.RecurrencePattern;
					}
				}
				var endDate = null;
				if ( schedule.endDate ) {
					endDate = new Date( schedule.endDate );
					endDate = main.util.resetTimeToFullDay( endDate );
				}
				var nextOccurrenceDate = main.dataProvider.getScheduleNextOccurrenceDate( schedule, recPattern, null, 0, false, true );
				if ( nextOccurrenceDate && nextOccurrenceDate.getTime() >= todayDate.getTime()
						&& ( ! endDate || ( endDate && nextOccurrenceDate.getTime() <= endDate.getTime() ) ) ) {
					// only not yet ended schedules are visible
					var service = _servicesDao.getById( schedule.serviceId );
					if ( service ) {
						schedule.serviceName = service.Name;
						schedule.nextOccurrenceDate = nextOccurrenceDate;
						sortedOutSchedules.push( scheduleWrapper );
					}
				}
			}
			sortedOutSchedules.sort( function( a, b ) {
				var schedule1 = a.data;
				var schedule2 = b.data;
				var serviceName1 = schedule1.serviceName;
				if ( serviceName1 ) {
					serviceName1 = serviceName1.toLowerCase();
				}
				var serviceName2 = schedule2.serviceName;
				if ( serviceName2 ) {
					serviceName2 = serviceName2.toLowerCase();
				}

				var description1 = "";
				if ( schedule1.definition ) {
					description1 = main.dataProvider.getDescriptionStringForSchedule( schedule1.definition.recurrencePattern );
				} else if (schedule1.recurrencePattern ) {
					description1 = schedule1.recurrencePattern.Description;
				} else {
					var scheduleTemplate = main.dataProvider.getScheduleTemplateById( schedule1.scheduleId );
					if ( scheduleTemplate ) {
						scheduleDescription1 = scheduleTemplate.RecurrencePattern.Description;
					}
				}
				var description2 = "";
				if ( schedule2.definition ) {
					description2 = main.dataProvider.getDescriptionStringForSchedule( schedule2.definition.recurrencePattern );
				} else if (schedule2.recurrencePattern ) {
					description2 = schedule2.recurrencePattern.Description;
				} else {
					var scheduleTemplate = main.dataProvider.getScheduleTemplateById( schedule2.scheduleId );
					if ( scheduleTemplate ) {
						scheduleDescription2 = scheduleTemplate.RecurrencePattern.Description;
					}
				}
				if ( description1 ) {
					description1 = description1.toLowerCase();
				}
				if ( description2 ) {
					description2 = description2.toLowerCase();
				}

				var n = serviceName1.localeCompare( serviceName2 );
				if ( n != 0 ) {
					return n;
				}
				return description1.localeCompare( description2 );
			} );
			patientSchedules = sortedOutSchedules;
		}
		return patientSchedules;
	};

	this.getSchedule = function( scheduleId ) {
		return _scheduleDao.getById( scheduleId );
	};

	this.insertNewSchedule = function( patientId, schedule ) {
		return _scheduleDao.insert( patientId, _scheduleDao.CREATED, schedule );
	};

	this.insertDownloadedSchedules = function( patientId, patientSchedules ) {
		if ( patientSchedules ) {
			var prevPatientSchedules = _scheduleDao.findAllByPatientId( patientId );
			var prevPatientSchedulesRealIds = [];
			var prevPatientSchedulesTimes = [];
			for ( var i = 0; i < prevPatientSchedules.length; i++ ) {
				var realScheduleWrapper = prevPatientSchedules[i];
				var realSchedule = realScheduleWrapper.data;
				if ( realScheduleWrapper.status == _scheduleDao.CANCELLED ) {
					realSchedule = realScheduleWrapper.cancel;
				}
				var realScheduleId = realSchedule.id;
				if ( ! realScheduleId ) {
					realScheduleId = realSchedule.patientScheduleId;
				}
				if ( realScheduleId ) {
					// only for cancelled and edited schedules as created schedules don't have id
					prevPatientSchedulesRealIds.push( realScheduleId );
					prevPatientSchedulesTimes.push( realSchedule.lastModified );
				}
			}
			for ( var i = 0; i < patientSchedules.length; i++ ) {
				var scheduleData = patientSchedules[i];
				var arrayIndex = prevPatientSchedulesRealIds.indexOf( scheduleData.id );
				if ( arrayIndex == -1 ) {
					// add new schedule only if there is no other schedule with that id on device
					// (when some schedule were not succesfully synced)
					_scheduleDao.insert( patientId, _scheduleDao.DOWNLOADED, scheduleData );
				} else {
					var prevLastTime = prevPatientSchedulesTimes[ arrayIndex ];
					var currLastTime = scheduleData.lastModified;
					if ( prevLastTime ) {
						prevLastTime = new Date( prevLastTime );
						prevLastTime = prevLastTime.getTime();
					}
					if ( currLastTime ) {
						currLastTime = new Date( currLastTime );
						currLastTime = currLastTime.getTime();
					}
					if ( prevLastTime && currLastTime && currLastTime > prevLastTime ) {
						_scheduleDao.remove( patientId, prevPatientSchedulesRealIds[ arrayIndex ] );
						_scheduleDao.insert( patientId, _scheduleDao.DOWNLOADED, scheduleData );
					}
				}
			}
		}
	};

	this.saveEditedSchedule = function( patientId, scheduleId, scheduleData ) {
		var bEdited = false;
		var schedule = _scheduleDao.getById( scheduleId );
		if ( schedule.status == _scheduleDao.EDITED || schedule.status == _scheduleDao.DOWNLOADED ) {
			var originalSchedule = null;
			if ( schedule.status == _scheduleDao.DOWNLOADED ) {
				originalSchedule = schedule;
			} else {
				var downloadedSchedules = _scheduleDao.findAllIdsByStatusAndPatientId( _scheduleDao.DOWNLOADED, patientId );
				for ( var i = 0; i < downloadedSchedules.length; i++ ) {
					var tempSchedule = _scheduleDao.getById( downloadedSchedules[i] );
					if ( tempSchedule.data.id == scheduleData.patientScheduleId ) {
						originalSchedule = tempSchedule.data;
						break;
					}
				}
			}

			var originalStartDate = originalSchedule.startDate;
			if ( originalStartDate ) {
				originalStartDate = new Date( originalStartDate );
				originalStartDate = main.util.resetTimeToFullDay( originalStartDate );
				originalStartDate = originalStartDate.getTime();
			}
			var originalEndDate = originalSchedule.endDate;
			if ( originalEndDate ) {
				originalEndDate = new Date( originalEndDate );
				originalEndDate = main.util.resetTimeToFullDay( originalEndDate );
				originalEndDate = originalEndDate.getTime();
			}
			var newStartDate = scheduleData.startDate;
			if ( newStartDate ) {
				newStartDate = new Date( newStartDate );
				newStartDate = main.util.resetTimeToFullDay( newStartDate );
				newStartDate = newStartDate.getTime();
			}
			var newEndDate = scheduleData.endDate;
			if ( newEndDate ) {
				newEndDate = new Date( newEndDate );
				newEndDate = main.util.resetTimeToFullDay( newEndDate );
				newEndDate = newEndDate.getTime();
			}

			if ( originalSchedule.serviceId != scheduleData.serviceId ||
				originalStartDate != newStartDate ||
				originalEndDate != newEndDate ||
				originalSchedule.visitDuration != scheduleData.visitDuration ||
				originalSchedule.predictedTravelTime != scheduleData.predictedTravelTime ||
				originalSchedule.dependency != scheduleData.dependency ||
				( ! originalSchedule.timeBand && scheduleData.timeBand != 'None' ) ||
				( originalSchedule.timeBand && originalSchedule.timeBand != scheduleData.timeBand ) ||
				originalSchedule.slotTypeId != scheduleData.slotTypeId ||
				originalSchedule.locationId != scheduleData.locationId ||
				originalSchedule.linkedCareEpisodeId != scheduleData.linkedCareEpisodeId ||
				originalSchedule.notes != scheduleData.notes ||
				originalSchedule.reason != scheduleData.reason ) {
					bEdited = true;
			}
			if ( ! bEdited ) {
				var originalPattern = null;
				var newPattern = null;
				if ( originalSchedule.definition ) {
					originalPattern = originalSchedule.definition.recurrencePattern;
				} else if ( originalSchedule.recurrencePattern ) {
					originalPattern = originalSchedule.recurrencePattern;
				}
				if ( scheduleData.definition ) {
					newPattern = scheduleData.definition.recurrencePattern;
				} else if ( scheduleData.recurrencePattern ) {
					newPattern = scheduleData.recurrencePattern;
				}
				if ( ( ! originalPattern && newPattern ) || ( originalPattern && ! newPattern ) ) {
					bEdited = true;
				}
				if ( ! bEdited && ! originalPattern && ! newPattern && originalSchedule.scheduleId != scheduleData.scheduleId ) {
					// if downloaded schedule had custom recurrence pattern (they have also scheduleId field)
					// and user chose other scheduleId
					bEdited = true;
				}
				if ( ! bEdited && originalPattern && newPattern ) {
					var originalPatternStartDate = originalPattern.StartDate;
					if ( originalPatternStartDate ) {
						originalPatternStartDate = new Date( originalPatternStartDate );
						originalPatternStartDate = main.util.resetTimeToFullDay( originalPatternStartDate );
						originalPatternStartDate = originalPatternStartDate.getTime();
					}
					var newPatternStartDate = newPattern.StartDate;
					if ( newPatternStartDate ) {
						newPatternStartDate = new Date( newPatternStartDate );
						newPatternStartDate = main.util.resetTimeToFullDay( newPatternStartDate );
						newPatternStartDate = newPatternStartDate.getTime();
					}
					if ( originalPatternStartDate != newPatternStartDate ) {
						bEdited = true;
					}
					if ( ! bEdited ) {
						//remove StartDates from JSON for comparision purpose
						delete originalPattern.StartDate;
						delete newPattern.StartDate;

						//remove description as it is generated from other parameters
						delete originalPattern.Description;
						delete newPattern.Description;

						bEdited = ! emis.mobile.Utilities.areObjectsEqual( originalPattern, newPattern );
					}
				}
			}
		}
		if ( bEdited ) {
			if ( schedule.status == _scheduleDao.EDITED ) {
				schedule.data = scheduleData;
				_scheduleDao.save( scheduleId, schedule );
			} else {
				_scheduleDao.insert( patientId, _scheduleDao.EDITED, scheduleData );
			}
		} else if ( schedule.status == _scheduleDao.EDITED ) {
			_scheduleDao.remove( scheduleId );
		} else if ( schedule.status == _scheduleDao.CREATED ) {
			schedule.data = scheduleData;
			_scheduleDao.save( scheduleId, schedule );
		}
	};

	this.cancelSchedule = function( patientId, scheduleId, cancelData ) {
		var schedule = _scheduleDao.getById( scheduleId );
		if ( schedule.status == _scheduleDao.CREATED ) {
			// remove schedule if user cancels previously created (but not yet synced) schedule
			_scheduleDao.remove( scheduleId );
		} else {
			var originalSchedule = null;
			var originalScheduleId = null;
			if ( schedule.status == _scheduleDao.DOWNLOADED ) {
				originalSchedule = schedule;
				originalScheduleId = scheduleId;
			} else {
				// if edited schedule
				var downloadedSchedules = _scheduleDao.findAllIdsByStatusAndPatientId( _scheduleDao.DOWNLOADED, patientId );
				for ( var i = 0; i < downloadedSchedules.length; i++ ) {
					var tempSchedule = _scheduleDao.getById( downloadedSchedules[i] );
					if ( tempSchedule.data.id == cancelData.patientScheduleId ) {
						originalSchedule = tempSchedule;
						originalScheduleId = downloadedSchedules[i];
						break;
					}
				}
				//remove edited schedule and save cancelled schedule over downloaded schedule
				_scheduleDao.remove( scheduleId );
			}
			originalSchedule.status = _scheduleDao.CANCELLED;
			originalSchedule.cancel = cancelData;
			_scheduleDao.save( originalScheduleId, originalSchedule );
		}
	};

	this.removeAllSchedulesByPatientId = function( patientId ) {
		var scheduleIds = _scheduleDao.findAllIdsByPatientId( patientId );
		for ( var i = 0; i < scheduleIds.length; i++ ) {
			_scheduleDao.remove( scheduleIds[i] );
		}
	};

	this.getCarePathwayByCareEpisode = function( patientId, careEpisodeId ) {
		var carePathways = _patientCarePathwaysDao.getById( patientId );
		if ( carePathways ) {
			for ( var i = 0; i < carePathways.length; i++ ) {
				var careEpisodes = carePathways[i].careEpisodes;
				if ( careEpisodes ) {
					for ( var j = 0; j < careEpisodes.length; j++ ) {
						if ( careEpisodes[j].id == careEpisodeId ) {
							return carePathways[i];
						}
					}
				}
			}
		}
	}

	this.getPatientCareEpisodes = function( patientId ) {
		var careEpisodes = [];
		var carePathways = _patientCarePathwaysDao.getById( patientId );
		if ( carePathways ) {
			// filter sharing orgs
			// but check only if patient has given consent or not
			// don't check which option is currently selected
			carePathways = main.dataProvider.filterSharedRecordsFromArray( carePathways, true );
			for ( var i = 0; i < carePathways.length; i++ ) {
				careEpisodes = careEpisodes.concat( carePathways[i].careEpisodes );
			}
		}
		return careEpisodes;
	};

	this.getPatientModifiedCareEpisodes = function( patientId, slotId ) {
		var modifiedCareEpisodes = _patientCareEpisodesModifiedDao.getById( patientId + "#" + slotId );
		if ( ! modifiedCareEpisodes ) {
			modifiedCareEpisodes = [];
		}
		return modifiedCareEpisodes;
	};

	this.updatePatientModifiedCareEpisodes = function( patientId, slotId, careEpisode ) {
		var modifiedCareEpisodes = this.getPatientModifiedCareEpisodes( patientId, slotId );
		var bModifiedCareEpisodeIndex = -1;
		for ( var i = 0; i < modifiedCareEpisodes.length; i++ ) {
			if ( modifiedCareEpisodes[i].id == careEpisode.id ) {
				bModifiedCareEpisodeIndex = i;
				break;
			}
		}
		if ( bModifiedCareEpisodeIndex != -1 ) {
			modifiedCareEpisodes[bModifiedCareEpisodeIndex] = careEpisode;
		} else {
			modifiedCareEpisodes.push( careEpisode );
		}
		_patientCareEpisodesModifiedDao.save( patientId + "#" + slotId, modifiedCareEpisodes );
		return modifiedCareEpisodes;
	};

	this.getPatientRTT = function( patientId ) {
		return _patientRttDao.getById( patientId );
	};

	this.isRttBlockEnabledForService = function( serviceId ) {
		var isRttEnabled = false;
		var services = this.getServices();
		if ( services && services.length ) {
			for ( var i = 0; i < services.length; i++ ) {
				if ( serviceId == services[i].object.Id &&
						emis.mobile.Utilities.isTrue( services[i].object.RTTEnabled ) ) {
					isRttEnabled = true;
					break;
				}
			}
		}
		return isRttEnabled;
	};

	this.getLinkedAppointments = function( patientId, scheduleId ) {
		var schedule = _scheduleDao.getById( scheduleId );
		var linkedAppointments = [];
		var appointmentsInformation = _patientAppointmentInformationDao.getById( patientId );
		if ( appointmentsInformation && appointmentsInformation.futureAppointments ) {
			var futureAppointments = appointmentsInformation.futureAppointments;
			for ( var i = 0; i < futureAppointments.length; i++ ) {
				var a = futureAppointments[i];
				if ( a.patientScheduleId && a.patientScheduleId == schedule.data.id ) {
					linkedAppointments.push( a );
				}
			}
		}
		return linkedAppointments;
	};

	this.getScheduleTemplates = function() {
		return _scheduleTemplateDao.findAll();
	}

	this.getScheduleTemplateById = function( id ) {
		return _scheduleTemplateDao.getById( id );
	};

	this.getServices = function() {
		return _servicesDao.findAll();
	};

	this.getServiceById = function( serviceId ) {
		return _servicesDao.getById( serviceId );
	};

	this.getScheduleNextOccurrenceDate = function( schedule, recPattern, previousRunDate, occurrenceNumber, bFindLast, bFilter ) {
		if ( ! schedule || ! recPattern ) {
			return "";
		}

		function isLeapYear( year ) {
			if ( year % 4 == 0 ) {
				if ( year % 100 == 0 ) {
					return year % 400 == 0;
				}
				return true;
			}
			return false;
		};

		function adjustDayOfMonth( year, month, dayOfMonth ) {
			if ( dayOfMonth < 29 ) {
				return dayOfMonth;
			} else if ( dayOfMonth > 28 && month == 2 ) {
				if ( isLeapYear( year ) ) {
					return 29;
				} else {
					return 28;
				}
			} else if ( dayOfMonth == 31 ) {
				switch ( month ) {
					case 4:
					case 6:
					case 9:
					case 11:
						return 30;
					default:
						return 31;
				}
			}
			return dayOfMonth;
		};

		function isDateWeekday( date ) {
			var dayOfWeek = date.getUTCDay();
			switch ( dayOfWeek ) {
				case 0: //sunday
				case 6: //saturday
					return false;
				default:
					return true;
			}
		};

		function isDateMonday( date ) {
			return date.getUTCDay() == 1 ? true : false;
		};

		function isDateATargetDay( date, targetDays ) {
			var dayOfWeek = date.getUTCDay(); //0 is Sunday
			var dayBitFlag = targetDays.toString( 2 );
			if ( dayBitFlag.length < 7 ) {
				var howManyZerosNeeded = 7 - dayBitFlag.length;
				for ( var i = 0; i < howManyZerosNeeded; i++ ) {
					dayBitFlag = '0' + dayBitFlag;
				}
			}
			var daysTab = dayBitFlag.split('').reverse();
			return daysTab[ dayOfWeek ] === "1";
		};

		function addDays( date, days ) {
			var result = new Date( Date.UTC( date.getFullYear(), date.getMonth(), date.getDate() ) );
			result.setUTCDate( date.getUTCDate() + days );
			return result;
		};

		function addMonths( date, months ) {
			var result = new Date( Date.UTC( date.getFullYear(), date.getMonth(), date.getDate() ) );
			result.setUTCMonth( date.getUTCMonth() + months );
			return result;
		};

		function addYears( date, years ) {
			var result = new Date( Date.UTC( date.getFullYear(), date.getMonth(), date.getDate() ) );
			result.setUTCFullYear( date.getUTCFullYear() + years );
			return result;
		};

		function getNextRunDateMonthlyOnDate( previousRunDate, dayCount, monthCount ) {
			var year = previousRunDate.getFullYear();
			var month = previousRunDate.getMonth();
			var adjustedDay = adjustDayOfMonth( year, month, dayCount );
			var targetDate = new Date( Date.UTC( year, month, adjustedDay ) );
			targetDate = main.util.resetTimeToFullDay( targetDate );
			if ( previousRunDate.getDate() < adjustedDay ) {
				return targetDate;
			} else {
				targetDate = addMonths( targetDate, monthCount );
				var newDate = new Date( Date.UTC( targetDate.getFullYear(), targetDate.getMonth(),
					adjustDayOfMonth( targetDate.getFullYear(), targetDate.getMonth(), dayCount ) ) );
				return main.util.resetTimeToFullDay( newDate );
			}
		};

		function getNextRunMonthlyOnDayOccurrence( previousRunDate, monthCount, dayPattern, dayType ) {
			var targetDate = new Date( Date.UTC( previousRunDate.getFullYear(), previousRunDate.getMonth(), 1 ));
			targetDate = main.util.resetTimeToFullDay( targetDate );
			targetDate = addMonths( targetDate, monthCount );
			return getDate( targetDate.getFullYear(), targetDate.getMonth(), dayPattern, dayType );
		};

		function isTypeOfDay( dayType, day ) {
			switch( dayType ) {
				case "Day" : return true;
				case "Monday" : return day == 1;
				case "Tuesday" : return day == 2;
				case "Wednesday" : return day == 3;
				case "Thursday" : return day == 4;
				case "Friday" : return day == 5;
				case "Saturday" : return day == 6;
				case "Sunday" : return day == 0;
				case "Weekday" : return ( day != 6 && day != 0 );
				case "WeekendDay" : return ( day == 6 || day == 0 );
				default : return false;
			}
		};

		function getDate( year, month, dayPattern, dayType ) {
			var targetDate = new Date( Date.UTC( year, month, 1 ));
			targetDate = main.util.resetTimeToFullDay( targetDate );
			while( ! isTypeOfDay( dayType, targetDate.getDay() ) ) {
				targetDate = addDays( targetDate, 1 );
			}
			var skips;
			if ( dayPattern == "First" ) {
				skips = 0;
			} else if ( dayPattern == "Second" ) {
				skips = 1;
			} else if ( dayPattern == "Third" ) {
				skips = 2;
			} else if ( dayPattern == "Fourth" ) {
				skips = 3;
			} else {
				skips = 4;
			}

			switch( dayType ) {
				case "Day" :
					if ( dayPattern == "Last" ) {
						skips = 31;
					}
					for ( var i = 0; i < skips; i++ ) {
						var next = addDays( targetDate, 1 );
						if ( next.getMonth() == month ) {
							targetDate = next;
						} else {
							break;
						}
					}
					break;
				case "Weekday" :
					if ( dayPattern == "Last" ) {
						skips = 31;
					}
					for ( var i = 0; i < skips; i++ ) {
						var next = addDays( targetDate, 1 );
						if ( ! isTypeOfDay( dayType, next.getDay() ) ) {
							next = addDays( targetDate, 3 );
						}
						if ( next.getMonth() == month ) {
							targetDate = next;
						} else {
							break;
						}
					}
					break;
				case "WeekendDay" :
					if ( dayPattern == "Last" ) {
						skips = 31;
					}
					for ( var i = 0; i < skips; i++ ) {
						var next = addDays( targetDate, 1 );
						while ( ! isTypeOfDay( dayType, next.getDay() ) ) {
							next = addDays( next, 1 );
						}
						if ( next.getMonth() == month ) {
							targetDate = next;
						} else {
							break;
						}
					}
					break;
				default :
					for ( var i = 0; i < skips; i++ ) {
						var next = addDays( targetDate, 7 );
						if ( next.getMonth() == month ) {
							targetDate = next;
						} else {
							break;
						}
					}
			}
			return targetDate;
		};

		if ( ! previousRunDate ) {
			previousRunDate = new Date( schedule.startDate );
			previousRunDate = main.util.resetTimeToFullDay( previousRunDate );
		}

		var nextOccurrence = null;
		var bNextOccurrenceFound = false;
		var totalOccurrences = 0;

		if ( recPattern.None ) {
			totalOccurrences = 1;
			nextOccurrence = previousRunDate;
		} else if ( recPattern.Daily ) {
			totalOccurrences = recPattern.Daily.End.Occurrences;
			var intervalDays = recPattern.Daily.Pattern.DayPattern;
			// must be > 0 anyway
			if ( ! intervalDays ) {
				intervalDays = 1;
			}

			nextOccurrence = previousRunDate;

			if ( occurrenceNumber > 0 ) {
				nextOccurrence = addDays( previousRunDate, intervalDays );
			}

			if ( recPattern.Daily.Pattern.EveryWeekday ) {
				while ( ! isDateWeekday( nextOccurrence ) ) {
					nextOccurrence = addDays( nextOccurrence, intervalDays );
				}
			}
		} else if ( recPattern.Weekly ) {
			totalOccurrences = recPattern.Weekly.End.Occurrences;
			var targetDays = recPattern.Weekly.Pattern.Days;
			if ( occurrenceNumber > 0 ) {
				var weeksInterval = recPattern.Weekly.Pattern.Count;
				nextOccurrence = addDays( previousRunDate, 1 );
				while ( ! isDateMonday( nextOccurrence ) ) {
					if ( isDateATargetDay( nextOccurrence, targetDays ) ) {
						bNextOccurrenceFound = true;
						break;
					} else {
						nextOccurrence = addDays( nextOccurrence, 1 );
					}
				}
				if ( ! bNextOccurrenceFound ) {
					var daysToSkip = ( weeksInterval - 1 ) * 7;
					nextOccurrence = addDays( nextOccurrence, daysToSkip );
				}
			}
			if ( ! bNextOccurrenceFound ) {
				if ( ! nextOccurrence ) {
					nextOccurrence = previousRunDate;
				}
				while ( ! isDateATargetDay( nextOccurrence, targetDays ) ) {
					nextOccurrence = addDays( nextOccurrence, 1 );
				}
			}
		} else if ( recPattern.Monthly ) {
			totalOccurrences = recPattern.Monthly.End.Occurrences;
			if ( occurrenceNumber == 0 ) {
				if ( recPattern.Monthly.Pattern.PatternCount ) {
					var dayCount = recPattern.Monthly.Pattern.PatternCount.DayCount;
					var monthCount = recPattern.Monthly.Pattern.PatternCount.MonthCount;
					if ( previousRunDate.getDate() ==
						adjustDayOfMonth( previousRunDate.getFullYear(),
										previousRunDate.getMonth() + 1,
										dayCount ) ) {
						nextOccurrence = previousRunDate;
					} else {
						nextOccurrence = getNextRunDateMonthlyOnDate( previousRunDate, dayCount, monthCount );
					}
				} else {
					var dayPattern = recPattern.Monthly.Pattern.PatternSelect.DayPattern;
					var dayType = recPattern.Monthly.Pattern.PatternSelect.DayType;
					var firstRunDate = getDate( previousRunDate.getFullYear(), previousRunDate.getMonth(), dayPattern, dayType );
					if ( firstRunDate.getTime() < previousRunDate.getTime() ) {
						var tempDate = addMonths( firstRunDate, 1 );
						nextOccurrence = getDate( tempDate.getFullYear(), tempDate.getMonth(), dayPattern, dayType );
					} else {
						nextOccurrence = firstRunDate;
					}
				}
			} else {
				if ( recPattern.Monthly.Pattern.PatternCount ) {
					var dayCount = recPattern.Monthly.Pattern.PatternCount.DayCount;
					var monthCount = recPattern.Monthly.Pattern.PatternCount.MonthCount;
					nextOccurrence = getNextRunDateMonthlyOnDate( previousRunDate, dayCount, monthCount );
				} else {
					var monthCount = recPattern.Monthly.Pattern.PatternSelect.MonthCount;
					var dayPattern = recPattern.Monthly.Pattern.PatternSelect.DayPattern;
					var dayType = recPattern.Monthly.Pattern.PatternSelect.DayType;
					nextOccurrence = getNextRunMonthlyOnDayOccurrence( previousRunDate, monthCount, dayPattern, dayType );
				}
			}
		} else if ( recPattern.Quarterly ) {
			totalOccurrences = recPattern.Quarterly.End.Occurrences;
			var dayPattern = recPattern.Quarterly.Pattern.DayPattern;
			var dayType = recPattern.Quarterly.Pattern.DayType;
			if ( occurrenceNumber == 0 ) {
				var firstRunDate = getDate( previousRunDate.getFullYear(), previousRunDate.getMonth(), dayPattern, dayType );
				if ( firstRunDate.getTime() < previousRunDate.getTime() ) {
					var tempDate = addMonths( firstRunDate, 1 );
					nextOccurrence = getDate( tempDate.getFullYear(), tempDate.getMonth(), dayPattern, dayType );
				} else {
					nextOccurrence = firstRunDate;
				}
			} else {
				var targetDate = new Date( Date.UTC( previousRunDate.getFullYear(), previousRunDate.getMonth(), 1 ));
				targetDate = main.util.resetTimeToFullDay( targetDate );
				targetDate = addMonths( targetDate, 3 );
				nextOccurrence = getDate( targetDate.getFullYear(), targetDate.getMonth(), dayPattern, dayType );
			}
		} else if ( recPattern.Yearly ) {
			totalOccurrences = recPattern.Yearly.End.Occurrences;
			if ( occurrenceNumber == 0 ) {
				var month = recPattern.Yearly.Pattern.MonthCount;
				var monthCount = 0;
				switch( month ) {
					case "January" : monthCount = 0; break;
					case "February" : monthCount = 1; break;
					case "March" : monthCount = 2; break;
					case "April" : monthCount = 3; break;
					case "May" : monthCount = 4; break;
					case "June" : monthCount = 5; break;
					case "July" : monthCount = 6; break;
					case "August" : monthCount = 7; break;
					case "September" : monthCount = 8; break;
					case "October" : monthCount = 9; break;
					case "November" : monthCount = 10; break;
					case "December" : monthCount = 11; break;
				}
				var dayCount = recPattern.Yearly.Pattern.DayCount;
				var firstRunDate = new Date( Date.UTC( previousRunDate.getFullYear(), monthCount, dayCount ));
				firstRunDate = main.util.resetTimeToFullDay( firstRunDate );
				if ( previousRunDate.getTime() > firstRunDate.getTime() ) {
					firstRunDate = addYears( firstRunDate, 1 );
				}
				nextOccurrence = firstRunDate;
			} else {
				nextOccurrence = addYears( previousRunDate, 1 );
			}
		}

		if ( nextOccurrence ) {
			var todayDate = new Date();
			todayDate = main.util.resetTimeToFullDay( todayDate );

			var endDate = null;
			if ( schedule.endDate ) {
				endDate = new Date( schedule.endDate );
				endDate = main.util.resetTimeToFullDay( endDate );
			}

			if ( bFindLast ) {
				if ( totalOccurrences == 0 && ! endDate ) {
					return null;
				}
				if ( ( ! endDate || ( endDate && nextOccurrence.getTime() < endDate.getTime() ) ) &&
						( totalOccurrences == 0 || ( totalOccurrences != 0 && occurrenceNumber < totalOccurrences - 1 ) ) ) {
					nextOccurrence = main.dataProvider.getScheduleNextOccurrenceDate( schedule, recPattern, nextOccurrence, occurrenceNumber + 1, bFindLast, bFilter );
				}
			} else {
				if ( nextOccurrence.getTime() < todayDate.getTime()
					&& ( ! endDate || ( endDate && nextOccurrence.getTime() < endDate.getTime() ) )
					&& ( totalOccurrences == 0 || ( totalOccurrences != 0 && occurrenceNumber < totalOccurrences - 1 ) ) ) {
					nextOccurrence = main.dataProvider.getScheduleNextOccurrenceDate( schedule, recPattern, nextOccurrence, occurrenceNumber + 1, bFindLast, bFilter );
				}
			}
		}

		if ( bFilter ) {
			return nextOccurrence;
		}

		if ( endDate && nextOccurrence.getTime() > endDate.getTime() ) {
			if ( bFindLast ) {
				return previousRunDate;
			} else {
				return endDate;
			}
		} else {
			return nextOccurrence;
		}

	};

	// If schedule's end date is later than last schedule's occurrence date
	// then we should display last occurrence date instead of end date in "Last appointment" column
	this.getScheduleLastOccurrenceDate = function( schedule, recPattern ) {
		return main.dataProvider.getScheduleNextOccurrenceDate( schedule, recPattern, null, 0, true, false );
	};

	// helper method related to caseloads that is needed for schedules
	this.isCaseloadSlot = function( slotId ) {
		return false;
	};

	// end of schedules model methods

	/**
	 * @return stored patients amount
	 */
	this.getPatientsAmount = function( ) {
		return _storage.findAll( "Patient" ).length;
	};

	/**
	 * @return current patient data from controller
	 */
	function getPatientContext( ) {
		return _app.controller.patient;
	}

	;
	this.getPatientContext = getPatientContext;

	this.getPatientById = function( patientId ) {
		var record = _patientDemographicDao.getById( patientId );
		return record;
	};

	/**
	 * @returns patient care record header
	 */
	this.getPatientDemographic = function( ) {
		var record = _patientDemographicDao.getById( getPatientContext( ).id );
		return record;
	};

	this.getPatientDemographicById = function( patientId ) {
		var record = _patientDemographicDao.getById( patientId );
		return record;
	};

	/**
	 * @returns patient summary JSON
	 */
	this.getPatientSummary = function( ) {
		var record = _patientSummaryDao.getById( getPatientContext( ).id );
		return record;
	};

	/**
	 * @returns patient medications JSON
	 */
	this.getPatientMedications = function( ) {
		var record = _patientMedicationsDao.getById( getPatientContext( ).id );
		// they may want it again...
		//_app.util.sortBy( record.acute, "issueDate" );
		//_app.util.sortBy( record.repeat, "lastIssueDate" );
		//_app.util.sortBy( record.repeatDispensing, "lastIssueDate" );
		return record;
	};

	/**
	 * @returns patient encounters JSON
	 */
	this.getPatientEncounters = function( ) {
		var record = _patientEncountersDao.getById( getPatientContext( ).id );
		return record;
	};

	/**
	 * @returns patient values JSON
	 */
	this.getPatientValues = function( ) {
		var record = _patientValuesDao.getById( getPatientContext( ).id );
		return record;
	};

	/**
	 * @returns patient immunisations JSON
	 */
	this.getPatientImmunisations = function( ) {
		var record = _patientImmunisationsDao.getById( getPatientContext( ).id );
		return record;
	};

	/**
	 * @returns patient referrals JSON
	 */
	this.getPatientReferrals = function( ) {
		var record = _patientReferralsDao.getById( getPatientContext( ).id );
		return record;
	};

	/**
	 * @returns patient problems JSON
	 */
	this.getPatientProblems = function( ) {
		var record = _patientProblemsDao.getById( getPatientContext( ).id );
		// they may want it again...
		//_app.util.sortBy( record.active, "onsetDate" );
		//_app.util.sortBy( record.minorPast, "onsetDate" );
		//_app.util.sortBy( record.significantPast, "onsetDate" );
		return record;
	};

	/**
	 * @returns patient diary entries JSON
	 */
	this.getPatientDiaryEntries = function( ) {
		var record = _patientDiaryEntriesDao.getById( getPatientContext( ).id );
		return record;
	};

	this.getPatientAppointmentInformation = function( ) {
		var record = _patientAppointmentInformationDao.getById( getPatientContext( ).id );
		record.patientWarnings = this.getPatientWarningsByTrigger( 'BookAppointment' );
		return record;
	};

	this.getPatientAlerts = function( ) {
		var record = _patientAlertsDao.getById( getPatientContext( ).id );
		return record;
	};

	this.removePatientAlertByIndex = function( index ) {
		var patientId = getPatientContext( ).id;
		var record = _patientAlertsDao.getById( patientId );
		if ( record ) {
			record.splice( index, 1 );
			_patientAlertsDao.save( patientId, record );
		}
	};

	this.getPatientWarnings = function( patientId ) {
		var record;
		if ( patientId == null ) {
			record = _patientWarningsDao.getById( getPatientContext( ).id );
		} else {
			record = _patientWarningsDao.getById( patientId );
		}
		return record;
	};

	this.getPatientWarningsByTrigger = function( trigger ) {
		var record = _patientWarningsDao.getByIdAndTrigger( getPatientContext( ).id, trigger );
		return record;
	};

	this.getPatientDocumentation = function( ) {
		var record = _patientDocumentationDao.getById( getPatientContext( ).id );
		if ( record ) {
			for ( r in record ) {
				if ( record[r].size )
					record[r].size = ( record[r].size / 1024 ).toFixed( 2 );
			}
		}
		return record;
	};

	/**
	 * asynchronous - result returned by callback
	 *
	 * @param docId
	 * @param callback
	 */
	this.saveAttachment = function( docId, jsonData, callback ) {
		_patientDocumentationDao.saveAttachment( docId, jsonData ).done( function() {
			if ( callback ) {
				callback();
			}
		});
	}

	this.getAttachment = function( docId, callback ) {
		_patientDocumentationDao.getAttachment( docId ).done( function( result ) {
			if ( callback ) {
				callback( result );
			}
		});
	};

	this.isAttachmentPresent = function( docId, callback ) {
		_patientDocumentationDao.isAttachmentPresent( docId ).done( function( result ) {
			if ( callback ) {
				callback( result );
			}
		});
	};

	/**
	 * remove attachment from cache
	 */
	this.removeAttachment = function( docId, callback ) {
		_patientDocumentationDao.removeAttachment( docId ).done( function() {
			if ( callback ) {
				callback();
			}
		});
	};

	/**
	 * @returns patient allergy JSON
	 */
	this.getPatientAllergies = function( ) {
		var record = _patientAllergiesDao.getById( getPatientContext( ).id );
		// they may want it again...
		//_app.util.sortBy( record, "date" );
		return record;
	};

	this.getPatientSharingOrgs = function( ) {
		var record = _patientSharingOrgsDao.getById(getPatientContext().id );
		return record;
	}

	this.getDrugs = function( ) {
		var record = _drugDao.getAll( );
		return record[0].object;
	};

	this.getNewDrugs = function( ) {
		var record = _newDrugDao.getAll( );
		return record;
	};

	this.getNewDrugsForCurrentPatient = function( ) {
		var record = _newDrugDao.getAllForCurrentPatient( );
		return record;
	};

	this.removeNewDrugsForPatient = function(patientId) {
		var nd = this.getNewDrugsForPatient(patientId) ;
		var that = this ;
		$.each (nd, function (i, d) {
			that.removeNewDrug(d.id) ;
		}) ;
	};

	this.getNewDrugsForPatient = function( patientId ) {
		var record = _newDrugDao.getAllForPatient( patientId );
		return record;
	};

	this.findAllPatientIdsWithNewDrugs = function( ) {
		var record = _newDrugDao.findAllPatientIds( );
		return record;
	};

	this.removeNewDrug = function( id ) {
		_newDrugDao.remove( id );
	};

	// appointments model methods
	this.getAppointmentById = function( slotId ) {
		return _appointmentDao.getAppointmentById( slotId );
	};

	this.removeAppointmentById = function( slotId ) {
		return _appointmentDao.removeById( slotId );
	};

	this.removeErrorAppointmentById = function( patientId ) {
		return _appointmentDao.removeErrorAppointmentById( patientId );
	};

	this.getSessionById = function( sessionId ) {
		var list = _appointmentDao.getSessionById( sessionId );
		return list;
	};

	this.getAllSessionIDs = function( ) {
		return _appointmentDao.getAllSessionIDs( );
	};

	this.getAllAppointmentsBySession = function( sessionId ) {
		return _appointmentDao.getAllAppointmentsBySession( sessionId );
	};

	this.getAppointmentsByPatientId = function( patientId ) {
		return _appointmentDao.getAppointmentsByPatientId( patientId );
	};

	this.getAppointmentsIdsByPatientId = function( patientId ) {
		return _appointmentDao.getAppointmentsIdsByPatientId( patientId );
	}

	this.getCurrentPatientAppointments = function( ) {
		return _appointmentDao.getAppointmentsByPatientId( main.controller.patient.id );
	};

	this.saveAppointmentAsError = function( id, jsonData ) {
		_appointmentDao.saveAsError( id, jsonData );
	};

	this.getErrorAppointmentByPatientId = function( id ) {
		return _appointmentDao.getErrorAppointmentById( id );
	};

	this.manageErrorAppointmentsAndPatientData = function( failedData ) {
		var failedPatientIds = [];
		var newFailedData = [];

		var getObjectData = function( key, value ) {
			var data = {};
			data[ key ] = value;
			return { 'data': data };
		}

		// searching through failed appointments and removing duplicates to save setItems calls later
		for ( var i = 0; i < failedData.length; i++ ) {
			if ( failedData[i].data && failedData[i].data.ENTITY_APPOINTMENT_ERROR ) {
				var tempTab = failedData[i].data.ENTITY_APPOINTMENT_ERROR;
				for ( var j = 0; j < tempTab.length; j++ ) {
					if ( failedPatientIds.indexOf( tempTab[j] ) == -1 ) {
						failedPatientIds.push( tempTab[j] );
					}
				}
			} else {
				newFailedData.push( failedData[i] );
			}
		}

		if ( failedPatientIds.length ) {
			for ( var i = 0; i < failedPatientIds.length; i++ ) {
				// save appointment... it will be overwritten if new appointment will be downloaded
				var appointmentsIds = _appointmentDao.getAppointmentsIdsByPatientId( failedPatientIds[i] );
				if ( appointmentsIds.length ) {
					newFailedData.push(	getObjectData( ENTITY_APPOINTMENT, appointmentsIds ) );
				}
			}

			var data = {};
			data[ ENTITY_APPOINTMENT_ERROR ] = failedPatientIds;
			newFailedData.push(	{ 'data': data } );
		}

		for ( var i = 0; i < failedPatientIds.length; i++ ) {
			var patientId = failedPatientIds[i];
			// save patient data
			newFailedData.push(	getObjectData( ENTITY_PATIENT, [ patientId ] ) );
			newFailedData.push(	getObjectData( ENTITY_SUMMARY, [ patientId ]  ) );
			newFailedData.push(	getObjectData( ENTITY_MEDICATION, [ patientId ]  ) );
			newFailedData.push(	getObjectData( ENTITY_PROBLEMS, [ patientId ]  ) );
			newFailedData.push(	getObjectData( ENTITY_VALUES, [ patientId ]  ) );
			newFailedData.push(	getObjectData( ENTITY_ENCOUNTERS, [ patientId ]  ) );
			newFailedData.push(	getObjectData( ENTITY_IMMUNISATION, [ patientId ]  ) );
			newFailedData.push(	getObjectData( ENTITY_REFFERALS, [ patientId ]  ) );
			newFailedData.push(	getObjectData( ENTITY_DIARYENTRIES, [ patientId ]  ) );
			newFailedData.push(	getObjectData( ENTITY_SHARINGORGS, [ patientId ]  ) );
			newFailedData.push(	getObjectData( ENTITY_ALLERGIES, [ patientId ]  ) );
			newFailedData.push(	getObjectData( ENTITY_APPOINTMENTINFORMATION, [ patientId ]  ) );
			newFailedData.push(	getObjectData( ENTITY_ALERTS, [ patientId ]  ) );
			newFailedData.push(	getObjectData( ENTITY_DOCUMENTATION, [ patientId ]  ) );
			newFailedData.push(	getObjectData( ENTITY_DOCUMENTATION, [ patientId ]  ) );
			newFailedData.push(	getObjectData( ENTITY_CAREPATHWAY, [ patientId ]  ) );
			newFailedData.push(	getObjectData( ENTITY_PATIENT_CARE_EPISODES_MODIFIED, [ patientId ]  ) );
			newFailedData.push(	getObjectData( ENTITY_PATIENT_RTT, [ patientId ]  ) );

			var patientWarnings = _patientWarningsDao.getAllIdsByPatientId( patientId );
			if ( patientWarnings ) {
				newFailedData.push(	getObjectData( ENTITY_WARNINGS, patientWarnings ) );
			}

			var patientSchedules = _scheduleDao.findAllIdsByPatientId( patientId );
			if ( patientSchedules ) {
				newFailedData.push(	getObjectData( ENTITY_SCHEDULE, patientSchedules ) );
			}
		}

		return newFailedData;
	};

	this.removePatientDataBySlotId = function( slotId ) {
		var appointment = _appointmentDao.getAppointmentById( slotId );
		if ( ! appointment ) {
			return false;
		}
		var patientId = appointment.PatientId;
		_patientDemographicDao.remove( patientId );
		_patientSummaryDao.remove( patientId );
		_patientMedicationsDao.remove( patientId );
		_patientEncountersDao.remove( patientId );
		_patientValuesDao.remove( patientId );
		_patientImmunisationsDao.remove( patientId );
		_patientReferralsDao.remove( patientId );
		_patientProblemsDao.remove( patientId );
		_patientDiaryEntriesDao.remove( patientId );
		_patientAllergiesDao.remove( patientId );
		_patientAppointmentInformationDao.remove( patientId );
		_patientAlertsDao.remove( patientId );
		_patientDocumentationDao.remove( patientId );
		_patientSharingOrgsDao.remove( patientId );
		_patientWarningsDao.remove( patientId );
		_patientCarePathwaysDao.remove( patientId );
		_patientCareEpisodesModifiedDao.remove( patientId );
		_patientRttDao.remove( patientId );

		var drugs = _newDrugDao.getAllIdsForPatient( patientId );
		var tasks = _taskDao.findAllIdsByPatientId( patientId );
		var encounters = _encounterDao.findAllEncounterIdsBySlotId( slotId );
		var eventsets = main.dataProvider.findEventsetsForPatient( patientId + "#" + slotId );
		var consents = _consentDao.findAllSyncedIdsByPatientId( patientId );
		var nsConsents = _consentDao.findAllNotSyncedIdsByPatientId( patientId );
		var schedules = _scheduleDao.findAllIdsByPatientId( patientId );

		for ( var i = 0; i < drugs.length; i++ ) {
			_newDrugDao.remove( drugs[i] );
		}
		for ( var i = 0; i < tasks.length; i++ ) {
			_taskDao.remove( tasks[i] );
		}
		for ( var i = 0; i < encounters.length; i++ ) {
			_encounterDao.removeEncounter( encounters[i] );
		}
		for ( var i = 0; i < consents.length; i++ ) {
			_consentDao.removeSynced( consents[i] );
		}
		for ( var i = 0; i < nsConsents.length; i++ ) {
			_consentDao.removeNotSynced( nsConsents[i] );
		}
		if ( eventsets ) {
			for ( var i = 0; i < eventsets.length; i++ ) {
				main.dataProvider.removeEventset( eventsets[i].id );
			}
		}
		for ( var i = 0; i < schedules.length; i++ ) {
			_scheduleDao.remove( schedules[i] );
		}
		main.dataProvider.removeQuickNotesBySlotId(slotId);

		_appointmentDao.removeById( slotId );
		_appointmentDao.removeErrorAppointmentById( patientId );

		return true;
	};

	this.removePatientDataByPatientId = function( patientId ) {
		var slots = main.dataProvider.getAppointmentsIdsByPatientId( patientId );
		for ( var i = 0; i < slots.length; i++ ) {
			main.dataProvider.removePatientDataBySlotId( slots[i] );
		}
	}

	this.removeEventsetsByPatient = function( slotId, patientId ) {
		var eventsets = main.dataProvider.findEventsetsForPatient( patientId + "#" + slotId );
		if ( eventsets ) {
			for ( var i = 0; i < eventsets.length; i++ ) {
				main.dataProvider.removeEventset( eventsets[i].id );
			}
		}
	}

	/*
	 * get slot ids for patient that:
	 * 1. have not their patient record (have not been downloaded)
	 * 2. have unsynced data but they (patient ids) didn't come with new patient list
	 * (their ids are not in appointments list)
	 */
	this.getFailedSlots = function() {
		return _appointmentDao.getAllErrorAppointmentsIds();
	};
	// end of appointments model methods

	this.shouldShowSharedValueForCurrentPatient = function( a, bSimpleFilter ) {
		if ( ! ENABLE_SHARED_DATA && a.organisationId ) {
			return false;
		}
		var patientHasSavedConsent = main.controller.sharedOrgs.hasSavedConsent();
		if ( ENABLE_SHARED_DATA
				&& a.organisationId
				&& ! patientHasSavedConsent
				&& main.controller.sharedOrgs.currentSharedOrgsIdsNeedConsent.length
				&& main.controller.sharedOrgs.currentSharedOrgsIdsNeedConsent.indexOf( a.organisationId ) != -1 ) {
			return false;
		}
		if ( bSimpleFilter ) {
			return true;
		}

		if ( ENABLE_SHARED_DATA	&& main.controller.currentlySharedOrg ) {
			if ( a.organisationId && a.organisationId == main.controller.currentlySharedOrg ) {
				return true;
			}
			if ( ! a.organisationId && main.controller.currentlySharedOrg == "local" ) {
				return true;
			} else if ( main.controller.currentlySharedOrg == "all" ) {
				if ( ! a.organisationId
						|| patientHasSavedConsent
						|| main.controller.sharedOrgs.currentSharedOrgsIdsNeedConsent.length == 0
						|| ( a.organisationId
							&& main.controller.sharedOrgs.currentSharedOrgsIdsNeedConsent.length
							&& main.controller.sharedOrgs.currentSharedOrgsIdsNeedConsent.indexOf( a.organisationId ) == -1 ) ) {
					return true;
				} else {
					return false;
				}
			} else {
				return false;
			}
		}

		return true;
	};

	this.filterSharedRecordsFromArray = function( array, bSimpleFilter ) {
		return $.grep( array, function( a ) {
			return main.dataProvider.shouldShowSharedValueForCurrentPatient( a, bSimpleFilter );
		});
	};

	this.filterSharedValuesWithHistory = function( array, bDontCopyValue ) {
		var mainArray = [];
		for(i in array) {
			var currentArray = [];
			var singleElement = {};
			for (var attr in array[i]) {
				if(attr!='history')
				if(array[i].hasOwnProperty(attr)) singleElement[attr] = array[i][attr];
			}
			if(this.shouldShowSharedValueForCurrentPatient(singleElement))
				currentArray.push(singleElement)
			if(array[i].history)
			for(j in array[i].history) {
				if(this.shouldShowSharedValueForCurrentPatient(array[i].history[j])) {
					var elementToPush = {};
					for (var attr in singleElement) {
						if(attr.toLowerCase()!= "organisationid" &&
								( !bDontCopyValue || ( bDontCopyValue && attr.toLowerCase()!= "value" )) &&
								singleElement.hasOwnProperty(attr)) {
							elementToPush[attr] = singleElement[attr];
						}
					}
					tmp = array[i].history[j];
					for (var attr in tmp) {
						if (tmp.hasOwnProperty(attr)) elementToPush[attr] = tmp[attr];
					}
					currentArray.push(elementToPush);
				}
			}
			if(currentArray.length>0)
				mainArray.push(currentArray);
		}
		return mainArray;
	}


	/**
	 * procedure to find out the last values for template fields
	 */
	this.getLastValuesTable = function( template ) {

		function compare( a, b ) {
			if ( a.length != b.length )
				return a.length - b.length;
			it = 0;
			while ( it < a.length && a[it] == b[it] ) {
				it++;
			}
			return a[it] - b[it];
		}

		function _createLastValueEntry( value ) {
			var lastValueEntry = {
				code: value.code,
				date: value.date,
				value: value.value
			};
			if ( value.units != null ) {
				lastValueEntry.units = value.units;
			}
			return lastValueEntry;
		}

		;

		var values;
		var codes = new Array( );

		function _checkAndFillLastValue( codesIteration, valuesIteration ) {
			var singleValue = values[valuesIteration][0];
			if ( codes[codesIteration] == singleValue.code ) {
				var codeNr = codes[codesIteration];
				if ( lastValues[codeNr] == null ) {
					lastValues[codeNr] = _createLastValueEntry( singleValue );
				}
			}
		}

		;

		var sections = template.sections;
		if ( sections ) {
			for ( var i = 0; i < sections.length; i++ ) {
				section = sections[i];
				if ( section.components ) {
					for ( j = 0; j < section.components.length; j++ ) {
						var component = section.components[j];
						if ( component.singleCode != null ) {
							codes.push( component.singleCode.code );
						} else if ( component.codePickList != null ) {
							for ( k = 0; k < component.codePickList.codes.length; k++ ) {
								codes.push( component.codePickList.codes[k].code );
							}
						} else if ( component.yesnoPrompt != null ) {
							codes.push( component.yesnoPrompt.yesItem.code );
							codes.push( component.yesnoPrompt.noItem.code );
						} else if ( component.diaryEntry != null ) {
							codes.push( component.diaryEntry.code );
						} else if ( component.bloodPressure != null ) {
							codes.push( component.bloodPressure.systolicCode );
							codes.push( component.bloodPressure.diastolicCode );
						}

					}
				}
			}
		}
		values = _app.dataProvider.getPatientValues( );
		if ( !values || !values.sort ) {
			values = [];
		}
		codes.sort( function( a, b ) {
			return a - b;
		} );
		values.sort( function( a, b ) {
			return a.code - b.code;
		} );
		values = _app.dataProvider.filterSharedValuesWithHistory( values );
		i1 = 0, i2 = 0;
		var lastValues = {};
		if ( values.length > 0 ) {
			while ( i1 < codes.length - 1 && i2 < values.length - 1 ) {
				var singleValue = values[i2][0];
				if ( codes[i1] == singleValue.code ) {
					codeNr = codes[i1];
					if ( lastValues[codeNr] == null ) {
						lastValues[codeNr] = _createLastValueEntry( singleValue );
					}
					i1++;
					i2++;
				} else {
					if ( compare( codes[i1], singleValue.code ) < 0 )
						i1++;
					else
						i2++;
				}
			}
			if ( i1 == codes.length - 1 ) {
				while ( i2 < values.length ) {
					_checkAndFillLastValue( i1, i2 );
					i2++;
				}
			} else {
				while ( i1 < codes.length ) {
					_checkAndFillLastValue( i1, i2 );
					i1++;
				}
			}
		}
		return lastValues;
	};

	/**
	 * @returns array of consultation type records
	 */
	this.getConsultationTypes = function( ) {
		var list = _consultationTypeDao.findAll( );
		return list;
	};

	/**
	 * @returns array of task types records
	 */
	this.getTaskTypes = function( ) {
		var list = _taskTypeDao.findAll( );
		return list;
	};

	this.getOrganisationPeople = function( ) {
		var list = _organisationPeopleDao.findAll( );
		return list;
	};

	this.getOrganisationPeopleById = function( id ) {
		return _organisationPeopleDao.getById( id );
	};

	this.getLocations = function( ) {
		var list = _locationsDao.findAll( );
		return list;
	};

	this.getLocationsById = function( id ) {
		return _locationsDao.getById( id );
	};

	this.getSlotTypes = function( ) {
		var list = _slotTypesDao.findAll( );
		return list;
	};

	this.getSessionCategories = function( ) {
		var list = _sessionCategoriesDao.findAll( );
		return list;
	};

	this.getSessionCategoriesById = function( id ) {
		return _sessionCategoriesDao.getById( id );
	};

	this.getSessionHolders = function( ) {
		var list = _sessionHoldersDao.findAll( );
		return list;
	};

	this.getSessionHolderFilters = function( ) {
		var list = _sessionHolderFiltersDao.findAll( );
		return list;
	};

	this.getAppointmentBookingReasons = function( ) {
		var list = _appointmentBookingReasonsDao.findAll( );
		return list;
	};

	/**
	 * @returns array of rtt type records
	 */
	this.getRttTypes = function( ) {
		var list = _rttTypeDao.findAll( );
		return list;
	};

	this.getTemplateHeaders = function( ) {
		var templateHeaders = new Array( );

		var storageTemplateHeaders = this.getAllTemplateHeaders( );

		if ( storageTemplateHeaders ) {
			for ( var i = 0; i < storageTemplateHeaders.length; i++ ) {
				templateHeaders.push( storageTemplateHeaders[i].object );
			}
		}
		return templateHeaders;
	};


	this.getEventsets = function( ) {

		var eventsets = new Array( );

		var storageEventsets = this.findEventsetsForPatient( _app.controller.patient.id + "#" + _app.controller.slotId );
		if ( storageEventsets ) {
			for ( var i = 0; i < storageEventsets.length; i++ ) {
				var templateObj = storageEventsets[i].object;
				templateObj.localId = storageEventsets[i].id;
				eventsets.push( templateObj );
			}
		}
		return eventsets;
	};

	this.isEventsetNotSynchronised = function( localId ) {
		return _eventsetDao.isNotSynchronised( localId );
	};

	this.isScheduleNotSynchronised = function( localId ) {
		return _scheduleDao.isNotSynchronised( localId );
	};

	this.isTaskNotSynchronised = function( localId ) {
		return _taskDao.isNotSynchronised( localId );
	};

	this.isNewDrugNotSynchronised = function( localId ) {
		return _newDrugDao.isNotSynchronised( localId );
	};

	this.isQuickNoteNotSynchronised = function( localId ) {
		return _storage.find( "NotSyncedQuickNote", localId );
	}

	/**
	 * @param filter object: filter.patientId for optional patientId filtering
	 */
	this.getCompletedEventsets = function( filter ) {
		var eventsets = new Array( );
		var storageEventsets;
		if ( filter && filter.patientId ) {
			storageEventsets = this.findEventsetsForPatient( filter.patientId );
		} else {
			storageEventsets = this.findAllEventsets( );
		}

		if ( storageEventsets ) {
			for ( var i = 0; i < storageEventsets.length; i++ ) {
				var templateObj = storageEventsets[i].object;
				templateObj.localId = storageEventsets[i].id;
				if ( storageEventsets[i].object.isCompleted ) {
					eventsets.push( templateObj );
				}
			}
		}
		return eventsets;
	};

	this.getCompletedEventsetsByPatientId = function(patientId) {
		var eventsets = new Array( );
		var storageEventsets = this.findAllEventsets( );

		if ( storageEventsets ) {
			for ( var i = 0; i < storageEventsets.length; i++ ) {
				var templateObj = storageEventsets[i].object;
				templateObj.localId = storageEventsets[i].id;
				var pid = templateObj.patientId ;
				pid = pid.split('#') ;
				pid = pid[0] ;
				if (pid == patientId
				&& templateObj.isCompleted ) {
					eventsets.push( templateObj );
				}
			}
		}
		return eventsets ;
	} ;

	this.getCompletedEventsetsBySlotId = function(slotId) {
		var eventsets = new Array( );
		var storageEventsets = this.findAllEventsets( );

		if ( storageEventsets ) {
			for ( var i = 0; i < storageEventsets.length; i++ ) {
				var templateObj = storageEventsets[i].object;
				templateObj.localId = storageEventsets[i].id;
				var pid = templateObj.patientId ;
				pid = pid.split('#') ;
				pid = pid[1] ;
				if (pid == slotId && templateObj.isCompleted ) {
					eventsets.push( templateObj );
				}
			}
		}
		return eventsets ;
	} ;

	this.getPatientIdsWithEventsets = function( onlyCompleted ) {
		return _eventsetDao.findAllPatientIds( onlyCompleted );
	};

	this.getEncountersNumberForPatient = function( patientId, slotId ) {
		var encountersNumber = 0;
		var eventsets = this.findEventsetsForPatient( patientId + "#" + slotId );
		if ( eventsets ) {
			encountersNumber += eventsets.length;
		}
		var quicknotes = this.findAllQuickNotesIdsBySlotId( slotId );
		if ( quicknotes ) {
			encountersNumber += quicknotes.length;
		}
		return encountersNumber;
	};

	this.getEncountersNumber = function() {
		var encountersNumber = 0;
		var quicknotes = this.findAllPatientIdsWithQuickNotes();
		var eventsets = this.getAllEventsets();
		if ( eventsets ) {
			encountersNumber += eventsets.length;
		}
		if ( quicknotes ) {
			encountersNumber += quicknotes.length;
		}
		return encountersNumber;
	};

	this.findAllPatientIdsWithQuickNotes = function( ) {
		return _storage.findAllIds( "quickNote" );
	} ;

	this.findAllPatientIdsWithRttChange = function() {
		return _encounterDao.findAllPatientIdsWithRttChange();
	}

	this.removeQuickNote = function (id) {
		_storage.remove('quickNote', id) ;
	} ;

	this.findAllQuickNotesIdsBySlotId = function (slotId){
		var qnotes = this.findAllPatientIdsWithQuickNotes() ;
		qnotes = $.grep(qnotes, function (q){
			var id = q.split('#') ;
			return id[1] == slotId ;
		}) ;
		return qnotes ;
	} ;

	this.findAllQuickNotesIdsByPatientId = function (patientId){
		var ids = [] ;
		var all = this.findAllPatientIdsWithQuickNotes() ;
		for (var i = 0; i < all.length; i++) {
			var id = all[i].split('#') ;
			if (id.length > 1) {
				id = id[0] ;
				if (id == patientId) {
					ids.push(all[i]) ;
				}
			}
		};
		return ids ;
	} ;

	this.removeQuickNotesByPatientId = function (patientId) {
		var all = this.findAllPatientIdsWithQuickNotes() ;
		for (var i = 0; i < all.length; i++) {
			var id = all[i].split('#') ;
			if (id.length > 1) {
				id = id[0] ;
				if (id == patientId) {
					this.removeQuickNote(all[i]) ;
				}
			}
		};
	}

	this.removeQuickNotesBySlotId = function( slotId ) {
		var all = this.findAllPatientIdsWithQuickNotes() ;
		for (var i = 0; i < all.length; i++) {
			var id = all[i].split('#') ;
			if (id.length > 1) {
				id = id[1] ;
				if (id == slotId) {
					this.removeQuickNote(all[i]) ;
				}
			}
		};
	}

	this.getAllIncompletedEventsets = function( ) {

		var eventsets = new Array( );

		var storageEventsets = this.findAllEventsets( );
		if ( storageEventsets ) {
			for ( var i = 0; i < storageEventsets.length; i++ ) {
				var templateObj = storageEventsets[i].object;
				templateObj.localId = storageEventsets[i].id;
				if ( !storageEventsets[i].object.isCompleted ) {
					eventsets.push( templateObj );
				}
			}
		}
		return eventsets;
	};

	this.getAllEventsets = function( ) {

		var storageEventsets = this.findAllEventsets( );
		if ( !storageEventsets ) {
			storageEventsets = [];
		}
		return storageEventsets;
	};

	this.addEvent = function( dataRecord ) {
		// template version
		dataRecord.id = _encounterDao.insertEvent( _app.controller.patient.id, dataRecord, "" );

	};

	this.saveEvent = function( dataRecord ) {
		if ( dataRecord.id ) {
			_encounterDao.saveEvent( dataRecord.id, dataRecord.object );
		} else {
			this.addEvent( dataRecord );
		}
	};

	this.saveEncounterJSON = function( encounterJson ) {
		_encounterDao.save( _app.controller.patient.id + "#" + _app.controller.slotId, encounterJson );
	};

	this.removeEncountersBySlotId = function( slotId ) {
		var encounters = _encounterDao.findAllEncounterIdsBySlotId( slotId );
		for ( var i = 0; i < encounters.length; i++ ) {
			_encounterDao.removeEncounter( encounters[i] );
		}
	}

	this.completeEncounter = function( ) {
		_encounterDao.setComplete( _app.controller.patient.id );
	};

	this.getEncounterJSON = function( ) {
		return _encounterDao.init( _app.controller.patient.id + "#" + main.controller.slotId );
	};

	this.addTemplate = function( dataRecord ) {
		dataRecord.id = _templateDao.insert( _app.controller.patient.id, dataRecord.object );
	};

	this.saveTemplate = function( dataRecord ) {
		if ( dataRecord.id ) {
			_templateDao.save( dataRecord.id, dataRecord.object );
		} else {
			this.addTemplate( dataRecord );
		}
	};

	this.findAllTemplates = function( ) {
		return _templateDao.findAll( );
	};

	this.findAllTemplatesIds = function( ) {
		return _templateDao.findAllIds( );
	};

	this.getTemplate = function( id ) {
		return _templateDao.getById( id );
	};

	this.addEventset = function( dataRecord ) {
		dataRecord.id = _eventsetDao.insert( _app.controller.patient.id, dataRecord.object );
	};

	this.addEventsetWithPatientId = function( dataRecord, patientId ) {
		dataRecord.id = _eventsetDao.insert( patientId, dataRecord.object );
	};

	this.saveEventset = function( dataRecord ) {
		if ( dataRecord.id ) {
			_eventsetDao.save( dataRecord.id, dataRecord.object );
		} else {
			this.addEventset( dataRecord );
			oldOne = _storage.find( "TemplateCounter", dataRecord.object.id );
			// counter exists
			if ( oldOne ) {
				oldOneObj = JSON.parse( oldOne );
				oldOneObj.count++;
				_storage.save( "TemplateCounter", dataRecord.object.id, JSON.stringify( oldOneObj ) );

			} else {
				// first template
				var newCounter = new Object( );
				newCounter.count = 1;
				_storage.save( "TemplateCounter", dataRecord.object.id, JSON.stringify( newCounter ) );
			}
		}
	};

	this.removeEventset = function( id ) {
		if ( id ) {
			_eventsetDao.removeEvent( id );
		}
	};

	this.findAllEventsets = function( ) {
		return _eventsetDao.findAll( );
	};

	this.findEventsetsForPatient = function( patientId ) {
		return _eventsetDao.findEventsetsByPatient( patientId );
	};

	this.findAllEventsetsIds = function( ) {
		return _eventsetDao.findAllIds( );
	};


	this.addConsent = function( dataRecord ) {
		var patientId = _app.controller.patient.id;
		_consentDao.insertNotSynced( patientId, dataRecord );
	};

	var findConsentIdByPatientId = function( array, patientId ) {
		for ( var i = 0; i < array.length; i++ ) {
			var pid = array[i].id;
			if ( pid ) {
				pid = _consentDao.getPatientIdByConsentId( pid );
				if ( pid === parseInt( patientId, 10 ) ) {
					return array[i].id;
				}
			}
		};
		return null;
	}

	this.markNotSyncedConsentsAsSynced = function() {
		var consents = _consentDao.findAllNotSynced();
		if ( consents ) {
			for ( var i = 0; i < consents.length; i++ ) {
				var pid = consents[i].id;
				var obj = consents[i].object;
				if ( pid && obj ) {
					pid = _consentDao.getPatientIdByConsentId( pid );
					_consentDao.insertSynced( pid, obj );
				}
			}
		}
	}

	/*
	 * when patient data (to be more precise: patientId will not be in patient list)
	 * won't come after synchronisation, then delete consent saved for this patient
	 */
	this.removeNeedlessConsents = function( slots ) {
		if ( ! slots ) return;
		var patientIdsArray = [];
		for ( var i = 0; i < slots.length; i++ ) {
			var appointment = _appointmentDao.getAppointmentById( slots[i] );
			if ( appointment ) {
				patientIdsArray.push( appointment.PatientId );
			}
		}

		var consentsIds = _consentDao.findAllSyncedIds();
		for ( var i = 0; i < consentsIds.length; i++ ) {
			if ( patientIdsArray.indexOf( _consentDao.getPatientIdByConsentId( consentsIds[i] ) ) === -1 ) {
				_consentDao.removeSynced( consentsIds[i] );
			}
		}
	}

	this.removePatientPreviousConsent = function( patientId ) {
		var patientConsentId = findConsentIdByPatientId( _consentDao.findAllSynced(), patientId );
		if ( patientConsentId ) {
			_consentDao.removeSynced( patientConsentId );
		} else {
			patientConsentId = findConsentIdByPatientId( _consentDao.findAllNotSynced(), patientId );
			if ( patientConsentId ) {
				_consentDao.removeNotSynced( patientConsentId );
			}
		}
	}

	this.findPatientConsent = function( patientId ) {
		var patientConsentId = findConsentIdByPatientId( _consentDao.findAllSynced(), patientId );
		var patientConsent = null;
		if ( patientConsentId ) {
			patientConsent = _consentDao.getSyncedConsentById( patientConsentId );
		} else {
			patientConsentId = findConsentIdByPatientId( _consentDao.findAllNotSynced(), patientId );
			if ( patientConsentId ) {
				patientConsent = _consentDao.getNotSyncedConsentById( patientConsentId );
			}
		}
		return patientConsent;
	};


	this.addTask = function( dataRecord ) {
		dataRecord.id = _taskDao.insert( _app.controller.patient.id, dataRecord.object );
	};

	this.addTaskWithPatientId = function( dataRecord, patientId ) {
		dataRecord.id = _taskDao.insert( patientId, dataRecord.object );
	};

	this.removeTask = function( idToRemove ) {
		_taskDao.remove( idToRemove );
	};

	/**
	 * @param dataRecord structure {id:string, object:taskJson}
	 */
	this.saveTask = function( dataRecord ) {
		if ( dataRecord.id ) {
			_taskDao.save( dataRecord.id, dataRecord.object );
		} else {
			this.addTask( dataRecord );
		}
	};

	this.findAllTasks = function( ) {
		return _taskDao.findAll( );
	};

	this.getPatientIdsWithTasks = function( ) {
		return _taskDao.findAllPatientIds( );
	};



	/**
	 * @param optional filter parameters object: filter.patientId for patientId filtering
	 */
	this.findTasks = function( filter ) {
		var tmp = _app.dataProvider.findAllTasks( );
		var patientId;
		if ( filter && filter.patientId ) {
			patientId = filter.patientId;
		} else {
			patientId = _app.controller.patient.id;
		}

		var patientTasks = new Array( );
		// filter other patient's tasks
		for ( var i = 0; i < tmp.length; i++ ) {
			// patient bounded tasks
			var pid = tmp[i].id ;
			if (pid) {
				pid = pid.split('#') ;
				pid = pid[0] ;
				if ( parseInt( pid, 10 ) === parseInt( patientId, 10 ) ) {
					patientTasks.push( tmp[i] );
				}
			}
		}
		return patientTasks;
	};

	this.makeTaskNotSynchronised = function( localId ) {
		if ( !_taskDao.isNotSynchronised( localId ) ) {
			_taskDao.setNotSynchronised( localId );
		}
	};

	this.makeAllTasksNotSynchronised = function( patientId ) {
		var tasks = this.findAllTasks( );
		for ( var i = 0; i < tasks.length; i++ ) {
			var taskId = tasks[i].id;
			var splitId = taskId.split('#');
			if ( ! patientId || ( splitId.length > 1 && splitId[0] == patientId ) ) {
				this.makeTaskNotSynchronised( taskId );
			}
		}
	};

	this.makeScheduleNotSynchronised = function( localId ) {
		if ( !_scheduleDao.isNotSynchronised( localId ) ) {
			_scheduleDao.setNotSynchronised( localId );
		}
	};

	this.makeAllSchedulesNotSynchronised = function( patientId ) {
		var schedules = _scheduleDao.findAll( );
		for ( var i = 0; i < schedules.length; i++ ) {
			var scheduleId = schedules[i].id;
			var splitId = scheduleId.split('#');
			if ( ! patientId || ( splitId.length > 1 && splitId[0] == patientId ) ) {
				this.makeScheduleNotSynchronised( scheduleId );
			}
		}
	};

	this.makeQuickNoteNotSynchronised = function( localId ) {
		var nsQuickNote= _storage.find( "NotSyncedQuickNote", localId );
		if ( ! nsQuickNote ) {
			_storage.save( "NotSyncedQuickNote", localId );
		}
	};

	this.makeAllQuickNotesNotSynchronised = function( slotId ) {
		var quickNotes = null;
		if ( slotId ) {
			quickNotes = this.findAllQuickNotesIdsBySlotId( slotId );
		} else {
			quickNotes = this.findAllPatientIdsWithQuickNotes( );
		}
		if ( quickNotes ) {
			for ( var i = 0; i < quickNotes.length; i++ ) {
				this.makeQuickNoteNotSynchronised( quickNotes[i] );
			}
		}
	};

	this.makeEventsetNotSynchronised = function( localId ) {
		if ( !_eventsetDao.isNotSynchronised( localId ) ) {
			_eventsetDao.setNotSynchronised( localId );
		}
	};

	this.makeAllCompletedEventsetsNotSynchronised = function( slotId ) {
		var ev = null
		if ( slotId ) {
			ev = this.getCompletedEventsetsBySlotId( slotId );
		} else {
			ev = this.getCompletedEventsets( );
		}
		if ( ev ) {
			for ( var i = 0; i < ev.length; i++ ) {
				this.makeEventsetNotSynchronised( ev[i].localId );
			}
		}
	};

	this.makeNewDrugsNotSynchronised = function( localId ) {
		if ( !_newDrugDao.isNotSynchronised( localId ) ) {
			_newDrugDao.setNotSynchronised( localId );
		}
	};

	this.makeAllNewDrugsNotSynchronised = function( patientId ) {
		var newDrugs = this.getNewDrugs( );
		for ( var i = 0; i < newDrugs.length; i++ ) {
			var drugId = newDrugs[i].id;
			var splitId = drugId.split('#');
			if ( ! patientId || ( splitId.length > 1 && splitId[0] == patientId ) ) {
				this.makeNewDrugsNotSynchronised( drugId );
			}
		}
	};

	this.makeAllNewDrugsSynchronised = function( ) {
	} ;


	/*-------------------------------*/
	/*----Consultation properties----*/

	this.addConsultationProperties = function( dataRecord ) {
		dataRecord.id = _consultationPropertiesDao.insert( getPatientContext( ).id, dataRecord.object );
	};

	/**
	 * @param dataRecord structure {id:string, object:taskJson}
	 */
	this.saveConsultationProperties = function( dataRecord ) {
		if ( dataRecord.id ) {
			_consultationPropertiesDao.save( dataRecord.id, dataRecord );
		} else {
			this.addConsultationProperties( dataRecord );
		}
	};

	this.getConsultationProperties = function( ) {
		return _consultationPropertiesDao.getById( getPatientContext( ).id );
	};
	/*----Consultation properties----*/
	/*-------------------------------*/

	this.getMarkupsData = function( ) {
		return _storage.findAll( "MarkupData" );
	};

	this.getMarkupsDataBySlotId = function(slotId) {
		var item = _storage.find("MarkupData", slotId);
		if (item) {
			return JSON.parse(item) ;
		}
		return null ;
	};

	this.getNeedForSyncMarkers = function( ) {
		var item = _storage.find( "MarkersSyncNeeded", "0" );
		if ( item ) {
			itemParsed = JSON.parse( item );
			if ( itemParsed.needed == true ) {
				return true;
			}
		}
		return false;
	};

	this.setNeedForSyncMarkers = function( needed ) {
		_storage.save( "MarkersSyncNeeded", "0", "{\"needed\":" + needed + "}" );
	};

	this.getAllTemplateHeaders = function( ) {
		return _templateHeaderDao.findAll( );
	};

	this.getUserSessionId = function( ) {
		return _app.controller.SessionId;
	};

	this.getDocStorage = function( ) {
		if ( emis.mobile.nativeFrame.isNative ) {
			return _storage;
		} else {
			return _docStorage;
		}
	};

	this.getOtherUserLogsIds = function() {
		return _logDao.findOtherUsersIds();
	};

	this.getDataNeedSyncBySlotId = function (slotId) {

		var ids = {} ;

		var slot = main.dataProvider.getAppointmentById(slotId) ;
		if (slot) {
			patientId = slot.PatientId ;
			// gather all ids to be wiped: drugs, encounters, tasks
			var dm = new emis.mobile.NewDrugModel() ;
			ids.drugs = dm.getAllIdsForPatient(patientId) ;

			var em = new emis.mobile.EncountersModel() ;
			ids.encounters = em.findAllEncounterIdsBySlotId(slotId) ;

			ids.eventsets = this.getCompletedEventsetsBySlotId(slotId) ;

			ids.tasks = _taskDao.findAllIdsByPatientId(patientId);

			ids.consents = _consentDao.findAllNotSyncedIdsByPatientId(patientId);

			ids.quicknotes = this.findAllQuickNotesIdsBySlotId (slotId) ;

			ids.schedules = this.getScheduleIdsForSync(patientId);
		}

		return ids ;
	} ;

	this.slotIdsByPatientId = function (patientId) {
			var apps = this.getAppointmentsByPatientId(patientId) ;
			var slids = $.map(apps, function (s){
				return s.SlotId ;
			}) ;
			return slids ;
	} ;

	this.isAnyDataToSync = function ( slotId ) {
		var drugs = [];
		var tasks = [];
		var encounters = [];
		var logs = [];
		var consents = [];
		var schedules = [];

		if ( slotId ) {
			var patientId = null;
			var appointment = _appointmentDao.getAppointmentById( slotId );
			if ( appointment ) {
				patientId = appointment.PatientId;
			}
			if ( patientId ) {
				drugs = _newDrugDao.getAllForPatient( patientId );
				tasks = _taskDao.findAllIdsByPatientId( patientId );
				if ( DISPLAY_LOGS_DURING_SYNC ) {
					logs = _logDao.findAllCurrentUserIds();
				}
				if ( DISPLAY_CONSENTS_DURING_SYNC ) {
					consents = _consentDao.findAllNotSyncedIdsByPatientId( patientId );
				}

				schedules = that.getScheduleIdsForSync( patientId );
			}
			encounters = _encounterDao.findAllEncounterIdsBySlotId( slotId );
		} else {
			drugs = _newDrugDao.findAllPatientIds();
			tasks = _taskDao.findAllIds();
			encounters = _encounterDao.findAllEncounterIds();
			if ( DISPLAY_LOGS_DURING_SYNC ) {
				logs = _logDao.findAllCurrentUserIds();
			}
			if ( DISPLAY_CONSENTS_DURING_SYNC ) {
				consents = _consentDao.findAllNotSyncedIds();
			}

			schedules = that.getScheduleIdsForSync( );
		}

		if ( drugs.length || tasks.length || encounters.length || logs.length || consents.length ) {
			return true;
		}
		return false ;
	} ;

	this.getSlotIdsNeedSync = function (flatten) {
		var slots = {'eventset':[], 'tasks':[], 'consents':[], 'drugs':[], 'qnotes':[], 'schedules':[]} ;

		// by slot id
		var eventsets = this.getCompletedEventsets( true );
		for (var i = 0; i < eventsets.length; i++) {
			if (eventsets[i] && eventsets[i].patientId) {
				var s = eventsets[i].patientId.split('#')
				if (s.length > 1){
					slots.eventset.push(parseInt(s[1])) ;
				}
			}
		};
		// by slot id
		var qnotes = this.findAllPatientIdsWithQuickNotes( );
		for (var i = 0; i < qnotes.length; i++) {
			var s = qnotes[i].split('#') ;
			if (s.length>1){
				slots.qnotes.push(parseInt(s[1])) ;
			}
		};

		// by patientid
		var tasks = this.findAllTasks( );
		for (var i = 0; i < tasks.length; i++) {
			var s = tasks[i].id.split('#') ;
			if (s.length>1){
				slots.tasks = slots.tasks.concat(this.slotIdsByPatientId(s[0])) ;
			}
		};

		// by patientid
		if ( DISPLAY_CONSENTS_AVAILABLE_FOR_SINGLE_PATIENT_SYNC ) {
			var consents = _consentDao.findAllNotSynced( );
			for (var i = 0; i < consents.length; i++) {
				var s = consents[i].id.split('#') ;
				if (s.length>1){
					slots.consents = slots.consents.concat(this.slotIdsByPatientId(s[0])) ;
				}
			};
		}

		// by patientid
		var createdSchedules = _scheduleDao.findAllIdsByStatus( _scheduleDao.CREATED );
		for (var i = 0; i < createdSchedules.length; i++) {
			var s = createdSchedules[i].split('#') ;
			if (s.length>1){
				slots.schedules = slots.schedules.concat(this.slotIdsByPatientId(s[0])) ;
			}
		};
		var editedSchedules = _scheduleDao.findAllIdsByStatus( _scheduleDao.EDITED );
		for (var i = 0; i < editedSchedules.length; i++) {
			var s = editedSchedules[i].split('#') ;
			if (s.length>1){
				slots.schedules = slots.schedules.concat(this.slotIdsByPatientId(s[0])) ;
			}
		};
		var cancelledSchedules = _scheduleDao.findAllIdsByStatus( _scheduleDao.CANCELLED );
		for (var i = 0; i < cancelledSchedules.length; i++) {
			var s = cancelledSchedules[i].split('#') ;
			if (s.length>1){
				slots.schedules = slots.schedules.concat(this.slotIdsByPatientId(s[0])) ;
			}
		};

		// by patientid
		var newdrugs = this.getNewDrugs( );
		for (var i = 0; i < newdrugs.length; i++) {
			var s = newdrugs[i].id.split('#') ;
			if (s.length>1){
				slots.drugs = slots.drugs.concat(this.slotIdsByPatientId(s[0])) ;
			}
		};


		// return flat array instead of object
		if (flatten) {
			return slots.eventset.concat(slots.tasks, slots.consents, slots.drugs, slots.qnotes) ;
		}
	return slots ;
	} ;

	this.getDescriptionStringForSchedule = function(rpo) { //recurrencePatternObj
		var str="";
		var mainType;
		var pat;
		if(rpo.None) {
			mainType = rpo.None;
			return "No recurrence.";
		} else if(rpo.Daily) {
			mainType = rpo.Daily;
			pat = rpo.Daily.Pattern;
			if(pat.DayPattern) {
				if(pat.DayPattern == 1) {
					str="Every day";
				} else {
					str="Every "+pat.DayPattern+" days";
				}
			} else if(pat.EveryWeekday) {
				str="Every weekday";
			}
		} else if(rpo.Weekly) {
			mainType = rpo.Weekly;
			pat = rpo.Weekly.Pattern;
			if(pat.Count>1) {
				str="Every "+pat.Count+" weeks";
			} else {
				str="Every week";
			}
			// days extraction;
			var days = pat.Days;
			if(days>0) {
				var sat = parseInt(days/64)%2;
				var fri = parseInt(days/32)%2;
				var thu = parseInt(days/16)%2;
				var wed = parseInt(days/8)%2;
				var tue = parseInt(days/4)%2;
				var mon = parseInt(days/2)%2;
				var sun = days%2;
				var first = true;
				if(sun>0) { // sunday is always first
					str+=" on Sunday";
					first = false;
				}
				if(mon>0) {
					if(first) {
						str+=" on Monday";
						first = false;
					} else {
						str+=", Monday";
					}
				}
				if(tue>0) {
					if(first) {
						str+=" on Tuesday";
						first = false;
					} else {
						str+=", Tuesday";
					}
				}
				if(wed>0) {
					if(first) {
						str+=" on Wednesday";
						first = false;
					} else {
						str+=", Wednesday";
					}
				}
				if(thu>0) {
					if(first) {
						str+=" on Thursday";
						first = false;
					} else {
						str+=", Thursday";
					}
				}
				if(fri>0) {
					if(first) {
						str+=" on Friday";
						first = false;
					} else {
						str+=", Friday";
					}
				}
				if(sat>0) {
					if(first) {
						str+=" on Saturday";
						first = false;
					} else {
						str+=", Saturday";
					}
				}
			}
		} else if(rpo.Monthly) {
			mainType = rpo.Monthly;
			pat = rpo.Monthly.Pattern;
			if(pat.PatternCount) {
				var day = pat.PatternCount.DayCount;
				var month = pat.PatternCount.MonthCount;
				if(month==1) {
					str = "On day "+day+" of every month";
				} else if(month%10==1&&parseInt(month/10)%10!=1) {
					str = "On day "+day+" of every "+month+"st month";
				} else if(month%10==2&&parseInt(month/10)%10!=1) {
					str = "On day "+day+" of every "+month+"nd month";
				} else if(month%10==3&&parseInt(month/10)%10!=1) {
					str = "On day "+day+" of every "+month+"rd month";
				} else {
					str = "On day "+day+" of every "+month+"th month";
				}
			} else if(pat.PatternSelect) {
				var dayPattern = pat.PatternSelect.DayPattern;
				var dayType = pat.PatternSelect.DayType;
				if ( dayType == "WeekendDay") {
					dayType = "weekend day";
				} else if ( dayType == "Day" ) {
					dayType = "day";
				} else if ( dayType == "Weekend" ) {
					dayType = "weekend";
				}
				var month = pat.PatternSelect.MonthCount;
				if(month==1) {
					str = "On the "+dayPattern.toLowerCase()+" "+dayType+" of every month";
				} else if(month%10==1&&parseInt(month/10)%10!=1) {
					str = "On the "+dayPattern.toLowerCase()+" "+dayType+" of every "+month+"st month";
				} else if(month%10==2&&parseInt(month/10)%10!=1) {
					str = "On the "+dayPattern.toLowerCase()+" "+dayType+" of every "+month+"nd month";
				} else if(month%10==3&&parseInt(month/10)%10!=1) {
					str = "On the "+dayPattern.toLowerCase()+" "+dayType+" of every "+month+"rd month";
				} else {
					str = "On the "+dayPattern.toLowerCase()+" "+dayType+" of every "+month+"th month";
				}
			}
		} else if(rpo.Quarterly) {
			mainType = rpo.Quarterly;
			pat = rpo.Quarterly.Pattern;
			var dayPattern = pat.DayPattern;
			var dayType = pat.DayType;
			var monthInQuarter = pat.MonthInQuarter;
			str = "Quarterly on the "+dayPattern.toLowerCase()+" "+dayType+" of the "+monthInQuarter.toLowerCase()+" month"
		} else if(rpo.Yearly) {
			mainType = rpo.Yearly;
			pat = rpo.Yearly.Pattern;
			var day = pat.DayCount;
			var month = pat.MonthCount;
			str = "On day "+day+" of "+month+" every year"
		}
		if(mainType.FrequencyPerDay>1) {
			str+=", "+mainType.FrequencyPerDay+" times a day";
		}
		if(mainType.End.Occurrences==0) {
			str+=", open ended";
		} else if(mainType.End.Occurrences==1) {
			str+=", end after 1 occurrence";
		} else {
			str+=", end after "+mainType.End.Occurrences+" occurrences";
		}
		return str;
	}

	_constructor( );

	return this;
};
