function LoginController($rootScope, $scope, $state, $stateParams, locale, loginSrv, settingsSrv, userSrv, storageSrv) {

    var controllerLogger = logSrv.getLogger("loginController");

    function onLoginFailed(event, error,  loginSrv) {
        var logger = controllerLogger.logMethodCall(arguments,eLogLevel.finer);

        if (error== eError.AuthorizationError) {
            $rootScope.$broadcast("spinner:update", false);
            $scope.error = $scope.getFilter()('i18n')('messages.YourNamePasswordWereIncorrect');
        } else if (error) {
            $rootScope.$broadcast("spinner:update", false);
            $scope.error = $scope.getFilter()('i18n')('messages.ServerCouldNotBeAccessed');
        }
    }

    function onLoggedIn(event, loggedInWithEndpoint, loginSrv) {
        var logger = controllerLogger.logMethodCall(arguments,eLogLevel.finer);
        var settings = settingsSrv.getSettings();
        settings.locale = $scope.locale.localeName;
        settingsSrv.saveModifications();
        if (loggedInWithEndpoint) {
            $state.go("home.favorites");
            $rootScope.$broadcast("spinner:update", false);
        }
    }

    function onLoggedOut(event, reason) {
        var logger = controllerLogger.logMethodCall(arguments,eLogLevel.finer);
        if (reason==eLogoutReason.switchingToEndpointLogin) {
            loginSrv.loginWithEP($scope.loginName);
        }else if (reason==eLogoutReason.connectionError) {
            $scope.error = $scope.getFilter()('i18n')('messages.ServerCouldNotBeAccessed');
            $rootScope.$broadcast("spinner:update", false);
        }
    }

    function onConnectionFailed(event) {
        var logger = controllerLogger.logMethodCall(arguments,eLogLevel.finer);
        loginSrv.logout(eLogoutReason.connectionFailed);
    }

    function onUserInfoUpdated(event) {
        var logger = controllerLogger.logMethodCall(arguments,eLogLevel.finer);
        if (userSrv.isDefaultPassword() || $rootScope.changePassword) {
            $rootScope.changePassword = false;
            $rootScope.$broadcast("spinner:update", false);
            var params = {password: $scope.password};
            $state.go("loginDetail", params);
        } else {
            loginSrv.logout(eLogoutReason.switchingToEndpointLogin);
        }
    }

    function login() {
        var logger = controllerLogger.logMethodCall(arguments,eLogLevel.finer);
        $scope.error = '';


        if (stringUtils.isEmpty($scope.loginName) || stringUtils.isEmpty($scope.password) || $scope.loginName.indexOf(' ') != -1) {
            $scope.error = $scope.getFilter()('i18n')('messages.YourNamePasswordWereIncorrect');
        } else {
            $rootScope.$broadcast("spinner:update", true);
            var serverAddresses = $scope.server.split(",");
            var proxyAddresses = $scope.proxy.split(",");

            if ($scope.rememberMe) {
                var rememberedLogin = {
                    loginName: $scope.loginName,
                    password: null,
                    server: $scope.server,
                    proxy: $scope.proxy,
                    localeName: $scope.locale.localeName
                };
                storageSrv.addOrUpdate("##atouch", "login", "rememberedLogin", rememberedLogin);
            }else {
                storageSrv.remove("##atouch", "login", "rememberedLogin");
            }

            loginSrv.loginToUser($scope.loginName, $scope.password, serverAddresses, proxyAddresses, $scope.rememberMe);

        }
    }

    function onLanguageChanged() {
        locale.setLocale($scope.locale.localeName);
    }


    function initScope() {

        $scope.loginName = "";
        $scope.server = "";
        $scope.proxy = "";
        $scope.password = "";
        $scope.aeonixAccount = true;

        var l = localizationUtils.getLocaleByName(locale.getLocale());
        if (!l) {
            l = localizationUtils.en_US;
        }
        $scope.locale = l;
        $scope.rememberMe = false;


        $scope.$on("loginSrv:loggedIn", onLoggedIn);
        $scope.$on("loginSrv:loggedOut", onLoggedOut);
        $scope.$on("loginSrv:loginFailed", onLoginFailed);
        $scope.$on("loginSrv:connectionFailed", onConnectionFailed);
        $scope.$on("userSrv:userInfoUpdated", onUserInfoUpdated);

        $scope.nextDetail = login;
        $scope.onLanguageChanged = onLanguageChanged;

        $scope.error = '';
        $scope.locales = localizationUtils.getLocales();
    }

    function allRequiredFieldsFilledOut() {
        if (stringUtils.isEmpty($scope.loginName)) return false;
        if (stringUtils.isEmpty($scope.password)) return false;
        if (stringUtils.isEmpty($scope.server)) return false;
        return true;
    }

    function init () {
        var logger = controllerLogger.logMethodCall(arguments,eLogLevel.finer);

        $rootScope.$broadcast("spinner:update", false);

        initScope();

        var rememberedLogin =  storageSrv.get("##atouch", "login", "rememberedLogin");
        $scope.rememberMe = rememberedLogin!=undefined && rememberedLogin!=null;
        if ($stateParams.loginName) {
            $scope.loginName = $stateParams.loginName;
            $scope.password = $stateParams.password;                                    
        } else if (rememberedLogin){
            $scope.loginName = rememberedLogin.loginName;
            $scope.password = rememberedLogin.password;
            $scope.server = rememberedLogin.server;
            $scope.proxy = rememberedLogin.proxy;
            $scope.rememberMe = true;
            $scope.locale = localizationUtils.getLocaleByName(rememberedLogin.localeName);
        }
        
        
        
        if (!stringUtils.isEmpty($scope.loginName)) {
            var connectionSetting = loginSrv.getUserConnectionSettings($scope.loginName);
            if (connectionSetting) {
                $scope.server = arrayUtils.join(connectionSetting.serverAddresses,",");
                $scope.proxy = arrayUtils.join(connectionSetting.proxyAddresses,",");
            }
            var settings = settingsSrv.getUserSettings($scope.loginName);
            if (settings && settings.locale) {
                $scope.locale = localizationUtils.getLocaleByName(settings.locale);
                locale.setLocale($scope.locale.localeName);
            }
            if (allRequiredFieldsFilledOut()) {
                login();
            }
        }
       
    };
    


    init();
}

var controllersModule = angular.module('aeonixApp.controllers');
controllersModule.controller('LoginController', ['$rootScope', '$scope', '$state', '$stateParams',  'locale', 'loginSrv', 'settingsSrv', 'userSrv', 'storageSrv', LoginController]);