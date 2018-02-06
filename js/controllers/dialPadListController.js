

function DialPadListController($scope, $state, searchSrv) {

    function onDestroy() {
        angularUtils.unregisterController('dialPadListController', this);
    };


    $scope.onContactSelected = function(contact) {
        var params = {
            "contactId": contact.getContactId()
        };
        searchSrv.clearSearch("dialPad");
        $state.go('home.dialPad', params);
    };

    function init() {
        angularUtils.registerController('dialPadListController', this);
        searchInstance = searchSrv.createSearchInstance("dialPad");
        $scope.dialPadList = searchInstance.searchResult;
        $scope.$on("$destroy", onDestroy);
    }

    init();

}

var controllersModule = angular.module('aeonixApp.controllers');
controllersModule.controller('dialPadListController', ['$scope', '$state','searchSrv',DialPadListController]);