
function TestSrv() {


}


console.log("test service file");

var servicesModule = angular.module('aeonixApp.services');
servicesModule.service('testSrv', [TestSrv]);

var inj = angular.injector(['aeonixApp.services']);

var ts = inj.get("testSrv");
console.log(ts);
