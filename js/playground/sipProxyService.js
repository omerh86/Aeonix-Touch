
function SipProxyServiceFactory($rootScope, loggingSrv, nativeSrv) {

    var logger = loggingSrv.getLogger("sipProxyService");

    var State = {
        UNREGISTERED:"UNREGISTERED",
        REGISTERING:"REGISTERING",
        REGISTERED:"REGISTERED",
        FAILED:"FAILED",
        TERMINATING:"TERMINATING",
        TERMINATED:"TERMINATED"
    };

    var ErrorType = {
        UNAUTHORIZED:"UNAUTHORIZED",
        REDIRECTED:"REDIRECTED",
        OTHER:"OTHER"
    };

    function SipProxyService() {

        var ths = this;

        ths.endpointId=null;
        ths.password = null;

        ths.serverAddress = null;
        ths.sbcAddress = null;
        ths.transport = null;
        ths.port = null;

        ths.expirationInterval = 60;

        ths.proxyConfigReference = null;
        ths.authInfoReference = null;


        var eventListener = null;
        var resolveMethod = null;
        var rejectMethod = null;

        var onRegistrationStateChangedCleaner;


        function resolvePromise() {
            if (resolveMethod) {
                resolveMethod(ths);
                resolveMethod = null;
            }
        }

        function rejectPromise(error) {
            if (rejectMethod) {
                rejectMethod(error);
                rejectMethod = null;
            }
        }

        function setProxyAddress(serverAddress, sbcAddress, port, transport) {
            ths.serverAddress = serverAddress;
            ths.sbcAddress = sbcAddress;
            ths.port = port;
            ths.transport = transport;
        }

        function setIdentity(endpointId, password) {
            ths.endpointId = endpointId;
            ths.password = password;
        }

        function setExpirationInterval(interval) {
            ths.expirationInterval = interval;
        }

        function setEventListener(listener) {
            ths.listener = listener;
        }

        function register() {

            if (ths.state!==state.UNREGISTERED) {
                var e = new Error("Calling terminateRegistration is not allowed for "+ths.state+" state");
                return Promise.reject(e);
            }else {

                ths.state = state.REGISTERING;

                var promise = new Promise(function(resolve, reject) {
                    resolveMethod = resolve;
                    rejectMethod = reject;
                });

                onRegistrationStateChangedCleaner = $rootScope.$on("linphone:RegistrationStateChanged", onRegistrationStateChanged);
                eventListener = listener;

                ths.authInfoReference = nativeSrv.createAuthInfo(ths.endpointId, ths.password, ths.serverAddress);
                nativeSrv.addAuthInfo(authInfoReference);

                var identity = "sip:" + ths.endpointId + "@" + ths.serverAddress+";transport="+ths.transport;
                var proxy;
                var route;
                if (ths.sbcAddress) {
                    route = ths.sbcAddress + ";transport="+ths.transport;
                    proxy = route;
                } else {
                    proxy =ths.serverAddress + ";transport="+ths.transport;
                    route = null;
                }

                ths.proxyConfigReference = nativeSrv.createProxyConfig(identity, proxy, proxy,ths.expirationInterval);
                nativeSrv.addProxyConfig(ths.proxyConfigReference);
                nativeSrv.register(ths.proxyConfigReference);


                return promise;
            }


        }

        function terminateRegistration() {

            if (ths.state===State.REGISTERED) {
                ths.state = State.TERMINATING;
                nativeSrv.terminateRegistration(ths.proxyConfigReference);
                var promise = new Promise(function (resolve, reject) {
                    resolveMethod = resolve;
                    rejectMethod = reject;
                });
                return promise;
            }else {
                var e = new Error("Calling terminateRegistration is not allowed for "+ths.state+" state");
                return Promise.resolve(e);
            }
        }

        function removeProxy() {
            if (ths.state!==State.TERMINATED || ths.state!==State.FAILED) {
                logger.warn("Unexpected call to removeProxy. Current object state:",ths);
            }
            if (onRegistrationStateChangedCleaner) {
                onRegistrationStateChangedCleaner();
                onRegistrationStateChangedCleaner = null;
            }
            if (ths.proxyConfigReference) {
                nativeSrv.removeProxyConfig(ths.proxyConfigReference);
                ths.proxyConfigReference = null;
                ths.state = State.UNREGISTERED;
            }
        }

        function onRegistered() {
            if (ths.state===State.REGISTERING) {
                ths.state = State.REGISTERED;
                resolvePromise();
                if (eventListener) {
                    if (eventListener.onRegistered) {
                        eventListener.onRegistered(ths);
                    }
                }
            }
        }

        function onRegistrationTerminated() {
            if (ths.state===State.TERMINATING) {
                ths.state = State.TERMINATED;
                resolvePromise();
                if (eventListener) {
                    if (eventListener.onRegistrationTerminated) {
                        eventListener.onRegistrationTerminated(ths);
                    }
                }
            }else {
                var e = new Error("Registration terminated unexpectedly");
                e.type = ErrorType.OTHER;
                if (ths.state===State.REGISTERED) {
                    if (eventListener) {
                        if (eventListener.onRegistrationFailed) {
                            eventListener.onRegistrationFailed(ths,e);
                        }
                    }
                }else if (ths.state===State.REGISTERING) {
                    rejectPromise(e);
                    if (eventListener) {
                        if (eventListener.onRegistrationFailed) {
                            eventListener.onRegistrationFailed(ths,e);
                        }
                    }
                }
            }
        }

        function onRegistrationFailed(e) {
            if (ths.state===State.REGISTERING
                || ths.state===State.TERMINATING
                || ths.state===State.REGISTERED) {
                ths.state = State.FAILED;
                if (ths.state===State.REGISTERING
                    || ths.state===State.TERMINATING) {
                    rejectPromise(e);
                }
                if (eventListener) {
                    if (eventListener.onRegistrationFailed) {
                        eventListener.onRegistrationFailed(ths,e);
                    }
                }
            }
        }

        function onRegistrationStateChanged(event, registrationStateInfo) {

            var configReference = registrationStateInfo.proxyConfigReference;
            var state = registrationStateInfo.registrationState;
            var message = registrationStateInfo.message;

            if (ths.proxyConfigReference == configReference) {
                if (state === 'RegistrationOk') {
                    onRegistered();
                } else if (state === 'RegistrationCleared') {
                    onRegistrationTerminated();
                } else if (state === 'RegistrationFailed') {
                    if (message === "Unauthorized") {
                        var e = new Error();
                        e.type = ErrorType.UNAUTHORIZED;
                        onRegistrationFailed(e);
                    } else {
                        var newServer = extractNewServerNameFromMessage(message);
                        if (newServer !== null) {
                            var e = new Error();
                            e.type = ErrorType.REDIRECTED;
                            e.newServerAddress = newServerAddress;
                            onRegistrationFailed(e);
                        } else {
                            var e = new Error(message);
                            e.type = ErrorType.OTHER;
                            onRegistrationFailed(e);
                        }
                    }
                } else if (state==='RegistrationNone') {
                    var e = new Error();
                    e.type = ErrorType.OTHER;
                    onRegistrationFailed(e);
                }
            }
        }

        function extractNewServerNameFromMessage(message) {


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

        this.setProxyAddress = setProxyAddress;
        this.setIdentity = setIdentity;
        this.setExpirationInterval = setExpirationInterval;
        this.setEventListener = setEventListener;
        this.register = register;
        this.terminateRegistration = terminateRegistration;
        this.removeProxy = removeProxy;
    }

    SipProxyService.State = State;
    SipProxyService.ErrorType = ErrorType;
    SipProxyService.logger = logger;

    return SipProxyService;
}



var servicesModule = angular.module('aeonixApp.services');

servicesModule.factory('SipProxyService', ['$rootScope','loggingSrv', 'nativeSrv', SipProxyServiceFactory]);