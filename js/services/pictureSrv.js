function PictureSrv($rootScope, infoSrv, deviceSrv) {

    var serviceLogger = logSrv.getLogger("pictureSrv");

    function getPictureFromServer(userName) {
        var logger = serviceLogger.logMethodCall(arguments,eLogLevel.finer);

        var obj = {
            GetPicture: {
                userName: userName
            }
        };
        infoSrv.sendRequest(obj);
    };

    function getPicture(userName, imageSignature) {
        var logger = serviceLogger.logMethodCall(arguments,eLogLevel.finer);
        try {

            var picture = "img/user-placeholder-big.png";
            var signature =0;
             if (imageSignature !== 0) {
                picture = deviceSrv.readFromStorage(userName + "Picture");

                if (!picture || picture == "{}") {
                    logger.finest("No local picture for ", userName);
                    getPictureFromServer(userName);
                    picture = "img/user-placeholder-big.png";
                } else {
                    var obj = angular.fromJson(angular.fromJson(picture));
                    picture = obj.picture;
                    signature = obj.signature;
                    if (signature !== imageSignature) {
                        logger.logGroup("The signatures do not match", ["local image signature", "current signature"], [signature, imageSignature],eLogLevel.finer);
                        getPictureFromServer(userName);
                    }
                }
            }
        }catch(err){
            logger.error(err);
        }

        logger.logMethodCompleted(arguments, picture, eLogLevel.finer);
        return picture;
    };

    function onPictureUpdate(event, contactPicture) {
        var logger = serviceLogger.logMethodCall(arguments,eLogLevel.finer);
        try {

            var pic = IMAGE_FORMAT + contactPicture.imageContent;
            var userName = contactPicture.userName;
            var signature = contactPicture.imageSignature;

            var pictureInfo = {
                picture: pic,
                signature: signature
            };
            deviceSrv.writeToStorage(userName + "Picture", angular.toJson(pictureInfo));
            $rootScope.$broadcast("pictureSrv:pictureUpdated", userName, pictureInfo);
        }catch(err){
            logger.error(err);
        }
    }


    this._getPictureFromServer = getPictureFromServer;
    this._onPictureUpdate = onPictureUpdate;

    this.getPicture = getPicture;

    $rootScope.$on("picture:update", onPictureUpdate);

}

var servicesModule = angular.module('aeonixApp.services');
servicesModule.service('pictureSrv', ['$rootScope', 'infoSrv', 'deviceSrv',PictureSrv]);