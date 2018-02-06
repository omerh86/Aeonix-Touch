var debugUtils = ( function () {
    var srv = {};

    var logger = logSrv.getLogger("debugUtils");

    var onArrayChangedDefaultCallback = function(arr, allLabel, methodName, parameters) {
        logger.logGroup(allLabel + " changed: ", ["arr", "methodName", "parameters"], [arr, methodName, parameters], logSrv.fine);
    }

    srv.trackArrayChanges = function (arr, arrLabel, callback) {
        arr.push = function() {
            args = Array.from(arguments);
            Array.prototype.push.apply(arr, args);
            if (!callback) {
                callback = onArrayChangedDefaultCallback;
            }
            callback(arr, arrLabel, "push", args);
        };

        arr.pop = function(e) {
            args = Array.from(arguments);
            Array.prototype.pop.apply(arr, args);
            if (!callback) {
                callback = onArrayChangedDefaultCallback;
            }
            callback(arr, arrLabel, "pop", args);
        };

        arr.shift = function(e) {
            args = Array.from(arguments);
            Array.prototype.shift.apply(arr, args);
            if (!callback) {
                callback = onArrayChangedDefaultCallback;
            }
            callback(arr, arrLabel, "shift", args);
        };

        arr.unshift = function(e) {
            args = Array.from(arguments);
            Array.prototype.unshift.apply(arr, args);
            if (!callback) {
                callback = onArrayChangedDefaultCallback;
            }
            callback(arr, arrLabel, "unshift", args);
        };

        arr.slice = function() {
            args = Array.from(arguments);
            Array.prototype.slice.apply(arr, args);
            if (!callback) {
                callback = onArrayChangedDefaultCallback;
            }
            callback(arr, arrLabel, "slice", args);
        };

        arr.splice = function() {
            args = Array.from(arguments);
            Array.prototype.splice.apply(arr, args);
            if (!callback) {
                callback = onArrayChangedDefaultCallback;
            }
            callback(arr, arrLabel, "splice", args);
        };
    }

    function getAngularVar(varName) {
        return angular.element(document.body).injector().get(varName);
    }

    function getService(serviceName) {
        return getAngularVar(serviceName);
    }



    function pauseNativeEvents() {
        getNativeToJsBridgeSrv()._pause();
    }

    function resumeNativeEvents() {
        getNativeToJsBridgeSrv()._resume();
    }


    function initDebugVars() {
        var touch = {};
        window['atouch'] = touch;
        var vars = [
            '$rootScope',
            '$state',
            '$modal',
            '$timeout',
            '$interval',
            '$filter',
            'Call',
            'locale',
            'localeEvents',
            ];

        var servicesModule = angular.module('aeonixApp.services');

        for (var i=0;i<servicesModule._invokeQueue.length;i++) {
            var serviceName = servicesModule._invokeQueue[i][2][0];
            vars.push(serviceName);
        }

        for (var i=0;i<vars.length;i++) {
            try {
                var varName = vars[i];
                var v = angularUtils.getAngularVar(varName);
                touch[varName] = v;
            }catch(err) {
                console.error(err);
            }
        }
    }



    srv.getService = getService;
    srv.pauseNativeEvents = pauseNativeEvents;
    srv.resumeNativeEvents = resumeNativeEvents;
    srv.initDebugVars = initDebugVars;

    return srv;
}())


//todo michael




//logSrv.getLogger("networkListenerSrv").setLevel(eLogLevel.finest, true);
//logSrv.getLogger("aeonixApp").setLevel(eLogLevel.finest, true);
logSrv.getLogger("connectionAddressFinderSrv").setLevel(eLogLevel.finest, true);
logSrv.getLogger("connectionSrv").setLevel(eLogLevel.finest, true);
//logSrv.getLogger("settingsSrv").setLevel(eLogLevel.finest, true);
logSrv.getLogger("infoSrv").setLevel(eLogLevel.finest, true);
//logSrv.getLogger("voiceMailSrv").setLevel(eLogLevel.finest, true);
logSrv.getLogger("loginSrv").setLevel(eLogLevel.finest, true);
//logSrv.getLogger("userSrv").setLevel(eLogLevel.finest, true);
//logSrv.getLogger("infoSrv").setLevel(eLogLevel.finest, true);
logSrv.getLogger("nativeToJsBridgeSrv").setLevel(eLogLevel.finest, true);
//logSrv.getLogger("chatSrv").setLevel(eLogLevel.finest, true);
logSrv.getLogger("JSBridge").setLevel(eLogLevel.finest, true);
//logSrv.getLogger("backNavigationSrv").setLevel(eLogLevel.finest, true);
//logSrv.getLogger("pictureSrv").setLevel(eLogLevel.finest, true);
//logSrv.getLogger("LinphoneService").setLevel(eLogLevel.finest, true);
//logSrv.getLogger("contactSrv").setLevel(eLogLevel.finest, true);
//logSrv.getLogger("favoritesSrv").setLevel(eLogLevel.finest, true);
//logSrv.getLogger("callLogSrv").setLevel(eLogLevel.finest, true);
//logSrv.getLogger("callsSrv.onEvent").setLevel(eLogLevel.finest, true);
//logSrv.getLogger("callController").setLevel(eLogLevel.finest, true);
//logSrv.getLogger("loginController").setLevel(eLogLevel.finest, true);
//logSrv.getLogger("changePasswordSrv").setLevel(eLogLevel.finest, true);

