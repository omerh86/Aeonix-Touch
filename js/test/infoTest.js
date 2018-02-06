function GetContactListTest() {
    var infoSrv = debugUtils.getService("infoSrv");
    var request = {
        GetContactList: {
            startIndex: 0,
            endIndex: 2,
            sortingMethod: "FIRST_NAME",
            sortingOrder: "ASCENDING",
            filter: "20",
            filterAliasOnly: false
        }
    };

    infoSrv.sendRequest(request);
}

function getCallLogTest() {
    var infoSrv = debugUtils.getService("infoSrv");
    var request = {
        GetCallLog: {
            userName: "5001",
            start: start,
            end: end,
            callType: "INCOMING",
            callLogCallType: "NOANSWERED",
            selectedIntervalType: "groupedCalls"
        }
    };

    infoSrv.sendRequest(request);
}

