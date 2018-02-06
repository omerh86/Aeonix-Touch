
function MainCtrl($scope,
                  $rootScope,
                  $state,
                  $modal,
                  $timeout,
                  $filter,
                  locale,
                  localeEvents,
                  alertSrv,
                  backNavigationSrv,
                  callLogSrv,
                  callsSrv,
                  chatSrv,
                  connectionSrv,
                  contactSrv,
                  cstaMonitoringSrv,
                  deviceSrv,
                  dialPlanSrv,
                  favoritesSrv,
                  infoSrv,
                  loginSrv,
                  nativeToJsBridgeSrv,
                  pictureSrv,
                  searchSrv,
                  settingsSrv,
                  localPhoneSrv,
                  storageSrv,
                  tabsSrv,
                  phoneSrv,
                  userSrv,
                  externalCallSrv,
                  appVisibilityServiceHelperSrv,
                  primaryCallSrv,
                  tonesSrv,
                  voiceMailSrv,
                  notificationSrv,
                  groupSrv) {

        var controllerLogger = logSrv.getLogger("mainCtrl");



        var modalInstance = null;


        function init() {

            controllerLogger.fine("mainCtrl>init");
            try {
                controllerLogger.fine("init");
                $scope.eCallState = eCallState;
                $scope.isRTL = locale.getLocale() == "he-IL";
                $scope.primaryCall = null;
                $rootScope.isBackShown = false;

                $scope.$on(localeEvents.localeChanges, onLocaleChanged);
                $scope.$on('primaryCallSrv:primaryCallChanged',onPrimaryCallChanged);
                $scope.$on("loginSrv:connectionFailed", onConnectionFailed);
                $scope.$on("loginSrv:connectionRestored", onConnectionRestored);
                $scope.$on("app:showView", onShowView);

            } catch (err) {
                controllerLogger.error(err)
            }
        };


        function onLocaleChanged() {
            $scope.isRTL = locale.getLocale() == "he-IL";
        }

        $rootScope.getFilter = function() {
            return $filter;
        };

        $scope.isChinise = function() {
            return locale.getLocale() == "zh-CH";
        };

        $scope.isHe = function() {
            return locale.getLocale() == "he-IL";
        };



        $scope.onKeyDown = function(event) {
            if (event.keyCode == 13) { //Enter
                if (document.activeElement && !(document.activeElement.tagName.toLowerCase() == 'textarea') && document.activeElement.blur) {
                    document.activeElement.blur();
                } //if it is textarea we want enter to newlines ofcourse.
            }
        };




        $rootScope.showBack = function(show) {
            $rootScope.isBackShown = show;
        }

        $rootScope.goBack = function() {
            backNavigationSrv.goBack();
        };



        $scope.makeCallToContact = function (contact, isVideo, event) {
            if (event) {
                event.stopPropagation();
            }
            callsSrv.makeCallToContact(contact);
        };

        $scope.answerCall = function(call) {
            try {
                callsSrv.answerCall(call);
            } catch (err) {
                controllerLogger.error(err)
            }

        };

        $scope.toggleHold = function(call) {
            if (call.State==eCallState.Active || call.State==eCallState.Held) {
                callsSrv.holdCall(call);
            }else if (call.State==eCallState.Hold){
                callsSrv.retrieveCall(call);
            }
        };

        $scope.terminateCall = function(call) {
            try {
                callsSrv.terminateCall(call);
            } catch (err) {
                controllerLogger.error(err)
            }
        };


		function onPrimaryCallChanged(event, primaryCall) {
            $scope.primaryCall = primaryCall;
        }

        function onShowView(event, viewName) {
            $state.go(viewName);
        }

       

        $scope.divertToVM = function(call) {
            controllerLogger.fine("mainCtrl>divertToVM");
            try {
                  alertSrv.setAlert('Error','NoVoiceMailConfiguredClient');
            } catch (err) {
                controllerLogger.error(err)
            }

        };



        $scope.onAppClick = function() {
            //todo michael
            //deviceSrv.setIsAppInteractedSinceBackgroundRinging(true);
        };



        $scope.showContact = function (contact) {
            var params = {contactId: contact.getContactId()};
            $state.go('home.contactDetails', params);
        };

        $scope.showFavorites = function () {
            $state.go('home.favorites');
        };

        $scope.showGroups = function () {
            $state.go('home.groups');
        };

        $scope.showContacts = function () {
            $state.go('home.contacts');
        };

        $scope.showCallLog = function () {
            callLogSrv.dismissMissedCalls();
            $state.go('home.callLog');
        };

        $scope.toggleFavorite = function ($event, contact) {
            $event.stopPropagation();
            if (contact.internal.isFav) {
                favoritesSrv.removeContactFromFavorites(contact);
            }else {
                favoritesSrv.addContactToFavorites(contact);
            }
        };

        $scope.chatWithContact = function(contact, event) {
            try {
                if (event) {
                    event.stopPropagation();
                }
                var params = {contact: contact};
                $state.go('home.chat', params);
            }catch(err) {
                controllerLogger.error(err);
            }

        };


        $scope.divertCall = function(_call) {
            try {
                //todo michael
            } catch (err) {
                controllerLogger.error(err)
            }

        };


        $scope.logout = function() {
            loginSrv.logout(eLogoutReason.userLoggedOut);
        }

        function onLoggedOut() {
            $state.go("login");
        }

        function onConnectionFailed() {
            alertSrv.setAlert('messages.Error', 'messages.connectionFailed', "connection-failed", 0);
        }

        function onConnectionRestored() {
            var alert = alertSrv.getAlert();
            if (alert && alert.key=='connection-failed') {
                alertSrv.closeAlert();
            }
        }



        init();

    }

var controllersModule = angular.module('aeonixApp.controllers');
controllersModule.controller('mainCtrl',
    [
    '$scope',
    '$rootScope',
    '$state',
    '$modal',
    '$timeout',
    '$filter',
    'locale',
    'localeEvents',
    'alertSrv',
    'backNavigationSrv',
    'callLogSrv',
    'callsSrv',
    'chatSrv',
    'connectionSrv',
    'contactSrv',
    'cstaMonitoringSrv',
    'deviceSrv',
    'dialPlanSrv',
    'favoritesSrv',
    'infoSrv',
    'loginSrv',
    'nativeToJsBridgeSrv',
    'pictureSrv',
    'searchSrv',
    'settingsSrv',
    'localPhoneSrv',
    'storageSrv',
    'tabsSrv',
    'phoneSrv',
    'userSrv',
    'externalCallSrv',
    'appVisibilityServiceHelperSrv',
    'primaryCallSrv',
    'tonesSrv',
    'voiceMailSrv',
    'notificationSrv',
    'groupSrv',
    MainCtrl
    ]
);



