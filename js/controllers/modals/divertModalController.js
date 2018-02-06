/**
 * Created by MLClient on 06/10/2015.
 */
var controllersModule = angular.module('aeonixApp.controllers');

controllersModule.controller('divertModalController', ['$scope', '$modalInstance','settingsSrv','$rootScope',
    function ($scope, $modalInstance, settingsSrv, $rootScope) {
        var init = function(){
            $scope.settings = settingsSrv.getSettings();
            $scope.deviceID = $rootScope.rootLogin.deviceID;
        };

        $scope.closeModal = function (toDo) {
            $modalInstance.close(toDo);
        };

        $scope.cancel = function () {
            $modalInstance.dismiss('cancel');
        };

        init();
    }]);