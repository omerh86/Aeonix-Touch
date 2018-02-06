var userStatusInfoLogger =  logSrv.getLogger('UserStatusInfo');

function UserStatusInfo(implicitPresence, explicitPresence) {
    this.implicitPresence = implicitPresence;
    this.explicitPresence = explicitPresence;
    this.combinedPresence = UserStatusInfo.calculateCombinedPresence(this.implicitPresence, this.explicitPresence);
}


UserStatusInfo.cache = {};
UserStatusInfo.presencePriorities ={};
UserStatusInfo.presencePriorities[ePresence.unknown.text] = 1;
UserStatusInfo.presencePriorities[ePresence.available.text] = 2;
UserStatusInfo.presencePriorities[ePresence.busy.text] = 3;
UserStatusInfo.presencePriorities[ePresence.meeting.text] = 4;
UserStatusInfo.presencePriorities[ePresence.dnd.text] = 5;
UserStatusInfo.presencePriorities[ePresence.offline.text] = 6;

UserStatusInfo.getFromCache = function(implicitPresence, explicitPresence){
    var key = implicitPresence.text+explicitPresence.text;
    var userStatusInfo = UserStatusInfo.cache[key];
    if (!userStatusInfo) {
        userStatusInfo = new UserStatusInfo(implicitPresence, explicitPresence);
        UserStatusInfo.cache[key]=userStatusInfo;
    }
    return userStatusInfo;
}

UserStatusInfo.updateExplicitPresence = function(userStatusInfo, explicitPresence) {
    return UserStatusInfo.getFromCache(userStatusInfo.implicitPresence, explicitPresence);
}

UserStatusInfo.updateImplicitPresence = function(userStatusInfo, implicitPresence) {
    return UserStatusInfo.getFromCache(implicitPresence, userStatusInfo.explicitPresence);
}
UserStatusInfo.calculateCombinedPresence = function(implicitPresence, explicitPresence) {
    try {
        var implicitPresencePriority = UserStatusInfo.presencePriorities[implicitPresence.text];
        var explicitPresencePriority = UserStatusInfo.presencePriorities[explicitPresence.text];
        var combinedPresence;
        if (implicitPresencePriority>explicitPresencePriority) {
            combinedPresence = implicitPresence;
        }else {
            combinedPresence = explicitPresence;
        }
        return combinedPresence;
    }catch (err) {
        userStatusInfoLogger.error(err);
        return ePresence.unknown;
    }
}

UserStatusInfo.fromCstaPresenceState = function(presence) {

    var implicitPresence;
    var explicitPresence;
    if (presence.busy) {
        implicitPresence = ePresence.busy;
    } else if (presence.offline) {
        implicitPresence = ePresence.offline;
    } else {
        implicitPresence = ePresence.available;
    }
    if (presence.dnd) {
        explicitPresence = ePresence.dnd;
    } else  if (presence.meeting) {
        explicitPresence = ePresence.meeting;
    } else {
        explicitPresence = ePresence.available;
    }

    return UserStatusInfo.getFromCache(implicitPresence,explicitPresence);
}

UserStatusInfo.fromServerPresenceInfo = function(presence) {
   var implicitPresence = ePresence.unknown;
   var explicitPresence = ePresence.unknown;
   if (presence) {
        try {
            implicitPresence = ePresence.parse(presence.implicitPresence);
            explicitPresence = ePresence.parse(presence.explicitPresence);
       }catch(err) {
          userStatusInfoLogger.error(err);
       }
   }

   return UserStatusInfo.getFromCache(implicitPresence,explicitPresence);
}

UserStatusInfo.parse = function(presence) {

    var implicitPresence = ePresence.unknown;
    var explicitPresence = ePresence.unknown;

    if (presence.hasOwnProperty('implicitPresence')) {
        implicitPresence = ePresence.parse(presence.implicitPresence);
        explicitPresence = ePresence.parse(presence.explicitPresence);
    }else if (presence.hasOwnProperty('busy')) {
        if (presence.busy) {
            implicitPresence = ePresence.busy;
        } else {
            implicitPresence = ePresence.available;
        }
        if (presence.dnd) {
            explicitPresence = ePresence.dnd;
        } else  if (presence.meeting) {
            explicitPresence = ePresence.meeting;
        } else {
            explicitPresence = ePresence.available;
        }
    }else {
       userStatusInfoLogger.error(new Error("Failed to parse presence - "+presence));
    }
    return UserStatusInfo.getFromCache(implicitPresence,explicitPresence);
}


UserStatusInfo.unknown = UserStatusInfo.getFromCache(ePresence.unknown, ePresence.unknown);
UserStatusInfo.busy = UserStatusInfo.getFromCache(ePresence.busy, ePresence.unknown);
UserStatusInfo.available = UserStatusInfo.getFromCache(ePresence.available, ePresence.unknown);

