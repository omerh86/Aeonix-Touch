function InfoSrv($rootScope, $timeout, connectionSrv) {

    var serviceLogger = logSrv.getLogger("infoSrv");

    var regularPriorityInfoQueue = [];
    var lowPriorityInfoQueue = [];
    var currentRequest = null;
    var requestTimeout = null;
    var paused = false;

    var responseBuffer = null;
    var eventBuffer = null;

    function getMembers() {
        var state = {
            regularPriorityInfoQueue: regularPriorityInfoQueue,
            lowPriorityInfoQueue: lowPriorityInfoQueue,
            currentRequest: currentRequest,
            requestTimeout: requestTimeout,
            paused: paused
        };
        return state;
    }

    function clear() {
        var logger = serviceLogger.logMethodCall(arguments, eLogLevel.finer);

        if (currentRequest) {
            currentRequest = null;
            $timeout.cancel(requestTimeout);
            requestTimeout = null;

        }
        regularPriorityInfoQueue = [];
        lowPriorityInfoQueue = [];

        logger.logMethodCompleted(arguments, getMembers(), eLogLevel.finer);
    }

    function pause() {
        var logger = serviceLogger.logMethodCall(arguments, eLogLevel.finer);

        if (!paused) {
            clear();
            paused = true;
        }

        logger.logMethodCompleted(arguments, getMembers(), eLogLevel.finer);
    }

    function resume() {
        var logger = serviceLogger.logMethodCall(arguments, eLogLevel.finer);

        paused = false;

        logger.logMethodCompleted(arguments, getMembers(), eLogLevel.finer);
    }

    function getRequestName(obj) {
        return Object.getOwnPropertyNames(obj)[0];
    }

    function onRequestTimeout(request) {
        var logger = serviceLogger.logMethodCall(arguments, eLogLevel.finer);


        var requestName = getRequestName(request);
        logger.finer("request ", requestName, " timeout");
        if (currentRequest != null && request === currentRequest) {
            $rootScope.$broadcast("infoSrv:"+requestName+"Failed", request);
            currentRequest = null;
            requestTimeout = null;
            checkQueue();
        } else {
            logger.finer("Current request is null, no action will be taken");
        }

        logger.logMethodCompleted(arguments, getMembers(), eLogLevel.finer);
    }

    function sendRequest(request, lowPriority) {
        var logger = serviceLogger.logMethodCall(arguments, eLogLevel.finer);

        if (lowPriority) {
            lowPriorityInfoQueue.push(request);
            serviceLogger.finest("The request has been added to the low priority queue; queue length - ", lowPriorityInfoQueue.length);
        } else {
            regularPriorityInfoQueue.push(request);
            serviceLogger.finest("The request has been added to the regular priority queue; queue length - ", regularPriorityInfoQueue.length);
        }

        checkQueue();

        logger.logMethodCompleted(arguments, getMembers(), eLogLevel.finer);
    };

    function sendRequestToServer(request) {
        var logger = serviceLogger.logMethodCall(arguments, eLogLevel.finer);

        var jsonStr = angular.toJson(request, true);
        if (request.ChangeUserPassword)
            JSBridge.sendInfo(connectionSrv.getTR87CallReference(), jsonStr, true);
        else
            JSBridge.sendInfo(connectionSrv.getTR87CallReference(), jsonStr);


        currentRequest = request;
        requestTimeout = $timeout(function() {
            onRequestTimeout(request);
        }, 1000 * 30, false);

        logger.logMethodCompleted(arguments, getMembers(), eLogLevel.finer);

    };

    function checkQueue() {
        var logger = serviceLogger.logMethodCall(arguments, eLogLevel.finer);

        if (paused) {
            logger.finest("service is paused. no action will be taken");
        } else {
            if (!currentRequest) {
                var request = null;
                if (regularPriorityInfoQueue.length > 0) {
                    request = regularPriorityInfoQueue.shift();
                } else if (lowPriorityInfoQueue.length > 0) {
                    request = lowPriorityInfoQueue.shift();
                }
                if (request != null) {
                    var requestName = getRequestName(request);
                    sendRequestToServer(request);
                } else {
                    logger.fine("nothing to send - both regular and low priority queues are empty");
                }
            } else {
                logger.fine("waiting for response on ", getRequestName(currentRequest));
            }
        }

        logger.logMethodCompleted(arguments, getMembers(), eLogLevel.finer);

    }

    function broadcastResponse(response, request) {

        var logger = serviceLogger.logMethodCall(arguments, eLogLevel.finer);

        var responseName = Object.keys(response)[0];
        var requestName = getRequestName(request);
        switch (responseName) {
            case "GetGroupsResponse":
                if (response.GetGroupsResponse.imageContent) {
                    $rootScope.$broadcast("picture:update", response.GetGroupsResponse);
                } else {
                    $rootScope.$broadcast("infoSrv:GetGroupsResponse", response.GetGroupsResponse);
                }
                break;
            case "GetPictureResponse":
                if (response.GetPictureResponse.errCode == 0) {
                    $rootScope.$broadcast("picture:update", response.GetPictureResponse);
                }
                break;
            case "ContactResponse":
                if (response.ContactResponse.errCode || (!response.ContactResponse.contact) || 'USR' != response.ContactResponse.contact.serviceType)
                    return;
                $rootScope.$broadcast("infoSrv:contactResponse", [response.ContactResponse.contact]);
                break;
            case "aitSettingsResponse":
                //$rootScope.$broadcast("hotKeys:update", response.aitSettingsResponse.aitSettings.mapSettings.entry);
                break;
            case "ContactListResponse":
                //todo michael
                $rootScope.$broadcast("list:update", "search", response.ContactListResponse.contactsPresence);
                $rootScope.$broadcast("infoSrv:ContactListResponse", response.ContactListResponse);
                break;
            case "aitTargetEPStatus":
                $rootScope.$broadcast("settingsDevices:update", response.aitTargetEPStatus.deviceList);
                break;
            case "RsUserResponse":
                $rootScope.$broadcast("infoSrv:RsUserResponse", response.RsUserResponse.rsUser);
                break;
            case "CallLogRecords":
                if (response.CallLogRecords.recentRecordInfo.length == 0)
                    return;
                $rootScope.$broadcast("list:update", "recent", response.CallLogRecords.recentRecordInfo);
                $rootScope.$broadcast("infoSrv:CallLogRecords", response, request);
                break;
            case "ChangeUserPasswordResponse":
                $rootScope.$broadcast("infoSrv:ChangeUserPasswordResponse", response.ChangeUserPasswordResponse);
                break;
            case "SetRsUserResponse":
                $rootScope.$broadcast("infoSrv:SetRsUserResponse", response.SetRsUserResponse);
                break;
            case "ConnectionConfiguration":
                $rootScope.$broadcast("infoSrv:ConnectionConfiguration", response.ConnectionConfiguration);
                break;
            case "RSUserPresenceInfo":
                $rootScope.$broadcast("infoSrv:RSUserPresenceInfo", response.RSUserPresenceInfo);
                break;
            case "GetDialPlanFeaturesResponse":
                $rootScope.$broadcast("infoSrv:GetDialPlanFeaturesResponse", response.GetDialPlanFeaturesResponse);
                break;
            case "RemoveFromCallLog":
                $rootScope.$broadcast("response:RemoveFromCallLog");
                break;
            case "MonitorStartResponse":
                $rootScope.$broadcast("infoSrv:MonitorStartResponse", response.MonitorStartResponse);
                break;
            case "SendInstantMessageResponse":
                $rootScope.$broadcast("infoSrv:SendInstantMessageResponse", response.SendInstantMessageResponse);
                break;
            case "PresencesListResponse":
                $rootScope.$broadcast("presencesList:update", response.PresencesListResponse.presencesList);
                break;
            case "SnapshotDeviceResponse":
                $rootScope.$broadcast("infoSrv:SnapshotDeviceResponse", response.SnapshotDeviceResponse);
                break;
            case "GetMicrophoneMuteResponse":
                $rootScope.$broadcast("GetMicrophoneMuteResponse", response.GetMicrophoneMuteResponse);
                break;
            case "ConferenceCallResponse":
                $rootScope.$broadcast("ConferenceCallResponse:received", response.ConferenceCallResponse);
                break;
            case "containerInfo":
                if (response[responseName].type == "favoritsListResponse") {
                    if (response.containerInfo.errCode == 0) {
                        $rootScope.$broadcast("infoSrv:FavoritesListResponse", response.containerInfo.favorits);
                    }
                } else {
                    var resName;
                    if (requestName.indexOf("Request") == -1) {
                        resName = requestName + "Response";
                    } else {
                        resName = requestName.replace("Request", "Response");
                    }
                    $rootScope.$broadcast("infoSrv:" + resName, response.containerInfo, request);
                }
                break;
            default:
                break;
        }

        logger.logMethodCompleted(arguments, getMembers(), eLogLevel.finer);
    }

    function onRequestResponse(response) {
        var logger = serviceLogger.logMethodCall(arguments, eLogLevel.finer);

        var responseKey = Object.keys(response)[0];
        logger.finer("Handling response - ", responseKey);

        if (currentRequest) {
            broadcastResponse(response, currentRequest);
            currentRequest = null;
            $timeout.cancel(requestTimeout);
            requestTimeout = null;
            checkQueue();
        } else {
            logger.finer("There is no a pending request. No action will be taken on ", responseKey);
        }

        logger.logMethodCompleted(arguments, getMembers(), eLogLevel.finer);
    }

    function onServerEvent(obj) {
        var logger = serviceLogger.logMethodCall(arguments, eLogLevel.finer);

        var eventName = Object.keys(obj)[0];
        logger.finer("Handling event - ", eventName);

        switch (eventName) {
            case "userFavorits":
                $rootScope.$broadcast("favorite:update", obj.userFavorits);
                break;
            case "GroupChanged":
                $rootScope.$broadcast("group:update", obj.GroupChanged.groupInfo, obj.GroupChanged.operation);
                break;
            case "newCallsNumber":
                $rootScope.$broadcast("recent:update", obj);
                $rootScope.$broadcast("infoSrv:CallLogNotification", obj);
                break;
            case "PresenceStateEvent":
                $rootScope.$broadcast("infoSrv:PresenceStateEvent", obj.PresenceStateEvent);
                break;
            case "InstantMessage":
                $rootScope.$broadcast("infoSrv:InstantMessage", obj.InstantMessage);
                break;
            case "ServiceInitiatedEvent":
            case "OriginatedEvent":
            case "DeliveredEvent":
            case "FailedEvent":
            case "ConnectionClearedEvent":
            case "EstablishedEvent":
            case "HeldEvent":
            case "RetrievedEvent":
            case "TransferedEvent":
            case "ConferencedEvent":
            case "MicrophoneMuteEvent":
                $rootScope.$broadcast("csta:event", obj, eventName);
                break;
            default:
                break;
        }

        logger.logMethodCompleted(arguments, getMembers(), eLogLevel.finer);
    }

    function onResponseReceived(event, response) {
        var logger = serviceLogger.logMethodCall(arguments, eLogLevel.finer);

        try {
            if (response.moreData === null) {
                var o = angular.fromJson(response.content);
                onRequestResponse(o);
            } else if (response.moreData === true) {
                if (responseBuffer != null) {
                    responseBuffer += response.content;
                } else {
                    responseBuffer = response.content;
                }
                var request = {
                    GetNextResponse: {}
                };
                sendRequestToServer(request);
            } else if (response.moreData === false) {
                if (responseBuffer != null) {
                    responseBuffer += response.content;
                } else {
                    responseBuffer = response.content;
                }
                logger.logCollapsed("Last portion of multipart response",responseBuffer, eLogLevel.finer);
                var o = angular.fromJson(responseBuffer);
                responseBuffer = null;
                onRequestResponse(o);
            }
        } catch (err) {
            logger.error(err);
        }



        logger.logMethodCompleted(arguments, getMembers(), eLogLevel.finer);
    }

    function onInfoReceived(event, info) {
        var logger = serviceLogger.logMethodCall(arguments, eLogLevel.finer);

        try {
            if (info.moreData === null) {
                var o = angular.fromJson(info.content);
                onServerEvent(o)
            } else if (info.moreData === true) {
                if (eventBuffer != null) {
                    eventBuffer += info.content;
                } else {
                    eventBuffer = info.content;
                }
            } else if (info.moreData === false) {
                if (eventBuffer != null) {
                    eventBuffer += info.content;
                } else {
                    eventBuffer = info.content;
                }
                var o = angular.fromJson(eventBuffer);
                eventBuffer = null;
                onServerEvent(o);
            }
        } catch (err) {
            logger.error(err);
        }



        logger.logMethodCompleted(arguments, getMembers(), eLogLevel.finer);
    }



    function onLoggedOut(event, loggedInWithEndpoint, loginSrv) {
        var logger = serviceLogger.logMethodCall(arguments, eLogLevel.finer);
        try {
            clear();
        } catch (err) {
            logger.error(err);
        }
        logger.logMethodCompleted(arguments, getMembers(), eLogLevel.finer);

    }

    function onConnectionFailed(event, loginSrv) {
        var logger = serviceLogger.logMethodCall(arguments, eLogLevel.finer);
        try {
            clear();
        } catch (err) {
            logger.error(err);
        }
        logger.logMethodCompleted(arguments, getMembers(), eLogLevel.finer);
    }


    $rootScope.$on("loginSrv:loggedOut", onLoggedOut);
    $rootScope.$on("loginSrv:connectionFailed", onConnectionFailed);
    $rootScope.$on("linphone:ResponseReceived", onResponseReceived);
    $rootScope.$on("linphone:InfoReceived", onInfoReceived);

    this._getMembers = getMembers;
    this._clear = clear;
    this._pause = pause;
    this._resume = resume;
    this._getRequestName = getRequestName;
    this._onRequestTimeout = onRequestTimeout;
    this._sendRequestToServer = sendRequestToServer;
    this._checkQueue = checkQueue;
    this._broadcastResponse = broadcastResponse;
    this._onRequestResponse = onRequestResponse;
    this._onServerEvent = onServerEvent;
    this._onLoggedOut = onLoggedOut;
    this._onConnectionFailed = onConnectionFailed;
    this._onResponseReceived = onResponseReceived;
    this._onInfoReceived = onInfoReceived;

    this.sendRequest = sendRequest;


}

var servicesModule = angular.module('aeonixApp.services');
servicesModule.service('infoSrv', ['$rootScope', '$timeout', 'connectionSrv', InfoSrv]);