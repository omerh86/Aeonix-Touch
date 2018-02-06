function ConnectionSrv($rootScope, $timeout) {

    var serviceLogger = logSrv.getLogger("connectionSrv");
    var that = this;

    var stateMachine;
    var stateTimeout;

    var followUpEvents = [];
    var pendingUserRequest;

    var endpointId;
    var userName;
    var password;

    var serverAddress;
    var proxyAddress;
    var transport;

    var callReference;
    var authInfoReference;
    var proxyConfigReference;

    var error;
    var temporarilyUnavailableCounter;

    var processing = false;

    var onRegistrationStateChangedPromise= null;


    function getMembers() {
        var o = {
            stateTimeout: stateTimeout,
            followUpEvents: followUpEvents,
            pendingUserRequest: pendingUserRequest,
            endpointId: endpointId,
            userName: userName,
            password: password,
            serverAddress: serverAddress,
            proxyAddress: proxyAddress,
            transport: transport,
            callReference: callReference,
            authInfoReference: authInfoReference,
            proxyConfigReference: proxyConfigReference,
            error: error,
            temporarilyUnavailableCounter: temporarilyUnavailableCounter
        };
        return o;
    }

    function setConnectionError(e) {
        if (!error) {
            error = e;
        }
    }

    function cleanAfterCallTerminated() {
        temporarilyUnavailableCounter = 0;
        callReference = null;
    }

    function extractNewServerNameFromMessage(message) {

        var logger = serviceLogger.logMethodCall(arguments, eLogLevel.finer);

        if (typeof message === 'string' && message.length > 0) {
            var prefix = "redirected; new address - ";
            var index = message.indexOf(prefix);
            if (index >= 0) {
                message = message.substring(index + prefix.length);
                index = message.indexOf(";");
                if (index >= 0) {
                    message = message.substring(0, index);
                    return message;
                }
                return null;
            } else {
                return null;
            }
        } else return null;
    }

    function extractNameFromEndpointId(name) {
        var logger = serviceLogger.logMethodCall(arguments,eLogLevel.finer);

        var start = name.indexOf("sip:");
        var end = name.indexOf("@");
        if (start != -1 && end != -1) {
            name = name.substr(start + "sip:".length, end - (start + "sip:".length));
        }

        logger.logMethodCompleted(arguments, name, eLogLevel.finer);

        return name;
    };

    function onStateTimeout() {
        var logger = serviceLogger.logMethodCall(arguments, eLogLevel.finer);
        stateTimeout = null;
        if (stateMachine.can("TimeoutEvent")) {
            setConnectionError(eError.Timeout);
            stateMachine.TimeoutEvent();
        }
    }

    function resetStateTimeout(timeoutValue) {
        if (stateTimeout) {
            $timeout.cancel(stateTimeout);
        }
        stateTimeout = $timeout(onStateTimeout, timeoutValue);
    }

    function cancelStateTimeout() {
        if (stateTimeout) {
            $timeout.cancel(stateTimeout);
            stateTimeout = null;
        }
    }


    function onBeforeEvent(event, from, to) {
        var logger = serviceLogger.logMethodCall(arguments, eLogLevel.finer);
        logger.fine(event, ", switching from ", from, " to ", to);
        processing = true;
    }

    function onAfterEvent(event, from, to) {
        var logger = serviceLogger.logMethodCall(arguments, eLogLevel.finer);
        logger.fine(event, " completed");
        processing = false;
        if (followUpEvents.length > 0) {
            var event = followUpEvents[0];
            logger.fine("running follow up event");
            followUpEvents.splice(0, 1);
            event();
        }
    }

    function onAfterRedirectedEvent(event, from, to, newServerAddress) {
        var logger = serviceLogger.logMethodCall(arguments, eLogLevel.finer);
        if (from == to && to == "REGISTERING") {
            JSBridge.removeProxyConfig(proxyConfigReference);
            proxyConfigReference = null;
            serverAddress = newServerAddress;
            var identity = "sip:" + endpointId + "@" + serverAddress+";transport="+transport;
            var proxy;
            if (proxyAddress) {
                proxy = proxyAddress;
            } else {
                proxy = serverAddress;
            }
            proxy = proxy +";transport="+transport;
            var route;
            if (proxyAddress) {
                route = "sip:" + proxyAddress + ";transport="+transport;
            }
            else {
                route = null;
            }

            proxyConfigReference = JSBridge.createProxyConfig(identity, proxy, route, 60);

            JSBridge.addProxyConfig(proxyConfigReference);
            JSBridge.register(proxyConfigReference);
            resetStateTimeout(5000);
        }

        logger.logMethodCompleted(arguments, getMembers(), eLogLevel.finer);

    }

    function onAfterConnectRequest(event, from, to, endpointId, userName, password, serverAddress, proxyAddress, transport) {
        var logger = serviceLogger.logMethodCall(arguments, eLogLevel.finer);
        if (to != 'REGISTERING') {
            function executePendingConnect() {
                var logger = serviceLogger.logMethodCall(arguments, eLogLevel.finer);
                that.connect(endpointId, userName, password, serverAddress, proxyAddress, transport);
                logger.logMethodCompleted(arguments, getMembers(), eLogLevel.finer);
            }
            pendingUserRequest = executePendingConnect;
        }
        logger.logMethodCompleted(arguments, getMembers(), eLogLevel.finer);

    }

    function onAfterDisconnectRequest(event, from, to) {
        var logger = serviceLogger.logMethodCall(arguments, eLogLevel.finer);
        if (from == to && to != "UNREGISTERED") {
            function executePendingDisconnect() {
                var logger = serviceLogger.logMethodCall(arguments, eLogLevel.finer);
                that.disconnect();
                logger.logMethodCompleted(arguments, getMembers(), eLogLevel.finer);
            }
            pendingUserRequest = executePendingDisconnect;
        }
        logger.logMethodCompleted(arguments, getMembers(), eLogLevel.finer);
    }

    function onError(eventName, from, to, args, errorCode, errorMessage,err) {
        var logger = serviceLogger.logMethodCall(arguments, eLogLevel.finer);
        if (err) {
            logger.error(err);
        }else {
            logger.info(errorMessage);
        }
    }

    function onEnterUnregistered(event, from, to) {
        var logger = serviceLogger.logMethodCall(arguments, eLogLevel.finer);

        try {
            var tempError = error;

            error = null;

            if (onRegistrationStateChangedPromise) {
                onRegistrationStateChangedPromise();
                onRegistrationStateChangedPromise = null;
            }

            if (proxyConfigReference) {
                JSBridge.removeProxyConfig(proxyConfigReference);
                proxyConfigReference = null;
            }
    
            if (authInfoReference) {
                JSBridge.removeAuthInfo(authInfoReference);
                authInfoReference = null;
            }


            callReference = null;

            JSBridge.terminateAllDialogs();

            cancelStateTimeout();

    
            if (pendingUserRequest) {
                followUpEvents.push(pendingUserRequest);
                pendingUserRequest = null;
            }else {
                $rootScope.$broadcast("cnxn:ConnectionStateChanged", "disconnected", tempError);
            }
        }catch(err){
            logger.error(err);
        }

        

        logger.logMethodCompleted(arguments, getMembers(), eLogLevel.finer);
    }

    function onEnterRegistering(event, from, to, eId, uName, psw, server, proxy, transp) {
        var logger = serviceLogger.logMethodCall(arguments, eLogLevel.finer);

        try {
            if (!onRegistrationStateChangedPromise) {
                onRegistrationStateChangedPromise = $rootScope.$on("linphone:RegistrationStateChanged", onRegistrationStateChanged);
            }
            endpointId = eId;
            userName = uName;
            password = psw;
            serverAddress = server;
            proxyAddress = proxy;
            transport = transp;
    
    
            authInfoReference = JSBridge.createAuthInfo(endpointId, password, serverAddress);
            JSBridge.addAuthInfo(authInfoReference);
    
            var identity = "sip:" + endpointId + "@" + serverAddress+";transport="+transport;
            var proxy;
            if (proxyAddress) {
                proxy = proxyAddress;
            } else {
                proxy = serverAddress;
            }
            proxy = proxy + ";transport="+transport;

            var route;
            if (proxyAddress) {
                route =  "sip:" + proxyAddress + ";transport="+transport;
            }
            else {
                route = null;
            }
    
            proxyConfigReference = JSBridge.createProxyConfig(identity, proxy, route,60);
    
            JSBridge.addProxyConfig(proxyConfigReference);
            JSBridge.register(proxyConfigReference);
            resetStateTimeout(5000);
        }catch(err){
            logger.error(err);
        }
        
        logger.logMethodCompleted(arguments, getMembers(), eLogLevel.finer);
    }

    function onEnterRegistered(event, from, to, eId, uName, psw, proxyInfo) {
        var logger = serviceLogger.logMethodCall(arguments, eLogLevel.finer);

        try {
            if (!onRegistrationStateChangedPromise) {
                onRegistrationStateChangedPromise = $rootScope.$on("linphone:RegistrationStateChanged", onRegistrationStateChanged);
            }
            endpointId = eId;
            userName = uName;
            password = psw;
            serverAddress = proxyInfo.serverAddress;
            proxyAddress = proxyInfo.proxyAddress;
            transport = proxyInfo.transport;

            authInfoReference = JSBridge.createAuthInfo(endpointId, password, serverAddress);
            JSBridge.addAuthInfo(authInfoReference);

            proxyConfigReference = proxyInfo.proxyConfigReference;

            stateMachine.MakeTR87CallRequest();

        }catch(err){
            logger.error(err);
        }

        logger.logMethodCompleted(arguments, getMembers(), eLogLevel.finer);
    }

    function onEnterRegisteredCalling(event, from, to) {        
        var logger = serviceLogger.logMethodCall(arguments, eLogLevel.finer);
        try {
            var url = "sip:" + CSTA_CALL + "@" + serverAddress+";transport=udp";
            callReference = JSBridge.makeTR87Call(url);
            resetStateTimeout(5000);
        }catch(err){
            logger.error(err);
        }
        
        logger.logMethodCompleted(arguments, getMembers(), eLogLevel.finer);
    }


    function onEnterTerminatingRegistration(event, from, to) {
        var logger = serviceLogger.logMethodCall(arguments, eLogLevel.finer);
        
        try {
            cleanAfterCallTerminated();            
            JSBridge.terminateRegistration(proxyConfigReference);
            resetStateTimeout(5000);
        }catch(err){
            logger.error(err);
        }
        

        logger.logMethodCompleted(arguments, getMembers(), eLogLevel.finer);
    }

    function onEnterTerminatingRegistrationCallFailed(event, from, to) {
        var logger = serviceLogger.logMethodCall(arguments, eLogLevel.finer);
        
        try {
            cleanAfterCallTerminated();            
            JSBridge.terminateRegistration(proxyConfigReference);
            resetStateTimeout(5000);
        }catch(err){
            logger.error(err);
        }
        
        

        logger.logMethodCompleted(arguments, getMembers(), eLogLevel.finer);
    }

    function onEnterRegistrationFailedCalling(event, from, to) {
        var logger = serviceLogger.logMethodCall(arguments, eLogLevel.finer);
        
        try {
            JSBridge.terminateCall(callReference);
        }catch(err){
            logger.error(err);
        }
                
        
        logger.logMethodCompleted(arguments, getMembers(), eLogLevel.finer);
    }

    function onEnterRegisteredInCall(event, from, to) {
        var logger = serviceLogger.logMethodCall(arguments, eLogLevel.finer);
        
        try {
            cancelStateTimeout();
            temporarilyUnavailableCounter = 0;
    
            $rootScope.$broadcast("cnxn:ConnectionStateChanged", "connected");
    
            if (pendingUserRequest) {
                followUpEvents.push(pendingUserRequest);
                pendingUserRequest = null;
            }
        }catch(err){
            logger.error(err);
        }
                
        
        logger.logMethodCompleted(arguments, getMembers(), eLogLevel.finer);
    }

    function onEnterRegistrationFailedDisconnectingCall(event, from, to) {
        var logger = serviceLogger.logMethodCall(arguments, eLogLevel.finer);
        
        try {
            JSBridge.terminateCall(callReference);
            resetStateTimeout(5000);
        }catch(err){
            logger.error(err);
        }
                
        
        logger.logMethodCompleted(arguments, getMembers(), eLogLevel.finer);
    }

    function onEnterRegisteredDisconnectingCall(event, from, to) {
        var logger = serviceLogger.logMethodCall(arguments, eLogLevel.finer);
        
        try {
            JSBridge.terminateCall(callReference);
            resetStateTimeout(5000);
        }catch(err){
            logger.error(err);
        }
                
        
        logger.logMethodCompleted(arguments, getMembers(), eLogLevel.finer);
    }

    function onEnterTemporaryUnavailable(event, from, to) {
        var logger = serviceLogger.logMethodCall(arguments, eLogLevel.finer);
        
        try {
            cancelStateTimeout();
            temporarilyUnavailableCounter++;
            if (temporarilyUnavailableCounter == 5) {
                function executeRetryCall() {
                    var logger = serviceLogger.logMethodCall(arguments, eLogLevel.finer);
                    stateMachine.RetryCall();
                    logger.logMethodCompleted(arguments, getMembers(), eLogLevel.finer);
                }
                followUpEvents.push(executeRetryCall);
            } else {
                temporarilyUnavailableCounter = 0;
                function executeCallFailedEvent() {
                    var logger = serviceLogger.logMethodCall(arguments, eLogLevel.finer);
    
                    setConnectionError(eError.GeneralError);
                    stateMachine.CallFailedEvent();
    
                    logger.logMethodCompleted(arguments, getMembers(), eLogLevel.finer);
                }
                followUpEvents.push(executeCallFailedEvent);
            }
        }catch(err){
            logger.error(err);
        }
                
        
        logger.logMethodCompleted(arguments, getMembers(), eLogLevel.finer);
    }

    function onCallStateChanged(call) {
        var logger = serviceLogger.logMethodCall(arguments, eLogLevel.finer);
        if (processing) {
            function executePendingOnCallStateChanged() {
                onCallStateChanged(event,call);
            }
            followUpEvents.push(executePendingOnCallStateChanged);
        }else {
            if (call.NativeToken == callReference) {
                if (call.DetailedState == eCallDetailedState.Paused) {
                    stateMachine.CallEstablishedEvent();
                } else if (call.DetailedState == eCallDetailedState.Error) {
                    if (call.SysMsg === 'string' && call.SysMsg.toLowerCase() == "temporarily unavailable") {
                        stateMachine.TemporarilyUnavailableEvent();
                    } else {
                        var error;
                        if (call.SysMsg == "Unauthorized") {
                            error = eError.AuthorizationError;
                        } else {
                            error = eError.GeneralError;
                        }
                        setConnectionError(error);
                        stateMachine.CallFailedEvent();
                    }
                } else if (call.DetailedState == eCallDetailedState.Released) {
                    stateMachine.CallDisconnectedEvent();
                }
            } else {
                if (call.DetailedState == eCallDetailedState.End ||
                    call.DetailedState == eCallDetailedState.Error) {
                    JSBridge.terminateCall(call.NativeToken);
                }
            }
        }

        logger.logMethodCompleted(arguments, getMembers(), eLogLevel.finer);
    }

    function onRegistrationStateChanged(event, registrationStateInfo) {
        var logger = serviceLogger.logMethodCall(arguments, eLogLevel.finer);

        try {
            var configReference = registrationStateInfo.proxyConfigReference;
            var state = registrationStateInfo.registrationState;
            var message = registrationStateInfo.message;
            if (processing) {
                function executePendingOnRegistrationStateChanged() {
                    var logger = serviceLogger.logMethodCall(arguments, eLogLevel.finer);
                    that.onRegistrationStateChanged(event, registrationStateInfo);
                    logger.logMethodCompleted(arguments, getMembers(), eLogLevel.finer);
                }
                followUpEvents.push(executePendingOnRegistrationStateChanged);
            }else {
                if (proxyConfigReference == configReference) {
                    if (state == 'RegistrationOk') {
                        stateMachine.RegisteredEvent();
                    } else if (state == 'RegistrationCleared') {
                        stateMachine.RegistrationTerminatedEvent();
                    } else if (state == 'RegistrationFailed') {
                        var newServer = extractNewServerNameFromMessage(message);
                        if (newServer != null) {
                            stateMachine.RedirectedEvent(newServer);
                        } else {
                            setConnectionError(eError.Timeout);
                            stateMachine.RegistrationFailedEvent();
                        }
                    } else if (state=='RegistrationNone') {
                        stateMachine.RegistrationFailedEvent();
                    }
                }
            }
        }catch(err){
            logger.error(err);
        }

        

        logger.logMethodCompleted(arguments, getMembers(), eLogLevel.finer);
    }


    function onNetworkStatusChanged(event, networkStatus) {
        var logger = serviceLogger.logMethodCall(arguments, eLogLevel.finer);

        try {
            if (proxyConfigReference) {
                linphone.refreshRegistration(proxyConfigReference);
            }
        }catch(err){
            logger.error(err);
        }



        logger.logMethodCompleted(arguments, getMembers(), eLogLevel.finer);
    }

    function connect(endpointId, userName, password, serverAddress, proxyAddress, transport) {
        var logger = serviceLogger.logMethodCall(arguments, eLogLevel.finer);
        if (processing) {
            function executePendingConnect() {
                var logger = serviceLogger.logMethodCall(arguments, eLogLevel.finer);

                that.connect(endpointId, userName, password, serverAddress, proxyAddress, transport);

                logger.logMethodCompleted(arguments, getMembers(), eLogLevel.finer);
            }
            followUpEvents.push(executePendingConnect);
        } else {
            stateMachine.ConnectRequest(endpointId, userName, password, serverAddress, proxyAddress, transport);
        }

        logger.logMethodCompleted(arguments, getMembers(), eLogLevel.finer);
    }

    function connectWithProxy(endpointId, userName, password, proxyInfo) {
        var logger = serviceLogger.logMethodCall(arguments, eLogLevel.finer);

        stateMachine.ConnectWithProxyRequest(endpointId, userName, password, proxyInfo);


        logger.logMethodCompleted(arguments, getMembers(), eLogLevel.finer);
    }

    function cancel() {
        var logger = serviceLogger.logMethodCall(arguments, eLogLevel.finer);

        if (stateMachine.can("CancelRequest")) {
            setConnectionError(eError.OperationCanceled);
            if (callReference) {
                JSBridge.terminateCall(callReference);
                callReference = null;
            }
            stateMachine.CancelRequest();
        }

        logger.logMethodCompleted(arguments, getMembers(), eLogLevel.finer);
    }

    function disconnect() {
        var logger = serviceLogger.logMethodCall(arguments, eLogLevel.finer);
        if (processing) {
            function executePendingConnect() {
                var logger = serviceLogger.logMethodCall(arguments, eLogLevel.finer);

                that.disconnect();

                logger.logMethodCompleted(arguments, getMembers(), eLogLevel.finer);
            }
            followUpEvents.push(executePendingConnect);
        } else {
            stateMachine.DisconnectRequest();
        }
        logger.logMethodCompleted(arguments, getMembers(), eLogLevel.finer);
    }


    function isConnected() {
        return stateMachine.current == 'REGISTERED_IN_CALL';
    }

    function isDisconnected() {
        return stateMachine.current == 'UNREGISTERED';
    }

    function getEndpointId() {
        return endpointId;
    }

    function getUserName() {
        return userName;
    }

    function getServerAddress() {
        return serverAddress;
    }


    function getTR87CallReference() {
        return callReference;
    }

    function createStateMachine() {
            var sm = StateMachine.create({
                    initial: 'UNREGISTERED',
                    error: onError,
                    events: [
                        { name: 'startup', from: 'none', to: 'UNREGISTERED' },

                        { name: 'ConnectRequest', from: 'UNREGISTERED', to: 'REGISTERING' },
                        { name: 'ConnectWithProxyRequest', from: 'UNREGISTERED', to: 'REGISTERED' },
                        { name: 'DisconnectRequest', from: 'UNREGISTERED', to: 'UNREGISTERED' },

                        { name: 'MakeTR87CallRequest', from: 'REGISTERED', to: 'REGISTERED_CALLING' },

                        { name: 'ConnectRequest', from: 'REGISTERING', to: 'REGISTERING' },
                        { name: 'DisconnectRequest', from: 'REGISTERING', to: 'REGISTERING' },
                        { name: 'RegisteredEvent', from: 'REGISTERING', to: 'REGISTERED_CALLING' },
                        { name: 'RegistrationFailedEvent', from: 'REGISTERING', to: 'UNREGISTERED' },
                        { name: 'RedirectedEvent', from: 'REGISTERING', to: 'REGISTERING' },
                        { name: 'RegistrationTerminatedEvent', from: 'REGISTERING', to: 'UNREGISTERED' },
                        { name: 'TimeoutEvent', from: 'REGISTERING', to: 'UNREGISTERED' },
                        { name: 'CancelRequest', from: 'REGISTERING', to: 'UNREGISTERED' },
                        { name: 'ExceptionEvent', from: 'REGISTERING', to: 'UNREGISTERED' },

                        { name: 'ConnectRequest', from: 'REGISTERED_CALLING', to: 'REGISTERED_CALLING' },
                        { name: 'DisconnectRequest', from: 'REGISTERED_CALLING', to: 'REGISTERED_CALLING' },
                        { name: 'RegistrationFailedEvent', from: 'REGISTERED_CALLING', to: 'REGISTRATION_FAILED_CALLING' },
                        { name: 'RedirectedEvent', from: 'REGISTERED_CALLING', to: 'REGISTERED_CALLING' },
                        { name: 'RegistrationTerminatedEvent', from: 'REGISTERED_CALLING', to: 'REGISTRATION_FAILED_CALLING' },
                        { name: 'CallEstablishedEvent', from: 'REGISTERED_CALLING', to: 'REGISTERED_IN_CALL' },
                        { name: 'CallDisconnectedEvent', from: 'REGISTERED_CALLING', to: 'TERMINATING_REGISTRATION_CALL_FAILED' },
                        { name: 'CallFailedEvent', from: 'REGISTERED_CALLING', to: 'TERMINATING_REGISTRATION_CALL_FAILED' },
                        { name: 'TemporarilyUnavailableEvent', from: 'REGISTERED_CALLING', to: 'TEMPORARY_UNAVAILABLE' },
                        { name: 'TimeoutEvent', from: 'REGISTERED_CALLING', to: 'TERMINATING_REGISTRATION_CALL_FAILED' },
                        { name: 'CancelRequest', from: 'REGISTERED_CALLING', to: 'UNREGISTERED' },
                        { name: 'ExceptionEvent', from: 'REGISTERED_CALLING', to: 'TERMINATING_REGISTRATION_CALL_FAILED' },

                        { name: 'ConnectRequest', from: 'TERMINATING_REGISTRATION', to: 'TERMINATING_REGISTRATION' },
                        { name: 'DisconnectRequest', from: 'TERMINATING_REGISTRATION', to: 'TERMINATING_REGISTRATION' },
                        { name: 'RegistrationFailedEvent', from: 'TERMINATING_REGISTRATION', to: 'UNREGISTERED' },
                        { name: 'RegistrationTerminatedEvent', from: 'TERMINATING_REGISTRATION', to: 'UNREGISTERED' },
                        { name: 'TimeoutEvent', from: 'TERMINATING_REGISTRATION', to: 'UNREGISTERED' },
                        { name: 'ExceptionEvent', from: 'TERMINATING_REGISTRATION', to: 'UNREGISTERED' },

                        { name: 'ConnectRequest', from: 'TERMINATING_REGISTRATION_CALL_FAILED', to: 'TERMINATING_REGISTRATION_CALL_FAILED' },
                        { name: 'DisconnectRequest', from: 'TERMINATING_REGISTRATION_CALL_FAILED', to: 'TERMINATING_REGISTRATION_CALL_FAILED' },
                        { name: 'RegistrationFailedEvent', from: 'TERMINATING_REGISTRATION_CALL_FAILED', to: 'UNREGISTERED' },
                        { name: 'RegistrationTerminatedEvent', from: 'TERMINATING_REGISTRATION_CALL_FAILED', to: 'UNREGISTERED' },
                        { name: 'TimeoutEvent', from: 'TERMINATING_REGISTRATION_CALL_FAILED', to: 'UNREGISTERED' },
                        { name: 'ExceptionEvent', from: 'TERMINATING_REGISTRATION_CALL_FAILED', to: 'UNREGISTERED' },

                        { name: 'ConnectRequest', from: 'REGISTRATION_FAILED_CALLING', to: 'REGISTRATION_FAILED_CALLING' },
                        { name: 'DisconnectRequest', from: 'REGISTRATION_FAILED_CALLING', to: 'REGISTRATION_FAILED_CALLING' },
                        { name: 'CallEstablishedEvent', from: 'REGISTRATION_FAILED_CALLING', to: 'REGISTRATION_FAILED_DISCONNECTING_CALL' },
                        { name: 'CallDisconnectedEvent', from: 'REGISTRATION_FAILED_CALLING', to: 'UNREGISTERED' },
                        { name: 'CallFailedEvent', from: 'REGISTRATION_FAILED_CALLING', to: 'UNREGISTERED' },
                        { name: 'TemporarilyUnavailableEvent', from: 'REGISTRATION_FAILED_CALLING', to: 'UNREGISTERED' },
                        { name: 'TimeoutEvent', from: 'REGISTRATION_FAILED_CALLING', to: 'UNREGISTERED' },
                        { name: 'ExceptionEvent', from: 'REGISTRATION_FAILED_CALLING', to: 'UNREGISTERED' },


                        { name: 'ConnectRequest', from: 'REGISTERED_IN_CALL', to: 'REGISTERED_DISCONNECTING_CALL' },
                        { name: 'DisconnectRequest', from: 'REGISTERED_IN_CALL', to: 'REGISTERED_DISCONNECTING_CALL' },
                        { name: 'RegisteredEvent', from: 'REGISTERED_IN_CALL', to: 'REGISTERED_IN_CALL' },
                        { name: 'RegistrationFailedEvent', from: 'REGISTERED_IN_CALL', to: 'REGISTRATION_FAILED_DISCONNECTING_CALL' },
                        { name: 'RegistrationTerminatedEvent', from: 'REGISTERED_IN_CALL', to: 'REGISTRATION_FAILED_DISCONNECTING_CALL' },
                        { name: 'CallDisconnectedEvent', from: 'REGISTERED_IN_CALL', to: 'TERMINATING_REGISTRATION_CALL_FAILED' },
                        { name: 'CallFailedEvent', from: 'REGISTERED_IN_CALL', to: 'TERMINATING_REGISTRATION_CALL_FAILED' },

                        { name: 'ConnectRequest', from: 'REGISTRATION_FAILED_DISCONNECTING_CALL', to: 'REGISTRATION_FAILED_DISCONNECTING_CALL' },
                        { name: 'DisconnectRequest', from: 'REGISTRATION_FAILED_DISCONNECTING_CALL', to: 'REGISTRATION_FAILED_DISCONNECTING_CALL' },
                        { name: 'CallDisconnectedEvent', from: 'REGISTRATION_FAILED_DISCONNECTING_CALL', to: 'UNREGISTERED'},
                        { name: 'CallFailedEvent', from: 'REGISTRATION_FAILED_DISCONNECTING_CALL', to: 'UNREGISTERED'},
                        { name: 'TimeoutEvent', from: 'REGISTRATION_FAILED_DISCONNECTING_CALL', to: 'UNREGISTERED' },

                        { name: 'ConnectRequest', from: 'REGISTERED_DISCONNECTING_CALL', to: 'REGISTERED_DISCONNECTING_CALL' },
                        { name: 'DisconnectRequest', from: 'REGISTERED_DISCONNECTING_CALL', to: 'REGISTERED_DISCONNECTING_CALL' },
                        { name: 'RegisteredEvent', from: 'REGISTERED_DISCONNECTING_CALL', to: 'REGISTERED_DISCONNECTING_CALL' },
                        { name: 'RegistrationFailedEvent', from: 'REGISTERED_DISCONNECTING_CALL', to: 'REGISTRATION_FAILED_DISCONNECTING_CALL' },
                        { name: 'RegistrationTerminatedEvent', from: 'REGISTERED_DISCONNECTING_CALL', to: 'REGISTRATION_FAILED_DISCONNECTING_CALL' },
                        { name: 'CallDisconnectedEvent', from: 'REGISTERED_DISCONNECTING_CALL', to: 'TERMINATING_REGISTRATION' },
                        { name: 'CallFailedEvent', from: 'REGISTERED_DISCONNECTING_CALL', to: 'TERMINATING_REGISTRATION' },
                        { name: 'TimeoutEvent', from: 'REGISTERED_DISCONNECTING_CALL', to: 'TERMINATING_REGISTRATION' },
                        { name: 'ExceptionEvent', from: 'REGISTERED_DISCONNECTING_CALL', to: 'TERMINATING_REGISTRATION' },

                        { name: 'RetryCall', from: 'TEMPORARY_UNAVAILABLE', to: 'REGISTERED_CALLING' },
                        { name: 'CallFailedEvent', from: 'TEMPORARY_UNAVAILABLE', to: 'TERMINATING_REGISTRATION_CALL_FAILED' }
                    ],
                    callbacks: {

                        onbeforeevent: onBeforeEvent,
                        onafterevent: onAfterEvent,

                        onafterRedirectedEvent: onAfterRedirectedEvent,
                        onafterConnectRequest: onAfterConnectRequest,
                        onafterDisconnectRequest: onAfterDisconnectRequest,


                        onenterUNREGISTERED: onEnterUnregistered,
                        onenterREGISTERING: onEnterRegistering,
                        onenterREGISTERED: onEnterRegistered,
                        onenterREGISTERED_CALLING: onEnterRegisteredCalling,
                        onenterTERMINATING_REGISTRATION: onEnterTerminatingRegistration,
                        onenterTERMINATING_REGISTRATION_CALL_FAILED: onEnterTerminatingRegistrationCallFailed,
                        onenterREGISTRATION_FAILED_CALLING: onEnterRegistrationFailedCalling,
                        onenterREGISTERED_IN_CALL: onEnterRegisteredInCall,
                        onenterREGISTRATION_FAILED_DISCONNECTING_CALL: onEnterRegistrationFailedDisconnectingCall,
                        onenterREGISTERED_DISCONNECTING_CALL: onEnterRegisteredDisconnectingCall,
                        onenterTEMPORARY_UNAVAILABLE: onEnterTemporaryUnavailable
                    }
                });
            return sm;
        }


    stateMachine = createStateMachine();


    $rootScope.$on("network:NetworkStatusChanged", onNetworkStatusChanged);

    this._getMembers=getMembers;
    this._setConnectionError=setConnectionError;
    this._cleanAfterCallTerminated=cleanAfterCallTerminated;
    this._extractNewServerNameFromMessage=extractNewServerNameFromMessage;
    this._onStateTimeout=onStateTimeout;
    this._resetStateTimeout=resetStateTimeout;
    this._cancelStateTimeout=cancelStateTimeout;
    this._onBeforeEvent=onBeforeEvent;
    this._onAfterEvent=onAfterEvent;
    this._onAfterRedirectedEvent=onAfterRedirectedEvent;
    this._onAfterConnectRequest=onAfterConnectRequest;
    this._onAfterDisconnectRequest=onAfterDisconnectRequest;
    this._onError=onError;
    this._onEnterUnregistered=onEnterUnregistered;
    this._onEnterRegistering=onEnterRegistering;
    this._onEnterRegistered=onEnterRegistered;
    this._onEnterRegisteredCalling=onEnterRegisteredCalling;
    this._onEnterTerminatingRegistration=onEnterTerminatingRegistration;
    this._onEnterTerminatingRegistrationCallFailed=onEnterTerminatingRegistrationCallFailed;
    this._onEnterRegistrationFailedCalling=onEnterRegistrationFailedCalling;
    this._onEnterRegisteredInCall=onEnterRegisteredInCall;
    this._onEnterRegistrationFailedDisconnectingCall=onEnterRegistrationFailedDisconnectingCall;
    this._onEnterRegisteredDisconnectingCall=onEnterRegisteredDisconnectingCall;
    this._onEnterTemporaryUnavailable=onEnterTemporaryUnavailable;
    this._createStateMachine=createStateMachine;
    this._onRegistrationStateChanged=onRegistrationStateChanged;
    this._onNetworkStatusChanged = onNetworkStatusChanged;

    this.connect=connect;
    this.connectWithProxy = connectWithProxy;
    this.disconnect=disconnect;
    this.isConnected=isConnected;
    this.isDisconnected=isDisconnected;
    this.getEndpointId=getEndpointId;
    this.getUserName=getUserName;
    this.getServerAddress=getServerAddress;
    this.getTR87CallReference=getTR87CallReference;

    this.onCallStateChanged=onCallStateChanged;


}



var servicesModule = angular.module('aeonixApp.services');

servicesModule.service('connectionSrv', ['$rootScope','$timeout', ConnectionSrv]);