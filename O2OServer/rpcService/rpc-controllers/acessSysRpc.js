/**
 * Created by niupark on 16/3/22.
 */
var logger = process.logger;
var crypt = require('../../public/utils/crypt');
var moment = require('moment');
const oauth = require('node-weixin-oauth');

var confige = require('../configes/confige');
var db = require('../configes/myRedisDB');
var redis = require('redis').createClient(confige.redis.port, confige.redis.ip);
var QRCode = require('qr-image');
var uuid = require('node-uuid');
var fs = require('fs');

/*
 *接口名 vertifyPassport
 *描述 识别门禁信息
 * 算法:
 * 有效期不能大于5分钟
 * 用户必须是属于当前企业号
 * 入参数{
 * passport: //门禁字符串
 * }
 * */
function vertifyPassport(app, passport, cb) {
    try {
        var openid = passport;
        //通行证超过5分钟,或者已经识别,则无效
        redis.hget(db.weixinPublicDB.PassPort, openid, function (e, v) {
            if (e) {
                logger.error('redis 内部错误');
                typeof cb === 'function' && cb(false);
            } else if (!v) {
                logger.info('通行证已失效');
                typeof cb === 'function' && cb(false);
            } else {
                var passObj = JSON.parse(v);
                var duration = moment().diff(moment(passObj.createDate, 'YYYY-MM-DD HH:mm:ss'));
                logger.info('通行证存在时间'+ duration);
                if (duration > 5 * 60 * 1000) {
                    logger.info('通行证已失效');
                    typeof cb === 'function' && cb(false);
                } else {
                    typeof cb === 'function' && cb(true, {
                        hostName: passObj.nickname,
                        city: passObj.city,
                        province: passObj.province,
                        hostHeadUrl: passObj.headimgurl,
                        date: passObj.createDate
                    });
                }
                //校验成功之后,删除
                redis.hdel(db.weixinPublicDB.PassPort, passObj.openid, function (e) {
                    qiniuImageDelete(passObj.key);
                });
            }

        });

    } catch (e) {
        logger.error(e);
        typeof cb === 'function' && cb(false);
    }
}

function qiniuImageDelete(image) {
    if (!image) return;
    var qiniu = require("node-qiniu");

//需要填写你的 Access Key 和 Secret Key
    qiniu.config({
        access_key: confige.qiniu.accesskey,
        secret_key: confige.qiniu.secretkey
    });

//要上传的空间
    var imagesBucket = qiniu.bucket(confige.qiniu.fileSpace);
    imagesBucket.key(image).remove(function (err) {
        if (err) {
            logger.errno(err);
        } else {
            logger.info('七牛资源删除成功:' + image);
        }
    });
}
function qiuniuUploadToken(key) {
    var qiniu = require("node-qiniu");

//需要填写你的 Access Key 和 Secret Key
    qiniu.config({
        access_key: confige.qiniu.accesskey,
        secret_key: confige.qiniu.secretkey
    });

//要上传的空间
    var bucket = qiniu.bucket(confige.qiniu.fileSpace);

    var asset = bucket.key(key);
}

function qiniuPutStream(filename) {
    var qiniu = require("node-qiniu");

//需要填写你的 Access Key 和 Secret Key
    qiniu.config({
        access_key: confige.qiniu.accesskey,
        secret_key: confige.qiniu.secretkey
    });

//要上传的空间
    var imagesBucket = qiniu.bucket(confige.qiniu.fileSpace);

    return imagesBucket.createPutStream(filename);


}

//加密key
var key_scr = "Ttc#pjl0Kstg%CPassPort";
function getPassport(app, code, cb) {
    //是否缓存了用户信息,
    redis.get(code, function (e, v) {
        if (e) {
            logger.error(e);
            typeof cb === 'function' && cb(true, -1);
        } else if (!v) {
            try {
                //获取用户基本信息
                logger.info('微信公众信息:' + JSON.stringify(app));
                oauth.success({id: app.appid, secret: app.secret}, code, function (e, data) {

                    if (e) {
                        logger.info('获取用户信息失败,code可能失效');
                        logger.error(data);
                        typeof cb === 'function' && cb(true, -1);
                    } else {
                        oauth.profile(data.openid, data.access_token, function (e, data) {
                            //取回用户信息
                            if (!e) {
                                logger.info(data);
                                data.code = code;
                                redis.set(code, JSON.stringify(data));
                                //设置有效期为10分钟
                                redis.expire(code, 10 * 60);
                                createPassport(data, cb);

                            } else {
                                logger.error(data);
                                typeof cb === 'function' && cb(true, -1);
                            }
                        });
                    }
                });

            } catch (e) {
                logger.error(e);
                typeof cb === 'function' && cb(true, -1);
            }

        } else {
            createPassport(JSON.parse(v), cb);
        }
    });


    //组织分析的数据
    function formartShareDate(hostName, key) {
        var data = {};
        data.passport = confige.qiniu.domain + '/' + key +"?imageView2/2/h/200";
        data.shareImgUrl = confige.qiniu.domain + '/' + key;//+'?imageView2/2/h/80'; //分享图标缩略图高度固定为80px，宽度等比缩小
        data.shareTitle = '尚格名城小区' + hostName + '住户的通行证';
        data.shareDesc = '请展示二维码通行证给门口保安进行验证,验证通过之后才能进入';
        return data;
    }

    function createPassport(user, cb) {
        //如果已经生产了通行证且未过期,则返回
        redis.hget(db.weixinPublicDB.PassPort, user.openid, function (e, v) {
            if (e) {
                logger.error('redis 内部错误');
                typeof cb === 'function' && cb(true, -2);
            } else {
                if (v) {
                    var json = JSON.parse(v);
                    //未过期则直接返回
                    if (!json.expired || json.expried == 0) {
                        logger.info('存在通行证:' + json.key);
                        //更新日期
                        json.createDate = moment().format('YYYY-MM-DD HH:mm:ss');
                        redis.hset(db.weixinPublicDB.PassPort, json.openid, JSON.stringify(json), function (e) {});
                        typeof cb === 'function' && cb(false, 0, formartShareDate(json.nickname, json.key));
                        return;
                    }
                }
                // ;
                try {
                    var filename = uuid.v1() + '.png';
                    var textObj = {};
                    textObj.openid = user.openid;
                    textObj.nickname = user.nickname;
                    textObj.headimgurl = user.headimgurl;
                    textObj.city = user.city;
                    textObj.province = user.province;
                    textObj.createDate = moment().format('YYYY-MM-DD HH:mm:ss');
                    textObj.key = filename;
                    var img = QRCode.image(user.openid, {type: 'png'});

                    img.pipe(qiniuPutStream(filename)).on('error', function (err) {
                            logger.errno('数据上传七牛失败');
                            typeof cb === 'function' && cb(true, -1);
                        })
                        .on('end', function (reply) {
                            logger.info('七牛返回:' + JSON.stringify(reply));
                            redis.hset(db.weixinPublicDB.PassPort, textObj.openid, JSON.stringify(textObj), function (e) {
                                if (e) {
                                    typeof cb === 'function' && cb(true, -1);
                                } else {
                                    typeof cb === 'function' && cb(false, 0, formartShareDate(textObj.nickname, textObj.key));

                                }
                            });

                        });

                } catch (e) {
                    logger.error(e);
                    typeof cb === 'function' && cb(true, -1);
                }

            }

        });
    }

}
    
exports.vertifyPassport = vertifyPassport;
exports.getPassport = getPassport;

   