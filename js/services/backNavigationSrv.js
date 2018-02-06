var servicesModule = angular.module('aeonixApp.services');

function BackNavigationSrv($rootScope, $state) {

    var serviceLogger = logSrv.getLogger("backNavigationSrv");

    var links  = [];
    var goingBack = false;


    function getMembers() {
         var o = {
             "links":links,
             "goingBack":goingBack
         };
         return o;
    }

    function goBack () {
        var logger = serviceLogger.logMethodCall(arguments,eLogLevel.finer);
        if (links.length>0) {
            for (var i=links.length-1;i>=0;i--) {
                var link = links[i];
                links.splice(i,1);
                if (!link.isRelevant || link.isRelevant()) {
                    goingBack = true;
                    link.goBack($state);
                    goingBack = false;
                    break;
                }
            }
        }else {
            JSBridge.moveAppToBack();
        }
        logger.logMethodCompleted(arguments, getMembers(), eLogLevel.finer);
    }

    function isGoingBack() {
        return goingBack;
    }

    function addToBackStack(link) {
        var logger = serviceLogger.logMethodCall(arguments,eLogLevel.finer);

        links.push(link);
        if (links.length===100) {
            links = links.slice(50);
        }
        logger.logMethodCompleted(arguments, getMembers(), eLogLevel.finer);
    }

    function reset() {
        links = [];
    }

    function onBackPressed(event) {
        var logger = serviceLogger.logMethodCall(arguments,eLogLevel.finer);
        try {
            goBack();
        }catch(err){
            logger.error(err);
        }
        logger.logMethodCompleted(arguments, getMembers(), eLogLevel.finer);
    }

    $rootScope.$on("app:backPressed", onBackPressed);


    this._getMembers = getMembers;
    this._onBackPressed = onBackPressed;
    this.goBack = goBack;
    this.isGoingBack = isGoingBack;
    this.addToBackStack = addToBackStack;
    this.reset = reset;


}


servicesModule.service('backNavigationSrv', ['$rootScope','$state',BackNavigationSrv]);