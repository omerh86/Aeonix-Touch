var angularUtils = ( function () {
    var srv = {};

    srv.controllers = {};

    srv.registerController = function(name, controller) {
        srv.controllers[name] = controller;
    }

    srv.unregisterController = function(name){
        delete srv[name];
    }

    srv.getController = function(name) {
        return srv.controllers[name];
    }

    srv.getAngularVar = function(varName) {
        return angular.element(document.body).injector().get(varName);
    }

    srv.getService = function(serviceName) {
        return getAngularVar(serviceName);
    }

    return srv;
}())

