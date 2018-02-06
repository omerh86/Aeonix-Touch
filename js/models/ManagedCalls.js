var factoriesModule = angular.module('aeonixApp.factories');
factoriesModule.factory('ManagedCalls', function () {

    function ManagedCalls(call) {


    }

    ManagedCalls.prototype = {
        getAllCalls: function () {
            return managedCalls;
        },
        isEmpty: function () {
            return (managedCalls[eCallState.Calling].length
            + managedCalls[eCallState.Active].length
            + managedCalls[eCallState.Incoming].length
            + managedCalls[eCallState.Hold].length === 0);
        }
    };


    var getCallIndex = function (call) {
        var call = {category: "" ,index: -1};
        angular.forEach(managedCalls, function(category, cat_key){
            for(var i=0; i<category.length;i++){
                if(category[i].NativeToken == call.NativeToken){
                    call.category = cat_key;
                    call.index = i;
                }
            }
        });
        return call;
    };
});
