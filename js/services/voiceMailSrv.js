function voiceMailSrv($rootScope, loginSrv, userSrv, groupSrv, connectionSrv) {

    var serviceLogger = logSrv.getLogger("voiceMailSrv");
    var subscriptionReference;
    var newVoiceMailCounter = new CommonCounter();

    function getMembers() {
        var o = {
            "newVoiceMailCounter": newVoiceMailCounter,
            "subscriptionReference": subscriptionReference
        };
        return o;
    }

    function onLoggedOut(event, loginSrv) {
        var logger = serviceLogger.logMethodCall(arguments, eLogLevel.finer);

        try {
            newVoiceMailCounter.reset();
        } catch (err) {
            logger.error(err);
        }

        logger.logMethodCompleted(arguments, getMembers(), eLogLevel.finer);
    }

    function getSubscriptionURL() {
        return "sip:" + loginSrv.getUserName() + "@" + connectionSrv.getServerAddress()+";transport=tcp";
    }

    function onLoggingOut(event, loginSrv) {
        var logger = serviceLogger.logMethodCall(arguments, eLogLevel.finer);

        try {
            if (loginSrv.isLoggedInWithEndpoint() && subscriptionReference) {
                JSBridge.terminateVoiceMailNotificationSubscription(subscriptionReference);
                subscriptionReference = null;
            }
        } catch (err) {
            logger.error(err);
        }


        logger.logMethodCompleted(arguments, getMembers(), eLogLevel.finer);
    }

    function onLoggedIn(event) {
        var logger = serviceLogger.logMethodCall(arguments, eLogLevel.finer);

        try {
            if (loginSrv.isLoggedInWithEndpoint()) {
                subscriptionReference = JSBridge.subscribeForVoiceMailNotifications(getSubscriptionURL());
            }
        } catch (err) {
            logger.error(err);
        }


        logger.logMethodCompleted(arguments, getMembers(), eLogLevel.finer);
    }

    function onConnectionRestored() {
        var logger = serviceLogger.logMethodCall(arguments, eLogLevel.finer);

        try {
            if (loginSrv.isLoggedInWithEndpoint()) {
                JSBridge.terminateVoiceMailNotificationSubscription(subscriptionReference);
                subscriptionReference = JSBridge.subscribeForVoiceMailNotifications(getSubscriptionURL());
            }
        } catch (err) {
            logger.error(err);
        }


        logger.logMethodCompleted(arguments, getMembers(), eLogLevel.finer);
    }

    function onNotifyReceived(event, data) {
        var logger = serviceLogger.logMethodCall(arguments, eLogLevel.finer);
        try {
            var exp = /Voice-Message: ([0-9]+)/;
            var arr = exp.exec(data);
            var newMessages = parseInt(arr[1]);
            newVoiceMailCounter.set(newMessages);
            $rootScope.$broadcast("voiceMailSrv:voiceMailCounterChanged", newMessages);

        } catch (err) {
            logger.error(err);
        }



        logger.logMethodCompleted(arguments, getMembers(), eLogLevel.finer);
    }

    function getNewVoiceMailCounter() {
        return newVoiceMailCounter;
    }

    function getUserVoiceMailContact() {
        var logger = serviceLogger.logMethodCall(arguments, eLogLevel.finer);
        var contact = null;
        var user = userSrv.getUserData();
        if (user.userInfo.vm) {
            var groupList = groupSrv.getGroupList();
            for (var i = 0; i < groupList.length; i++) {
                var group = groupList[i];
                if (group.contact.displayName == user.userInfo.vm) {
                    contact = group;
                    break;
                }
            }
        }
        logger.logMethodCompleted(arguments, contact, eLogLevel.finer);
        return contact;
    }

    ``

    $rootScope.$on("loginSrv:loggedOut", onLoggedOut);
    $rootScope.$on("loginSrv:loggingOut", onLoggingOut);
    $rootScope.$on("loginSrv:loggedIn", onLoggedIn);
    $rootScope.$on("loginSrv:connectionRestored", onConnectionRestored);
    $rootScope.$on("linphone:NotifyReceived", onNotifyReceived);


    this._onLoggedOut = onLoggedOut;
    this._onLoggingOut = onLoggingOut;
    this._onLoggedIn = onLoggedIn;
    this._onConnectionRestored = onConnectionRestored;
    this._onNotifyReceived = onNotifyReceived;

    this.getNewVoiceMailCounter = getNewVoiceMailCounter;
    this.getUserVoiceMailContact = getUserVoiceMailContact;

}

var servicesModule = angular.module('aeonixApp.services');
servicesModule.service('voiceMailSrv', ['$rootScope', 'loginSrv', 'userSrv', 'groupSrv', 'connectionSrv', voiceMailSrv]);