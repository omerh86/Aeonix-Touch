
var servicesModule = angular.module('aeonixApp.services');

servicesModule.service('storageSrv', [function () {

        var serviceLogger = logSrv.getLogger("storageSrv");

        function addOrUpdate(userName, category, key, value) {
            var logger = serviceLogger.logMethodCall(arguments,eLogLevel.finer);

            var keyString = JSON.stringify(key);
            var valueString=JSON.stringify(value);
            JSBridge.addToOrUpdateInStorage(userName,category,keyString,valueString);
        }

        function get(userName, category,key) {
            var logger = serviceLogger.logMethodCall(arguments,eLogLevel.finer);

            var value = null;

            var keyString = JSON.stringify(key);
            var s = JSBridge.getFromStorage(userName, category,keyString);
            if (s!=undefined && s!=null) {
                value = JSON.parse(s);
            }

            logger.logMethodCompleted(arguments, value, eLogLevel.finer);

            return value;
        }

        function remove(userName,category,key) {
            var logger = serviceLogger.logMethodCall(arguments,eLogLevel.finer);

            var keyString = JSON.stringify(key);
            JSBridge.removeFromStorage(userName,category,keyString);
        }

        function getAllValuesOfCategory(userName, category) {
            var logger = serviceLogger.logMethodCall(arguments,eLogLevel.finer);

            var s = JSBridge.getAllValuesOfCategory(userName,category);
            var list = JSON.parse(s);
            var valueList = [];
            if (list && list.length>0) {
                for (var i=0;i<list.length;i++) {
                    var s = list[i];
                    var value = JSON.parse(s);
                    valueList.push(value);
                }
            }

            logger.logMethodCompleted(arguments, valueList, eLogLevel.finer);

            return valueList;
        }

        function removeAllValuesOfCategory(userName, category) {
            var logger = serviceLogger.logMethodCall(arguments,eLogLevel.finer);

            JSBridge.removeAllValuesOfCategory(userName,category);
        }

        function removeAllValuesOfUser(userName) {
            var logger = serviceLogger.logMethodCall(arguments,eLogLevel.finer);

            JSBridge.removeAllValuesOfUser(userName);
        }


        this.addOrUpdate = addOrUpdate;
        this.get = get;
        this.remove = remove;
        this.getAllValuesOfCategory = getAllValuesOfCategory;
        this.removeAllValuesOfCategory = removeAllValuesOfCategory;
        this.removeAllValuesOfUser = removeAllValuesOfUser;
    }])
;