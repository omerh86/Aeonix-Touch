

function CallsSrv(Call, contactSrv, connectionSrv, phoneSrv, $timeout, $rootScope) {

    var serviceLogger = logSrv.getLogger("callsSrv");

    var calls = [];


    var pendingOperation;
    var pendingOperationParams;
    var holdTimeout;

    function getMembers() {
        var o = {
            "calls":calls,
            "pendingOperation":pendingOperation,
            "pendingOperationParams":pendingOperationParams,
            "holdTimeout":holdTimeout
        };
        return o;
    }


    function onHoldTimeoutExpired() {
        var logger = serviceLogger.logMethodCall(arguments,eLogLevel.finer);

        pendingOperation = null;
        pendingOperationParams = null;
        holdTimeout = null;

    }

    function getConnectedCall() {
        var logger = serviceLogger.logMethodCall(arguments,eLogLevel.finer);

        var connectedCall = null;

        for(var i=0;i<calls.length;i++) {
            var call = calls[i];
            if (call.State===eCallState.Active
                || call.State===eCallState.Held) {
                connectedCall = call;
                break;
            }
        }

        logger.logMethodCompleted(arguments, getMembers(), eLogLevel.finer);

        return connectedCall;
    }

    function makeCall(contact) {
        var logger = serviceLogger.logMethodCall(arguments,eLogLevel.finer);

        var connected = getConnectedCall();
        if (connected!=null) {
          var params = [contact];
          holdCallAndExecute(connected,makeCall,params);
        }else {
            var alias = contact.getAlias();
            phoneSrv.makeCall(alias, false);
        }
        
        logger.logMethodCompleted(arguments, getMembers(), eLogLevel.finer);
    };


    function holdCallAndExecute(call, operation, params) {
        var logger = serviceLogger.logMethodCall(arguments,eLogLevel.finer);

        if (!pendingOperation) {
            pendingOperation = operation;
            pendingOperationParams = params;
            holdTimeout = $timeout(onHoldTimeoutExpired,30000, true);
            phoneSrv.holdCall(call);
        }
        
        logger.logMethodCompleted(arguments, getMembers(), eLogLevel.finer);
    }


    function onCallStateChanged(event, call) {
        var logger = serviceLogger.logMethodCall(arguments,eLogLevel.finer);

        try {
            call.From = decodeURIComponent(call.From);
            call.To = decodeURIComponent(call.To);
            if (isTR87Call(call)) {
                connectionSrv.onCallStateChanged(call);
            }
            else  {
                handleCallStateChanged(call);
            }
        }catch(err){
            logger.error(err);
        }


        
        logger.logMethodCompleted(arguments, getMembers(), eLogLevel.finer);
    };

    function isTR87Call(obj) {
        var logger = serviceLogger.logMethodCall(arguments,eLogLevel.finer);

        var tr87Call =  obj.To && obj.To.indexOf(CSTA_CALL) != -1 && obj.To.length==CSTA_CALL.length;
        
        logger.logMethodCompleted(arguments, tr87Call, eLogLevel.finer);
        
        return tr87Call;
    }


    function getCallState(detailedState, currentState) {
        var logger = serviceLogger.logMethodCall(arguments,eLogLevel.finer);

        var state;
        switch(detailedState) {
            case eCallDetailedState.IncomingReceived:
            case eCallDetailedState.IncomingEarlyMedia:
            case eCallDetailedState.UpdatedByRemote:
                state = eCallState.Incoming;
                break;
            case eCallDetailedState.Connected:
            case eCallDetailedState.StreamsRunning:
            case eCallDetailedState.Pausing:
                state = eCallState.Active;
                break;
            case eCallDetailedState.OutgoingInit:
            case eCallDetailedState.OutgoingEarlyMedia:
            case eCallDetailedState.OutgoingProgress:
            case eCallDetailedState.OutgoingRinging:
                state = eCallState.Calling;
                break;
            case eCallDetailedState.Paused:
                state = eCallState.Hold;
                break;
            case eCallDetailedState.PausedByRemote:
                state = eCallState.Held;
                break;
            case eCallDetailedState.Error:
                state = eCallState.Error;
                break;
            case eCallDetailedState.End:
                state = eCallState.End;
                break;            
            default:
               state = currentState;
        }

        logger.logMethodCompleted(arguments, state, eLogLevel.finer);

        return state;
    }

    function getCallErrorReason(sysMsg) {
        var logger = serviceLogger.logMethodCall(arguments,eLogLevel.finer);

        var errorReason;
        if (sysMsg == "Busy Here") {
           errorReason = eCallErrorReason.Busy;
        } else if (sysMsg == "Temporarily Unavailable") {
           errorReason = eCallErrorReason.Offline;
        } else if (sysMsg == "Not Found" || sysMsg == "Not Acceptable Here") {
           errorReason = eCallErrorReason.NotFound;
        }else if (sysMsg == "Call declined.") {
           errorReason = eCallErrorReason.DND;
        } else {
           errorReason = eCallErrorReason.Unknown;
        }

        logger.logMethodCompleted(arguments, errorReason, eLogLevel.finer);
        return errorReason;
    }

    function handleCallStateChanged(callData) {
        var logger = serviceLogger.logMethodCall(arguments,eLogLevel.finer);

        var index = findCallByCallData(callData);
        
        
        var newCallState;
        

        var call;
        var prevState;
        var prevDetailedState;
        if (index==-1) {
            newCallState = getCallState(callData.DetailedState, eCallState.Idle);
            if (newCallState==eCallState.Incoming || newCallState==eCallState.Calling) {
                call = new Call();
                call.init(callData);
                calls.push(call);
                newCallState = eCallState.Incoming;
                prevState = eCallState.Idle;
                prevDetailedState = eCallDetailedState.Idle;
            }
        }else {
            call= calls[index];
            prevState = call.State;
            prevDetailedState = call.DetailedState;
            newCallState = getCallState(callData.DetailedState, call.State);
            call.update(callData);
        }
        if (call) {
            call.State = newCallState;
            if (call.ReplacedCallNativeToken) {
                var replacedCallIndex = findCallByNativeToken(call.ReplacedCallNativeToken);
                if (replacedCallIndex!=-1) {
                    var replacedCall = calls[replacedCallIndex];
                    replacedCall.State = eCallState.Transferred;
                    call.replacedCall = replacedCall;
                    replacedCall.replacedByCall = call;
                }
            }
            if (call.State == eCallState.Error && call.DetailedState!=eCallDetailedState.Released) {
                call.ErrorReason = getCallErrorReason(callData.SysMsg);
                call.terminateCallTimeout = $timeout(function(){onTerminateCallTimeoutExpired(call);}, 7000, true);
            } else if (call.State == eCallState.End && call.DetailedState!=eCallDetailedState.Released) {
                call.terminateCallTimeout = $timeout(function(){onTerminateCallTimeoutExpired(call);}, 3000, true);
            } else {
                updateCallContact(call);
            }


            if (prevState!=call.State) {
                $rootScope.$broadcast("callsSrv:callStateChanged", call, call.State, call.DetailedState, prevState, prevDetailedState);
            }else {
                $rootScope.$broadcast("callsSrv:callDetailedStateChanged", call, call.State, call.DetailedState, prevState, prevDetailedState);
            }

            checkPendingOperation();
        }

        logger.logMethodCompleted(arguments, getMembers(), eLogLevel.finer);
    }


    function checkPendingOperation() {
        var logger = serviceLogger.logMethodCall(arguments,eLogLevel.finer);

        if (pendingOperation) {
            var connectedCall = getConnectedCall();
            if (!connectedCall) {
                $timeout.cancel(holdTimeout);
                holdTimeout = null;
                pendingOperation.apply(this,pendingOperationParams);
                pendingOperation = null;
                pendingOperationParams = null;
            }
        }

        logger.logMethodCompleted(arguments, getMembers(), eLogLevel.finer);
    }

    function onTerminateCallTimeoutExpired(call) {
        var logger = serviceLogger.logMethodCall(arguments,eLogLevel.finer);

        call.terminateCallTimeout = null;
        terminateCall(call);

        logger.logMethodCompleted(arguments, getMembers(), eLogLevel.finer);
    }

    function getCalls() {
        return calls;
    }

    function getActiveCalls() {
        var logger = serviceLogger.logMethodCall(arguments,eLogLevel.finer);

        var activeCalls = [];
        for (var i=0; i< calls.length; i++) {
            var call = calls[i];
            if (call.isActive()) {
                activeCalls.push(call);
            }
        }

        logger.logMethodCompleted(arguments, activeCalls, eLogLevel.finer);
        return activeCalls;
    }

    function findCallByState(calls, state) {
        var call;
        for(var i=0;i<calls.length;i++) {
            if (calls[i].State==state) {
                call = calls[i];
                break;
            }
        }
        return call;
    }

    function findCallByCallData(callData) {
        var logger = serviceLogger.logMethodCall(arguments,eLogLevel.finer);

        var index=-1;
        if (callData.DetailedState == eCallDetailedState.OutgoingInit) {
            for (var i = 0; i < calls.length; i++) {
                if (calls[i].State == eCallState.Calling
                && calls[i].contact.getAlias()==callData.To) {
                    index=i;
                    break;
                }
            }
        }else {
            for (var i = 0; i < calls.length; i++) {
                if (calls[i].NativeToken == callData.NativeToken) {
                    index=i
                    break;
                }
            }
        }

        logger.logMethodCompleted(arguments, index, eLogLevel.finer);

        return index;
    }

    function findCallByNativeToken(token) {
        var logger = serviceLogger.logMethodCall(arguments,eLogLevel.finer);

        var index = -1;
        for (var i = 0; i < calls.length; i++) {
            if (calls[i].NativeToken == token) {
                index=i
                break;
            }
        }

        logger.logMethodCompleted(arguments, index, eLogLevel.finer);
        return index;
    }

    function findCall(call) {
        var logger = serviceLogger.logMethodCall(arguments,eLogLevel.finer);

        var index = calls.indexOf(call);

        logger.logMethodCompleted(arguments, index, eLogLevel.finer);
        return index;
    }

    function updateCallContact(call) {
        var logger = serviceLogger.logMethodCall(arguments,eLogLevel.finer);

        if (call.pAsserted=="Conference") {
            if (!(call.contact) || call.contact.internal.type!=eContactType.nWayConference) {
                call.contact = Contact.createNWayConference();
            }
        }else if (call.isAnonymous()) {
            call.contact = Contact.anonymousContact;
        }else {
            var alias = call.getRemoteNumber();
            call.contact = contactSrv.getContactByAlias(alias);
        }

        logger.logMethodCompleted(arguments, call, eLogLevel.finer);
    }

    function releaseCall(call) {
        var logger = serviceLogger.logMethodCall(arguments,eLogLevel.finer);

        if (call.State==eCallState.Error) {
           $timeout.cancel(call.terminateCallTimeout);
           call.terminateCallTimeout = null;
        }
        var prevState = call.State;
        call.State = eCallState.Released;
        var index = calls.indexOf(call);
        if (index!=-1) {
            calls.splice(index,1);
        }
        $rootScope.$broadcast("callsSrv:callStateChanged", call, call.State, call.DetailedState, prevState, call.DetailedState);

        logger.logMethodCompleted(arguments, getMembers(), eLogLevel.finer);
    }

    function makeCallToContact(contact) {
        var logger = serviceLogger.logMethodCall(arguments,eLogLevel.finer);

        makeCall(contact);

        logger.logMethodCompleted(arguments, getMembers(), eLogLevel.finer);
    };

    function makeCallToAlias(alias) {
        var logger = serviceLogger.logMethodCall(arguments,eLogLevel.finer);

        var contact = contactSrv.getContactByAlias(alias);
        makeCall(contact);

        logger.logMethodCompleted(arguments, getMembers(), eLogLevel.finer);
    };

    function answerCall(call) {
        var logger = serviceLogger.logMethodCall(arguments,eLogLevel.finer);

        var connected = getConnectedCall();
        if (connected!=null) {
          var params = [call];
          holdCallAndExecute(connected,answerCall,params);
        }else {
            phoneSrv.answerCall(call);
        }

        logger.logMethodCompleted(arguments, getMembers(), eLogLevel.finer);
    };

    function holdCall(call) {
        var logger = serviceLogger.logMethodCall(arguments,eLogLevel.finer);

        phoneSrv.holdCall(call);

        logger.logMethodCompleted(arguments, getMembers(), eLogLevel.finer);
    };

    function retrieveCall(call) {
        var logger = serviceLogger.logMethodCall(arguments,eLogLevel.finer);

        var connected = getConnectedCall();
        if (connected!=null) {
          var params = [call];
          holdCallAndExecute(connected,retrieveCall,params);
        }else {
            phoneSrv.retrieveCall(call);
        }

        logger.logMethodCompleted(arguments, getMembers(), eLogLevel.finer);
    };

    function sendDTMF(call, dtmf) {
        var logger = serviceLogger.logMethodCall(arguments,eLogLevel.finer);

        if (stringUtils.isEmpty(call.dtmfSequence)) {
            call.dtmfSequence = dtmf;
        }else {
            call.dtmfSequence+=dtmf;
        }

        phoneSrv.sendDTMF(call,dtmf);


        logger.logMethodCompleted(arguments, getMembers(), eLogLevel.finer);
    }

    function terminateCall(call) {
        var logger = serviceLogger.logMethodCall(arguments,eLogLevel.finer);

        releaseCall(call);

        if (call.DetailedState!=eCallDetailedState.Released) {
            phoneSrv.terminateCall(call);
        }

        logger.logMethodCompleted(arguments, getMembers(), eLogLevel.finer);
    };


    function transfer(callFrom, callTo) {
        var logger = serviceLogger.logMethodCall(arguments,eLogLevel.finer);

        releaseCall(callFrom);
        releaseCall(callTo);

        phoneSrv.transferCall(callFrom, callTo);

        logger.logMethodCompleted(arguments, getMembers(), eLogLevel.finer);
    };


    function conference(call1, call2) {
        var logger = serviceLogger.logMethodCall(arguments,eLogLevel.finer);

        var arr = [call1, call2];

        var connectedCall = findCallByState(arr, eCallState.Active);
        var heldCall = findCallByState(arr, eCallState.Hold);

        if (connectedCall && heldCall) {
            phoneSrv.conference(connectedCall, heldCall);
        }

        logger.logMethodCompleted(arguments, getMembers(), eLogLevel.finer);
    };
    
    $rootScope.$on("linphone:CallStateChanged", onCallStateChanged);

    this._onHoldTimeoutExpired=onHoldTimeoutExpired;
    this._makeCall=makeCall;
    this._holdCallAndExecute=holdCallAndExecute;
    this._isTR87Call=isTR87Call;
    this._getCallState=getCallState;
    this._getCallErrorReason=getCallErrorReason;
    this._handleCallStateChanged=handleCallStateChanged;
    this._onCallStateChanged=onCallStateChanged;
    this._checkPendingOperation=checkPendingOperation;
    this._onTerminateCallTimeoutExpired=onTerminateCallTimeoutExpired;
    this._findCallByCallData=findCallByCallData;
    this._updateCallContact=updateCallContact;
    this._releaseCall = releaseCall;
    this._findCallByState = findCallByState;


    this.getCalls=getCalls;
    this.getActiveCalls = getActiveCalls;
    this.getConnectedCall=getConnectedCall;
    this.findCallByNativeToken=findCallByNativeToken;
    this.findCall=findCall;
    this.makeCallToContact=makeCallToContact;
    this.makeCallToAlias=makeCallToAlias;
    this.answerCall=answerCall;
    this.holdCall=holdCall;
    this.retrieveCall=retrieveCall;
    this.terminateCall=terminateCall;
    this.transfer = transfer;
    this.conference = conference;
    this.sendDTMF = sendDTMF;

}

var servicesModule = angular.module('aeonixApp.services');
servicesModule.service('callsSrv', ['Call', 'contactSrv', 'connectionSrv', 'phoneSrv','$timeout','$rootScope',CallsSrv]);

