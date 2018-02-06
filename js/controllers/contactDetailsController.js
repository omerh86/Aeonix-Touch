
function ContactDetailsLink(contact) {
    this.contactId = contact.getContactId();
}

ContactDetailsLink.prototype.goBack = function($state) {
    var params = {contactId: this.contactId};
    $state.go('home.contactDetails', params);
}



function ContactDetailsController($rootScope, $scope, $state, $stateParams, favoritesSrv,   backNavigationSrv, cstaMonitoringSrv, contactSrv, callsSrv) {

    var releaseQueue = [];
    var contactId = $stateParams.contactId;
    var contact = contactSrv.getContactByContactId(contactId);

    $scope.toggleFavorite = function ($event, contact) {
        $event.stopPropagation();
        if (contact.internal.isFav) {
            favoritesSrv.removeContactFromFavorites(contact);
        }else {
            favoritesSrv.addContactToFavorites(contact);
        }
    };


    $scope.makeCallToAlias = function (alias, isVideo) {
        callsSrv.makeCallToAlias(alias);
    };

    $scope.$on('$stateChangeStart', function onStateChangeStart(event, toState, toParams, fromState, fromParams, options) {
        if (!backNavigationSrv.isGoingBack()) {
            backNavigationSrv.addToBackStack(new ContactDetailsLink(contact));
        }
    })

    function onDestroy () {
        angularUtils.unregisterController("chatController");
        cstaMonitoringSrv.stopPresenceMonitors([contact]);

        for (var i = 0; i < releaseQueue.length; i++) {
            releaseQueue[i]();
        }
    }

    $scope.$on("$destroy", onDestroy);
    $scope.contact= contact;
    cstaMonitoringSrv.startPresenceMonitoring([contact]);
    $rootScope.showBack(true);

}


var controllersModule = angular.module('aeonixApp.controllers');
controllersModule.controller('contactDetailsController', ['$rootScope', '$scope', '$state', '$stateParams', 'favoritesSrv',   'backNavigationSrv','cstaMonitoringSrv','contactSrv','callsSrv',ContactDetailsController]);