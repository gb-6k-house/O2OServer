
var fs = require('fs');
var path = require("path");
var log4js = require('log4js');
exports.init = function(confige){
    // 加载配置文件
    var objConfig = JSON.parse(fs.readFileSync(confige, "utf8"));
   //检查配置文件所需的目录是否存在，不存在时创建
    if(objConfig.appenders){
        for(var i= 0, j=objConfig.appenders.length; i<j; i++){
            var item = objConfig.appenders[i];
            if(item["type"] == "console")
                continue;
            var fileName = item["filename"];
            if(fileName == null)
                continue;
            var pattern = item["pattern"];
            if(pattern != null){
                fileName += pattern;
            }
            var dir = path.dirname(fileName);
            checkAndCreateDir(dir);
        }
    }
    log4js.configure(objConfig);

    var logInfo = log4js.getLogger('log4js');
    var logErr = log4js.getLogger('logErr');
    var logConsole = log4js.getLogger('console');
    function writeInfo (msg){
        if(msg == null)
            msg = "";
        logConsole.info(msg);
        logInfo.info(msg);
    };

    function writeWarn(msg){
        if(msg == null)
            msg = "";
        logConsole.warn(msg);
        logInfo.warn(msg);
    };

    function writeErr (msg){
        if(msg == null)
            msg = "";
        logConsole.error(msg);
        logErr.error(msg);
    };

    return {
        info:function(logmsg){writeInfo(logmsg)},
        warn:function(logmsg){writeWarn(logmsg)},
        error:function(logmsg){writeErr(logmsg)},
    };
}

// 判断日志目录是否存在，不存在时创建日志目录
function checkAndCreateDir(dir){
    if(!fs.existsSync(dir)){
        fs.mkdirSync(dir);
    }
}

// 指定的字符串是否绝对路径
function isAbsoluteDir(path){
    if(path == null)
        return false;
    var len = path.length;

    var isWindows = process.platform === 'win32';
    if(isWindows){
        if(len <= 1)
            return false;
        return path[1] == ":";
    }else{
        if(len <= 0)
            return false;
        return path[0] == "/";
    }
}