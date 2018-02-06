function DeviceSrv(infoSrv, $rootScope, backNavigationSrv, $state) {

    var serviceLogger = logSrv.getLogger("deviceSrv");

    var isAppInBackground = false;
    var isAppInteractedSinceBackgroundRinging = true;

    function onActivityPaused(event) {
        var logger = serviceLogger.logMethodCall(arguments,eLogLevel.finer);
        try {
            setIsAppInBackground(true);
            $rootScope.$broadcast('deviceSrv:appVisibilityChanged',true);
        }catch(err){
            logger.error(err);
        }

    }

    function onActivityResumed(event) {
        var logger = serviceLogger.logMethodCall(arguments,eLogLevel.finer);
        try {
            setIsAppInBackground(false);
            $rootScope.$broadcast('deviceSrv:appVisibilityChanged',false);
        }catch(err){
            logger.error(err);
        }


    }

    function setIsAppInBackground(isApplicationInBackground){
        isAppInBackground = isApplicationInBackground;
    };

    function getIsAppInBackground(){
        return isAppInBackground;
    };

    function writeToStorage(key, value) {
        JSBridge.writeLocal(key, angular.toJson(value, false));
    };

    function writeToStorageNoJson(key, value) {
        JSBridge.writeLocal(key, value);
    };

    function readFromStorage(key) {
        return key ? JSBridge.readLocal(key) : "{}";
    };

    function getDeviceID (UserLoginName) {
        var res = JSBridge.readLocal(UserLoginName + "uniqueID");
        if (!res) {
            res = JSBridge.getDeviceID();
            JSBridge.writeLocal(UserLoginName + "uniqueID", res);
        }
        return (UserLoginName + res);
    };

    function bringAppToFront() {
        JSBridge.bringAppToFront();
    };

    function bringAppToBack() {
        JSBridge.bringAppToBack();
    };

    $rootScope.$on("app:activityPaused", onActivityPaused);
    $rootScope.$on("app:activityResumed", onActivityResumed);

    this._onActivityPaused=onActivityPaused;
    this._onActivityResumed=onActivityResumed;
    this.setIsAppInBackground=setIsAppInBackground;
    this.getIsAppInBackground=getIsAppInBackground;
    this.writeToStorage=writeToStorage;
    this.writeToStorageNoJson=writeToStorageNoJson;
    this.readFromStorage=readFromStorage;
    this.getDeviceID=getDeviceID;
    this.bringAppToFront=bringAppToFront;
    this.bringAppToBack=bringAppToBack;
}

var servicesModule = angular.module('aeonixApp.services');

servicesModule.service('deviceSrv', ['infoSrv','$rootScope','backNavigationSrv','$state',DeviceSrv]);