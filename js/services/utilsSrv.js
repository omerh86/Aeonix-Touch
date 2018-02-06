

var servicesModule = angular.module('aeonixApp.services');

servicesModule.service('utilsSrv', ['$rootScope',
    function ($rootScope) {

        var serviceLogger = logSrv.getLogger("utilsSrv");

        var THAT = this;

        var nonDigitKeyNames = {
            //perhaps more mappings are needed...
            16:'Shift',
            17:'Ctrl',
            18:'Alt'
        };



        this.isAliasesOverlap = function (alias1, alias2) {
            if (alias1 && alias2) {
                var isAlias1Array = Array.isArray(alias1);
                var isAlias2Array = Array.isArray(alias2);
                if (isAlias1Array && isAlias2Array) { // both arrays
                        for (var i = 0; i < alias1.length; i++) {
                            var alias1Member = alias1[i];
                        for (var j = 0; j < alias2.length; j++) {
                            if (alias1Member == alias2[j])
                                return true;
                            }
                        }
                    }
                else if (!isAlias1Array && !isAlias2Array) { // both non arrays
                    return alias1 == alias2;
                    }
                else { // one is array, the other is string
                    var arr = isAlias1Array ? alias1 : alias2;
                    var alias = isAlias1Array ? alias2 : alias1;
                    for (var i = 0; i < arr.length; i++) {
                        if (arr[i] == alias) {
                            return true;
                }
                    }
                }
            }
            return false;
        };

        this.aliasObjectsToAliases = function(aliasObjects) {
            var aliases = [];
            if(aliasObjects){
                for (var i = 0; i < aliasObjects.length; i++) {
                    if(aliasObjects[i].completeAliasName){
                        aliases.push(aliasObjects[i].completeAliasName);
                    }
                    else if(!isNaN(aliasObjects[i]))
                    {
                        aliases.push(aliasObjects[i]);
                    }
                }
            }
            return aliases;
        };

        this.isAliasObjectsOverlap = function(aliases1, aliases2) {
            if(Array.isArray(aliases1) && Array.isArray(aliases2)){
                return THAT.isAliasesOverlap(THAT.aliasObjectsToAliases(aliases1), THAT.aliasObjectsToAliases(aliases2))
            }
            else
            {
                return false;
            }
        };
        this.isAliasObjectsOverlapinContact = function (contactAlias, alias) {
            for (var i = 0; i < contactAlias.length; i++) {
                if (contactAlias[i].completeAliasName == alias)
                    return true;
            }
            return false;
        };

        this.getNonDigitKeyNames = function () {
            return nonDigitKeyNames
        };

        this.isEmpty = function(value) {
            return angular.isUndefined(value) || value === '' || value === null || value !== value;
        };

                this.serviceTypeToAliasType = function(serviceType,defaultForUndefined) {
                    if (serviceType == "USR") {
                        return 'Internal';
                    }
                    else if (serviceType == "CALL_GROUP" || serviceType == "CONFERENCE_CALL" || serviceType == "MEET_ME" || serviceType == "ZONE_PAGE") {
                        return 'Group';
                    }
                    else
                        return defaultForUndefined;
        };


		this.isChrome = function () {
            return (navigator.userAgent.toLowerCase().indexOf('chrome') != -1);
        };

        this.isIphone = function() {
            return navigator.userAgent.toLowerCase().indexOf('iphone') != -1;
        };

        this.elementToLog = function (element) {
            var target = $(element);
            var elemText = target.text().trim().substring(0, 50);
            if (!elemText) {
                elemText = element.className;
                if (!elemText) {
                    var parent = target.parent();
                    while (parent)
                    {
                        elemText = parent.attr("class");
                        if (elemText)
                            break;
                        parent = parent.parent();
                    }
                    // elemText = target.clone().wrap('<div>').parent().html().replace(/\s+/g, '');
                }
            }
            
            return elemText;
                }

        this.toJson = function() {
            var j = {};

            for (var attr in this) {
                if (typeof this[attr] != "function") {
                    attrs[attr] = this[attr];
                }
            }
            return attrs;
        };

        this.bindFunction = function(funName, obj) {
            var eventHandlerWrapper = function() {
                var args = Array.prototype.slice.call(arguments);
                obj[funName].apply(obj,args);
            }
            return eventHandlerWrapper;
        }

    }]);