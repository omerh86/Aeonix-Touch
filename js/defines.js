var DEBUG = true;       //true: writing to web console and log file | false: just writing to log file
var CSTA_CALL = "1234";
var IMAGE_FORMAT = "data:image/png;base64,";


var eLogLevel =
{
    OFF: 0,
    ERROR:1,
    WARNING:2,
    INFO:3,
    DEBUG:4
}
var eRegState = 
{
    None: 0,
    InProgress: 1, 
    Ok: 2, 
    Cleared: 3, 
    Failed: 4  
};

var eCallDetailedState =
{
    Idle: 0, // Initial call state
    IncomingReceived: 1, // This is a new incoming call
    OutgoingInit: 2, // An outgoing call is started
    OutgoingProgress: 3, // An outgoing call is in progress
    OutgoingRinging: 4, // An outgoing call is ringing at remote end
    OutgoingEarlyMedia: 5, // An outgoing call is proposed early media
    Connected: 6, // <Connected, the call is answered
    StreamsRunning: 7, // The media streams are established and running
    Pausing: 8, // The call is pausing at the initiative of local end
    Paused: 9, // The call is paused, remote end has accepted the pause
    Resuming: 10, // The call is being resumed by local end
    Refered: 11, // <The call is being transfered To another party, resulting in a new outgoing call To follow immediately
    Error: 12, // The call encountered an error
    End: 13, // The call ended normally
    PausedByRemote: 14, // The call is paused by remote end
    UpdatedByRemote: 15, // The call's parameters change is requested by remote end, used for example when video is added by remote
    IncomingEarlyMedia: 16, // We are proposing early media To an incoming call
    Updating: 17, // A call update has been initiated by us
    Released: 18, // The call object is no more retained by the core
    Failed: 19, //The call is Not Found
    Busy: 20, //The call is Busy
    DND: 21 //The call is DND
};

var eCallDirection =
{
    CallOutgoing: 0,
    CallIncoming: 1,
    None: 999

};

var eCallState =
{
    Idle:0,
    Calling: 1,
    Active: 2,
    Incoming: 3,
    Hold: 4,
    Held: 5,
    Error: 6,
    End:7,
    Released:8,
    Transferred: 9
};

var eCallErrorReason =
{
    Busy:0,
    Offline:1,
    NotFound:2,
    DND:3,
    Unknown:4
};

var eLogoutReason =
 {
    userLoggedOut:1,
    connectionError:2,
    switchingToEndpointLogin:3,
    changingPassword:4
 }


var eContactType =
{
    unknown: {value: 1, name: "unknown", callEnabled: true, chatEnabled: false, favoriteEnabled:false, isGroup:false},
    user: {value: 2, name: "user", callEnabled: true, chatEnabled: true, favoriteEnabled:true, isGroup:false},
    restrictedUser: {value: 3, name: "restrictedUser", callEnabled: false, chatEnabled: false, favoriteEnabled:false, isGroup:false},
    external: {value: 4, name: "external", callEnabled: true, chatEnabled: false, favoriteEnabled:false, isGroup:false},
    externalAnonymous: {value: 5, name: "externalAnonymous", callEnabled: false, chatEnabled: false, favoriteEnabled:false, isGroup:false},
    acd: {value: 6, name: "acd", callEnabled: true, chatEnabled: false, favoriteEnabled:true, isGroup:true},
    callGroup: {value: 7, name: "callGroup", callEnabled: true, chatEnabled: false, favoriteEnabled:true, isGroup:true},
    conferenceCall: {value: 8, name: "conferenceCall", callEnabled: true, chatEnabled: false, favoriteEnabled:true, isGroup:true},
    hunt: {value: 9, name: "hunt", callEnabled: true, chatEnabled: false, favoriteEnabled:true, isGroup:false},
    meetMeConference: {value: 10, name: "meetMeConference", callEnabled: true, chatEnabled: false, favoriteEnabled:true, isGroup:true},
    zonePage: {value: 11, name: "zonePage", callEnabled: true, chatEnabled: false, favoriteEnabled:true, isGroup:true},
    voiceMail: {value: 12, name: "voiceMail", callEnabled: true, chatEnabled: false, favoriteEnabled:false, isGroup:false},
    nWayConference: {value: 13, name: "nWayConference", callEnabled: false, chatEnabled: false, favoriteEnabled:false, isGroup:false},
    parse: function(str) {
        var contactType = eContactType.unknown;
        if (str) {
            switch(str) {
                case "USR":
                    contactType =  eContactType.user;
                    break;
                case "ACD":
                    contactType =eContactType.acd;
                    break;
                case "CALL_GROUP":
                    contactType =eContactType.callGroup;
                    break;
                case "CONFERENCE_CALL":
                    contactType =eContactType.conferenceCall;
                    break;
                case "HUNT":
                    contactType =eContactType.hunt;
                case "MEET_ME":
                    contactType =eContactType.meetMeConference;
                    break;
                case "VOICE_MAIL":
                    contactType =eContactType.voiceMail;
                    break;
                case "ZONE_PAGE":
                    contactType =eContactType.zonePage;
                    break;
                case "NOT_EXIST":
                    contactType =eContactType.unknown;
                    break;
                default:
                    contactType =eContactType.unknown;
                    break;
            }
        }
        return contactType;
    }
};

var eLoginState =
{
    loggedOut: 1,
    loggingOut: 2,
    loggingIn: 3,
    loggedIn: 4,
    disconnected: 5
};


var eError =
{
    Timeout: 1,
    AuthorizationError: 2,
    LicenseError: 3,
    GeneralError: 4,
    OperationCanceled:5
};


var eChangePasswordError =
{
    IncorrectOldPassword: 1,
    WeakPassword: 2,
    ConnectionError: 3
};



var eDBRequestResponseCode =
{
    ok: 0,
    notFound: -1,
    licenseProblem: -2,
    badRequestFormat: -3,
    noData: -4
};

var ePresence = {
    available: {color: 'green', text: "AVAILABLE", className: "is-green", value: "ONLINE"},
    busy: { color: 'red', text: "OnCall", className: "is-orange", value: "IN_A_CALL"},
    offline: { color: 'blue', text: "OFFLINE" },
    unknown: { color: 'gray', text: "UNKNOWN"},
    meeting: { color: 'orange', text: "MEETING", className: "is-yellow", value: "AT_THE_MEETING" },
    dnd: { color: 'purple', text: "DND", className: "is-red", value: "UNREACHABLE" },
    parse: function(str) {
        switch (str) {
            case "ONLINE":
                return ePresence.available;
            case "AVAILABLE":
                return ePresence.available;
            case "UNREACHABLE":
                return ePresence.dnd;
            case "AT_THE_MEETING":
                return ePresence.meeting;
            case 'BUSY':
                return ePresence.busy;
            case 'IN_A_CALL':
                return ePresence.busy;
            case 'OFFLINE':
                return  ePresence.offline;
            case 'UNKNOWN':
                return ePresence.unknown;
        }
    }
};




var eProtocolType = {
    tcp: {value: 1, name: "tcp"},
    udp: { value: 2, name: "udp"},
    tls: { value: 3, name: "tls"}
};


var eIdType = {
    userName: {value: 1, name: "userName"},
    loginName: {value: 2, name: "loginName"},
    alias: {value: 3, name: "alias"},
    externalNumber: {value: 4, name: "externalNumber"}
}

var eIMDestinationIdType = {
    userName: {value: 1, name: "user"},
    externalNumber: {value: 2, name: "external"},
    groupAlias: {value: 3, name: "group"},
    parse: function(str) {
        switch (str) {
            case "user":
                return eIMDestinationIdType.userName;
            case "external":
                return eIMDestinationIdType.externalNumber;
            case "group":
                return eIMDestinationIdType.groupAlias;
        }
    }
}

var eIMStatus = {
    sending: {value: 1, name: "sending"},
    sent: {value: 2, name: "sent"},
    sendFailed: {value: 3, name: "failed"}
}


var eTelephonyFeature =
{
    Login:0,
    Logout: 1
};


var eTransferRole =
{
    None:0,
    Transferred:1,
    TransferTarget:2
};


