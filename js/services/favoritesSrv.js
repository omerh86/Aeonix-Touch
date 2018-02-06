function FavoritesSrv($rootScope, infoSrv, cstaMonitoringSrv, contactSrv, loginSrv) {

    var serviceLogger = logSrv.getLogger("favoritesSrv");

    var favoriteList = [];

    function getCurrentUserName() {
        return loginSrv.getUserName();
    }

    function resetMembers() {
        favoriteList.splice(0, favoriteList.length);
    }

    function getMembers() {
        var o = {
            "favoriteList": favoriteList
        };
        return o;
    }

    function sortFavoriteList() {
        Contact.sortContactListByName(favoriteList);
    }

    function sendGetFavoritesRequest() {
        var request = {
            GetFavorites: {
                userName: getCurrentUserName()
            }
        };
        infoSrv.sendRequest(request);
    }

    function sendAddFavoriteRequest(contact) {
        var id;
        if (contact.internal.type == eContactType.user) {
            id = contact.contact.userName;
        } else {
            id = contact.getAlias();
        }
        var request = {
            AddFavorites: {
                userName: getCurrentUserName(),
                favoriteUserLogiName: id
            }
        };

        infoSrv.sendRequest(request);
    }

    function sendRemoveFavoriteRequest(contact) {
        var id;
        if (contact.internal.type == eContactType.user) {
            id = contact.contact.userName;
        } else {
            id = contact.getAlias();
        }
        var request = {
            RemoveFavorites: {
                userName: getCurrentUserName(),
                usersToRemove: [id]
            }
        };

        infoSrv.sendRequest(request);
    }

    function addContactToFavorites(contact) {
        var logger = serviceLogger.logMethodCall(arguments, eLogLevel.finer);

        contact.setFavorite(true);
        var index = contact.indexInList(favoriteList);
        if (index == -1) {
            favoriteList.push(contact);
            sortFavoriteList();
            sendAddFavoriteRequest(contact);
            cstaMonitoringSrv.startPresenceMonitoring([contact]);
        } else {
            logger.fine("The contact ", contact.getName(), " has been found in the Favorites list. No adding required");
        }

        logger.logMethodCompleted(arguments, getMembers(), eLogLevel.finer);
    }

    function removeContactFromFavorites(contact) {
        var logger = serviceLogger.logMethodCall(arguments, eLogLevel.finer);

        contact.setFavorite(true);
        var index = contact.indexInList(favoriteList);
        if (index != -1) {
            favoriteList.splice(index, 1);
            sendRemoveFavoriteRequest(contact);
            cstaMonitoringSrv.stopPresenceMonitors([contact]);
        } else {
            logger.fine("The contact ", contact.getName(), " has not been found in the Favorites list. No removing required");
        }

        logger.logMethodCompleted(arguments, getMembers(), eLogLevel.finer);
    }

    function onFavoriteListUpdated(newList) {
        var logger = serviceLogger.logMethodCall(arguments, eLogLevel.finer);

        var newContactList = [];
        for (var i = 0; i < newList.length; i++) {
            var contactInfo = newList[i];
            var contact = contactSrv.addOrUpdateContactWithContactInfo(contactInfo);
            var index = contact.indexInList(favoriteList);
            if (index == -1) {
                contact.setFavorite(true);
                cstaMonitoringSrv.startPresenceMonitoring([contact]);
                favoriteList.push(contact);
            }
            newContactList.push(contact);
        }

        for (var i = favoriteList.length - 1; i >= 0; i--) {
            var contact = favoriteList[i];
            var index = contact.indexInList(newContactList);
            if (index == -1) {
                contact.setFavorite(false);
                cstaMonitoringSrv.stopPresenceMonitors([contact]);
                favoriteList.splice(i, 1);
            }
        }
        sortFavoriteList();

        logger.logMethodCompleted(arguments, getMembers(), eLogLevel.finer);
    }

    function getFavoriteList() {
        return favoriteList;
    }


    function onLoggedOut(event, loginSrv) {
        var logger = serviceLogger.logMethodCall(arguments, eLogLevel.finer);
        try {
            resetMembers();
        } catch (err) {
            logger.error(err);
        }


        logger.logMethodCompleted(arguments, getMembers(), eLogLevel.finer);
    }

    function onLoggedIn(event) {
        var logger = serviceLogger.logMethodCall(arguments, eLogLevel.finer);

        try {
            if (loginSrv.isLoggedInWithEndpoint()) {
                sendGetFavoritesRequest();
            }
        } catch (err) {
            logger.error(err);
        }

        logger.logMethodCompleted(arguments, getMembers(), eLogLevel.finer);
    }

    function onConnectionRestored() {
        var logger = serviceLogger.logMethodCall(arguments, eLogLevel.finer);
        try {
            if (loginSrv.isLoggedInWithEndpoint()) {
                sendGetFavoritesRequest();
            }
        } catch (err) {
            logger.error(err);
        }

        logger.logMethodCompleted(arguments, getMembers(), eLogLevel.finer);
    }

    function onFavoritesListResponse(e, list) {
        var logger = serviceLogger.logMethodCall(arguments, eLogLevel.finer);
        try {
            onFavoriteListUpdated(list);
        } catch (err) {
            logger.error(err);
        }

        logger.logMethodCompleted(arguments, getMembers(), eLogLevel.finer);
    }

    $rootScope.$on("infoSrv:FavoritesListResponse", onFavoritesListResponse);
    $rootScope.$on("loginSrv:loggedOut", onLoggedOut);
    $rootScope.$on("loginSrv:loggedIn", onLoggedIn);
    $rootScope.$on("loginSrv:connectionRestored", onConnectionRestored);


    this._getCurrentUserName = getCurrentUserName;
    this._resetMembers = resetMembers;
    this._getMembers = getMembers;
    this._sortFavoriteList = sortFavoriteList;
    this._sendGetFavoritesRequest = sendGetFavoritesRequest;
    this._sendAddFavoriteRequest = sendAddFavoriteRequest;
    this._sendRemoveFavoriteRequest = sendRemoveFavoriteRequest;
    this._onFavoriteListUpdated = onFavoriteListUpdated;
    this._onLoggedOut = onLoggedOut;
    this._onLoggedIn = onLoggedIn;
    this._onConnectionRestored = onConnectionRestored;

    this.addContactToFavorites = addContactToFavorites;
    this.removeContactFromFavorites = removeContactFromFavorites;
    this.getFavoriteList = getFavoriteList;
}

var servicesModule = angular.module('aeonixApp.services');
servicesModule.service('favoritesSrv', ['$rootScope', 'infoSrv', 'cstaMonitoringSrv', 'contactSrv', 'loginSrv', FavoritesSrv]);