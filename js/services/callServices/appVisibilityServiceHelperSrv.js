function AppVisibilityServiceHelperSrv($rootScope, callsSrv) {

    var serviceLogger = logSrv.getLogger("appVisibilityServiceHelperSrv");

    function onCallStateChanged(event, call, state) {
        var logger = serviceLogger.logMethodCall(arguments,eLogLevel.finer);
        try {
            if (state==eCallState.Incoming) {
                JSBridge.onIncomingCall();
            }else if(arrayUtils.isEmpty(callsSrv.getCalls())) {
                JSBridge.onNoCalls();
            }
        }catch(err){
            logger.error(err);
        }

    }

    $rootScope.$on("callsSrv:callStateChanged", onCallStateChanged);
}

var servicesModule = angular.module('aeonixApp.services');
servicesModule.service('appVisibilityServiceHelperSrv', ['$rootScope', 'callsSrv',AppVisibilityServiceHelperSrv]);

