var factoriesModule = angular.module('aeonixApp.factories');
factoriesModule.factory('Call', ['$rootScope', function ($rootScope) {



    function Call() {
        this.To = '';
        this.From = '';
        this.Direction = eCallDirection.None;
        this.DetailedState = eCallDetailedState.None;
        this.ErrorReason = null;
        this.SysMsg = '';
        this.Debug = false;
        this.pAsserted = '';

        //for internal housekeeping
        this.State = eCallState.None;
        this.NativeToken = 0;
        this.errorTimer = null;
        this.contact = null;
        this.TransferRole = eTransferRole.None;
        this.ReplacedCallNativeToken = null;
        this.terminateCallTimeout = null;
    }

    Call.prototype = {

        init: function (callData) {
            this.To = callData.To;
            this.From = callData.From;
            this.Direction = callData.Direction;
            this.DetailedState = callData.DetailedState;
            this.SysMsg = callData.SysMsg;
            this.NativeToken = callData.NativeToken;
            this.VideoEnabled = callData.VideoEnabled;
            this.pAsserted = callData.pAsserted;
            this.TransferRole = eTransferRole.None;
            this.ReplacedCallNativeToken = null;


        },


        update: function (callData) {
            this.To = callData.To;
            this.From = callData.From;
            this.Direction = callData.Direction;
            this.DetailedState = callData.DetailedState;
            this.SysMsg = callData.SysMsg;
            this.NativeToken = callData.NativeToken;
            this.pAsserted = callData.pAsserted;
            this.TransferRole = callData.TransferRole;
            this.ReplacedCallNativeToken = callData.ReplacedCallNativeToken;
        },

        transfer: function (toSipUriOrPhone) {

        },

        isEqual: function (callObj) {
            //return (this.From === callObj.From && this.To === callObj.To && this.Direction === callObj.Direction);
            return this.NativeToken == callObj.NativeToken;
        },

        isAnonymous: function () {
            var result = false;
            if (this.Direction==eCallDirection.CallIncoming && this.From) {
                var from = this.From.toLowerCase();
                result = (from === 'anonymous');
            }
            return result;
        },

        pAssertedContainsNumber: function() {
            return this.pAsserted  && this.pAsserted!= "" && this.pAsserted.match(/^[0-9]+$/);
        },

        getRemoteNumber: function () {
            var number;
            if (this.Direction==eCallDirection.CallOutgoing && this.To!=='') {
                number = this.To;
            }else {
                if (!this.isAnonymous()) {
                   if (this.pAssertedContainsNumber()) {
                    number = this.pAsserted;
                   }else if (this.From!=='') {
                    number = this.From;
                   }
                }
            }
            return number;
        },

        isActive: function () {
            return this.State!=eCallState.Error && this.State!=eCallState.Released && this.State!=eCallState.Transferred;
        }
    };

    return Call;
}]);
