var arrayUtils = ( function () {
    var srv = {};


    function contains(arr, value) {
        if (!arr) return false;
        return arr.indexOf(value)!=-1;
    }

    function isEmpty(arr) {
        if (!arr) return true;
        if (!arr.length) return true;
        return false;
    }

    function firstElement(arr,defaultValue) {
        if (!arr) return defaultValue;
        if (!arr.length) return defaultValue;
        return arr[0];
    }

    function appendArray(arr1, arr2) {
        if (!this.isEmpty(arr2)) {
            for (var i=0;i<arr.length;i++) {
                arr1.push(arr2[i]);
            }
        }
    }

    function join(arr, separator) {
        var res = "";
        if (arr && arr.length) {
            res = arr.join(separator);
        }
        return res;
    }




    srv.contains = contains;
    srv.firstElement = firstElement;
    srv.join = join;
    srv.isEmpty = isEmpty;
    srv.appendArray = appendArray;

    return srv;
}())



