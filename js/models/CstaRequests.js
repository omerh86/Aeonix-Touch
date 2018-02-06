function GetPresences(cstaIdArr) {

    var userIDList = [];
    var aliasList = [];
    for (var i=0;i<cstaIdArr.length;i++) {
        var cstaId = cstaIdArr[i];
        if (cstaId.alias) {
            aliasList.push(cstaId.alias);
        }else if (cstaId.userId) {
            userIDList.push(cstaId.userId);
        }
    }

    this.GetPresences =  {
        userIDList: userIDList,
        aliasList: aliasList
    };
}

function MonitorPresenceStartRequest(cstaIdArr)  {
     //todo michael
     var aliases=[];
     for(var i=0;i<cstaIdArr.length;i++) {
        aliases.push(cstaIdArr[i].alias);
     }
     var monitorObjectList= aliases.join(",");
     this.MonitorStartRequest = {
        "monitorObject": {
            deviceObject: monitorObjectList
        },
        "requestedMonitorFilter": {
            "callcontrol": {
                "bridged": "true",
                "callCleared": "true",
                "conferenced": "true",
                "connectionCleared": "true",
                "delivered": "true",
                "digitsDialed": "true",
                "diverted": "true",
                "established": "true",
                "failed": "true",
                "held": "true",
                "networkCapabilitiesChanged": "true",
                "networkReached": "true",
                "offered": "true",
                "originated": "true",
                "queued": "true",
                "retrieved": "true",
                "serviceInitiated": "true",
                "transferred": "true"
            },
            "callAssociated": {
                "callInformation": "true",
                "charging": "true",
                "digitsGenerated": "true",
                "telephonyTonesGenerated": "true",
                "serviceCompletionFailure": "true"
            },
            "mediaAttachment": {
                "mediaAttached": "true",
                "mediaDetached": "true"
            },
            "physicalDeviceFeature": {
                "buttonInformation": "true",
                "buttonPress": "true",
                "displayUpdated": "true",
                "hookswitch": "true",
                "lampMode": "true",
                "messageWaiting": "true",
                "microphoneGain": "true",
                "microphoneMute": "true",
                "ringerStatus": "true",
                "speakerMute": "true",
                "speakerVolume": "true"
            },
            "maintenance": {
                "backInService": "true",
                "deviceCapabilityChanged": "true",
                "outOfService": "true",
                "partiallyInService": "true"
            },
            "voice": {
                "bookmarkReached": "true",
                "completed": "true",
                "dtmfDetected": "true",
                "emptied": "true",
                "interruptionDetected": "true",
                "notRecognized": "true",
                "play": "true",
                "recognized": "true",
                "record": "true",
                "review": "true",
                "started": "true",
                "silenceTimeoutExpired": "true",
                "speechDetected": "true",
                "stop": "true",
                "suspendPlay": "true",
                "suspendRecord": "true",
                "voiceAttributesChanged": "true",
                "voiceErrorOccurred": "true"
            }
        }
    };
}

function MonitorDeviceStartRequest(idArray) {
    var monitorObjectList= idArray.join(",");
    this.MonitorStartRequest =  {
        "monitorObject": {
            deviceObject: monitorObjectList
        },
        "requestedMonitorFilter": {
            "callAssociated": {
                "callInformation": "true",
                "charging": "true",
                "digitsGenerated": "true",
                "telephonyTonesGenerated": "true",
                "serviceCompletionFailure": "true"
            },
            "mediaAttachment": {
                "mediaAttached": "true",
                "mediaDetached": "true"
            },
            "physicalDeviceFeature": {
                "buttonInformation": "true",
                "buttonPress": "true",
                "displayUpdated": "true",
                "hookswitch": "true",
                "lampMode": "true",
                "messageWaiting": "true",
                "microphoneGain": "true",
                "microphoneMute": "true",
                "ringerStatus": "true",
                "speakerMute": "true",
                "speakerVolume": "true"
            },
            "logicalDeviceFeature": {
                "agentBusy": "true",
                "agentLoggedOn": "true",
                "agentLoggedOff": "true",
                "agentNotReady": "true",
                "agentReady": "true",
                "agentWorkingAfterCall": "true",
                "autoAnswer": "false",
                "autoWorkMode": "true",
                "callBack": "true",
                "callBackMessage": "true",
                "callerIDStatus": "true",
                "doNotDisturb": "true",
                "forwarding": "true",
                "presenceState": "true",
                "routeingMode": "true"
            },
            "maintenance": {
                "backInService": "true",
                "deviceCapabilityChanged": "true",
                "outOfService": "true",
                "partiallyInService": "true"
            },
            "voice": {
                "bookmarkReached": "true",
                "completed": "true",
                "dtmfDetected": "true",
                "emptied": "true",
                "interruptionDetected": "true",
                "notRecognized": "true",
                "play": "true",
                "recognized": "true",
                "record": "true",
                "review": "true",
                "started": "true",
                "silenceTimeoutExpired": "true",
                "speechDetected": "true",
                "stop": "true",
                "suspendPlay": "true",
                "suspendRecord": "true",
                "voiceAttributesChanged": "true",
                "voiceErrorOccurred": "true"
            }
        }
    };
}


function MonitorStopRequest(crossRefIdList) {
    var crossRefIdList= crossRefIdList.join(",");
    this.MonitorStopRequest = {
        "monitorCrossRefID": crossRefIdList
    };
}

function GetPresencesRequest(cstaIdArr) {
    var aliases=[];
    var userIDs = [];
    for(var i=0;i<cstaIdArr.length;i++) {
        if (cstaIdArr[i].alias) {
            aliases.push(cstaIdArr[i].alias);
        }else if(cstaIdArr[i].userId) {
            userIDs.push(cstaIdArr[i].userId);
        }

    }
    this.GetPresences  = {
         userIDList: userIDs,
         aliasList: aliases
    };
}

function SendInstantMessage(userName, epID, destination, message) {
    this.SendInstantMessage = {
        userName: userName,
        epID: epID,
        destination: {
            type: destination.type,
            value: destination.value
        },
        messageContent:message
    };
}

function MarkInstantMessageRead(userName, epID,  messageId) {
     this.MarkInstantMessage = {
        userName: userName,
        epID: epID,
        read: true,
        messageId: messageId
     };
};

function MarkInstantMessageDeleted(userName, messageId) {
    this.MarkInstantMessage = {
        userName: userName,
        deleted: true,
        messageId: messageId
    }
};

function StartMonitorInstantMessages(userName) {
    this.StartMonitorInstantMessages =  {
        userName: userName
    };
};

function StopMonitorInstantMessages(userName) {
    this.StopMonitorInstantMessages =  {
        userName: userName
    };
};



