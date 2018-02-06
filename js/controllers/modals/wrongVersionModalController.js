
var controllersModule = angular.module('aeonixApp.controllers');

controllersModule.controller('wrongVersionModalController', ['$scope', '$modalInstance',
    function ($scope, $modalInstance) {        
        $scope.closeModal = function () {
            $modalInstance.close();
        };
    }]);