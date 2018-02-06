function AlertSrv($timeout) {

    var serviceLogger = logSrv.getLogger("alertSrv");

    var alertTimeout = null;

    var alert = {
        visible: false,
        header: "",
        body: "",
        key: null

    };

    function getMembers() {
        var o = {
            "alertTimeout":alertTimeout,
            "alert":alert
        };
        return o;
    }

    function getAlert() {
        return alert;
    }

    function onAlertTimeoutExpired() {

        var logger = serviceLogger.logMethodCall(arguments,eLogLevel.finer);

        alert.visible = false;
        alert.header = '';
        alert.body = '';
        alertTimeout = null;

        logger.logMethodCompleted(arguments, getMembers(), eLogLevel.finer);
    }

    function closeAlert() {

        var logger = serviceLogger.logMethodCall(arguments,eLogLevel.finer);

        alert.visible = false;
        alert.header = '';
        alert.body = '';
        if (alertTimeout){
            $timeout.cancel(alertTimeout);
            alertTimeout = null;
        }

        logger.logMethodCompleted(arguments, getMembers(), eLogLevel.finer);
    };

    function setAlert(header, body, key, timeout){

        var logger = serviceLogger.logMethodCall(arguments,eLogLevel.finer);

        if (alertTimeout){
            $timeout.cancel(alertTimeout);
            alertTimeout = null;
        }
        alert.header = header;
        alert.body = body;
        alert.key = key;
        alert.visible = true;
        if (timeout!==0) {
            if (timeout==undefined) {
                timeout = 15000;
            }
            alertTimeout = $timeout(onAlertTimeoutExpired, 15000);
        }

        logger.logMethodCompleted(arguments, getMembers(), eLogLevel.finer);

    };

    this._onAlertTimeoutExpired = onAlertTimeoutExpired;
    this.closeAlert = closeAlert;
    this.setAlert = setAlert;
    this.getAlert = getAlert;
}



var servicesModule = angular.module('aeonixApp.services');
servicesModule.service('alertSrv', ['$timeout',AlertSrv]);