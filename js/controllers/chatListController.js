function ChatListLink() {}

ChatListLink.prototype.goBack = function($state) {
    $state.go('home.chatList');
}



function ChatListController($state, $scope, $rootScope, $modal, $interval, utilsSrv, chatSrv, backNavigationSrv, contactSrv,searchSrv) {

   var controllerLogger = logSrv.getLogger("chatListController");
     
   var releaseQueue;
   var chatList
   var refreshPresenceInterval;
   var modalInstance;
   var searchInstance;

   function init() {
        releaseQueue = [];
        chatList = chatSrv.getChatList();
        refreshPresenceInterval = $interval(refreshPresence, 5000, 0, false);
        searchInstance = searchSrv.createSearchInstance("chatList");


        $scope.notificationsObj = {counter:0};
        $scope.chatList = chatList;
        $scope.getContacts = getContacts;
        $scope.loadMoreSearchResults = loadMoreSearchResults;
        $scope.startNewChat = startNewChat;
        $scope.deleteChat = deleteChat;

        $scope.$on('$stateChangeStart',onStateChangeStart);
        $scope.$on("$destroy", onDestroy);

        $scope.searchFilter = '';
        $scope.searchResult = searchInstance.searchResult;
        $rootScope.showBack(false);
        refreshPresence();
   }


   function refreshPresence() {
       var contacts = [];     
       for (var i=0;i<chatList.length;i++) {
           var chat = chatList[i];
           contacts.push(chat.contact);           
       }       
       contactSrv.refreshPresence(contacts);
   }



   function deleteChat(chat, event) {
       var that = this;
       event.stopPropagation();
       modalInstance = this.$modal.open({
           templateUrl: 'deleteChatModal.html',
           controller: 'deleteRecentModalController',
           size: "sm",
           backdropClass: "static",
           windowClass: "delete-recent",
           resolve: {
               contact: function () {
                   return chat.contact;
               }
           }
       });

       modalInstance.result.then(function () {
           that.chatSrv.removeChat(chat);
           that.modalInstance = null;
        },function () {
           that.modalInstance = null;
       });
   };

   function startNewChat(contact) {
        $scope.searchFilter = '';
        searchSrv.clearSearch("chatList");
        var params = {contact: contact};
        $state.go('home.chat', params);
   }

   function getContacts() {
        if ($scope.searchFilter.length > 1) {
            searchSrv.search("chatList",$scope.searchFilter, false);
        } else {
            searchSrv.clearSearch("chatList");
        }
   }

   function loadMoreSearchResults() {
        searchSrv.loadMoreSearchResults("chatList");
   };

    function onStateChangeStart(event, toState, toParams, fromState, fromParams, options) {
        if (!backNavigationSrv.isGoingBack()) {
            backNavigationSrv.addToBackStack(new ChatListLink());
        }
    }

   function onDestroy() {
       $interval.cancel(refreshPresenceInterval);
       for (var i = 0; i < releaseQueue.length; i++) {
           releaseQueue[i]();
       }
   }

    init();


}

var controllersModule = angular.module('aeonixApp.controllers');
controllersModule.controller('chatListController', ['$state',  '$scope', '$rootScope', '$modal', '$interval','utilsSrv', 'chatSrv', 'backNavigationSrv','contactSrv','searchSrv', ChatListController]);
