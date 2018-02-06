function DialPadLink() {}

DialPadLink.prototype.goBack = function($state) {
    var params = {};
    params.contactId = null;
    $state.go('home.dialPad', params);
}


function DialPadController($rootScope, $scope, $timeout, $state,  $stateParams, callsSrv, searchSrv, backNavigationSrv, contactSrv) {

    var canvasInput;
    var searchTimeout;

    function getScope() {
        return scope;
    }

    function initDialPadKeys() {
        $scope.dialPadKeys = [
            {
                digit : "1",
                letters: ""
            },
            {
                digit : "2",
                letters: "ABC"
            },
            {
                digit : "3",
                letters: "DEF"
            },
            {
                digit : "4",
                letters: "GHI"
            },
            {
                digit : "5",
                letters: "JKL"
            },
            {
                digit : "6",
                letters: "MNO"
            },
            {
                digit : "7",
                letters: "PQRS"
            },
            {
                digit : "8",
                letters: "TUV"
            },
            {
                digit : "9",
                letters: "WXYZ"
            },
            {
                digit : "*",
                letters: ""
            },
            {
                digit : "0",
                letters: "+"
            },
            {
                digit : "#",
                letters: ""
            }
        ];
    }

     //We don't use directive for the canvas for performance reasons (directive is slow on iphone).
    function initCanvasInput() {
        var canvasElement = document.getElementById('canvas');
        canvasInput = new CanvasInput(
            {
                canvas: canvasElement,
                fontSize: 29,
                fontFamily: 'sans-serif',
                fontColor: '#4a4a4a',
                fontWeight: '300',
                width: canvasElement.offsetWidth - 20,
                borderWidth: 0,
                borderRadius: 0,
                boxShadow: 'none',
                readonly:true,
                innerShadow: 'none',
                placeHolder: ''
            }
        );
        canvasInput.value($scope.keys);
    }

    function onStateChangeStart(event, toState, toParams, fromState, fromParams, options) {
        if (!backNavigationSrv.isGoingBack()) {
            backNavigationSrv.addToBackStack(new DialPadLink());
        }
    }

    function onDestroy() {

       if (!$scope.call) {
        if ($state.current.name!='home.dialPadList') {
            searchSrv.clearSearch("dialPad");
        }
        var dialPadData =  {
            keys:$scope.keys
        };
        $rootScope.dialPadData = dialPadData;
       }
       angularUtils.unregisterController('dialPadController', $scope);
    };

    function onDoSearch() {
        searchSrv.search("dialPad", $scope.keys, true);
        searchTimeout = null;
    }

    function onKeysChanged () {
        canvasInput.value($scope.keys);
        if ($scope.call) {
            $scope.call.dtmfSequence=$scope.keys;
        }else {
            if (searchTimeout) {
                $timeout.cancel(searchTimeout);
                searchTimeout = null;
            }
            if ($scope.keys>2) {
                searchTimeout = $timeout(onDoSearch, 500);
            }else {
                searchSrv.clearSearch("dialPad");
            }
        }
    };

    $scope.addLetter = function(letter){
        $scope.keys += letter;
        onKeysChanged();
    };

    $scope.removeLetter = function(){
        if($scope.keys.length > 0){
            $scope.keys = $scope.keys.substr(0, $scope.keys.length - 1);
            onKeysChanged();
        }
    };

    $scope.eraseKeys = function(){
        $scope.keys = '';
        canvasInput.value($scope.keys);
    };

    $scope.makeCall = function () {
        if($scope.keys && $scope.keys.length > 0){
            var uri = $scope.keys;
            $scope.keys = '';
            callsSrv.makeCallToAlias(uri);
        }
    };

    $scope.selectContact = function(contact) {
        $scope.keys = contact.findAlias($scope.keys);
        $scope.searchResult = [contact];
    };

    $scope.onMoreClick = function() {
        if ($scope.searchResult.length>1) {
            $state.go('home.dialPadList');
        }
    };


    function init(){
        angularUtils.registerController('dialPadController', $scope);

        initDialPadKeys();
        if ($rootScope.dialPadData) {
                $scope.keys = $rootScope.dialPadData.keys;
        }else {
                $scope.keys = "";
        }
        if ($stateParams.contactId) {
            var contact = contactSrv.getContactByContactId($stateParams.contactId);
            $scope.selectContact(contact);
        }else {
            searchInstance = searchSrv.createSearchInstance("dialPad");
            $scope.searchResult = searchInstance.searchResult;
            if ($scope.keys.length>2) {
                onDoSearch();
            }
        }

        $timeout(initCanvasInput, 50);

        $scope.$on('$stateChangeStart',onStateChangeStart);
        $scope.$on("$destroy", onDestroy);

        $rootScope.showBack(false);
    };

    this._getScope =  getScope;
    this._initDialPadKeys = initDialPadKeys;
    this._initCanvasInput  = initCanvasInput;
    this._onDestroy = onDestroy;
    this._onDoSearch = onDoSearch;
    this._init =init;
    this._onKeysChanged = onKeysChanged;

    init();

}

var controllersModule = angular.module('aeonixApp.controllers');

controllersModule.controller('dialPadController', ['$rootScope', '$scope', '$timeout', '$state',  '$stateParams', 'callsSrv', 'searchSrv', 'backNavigationSrv','contactSrv', DialPadController]);