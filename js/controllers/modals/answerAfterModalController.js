/**
 * Created by MLClient on 06/10/2015.
 */
var controllersModule = angular.module('aeonixApp.controllers');

controllersModule.controller('answerAfterModalController', ['$scope', '$modalInstance', 'utilsSrv', 'primaryCall', 'deviceSrv', 'callsSrv',
    function ($scope, $modalInstance, utilsSrv, primaryCall, deviceSrv, callsSrv) {
        $scope.displayName = primaryCall.contact.getName();
        $scope.closeModal = function (toDo) {
            $modalInstance.close(toDo);
        };
        $scope.cancel = function () {
            $modalInstance.dismiss('cancel');
        };
    }]);