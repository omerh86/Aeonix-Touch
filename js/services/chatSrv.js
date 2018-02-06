function ChatSrv($rootScope, infoSrv, contactSrv, loginSrv, storageSrv, utilsSrv, deviceSrv) {


    var serviceLogger = logSrv.getLogger("chatSrv");

    try {

        var chatList = [];

        var incomingEventQueue = [];

        var outgoingRequestQueue = [];

        var waitingForDetailsContact = null;

        var pendingOutgoingRequestInfo = null;

        var lastMessageNumber = 0;

        var lastOutgoingRequestNumber = 0;

        var lastIncomingEventNumber = 0;

        var unseenMessagesCounter = new CommonCounter();

        var counter = 0;



        function getCurrentUserName() {
            return loginSrv.getUserName();
        }

        function clearServicePersistentData() {
            storageSrv.removeAllValuesOfCategory(getCurrentUserName(), "chatSrv:message");
            storageSrv.removeAllValuesOfCategory(getCurrentUserName(), "chatSrv:incomingEvent");
            storageSrv.removeAllValuesOfCategory(getCurrentUserName(), "chatSrv:outgoingRequest");
        }

        function resetMembers() {
            chatList = [];
            incomingEventQueue = [];
            outgoingRequestQueue = [];
            waitingForDetailsContact = null;
            pendingOutgoingRequestInfo = null;
            lastMessageNumber = 0;
            lastOutgoingRequestNumber = 0;
            lastIncomingEventNumber = 0;
            unseenMessagesCounter.reset();
        }

        function getMembers() {
            var o = {
                "chatList": chatList,
                "incomingEventQueue": incomingEventQueue,
                "outgoingRequestQueue": outgoingRequestQueue,
                "waitingForDetailsContact": waitingForDetailsContact,
                "pendingOutgoingRequestInfo": pendingOutgoingRequestInfo,
                "lastMessageNumber": lastMessageNumber,
                "lastOutgoingRequestNumber": lastOutgoingRequestNumber,
                "lastIncomingEventNumber": lastIncomingEventNumber,
                "unseenMessagesCounter": unseenMessagesCounter
            };
            return o;
        }

        function startMonitorInstantMessages() {
            var request = new StartMonitorInstantMessages(getCurrentUserName());
            infoSrv.sendRequest(request);
        };

        function stopMonitorInstantMessages() {
            var request = new StopMonitorInstantMessages(getCurrentUserName());
            infoSrv.sendRequest(request);
        };

        function compareByNumber(obj1, obj2) {
            if (obj1.number < obj2.number)
                return -1;
            if (obj1.number > obj2.number)
                return 1;
            return 0;
        }

        function loadFromStorage() {
            var logger = serviceLogger.logMethodCall(arguments, eLogLevel.finer);

            var currentUserName = getCurrentUserName();
            var messageList = storageSrv.getAllValuesOfCategory(currentUserName, "chatSrv:message");
            if (messageList && messageList.length) {
                for (var i = 0; i < messageList.length; i++) {
                    var im = messageList[i];
                    var message = restoreMessageFromPersistentData(im);
                    if (message.number > lastMessageNumber) {
                        lastMessageNumber = message.number;
                    }

                }
            }

            for (var i = 0; i < chatList.length; i++) {
                chatList[i].sortMessagesByNumber();
                chatList[i].updateCalculatedFields();
            }

            chatList.sort(Chat.compareChatsByLastMessageTime);


            outgoingRequestQueue = storageSrv.getAllValuesOfCategory(currentUserName, "chatSrv:outgoingRequest");
            outgoingRequestQueue.sort(compareByNumber);
            if (outgoingRequestQueue.length > 0) {
                lastOutgoingRequestNumber = outgoingRequestQueue[outgoingRequestQueue.length - 1].number + 1;
            }

            incomingEventQueue = storageSrv.getAllValuesOfCategory(currentUserName, "chatSrv:incomingEvent");
            incomingEventQueue.sort(compareByNumber);
            if (incomingEventQueue.length > 0) {
                lastIncomingEventNumber = incomingEventQueue[incomingEventQueue.length - 1].number + 1;
            }

            logger.logMethodCompleted(arguments, getMembers(), eLogLevel.finer);
        }

        function restoreMessageFromPersistentData(im) {
            var logger = serviceLogger.logMethodCall(arguments, eLogLevel.finer);

            var chat = findOrAddChatByIM(im);
            var sendingContact = getSendingContact(im);
            var message = chat.addMessage(im.number, im.time, im, sendingContact, isOwnMessage(im), unseenMessagesCounter);
            logger.logMethodCompleted(arguments, message, eLogLevel.finer);
            return message;
        }

        function isGroupChat(im) {
            var logger = serviceLogger.logMethodCall(arguments, eLogLevel.finer);

            var result = (im.imEntity.destination.type !== "User");

            logger.finer("isGroupChat completed - ", result);
            return result;
        }

        function isOwnMessage(im) {
            var logger = serviceLogger.logMethodCall(arguments, eLogLevel.finer);

            var result = im.imEntity.sendingUser === getCurrentUserName();

            logger.finer("isOwnMessage completed - ", result);
            return result;
        }

        function isEchoMessage(im) {
            var logger = serviceLogger.logMethodCall(arguments, eLogLevel.finer);

            var echo = false;
            if (isOwnMessage(im)) {
                if (pendingOutgoingRequestInfo) {
                    if (im.imEntity.message === pendingOutgoingRequestInfo.SendInstantMessage.messageContent) {
                        var now = new Date().getTime();
                        if (now - pendingOutgoingRequestInfo.time < 5000) {
                            echo = true;
                        }
                    }
                }
            }

            logger.finer("isEchoMessage completed - ", echo);
            return echo;
        }

        function getSendingContact(im) {
            var logger = serviceLogger.logMethodCall(arguments, eLogLevel.finer);

            var result = contactSrv.getContactByUserName(im.imEntity.sendingUser);

            logger.logMethodCompleted(arguments, result, eLogLevel.finer);
            return result;
        }

        function getChatContact(im) {
            var logger = serviceLogger.logMethodCall(arguments, eLogLevel.finer);

            var chatContact;
            if (isGroupChat(im)) {
                chatContact = contactSrv.getContactByAlias(im.imEntity.destination.value);
            } else {
                chatContact = contactSrv.getContactByUserName(im.imEntity.sendingUser);
            }

            logger.logMethodCompleted(arguments, chatContact, eLogLevel.finer);
            return chatContact;
        }

        function checkForUnknownContact(im) {
            var logger = serviceLogger.logMethodCall(arguments, eLogLevel.finer);

            var chatContact = getChatContact(im);
            var sendingContact = getSendingContact(im);
            var unknownContact;
            if (chatContact.internal.type == eContactType.unknown) {
                unknownContact = chatContact;
            } else if (sendingContact.internal.type == eContactType.unknown) {
                unknownContact = chatContact;
            }
            logger.logMethodCompleted(arguments, unknownContact, eLogLevel.finer);
            return unknownContact;
        }

        function getChatList() {
            return chatList;
        }

        function getUnseenMessagesCounter() {
            return unseenMessagesCounter;
        }

        function getOrAddChat(contact) {
            var logger = serviceLogger.logMethodCall(arguments, eLogLevel.finer);

            var chat = findChatByContact(contact);
            if (!chat) {
                contactSrv.persist(contact);
                chat = new Chat(contact);
                chatList.unshift(chat);
            }

            logger.logMethodCompleted(arguments, chat, eLogLevel.finer);
            return chat;
        }

        function findChatByContact(contact) {
            var logger = serviceLogger.logMethodCall(arguments, eLogLevel.finer);

            var chat;
            var alias = contact.getAlias();
            if (alias) {
                chat = findChatByAlias(alias);
            } else if (contact.contact.userName) {
                chat = findChatByUserName(contact.contact.userName);
            }

            logger.logMethodCompleted(arguments, chat, eLogLevel.finer);
            return chat;
        }

        function findChatByMessageId(id) {
            var logger = serviceLogger.logMethodCall(arguments, eLogLevel.finer);

            var foundChat;
            for (var i = 0; i < chatList.length; i++) {
                var chat = chatList[i];
                var message = chat.findMessageById(id);
                if (message) {
                    foundChat = chat;
                    break;
                }
            }
            logger.logMethodCompleted(arguments, foundChat, eLogLevel.finer);
            return foundChat;
        }

        function findChatByAlias(alias) {
            var logger = serviceLogger.logMethodCall(arguments, eLogLevel.finer);

            var foundChat;
            for (var i = 0; i < chatList.length; i++) {
                var chat = chatList[i];
                if (chat.contact.hasAlias(alias)) {
                    foundChat = chat;
                    break;
                }
            }
            logger.logMethodCompleted(arguments, foundChat, eLogLevel.finer);
            return foundChat;
        }

        function findChatByUserName(userName) {
            var logger = serviceLogger.logMethodCall(arguments, eLogLevel.finer);

            var foundChat;
            for (var i = 0; i < chatList.length; i++) {
                var chat = chatList[i];
                if (chat.contact.contact.userName === userName) {
                    foundChat = chat;
                    break;
                }
            }
            logger.logMethodCompleted(arguments, foundChat, eLogLevel.finer);
            return foundChat;
        }

        function findChatByDestinationInfo(destinationInfo) {
            var logger = serviceLogger.logMethodCall(arguments, eLogLevel.finer);

            var chat;
            if (destinationInfo.type == "Group") {
                chat = findChatByAlias(destinationInfo.value);
            } else {
                chat = findChatByUserName(destinationInfo.value);
            }

            logger.logMethodCompleted(arguments, chat, eLogLevel.finer);
            return chat;
        }


        function findOrAddChatByIM(im) {
            var logger = serviceLogger.logMethodCall(arguments, eLogLevel.finer);

            var chat = findChatByMessageId(im.messageId);
            if (!chat) {
                if (isGroupChat(im)) {
                    chat = findChatByAlias(im.imEntity.destination.value);
                } else {
                    chat = findChatByUserName(im.imEntity.sendingUser);
                }
                if (!chat) {
                    var chatContact = getChatContact(im);
                    contactSrv.persist(chatContact);
                    chat = new Chat(chatContact);
                    chatList.unshift(chat);
                }
            }

            logger.logMethodCompleted(arguments, chat, eLogLevel.finer);
            return chat;
        }

        function addOutgoingRequestToQueue(request, message) {
            var logger = serviceLogger.logMethodCall(arguments, eLogLevel.finer);

            var time = new Date().getTime();
            lastOutgoingRequestNumber++;
            var requestInfo = {
                request: request,
                number: lastOutgoingRequestNumber,
                messageNumber: message.number,
                time: time
            }
            outgoingRequestQueue.push(requestInfo);
            storageSrv.addOrUpdate(getCurrentUserName(), "chatSrv:outgoingRequest", requestInfo.number, requestInfo);
            checkOutgoingRequestQueue();

            logger.logMethodCompleted(arguments, getMembers(), eLogLevel.finer);
        }

        function putOutgoingRequestInQueue(request, messageNumber) {
            var logger = serviceLogger.logMethodCall(arguments, eLogLevel.finer);

            lastOutgoingRequestNumber++;
            var r = {
                "request": request,
                "messageNumber": messageNumber,
                "requestNumber": lastOutgoingRequestNumber
            }
            outgoingRequestQueue.push(r);
            checkOutgoingRequestQueue();

            logger.logMethodCompleted(arguments, getMembers(), eLogLevel.finer);
        }

        function removePendingOutgoingRequest() {
            var logger = serviceLogger.logMethodCall(arguments, eLogLevel.finer);

            storageSrv.remove(getCurrentUserName(), "chatSrv:outgoingRequest", pendingOutgoingRequestInfo.number);
            pendingOutgoingRequestInfo = null;
            outgoingRequestQueue.splice(0, 1);
            checkOutgoingRequestQueue();

            logger.logMethodCompleted(arguments, getMembers(), eLogLevel.finer);
        }

        function updateOutgoingRequestsWithMessageId(messageNumber, messageId) {
            var logger = serviceLogger.logMethodCall(arguments, eLogLevel.finer);

            for (var i = 0; i < outgoingRequestQueue.length; i++) {
                var requestInfo = outgoingRequestQueue[i];
                var request = requestInfo.request;
                if (request.messageNumber == pendingOutgoingRequestInfo.messageNumber && request.hasOwnProperty("messageId")) {
                    request.messageId = messageId;
                }
                storageSrv.addOrUpdate(getCurrentUserName(), "chatSrv:outgoingRequest", requestInfo.number, requestInfo);
            }

            logger.logMethodCompleted(arguments, getMembers(), eLogLevel.finer);
        }

        function checkOutgoingRequestQueue() {
            var logger = serviceLogger.logMethodCall(arguments, eLogLevel.finer);

            var connected = loginSrv.getState() == eLoginState.loggedIn && loginSrv.isLoggedInWithEndpoint();
            if (connected && !pendingOutgoingRequestInfo && outgoingRequestQueue.length > 0) {
                pendingOutgoingRequestInfo = outgoingRequestQueue[0];
                var request = pendingOutgoingRequestInfo.request;
                var dropRequest = false;
                if (request.hasOwnProperty("messageId")) {
                    dropRequest = pendingOutgoingRequestInfo.messageId && pendingOutgoingRequestInfo.messageId != "";
                }
                if (!dropRequest) {
                    infoSrv.sendRequest(request);
                } else {
                    removePendingOutgoingRequest();
                }
            }
            logger.logMethodCompleted(arguments, getMembers(), eLogLevel.finer);
        }



        function removeMessage(chat, message) {
            var logger = serviceLogger.logMethodCall(arguments, eLogLevel.finer);

            chat.removeMessage(message, unseenMessagesCounter);
            storageSrv.remove(getCurrentUserName(), "chatSrv:message", message.number);
            var markInstantMessageDeleted = new MarkInstantMessageDeleted(getCurrentUserName(), message.id);
            putOutgoingRequestInQueue(markInstantMessageDeleted);

            logger.logMethodCompleted(arguments, getMembers(), eLogLevel.finer);
        }

        function removeMessages(chat, messageList) {
            var logger = serviceLogger.logMethodCall(arguments, eLogLevel.finer);

            for (var i = 0; i < messageList.length; i++) {
                var message = messageList[i];
                removeMessage(chat, message);
            }

            logger.logMethodCompleted(arguments, getMembers(), eLogLevel.finer);
        }

        function removeChat(chat) {
            var logger = serviceLogger.logMethodCall(arguments, eLogLevel.finer);

            if (chat.messageList.length > 0) {
                var messageList = chat.messageList.slice(0);
                removeMessages(chat, messageList);
            }
            var index = chatList.indexOf(chat);
            chatList.splice(index, 1);

            logger.logMethodCompleted(arguments, getMembers(), eLogLevel.finer);
        }

        function markMessageAsSeen(chat, message) {
            var logger = serviceLogger.logMethodCall(arguments, eLogLevel.finer);

            message.seen = true;
            storageSrv.addOrUpdate(getCurrentUserName(), "chatSrv:message", message.number, message);

            logger.logMethodCompleted(arguments, getMembers(), eLogLevel.finer);
        }

        function markMessagesAsSeen(chat, messageList) {
            var logger = serviceLogger.logMethodCall(arguments, eLogLevel.finer);

            for (var i = 0; i < messageList.length; i++) {
                var message = messageList[i];
                removeMessage(chat, message);
            }

            logger.logMethodCompleted(arguments, getMembers(), eLogLevel.finer);
        }

        function sendMessage(chat, messageText) {
            var logger = serviceLogger.logMethodCall(arguments, eLogLevel.finer);

            lastMessageNumber++;


            var sendingContact = contactSrv.getContactByUserName(getCurrentUserName());

            var time = new Date().getTime();
            var destination = chat.getIMDestination();
            var im = {
                "imEntity": {
                    "destination": destination,
                    "message": messageText,
                    "sendingUser": getCurrentUserName(),
                    "time": time
                },
                "messageId": undefined,
                "read": true,
                "remove": false,
            };
            var message = chat.addMessage(lastMessageNumber, new Date().getTime(), im, sendingContact, true);
            var sendInstantMessageRequest = new SendInstantMessage(getCurrentUserName(), loginSrv.getEndpointId(), destination, messageText);
            putOutgoingRequestInQueue(sendInstantMessageRequest, lastMessageNumber);


            logger.logMethodCompleted(arguments, getMembers(), eLogLevel.finer);
        }

        function processServerIMEvent(im) {
            var logger = serviceLogger.logMethodCall(arguments, eLogLevel.finer);

            var chat = findOrAddChatByIM(im);
            var message = chat.findMessageById(im.messageId);
            var sendingContact = getSendingContact(im);
            contactSrv.persist(sendingContact);
            if (!message) {
                if (!im.remove) {
                    lastMessageNumber++;
                    message = chat.addMessage(lastMessageNumber, new Date().getTime(), im, sendingContact, isOwnMessage(im), unseenMessagesCounter);
                    chatList.sort(Chat.compareChatsByLastMessageTime);
                    if (!message.isOwnMessage && !deviceSrv.getIsAppInBackground() && chat.shown && !im.read) {
                        chat.markMessageAsSeen(message, unseenMessagesCounter);
                        var markInstantMessageRead = new MarkInstantMessageRead(getCurrentUserName(), loginSrv.getEndpointId(), message.id);
                        putOutgoingRequestInQueue(markInstantMessageRead);
                    }
                    storageSrv.addOrUpdate(getCurrentUserName(), "chatSrv:message", message.number, message);
                }
            } else {
                if (im.remove) {
                    chat.removeMessage(message, unseenMessagesCounter);
                    storageSrv.remove(getCurrentUserName(), "chatSrv:message", message.number);

                    if (chat.messageList.length == 0 && chat.textTyped == "" && !chat.shown) {
                        removeChat(chat);
                    }
                } else if (!message.isOwnMessage && im.read) {
                    chat.markMessageAsSeen(message, unseenMessagesCounter);
                    storageSrv.addOrUpdate(getCurrentUserName(), "chatSrv:message", message.number, message);
                }
            }


            logger.logMethodCompleted(arguments, message, eLogLevel.finer);
            return message;
        }

        function checkIncomingIMEventQueue() {
            var logger = serviceLogger.logMethodCall(arguments, eLogLevel.finer);

            var counterOldValue = unseenMessagesCounter.counter;
            if (counter <= 3) {
                while (!waitingForDetailsContact && incomingEventQueue.length > 0) {
                    var imInfo = incomingEventQueue[0];
                    var im = imInfo.im;
                    waitingForDetailsContact = checkForUnknownContact(im);
                    if (!waitingForDetailsContact) {
                        incomingEventQueue.splice(0, 1);
                        storageSrv.remove(getCurrentUserName(), "chatSrv:incomingEvent", imInfo.number);
                        var message = processServerIMEvent(im);
                    } else {
                        counter++;
                    }
                }
            }

            var counterNewValue = unseenMessagesCounter.counter;

            if (counterNewValue != counterOldValue) {
                $rootScope.$broadcast("chatSrv:unseenMessagesCounterChanged", counterNewValue, counterOldValue);
            }

            logger.logMethodCompleted(arguments, getMembers(), eLogLevel.finer);

        }

        function onAppVisibilityChanged(event, appInBackground) {
            var logger = serviceLogger.logMethodCall(arguments, eLogLevel.finer);
            try {
                if (!appInBackground) {
                    for (var i = 0; i < chatList.length; i++) {
                        var chat = chatList[i];
                        if (chat.shown) {
                            markAllMessagesAsSeen(chat);
                        }
                    }
                }
            } catch (err) {
                logger.error(err);
            }

            logger.logMethodCompleted(arguments, getMembers(), eLogLevel.finer);
        }

        function markAllMessagesAsSeen(chat) {
            var messages = chat.markAllMessagesAsSeen(unseenMessagesCounter);
            if (messages.length > 0) {
                for (var i = 0; i < messages.length; i++) {
                    var message = messages[i];
                    var markInstantMessageRead = new MarkInstantMessageRead(getCurrentUserName(), loginSrv.getEndpointId(), message.id);
                    putOutgoingRequestInQueue(markInstantMessageRead);
                    storageSrv.addOrUpdate(getCurrentUserName(), "chatSrv:message", message.number, message);
                }
                $rootScope.$broadcast("chatSrv:unseenMessagesCounterChanged", unseenMessagesCounter.counter);
            }

        }

        function onChatShown(chat) {
            chat.shown = true;
            if (!deviceSrv.getIsAppInBackground()) {
                markAllMessagesAsSeen(chat);
            }
        }

        function onChatHidden(chat) {
            chat.shown = false;
        }

        function onLoggedOut() {
            var logger = serviceLogger.logMethodCall(arguments, eLogLevel.finer);

            try {
                resetMembers();
            } catch (err) {
                logger.error(err);
            }



            logger.logMethodCompleted(arguments, getMembers(), eLogLevel.finer);
        }

        function onLoggingOut() {
            var logger = serviceLogger.logMethodCall(arguments, eLogLevel.finer);

            try {
                if (loginSrv.isLoggedInWithEndpoint()) {
                    stopMonitorInstantMessages();
                }
            } catch (err) {
                logger.error(err);
            }



            logger.logMethodCompleted(arguments, getMembers(), eLogLevel.finer);
        }

        function onLoggedIn() {
            var logger = serviceLogger.logMethodCall(arguments, eLogLevel.finer);

            try {
                if (loginSrv.getState() == eLoginState.loggedIn && loginSrv.isLoggedInWithEndpoint()) {
                    startMonitorInstantMessages();
                    loadFromStorage();
                    checkIncomingIMEventQueue();
                    checkOutgoingRequestQueue();
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
                    startMonitorInstantMessages();
                    if (waitingForDetailsContact) {
                        contactSrv.getContactByContactId(waitingForDetailsContact.getContactId());
                    } else {
                        checkIncomingIMEventQueue();
                    }
                    if (pendingOutgoingRequestInfo) {
                        sendIMRequestToServer(pendingOutgoingRequestInfo);
                    } else {
                        checkOutgoingRequestQueue();
                    }
                }
            } catch (err) {
                logger.error(err);
            }



            logger.logMethodCompleted(arguments, getMembers(), eLogLevel.finer);
        }

        function onInstantMessage(event, im) {
            var logger = serviceLogger.logMethodCall(arguments, eLogLevel.finer);

            try {
                if (!isEchoMessage(im)) {
                    lastIncomingEventNumber++;
                    var imInfo = {
                        number: lastIncomingEventNumber,
                        im: im
                    }
                    incomingEventQueue.push(imInfo);
                    storageSrv.addOrUpdate(getCurrentUserName(), "chatSrv:incomingEvent", imInfo.number, imInfo);
                    checkIncomingIMEventQueue();
                } else {
                    logger.finer("echo message");
                }
            } catch (err) {
                logger.error(err);
            }



            logger.logMethodCompleted(arguments, getMembers(), eLogLevel.finer);
        }

        function onSendInstantMessageResponse(event, response) {
            var logger = serviceLogger.logMethodCall(arguments, eLogLevel.finer);

            try {
                if (pendingOutgoingRequestInfo) {
                    var request = pendingOutgoingRequestInfo.request;
                    var chat = findChatByDestinationInfo(request.SendInstantMessage.destination);
                    if (chat) {
                        var message = chat.findMessageByNumber(pendingOutgoingRequestInfo.messageNumber);
                        if (message) {
                            if (response.errCode == 0) {
                                var messageId = "" + response.messageID;
                                chat.setMessageId(message, messageId);
                                message.status = eIMStatus.sent;
                                updateOutgoingRequestsWithMessageId(pendingOutgoingRequestInfo.messageNumber, messageId);
                            } else {
                                message.status = eIMStatus.sendFailed;
                            }
                            storageSrv.addOrUpdate(getCurrentUserName(), "chatSrv:message", message.number, message);
                        } else {
                            logger.finer("The corresponding chat message not found. Searched with messageNumber=", pendingOutgoingRequestInfo.messageNumber);
                        }
                    } else {
                        logger.finer("The corresponding chat not found");
                    }
                    removePendingOutgoingRequest();
                } else {
                    logger.finer("The corresponding pending SendInstantMessage not found.");
                }
            } catch (err){
                logger.error(err);
            }


            logger.logMethodCompleted(arguments, getMembers(), eLogLevel.finer);
        }

        function onMarkInstantMessageResponse(event, response) {
            var logger = serviceLogger.logMethodCall(arguments, eLogLevel.finer);

            try {
                if (pendingOutgoingRequestInfo) {
                    pendingOutgoingRequestInfo = null;
                    outgoingRequestQueue.splice(0, 1);
                    checkOutgoingRequestQueue();
                }
            } catch (err) {
                logger.error(err);
            }



            logger.logMethodCompleted(arguments, getMembers(), eLogLevel.finer);
        }

        function onContactUpdated(event, contact) {
            var logger = serviceLogger.logMethodCall(arguments, eLogLevel.finer);

            try {
                if (waitingForDetailsContact && waitingForDetailsContact.sameContact(contact)) {
                    waitingForDetailsContact = null;
                    checkIncomingIMEventQueue();
                }
            } catch (err) {
                logger.error(err);
            }



            logger.logMethodCompleted(arguments, getMembers(), eLogLevel.finer);
        }


        $rootScope.$on("loginSrv:loggingOut", onLoggingOut);
        $rootScope.$on("loginSrv:loggedOut", onLoggedOut);
        $rootScope.$on("loginSrv:loggedIn", onLoggedIn);
        $rootScope.$on("loginSrv:connectionRestored", onConnectionRestored);
        $rootScope.$on("infoSrv:InstantMessage", onInstantMessage);
        $rootScope.$on("infoSrv:SendInstantMessageResponse", onSendInstantMessageResponse);
        $rootScope.$on("infoSrv:MarkInstantMessageResponse", onMarkInstantMessageResponse);
        $rootScope.$on("contactSrv:contactUpdated", onContactUpdated);
        $rootScope.$on("deviceSrv:appVisibilityChanged", onAppVisibilityChanged);


        this._getCurrentUserName = getCurrentUserName;
        this._clearServicePersistentData = clearServicePersistentData;
        this._resetMembers = resetMembers;
        this._getMembers = getMembers;
        this._startMonitorInstantMessages = startMonitorInstantMessages;
        this._stopMonitorInstantMessages = stopMonitorInstantMessages;
        this._compareByNumber = compareByNumber;
        this._loadFromStorage = loadFromStorage;
        this._restoreMessageFromPersistentData = restoreMessageFromPersistentData;
        this._isGroupChat = isGroupChat;
        this._isOwnMessage = isOwnMessage;
        this._isEchoMessage = isEchoMessage;
        this._getSendingContact = getSendingContact;
        this._getChatContact = getChatContact;
        this._checkForUnknownContact = checkForUnknownContact;

        this._findChatByAlias = findChatByAlias;
        this._findChatByUserName = findChatByUserName;
        this._findChatByDestinationInfo = findChatByDestinationInfo;
        this._findOrAddChatByIM = findOrAddChatByIM;
        this._addOutgoingRequestToQueue = addOutgoingRequestToQueue;
        this._putOutgoingRequestInQueue = putOutgoingRequestInQueue;
        this._removePendingOutgoingRequest = removePendingOutgoingRequest;
        this._updateOutgoingRequestsWithMessageId = updateOutgoingRequestsWithMessageId;
        this._checkOutgoingRequestQueue = checkOutgoingRequestQueue;

        this._markMessageAsSeen = markMessageAsSeen;
        this._markMessagesAsSeen = markMessagesAsSeen;
        this._processServerIMEvent = processServerIMEvent;
        this._checkIncomingIMEventQueue = checkIncomingIMEventQueue;
        this._onLoggedOut = onLoggedOut;
        this._onLoggingOut = onLoggingOut;
        this._onLoggedIn = onLoggedIn;
        this._onConnectionRestored = onConnectionRestored;
        this._onInstantMessage = onInstantMessage;
        this._onSendInstantMessageResponse = onSendInstantMessageResponse;
        this._onMarkInstantMessageResponse = onMarkInstantMessageResponse;
        this._onContactUpdated = onContactUpdated;
        this._onAppVisibilityChanged = onAppVisibilityChanged;

        this.markAllMessagesAsSeen = markAllMessagesAsSeen;
        this.onChatShown = onChatShown;
        this.onChatHidden = onChatHidden;
        this.getUnseenMessagesCounter = getUnseenMessagesCounter;
        this.getChatList = getChatList;
        this.findChatByContact = findChatByContact;
        this.getOrAddChat = getOrAddChat;
        this.sendMessage = sendMessage;
        this.removeMessage = removeMessage;
        this.removeMessages = removeMessages;
        this.removeChat = removeChat;

        serviceLogger.fine("chatSrv service has been create successfully")
    } catch (err){
        serviceLogger.error(err);
    }
}



var servicesModule = angular.module('aeonixApp.services');
servicesModule.service('chatSrv', ['$rootScope', 'infoSrv', 'contactSrv', 'loginSrv', 'storageSrv', 'utilsSrv', 'deviceSrv', ChatSrv]);