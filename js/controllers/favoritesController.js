
var controllersModule = angular.module('aeonixApp.controllers');


function FavoritesLink() {}

FavoritesLink.prototype.goBack = function($state) {
    $state.go('home.favorites');
}

function FavoritesController($rootScope, $scope, favoritesSrv, searchSrv, callLogSrv, backNavigationSrv) {

    var searchInstance = null;


    function init() {
        angularUtils.registerController('favoritesController', this);

        $scope.searchInput = "";
        $scope.missedCallsCounter = callLogSrv.getMissedCallsCounter();

        searchInstance = searchSrv.createSearchInstance("favorites");

        $scope.searchResult = searchInstance.searchResult;
        $scope.favoriteList = favoritesSrv.getFavoriteList();

        $rootScope.showBack(false);
    };


    $scope.search = function () {
        if ($scope.searchInput.length > 1) {
            searchSrv.search("favorites",$scope.searchInput, false);
        } else {
            searchSrv.clearSearch("favorites");
        }
    };


    $scope.loadMoreSearchItems = function () {
        searchSrv.loadMoreSearchResults("favorites");
    };

    $scope.$on('$stateChangeStart', function onStateChangeStart(event, toState, toParams, fromState, fromParams, options) {
        if (!backNavigationSrv.isGoingBack()) {
            backNavigationSrv.addToBackStack(new FavoritesLink());
        }
    })

    $scope.$on("$destroy", function () {

        searchSrv.clearSearch("favorites");

        angularUtils.unregisterController('favoritesController');
    });

    init();
}


controllersModule.controller('favoritesController', ['$rootScope', '$scope', 'favoritesSrv', 'searchSrv', 'callLogSrv', 'backNavigationSrv', FavoritesController]);