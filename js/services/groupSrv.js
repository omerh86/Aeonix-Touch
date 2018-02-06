function GroupSrv($rootScope, infoSrv, loginSrv, contactSrv) {

    var serviceLogger = logSrv.getLogger("groupSrv");

    var groupList = [];

    function getCurrentUserName() {
        return loginSrv.getUserName();
    }

    function resetMembers() {
        groupList.splice(0, groupList.length);
    }

    function getMembers() {
        var o = {
            "groupList": groupList
        };
        return o;
    }

    function sortGroupList() {
        Contact.sortContactListByName(groupList);
    }

    function sendGetGroupsRequest() {
        var request = {
            GetGroups: {
                userName: getCurrentUserName()
            }
        };
        infoSrv.sendRequest(request);
    }


    function getGroupList() {
        return groupList;
    }


    function onLoggedOut(event, loginSrv) {
        var logger = serviceLogger.logMethodCall(arguments, eLogLevel.finer);
        try {
            resetMembers();
        } catch (err) {
            logger.error(err);
        }


    }

    function onLoggedIn(event) {
        var logger = serviceLogger.logMethodCall(arguments, eLogLevel.finer);

        try {
            if (loginSrv.isLoggedInWithEndpoint()) {
                sendGetGroupsRequest();
            }
        } catch (err) {
            logger.error(err);
        }
    }

    function onConnectionRestored() {
        var logger = serviceLogger.logMethodCall(arguments, eLogLevel.finer);

        try {
            if (loginSrv.isLoggedInWithEndpoint()) {
                sendGetGroupsRequest();
            }
        } catch (err) {
            logger.error(err);
        }


    }

    function onGetGroupsResponse(event, getGroupsResponse) {
        var logger = serviceLogger.logMethodCall(arguments, eLogLevel.finer);

        try {
            resetMembers();

            if (getGroupsResponse.listGroupInfo && getGroupsResponse.listGroupInfo.length) {
                for (var i = 0; i < getGroupsResponse.listGroupInfo.length; i++) {
                    var contact = contactSrv.addOrUpdateContactWithGroupInfo(getGroupsResponse.listGroupInfo[i]);
                    groupList.push(contact);
                }
            }
        } catch (err) {
            logger.error(err);
        }



        logger.logMethodCompleted(arguments, getMembers(), eLogLevel.finer);
    }

    function getGroupList() {
        return groupList;
    }

    $rootScope.$on("loginSrv:loggedOut", onLoggedOut);
    $rootScope.$on("loginSrv:loggedIn", onLoggedIn);
    $rootScope.$on("loginSrv:connectionRestored", onConnectionRestored);
    $rootScope.$on("infoSrv:GetGroupsResponse", onGetGroupsResponse);


    this._getCurrentUserName = getCurrentUserName;
    this._resetMembers = resetMembers;
    this._getMembers = getMembers;
    this._sortGroupList = sortGroupList;
    this._sendGetGroupsRequest = sendGetGroupsRequest;
    this._onLoggedOut = onLoggedOut;
    this._onLoggedIn = onLoggedIn;
    this._onConnectionRestored = onConnectionRestored;
    this._onGetGroupsResponse = onGetGroupsResponse;

    this.getGroupList = getGroupList;
}

var servicesModule = angular.module('aeonixApp.services');
servicesModule.service('groupSrv', ['$rootScope', 'infoSrv', 'loginSrv', 'contactSrv', GroupSrv]);