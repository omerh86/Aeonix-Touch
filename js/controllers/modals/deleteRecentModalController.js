var controllersModule = angular.module('aeonixApp.controllers');

controllersModule.controller('deleteRecentModalController', ['$scope', '$modalInstance', 'callLogRecord',
    function ($scope, $modalInstance, callLogRecord) {
        var user = callLogRecord.user;
        //todo michael: extract building user's display name to a single function
        $scope.displayName = user.contact.description ?
            user.contact.description :
            user.contact.firstName && user.contact.lastName && user.contact.firstName.length && user.contact.lastName.length ?
            user.contact.firstName + ' ' + user.contact.lastName :
                user.contact.displayName;

        $scope.closeModal = function (isDelete) {
            $modalInstance.close(isDelete);
        };
    }]);
