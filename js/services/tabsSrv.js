
var servicesModule = angular.module('aeonixApp.services');

servicesModule.service('tabsSrv', ['$rootScope', '$state',
    function ($rootScope, $state) {

        var serviceLogger = logSrv.getLogger("tabsSrv");

        this.isShowTabs = {
            show: true
        };
        var tabs=[];
        var tabs = [
            {
                type: 'contacts',
                order: 1,
                show: false,
                active: false,
                title: '',
                icon: 'image/something',
                number: ''
            },
            {
                type: 'chats',
                order: 2,
                show: false,
                active: false,
                title: '',
                icon: 'image/something',
                number: ''
            },
            {
                type: 'calls',
                order: 3,
                show: false,
                active: false,
                title: '',
                icon: 'image/something',
                number: '',
                state: ''
            }
        ];

        this.show = function() {
            tabs = [
                {
                    type: 'contacts',
                    order: 1,
                    show: false,
                    active: false,
                    title: '',
                    icon: 'image/something',
                    number: ''
                },
                {
                    type: 'chats',
                    order: 2,
                    show: false,
                    active: false,
                    title: '',
                    icon: 'image/something',
                    number: ''
                },
                {
                    type: 'calls',
                    order: 3,
                    show: false,
                    active: false,
                    title: '',
                    icon: 'image/something',
                    number: '',
                    state: ''
                }
            ];
        };
        this.getTabs = function () {
            return tabs;
        };
        this.hide = function() {
            for(var i=0; i<tabs.length;i++){
                tabs[i].active = tabs[i].show = false;
            }

            $rootScope.$broadcast('tabs:update');
        };
        this.tabClicked = function (tabType) {
            setActive(tabType);
            startOrUpdate(tabType);
            if(tabType==="calls"){
                $rootScope.$broadcast("sidebar:queueShow", true);
            }
        };



        this.showCalls = function () {
            startOrUpdate('calls');
        };

        this.hideCalls = function () {
            $state.go('home.favorites');
        };

        this.setNumberOfChatContacts = function (number) {
            tabs[1].number = number;
        };

        this.showChats = function (name, number, state) {
            var tab = findTab('chats');
            tab.title = name;
            tab.number = number;
            tab.show = true;

            setActive('chats');
            $rootScope.$broadcast('tabs:update', null);
            startOrUpdate('chat');
        };

        this.hideTab = function (tabType) {
        console.info("hideTab");
            var tab = findTab(tabType);
            if (!tab) {
                return;
            }
            tab.title = '';
            tab.number = '';
            tab.show = false;
            tab.active = false;

            $rootScope.$broadcast('tabs:update', null);

        };

        this.getActive = function () {
            for (var i = 0; i < tabs.length; ++i) {
                if (tabs[i].active) {
                    return tabs[i];
                }
            }
            return null; //will never happen
        };

        function getShowed() {
            for (var i = 0; i < tabs.length; ++i) {
                if (tabs[i].show) {
                    return tabs[i];
                }
            }
            return null; //will never happen
        }


        //can work with switch as well
        function findTab(tabType) {
            for (var i = 0; i < tabs.length; ++i) {
                if (tabs[i].type === tabType) {
                    return tabs[i];
                }
            }
            return null; //will never happen
        }

        function setActive(tabType) {
            for (var i = 0; i < tabs.length; ++i) {
                tabs[i].active = (tabs[i].type === tabType);
            }
        }

        function startOrUpdate(target) {
            var stateTarget = target;
            if ($state.current.name.indexOf(stateTarget) == -1) {
               serviceLogger.fine("moving to state "+"home." + stateTarget);
               $state.go("home." + stateTarget);
            }
            else {
                $rootScope.$broadcast(target + ':update', null);
           }
        }

        this.toJson = function() {
            var j = {};

            j._tabs = tabs;

            for (var attr in this) {
                if (typeof this[attr] != "function") {
                    j[attr] = this[attr];
                }
            }
            return j;
        };

    }]);