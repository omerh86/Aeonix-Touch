logSrv.getLogger("chatSrv").setLevel(eLogLevel.finest, true);

function testSendMessage() {
    var contactSrv = debugUtils.getService('contactSrv');
    var chatSrv = debugUtils.getService('chatSrv');

    var contact = contactSrv.getContactByAlias("5009");

    var chat = chatSrv.getOrAddChat(contact);

    chatSrv.sendMessage(chat,"test");

}


function testRemoveMessage() {

}


