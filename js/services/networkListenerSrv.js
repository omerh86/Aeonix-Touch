function NetworkListenerSrv($rootScope) {

    var serviceLogger = logSrv.getLogger("networkListenerSrv");

    var _connectionStatus;

    function onConnectionStatusChanged(event, connectionStatus) {
        var logger = serviceLogger.logMethodCall(arguments,eLogLevel.finer);
        _connectionStatus = connectionStatus;
    }

    function init() {
        var logger = serviceLogger.logMethodCall(arguments,eLogLevel.finer);

        _connectionStatus = JSBridge.getConnectionStatusInfo();
        $rootScope.$on("network:ConnectionStatusChanged", onConnectionStatusChanged);

        logger.logMethodCompleted(arguments, _connectionStatus, eLogLevel.finer);
    }

    this._onConnectionStatusChanged = onConnectionStatusChanged;

    init();

}


var servicesModule = angular.module('aeonixApp.services');
servicesModule.service('networkListenerSrv', ['$rootScope', NetworkListenerSrv]);