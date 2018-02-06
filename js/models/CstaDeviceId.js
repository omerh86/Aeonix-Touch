function CstaDeviceId(alias, endpointId, userId) {
    this.alias = alias;
    this.endpointId = endpointId;
    this.userId = userId;
}

CstaDeviceId.prototype.toString = function(s) {
    var s;
    if (this.alias) {
        s = "N<"+this.alias+"/";
    }else {
        s = "N</";
    }

    if (this.endpointId) {
        s = s+this.endpointId+">";
    }else {
        s = s+">";
    }

    if (this.userId) {
        s = s+this.userId;
    }

    return s;
}

CstaDeviceId.parse = function(s) {
    var alias;
    var endpointId;
    var userId;
    var index1 = s.indexOf("<");
    if (index1 === -1) {
        alias = s;
    } else {
        var index2 = s.indexOf("/");
        var index3 = s.indexOf(">");
        if (index2 - index1 > 1) {
            alias = s.substring(index1 + 1, index2);
        }
        if (index3 - index2 > 1) {
            endpointId = s.substring(index2 + 1, index3);
        }

        if (index3 < s.length - 1) {
            userId = s.substring(index3 + 1, s.length);
        }
    }
    return new CstaDeviceId(alias,endpointId,userId);
}

CstaDeviceId.prototype.refersSameDevice = function(cstaDeviceId) {

    if (this===cstaDeviceId) return true;

    if (this.userId && cstaDeviceId.userId) return (this.userId==cstaDeviceId.userId);
    if (this.alias && cstaDeviceId.alias) return (this.alias==cstaDeviceId.alias);

    return false;
}

CstaDeviceId.createFromContact = function(contact) {
    var alias = contact.getAlias();
    var userId = contact.contact.userName;
    return new CstaDeviceId(alias,undefined,userId);
}

CstaDeviceId.createFromContactArray = function(contacts) {
    var cstaDeviceIdArr =[];
    for (var i=0;i<contacts.length;i++) {
        cstaDeviceIdArr.push(CstaDeviceId.createFromContact(contacts[i]));
    }
    return cstaDeviceIdArr;
}

