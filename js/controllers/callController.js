function CallLink(callsSrv, primaryCallSrv, callNativeToken) {
    this.callsSrv = callsSrv;
    this.callNativeToken = callNativeToken;
    this.primaryCallSrv = primaryCallSrv;
}

CallLink.prototype.isRelevant = function() {
    var index = this.callsSrv.findCallByNativeToken(this.callNativeToken);
    if (index==-1) return false;
    var call = this.callsSrv.getCalls()[index];
    return call && call.$state!==eCallDetailedState.End && call.$state!==eCallDetailedState.Released;

}

CallLink.prototype.goBack = function($state) {
    var index = this.callsSrv.findCallByNativeToken(this.callNativeToken);
    var call = this.callsSrv.getCalls()[index];
    primaryCallSrv.setPrimaryCall(call);
    state.go("home.calls");
}

function CallController($scope, $rootScope, $state, callsSrv, primaryCallSrv, localPhoneSrv, phoneSrv, backNavigationSrv) {

    var controllerLogger = logSrv.getLogger("callController");

    function toggleSpeaker() {
        var logger = controllerLogger.logMethodCall(arguments,eLogLevel.finer);

        $scope.isSpeakerOn = !$scope.isSpeakerOn;
        localPhoneSrv.toggleSpeaker();

        logger.logMethodCompleted(arguments, $scope, eLogLevel.finer);
    }

    function toggleMute (call) {
        var logger = controllerLogger.logMethodCall(arguments,eLogLevel.finer);
        try {
            call.isMuted = !call.isMuted;
            phoneSrv.muteCall(call, call.isMuted);
        } catch (err) {
            controllerLogger.error(err)
        }
        logger.logMethodCompleted(arguments, $scope, eLogLevel.finer);
    };

    function onPrimaryCallChanged(event, primaryCall) {
        var logger = controllerLogger.logMethodCall(arguments,eLogLevel.finer);
        $scope.primaryCall = primaryCall;
        if (!primaryCall) {
            backNavigationSrv.goBack();
        }else {
            refreshCalculatedData();
        }
        logger.logMethodCompleted(arguments, $scope, eLogLevel.finer);
    }

    function addCall() {
        var logger = controllerLogger.logMethodCall(arguments,eLogLevel.finer);
        $scope.showFavorites();
    }

    function onStateChangeStart(event, toState, toParams, fromState, fromParams, options) {
        var logger = controllerLogger.logMethodCall(arguments,eLogLevel.finer);
        if (!backNavigationSrv.isGoingBack()) {
            if ($scope.primaryCall && $scope.primaryCall.State!=eCallState.Released) {
                var nativeToken = $scope.primaryCall.NativeToken;
                var callLink = new CallLink(callsSrv, nativeToken);
                backNavigationSrv.addToBackStack(callLink);
            }
        }
    }

    function onDestroy() {

    }


    function evaluateTransferCandidates() {

        var logger = controllerLogger.logMethodCall(arguments,eLogLevel.finer);

        var candidates = [];
        var calls = callsSrv.getCalls();
        for (var i=0;i<calls.length;i++) {
            var call = calls[i];
            if ($scope.primaryCall!=call && call.State==eCallState.Hold) {
                candidates.push(call);
            }
        }

        logger.logMethodCompleted(arguments, candidates, eLogLevel.finer);

        return candidates;

    }

    function evaluateConferenceCandidates() {
        var logger = controllerLogger.logMethodCall(arguments,eLogLevel.finer);

        var candidates = [];
        var calls = callsSrv.getCalls();
        for (var i=0;i<calls.length;i++) {
            var call = calls[i];
            if ($scope.primaryCall!=call && call.isActive()) {
                candidates.push(call);
            }
        }

        logger.logMethodCompleted(arguments, candidates, eLogLevel.finer);

        return candidates;

    }

    function refreshCalculatedData() {
        var logger = controllerLogger.logMethodCall(arguments,eLogLevel.finer);

        $scope.transferCandidates = evaluateTransferCandidates();
        $scope.conferenceCandidates = evaluateConferenceCandidates();
        $scope.transferEnabled = $scope.primaryCall && $scope.primaryCall.State==eCallState.Active;
        $scope.conferenceEnabled = $scope.primaryCall && $scope.primaryCall.isActive();

        logger.logMethodCompleted(arguments, $scope, eLogLevel.finer);
    }

    function onCallStateChanged() {
        refreshCalculatedData();
    }

    function onOpenMenu($mdMenu, $event) {
        $mdMenu.open($event);
    }

    function transferTo(call) {
        callsSrv.transfer($scope.primaryCall, call);
    }

    function conferenceWith(call) {
        callsSrv.conference($scope.primaryCall, call);
    }

    function showKeypad() {
        var params = {
            callNativeToken:$scope.primaryCall.NativeToken
        }
        $state.go("home.keypad", params);
    }

    function init() {

        var logger = controllerLogger.logMethodCall(arguments,eLogLevel.finer);

        $scope.toggleSpeaker = toggleSpeaker;
        $scope.toggleMute = toggleMute;

        $rootScope.showBack(false);
        $scope.isSpeakerOn = localPhoneSrv.isSpeakerOn();


        $scope.onOpenMenu = onOpenMenu;
        $scope.transferTo = transferTo;
        $scope.conferenceWith = conferenceWith;
        $scope.addCall = addCall;
        $scope.showKeypad = showKeypad;

        refreshCalculatedData();

        $scope.$on('$stateChangeStart',onStateChangeStart);
        $scope.$on("$destroy", onDestroy);
        $scope.$on('callsSrv:callStateChanged',onCallStateChanged);
        $scope.$on('primaryCallSrv:primaryCallChanged',onPrimaryCallChanged);

        logger.logMethodCompleted(arguments, $scope, eLogLevel.finer);

    }



    init();

}

var controllersModule = angular.module('aeonixApp.controllers');
controllersModule.controller('callController', ['$scope', '$rootScope','$state','callsSrv', 'primaryCallSrv', 'localPhoneSrv', 'phoneSrv', 'backNavigationSrv', CallController]);
