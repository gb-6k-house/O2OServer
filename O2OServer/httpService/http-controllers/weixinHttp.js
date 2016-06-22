/**
 * Created by niupark on 16/3/18.
 */

'use strict';

const eCode = require('../models/errorCode');
const http = require('./httpBase').http;
const rpc = require('./rpc-server');

const confige = require('../configes/confige');

const logger = process.logger;


//let wechatApp = new wechat.WechatApp('wxebf2d76f972c42cf', '016be2b559c914a9ae1e28e9b6788c90',logger);


/*

 消息列表
 {
  url :当前网页
 }
 */
exports.jsReady = function(req, res,next) {
    let url = null;
    if (!req.body.url){
        http.sendData(res, eCode.ParamerError, '参数错误', null);
        return
    }
    url = req.body.url;

    //let keys = ['body', 'query', 'params'];
    ////1.获取传入的URL
    //for (let i = 0; i < keys.length; i++) {
    //    let k = keys[i];
    //    if (req[k] && req[k].url) {
    //        url = req[k].url;
    //        break;
    //    }
    //}
    rpc.callWX(function(remote){
        try{
            remote.jssdkReady(confige.wxPublic,url, function(e, ticket){

                if (!ticket){
                    http.sendData(res, eCode.UnkownError, '操作失败', null);
                }else{
                    http.sendData(res, eCode.Success, '操作成功', ticket);
                }
            });
        }catch (e){
            http.sendData(res, eCode.UnkownError, '操作失败', null);
        }


    })

}
/*
*微信网页授权
 */
exports.pageAuthorize = function(req, res, next) {
    let url = null;
    if (!req.body.url){
        http.sendData(res, eCode.ParamerError, '参数错误', null);
        return
    }
    url = req.body.url;
    rpc.callWX(function(remote){
        try{
            remote.pageAuthorize(confige.wxPublic, url, function(e, oauthUrl){
                if (e){
                    http.sendData(res, eCode.UnkownError, '操作失败', null);
                }else{
                    http.sendData(res, eCode.Success, '操作成功',{oauthUrl:oauthUrl});
                }
            });
        }catch (e){
            http.sendData(res, eCode.UnkownError, '操作失败', null);
        }

    })
}


