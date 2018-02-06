function LoginSrv($rootScope, $timeout, deviceSrv, connectionSrv, connectionAddressFinderSrv, infoSrv, storageSrv) {

    var serviceLogger = logSrv.getLogger("loginSrv");

    var that = this;

    var _endpointId = null;

    var _userName = null;

    var _loginName = null;

    var _password = null;

    var _serverAddresses = [];

    var _proxyAddresses = [];

    var _currentServerAddress = null;

    var _currentProxyAddress = null;

    var _currentProxyInfo = null;

    var _transportProtocolType = null;

    var _logoutReason = null;

    var _loginState = eLoginState.loggedOut;

    var _timeout = null;

    var _loggedInWithEP = null;

    var _error = null;

    var _retryCounter = 0;

    var sm = null;


    function getMembers() {
        var o = {
            "_endpointId":_endpointId,
            "_userName":_userName,
            "_loginName":_loginName,
            "_password":_password,
            "_serverAddresses":_serverAddresses,
            "_proxyAddresses":_proxyAddresses,
            "_currentServerAddress":_currentServerAddress,
            "_currentProxyAddress":_currentProxyAddress,
            "_currentProxyInfo": _currentProxyInfo,
            "_transportProtocolType":_transportProtocolType,
            "_logoutReason":_logoutReason,
            "_loginState":_loginState,
            "_timeout":_timeout,
            "_loggedInWithEP":_loggedInWithEP,
            "_retryCounter":_retryCounter,
            "_error":_error
        };
        return o;
    }

    function clean() {
        _endpointId = null;
        _userName = null;
        _loginName = null;
        _password = null;
        _serverAddresses = [];
        _proxyAddresses = [];
        _transportProtocolType = null;
        _logoutReason = null;
        _timeout = null;
        _error = null;
        _loggedInWithEP = null;
        _retryCounter = 0;
    }

    function setTimeout(delay) {
        if (_timeout!=null) {
            $timeout.cancel(_timeout);
        }
        _timeout = $timeout(onTimeout, delay);
    }

    function fixAddressList(array) {

        var logger = serviceLogger.logMethodCall(arguments, eLogLevel.finer);

        var fixedArray = [];
        if (array && array.length) {
            for (var i = 0; i < array.length; i++) {
                var v = array[i];
                if (!v) continue;
                v = v.trim();
                if (v == "") continue;
                var index = fixedArray.indexOf(v);
                if (index != -1) continue;
                fixedArray.push(v);
            }
        }
        logger.logMethodCompleted(arguments, fixedArray, eLogLevel.finer);
        return fixedArray;
    }

    function extractEndpointId(name) {
        var logger = serviceLogger.logMethodCall(arguments, eLogLevel.finer);

        var start = name.indexOf("sip:");
        var end = name.indexOf("@");
        if (start != -1 && end != -1) {
            name = name.substr(start + "sip:".length, end - (start + "sip:".length));
        }

        logger.logMethodCompleted(arguments, name, eLogLevel.finer);

        return name;
    };

    function createAccount(userLoginName) {
        var obj = {
            CreateAccount: {
                userLoginName: userLoginName,
                //todo michael: replace PC with a mobile-related value
                productName: "PC",
                hasSoftPhone: "true",
                deviceID: deviceSrv.getDeviceID(userLoginName),
                isMobile: "false"
            }
        };
        infoSrv.sendRequest(obj);
    };

    function setError(e) {
        if (_error===null) {
            _error = e;
        }
    }


    function loginToUser(loginName, password, serverAddresses, proxyAddresses) {

        var logger = serviceLogger.logMethodCall(arguments, eLogLevel.finer);

        sm.UserLoginEvent(loginName, password, serverAddresses, proxyAddresses);

        logger.logMethodCompleted(arguments, getMembers(), eLogLevel.finer);
    }



    function loginWithEP(loginName) {

        var logger = serviceLogger.logMethodCall(arguments, eLogLevel.finer);

        sm.EndpointLoginEvent(loginName);

        logger.logMethodCompleted(arguments, getMembers(), eLogLevel.finer);

    }

    function cancel() {

        var logger = serviceLogger.logMethodCall(arguments, eLogLevel.finer);

        if (_loginState==eLoginState.loggingIn) {
            connectionAddressFinderSrv.cancel();
            if (connectionSrv.isConnected()) {
                connectionSrv.disconnect();
            }else {
                connectionSrv.cancel();
            }
            setError(eError.OperationCanceled);
            sm.CancelEvent();
        }


        logger.logMethodCompleted(arguments, getMembers(), eLogLevel.finer);

    }

    function logout(reason) {

        var logger = serviceLogger.logMethodCall(arguments, eLogLevel.finer);

        sm.LogoutEvent(reason);

        logger.logMethodCompleted(arguments, getMembers(), eLogLevel.finer);

    }



    function onConnectionStateChanged(event, connectionState, error) {

        var logger = serviceLogger.logMethodCall(arguments, eLogLevel.finer);

        try {
            if (connectionState == "disconnected") {
                sm.DisconnectedEvent(error);
            } else {// (connectionState == "connected")
                if (_loggedInWithEP) {
                    sm.EndpointConnectedEvent();
                }else {
                    sm.UserConnectedEvent();
                }
            }
        } catch (err) {
            logger.error(err);
        }

        logger.logMethodCompleted(arguments, getMembers(), eLogLevel.finer);
    }

    function onConnectionConfiguration(event, data) {
        var logger = serviceLogger.logMethodCall(arguments, eLogLevel.finer);

        try {
            if (data.errCode===eDBRequestResponseCode.ok){
                sm.AccountCreatedEvent(data);
            }else {
                var error;
                if (data.errCode == eDBRequestResponseCode.licenseProblem) {
                    error = eError.LicenseError;
                } else {
                    error = eError.GeneralError;
                }
                sm.CreateAccountErrorEvent(error);
            }
        }catch(err) {
            logger.error(err);
        }

        logger.logMethodCompleted(arguments, getMembers(), eLogLevel.finer);
    }

    function onCreateAccountFailed(event, request) {
        var logger = serviceLogger.logMethodCall(arguments, eLogLevel.finer);

        try {
            var error = eError.GeneralError;
            sm.CreateAccountErrorEvent(error);

        }catch(err) {
            logger.error(err);
        }

        logger.logMethodCompleted(arguments, getMembers(), eLogLevel.finer);
    }


    function onConnectionFound(event, proxyInfo) {

        var logger = serviceLogger.logMethodCall(arguments, eLogLevel.finer);

        try {            
            sm.ConnectionAddressFoundEvent(proxyInfo);
        } catch (err) {
            logger.error(err);
        }

        logger.logMethodCompleted(arguments, getMembers(), eLogLevel.finer);
    }

    function onConnectionNotFound(event) {
        
        var logger = serviceLogger.logMethodCall(arguments, eLogLevel.finer);
        
        try {            
            sm.ConnectionAddressNotFoundEvent();            
        } catch (err) {
            logger.error(err);
        }
    
        logger.logMethodCompleted(arguments, getMembers(), eLogLevel.finer);
    }

    function onTimeout() {
        var logger = serviceLogger.logMethodCall(arguments, eLogLevel.finer);

        _timeout = null;
        sm.TimeoutEvent();

        logger.logMethodCompleted(arguments, getMembers(), eLogLevel.finer);
    }

    function getUserConnectionSettings(_loginName) {
        return storageSrv.get(_loginName, "loginSrv", "connectionSettings");
    }



    function isLoggedInWithEndpoint() {
        return _loggedInWithEP;
    }

    function getState() {
        return _loginState;
    }

    function getLoginName() {
        return _loginName;
    }

    function getUserName() {
        return _userName;
    }

    function getEndpointId() {
        return _endpointId;
    }

    function onError(eventName, from, to, args, errorCode, errorMessage, err) {
        var logger = serviceLogger.logMethodCall(arguments, eLogLevel.finer);
        if (err) {
            logger.error(err);
        }else {
            logger.info(errorMessage);
        }
    }

    function onBeforeEvent(event, from, to) {
        var logger = serviceLogger.logMethodCall(arguments, eLogLevel.finer);
        logger.fine(event, ", switching from ", from, " to ", to);

    }

    function onAfterEvent(event, from, to) {
        var logger = serviceLogger.logMethodCall(arguments, eLogLevel.finer);
        logger.fine(event, " completed");
    }

    function onBeforeUserLoginEvent(event, from, to, loginName, password, serverAddresses, proxyAddresses) {

        var logger = serviceLogger.logMethodCall(arguments, eLogLevel.finer);

        _loginName = loginName;
        _password = password;
        _endpointId = "AITCreateCnxn_" + loginName;

        if (serverAddresses==undefined) {
            var connectionSettings = storageSrv.get(loginName, "loginSrv", "connectionSettings");
            _serverAddresses = connectionSettings.serverAddresses;
            _proxyAddresses = connectionSettings.proxyAddresses;
        }else {
            _serverAddresses = serverAddresses;
            _proxyAddresses = proxyAddresses;
        }

        _transportProtocolType = "tcp";
        _loggedInWithEP = false;

        logger.logMethodCompleted(arguments, getMembers(), eLogLevel.finer);
    }

    function onBeforeEndpointLoginEvent(event, from, to, loginName) {

        var endpointCredentials = storageSrv.get(loginName, "loginSrv", "endpointCredentials");
        var connectionSettings = storageSrv.get(loginName, "loginSrv", "connectionSettings");

        _loginName = loginName;
        _userName = storageSrv.get(loginName, "loginSrv", "userName");
        _endpointId = endpointCredentials.name;
        _password = endpointCredentials.password;
        _serverAddresses = connectionSettings.serverAddresses;
        _proxyAddresses = connectionSettings.proxyAddresses;
        _transportProtocolType = "tcp";
        _loggedInWithEP = true;
    }

    function onBeforeLogoutEvent(event, from, to, reason) {
        _logoutReason = reason;
    }

    function onBeforeConnectionAddressFoundEvent(event, from, to, proxyInfo) {
        _currentProxyInfo = proxyInfo;
        _currentServerAddress = proxyInfo.serverAddress;
        _currentProxyAddress = proxyInfo.proxyAddress;
    }

    function onBeforeConnectionAddressNotFoundEvent(event, from, to) {
        if (_loginState==eLoginState.loggingIn) {
            setError(eError.Timeout);
        }
    }

    function onBeforeDisconnectedEvent(event, from, to, error) {
        setError(error);
    }

    function onBeforeAccountCreatedEvent(event, from, to, data) {

        var logger = serviceLogger.logMethodCall(arguments, eLogLevel.finer);

        var sbcList = fixAddressList(data.SBCsIpAddr);
        if (!stringUtils.isEmpty(data.port) && !arrayUtils.isEmpty(sbcList)) {
            var suffix = ":"+data.port;
            for (var i=0;i<sbcList.length;i++){
                var address = sbcList[i];
                address+=suffix;
                sbcList[i]=address;
            }
        }
        var connectionSettings = new ConnectionSettings(fixAddressList(data.serversIp), sbcList);
        var endpointId = extractEndpointId(data.deviceConnectionConfiguration.endponintId);
        _userName = data.userName;
        var endpointPassword = data.deviceConnectionConfiguration.endpointPassword;
        var endpointCredentials = new Credentials(endpointId, endpointPassword);

        storageSrv.addOrUpdate(_loginName, "loginSrv", "endpointCredentials", endpointCredentials);
        storageSrv.addOrUpdate(_loginName, "loginSrv", "connectionSettings", connectionSettings);
        storageSrv.addOrUpdate(_loginName, "loginSrv", "userName", _userName);
        
    }

    function onBeforeCreateAccountErrorEvent(event, from, to, error) {
        setError(error);
    }


    function onEnterLoggedOut(event, from, to) {
        if (_loginState==eLoginState.loggingIn) {
            var errorTemp = _error;
            clean();
            _loginState = eLoginState.loggedOut;
            $rootScope.$broadcast("loginSrv:loginFailed", errorTemp, that);
        } else {
            var logoutReasonTemp = _logoutReason;
            clean();
            _loginState = eLoginState.loggedOut;
            $rootScope.$broadcast("loginSrv:loggedOut", logoutReasonTemp, that);
        }
    }

    function onLeaveDisconnected_WaitingForReconnectTimeout(event, from, to) {
        if (_timeout) {
            $timeout.cancel(_timeout);
            _timeout = null;
        }
    }

    function onLeaveLoggingOut_WaitingForCleanupTimeout(event, from, to) {
        if (_timeout) {
            $timeout.cancel(_timeout);
            _timeout = null;
        }
    }

    function onEnterLoggingIn_DetectingConnectionAddress(event, from, to) {
        _loginState=eLoginState.loggingIn;
        _currentServerAddress = null;
        _currentProxyAddress = null;
        _currentProxyInfo = null;
        _retryCounter = 0;
        connectionAddressFinderSrv.findAvailableConnection(_loginName, _serverAddresses, _proxyAddresses,null, true);
    }

    function onEnterLoggingIn_ReConnecting(event, from, to) {
        _retryCounter++;
        if (_retryCounter==3) {
            _retryCounter = 0;
            sm.ConnectFailedEvent();
        }else {
            sm.ReConnectEvent();
        }
    }

    function onEnterLoggingIn_Connecting(event, from, to) {
        _loginState=eLoginState.loggingIn;
        if (_loggedInWithEP) {
            connectionSrv.connect(_endpointId, _loginName, _password, _currentServerAddress, _currentProxyAddress,"tcp");

        }else {
            connectionSrv.connect(_endpointId, _loginName, _password, _currentServerAddress, _currentProxyAddress,"tcp");
        }
    }


    function onEnterLoggingIn_CreatingAccount(event, from, to) {
        createAccount(_loginName);
    }

    function onEnterLoggingIn_Disconnecting(event, from, to) {
        connectionSrv.disconnect();
    }

    function onEnterLoggedIn(event, from, to) {
        if (_loginState==eLoginState.loggingIn) {
            _loginState = eLoginState.loggedIn;
            if (!_loggedInWithEP) {
                var rememberedLogin =  storageSrv.get("##atouch", "login", "rememberedLogin");
                if (rememberedLogin) {
                    rememberedLogin.password = _password;
                    storageSrv.addOrUpdate("##atouch", "login", "rememberedLogin", rememberedLogin);
                }
            }
            $rootScope.$broadcast("loginSrv:loggedIn", _loggedInWithEP, that);
        } else {
            _loginState = eLoginState.loggedIn;
            $rootScope.$broadcast("loginSrv:connectionRestored", that);
        }
    }

    function onEnterDisconnected_DetectingConnectionAddress(event, from, to) {
        _retryCounter = 0;
        if (_loginState==eLoginState.loggedIn) {
            _loginState=eLoginState.disconnected;
            $rootScope.$broadcast("loginSrv:connectionFailed", that);
        }
        connectionAddressFinderSrv.findAvailableConnection(_loginName, _serverAddresses, _proxyAddresses, null, true);
    }

    function onEnterDisconnected_ReConnecting(event, from, to) {
        _retryCounter++;
        if (_retryCounter==3) {
            _retryCounter = 0;
            sm.ConnectFailedEvent();
        }else {
            sm.ReConnectEvent();
        }
    }

    function onEnterDisconnected_Connecting(event, from, to) {
        connectionSrv.connect(_endpointId, _loginName, _password, _currentServerAddress, _currentProxyAddress,"tcp");
    }

    function onEnterDisconnected_WaitingForReconnectTimeout(event, from, to) {
        setTimeout(5000);
    }


    function onEnterLoggingOut_WaitingForCleanupTimeout(event, from, to) {
        var logger = serviceLogger.logMethodCall(arguments, eLogLevel.finer);

        try {
            setTimeout(2000);
            $rootScope.$broadcast("loginSrv:loggingOut", that);
        }catch (err) {
            logger.error(err);
        }

    }

    function onEnterLoggingOut_Disconnecting(event, from, to) {
        connectionSrv.disconnect();
    }


    function createStateMachine() {
        var sm = StateMachine.create({
                initial: 'LoggedOut',
                error: onError,
                events: [
                    { name: 'startup', from: 'none', to: 'LoggedOut' },

                    { name: 'UserLoginEvent', from: 'LoggedOut', to: 'LoggingIn_DetectingConnectionAddress' },
                    { name: 'EndpointLoginEvent', from: 'LoggedOut', to: 'LoggingIn_Connecting' },

                    { name: 'LogoutEvent', from: 'LoggingIn_DetectingConnectionAddress', to: 'LoggingOut_WaitingForAddressDetectionCompleted' },
                    { name: 'ConnectionAddressFoundEvent', from: 'LoggingIn_DetectingConnectionAddress', to: 'LoggingIn_Connecting' },
                    { name: 'ConnectionAddressNotFoundEvent', from: 'LoggingIn_DetectingConnectionAddress', to: 'LoggedOut' },
                    { name: 'CancelEvent', from: 'LoggingIn_DetectingConnectionAddress', to: 'LoggedOut' },

                    { name: 'ReConnectEvent', from: 'LoggingIn_ReConnecting', to: 'LoggingIn_Connecting' },
                    { name: 'ConnectFailedEvent', from: 'LoggingIn_ReConnecting', to: 'LoggedOut' },
                    { name: 'CancelEvent', from: 'LoggingIn_ReConnecting', to: 'LoggedOut' },

                    { name: 'LogoutEvent', from: 'LoggingIn_Connecting', to: 'LoggingOut_Disconnecting' },
                    { name: 'UserConnectedEvent', from: 'LoggingIn_Connecting', to: 'LoggingIn_CreatingAccount' },
                    { name: 'EndpointConnectedEvent', from: 'LoggingIn_Connecting', to: 'LoggedIn' },
                    { name: 'DisconnectedEvent', from: 'LoggingIn_Connecting', to: 'LoggingIn_ReConnecting' },
                    { name: 'CancelEvent', from: 'LoggingIn_Connecting', to: 'LoggedOut' },

                    { name: 'LogoutEvent', from: 'LoggingIn_CreatingAccount', to: 'LoggingOut_Disconnecting'},
                    { name: 'AccountCreatedEvent', from: 'LoggingIn_CreatingAccount', to: 'LoggedIn' },
                    { name: 'CreateAccountErrorEvent', from: 'LoggingIn_CreatingAccount', to: 'LoggingIn_Disconnecting'},
                    { name: 'CancelEvent', from: 'LoggingIn_CreatingAccount', to: 'LoggedOut'},

                    { name: 'LogoutEvent', from: 'LoggingIn_Disconnecting', to: 'LoggingOut_Disconnecting'},
                    { name: 'DisconnectedEvent', from: 'LoggingIn_Disconnecting', to: 'LoggedOut' },

                    { name: 'LogoutEvent', from: 'LoggedIn', to: 'LoggingOut_WaitingForCleanupTimeout' },
                    { name: 'DisconnectedEvent', from: 'LoggedIn', to: 'Disconnected_DetectingConnectionAddress' },

                    { name: 'LogoutEvent', from: 'Disconnected_DetectingConnectionAddress', to: 'LoggingOut_WaitingForAddressDetectionCompleted'},
                    { name: 'ConnectionAddressFoundEvent', from: 'Disconnected_DetectingConnectionAddress', to: 'Disconnected_Connecting' },
                    { name: 'ConnectionAddressNotFoundEvent', from: 'Disconnected_DetectingConnectionAddress', to: 'Disconnected_WaitingForReconnectTimeout'},

                    { name: 'LogoutEvent', from: 'Disconnected_Connecting', to: 'LoggingOut_Disconnecting' },
                    { name: 'UserConnectedEvent', from: 'Disconnected_Connecting', to: 'LoggedIn' },
                    { name: 'EndpointConnectedEvent', from: 'Disconnected_Connecting', to: 'LoggedIn' },
                    { name: 'DisconnectedEvent', from: 'Disconnected_Connecting', to: 'Disconnected_ReConnecting' },


                    { name: 'ReConnectEvent', from: 'Disconnected_ReConnecting', to: 'Disconnected_Connecting' },
                    { name: 'ConnectFailedEvent', from: 'Disconnected_ReConnecting', to: 'Disconnected_WaitingForReconnectTimeout' },

                    { name: 'LogoutEvent', from: 'Disconnected_WaitingForReconnectTimeout', to: 'LoggedOut' },
                    { name: 'TimeoutEvent', from: 'Disconnected_WaitingForReconnectTimeout', to: 'Disconnected_DetectingConnectionAddress' },

                    { name: 'ConnectionAddressFoundEvent', from: 'LoggingOut_WaitingForAddressDetectionCompleted', to: 'LoggedOut' },
                    { name: 'ConnectionAddressNotFoundEvent', from: 'LoggingOut_WaitingForAddressDetectionCompleted', to: 'LoggedOut' },

                    { name: 'TimeoutEvent', from: 'LoggingOut_WaitingForCleanupTimeout', to: 'LoggingOut_Disconnecting' },

                    { name: 'DisconnectedEvent', from: 'LoggingOut_Disconnecting', to: 'LoggedOut' }
                    
                ],
                callbacks: {

                    onbeforeevent: onBeforeEvent,
                    onafterevent: onAfterEvent,

                    onbeforeUserLoginEvent:onBeforeUserLoginEvent,
                    onbeforeEndpointLoginEvent:onBeforeEndpointLoginEvent,
                    onbeforeLogoutEvent:onBeforeLogoutEvent,
                    onbeforeConnectionAddressFoundEvent:onBeforeConnectionAddressFoundEvent,
                    onbeforeConnectionAddressNotFoundEvent:onBeforeConnectionAddressNotFoundEvent,
                    onbeforeDisconnectedEvent:onBeforeDisconnectedEvent,                    
                    onbeforeUserLoginEvent:onBeforeUserLoginEvent,
                    onbeforeEndpointLoginEvent:onBeforeEndpointLoginEvent,                    
                    onbeforeAccountCreatedEvent:onBeforeAccountCreatedEvent,
                    onbeforeCreateAccountErrorEvent:onBeforeCreateAccountErrorEvent,


                    onleaveDisconnected_WaitingForReconnectTimeout: onLeaveDisconnected_WaitingForReconnectTimeout,
                    onleaveLoggingOut_WaitingForCleanupTimeout: onLeaveLoggingOut_WaitingForCleanupTimeout,

                    onenterLoggedOut:onEnterLoggedOut,
                    onenterLoggingIn_DetectingConnectionAddress:onEnterLoggingIn_DetectingConnectionAddress,
                    onenterLoggingIn_Connecting:onEnterLoggingIn_Connecting,
                    onenterLoggingIn_ReConnecting:onEnterLoggingIn_ReConnecting,
                    onenterLoggingIn_CreatingAccount:onEnterLoggingIn_CreatingAccount,
                    onenterLoggingIn_Disconnecting:onEnterLoggingIn_Disconnecting,
                    onenterLoggedIn:onEnterLoggedIn,
                    onenterDisconnected_DetectingConnectionAddress:onEnterDisconnected_DetectingConnectionAddress,
                    onenterDisconnected_Connecting:onEnterDisconnected_Connecting,
                    onenterDisconnected_ReConnecting:onEnterDisconnected_ReConnecting,
                    onenterDisconnected_WaitingForReconnectTimeout:onEnterDisconnected_WaitingForReconnectTimeout,
                    onenterLoggingOut_WaitingForCleanupTimeout:onEnterLoggingOut_WaitingForCleanupTimeout,
                    onenterLoggingOut_Disconnecting:onEnterLoggingOut_Disconnecting
                }
            });
        return sm;
    }

    function init() {
        sm = createStateMachine();

        $rootScope.$on("cnxn:ConnectionStateChanged", onConnectionStateChanged);
        $rootScope.$on("infoSrv:ConnectionConfiguration", onConnectionConfiguration);
        $rootScope.$on("infoSrv:CreateAccountFailed", onCreateAccountFailed);
        $rootScope.$on("connectionAddressFinderSrv:connectionNotFound", onConnectionNotFound);
        $rootScope.$on("connectionAddressFinderSrv:connectionFound", onConnectionFound);




    }

    this._clean=clean;
    this._setTimeout=setTimeout;
    this._fixAddressList=fixAddressList;
    this._extractEndpointId=extractEndpointId;
    this._createAccount=createAccount;
    this._setError=setError;

    this._onError=onError;
    this._onConnectionStateChanged=onConnectionStateChanged;
    this._onConnectionConfiguration=onConnectionConfiguration;
    this._onConnectionFound=onConnectionFound;
    this._onConnectionNotFound=onConnectionNotFound;
    this._onCreateAccountFailed = onCreateAccountFailed;
    this._onTimeout=onTimeout;
    this._onBeforeEvent=onBeforeEvent;
    this._onAfterEvent=onAfterEvent;
    this._onBeforeUserLoginEvent=onBeforeUserLoginEvent;
    this._onBeforeEndpointLoginEvent=onBeforeEndpointLoginEvent;
    this._onBeforeLogoutEvent=onBeforeLogoutEvent;
    this._onBeforeConnectionAddressFoundEvent=onBeforeConnectionAddressFoundEvent;
    this._onBeforeConnectionAddressNotFoundEvent=onBeforeConnectionAddressNotFoundEvent;
    this._onBeforeDisconnectedEvent=onBeforeDisconnectedEvent;
    this._onBeforeAccountCreatedEvent=onBeforeAccountCreatedEvent;
    this._onBeforeCreateAccountErrorEvent=onBeforeCreateAccountErrorEvent;
    this._onEnterLoggedOut=onEnterLoggedOut;
    this._onLeaveDisconnected_WaitingForReconnectTimeout=onLeaveDisconnected_WaitingForReconnectTimeout;
    this._onLeaveLoggingOut_WaitingForCleanupTimeout=onLeaveLoggingOut_WaitingForCleanupTimeout;
    this._onEnterLoggingIn_DetectingConnectionAddress=onEnterLoggingIn_DetectingConnectionAddress;
    this._onEnterLoggingIn_Connecting=onEnterLoggingIn_Connecting;
    this._onEnterLoggingIn_CreatingAccount=onEnterLoggingIn_CreatingAccount;
    this._onEnterLoggingIn_Disconnecting=onEnterLoggingIn_Disconnecting;
    this._onEnterLoggedIn=onEnterLoggedIn;
    this._onEnterDisconnected_DetectingConnectionAddress=onEnterDisconnected_DetectingConnectionAddress;
    this._onEnterDisconnected_Connecting=onEnterDisconnected_Connecting;
    this._onEnterDisconnected_WaitingForReconnectTimeout=onEnterDisconnected_WaitingForReconnectTimeout;
    this._onEnterLoggingOut_WaitingForCleanupTimeout=onEnterLoggingOut_WaitingForCleanupTimeout;
    this._onEnterLoggingOut_Disconnecting=onEnterLoggingOut_Disconnecting;
    this._createStateMachine=createStateMachine;
    this._init=init;

    this.loginToUser=loginToUser;
    this.loginWithEP=loginWithEP;
    this.cancel = cancel;
    this.logout=logout;
    this.getUserConnectionSettings=getUserConnectionSettings;
    this.isLoggedInWithEndpoint=isLoggedInWithEndpoint;
    this.getState=getState;
    this.getLoginName=getLoginName;
    this.getUserName=getUserName;
    this.getEndpointId=getEndpointId;


    init();

}

var servicesModule = angular.module('aeonixApp.services');
servicesModule.service('loginSrv', ['$rootScope', '$timeout', 'deviceSrv', 'connectionSrv', 'connectionAddressFinderSrv', 'infoSrv', 'storageSrv', LoginSrv]);