function NativeSrv() {

    function writeLocal(key, value) {
        fileStorage.writeLocal(key, value);
    }

    function readLocal(key) {
        return fileStorage.readLocal(key);
    }


    function getDeviceID() {
        return appInfo.getDeviceID();
    }

    function getAppVersion() {

        return appInfo.getAppVersion();
    }

    function stopPlayingFile() {

        soundService.stopPlayingFile();

    }


    function playFile(fileName, loop) {

        soundService.playFile(fileName, loop);

    }

    function playNotificationSound() {

        soundService.playNotificationSound();

    }


    function vibrateContinuously() {

        vibrationService.vibrateContinuously();

    }


    function vibrateOnce() {

        vibrationService.vibrateOnce();

    }

    function stopVibration() {

        vibrationService.stopVibration();

    }


    function onIncomingCall() {

        appVisibilityService.onIncomingCall();

    }


    function onNoCalls() {

        appVisibilityService.onNoCalls();

    }


    function resetTransports() {

        linphone.resetTransports();

    }

    function terminateAllDialogs() {

        linphone.terminateAllDialogs();

    }

    function sendInfo(nativeToken, jsonInfo, skipLogging) {

        linphone.sendInfo(nativeToken, jsonInfo, skipLogging);

    }


    function createAuthInfo(userName, password, domain) {

        return linphone.createAuthInfo(userName, password, domain);

    }

    function addAuthInfo(authInfoRef) {

        linphone.addAuthInfo(authInfoRef);

    }

    function removeAuthInfo(authInfoRef) {

        linphone.removeAuthInfo(authInfoRef);

    }

    function createProxyConfig(identity, proxy, route, expires) {

        return linphone.createProxyConfig(identity, proxy, route, expires);

    }

    function addProxyConfig(proxyConfigReference) {
        linphone.addProxyConfig(proxyConfigReference);
    }

    function register(proxyConfigReference) {

        linphone.register(proxyConfigReference);

    }

    function terminateRegistration(proxyConfigReference) {

        linphone.terminateRegistration(proxyConfigReference);

    }

    function removeProxyConfig(proxyConfigReference) {

        linphone.removeProxyConfig(proxyConfigReference);

    }

    function makeTR87Call(url) {

        return linphone.makeTR87Call(url);

    }

    function makeCall(url) {

        return linphone.makeCall(url);

    }

    function mute(muted) {

        linphone.mute(muted);

    }

    function toggleSpeaker(on) {

        linphone.toggleSpeaker(on);

    }

    function answerCall(nativeToken) {

        linphone.answerCall(nativeToken);

    }


    function terminateCall(nativeToken) {

        linphone.terminateCall(nativeToken);

    }


    function holdCall(nativeToken) {

        linphone.holdCall(nativeToken);

    }


    function resumeCall(nativeToken) {

        linphone.resumeCall(nativeToken);

    }


    function transferCall(fromCallNativeToken, toCallNativeToken) {

        linphone.transferCall(fromCallNativeToken, toCallNativeToken);

    }

    function transferCallToUrl(nativeToken, url) {

        linphone.transferCallToUrl(nativeToken, url);

    }


    function redirect(nativeToken, url) {

        linphone.redirect(nativeToken, url);

    }

    function sendDTMF(dtmf) {

        linphone.sendDTMF(dtmf);

    }

    function subscribeForVoiceMailNotifications(url) {

        linphone.subscribeForVoiceMailNotifications(url);

    }

    function terminateVoiceMailNotificationSubscription(subscriptionReference) {

        linphone.terminateVoiceMailNotificationSubscription(subscriptionReference);

    }

    function addToOrUpdateInStorage(userName, category, key, value) {

        dbStorage.addToOrUpdateInStorage(userName, category, key, value);

    }

    function getFromStorage(userName, category, key) {

        return dbStorage.getFromStorage(userName, category, key);

    }

    function removeFromStorage(userName, category, key) {

        dbStorage.removeFromStorage(userName, category, key);

    }

    function getAllValuesOfCategory(userName, category) {
        return dbStorage.getAllValuesOfCategory(userName, category);
    }

    function removeAllValuesOfCategory(userName, category) {
        dbStorage.removeAllValuesOfCategory(userName, category);
    }

    function removeAllValuesOfUser(userName) {

        dbStorage.removeAllValuesOfUser(userName);
    }

    function setNotification(id, title, content, view, vibrate, sound) {
        notification.setNotification(id, title, content, view, vibrate, sound);
    }

    function resetNotification(id) {
        notification.resetNotification(id);
    }

    function getConnectionStatusInfo() {
        var connectionStatusInfo = connectivity.getConnectionStatusInfo();
        return angular.fromJson(connectionStatusInfo);
    }

    function getPhoneContacts(start, number) {
        var contacts = phoneContactsService.getPhoneContacts(start, number);
        return angular.fromJson(contacts);
    }

    function  isPublicIP(ip) {
        return networking.isPublicIP(ip);
    }

    this.getDeviceID = getDeviceID;
    this.getAppVersion = getAppVersion;
    this.writeLocal = writeLocal;
    this.readLocal = readLocal;
    this.stopPlayingFile = stopPlayingFile;
    this.playFile = playFile;
    this.playNotificationSound = playNotificationSound;
    this.vibrateContinuously = vibrateContinuously;
    this.vibrateOnce = vibrateOnce;
    this.stopVibration = stopVibration;
    this.onIncomingCall = onIncomingCall;
    this.onNoCalls = onNoCalls;
    this.resetTransports = resetTransports;
    this.terminateAllDialogs = terminateAllDialogs;
    this.sendInfo = sendInfo;
    this.createAuthInfo = createAuthInfo;
    this.addAuthInfo = addAuthInfo;
    this.removeAuthInfo = removeAuthInfo;
    this.createProxyConfig = createProxyConfig;
    this.addProxyConfig = addProxyConfig;
    this.register = register;
    this.terminateRegistration = terminateRegistration;
    this.removeProxyConfig = removeProxyConfig;
    this.makeCall = makeCall;
    this.mute = mute;
    this.toggleSpeaker = toggleSpeaker;
    this.answerCall = answerCall;
    this.terminateCall = terminateCall;
    this.holdCall = holdCall;
    this.resumeCall = resumeCall;
    this.transferCall = transferCall;
    this.transferCallToUrl = transferCallToUrl;
    this.redirect = redirect;
    this.sendDTMF = sendDTMF;
    this.subscribeForVoiceMailNotifications = subscribeForVoiceMailNotifications;
    this.terminateVoiceMailNotificationSubscription = terminateVoiceMailNotificationSubscription;
    this.addToOrUpdateInStorage = addToOrUpdateInStorage;
    this.getFromStorage = getFromStorage;
    this.removeFromStorage = removeFromStorage;
    this.getAllValuesOfCategory = getAllValuesOfCategory;
    this.removeAllValuesOfCategory = removeAllValuesOfCategory;
    this.removeAllValuesOfUser = removeAllValuesOfUser;
    this.setNotification = setNotification;
    this.resetNotification = resetNotification;
    this.getConnectionStatusInfo = getConnectionStatusInfo;
    this.getPhoneContacts = getPhoneContacts;
    this.makeTR87Call = makeTR87Call;
    
}

var servicesModule = angular.module('aeonixApp.services');
servicesModule.service('nativeSrv', [NativeSrv]);