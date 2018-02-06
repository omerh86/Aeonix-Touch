
var filtersModule = angular.module('aeonixApp.filters');

var filterLogger = logSrv.getLogger("filters");

filtersModule.filter('highlight', function () {
    return function (text, search, caseSensitive) {
        if (text && (search || angular.isNumber(search))) {
            text = text.toString();
            search = search.toString();
            if (caseSensitive) {
                return text.split(search).join('<span class="phone">' + search + '</span>');
            } else {
                return text.replace(new RegExp(search, 'gi'), '<span class="phone">$&</span>');
            }
        } else {
            return text;
        }
    };
});

filtersModule.filter('recentInfo', function () {
    return function (text, startTime, duration, $scope) {
        var out = "";
        var start = new moment(startTime);
        if (start.isSame(new moment(), 'd')) {
            out = $scope.getFilter()('i18n')('messages.Today');
            
        } else if (start.isSame((new moment()).subtract(1, 'days'), 'd')) {
            out = $scope.getFilter()('i18n')('messages.Yesterday');;
        } else {
            out = start.format("DD/MM/YYYY");
        }
        out += " " + start.format("HH:mm:ss");
        if (duration > 0) {
            var time = Math.floor(duration / 60000) + "m" + Math.floor(duration % 60000 / 1000) + "s";
            out += " " + time;
        }
        return out;
    };
});



filtersModule.filter('translatePrecence', function () {
    return function (text, $scope) {
        return $scope.getFilter()('i18n')('messages.' + text.toUpperCase());
    };
});


//Bug 42795 - Ticket#201702070133185 Aeonix Touch - Incoming call text overlaps the incoming call icon
filtersModule.filter('limitFieldTo17Chars', function () {
    return function (item) {
        if (item != null && item.length > 20) {
            item = item.substring(0, 17);
            item = item.concat("...");
        }
        return item;
    };
});

filtersModule.filter('contactName', function () {
    return function (contact, $scope) {
        if(contact){
            return getContactName(contact, $scope);
        }
    };
});

//Bug 41830 - Atouch: Group search results show group alias instead Group description
filtersModule.filter('contactDescription', function () {
    return function (contact, scope) {
        if (contact) {
            return getContactDescription(contact, scope);
        }
    };
});





filtersModule.filter('imageByState', function () {
    return function (call) {
        var contact = call.contact.contact;
        if (call.secondaryContact != null) { //Conference 
            return "img/temp_users/group-placeholder_60.png";
        }
        if (contact) {
            return call.contact.internal.img;
        }
    };
});





filtersModule.filter('highlightChat', function () {
    return function (text, search, caseSensitive) {
        if (text && (search || angular.isNumber(search))) {
            text = text.toString();
            search = search.toString();
            if (caseSensitive) {
                return text.split(search).join('<span class="chat-result">' + search + '</span>');
            } else {
                return text.replace(new RegExp(search, 'gi'), '<span class="chat-result">$&</span>');
            }
        } else {
            return text;
        }
    };
});

filtersModule.filter('presenceStatusDescription', function () {
    return function (presence) {
        if (!presence || presence==ePresence.unknown) return "";
        return "messages."+presence.text;
    };
});

filtersModule.filter('callingProgressStatusClass', function () {
    return function (state) {
        if (state==eCallState.Error) {
            return "calling-status_inBusy";
        }else {
            return "calling-status";
        }
    }
});

filtersModule.filter('callState', function () {
    return function (state, errorReason) {
        switch(state) {
            case eCallState.Error: {
                switch (errorReason) {
                    case eCallErrorReason.Busy: {
                        return 'messages.Busy';
                    }
                    case eCallErrorReason.Offline: {
                        return 'messages.Not_Available';
                    }
                    case eCallErrorReason.NotFound:{
                        return 'messages.Not_Found';
                    }
                    case eCallErrorReason.DND:{
                        return 'messages.DND';
                    }
                    case eCallErrorReason.Unknown:{
                        return 'messages.Call_failed';

                    }
                }
            }
            case eCallState.Calling: {
                return 'messages.calling';
            }
            case eCallState.Active: {
                return 'messages.inCall';
            }
            case eCallState.Incoming: {
                return 'messages.incomingCall';
            }
            case eCallState.Hold: {
                return 'messages.onHold';
            }
            case eCallState.Held: {
                return 'messages.onHeld';
            }
            case eCallState.End:
            case eCallState.Released:
            case eCallState.Idle: {
                return 'messages.CallEnded';
            }
        }
    }
});


filtersModule.filter('callFunctionAvailable', function () {

    var map = {};

    map[eCallState.Calling] = {};
    map[eCallState.Incoming] = {};
    map[eCallState.Held] = {};
    map[eCallState.Active] = {};
    map[eCallState.Hold] = {};
    map[eCallState.Error] = {};
    map[eCallState.End] = {};
    map[eCallState.Released] = {};
    map[eCallState.Transferred] = {};
    map[eCallState.Idle] = {};


    map[eCallState.Calling]['endCall'] = true;
    map[eCallState.Calling]['speaker'] = true;
    map[eCallState.Calling]['keypad'] = true;

    map[eCallState.Incoming]['answer_audio'] = true;
    map[eCallState.Incoming]['divert_in'] = true;
    map[eCallState.Incoming]['endCall'] = true;

    map[eCallState.Held]['endCall'] = true;
    map[eCallState.Held]['speaker'] = true;
    map[eCallState.Held]['mute'] = true;
    map[eCallState.Held]['bluetooth'] = true;
    map[eCallState.Held]['menu'] = true;
    map[eCallState.Held]['keypad'] = true;

    map[eCallState.Active]['addCall'] = true;
    map[eCallState.Active]['endCall'] = true;
    map[eCallState.Active]['pause'] = true;
    map[eCallState.Active]['mute'] = true;
    map[eCallState.Active]['speaker'] = true;
    map[eCallState.Active]['keypad'] = true;
    map[eCallState.Active]['menu'] = true;

    map[eCallState.Hold]['addCall'] = true;
    map[eCallState.Hold]['endCall'] = true;
    map[eCallState.Hold]['pause'] = true;
    map[eCallState.Hold]['menu'] = true;

    map[eCallState.Error]['endCall'] = true;

    map[eCallState.End]['endCall'] = true;

    return function (state, action, $scope) {
        if (action=='transfer') {
            if (map[state] && true===map[state][action]){
                var transferCandidates = $scope.transferCandidates;
                return (transferCandidates && transferCandidates.length && transferCandidates.length>0);
            }else return false;
        }else if (action=='conference') {
            if (map[state] && true===map[state][action]){
                var conferenceCandidates = $scope.conferenceCandidates;
                return (conferenceCandidates && conferenceCandidates.length && conferenceCandidates.length>0);
            }else return false;
        }else {
            return (map[state] && true===map[state][action]);
        }

    };
});

filtersModule.filter('serverName', function () {
    return function (sipAddress) {
        if(sipAddress){
            return sipAddress.substring(sipAddress.indexOf('@')+1)
        }
    };
});



filtersModule.filter('passwordFailures', function () {
    return function (failure, $scope) {
        var result = '';
        switch(failure)
        {
            case 'UPPER_CASE':
                
                result = $scope.getFilter()('i18n')('messages.ShouldContainUpperLetters');
                break;
            case 'LOWER_CASE':
                result = $scope.getFilter()('i18n')('messages.ShouldContainLowerLetters');
                break;
            case 'DIGIT':
                result = $scope.getFilter()('i18n')('messages.IncludeOneMoreDigits');
                break;
            case 'SPECIAL_CHAR':
                result = $scope.getFilter()('i18n')('messages.ShouldIncludeSpecialCharacters');
                break;
            case 'LENGTH':
                result = $scope.getFilter()('i18n')('messages.ShouldLongerThan6Digits');
                break;
            case 'COMMON':
                result = $scope.getFilter()('i18n')('messages.passwordMatchesCommonlyPasswords');
                break;
        }

        return result;
    };
});

filtersModule.filter('recentDate', function () {
    return function (text, startTime, $scope) {
        var maxLength = 20;
        var out = "";
        var start = new moment(startTime);
        if (start.isSame(new moment(), 'd')) {
            out = $scope.getFilter()('i18n')('messages.Today');
        } else if (start.isSame((new moment()).subtract(1, 'days'), 'd')) {
            out = $scope.getFilter()('i18n')('messages.Yesterday');
        } else {
            out = start.format("DD/MM/YYYY");
        }
        var currLenth = out.length;
        for (var i = 0; i < maxLength - 5 - currLenth; i++) {
            out += "&nbsp;";
        }
        out += start.format("HH:mm:ss");
        return out;
    };
});

filtersModule.filter('recentDuration', function () {
    return function (text, duration) {
        return duration > 0 ? Math.floor(duration / 60000) + "m " + Math.floor(duration % 60000 / 1000) + "s" : "";
    };
});


//call log


filtersModule.filter('callLogUserDetailsClass', function () {
    return function (user) {
        try {
            if (user.contact.serviceType !== 'USR') {
                return "user_details external";
            }else {
                if (user.contact.userName !== "unknown"
                    && user.contact.userName !== "restricted"
                    && user.contact.userName !== "external") {
                    return "user_details";
                } else {
                    return "user_details external";
                }
            }
        }catch(err){
            filterLogger.error(err);
            return "user_details external";
        }
    };
});


filtersModule.filter('showFavorite', function () {
    return function (user) {
        try {
            return user && user.contact && user.contact.serviceType === 'USR'
                && user.contact.userName !== "unknown"
                && user.contact.userName !== "restricted"
                && user.contact.userName !== "external";
        }catch(err){
            filterLogger.error(err);
            return false;
        }
    };
});


filtersModule.filter('callLogFavoriteBtnClass', function () {
    return function (user) {
        try {
            if (user.internal.isFav) {
                return "yes";
            }else {
                return "no";
            }
        }catch(err){
            filterLogger.error(err);
            return "favorite_no";
        }
    };
});





filtersModule.filter('showStatus', function () {
    return function (user) {
        try {
            return user && user.contact && user.contact.serviceType === 'USR'
                && user.contact.userName !== "unknown"
                && user.contact.userName !== "restricted"
                && user.contact.userName !== "external";
        }catch(err){
            filterLogger.error(err);
            return "";
        }
    };
});


filtersModule.filter('showType', function () {
    return function (user) {
        try {
            if (user && user.contact) {
                //todo: replace comparing serviceType to specific names with a more general check
                if (user.contact.serviceType == "MEET_ME") return true;
                if (user.contact.serviceType == "ZONE_PAGE") return true;
                if (user.contact.serviceType == "CONFERENCE_CALL") return true;
                return false;
            }else return false;
        }catch(err){
            filterLogger.error(err);
            return false;
        }
    };
});

filtersModule.filter('statusClassFromUser', function () {
    return function (user) {
        try {
            if (user && user.internal && user.internal.status) {
                return user.internal.status.combinedPresence.color;
            }else {
                return ePresence.unknown.color;
            }
        }catch(err){
            filterLogger.error(err);
            return ePresence.unknown.color;
        }
    };
});


filtersModule.filter('statusIndicatorClass', function () {
    return function (user) {
        try {
            switch (user.internal.status.combinedPresence) {
                case ePresence.busy: {
                    return "user_status on_call";
                }
                case ePresence.available: {
                    return "user_status available";
                }
                case ePresence.dnd: {
                    return "user_status dnd";
                }
                case ePresence.meeting: {
                    return "user_status on_meeting";
                }
                case ePresence.offline: {
                    return "user_status offline";
                }
                case ePresence.unknown: {
                    return "user_status unknown";
                }
            }
            return "user_status status_unknown";
        }catch(err){
            filterLogger.error(err);
            return "status_unknown";
        }
    };
});

filtersModule.filter('callLogCallDirectionClass', function () {
    return function (callLogRecord) {
        try {
            if (callLogRecord.callLog[0].callType.toLowerCase() ==='outgoing') {
                return "call_direction outgoing";
            }else {
                if (callLogRecord.callLog[0].answered) {
                    return "call_direction incoming";
                }else {
                    return "call_direction missed";
                }
            }
        }catch(err){
            filterLogger.error(err);
            return "";
        }
    };
});

filtersModule.filter('imDate', function () {
    return function (d) {
        if (d) {
            var m = new moment(d);
            if (m.isSame(new moment(), 'd')) {
                return m.format("HH:mm");
            }else {
                //Todo: print date according to the locale
                return m.format("DD/MM/YYYY");
            }
        }else {
            return "";
        }
    };
});


filtersModule.filter('callLogRecordDate', function () {
    return function (startTime, $scope) {
        try {
            var out = "";
            var start = new moment(startTime);
            if (start.isSame(new moment(), 'd')) {
                out = $scope.getFilter()('i18n')('messages.Today');
            } else if (start.isSame((new moment()).subtract(1, 'days'), 'd')) {
                out = $scope.getFilter()('i18n')('messages.Yesterday');;
            } else {
                //Todo: print date according to the locale
                out = start.format("DD/MM/YYYY");
            }
            return out;
        }catch(err){
            filterLogger.error(err);
            return "";
        }
    };
});

filtersModule.filter('callLogRecordTime', function () {
    return function (startTime) {
        try {
            //Todo: print time according to the locale
            var start = new moment(startTime);
            return start.format("HH:mm");
        }catch(err){
            filterLogger.error(err);
            return "";
        }
    };
});

filtersModule.filter('serviceName', function () {
    return function (user, $scope) {
        return getServiceName(user,$scope);
    };
});

filtersModule.filter('chatEnabled', function () {
    return function (user) {
        try {
            //Todo: extract the expression to a separate function. Consider chatEnabled, showStatus and showFavorite filters
            return user && user.contact && user.contact.serviceType === 'USR'
                            && user.contact.userName !== "unknown"
                            && user.contact.userName !== "restricted"
                            && user.contact.userName !== "external";
        }catch(err){
            filterLogger.error(err);
            return false;
        }
    };
});



filtersModule.filter('transferTarget', function () {
    return function (contact) {
        return 'Transfer to ' + getContactName(contact);
    };
});

filtersModule.filter('conferenceTarget', function () {
    return function (contact) {
        return 'Conference with ' + getContactName(contact);
    };
});


function getContactName (contact, $scope)
{
    var name = "";
    if (contact.internal.type==eContactType.user) {
        if (!stringUtils.isEmpty(contact.contact.firstName)
         && !stringUtils.isEmpty(contact.contact.lastName)) {
            //todo michael: take into account the locale
            name = contact.contact.firstName+" "+contact.contact.lastName;
        }else if (!stringUtils.isEmpty(contact.contact.displayName)) {
            name = contact.contact.displayName;
        }else {
            name = ""+contact.getAlias();
        }
    }else if (contact.internal.type==eContactType.nWayConference) {
        name = $scope.getFilter()('i18n')('messages.conference');
    }else if (contact.internal.type==eContactType.voiceMail) {
        name = ""+contact.getAlias();
    }else if (contact.internal.type.isGroup && !stringUtils.isEmpty(contact.contact.displayName)) {
        name = contact.contact.displayName;
    }else if (!stringUtils.isEmpty(contact.contact.displayName)){
        name = ""+contact.contact.displayName;
    }else {
        name = ""+contact.getAlias();
    }
    return name;
}

function getContactDescription (contact, $scope)
{

    var description = "";
    if (contact.internal.type==eContactType.user) {
        description = "" + contact.getAlias();
    }else if (contact.internal.type.isGroup || contact.internal.type==eContactType.voiceMail) {
        description = getServiceName(contact, $scope);
    } else if (!stringUtils.isEmpty(contact.contact.displayName)) {
        description = "" + contact.getAlias();
    }
    return description;
}

function getServiceName(user, $scope) {
    try {
        if (user.contact.serviceType == "MEET_ME")
            return $scope.getFilter()('i18n')('messages.Meet_me');

        if (user.contact.serviceType == "ZONE_PAGE")
            return $scope.getFilter()('i18n')('messages.Zone_page');

        if (user.contact.serviceType == "CONFERENCE_CALL")
            return $scope.getFilter()('i18n')('messages.Conference_call');

        if (user.contact.serviceType == "ACD")
                    return $scope.getFilter()('i18n')('messages.Meet_me');

        if (user.contact.serviceType == "HUNT")
            return $scope.getFilter()('i18n')('messages.Hunt');

        if (user.contact.serviceType == "CALL_GROUP")
            return $scope.getFilter()('i18n')('messages.Call_group');

        if (user.contact.serviceType == "VOICE_MAIL")
           return $scope.getFilter()('i18n')('messages.VoiceMail');

        return "";
    }catch(err){
        filterLogger.error(err);
        return "";
    }
};