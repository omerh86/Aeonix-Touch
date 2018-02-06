

function DialPlanSrv($rootScope, infoSrv, loginSrv) {

    var serviceLogger = logSrv.getLogger("dialPlanSrv");

    var featureMap = {} ;

    function onGetDialPlanFeaturesResponse(event, response) {

        try {
            featureMap = {};

            if (response.mapDialPlanFeatures) {
                 var map = {};
                 var entries = response.mapDialPlanFeatures.entry;
                 for (var i=0;i<entries.length;i++) {
                    var entry = entries[i];
                    map[entry.key] = entry.value;
                 }
                 var loginAlias = map["login-logout"]+map["activate-feature"];
                 featureMap[loginAlias] = eTelephonyFeature.Login;
                 var logoutAlias = map["login-logout"]+map["deactivate-feature"];
                 featureMap[logoutAlias] = eTelephonyFeature.Logout;
            }
        }catch(err){
            logger.error(err);
        }
    }

    function sendGetDialPlanFeaturesRequest() {
        var request = {
            GetDialPlanFeatures: {
                userName: loginSrv.getUserName()
            }
        };
        infoSrv.sendRequest(request);
    }

    function onLoggedOut() {
        featureMap = {};
    }

    function onLoggedIn() {
        try {
            if (loginSrv.getState() == eLoginState.loggedIn && loginSrv.isLoggedInWithEndpoint()){
                sendGetDialPlanFeaturesRequest();
            }
        }catch(err){
            logger.error(err);
        }
    }

    function onConnectionRestored() {
        try {
            if (loginSrv.isLoggedInWithEndpoint()) {
                sendGetDialPlanFeaturesRequest();
            }
        }catch(err){
            logger.error(err);
        }
    }


    function isFeatureCode(alias) {
        return featureMap[alias];
    }

    function isLoginFeatureCode(alias) {
        var code = featureMap[alias];
        return (code===eTelephonyFeature.Login);
    }

    function isLogoutFeatureCode(alias) {
        var code = featureMap[alias];
        return (code===eTelephonyFeature.Logout);
    }


    $rootScope.$on("loginSrv:loggedOut", onLoggedOut);
    $rootScope.$on("loginSrv:loggedIn", onLoggedIn);
    $rootScope.$on("loginSrv:connectionRestored", onConnectionRestored);
    $rootScope.$on("infoSrv:GetDialPlanFeaturesResponse", onGetDialPlanFeaturesResponse);


   this.onGetDialPlanFeaturesResponse = onGetDialPlanFeaturesResponse;
   this.sendGetDialPlanFeaturesRequest = sendGetDialPlanFeaturesRequest;
   this.onLoggedOut = onLoggedOut;
   this.onLoggedIn = onLoggedIn;
   this.onConnectionRestored = onConnectionRestored;
   this.isFeatureCode = isFeatureCode;
   this.isLoginFeatureCode = isLoginFeatureCode;
   this.isLogoutFeatureCode = isLogoutFeatureCode;


}

var servicesModule = angular.module('aeonixApp.services');
servicesModule.service('dialPlanSrv', ['$rootScope', 'infoSrv', 'loginSrv', DialPlanSrv]);

