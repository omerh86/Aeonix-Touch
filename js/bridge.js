var JSBridge = (function() {


    var srv = {};
    var serviceLogger = logSrv.getLogger("JSBridge");


    function writeLocal(key, value) {
        var logger = serviceLogger.logMethodCall(arguments,eLogLevel.finer);
        try {
            fileStorage.writeLocal(key, value);
        } catch (err) {
            logger.error(err);
        }
    }

    function readLocal(key) {
        var logger = serviceLogger.logMethodCall(arguments,eLogLevel.finer);
        var res;
        try {
            res = fileStorage.readLocal(key);
        } catch (err) {
            logger.error(err);
        }
        logger.logMethodCompleted(arguments, res, eLogLevel.finer);
        return res;
    }


    function getDeviceID() {
        var logger = serviceLogger.logMethodCall(arguments,eLogLevel.finer);
        var res;
        try {
            res = appInfo.getDeviceID();
        } catch (err) {
            logger.error(err);
        }
        logger.logMethodCompleted(arguments, res, eLogLevel.finer);
        return res;

    }

    function getAppVersion() {
        var logger = serviceLogger.logMethodCall(arguments,eLogLevel.finer);
        var res;
        try {
            res = appInfo.getAppVersion();
        } catch (err) {
            logger.error(err);
        }
        logger.logMethodCompleted(arguments, res, eLogLevel.finer);
        return res;

    }


    function stopPlayingFile() {
        var logger = serviceLogger.logMethodCall(arguments,eLogLevel.finer);
        try {
            soundService.stopPlayingFile();
        } catch (err) {
            logger.error(err);
        }
    }



    function playFile(fileName, loop) {
        var logger = serviceLogger.logMethodCall(arguments,eLogLevel.finer);
        try {
            soundService.playFile(fileName, loop);
        } catch (err) {
            logger.error(err);
        }
    }

    function playNotificationSound() {
        var logger = serviceLogger.logMethodCall(arguments,eLogLevel.finer);
        try {
            soundService.playNotificationSound();
        } catch (err) {
            logger.error(err);
        }
    }



    function vibrateContinuously() {
        var logger = serviceLogger.logMethodCall(arguments,eLogLevel.finer);
        try {
            vibrationService.vibrateContinuously();
        } catch (err) {
            logger.error(err);
        }
    }


    function vibrateOnce() {
        var logger = serviceLogger.logMethodCall(arguments,eLogLevel.finer);
        try {
            vibrationService.vibrateOnce();
        } catch (err) {
            logger.error(err);
        }
    }

    function stopVibration() {
        var logger = serviceLogger.logMethodCall(arguments,eLogLevel.finer);
        try {
            vibrationService.stopVibration();
        } catch (err) {
            logger.error(err);
        }
    }


    function moveAppToBack() {
        var logger = serviceLogger.logMethodCall(arguments,eLogLevel.finer);
        try {
            appVisibilityService.moveAppToBack();
        } catch (err) {
            logger.error(err);
        }
    }


    function onIncomingCall() {
        var logger = serviceLogger.logMethodCall(arguments,eLogLevel.finer);
        try {
            appVisibilityService.onIncomingCall();
        } catch (err) {
            logger.error(err);
        }
    }


    function onNoCalls() {
        var logger = serviceLogger.logMethodCall(arguments,eLogLevel.finer);
        try {
            appVisibilityService.onNoCalls();
        } catch (err) {
            logger.error(err);
        }
    }




    function resetTransports() {
        var logger = serviceLogger.logMethodCall(arguments,eLogLevel.finer);
        try {
            linphone.resetTransports();
        } catch (err) {
            logger.error(err);
        }
    }

    function terminateAllDialogs() {
        var logger = serviceLogger.logMethodCall(arguments,eLogLevel.finer);
        try {
            linphone.terminateAllDialogs();
        } catch (err) {
            logger.error(err);
        }
    }

    function sendInfo(nativeToken, jsonInfo, skipLogging) {
        var logger = serviceLogger.logMethodCall(arguments,eLogLevel.finer);
        try {
            linphone.sendInfo(nativeToken, jsonInfo, skipLogging);
        } catch (err) {
            logger.error(err);
        }
    }



    function createAuthInfo(userName, password, domain) {
        var logger = serviceLogger.logMethodCall(arguments,eLogLevel.finer);
        var res;
        try {
            res = linphone.createAuthInfo(userName, password, domain);
        } catch (err) {
            logger.error(err);
        }
        logger.logMethodCompleted(arguments, res, eLogLevel.finer);
        return res;
    }

    function addAuthInfo(authInfoRef) {
        var logger = serviceLogger.logMethodCall(arguments,eLogLevel.finer);
        try {
            linphone.addAuthInfo(authInfoRef);
        } catch (err) {
            logger.error(err);
        }
    }

    function removeAuthInfo(authInfoRef) {
        var logger = serviceLogger.logMethodCall(arguments,eLogLevel.finer);
        try {
            linphone.removeAuthInfo(authInfoRef);
        } catch (err) {
            logger.error(err);
        }
    }

    function createProxyConfig(identity, proxy, route, expires) {
        var logger = serviceLogger.logMethodCall(arguments,eLogLevel.finer);
        var res;
        try {
            res =  linphone.createProxyConfig(identity, proxy, route, expires);
        } catch (err) {
            logger.error(err);
        }
        logger.logMethodCompleted(arguments, res, eLogLevel.finer);
        return res;
    }

    function addProxyConfig(proxyConfigReference) {
        var logger = serviceLogger.logMethodCall(arguments,eLogLevel.finer);
        try {
            linphone.addProxyConfig(proxyConfigReference);
        } catch (err) {
            logger.error(err);
        }
    }

    function register(proxyConfigReference) {
        var logger = serviceLogger.logMethodCall(arguments,eLogLevel.finer);
        try {
            linphone.register(proxyConfigReference);
        } catch (err) {
            logger.error(err);
        }
    }

    function terminateRegistration(proxyConfigReference) {
        var logger = serviceLogger.logMethodCall(arguments,eLogLevel.finer);
        try {
            linphone.terminateRegistration(proxyConfigReference);
        } catch (err) {
            logger.error(err);
        }
    }

    function removeProxyConfig(proxyConfigReference) {
        var logger = serviceLogger.logMethodCall(arguments,eLogLevel.finer);
        try {
            linphone.removeProxyConfig(proxyConfigReference);
        } catch (err) {
            logger.error(err);
        }
    }

    srv.makeTR87Call = function(url) {
        var logger = serviceLogger.logMethodCall(arguments,eLogLevel.finer);
        var res;
        try {
            res =  linphone.makeTR87Call(url);
        } catch (err) {
            logger.error(err);
        }

        logger.logMethodCompleted(arguments, res, eLogLevel.finer);
        return res;
    }

    function makeCall(url) {
        var logger = serviceLogger.logMethodCall(arguments,eLogLevel.finer);
        var res;
        try {
            res =  linphone.makeCall(url);
        } catch (err) {
            logger.error(err);
        }
        logger.logMethodCompleted(arguments, res, eLogLevel.finer);
        return res;
    }

    function mute(muted) {
        var logger = serviceLogger.logMethodCall(arguments,eLogLevel.finer);
        try {
            linphone.mute(muted);
        } catch (err) {
            logger.error(err);
        }
    }

    function toggleSpeaker(on) {
        var logger = serviceLogger.logMethodCall(arguments,eLogLevel.finer);
        try {
            linphone.toggleSpeaker(on);
        } catch (err) {
            logger.error(err);
        }
    }

    function answerCall(nativeToken) {
        var logger = serviceLogger.logMethodCall(arguments,eLogLevel.finer);
        try {
            linphone.answerCall(nativeToken);
        } catch (err) {
            logger.error(err);
        }
    }


    function terminateCall(nativeToken) {
        var logger = serviceLogger.logMethodCall(arguments,eLogLevel.finer);
        try {
            linphone.terminateCall(nativeToken);
        } catch (err) {
            logger.error(err);
        }
    }


    function holdCall(nativeToken) {
        var logger = serviceLogger.logMethodCall(arguments,eLogLevel.finer);
        try {
            linphone.holdCall(nativeToken);
        } catch (err) {
            logger.error(err);
        }
    }


    function resumeCall(nativeToken) {
        var logger = serviceLogger.logMethodCall(arguments,eLogLevel.finer);
        try {
            linphone.resumeCall(nativeToken);
        } catch (err) {
            logger.error(err);
        }
    }


    function transferCall(fromCallNativeToken, toCallNativeToken) {
        var logger = serviceLogger.logMethodCall(arguments,eLogLevel.finer);
        try {
            linphone.transferCall(fromCallNativeToken, toCallNativeToken);
        } catch (err) {
            logger.error(err);
        }
    }

    function transferCallToUrl(nativeToken, url) {
        var logger = serviceLogger.logMethodCall(arguments,eLogLevel.finer);
        try {
            linphone.transferCallToUrl(nativeToken, url);
        } catch (err) {
            logger.error(err);
        }
    }


    function redirect(nativeToken, url) {
        var logger = serviceLogger.logMethodCall(arguments,eLogLevel.finer);
        try {
            linphone.redirect(nativeToken, url);
        } catch (err) {
            logger.error(err);
        }
    }

    function sendDTMF(dtmf) {
        var logger = serviceLogger.logMethodCall(arguments,eLogLevel.finer);
        try {
            linphone.sendDTMF(dtmf);
        } catch (err) {
            logger.error(err);
        }
    }

    function subscribeForVoiceMailNotifications(url) {
        var logger = serviceLogger.logMethodCall(arguments,eLogLevel.finer);
        var res;
        try {
            res =  linphone.subscribeForVoiceMailNotifications(url);
        }catch (err){
            logger.error(err);
        }
        logger.logMethodCompleted(arguments, res, eLogLevel.finer);
        return res;
    }

    function terminateVoiceMailNotificationSubscription(subscriptionReference) {
        var logger = serviceLogger.logMethodCall(arguments,eLogLevel.finer);
        try {
            linphone.terminateVoiceMailNotificationSubscription(subscriptionReference);
        }catch (err){
            logger.error(err);
        }
    }

    function addToOrUpdateInStorage(userName, category, key, value) {
        var logger = serviceLogger.logMethodCall(arguments,eLogLevel.finer);
        try {
            dbStorage.addToOrUpdateInStorage(userName, category, key, value);
        } catch (err) {
            logger.error(err);
        }
    }

    function getFromStorage(userName, category,key) {
        var logger = serviceLogger.logMethodCall(arguments,eLogLevel.finer);
        var res;
        try {
            res =  dbStorage.getFromStorage(userName,category,key);
        } catch (err) {
            logger.error(err);
        }
        logger.logMethodCompleted(arguments, res, eLogLevel.finer);
        return res;
    }

    function removeFromStorage(userName, category,key) {
        var logger = serviceLogger.logMethodCall(arguments,eLogLevel.finer);
        try {
            dbStorage.removeFromStorage(userName,category,key);
        } catch (err) {
            logger.error(err);
        }
    }

    function getAllValuesOfCategory(userName, category) {
        var logger = serviceLogger.logMethodCall(arguments,eLogLevel.finer);
        var res;
        try {
            res =  dbStorage.getAllValuesOfCategory(userName,category);
        } catch (err) {
            logger.error(err);
        }
        logger.logMethodCompleted(arguments, res, eLogLevel.finer);
        return res;
    }

    function removeAllValuesOfCategory(userName, category) {
        var logger = serviceLogger.logMethodCall(arguments,eLogLevel.finer);
        try {
            dbStorage.removeAllValuesOfCategory(userName,category);
        } catch (err) {
            logger.error(err);
        }
    }

    function removeAllValuesOfUser(userName) {
        var logger = serviceLogger.logMethodCall(arguments,eLogLevel.finer);
        try {
            dbStorage.removeAllValuesOfUser(userName);
        } catch (err) {
            logger.error(err);
        }
    }



    function setNotification(id, title, content, view,  vibrate, sound) {
        var logger = serviceLogger.logMethodCall(arguments,eLogLevel.finer);
        try {
            notification.setNotification(id, title, content, view, vibrate, sound);
        }catch (err){
            logger.error(err);
        }
    }

    function resetNotification(id) {
        var logger = serviceLogger.logMethodCall(arguments,eLogLevel.finer);
        try {
            notification.resetNotification(id);
        }catch (err){
            logger.error(err);
        }
    }

    function getConnectionStatusInfo() {
        var logger = serviceLogger.logMethodCall(arguments,eLogLevel.finer);
        var res;
        try {
            res = connectivity.getConnectionStatusInfo();
            res = angular.fromJson(res);
        }catch (err){
            logger.error(err);
        }
        logger.logMethodCompleted(arguments, res, eLogLevel.finer);
        return res;
    }

    function getPhoneContacts(start, number) {
        var logger = serviceLogger.logMethodCall(arguments,eLogLevel.finer);
        var res;
        try {
            res = phoneContactsService.getPhoneContacts(start, number);
            res = angular.fromJson(res);
        }catch (err){
            logger.error(err);
        }
        logger.logMethodCompleted(arguments, res, eLogLevel.finer);
        return res;
    }

    srv.getDeviceID=getDeviceID
    srv.getAppVersion=getAppVersion
    srv.writeLocal=writeLocal
    srv.readLocal=readLocal
    srv.stopPlayingFile=stopPlayingFile
    srv.playFile=playFile
    srv.playNotificationSound=playNotificationSound
    srv.vibrateContinuously = vibrateContinuously
    srv.vibrateOnce = vibrateOnce
    srv.stopVibration = stopVibration
    srv.moveAppToBack=moveAppToBack
    srv.onIncomingCall=onIncomingCall
    srv.onNoCalls=onNoCalls
    srv.resetTransports = resetTransports;
    srv.terminateAllDialogs=terminateAllDialogs
    srv.sendInfo=sendInfo
    srv.createAuthInfo=createAuthInfo
    srv.addAuthInfo=addAuthInfo
    srv.removeAuthInfo=removeAuthInfo
    srv.createProxyConfig=createProxyConfig
    srv.addProxyConfig=addProxyConfig
    srv.register=register
    srv.terminateRegistration=terminateRegistration
    srv.removeProxyConfig=removeProxyConfig
    srv.makeCall=makeCall
    srv.mute=mute
    srv.toggleSpeaker=toggleSpeaker
    srv.answerCall=answerCall
    srv.terminateCall=terminateCall
    srv.holdCall=holdCall
    srv.resumeCall=resumeCall
    srv.transferCall=transferCall
    srv.transferCallToUrl=transferCallToUrl
    srv.redirect=redirect
    srv.sendDTMF=sendDTMF
    srv.subscribeForVoiceMailNotifications=subscribeForVoiceMailNotifications
    srv.terminateVoiceMailNotificationSubscription=terminateVoiceMailNotificationSubscription
    srv.addToOrUpdateInStorage=addToOrUpdateInStorage
    srv.getFromStorage=getFromStorage
    srv.removeFromStorage=removeFromStorage
    srv.getAllValuesOfCategory=getAllValuesOfCategory
    srv.removeAllValuesOfCategory=removeAllValuesOfCategory
    srv.removeAllValuesOfUser=removeAllValuesOfUser
    srv.setNotification=setNotification
    srv.resetNotification=resetNotification
    srv.getConnectionStatusInfo = getConnectionStatusInfo;
    srv.getPhoneContacts = getPhoneContacts;

    return srv;
}())