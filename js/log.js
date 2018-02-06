function deepCopy(obj) {
    try {
        return angular.copy(obj);
    }catch (err) {
        return obj;
    }
}


function LogLevel(value, label) {
    this.value = value;
    this.label = label;
}

var eLogLevel = {
    parse: function(s) {
        s = s.toLowerCase();
        switch (s){
            case "off":
                return eLogLevel.off;
            case "error":
            case "err":
                return eLogLevel.error;
            case "warn":
            case "warning":
                return eLogLevel.warn;
            case "info":
                return eLogLevel.info;
            case "config":
                return eLogLevel.config;
            case "fine":
                return eLogLevel.fine;
            case "finer":
                return eLogLevel.finer;
            case "finest":
                return eLogLevel.finest;
        }
        throw new Error("Unexpected value - "+s);
    },
    off: new LogLevel(0,"off"),
    error:new LogLevel(1,"error"),
    warn:new LogLevel(2,"warn"),
    info:new LogLevel(3,"info"),
    config:new LogLevel(4,"config"),
    fine:new LogLevel(5,"fine"),
    finer:new LogLevel(6,"finer"),
    finest:new LogLevel(7,"finest")
};

function SimpleLogRecord(caption, value, loggerName, level) {
    this.header = caption;
    this.value = value;
    this.loggerName = loggerName;
    this.level = level;
}

function LogRecordItem (name, value) {
    this.name = name;
    this.value = value;
}

function LogRecord(caption, names, values, loggerName, level) {
    this.header = caption;
    items = [];
    this.items = items;
    for(var i=0;i<names.length;i++) {
        items.push(new LogRecordItem(names[i],values[i]));
    }
    this.loggerName = loggerName;
    this.level = level;
}


function LogStringify(obj) {
     if (typeof obj !== "string") {
        try {
            obj = JSON.stringify(obj, null, 4)
        }catch (err) {
            obj = "" + obj;
        }
     }
     return obj;
}


window.devtoolsFormatters = [{

    header: function (obj) {
        if (obj instanceof LogRecord) {
            return ["div", {}, obj.level.label+">"+obj.loggerName+">"+obj.header];
        } else if (obj instanceof LogRecordItem) {
            var s = obj.name;
            return ["div", {}, s];
        } else if (obj instanceof SimpleLogRecord) {
            return ["div", {}, obj.level.label+">"+obj.loggerName+">"+obj.header];
        } else return null;
    },

    hasBody: function (obj) {
        return (obj instanceof LogRecord) || (obj instanceof SimpleLogRecord) || (obj instanceof LogRecordItem);
    },

    body: function (obj, config) {
        if (obj instanceof SimpleLogRecord || obj instanceof LogRecordItem) {
            return ["div", {}, LogStringify(obj.value)];
        }else if (obj instanceof LogRecord) {
            var  arr =  ["ol", {}];
            var i;
            for (i = 0; i < obj.items.length; i++) {
                var tmp = ["li", {}, ["object", { "object": obj.items[i] }]];
                arr.push(tmp);
            }
            return arr;
        }
    }
}]


function DirLogPrinter () {
    this.log = function(record, loggerName, level) {
        console.log(level.label+">"+loggerName+">"+record);
    };
    this.logGroup = function(groupCaption, captions, records, loggerName, level) {
        for (var i=0;i<records.length;i++) {
            records[i]=deepCopy(records[i]);
        }
        console.groupCollapsed(level.label+">"+loggerName+">"+groupCaption);
        for (var i=0;i<records.length;i++) {
            console.log(captions[i]+": %O",records[i]);
        }
        console.groupEnd();
    };
    this.logCollapsed = function(caption, record, loggerName, level) {
        record = deepCopy(record);
        console.groupCollapsed(level.label+">"+loggerName+">"+caption);                
        console.dir(record);
        console.groupEnd();
    };
    this.logError = function(error, loggerName) {
        if (error instanceof Error) {
            this.logCollapsed(error.message,e.stack.toString(),loggerName, eLogLevel.error);
        }else {
            this.log(error,loggerName,eLogLevel.error);
        }
    }
}


function ConsoleLogPrinter () {
    this.log = function(record, loggerName, level) {
        console.log(level.label+">"+loggerName+">"+record);
    };
    this.logGroup = function(groupCaption, captions, records, loggerName, level) {
        for (var i=0;i<records.length;i++) {
            records[i]=deepCopy(records[i]);
        }
        var logRecord = new LogRecord(groupCaption,captions,records,loggerName,level);
        console.log(logRecord);
    };
    this.logCollapsed = function(caption, record, loggerName, level) {
        record = deepCopy(record);
        var logRecord = new SimpleLogRecord(caption,record,loggerName,level);
        console.log(logRecord);
    };
    this.logError = function(error, loggerName) {
        if (error instanceof Error) {
            this.logCollapsed(error.message,e.stack.toString(),loggerName, eLogLevel.error);
        }else {
            this.log(error,loggerName,eLogLevel.error);
        }
    }
}


function SimpleConsoleLogPrinter () {

    function getTime() {
        var time = new Date();
        return time.getHours() + ":" + time.getMinutes() + ":" + time.getSeconds()+"."+time.getMilliseconds()+" ";
    }

    this.log = function(record, loggerName, level) {
        console.log(getTime()+level.label+">"+loggerName+">"+record);
    };
    this.logGroup = function(groupCaption, captions, records, loggerName, level) {
        var s = getTime()+ level.label+">"+loggerName+">"+groupCaption;
        for(var i=0;i<captions.length;i++) {
            s+=('\n'+captions[i]);
            s+=('\n'+LogStringify(records[i]));
        }
        console.log(s);
    };
    this.logCollapsed = function(caption, record, loggerName, level) {
        var s = getTime()+ level.label+">"+loggerName+">"+caption;
        s+=('\n'+LogStringify(record));

        console.log(s);
    };
    this.logError = function(error, loggerName) {
        if (error instanceof Error) {
            this.logCollapsed(error.message,error.stack.toString(),loggerName, eLogLevel.error);
        }else {
            this.log(error,loggerName,eLogLevel.error);
        }
    }
}

function FileLogPrinter () {
    this.log = function(record, loggerName, level) {
        fileLogger.log(record,loggerName,level.label);
    };
    this.logGroup = function(groupCaption, captions, records, loggerName, level) {
        var s = level.label+">"+loggerName+">"+groupCaption;
        var records1 = [];
        for(var i=0;i<records.length;i++) {
            records1.push(LogStringify(records[i]));
        }
        fileLogger.logGroup(groupCaption, captions, records, loggerName, level.label);
    };
    this.logCollapsed = function(caption, record, loggerName, level) {
        fileLogger.logCollapsed (caption, LogStringify(record), loggerName, level.label);
    };
    this.logError = function(error, loggerName) {
        if (error instanceof Error) {
            this.logCollapsed(error.message,error.stack.toString(),loggerName, eLogLevel.error);
        }else {
            this.log(error,loggerName,eLogLevel.error);
        }
    }
}




var logSrv = (function () {

    var rootLogger;
    


    function Logger(fullName, shortName, level) {
        var logger = this;
        this.level = level;
        this.fullName = fullName;
        this.shortName = shortName;



        function getChildLogger(shortName) {
            var childLogger = logger[shortName];
            if (!childLogger) {
                var childLoggerFullName;
                if (logger.fullName!=".") {
                    childLoggerFullName = logger.fullName+"."+shortName;
                }else {
                    childLoggerFullName = shortName;
                }


                childLogger = new Logger(childLoggerFullName, shortName, logger.level);
                logger[shortName] = childLogger;
            }
            return childLogger;
        }

        function setLevel(level, applyToDescendants){
            if (typeof level === "string") {
                level = eLogLevel.parse(level);
            }else if (!(level instanceof LogLevel)) {
                throw new Error("Wrong type of level parameter");
            }
            logger.level = level;
            if (applyToDescendants) {
                for(var propertyName in logger) {
                    if (logger[propertyName] instanceof  Logger) {
                        var childLogger = logger[propertyName];
                        childLogger.setLevel(level,applyToDescendants);
                    }
                }
            }
        }

        function getLevel() {
            return logger.level;
        }

        function log() {
            var level = arguments[arguments.length-1];
            if (level.value<=logger.level.value) {
                var s ="";
                for (var i=0;i<arguments.length-1;i++) {
                    s=s+LogStringify(arguments[i]);
                }
                rootLogger.printer.log(s,logger.fullName,level);
            }
        }

        function logMethodCall(arguments, level) {
            var methodName = arguments.callee.toString();
            methodName = methodName.substr('function '.length);
            methodName = methodName.substr(0, methodName.indexOf('('));

            var params = [];
            for (var i=0;i<arguments.length;i++) {
                var param = arguments[i];
                if (!param || !param.targetScope) {
                    params.push(param);
                }
            }

            var methodLogger = this.getChildLogger(methodName);
            if (params.length>0) {
                methodLogger.logCollapsed(methodName+" called",params, level);
            }else {
                methodLogger.log(methodName+" called",level);
            }


            return methodLogger;
        }

        function logMethodCompleted(arguments, obj, level) {
            var methodName = arguments.callee.toString();
            methodName = methodName.substr('function '.length);
            methodName = methodName.substr(0, methodName.indexOf('('));


            var methodLogger = this.getChildLogger(methodName)

            methodLogger.logCollapsed(methodName+" completed", obj, level);

        }

        function logGroup(groupCaption, captions, records, level) {
            if (level.value<=logger.level.value) {
                rootLogger.printer.logGroup(groupCaption, captions, records,logger.fullName,level);
            }
        }

        function logCollapsed(caption, record, level){
            if (level.value<=logger.level.value) {
                rootLogger.printer.logCollapsed(caption, record, logger.fullName,level);
            }
        }

        function error(err){
            //todo michael
            console.error(err);
            if (logger.isErrorEnabled()) {
                rootLogger.printer.logError(err, logger.fullName);
            }
        }

        function warn(record) {
            var args = Array.prototype.slice.call(arguments);
            args.push(eLogLevel.warn);
            log.apply(logger,args);
        }

        function info(record) {
            var args = Array.prototype.slice.call(arguments);
            args.push(eLogLevel.info);
            log.apply(logger,args);
        }

        function config(record) {
            var args = Array.prototype.slice.call(arguments);
            args.push(eLogLevel.config);
            log.apply(logger,args);
        }

        function fine(record) {
            var args = Array.prototype.slice.call(arguments);
            args.push(eLogLevel.fine);
            log.apply(logger,args);
        }

        function finer(record) {
            var args = Array.prototype.slice.call(arguments);
            args.push(eLogLevel.finer);
            log.apply(logger,args);
        }

        function finest(record) {
            var args = Array.prototype.slice.call(arguments);
            args.push(eLogLevel.finest);
            log.apply(logger,args);
        }

        function isErrorEnabled(){
            return logger.level.value<=eLogLevel.error.value;
        }

        function isWarnEnabled() {
            return logger.level.value<=eLogLevel.warn.value;
        }

        function isInfoEnabled() {
            return logger.level.value<=eLogLevel.info.value;
        }

        function isConfigEnabled() {
            return logger.level.value<=eLogLevel.config.value;
        }

        function isFineEnabled() {
            return logger.level.value<=eLogLevel.fine.value;
        }

        function isFinerEnabled() {
            return logger.level.value<=eLogLevel.finer.value;
        }

        function isFinestEnabled() {
            return logger.level.value<=eLogLevel.finest.value;
        }




        //public methods

        this.getChildLogger = getChildLogger;
        this.setLevel = setLevel;
        this.getLevel = getLevel;
        this.log = log;
        this.logMethodCall = logMethodCall;
        this.logMethodCompleted = logMethodCompleted;
        this.logGroup = logGroup;
        this.logCollapsed = logCollapsed;
        this.error = error;
        this.warn = warn;
        this.info = info;
        this.config = config;
        this.fine = fine;
        this.finer = finer;
        this.finest = finest;
        this.isErrorEnabled = isErrorEnabled;
        this.isWarnEnabled = isWarnEnabled;
        this.isInfoEnabled = isInfoEnabled;
        this.isConfigEnabled = isConfigEnabled;
        this.isFineEnabled = isFineEnabled;
        this.isFinerEnabled = isFinerEnabled;
        this.isFinestEnabled = isFinestEnabled;

    }

    function getLogger(fullName) {
        var nameArr= fullName.split('.');
        var logger = rootLogger;
        for(var i=0;i<nameArr.length;i++){
            logger = logger.getChildLogger(nameArr[i]);
        }
        return logger;
    }

    function setLevelsFromConfiguration(config){
        var s = config.replace('/r','/');
        var rows = s.split('\n');
        for (var i=0;i<rows.length;i++){
           var row = rows[i];
           var arr = s.split('=');
           if (arr.length!=2) {
               throw new Error("Invalid syntax. Row "+(i+1));
           }else {
               var loggerName = arr[0];
               var levelName = arr[1];
               var logger = getLogger(loggerName);
               var level = parseLevel(levelName);
               logger.setLevel(level,true);
           }
        }
    }

    rootLogger =  new Logger(".",".",eLogLevel.info);
    
    rootLogger.printer = new SimpleConsoleLogPrinter();
    //rootLogger.printer = new DirLogPrinter();
    //rootLogger.printer = new FileLogPrinter();

    rootLogger.getLogger = getLogger;

    rootLogger.setLevelsFromConfiguration = setLevelsFromConfiguration;

    rootLogger.LogLevel = eLogLevel;

    return rootLogger;


}());



