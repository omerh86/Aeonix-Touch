

function PrimaryCallSrv($rootScope, callsSrv, $state) {

    var serviceLogger = logSrv.getLogger("primaryCallSrv");

    var primaryCall;

    var statePriority = {};

    function init() {

        statePriority[eCallState.Released]=-100;
        var i=0;
        statePriority[eCallState.End]=i++;
        statePriority[eCallState.Error]=i++;
        statePriority[eCallState.Hold]=i++;
        statePriority[eCallState.Held]=i++;
        statePriority[eCallState.Incoming]=i++;
        statePriority[eCallState.Active]=i++;
        statePriority[eCallState.Calling]=i++;

    }

    function onCallStateChanged(event, call, state, detailedState, prevState, prevDetailedState) {
        var logger = serviceLogger.logMethodCall(arguments, eLogLevel.finer);

        try {
            if (primaryCall==null
                || (primaryCall==call && state==eCallState.Released)) {
                evaluatePrimaryCall();
            }else if (call.State==eCallState.Calling || call.State==eCallState.Incoming) {
                setPrimaryCall(call);
            }else if(call.replacedCall && call.replacedCall==primaryCall) {
                primaryCall = call;
                $rootScope.$broadcast("primaryCallSrv:primaryCallChanged", primaryCall);
            }
        }catch(err){
            logger.error(err);
        }
    }

    function evaluatePrimaryCall() {
        var calls = callsSrv.getCalls();
        var primaryCall=null;
        var priority=-1;
        for (var i=0;i<calls.length;i++) {
            var call=calls[i];
            var p = statePriority[call.State];
            if (p>priority) {
                primaryCall = call;
            }
        }
        setPrimaryCall(primaryCall);
    }

    function getPrimaryCall() {
        return primaryCall;
    }

    function setPrimaryCall(call) {
        if (primaryCall!=call) {
            if (primaryCall) {
                var state = primaryCall.State;
                if (state==eCallState.End || state==eCallState.Error) {
                    callsSrv.terminateCall(primaryCall);
                }
            }
            primaryCall = call;
            $rootScope.$broadcast("primaryCallSrv:primaryCallChanged", primaryCall);
            if (primaryCall) {
                if ($state.current.name!="home.calls") {
                    $state.go("home.calls");
                }
            }
        }
    }

    $rootScope.$on("callsSrv:callStateChanged", onCallStateChanged);
    init();

    this._init = init;
    this._onCallStateChanged = onCallStateChanged;
    this._evaluatePrimaryCall = evaluatePrimaryCall;
    this.getPrimaryCall = getPrimaryCall;
    this.setPrimaryCall = setPrimaryCall;

}

var servicesModule = angular.module('aeonixApp.services');
servicesModule.service('primaryCallSrv', ['$rootScope', 'callsSrv','$state', PrimaryCallSrv]);

