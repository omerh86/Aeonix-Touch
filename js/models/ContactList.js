function ContactList() {
    this.map = {};
}

ContactList.prototype.add = function(contact){
    var key = contact.getContactId().toString();
    if (this.map[key]==undefined){
        this.map[key]= contact;
    }
}


ContactList.prototype.toArray = function(contact){
    var arr = [];
    for (var name in this.map) {
      if (this.map.hasOwnProperty(name)) {
        arr.push(this.map[name]);
      }
    }
    return arr;
}