
function Tr87CallServiceFactory($rootScope, loggingSrv, nativeSrv) {

    var logger = loggingSrv.getLogger("tr87CallService");

    var State = {
        DISCONNECTED:"DISCONNECTED",
        CALLING:"CALLING",
        CONNECTED:"CONNECTED",
        FAILED:"FAILED",
        DISCONNECTING:"DISCONNECTING"
    };

    var ErrorType = {
        UNAUTHORIZED:"UNAUTHORIZED",
        CANCELED:"CANCELED",
        OTHER:"OTHER",
    };

    function Tr87CallService() {

        var ths = this;

        ths.state=State.DISCONNECTED;
        ths.callRef = null;

        var sipProxyService;

        var eventListener = null;
        var resolveMethod = null;
        var rejectMethod = null;

        var onCallStateChangedCleaner;


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

        function setSipProxyService(proxy) {
            sipProxyService = proxy;
        }


        function setEventListener(listener) {
            eventListener = listener;
        }

        function makeCall() {

            if (ths.state!==State.DISCONNECTED) {
                var e = new Error("Calling makeCall is not allowed for "+ths.state+" state");
                return Promise.reject(e);
            }else {

                ths.state = State.CALLING;

                var promise = new Promise(function(resolve, reject) {
                    resolveMethod = resolve;
                    rejectMethod = reject;
                });

                onCallStateChangedCleaner = $rootScope.$on("linphone:CallStateChanged", onCallStateChanged);

                var url = "sip:1234@" + sipProxyService.serverAddress+";transport="+sipProxyService.transport;
                ths.callRef = nativeSrv.makeTR87Call(url);

                return promise;
            }
        }

        function disconnect() {
            if (ths.state===State.CONNECTED) {
                ths.state = State.DISCONNECTING;
                nativeSrv.terminateCall(ths.callRef);
                var promise = new Promise(function (resolve, reject) {
                    resolveMethod = resolve;
                    rejectMethod = reject;
                });
                return promise;
            }else if (ths.state===State.CALLING) {
                var e = new Error();
                e.type = ErrorType.CANCELED;
                rejectPromise(e);

                nativeSrv.terminateCall(ths.callRef);
                var promise = new Promise(function (resolve, reject) {
                    resolveMethod = resolve;
                    rejectMethod = reject;
                });
                return promise;
            }else {
                var e = new Error("Calling disconnect is not allowed for "+ths.state+" state");
                return Promise.reject(e);
            }
        }


        function onConnected() {
            if (ths.state===State.CALLING) {
                ths.state = State.CONNECTED;
                resolvePromise();
                if (eventListener) {
                    if (eventListener.onConnected) {
                        eventListener.onConnected(ths);
                    }
                }
            }
        }

        function onDisconnected() {
            if (onCallStateChangedCleaner) {
                onCallStateChangedCleaner();
                onCallStateChangedCleaner = null;
            }

            ths.callRef = null;

            if (ths.state===State.DISCONNECTING) {
                ths.state = State.DISCONNECTED;
                resolvePromise();
                if (eventListener) {
                    if (eventListener.onDisconnected) {
                        eventListener.onDisconnected(ths);
                    }
                }
            }else if (ths.state===State.CONNECTED) {
                ths.state = State.FAILED;
                if (eventListener) {
                    if (eventListener.onFailed) {
                        var e = new Error("Registration terminated unexpectedly");
                        e.type = ErrorType.OTHER;
                        eventListener.onFailed(ths,e);
                    }
                }
            }
        }

        function onFailed(e) {

            if (onCallStateChangedCleaner) {
                onCallStateChangedCleaner();
                onCallStateChangedCleaner = null;
            }

            ths.callRef = null;

            if (ths.state===State.CALLING
                || ths.state===State.DISCONNECTING
                || ths.state===State.CONNECTED) {
                ths.state = State.FAILED;
                if (ths.state===State.CALLING
                    || ths.state===State.DISCONNECTING) {
                    rejectPromise(e);
                }
                if (eventListener) {
                    if (eventListener.onFailed) {
                        eventListener.onFailed(ths,e);
                    }
                }
            }
        }

        function onCallStateChanged(event, call) {

            if (call.NativeSrv===ths.callRef) {
                if (call.DetailedState == eCallDetailedState.Paused) {
                    onConnected();
                } else if (call.DetailedState == eCallDetailedState.Error) {
                    var e = new Error(call.SysMsg);
                    if (call.SysMsg == "Unauthorized") {
                        e.type = ErrorType.UNAUTHORIZED;
                    } else {
                        e.type = ErrorType.OTHER;
                    }
                    onFailed(e);
                } else if (call.DetailedState == eCallDetailedState.Released || call.DetailedState == eCallDetailedState.End) {
                    onDisconnected();
                }
            }
        }

        this.makeCall = makeCall;
        this.disconnect = disconnect;
        this.setEventListener = setEventListener;
    }

    Tr87CallService.State = State;
    Tr87CallService.ErrorType = ErrorType;
    Tr87CallService.logger = logger;

    return Tr87CallService;
}



var servicesModule = angular.module('aeonixApp.services');

servicesModule.factory('Tr87CallService', ['$rootScope','loggingSrv', 'nativeSrv', Tr87CallServiceFactory]);