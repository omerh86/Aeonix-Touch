function UserSrv($rootScope, infoSrv, loginSrv, cstaMonitoringSrv, locale, callsSrv, pictureSrv) {

    var serviceLogger = logSrv.getLogger("userSrv");

    var THAT = this;

    var userData = {
        userInfo: {},
        userGeneralInfo: {},
        featureProfile: {},
        RSBaseIncomingUserRouting: {},
        TerminalProfile: {},
        presence: UserStatusInfo.available,
        image: ""
    };


    function getMembers() {
        var o = {
            "userData": userData
        };
        return o;
    }


    function getUserData() {
        return userData;
    };

    function isDefaultPassword(userName) {
        if (userData != null && userData.userInfo != null) {
            return userData.userInfo.defaultPassword;
        }
        return false;
    }

    function getRsUser() {
        var logger = serviceLogger.logMethodCall(arguments, eLogLevel.finer);


        var obj = {
            GetRsUser: {
                userName: loginSrv.getUserName()
            }
        };
        infoSrv.sendRequest(obj);
    };

    function getUserImageSignature() {
        return userData.userInfo.imageSignature;
    };

    function saveUserDataModifications() {
        var logger = serviceLogger.logMethodCall(arguments, eLogLevel.finer);

        var obj = {
            SetRsUser: {
                userName: loginSrv.getUserName(),
                userInfo: {
                    rsUserInfo: userData.userInfo.applicationEpId == "" ? {} : userData.userInfo,
                    genInfo: userData.userGeneralInfo,
                    featuresProfile: userData.featureProfile
                }
            }
        };
        infoSrv.sendRequest(obj);
    };

    function startMonitorUser() {
        var logger = serviceLogger.logMethodCall(arguments, eLogLevel.finer);

        var obj = {
            StartMonitorUser: {
                userName: loginSrv.getUserName()
            }
        };

        infoSrv.sendRequest(obj);
    };
    

    function getExplicitPresenceInfo() {
        var logger = serviceLogger.logMethodCall(arguments, eLogLevel.finer);

        var obj = {
            GetExplicitPresenceInfo: {
                userName: loginSrv.getUserName()
            }
        };
        infoSrv.sendRequest(obj);
    };

    function changeUserPassword(oldPassword, newPassword) {
        var logger = serviceLogger.logMethodCall(arguments, eLogLevel.finer);
        var obj = {
            ChangeUserPassword: {
                userName: loginSrv.getUserName(),
                userLoginName: loginSrv.getLoginName(),
                oldUserPassword: oldPassword,
                newUserPassword: newPassword
            }
        };
        infoSrv.sendRequest(obj);
    };


    function setExplicitPresenceInfo(presenceObj) {
        var logger = serviceLogger.logMethodCall(arguments, eLogLevel.finer);
        userData.presence = UserStatusInfo.updateExplicitPresence(userData.presence, presenceObj);
        var obj = {
            SetExplicitPresenceInfo: {
                userName: loginSrv.getUserName(),
                explicitPresence: presenceObj.value // ONLINE/UNREACHABLE/AT_THE_MEETING
            }
        };
        infoSrv.sendRequest(obj);

    };

    function clearData() {
        userData.userGeneralInfo = {};
    };



    function onLoggedIn(event, loggedInWithEndpoint, loginSrv) {
        var logger = serviceLogger.logMethodCall(arguments, eLogLevel.finer);
        try {
            getRsUser();
            if (loggedInWithEndpoint) {
                getExplicitPresenceInfo();
                startMonitorUser();
                var pic = pictureSrv.getPicture(loginSrv.getUserName(), getUserImageSignature());
                userData.image = pic.picture;
                userData.presence = UserStatusInfo.available;
            }
        } catch (err) {
            logger.error(err);
        }
        logger.logMethodCompleted(arguments, getMembers(), eLogLevel.finer);
    }

    function onConnectionRestored(event, loginSrv) {
        var logger = serviceLogger.logMethodCall(arguments, eLogLevel.finer);
        try {
            userData.presence = UserStatusInfo.updateImplicitPresence(userData.presence, ePresence.available);
            getExplicitPresenceInfo();
            startMonitorUser();
        } catch (err) {
            logger.error(err);
        }

        logger.logMethodCompleted(arguments, getMembers(), eLogLevel.finer);
    }

    function onConnectionFailed(event, loginSrv) {
        var logger = serviceLogger.logMethodCall(arguments, eLogLevel.finer);
        try {
            userData.presence = UserStatusInfo.updateImplicitPresence(userData.presence, ePresence.offline);
        } catch (err) {
            logger.error(err);
        }
        logger.logMethodCompleted(arguments, getMembers(), eLogLevel.finer);
    }

    function onPictureUpdated(event, userName, pictureInfo) {
        var logger = serviceLogger.logMethodCall(arguments, eLogLevel.finer);
        try {
            if (userName === loginSrv.getUserName()) {
                userData.image = pictureInfo.picture;
            }
        } catch (err) {
            logger.error(err);
        }
        logger.logMethodCompleted(arguments, getMembers(), eLogLevel.finer);
    }

    function onRsUserResponse(event, data) {
        var logger = serviceLogger.logMethodCall(arguments, eLogLevel.finer);
        try {
            userData.featureProfile = data.featuresProfile;
            userData.userInfo = data.rsUserInfo;
            userData.userGeneralInfo = data.genInfo;
            $rootScope.$broadcast("userSrv:userInfoUpdated");
        } catch (err) {
            logger.error(err);
        }

        logger.logMethodCompleted(arguments, getMembers(), eLogLevel.finer);
    }



    function onRSUserPresenceInfo(event, data) {
        var logger = serviceLogger.logMethodCall(arguments, eLogLevel.finer);
        try {
            userData.presence = UserStatusInfo.updateExplicitPresence(userData.presence, ePresence.parse(data.precense));
        } catch (err) {
            logger.error(err);
        }
        logger.logMethodCompleted(arguments, getMembers(), eLogLevel.finer);

    }

    function onPresenceStateEvent(event, presence) {
        var logger = serviceLogger.logMethodCall(arguments, eLogLevel.finer);
        try {
            if (presence.device.deviceIdentifier == loginSrv.getUserName()) {
                userData.presence = UserStatusInfo.fromCstaPresenceState(presence);
            }
        } catch (err) {
            logger.error(err);
        }

        logger.logMethodCompleted(arguments, getMembers(), eLogLevel.finer);
    }

    function onCallStateChanged() {
        var logger = serviceLogger.logMethodCall(arguments, eLogLevel.finer);
        try {
            if (userData.presence.implicitPresence != ePresence.offline) {
                var calls = 0;
                var callQueue = callsSrv.getCalls();
                if (callQueue && callQueue.length) {
                    calls = callQueue.length;
                }
                if (calls > 0) {
                    userData.presence = UserStatusInfo.updateImplicitPresence(userData.presence, ePresence.busy);
                } else {
                    userData.presence = UserStatusInfo.updateImplicitPresence(userData.presence, ePresence.available);
                }
            }
        } catch (err) {
            logger.error(err);
        }
        logger.logMethodCompleted(arguments, getMembers(), eLogLevel.finer);

    }

    function onChangeUserPasswordResponse(event, data) {
        userData.userInfo.defaultPassword = false;
    }

    this._getMembers = getMembers;
    this.getUserData = getUserData;
    this.isDefaultPassword = isDefaultPassword;
    this.getRsUser = getRsUser;
    this.getUserImageSignature = getUserImageSignature;
    this.saveUserDataModifications = saveUserDataModifications;
    this.startMonitorUser = startMonitorUser;
    this.getExplicitPresenceInfo = getExplicitPresenceInfo;
    this.changeUserPassword = changeUserPassword;
    this.setExplicitPresenceInfo = setExplicitPresenceInfo;
    this.clearData = clearData;
    this.onLoggedIn = onLoggedIn;
    this.onConnectionRestored = onConnectionRestored;
    this.onConnectionFailed = onConnectionFailed;
    this.onPictureUpdated = onPictureUpdated;
    this.onRsUserResponse = onRsUserResponse;
    this.onRSUserPresenceInfo = onRSUserPresenceInfo;
    this.onPresenceStateEvent = onPresenceStateEvent;
    this.onCallStateChanged = onCallStateChanged;
    this.onChangeUserPasswordResponse = onChangeUserPasswordResponse;

    $rootScope.$on("loginSrv:loggedIn", onLoggedIn);
    $rootScope.$on("loginSrv:connectionRestored", onConnectionRestored);
    $rootScope.$on("loginSrv:connectionFailed", onConnectionFailed);
    $rootScope.$on("pictureSrv:pictureUpdated", onPictureUpdated);
    $rootScope.$on("infoSrv:RsUserResponse", onRsUserResponse);
    $rootScope.$on("infoSrv:RSUserPresenceInfo", onRSUserPresenceInfo);
    $rootScope.$on("infoSrv:PresenceStateEvent", onPresenceStateEvent);
    $rootScope.$on("infoSrv:ChangeUserPasswordResponse", onChangeUserPasswordResponse)
    $rootScope.$on("callsSrv:callStateChanged", onCallStateChanged);


}


var servicesModule = angular.module('aeonixApp.services');

servicesModule.service('userSrv', ['$rootScope', 'infoSrv', 'loginSrv', 'cstaMonitoringSrv', 'locale', 'callsSrv', 'pictureSrv', UserSrv]);