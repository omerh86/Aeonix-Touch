function LoginDetailsController($rootScope, $scope, $state,  $stateParams, loginSrv, userSrv, alertSrv) {

    var controllerLogger = logSrv.getLogger("loginDetailsController");

    var oldPassword;
    var loginName;

    function onNext() {
        var logger = controllerLogger.logMethodCall(arguments, eLogLevel.finer);

        $scope.error.message = '';
        if ($scope.newPasswordObj.newPassword.length > 0) {
            if ($scope.newPasswordObj.newPassword == $scope.newPasswordObj.repeatPassword) {
                $rootScope.$broadcast("spinner:update", true);
                userSrv.changeUserPassword(oldPassword, $scope.newPasswordObj.newPassword);
            } else {
                $scope.error.message = $scope.getFilter()('i18n')('messages.PasswordsDoesntMatch');
            }
        } else {
            $scope.error.message = $scope.getFilter()('i18n')('messages.PasswordsCannotBeEmpty');
        }
    }


    function onLoggedOut(event, reason) {
        var logger = controllerLogger.logMethodCall(arguments, eLogLevel.finer);

        if (reason == eLogoutReason.switchingToEndpointLogin) {
            loginSrv.loginWithEP(loginName);
        } else if (reason == eLogoutReason.connectionError) {
            $rootScope.$broadcast("spinner:update", false);
            alertSrv.setAlert('messages.Error', 'messages.connectionFailed', "connection-failed", 0);
            $state.go('login');
        }
    }

    function onLoggedIn(event, loggedInWithEndpoint, loginSrv) {
        var logger = controllerLogger.logMethodCall(arguments,eLogLevel.finer);
        if (loggedInWithEndpoint) {
            $state.go("home.favorites");
            $rootScope.$broadcast("spinner:update", false);
        }
    }

    function onLoginFailed(event, error, loginSrv) {
        $rootScope.$broadcast("spinner:update", false);
        alertSrv.setAlert('messages.Error', 'messages.connectionFailed', "connection-failed", 0);
        $state.go('login');
    }

    function onConnectionFailed(event, error, loginSrv) {
        loginSrv.logout(eLogoutReason.connectionError);
    }

    function onChangeUserPasswordResponse(event, data) {
        if (data.errCode == -1) {
            $rootScope.$broadcast("spinner:update", false);
            $scope.passwordFailures = data.checkResult.failures;
        } else {
            userSrv.saveUserDataModifications();
        }
    }

    function onSetRsUserResponse() {
        loginSrv.logout(eLogoutReason.switchingToEndpointLogin);
    }

    function init() {
        loginName = loginSrv.getLoginName();
        oldPassword = $stateParams.password;
        $scope.user = userSrv.getUserData();
        $scope.newPasswordObj = {
            newPassword: "",
            repeatPassword: ""
        };
        $scope.passwordFailures = [];
        $scope.next = onNext;
        $scope.error = {
            message: ''
        };

        $scope.$on("infoSrv:ChangeUserPasswordResponse", onChangeUserPasswordResponse)
        $scope.$on("infoSrv:SetRsUserResponse", onSetRsUserResponse);
        $scope.$on("loginSrv:connectionFailed", onConnectionFailed);
        $scope.$on("loginSrv:loggedIn", onLoggedIn);
        $scope.$on("loginSrv:loggedOut", onLoggedOut);
        $scope.$on("loginSrv:loginFailed", onLoginFailed);
    };


    init();

    this.onNext = onNext;
    this._onLoggedOut = onLoggedOut;
    this._onLoginFailed = onLoginFailed;
    this._onLoggedIn = onLoggedIn
    this._onConnectionFailed = onConnectionFailed;
    this._onChangeUserPasswordResponse = onChangeUserPasswordResponse;
    this._onSetRsUserResponse = onSetRsUserResponse;
    this._init = init;
}


var controllersModule = angular.module('aeonixApp.controllers');
controllersModule.controller('LoginDetailsController', ['$rootScope', '$scope', '$state', '$stateParams', 'loginSrv', 'userSrv', 'alertSrv', LoginDetailsController]);