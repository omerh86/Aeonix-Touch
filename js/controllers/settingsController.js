function SettingsLink() {}

SettingsLink.prototype.goBack = function($state) {
    $state.go('home.settings');
}


function SettingsController($rootScope, $scope, $state, locale, settingsSrv, backNavigationSrv) {

    var controllerLogger = logSrv.getLogger("settingsController");

    var settings = settingsSrv.getSettings();

    function onStateChangeStart(event, toState, toParams, fromState, fromParams, options) {
        if (!backNavigationSrv.isGoingBack()) {
            backNavigationSrv.addToBackStack(new SettingsLink());
        }
    }

    function onDestroy() {
        settingsSrv.saveModifications();
    }

    function onLanguageChanged() {
        locale.setLocale($scope.locale.localeName);
        settings.locale = $scope.locale.localeName;
    }

    function init() {
        $scope.locales = localizationUtils.getLocales();

        $scope.settings = settings;
        $scope.locale = localizationUtils.getLocaleByName(settings.locale);

        $scope.onLanguageChanged = onLanguageChanged;

        $scope.$on('$stateChangeStart',onStateChangeStart);
        $scope.$on("$destroy", onDestroy);

        $rootScope.showBack(true);
    }

    init();

}


var controllersModule = angular.module('aeonixApp.controllers');
controllersModule.controller('settingsController', ['$rootScope', '$scope', '$state', 'locale', 'settingsSrv', 'backNavigationSrv',SettingsController]);