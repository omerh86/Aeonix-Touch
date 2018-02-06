function LocalPhoneSrv($rootScope, Call, infoSrv, loginSrv, connectionSrv) {

    var serviceLogger = logSrv.getLogger("callsSrv");

    var speakerOn = false

    function getCurrentUserName() {
        return loginSrv.getUserName();
    }

    function resetMembers() {
        speakerOn = false
    }

    function getMembers() {
        var o = {
            "speakerOn": speakerOn
        };
        return o;
    }

    function getCSTADeviceID () {
         return "N</sip:" + loginSrv.getEndpointId() + "@aeonix.com>" + loginSrv.getUserName();
    }

    function numberToSIPUrl(number){
        return "sip:" + number + "@" + connectionSrv.getServerAddress()+";transport=tcp";
    }

    function isSpeakerOn() {
        return speakerOn;
    }

    function getJsonCall (call) {
        var tempCall = new Call();
        tempCall.init(call);
        return angular.toJson(tempCall, true);
    }

    function toggleSpeaker() {
        speakerOn = !speakerOn;
        JSBridge.toggleSpeaker(speakerOn);
    }

    function muteCall(call, muted) {
        JSBridge.mute(muted);
    }

    function makeCall(alias) {
        JSBridge.makeCall(numberToSIPUrl(alias));
    }

    function answerCall(call) {
        JSBridge.answerCall(call.NativeToken);
    }

    function holdCall(call) {
        JSBridge.holdCall(call.NativeToken);
    }

    function sendDTMF(call, dtmf) {
        JSBridge.sendDTMF( dtmf);
    }

    function retrieveCall(call) {
        JSBridge.resumeCall(call.NativeToken);
    }

    function terminateCall(call) {
        JSBridge.terminateCall(call.NativeToken);
    }

    function transfer(callFrom, callTo) {
       JSBridge.transferCall(callFrom.NativeToken, callTo.NativeToken);
    }

    function divertCall(call, alias) {
        var tempCall = getJsonCall(call);
        //todo michael: send alias as a parameter
        JSBridge.redirect(tempCall, "sip:" + alias + "@" + connectionSrv.getServerAddress());
    }

    function conference(call1, call2) {
        var deviceID = getCSTADeviceID();
        var request = {
            SnapshotDevice: {
                snapshotObject: deviceID
            }
        };
        infoSrv.sendRequest(request);
    }

    function onLoggedOut() {
        resetMembers();
    }

    function onLoggedIn(event, loggedInWithEndpoint) {
        if (loggedInWithEndpoint) {

        }
    }

    function onConnectionRestored() {
        if (loginSrv.isLoggedInWithEndpoint()) {

        }
    }

    function onSnapshotDeviceResponse(event, response) {
        var logger = serviceLogger.logMethodCall(arguments,eLogLevel.finer);
        try {
            var heldCallID = "";
            var activeCallID = "";
            if (response.crossRefIDorSnapshotData.snapshotData.snapshotDeviceResponseInfo && response.crossRefIDorSnapshotData.snapshotData.snapshotDeviceResponseInfo.length >= 2) {
                if (response.crossRefIDorSnapshotData.snapshotData.snapshotDeviceResponseInfo[0].localCallState.simpleCallDetailedState == "callEstablished") {
                    heldCallID = response.crossRefIDorSnapshotData.snapshotData.snapshotDeviceResponseInfo[1].connectionIdentifier.callID[0];
                    activeCallID = response.crossRefIDorSnapshotData.snapshotData.snapshotDeviceResponseInfo[0].connectionIdentifier.callID[0];
                } else {
                    heldCallID = response.crossRefIDorSnapshotData.snapshotData.snapshotDeviceResponseInfo[0].connectionIdentifier.callID[0];
                    activeCallID = response.crossRefIDorSnapshotData.snapshotData.snapshotDeviceResponseInfo[1].connectionIdentifier.callID[0];
                }
                var deviceID = getCSTADeviceID();

                var obj = {
                    ConferenceCall: {
                        heldCall: {
                            callID: heldCallID,
                            deviceID: deviceID
                        },
                        activeCall: {
                            callID: activeCallID,
                            deviceID: deviceID
                        }
                    }
                };
                infoSrv.sendRequest(obj);
            }
        }catch(err){
            logger.error(err);
        }

    }


    $rootScope.$on("loginSrv:loggedOut", onLoggedOut);
    $rootScope.$on("loginSrv:loggedIn", onLoggedIn);
    $rootScope.$on("loginSrv:connectionRestored", onConnectionRestored);
    $rootScope.$on("infoSrv:SnapshotDeviceResponse", onSnapshotDeviceResponse);


    this._getCurrentUserName = getCurrentUserName;
    this._resetMembers = resetMembers;
    this._getMembers = getMembers;
    this._onLoggedOut = onLoggedOut;
    this._onLoggedIn = onLoggedIn;
    this._onConnectionRestored = onConnectionRestored;

    this.isSpeakerOn = isSpeakerOn;
    this.toggleSpeaker = toggleSpeaker;
    this.muteCall = muteCall;
    this.makeCall = makeCall;
    this.answerCall = answerCall;
    this.holdCall = holdCall;
    this.retrieveCall = retrieveCall;
    this.terminateCall = terminateCall;
    this.divertCall = divertCall;
    this.transfer = transfer;
    this.conference = conference;
    this.sendDTMF = sendDTMF;

}

var servicesModule = angular.module('aeonixApp.services');
servicesModule.service('localPhoneSrv', ['$rootScope', 'Call', 'infoSrv', 'loginSrv', 'connectionSrv', LocalPhoneSrv]);

