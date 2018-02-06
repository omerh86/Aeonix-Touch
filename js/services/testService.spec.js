describe('Testing SipProxyService', function () {


    var rootScope;
    var sipProxyService;
    var native;
    var logger;


    beforeAll(function (){
        console.log("before all");
        module("aeonixApp.services");
    });

    beforeEach(inject(function ($injector) {
        console.log("beforeEach");

        var inj = angular.injector(['aeonixApp.services']);

        var ts = inj.get("testSrv");

        logger = $injector.get("testSrv");

    }));

    // beforeEach(inject(function (loggingSrv) {
    //     console.log("beforeEach");
    //     logger = loggingSrv;
    //
    // }));
    //
    // beforeEach(inject(function (nativeSrv) {
    //     console.log("beforeEach");
    //     native = nativeSrv;
    //
    // }));
    //
    // beforeEach(inject(function ($rootScope, SipProxyService) {
    //     console.log("beforeEach");
    //     rootScope = $rootScope;
    //     sipProxyService = SipProxyService;
    // }));
    //
    // it('native should be not null', function () {
    //     console.log("native should be not null");
    //
    // });

    it('should be true', function () {
        /*var service = new sipProxyService();
        expect(service).toBeNull();
        service.setProxyAddress("172.28.11.141",null,"5060","tcp");
        service.setIdentity("3000","anx");
        service.setExpirationInterval(60);
        var promise= service.register();
        expect(promise).toBeDefined();
        expect(service.state).toEqual(sipProxyService.State.REGISTERING);*/
    });

});