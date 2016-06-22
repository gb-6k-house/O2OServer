/**
 * Created by niupark on 16/3/22.
 */
var logger = process.logger;

//通行证授权页面 ,该页面由微信授权之后回调
exports.passportManager = function(req, res,next) {
    logger.info(req.url + '授权页面回调');
    if(!req.query.code){
        logger.info('用户授权失败..!');
        res.end();
    }else {
        res.render('accessControl.html', {});

    }
}
