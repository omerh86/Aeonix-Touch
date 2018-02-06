var directivesModule = angular.module('aeonixApp.directives');

directivesModule.directive('onLastRepeat',function() {
        return function(scope, element, attrs) {
            if (scope.$last) setTimeout( function() {
                        scope.$emit('onRepeatLast', element, attrs);
                    }, 1);         
        };
    });

directivesModule.directive('chatSend', function() {
        return function(scope, element, attrs) {
            var w = element.parent()[0].clientWidth;
            element.css('width', w + 'px');
            element.find('textarea').css('width', w - element.find('button')[0].clientWidth - 20 + 'px');
        };
    }
);

directivesModule.directive('chatContentHeight',function($window) {
        return function(scope, element, attrs) {
            var elem = document.getElementsByClassName('chat_content')[0];
            var chatSendHeight = document.getElementsByClassName("chat_send")[0].offsetHeight;
            elem.style.height = $window.innerHeight - getPos(elem)[1] - chatSendHeight + 'px';
        };
    }
);


directivesModule.directive('resizable', function() {
    return {
        restrict: 'A',
        scope: {
            callback: '&onResize'
        },
        link: function postLink(scope, elem, attrs) {
            elem.resizable();
            elem.on('resize', function(evt, ui) {
                scope.$apply(function() {
                    if (scope.callback) {
                        scope.callback({
                            $evt: evt,
                            $ui: ui
                        });
                    }
                })
            });
        }
    };
});

directivesModule.directive('fullHeight', function($window) {
        return function(scope, element, attrs) {
            var headerHeight = document.getElementsByClassName("header")[0].clientHeight;
            scope.getWindowDimensions = function() {
                return {
                    'h': $window.innerHeight,
                    'w': $window.innerWidth
                };
            };
            scope.$watch(scope.getWindowDimensions, function(newValue, oldValue) {
                element.css('height', newValue.h - headerHeight + 'px')
            }, true);

            function onResize() {
                scope.$apply();
            }

            angular.element($window).bind('resize', onResize)

            function cleanUp() {
                angular.element($window).off('resize', onResize);
            }

            scope.$on('$destroy', cleanUp);
        };
    }
);

directivesModule.directive('appFullWidth',function($window) {
    return function(scope, element, attrs) {
        // element.css('min-width', 318 * 2 + 'px');
        element.css('min-width', 930 + 'px');
    };
});









directivesModule.directive('userlistHeight', function($window) {
        return function(scope, element, attrs) {
            scope.getWindowDimensions = function() {
                return {
                    'h': $window.innerHeight,
                    'w': $window.innerWidth
                };
            };
            element.css('height', scope.getWindowDimensions.h - getPos(element[0])[1] + 'px');
            scope.$watch(scope.getWindowDimensions, function(newValue, oldValue) {
                    element.css('height', newValue.h - getPos(element[0])[1] + 'px');
                }, true);

        	function onResize() {
                scope.$apply();
                scope.$broadcast('rebuild:me');
            }

		    function cleanUp() {
		        angular.element($window).off('resize', onResize);
			}

			angular.element($window).bind('resize', onResize);
		        scope.$on('$destroy', cleanUp);
		    };
});

directivesModule.directive('displayHoverActions',function() {
        return function(scope, element, attrs) {
            element.bind("mouseenter", function() {
                var item = element.parent().parent()[0].querySelector(".actions");
                angular.element(item).addClass('active');
            });
            element.parent().parent().bind("mouseleave", function() {
                var item = element.parent().parent()[0].querySelector(".actions");
                angular.element(item).removeClass('active');
            });
        }
    }
);

directivesModule.directive(
    'keypadNumber',
    function($rootScope, $timeout) {
        return function(scope, element, attrs) {

            var canvasInput;

            $timeout(
                function() {
                    var width = document.getElementById('canvas').width = window.innerWidth - 65;
                    canvasInput = new CanvasInput({
                        canvas: document.getElementById('canvas'),
                        fontSize: 32,
                        fontFamily: 'sans-serif',
                        fontColor: '#4a4a4a',
                        fontWeight: '300',
                        width: width,
                        borderWidth: 0,
                        borderRadius: 0,
                        boxShadow: 'none',
                        innerShadow: 'none',
                        placeHolder: ''
                    });

                    canvasInput.value(scope.keypad.searchTerm);

                    scope.$watch(
                        function() {
                            return scope.keypad.searchTerm;
                        },
                        function(newValue, oldValue) {
                            canvasInput.value(newValue);
                        }, false
                    );

                }, 3000);
        }
    }
);



directivesModule.directive('dropMenu', ['$document',function($document) {
            return {
                restrict: 'A',
                link: function(scope, element, attrs) {

                    var menuElement = angular.element(document.querySelector('#dropMenuElem'));
                    var menu = menuElement[0];
                    var rect = element[0].getBoundingClientRect();
                    // TODO to good constants
                    var height = 180;
                    var _height = 50;
                    var left = 17;

                    element.bind('click', function() {
                            if (menu.classList.contains("active")) {
                                menuElement.removeClass('active');
                            } else {
                                menuElement.addClass('active');
                            }
                            if (attrs.dropMenu == 'up') {
                                menuElement.removeClass('down');
                                if (!menu.classList.contains("up")) {
                                    menuElement.addClass('up');
                                }
                                menu.style.top = (rect.top - height) + 'px';
                                menu.style.left = (rect.left - left) + 'px';
                            }
                            if (attrs.dropMenu == 'down') {
                                menuElement.removeClass('up');
                                menu.style.top = (rect.top + _height) + 'px';
                                menu.style.left = (rect.left - left) + 'px';
                            }
                        }
                    );
                    $document.bind(
                        'click',
                        function(event) {
                            if (event.target.hasAttribute('drop-menu')) {
                                return;
                            }
                            if (menu.classList.contains("active")) {
                                menuElement.removeClass('active');
                            }
                        }
                    );
                }
            };
        }
    ]
);


directivesModule.directive('intouchTimer', ['$interval', function($interval) {
    return {
        restrict: 'A',
        template: '<span ng-if="encrypted" class="icon"></span> {{time}} ',
        scope: {
            start: '=start',
            encrypted: '=encrypted'
        },
        link: function postLink(scope, elem, attrs) {
            if (scope.start) {
                while (moment().format("SSS") != "000"); // for sync use
                var stopTime = $interval(function () {
                    scope.time = moment().subtract(scope.start).format("HH:mm:ss");
                }, 500);

                function cleanUp() {
                    $interval.cancel(stopTime);
                }

                scope.$on('$destroy', cleanUp);
            }
        }
    };
}]);

directivesModule.directive(
    'intouchSpinner', [
        '$rootScope', '$timeout',
        function($rootScope, $timeout) {
            return {
                restrict: 'A',
                link: function(scope, elem) {
                    var spinnerTimeoutPromise;
                    var spinnerDelayPromise;
                    $rootScope.$on(
                        "spinner:update",
                        function(args, isShow, withTimeout) {
                            //scope.spinnerMessage = message && message.length ? message : "Loading";
                            //var display = isShow ? "block" : "none";
                            //elem[0].style.display = display;
                            $timeout.cancel(spinnerTimeoutPromise);
                            $timeout.cancel(spinnerDelayPromise);
                            var display = isShow ? "block" : "none";
                            var element = elem[0];
                            //element.style.display = display;

                            spinnerDelayPromise = $timeout(
                                function() {
                                    element.style.display = display;
                                }, 1000
                            );

                            if (isShow && withTimeout) {
                                spinnerTimeoutPromise = $timeout(
                                    function() {
                                        element.style.display = "none";
                                    }, 10000
                                );
                            }
                        }
                    );
                }
            };
        }
    ]
);

directivesModule.directive(
    'screenLock', [
        '$rootScope', '$state', 'primaryCallSrv',
        function($rootScope, $state, primaryCallSrv) {
            return {
                restrict: 'A',
                link: function(scope, elem, attrs) {
                    $rootScope.$on(
                        "screenLockEvent",
                        function(args, isLock) {
                            var call = primaryCallSrv.getPrimaryCall();
                            if (call != null && call.State == eCallState.Active && $state.current.name == 'home.calls' && isLock) {
                                elem[0].style.display = "block";
                            } else {
                                elem[0].style.display = "none";
                            }
                        }
                    );
                }
            };
        }
    ]
);

directivesModule.directive('mobileHeight', ['$rootScope', '$interval', '$timeout',
        function($rootScope, $interval, $timeout) {
            return {
                restrict: 'A',
                //link: function (scope, elem, attrs) {
                link: function(scope, elem, attrs) {

                    var view;

                    scope.$watch(
                        function() {
                            return elem[0].offsetTop;
                        },
                        function(newValue, oldValue) {
                            view.style.height = ($rootScope.fullDomHeight - view.offsetTop) + "px";
                        }
                    );

                    var runFunction = function() {
                        view = elem[0];
                        view.style.height = ($rootScope.fullDomHeight - view.offsetTop) + "px";
                    };

                    runFunction();

                    if ($rootScope.isFullDomHeightRecalculated) {
                        runFunction();
                    } else {
                        $timeout(
                            function() {
                                runFunction();
                            }, 1000
                        );
                    }

                }
            };
        }
    ]
);

directivesModule.directive('keypadHeight', ['$interval', '$timeout',
        function($interval, $timeout) {
            return {
                restrict: 'A',
                link: function(scope, elem, attrs) {
                    var stop;

                    var timeoutPromise;

                    stop = $interval(
                        function() {
                            if (document.querySelector(".item-digit")) {
                                var header = document.querySelector("#menu");
                                var keypad = document.querySelector(".keypad");
                                if (header && keypad) {

                                    var runFunction = function() {
                                        elem[0].style.height = ($rootScope.fullDomHeight - header.offsetHeight - keypad.offsetHeight) + "px";
                                    };
                                    var delay = (!$rootScope.isFullDomHeightRecalculated) ? 1000 : 0;
                                    runFunction();
                                    if ($rootScope.isFullDomHeightRecalculated) {
                                        $timeout.cancel(timeoutPromise);
                                        runFunction();
                                    } else {
                                        $timeout.cancel(timeoutPromise);
                                        timeoutPromise = $timeout(
                                            function() { //waiting for precise calculation of fullDomHeight
                                                runFunction();
                                            }, delay
                                        );
                                    }
                                }
                                stopInterval();
                            }
                        }, 100
                    );

                    function stopInterval() {
                        $interval.cancel(stop);
                    }
                }
            }
        }
    ]
);

directivesModule.directive('autofocus', ['$timeout',function($timeout) {
        return {
            restrict: 'A',
            link: function($scope, $element) {
                $timeout(function() {
                    $element[0].focus();
                });
            }
        }
    }
]);

angular.module('ngTap', []).directive(
    'ngTap',
    function($timeout) {
        return function(scope, element, attrs) {

            var longTapTimeoutPromise;
            element.get()[0].addEventListener(
                'touchstart',
                function() {
                    scope.longTap = true;
                    longTapTimeoutPromise = $timeout(
                        function() {
                            if (scope.longTap) {
                                scope.$apply(attrs.ngLongTap, element);
                            }
                        }, 600);
                }
            );

            element.get()[0].addEventListener(
                'touchend',
                function() {
                    scope.longTap = false;
                    $timeout.cancel(longTapTimeoutPromise);
                    scope.$apply(attrs.ngTap, element);
                }
            );
        };
    }
);



function getPos(ele) {
    var x = 0;
    var y = 0;
    while (true) {
        x += ele.offsetLeft;
        y += ele.offsetTop;
        if (ele.offsetParent === null) {
            break;
        }
        ele = ele.offsetParent;
    }
    return [x, y];
}



directivesModule.directive(
    'scrollToBottom',
    function($timeout) {
        return {
            restrict: 'A',
            scope: {
                list: '=scrollToBottom'
            },
            link: function(scope, element, attrs) {

                $timeout(
                    function() {
                        element.scrollTop(element[0].scrollHeight);
                    }, 0
                );

                scope.$watch(
                    function() {
                        return scope.list.length;
                    },
                    function(newValue, oldValue) {
                        if (newValue) {
                            $timeout(
                                function() {
                                    element.scrollTop(element[0].scrollHeight);
                                }, 0
                            );
                        }
                    }
                );
            }
        }
    }
);

directivesModule.directive('onFinishRender', function ($timeout) {
        return {
            restrict: 'A',
            link: function (scope, element, attr) {
                if (scope.$last === true) {
                   $timeout(function () {
                      scope.$parent.$broadcast('rebuild:me');
                    });
                }
            }
        };
 });