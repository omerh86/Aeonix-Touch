
var controllersModule = angular.module('aeonixApp.controllers');

function CallLogLink() {}

CallLogLink.prototype.goBack = function($state) {
    $state.go('home.callLog');
}


function CallLogController($rootScope, $scope, $interval, $modal, callLogSrv, searchSrv, backNavigationSrv, contactSrv) {

    var modalInstance = null;
    var searchInstance = null;
    var refreshPresenceInterval;

    function missedCallsShown() {
        return $scope.currentTab =='missedCalls';
    }

    function init() {

        angularUtils.registerController('callLogController', this);

        refreshPresenceInterval = $interval(refreshPresence, 5000, 0, false);

        $scope.allCalls = [];
        $scope.missedCalls = [];
        $scope.currentTab='allCalls';

        $scope.callLog = callLogSrv.getLog(missedCallsShown());
        callLogSrv.loadCallLog(missedCallsShown());

        $scope.searchInput = "";
        searchInstance = searchSrv.createSearchInstance("recent");
        $scope.searchResult = searchInstance.searchResult;

        $scope.missedCallsCounter = callLogSrv.getMissedCallsCounter();

        $rootScope.showBack(false);

        refreshPresence();

    };


    function refreshPresence() {
       var contacts = new ContactList();
       for (var i=0;i<$scope.callLog.length;i++) {
           contacts.add($scope.callLog[i].user);
       }
       contactSrv.refreshPresence(contacts.toArray());
    }



    $scope.deleteRecent = function (callLogRecord, event, index) {
        event.stopPropagation();
        modalInstance = $modal.open({
            templateUrl: 'deleteRecentModal.html',
            controller: 'deleteRecentModalController',
            size: "sm",
            backdropClass: "static",
            windowClass: "delete-recent",
            resolve: {
                callLogRecord: function () {
                    return callLogRecord;
                }
            }
        });

        modalInstance.result.then(function (isDelete) {
            if (isDelete) {
                callLogSrv.removeRecord(index, missedCallsShown());
                delete $scope['showRecentTable_'+contactsLists.recent.current][callLogRecord.callLogID];
            }
            modalInstance = null;
        }, function () {
            console.log('Modal dismissed at: ' + new Date());
            modalInstance = null;
        });
    };


    $scope.onCallLogClicked = function () {
        callLogSrv.dismissMissedCalls();
    };

    $scope.showMissedCalls = function () {
        callLogSrv.dismissMissedCalls();
        $scope.currentTab='missedCalls';
        callLogSrv.loadCallLog(missedCallsShown());
        $scope.callLog = callLogSrv.getLog(missedCallsShown());
    };

    $scope.showAllCalls = function () {
        $scope.currentTab='allCalls';
        callLogSrv.loadCallLog(missedCallsShown());
        $scope.callLog = callLogSrv.getLog(missedCallsShown());
    };

    $scope.search = function () {
        if ($scope.searchInput.length > 1) {
            searchSrv.search("recent",$scope.searchInput, false);
        } else {
            searchSrv.clearSearch("recent");
        }
    };

    $scope.loadMoreSearchItems = function () {
        searchSrv.loadMoreSearchResults("recent");
    };


    $scope.loadMoreRecentItems = function () {
        callLogSrv.loadMoreLogRecords(missedCallsShown());
    };


    $scope.$on('$stateChangeStart', function onStateChangeStart(event, toState, toParams, fromState, fromParams, options) {
        if (!backNavigationSrv.isGoingBack()) {
            backNavigationSrv.addToBackStack(new CallLogLink());
        }
    })

    $scope.$on("$destroy", function () {

        searchSrv.clearSearch("recent");

        $interval.cancel(refreshPresenceInterval);

        angularUtils.unregisterController('callLogController');
    });


    $scope.toggleFolding = function (event, callLogRecordId) {
        event.stopPropagation();
        $scope[$scope.currentTab][callLogRecordId] = !$scope[$scope.currentTab][callLogRecordId];
    };

    init();
}

controllersModule.controller('callLogController',['$rootScope', '$scope', '$interval', '$modal', 'callLogSrv', 'searchSrv', 'backNavigationSrv','contactSrv', CallLogController]);