//todo michael: handle updating the notifications upon login
function NotificationSrv($rootScope, callLogSrv, chatSrv, settingsSrv) {

    var serviceLogger = logSrv.getLogger("notificationSrv");

    var eNotificationType = {
        missedCalls: 1,
        unreadMessages: 2,
        voiceMail: 3
    };

    function onNewCalls(event, newCallsInfo) {
        var logger = serviceLogger.logMethodCall(arguments, eLogLevel.finer);

        try {
            if (newCallsInfo.newMissedCalls > 0) {
                var notificationText;
                var missedCalls = callLogSrv.getMissedCallsCounter().counter;
                if (missedCalls == 1) {
                    notificationText = $rootScope.getFilter()('i18n')('messages.NewMissedCalls');
                } else {
                    notificationText = $rootScope.getFilter()('i18n')('messages.NewMissedCalls');
                    notificationText = notificationText.replace("%", parseInt(missedCalls));
                }
                JSBridge.setNotification(eNotificationType.missedCalls, notificationText, "", 'home.callLog', false, false);
            }
        } catch (err) {
            logger.error(err);
        }


    }

    function onMissedCallsDismissed(event, newCallsInfo) {
        var logger = serviceLogger.logMethodCall(arguments, eLogLevel.finer);
        try {
            JSBridge.resetNotification(eNotificationType.missedCalls);
        } catch (err) {
            logger.error(err);
        }

    }


    function onUnseenMessagesCounterChanged(event, newValue, oldValue) {
        var logger = serviceLogger.logMethodCall(arguments, eLogLevel.finer);

        try {
            if (newValue > 0) {
                var newMessage = oldValue && newValue > oldValue;
                var playSound = newMessage && settingsSrv.getSettings().notifications.playSoundOnNewMessage;
                var vibrate = newMessage && settingsSrv.getSettings().notifications.vibrateOnNewMessage;
                var notificationText;
                if (newValue == 1) {
                    notificationText = $rootScope.getFilter()('i18n')('messages.NewMessage');
                } else {
                    notificationText = $rootScope.getFilter()('i18n')('messages.NewMessages');
                    notificationText = notificationText.replace("%", parseInt(newValue));
                }
                JSBridge.setNotification(eNotificationType.unreadMessages, notificationText, "", 'home.chatList', false, false);
                if (playSound) {
                    JSBridge.playNotificationSound();
                }
                if (vibrate) {
                    JSBridge.vibrateOnce();
                }
            } else {
                JSBridge.resetNotification(eNotificationType.unreadMessages);
            }
        } catch (err) {
            logger.error(err);
        }


    }

    function onVoiceMailCounterChanged(event, newValue) {
        var logger = serviceLogger.logMethodCall(arguments, eLogLevel.finer);

        try {
            if (newValue > 0) {
                var notificationText;
                if (newValue == 1) {
                    notificationText = $rootScope.getFilter()('i18n')('messages.NewVoiceMail');
                } else {
                    notificationText = $rootScope.getFilter()('i18n')('messages.NewVoiceMails');
                    notificationText = notificationText.replace("%", parseInt(newValue));
                }

                var playSound = settingsSrv.getSettings().notifications.playSoundOnVoiceMail;
                var vibrate = settingsSrv.getSettings().notifications.vibrateOnVoiceMail;

                JSBridge.setNotification(eNotificationType.voiceMail, notificationText, "", 'home.favorites', false, false);

                if (playSound) {
                    JSBridge.playNotificationSound();
                }
                if (vibrate) {
                    JSBridge.vibrateOnce();
                }
            } else {
                JSBridge.setNotification(eNotificationType.voiceMail);
            }
        } catch (err) {
            logger.error(err);
        }
    }

    $rootScope.$on("callLogSrv:newCalls", onNewCalls);
    $rootScope.$on("callLogSrv:missedCallsDismissed", onMissedCallsDismissed);
    $rootScope.$on("chatSrv:unseenMessagesCounterChanged", onUnseenMessagesCounterChanged);
    $rootScope.$on("chatSrv:voiceMailCounterChanged", onVoiceMailCounterChanged);



    this._onNewCalls = onNewCalls;
    this._onMissedCallsDismissed = onMissedCallsDismissed;
    this._onUnseenMessagesCounterChanged = onUnseenMessagesCounterChanged;
    this._onVoiceMailCounterChanged = onVoiceMailCounterChanged;

}

var servicesModule = angular.module('aeonixApp.services');
servicesModule.service('notificationSrv', ['$rootScope', 'callLogSrv', 'chatSrv', 'settingsSrv', NotificationSrv]);