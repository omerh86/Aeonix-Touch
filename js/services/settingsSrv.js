function SettingsSrv($rootScope, loginSrv, storageSrv) {

    var serviceLogger = logSrv.getLogger("settingsSrv");

    var that = this;

    var settings = null;

    function getMembers() {
        var o = {
            "settings": settings
        };
        return o;
    }


    function createDefaultSettings() {

        var logger = serviceLogger.logMethodCall(arguments,eLogLevel.finer);

        var notifications = {
            ringOnIncomingCall: true,
            vibrateOnIncomingCall: false,
            playSoundOnNewMessage: false,
            vibrateOnNewMessage: false,
            playSoundOnVoiceMail: false,
            vibrateOnVoiceMail: false
        };

        var settings = {
            locale: localizationUtils.en_US.localeName,
            notifications: notifications,
            sort: 'last_name',
            sound: "orig",
            level: "FINE",
            sizeLog: 10
        };

        logger.logMethodCompleted(arguments, settings, eLogLevel.finer);
        return settings;
    }

    function onLoggedIn(event) {
        var logger = serviceLogger.logMethodCall(arguments,eLogLevel.finer);

        settings = getUserSettings(loginSrv.getLoginName());

        logger.logMethodCompleted(arguments, getMembers(), eLogLevel.finer);
    }

    function onLoggedOut(event) {
        var logger = serviceLogger.logMethodCall(arguments,eLogLevel.finer);

        settings = null;

        logger.logMethodCompleted(arguments, getMembers(), eLogLevel.finer);
    }

    function getUserSettings(loginName) {
        var logger = serviceLogger.logMethodCall(arguments,eLogLevel.finer);

        var settings = storageSrv.get(loginName,"settingsSrv","settings");
        if (!settings) {
            settings = createDefaultSettings();
        }

        logger.logMethodCompleted(arguments, settings, eLogLevel.finer);
        return settings;
    }

    function getSettings() {
        return settings;
    }

    function saveModifications() {
        var logger = serviceLogger.logMethodCall(arguments,eLogLevel.finer);
        storageSrv.addOrUpdate(loginSrv.getLoginName(),"settingsSrv","settings", settings);
    }


    $rootScope.$on("loginSrv:loggedIn", onLoggedIn);
    $rootScope.$on("loginSrv:loggedOut", onLoggedOut);

    this._createDefaultSettings = createDefaultSettings;
    this._onLoggedIn = onLoggedIn;
    this._onLoggedOut = onLoggedOut;
    this.getUserSettings = getUserSettings;
    this.getSettings = getSettings;
    this.saveModifications = saveModifications;

}

var servicesModule = angular.module('aeonixApp.services');
servicesModule.service('settingsSrv', ['$rootScope', 'loginSrv', 'storageSrv',SettingsSrv]);