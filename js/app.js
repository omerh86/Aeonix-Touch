var appLogger =logSrv.getLogger("aeonixApp");


angular.module('aeonixApp.controllers', []);
angular.module('aeonixApp.services', []);
angular.module('aeonixApp.directives', []);
angular.module('aeonixApp.providers', []);
angular.module('aeonixApp.filters', []);
angular.module('aeonixApp.models', []);
angular.module('aeonixApp.factories', []);
angular.module('aeonixApp', []);

var aeonixApp = angular.module(
    'aeonixApp', [
        'aeonixApp.controllers',
        'aeonixApp.services',
        'aeonixApp.directives',
        'aeonixApp.providers',
        'aeonixApp.filters',
        'aeonixApp.models',
        'aeonixApp.factories',
        'timer',
        'ngMaterial',
        'ui.bootstrap',
        'ui.router',
        'ngScrollbar',
        'ngCookies',
        'ngSanitize',
        'infinite-scroll',
        'ngTouch',
        'ngLocalize',
        'ngLocalize.Config',
        'ngTap'
    ]
).value(
    'localeSupported', [
        'en-US',
        'he-IL',
        'zh-CH',
        'ru-RU',
        'es-SP',
        'pt-PT'
    ]
);




function onAppRun($rootScope, deviceSrv, utilsSrv, loginSrv, $state, locale, $document, $timeout) {
    appLogger.fine("onAppRun");
    try {
        $document.on('keydown', function(e){
            if(e.which === 8 && e.target.nodeName !== "INPUT" && e.target.nodeName !== "TEXTAREA"){ // you can add others here.
                e.preventDefault();
            }
        });

        // capture user interface navigation activity
        $rootScope.$on('$stateChangeStart', function (event, toState, toParams, fromState, fromParams) {
            appLogger.fine("UI ACTIVITY: state changed fromState: " + fromState.name + "; toState: " + toState.name);
            $rootScope.currentState = toState;
        });

        // capture user interface mouse activity
        $document.on('click', function (e) {                            
            appLogger.fine("UI ACTIVITY: click element/class: " + utilsSrv.elementToLog(e.target));                            
        });

        $state.go('login');

    }catch(err){
        appLogger.error(err);
    }
}

function onAppConfig($urlRouterProvider, $stateProvider) {
  $urlRouterProvider.otherwise('/contacts');
  $stateProvider
      .state(
      'login', {
          url: '/login',
          params: {'loginName': null, 'password':null},
          templateUrl: 'views/login/login-page.html'
      }
  )
      .state(
      'loginDetail', {
          url: '/login.detail',
          params: {'password': null},
          templateUrl: 'views/login/login-detail-page.html'
      }
  )
      .state(
      {
          name: 'home',
          url: "home",
          templateUrl: "views/share/main_empty.html"
      }
  )
       .state(
        {
            name: 'home.about',
            url: '/about',
            templateUrl: "views/about.html"
        }
  )
      .state(
      {
          name: 'home.settings',
          url: '/settings',
          templateUrl: "views/settings/settings.html"
      }
  )
      .state(
      {
          name: 'home.favorites',
          url: '/favorites',
          templateUrl: "views/contacts/favorites.html"
      }
  )
      .state(
      {
         name: 'home.callLog',
         url: '/callLog',
         templateUrl: "views/contacts/callLog.html"
      }
  )
      .state(
      {
         name: 'home.groups',
         url: '/groups',
         templateUrl: "views/contacts/groups.html"
      }
  )
       .state(
       {
         name: 'home.contacts',
         url: '/contacts',
         templateUrl: "views/contacts/contacts.html"
       }
  )
      .state(
      {
          name: 'home.chatList',
          url: '/chatList',
          templateUrl: "views/chats/chatList.html"
      }
  )

      .state(
      {
          name: 'home.chat',
          url: '/chat',
          params: {'contact': null},
          templateUrl: "views/chats/chat.html"
      }
  )
      .state(
      {
          name: 'home.calls',
          url: '/calls',
          params: {'call': null},
          templateUrl: "views/calls/calls.html"
      }
  )
      .state(
      {
          name: 'home.dialPad',
          url: '/dialPad',
          params: {'contactId': null},
          templateUrl: "views/keypad/dialPad.html"
      }
  )   .state(
      {
         name: 'home.keypad',
         url: '/keypad',
         params: {'callNativeToken': null},
         templateUrl: "views/keypad/keypad.html"
      }
  )
      .state(
      {
          name: 'home.dialPadList',
          url: '/dialPadList',
          templateUrl: "views/keypad/dialPadList.html"
      }
  )
      .state(
      {
          name: 'home.contactDetails',
          url: '/contactDetails',
          params: {'contactId': null},
          templateUrl: "views/contacts/contactDetails.html"
      }
  )
      .state(
      {
          name: 'home.changePassword',
          url: '/changePassword',
          templateUrl: "views/changePassword.html"
      }
  )
      .state(
      {
          name: 'home.queue',
          url: '/queue',
          templateUrl: "views/calls/queue.html"
      }
  );
}

aeonixApp.factory('$exceptionHandler', function () {
    return function (exception, cause) {
        appLogger.error(exception);
    };
});


aeonixApp.run(["$rootScope", "deviceSrv", "utilsSrv", "loginSrv", "$state", 'locale','$document','$timeout',onAppRun]);
aeonixApp.config(onAppConfig);

aeonixApp.config(function($provide) {
  $provide.decorator("$rootScope", function($delegate) {
    var Scope = $delegate.constructor;
    var origBroadcast = Scope.prototype.$broadcast;
    var origEmit = Scope.prototype.$emit;

    Scope.prototype.$broadcast = function() {
      try {
        var arr = Array.prototype.slice.call(arguments);
        var eventName = arr.splice(0,1);
        appLogger.logCollapsed(eventName+" event has been broadcasted",arr,eLogLevel.finer);
      }catch(e) {}
      return origBroadcast.apply(this, arguments);
    };
    Scope.prototype.$emit = function() {
      try {
        var arr = Array.prototype.slice.call(arguments);
        var eventName = arr.splice(0,1);
        appLogger.logCollapsed(eventName+" event has been emitted",arr,eLogLevel.finer);
      }catch(e) {}

      return origEmit.apply(this, arguments);
    };
    return $delegate;
  });
});




