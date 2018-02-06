function ChangePasswordController($rootScope, $scope, $state,  loginSrv, changePasswordSrv, backNavigationSrv) {

    var controllerLogger = logSrv.getLogger("changePasswordController");

    var loginName = null;
    var inProgress = false;

    function validate() {
        if (stringUtils.isEmpty($scope.oldPassword)) {
            $scope.error = $scope.getFilter()('i18n')('messages.PasswordsCannotBeEmpty');
            return false;
        }
        if (stringUtils.isEmpty($scope.newPassword)) {
            $scope.error = $scope.getFilter()('i18n')('messages.PasswordsCannotBeEmpty');
            return false;
        }
        if ($scope.newPassword !== $scope.confirmPassword) {
            $scope.error = $scope.getFilter()('i18n')('messages.PasswordsDoesntMatch');
            return false;
        }

        return true;
    }

    function changePassword() {
        var logger = controllerLogger.logMethodCall(arguments, eLogLevel.finer);
        if (!inProgress) {
            inProgress = true;
            $scope.error = '';
            if (validate()) {
                $rootScope.$broadcast("spinner:update", true);
                changePasswordSrv.changePassword(loginName, $scope.oldPassword, $scope.newPassword);
            }else {
                inProgress = false;
            }
        }
    }


    function onChangePasswordFinished(event, error, passwordFailures) {
        $rootScope.$broadcast("spinner:update", false);
        inProgress = false;
        if (error!==null) {
            if (error===eChangePasswordError.IncorrectOldPassword) {
                $scope.error = $scope.getFilter()('i18n')('messages.TheOldPasswordIsIncorrect');
            }else if (error===eChangePasswordError.WeakPassword) {
                $scope.error = $scope.getFilter()('i18n')('messages.TheNewPasswordIsWeak');
                $scope.passwordFailures = passwordFailures;
            }else if (error===eChangePasswordError.ConnectionError) {
                $scope.error = $scope.getFilter()('i18n')('messages.connectionFailed');
            }
        } else {
            $rootScope.$broadcast("spinner:update", false);
            var params = {
                "loginName": loginName,
                "password": $scope.newPassword,
            };
            $state.go('login', params);
        }
    }



    function goBack() {
        if (!inProgress) {
            if (loginSrv.getState() == eLoginState.loggedIn && loginSrv.isLoggedInWithEndpoint()) {
                backNavigationSrv.goBack();
            }
        }else {
            $state.go('login');
        }
    }


    function init() {
        loginName = loginSrv.getLoginName();

        //todo michael: remove hardcoded values
        $scope.oldPassword = "anx";
        $scope.newPassword = "QAZwsx123!@#";
        $scope.confirmPassword= "QAZwsx123!@#";
        $scope.passwordFailures = [];
        $scope.error = "";

        $scope.$on("changePasswordSrv:finished", onChangePasswordFinished);

        $scope.showBack(true);

        $scope.changePassword = changePassword;
        $scope.goBack = goBack;

    };



    init();

    this._validate = validate;
    this._onChangePasswordFinished = onChangePasswordFinished;
    this._goBack = goBack;
    this._init = init;

    this.changePassword = changePassword;

}


var controllersModule = angular.module('aeonixApp.controllers');
controllersModule.controller('ChangePasswordController', ['$rootScope', '$scope', '$state', 'loginSrv', 'changePasswordSrv', 'backNavigationSrv', ChangePasswordController]);