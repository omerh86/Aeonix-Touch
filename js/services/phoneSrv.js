function PhoneSrv(localPhoneSrv, cstaPhoneSrv) {

    var currentPhoneSrv = localPhoneSrv;


    function isSpeakerOn() {
        return currentPhoneSrv.isSpeakerOn();
    }

    function toggleSpeaker() {
        currentPhoneSrv.toggleSpeaker();
    }

    function muteCall(call, muted) {
        currentPhoneSrv.muteCall(call, muted);
    }

    function makeCall(alias) {
        currentPhoneSrv.makeCall(alias);
    }

    function answerCall(call) {
        currentPhoneSrv.answerCall(call);
    }

    function holdCall(call) {
        currentPhoneSrv.holdCall(call);
    }

    function retrieveCall(call) {
        currentPhoneSrv.retrieveCall(call);
    }

    function terminateCall(call) {
        currentPhoneSrv.terminateCall(call);
    }

    function transfer(callFrom, callTo) {
        currentPhoneSrv.transfer(callFrom, callTo);
    }

    function conference(call1, call2) {
        currentPhoneSrv.conference(call1, call2);
    }

    function divertCall(call, alias) {
        currentPhoneSrv.divertCall(call, alias);
    }

    function sendDTMF(call, dtmf) {
        currentPhoneSrv.sendDTMF(call, dtmf);
    }

///

    this.isSpeakerOn = isSpeakerOn;
    this.toggleSpeaker = toggleSpeaker;
    this.muteCall = muteCall;
    this.makeCall = makeCall;
    this.answerCall = answerCall;
    this.holdCall = holdCall;
    this.retrieveCall = retrieveCall;
    this.terminateCall = terminateCall;
    this.transfer = transfer;
    this.conference = conference;
    this.sendDTMF = sendDTMF;

}

var servicesModule = angular.module('aeonixApp.services');
servicesModule.service('phoneSrv', ['localPhoneSrv', 'cstaPhoneSrv', PhoneSrv]);

