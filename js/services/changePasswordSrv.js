function ChangePasswordSrv($rootScope, $timeout, deviceSrv, connectionSrv, connectionAddressFinderSrv, infoSrv, storageSrv, loginSrv, userSrv) {

    var serviceLogger = logSrv.getLogger("changePasswordSrv");

    var that = this;

    var _loginName = null;
    var _oldPassword = null;
    var _newPassword = null;
    var _error = null;
    var _passwordFailures = null;
    var _inProgress = false;


    function getMembers() {
        var o = {
            "_loginName":_loginName,
            "_oldPassword":_oldPassword,
            "_newPassword":_newPassword,
            "_error":_error,
            "_passwordFailures":_passwordFailures,
            "_inProgress":_inProgress
        };
        return o;
    }

    function clean() {
        _loginName = null;
        _oldPassword = null;
        _newPassword = null;
        _error = null;
        _passwordFailures = null;
    }

    function finalizeChangingPassword() {
        var logger = serviceLogger.logMethodCall(arguments, eLogLevel.finer);

        var error = _error;
        var passwordFailures = _passwordFailures;
        clean();
        _inProgress = false;
        $rootScope.$broadcast("changePasswordSrv:finished", error, passwordFailures);

        logger.logMethodCompleted(arguments, getMembers(), eLogLevel.finer);
    }

    function setError(e) {
        if (_error===undefined || _error===null) {
            _error = e;
        }
    }

    function onLoginFailed(event, error, loginSrv) {
        var logger = serviceLogger.logMethodCall(arguments, eLogLevel.finer);

        if (_inProgress) {
            if (error==eError.AuthorizationError){
                setError(eChangePasswordError.IncorrectOldPassword);
            }else {
                setError(eChangePasswordError.ConnectionError);
            }
            finalizeChangingPassword();
        }


        logger.logMethodCompleted(arguments, getMembers(), eLogLevel.finer);
    }

    function onLoggedOut(event, reason) {
        var logger = serviceLogger.logMethodCall(arguments, eLogLevel.finer);

        if (_inProgress) {
            if (reason == eLogoutReason.changingPassword){
                loginSrv.loginToUser(_loginName, _oldPassword);
            } else {
                finalizeChangingPassword();
            }
        }


        logger.logMethodCompleted(arguments, getMembers(), eLogLevel.finer);
    }

    function onLoggedIn(event, loggedInWithEndpoint, loginSrv) {
        var logger = serviceLogger.logMethodCall(arguments, eLogLevel.finer);

        if (_inProgress) {
            userSrv.changeUserPassword(_oldPassword, _newPassword);
        }


        logger.logMethodCompleted(arguments, getMembers(), eLogLevel.finer);
    }

    function onConnectionFailed(event, error, loginSrv) {
        var logger = serviceLogger.logMethodCall(arguments,eLogLevel.finer);

        if (_inProgress) {
            setError(eChangePasswordError.ConnectionError);
            loginSrv.logout(eLogoutReason.connectionError);
        }


        logger.logMethodCompleted(arguments, getMembers(), eLogLevel.finer);
    }

    function onChangeUserPasswordResponse(event, data) {
        var logger = serviceLogger.logMethodCall(arguments,eLogLevel.finer);


        if (data.errCode == -1) {
            _passwordFailures = data.checkResult.failures;
            setError(eChangePasswordError.WeakPassword);
        }


        loginSrv.logout(eLogoutReason.switchingToEndpointLogin);
    }

    
    function changePassword(loginName, oldPassword, newPassword ) {
        var logger = serviceLogger.logMethodCall(arguments, eLogLevel.finer);

        _inProgress = true;
        _loginName = loginName;
        _oldPassword = oldPassword;
        _newPassword = newPassword;
        if (loginSrv.getState()==eLoginState.loggedIn) {
            loginSrv.logout(eLogoutReason.changingPassword);
        } else {
            loginSrv.loginToUser(_loginName, _oldPassword);
        }

        logger.logMethodCompleted(arguments, getMembers(), eLogLevel.finer);
    }

    

    function init() {
        $rootScope.$on("loginSrv:loggedIn", onLoggedIn);
        $rootScope.$on("loginSrv:loggedOut", onLoggedOut);
        $rootScope.$on("loginSrv:loginFailed", onLoginFailed);
        $rootScope.$on("loginSrv:connectionFailed", onConnectionFailed);
        $rootScope.$on("infoSrv:ChangeUserPasswordResponse", onChangeUserPasswordResponse);
    }

    init();

    this._getMembers = getMembers;
    this._clean = clean;
    this._finalizeChangingPassword = finalizeChangingPassword;
    this._setError = setError;
    this._onLoginFailed = onLoginFailed;
    this._onLoggedOut = onLoggedOut;
    this._onLoggedIn = onLoggedIn;
    this._onConnectionFailed = onConnectionFailed;
    this._onChangeUserPasswordResponse = onChangeUserPasswordResponse;
    this._init = init;

    this.changePassword = changePassword;
}

var servicesModule = angular.module('aeonixApp.services');
servicesModule.service('changePasswordSrv', ['$rootScope', '$timeout', 'deviceSrv', 'connectionSrv', 'connectionAddressFinderSrv', 'infoSrv', 'storageSrv', 'loginSrv','userSrv', ChangePasswordSrv]);