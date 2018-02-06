function Message(messageNumber, messageTime, im, destination, sendingContact, isOwnMessage) {
    this.number = messageNumber;
    this.id = im.messageId;
    if (im.remove!=undefined) {
        this.removed = im.remove;
    }else {
        this.removed = false;
    }

    if (im.read!=undefined) {
        this.seen = im.read;
    }else {
        this.seen = undefined;
    }
    this.messageText = im.imEntity.message;
    this.time = messageTime;
    this.sendingContact = sendingContact;
    this.destination = destination;
    this.isOwnMessage = isOwnMessage;
    this.selected = false;
}


Message.compareMessagesByNumber = function(message1, message2) {
    if (message1.number < message2.number)
        return -1;
    if (message1.number > message2.number)
        return 1;
    return 0;
}


Message.prototype.toJSON = function() {
      var obj = {
        "imEntity": {
          "destination": this.destination,
          "message": this.messageText,
          "sendingUser": this.sendingContact.contact.userName,
        },
        "time": this.time,
        "number":this.number,
        "messageId": this.id,
        "read": this.seen,
        "remove": this.removed
      };
      return obj;
}



function Chat(contact) {
    this.contact = contact;
    this.messageList = [];
    this.idToMessageMap = {};
    this.numberToMessageMap = {};
    this.lastMessageTime = 0;
    this.lastMessageNumber = 0;

    this.isSearchMode = false;
    this.searchTerm = '';
    this.isEditMode = false;
    this.textTyped = '';
    this.numOfSelected = 0;
    this.allSelected = false;
    this.lastMessage = "";
    this.numberOfUnseenMessages = 0;
    this.unseenMessages = [];
    this.shown = false;
}

Chat.prototype.updateCalculatedFields = function() {
    if (this.messageList.length>0) {
        this.lastMessage = this.messageList[this.messageList.length-1].messageText;
        this.lastMessageTime = this.messageList[this.messageList.length-1].time;
        this.lastMessageNumber = this.messageList[this.messageList.length-1].lastMessageNumber;
    }else {
        this.lastMessage="";
        this.lastMessageTime=0;
        this.lastMessageNumber = 0;
    }
};

Chat.prototype.onTextTypedChanged = function(id, oldval, newval) {
  this.updateCalculatedFields();
}

Chat.prototype.selectMessage = function (message) {
   var select = !message.selected;
   message.selected = !message.selected;
   if(select){
       this.numOfSelected++;
   }else {
       this.numOfSelected--;
   }
   this.allSelected = this.numOfSelected==this.messageList.length;
};

Chat.prototype.selectAll = function () {
    this.allSelected = !this.allSelected;
    for (var i = 0; i < this.messageList.length; i++) {
        var m = this.messageList[i];
        m.selected = this.allSelected;
    }
};

Chat.compareChatsByLastMessageTime = function(chat1, chat2) {
    if (chat1.lastMessageTime > chat2.lastMessageTime)
        return -1;
    if (chat1.lastMessageTime < chat2.lastMessageTime)
        return 1;
    return 0;
}

Chat.prototype.addMessage = function(messageNumber, messageTime, im, sendingContact, isOwnMessage, globalUnseenMessagesCounter) {
    var message = new Message(messageNumber, messageTime, im, this.getIMDestination(),sendingContact,isOwnMessage);
    this.messageList.push(message);
    this.numberToMessageMap[message.number] = message;
    if (message.id!=undefined) {
        this.idToMessageMap[message.id] = message;
    }

    this.allSelected = true;
    this.updateCalculatedFields();
    if (!message.isOwnMessage && !message.seen) {
        this.numberOfUnseenMessages++;
        this.unseenMessages.push(message);
        globalUnseenMessagesCounter.increment();
    }
    return message;
}

Chat.prototype.setAllMessagesSeen = function() {
    this.numberOfUnseenMessages++;
    this.unseenMessages = [];
}


Chat.prototype.sortMessagesByNumber = function() {
    this.messageList.sort(Message.compareMessagesByNumber);
}

Chat.prototype.markMessageAsSeen = function(message, globalUnseenMessagesCounter) {
    message.seen = true;
    var index = this.unseenMessages.indexOf(message);
    if (index!=-1) {
        this.numberOfUnseenMessages--;
        this.unseenMessages.splice(index);
        globalUnseenMessagesCounter.decrement();
    }
}

Chat.prototype.markAllMessagesAsSeen = function(globalUnseenMessagesCounter) {
    globalUnseenMessagesCounter.decrement(this.unseenMessages.length);
    for (var i=0;i<this.unseenMessages.length;i++) {
        var message = this.unseenMessages[i];
        message.seen = true;
    }
    this.numberOfUnseenMessages = 0;
    var arr = this.unseenMessages;
    this.unseenMessages = [];
    return arr;
}

Chat.prototype.setMessageId = function(message,messageId) {
    message.id = messageId;
    this.idToMessageMap[message.id] = message;
}

Chat.prototype.findMessageById = function(id) {
    var message = this.idToMessageMap[id];
    return message;
}

Chat.prototype.findMessageByNumber = function(number) {
    var message = this.numberToMessageMap[number];
    return message;
}

Chat.prototype.removeMessage = function(message, globalUnseenMessagesCounter) {
    var index = this.messageList.indexOf(message);
    if (index!=-1) {

        this.messageList.splice(index,1);

        if (message.id) {
            delete this.idToMessageMap[message.id];
        }

        if (message.number) {
            delete this.numberToMessageMap[message.number];
        }
        if (message.selected) {
            this.numOfSelected--;
            this.allSelected = this.numOfSelected==this.messageList.length;
        }

        var index = this.unseenMessages.indexOf(message);
        if (index!=-1) {
            this.numberOfUnseenMessages--;
            this.unseenMessages.splice(index);
            globalUnseenMessagesCounter.decrement();
        }
    }
    this.updateCalculatedFields();
}


Chat.prototype.getIMDestination = function() {
    var destination;
    if (this.contact.internal.type==eContactType.user) {
        destination = {
            type: "user",
            value: this.contact.contact.userName
        };
    }else {
        destination = {
            type: "group",
            value: this.contact.getAlias()
        };
    }
    return destination;
}











