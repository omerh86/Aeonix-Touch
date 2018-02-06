function ChatLink(chatSrv, contact) {
    this.chatSrv = chatSrv;
    this.contact = contact;
}


ChatLink.prototype.isRelevant = function() {
    var chat = this.chatSrv.findChatByContact(this.contact);
    return chat;
}

ChatLink.prototype.goBack = function($state) {
    var chat = this.chatSrv.findChatByContact(this.contact);
    var params = {contact: this.contact};
    $state.go('home.chat', params);
}

function ChatController($scope, $state, $stateParams, $rootScope, utilsSrv, chatSrv, cstaMonitoringSrv, backNavigationSrv) {

    var controllerLogger = logSrv.getLogger("chatController");

    var contact;
    var chat;
    var messageList;
    var releaseQueue;


    function init() {

        contact = $stateParams.contact;
        chat = chatSrv.getOrAddChat(contact);
        messageList = chat.messageList;
        releaseQueue = [];

        rootScopeGoBack = $rootScope.goBack;

        $scope.chat = chat;
        $scope.messageList = messageList;
        $rootScope.showBack(true);

        $scope.$on('$stateChangeStart',onStateChangeStart);
        $scope.$on("$destroy", onDestroy);

        $scope.sendMessage = sendMessage;
        $scope.goBack = goBack;
        $scope.selectAll = selectAll;
        $scope.deleteMessages = deleteMessages;
        $scope.selectMessage = selectMessage;
        $scope.editMode = editMode;
        $scope.searchMode = searchMode;
        $scope.isChrome = isChrome;
        $scope.isAnotherDay = isAnotherDay;

        angularUtils.registerController("chatController", this);

        cstaMonitoringSrv.startPresenceMonitoring([contact]);
        chatSrv.onChatShown(chat);
    }

    function sendMessage() {
        var messageContent = chat.textTyped;
        //to do michael
        messageContent = messageContent.split('\n').join("<br>");
        chatSrv.sendMessage(chat, messageContent);
        chat.textTyped = "";
        angular.element(document.getElementById("chat-textarea")).focus();
    };

    function goBack(){
        if(!chat.isSearchMode && !chat.isEditMode){
            backNavigationSrv.goBack();
        }else{
            chat.isEditMode = false;
            chat.isSearchMode = false;
            chat.searchTerm = '';
        }
    };

    function selectAll () {
        chat.selectAll();
    };

    function deleteMessages () {
        var messages = [];
        for (var i=0;i<messageList.length;i++) {
            var m = messageList[i];
            if (m.selected) {
                messages.push(m);
            }
        }
        if (messages.length>0) {
            chatSrv.removeMessages(chat, messages);
            $scope.allSelected = false;
            if (messageList.length==0) {
                goBack();
            }
        }
    };

    function selectMessage ($event, message) {
        event.stopPropagation();
        chat.selectMessage(message);
    };

    function editMode(){
        chat.isEditMode = true;
    };

    function searchMode(){
        chat.isSearchMode = true;
    };


    function isChrome() {
        return utilsSrv.isChrome();
    };


    //used for grouping the messages in in days.
    function isAnotherDay(index) {
        var result = false;
        if (index > 0) {
            var previousTime = messageList[index - 1].time;
            //todo michael
            var previousTime = moment(parseInt(previousTime)).format('MM/DD/YYYY');
            var time = messageList[index].time;
            var time = moment(parseInt(time)).format('MM/DD/YYYY');
            return time != previousTime;
        }
        else {
            result = true;
        }
        return result;
    };

    function onStateChangeStart(event, toState, toParams, fromState, fromParams, options) {
        if (!backNavigationSrv.isGoingBack()) {
            backNavigationSrv.addToBackStack(new ChatLink(chatSrv, contact));
        }
    }

    function onDestroy () {

        chatSrv.onChatHidden(chat);

        if (chat.messageList.length==0 && chat.textTyped=="") {
            chatSrv.removeChat(chat);
        }

        angularUtils.unregisterController("chatController");
        cstaMonitoringSrv.stopPresenceMonitors([chat.contact]);

        for (var i = 0; i < releaseQueue.length; i++) {
            releaseQueue[i]();
        }

    }


    init();

    
}

var controllersModule = angular.module('aeonixApp.controllers');
controllersModule.controller('chatController', ['$scope', '$state', '$stateParams', '$rootScope','utilsSrv','chatSrv','cstaMonitoringSrv','backNavigationSrv',ChatController]);