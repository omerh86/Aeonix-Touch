function PhoneContactsLink() {}

PhoneContactsLink.prototype.goBack = function($state) {
    $state.go('home.contacts');
}

function ContactsController($rootScope, $scope, contactSrv, callLogSrv, backNavigationSrv) {


    function search() {

    }

    function loadMoreSearchItems() {

    }

    function loadMoreContacts() {
        var nextContacts = contactSrv.getPhoneContacts("", $scope.contactList.length, 20);
        arrayUtils.appendArray($scope.contactList, nextContacts);
    }


    function onStateChangeStart(event, toState, toParams, fromState, fromParams, options) {
        if (!backNavigationSrv.isGoingBack()) {
            backNavigationSrv.addToBackStack(new PhoneContactsLink());
        }
    }

    function onDestroy() {
        angularUtils.unregisterController('contactsController');
    }

    function init() {
        angularUtils.registerController('contactsController', this);

        $scope.search = search;
        $scope.loadMoreSearchItems = loadMoreSearchItems;

        $scope.$on('$stateChangeStart',onStateChangeStart);
        $scope.$on("$destroy", onDestroy);

        $scope.searchInput = "";
        $scope.contactList = contactSrv.getPhoneContacts("", 0, 20);
        $scope.missedCallsCounter = callLogSrv.getMissedCallsCounter();
        $scope.searchResult = [];

        $rootScope.showBack(false);
    };



    init();
}

var controllersModule = angular.module('aeonixApp.controllers');
controllersModule.controller('contactsController',['$rootScope', '$scope', 'contactSrv','callLogSrv', 'backNavigationSrv', ContactsController]);