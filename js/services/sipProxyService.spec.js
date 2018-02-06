describe('Testing SipProxyService', function () {



    var sipProxyService;



    beforeAll(function (){
        console.log("before all");
        module("aeonixApp.services");
    });

    beforeEach(function () {
        console.log("beforeEach");



    });

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
        var injector = angular.injector(['aeonixApp.services']);

        var rs = injector.get("$rootScope");
        expect(rs).toBeDefined();
        var sipProxyService = injector.get("SipProxyService");
        expect(sipProxyService).toBeDefined();
        var service = new sipProxyService();
        expect(service).toBeNull();
        service.setProxyAddress("172.28.11.141",null,"5060","tcp");
        service.setIdentity("3000","anx");
        service.setExpirationInterval(60);
        var promise= service.register();
        expect(promise).toBeDefined();
        expect(service.state).toEqual(sipProxyService.State.REGISTERING);
    });

});