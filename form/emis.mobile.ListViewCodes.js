/**
 * Login form controller Functionalities provided:
 */
emis.mobile.ListViewCodes = function(appObject) {

    console.log("ListViewCodes");

    var _app = appObject;
    var that = this;
    var codes = null;
    var lastPage;
    var afterReturnUnbind = false;
    var counter = 0;
    var reasonTable = new Array();
    var ignoreNextOrientationChange = false;
    var orientationChangesOnly = false;

    var unbindEvents = function() {

        console.log("ListViewCodes.unbindEvents");

        afterReturnUnbind = true;

        lastPage.off('pageshow', pageShow);

        lastPage.off('pagehide', pageHide);

        emis.mobile.UI.removeOrientationEventsForDialog(orientationChangeTimeout);

        $("#templateParser").css("overflow", "visible");

        $("#templateParser").css("max-height", "none");

    }

    var pageShow = function() {

        console.log("ListViewCodes.pageShow");

        orientationChangeTimeout("pageShow");
        $("#listViewCodes > div").addClass("whiteBackground");
        $("#inputFilterTemplate").removeClass("ui-input-text");
        $("#inputFilterTemplate").removeClass("ui-body-a");
        $("#inputFilterTemplate").removeClass("ui-overlay-a");
        $("#inputFilterTemplate");
    }

    var pageHide = function() {

        console.log("ListViewCodes.pageHide");

        unbindEvents();
    }

    var orientationChangeTimeout = function(reason) {

        console.log("ListViewCodes.orientationChangeTimeout");

        time = 300;
        if (reason == "blur")
            time = 500;
        if (!afterReturnUnbind) {
            reasonTable.push(reason);
            setTimeout(orientationChange, time);
        }
    }

    var orientationChangeTimeoutNoParameter = function() {

        console.log("ListViewCodes.orientationChangeTimeoutNoParameter");

        reason = "orientationChange";
        if (!afterReturnUnbind) {
            reasonTable.push(reason);
            setTimeout(orientationChange, time);
        }
    }

    var orientationChange = function() {

        console.log("ListViewCodes.orientationChange");

        counter++;
        reason = reasonTable.shift();
        //@formatter:off
        emis.mobile.console.log(counter + ": reason: " + reason + " " + appObject.controller.isLandscape + " " + appObject.controller.isScreenKeyboard + " " + window.innerHeight + " " + afterReturnUnbind);
        //@formatter:on
        if (afterReturnUnbind) {
            return;
        }

        if (ignoreNextOrientationChange) {
            if (reason == "orientationChange")
                ignoreNextOrientationChange = false;
            emis.mobile.console.log("ignored!!!")
            orientationChangesOnly = true;
            return;
        }

        if (reason != "orientationChange")
            orientationChangesOnly = false;

        var newHeight = emis.mobile.UI.calculateDialogPadding(_app);
        emis.mobile.console.log('newHeight ' + newHeight);
        if (!appObject.controller.isScreenKeyboard && appObject.controller.isLandscape) {
            if (reason != "keyup" && reason != "blur" && reason != "focusin")
                appObject.controller.listViewCodesBackgroundHeight = newHeight;
        } else if (appObject.controller.isLandscape) {
            if (appObject.controller.listViewCodesBackgroundHeight == null) {
                appObject.controller.listViewCodesBackgroundHeight = window.innerHeight - 81;
            }
            newHeight = appObject.controller.listViewCodesBackgroundHeight;
        }
        templateParserHeight = newHeight;
        if (appObject.controller.isLandscape && appObject.controller.isScreenKeyboard && reason != "keyupEnter" && !orientationChangesOnly && !emis.mobile.UI.isiPad)
            templateParserHeight -= 81;
        $("#templateParser").css({
            "min-height": templateParserHeight,
            "height": templateParserHeight,
            "max-height": templateParserHeight,
            "overflow": "hidden"
        });

        if (lastPage) {
            lastPage.css({
                "min-height": newHeight,
                "height": newHeight,
                "max-height": newHeight,
                "overflow": "hidden"
            });
            content = lastPage.find(":jqmData(role=content)");
            contentHeight = newHeight - 200;
            if (appObject.controller.isScreenKeyboard && reason != "keyupEnter" && !orientationChangesOnly && !emis.mobile.UI.isiPad)
                contentHeight -= 81;
            content.css({
                "max-height": contentHeight,
                "-webkit-overflow-scrolling": "touch"
            });
            lastPage.css({
                //so the shadow is covering whole page
                "padding-bottom": ($(document).height() - lastPage.height()) + 'px'
            });
        }

        emis.mobile.console.log('newHeight ' + newHeight + ' templateParserHeight ' + templateParserHeight + ' contentHeight ' + contentHeight);
        if (reason == "keyupEnter")
            ignoreNextOrientationChange = true;
    }

    function getSectionNoData(text) {

        console.log("ListViewCodes.getSectionNoData");

        return '<div class="contentPanel"><div class="header no-data">' + text + '</div></div>';

    }

    function getSectionOpen() {

        console.log("ListViewCodes.getSectionOpen");

        return '<div class="contentPanel">';

    }

    function getSectionClose() {

        console.log("ListViewCodes.getSectionClose");

        return '</div>';

    }

    function getSectionHeaderOpen() {

        console.log("ListViewCodes.getSectionHeaderOpen");

        return '<div class="header grid">';

    }

    function getSectionHeaderClose() {

        console.log("ListViewCodes.getSectionHeaderClose");

        return '</div>';

    }

    function getSectionContentOpen() {

        console.log("ListViewCodes.getSectionContentOpen");

        return '<div class="content grid">';

    }

    function getSectionContentClose() {

        console.log("ListViewCodes.getSectionContentClose");

        return '</div>';

    }

    emis.mobile.console.log("List view loaded");

    function isSelectedValue(templateValues, value){
        var selected = false;
        for(var i in templateValues){
            if(i.substring(4,7) === that.currentMainSectionId && templateValues[i] !== null && templateValues[i] !== undefined && (value === templateValues[i] || value === templateValues[i].term)){
                selected = true;
                break;
            }
        }
        return selected;
    }

    this.bindDataAndEvents = function($page, refresh) {

        console.log("ListViewCodes.bindDataAndEvents");

        var currentTemplateValues;
        var tpController = _app.controller.getFormControllerStruct( '#templateParser' ).controller;
            currentTemplateValues = tpController.getMultiSelectValues();

        // Clear the markup
        $("#contentListViewCodes").html("");

        if (emis.mobile.UI.isChrome) {
            // fix for #68352
            $("#contentListViewCodes").css("-webkit-transform", "none");
        }

        $('#inputFilterTemplate').val("");

        $page.off('pageshow', pageShow);

        lastPage = $page;

        unbindEvents();
        // its not after return here
        afterReturnUnbind = false;

        $("#listViewCloseBtn").off().on("click", function(e) {

            console.log("ListViewCodes.listViewCloseBtn.click");

            // var tpController = _app.controller.getFormControllerStruct('#templateParser').controller;

            tpController.setReturned();

            unbindEvents();

            $.mobile.changePage("#templateParser");

        });

        var data = that.codes;

        console.log("data:" + data);

        if (!_app.util.isEmptyObject(data)) {

            var $content = $("#contentListViewCodes");
            var markup = '';
            var codeNr = '';
            var term = '';
            /* content */
            markup += getSectionOpen();
            markup += getSectionContentOpen();

            console.log("data.length:" + data.length);

            for (var i = 0; i < data.length; i++) {
                markup += '<div class="e-blocks">';
                if (data[i].code) {
                    codeNr = data[i].code;
                    term = data[i].term;
                } else {
                    codeNr = data[i];
                    term = data[i];
                }
                // markup += '<div>';
                // markup += '<a data-code-nr="' + codeNr + '" data-role="none">'
                markup += '<a data-code-nr="' + codeNr + '" data-role="none" ';

                if(currentTemplateValues != null && isSelectedValue(currentTemplateValues, term)){
                    markup += ' class="ui-state-disabled" '
                }

                markup += '>';
                markup += term;
                markup += '</a>';
                // markup += '</div>';
                markup += '</div>';
            }

            markup += getSectionContentClose();

            markup += getSectionClose();

            $content.html(markup);

            $page.page();

            $content.find("a").on('click', function(e) {

                console.log("ListViewCodes.click");

                var el = e.currentTarget;

                var codeNr = $(el).data('code-nr');

                var codeTerm = null;

                if (data[0].code) {

                    for (var i = 0; i < data.length; i++) {

                        if (data[i].code == codeNr) {

                            codeTerm = data[i];

                            break;

                        }

                    }

                } else {

                    codeTerm = codeNr;

                }

                var tpController = _app.controller.getFormControllerStruct('#templateParser').controller;

                if (that.title == "Select Template") {
                    tpController.setCurrentTemplate(codeTerm.code, true);
                } else {
                    tpController.setCurrentCodeNr(codeTerm);
                }

                tpController.setReturned();

                unbindEvents();

                $.mobile.changePage("#templateParser");

            })

            $("#listViewCodesTitle").html(that.title);

        } else {

            var $content = $("#contentListViewCodes");
            var markup = '';
            var codeNr = '';
            var term = '';
            /* content */
            markup += getSectionOpen();
            markup += getSectionContentOpen();

            markup += getSectionContentClose();
            markup += getSectionClose();
            $content.html(markup);

            $page.page();

            $("#listViewCodesTitle").html(that.title);

        }

        emis.mobile.UI.addOrientationEventsForDialog(orientationChangeTimeoutNoParameter);

        // filtering mechanism for data lists - search while you type
        $('#inputFilterTemplate').unbind();

        var $rows = $('#contentListViewCodes > .contentPanel > .content > .e-blocks');

        $('#inputFilterTemplate').keyup(function(e) {

            console.log("ListViewCodes.keyup");

            var val = $.trim($(this).val()).replace(/ +/g, ' ').toLowerCase();

            $rows.show().filter(function() {
                var text = $(this).text().replace(/\s+/g, ' ').toLowerCase();
                return !~text.indexOf(val);
            }).hide();

            // show/hide 'no data' block
            $('#contentListViewCodes > .contentPanel > .content').each(function() {

                var contentObj = $(this).find('.e-blocks > a');
                var hiddenBlocks = $(this).find('.e-blocks > a:hidden');
                var hasNoData = $(this).find('div.noData').length > 0;

                if (contentObj.length == hiddenBlocks.length && !hasNoData) {
                    $(this).append('<div id="noDataFound" class="noData">Nothing found.</div>');
                } else if (contentObj.length != hiddenBlocks.length) {
                    $(this).children().remove('#noDataFound');
                }

            });

            if (e.which != 13)
                orientationChangeTimeout("keyup");
            else
                orientationChangeTimeout("keyupEnter")

        });

        $('#inputFilterTemplate').on("blur", function() {

            orientationChangeTimeout("blur");

        });

        $('#inputFilterTemplate').on("focusin", function() {

            orientationChangeTimeout("focusin");

        });

        $page.on('pageshow', pageShow);

        $page.on('pagehide', pageHide);

        if (_app.util.isEmptyObject(data)) {

            $('#inputFilterTemplate').keyup();

        }

    };

    return this;

}