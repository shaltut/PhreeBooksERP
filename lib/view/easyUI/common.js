/*
 * Common javascript file loaded with all pages
 *
 * NOTICE OF LICENSE
 * This source file is subject to the Open Software License (OSL 3.0)
 * that is bundled with this package in the file LICENSE.TXT.
 * It is also available through the world-wide-web at this URL:
 * http://opensource.org/licenses/OSL-3.0
 *
 * DISCLAIMER
 * Do not edit or add to this file if you wish to upgrade Bizuno to newer
 * versions in the future. If you wish to customize Bizuno for your
 * needs please refer to http://www.phreesoft.com for more information.
 *
 * @name       Bizuno ERP
 * @author     Dave Premo, PhreeSoft <support@phreesoft.com>
 * @copyright  2008-2020, PhreeSoft, Inc.
 * @license    http://opensource.org/licenses/OSL-3.0 Open Software License (OSL 3.0)
 * @version    3.x Last Update: 2019-11-26
 * @filesource lib/view/easyUI/common.js
 */

var jq = jQuery.noConflict();

/* **************************** Variables loaded as needed ********************************* */
//initialize some variables
var bizDefaults  = new Array();
var curIndex     = undefined;
var deleteRow    = false;
var rowAutoAdd   = true;
var no_recurse   = false;
var addressFields= ['address_id','primary_name','contact','address1','address2','city','state','postal_code',
    'telephone1','telephone2','telephone3','telephone4','email','website'];
var countries    = new Array();
var inventory    = new Array();
var glAccounts   = new Array();
var arrPmtMethod = new Array();
var cogs_types   = ['si','sr','ms','mi','ma','sa'];
var discountType = 'amt';
var feeType      = 'amt';
/* **************************** Initialization Functions *********************************** */
jq.ajaxSetup({ // Set defaults for ajax requests
//    contentType: "application/json; charset=utf-8", // this breaks easyUI, datagrid operations
//    dataType: (jq.browser.msie) ? "text" : "json", // not needed for jquery 2.x
    dataType: "json",
    error: function(XMLHttpRequest, textStatus, errorThrown) {
            if (textStatus==="timeout") { jq('body').removeClass('loading'); }
            if (errorThrown) {
                jq('body').removeClass('loading');
                var errMessage = bizEscapeHtml(XMLHttpRequest.responseText.substring(0, 500)); // truncate the message
                if (!XMLHttpRequest.responseText.length || !errMessage.length) { // no length, don't show anything
//                    jq.messager.alert('Info', "Bizuno Ajax Error: No data returned", 'info');
                } else if (XMLHttpRequest.responseText.substring(0, 1) == '<') {
                    jq.messager.alert('Info', "Bizuno Ajax Error: Expecting JSON, got HTML (you can probably ignore unless debugging), received: <br /><br />"+errMessage, 'info');
                } else {
                    jq.messager.alert('Info', "Bizuno Ajax Error: "+errorThrown+' - '+errMessage+"<br />Status: "+textStatus, 'info');
                }
            }
        // go to home page/login screen in 5 seconds
//        window.setTimeout(function() { window.location = bizunoHome; }, 3000);
    }
});

function bizEscapeHtml(text) {
  var map = {'&':'&amp;', '<':'&lt;', '>':'&gt;', '"':'&quot;', "'":'&#039;'};
  return text.replace(/[&<>"']/g, function(m) { return map[m]; });
}
// LOAD BROWSER USER DEFAULTS
if (typeof sessionStorage.bizuno != 'undefined') {
    bizDefaults = JSON.parse(sessionStorage.getItem('bizuno'));
} else if (bizID >= 0) { // this happens when first logging in OR opening a new tab in the browser manually
    reloadSessionStorage();
}

if (typeof bizDefaults.dictionary != 'undefined') {
    if (bizDefaults.language.length != 5) { bizDefaults.language = 'en'; }
    jq.i18n().load(bizDefaults.dictionary, bizDefaults.language);
}

jq.cachedScript = function( url, options ) {
    options = jq.extend( options || {}, { dataType: "script", cache: true, url: url });
    return jq.ajax( options );
};

jq.fn.serializeObject = function() {
    var o = {};
    var a = this.serializeArray();
    jq.each(a, function() {
        if (o[this.name] !== undefined) {
            if (!o[this.name].push) {
                o[this.name] = [o[this.name]];
            }
            o[this.name].push(this.value || '');
        } else {
            o[this.name] = this.value || '';
        }
    });
    return o;
};

jq.fn.textWidth = function(text, font) {
    if (!jq.fn.textWidth.fakeEl) jq.fn.textWidth.fakeEl = jq('<span>').hide().appendTo(document.body);
    jq.fn.textWidth.fakeEl.text(text || this.val() || this.text()).css('font', font || this.css('font'));
    return jq.fn.textWidth.fakeEl.width();
};

/*
var $element=$(window),lastWidth=$element.width(),lastHeight=$element.height();
function checkForChanges(){
   if ($element.width()!=lastWidth || $element.height()!=lastHeight){
    $('#panel').panel('resize');
    $('#datagrid').datagrid('resize');
    lastWidth = $element.width();lastHeight=$element.height();
   }
   setTimeout(checkForChanges, 500);
}
checkForChanges();
*/

// add clear button to datebox, need to add following to each datebox after init: jq('#dd').datebox({ buttons:buttons });
var buttons = jq.extend([], jq.fn.datebox.defaults.buttons);
buttons.splice(1, 0, {
    text: 'Clear',
    handler: function(target){ jq(target).datebox('clear'); }
});
jq.fn.datebox.defaults.formatter  = function(date) { return formatDate(date); };
jq.fn.datebox.defaults.parser     = function(sDate){
    if (!sDate) { return new Date(); }
    if (typeof sDate === 'integer' || typeof sDate === 'object') {
        sDate = formatDate(sDate);
    }
    var sep = '.'; // determine the separator, choices are /, -, and .
    var idx = bizDefaults.calendar.format.indexOf('.');
    if (idx === -1) {
        sep = '-';
        idx = bizDefaults.calendar.format.indexOf('-');
        if (idx === -1) sep = '/';
    }
    var pos = bizDefaults.calendar.format.split(sep);
    var ss  = sDate.split(sep);
    d = [];
    for (var i=0; i<3; i++) d[pos[i]] = parseInt(ss[i],10);
    if (!isNaN(d['Y']) && !isNaN(d['m']) && !isNaN(d['d'])){
        return new Date(d['Y'],d['m']-1,d['d']);
    } else {
        return new Date();
    }
};
//jq.fn.datagrid.defaults.striped   = true; // causes row formatter to skip every other row. bad for using color for status
jq.fn.datagrid.defaults.fitColumns  = true;
jq.fn.datagrid.defaults.pagination  = true;
jq.fn.datagrid.defaults.singleSelect= true;
jq.fn.datagrid.defaults.scrollbarSize = 0; // since we use pagination, there are no scroll bars, let the browser provide them, just takes up space.
jq.fn.window.defaults.minimizable   = false;
jq.fn.window.defaults.collapsible   = false,
jq.fn.window.defaults.maximizable   = false;
if (typeof bizDefaults.locale !== 'undefined') {
    jq.fn.numberbox.defaults.precision       = bizDefaults.locale.precision;
    jq.fn.numberbox.defaults.decimalSeparator= bizDefaults.locale.decimal;
    jq.fn.numberbox.defaults.groupSeparator  = bizDefaults.locale.thousand;
    jq.fn.numberbox.defaults.prefix          = bizDefaults.locale.prefix;
    jq.fn.numberbox.defaults.suffix          = bizDefaults.locale.suffix;
}
//setCurrency(bizDefaults.currency.defaultCur); // makes all numbrerboxes in currency format

jq.extend(jq.fn.datagrid.defaults.editors, {
    color: {
        init: function(container, options){
            var input = jq('<input type="text">').appendTo(container);
            return input.color(options);
        },
        destroy:  function(target){ jq(target).color('destroy'); },
        getValue: function(target){ return jq(target).color('getValue'); },
        setValue: function(target, value){ jq(target).color('setValue',value); },
    },
    numberbox: {
        init: function(container, options){
            var input = jq('<input type="text">').appendTo(container);
            return input.numberbox(options);
        },
        destroy:  function(target){ jq(target).numberbox('destroy'); },
        getValue: function(target){ return jq(target).numberbox('getValue'); },
        setValue: function(target, value){ jq(target).numberbox('setValue',value); }
    },
    numberspinner: {
        init: function(container, options){
            var input = jq('<input type="text">').appendTo(container);
            return input.numberspinner(options);
        },
        destroy:  function(target){ jq(target).numberspinner('destroy'); },
        getValue: function(target){ return jq(target).numberspinner('getValue'); },
        setValue: function(target, value){ jq(target).numberspinner('setValue',value); },
        resize:   function(target, width){ jq(target).numberspinner('resize',width); }
    },
    combogrid: {
        init: function(container, options){
            var input = jq('<input type="text" class="datagrid-editable-input">').appendTo(container);
            input.combogrid(options);
            return input;
        },
        destroy:  function(target)       { jq(target).combogrid('destroy'); },
        getValue: function(target)       { return jq(target).combogrid('getValue'); },
        setValue: function(target, value){ jq(target).combogrid('setValue', value); },
        resize:   function(target, width){ jq(target).combogrid('resize',width); }
    },
    switchbutton:{
        init: function(container, options){
            var input = jq('<input>').appendTo(container);
            input.switchbutton(options);
            return input;
        },
        getValue: function(target)       { return jq(target).switchbutton('options').checked ? 'on' : 'off'; },
        setValue: function(target, value){ jq(target).switchbutton(value=='on'?'check':'uncheck'); },
        resize:   function(target, width){ jq(target).switchbutton('resize', {width: width,height:22}); }
    }
});

function bizPagerFilter(data){
    if (jq.isArray(data)){    // is array
        data = { total: data.length, rows: data };
    }
    var target = this;
    var dg = jq(target);
    var state = dg.data('datagrid');
    var opts = dg.datagrid('options');
    if (!state.allRows) { state.allRows = (data.rows); }
    if (!opts.remoteSort && opts.sortName){
        var names = opts.sortName.split(',');
        var orders = opts.sortOrder.split(',');
        state.allRows.sort(function(r1,r2){
            var r = 0;
            for(var i=0; i<names.length; i++){
                var sn = names[i];
                var so = orders[i];
                var col = jq(target).datagrid('getColumnOption', sn);
                var sortFunc = col.sorter || function(a,b) { return a==b ? 0 : (a>b?1:-1); };
                r = sortFunc(r1[sn], r2[sn]) * (so=='asc'?1:-1);
                if (r != 0) { return r; }
            }
            return r;
        });
    }
    var start = (opts.pageNumber-1)*parseInt(opts.pageSize);
    var end = start + parseInt(opts.pageSize);
    data.rows = state.allRows.slice(start, end);
    return data;
}

var loadDataMethod = jq.fn.datagrid.methods.loadData;
jq.extend(jq.fn.datagrid.methods, {
    disableDnd: function(jqy,index) {
        return jqy.each(function() {
            var trs;
            var target = this;
            var opts = jq(this).datagrid('options');
            if (index != undefined) { trs = opts.finder.getTr(this, index); }
            else { trs = opts.finder.getTr(this, 0, 'allbody'); }
            trs.draggable('disable');
        });
    },
    clientPaging: function(jqy) {
        return jqy.each(function() {
            var dg = jq(this);
            var state = dg.data('datagrid');
            var opts = state.options;
            opts.loadFilter = bizPagerFilter;
            var onBeforeLoad = opts.onBeforeLoad;
            opts.onBeforeLoad = function(param){
                state.allRows = null;
                return onBeforeLoad.call(this, param);
            };
            dg.datagrid('getPager').pagination({
                onSelectPage:function(pageNum, pageSize){
                    opts.pageNumber = pageNum;
                    opts.pageSize = pageSize;
                    jq(this).pagination('refresh',{
                        pageNumber:pageNum,
                        pageSize:pageSize
                    });
                    dg.datagrid('loadData',state.allRows);
                }
            });
            jq(this).datagrid('loadData', state.data);
            if (opts.url){
                jq(this).datagrid('reload');
            }
        });
    },
    loadData: function(jqy, data) {
        jqy.each(function(){ jq(this).data('datagrid').allRows = null; });
        return loadDataMethod.call(jq.fn.datagrid.methods, jqy, data);
    },
    getAllRows: function(jqy) {
        return jqy.data('datagrid').allRows;
    }
});

jq.extend(jq.fn.combogrid.methods, {
    attachEvent: function(jqy, param){
        return jqy.each(function(){
            var grid = jq(this).combogrid('grid');
            var opts = jq(this).combogrid('options');
            opts.handlers = opts.handlers || {};
            var cbs = opts.handlers[param.event];
            if (cbs){
                cbs.push(param.handler);
            } else {
                cbs = [opts[param.event], param.handler];
            }
            opts.handlers[param.event] = cbs;
            opts[param.event] = grid.datagrid('options')[param.event] = function(){
                var target = this;
                var args = arguments;
                jq.each(opts.handlers[param.event], function(i,h){
                    h.apply(target, args);
                });
            };
        });
    }
});

/*
 * This function will search all columns in a combo in place of the standard search only by text field
 * @param array data - original data to search (need to go backwards)
 * @param string q - search string
 * @returns array - filtered data
 */
function glComboSearch(q) {
    var newRows = [];
    jq.map(bizDefaults.glAccounts.rows, function(row) {
        for (var p in row) {
            var v = row[p];
            var regExp = new RegExp(q, 'i'); // i - makes the search case-insensitive.
            if (regExp.test(String(v))) {
                newRows.push(row);
                break;
            }
        }
    });
    var comboEd = jq('#dgJournalItem').datagrid('getEditor', {index:curIndex,field:'gl_account'});
    var g = jq(comboEd.target).combogrid('grid');
    g.datagrid('loadData', newRows);
    jq(comboEd.target).combogrid('showPanel');
    jq(comboEd.target).combogrid('setText', q);
}

/**
 * Detects if a mobile device
 * @returns {undefined}
 */
function isMobile() {
    if (myDevice == 'mobile') { return true; }
    return (typeof window.orientation !== "undefined") || (navigator.userAgent.indexOf('IEMobile') !== -1);
}

/**
 * This function will load into session storage for common Bizuno data that tends to be static once logged in
 */
function loadSessionStorage() {
    jq.ajax({
        url:     bizunoAjax+'&p=bizuno/admin/loadBrowserSession',
        success: function(json) {
            processJson(json);
            if (typeof sessionStorage.bizuno != 'undefined') { sessionStorage.removeItem('bizuno'); }
            sessionStorage.setItem('bizuno', JSON.stringify(json));
            window.location = bizunoHome; // done, load the homepage
        }
    });
}

function reloadSessionStorage(callBackFunction) {
    jq.ajax({
        url:     bizunoAjax+'&p=bizuno/admin/loadBrowserSession',
        success: function(json) {
            processJson(json);
            sessionStorage.removeItem('bizuno');
            sessionStorage.setItem('bizuno', JSON.stringify(json));
            bizDefaults=json;
            if (typeof callBackFunction == 'function') { callBackFunction(); }
        }
    });
}

function refreshSessionClock() {
    setInterval(function(){ jsonAction('bizuno/main/sessionRefresh'); }, 240000);
}

function hrefClick(path, rID, data) {
    if  (typeof path == 'undefined') return alert('ERROR: The destination path is required, no value was provided.');
    var pathClean = path.replace(/&amp;/g,"&");
    var remoteURL = bizunoHome+'&p='+pathClean;
    if (typeof rID   != 'undefined') remoteURL += '&rID='+rID;
    if (typeof jData != 'undefined') remoteURL += '&data='+encodeURIComponent(jData);
    window.location = remoteURL;
}

function jsonAction(path, rID, jData) {
    if  (typeof path == 'undefined') return alert('ERROR: The destination path is required, no value was provided.');
    var pathClean = path.replace(/&amp;/g,"&");
    var remoteURL = bizunoAjax+'&p='+pathClean;
    if (typeof rID   != 'undefined') remoteURL += '&rID='+rID;
    if (typeof jData != 'undefined') remoteURL += '&data='+encodeURIComponent(jData);
    jq.ajax({ type:'GET', url:remoteURL, success:function (data) { processJson(data); } });
    return false;
}

function bizHelp() {
    var popupWin = window.open('https://www.phreesoft.com/biz-school', "_blank");
    if (popupWin==null) { alert('Popup blocked!'); return; }
    popupWin.focus();
}

function tabOpen(id, path) {
    var popupWin = window.open(bizunoHome+"&p="+path, id);
    if (popupWin==null) { alert('Popup blocked!'); return; }
    popupWin.focus();
}

function winOpen(id, path, w, h) {
    if (!w) w = 800;
    if (!h) h = 650;
    var popupWin = window.open(bizunoHome+"&p="+path, id, 'width='+w+',height='+h+',resizable=1,scrollbars=1,top=150,left=200');
    if (popupWin==null) {
        jq.messager.alert({ title:'Popup Blocked!',
            msg: 'Your browser has blocked the popup! Please make sure you allow popups from this site or some browsers require an user click action to process the popup. Press OK to try again.',
            fn: function() { var popupWin = window.open(bizunoHome+"&p="+path, id, 'width='+w+',height='+h+',resizable=1,scrollbars=1,top=150,left=200');
                if (popupWin==null) { alert('The popup is still blocked. You will need to perform this function another way or use a different browser.'); return; }
            }
        });
    }
    popupWin.focus();
}

function winHref(id, path, w, h) {
    if (!w) w = 800;
    if (!h) h = 650;
    var popupWin = window.open(path, id, 'width='+w+', height='+h+', resizable=1, scrollbars=1, top=150, left=200');
    if (popupWin==null) { alert('Popup blocked!'); return; }
    popupWin.focus();
}

function accordionEdit(accID, dgID, divID, title, path, rID, action) {
    //alert('accID = '+accID+' and dgID = '+dgID+' and divID = '+divID+' and title = '+title+' and path = '+path+' and rID = '+rID+' and action = '+action);
    if (typeof tinymce !== 'undefined') { tinymce.EditorManager.editors=[]; }
    var xVars = path+'&rID='+rID;
    if (typeof action != 'undefined') { xVars += '&bizAction='+action; } // do not know if this is used?
    jq('#'+dgID).datagrid('loaded');
    jq('#'+divID).panel({href:bizunoAjax+'&p='+xVars});
    jq('#'+accID).accordion('select', title);
}

/**
 * This function opens a window and then loads the contents remotely
 * @param {type} href
 * @param {type} id
 * @param {type} winTitle
 * @param {type} width
 * @param {type} height
 * @returns {undefined}
 */
function windowEdit(href, id, winTitle, width, height) {
    processJson( { action:'window', id:id, title:winTitle, href:bizunoAjax+'&p='+href, height:height, width:width } );
}

/**
 * This function prepares a form to be submited via ajax
 * @param string formID - form ID to be submitted
 * @param boolean skipPre - set to true to skip the preCheck before submit
 * @returns false - but submits the form data via AJAX if all test pass
 */
function ajaxForm(formID, skipPre) {
    jq('#'+formID).submit(function (e) {
        e.preventDefault();
        e.stopImmediatePropagation(); // may have to uncomment this to prevent double submits
        if ('function' == typeof preSubmit && ('undefined' == typeof skipPre || false == skipPre)) {
            var passed = preSubmit();
            if (!passed) return false; // pre-submit js checking
        }
        var frmData = new FormData(this);
        // Patch for Safari 11+ browsers hanging on forms submits with EMPTY file fields.
//      if (navigator.userAgent.indexOf('Safari') !== -1) { jq('#'+formID).find("input[type=file]").each(function(index, field) { if (jq('#'+field.id).val() == '') { frmData.delete(field.id); } }); }
        jq.ajax({
            url:        jq('#'+formID).attr('action'),
            type:       'post', // breaks with GET
            data:       frmData,
            mimeType:   'multipart/form-data',
            contentType:false,
            processData:false,
            cache:      false,
            success:    function (data) { processJson(data); }
        });
        return false;
    });
}

/**
 * This function uses the jquery plugin filedownload to perform a controlled file download with error messages if a failure occurs
 */
function ajaxDownload(formID) {
    jq('#'+formID).submit(function (e) {
        jq.fileDownload(jq(this).attr('action'), {
            failCallback: function (response, url) { processJson(JSON.parse(response)); },
            httpMethod: 'POST',
            data: jq(this).serialize()
        });
        e.preventDefault();
    });
}

/**
 * This function submits the input fields within a given div element
 */
function divSubmit(path, id) {
    divData = jq('#'+id+' :input').serializeObject();
    jq.ajax({
        url:     bizunoAjax+'&p='+path,
        type:    'post',
        data:    divData,
        mimeType:'multipart/form-data',
        cache:   false,
        success: function (data) { processJson(data); }
    });
}

/**
 * This function processes the returned json data array
 */
function processJson(json) {
    jq('body').removeClass('loading');
    if (!json) return false;
    if ( json.message) displayMessage(json.message);
    if ( json.extras)  eval(json.extras);
    switch (json.action) {
        case 'chart':   drawBizunoChart(json.actionData); break;
        case 'dialog':  break;
        case 'divHTML': jq('#'+json.divID).html(json.html).text();  break;
        case 'eval':    if (json.actionData) eval(json.actionData); break;
        case 'formFill':if (json.data) for (key in json.data) jq("#"+key).val(json.data[key]); break;
        case 'href':    if (json.link) window.location = json.link.replace(/&amp;/g,"&");      break;
        case 'newDiv':
            var newdiv1 = jq(json.html);
            jq('#navPopup').html(newdiv1);
            break;
        case 'window':
            var title = typeof json.title!== 'undefined' ? json.title: ' ';
            if (isMobile()) {
                var iconBack = '<span data-options="menuAlign:\'left\'" title="Back" class="easyui-linkbutton iconL-back" style="border:0;display:inline-block;vertical-align:middle;height:32px;min-width:32px;" onclick="jq.mobile.back();">&nbsp;</span></div>';
                var html     = '<header><div class="m-toolbar"><div class="m-title">'+title+'</div><div class="m-left">'+iconBack+'</div></div></header>';
                html += '<div id="navPopupBody">'+(typeof json.html !== 'undefined' ? json.html : '')+'</div>';
                jq('#navPopup').html(html);
                jq.mobile.go('#navPopup');
                if (typeof json.href !== 'undefined') {
                    jq('#navPopupBody').load(json.href, function() { jq.parser.parse('#navPopup'); } );
                }
            } else {
                var id       = typeof json.id   !== 'undefined' ? json.id : 'win'+Math.floor((Math.random() * 1000000) + 1);
                var winT     = typeof json.top  !== 'undefined' ? json.top  : 50;
                var winL     = typeof json.left !== 'undefined' ? json.left : 50;
                var winW     = Math.min(typeof json.width !== 'undefined' ? json.width : 600, jq(document).width());
                var winH     = Math.min(typeof json.height!== 'undefined' ? json.height: 400, jq(document).height());
                var wCollapse= typeof json.wCollapse !== 'undefined' ? json.wCollapse : false;
                var wMinimize= typeof json.wMinimize !== 'undefined' ? json.wMinimize : false;
                var wMaximize= typeof json.wMaximize !== 'undefined' ? json.wMaximize : false;
                var wClosable= typeof json.wClosable !== 'undefined' ? json.wClosable : true;
                if (jq('#'+id).length) {
                    jq('#'+id).window('open');
                } else {
                    var newdiv1 = jq('<div id="'+id+'" title="'+json.title+'" class="easyui-window"></div>');
                    jq('body').append(newdiv1);
                }
                jq('#'+id).window({ title:title, top:winT, left:winL, width:winW, height:winH, modal:true, closable:wClosable, collapsible:wCollapse, minimizable:wMinimize, maximizable:wMaximize });
                jq('#'+id).window('center'); // center the window
                if (typeof json.href != 'undefined') {
                    jq('#'+id).window('refresh', json.href);
                } else {
                    jq('#'+id).html(json.html);
                    jq.parser.parse('#'+id);
                }
            }
            break;
        default: // if (!json.action) alert('response had no action! Bailing...');
    }
}

/**
 * This function extracts the returned messageStack messages and displays then according to the severity
 */
function displayMessage(message) {
    var msgText = '';
    var imgIcon = '';
    // Process errors and warnings
    if (message.error) for (var i=0; i<message.error.length; i++) {
        msgText += '<span>'+message.error[i].text+'</span><br />';
        imgIcon = 'error';
    }
    if (message.warning) for (var i=0; i<message.warning.length; i++) {
        msgText += '<span>'+message.warning[i].text+'</span><br />';
        if (!imgIcon) imgIcon = 'warning';
    }
    if (message.caution) for (var i=0; i<message.caution.length; i++) {
        msgText += '<span>'+message.caution[i].text+'</span><br />';
        if (!imgIcon) imgIcon = 'warning';
    }
    if (msgText) jq.messager.alert({title:'',msg:msgText,icon:imgIcon,width:600});
    // Now process Info and Success
    if (message.info) {
        msgText = '';
        msgTitle= jq.i18n('INFORMATION');
        msgID   = Math.floor((Math.random() * 1000000) + 1); // random ID to keep boxes from stacking and crashing easyui
        for (var i=0; i<message.info.length; i++) {
            if (typeof message.info[i].title !== 'undefined') { msgTitle = message.info[i].title; }
            msgText += '<span>'+message.info[i].text+'</span><br />';
        }
        processJson( { action:'window', id:msgID, title:msgTitle, html:msgText } );
    }
    if (message.success) {
        msgText = '';
        for (var i=0; i<message.success.length; i++) {
            msgText += '<span>'+message.success[i].text+'</span><br />';
        }
        jq.messager.show({ title: jq.i18n('MESSAGE'), msg: msgText, timeout:5000, width:400, height:200 });
    }
}

function dashboardAttr(path, id) {
    var temp        = path.split(':');
    var moduleID    = temp[0];
    var dashboardID = temp[1];
    var gData = '&menuID='+menuID+'&moduleID='+moduleID+'&dashboardID='+dashboardID;
    if (id) gData += '&rID='+id; // then there was a row action
    var form = jq('#'+dashboardID+'Form');
    jq.ajax({
        type: 'POST',
        url:  bizunoAjax+'&p=bizuno/dashboard/attr'+gData,
        data: form.serialize(),
        success: function(json) { processJson(json); jq('#'+dashboardID).panel('refresh'); }
    });
    return false;
}

/**
 * This function deletes a selected dashboard from the displayed menu
 */
function dashboardDelete(obj) {
    var p = jq(obj).panel('options');
    jq.ajax({
        type: 'GET',
        url:  bizunoAjax+'&p=bizuno/dashboard/delete&menuID='+menuID+'&moduleID='+p.module_id+'&dashboardID='+p.id,
        success: function (json) { processJson(json); }
    });
    return true;
}
// ****************** Multi-submit Operations ***************************************/
function cronInit(baseID, urlID) {
    winHTML = '<p>&nbsp;</p><p style="text-align:center"><progress id="prog'+baseID+'"></progress></p><p style="text-align:center"><span id="msg'+baseID+'">&nbsp;</span></p>';
    processJson({action:'window', id:'win'+baseID, title:jq.i18n('PLEASE_WAIT'), html:winHTML, width:400, height:200});
    jq.ajax({ url:bizunoAjax+'&p='+urlID, async:false, success:cronResponse });
}

function cronRequest(baseID, urlID) {
    jq.ajax({ url:bizunoAjax+'&p='+urlID, async:false, success:cronResponse });
}

function cronResponse(json) {
    if (json.message) displayMessage(json.message);
    jq('#msg' +json.baseID).html(json.msg+' ('+json.percent+'%)');
    jq('#prog'+json.baseID).attr({ value:json.percent,max:100});
    if (json.percent < 100) {
        window.setTimeout("cronRequest('"+json.baseID+"','"+json.urlID+"')", 500);
    } else { // finished
        processJson(json);
        jq('#btn'+json.baseID).show();
        jq('#win'+json.baseID).window({title:jq.i18n('FINISHED')});
    }
}

//*********************************** General Functions *****************************************/
/**
 * Rounds a number to the proper number of decimal places for currency values
 * @returns float
 */
function bizRoundCurrency(value)
{
    var curISO  = jq('#currency').val() ? jq('#currency').val() : bizDefaults.currency.defaultCur;
    var decLen  = parseInt(bizDefaults.currency.currencies[curISO].dec_len);
    var adj     = Math.pow(10, (decLen+2));
    var newValue= parseFloat(value) + (1/adj);
    return parseFloat(newValue.toFixed(decLen));
}

/**
 * Rounds a number to the proper number of decimal places for currency values
 * @returns float
 */
function bizRoundNumber(value)
{
    var decLen= (typeof bizDefaults.locale.precision !== 'undefined') ? bizDefaults.locale.precision : 2;
    var adj     = Math.pow(10, (decLen+2));
    var newValue= parseFloat(value) + (1/adj);
    return parseFloat(newValue.toFixed(decLen));
}

function bizWindowClose(id) {
    isMobile() ? jq.mobile.back() : jq('#'+id).window('close');
}

function imgManagerInit(imgID, src, srcPath, myFolder)
{
    var noImage  = "lib/images/bizuno.png";
    var divInvImg= '';
    var divTB    = '';
    path = src==='' ? noImage : (myFolder+src);
    var viewAction  = "jq('#imdtl_"+imgID+"').window({ width:700,height:560,modal:true,title:'Image' }).window('center');";
    viewAction     += "var q = jq('#img_"+imgID+"').attr('src'); jq('#imdtl_"+imgID+"').html(jq('<img>',{id:'viewImg',src:q}));";
    viewAction     += "jq('#viewImg').click(function() { jq('#imdtl_"+imgID+"').window('close'); }).css({'max-height':'100%','max-width':'100%'});";
    var editAction  = "jsonAction('bizuno/image/manager&imgMgrPath="+srcPath+"&imgTarget="+imgID+"');";
    var trashAction = "jq('#img_"+imgID+"').attr('src','"+bizunoAjaxFS+"&src=0/"+noImage+"'); jq('#"+imgID+"').val('');";
    divInvImg      += '<div><a id="im_'+imgID+'" href="javascript:void(0)">';
    divInvImg      += '  <img type="img" width="145" src="'+bizunoAjaxFS+'&src=0/'+path+'" name="img_'+imgID+'" id="img_'+imgID+'" /></a></div><div id="imdtl_'+imgID+'"></div>';
    divTB  = '<a href="#" onClick="'+viewAction +'" class="easyui-linkbutton" title="'+jq.i18n('VIEW') +'" data-options="iconCls:\'icon-search\',plain:true"></a>';
    divTB += '<a href="#" onClick="'+editAction +'" class="easyui-linkbutton" title="'+jq.i18n('EDIT') +'" data-options="iconCls:\'icon-edit\',  plain:true"></a>';
    divTB += '<a href="#" onClick="'+trashAction+'" class="easyui-linkbutton" title="'+jq.i18n('TRASH')+'" data-options="iconCls:\'icon-trash\', plain:true"></a>';

    jq('#'+imgID).after(divInvImg);
    jq('#im_'+imgID).tooltip({ hideEvent:'none', showEvent:'click', position:'bottom', content:jq('<div></div>'),
        onUpdate: function(content) { content.panel({ width: 100, border: false, content: divTB }); },
        onShow:   function() {
            var t = jq(this);
            t.tooltip('tip').unbind().bind('mouseenter', function() { t.tooltip('show'); }).bind('mouseleave', function() { t.tooltip('hide'); });
        }
    });
}

function initGLAcct(obj) {
    if (obj.id === "") obj.id = 'tempGL';
    jq('#'+obj.id).combogrid({ data: bizDefaults.glAccounts, width: 300, panelWidth: 450, idField: 'id', textField: 'title',
        columns: [[{field:'id',title:jq.i18n('ACCOUNT'),width:60},{field:'title',title:jq.i18n('TITLE'),width:200},{field:'type',title:jq.i18n('TYPE'),width:180}]]
    });
    // jq('#'+obj.id).combogrid('showPanel'); // displays in upper left corner if instantiated inside hidden div
    jq('#'+obj.id).combogrid('resize',120);
    if (obj.id === "tempGL") obj.id = "";
}

/* ****************************** Currency Functions ****************************************/
/**
 * Sets the default numberbox currency properties, decimal point, thousands separator, prefix, suffix and decimal length
 * @param {type} iso
 * @returns {undefined}
 */
function setCurrency(iso) {
    if (typeof bizDefaults.currency.defaultCur == 'undefined') { return; } // browser cache not loaded
    jq('#currency').val(iso);
//  currency = jq('#currency').val() ? jq('#currency').val() : bizDefaults.currency.defaultCur;
    if (!bizDefaults.currency.currencies[iso]) {
        alert('Error - cannot find currency: '+iso+' to set! Bailing.');
        return;
    }
    jq.fn.numberbox.defaults.precision       = bizDefaults.currency.currencies[iso].dec_len;
    jq.fn.numberbox.defaults.decimalSeparator= bizDefaults.currency.currencies[iso].dec_pt;
    jq.fn.numberbox.defaults.groupSeparator  = bizDefaults.currency.currencies[iso].sep;
    jq.fn.numberbox.defaults.prefix          = bizDefaults.currency.currencies[iso].prefix;
    jq.fn.numberbox.defaults.suffix          = bizDefaults.currency.currencies[iso].suffix;
    if (jq.fn.numberbox.defaults.prefix) { jq.fn.numberbox.defaults.prefix = jq.fn.numberbox.defaults.prefix + ' '; }
    if (jq.fn.numberbox.defaults.suffix) { jq.fn.numberbox.defaults.suffix = ' ' + jq.fn.numberbox.defaults.suffix; }
}

function bizDgEdCurSet(id, column, newISO) {
    var opts = jq('#'+id).datagrid('getColumnOption', column);
    if (opts == null || typeof opts.editor == 'undefined') { return; }
    if (!opts.editor) { return; }
    opts.editor.options.decimalSeparator = bizDefaults.currency.currencies[newISO].dec_pt;
    opts.editor.options.groupSeparator = bizDefaults.currency.currencies[newISO].sep;
    opts.editor.options.prefix = bizDefaults.currency.currencies[newISO].prefix ? bizDefaults.currency.currencies[newISO].prefix+' ' : '';
    opts.editor.options.suffix = bizDefaults.currency.currencies[newISO].suffix ? ' '+bizDefaults.currency.currencies[newISO].suffix : '';
}


/**
 * this function takes a locale formatted currency string and formats it into a float value
 * @param string amount - Locale formatted currency value
 * @param string currency - ISO currency code to convert from
 * @return float Converted currency value
 */
function cleanCurrency(amount, currency) {
    if (typeof amount  =='undefined') { return 0; }
    if (typeof currency=='undefined') { currency = jq('#currency').val() ? jq('#currency').val() : bizDefaults.currency.defaultCur; }
    if (!bizDefaults.currency.currencies[currency]) {
        alert('Error - cannot find currency: '+currency+' to clean! Returning unformattted value!');
        return amount;
    }
    if (bizDefaults.currency.currencies[currency].prefix) amount = amount.toString().replace(bizDefaults.currency.currencies[currency].prefix, '');
    if (bizDefaults.currency.currencies[currency].suffix) amount = amount.toString().replace(bizDefaults.currency.currencies[currency].suffix, '');
    var sep   = bizDefaults.currency.currencies[currency].sep;
    var dec_pt= bizDefaults.currency.currencies[currency].dec_pt;
    amount    = amount.toString().replace(new RegExp("["+sep+"]", "g"), '');
    amount    = amount.replace(new RegExp("["+dec_pt+"]", "g"), '.');
    amount    = parseFloat(amount.replace(/[^0-9\.\-]/g, ''));
    return amount;
}

/**
 * Rounds a number to the proper number of decimal places for currency values
 * @returns float
 */
function roundCurrency(value)
{
    var curISO  = jq('#currency').val() ? jq('#currency').val() : bizDefaults.currency.defaultCur;
    var decLen  = parseInt(bizDefaults.currency.currencies[curISO].dec_len);
    var adj     = Math.pow(10, (decLen+2));
    var newValue= parseFloat(value) + (1/adj);
    var newTmp  = parseFloat(newValue.toFixed(decLen));
    return newTmp;
}

/**
 * This function formats a decimal value into the currency format specified in the form
 * @param decimal amount - decimal amount to format
 * @param boolean pfx_sfx - [default: true] determines whether or not to include the prefix and suffix, setting to false will just return number
 * @returns formatted string to ISO currency format
 */
function formatCurrency(amount, pfx_sfx, isoCur, excRate) { // convert to expected currency format
    if (typeof pfx_sfx == 'undefined') { pfx_sfx= true; }
    if (typeof isoCur  == 'undefined') { isoCur = bizDefaults.currency.defaultCur; }
    if (typeof excRate == 'undefined') { excRate = 1; }
    var curISO  = jq('#currency').val() ? jq('#currency').val() : isoCur;
    if (!bizDefaults.currency.currencies[curISO]) {
        alert('Error - cannot find currency: '+curISO+' to format! Returning unformattted value!');
        return amount;
    }
    var dec_len = parseInt(bizDefaults.currency.currencies[curISO].dec_len);
    var sep     = bizDefaults.currency.currencies[curISO].sep;
    var dec_pt  = bizDefaults.currency.currencies[curISO].dec_pt;
    var pfx     = bizDefaults.currency.currencies[curISO].prefix;
    var pfxneg  = bizDefaults.currency.currencies[curISO].pfxneg;
    var sfxneg  = bizDefaults.currency.currencies[curISO].sfxneg;
    var sfx     = bizDefaults.currency.currencies[curISO].suffix;
    if (pfx) { pfx = pfx + ' '; }
    if (sfx) { sfx = ' ' + sfx; }
    if (isNaN(pfxneg)) { pfxneg = '-'; }
    if (isNaN(sfxneg)) { sfxneg = ''; }
//alert('found currency = '+currency+' and decimal point = '+dec_pt+' and separator = '+sep);
    if (typeof dec_len === 'undefined') dec_len = 2;
    // amount needs to be a string type with thousands separator ',' and decimal point dot '.'
    var factor  = Math.pow(10, dec_len);
    var adj     = Math.pow(10, (dec_len+3)); // to fix rounding (i.e. .1499999999 rounding to 0.14 s/b 0.15)
    var wholeNum= parseFloat(amount * excRate);
    if (isNaN(wholeNum)) return amount;
    var numExpr = Math.round((wholeNum * factor) + (1/adj));
    var calcAmt = (wholeNum * factor) + (1/adj);
//if (amount) alert('original amount = '+amount+' and parsed float to '+wholeNum+' multiplied by '+factor+' and adjusted by 1/'+adj+' calculated to '+calcAmt+' which rounded to: '+numExpr);
    var negative= (numExpr < 0) ? true : false;
    numExpr     = Math.abs(numExpr);
    var decimal = (numExpr % factor).toString();
    while (decimal.length < dec_len) decimal = '0' + decimal;
    var whole   = Math.floor(numExpr / factor).toString();
    for (var i = 0; i < Math.floor((whole.length-(1+i))/3); i++) { whole = whole.substring(0,whole.length-(4*i+3)) + sep + whole.substring(whole.length-(4*i+3)); }
    var output = dec_len > 0 ? whole+dec_pt+decimal : whole;
    if (negative) { output = pfxneg+output+sfxneg; }
    if (pfx_sfx)  { output = pfx+output+sfx; }
    return output;
}

function formatPrecise(amount) { // convert to expected currency format with the additional precision
    currency = jq('#currency').val() ? jq('#currency').val() : bizDefaults.currency.defaultCur;
    if (!bizDefaults.currency.currencies[currency]) {
        alert('Error - cannot find currency: '+currency+' to format precise! Returning unformattted value!');
        return amount;
    }
    var sep   = bizDefaults.currency.currencies[currency].sep;
    var dec_pt= bizDefaults.currency.currencies[currency].dec_pt;
    var decimal_precise = bizDefaults.locale.precision;
    if (typeof decimal_precise === 'undefined') decimal_precise = 4;
    // amount needs to be a string type with thousands separator ',' and decimal point dot '.'
    var factor  = Math.pow(10, decimal_precise);
    var adj     = Math.pow(10, (decimal_precise+2)); // to fix rounding (i.e. .1499999999 rounding to 0.14 s/b 0.15)
    var numExpr = parseFloat(amount);
    if (isNaN(numExpr)) return amount;
    numExpr     = Math.round((numExpr * factor) + (1/adj));
    var minus   = (numExpr < 0) ? '-' : '';
    numExpr     = Math.abs(numExpr);
    var decimal = (numExpr % factor).toString();
    while (decimal.length < decimal_precise) decimal = '0' + decimal;
    var whole   = Math.floor(numExpr / factor).toString();
    for (var i = 0; i < Math.floor((whole.length-(1+i))/3); i++)
        whole = whole.substring(0,whole.length-(4*i+3)) + sep + whole.substring(whole.length-(4*i+3));
    if (decimal_precise > 0) return minus + whole + dec_pt + decimal;
    return minus + whole;
}

/**
 *
 * This function takes a value and converts it from one ISO to another
 * @param float value - Value to convert
 * @param string destISO - destination ISO to convert to
 * @param string sourceISO - [default bizDefaults.currency.defaultCur] ISO code to use to convert from
 * @returns float - converted to destISO code
 */
function convertCurrency(value, destISO, sourceISO) {
    var defaultISO = bizDefaults.currency.defaultCur;
    if (typeof sourceISO == 'undefined') sourceISO = bizDefaults.currency.defaultCur;
    if (!bizDefaults.currency.currencies[sourceISO]) {
        alert('Error - cannot find source currency to format! Returning unformattted value!');
        return value;
    }
    if (!bizDefaults.currency.currencies[destISO]) {
        alert('Error - cannot find destination currency to format! Returning unformattted value!');
        return value;
    }
    var srcVal = parseFloat(value);
    if (isNaN(srcVal)) {
        alert('Error - the value submitted is not a number! Returning unformattted value!');
        return value;
    }
    if (sourceISO != defaultISO) srcVal = srcVal * parseFloat(bizDefaults.currency.currencies[sourceISO].value); // convert to defaultISO
    if (parseFloat(bizDefaults.currency.currencies[destISO].value) == 0) {
        alert('currenct exchange rate is zero! This should not happen.');
        return value;
    }
    newValue = srcVal != 0 ? srcVal / parseFloat(bizDefaults.currency.currencies[destISO].value) : 0; // convert to destISO
    return newValue;
}

/******************************* Number Functions ****************************************
 * This function takes a locale formatted number string and formats it into a float value
 * @param string amount - Locale formatted value
 * @return float Converted value
 */
function cleanNumber(amount) {
    if (typeof amount == 'undefined') return 0;
    var sep = bizDefaults.locale.thousand;
    amount = amount.toString().replace(new RegExp("["+sep+"]", "g"), '');
    var dec = bizDefaults.locale.decimal;
    amount = parseFloat(amount.replace(new RegExp("["+dec+"]", "g"), '.'));
    return amount;
}

function formatNumber(amount) {
    var dec_len= (typeof bizDefaults.locale.precision !== 'undefined') ? bizDefaults.locale.precision : 2;
    var sep    = (typeof bizDefaults.locale.thousand  !== 'undefined') ? bizDefaults.locale.thousand  : '.';
    var dec_pt = (typeof bizDefaults.locale.decimal   !== 'undefined') ? bizDefaults.locale.decimal   : ',';
    var pfx    = (typeof bizDefaults.locale.prefix    !== 'undefined') ? bizDefaults.locale.prefix    : '';
    var sfx    = (typeof bizDefaults.locale.suffix    !== 'undefined') ? bizDefaults.locale.suffix    : '';
    var negpfx = (typeof bizDefaults.locale.neg_pfx   !== 'undefined') ? bizDefaults.locale.neg_pfx   : '-';
    var negsfx = (typeof bizDefaults.locale.neg_sfx   !== 'undefined') ? bizDefaults.locale.neg_sfx   : '';
    var is_negative = false;
//alert('found decimal point = '+dec_pt+' and seprator = '+sep);
    if (typeof dec_len === 'undefined') dec_len = 2;
    // amount needs to be a string type with thousands separator ',' and decimal point dot '.'
    var factor  = Math.pow(10, dec_len);
    var adj     = Math.pow(10, (dec_len+2)); // to fix rounding (i.e. .1499999999 rounding to 0.14 s/b 0.15)
    var numExpr = parseFloat(amount);
    if (isNaN(numExpr)) return amount;
    if (numExpr < 0) is_negative = true;
    numExpr     = Math.round((numExpr * factor) + (1/adj));
    numExpr     = Math.abs(numExpr);
    var decimal = (numExpr % factor).toString();
    while (decimal.length < dec_len) decimal = '0' + decimal;
    var whole   = Math.floor(numExpr / factor).toString();
    for (var i = 0; i < Math.floor((whole.length-(1+i))/3); i++)
        whole = whole.substring(0,whole.length-(4*i+3)) + sep + whole.substring(whole.length-(4*i+3));
    if (is_negative) {
        if (dec_len > 0) return negpfx + whole + dec_pt + decimal + negsfx;
        return negpfx + whole + negsfx;
    }
    if (dec_len > 0) return pfx + whole + dec_pt + decimal + sfx;
    return pfx + whole + sfx;
}

/******************************* Date Functions ****************************************
 * Formats a database date (YYYY-MM-DD) date to local format, the datebox calls this to format the date
 * @todo broken needs to take into account UTC, returns a day earlier
 * @param str - db date in string format YYYY-MM-DD
 * @returns formatted date by users locale definition
 */
function formatDate(str) {
    var output = bizDefaults.calendar.format;
    if (typeof str !== 'string' || typeof sDate === 'object') { // easyui date formatter, or full ISO date
        var objDate = new Date(str);
        var Y = objDate.getFullYear();
        var m = ("0" + (objDate.getMonth() + 1)).slice(-2);
        var d = ("0" + objDate.getDate()).slice(-2);
    } else {
        var Y = str.substr(0,4);
        var m = str.substr(5,2);
        var d = str.substr(8,2);
    }
    output = output.replace("Y", Y);
    output = output.replace("m", m);
    output = output.replace("d", d);
//    alert('started with date = '+str+' and ended with = '+output);
    return output;
}

/**
 * Convert the users locale date to db format to use with Date() object
 * @returns integer
 */
function dbDate(str) {
    var fmt  = bizDefaults.calendar.format;
    var delim= bizDefaults.calendar.delimiter;
    var parts= fmt.split(delim);
    var src  = str.split(delim);
    for (var i=0; i < parts.length; i++) {
        if (parts[i] == 'Y') { var Y = src[i]; }
        if (parts[i] == 'm') { var m = src[i]; }
        if (parts[i] == 'd') { var d = src[i]; }
    }
    return Y+'-'+m+'-'+d;
}

/**
 *
 * @param {type} ref
 * @returns integer, -1 if less, 0 if equal, 1 if greater
 */
function compareDate(ref) {
    var d1 = new Date(ref);
    var d2 = new Date();
    if (d1 < d2) return -1;
    if (d1 > d2)  return 1;
    return 0;
}

function bizCheckBox(id) {
    jq('#'+id).switchbutton('check');
}

function bizUncheckBox(id) {
    jq('#'+id).switchbutton('uncheck');
}

/**
 * returns status of the checkbox, true if a checkbox is checked, false otherwise
 * @param string id - DOM element ID
 * @returns boolean
 */
function bizCheckBoxGet(id) {
    if (jq("#"+id).hasClass( "easyui-switchbutton" )) {
        return jq('#'+id).switchbutton('options').checked;
    } else if (jq('#closed').is(':checkbox')) {
        return jq('#closed').is(':checked');
    }
    return parseFloat(jq('#closed').val());
}

function bizDateSet(id, val) {
    if (!jq('#'+id).datebox({})) { }
    jq('#'+id).datebox('setValue', val);
}

// Retrieves the curent index of the selected row (edited) of a datagrid
function bizDGgetIndex(id) {
    var idx = null;
    var row = jq('#'+id).datagrid('getSelected');
    if (row) { idx = jq('#'+id).datagrid('getRowIndex', row); }
    return idx;
}

function bizFocus(id, dgID) {
    if (!jq('#'+id).textbox({})) { }
    jq('#'+id).textbox('textbox').focus();
    if (typeof dgID == 'string') {
        jq('#'+dgID+'Toolbar input').keypress(function (e) { if (e.keyCode == 13) { window[dgID+'Reload'](); } });
    }
}

/**
 * Returns the row data from the selected row of a datagrid from the action bar
 * @param {string} id - DOM id of the element to get data from
 * @returns row data object
 */
function bizGridGetRow(id) {
    var rowIndex= jq('#'+id).datagrid('getRowIndex', jq('#'+id).datagrid('getSelected'));
    var rowData = jq('#dgJournalItem').datagrid('getData');
    if (typeof rowData.rows[rowIndex] == 'undefined') { return; }
    return rowData.rows[rowIndex];
}

/**
 * @todo DEPRECATED use bizSelSet instead.
 */
function bizGridSet(id, val) {
    if (!jq('#'+id).combogrid({})) { alert('not ready'); return; }
    jq('#'+id).combogrid('setValue', val);
}

function bizGridEdSet(id, idx, fld, val) {
    var ed = jq('#'+id).datagrid('getEditor', {index:idx, field:fld});
    if (ed) jq(ed.target).combogrid('setValue', val);
}

/**
 * Tests the window width and if it is small, removes the labels fromthe buttons (i.e. short format))
 */
function bizMenuResize() {
//    alert('window width = '+jq(window).width());
    if (jq(window).width() < 1200) {
        jq('div[id=rootMenu]').children('.easyui-splitbutton').each(function() {
            jq('#'+this.id).splitbutton({text:''});
        });
    }
}

/**
 * Pulls numeric value from a numberbox
 * CAUTION: DO NOT USE FOR TEXTBOXES DISPLAYING CURRENCIES AS IT WILL ERASE THE VALUE!
 */
function bizNumGet(id) {
    if (!jq('#'+id).numberbox({})) { }
    return parseFloat(jq('#'+id).numberbox('getValue'));
}


function bizNumSet(id, val) {
    if (!jq('#'+id).hasClass("easyui-numberbox")) {
        if (jq('#'+id)) { jq('#'+id).val(val); } // hidden or not a easyUI widget
        return;
    }
    if (!jq('#'+id).numberbox({})) { }
    jq('#'+id).numberbox('setValue', val);
}

function bizNumEdGet(id, idx, fld) {
    var ed = jq('#'+id).edatagrid('getEditor', {index:idx,field:fld});
    if (ed) { var val = parseFloat(ed.target.val()); }
    else    { var val = parseFloat(jq('#'+id).edatagrid('getRows')[idx][fld]); } // no editor try just to get value
    return isNaN(val) ? 0 : val;
}

function bizNumEdSet(id, idx, fld, amount) {
    if (isNaN(amount)) { return; }
    if (typeof idx == 'undefined') { return; }
    var ed = jq('#'+id).edatagrid('getEditor', {index:idx,field:fld});
    if (ed) { jq(ed.target).numberbox('setValue', amount); }
    jq('#'+id).edatagrid('getRows')[idx][fld] = amount; // needs to set iregardless of editor (i.e. when editors are hidden)
}

function bizSelGet(id) {
    if (jq("#"+id).hasClass( "easyui-combobox" )) {
        return jq('#'+id).combobox('getValue');
    } else if (jq("#"+id).hasClass( "easyui-combogrid" )) {
        return jq('#'+id).combogrid('getValue');
    }
    if (!jq('#'+id).combo({})) { }
    return jq('#'+id).combo('getValue');
}

function bizSelSet(id, val, fmt) {
    if (!jq('#'+id).combo({})) { return; }
    switch (fmt) {
        case 'number':   val = formatNumber(val);   break;
        case 'currency': val = formatCurrency(val); break;
        default:
        case 'raw': // nothing just display as is
    }
    if (jq('#'+id).hasClass("easyui-combobox")) {
        jq('#'+id).combobox('setValue', val);
    } else if (jq("#"+id).hasClass("easyui-combogrid")) {
        jq('#'+id).combogrid('setValue', val);
    } else {
        jq('#'+id).combo('setValue', val);
    }
}

function bizSelEdSet(id, idx, fld, val) {
    if (typeof idx == 'undefined') { return; }
    var ed = jq('#'+id).edatagrid('getEditor', {index:idx,field:fld});
    if (ed) { jq(ed.target).combogrid('setValue', val); }
    jq('#'+id).edatagrid('getRows')[idx][fld] = val; // needs to set iregardless of editor (i.e. when editors are hidden)
}

function bizStartDnD(id) {
    jq('#'+id).datagrid('enableDnd');
}

function bizStopDnD(id) {
    jq('#'+id).datagrid('disableDnd');
}

function bizTextGet(id) {
    if (!jq('#'+id).textbox({})) { alert('not ready'); return; }
    return jq('#'+id).textbox('getValue');
}

function bizTextSet(id, txt, fmt) {
    if (!jq('#'+id).hasClass("easyui-textbox")) {
        if (jq('#'+id)) { jq('#'+id).val(txt); } // hidden or not a easyUI widget
        return;
    }
    if (!jq('#'+id).textbox({})) { alert('not ready'); return; }
    switch (fmt) {
        case 'number':   txt = formatNumber(txt);   break;
        case 'currency': txt = formatCurrency(txt); break;
        default:
        case 'raw': // nothing just display as is
    }
    jq('#'+id).textbox('setValue', txt);
}

function bizTextEdSet(id, idx, fld, txt) {
//  alert('setting fields for id = '+id+' and index = '+idx+' field = '+fld+' and text = '+txt);
    var ed = jq('#'+id).edatagrid('getEditor', {index:idx,field:fld});
    if (ed) { ed.target.val(txt); }
    jq('#'+id).edatagrid('getRows')[idx][fld] = txt; // needs to set iregardless of editor (i.e. when editors are hidden)
}

// pulls the text value from a select element given the id value
function getTextValue(arrList, index) {
    if (index === 'undefined') return '';
    if (!arrList.length) return index;
    for (var i in arrList) { if (arrList[i].id == index) return arrList[i].text; } // must use == NOT === or doesn't work
    return index;
}

function tinymceInit(fldID) {
    if (typeof tinymce == 'undefined') return;
    tinymce.init({
        selector:'textarea#'+fldID,
        height: 400,
        width: 600,
        plugins: [
        'advlist autolink lists link image charmap print preview anchor',
        'searchreplace visualblocks code fullscreen',
        'insertdatetime media table contextmenu paste code'],
        setup: function (editor) { editor.on('change', function () { editor.save(); }); }
    });
}

function encryptChange() {
    var gets = "&orig="+jq("#encrypt_key_orig").val()+"&new=" +jq("#encrypt_key_new").val()+"&dup=" +jq("#encrypt_key_dup").val();
    jq.ajax({
        url: bizunoAjax+'&p=bizuno/tools/encryptionChange'+gets,
        success: function(json) {
            processJson(json);
            jq("#encrypt_key_orig").val('');
            jq("#encrypt_key_new").val('');
            jq("#encrypt_key_dup").val('');
        }
    });
}

function makeRequest(url) { jq.ajax({ url: url, success: server_response }); }
function server_response(json) {
    processJson(json);
  jq('progress').attr({value:json.percent,max:100});
  jq('#pl').html(json.pl);
  jq('#pq').html(json.pq);
  jq('#ps').html(json.ps);
  if (json.percent == '100') {
      jq("#divRestoreCancel").toggle('slow');
      jq("#divRestoreFinish").toggle('slow');
  } else {
    if (restoreCancel == 'cancel') {
      jq("#divRestoreCancel").toggle('slow');
    } else {
      url_request = bizunoAjax+"&p=bizuno/main/restoreAjax&start="+json.linenumber+"&fn="+json.fn+"&foffset="+json.foffset+"&totalqueries="+json.totalqueries;
      window.setTimeout("makeRequest(url_request)",500);
    }
  }
}

// *********************************** Contact Functions *****************************************/
function crmDetail(rID, suffix) {
    jq.ajax({
        url:bizunoAjax+'&p=contacts/main/details&rID='+rID,
        success: function(json) {
            processJson(json);
            jq('#id'+suffix).val(json.contact.id); // hidden, no class formatting
            jq('#terms'+suffix).val(json.contact.terms);
            bizTextSet('short_name'    +suffix, json.contact.short_name);
            bizTextSet('contact_first' +suffix, json.contact.contact_first);
            bizTextSet('contact_last'  +suffix, json.contact.contact_last);
            bizTextSet('flex_field_1'  +suffix, json.contact.flex_field_1);
            bizTextSet('account_number'+suffix, json.contact.account_number);
            bizTextSet('gov_id_number' +suffix, json.contact.gov_id_number);
            bizTextSet('terms'+suffix+'_text', json.contact.terms_text);
            for (var i = 0; i < json.address.length; i++) if (json.address[i].type === 'm') addressFill(json.address[i], suffix);
        }
    });
}

function addressFill(address, suffix) {
    for (key in address) {
        bizTextSet(key+suffix, address[key]);
        if (key == 'country') { jq('#country'+suffix).combogrid('setValue', address[key]); }
    }
    jq('#contact_id'+suffix).val(address['ref_id']);
}

function clearAddress(suffix) {
    jq('#address'+suffix).find('input, select').each(function(){
        jq(this).val('').attr('checked',false).css({color:'#000000'}).blur();
    });
    jq('#country'+suffix).combogrid('setValue',bizDefaults.country.iso).combogrid('setText', bizDefaults.country.title);
}

function addressClear(suffix) {
    jq.each(addressFields, function (index, value) { bizTextSet(value+suffix, ''); });
    if (suffix != '_s') { jq('#addressDiv'+suffix).hide(); }
    jq('#country'+suffix).combogrid('setValue', bizDefaults.country.iso).combogrid('setText', bizDefaults.country.title);
}

function addressCopy(fromSuffix, toSuffix) {
    jq.each(addressFields, function (index, value) { if (jq('#'+value+fromSuffix).length) bizTextSet(value+toSuffix, bizTextGet(value+fromSuffix)); });
    jq('#country'+toSuffix).combogrid('setValue', jq('#country'+fromSuffix).combogrid('getValue'));
    // Clear the ID's so Add/Updates don't erase the source record
    bizTextSet('id'+toSuffix, '');
    bizTextSet('address_id'+toSuffix, '');
  }

function shippingValidate(suffix) {
    var temp = {};
    jq('#address'+suffix+' input').each(function() {
        var labelText = jq(this).prev().html();
        if (jq(this).val() != labelText) {
            fld = jq(this).attr('id');
            if (typeof fld != 'undefined') {
                fld = fld.slice(0, - suffix.length);
                temp[fld] = jq(this).val();
            }
        }
    });
    temp['country']    = jq('#country'+suffix).combobox('getValue');
    temp['method_code']= jq('#method_code').val();
    temp['suffix']     = suffix;
    var ship = encodeURIComponent(JSON.stringify(temp));
    jsonAction('extShipping/address/validateAddress', 0, ship);
}

//*********************************** Chart functions *****************************************/
jq.cachedScript('https://www.gstatic.com/charts/loader.js');
function drawBizunoChart(json) {
    var divWidth = parseInt(jq('#'+json.divID).width());
    var divHeight= parseInt(divWidth * 3 / 4);
    var data     = google.visualization.arrayToDataTable(json.data);
    var options  = {width:divWidth,height:divHeight};
    for (var idx in json.attr) { options[idx] = json.attr[idx]; }
    switch (json.type) {
        default:
        case 'pie':   var chart = new google.visualization.PieChart(document.getElementById(json.divID));   break;
        case 'bar':   var chart = new google.visualization.BarChart(document.getElementById(json.divID));   break;
        case 'column':var chart = new google.visualization.ColumnChart(document.getElementById(json.divID));break;
        case 'guage': var chart = new google.visualization.Guage(document.getElementById(json.divID));      break;
        case 'line':  var chart = new google.visualization.LineChart(document.getElementById(json.divID));  break;
    }
    chart.draw(data, options);
}

/******************* PHREEBOOKS MODULE *********************/
// Javascipt functions to handle operations specific to the PhreeBooks module

/**
 * Sets the referrer to apply a credit from the manager
 * @param {integer} jID - Journal ID of the row
 * @param {integer} cID - Contact ID of the row
 * @param {integer} iID - Record ID of the row
 * @returns NULL
 */
function setCrJournal(jID, cID, iID) {
//    alert('received jID = '+jID+' and cID = '+cID+' and iID = '+iID);
    switch (jID) {
        case  6: jDest = 7;  break;
        default:
        case 12: jDest = 13; break;
    }
    journalEdit(jDest, 0, cID, 'inv', 'journal:'+jID, iID);
}

/**
 * Sets the referrer to apply a payment from the manager
 * @param {integer} jID - Journal ID of the row
 * @param {integer} cID - Contact ID of the row
 * @param {integer} iID - Record ID of the row
 * @returns NULL
 */

function setPmtJournal(jID, cID, iID) {
//    alert('received jID = '+jID+' and cID = '+cID+' and iID = '+iID);
    switch (jID) {
        case  6: jDest = 20; break;
        case  7: jDest = 17; break;
        default:
        case 12: jDest = 18; break;
        case 13: jDest = 22; break;
    }
    journalEdit(jDest, 0, cID, 'inv', 'journal:'+jID, iID);
}

function journalEdit(jID, rID, cID, action, xAction, iID) {
    if (typeof cID    == 'undefined') cID    = 0;
    if (typeof iID    == 'undefined') iID    = 0;
    if (typeof action == 'undefined') action = '';
    if (typeof xAction== 'undefined') xAction= '';
//alert('jID = '+jID+' and rID = '+rID+'and cID = '+cID+' and action = '+action+' and xAction = '+xAction);
    var xVars = '&jID='+jID+'&rID='+rID;
    if (cID) xVars += '&cID='+cID;
    if (iID) xVars += '&iID='+iID;
    if (action) xVars  += '&bizAction='+action;
    if (xAction) xVars += '&xAction='+xAction;
    var title = jq('#j'+jID+'_mgr').text();
    document.title = title;
    var p = jq('#accJournal').accordion('getPanel', 1);
    if (p) {
        p.panel('setTitle',title);
        jq('#dgPhreeBooks').datagrid('loaded');
        jq('#divJournalDetail').panel({href:bizunoAjax+'&p=phreebooks/main/edit'+xVars});
        jq('#accJournal').accordion('select', title);
    }
}

function phreebooksSelectAll() {
    var rowData= jq('#dgJournalItem').datagrid('getData');
    for (var rowIndex=0; rowIndex<rowData.total; rowIndex++) {
        var val  = parseFloat(rowData.rows[rowIndex].bal);
        var price= parseFloat(rowData.rows[rowIndex].price);
        if (isNaN(val)) {
            rowData.rows[rowIndex].qty = '';
        } else {
            rowData.rows[rowIndex].qty = val;
            rowData.rows[rowIndex].total = val * price;
        }
    }
    jq('#dgJournalItem').datagrid('loadData', rowData);
}

/**
 * This function either makes a copy of an existing SO/Invoice to the quote journal OR
 * saves to a journal other than the one the current form is set to.
 */
function saveAction(action, newJID) {
    var jID = jq('#journal_id').val();
    var partialInProgress = false;
    if (jq('#id').val()) { // if partially filled, deny save
        var rowData = jq('#dgJournalItem').edatagrid('getData');
        for (var rowIndex=0; rowIndex<rowData.total; rowIndex++) {
            var bal = parseFloat(rowData.rows[rowIndex].bal);
            if (bal) partialInProgress = true;
            if (action == 'saveAs') {
                jq('#dgJournalItem').edatagrid('getRows')[rowIndex]['id'] = 0;
                jq('#dgJournalItem').edatagrid('getRows')[rowIndex]['reconciled'] = 0;
            } // need to create new record
        }
    }
    if (partialInProgress) return alert(jq.i18n('PB_SAVE_AS_LINKED'));
    if (parseFloat(jq('#so_po_ref_id').val()) || parseFloat(jq('#recur_id').val('')) || parseFloat(jq('#recur_frequency').val(''))) {
        return alert(jq.i18n('PB_SAVE_AS_LINKED'));
    }
    if (bizCheckBoxGet('closed')) return alert(jq.i18n('PB_SAVE_AS_CLOSED'));
    if ((jID=='3' || jID=='4' || jID=='6') && (newJID=='3' || newJID=='4' || newJID=='6')) {
        jq('#journal_id').val(newJID);
        bizTextSet('invoice_num', ''); // force the next ref ID from current_status for the journal saved/moved to
    } else if ((jID=='9' || jID=='10' || jID=='12') && (newJID=='9' || newJID=='10' || newJID=='12')) {
        if (newJID=='12') { jq('#waiting').val('1'); } // force the unshipped flag to be set
        jq('#journal_id').val(newJID);
        bizTextSet('invoice_num', ''); // force the next ref ID from current_status for the journal saved/moved to
    } else if (newJID=='2') {
        jq('#journal_id').val(newJID);
    } else alert('Invalid call to Save As...!');
    if (action == 'saveAs') {
        jq('#id').val('0'); // make sure this is posted as a new record
        for (var i=0; i < totalsMethods.length; i++) { // clear the id field for each total method
            var tName = totalsMethods[i];
            jq('#totals_'+tName+'_id').val('0');
        }
    }
    // clear the waiting flag for the following:
    if (newJID=='2' || newJID=='3' || newJID=='4' || newJID=='9' || newJID=='10') { jq('#waiting').val('0'); }
    jq('#frmJournal').submit();
}

/************************** general ledger ********************************************************/
function setPointer(glAcct, debit, credit) {
    var found = false;
    var arrow = '';
    for (var i=0; i < bizDefaults.glAccounts.rows.length; i++) {
        if (bizDefaults.glAccounts.rows[i]['id'] == glAcct) {
            found = true;
            if (debit  &&  bizDefaults.glAccounts.rows[i]['asset']) arrow = 'inc';
            if (debit  && !bizDefaults.glAccounts.rows[i]['asset']) arrow = 'dec';
            if (credit &&  bizDefaults.glAccounts.rows[i]['asset']) arrow = 'dec';
            if (credit && !bizDefaults.glAccounts.rows[i]['asset']) arrow = 'inc';
            break;
        }
    }
    incdec = '';
    if (found && arrow=='inc')      { incdec = String.fromCharCode(8679)+' '+jq.i18n('PB_GL_ASSET_INC'); }
    else if (found && arrow=='dec') { incdec = String.fromCharCode(8681)+' '+jq.i18n('PB_GL_ASSET_DEC'); }
    var notesEditor = jq('#dgJournalItem').datagrid('getEditor', {index:curIndex,field:'notes'});
    jq(notesEditor.target).val(incdec);
}

function glEditing(rowIndex) {
    curIndex = rowIndex;
    jq('#dgJournalItem').edatagrid('getRows')[rowIndex]['qty'] = 1;
    var glEditor = jq('#dgJournalItem').datagrid('getEditor', {index:rowIndex,field:'gl_account'});
    jq(glEditor.target).combogrid('attachEvent', { event: 'onSelect', handler: function(idx,row){ glCalc('gl', row.id); } });
}

function glCalc(action, glAcct) {
    var glEditor    = jq('#dgJournalItem').datagrid('getEditor', {index:curIndex,field:'gl_account'});
    var descEditor  = jq('#dgJournalItem').datagrid('getEditor', {index:curIndex,field:'description'});
    var debitEditor = jq('#dgJournalItem').datagrid('getEditor', {index:curIndex,field:'debit_amount'});
    var creditEditor= jq('#dgJournalItem').datagrid('getEditor', {index:curIndex,field:'credit_amount'});
    if (!glEditor || !debitEditor || !creditEditor) return; // all editors are not active
    if (typeof glAcct != 'undefined') {
        if (glAcct != jq('#dgJournalItem').edatagrid('getRows')[curIndex]['gl_account']) {
            jq('#dgJournalItem').edatagrid('getRows')[curIndex]['gl_account'] = glAcct;
            jq(glEditor.target).combogrid('setValue', glAcct);
        }
    } else {
        glAcct  = jq(glEditor.target).combogrid('getValue');
    }
    var newDesc = jq(descEditor.target).val();
    var newDebit= debitEditor.target.val();
    if (isNaN(newDebit))  newDebit = 0;
    var newCredit= creditEditor.target.val();
    if (isNaN(newCredit)) newCredit = 0;
//  alert('glCalc action = '+action+' and glAcct = '+glAcct+' and newDebit = '+newDebit+' and newCredit = '+newCredit);
    if (!glAcct && !newDebit && !newCredit) return; // empty row
    switch (action) {
    default:
        case 'gl': return setPointer(glAcct, newDebit, newCredit);
        case 'debit':
            bizNumEdSet('dgJournalItem', curIndex, 'debit_amount',  newDebit);
            if (newDebit != 0) {
                newCredit = 0;
                bizNumEdSet('dgJournalItem', curIndex, 'credit_amount', 0);
            }
            break;
        case 'credit':
            bizNumEdSet('dgJournalItem', curIndex, 'credit_amount', newCredit);
            if (newCredit != 0) {
                newDebit = 0;
                bizNumEdSet('dgJournalItem', curIndex, 'debit_amount', 0);
            }
            break;
    }
    setPointer(glAcct, newDebit, newCredit);
    totalUpdate();
    if (rowAutoAdd && jq('#dgJournalItem').edatagrid('getRows').length == (curIndex+1)) { // auto add new row
        rowAutoAdd = false; // disable auto add to prevent infinite loop
        jq('#dgJournalItem').edatagrid('addRow');
        bizNumEdSet('dgJournalItem', curIndex, 'debit_amount',  newCredit);
        bizNumEdSet('dgJournalItem', curIndex, 'credit_amount', newDebit);
        var descEditor  = jq('#dgJournalItem').datagrid('getEditor', {index:curIndex,field:'description'});
        jq(descEditor.target).val(newDesc);
    }
}

function totalsCurrency(newISO, oldISO) {
    bizNumSet('currency_rate', bizDefaults.currency.currencies[newISO].value);
    var len = parseInt(bizDefaults.currency.currencies[newISO].dec_len);
    var sep = bizDefaults.currency.currencies[newISO].sep;
    var dec = bizDefaults.currency.currencies[newISO].dec_pt;
    var rate= bizDefaults.currency.currencies[newISO].value / bizDefaults.currency.currencies[oldISO].value;
    var pfx = bizDefaults.currency.currencies[newISO].prefix ? bizDefaults.currency.currencies[newISO].prefix+' ' : '';
    var sfx = bizDefaults.currency.currencies[newISO].suffix ? ' '+bizDefaults.currency.currencies[newISO].suffix : '';
    // convert the totals fields
    var fldsTotals = ['totals_subtotal','totals_debit','totals_credit','total_balance','totals_balanceBeg','totals_balanceEnd',
        'totals_discount','totals_tax_other','totals_tax_order','totals_tax_item','totals_fee_order','freight','total_amount'];
    for (var i=0; i<fldsTotals.length; i++) {
        if (jq('#'+fldsTotals[i])) {
            jq('#'+fldsTotals[i]).numberbox({decimalSeparator:dec,groupSeparator:sep,precision:len,prefix:pfx,suffix:sfx});
            bizNumSet(fldsTotals[i], jq('#'+fldsTotals[i]).val() * rate);
        }
    }
    // Fix the item table
    dgFields = ['amount','price','discount','total','debit_amount','credit_amount'];
    for (var i=0; i<dgFields.length; i++) { bizDgEdCurSet('dgJournalItem', dgFields[i], newISO); }
    var rowData = jq('#dgJournalItem').edatagrid('getData');
    for (var rowIndex=0; rowIndex<rowData.total; rowIndex++) {
        for (var i=0; i < dgFields.length; i++) {
            newVal = rowData.rows[rowIndex][dgFields[i]] * rate;
            if (isNaN(newVal)) newVal = 0;
            jq('#dgJournalItem').edatagrid('getRows')[rowIndex][dgFields[i]] = newVal;
            var ed = jq('#dgJournalItem').datagrid('getEditor', {index:rowIndex,field:dgFields[i]});
            if (ed) {
                jq(ed.target).numberbox( {decimalSeparator:dec,groupSeparator:sep,precision:len,prefix:pfx,suffix:sfx});
                bizNumEdSet('dgJournalItem', curIndex, dgFields[i], newVal);
            }
        }
        jq('#dgJournalItem').datagrid('refreshRow', rowIndex);
    }
}

/**************************** datagrid support **************************************/
function setFields(rowIndex) {
    bizNumEdSet('dgJournalItem', rowIndex, 'qty', 1);
    bizSelEdSet('dgJournalItem', rowIndex, 'gl_account',  def_contact_gl_acct);
    bizSelEdSet('dgJournalItem', rowIndex, 'tax_rate_id', def_contact_tax_id);
}

/**************************** orders ******************************************************/
function contactsDetail(rID, suffix, fill) {
    jq.ajax({
        url:     bizunoAjax+'&p=contacts/main/details&rID='+rID+'&suffix='+suffix+'&fill='+fill,
        success: function(json) {
            processJson(json);
            if (suffix=='_b') {
                jq('#terms').val(json.contact.terms);
                bizTextSet('terms_text', json.contact.terms_text);
                if (bizDefaults.phreebooks.journalID == 6) { bizDateSet('terminal_date', formatDate(json.contact.terminal_date)); }
                jq('#spanContactProps'+suffix).show();
                if (json.contact.rep_id != 0) { bizSelSet('rep_id', json.contact.rep_id); }
                def_contact_gl_acct = json.contact.gl_account;
                def_contact_tax_id  = json.contact.tax_rate_id < 0 ? 0 : json.contact.tax_rate_id;
                bizSelEdSet('dgJournalItem', curIndex, 'gl_account',  def_contact_gl_acct);
                bizSelEdSet('dgJournalItem', curIndex, 'tax_rate_id', def_contact_tax_id);
                bizSelSet('tax_rate_id', def_contact_tax_id); // set the order level default tax rate
            }
            for (var i = 0; i < json.address.length; i++) { // pull the main address record
                if (json.address[i].type == 'm') addressFill(json.address[i], json.suffix);
            }
            var tmp = new Array();
            jq.each(json.address, function () { if (this.type=='m' || this.type=='b') tmp.push(this); });
            jq('#addressSel'+suffix).combogrid({ data: tmp });
            jq('#addressDiv'+suffix).show();
            bizUncheckBox('AddUpdate'+suffix);
            if (fill == 'both' || suffix=='_s') {
                var tmp = new Array();
                jq.each(json.address, function () {
                    if (this.type=='m') this.address_id = ''; // prevents overriding billing address if selected and add/update checked
                    if (this.type=='m' || this.type=='s') tmp.push(this);
                });
                jq('#addressSel_s').combogrid({ data: tmp });
                jq('#addressDiv_s').show();
            }
            if (suffix=='_b' && json.showStatus=='1') jsonAction('phreebooks/main/detailStatus', json.contact.id);
        }
    });
}

function orderFill(data, type) {
    var gl_account= '';
    var qtyEditor = jq('#dgJournalItem').datagrid('getEditor', {index:curIndex,field:'qty'});
    var skuEditor = jq('#dgJournalItem').datagrid('getEditor', {index:curIndex,field:'sku'});
    var descEditor= jq('#dgJournalItem').datagrid('getEditor', {index:curIndex,field:'description'});
    var glEditor  = jq('#dgJournalItem').datagrid('getEditor', {index:curIndex,field:'gl_account'});
    var taxEditor = jq('#dgJournalItem').datagrid('getEditor', {index:curIndex,field:'tax_rate_id'});
    var qty       = jq(qtyEditor.target).numberbox('getValue'); //handles formatted values
    if (!qty) qty = 1;
    switch (bizDefaults.phreebooks.journalID) {
        case  3:
        case  4:
        case  6:
        case  7: gl_account = data.gl_inv;  break;
        default: gl_account = data.gl_sales;break;
    }
    var def_tax_id = type=='v' ? data.tax_rate_id_v : data.tax_rate_id_c;
    if (def_tax_id == '-1') def_tax_id = def_contact_tax_id;
    var adjDesc  = type=='v' ? data.description_purchase : data.description_sales;
    // adjust for invVendors extension
    if (typeof(data.invVendors) != 'undefined' && data.invVendors) {
        var cID = jq('#contact_id_b').val();
        if (cID) {
            invVendors = JSON.parse(data.invVendors);
            for (var i=0; i<invVendors.length; i++) {
                if (invVendors[i].id == cID) {
                    if (qty < parseFloat(invVendors[i].qty_pkg)) qty = parseFloat(invVendors[i].qty_pkg);
                    adjDesc  = invVendors[i].desc;
                    def_tax_id = def_contact_tax_id;
                }
            }
        }
    }
    // set the datagrid source data
    jq('#dgJournalItem').edatagrid('getRows')[curIndex]['qty']           = qty;
    jq('#dgJournalItem').edatagrid('getRows')[curIndex]['sku']           = data.sku;
    jq('#dgJournalItem').edatagrid('getRows')[curIndex]['description']   = adjDesc;
    jq('#dgJournalItem').edatagrid('getRows')[curIndex]['gl_account']    = gl_account;
    jq('#dgJournalItem').edatagrid('getRows')[curIndex]['tax_rate_id']   = def_tax_id;
    jq('#dgJournalItem').edatagrid('getRows')[curIndex]['pkg_length']    = data.length;
    jq('#dgJournalItem').edatagrid('getRows')[curIndex]['pkg_width']     = data.width;
    jq('#dgJournalItem').edatagrid('getRows')[curIndex]['pkg_height']    = data.height;
    jq('#dgJournalItem').edatagrid('getRows')[curIndex]['inventory_type']= data.inventory_type;
    jq('#dgJournalItem').edatagrid('getRows')[curIndex]['item_weight']   = data.item_weight;
    jq('#dgJournalItem').edatagrid('getRows')[curIndex]['qty_stock']     = data.qty_stock;
    jq('#dgJournalItem').edatagrid('getRows')[curIndex]['full_price']    = data.full_price;
    // set the editor values
    jq(qtyEditor.target).numberbox('setValue', qty);
    descEditor.target.val(adjDesc);
    if (glEditor)  jq(glEditor.target).combogrid( 'setValue', gl_account);
    if (taxEditor) jq(taxEditor.target).combogrid('setValue', def_tax_id);
    if (skuEditor) jq(skuEditor.target).combogrid('setValue', data.sku);
    var targetDate = new Date();
    targetDate.setDate(targetDate.getDate() + parseInt(data.lead_time));
    jq('#dgJournalItem').edatagrid('getRows')[curIndex]['date_1'] = formatDate(targetDate);
//  alert('calculating price, curIndex='+curIndex+' and sku = '+data.sku+' and qty = '+qty+' and type = '+type);
    ordersPricing(curIndex, data.sku, qty, type);
}

/**
 * Ajax fetch and fill pricing for a line item, typically called after a user selects an item from the SKU list
 * @param string idx - DOM id
 * @param string sku - line item SKU
 * @param float qty - line item Quantity
 * @param char type - options are c for customers or v for vendors to pull from the proper price sheet
 * @returns filled datagrid values with adjustments for users currency selected
 */
function ordersPricing(idx, sku, qty, type) {
    var cID = jq('#contact_id_b').val();
    if (typeof sku == 'undefined' || sku == '') { return; }
//  alert('idx = '+idx+' and sku = '+sku+' and qty = '+qty+' and type = '+type);
    jq.ajax({
        url: bizunoAjax+'&p=inventory/prices/quote&type='+type+'&cID='+cID+'&sku='+sku+'&qty='+qty,
        success: function (data) {
            processJson(data);
            iso  = bizSelGet('currency');
            xRate= iso != bizDefaults.currency.defaultCur ? bizDefaults.currency.currencies[iso].value : 1;
            bizNumEdSet('dgJournalItem', idx, 'price', data.price * parseFloat(xRate));
            bizNumEdSet('dgJournalItem', idx, 'total', data.price * qty * parseFloat(xRate));
            if (jq('#dgJournalItem').edatagrid('getRows').length == (idx+1)) { jq('#dgJournalItem').edatagrid('addRow'); } // auto add new row
        }
    });
}

function ordersEditing(rowIndex) {
    curIndex = rowIndex;
    var sku  = jq('#dgJournalItem').edatagrid('getRows')[rowIndex]['sku'];
    var desc = jq('#dgJournalItem').edatagrid('getRows')[rowIndex]['description'];
    if (!sku && !desc) { // blank row, set the defaults
        var glEditor = jq('#dgJournalItem').datagrid('getEditor', {index:rowIndex,field:'gl_account'});
        if (glEditor) {
            jq(glEditor.target).combogrid('setValue',def_contact_gl_acct);
        } else {
            jq('#dgJournalItem').edatagrid('getRows')[rowIndex]['gl_account'] = def_contact_gl_acct;
        }
        var taxEditor = jq('#dgJournalItem').datagrid('getEditor', {index:rowIndex,field:'tax_rate_id'});
        if (taxEditor) jq(taxEditor.target).combogrid('setValue',def_contact_tax_id);
    }
    var skuEditor = jq('#dgJournalItem').datagrid('getEditor', {index:rowIndex,field:'sku'});
    switch (bizDefaults.phreebooks.journalID) { // disable sku editor if linked to SO/PO or at least part of line has been filled
        case  3:
        case  4:
        case  9:
        case 10:
            var bal = jq('#dgJournalItem').edatagrid('getRows')[rowIndex]['bal'];
            if (typeof bal !== 'undefined' && bal > 0) {
                if (skuEditor) jq(skuEditor.target).combogrid({readonly:true}).combogrid('setValue',sku).combogrid('setText',sku);
            }
            break;
        default:
            var item_ref_id= jq('#dgJournalItem').edatagrid('getRows')[rowIndex]['item_ref_id'];
            if (typeof item_ref_id !== 'undefined' && item_ref_id > 0) {
                if (skuEditor) jq(skuEditor.target).combogrid({readonly:true}).combogrid('setValue',sku).combogrid('setText',sku);
            }
            break;
    }
}

function ordersCalc(action) {
    var qtyEditor   = jq('#dgJournalItem').datagrid('getEditor', {index:curIndex,field:'qty'});
    var priceEditor = jq('#dgJournalItem').datagrid('getEditor', {index:curIndex,field:'price'});
    var totalEditor = jq('#dgJournalItem').datagrid('getEditor', {index:curIndex,field:'total'});
    var oldQty  = jq('#dgJournalItem').edatagrid('getRows')[curIndex]['qty'];
    var newQty  = qtyEditor ? qtyEditor.target.val() : oldQty;
    if (isNaN(newQty))   newQty   = 0;
    var newPrice= priceEditor ? (priceEditor.target.val()) : jq('#dgJournalItem').edatagrid('getRows')[curIndex]['price'];
    if (isNaN(newPrice)) newPrice = jq('#dgJournalItem').edatagrid('getRows')[curIndex]['price'];
    if (isNaN(newPrice)) newPrice = 0;
    var newTotal= totalEditor ? (totalEditor.target.val()) : jq('#dgJournalItem').edatagrid('getRows')[curIndex]['total'];
    if (isNaN(newTotal)) newTotal = jq('#dgJournalItem').edatagrid('getRows')[curIndex]['total'];
    if (isNaN(newTotal)) newTotal = 0;
//    alert('ordersCalc action = '+action+' and dg qty = '+oldQty+' and editor qty = '+newQty+' and read price = '+newPrice+' and read total = '+newTotal);
    switch (action) {
        case 'qty':
            // when uncommented, this prevents qty_so problems when editing (may have been fixed with journal re-design)
            // when commented, automatically opens SO/PO when closed, user may not observe that it was re-opened and when saved, SO/PO is re-opened.
//          if (oldQty !== newQty) jq('#closed').attr('checked', false);
            jq('#dgJournalItem').edatagrid('getRows')[curIndex]['qty'] = newQty;
            var hasSOorPO = parseInt(jq('#so_po_ref_id').val()); // string "0" evaluates to true!
            bizNumEdSet('dgJournalItem', curIndex, 'total', newPrice*newQty); // set the price now for speedy updaters if they click another row before new price is retrieved from server
            if (!hasSOorPO && oldQty !== newQty) { // fetch a new price based on the qty change, only if not refered by a SO or Po
                var sku = jq('#dgJournalItem').edatagrid('getRows')[curIndex]['sku'];
                ordersPricing(curIndex, sku, newQty, bizDefaults.phreebooks.type);
            }
            break;
        case 'price':
            jq('#dgJournalItem').edatagrid('getRows')[curIndex]['price'] = newPrice;
            bizNumEdSet('dgJournalItem', curIndex, 'total',  (newPrice*newQty));
            break;
        case 'total':
            if (newQty == 0) { newTotal = 0; }
            else             { newPrice = newTotal / newQty; }
            var tmp1 = bizRoundNumber(newPrice); // check for rounding circular logic
            var tmp2 = bizRoundNumber(jq('#dgJournalItem').edatagrid('getRows')[curIndex]['price']);
//alert('newPrice = '+newPrice+' and tmp1 = '+tmp1+' and tmp2 = '+tmp2);
            if (tmp1 != tmp2) { bizNumEdSet('dgJournalItem', curIndex, 'price', newPrice); }
            bizNumEdSet('dgJournalItem', curIndex, 'total', newTotal);
            totalUpdate('ordersCalc');
            break;
    }
}

/**************************** Banking ******************************************************/
function bankingCalc(action) {
    var discEditor  = jq('#dgJournalItem').datagrid('getEditor', {index:curIndex,field:'discount'});
    var totalEditor = jq('#dgJournalItem').datagrid('getEditor', {index:curIndex,field:'total'});
    if (!discEditor || !totalEditor) return; // editor is not active
    var newDisc = discEditor.target.val();
    if (isNaN(newDisc)) newDisc = 0;
    var newTotal= totalEditor.target.val();
    if (isNaN(newTotal)) newTotal = 0;
//  alert('bankingCalc action = '+action+' and newDisc = '+newDisc+' and newTotal = '+newTotal);
    switch (action) {
        case 'disc':
            var amount  = jq('#dgJournalItem').edatagrid('getRows')[curIndex]['amount'];
            jq('#dgJournalItem').edatagrid('getRows')[curIndex]['discount']= newDisc;
            bizNumEdSet('dgJournalItem', curIndex, 'total', amount - newDisc);
            break;
        case 'direct':
            bizNumEdSet('dgJournalItem', curIndex, 'total', newTotal);
            totalUpdate('bankingCalc');
            break;
    }
}

function bankingEdit(rowIndex) {
    curIndex = rowIndex;
}

/**************************** Order Support Functions ******************************************************/
function inventoryForm(rowData) {
    if (typeof rowData.sku == 'undefined') { return; }
    winOpen('phreeformOpen', 'phreeform/render/open&group=inv:frm&date=a&xfld=inventory.sku&xcr=equal&xmin='+rowData.sku);
}

function inventoryGetPrice(rowData, type) {
    if (typeof rowData.sku == 'undefined') { return; }
    jsonAction('inventory/prices/details&cID='+jq('#contact_id_b').val()+'&sku='+rowData.sku+'&type='+type);
}

function inventoryProperties(rowData) {
    if (typeof rowData.sku == 'undefined') { return; }
    windowEdit('inventory/main/properties&data='+rowData.sku, 'winInvProps', jq.i18n('SETTINGS'), 800, 600);
    // add event to window to restart editing to fix bug killing event handler of current row
    var rowIndex= jq('#dgJournalItem').datagrid('getRowIndex', jq('#dgJournalItem').datagrid('getSelected'));
    jq('#winInvProps').window({onClose:function() { ordersEditing(rowIndex); } });
}

function shippingEstimate(jID) {
    var data = { bill:{}, ship:{}, item:[], totals:{} };
    jq("#address_b input").each(function() { if (jq(this).val()) data.bill[jq(this).attr("name")] = jq(this).val(); });
    jq("#address_s input").each(function() { if (jq(this).val()) data.ship[jq(this).attr("name")] = jq(this).val(); });
    var resi   = jq('#totals_shipping_resi').is(':checked') ? '1' : '0';
    jq('#dgJournalItem').edatagrid('saveRow', curIndex);
    var rowData= jq('#dgJournalItem').edatagrid('getData');
    for (var rowIndex=0; rowIndex<rowData.total; rowIndex++) {
        var tmp = {};
        tmp['qty'] = parseFloat(rowData.rows[rowIndex].qty);
        if (isNaN(tmp['qty'])) tmp['qty'] = 0;
        tmp['sku'] = rowData.rows[rowIndex].sku;
        data.item.push(tmp);
    }
    data.totals['total_amount'] = cleanCurrency(jq('#total_amount').val()) - cleanCurrency(jq('#freight').val());
    var content = encodeURIComponent(JSON.stringify(data));
    var url = bizunoAjax+'&p=extShipping/ship/rateMain&jID='+jID+'&resi='+resi+'&data='+content;
    jq('#shippingEst').window({ title:jq.i18n('SHIPPING_ESTIMATOR'), width:1000, height:600, modal:true }).window('refresh', url);
}

function selPayment(value) {
    if (value == '') return;
    jq("#method_code>option").map(function() {
        var value = jq(this).val();
        jq("#div_"+value).hide('slow');
    });
    jq("#div_"+value).show('slow');
    window['payment_'+value]();
}

// *******************  Assemblies  ************************************
function assyUpdateBalance() {
    var onHand = parseFloat(bizNumGet('qty_stock'));
    if (isNaN(onHand)) {
        bizNumSet('qty_stock', 0);
        onHand = 0;
    }
    var qty = parseFloat(bizNumGet('qty'));
    if (isNaN(qty)) {
        bizNumSet('qty', 1);
        qty = 1;
    }
    var rowData= jq('#dgJournalItem').datagrid('getData');
    var total  = 0;
    for (var rowIndex=0; rowIndex<rowData.total; rowIndex++) {
        var unitQty = parseFloat(rowData.rows[rowIndex].qty);
        rowData.rows[rowIndex].qty_required = qty * unitQty;
        total += qty * unitQty;
    }
    jq('#dgJournalItem').datagrid('loadData', rowData);
    jq('#dgJournalItem').datagrid('reloadFooter', [{description: jq.i18n('TOTAL'), qty_required: total}]);
    var bal = onHand+qty;
//    alert('on hand = '+onHand+' and qty = '+qty+' and bal = '+bal);
    bizNumSet('balance', bal);
}

//*******************  Adjustments  ************************************
function adjFill(data) {
    var jID = jq('#journal_id').val();
    var qtyEditor  = jq('#dgJournalItem').datagrid('getEditor', {index:curIndex,field:'qty'});
    var qty = qtyEditor.target.val() ? parseFloat(qtyEditor.target.val()) : 1;
    bizNumEdSet('dgJournalItem', curIndex, 'qty', qty);
    bizNumEdSet('dgJournalItem', curIndex, 'qty_stock', parseFloat(data.qty_stock));
    bizTextEdSet('dgJournalItem', curIndex, 'description', data.description_short);
    if (jID==='15') { bizNumEdSet('dgJournalItem', curIndex, 'balance', parseFloat(data.qty_stock) - qty); }
    else            { bizNumEdSet('dgJournalItem', curIndex, 'balance', parseFloat(data.qty_stock) + qty); }
    bizNumEdSet('dgJournalItem', curIndex, 'total', (data.item_cost) * qty);
    bizNumEdSet('dgJournalItem', curIndex, 'unit_cost', parseFloat(data.item_cost));
    bizSelEdSet('dgJournalItem', curIndex, 'gl_account', data.gl_inv);
//    jq('#dgJournalItem').edatagrid('getRows')[curIndex]['unit_cost'] = parseFloat(data.item_cost);
//    jq('#dgJournalItem').edatagrid('getRows')[curIndex]['gl_account']= data.gl_inv;
    totalUpdate();
}

function adjCalc(action) {
    var jID     = jq('#journal_id').val();
    var newQty  = bizNumEdGet('dgJournalItem', curIndex, 'qty');
    var newTotal= bizNumEdGet('dgJournalItem', curIndex, 'total');
    var onHand  = bizNumEdGet('dgJournalItem', curIndex, 'qty_stock');
//  alert('action = '+action+' and curIndex = '+curIndex+' and qty = '+newQty+' and total = '+newTotal+' and onHand = '+onHand);
    switch (action) {
        case 'qty':
            if (jID=='16') { bizNumEdSet('dgJournalItem', curIndex, 'balance', onHand + newQty); }
            else           { bizNumEdSet('dgJournalItem', curIndex, 'balance', onHand - newQty); }
            var totalEditor = jq('#dgJournalItem').edatagrid('getEditor', {index:curIndex,field:'total'});
            if (newQty < 0) { // disable total and set to null
                bizNumEdSet('dgJournalItem', curIndex, 'total', 0);
                if (totalEditor) { jq(totalEditor.target).numberbox('disable'); }
            } else {
                unitCost = bizNumEdGet('dgJournalItem', curIndex, 'unit_cost');
                bizNumEdSet('dgJournalItem', curIndex, 'total', unitCost * newQty);
                if (jID=='16' && totalEditor) { jq(totalEditor.target).numberbox('enable'); }
            }
            break;
        case 'total':
            bizNumEdSet('dgJournalItem', curIndex, 'total', newTotal);
            break;
    }
    totalUpdate();
}

//*******************  Reconciliation  ************************************
lastIndex = -1;
var pauseTotal = true;

function reconInit(row, data) {
    var stmtBal = formatCurrency(data.footer[0].total);
    bizNumSet('stmt_balance', stmtBal);
    pauseTotal = true;
    for (var i=0; i<data.rows.length; i++) {
        if (data.rows[i]['rowChk'] > 0) {
            jq('#tgReconcile').treegrid('checkRow', data.rows[i].id);
            reconCheck(data.rows[i]);
        } else {
            jq('#tgReconcile').treegrid('uncheckRow', data.rows[i].id); // this slows down load but necesary to clear parents during period or acct change
//            reconUncheck(data.rows[i]); // this causes EXTREMELY SLOW page loads, should not be necessary
        }
    }
    pauseTotal = false;
    reconTotal();
}

function reconCheck(row) {
    jq('#tgReconcile').treegrid('update',{ id:row.id, row:{rowChk: true} });
    if (row.id.substr(0, 4) == 'pID_') {
        var node = jq('#tgReconcile').treegrid('getChildren', row.id);
        for (var j=0; j<node.length; j++) {
            jq('#tgReconcile').treegrid('update',{ id:node[j].id, row:{rowChk: true} });
            jq('#tgReconcile').treegrid('checkRow', node[j].id);
        }
    } else if (typeof row._parentId !== 'undefined') {
        reconCheckChild(row._parentId);
    }
}

function reconCheckChild(parentID) {
    var node = jq('#tgReconcile').treegrid('getChildren', parentID);
    var allChecked = true;
    for (var j=0; j<node.length; j++) if (!node[j].rowChk) { allChecked = false; }
    if (allChecked) jq('#tgReconcile').treegrid('update',{ id:parentID, row:{rowChk: true} });
}

function reconUncheck(row) {
    jq('#tgReconcile').treegrid('update',{ id:row.id, row:{rowChk: false} });
    if (row.id.substr(0, 4) == 'pID_') {
        var node = jq('#tgReconcile').treegrid('getChildren', row.id);
        for (var j=0; j<node.length; j++) {
            jq('#tgReconcile').treegrid('update',{ id:node[j].id, row:{rowChk: false} });
            jq('#tgReconcile').treegrid('uncheckRow', node[j].id);
        }
    } else if (typeof row._parentId !== 'undefined') {
        jq('#tgReconcile').treegrid('update',{ id:row._parentId, row:{rowChk: false} });
    }
}

function reconTotal() {
    if (pauseTotal) { return; }
    var openTotal  = 0;
    var closedTotal= 0;
    var items = jq('#tgReconcile').treegrid('getData');
    for (var i=0; i<items.length; i++) {
        if (isNaN(items[i]['total'])) alert('error in total = '+items[i]['total']);
        if (items[i]['id'].substr(0, 4) == 'pID_') {
            var node = jq('#tgReconcile').treegrid('getChildren', items[i]['id']);
            for (var j=0; j<node.length; j++) {
                ttl = parseFloat(node[j]['deposit']) - parseFloat(node[j]['withdrawal']);
                if (node[j]['rowChk']) { closedTotal += ttl; }
                else                    { openTotal += ttl; }
            }
        } else {
            if (items[i]['rowChk']) { closedTotal += parseFloat(items[i]['total']); }
            else                    { openTotal   += parseFloat(items[i]['total']); }
        }
    }
    var stmt  = cleanCurrency(jq('#stmt_balance').val());
    var footer= jq('#tgReconcile').treegrid('getFooterRows');
    var gl    = parseFloat(footer[3]['total']);
    footer[0]['total'] = stmt;
    footer[1]['total'] = closedTotal;
    footer[2]['total'] = openTotal;
    footer[4]['total'] = stmt + openTotal - gl;
    jq('#tgReconcile').datagrid('reloadFooter');
}

function reconcileShowDetails(ref) {
  if(document.all) { // IE browsers
    if (document.getElementById('disp_'+ref).innerText == textHide) {
      document.getElementById('detail_'+ref).style.display = 'none';
      document.getElementById('disp_'+ref).innerText = textShow;
    } else {
      document.getElementById('detail_'+ref).style.display = '';
      document.getElementById('disp_'+ref).innerText = textHide;
    }
  } else {
    if (document.getElementById('disp_'+ref).textContent == textHide) {
      document.getElementById('detail_'+ref).style.display = 'none';
      document.getElementById('disp_'+ref).textContent = textShow;
    } else {
      document.getElementById('detail_'+ref).style.display = '';
      document.getElementById('disp_'+ref).textContent = textHide;
    }
  }
}

function reconcileUpdateSummary(ref) {
  var cnt = 0;
  var rowRef = 'disp_'+ref+'_';
  var checked = document.getElementById('sum_'+ref).checked;
  document.getElementById('disp_'+ref).style.backgroundColor = '';
  while(true) {
    if (!document.getElementById(rowRef+cnt)) break;
    document.getElementById('chk_'+ref).checked = (checked) ? true : false;
    cnt++;
    ref++;
  }
  updateBalance();
}

function reconcileUpdateDetail(ref) {
  var numDetail  = 0;
  var numChecked = 0;
  var rowRef     = 'disp_'+ref+'_';
  var cnt        = 0;
  var origRef    = ref;
  while (true) {
    if (!document.getElementById(rowRef+cnt)) break;
    if (document.getElementById('chk_'+ref).checked) numChecked++;
    numDetail++;
    cnt++;
    ref++;
  }
  if (numChecked == 0) { // none checked
      document.getElementById('disp_'+origRef).style.backgroundColor = '';
    document.getElementById('sum_'+origRef).checked = false;
  } else if (numChecked == numDetail) { // all checked
      document.getElementById('disp_'+origRef).style.backgroundColor = '';
    document.getElementById('sum_'+origRef).checked = true;
  } else { // partial checked
      document.getElementById('disp_'+origRef).style.backgroundColor = 'yellow';
    document.getElementById('sum_'+origRef).checked = true;
  }
  reconcileUpdateBalance();
}

function reconcileUpdateBalance() {
  var value;
  var start_balance = cleanCurrency(document.getElementById('start_balance').value);
  var open_checks   = 0;
  var open_deposits = 0;
  var gl_balance = cleanCurrency(document.getElementById('gl_balance').value);
  for (var i=0; i<totalCnt; i++) {
    if (!document.getElementById('chk_'+i).checked) {
      value = parseFloat(document.getElementById('pmt_'+i).value);
      if (value < 0) {
        if (!isNaN(value)) open_checks -= value;
      } else {
        if (!isNaN(value)) open_deposits += value;
      }
    }
  }
  var sb = new String(start_balance);
  document.getElementById('start_balance').value = formatCurrency(sb);
  var dt = new String(open_checks);
  document.getElementById('open_checks').value = formatCurrency(dt);
  var ct = new String(open_deposits);
  document.getElementById('open_deposits').value = formatCurrency(ct);

  var balance = start_balance - open_checks + open_deposits - gl_balance;
  var tot = new String(balance);
  document.getElementById('balance').value = formatCurrency(tot);
  var numExpr = Math.round(eval(balance) * Math.pow(10, bizDefaults.currency.currencies[bizDefaults.currency.defaultCur].dec_len));
  if (numExpr == 0) {
      document.getElementById('balance').style.color = '';
  } else {
      document.getElementById('balance').style.color = 'red';
  }
}
