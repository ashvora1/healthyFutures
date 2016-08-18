/**
 * TemplateParser form controller Functionalities provided:
 * Paginator added by Laurie Keith 05/06/2015
 */
emis.mobile.form.TemplateParser = function(appObject) {

    console.log("TemplateParser");

    var paginatorDataSource;
    var paginatorCurrentIndex;
    var paginatorPagesMin;
    var paginatorPagesMax;

    var newRecord;
    var chooseTemplate;
    var editableTemplate;

    var _app = appObject;
    var currentSectionIdx;
    var currentMainSectionId;
    var templateComponents = {};
    var templateValues = {};
    var templateValuesOriginal = {};

    var multiselectMaxId = {};
    var requiredFields = [];
    var enforcedFields = [];
    var numericFields = [];
    var returned = false;
    var bTemplateSelectInitialised = false;
    var scrollY = 0;
    var template = null;
    var that = this;
    var lastPage;

    this.allTemplates = false;
    this.canUseCancelForm = true;
    this.needToCopy = 1;
    this.data = [];

    this.init = function() {

        console.log("init");

        paginatorDataSource = [];
        paginatorCurrentIndex = -1;
        paginatorPagesMin = 2;
        paginatorPagesMax = 5;

        templateValues = {};
        templateValuesOriginal = {};
        templateComponents = {};
        multiselectMaxId = {};
        requiredFields = [];
        enforcedFields = [];
        numericFields = [];
        returned = false;
        currentSectionIdx = '';
        currentMainSectionId = '';
        template = null;
        scrollY = 0;

    };

    this.setTemplateRecord = function(templateRecord) {

        console.log("setTemplateRecord");

        that.data.templateRecord = templateRecord;
        that.init();

    };

    function getIdAfterMultiselect(multiSelect, sectionIdx) {

        console.log("getIdAfterMultiselect");

        var mid = 1;
        if (multiSelect) {
            if (multiselectMaxId[sectionIdx]) {
                mid = multiselectMaxId[sectionIdx];
                mid++;
            }
        }
        return mid;
    }

    function generateDatePrompt(content, component, sectionIdx, k) {

        console.log("generateDatePrompt");

        if (component.datePrompt) {
            var datevalue = '';
            if (templateValues['date' + sectionIdx] != null) {
                datevalue = templateValues['date' + sectionIdx];
            }
            content += that.setDatePrompt(sectionIdx, datevalue);
            if (component.required && (typeof k === "undefined" || k === 0)) {
                addIfNonExistent(requiredFields, ('date' + sectionIdx));
            }
        }
        return content;
    }

    function generateMultiSingleDatePrompt(content, component, sectionIdx, multiListId, k) {

        console.log("generateMultiSingleDatePrompt");

        if (component.datePrompt) {

            if(!component.multiSelect) {
                var mid = 1;
                {
                    if (multiselectMaxId[sectionIdx]) {
                        mid = multiselectMaxId[sectionIdx];
                        mid++;
                    }
                }

                var totalCodes = component.codes.length;
                for (var i = 0; i < totalCodes; i++) {
                    if (templateValues['Date' + sectionIdx + '_' + ( i + 1 )]) {
                        mid = ( mid < ( i + 2 ) ) ? ( i + 2 ) : mid;
                    }
                }
                if (totalCodes < mid) {
                    mid = totalCodes;
                }

                for (var k = 0; k < mid; k++) {
                    var multiListId = sectionIdx;
                    multiListId += '_' + (k + 1);

                    if(k == 0) {
                        var datevalue = '';
                        if (templateValues['date' + multiListId] != null) {
                            datevalue = templateValues['date' + multiListId];
                        }

                        content += "<div class='templatesMultiSingle'>";
                        content += that.setDatePrompt(multiListId, datevalue);
                        content += "</div>";
                    }

                    if (component.required && k == 0) {
                        addIfNonExistent(requiredFields, ('date' + multiListId));
                    }
                }
            }
            else
            {
                var datevalue = '';
                if (templateValues['date' + multiListId] != null) {
                    datevalue = templateValues['date' + multiListId];
                }
                content += "<div class='templatesMultiSingle'>";
                content += that.setDatePrompt(multiListId, datevalue);
                content += "</div>";
                if (component.required && (k === 0)) {
                    addIfNonExistent(requiredFields, ('date' + multiListId));
                }
            }
        }

        return content;
    }

    function generateTextPrompt(content, component, sectionIdx) {

        console.log("generateTextPrompt");

        if (component.textPrompt) {
            var textvalue = '';
            if (component.defaultText) {
                textvalue = component.defaultText;
            }
            if (templateValues['addtext' + sectionIdx] != null) {
                textvalue = unescape(templateValues['addtext' + sectionIdx]);
            } else if (component.defaultText && component.defaultText != '') {
                templateValues['addtext' + sectionIdx] = component.defaultText;
            }
            if (component.required) {
                addIfNonExistent(requiredFields, ('addtext' + sectionIdx));
            }
            content += that.setTextPrompt(sectionIdx, textvalue);
        }
        return content;
    }

    this.getMultiSelectValues = function( ) {
        if(templateComponents[currentMainSectionId].multiSelect){
            return templateValues;
        }
        return null;
    }

    this.parseSingleCodeComponent = function(singleCodeComponent, sectionIdx, labelComponent, label, previousValues) {

        console.log("parseSingleCodeComponent");

        var datePrompt = singleCodeComponent.datePrompt;
        var required = singleCodeComponent.required;
        var code = singleCodeComponent.code;
        var term = singleCodeComponent.term;
        var numeric = singleCodeComponent.numeric;
        var units = singleCodeComponent.units;
        var defaultChecked = singleCodeComponent.defaultChecked;
        var textPrompt = singleCodeComponent.textPrompt;
        var defaultText = singleCodeComponent.defaultText;
        var problem = singleCodeComponent.problem;
        var consultationSection = singleCodeComponent.consultationSection;
        var content = "";

        content += "<div class='templatesMultiSingle'>";

        if (!numeric) {
            content += '<div class="componentMiddle">'
            var checked = '';
            if (defaultChecked) {
                checked = " checked='checked'";
            }
            if (templateValues['checkbox' + sectionIdx] != null) {
                checked = templateValues['checkbox' + sectionIdx];
            } else if (defaultChecked) {
                templateValues['checkbox' + sectionIdx] = checked;
            }
            if (required) {
                content += '<span class="requiredField">*</span>';
                addIfNonExistent(requiredFields, ('checkbox' + sectionIdx));
            }
            content += '<label  class="templateCheckbox"><input data-role="none" type="checkbox" id="checkbox' + sectionIdx + '" name="checkbox' + sectionIdx + '" data-theme="emis"' + checked + ' /> ' + labelComponent + ' </label>';
            content += '</div>';
        } else {
            content += "<div class='componentLeft'>";

            content += label;
            if (required)
                content += '<span class="requiredField">*</span>';
            content += "</div>";
            content += '<div class="componentMiddle number-input-wrapper">';
            var unitsvalue = '';
            if (templateValues['numeric' + sectionIdx] != null) {
                unitsvalue = unescape(templateValues['numeric' + sectionIdx]);
            }
            if (emis.mobile.UI.isSamsung) {
                content += '<input type="text" ';
            } else {
                content += '<input type="number" ';
            }
            content += 'data-accept-float="true" pattern="^([0-9]+)\.?([0-9]*)$" id="numeric' + sectionIdx + '" name="numeric' + sectionIdx + '" value="' + unitsvalue + '" data-theme="emis" class="ui-body-c ui-corner-all ui-shadow-inset numeric" />';
            if (units !== undefined) {
                content += '<label for="text' + sectionIdx + '" class="labelRightSide"> ' + units + '</label>';
            }

            addIfNonExistent(numericFields, ('numeric' + sectionIdx));
            if (required) {
                addIfNonExistent(requiredFields, ('numeric' + sectionIdx));
            }
            content += '</div>';
        }

        content += '<div class="componentRight">';

        content += that.setPreviousValue(previousValues[code]);
        content += '</div>';

        content += '</div>';

        content = generateDatePrompt(content, singleCodeComponent, sectionIdx);
        content = generateTextPrompt(content, singleCodeComponent, sectionIdx);

        return content;
    };

    this.parseCodePickListComponent = function(codePickListComponent, sectionIdx, label, previousValues) {

        console.log("parseCodePickListComponent");

        var datePrompt = codePickListComponent.datePrompt;
        var required = codePickListComponent.required;
        var enforced = false;

        var codes = codePickListComponent.codes;

        var multiSelect = codePickListComponent.multiSelect;
        var textPrompt = codePickListComponent.textPrompt;
        var defaultText = codePickListComponent.defaultText;
        var problem = codePickListComponent.problem;
        var consultationSection = codePickListComponent.consultationSection;
        var content = "";

        codePickListComponent.label = label;
        templateComponents[sectionIdx] = codePickListComponent;

        var value;

        var mid = getIdAfterMultiselect(multiSelect, sectionIdx);

        if(multiSelect){
            var totalCodes = codePickListComponent.codes.length;
            for(var i = 0; i < totalCodes; i++){
                if(templateValues['list' + sectionIdx + '_' + ( i + 1 ) ]){
                    mid = ( mid < ( i + 2 ) ) ? ( i + 2 ) : mid;
                }
            }
            if(totalCodes < mid){
                mid = totalCodes;
            }
        }

        console.log("ID:" + mid);

        for (var k = 0; k < mid; k++) {

            var multiListId = sectionIdx;
            var numeric = false;
            var units = '';

            if (multiSelect) {
                multiListId += '_' + (k + 1);
            }

            if (templateValues['list' + multiListId]) {
                value = unescape(templateValues['list' + multiListId].term);
                if (templateValues['list' + multiListId].numeric) {
                    numeric = true;
                    enforced = true;
                    units = unescape(templateValues['list' + multiListId].units);
                }
                else if (!(templateValues['list' + multiListId].numeric)){

                    removeIfExistent(requiredFields, ('numeric' + multiListId));
                    removeIfExistent(enforcedFields, ('numeric' + sectionIdx));
                    removeIfExistent(enforcedFields, ('numeric' + multiListId));
                }
            } else {
                enforced = false;

                    removeIfExistent(enforcedFields, ('numeric' + sectionIdx));
                    delete templateValues['date' + multiListId];

                value = 'Please select';
            }

            content += '<div class="templatesMulti">';

            content += "<div class='templatesMultiSingle'>";
            content += "<div class='componentLeft'>";
            content += label;
            if (required && k == 0)
                content += '<span class="requiredField">*</span>';
            content += "</div>";
            content += "<div class='componentMiddle'>";
            content += '<a href="#listViewCodes" data-section-idx="' + sectionIdx + '" data-rel="dialog(" data-role="button" id="list' + multiListId + '" name="list' + multiListId + '" data-shadow="true"' + ' class="templateBtnSelect ui-btn ui-shadow ui-btn-corner-all ui-btn-icon-right ui-btn-up-c">' + '<div class="selectArrow"></div><div class="selectInTemplate"><label>' + value + '</label></div></a>';
            content += "</div>";
            content += "<div class='componentRight'>";
            content += "</div>";
            content += "</div>";

            if (numeric) {
                var unitsvalue = '';
                if (templateValues['numeric' + multiListId] != null) {
                    unitsvalue = unescape(templateValues['numeric' + multiListId]);
                }
                content += "<div class='templatesMultiSingle'>";
                content += "<div class='componentLeft'></div>";
                content += "<div class='componentMiddle number-input-wrapper'>";
                if (emis.mobile.UI.isSamsung) {
                    content += '<input type="text" ';
                } else {
                    content += '<input type="number" ';
                }
                content += 'data-accept-float="true" pattern="^([0-9]+)\.?([0-9]*)$" id="numeric' + multiListId + '" name="numeric' + multiListId + '" value="' + unitsvalue + '" data-theme="emis" class="ui-body-c ui-corner-all ui-shadow-inset numeric" />';
                content += '<label for="text' + multiListId + '"> ' + units + '</label>';
                content += "</div>";
                content += "<div class='componentRight'>";
                if (templateValues['list' + multiListId]) {
                    content += that.setPreviousValue(previousValues[templateValues['list' + multiListId].code]);
                }
                content += "</div>";
                content += "</div>";

                if (required && k == 0) {
                    if (multiSelect) {
                        addIfNonExistent(requiredFields, ('numeric' + multiListId));
                    } else {
                        addIfNonExistent(requiredFields, ('numeric' + sectionIdx));
                    }
                }

                if(enforced)
                {
                    addIfNonExistent(enforcedFields, ('numeric' + multiListId));
                }
            }

            content = generateMultiSingleDatePrompt(content, codePickListComponent, sectionIdx, multiListId, k);

            if (textPrompt) {
                var textvalue = '';
                if (defaultText) {
                    textvalue = defaultText;
                }
                if (templateValues['addtext' + multiListId] != null) {
                    textvalue = unescape(templateValues['addtext' + multiListId]);
                } else if (defaultText && defaultText != '') {
                    templateValues['addtext' + multiListId] = defaultText;
                }
                content += "<div class='templatesMultiSingle'>";
                content += that.setTextPrompt(multiListId, textvalue);
                content += "</div>";
            }

            if ((k + 1) == mid && templateValues['list' + sectionIdx + '_' + (k + 2)]) {
                mid++;
            }

            content += "</div>";

            if (required && k == 0) {
                if (multiSelect) {
                    addIfNonExistent(requiredFields, ('list' + multiListId));
                } else {
                    addIfNonExistent(requiredFields, ('list' + sectionIdx));
                }
            }

        }

        return content;
    }

    this.parseSingleTextComponent = function(singleTextComponent, sectionIdx, previousValues, label) {

        console.log("parseSingleTextComponent");

        var datePrompt = singleTextComponent.datePrompt;
        var required = singleTextComponent.required;
        var defaultChecked = singleTextComponent.defaultChecked;
        var textPrompt = singleTextComponent.textPrompt;
        var defaultText = singleTextComponent.defaultText;
        var consultationSection = singleTextComponent.consultationSection;
        var content = "";

        var checked = '';
        if (defaultChecked) {
            checked = " checked='checked'";
        }
        if (templateValues['checkbox' + sectionIdx] != null) {
            checked = templateValues['checkbox' + sectionIdx];
        } else if (defaultChecked) {
            templateValues['checkbox' + sectionIdx] = checked;
        }
        content += "<div class='templatesMultiSingle'>";
        content += '<label class="templateCheckbox"><input type="checkbox" id="checkbox' + sectionIdx + '" name="checkbox' + sectionIdx + '" data-role="none"' + checked + ' /> ' + label + ' </label>';
        content += '</div>';

        content = generateDatePrompt(content, singleTextComponent, sectionIdx);
        content = generateTextPrompt(content, singleTextComponent, sectionIdx);

        return content;
    }

    this.parsePickListComponent = function(textPickListComponent, sectionIdx, previousValues, label) {

        console.log("parsePickListComponent");

        var datePrompt = textPickListComponent.datePrompt;
        var required = textPickListComponent.required;
        var textItems = textPickListComponent.textItems;
        var multiSelect = textPickListComponent.multiSelect;
        var textPrompt = textPickListComponent.textPrompt;
        var defaultText = textPickListComponent.defaultText;
        var consultationSection = textPickListComponent.consultationSection;
        var content = "";

        textPickListComponent.label = label;
        templateComponents[sectionIdx] = textPickListComponent;

        var value = '';
        var mid = getIdAfterMultiselect(multiSelect, sectionIdx);

        if(multiSelect){
            var totalText = textPickListComponent.textItems.length;
            for(var i = 0; i < totalText; i++){
                if(templateValues['list' + sectionIdx + '_' + ( i + 1 ) ]){
                    mid = ( mid < ( i + 2 ) ) ? ( i + 2 ) : mid;
                }
            }
            if(totalText < mid){
                mid = totalText;
            }
        }
        for (var k = 0; k < mid; k++) {
            var multiListId = sectionIdx;
            if (multiSelect) {
                multiListId += '_' + (k + 1);
            }
            if (templateValues['list' + multiListId]) {
                value = unescape(templateValues['list' + multiListId]);
            } else {
                value = 'Please select';
            }

            content += '<div class="templatesMulti">';

            content += "<div class='templatesMultiSingle'>";
            content += "<div class='componentLeft'>";
            content += label;
            if (required && k == 0)
                content += '<span class="requiredField">*</span>';
            content += "</div>";
            content += "<div class='componentMiddle'>";
            content += '<a href="#listViewCodes" data-section-idx="' + sectionIdx + '" data-rel="dialog(" data-role="button" id="list' + multiListId + '" name="list' + multiListId + '" data-shadow="true"' + ' class="templateBtnSelect ui-btn ui-shadow ui-btn-corner-all ui-btn-icon-right ui-btn-up-c">' + '<div class="selectArrow"></div><div class="selectInTemplate"><label>' + value + '</label></div></a>';
            content += "</div>";
            content += "</div>";

            if (datePrompt) {
                var datevalue = '';
                if (templateValues['date' + multiListId] != null) {
                    datevalue = templateValues['date' + multiListId];
                }
                content += that.setDatePrompt(multiListId, datevalue);
                if (required && k == 0) {
                    addIfNonExistent(requiredFields, ('date' + multiListId));
                }
            }
            if (textPrompt) {
                var textvalue = '';
                if (defaultText) {
                    textvalue = defaultText;
                }
                if (templateValues['addtext' + multiListId] != null) {
                    textvalue = unescape(templateValues['addtext' + multiListId]);
                } else if (defaultText && defaultText != '') {
                    templateValues['addtext' + multiListId] = defaultText;
                }
                content += that.setTextPrompt(multiListId, textvalue);
            }

            if ((k + 1) == mid && templateValues['list' + sectionIdx + '_' + (k + 2)]) {
                mid++;
            }
            content += "</div>";
            if (required && k == 0) {
                if (multiSelect) {
                    addIfNonExistent(requiredFields, ('list' + multiListId));
                } else {
                    addIfNonExistent(requiredFields, ('list' + sectionIdx));
                }
            }
        }
        return content;
    }

    this.parseFreeTextComponent = function(freeTextComponent, sectionIdx, label, previousValues) {

        console.log("parseFreeTextComponent");

        var datePrompt = freeTextComponent.datePrompt;
        var required = freeTextComponent.required;
        var consultationSection = freeTextComponent.consultationSection;
        var content = "";

        var textvalue = '';
        if (templateValues['freeText' + sectionIdx] != null) {
            textvalue = unescape(templateValues['freeText' + sectionIdx]);
        }

        content += "<div class='templatesMultiSingle'>";
        content += "<div class='componentLeft'>";
        content += label;
        if (required)
            content += '<span class="requiredField">*</span>';
        content += "</div>";
        content += "<div class='componentMiddle width80'>";
        content += '<textarea data-role="none" name="freeText' + sectionIdx + '" id="freeText' + sectionIdx + '" data-theme="c" class="ui-body-c ui-corner-all ui-shadow-inset">' + textvalue + '</textarea></br>';
        content += "</div>";
        content += "</div>";

        if (required) {
            addIfNonExistent(requiredFields, ('freeText' + sectionIdx));
        }
        content = generateDatePrompt(content, freeTextComponent, sectionIdx)
        return content;
    }

    this.parseYesnoPromptComponent = function(yesnoPromptComponent, sectionIdx, label, previousValues) {

        console.log("parseYesnoPromptComponent");

        var datePrompt = yesnoPromptComponent.datePrompt;
        var required = yesnoPromptComponent.required;
        var yesItem = yesnoPromptComponent.yesItem;
        var noItem = yesnoPromptComponent.noItem;
        var textPrompt = yesnoPromptComponent.textPrompt;
        var defaultText = yesnoPromptComponent.defaultText;
        var problem = yesnoPromptComponent.problem;
        var consultationSection = yesnoPromptComponent.consultationSection;
        var content = "";

        var isNumeric = false;
        var units = '';
        if (yesItem.numeric) {
            units = yesItem.units;
        }
        if (noItem.numeric) {
            units = noItem.units;
        }

        var promptId = '';
        if (templateValues['navbar' + sectionIdx] != null) {
            promptId = templateValues['navbar' + sectionIdx];
        }

        content += "<div class='templatesMultiSingle'>";

        content += "<div class='componentLeft'>";
        content += label;
        if (required)
            content += '<span class="requiredField">*</span>';
        content += "</div>";

        content += "<div class='componentMiddle'>";
        content += '<div class="e-blocks yesno" id="navbar' + sectionIdx + '">';
        content += '<div class="left';
        if (promptId == 'yes' + sectionIdx) {
            content += ' e-active';
            isNumeric = yesItem.numeric;
            units = yesItem.units;
        }
        content += '"><a data-role="none" href="" id="yes' + sectionIdx + '" class="yesNoLink"';
        content += ' data-nav="navbar' + sectionIdx + '" data-numeric=' + yesItem.numeric + ' data-units=' + yesItem.units;

        content += '>' + yesItem.prompt + '</a></div>';
        content += '<div class="right';
        if (promptId == 'no' + sectionIdx) {
            content += ' e-active';
            isNumeric = noItem.numeric
            units = noItem.units;
        }
        content += '"><a data-role="none" href="" id="no' + sectionIdx + '" class="yesNoLink"';
        content += ' data-nav="navbar' + sectionIdx + '" data-numeric=' + noItem.numeric + ' data-units=' + noItem.units;

        content += '>' + noItem.prompt + '</a></div>';
        content += '</div>';
        content += "</div>";

        if (required) {
            addIfNonExistent(requiredFields, ('navbar' + sectionIdx));
        }

        var unitsvalue = '';
        if (templateValues['numeric' + sectionIdx] != null) {
            unitsvalue = unescape(templateValues['numeric' + sectionIdx]);
        }
        content += "</div>";

        content += "<div class='templatesMultiSingle'>";
        content += "<div class='componentLeft'>";
        content += "</div>";

        if (yesItem.numeric || noItem.numeric) {

            content += "<div class='componentMiddle'>";
            if (isNumeric) {
                content += '<div id="navbar' + sectionIdx + 'numeric" class="numeric number-input-wrapper inline-block">';
            } else
                content += '<div style="visibility:hidden" id="navbar' + sectionIdx + 'numeric" class="numeric number-input-wrapper inline-block">';
            if (emis.mobile.UI.isSamsung) {
                content += '<input type="text" ';
            } else {
                content += '<input type="number" ';
            }
            content += 'data-accept-float="true" pattern="^([0-9]+)\.?([0-9]*)$" id="numeric' + sectionIdx + '" name="numeric' + sectionIdx + '" value="' + unitsvalue + '" data-theme="emis" class="ui-body-c ui-corner-all ui-shadow-inset numeric" />';
            content += '<label id="navbar' + sectionIdx + 'units" for="text' + sectionIdx + '" class="labelRightSide"> ' + units + '</label>';
            content += '</div>';
            content += '</div>';

            content += "<div class='componentRight'>";
            content += that.setPreviousValue(previousValues[yesItem.code]);
            content += that.setPreviousValue(previousValues[noItem.code]);
            content += '</div>';

            addIfNonExistent(numericFields, ('numeric' + sectionIdx));
            if (required) {
                addIfNonExistent(requiredFields, ('numeric' + sectionIdx));
            }
        }
        content += "</div>";
        content = generateDatePrompt(content, yesnoPromptComponent, sectionIdx);
        content = generateTextPrompt(content, yesnoPromptComponent, sectionIdx);

        return content;
    }

    this.parseDiaryEntryComponent = function(diaryEntryComponent, sectionIdx, labelComponent, previousValues) {

        console.log("parseDiaryEntryComponent");

        var required = diaryEntryComponent.required;
        var code = diaryEntryComponent.code;
        var term = diaryEntryComponent.term;
        var defaultChecked = diaryEntryComponent.defaultChecked;
        var textPrompt = diaryEntryComponent.textPrompt;
        var defaultText = diaryEntryComponent.defaultText;
        var content = "";

        var checked = '';
        if (defaultChecked) {
            checked = " checked='checked'";
        }
        if (templateValues['checkbox' + sectionIdx] != null) {
            checked = templateValues['checkbox' + sectionIdx];
        } else if (defaultChecked) {
            templateValues['checkbox' + sectionIdx] = checked;
        }
        content += "<div class='templatesMultiSingle'>";

        content += "<div class='componentLeft'>";
        if (required)
            content += '<span class="requiredField">*</span>';
        content += '<label class="templateCheckbox"><input type="checkbox" id="checkbox' + sectionIdx + '" name="checkbox' + sectionIdx + '" data-role="none"' + checked + ' /> ' + labelComponent + ' </label>';
        content += "</div>";

        content += "<div class='componentMiddle'>";
        content += '</div>';
        content += "<div class='componentRight'>";
        content += that.setPreviousValue(previousValues[code]);
        content += '</div>';
        content += '</div>';

        if (required) {
            addIfNonExistent(requiredFields, ('checkbox' + sectionIdx));
        }

        var datevalue = null;
        if (main.dataProvider.isMinimumPatientDataServiceVersion(main.controller.patient.id, "0004")) {
            datevalue = _app.util.getISONowUTCDate();
        } else {
            datevalue = _app.util.getISONowDate();
        }
        var dateIdx = 'date' + sectionIdx;
        if (templateValues[dateIdx] != null) {
            datevalue = templateValues[dateIdx];
        } else {
            templateValues[dateIdx] = datevalue;
        }

        content += that.setDatePrompt(sectionIdx, datevalue);
        if (true) { // TODO always required because empty checkbox means that there is answer
            addIfNonExistent(requiredFields, (dateIdx));
        }

        content = generateTextPrompt(content, diaryEntryComponent, sectionIdx);

        return content;
    }

    this.parseBloodPressureComponent = function(bloodPressureComponent, sectionIdx, label, previousValues) {

        console.log("parseBloodPressureComponent");

        var datePrompt = bloodPressureComponent.datePrompt;
        var required = bloodPressureComponent.required;
        var systolicCode = bloodPressureComponent.systolicCode;
        var diastolicCode = bloodPressureComponent.diastolicCode;
        var units = bloodPressureComponent.units;
        var defaultChecked = bloodPressureComponent.defaultChecked;
        var textPrompt = bloodPressureComponent.textPrompt;
        var defaultText = bloodPressureComponent.defaultText;
        var consultationSection = bloodPressureComponent.consultationSection;
        var content = "";
        var systolicvalue = '';
        var diastolicvalue = '';

        if (templateValues['systolic' + sectionIdx] != null) {
            systolicvalue = unescape(templateValues['systolic' + sectionIdx]);
        }
        if (templateValues['diastolic' + sectionIdx] != null) {
            diastolicvalue = unescape(templateValues['diastolic' + sectionIdx]);
        }

        content += "<div class='templatesMultiSingle'>";
        content += "<div class='componentLeft'>";
        content += label;
        if (required)
            content += '<span class="requiredField">*</span>';
        content += "</div>";
        content += "<div class='componentMiddle'>";
        content += "<div class='bloodPressureDiv number-input-wrapper'>";
        content += '<input class="bloodPressureInput1" type="number" pattern="[0-9]*" name="systolic' + sectionIdx + '" id="systolic' + sectionIdx + '" value="' + systolicvalue + '" data-theme="emis" data-inline="true" class="ui-body-c ui-corner-all ui-shadow-inset" />';
        content += "<div class='bloodPressureSeparator'>/</div>";
        content += '<input class="bloodPressureInput2" type="number" pattern="[0-9]*" name="diastolic' + sectionIdx + '" id="diastolic' + sectionIdx + '" value="' + diastolicvalue + '" data-theme="emis" data-inline="true" class="ui-body-c ui-corner-all ui-shadow-inset" />';
        content += '</div>';
        content += '<label class="bloodPressureUnits">' + units + '</label>';
        content += '</div>';
        content += '<div class="componentRight">';
        content += that.setPreviousBloodPressure(previousValues[systolicCode], previousValues[diastolicCode]);
        content += '</div>';
        addIfNonExistent(numericFields, ('systolic' + sectionIdx));
        addIfNonExistent(numericFields, ('diastolic' + sectionIdx));
        if (required) {
            addIfNonExistent(requiredFields, ('systolic' + sectionIdx));
            addIfNonExistent(requiredFields, ('diastolic' + sectionIdx));
        }
        content = generateDatePrompt(content, bloodPressureComponent, sectionIdx);
        content = generateTextPrompt(content, bloodPressureComponent, sectionIdx);

        return content;
    }

    emis.mobile.console.log("template parser loaded");

    this.bindDataAndEvents = function($page, refresh) {

        console.log("bindDataAndEvents");

        $(".ui-datebox-container").hide();
        that.canUseCancelForm = true;
        lastPage = $page;
        var createRecord = that.data.action === "addTemplate";
        newRecord = (createRecord || that.data.action === "editNewTemplate");
        chooseTemplate = (createRecord || that.data.action === "chooseTemplate");
        editableTemplate = that.data.blocked ? false : true;
        that.data.blocked = false;

        var dataTemplateHeaders = _app.dataProvider.getTemplateHeaders();

        $("#contentTemplate").html("");

        if (createRecord) {
            clear();
            that.data.templateRecord = JSON.parse(_app.dataProvider.getTemplate(dataTemplateHeaders[0].Id));
            that.data.action = "editNewTemplate";
        }

        if (that.data) {

            that.allTemplates = false;
            createTemplateEditor.call(this, lastPage, newRecord, chooseTemplate, editableTemplate, false);
        }

        emis.mobile.UI.buildAlerts($page.selector);

    };

    function createTemplateEditor($page, newRecord, chooseTemplate, editableTemplate, enhanceWithin) {

        console.log("createTemplateEditor");

        var requiredFields = [];
        var numericFields = [];
        var $content = $("#contentTemplate");

        if (chooseTemplate) {
            $('#tpHeaderTitle').html("Contact - Add template");
            $page.on('pageshow', function() {
                $(document).attr("title", "Contact - Add template");
                $(".navbarRight .ui-btn-inner").removeClass("ui-btn-inner");
                $(".navbarLeft .ui-btn-inner").removeClass("ui-btn-inner");
            });
        } else {
            $('#tpHeaderTitle').html("Contact - Edit template");
            $page.on('pageshow', function() {
                $(document).attr("title", "Contact - Edit template");
                $(".navbarRight .ui-btn-inner").removeClass("ui-btn-inner");
                $(".navbarLeft .ui-btn-inner").removeClass("ui-btn-inner");
                if (!editableTemplate) {
                    $content.find('input[data-role="datebox"]').each(function() {
                        $(this).removeClass("ui-disabled");
                    });
                }
            });
        }

        if (!that.data.templateRecord) {
            $("#selectTemplateButton > label").html("Choose template");
            $("#templateParserFooter").hide();
        } else {
            $("#templateParserFooter").show();
        }

        if (that.data.templateRecord) {

            template = that.data.templateRecord;

            if (template.templateValues && !returned) {
                templateValues = template.templateValues;
                template.templateValues = null;
            }

            var previousValues = _app.dataProvider.getLastValuesTable(template);

            var idTemplate = template.id;
            var nameTemplate = template.name;
            var versionTemplate = template.version;
            var sections = template.sections;

            paginatorDataSource = sections;

            if (paginatorCurrentIndex == -1) {

                var content = '<div class="contentPanel"><div class="header templateName">' + nameTemplate + '</div><div class="content grid"><table><tbody>';

                for (i = 0; i < sections.length; i++) {
                    var section = sections[i];
                    content += '<div class="e-blocks element">';
                    content += '<div class="grid-2 e-block-a"><a href="#" class="select-section paginator-link button standaloneButton standaloneButton-dark" data-role="none" data-index="' + i + '">Display Section ' + (i + 1) + '</a></div>';
                    content += '<div class="grid-2 e-block-b">' + section.title + '</div>';
                    content += '</div>';
                }

                content += '</div></div>';

                $content.html(content);

                $(".select-section").on("click", function(event) {
                    didSelectSection(event);
                });

            } else {

                var content = '<form>';

                content += '\n<div class="templateName">' + nameTemplate + '</div>';

                if (sections) {

                    var paginatorMarkup = buildPaginatorMarkup();

                    if (sections.length > 0) {
                        content += paginatorMarkup;
                    }

                    var section = sections[paginatorCurrentIndex];

                    if (section.title) {
                        if (paginatorCurrentIndex > 0) {
                            content += '</div></div>\n';
                        }
                        content += '<div class="contentPanel">';
                        content += '<div class="header">' + section.title + '</div>\n';
                        content += '<div class="content">';
                    }

                    if (section.components) {

                        console.log("Number of components:" + section.components.length);

                        for (var j = 0; j < section.components.length; j++) {

                            content += "<div class='componentDiv'>";
                            var component = section.components[j];
                            var idComponent = component.id;
                            var labelComponent = component.label;

                            var singleCodeComponent = component.singleCode;
                            var codePickListComponent = component.codePickList;
                            var singleTextComponent = component.singleText;
                            var textPickListComponent = component.textPickList;

                            console.log("textPickListComponent:" + textPickListComponent);

                            var freeTextComponent = component.freeText;
                            var yesnoPromptComponent = component.yesnoPrompt;
                            var diaryEntryComponent = component.diaryEntry;
                            var hyperlinkComponent = component.hyperlink;
                            var bloodPressureComponent = component.bloodPressure;

                            var label = '<label class="componentLabel">' + labelComponent + '</label>';

                            var sectionIdx = paginatorCurrentIndex + '_' + j;

                            console.log("sectionIdx:" + sectionIdx);

                            if (singleCodeComponent) {
                                // singleCode parsing
                                content += that.parseSingleCodeComponent(singleCodeComponent, sectionIdx, labelComponent, label, previousValues);
                            } else if (codePickListComponent) {
                                // singleCode parsing
                                content += that.parseCodePickListComponent(codePickListComponent, sectionIdx, label, previousValues);
                            } else if (singleTextComponent) {
                                // singleText parsing
                                content += that.parseSingleTextComponent(singleTextComponent, sectionIdx, previousValues, label);
                            } else if (textPickListComponent) {
                                // textPickList parsing
                                content += that.parsePickListComponent(textPickListComponent, sectionIdx, previousValues, label);
                            } else if (freeTextComponent) {
                                // freeText parsing
                                content += that.parseFreeTextComponent(freeTextComponent, sectionIdx, label, previousValues);
                            } else if (yesnoPromptComponent) {
                                // yesnoPrompt parsing
                                content += that.parseYesnoPromptComponent(yesnoPromptComponent, sectionIdx, label, previousValues);
                            } else if (diaryEntryComponent) {
                                // diaryEntry parsing
                                content += that.parseDiaryEntryComponent(diaryEntryComponent, sectionIdx, labelComponent, previousValues);
                            } else if (hyperlinkComponent) {
                                // hyperlink parsing
                                var url = hyperlinkComponent.url;
                                content += label;
                                content += '<a href="' + url + '">' + labelComponent + '</a><br />';
                            } else if (bloodPressureComponent) {
                                // bloodPressure parsing
                                content += that.parseBloodPressureComponent(bloodPressureComponent, sectionIdx, label, previousValues);
                            }

                            content += "</div>";

                        }

                    }

                    if (sections.length > 0) {
                        content += '</div></div>';
                        content += paginatorMarkup;
                    }

                }

                content += '</form>';

                $content.html(content);

                bindPaginatorEvents();

            }

            if (enhanceWithin) {
                $content.enhanceWithin();
            }

            if (emis.mobile.UI.isSamsung) {
                $(".numeric").keyup(function(e) {
                    var i = 0;
                    while (i < e.target.value.length) {
                        if (isNaN(e.target.value[i]) && e.target.value[i] != ".") e.target.value = e.target.value.split(e.target.value[i]).join("");
                        i++;
                    }
                    var el = e.target;
                    var idx = $(el).attr('id');
                    var val = '';
                    if (el) {
                        if ($(el).val()) {
                            val = that.escapeSpecialChars($(el).val());
                        }

                        if (($(el).attr('type') == 'number' || idx.indexOf('addtext') >= 0 || $(el).attr('type') == 'checkbox') && val == '') {

                            delete templateValues[idx];
                        } else {
                            templateValues[idx] = val;
                        }
                    }
                });
            }

            if (!editableTemplate) {
                $content.find("input, select, textarea").attr("disabled", "disabled");
                $content.find("textarea").addClass("ui-disabled");
            }

            $page.page();

            $('#completeButtonTemplate').unbind();

            if (!editableTemplate) {
                $('#completeButtonTemplate').addClass("ui-disabled");
            } else {
                $('#completeButtonTemplate').removeClass("ui-disabled");
            }

            $('#completeButtonTemplate').on('click', function(e) {
                var el = e.currentTarget;
                if ($(el).hasClass("ui-disabled")) {
                    return false;
                }
                if ($(el).data('submit') != null) {
                    if ($(el).data('submit')) {
                        that.validate();
                    }
                    return;
                }
            });

            $('#cancelTemplate').unbind();

            $('#cancelTemplate').on('click', function() {
                if (that.canUseCancelForm == true) {
                    that.canUseCancelForm = false;
                    that.cancelForm();
                    jQuery(document).trigger('emis.needsync', ['contact']);
                }
                $.mobile.changePage("#templateList");
            });

            $content.find("a:not(.paginator-link)").not("#templateParserMenu").on('click', function(e) {

                console.log("click");

                console.log(e.currentTarget);

                window.scrolled = $(window).scrollTop();

                var el = e.currentTarget;

                if ($(el).hasClass("ui-disabled")) {

                    return false;

                }

                if ($(el).data('ptype')) {

                    var ptype = $(el).data('ptype');

                    if (ptype === 'single') {

                        that.openhistory($(el).data('code'));

                    } else if (ptype === 'double') {

                        that.openbloodpressurehistory($(el).data('code1'), $(el).data('code2'));

                    } else if (ptype === 'multi') {

                        var tt = $(el).data('codes');

                        var codesString = tt.replace(/%27/g, '"');

                        var codes = jQuery.parseJSON(codesString);

                        that.openmultihistory(codes);

                    }

                    return;

                }

                if ($(el).data('nav')) {

                    var parent = $(el).parent();

                    if (parent.hasClass("left")) {
                        parent.next().removeClass("e-active");
                        parent.addClass("e-active");
                        checkYesNoValidation(el, true);
                    } else if (parent.hasClass("right")) {
                        parent.prev().removeClass("e-active");
                        parent.addClass("e-active");
                        checkYesNoValidation(el, false);
                    }

                    templateValues[$(el).data('nav')] = $(el).attr('id');

                    if ($(el).data('numeric')) {
                        $('#' + $(el).data('nav') + 'numeric').css('visibility', 'visible');
                        $('#' + $(el).data('nav') + 'units').html($(el).data('units'));
                    } else {
                        $('#' + $(el).data('nav') + 'numeric').css('visibility', 'hidden');
                    }

                    return;

                }

                var sectionIdx = $(el).data('section-idx');

                var elId = $(el).attr('id');

                if (elId) {
                    currentSectionIdx = elId;
                } else {
                    currentSectionIdx = sectionIdx;
                }

                currentMainSectionId = sectionIdx;

                if (templateValues[currentSectionIdx]) {
                    templateValues[currentSectionIdx] = null;
                }

                var component = templateComponents[currentMainSectionId];

                if (component.codes) {
                    _app.controller.getFormControllerStruct('#listViewCodes').controller.codes = component.codes;
                    _app.controller.getFormControllerStruct('#listViewCodes').controller.title = component.label;
                    _app.controller.getFormControllerStruct('#listViewCodes').controller.currentMainSectionId = currentMainSectionId;
                } else if (component.textItems) {
                    _app.controller.getFormControllerStruct('#listViewCodes').controller.codes = component.textItems;
                    _app.controller.getFormControllerStruct('#listViewCodes').controller.title = component.label;
                    _app.controller.getFormControllerStruct('#listViewCodes').controller.currentMainSectionId = currentMainSectionId;
                }

                scrollY = window.pageYOffset;

                lastPage.off("pagehide", pageHide);

            });

            $content.find(".yesNoLink").each(function(index, value) {
                    var parent = $(value).parent();

                    if (parent.hasClass("left") && parent.hasClass("e-active")) {
                        checkYesNoValidation(value, true);
                    } else if (parent.hasClass("right") && parent.hasClass("e-active")) {
                        checkYesNoValidation(value, false);
                    }
            });

            $content.find("input").on('change', function(e) {



                var el = e.currentTarget;
                var idx = $(el).attr('id');
                var val = '';

                if (el) {

                    if ($(el).attr('type') == 'checkbox') {
                        val = $(el).is(':checked') ? "checked" : false;
                        if (!val) {
                            val = '';
                            $('#' + idx.replace("checkbox","addtext")).addClass("ui-disabled");
                            $('#' + idx.replace("checkbox", "date")).addClass("ui-disabled");
                            val = 'data-notchecked';
                        }else{
                            $('#' + idx.replace("checkbox","addtext")).removeClass("ui-disabled");
                            $('#' + idx.replace("checkbox", "date")).removeClass("ui-disabled");
                        }
                    } else if ($(el).attr('data-role') == 'datebox') {
                        val = $(el).val();
                        if (!val)
                            val = '';
                        else
                            val = _app.util.toISODate(val);
                    } else if ($(el).hasClass('bloodPressureInput1') || $(el).hasClass('bloodPressureInput2')) {

                        val = $(el).val();

                        if (val) {

                            if (val < 0) {
                                val = 0;
                            } else if (val > 300) {
                                val = 300;
                            }

                            $(el).val(val);

                        }

                    } else if ($(el).val()) {

                        val = that.escapeSpecialChars($(el).val());

                    }

                    if (($(el).attr('type') == 'text' || $(el).attr('type') == 'number' || idx.indexOf('addtext') >= 0 || $(el).attr('type') == 'checkbox') && val == '') {

                        delete templateValues[idx];

                    } else {
                        templateValues[idx] = val;
                    }

                }

            });

            $content.find("textarea").on('change', function(e) {

                var el = e.currentTarget;
                var idx = $(el).attr('id');
                var val = '';

                if (el) {

                    if ($(el).val()) {
                        val = that.escapeSpecialChars($(el).val());
                    }

                    if (idx.indexOf('freeText') >= 0 && val == '') {

                        delete templateValues[idx];
                    } else {
                        templateValues[idx] = val;
                    }

                }

            });

            $page.on('pageshow', function() {

                if (returned) {
                    window.scrollTo(0, scrollY);
                    returned = false;
                    scrollY = 0;
                }

            });

            $page.off('pagehide', pageHide);

            $page.on('pagehide', pageHide);

            $('div.dateClass > input').on('datebox', function(e, passed) {

                if (passed.method === 'clear') {
                    var el = e.currentTarget;
                    var idx = $(el).attr('id');
                    templateValues[idx] = null;
                }

                $('#contentTemplate input').each(function() {
                    $(this).trigger('blur');
                })

            });

            if (this.needToCopy == 1) {
                templateValuesOriginal = $.extend({}, templateValues);
                this.needToCopy = 0;
            }

        }

        $content.find("form").on("submit", function(event) {
            event.preventDefault();
            return false;
        });
        $content.find( "input" ).change();
    }

    function buildPaginatorMarkup() {

        console.log("buildPaginatorMarkup");

        var multipler = Math.floor(paginatorCurrentIndex / paginatorPagesMax);
        var start = multipler * paginatorPagesMax;
        var temp = (multipler * paginatorPagesMax) + paginatorPagesMax;
        var end = temp > paginatorDataSource.length ? paginatorDataSource.length : temp;

        var markup = "<div class='paginator'>";
        markup += "<ul class='paginate pag2 clearfix'>";
        markup += "<li class='single'>Section " + (paginatorCurrentIndex + 1) + " of " + paginatorDataSource.length + "</li>";

        markup += "<li><a class='paginator-index paginator-link'>index</a></li>";

        if (paginatorCurrentIndex > 0) {
            markup += "<li><a class='paginator-back paginator-link'>prev</a></li>";
        } else {

        }

        if (paginatorCurrentIndex >= paginatorPagesMax) {
            markup += "<li><a class='paginator-jump-back paginator-link'>...</a></li>";
        }

        for (i = start; i < end; i++) {
            if (paginatorCurrentIndex == i) {
                markup += "<li class='current'>" + (i + 1) + "</li>";
            } else {
                markup += "<li><a class='select-section paginator-link' data-index='" + i + "'>" + (i + 1) + "</a></li>";
            }
        }

        if (paginatorCurrentIndex < paginatorDataSource.length - paginatorPagesMax) {
            markup += "<li><a class='paginator-jump-forward paginator-link'>...</a></li>";
        }

        if (paginatorCurrentIndex < (paginatorDataSource.length - 1)) {
            markup += "<li><a class='paginator-forward paginator-link'>next</a></li>";
        } else {

        }

        markup += "</ul></div>";

        return markup;

    }

    function bindPaginatorEvents() {

        console.log("bindPaginatorEvents");

        $(".select-section").on("click", function(event) {
            didSelectSection(event);
        });

        $(".paginator-index").on("click", function(event) {
            paginatorCurrentIndex = -1;
            createTemplateEditor.call(that, lastPage, newRecord, chooseTemplate, editableTemplate, true);
        });

        $(".paginator-jump-back").on("click", function(event) {
            if (paginatorCurrentIndex >= paginatorPagesMax) {
                paginatorCurrentIndex -= paginatorPagesMax;
                createTemplateEditor.call(that, lastPage, newRecord, chooseTemplate, editableTemplate, true);
            }
        });

        $(".paginator-back").on("click", function(event) {
            if (paginatorCurrentIndex > 0) {
                paginatorCurrentIndex--;
                createTemplateEditor.call(that, lastPage, newRecord, chooseTemplate, editableTemplate, true);
            }
        });

        $(".paginator-jump-forward").on("click", function(event) {
            if (paginatorCurrentIndex < (paginatorDataSource.length - paginatorPagesMax)) {
                paginatorCurrentIndex += paginatorPagesMax;
                createTemplateEditor.call(that, lastPage, newRecord, chooseTemplate, editableTemplate, true);
            }
        });

        $(".paginator-forward").on("click", function(event) {
            if (paginatorCurrentIndex < paginatorDataSource.length) {
                paginatorCurrentIndex++;
                createTemplateEditor.call(that, lastPage, newRecord, chooseTemplate, editableTemplate, true);
            }
        });

    }

    function didSelectSection(event) {

        console.log("didSelectSection");

        var newIndex = $(event.currentTarget).attr("data-index"); //TODO: use .data("index") ?
        var newIndex = $(event.currentTarget).data("index");

        tempIndex = parseInt(newIndex);

        if (!isNaN(tempIndex) && tempIndex > -1 && tempIndex <= paginatorDataSource.length) {
            paginatorCurrentIndex = tempIndex;
            createTemplateEditor.call(that, lastPage, newRecord, chooseTemplate, editableTemplate, true);
        } else {
            console.log("Illegal Index");
            console.log(event.currentTarget);
        }

    }

    var pageHide = function() {

        console.log("pageHide");

        lastPage.off("pagehide", pageHide);

        if (that.canUseCancelForm == true) {
            that.canUseCancelForm = false;
            that.cancelForm();
            jQuery(document).trigger('emis.needsync', ['contact']);
        }

    };

    this.addEvent = function(eventType, targetId, handler) {

    };

    this.addslashes = function(str) {

        console.log("addslashes");

        str = str.replace(/"/g, '%27');
        return str;
    };

    this.escapeSpecialChars = function(string) {

        console.log("escapeSpecialChars");

        var escapedString = string;
        escapedString = main.sanitizer.sanitize(escapedString);

        escapedString = escapedString.replace(/"/igm, "&quot;");
        escapedString = escapedString.replace(/'/igm, "&apos;");
        escapedString = escape(escapedString);

        return escapedString;
    };

    this.unescapeForOutput = function(string) {

        console.log("unescapeForOutput");

        var unescapedString = string;
        unescapedString = unescape(unescapedString);
        unescapedString = unescapedString.replace(/&quot;/g, "\\\"");
        unescapedString = unescapedString.replace(/&apos;/g, "'");

        return unescapedString;
    };

    this.validate = function() {

        console.log("validate");

        var notCompleted = false;
        var firstElement = null;
        for (var i = 0; i < requiredFields.length; i++) {
            if (!templateValues[requiredFields[i]] || templateValues[requiredFields[i]] == '' || templateValues[requiredFields[i]] == 'data-notchecked') {
                notCompleted = true;
                if (requiredFields[i].indexOf('list') >= 0 || requiredFields[i].indexOf('navbar') >= 0 || requiredFields[i].indexOf('addtext') >= 0 || requiredFields[i].indexOf('checkbox') >= 0 || requiredFields[i].indexOf('date') >= 0 || requiredFields[i].indexOf('numeric') >= 0) {
                    $('#' + requiredFields[i]).addClass('requiredFieldEmpty');
                } else {
                    $('#' + requiredFields[i]).parent().addClass('requiredFieldEmpty');
                }
                if (firstElement == null) {
                    firstElement = $('#' + requiredFields[i]);
                }
            } else {
                if (requiredFields[i].indexOf('list') >= 0 || requiredFields[i].indexOf('navbar') >= 0 || requiredFields[i].indexOf('addtext') >= 0 || requiredFields[i].indexOf('checkbox') >= 0 || requiredFields[i].indexOf('date') >= 0 || requiredFields[i].indexOf('numeric') >= 0) {
                    $('#' + requiredFields[i]).removeClass('requiredFieldEmpty');
                } else {
                    $('#' + requiredFields[i]).parent().removeClass('requiredFieldEmpty');
                }
            }
        }

        console.log("Validate enforcedFieldsArray");

        for (var i = 0; i < enforcedFields.length; i++) {
            if (!templateValues[enforcedFields[i]] || templateValues[enforcedFields[i]] == '') {
                if (enforcedFields.length > 0) {
                    notCompleted = true;
                    if (enforcedFields[i].indexOf('list') >= 0 || enforcedFields[i].indexOf('navbar') >= 0 || enforcedFields[i].indexOf('addtext') >= 0) {
                        $('#' + enforcedFields[i]).addClass('requiredFieldEmpty');
                    } else {
                        $('#' + enforcedFields[i]).parent().addClass('requiredFieldEmpty');
                    }
                    if (firstElement == null) {
                        firstElement = $('#' + enforcedFields[i]);
                    }
                }
            }
            else {
                if (enforcedFields[i].indexOf('list') >= 0 || enforcedFields[i].indexOf('navbar') >= 0 || enforcedFields[i].indexOf('addtext') >= 0) {
                    $('#' + enforcedFields[i]).removeClass('requiredFieldEmpty');
                } else {
                    $('#' + enforcedFields[i]).parent().removeClass('requiredFieldEmpty');
                }
            }
        }

        var scrollToPaddingsDifference = lastPage.find(".ui-header").height() +
            lastPage.find(".patientSummaryInfo").height() +
            parseInt($("#templateParser").find(".ui-content").css("padding-top"), 10);

        if (notCompleted) {
            if (firstElement != null && firstElement.length) {
                var scrollToEl = firstElement.offset().top - scrollToPaddingsDifference;
                emis.mobile.UI.immediateScrollPageY(scrollToEl);
            }
            emis.mobile.Utilities.alert({
                message: 'Please fill required fields.'
            });
        } else {
            var numericError = false;
            for (var i = 0; i < numericFields.length; i++) {
                if (templateValues[numericFields[i]] && templateValues[numericFields[i]] != '') {
                    if (!that.regIsNumber(templateValues[numericFields[i]])) {
                        numericError = true;
                        $('#' + numericFields[i]).addClass('requiredFieldEmpty');
                        if (firstElement == null) {
                            firstElement = $('#' + numericFields[i]);
                        }
                    } else {
                        $('#' + numericFields[i]).removeClass('requiredFieldEmpty');
                    }
                }
            }
            if (numericError) {
                if (firstElement != null && firstElement.length) {
                    var scrollToEl = firstElement.offset().top - scrollToPaddingsDifference;
                    emis.mobile.UI.immediateScrollPageY(scrollToEl);
                }
                emis.mobile.Utilities.alert({
                    message: 'Please fill numeric field with numeric value.'
                });
            } else {
                that.processForm();
                $("#templateAddedInfo").attr("name", "on");
                jQuery(document).trigger('emis.needsync', ['contact']);
                lastPage.off("pagehide", pageHide);
                $.mobile.changePage('#templateList', {
                    delay: true
                });
            }
        }
    };


    this.regIsNumber = function(fData) {

        console.log("regIsNumber");

        var reg = new RegExp("^[\"]?[-]?[0-9]+([\.]?[0-9]+)?[\"]?$")
        return reg.test(fData)
    };

    this.processForm = function() {

        console.log("processForm");

        template.templateValues = templateValues;
        template.effectiveTime = _app.util.formatDate(new Date());
        template.isCompleted = true;
        template.patientId = _app.controller.patient.id + "#" + _app.controller.slotId;

        var templateObject = {};
        templateObject.object = template;
        templateObject.id = template.localId;
        _app.dataProvider.saveEventset(templateObject);
    };

    this.cancelForm = function() {

        console.log("cancelForm");

        if (!templateValues)
            return;
        proceed = false;
        for (var key in templateValues) {
            if (templateValues.hasOwnProperty(key)) {
                if (templateValues[key] != templateValuesOriginal[key]) {
                    proceed = true;
                    break;
                }
            }
        }
        if (!proceed)
            return;
        if (that.data.templateRecord.edit) {
            template.templateValues = templateValuesOriginal;

        } else {
            template.templateValues = templateValues;
            template.effectiveTime = _app.util.formatDate(new Date());
            template.patientId = _app.controller.patient.id + "#" + _app.controller.slotId;
            if (!template.isCompleted) {
                template.isCompleted = false;
            }

            var string = JSON.stringify(template);
            var templateObject = new Object();
            templateObject.object = template;
            templateObject.id = template.localId;
            _app.dataProvider.saveEventset(templateObject);
        }
    };

    this.setDatePrompt = function(sectionIdx, datevalue) {

        console.log("setDatePrompt");

        if (datevalue)
            datevalue = _app.util.standardizeDate(datevalue)
        var string = '';

            string += "<div class='templatesMultiSingle'>";
            string += '<div class="componentLeft">';
            string += "<div class='templatesMultiAdditonal'>";
            string += '<label>Date:</label>';
            string += "</div>";
            string += '</div>';
            string += '<div class="componentMiddle dateClass">';
            string += '<input type="text" data-role="datebox" data-icon="check" data-options=\'{"calHighToday":false, "useModal":true, "mode": "calbox", "centerHoriz": true, "centerVert": true, "useAnimation" : false, "useFocus": true, "useClearButton": "true", "useTodayButton": "true", "overrideDateFormat":"%d-%b-%Y" }\' name="date' + sectionIdx + '" id="date' + sectionIdx + '" value="' + datevalue + '" data-theme="emis" class="ui-input-text ui-body-c ui-corner-all ui-shadow-inset" />';
            string += '</div>';
            string += '</div>';

        return string;
    };

    this.setTextPrompt = function(sectionIdx, textvalue) {

        console.log("setTextPrompt");

        var string = '';
        string += "<div class='templatesMultiSingle'>";
        string += '<div class="componentLeft">';
        string += "<div class='templatesMultiAdditonal'>";
        string += '<label>Additional text:</label>';
        string += "</div>";
        string += '</div>';
        string += '<div class="componentMiddle width80">';
        string += '<input name="addtext' + sectionIdx + '" id="addtext' + sectionIdx + '" value="' + textvalue + '" data-theme="emis" class="ui-input-text ui-body-c ui-corner-all ui-shadow-inset">';
        string += '</div>';
        string += '</div>';
        return string;
    };

    this.setPreviousValue = function(entry) {

        console.log("setPreviousValue");

        if (entry == null) {
            return '';
        }
        var string = '';

        string += '<div class="lastValues">';
        string += '<label>Last value: </label><br />';
        string += '<span class="templatesLastValueDate">' + entry.date + '</span> - <i>' + entry.value + '</i>';
        if (entry.units) {
            string += ' ' + entry.units;
        }
        string += '</div>';
        string += '<a href="#" data-role="none" data-inline="true" data-ptype="single" ';
        string += 'class="ui-btn-right standaloneButton graphButton" data-code="' + entry.code + '">';
        string += 'Graph</a>';

        return string;
    };

    this.setPreviousValues = function(codes, previousValues) {

        console.log("setPreviousValues");

        if (codes == null) {
            return '';
        }

        var string = '';
        var j = 0;
        var codesArray = [];

        string += '<div class="lastValues">';
        string += '<label>Last values: </label><br />';
        for (var i = 0; i < codes.length; i++) {
            addIfNonExistent(codesArray, (codes[i].code));
            if (previousValues[codes[i].code]) {
                if (j == 0) {
                    string += '<span class="templatesLastValueDate">' + previousValues[codes[i].code].date + '</span> - ' + previousValues[codes[i].code].value;
                } else {
                    string += ', ' + previousValues[codes[i].code].value;
                }
                if (previousValues[codes[i].code].units) {
                    string += ' ' + previousValues[codes[i].code].units;
                }
                j++;
                string += " ...";
                break;
            }
        }
        var codesJSON = this.addslashes(JSON.stringify(codesArray));
        string += '</div>';
        string += '<a href="#" data-role="none" data-inline="true" data-ptype="multi" ';
        string += 'class="ui-btn-right standaloneButton graphButton" data-codes="' + codesJSON + '">';
        string += 'Graph</a>';
        if (j > 0)
            return string;
        else
            return '';
    };

    this.setPreviousBloodPressure = function(entry1, entry2) {

        console.log("setPreviousBloodPressure");

        if (entry1 == null || entry2 == null) {
            return '';
        }

        var string = '';

        string += '<div class="lastValues">';
        string += '<label>Last value: </label><br />';
        string += '<span class="templatesLastValueDate">' + entry1.date + '</span> - <i>' + entry1.value + '/' + entry2.value + "</i>";
        if (entry1.units) {
            string += ' ' + entry1.units;
        }
        string += '</div>';
        string += '<a href="#" data-role="none" data-inline="true" data-ptype="double" ';
        string += 'class="ui-btn-right standaloneButton graphButton" data-code1="' + entry1.code + '" data-code2="' + entry2.code + '">';
        string += 'Graph</a>';

        return string;
    }

    this.setCurrentCodeNr = function(codeTerm) {

        console.log("setCurrentCodeNr");

        var addBool = true;
        if (templateValues.hasOwnProperty(currentSectionIdx)) {
            addBool = false;
        }

        var isAlreadySelected = false;
        for ( var key in templateValues ) {
            if ( key.substring(4,7) === currentMainSectionId && templateValues[key] != null && templateValues[key] == codeTerm ) {
                isAlreadySelected = true;
                break;
            }
        }

        if(isAlreadySelected)
            return;

        templateValues[currentSectionIdx] = codeTerm;
        if (templateComponents[currentMainSectionId]) {
            var component = templateComponents[currentMainSectionId];
            if (component.multiSelect) {
                if (multiselectMaxId[currentMainSectionId] && addBool) {
                    multiselectMaxId[currentMainSectionId] = (multiselectMaxId[currentMainSectionId] + 1);
                } else {
                    if (multiselectMaxId[currentMainSectionId])
                        multiselectMaxId[currentMainSectionId] = multiselectMaxId[currentMainSectionId];
                    else
                        multiselectMaxId[currentMainSectionId] = 1;
                }
            }
        }
    };

    this.clearTemplateContent = function() {

        console.log("clearTemplateContent");

        clear();
    };

    this.setCurrentTemplate = function(codeTerm, editorCreate) {

        console.log("setCurrentTemplate");

        var selectedCode = codeTerm;

        clear();
        that.data.templateRecord = JSON.parse(_app.dataProvider.getTemplate(selectedCode));
        this.needToCopy = 1;
        try {
            $page.trigger("create");
        } catch (ex) {}

        try {
            $page.trigger("pagecreate");
        } catch (ex) {}

        try {
            $page.find(':jqmData(role="header")').trigger("create");
        } catch (ex) {}

        try {
            $page.find(':jqmData(role="listview")').listview("refresh", true);
            $(".ui-li-has-arrow").removeClass("ui-li-static");
            $li.find(".ui-btn-inner").addClass("ui-corner-bottom");
        } catch (ex) {}

    };

    this.setReturned = function() {

        console.log("setReturned");

        returned = true;

    };

    this.initializeView = function() {

    };

    this.prepareOutputForSingleCodeComponent = function(singleCodeComponent, events, encounter, sectionIdx, sectionParentText, sectionParentCode) {

        console.log("prepareOutputForSingleCodeComponent");

        var eventSingle = new Object();
        var codedEntry = new Object();

        if (sectionParentText)
            eventSingle.sectionParentText = sectionParentText;

        if (sectionParentCode)
            eventSingle.sectionParentCode = sectionParentCode;

        eventSingle.consultationSection = singleCodeComponent.consultationSection;

        if (!singleCodeComponent.numeric) {
            if (templateValues['checkbox' + sectionIdx] != null && templateValues['checkbox' + sectionIdx] != "data-notchecked") {
                codedEntry.code = singleCodeComponent.code;
                codedEntry.term = singleCodeComponent.term;
                codedEntry.problem = singleCodeComponent.problem;
                eventSingle.codedEntry = codedEntry;
                if (singleCodeComponent.textPrompt && templateValues['addtext' + sectionIdx] != null && templateValues['addtext' + sectionIdx] != '') {
                    eventSingle.associatedText = that.unescapeForOutput(templateValues['addtext' + sectionIdx]);
                }
                if (singleCodeComponent.datePrompt && templateValues['date' + sectionIdx] != null && templateValues['date' + sectionIdx] != encounter.effectiveTime) {
                    eventSingle.effectiveTime = templateValues['date' + sectionIdx];
                }
                events.push(eventSingle);
            }
        } else {
            if (templateValues['numeric' + sectionIdx] != null && templateValues['numeric' + sectionIdx] !="") {
                codedEntry.code = singleCodeComponent.code;
                codedEntry.term = singleCodeComponent.term;
                codedEntry.problem = singleCodeComponent.problem;
                var numericValue = new Object();
                numericValue.value = templateValues['numeric' + sectionIdx];
                numericValue.units = singleCodeComponent.units;
                codedEntry.numericValue = numericValue;
                eventSingle.codedEntry = codedEntry;
                if (singleCodeComponent.textPrompt && templateValues['addtext' + sectionIdx] != null && templateValues['addtext' + sectionIdx] != '') {
                    eventSingle.associatedText = that.unescapeForOutput(templateValues['addtext' + sectionIdx]);
                }
                if (singleCodeComponent.datePrompt && templateValues['date' + sectionIdx] != null && templateValues['date' + sectionIdx] != encounter.effectiveTime) {
                    eventSingle.effectiveTime = templateValues['date' + sectionIdx];
                }
                events.push(eventSingle);
            }
        }

        return eventSingle;
    };

    this.prepareOutputForCodePickListComponent = function(codePickListComponent, events, encounter, sectionIdx, sectionParentText, sectionParentCode) {

        console.log("prepareOutputForCodePickListComponent");

        var multiListId = sectionIdx;
        var numeric = false;
        var units = '';
        var k = 1;

        if (codePickListComponent.multiSelect) {
            multiListId += '_' + k;
        }

        while (templateValues['list' + multiListId]) {
            var eventSingle = new Object();
            var codedEntry = new Object();

            if (sectionParentText)
                eventSingle.sectionParentText = sectionParentText;

            if (sectionParentCode)
                eventSingle.sectionParentCode = sectionParentCode;

            eventSingle.consultationSection = codePickListComponent.consultationSection;

            codedEntry.code = templateValues['list' + multiListId].code;
            codedEntry.term = that.unescapeForOutput(templateValues['list' + multiListId].term);
            codedEntry.problem = codePickListComponent.problem;

            if (templateValues['list' + multiListId].numeric) {
                var numericValue = new Object();
                numericValue.value = templateValues['numeric' + multiListId];
                numericValue.units = that.unescapeForOutput(templateValues['list' + multiListId].units);
                codedEntry.numericValue = numericValue;
            }

            eventSingle.codedEntry = codedEntry;
            if (codePickListComponent.textPrompt && templateValues['addtext' + multiListId] != null && templateValues['addtext' + multiListId] != '') {
                eventSingle.associatedText = that.unescapeForOutput(templateValues['addtext' + multiListId]);
            }
            if (codePickListComponent.datePrompt && templateValues['date' + multiListId] != null && templateValues['date' + multiListId] != undefined && templateValues['date' + multiListId] != "" && templateValues['date' + multiListId] != encounter.effectiveTime) {
                eventSingle.effectiveTime = templateValues['date' + multiListId];
            }
            events.push(eventSingle);

            k++;
            multiListId = sectionIdx + '_' + k;
        }
    };

    this.prepareOutputForSingleTextComponent = function(singleTextComponent, events, encounter, sectionIdx, labelComponent, sectionParentText, sectionParentCode) {

        console.log("prepareOutputForSingleTextComponent");

        var eventSingle = new Object();
        if (templateValues['checkbox' + sectionIdx] != null && templateValues['checkbox' + sectionIdx] != "data-notchecked") {
            var associatedText = labelComponent;
            if (singleTextComponent.textPrompt && templateValues['addtext' + sectionIdx] != null && templateValues['addtext' + sectionIdx] != '') {
                associatedText += ' ' + that.unescapeForOutput(templateValues['addtext' + sectionIdx]);
            }
            if (singleTextComponent.datePrompt && templateValues['date' + sectionIdx] != null && templateValues['date' + sectionIdx] != encounter.effectiveTime) {
                eventSingle.effectiveTime = templateValues['date' + sectionIdx];
            }
            eventSingle.associatedText = associatedText;

            if (sectionParentText)
                eventSingle.sectionParentText = sectionParentText;

            if (sectionParentCode)
                eventSingle.sectionParentCode = sectionParentCode;

            eventSingle.consultationSection = singleTextComponent.consultationSection;
            events.push(eventSingle);
        }
        return eventSingle;
    };

    this.prepareOutputForTextPickListComponent = function(textPickListComponent, events, encounter, sectionIdx, sectionParentText, sectionParentCode) {

        console.log("prepareOutputForTextPickListComponent");

        var multiListId = sectionIdx;
        var k = 1;

        if (textPickListComponent.multiSelect) {
            multiListId += '_' + k;
        }
        var associatedText = '';
        while (templateValues['list' + multiListId]) {
            var eventSingle = new Object();
            associatedText = '';

            if (sectionParentText)
                eventSingle.sectionParentText = sectionParentText;

            if (sectionParentCode)
                eventSingle.sectionParentCode = sectionParentCode;

            eventSingle.consultationSection = textPickListComponent.consultationSection;

            associatedText = that.unescapeForOutput(templateValues['list' + multiListId]);
            if (textPickListComponent.textPrompt && templateValues['addtext' + multiListId] != null && templateValues['addtext' + multiListId] != '') {
                associatedText += ' ' + that.unescapeForOutput(templateValues['addtext' + multiListId]);
            }
            if (textPickListComponent.datePrompt && templateValues['date' + multiListId] != null && templateValues['date' + multiListId] != encounter.effectiveTime) {
                eventSingle.effectiveTime = templateValues['date' + multiListId];
            }
            eventSingle.associatedText = associatedText;
            events.push(eventSingle);

            k++;
            multiListId = sectionIdx + '_' + k;
        }
    };

    this.prepareOutputForFreeTextComponent = function(freeTextComponent, events, encounter, sectionIdx, sectionParentText, sectionParentCode, labelComponent) {

        console.log("prepareOutputForFreeTextComponent");

        if (templateValues['freeText' + sectionIdx] != null && templateValues['freeText' + sectionIdx] != '') {
            var eventSingle = new Object();
            eventSingle.associatedText = that.unescapeForOutput(templateValues['freeText' + sectionIdx]);
            if (freeTextComponent.datePrompt && templateValues['date' + sectionIdx] != null && templateValues['date' + sectionIdx] != encounter.effectiveTime) {
                eventSingle.effectiveTime = templateValues['date' + sectionIdx];
            }

            if (labelComponent)
                eventSingle.uncodedTerm = labelComponent;

            if (sectionParentText)
                eventSingle.sectionParentText = sectionParentText;

            if (sectionParentCode)
                eventSingle.sectionParentCode = sectionParentCode;

            eventSingle.consultationSection = freeTextComponent.consultationSection;
            events.push(eventSingle);
            return eventSingle;
        }
    };

    this.prepareOutputForYesnoPromptComponent = function(yesnoPromptComponent, events, encounter, sectionIdx, sectionParentText, sectionParentCode) {

        console.log("prepareOutputForYesnoPromptComponent");

        if (templateValues['navbar' + sectionIdx] != null) {
            var eventSingle = new Object();
            var codedEntry = new Object();
            if (templateValues['navbar' + sectionIdx][0] == 'y') {
                codedEntry.code = yesnoPromptComponent.yesItem.code;
                codedEntry.term = yesnoPromptComponent.yesItem.term;
                if (yesnoPromptComponent.yesItem.numeric) {
                    var numericValue = new Object();
                    numericValue.value = templateValues['numeric' + sectionIdx];
                    numericValue.units = yesnoPromptComponent.yesItem.units;
                    codedEntry.numericValue = numericValue;
                }
            } else if (templateValues['navbar' + sectionIdx][0] == 'n') {
                codedEntry.code = yesnoPromptComponent.noItem.code;
                codedEntry.term = yesnoPromptComponent.noItem.term;
                if (yesnoPromptComponent.noItem.numeric) {
                    var numericValue = new Object();
                    numericValue.value = templateValues['numeric' + sectionIdx];
                    numericValue.units = yesnoPromptComponent.noItem.units;
                    codedEntry.numericValue = numericValue;
                }
            }
            codedEntry.problem = yesnoPromptComponent.problem;
            eventSingle.codedEntry = codedEntry;

            if (sectionParentText)
                eventSingle.sectionParentText = sectionParentText;

            if (sectionParentCode)
                eventSingle.sectionParentCode = sectionParentCode;

            eventSingle.consultationSection = yesnoPromptComponent.consultationSection;
            if (yesnoPromptComponent.textPrompt && templateValues['addtext' + sectionIdx] != null && templateValues['addtext' + sectionIdx] != '') {
                eventSingle.associatedText = that.unescapeForOutput(templateValues['addtext' + sectionIdx]);
            }
            if (yesnoPromptComponent.datePrompt && templateValues['date' + sectionIdx] != null && templateValues['date' + sectionIdx] != encounter.effectiveTime) {
                eventSingle.effectiveTime = templateValues['date' + sectionIdx];
            }
            events.push(eventSingle);
            return eventSingle;
        }
    };

    this.prepareOutputForDiaryEntryComponent = function(diaryEntryComponent, events, encounter, sectionIdx, sectionParentText, sectionParentCode) {

        console.log("prepareOutputForDiaryEntryComponent");
        if (templateValues['checkbox' + sectionIdx] != null && templateValues['checkbox' + sectionIdx] != "data-notchecked") {
            var diaryEntry = {
                code: diaryEntryComponent.code,
                term: diaryEntryComponent.term
            };

            var consultationSection = {};
            consultationSection.code = DIARY_COMPONENT_CODE;
            consultationSection.term = "Follow up";

            var eventSingle = {
                diaryEntry: diaryEntry,
                consultationSection: consultationSection
            };

            if (sectionParentText)
                eventSingle.sectionParentText = sectionParentText;

            if (sectionParentCode)
                eventSingle.sectionParentCode = sectionParentCode;

            if (diaryEntryComponent.textPrompt && templateValues['addtext' + sectionIdx] != null && templateValues['addtext' + sectionIdx] != '') {
                eventSingle.associatedText = that.unescapeForOutput(templateValues['addtext' + sectionIdx]);
            }
            if (templateValues['date' + sectionIdx] != null) {
                eventSingle.effectiveTime = templateValues['date' + sectionIdx];
            } else {
                eventSingle.effectiveTime = encounter.effectiveTime;
            }
            events.push(eventSingle);
            return eventSingle;
        }
    };

    this.prepareOutputForBloodPressureComponent = function(bloodPressureComponent, events, encounter, sectionIdx, sectionParentText, sectionParentCode) {

        console.log("prepareOutputForBloodPressureComponent");

        if (templateValues['systolic' + sectionIdx] != null && templateValues['diastolic' + sectionIdx] != null) {
            var eventSingle = new Object();
            var bloodPressure = new Object();
            bloodPressure.systolicValue = templateValues['systolic' + sectionIdx];
            bloodPressure.diastolicValue = templateValues['diastolic' + sectionIdx];
            eventSingle.bloodPressure = bloodPressure;

            if (sectionParentText)
                eventSingle.sectionParentText = sectionParentText;

            if (sectionParentCode)
                eventSingle.sectionParentCode = sectionParentCode;

            eventSingle.consultationSection = bloodPressureComponent.consultationSection;
            if (bloodPressureComponent.textPrompt && templateValues['addtext' + sectionIdx] != null && templateValues['addtext' + sectionIdx] != '') {
                eventSingle.associatedText = that.unescapeForOutput(templateValues['addtext' + sectionIdx]);
            }
            if (bloodPressureComponent.datePrompt && templateValues['date' + sectionIdx] != null && templateValues['date' + sectionIdx] != encounter.effectiveTime) {
                eventSingle.effectiveTime = templateValues['date' + sectionIdx];
            }
            events.push(eventSingle);
            return eventSingle;
        }

    };

    this.fillAllTemplatesSelect = function(data, bNewRecord) {

        console.log("fillAllTemplatesSelect");

        var codes = new Array();
        var idSelected = 0;
        var indexSelected = 0;

        if (that.data.templateRecord)
            idSelected = that.data.templateRecord.id;

        if (data) {
            for (var i = 0; i < data.length; i++) {
                var object = new Object();
                object.code = data[i].Id;
                object.term = data[i].Title;
                //codes.push(object);
                addIfNonExistent(codes, (object));
                console.push("add code " + object)
                if (idSelected == object.code) {
                    indexSelected = i;
                }
            }

            var listViewCodesCtrlr = _app.controller.getFormControllerStruct('#listViewCodes').controller;
            listViewCodesCtrlr.codes = codes;
            listViewCodesCtrlr.title = "Select Template";
        }
    };

    this.openhistory = function openhistory(code) {

        console.log("openhistory");

        _app.controller.setValuesHistoryCodes({
            code: code
        });

        lastPage.off("pagehide", pageHide);

        main.controller.valuesHistorySource = "#templateParser";

        $.mobile.changePage("#patientvalueshistory", {
            delay: true
        });

    };

    this.openbloodpressurehistory = function openbloodpressurehistory(code, code2) {

        console.log("openbloodpressurehistory");

        _app.controller.setValuesHistoryCodes({
            code: code,
            code2: code2
        });
        lastPage.off("pagehide", pageHide);
        main.controller.valuesHistorySource = "#templateParser";
        $.mobile.changePage("#patientvalueshistory", {
            delay: true
        });
    };

    this.openmultihistory = function openmultihistory(codes) {

        console.log("openmultihistory");

        console.log("openmultihistory.codes:" + codes);

        _app.controller.setValuesHistoryCodes({
            codes: codes
        });

        lastPage.off("pagehide", pageHide);

        $.mobile.changePage("#patientvaluesmultihistory", {
            delay: true
        });

    };

    emis.mobile.form.TemplateParser.prepareOutputEvents = function(effectiveTimeEncounter, patientId) {

        console.log("prepareOutputEvents");

        var output = {};

        var encounter = {
            effectiveTime: effectiveTimeEncounter
        };

        var events = new Array();

        var eventSets = _app.dataProvider.getCompletedEventsets();
        for (var ei = 0; ei < eventSets.length; ei++) {
            var template = eventSets[ei];
            if (template.patientId != patientId) {
                continue;
            }
            var sections = template.sections;
            templateValues = template.templateValues;
            for (var i = 0; i < sections.length; i++) {
                var section = sections[i];
                if (section.components) {
                    for (var j = 0; j < section.components.length; j++) {

                        var component = section.components[j];
                        var idComponent = component.id;
                        var labelComponent = component.label;
                        var sectionParentText = section.sectionParentText;
                        var sectionParentCode = section.sectionParentCode;
                        var singleCodeComponent = component.singleCode;
                        var codePickListComponent = component.codePickList;
                        var singleTextComponent = component.singleText;
                        var textPickListComponent = component.textPickList;
                        var freeTextComponent = component.freeText;
                        var yesnoPromptComponent = component.yesnoPrompt;
                        var diaryEntryComponent = component.diaryEntry;
                        var hyperlinkComponent = component.hyperlink;
                        var bloodPressureComponent = component.bloodPressure;
                        var sectionIdx = i + '_' + j;

                        addEvent = false;

                        if (singleCodeComponent) {
                            that.prepareOutputForSingleCodeComponent(singleCodeComponent, events, encounter, sectionIdx, sectionParentText, sectionParentCode);
                        } else if (codePickListComponent) {
                            that.prepareOutputForCodePickListComponent(codePickListComponent, events, encounter, sectionIdx, sectionParentText, sectionParentCode);
                        } else if (singleTextComponent) {
                            that.prepareOutputForSingleTextComponent(singleTextComponent, events, encounter, sectionIdx, labelComponent, sectionParentText, sectionParentCode);
                        } else if (textPickListComponent) {
                            that.prepareOutputForTextPickListComponent(textPickListComponent, events, encounter, sectionIdx, sectionParentText, sectionParentCode);
                        } else if (freeTextComponent) {
                            that.prepareOutputForFreeTextComponent(freeTextComponent, events, encounter, sectionIdx, sectionParentText, sectionParentCode, labelComponent);
                        } else if (yesnoPromptComponent) {
                            that.prepareOutputForYesnoPromptComponent(yesnoPromptComponent, events, encounter, sectionIdx, sectionParentText, sectionParentCode);
                        } else if (diaryEntryComponent) {
                            that.prepareOutputForDiaryEntryComponent(diaryEntryComponent, events, encounter, sectionIdx, sectionParentText, sectionParentCode);
                        } else if (bloodPressureComponent) {
                            that.prepareOutputForBloodPressureComponent(bloodPressureComponent, events, encounter, sectionIdx, sectionParentText, sectionParentCode);
                        }
                    }
                }
            }
        }
        output.events = events;

        var stringOutput = JSON.stringify(output);
        return events;
    };

    function clear() {

        console.log("clear");

        that.data.templateRecord = null;
        that.init();
    }

    function addIfNonExistent(array, string)
    {
        if(array.indexOf(string) == -1)
        {
            array.push(string);
        }
    }

    function removeIfExistent(array, string)
    {
        var index = array.indexOf(string);

        if(index >= 0 )
        {
            array.splice(index, 1);
        }
    }

    function checkYesNoValidation(el, yesBool)
    {
        var id = el.id;
        var isNumeric = el.dataset.numeric;

        //Only remove numeric if the active yes/no prompt is not numeric
        if(yesBool && (isNumeric == "false"))
        {
            var sectionIdx = id.replace("yes","");

            removeIfExistent(requiredFields, ('numeric' + sectionIdx));
            removeIfExistent(enforcedFields, ('numeric' + sectionIdx));

            $('#' + 'numeric' + sectionIdx).val("");
            delete templateValues['numeric' + sectionIdx];
        }
        else if (!yesBool && (isNumeric == "false"))
        {
            var sectionIdx = id.replace("no","");

            removeIfExistent(requiredFields, ('numeric' + sectionIdx));
            removeIfExistent(enforcedFields, ('numeric' + sectionIdx));

            $('#' + 'numeric' + sectionIdx).val("");
            delete templateValues['numeric' + sectionIdx];
        }
        //Only add numeric if the active yes/no prompt is numeric
        if(yesBool && (isNumeric == "true"))
        {
            var sectionIdx = id.replace("yes","");

            addIfNonExistent(requiredFields, ('numeric' + sectionIdx));
            addIfNonExistent(enforcedFields, ('numeric' + sectionIdx));
        }
        else if (!yesBool && (isNumeric == "true"))
        {
            var sectionIdx = id.replace("no","");

            addIfNonExistent(requiredFields, ('numeric' + sectionIdx));
            addIfNonExistent(enforcedFields, ('numeric' + sectionIdx));
        }
    }

    return this;

}