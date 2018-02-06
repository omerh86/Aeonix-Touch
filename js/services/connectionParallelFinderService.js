
function ConnectionParallelFinderFactory(loggingSrv, $timeout, SipProxyService) {

    var logger = loggingSrv.getLogger("ConnectionParallelFinder");
    
    var ErrorType = {
        TIMEOUT_EXPIRED:"TIMEOUT_EXPIRED",
        CANCELED:"CANCELED"
    };

    function ConnectionParallelFinder() {

        var ths = this;

        ths.connections = [];
        ths.selectedConnection = null;

        var timeout = null;
        var resolveMethod = null;
        var rejectMethod = null;


        function finishSearch(canceled) {

            for (var i=0;i<ths.connections.length;i++) {
                var connection = ths.connections[i];
                if (connection!==ths.selectedConnection) {
                    connection.sipProxy.removeProxy();
                }
            }

            if (canceled) {
                var e = new Error();
                e.type = ErrorType.CANCELED;
                rejectMethod(e);
            } if (selectedConnection ) {
                resolveMethod(connection);
            }else {
                var e = new Error();
                e.type = ErrorType.TIMEOUT_EXPIRED;
                rejectMethod(e);
            }
        }

        function allConnectionsTested() {
            var determined = true;
            for (var i=0;i<ths.connections.length;i++) {
                var connection = ths.connections[i];
                determined = (connection.sipProxy.state === SipProxyService.State.REGISTERING);
                if (!determined) break;
            }
            return determined;
        }

        function onTimeout() {
            finishSearch();
        }

        function onRegistered(connection) {
            if (!ths.selectedConnection) {
                ths.selectedConnection = connection;
            }else {
                ths.selectedConnection = chooseBetterConnection(selectedConnection, connection);
            }

            if (allConnectionsTested()) finishSearch();

        }
        
        function onError(connection, error) {
            if (allConnectionsTested()) finishSearch();
        }

        function getConnectionWithBetterResponseTime(connection1, connection2) {
            if (connection1.sipProxy.roundTripTime>connection2.sipProxy.roundTripTime) return connection1;
            else return connection2;
        }

        function getConnectionWithBetterNetworkPath(connection1, connection2, allowedDelay) {
            var selectedConnection = null;
            if (!connection1.sbcAddress) {
                if (connection2.sbcAddress) {
                    if (connection1.sipProxy.roundTripTime-connection2.sipProxy.roundTripTime<=allowedDelay) {
                        selectedConnection = connection1;
                    }
                }
            }else if (!connection2.sbcAddress) {
                if (connection2.sipProxy.roundTripTime-connection1.sipProxy.roundTripTime<=allowedDelay) {
                    selectedConnection = connection2;
                }
            }else return null;
        }

        function chooseBetterConnection(connection1, connection2) {

            var betterConnection = getConnectionWithBetterNetworkPath(connection1,connection2, 50);

            if (!betterConnection) betterConnection = getConnectionWithBetterResponseTime(connection1,connection2);

            return betterConnection;
        }

        function testConnection(connection) {
            var sipProxyService = new SipProxyService();
            sipProxyService.setProxyAddress(connection.serverAddress, connection.sbcAddress, connection.port, connection.transport);
            sipProxyService.setIdentity("AITCreateCnxn_" + connection.loginName,null);
            connection.sipProxy = sipProxyService;
            ths.connections.push(connection);


            var promise = sipProxyService.register();

            function onConnectionRegistered() {
                onRegistered(connection);
            }

            function onConnectionError(e) {
                onError(connection,e);
            }


            promise.then(onConnectionRegistered).catch(onConnectionError);
        }

        function findConnection(loginName, serverAddresses, proxyAddresses, searchTimeout) {

            ths.timeout = $timeout(onTimeout,searchTimeout);

            for (var i=0;i<serverAddresses.length;i++) {
                var serverAddress = serverAddresses[i];
                var connection = {
                    loginName: loginName,
                    serverAddress: serverAddress.ip,
                    sbcAddress: null,
                    port:serverAddress.port,
                    transport:serverAddress.transport
                };
                testConnection(connection);
            }

            for (var i=0;i<proxyAddresses.length;i++){
                var proxyAddress= proxyAddresses[i];
                for (var j=0;i<serverAddresses.length;j++) {
                    var serverAddress = serverAddresses[j];
                    var connection = {
                        loginName: loginName,
                        serverAddress: serverAddress.ip,
                        sbcAddress: proxyAddress.ip,
                        port:proxyAddress.port,
                        transport:proxyAddress.transport
                    };
                    testConnection(connection);
                }
            }

            var promise = new Promise(function(resolve, reject) {
                resolveMethod = resolve;
                rejectMethod = reject;
            });

            return promise;
        }

        function cancelSearch() {
            $timeout.cancel(timeout);
            finishSearch(true);
        }

        this.findConnection = findConnection;
        this.cancelSearch = cancelSearch;

    }

    ConnectionParallelFinder.ErrorType = ErrorType;
    ConnectionParallelFinder.logger = logger;

    return ConnectionParallelFinder;
}



var servicesModule = angular.module('aeonixApp.services');

servicesModule.factory('ConnectionParallelFinder', ['$rootScope','loggingSrv', 'nativeSrv', ConnectionParallelFinderFactory]);


