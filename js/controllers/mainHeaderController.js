

var controllersModule = angular.module('aeonixApp.controllers');

function MainHeaderController($scope, $state, $rootScope, callsSrv, userSrv, deviceSrv, phoneSrv, alertSrv, chatSrv, callLogSrv, contactSrv, voiceMailSrv, loginSrv, storageSrv) {

    var controllerLogger = logSrv.getLogger("mainHeaderController");

    try {

        var releaseQueue = [];



        function onStateChanged(newState) {
            $scope.isSettingsActive = newState=='home.settings'
            $scope.isDialPadActive = newState=='home.dialPad';
            $scope.isContactsActive = (newState=='home.favorites'|| newState=='home.callLog'|| newState=='home.groups');
            $scope.isChatListActive = newState=='home.chatList'
            $scope.showHeader = newState != "home.chat";
            $scope.showTabs = (newState != "home.chat" && newState!="home.changePassword");
            $scope.showCallQueueLink = (newState != "home.queue" && newState!="home.calls" && $scope.callQueue.length>0)
            || (newState=="home.calls" && $scope.callQueue.length>1);
        }

        function onLoggedOut(event, reason) {
            if (reason == eLogoutReason.userLoggedOut) {
                $state.go('login');
            }
        }

        $scope.setUserPresence = function(presence) {
            userSrv.setExplicitPresenceInfo(presence);
        };

        $scope.showMenu = function($mdMenu, $event) {
            $mdMenu.open($event);
        };

        $scope.showSettings = function() {
            $state.go("home.settings");
        };

        $scope.showAbout = function() {
            $state.go("home.about");
        };

        $scope.logout = function() {
            $rootScope.$broadcast("spinner:update", true);

            var rememberedLogin =  storageSrv.get("##atouch", "login", "rememberedLogin");
            if (rememberedLogin) {
                rememberedLogin.password = null;
                storageSrv.addOrUpdate("##atouch", "login", "rememberedLogin", rememberedLogin);
            }

            loginSrv.logout(eLogoutReason.userLoggedOut);
        };

        $scope.about = function() {

        };

        $scope.changePassword = function() {
            $state.go("home.changePassword");
        };


        $scope.callVoiceMail = function() {
            var voiceMailContact = voiceMailSrv.getUserVoiceMailContact();
            if (voiceMailContact) {
                callsSrv.makeCallToContact(voiceMailContact);
            }else{
                alertSrv.setAlert("Error", "NoVoiceMailConfiguredClient");
            }
        };

        $scope.showCallQueue = function() {
          var stateToGo = callsSrv.getCalls().length==1 ? "home.calls" : "home.queue"
          $state.go(stateToGo);
        };

        releaseQueue.push($rootScope.$on('$stateChangeStart',function(event, toState, toParams, fromState, fromParams) {
            onStateChanged(toState.name);
        }));


       $scope.$on("$destroy", function () {
            for (var i = 0; i < releaseQueue.length; i++) {
                releaseQueue[i]();
            }
        });

        function init(state) {
            $scope.presenceList = [ePresence.available, ePresence.meeting, ePresence.dnd];
            $scope.user = userSrv.getUserData();
            controllerLogger.logCollapsed("user",$scope.user,eLogLevel.fine);
            $scope.callQueue = callsSrv.getCalls();
            $scope.missedCallsCounter = callLogSrv.getMissedCallsCounter();
            $scope.unseenMessagesCounter = chatSrv.getUnseenMessagesCounter();
            $scope.newVoiceMailCounter = voiceMailSrv.getNewVoiceMailCounter();

            $scope.$on("loginSrv:loggedOut", onLoggedOut);

            onStateChanged($state.current.name);
        };

        init();

    }catch(err) {
        controllerLogger.error(err);
    }
}

controllersModule.controller('mainHeaderController', ['$scope', '$state', '$rootScope', 'callsSrv',  'userSrv', 'deviceSrv','phoneSrv','alertSrv','chatSrv', 'callLogSrv','contactSrv','voiceMailSrv','loginSrv','storageSrv', MainHeaderController]);