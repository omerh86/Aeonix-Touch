

var controllersModule = angular.module('aeonixApp.controllers');

controllersModule.controller('tabsController', ['$scope', '$rootScope', 'tabsSrv',
    function ($scope, $rootScope, tabsSrv) {

        var releaseQueue = [];
        $scope.tabs = tabsSrv.getTabs();
        $scope.isShowTabs = tabsSrv.isShowTabs;

        releaseQueue.push($rootScope.$on("tabs:update", function (event) {
                $scope.tabs = tabsSrv.getTabs();
            })
        );

        //visible tab was clicked
        $scope.tabClicked = function (tabType) {
            tabsSrv.tabClicked(tabType);
            $scope.tabs = tabsSrv.getTabs();
        };

        $scope.$on("$destroy", function () {
            for (var i = 0; i < releaseQueue.length; i++) {
                releaseQueue[i]();
            }
        });

    }]);