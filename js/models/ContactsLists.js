function ContactsLists(storedObject) {
    if (storedObject) {
        this.recent = storedObject.recent;
        this.favorite = storedObject.favorite;
        this.groups = storedObject.favorite;
        this.search =  storedObject.favorite;
        this.temp = storedObject.favorite;
    }else {
        this.recent = {
                            missed: [],
                            all: [],
                            missedShowNum: 0,
                            numOfRecordsInAll:0
                        };
        this.favorite = [];
        this.groups = [];
        this.search =  [];
        this.temp = [];
    }
    this.recent.current = "all";
    this.current = "favorite";
}