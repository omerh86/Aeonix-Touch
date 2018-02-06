

function ExternalCallSrv($rootScope, callsSrv) {

    var serviceLogger = logSrv.getLogger("externalCallSrv");


    function onOtherAppCall(event) {
        var logger = serviceLogger.logMethodCall(arguments, eLogLevel.finer);
        try {
            var calls = callsSrv.getCalls();
            for(var i = 0; i < calls.length; i++) {
                var call = calls[i];
                switch (call.State) {
                    case eCallState.Active:
                    case eCallState.Held:
                        callsSrv.holdCall(call);
                    break;
                    case eCallState.Calling:
                        callsSrv.terminateCall(call);
                    break;
                }
            }
        }catch(err) {
            logger.error(err);
        }
    }

    $rootScope.$on("app:phoneCall", onOtherAppCall);

}

var servicesModule = angular.module('aeonixApp.services');
servicesModule.service('externalCallSrv', ['$rootScope', 'callsSrv',ExternalCallSrv]);

