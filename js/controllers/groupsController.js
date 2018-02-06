

var controllersModule = angular.module('aeonixApp.controllers');

function GroupsLink() {}

GroupsLink.prototype.goBack = function($state) {
    $state.go('home.groups');
}


function GroupsController($rootScope, $scope, searchSrv, callLogSrv, backNavigationSrv, groupSrv) {

    var searchInstance = null;


    function init() {

        angularUtils.registerController('groupsController', this);

        $scope.searchInput = "";
//        $scope.groupList = groupSrv.getGroupList();
        $scope.groupList = JSBridge.getPhoneContacts(0,100);
        $scope.missedCallsCounter = callLogSrv.getMissedCallsCounter();

        searchInstance = searchSrv.createSearchInstance("groups");
        $scope.searchResult = searchInstance.searchResult;

        $rootScope.showBack(false);
    };

    $scope.search = function () {
        if ($scope.searchInput.length > 1) {
            searchSrv.search("groups",$scope.searchInput, false);
        } else {
            searchSrv.clearSearch("groups");
        }
    };

    $scope.loadMoreSearchItems = function () {
        searchSrv.loadMoreSearchResults("groups");
    };

    $scope.$on('$stateChangeStart', function onStateChangeStart(event, toState, toParams, fromState, fromParams, options) {
        if (!backNavigationSrv.isGoingBack()) {
            backNavigationSrv.addToBackStack(new GroupsLink());
        }
    })

    $scope.$on("$destroy", function () {

        searchSrv.clearSearch("groups");

        angularUtils.unregisterController('groupsController');
    });

    init();
}

controllersModule.controller('groupsController',['$rootScope', '$scope', 'searchSrv','callLogSrv', 'backNavigationSrv','groupSrv', GroupsController]);