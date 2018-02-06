function CSTAPhoneSrv() {


    function isSpeakerOn() {

    }

    function toggleSpeaker() {

    }

    function muteCall(call, muted) {

    }

    function makeCall(alias) {

    }

    function answerCall(call) {

    }

    function holdCall(call) {

    }

    function retrieveCall(call) {

    }

    function terminateCall(call) {

    }

    function transfer(callFrom, callTo) {

    }

    function conference(call1, call2) {

    }

    function divertCall(call, alias) {

    }


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

}

var servicesModule = angular.module('aeonixApp.services');
servicesModule.service('cstaPhoneSrv', [CSTAPhoneSrv]);

