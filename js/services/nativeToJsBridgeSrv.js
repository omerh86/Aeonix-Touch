

document.addEventListener("DOMContentLoaded", function(){
    uiStatus.loadCompleted();
});

function onEvent(source, event, param) {
    try {
        var service = angular.element(document.body).injector().get('nativeToJsBridgeSrv');
        service.onNativeEvent(source,event,param);
    }catch(err) {
        try {
            var logger = logSrv.getLogger("nativeToJsBridgeSrv");
            logger.error(err);
        }catch(err1) {
            console.error(err);
        }
    }
}


var servicesModule = angular.module('aeonixApp.services');

servicesModule.service('nativeToJsBridgeSrv', ['$rootScope', '$interval','callsSrv','connectionSrv','infoSrv','phoneSrv', 'settingsSrv', 'loginSrv', 'deviceSrv', 'alertSrv','voiceMailSrv',
 function ($rootScope, $interval,callsSrv,connectionSrv,infoSrv,phone, settingsSrv, loginSrv, deviceSrv, alertSrv, voiceMailSrv) {

    var serviceLogger = logSrv.getLogger("nativeToJsBridgeSrv");

    var eventQueue = [];
    var checkInterval = 50;
    var checkIntervalPromise = null;



    function getMembers() {
        var obj = {
            eventQueue: eventQueue,
            checkInterval: checkInterval,
            checkIntervalPromise: checkIntervalPromise
        };
        return obj;
    }

    function clearEventQueue() {
        eventQueue = [];
    }

    function pause()  {
        if (checkIntervalPromise) {
            $interval.cancel(checkIntervalPromise);
            checkIntervalPromise = null;
        }
    }

    function resume() {
        if (!checkIntervalPromise) {
            checkIntervalPromise = $interval(processEventQueue, checkInterval, 0, true);
        }
    }

    function setQueueCheckInterval(interval) {
        checkInterval = interval;
        if (checkIntervalPromise) {
            pause();
            resume();
        }
    }

    function onNativeEvent(source, event, param) {
        var logger = serviceLogger.logMethodCall(arguments,eLogLevel.finer);
        try {


            var obj = {
              source: source,
              event: event,
              data: param
            };

            eventQueue.push(obj);
        } catch (err) {
            logger.error(err)
        }
        logger.finest("onNativeEvent completed; event queue size - ",eventQueue.length)
    }

    function processEventQueue() {
        if (eventQueue.length) {
            var logger = serviceLogger.logMethodCall(arguments,eLogLevel.finer);
            while (eventQueue.length) {
                var event = eventQueue[0];
                eventQueue.splice(0, 1);
                logger.fine("================= processing ", event.event, " event =================");
                logger.logCollapsed("event content",event,eLogLevel.finer);
                try {
                    var eventName = event.source+":"+event.event;
                    $rootScope.$broadcast(eventName,event.data);
                } catch (err) {
                    logger.error(err)
                }
                logger.fine("============ finished processing ", event.event, " event ============");
            }
            logger.finest("processEventQueue completed")
        }
    }

    this._getMembers = getMembers;
    this._pause = pause;
    this._resume = resume;
    this._setQueueCheckInterval = setQueueCheckInterval;
    this._processEventQueue = processEventQueue;

    this.onNativeEvent = onNativeEvent;

    resume();
    serviceLogger.fine("nativeToJsBridgeSrv service created");

}]);

