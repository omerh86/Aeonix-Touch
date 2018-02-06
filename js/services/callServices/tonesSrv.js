

function TonesSrv($rootScope, callsSrv, primaryCallSrv, deviceSrv, settingsSrv) {

    var serviceLogger = logSrv.getLogger("tonesSrv");

    var eRingType = {
        busy: {value: 1, name: "busy"},
        reorder: {value: 2, name: "reorder"},
        incomingCall: {value: 3, name: "incoming"}
    }

    var currentRingType = null;
    var isPlaying = false;
    var isVibrating = false;

    function getCurrentType() {
        return currentRingType;
    }

    function getMembers() {
            var o = {
                "currentRingType":currentRingType
            };
            return o;
    }


    function evaluateRingState(primaryCall, visible) {

        var logger = serviceLogger.logMethodCall(arguments,eLogLevel.finer);

        var ringType = null;
        if (visible && primaryCall) {
            var state = primaryCall.State;
            if (state==eCallState.Incoming) {
                var connectedCall = callsSrv.getConnectedCall();
                if (!connectedCall) {
                    ringType = eRingType.incomingCall;
                }
            }else if (state==eCallState.Error) {
                if (primaryCall.ErrorReason == eCallErrorReason.Busy) {
                    ringType = eRingType.busy;
                }else {
                    ringType = eRingType.reorder;
                }
            }
        }
        if (currentRingType!=ringType) {
            if (currentRingType) {
                if (isPlaying) {
                    JSBridge.stopPlayingFile();
                    isPlaying = false;
                }
                if (isVibrating) {
                    JSBridge.stopVibration();
                    isVibrating = false;
                }
            }
            currentRingType = ringType;
            if (currentRingType==eRingType.busy) {
                JSBridge.playFile("busy", true);
                isPlaying = true;

            }else if (currentRingType==eRingType.reorder) {
                JSBridge.playFile("reorder", true);
                isPlaying = true;
            }else if (currentRingType==eRingType.incomingCall) {
                if (settingsSrv.getSettings().notifications.ringOnIncomingCall) {
                    JSBridge.playFile(settingsSrv.getSettings().sound, true);
                    isPlaying = true;
                }
                if (settingsSrv.getSettings().notifications.vibrateOnIncomingCall) {
                    JSBridge.vibrateContinuously();
                    isVibrating = true;
                }
            }
        }

        logger.logMethodCompleted(arguments, getMembers(), eLogLevel.finer);
    }

    function onPrimaryCallChanged(event, primaryCall) {

        var logger = serviceLogger.logMethodCall(arguments,eLogLevel.finer);

        try {
            evaluateRingState(primaryCall, !deviceSrv.getIsAppInBackground());
        }catch(err){
            logger.error(err);
        }



        logger.logMethodCompleted(arguments, getMembers(), eLogLevel.finer);
    }

    function onAppVisibilityChanged(event, visible) {

        var logger = serviceLogger.logMethodCall(arguments,eLogLevel.finer);

        try {
            evaluateRingState(primaryCallSrv.getPrimaryCall(), visible);
        }catch(err){
            logger.error(err);
        }

        logger.logMethodCompleted(arguments, getMembers(), eLogLevel.finer);
    }

    function onCallStateChanged(event, call) {

        var logger = serviceLogger.logMethodCall(arguments,eLogLevel.finer);

        try {
            evaluateRingState(primaryCallSrv.getPrimaryCall(), !deviceSrv.getIsAppInBackground());
        }catch(err){
            logger.error(err);
        }

        logger.logMethodCompleted(arguments, getMembers(), eLogLevel.finer);
    }


    $rootScope.$on("callsSrv:callStateChanged", onCallStateChanged);
    $rootScope.$on("primaryCallSrv:primaryCallChanged", onPrimaryCallChanged);
    $rootScope.$on("deviceSrv:appVisibilityChanged", onAppVisibilityChanged);



    this._getCurrentType = getCurrentType;
    this._evaluateRingState = evaluateRingState;
    this._onPrimaryCallChanged = onPrimaryCallChanged;
    this._onAppVisibilityChanged = onAppVisibilityChanged;
    this._onCallStateChanged = onCallStateChanged;

}

var servicesModule = angular.module('aeonixApp.services');
servicesModule.service('tonesSrv', ['$rootScope', 'callsSrv', 'primaryCallSrv', 'deviceSrv','settingsSrv', TonesSrv]);

