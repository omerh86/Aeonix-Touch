function KeyPadLink(call, callsSrv) {
    this.callNativeToken = call.NativeToken;
    this.callsSrv = callsSrv;
}

KeyPadLink.prototype.isRelevant = function() {
    var index = this.callsSrv.findCallByNativeToken(this.callNativeToken);
    if (index==-1) return false;
    var call = this.callsSrv.getCalls()[index];
    return call && call.isActive();
}

KeyPadLink.prototype.goBack = function($state) {
    var params = {};
    params.callNativeToken = this.callNativeToken;
    $state.go('home.keypad', params);
}


function KeypadController($rootScope, $scope, $timeout, $state,  $stateParams, callsSrv, backNavigationSrv, contactSrv, localPhoneSrv, phoneSrv) {

    var controllerLogger = logSrv.getLogger("keypadController");

    var canvasInput;


    function getScope() {
        return scope;
    }

    function initKeypadKeys() {
        $scope.keypadKeys = [
            {
                digit : "1",
                letters: ""
            },
            {
                digit : "2",
                letters: "ABC"
            },
            {
                digit : "3",
                letters: "DEF"
            },
            {
                digit : "4",
                letters: "GHI"
            },
            {
                digit : "5",
                letters: "JKL"
            },
            {
                digit : "6",
                letters: "MNO"
            },
            {
                digit : "7",
                letters: "PQRS"
            },
            {
                digit : "8",
                letters: "TUV"
            },
            {
                digit : "9",
                letters: "WXYZ"
            },
            {
                digit : "*",
                letters: ""
            },
            {
                digit : "0",
                letters: "+"
            },
            {
                digit : "#",
                letters: ""
            }
        ];
    }

     //We don't use directive for the canvas for performance reasons (directive is slow on iphone).
    function initCanvasInput() {
        var canvasElement = document.getElementById('canvas');
        canvasInput = new CanvasInput(
            {
                canvas: canvasElement,
                fontSize: 29,
                fontFamily: 'sans-serif',
                fontColor: '#4a4a4a',
                fontWeight: '300',
                width: canvasElement.offsetWidth - 20,
                borderWidth: 0,
                borderRadius: 0,
                boxShadow: 'none',
                readonly:true,
                innerShadow: 'none',
                placeHolder: ''
            }
        );
        canvasInput.value($scope.keys);
    }

    function onStateChangeStart(event, toState, toParams, fromState, fromParams, options) {
        if (!backNavigationSrv.isGoingBack() && $scope.call.isActive()) {
            backNavigationSrv.addToBackStack(new KeyPadLink($scope.call, callsSrv));
        }
    }

    function onDestroy() {
       angularUtils.unregisterController('keypadController', $scope);
    };


    function onKeysChanged () {
        canvasInput.value($scope.keys);
    };

    $scope.addLetter = function(letter){
        if ($scope.keys) {
            $scope.keys += letter;
        }else {
            $scope.keys = letter;
        }

        canvasInput.value($scope.keys);
        callsSrv.sendDTMF($scope.call, letter);
    };

    $scope.removeLetter = function(){
        if($scope.keys.length > 0){
            $scope.keys = $scope.keys.substr(0, $scope.keys.length - 1);
            canvasInput.value($scope.keys);
        }
    };

    $scope.eraseKeys = function(){
        $scope.keys = '';
        canvasInput.value($scope.keys);
    };

    $scope.hideKeypad = function(){
        $state.go("home.calls");
    };

    $scope.toggleMute = function(call) {
        var logger = controllerLogger.logMethodCall(arguments,eLogLevel.finer);
        try {
            call.isMuted = !call.isMuted;
            phoneSrv.muteCall(call, call.isMuted);
        } catch (err) {
            controllerLogger.error(err)
        }
        logger.logMethodCompleted(arguments, $scope, eLogLevel.finer);
    };

    $scope.toggleSpeaker = function() {
        var logger = controllerLogger.logMethodCall(arguments,eLogLevel.finer);

        $scope.isSpeakerOn = !$scope.isSpeakerOn;
        localPhoneSrv.toggleSpeaker();

        logger.logMethodCompleted(arguments, $scope, eLogLevel.finer);
    }

    function onCallStateChanged(event, call, state, detailedState, prevState, prevDetailedState) {
        var logger = controllerLogger.logMethodCall(arguments,eLogLevel.finer);

        if (call==$scope.call && !call.isActive()) {
            backNavigationSrv.goBack();
        }
    }

    function init(){
        angularUtils.registerController('keypadController', $scope);

        initKeypadKeys();
        var index = callsSrv.findCallByNativeToken($stateParams.callNativeToken);
        $scope.call = callsSrv.getCalls()[index];
        $scope.isSpeakerOn = localPhoneSrv.isSpeakerOn();
        if ($scope.call.dtmfSequence) {
            $scope.keys = $scope.call.dtmfSequence;
        }
        $timeout(initCanvasInput, 50);

        $scope.$on('$stateChangeStart',onStateChangeStart);
        $scope.$on("$destroy", onDestroy);

        $scope.$on("callsSrv:callStateChanged", onCallStateChanged);

        $rootScope.showBack(true);
    };

    this._getScope =  getScope;
    this._initKeypadKeys = initKeypadKeys;
    this._initCanvasInput  = initCanvasInput;
    this._onDestroy = onDestroy;
    this._init =init;

    init();

}

var controllersModule = angular.module('aeonixApp.controllers');

controllersModule.controller('keypadController', ['$rootScope', '$scope', '$timeout', '$state',  '$stateParams', 'callsSrv', 'backNavigationSrv','contactSrv','localPhoneSrv','phoneSrv', KeypadController]);