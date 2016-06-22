/**
 * Created by niupark on 16/3/16.
 */
var logger = process.logger;
/*
 微信公众号开发验证接口
 */
var NODEDARDER_TOKEN = 'NODEDARDER_TOKEN';

//创建菜单
//{"signature":"1959cb2af670223c6c4f8ff378a46d75c7a1df0b","echostr":"4746598106792845259","timestamp":"1458117187","nonce":"682570961"}

// /public/nodeDarker?signature=1959cb2af670223c6c4f8ff378a46d75c7a1df0b&timestamp=1458117187&nonce=682570961&echostr=4746598106792845259
exports.nodeDarker = function(req, res,next){
    if(req.query.signature
    && req.query.timestamp
        && req.query.nonce
        && req.query.echostr){
        logger.info('微信请求数据:' + JSON.stringify(req.query));
        var param = [NODEDARDER_TOKEN, req.query.timestamp,req.query.nonce];
        var str = param.sort().join('');
        logger.info('排序之后的数据:' + str);
        str = crypt.sha1(str);
        logger.info('sh1加密之后的数据:' + str);
        if (req.query.signature === str){
            logger.info('验证成功..')
            res.send(req.query.echostr);
        }else{
            res.send('error');
        }
    }else{
        logger.error('微信回调的参数错误');
        res.send('error');
    }
}
/*
 微信消息回调接口
 */
exports.nodeDarkerPost = function(req, res,next){
    logger.info('收到微信服务器POST消息');
    logger.info(JSON.stringify(req.body));
}

