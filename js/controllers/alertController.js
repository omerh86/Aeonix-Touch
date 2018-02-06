

function AlertController ($scope, alertSrv) {

    $scope.alert = alertSrv.getAlert();

    $scope.closeAlert = function() {
        alertSrv.closeAlert();
    }

}

var controllersModule = angular.module('aeonixApp.controllers');
controllersModule.controller('alertController', ['$scope','alertSrv', AlertController]);
