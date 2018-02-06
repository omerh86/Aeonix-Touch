
function CallQueueLink(callsSrv) {
    this.callsSrv = callsSrv;
}

CallQueueLink.prototype.isRelevant = function() {
    var calls= this.callsSrv.getActiveCalls();
    return calls.length>0;
}

CallQueueLink.prototype.goBack = function($state) {
    $state.go("home.queue");
}


function CallQueueController($scope, $rootScope, $state, callsSrv, primaryCallSrv, backNavigationSrv) {

    var controllerLogger = logSrv.getLogger("callQueueController");

    function onStateChangeStart(event, toState, toParams, fromState, fromParams, options) {
        if (!backNavigationSrv.isGoingBack()) {
            backNavigationSrv.addToBackStack(new CallQueueLink(callsSrv));
        }
    }

    function onDestroy() {

    }


    $scope.showCall = function(call){
        primaryCallSrv.setPrimaryCall(call);
        $state.go('home.calls')
    };

    function init(){
        $rootScope.showBack(true);
        $scope.queueList = callsSrv.getCalls();

        $scope.$on('$stateChangeStart',onStateChangeStart);
        $scope.$on("$destroy", onDestroy);
    };


    init();
}

var controllersModule = angular.module('aeonixApp.controllers');
controllersModule.controller('callQueueController', ['$scope', '$rootScope', '$state', 'callsSrv', 'primaryCallSrv', 'backNavigationSrv',CallQueueController]);