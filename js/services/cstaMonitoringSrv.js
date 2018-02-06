
var servicesModule = angular.module('aeonixApp.services');

servicesModule.service('cstaMonitoringSrv', ['$rootScope', 'infoSrv',
    function($rootScope, infoSrv) {

        var serviceLogger = logSrv.getLogger("cstaMonitoringSrv");

        
        var presenceMonitors = [];
        var deviceMonitors = [];


        function MonitoringInfo(cstaId) {
            this.cstaId = cstaId;
            this.crossRefId = undefined;
            this.numOfMonitors = 0;
        }      


        function startServerDeviceMonitors(cstaIdArr) {
            var logger = serviceLogger.logMethodCall(arguments,eLogLevel.finer);

            var request = new MonitorDeviceStartRequest(cstaIdArr);
            infoSrv.sendRequest(request);

        }

        function startServerPresenceMonitors(cstaIdArr) {
            var logger = serviceLogger.logMethodCall(arguments,eLogLevel.finer);

            var aliases=[];
            for(var i=0;i<cstaIdArr.length;i++) {
                aliases.push(cstaIdArr[i].alias);
            }

            var monitorObjectList= aliases.join(",");

            var obj = {
                MonitorStartRequest: {
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
                }
            };

            //var request = new MonitorPresenceStartRequest(cstaIdArr);
            infoSrv.sendRequest(obj);
        }

        function stopServerMonitors( crossRefIdArr) {
            var logger = serviceLogger.logMethodCall(arguments,eLogLevel.finer);

            var request = new MonitorStopRequest(crossRefIdArr);
            infoSrv.sendRequest(request);
        }

        function indexOfMonitoringInfo(monitoringInfoArr, cstaId) {

            var logger = serviceLogger.logMethodCall(arguments,eLogLevel.finer);

            var index = -1;
            for (var i=0; i< monitoringInfoArr.length; i++) {
                if (monitoringInfoArr[i].cstaId.refersSameDevice(cstaId)) {
                    index = i;
                    break;
                }
            }
            logger.finest("returned value - ",index);
            return index;
        }





        function startMonitors(monitoringInfoArr, cstaIdArr, startServerMonitorsFunction) {
            var cstaIdArrForServer = [];

            for(var i=0;i<cstaIdArr.length;i++) {
                var cstaId = cstaIdArr[i];
                var monitoringInfo;
                for(var j=0;j<monitoringInfoArr.length;j++) {
                    var monitoringInfo;
                    if (monitoringInfoArr[j].cstaId.refersSameDevice(cstaId)) {
                        monitoringInfo = monitoringInfoArr[j];
                         break;
                    }
                }
                if (!monitoringInfo) {
                    monitoringInfo = new MonitoringInfo(cstaId);
                    monitoringInfoArr.push(monitoringInfo);
                    cstaIdArrForServer.push(cstaId);
                }
                monitoringInfo.numOfMonitors++;
            }
            if (cstaIdArrForServer.length>0) {
                startServerMonitorsFunction(cstaIdArrForServer);
            }
        }

        function restoreMonitors(monitoringInfoArr, startMonitorOnServerFunction) {
            var logger = serviceLogger.logMethodCall(arguments,eLogLevel.finer);

            var cstaIdArr = [];
            var crossRefIdArr = [];
            for (var i=0;i<monitoringInfoArr.length;i++) {
                var monitoringInfo = monitoringInfoArr[i];
                if (monitoringInfoArr.crossRefId) {
                    crossRefIdArr.push(monitoringInfo.crossRefId);
                    monitoringInfo.crossRefId = undefined;
                }
                cstaIdArr.push(monitoringInfo.cstaId);
            }
            if (crossRefIdArr.length>0) {
                stopServerMonitors(crossRefIdArr);
            }
            if (cstaIdArr.length>0) {
                startMonitorOnServerFunction(cstaIdArr);
            }
        }

        function startPresenceMonitoring(contacts) {
            var logger = serviceLogger.logMethodCall(arguments,eLogLevel.finer);

            var cstaIdArr = CstaDeviceId.createFromContactArray(contacts);

            return startMonitors(presenceMonitors, cstaIdArr, startServerPresenceMonitors);
        }

        function startDeviceMonitoring(cstaIdArr) {
            var logger = serviceLogger.logMethodCall(arguments,eLogLevel.finer);

            return startMonitors(deviceMonitors, cstaIdArr,startServerPresenceMonitors);

        }

        function stopMonitors(monitoringInfoArr, cstaIdArr) {
            var crossRefIdArr = [];
            for(var i=0;i<cstaIdArr.length;i++) {
                var cstaId = cstaIdArr[i];
                for(var j=monitoringInfoArr.length-1;j>=0;j--) {
                    var monitoringInfo = monitoringInfoArr[j];
                    if (monitoringInfo.cstaId.refersSameDevice(cstaId)) {
                        monitoringInfo.numOfMonitors--;
                        if (monitoringInfo.numOfMonitors==0) {
                            monitoringInfoArr.splice(j,1);
                            if (monitoringInfo.crossRefId) {
                                crossRefIdArr.push(monitoringInfo.crossRefId);
                            }
                        }
                    }
                }
            }
            if (crossRefIdArr.length>0) {
                stopServerMonitors(crossRefIdArr);
            }
        }

        function stopPresenceMonitors(contacts) {
            var cstaIdArr = CstaDeviceId.createFromContactArray(contacts);
            stopMonitors(presenceMonitors, cstaIdArr);
        }

        function stopDeviceMonitors(cstaIdArr) {
            stopMonitors(deviceMonitors, cstaIdArr);
        }

        function isPresenceMonitored(cstaId) {
            var index = indexOfMonitoringInfo(presenceMonitors,cstaId);
            return index!=-1;
        }

        function isDeviceMonitored(cstaId) {
            var index = indexOfMonitoringInfo(deviceMonitors,cstaId);
            return index!=-1;
        }

        function onConnectionRestored(event, loginSrv) {
            var logger = serviceLogger.logMethodCall(arguments,eLogLevel.finer);

            try {
                restoreMonitors(presenceMonitors, startServerPresenceMonitors);
                restoreMonitors(deviceMonitors, startServerDeviceMonitors);
            }catch(err){
                logger.error(err);
            }
        }

        function onLoggingOut(event, loginSrv) {
            if (loginSrv.isLoggedInWithEndpoint()) {
                var crossRefIdArr = [];
                var i;
                for(i=0;i<presenceMonitors.length;i++) {
                    var monitoringInfo = presenceMonitors[i];
                    if (monitoringInfo.crossRefId) {
                        crossRefIdArr.push(monitoringInfo.crossRefId);
                    }
                }

                for(i=0;i<presenceMonitors.length;i++) {
                    var monitoringInfo = deviceMonitors[i];
                    if (monitoringInfo.crossRefId) {
                        crossRefIdArr.push(monitoringInfo.crossRefId);
                    }
                }
                if (crossRefIdArr.length>0) {
                    stopServerMonitors(crossRefIdArr);
                }
                presenceMonitors = [];
                deviceMonitors = [];
            }
        }

        function onLoggedOut(event,loginSrv) {
             var logger = serviceLogger.logMethodCall(arguments,eLogLevel.finer);

             try {
                presenceMonitors = [];
                deviceMonitors = [];
             }catch(err){
                 logger.error(err);
             }
        }

        function onMonitorStartResponse(event, data) {
            var logger = serviceLogger.logMethodCall(arguments,eLogLevel.finer);

            try {
                var arr = data.monitorCrossRefID.split(",");
                var cstaIdArr = [];
                for (var i = 0; i < arr.length; i++) {
                    var s = arr[i];
                    var index = s.indexOf('@');

                    var monitorCrossRefID = s.substr(0,index);
                    var cstaId = new CstaDeviceId(s.substr(index + 1, s.length));

                    var monitoringInfo;

                    var monitoringInfoIndex = indexOfMonitoringInfo(presenceMonitors, cstaId);
                    if (monitoringInfoIndex!=-1) {
                        monitoringInfo = presenceMonitors[monitoringInfoIndex];
                        cstaIdArr.push(monitoringInfo.cstaId);
                    } else {
                        monitoringInfoIndex = indexOfMonitoringInfo(deviceMonitors, cstaId);
                        if (monitoringInfoIndex!=-1) {
                            monitoringInfo = device[monitoringInfoIndex];
                        }
                    }


                    if (monitoringInfo) {
                        if (monitoringInfo.crossRefId) {
                            logger.fine(monitoringInfo.cstaId," is already being monitored (crossRefId=",cstaId.crossRefId,")");
                            logger.fine("Stopping monitor ",monitorCrossRefID);
                            stopServerMonitor(monitorCrossRefID);
                        }else {
                            monitoringInfo.crossRefId = monitorCrossRefID;
                        }
                    }else {
                        logger.fine(cstaId," is not being monitored, stopping monitor ",monitorCrossRefID);
                        stopServerMonitors([monitorCrossRefID]);
                    }
                }
                if (cstaIdArr.length>0) {
                    var getPresencesRequest = new GetPresencesRequest(cstaIdArr);
                    infoSrv.sendRequest(getPresencesRequest);
                }
            }catch(err){
                logger.error(err);
            }
        }


        $rootScope.$on("loginSrv:connectionRestored",onConnectionRestored);
        $rootScope.$on("loginSrv:loggedOut",onLoggedOut);
        $rootScope.$on("infoSrv:MonitorStartResponse", onMonitorStartResponse);

        this.startPresenceMonitoring = startPresenceMonitoring;
        this.startDeviceMonitoring = startDeviceMonitoring
        this.stopPresenceMonitors = stopPresenceMonitors;
        this.stopDeviceMonitors = stopDeviceMonitors;
        this.isPresenceMonitored = isDeviceMonitored;
        this.isDeviceMonitored = isDeviceMonitored;
    }
]);