function SearchSrv($rootScope, infoSrv, loginSrv, contactSrv, $timeout, settingsSrv) {


    var serviceLogger = logSrv.getLogger("searchSrv");

    var serverResponseTimeout = null;

    var searchInstanceList = [];

    var currentSearchInstance = null;

    var pendingSearchInstance = null;

    function findOrAddSearchInstance(searchId) {
        var logger = serviceLogger.logMethodCall(arguments, eLogLevel.finer);

        var searchInstance = null;
        for (var i = 0; i < searchInstanceList.length; i++) {
            var si = searchInstanceList[i];
            if (si.id == searchId) {
                searchInstance = si;
                break;
            }
        }
        if (!searchInstance) {
            searchInstance = {
                id: searchId,
                currentFilter: "",
                resultFilter: "",
                searchByAliasOnly: null,
                searchResult: [],
                resultTotalNumberOfRecords: null
            };
            searchInstanceList.push(searchInstance);
        }
        logger.logMethodCompleted(arguments, searchInstance, eLogLevel.finer);
        return searchInstance;
    }


    function getCurrentUserName() {
        return loginSrv.getUserName();
    }


    function isConnected() {
        return loginSrv.getState() == eLoginState.loggedIn && loginSrv.isLoggedInWithEndpoint();
    }

    function getMembers() {
        var o = {
            "serverResponseTimeout": serverResponseTimeout,
            "pendingSearchInstance": pendingSearchInstance,
            "currentSearchInstance": currentSearchInstance,
            "searchInstanceList": searchInstanceList
        };
        return o;
    }

    function moreDataExists(searchInstance) {
        var exist = searchInstance.resultTotalNumberOfRecords && searchInstance.resultTotalNumberOfRecords > 0 &&
            searchInstance.searchResult.length < searchInstance.resultTotalNumberOfRecords;
        logger.finer("moreDataExists - ", exist);
        return exist;
    }

    function sendRequestToServer(searchInstance) {
        var logger = serviceLogger.logMethodCall(arguments, eLogLevel.finer);

        currentSearchInstance = searchInstance;
        var startIndex;
        var endIndex;
        if (searchInstance.currentFilter == searchInstance.resultFilter) {
            startIndex = searchInstance.searchResult.length;
            endIndex = searchInstance.searchResult.length + 19;
        } else {
            startIndex = 0;
            endIndex = 19;
        }

        var settings = settingsSrv.getSettings();
        var request = {
            GetContactList: {
                startIndex: startIndex,
                endIndex: endIndex,
                sortingMethod: settings.sort == "last_name" ? "LAST_NAME" : "FIRST_NAME", // FIRST_NAME/LAST_NAME
                sortingOrder: "ASCENDING", // Ascending or Descending
                filter: searchInstance.currentFilter,
                filterAliasOnly: searchInstance.searchByAliasOnly
            }
        };
        infoSrv.sendRequest(request);
        if (serverResponseTimeout) {
            $timeout.cancel(serverResponseTimeout);
        }
        serverResponseTimeout = $timeout(function() {
            onServerResponseTimeout(searchInstance);
        }, 30000, false);
        logger.logMethodCompleted(arguments, getMembers(), eLogLevel.finer);
    }



    function createSearchInstance(searchId) {
        var logger = serviceLogger.logMethodCall(arguments, eLogLevel.finer);
        return findOrAddSearchInstance(searchId);
    }


    function search(searchId, filter, aliasOnly) {
        var logger = serviceLogger.logMethodCall(arguments, eLogLevel.finer);

        var searchInstance = findOrAddSearchInstance(searchId);
        searchInstance.currentFilter = filter;
        searchInstance.searchByAliasOnly = aliasOnly;
        if (filter.length < 3) {
            clearSearch(searchId);
        } else if (currentSearchInstance) {
            pendingSearchInstance = searchInstance;
        } else {
            sendRequestToServer(searchInstance);
        }

        logger.logMethodCompleted(arguments, getMembers(), eLogLevel.finer);
    }


    function onContactListResponse(event, response) {
        var logger = serviceLogger.logMethodCall(arguments, eLogLevel.finer);

        try {
            if (serverResponseTimeout) {
                $timeout.cancel(serverResponseTimeout);
                serverResponseTimeout = null;
            }
            var searchInstance = currentSearchInstance;
            currentSearchInstance = null;
            if (searchInstance.currentFilter != "") {
                if (searchInstance.resultFilter !== searchInstance.currentFilter) {
                    if (searchInstance.searchResult.length > 0) {
                        searchInstance.searchResult.splice(0, searchInstance.searchResult.length);
                    }
                }
                if (response.errCode == 0) {
                    searchInstance.resultTotalNumberOfRecords = response.totalNumber;
                    var list = response.contactsPresence;
                    for (var i = 0; i < list.length; i++) {
                        var contactInfo = list[i].contact;
                        var presence;
                        //todo michael (change the server)
                        if (list[i].presense) {
                            presence = list[i].presense.presence;
                        }
                        var contact = contactSrv.addOrUpdateContactWithContactInfo(contactInfo, presence);
                        searchInstance.searchResult.push(contact);
                    }
                }
                searchInstance.resultFilter = searchInstance.currentFilter;
            }

            if (pendingSearchInstance) {
                sendRequestToServer(pendingSearchInstance);
                pendingSearchInstance = null;
            }
        } catch (err) {
            logger.error(err);
        }




        logger.logMethodCompleted(arguments, getMembers(), eLogLevel.finer);
    }

    function loadMoreSearchResults(searchId) {
        var logger = serviceLogger.logMethodCall(arguments, eLogLevel.finer);

        if (isConnected()) {
            var searchInstance = findOrAddSearchInstance(searchId);
            if (moreDataExists(searchInstance)) {
                if (currentSearchInstance) {
                    if (currentSearchInstance != searchInstance) {
                        pendingSearchInstance = searchInstance;
                    }
                } else {
                    sendRequestToServer(searchInstance);
                }
            }
        }


        logger.logMethodCompleted(arguments, getMembers(), eLogLevel.finer);
    }

    function clearSearch(searchId) {
        var logger = serviceLogger.logMethodCall(arguments, eLogLevel.finer);

        var searchInstance = findOrAddSearchInstance(searchId);
        searchInstance.currentFilter = "";
        searchInstance.resultFilter = "";
        searchInstance.searchByAliasOnly = null;
        if (searchInstance.searchResult.length > 0) {
            searchInstance.searchResult.splice(0, searchInstance.searchResult.length);
        }
        searchInstance.resultTotalNumberOfRecords = null;
        if (pendingSearchInstance == searchInstance) {
            pendingSearchInstance = null;
        }
        logger.logMethodCompleted(arguments, getMembers(), eLogLevel.finer);
    }

    function onServerResponseTimeout() {
        var logger = serviceLogger.logMethodCall(arguments, eLogLevel.finer);

        currentSearchInstance = null;
        serverResponseTimeout = null;
        if (pendingSearchInstance) {
            sendRequestToServer(pendingSearchInstance);
            pendingSearchInstance = null;
        }

        logger.logMethodCompleted(arguments, getMembers(), eLogLevel.finer);
    }

    function onConnectionFailed() {
        var logger = serviceLogger.logMethodCall(arguments, eLogLevel.finer);

        try {
            currentSearchInstance = null;
            if (serverResponseTimeout) {
                $timeout.cancel(serverResponseTimeout);
                serverResponseTimeout = null;
            }
            pendingSearchInstance = null;

        } catch (err) {
            logger.error(err);
        }




        logger.logMethodCompleted(arguments, getMembers(), eLogLevel.finer);
    }



    function onLoggedOut() {
        var logger = serviceLogger.logMethodCall(arguments, eLogLevel.finer);

        try {
            if (serverResponseTimeout) {
                $timeout.cancel(serverResponseTimeout);
                serverResponseTimeout = null;
            }

            if (searchInstanceList.length > 0) {
                searchInstanceList.splice(0, searchInstanceList.length);
            }

            currentSearchInstance = null;
            pendingSearchInstance = null;

        } catch (err) {
            logger.error(err);
        }




        logger.logMethodCompleted(arguments, getMembers(), eLogLevel.finer);
    }

    $rootScope.$on("infoSrv:ContactListResponse", onContactListResponse);
    $rootScope.$on("loginSrv:loggedOut", onLoggedOut);
    $rootScope.$on("loginSrv:connectionFailed", onConnectionFailed);

    this._findOrAddSearchInstance = findOrAddSearchInstance;
    this._getCurrentUserName = getCurrentUserName;
    this._isConnected = isConnected;
    this._getMembers = getMembers;
    this._moreDataExists = moreDataExists;
    this._sendRequestToServer = sendRequestToServer;
    this._onContactListResponse = onContactListResponse;
    this._onServerResponseTimeout = onServerResponseTimeout;
    this._onConnectionFailed = onConnectionFailed;
    this._onLoggedOut = onLoggedOut;

    this.search = search;
    this.loadMoreSearchResults = loadMoreSearchResults;
    this.createSearchInstance = createSearchInstance;
    this.clearSearch = clearSearch;

}

var servicesModule = angular.module('aeonixApp.services');
servicesModule.service('searchSrv', ['$rootScope', 'infoSrv', 'loginSrv', 'contactSrv', '$timeout', 'settingsSrv', SearchSrv]);