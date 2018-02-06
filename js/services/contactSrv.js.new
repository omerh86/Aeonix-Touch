function ContactSrv($rootScope, infoSrv, pictureSrv, storageSrv, loginSrv) {

    var service = this;
    var serviceLogger = logSrv.getLogger("contactSrv");

    var userNameToContactMap = {};
    var aliasToContactMap = {};



    function getCurrentUserName() {
        return loginSrv.getUserName();
    }

    function resetMembers() {
        userNameToContactMap = {};
        aliasToContactMap = {};
    }

    function getMembers() {
        var o = {
            "userNameToContactMap": userNameToContactMap,
            "aliasToContactMap": aliasToContactMap
        };
        return o;
    }


    function loadPersistedContacts() {

        var logger = serviceLogger.logMethodCall(arguments, eLogLevel.finer);


        var list = storageSrv.getAllValuesOfCategory(getCurrentUserName(), "contactSrv:contact");

        if (list && list.length > 0) {
            for (var i = 0; i < list.length; i++) {
                var persistentContact = list[i];
                var contact = addOrUpdateContactWithContactInfo(persistentContact.contact);
                contact.internal.persistent = true;
            }
        }

        logger.logMethodCompleted(arguments, getMembers(), eLogLevel.finer);
    }


    function getContactFromServerByAlias(alias) {
        var logger = serviceLogger.logMethodCall(arguments, eLogLevel.finer);

        var obj = {
            GetContact: {
                alias: alias
            }
        };
        infoSrv.sendRequest(obj);

        logger.logMethodCompleted(arguments, getMembers(), eLogLevel.finer);
    };

    function getContactFromServerByUserName(userName) {
        var logger = serviceLogger.logMethodCall(arguments, eLogLevel.finer);

        var obj = {
            GetContact: {
                userName: userName
            }
        };
        infoSrv.sendRequest(obj);

        logger.logMethodCompleted(arguments, getMembers(), eLogLevel.finer);
    };

    function getContactFromServer(contact) {
        var logger = serviceLogger.logMethodCall(arguments, eLogLevel.finer);

        if (contact.getAlias()) {
            getContactFromServerByAlias(contact.getAlias());
        } else if (isSearchableUserName(contact.contact.userName)) {
            getContactFromServerByUserName(contact.contact.userName);
        } else {
            logger.finest("Both alias and userName are empty. No request will be sent to the server");
        }

        logger.logMethodCompleted(arguments, getMembers(), eLogLevel.finer);
    }

    function mergeContactInfo(newContact, existingContact) {

        var logger = serviceLogger.logMethodCall(arguments, eLogLevel.finer);

        existingContact.contact = newContact.contact;
        existingContact.internal.img = newContact.internal.img;
        existingContact.internal.imgBig = newContact.internal.imgBig;
        existingContact.internal.type = newContact.internal.type;
        newContact.internal.isFav = existingContact.internal.isFav;

        if (existingContact.internal.persistent) {
            storageSrv.addOrUpdate(getCurrentUserName(), "contactSrv:contact", existingContact.getContactId().toString(), existingContact);
        }

        logger.logMethodCompleted(arguments, getMembers(), eLogLevel.finer);
    }


    function putContactToMaps(contact) {

        var logger = serviceLogger.logMethodCall(arguments, eLogLevel.finer);

        contact.contactSrv = service;
        var cachedContact;
        if (contact.contact.aliases && contact.contact.aliases.length > 0) {
            for (var i = 0; i < contact.contact.aliases.length; i++) {
                var alias = contact.contact.aliases[i].completeAliasName;
                var existingContact = aliasToContactMap[alias];
                if (existingContact) {
                    cachedContact = existingContact;
                    mergeContactInfo(contact, existingContact);
                } else {
                    aliasToContactMap[alias] = contact;
                }
            }
        }
        if (contact.internal.extAliases && contact.internal.extAliases.length) {
            for (var i = 0; i < contact.contact.extAliases.length; i++) {
                var alias = contact.contact.extAliases[i];
                var existingContact = aliasToContactMap[alias];
                if (existingContact) {
                    cachedContact = existingContact;
                    mergeContactInfo(contact, existingContact);
                } else {
                    aliasToContactMap[alias] = contact;
                }
            }
        }
        if (contact.internal.type == eContactType.user && isSearchableUserName(contact.contact.userName)) {
            var existingContact = userNameToContactMap[contact.contact.userName];
            if (existingContact) {
                cachedContact = existingContact;
                mergeContactInfo(contact, existingContact);
            } else {
                userNameToContactMap[contact.contact.userName] = contact;
            }
        }


        if (cachedContact) {
            contact = cachedContact;
        }

        logger.logMethodCompleted(arguments, contact, eLogLevel.finer);

        return contact;
    }

    function isSearchableUserName(userName) {
        return (userName && userName != "");
    }

    function getContactByAlias(alias) {
        var logger = serviceLogger.logMethodCall(arguments, eLogLevel.finer);

        var contact = aliasToContactMap[alias];
        if (!contact) {
            contact = Contact.createFromAlias(alias);
            aliasToContactMap[alias] = contact;
            getContactFromServer(contact);
        }


        logger.logMethodCompleted(arguments, contact, eLogLevel.finer);
        return contact;
    }

    function getContactByUserName(userName) {
        var logger = serviceLogger.logMethodCall(arguments, eLogLevel.finer);

        var contact = userNameToContactMap[userName];
        if (!contact) {
            contact = Contact.createFromUserName(userName);
            userNameToContactMap[userName] = contact;
            getContactFromServer(contact);
        }
        logger.logMethodCompleted(arguments, contact, eLogLevel.finer);
        return contact;
    }

    function getContactByContactId(contactId) {

        var logger = serviceLogger.logMethodCall(arguments, eLogLevel.finer);

        var contact;
        if (contactId.idType.value == eIdType.alias.value) {
            contact = getContactByAlias(contactId.id);
        } else if (contactId.idType.value == eIdType.userName.value) {
            contact = getContactByUserName(contactId.id);
        } else {
            logger.fine("WARNING! Unexpected contact id type - ", contactId.idType.name);
        }
        logger.logMethodCompleted(arguments, contact, eLogLevel.finer);
        return contact;
    }



    function addOrUpdateContact(contact) {

        var logger = serviceLogger.logMethodCall(arguments, eLogLevel.finer);


        var existingContacts = getObjectsReferringSameContact(contact);
        var aliases = getAliasesOfContacts(existingContacts);
        if (contact.internal.type.isGroup) {
            for (var i = 0; i < existingContacts.length; i++) {
                var existingContact = existingContacts[i];
                if (existingContact.internal.type == eContactType.user) {
                    var tmpContact = Contact.createFromAlias(alias);
                    outdatedContact.contact = tmpContact.contact;
                    outdatedContact.internal = tmpContact.internal;
                    getContactFromServerByAlias(alias);
                }
            }
        }
        for (var i = 0; i < aliases.length; i++) {
            var alias = aliases[i];
            if (!contact.hasAlias(alias)) {
                var outdatedContact = aliasToContactMap[alias];
                if (outdatedContact.internal.type != eContactType.unknown) {
                    var tmpContact = Contact.createFromAlias(alias);
                    outdatedContact.contact = tmpContact.contact;
                    outdatedContact.internal = tmpContact.internal;
                    getContactFromServerByAlias(alias);
                }
            }
        }

        contact = putContactToMaps(contact);

        if (contact.internal.persistent) {
            storageSrv.addOrUpdate(getCurrentUserName(), "contactSrv:contact", contact.getContactId().toString(), contact);
        }
        logger.logMethodCompleted(arguments, contact, eLogLevel.finer);
        return contact;
    }

    function addOrUpdateContactWithGroupInfo(groupInfo) {

        var logger = serviceLogger.logMethodCall(arguments, eLogLevel.finer);

        var contact = Contact.createFromServerGroupInfo(groupInfo);
        contact = addOrUpdateContact(contact);

        logger.logMethodCompleted(arguments, contact, eLogLevel.finer);

        return contact;
    }

    function addOrUpdateContactWithContactInfo(contactInfo, presenceInfo) {

        var logger = serviceLogger.logMethodCall(arguments, eLogLevel.finer);

        var picture = pictureSrv.getPicture(contactInfo.userName, contactInfo.imageSignature)
        var contact = Contact.createFromServerContactInfo(contactInfo, presenceInfo, pictureSrv);
        contact = addOrUpdateContact(contact);

        logger.logMethodCompleted(arguments, contact, eLogLevel.finer);

        return contact;
    }


    function persist(contact) {

        var logger = serviceLogger.logMethodCall(arguments, eLogLevel.finer);

        if (!contact.internal.persistent) {
            storageSrv.addOrUpdate(getCurrentUserName(), "contactSrv:contact", contact.getContactId().toString(), contact);
            contact.internal.persistent = true;
        }

        logger.logMethodCompleted(arguments, getMembers(), eLogLevel.finer);

    }



    function updateContactPresence(presence) {
        var logger = serviceLogger.logMethodCall(arguments, eLogLevel.finer);

        var contact;

        if (presence.idType === "userID") {
            contact = userNameToContactMap[presence.device.deviceIdentifier];
        } else {
            contact = aliasToContactMap[presence.device.deviceIdentifier];
            if (!contact) {
                contact = userNameToContactMap[presence.device.deviceIdentifier];
            }
        }

        if (contact) {
            contact.internal.status = UserStatusInfo.fromCstaPresenceState(presence.presenceState);
        }

        logger.logMethodCompleted(arguments, getMembers(), eLogLevel.finer);
    }


    function getObjectsReferringSameContact(contact) {

        var logger = serviceLogger.logMethodCall(arguments, eLogLevel.finer);


        var contacts = [];
        var contactInfo = contact.contact;
        if (contactInfo.aliases && contactInfo.aliases.length > 0) {
            for (var i = 0; i < contactInfo.aliases.length; i++) {
                var alias = contactInfo.aliases[i].completeAliasName;
                var contact = aliasToContactMap[alias];
                if (contact && !contacts.includes(contact)) {
                    contacts.push(contact);
                }
            }
        }
        if (contactInfo.extAliases && contactInfo.extAliases.length) {
            for (var i = 0; i < contactInfo.extAliases.length; i++) {
                var alias = contactInfo.extAliases[i];
                var contact = aliasToContactMap[alias];
                if (contact && !contacts.includes(contact)) {
                    contacts.push(contact);
                }
            }
        }
        var contactType = Contact.getContactTypeFromServerContactInfo(contactInfo);

        if (contactType == eContactType.user && contactInfo.userName) {
            var contact = userNameToContactMap[contactInfo.userName];
            if (contact && !contacts.includes(contact)) {
                contacts.push(contact);
            }
        }


        logger.logMethodCompleted(arguments, contact, eLogLevel.finer);
        return contacts;
    }


    function getAliasesOfContacts(contactList) {

        var logger = serviceLogger.logMethodCall(arguments, eLogLevel.finer);

        var aliases = [];
        var map = {};
        for (var i = 0; i < contactList.length; i++) {
            var contact = contactList[i];
            var contactInfo = contact.contact;
            if (contactInfo.aliases && contactInfo.aliases.length > 0) {
                for (var i = 0; i < contactInfo.aliases.length; i++) {
                    var alias = contactInfo.aliases[i].completeAliasName;
                    if (!map[alias]) {
                        aliases.push(alias);
                        map[alias] = true;
                    }
                }
            }
            if (contactInfo.extAliases && contactInfo.extAliases.length) {
                for (var i = 0; i < contactInfo.extAliases.length; i++) {
                    var alias = contactInfo.extAliases[i];
                    if (!map[alias]) {
                        aliases.push(alias);
                        map[alias] = true;
                    }
                }
            }
        }
        logger.logMethodCompleted(arguments, aliases, eLogLevel.finer);

        return aliases;
    }

    function onFavoriteModified(contact) {

        var logger = serviceLogger.logMethodCall(arguments, eLogLevel.finer);

        var contactList = getObjectsReferringSameContact(contact);
        for (var i = 0; i < contactList.length; i++) {
            if (contactList[i] !== contact) {
                contactList[i].internal.isFav = contact.internal.isFav;
            }
        }

        logger.logMethodCompleted(arguments, getMembers(), eLogLevel.finer);
    }

    function refreshPresence(contactList) {

        var logger = serviceLogger.logMethodCall(arguments, eLogLevel.finer);

        var userNameList = [];
        var aliasList = [];

        for (var i = 0; i < contactList.length; i++) {
            var contact = contactList[i];
            if (contact.internal.type == eContactType.user) {
                userNameList.push(contact.contact.userName);
            } else if (contact.internal.type.isGroup) {
                aliasList.push(contact.getAlias());
            }
        }

        if (userNameList.length > 0 || aliasList.length > 0) {
            var request = {
                GetPresences: {
                    userIDList: userNameList,
                    aliasList: aliasList
                }
            };
            infoSrv.sendRequest(request);
        }

        logger.logMethodCompleted(arguments, getMembers(), eLogLevel.finer);
    }

    function onContactResponse(event, contactList) {

        var logger = serviceLogger.logMethodCall(arguments, eLogLevel.finer);

        try {
            if (contactList.length) {
                for (var i = 0; i < contactList.length; i++) {
                    var contactInfo = contactList[i];
                    var contact = addOrUpdateContactWithContactInfo(contactInfo);
                    $rootScope.$broadcast("contactSrv:contactUpdated", contact);
                }
            }
        } catch (err) {
            logger.error(err);
        }



        logger.logMethodCompleted(arguments, getMembers(), eLogLevel.finer);
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

    function onLoggedIn(event, loggedInWithEndpoint) {
        var logger = serviceLogger.logMethodCall(arguments, eLogLevel.finer);

        try {
            if (loggedInWithEndpoint) {
                loadPersistedContacts();
            }
        } catch (err) {
            logger.error(err);
        }



        logger.logMethodCompleted(arguments, getMembers(), eLogLevel.finer);
    }

    function onPictureUpdated(event, userName, pictureInfo) {
        var logger = serviceLogger.logMethodCall(arguments, eLogLevel.finer);

        try {
            var contact = userNameToContactMap[userName];
            if (contact) {
                var contactList = getObjectsReferringSameContact(contact);
                for (var i = 0; i < contactList.length; i++) {
                    var c = contactList[i];
                    c.contact.imageSignature = pictureInfo.signature;
                    c.internal.img = pictureInfo.picture;
                    c.internal.imgBig = pictureInfo.picture;
                }
            }
        } catch (err) {
            logger.error(err);
        }

        logger.logMethodCompleted(arguments, getMembers(), eLogLevel.finer);
    }

    function onPresenceStateEvent(event, presence) {
        var logger = serviceLogger.logMethodCall(arguments, eLogLevel.finer);

        try {
            updateContactPresence(presence);
        } catch (err) {
            logger.error(err);
        }



        logger.logMethodCompleted(arguments, getMembers(), eLogLevel.finer);
    }

    function onPresencesListResponse(event, presenceList) {
        var logger = serviceLogger.logMethodCall(arguments, eLogLevel.finer);

        try {
            for (var i = 0; i < presenceList.length; i++) {
                var presence = presenceList[i];
                updateContactPresence(presence);

            }
        } catch (err) {
            logger.error(err);
        }

        logger.logMethodCompleted(arguments, getMembers(), eLogLevel.finer);
    }

    function getPhoneContacts(filter, start, number) {
        var logger = serviceLogger.logMethodCall(arguments, eLogLevel.finer);

        var contacts = []
        var arr = JSBridge.getPhoneContacts(start,number);
        if (!arrayUtils.isEmpty(arr)) {
            for(var i=0;i<arr.length;i++) {
                var contactInfo = arr[i];
                var contact = Contact.createExternal(contactInfo.displayName, contactInfo.phoneNumbers);
                contacts.push(contact);
            }
        }

        return contacts;
        logger.logMethodCompleted(arguments, contacts, eLogLevel.finer);
    }




    $rootScope.$on("infoSrv:PresenceStateEvent", onPresenceStateEvent);
    $rootScope.$on("presencesList:update", onPresencesListResponse);
    $rootScope.$on("pictureSrv:pictureUpdated", onPictureUpdated);
    $rootScope.$on("infoSrv:contactResponse", onContactResponse);
    $rootScope.$on("loginSrv:loggedOut", onLoggedOut);
    $rootScope.$on("loginSrv:loggedIn", onLoggedIn);


    this._loadPersistedContacts = loadPersistedContacts;
    this._getMembers = getMembers;
    this._resetMembers = resetMembers;
    this._getContactFromServerByAlias = getContactFromServerByAlias;
    this._getContactFromServerByUserName = getContactFromServerByUserName;
    this._getContactFromServer = getContactFromServer;
    this._putContactToMaps = putContactToMaps;
    this._isSearchableUserName = isSearchableUserName;
    this._getObjectsReferringSameContact = getObjectsReferringSameContact;
    this._getAliasesOfContacts = getAliasesOfContacts;
    this._addOrUpdateContact = addOrUpdateContact;
    this._updateContactPresence = updateContactPresence;

    this._onContactResponse = onContactResponse;
    this._onLoggedOut = onLoggedOut;
    this._onLoggedIn = onLoggedIn;
    this._onPictureUpdated = onPictureUpdated;
    this._onPresenceStateEvent = onPresenceStateEvent;
    this._onPresencesListResponse = onPresencesListResponse;

    this.getContactByAlias = getContactByAlias;
    this.getContactByUserName = getContactByUserName;
    this.getContactByContactId = getContactByContactId;
    this.addOrUpdateContactWithContactInfo = addOrUpdateContactWithContactInfo;
    this.addOrUpdateContactWithGroupInfo = addOrUpdateContactWithGroupInfo;
    this.onFavoriteModified = onFavoriteModified;
    this.persist = persist;
    this.refreshPresence = refreshPresence;
    this.getPhoneContacts = getPhoneContacts;

    //todo michael add releaseContact


}


var servicesModule = angular.module('aeonixApp.services');

servicesModule.service('contactSrv', ['$rootScope', 'infoSrv', 'pictureSrv', 'storageSrv', 'loginSrv', ContactSrv]);