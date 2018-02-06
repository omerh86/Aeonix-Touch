var stringUtils = ( function () {
    var srv = {};


    function isEmpty(s) {
        if (s==undefined) return true;
        if (s=='') return true;
        return false;
    }


    srv.isEmpty = isEmpty;

    return srv;
}())



