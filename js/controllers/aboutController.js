function AboutLink() {}

AboutLink.prototype.goBack = function($state) {
    $state.go('home.about');
}


function AboutController($rootScope, $scope, $state, backNavigationSrv) {

    var controllerLogger = logSrv.getLogger("aboutController");


    function onStateChangeStart(event, toState, toParams, fromState, fromParams, options) {
        if (!backNavigationSrv.isGoingBack()) {
            backNavigationSrv.addToBackStack(new AboutLink());
        }
    }

    function onDestroy() {

    }

    function init() {

        $scope.version = JSBridge.getAppVersion();

        $scope.$on('$stateChangeStart',onStateChangeStart);
        $scope.$on("$destroy", onDestroy);

        $rootScope.showBack(true);
    }

    init();

}


var controllersModule = angular.module('aeonixApp.controllers');
controllersModule.controller('aboutController', ['$rootScope', '$scope', '$state', 'backNavigationSrv' ,AboutController]);